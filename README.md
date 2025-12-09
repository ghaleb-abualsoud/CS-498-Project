# Bio Risk Beacon

Bio Risk Beacon is a health risk assessment application that provides AI-powered cardiovascular and neurological risk analysis based on user biometric inputs. It integrates an **XGBoost machine learning model** for accurate predictions and uses **SHAP values** for explainable AI, helping users understand which factors contribute to their health risks.

## 🎯 Built with

### Frontend
- **Vite** - Fast build tool and dev server
- **React 18** with **TypeScript** - Type-safe UI components
- **shadcn/ui** - Beautiful, accessible UI primitives
- **Tailwind CSS** - Utility-first styling

### Backend (ML API)
- **Python 3.13** - Modern Python runtime
- **Flask 2.3+** - Lightweight REST API framework
- **XGBoost 2.0+** - Gradient boosting ML model
- **SHAP 0.43+** - Explainable AI interpretations
- **scikit-learn** - ML utilities & cross-validation
- **pandas & numpy** - Data processing

## ✨ Key Features

- **AI-Powered Risk Assessment**: XGBoost model trained with 10-fold cross-validation (71.2% accuracy)
- **Real-time Predictions**: Instant risk scores through Flask API integration
- **Explainable AI**: SHAP values reveal which biometric factors drive your risk score
- **Intelligent Fallback**: Rule-based calculation if ML API is unavailable
- **Interactive UI**: Enter biometric data (age, blood pressure, heart rate, BMI, sex) and get detailed risk analysis
- **Smart Blood Pressure Input**: Accepts combined format `systolic/diastolic` (e.g., `120/80`)
- **Visual Results**: Risk bars, scores, and detailed factor breakdowns with SHAP interpretation
- **User History**: Save and track assessments over time (with authentication)
- **Loading States**: Real-time feedback during ML prediction

## 📋 Prerequisites

Before running the project, ensure you have:

- **Node.js 18+** (LTS recommended) - [Download](https://nodejs.org/)
- **Python 3.8+** (3.13 recommended) - [Download](https://www.python.org/)
- **pip** - Python package manager (included with Python)
- **macOS Users**: May need Homebrew for build dependencies

### macOS Additional Requirements

If you encounter build errors (numba, llvmlite, XGBoost):
```bash
brew install cmake libomp llvm
```

## 🚀 How to Run the Project

### Step 1: Clone & Navigate
```bash
cd "/Users/your-username/path-to/CS-498-Project-main 2"
```

### Step 2: Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd ML
pip install -r requirements.txt
cd ..
```

### Step 3: Train the ML Model (First Time Only)

```bash
cd ML
python3 train_model.py
```

You should see:
```
10-fold CV results:
Accuracy : 0.712 ± 0.022
ROC AUC  : 0.625 ± 0.060
Model saved to model.pkl
```

### Step 4: Start the Application

You need **TWO terminal windows** running simultaneously:

**Terminal 1 - ML API Backend:**
```bash
cd ML
python3 api.py
```

Keep this running. You'll see:
```
Model loaded successfully
 * Running on http://127.0.0.1:5001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Keep this running. You'll see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:8080/
```

### Step 5: Open Your Browser

Navigate to: **http://localhost:8080**

## 🧪 Testing the Integration

After both servers are running, test the ML API:

```bash
# In a third terminal
cd ML
python3 test_api.py
```

Expected output:
```
✓ Health check passed
✓ Prediction successful
✓ Prediction with SHAP successful
🎉 All tests passed!
```

## 🏗️ Build for Production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

For production ML API deployment, see `ML/README.md`.

## Build for Production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

For production ML API deployment, see `ML/README.md`.

## 🤖 ML Integration

The application uses an **XGBoost machine learning model** for heart disease prediction with explainable AI.

### How It Works

1. **User Input**: Frontend collects biometric data through form
2. **API Request**: Data sent to Flask API at `http://localhost:5001/predict-with-shap`
3. **ML Prediction**: XGBoost model (200 estimators) predicts heart disease risk
4. **SHAP Calculation**: TreeExplainer computes feature contributions
5. **Display Results**: Frontend shows risk score with SHAP explanations

### Model Performance

- **Accuracy**: 71.2% ± 2.2% (10-fold CV)
- **ROC AUC**: 0.625 ± 0.060
- **Algorithm**: XGBoost Gradient Boosting
- **Training Data**: 60 heart disease records
- **Features Used**: 4 (age, sex, systolic BP, fasting blood sugar)

### Feature Importance

From SHAP analysis during training:
- **Sex**: 40.6% (most important predictor)
- **Systolic BP**: 20.6%
- **Age**: 20.3%
- **Fasting Blood Sugar**: 18.5%

### API Endpoints

- `GET /health` - Check API and model status
- `POST /predict` - Basic prediction (risk score only)
- `POST /predict-with-shap` - Prediction with SHAP values (recommended)

### Example API Call

```bash
curl -X POST http://localhost:5001/predict-with-shap \
  -H "Content-Type: application/json" \
  -d '{"age":55,"sex":"male","systolicBP":140,"fbs":0}'
```

Response:
```json
{
  "risk_level": "low",
  "risk_score": 15.55,
  "probability": 0.156,
  "shap_values": {
    "age": 0.042,
    "sex": -0.763,
    "systolicBP": 0.087,
    "fbs": -0.006
  }
}
```

See `ML/README.md` for detailed API documentation.

## 📁 Project Structure

```
CS-498-Project-main 2/
├── ML/                              # Machine Learning Backend
│   ├── api.py                       # Flask REST API (port 5001)
│   ├── train_model.py               # Model training with CV
│   ├── test_api.py                  # API test suite
│   ├── model.pkl                    # Trained XGBoost model
│   ├── heart_disease.csv            # Training dataset (60 records)
│   ├── requirements.txt             # Python dependencies
│   ├── start_api.sh                 # API startup script
│   └── README.md                    # ML documentation
│
├── src/                             # Frontend Source
│   ├── components/                  # React Components
│   │   ├── BiometricForm.tsx        # Input form with BP parsing & loading
│   │   ├── RiskAssessmentDisplay.tsx # Risk bars and scores
│   │   └── RiskFactorDetails.tsx    # Factor details with SHAP info
│   ├── pages/
│   │   └── Index.tsx                # Main page with async ML calls
│   ├── lib/
│   │   ├── mlApi.ts                 # ML API client service
│   │   └── auth.tsx                 # Authentication logic
│   ├── utils/
│   │   └── riskCalculation.ts       # ML integration & fallback
│   └── types/
│       └── health.ts                # TypeScript interfaces
│
├── package.json                     # Node.js dependencies
├── vite.config.ts                   # Vite configuration (port 8080)
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts               # Tailwind CSS config
└── README.md                        # This file
```

## 💡 Developer Notes

### Blood Pressure Handling
- BP input is parsed on change and stored as `systolicBP` / `diastolicBP`
- Accepts format: `120/80` or separate numeric fields
- Parsed in `BiometricForm.tsx` before submission

### SHAP Integration
- SHAP values are calculated server-side via TreeExplainer
- Frontend receives feature contributions in API response
- Keys: `age`, `sex`, `systolicBP`, `fbs`
- Positive values = increases risk, Negative values = decreases risk

### Async Flow
- `riskCalculation.ts` now async, calls ML API
- Falls back to rule-based if API unavailable
- `Index.tsx` handles loading states and errors
- `BiometricForm.tsx` shows spinner during calculation

### API Configuration
- **ML API**: Port 5001 (avoid macOS AirPlay conflict on 5000)
- **Frontend**: Port 8080 (configured in `vite.config.ts`)
- CORS enabled for localhost development

## 🔧 Troubleshooting

### "Connection refused" errors

**Problem**: Frontend can't reach ML API  
**Solution**:
```bash
# Check if API is running
curl http://localhost:5001/health

# If not, start it:
cd ML && python3 api.py
```

### "Model not loaded" error

**Problem**: `model.pkl` doesn't exist  
**Solution**:
```bash
cd ML
python3 train_model.py
```

### Port 5001 already in use

**Problem**: Previous API process still running  
**Solution**:
```bash
# Kill existing processes
lsof -ti :5001 | xargs kill -9

# Restart API
cd ML && python3 api.py
```

### XGBoost OpenMP Error (macOS)

**Problem**: `Symbol not found: ___kmpc_dispatch_deinit`  
**Solution**:
```bash
# Create symbolic link for OpenMP library
ln -sf /usr/local/opt/libomp/lib/libomp.dylib /opt/anaconda3/lib/libomp.dylib
```

### Build errors (numba, llvmlite)

**Problem**: Missing CMake or OpenMP  
**Solution**:
```bash
# Install build dependencies (macOS)
brew install cmake libomp llvm

# Then reinstall Python packages
cd ML
pip install -r requirements.txt
```

### Frontend dependency issues

**Problem**: npm install fails or package conflicts  
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### SHAP calculations timeout

**Problem**: `/predict-with-shap` takes too long  
**Note**: SHAP calculations can take 5-30 seconds on first request (TreeExplainer initialization). Subsequent requests are faster due to caching.

## 🎓 Testing & Verification

### Manual Testing
1. Start both servers (ML API + Frontend)
2. Open http://localhost:8080
3. Enter test data:
   - Age: 55
   - Sex: Male
   - Blood Pressure: 140/90
   - Heart Rate: 75
   - BMI: 27.5
4. Click "Analyze Health Risks"
5. Verify: Risk score, SHAP values, and explanations appear

### Automated Testing
```bash
cd ML
python3 test_api.py
```

Expected: All 3 tests pass (health, predict, predict-with-shap)

### Check API Directly
```bash
# Health check
curl http://localhost:5001/health

# Sample prediction
curl -X POST http://localhost:5001/predict-with-shap \
  -H "Content-Type: application/json" \
  -d '{"age":55,"sex":"male","systolicBP":140,"fbs":0}'
```

## 📚 Additional Documentation

- `ML/README.md` - Detailed ML API documentation
- `QUICK_REFERENCE.md` - Command cheat sheet
- `ARCHITECTURE.md` - System design diagrams
- `VERIFICATION_CHECKLIST.md` - Testing checklist
- `SETUP_COMPLETE.md` - Setup guide with troubleshooting

## 🛠️ Technology Stack Summary

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend Framework | React 18 + TypeScript | Type-safe UI |
| Build Tool | Vite 5 | Fast dev server & HMR |
| Styling | Tailwind CSS + shadcn/ui | Modern UI components |
| Backend API | Flask 2.3+ | REST endpoints |
| ML Model | XGBoost 2.0+ | Gradient boosting classifier |
| Explainability | SHAP 0.43+ | Feature importance |
| Data Processing | pandas + numpy | Data manipulation |
| ML Utilities | scikit-learn | Cross-validation |

## 📝 License

This project is for educational purposes as part of CS-498.




