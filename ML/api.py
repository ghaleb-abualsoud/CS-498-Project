"""
Flask API for Heart Disease Prediction using XGBoost
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import pickle
import os
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load the trained model
MODEL_PATH = Path(__file__).parent / "model.pkl"
model = None

def load_model():
    global model
    if MODEL_PATH.exists():
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        print("Model loaded successfully")
    else:
        print(f"Model not found at {MODEL_PATH}. Please train the model first.")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict heart disease risk
    Expected input: {
        "age": number,
        "sex": "male" | "female",
        "systolicBP": number (trestbps),
        "diastolicBP": number,
        "heartRate": number,
        "bmi": number,
        "fbs": number (0 or 1, optional)
    }
    """
    try:
        if model is None:
            return jsonify({
                'error': 'Model not loaded. Please train the model first.'
            }), 500
        
        data = request.get_json()
        
        # Extract and validate input
        required_fields = ['age', 'sex', 'systolicBP']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Convert sex to numeric (1 for male, 0 for female)
        sex_numeric = 1 if data['sex'].lower() == 'male' else 0
        
        # Prepare features for prediction
        # Model expects: age, sex, trestbps, fbs (excluding cp and thal)
        features = pd.DataFrame([{
            'age': data['age'],
            'sex': sex_numeric,
            'trestbps': data['systolicBP'],
            'fbs': data.get('fbs', 0)  # Default to 0 if not provided
        }])
        
        # Make prediction
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0, 1]
        
        # Calculate risk level
        if probability < 0.3:
            risk_level = "low"
        elif probability < 0.6:
            risk_level = "moderate"
        else:
            risk_level = "high"
        
        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability),
            'risk_level': risk_level,
            'risk_score': float(probability * 100)
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/predict-with-shap', methods=['POST'])
def predict_with_shap():
    """
    Predict with SHAP values for explainability
    """
    try:
        if model is None:
            return jsonify({
                'error': 'Model not loaded. Please train the model first.'
            }), 500
        
        data = request.get_json()
        
        # Extract and validate input
        required_fields = ['age', 'sex', 'systolicBP']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Convert sex to numeric
        sex_numeric = 1 if data['sex'].lower() == 'male' else 0
        
        # Prepare features
        features = pd.DataFrame([{
            'age': data['age'],
            'sex': sex_numeric,
            'trestbps': data['systolicBP'],
            'fbs': data.get('fbs', 0)
        }])
        
        # Make prediction
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0, 1]
        
        # Calculate SHAP values
        try:
            import shap
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(features)
            
            # Get SHAP values for this prediction
            shap_dict = {
                'age': float(shap_values[0][0]) if len(shap_values[0]) > 0 else 0,
                'sex': float(shap_values[0][1]) if len(shap_values[0]) > 1 else 0,
                'systolicBP': float(shap_values[0][2]) if len(shap_values[0]) > 2 else 0,
                'fbs': float(shap_values[0][3]) if len(shap_values[0]) > 3 else 0
            }
        except ImportError:
            shap_dict = {}
        
        # Calculate risk level
        if probability < 0.3:
            risk_level = "low"
        elif probability < 0.6:
            risk_level = "moderate"
        else:
            risk_level = "high"
        
        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability),
            'risk_level': risk_level,
            'risk_score': float(probability * 100),
            'shap_values': shap_dict
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    load_model()
    # Run on port 5001 (5000 is often used by AirPlay on macOS)
    app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)
