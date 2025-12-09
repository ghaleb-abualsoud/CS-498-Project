# Quick Reference Card

## 🚀 Starting the Application

### Easiest Way (One Command)
```bash
./start.sh
```
This starts both ML API and frontend automatically.

### Manual Way (Two Terminals)

**Terminal 1 - ML API:**
```bash
cd ML && python3 api.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 📋 Common Commands

### First Time Setup
```bash
# Install frontend dependencies
npm install

# Install ML dependencies
cd ML && pip install -r requirements.txt

# Train the model
cd ML && python3 train_model.py
```

### Testing
```bash
# Test ML API
cd ML && python3 test_api.py

# Check API health
curl http://localhost:5001/health
```

### Development
```bash
# Run frontend only
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **ML API**: http://localhost:5001
- **API Health**: http://localhost:5001/health

## 📝 API Endpoints

### GET /health
Check if API and model are loaded
```bash
curl http://localhost:5001/health
```

### POST /predict
Get basic prediction
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"age":55,"sex":"male","systolicBP":140}'
```

### POST /predict-with-shap
Get prediction with SHAP values
```bash
curl -X POST http://localhost:5001/predict-with-shap \
  -H "Content-Type: application/json" \
  -d '{"age":55,"sex":"male","systolicBP":140}'
```

## 🔧 Troubleshooting

### Problem: "Model not loaded"
**Solution:**
```bash
cd ML && python3 train_model.py
```

### Problem: Port already in use
**Solution:**
```bash
# Find process on port 5001
lsof -i :5001
# Kill it
kill -9 <PID>
```

### Problem: Frontend can't connect to API
**Check:**
1. Is ML API running? `curl http://localhost:5001/health`
2. Check browser console for errors
3. Verify CORS is enabled in `api.py`

### Problem: Dependencies not found
**Solution:**
```bash
# Python dependencies
cd ML && pip install -r requirements.txt

# Node dependencies
npm install
```

## 📊 Model Info

- **Algorithm**: XGBoost
- **Features**: age, sex, systolicBP, fbs
- **Output**: Risk score (0-100) and SHAP values
- **Training**: 10-fold cross-validation

## 🎯 Expected Output

### Successful Prediction
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

## 📁 Key Files

| File | Purpose |
|------|---------|
| `ML/api.py` | Flask API server |
| `ML/train_model.py` | Model training script |
| `ML/model.pkl` | Trained model |
| `src/lib/mlApi.ts` | Frontend API client |
| `src/utils/riskCalculation.ts` | Risk calculation with ML |

## 🆘 Getting Help

1. Check `README.md` - Main documentation
2. Check `ML/README.md` - ML-specific docs
3. Check `INTEGRATION_SUMMARY.md` - Integration details
4. Run test script: `cd ML && python3 test_api.py`
5. Check browser console and terminal logs

## ✅ Success Checklist

- [ ] ML API starts without errors
- [ ] Model loaded (`/health` returns `"model_loaded": true`)
- [ ] Test script passes (`cd ML && python3 test_api.py`)
- [ ] Frontend loads at http://localhost:5173
- [ ] Form submission shows loading state
- [ ] Risk assessment displays results
- [ ] Browser console shows successful API calls

---

**Quick Tip**: Use `./start.sh` to start everything at once! 🚀
