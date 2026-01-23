from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
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


@asynccontextmanager
async def startup():
    """Initialize database and ML model on startup"""
    global db_client, ml_predictor
    
    print("\n" + "="*60)
    print("Starting Placement Prediction API")
    print("="*60)
    
    try:
        db_client = SupabaseClient(
            url=os.getenv("SUPABASE_URL"),
            key=os.getenv("SUPABASE_KEY")
        )
        print("Connected to Supabase")
    except Exception as e:
        print(f"Supabase connection failed: {e}")
    
    # Load ML model
    try:
        model_path = "models\\RF_final.pkl"
        # scaler_path = "models/scaler.pkl" 
        # ml_predictor = PlacementPredictor(model_path, scaler_path)
        ml_predictor = PlacementPredictor(model_path)
    except Exception as e:
        print(f"Model loading failed: {e}")
    

app = FastAPI(
    title="Placement Prediction API",
    description="Predict student placement probability using ML",
    version="1.0.0",
    lifespan=startup
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)