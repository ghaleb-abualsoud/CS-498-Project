# Integration Verification Checklist

Use this checklist to verify the ML integration is working correctly.

## ✅ Setup Verification

### Files Created
- [ ] `ML/api.py` exists
- [ ] `ML/train_model.py` exists
- [ ] `ML/requirements.txt` exists
- [ ] `ML/heart_disease.csv` exists
- [ ] `ML/test_api.py` exists
- [ ] `ML/README.md` exists
- [ ] `src/lib/mlApi.ts` exists
- [ ] `setup-ml.sh` exists
- [ ] `start.sh` exists
- [ ] `INTEGRATION_SUMMARY.md` exists
- [ ] `QUICK_REFERENCE.md` exists
- [ ] `ARCHITECTURE.md` exists

### Files Modified
- [ ] `src/utils/riskCalculation.ts` updated
- [ ] `src/pages/Index.tsx` updated
- [ ] `src/components/BiometricForm.tsx` updated
- [ ] `README.md` updated

## ✅ Dependencies

### Python Dependencies
```bash
cd ML
pip list | grep -E "flask|xgboost|shap|pandas|numpy|scikit-learn"
```
- [ ] flask installed
- [ ] flask-cors installed
- [ ] xgboost installed
- [ ] shap installed
- [ ] pandas installed
- [ ] numpy installed
- [ ] scikit-learn installed

### Node Dependencies
```bash
npm list | grep -E "react|vite|typescript"
```
- [ ] react installed
- [ ] vite installed
- [ ] typescript installed

## ✅ Model Training

```bash
cd ML
python3 train_model.py
```

Expected output:
- [ ] "Loading data..." message appears
- [ ] "Running 10-fold cross-validation..." message appears
- [ ] Cross-validation metrics displayed (Accuracy, Precision, Recall, F1, ROC AUC)
- [ ] "Training final model on full dataset..." message appears
- [ ] "Model saved to..." message appears
- [ ] Feature importances displayed
- [ ] `ML/model.pkl` file created
- [ ] No errors during training

## ✅ API Server

### Starting the API
```bash
cd ML
python3 api.py
```

Expected output:
- [ ] "Model loaded successfully" message appears
- [ ] "Running on http://0.0.0.0:5000" or similar message
- [ ] No import errors
- [ ] No model loading errors
- [ ] Server stays running (doesn't crash)

### Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
- [ ] Returns JSON response
- [ ] Contains `"status": "healthy"`
- [ ] Contains `"model_loaded": true`

Example:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

## ✅ API Testing

```bash
cd ML
python3 test_api.py
```

Expected results:
- [ ] Health Check: ✓ PASSED
- [ ] Prediction: ✓ PASSED
- [ ] Prediction with SHAP: ✓ PASSED
- [ ] All tests passed message
- [ ] Risk scores displayed (0-100)
- [ ] SHAP values displayed

## ✅ Frontend Integration

### Start Frontend
```bash
npm run dev
```

Expected:
- [ ] Vite server starts
- [ ] Local URL displayed (http://localhost:5173)
- [ ] No compilation errors
- [ ] Browser opens automatically or can be opened manually

### UI Verification

Open http://localhost:5173 in browser:

#### Form Display
- [ ] "Biometric Assessment" card visible
- [ ] Age input field present
- [ ] Sex selector present
- [ ] Blood pressure input present (systolic/diastolic format)
- [ ] Heart rate input present
- [ ] BMI input present
- [ ] "Analyze Health Risks" button visible

#### Form Submission
Enter test data:
- Age: 55
- Sex: Male
- Blood Pressure: 140/90
- Heart Rate: 75
- BMI: 27.5

Click "Analyze Health Risks":
- [ ] Button shows "Analyzing..." with spinner
- [ ] Button is disabled during calculation
- [ ] No console errors (check browser DevTools)
- [ ] Toast notification appears ("Risk assessment completed successfully")

#### Results Display
- [ ] Results section appears after calculation
- [ ] "Your Risk Assessment" heading visible
- [ ] Heart Disease risk card displayed
- [ ] Risk level shown (low/moderate/high)
- [ ] Risk score percentage displayed (0-100%)
- [ ] Progress bar visualization shown
- [ ] "Risk Factor Details" section visible
- [ ] Factor cards are expandable
- [ ] SHAP values visible in factor details (if available)

### Browser Console Check

Open browser DevTools (F12) → Console tab:
- [ ] No red error messages
- [ ] API request visible in Network tab
- [ ] Request to `http://localhost:5000/predict-with-shap`
- [ ] Response status 200
- [ ] Response contains risk_score and shap_values

### Network Tab Verification

In DevTools → Network tab:
- [ ] POST request to `/predict-with-shap`
- [ ] Request payload contains biometric data
- [ ] Response status: 200 OK
- [ ] Response body contains:
  - [ ] `prediction`
  - [ ] `probability`
  - [ ] `risk_level`
  - [ ] `risk_score`
  - [ ] `shap_values` object

## ✅ Fallback Mechanism

### Test Fallback
1. Stop the ML API (Ctrl+C in API terminal)
2. In browser, submit the form again

Expected behavior:
- [ ] Form still submits
- [ ] "Analyzing..." loading state shows
- [ ] Results still display (using rule-based calculation)
- [ ] Toast notification mentions fallback or shows warning
- [ ] No app crash

## ✅ Error Handling

### Invalid Input Test
Try submitting with:
- Age: 0
- Empty fields

Expected:
- [ ] Form validation prevents submission OR
- [ ] Error message displayed
- [ ] No app crash

### API Error Test
1. Stop ML API
2. Submit form
3. Check behavior

Expected:
- [ ] Error caught gracefully
- [ ] Fallback calculation used
- [ ] User notified
- [ ] App continues working

## ✅ Performance

### Response Time
- [ ] API responds in < 2 seconds
- [ ] Frontend renders results smoothly
- [ ] No noticeable lag in UI

### Multiple Requests
Submit form 5 times in succession:
- [ ] All requests complete
- [ ] No performance degradation
- [ ] No memory leaks (check DevTools → Performance)

## ✅ Documentation

- [ ] README.md includes ML setup instructions
- [ ] ML/README.md provides detailed API documentation
- [ ] INTEGRATION_SUMMARY.md explains what was done
- [ ] QUICK_REFERENCE.md provides command cheat sheet
- [ ] ARCHITECTURE.md shows system design
- [ ] All code has reasonable comments

## ✅ Scripts

### setup-ml.sh
```bash
./setup-ml.sh
```
- [ ] Checks for Python
- [ ] Installs dependencies
- [ ] Trains model if needed
- [ ] Completes without errors

### start.sh
```bash
./start.sh
```
- [ ] Starts ML API
- [ ] Starts frontend
- [ ] Both run simultaneously
- [ ] Shows status messages
- [ ] Ctrl+C stops both cleanly

## ✅ Code Quality

### TypeScript
- [ ] No TypeScript errors
- [ ] Types properly defined
- [ ] Async/await used correctly

### Python
- [ ] No Python syntax errors
- [ ] Proper error handling
- [ ] CORS configured correctly
- [ ] Clean code structure

## 🎯 Final Integration Test

### Complete End-to-End Test

1. Start fresh (close all terminals)
2. Run: `./start.sh`
3. Open: http://localhost:5173
4. Enter biometric data
5. Submit form
6. Verify results display
7. Check SHAP values are present
8. Expand risk factor details
9. Submit again with different data
10. Verify new results

All steps complete without errors:
- [ ] YES - Integration successful! 🎉
- [ ] NO - Review failed steps above

## 📊 Success Criteria Summary

Total checks passed: ______ / ______

### Critical (Must Pass)
- [ ] Model trains successfully
- [ ] API starts without errors
- [ ] Frontend connects to API
- [ ] Risk assessment completes
- [ ] Results display correctly

### Important (Should Pass)
- [ ] Test script passes all tests
- [ ] SHAP values calculated and displayed
- [ ] Fallback mechanism works
- [ ] Error handling graceful
- [ ] Documentation complete

### Optional (Nice to Have)
- [ ] Startup scripts work
- [ ] Performance acceptable
- [ ] Code quality good
- [ ] All tests automated

---

## 🎓 Troubleshooting Guide

If any check fails, refer to:
1. `QUICK_REFERENCE.md` - Common commands and fixes
2. `ML/README.md` - ML-specific troubleshooting
3. `README.md` - General troubleshooting section
4. `INTEGRATION_SUMMARY.md` - Understanding the integration

---

**Date Completed**: _______________
**Completed By**: _______________
**Integration Status**: [ ] PASS  [ ] FAIL
**Notes**: 
_______________________________________
_______________________________________
_______________________________________
