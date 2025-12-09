# ML Integration Guide

This project integrates an XGBoost machine learning model for heart disease prediction.

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd ML
pip install -r requirements.txt
```

Or if you have Flask already installed:
```bash
pip install flask flask-cors
```

### 2. Prepare the Data

You need a dataset named `heart_disease.csv` in the `ML/` directory with the following columns:
- `age`: Age in years
- `sex`: Sex (1 = male, 0 = female)
- `cp`: Chest pain type
- `trestbps`: Resting blood pressure
- `fbs`: Fasting blood sugar (> 120 mg/dl, 1 = true; 0 = false)
- `thal`: Thalassemia type (target variable)

### 3. Train the Model

```bash
cd ML
python train_model.py
```

This will:
- Perform 10-fold cross-validation
- Train the final model on the full dataset
- Save the model to `model.pkl`
- Display feature importances

### 4. Start the API Server

```bash
cd ML
python api.py
```

The API will run on `http://localhost:5001`

### 5. Run the Frontend

In a separate terminal:

```bash
npm run dev
```

The frontend will connect to the ML API automatically.

## API Endpoints

### Health Check
```
GET /health
```
Returns the API status and whether the model is loaded.

**Note**: API runs on port 5001 (port 5000 is often used by AirPlay on macOS).

### Basic Prediction
```
POST /predict
Content-Type: application/json

{
  "age": 55,
  "sex": "male",
  "systolicBP": 140,
  "fbs": 0
}
```

Returns:
```json
{
  "prediction": 1,
  "probability": 0.75,
  "risk_level": "high",
  "risk_score": 75.0
}
```

### Prediction with SHAP Values
```
POST /predict-with-shap
Content-Type: application/json

{
  "age": 55,
  "sex": "male",
  "systolicBP": 140,
  "fbs": 0
}
```

Returns:
```json
{
  "prediction": 1,
  "probability": 0.75,
  "risk_level": "high",
  "risk_score": 75.0,
  "shap_values": {
    "age": 0.15,
    "sex": 0.08,
    "systolicBP": 0.23,
    "fbs": -0.02
  }
}
```

## How It Works

1. **Frontend**: User enters biometric data (age, sex, blood pressure, heart rate, BMI)
2. **API Request**: Frontend sends data to Flask API at `/predict-with-shap`
3. **ML Prediction**: XGBoost model predicts heart disease risk
4. **SHAP Explainability**: SHAP values show which features contributed most to the prediction
5. **Response**: Frontend displays risk assessment with ML-powered scores
6. **Fallback**: If API is unavailable, frontend uses rule-based calculation

## Features

- **XGBoost Model**: Gradient boosting classifier for accurate predictions
- **SHAP Explainability**: Understand which factors contribute to the risk score
- **Cross-Validation**: 10-fold stratified cross-validation ensures model reliability
- **Fallback Mechanism**: Rule-based calculation if ML API is unavailable
- **CORS Enabled**: Frontend can communicate with backend seamlessly

## Model Performance

After training, the model will display:
- Accuracy
- Precision
- Recall
- F1 Score
- ROC AUC Score

All metrics include mean ± standard deviation from 10-fold cross-validation.

## Troubleshooting

### Model Not Found Error
If you see "Model not loaded" error:
1. Make sure you've run `python train_model.py`
2. Check that `model.pkl` exists in the ML directory

### API Connection Error
If the frontend can't connect to the API:
1. Make sure the Flask API is running (`python api.py`)
2. Check that it's running on port 5000
3. Verify CORS is enabled in the API

### Import Errors
If you get import errors:
1. Make sure you're using the correct Python environment
2. Reinstall dependencies: `pip install -r requirements.txt`

## Development

To modify the model:
1. Edit `train_model.py` to change hyperparameters
2. Run training again: `python train_model.py`
3. Restart the API: `python api.py`

To modify the API:
1. Edit `api.py` to add new endpoints or change logic
2. Restart the API server

## Production Deployment

For production:
1. Use a production WSGI server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 api:app
   ```

2. Set the API URL in frontend `.env`:
   ```
   VITE_API_URL=https://your-api-domain.com
   ```

3. Consider adding:
   - Authentication
   - Rate limiting
   - Model versioning
   - Logging and monitoring
