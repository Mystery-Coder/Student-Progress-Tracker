from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from dotenv import load_dotenv
import os
from motor.motor_asyncio import AsyncIOMotorClient
from database.supabase_client import SupabaseClient
from ml.predictor import PlacementPredictor
from utils.recommendations import generate_recommendation

load_dotenv()

class PredictionResponse(BaseModel):
    """Response model for predictions"""
    usn: str
    name: str
    placement_score: float
    prediction: str
    confidence: float
    features: dict
    recommendation: str

class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    model_loaded: bool
    supabase_connected: bool
    
    model_config = {"protected_namespaces": ()}


class COMarksRequest(BaseModel):
    """Request model for saving CO marks"""
    group_id: str
    group_name: Optional[str] = None
    year: Optional[int] = None
    student_usn: str
    student_name: Optional[str] = None
    course_code: str
    course_name: Optional[str] = None
    exam_type: str
    co_data: Dict[str, Dict[str, Any]]  # e.g., {"CO1": {"max": 10, "obtained": 8}}
    uploaded_by: Optional[str] = None


class COMarksResponse(BaseModel):
    """Response model for CO marks operations"""
    success: bool
    message: Optional[str] = None
    documentId: Optional[str] = None
    isNewDocument: Optional[bool] = None
    data: Optional[Dict[str, Any]] = None
    count: Optional[int] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and ML model on startup"""
    global db_client, ml_predictor, mongo_client, mongo_db
    
    print("\n" + "="*60)
    print("Starting Placement Prediction API")
    print("="*60)
    
    try:
        db_client = SupabaseClient(
            url=os.getenv("SUPABASE_URL"),
            key=os.getenv("SUPABASE_KEY")
        )
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
    
    # Connect to MongoDB
    try:
        mongodb_uri = os.getenv("MONGODB_URI")
        if mongodb_uri:
            mongo_client = AsyncIOMotorClient(mongodb_uri)
            # Get database name from environment or use default
            db_name = os.getenv("MONGODB_DB_NAME", "test")
            mongo_db = mongo_client[db_name]
            # Create index
            await mongo_db.comarks.create_index(
                [("student_usn", 1), ("group_id", 1)],
                unique=True
            )
            print(f"✅ Connected to MongoDB Atlas (database: {db_name})")
        else:
            print("⚠️ MongoDB URI not found in environment")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
    
    # Load ML model
    try:
        model_path = "models\\RF_final.pkl"
        ml_predictor = PlacementPredictor(model_path)
        print("✅ ML model loaded successfully")
    except Exception as e:
        print(f"❌ Model loading failed: {e}")
    
    yield

app = FastAPI(
    title="Placement Prediction API",
    description="Predict student placement probability using ML",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


db_client = None
ml_predictor = None
mongo_client = None
mongo_db = None


    

@app.get("/")  #http://localhost:8000
async def root():
    return {
        "message": "Placement Prediction API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "predict": "/predict/{usn}",
            "docs": "/docs"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy" if (db_client and ml_predictor) else "degraded",
        model_loaded=ml_predictor is not None,
        supabase_connected=db_client is not None
    )

@app.get("/predict/{usn}", response_model=PredictionResponse)
async def predict(usn: str):
    # Validate services
    if not db_client:
        raise HTTPException(status_code=500, detail="Database not connected")
    if not ml_predictor:
        raise HTTPException(status_code=500, detail="ML model not loaded")
    
    try:
        usn = usn.upper().strip()
        student_data = db_client.get_complete_student_profile(usn)
        if not student_data:
            raise HTTPException(status_code=404, detail=f"Student {usn} not found")
        
        
        features = ml_predictor.prepare_features(student_data)
        prediction_result = ml_predictor.predict(features)
        
        recommendation = generate_recommendation(
            features, 
            prediction_result['score']
        )
        
        return PredictionResponse(
            usn=usn,
            name=student_data['name'],
            placement_score=prediction_result['score'],
            prediction=prediction_result['prediction'],
            confidence=prediction_result['confidence'],
            features=features,
            recommendation=recommendation
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/co-marks/save", response_model=COMarksResponse)
async def save_co_marks(request: COMarksRequest):
    """Save or update CO marks for a student"""
    if mongo_db is None:
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        # Validate required fields
        if not request.student_usn or not request.group_id or not request.course_code or not request.exam_type or not request.co_data:
            raise HTTPException(
                status_code=400,
                detail="Missing required fields: student_usn, group_id, course_code, exam_type, co_data"
            )
        
        collection = mongo_db.comarks
        
        # Find existing document
        student_doc = await collection.find_one({
            "student_usn": request.student_usn,
            "group_id": request.group_id
        })
        
        if student_doc:
            # Document exists - append to it
            print(f"📝 Found existing document for {request.student_usn}, appending data...")
            
            courses = student_doc.get("courses", {})
            
            # Get or create course entry
            if request.course_code in courses:
                # Course exists - add/update exam type
                print(f"  → Course {request.course_code} exists, adding/updating {request.exam_type}")
                courses[request.course_code]["exams"][request.exam_type] = {
                    "co_data": request.co_data
                }
            else:
                # New course for this student
                print(f"  → Adding new course {request.course_code} with {request.exam_type}")
                courses[request.course_code] = {
                    "course_name": request.course_name,
                    "exams": {
                        request.exam_type: {
                            "co_data": request.co_data
                        }
                    }
                }
            
            # Update the document
            result = await collection.update_one(
                {"student_usn": request.student_usn, "group_id": request.group_id},
                {
                    "$set": {
                        "courses": courses,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            print(f"✅ Successfully appended to document {student_doc['_id']}")
            
            return COMarksResponse(
                success=True,
                documentId=str(student_doc["_id"]),
                isNewDocument=False,
                message=f"Marks appended successfully for {request.student_name}"
            )
        else:
            # No document exists - create first one for this student
            print(f"🆕 Creating first document for {request.student_usn}")
            
            new_doc = {
                "group_id": request.group_id,
                "group_name": request.group_name,
                "year": request.year,
                "student_usn": request.student_usn,
                "student_name": request.student_name,
                "courses": {
                    request.course_code: {
                        "course_name": request.course_name,
                        "exams": {
                            request.exam_type: {
                                "co_data": request.co_data
                            }
                        }
                    }
                },
                "uploaded_by": request.uploaded_by,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            result = await collection.insert_one(new_doc)
            print(f"✅ Created new document {result.inserted_id}")
            
            return COMarksResponse(
                success=True,
                documentId=str(result.inserted_id),
                isNewDocument=True,
                message=f"First marks entry created for {request.student_name}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error saving CO marks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/co-marks/{student_usn}/{group_id}", response_model=COMarksResponse)
async def get_student_co_marks(student_usn: str, group_id: str):
    """Get CO marks for a specific student in a group"""
    if mongo_db is None:
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        collection = mongo_db.comarks
        marks = await collection.find_one({
            "student_usn": student_usn,
            "group_id": group_id
        })
        
        if not marks:
            raise HTTPException(
                status_code=404,
                detail="No marks found for this student"
            )
        
        # Convert ObjectId to string
        marks["_id"] = str(marks["_id"])
        
        return COMarksResponse(
            success=True,
            data=marks
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching CO marks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/co-marks/group/{group_id}", response_model=COMarksResponse)
async def get_group_co_marks(group_id: str):
    """Get all marks for a group"""
    if mongo_db is None:
        raise HTTPException(status_code=500, detail="MongoDB not connected")
    
    try:
        collection = mongo_db.comarks
        cursor = collection.find({"group_id": group_id})
        all_marks = await cursor.to_list(length=None)
        
        # Convert ObjectId to string for all documents
        for marks in all_marks:
            marks["_id"] = str(marks["_id"])
        
        return COMarksResponse(
            success=True,
            data=all_marks,
            count=len(all_marks)
        )
        
    except Exception as e:
        print(f"Error fetching group marks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)