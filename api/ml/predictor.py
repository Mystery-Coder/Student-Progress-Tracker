import joblib
import numpy as np

class PlacementPredictor:
    def __init__(self, model_path: str):
        self.model = joblib.load(model_path)
        print(f"Model loaded from {model_path}")
        print(f"Expects {self.model.n_features_in_} features")
        
    # def __init__(self, model_path: str, scaler_path: str = None):
    #     self.model = joblib.load(model_path)
    #     print(f"Model loaded from {model_path}")
    #     print(f"Expects {self.model.n_features_in_} features")
        
    #     self.scaler = None
    #     if scaler_path:
    #         self.scaler = joblib.load(scaler_path)
    #         print(f"Scaler loaded from {scaler_path}")
    
    def prepare_features(self, student_data: dict):
        return {
            'CGPA': student_data['cgpa'],
            'Internships': student_data['internships'],
            'Projects': student_data['projects'],
            'Skill Rating': student_data['skills_rating'],
            'ExtracurricularActivities': 1 if student_data['hackathons'] > 0 else 0,
            'SSC_Marks': student_data['ssc_marks'],
            'HSC_Marks': student_data['hsc_marks']
        }
    
    def predict(self, features: dict):
        feature_array = np.array([
            features['CGPA'],
            features['Internships'],
            features['Projects'],
            features['Skill Rating'],
            features['ExtracurricularActivities'],
            features['SSC_Marks'],
            features['HSC_Marks']
        ]).reshape(1, -1)
        
        # if self.scaler:
        #     feature_array = self.scaler.transform(feature_array)
            
        prediction = self.model.predict(feature_array)[0]
        probabilities = self.model.predict_proba(feature_array)[0]
        
        return {
            'prediction': 'Placed' if prediction == 1 else 'Not Placed',
            'score': round(probabilities[1] * 100, 2),
            'confidence': round(max(probabilities) * 100, 2)
        }