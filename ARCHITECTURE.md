# System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                            │
│                        (React + TypeScript)                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
         ┌──────────▼──────────┐    ┌──────────▼──────────┐
         │  BiometricForm.tsx  │    │   Index.tsx         │
         │  - Collect inputs   │◄───┤   - Main page       │
         │  - Show loading     │    │   - Orchestration   │
         └──────────┬──────────┘    └──────────┬──────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  riskCalculation.ts        │
                    │  - Async risk calculation  │
                    │  - Fallback logic          │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │     mlApi.ts               │
                    │  - API client              │
                    │  - HTTP requests           │
                    └─────────────┬──────────────┘
                                  │
                            HTTP POST
                         (JSON payload)
                                  │
         ┌────────────────────────▼──────────────────────────┐
         │                  FLASK API SERVER                  │
         │                (Python + Flask)                    │
         │                                                    │
         │  ┌──────────────────────────────────────────┐    │
         │  │  GET /health                             │    │
         │  │  - Check API status                      │    │
         │  │  - Check model loaded                    │    │
         │  └──────────────────────────────────────────┘    │
         │                                                    │
         │  ┌──────────────────────────────────────────┐    │
         │  │  POST /predict                           │    │
         │  │  - Basic prediction                      │    │
         │  │  - Return risk score                     │    │
         │  └──────────────────────────────────────────┘    │
         │                                                    │
         │  ┌──────────────────────────────────────────┐    │
         │  │  POST /predict-with-shap                 │    │
         │  │  - Prediction + explanations             │    │
         │  │  - Return SHAP values                    │    │
         │  └──────────────────┬───────────────────────┘    │
         └─────────────────────┼────────────────────────────┘
                               │
                ┌──────────────▼───────────────┐
                │    XGBoost Model             │
                │    (model.pkl)               │
                │                              │
                │  - Gradient Boosting         │
                │  - 200 estimators            │
                │  - Max depth: 4              │
                │  - Features: age, sex,       │
                │    systolicBP, fbs           │
                └──────────────┬───────────────┘
                               │
                ┌──────────────▼───────────────┐
                │    SHAP Explainer            │
                │                              │
                │  - TreeExplainer             │
                │  - Feature attributions      │
                │  - Understand predictions    │
                └──────────────┬───────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Response JSON     │
                    │                     │
                    │ {                   │
                    │   risk_score: 75,   │
                    │   risk_level: high, │
                    │   shap_values: {...}│
                    │ }                   │
                    └──────────┬──────────┘
                               │
                               ▼
         ┌─────────────────────────────────────────────┐
         │        DISPLAY RESULTS                       │
         │                                              │
         │  - RiskAssessmentDisplay.tsx                │
         │    └─ Risk bars and scores                  │
         │                                              │
         │  - RiskFactorDetails.tsx                    │
         │    └─ Factor breakdown with SHAP            │
         └─────────────────────────────────────────────┘
```

## Data Flow

### 1. User Input
```
User enters:
- Age: 55
- Sex: male
- Blood Pressure: 140/90
- Heart Rate: 75
- BMI: 27.5
```

### 2. Frontend Processing
```typescript
// BiometricForm collects data
const formData = {
  age: 55,
  sex: "male",
  systolicBP: 140,
  diastolicBP: 90,
  heartRate: 75,
  bmi: 27.5
}

// Index.tsx triggers calculation
handleBiometricSubmit(formData)
  ↓
calculateRiskAssessment(formData)
  ↓
getPredictionWithShap(formData)
```

### 3. API Request
```http
POST /predict-with-shap HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "age": 55,
  "sex": "male",
  "systolicBP": 140,
  "diastolicBP": 90,
  "heartRate": 75,
  "bmi": 27.5
}
```

### 4. ML Processing
```python
# Flask API receives request
data = request.get_json()

# Prepare features for model
features = pd.DataFrame([{
    'age': 55,
    'sex': 1,  # male = 1
    'trestbps': 140,
    'fbs': 0
}])

# Make prediction
prediction = model.predict(features)
probability = model.predict_proba(features)[0, 1]

# Calculate SHAP values
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(features)
```

### 5. API Response
```json
{
  "prediction": 1,
  "probability": 0.68,
  "risk_level": "high",
  "risk_score": 68.0,
  "shap_values": {
    "age": 0.12,
    "sex": 0.08,
    "systolicBP": 0.25,
    "fbs": -0.01
  }
}
```

### 6. Frontend Display
```
╔══════════════════════════════════════╗
║   Heart Disease Risk                 ║
║   ████████████████████░░░░  68%      ║
║   Risk Level: HIGH                   ║
╚══════════════════════════════════════╝

Risk Factors:
┌─────────────────────────────────────┐
│ Age (55 years)                      │
│ Impact: High                        │
│ SHAP Value: +0.12                   │
│ ↑ Increases risk                    │
├─────────────────────────────────────┤
│ Blood Pressure (140/90 mmHg)        │
│ Impact: High                        │
│ SHAP Value: +0.25                   │
│ ↑↑ Major risk contributor           │
└─────────────────────────────────────┘
```

## Technology Stack

### Frontend
```
React 18
  ├── TypeScript
  ├── Vite (Build tool)
  ├── Tailwind CSS
  └── shadcn/ui components
```

### Backend
```
Python 3.8+
  ├── Flask 2.3+ (API framework)
  ├── XGBoost 2.0+ (ML model)
  ├── SHAP 0.43+ (Explainability)
  ├── scikit-learn (ML utilities)
  ├── pandas (Data handling)
  └── numpy (Numerical computing)
```

## Deployment Architecture

### Development
```
┌─────────────┐         ┌─────────────┐
│  localhost  │         │  localhost  │
│   :5173     │◄───────►│   :5000     │
│  (Frontend) │   HTTP  │  (ML API)   │
└─────────────┘         └─────────────┘
```

### Production (Suggested)
```
┌─────────────┐         ┌─────────────┐
│   Vercel    │         │   Heroku    │
│   Netlify   │◄───────►│   AWS       │
│   (Static)  │  HTTPS  │  (API)      │
└─────────────┘         └─────────────┘
      │                       │
      └───────┬───────────────┘
              │
      ┌───────▼────────┐
      │  CDN/Caching   │
      │  Rate Limiting │
      │  Load Balancer │
      └────────────────┘
```

## Error Handling Flow

```
User submits form
      │
      ▼
Try ML API prediction
      │
      ├─► Success
      │   └─► Display ML results
      │
      └─► Failure
          ├─► Network error
          ├─► API error
          └─► Timeout
              │
              ▼
          Fallback to rule-based
              │
              ▼
          Display results with notice
              │
              ▼
          Toast: "Using fallback calculation"
```

## Security Considerations

### Current (Development)
- CORS enabled for localhost
- No authentication
- No rate limiting
- Direct API access

### Production (Recommended)
```
┌─────────────────────────────────────┐
│  Add authentication (JWT/OAuth)     │
├─────────────────────────────────────┤
│  Implement rate limiting            │
├─────────────────────────────────────┤
│  Add request validation             │
├─────────────────────────────────────┤
│  Use HTTPS only                     │
├─────────────────────────────────────┤
│  API key management                 │
├─────────────────────────────────────┤
│  Logging and monitoring             │
└─────────────────────────────────────┘
```
