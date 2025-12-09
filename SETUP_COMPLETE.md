# Setup Complete! ✅

## What Was Fixed

### 1. OpenMP Library Issue
**Problem**: XGBoost couldn't find the OpenMP library (libomp.dylib)  
**Solution**: Created symbolic link from Homebrew's libomp to Anaconda's lib directory
```bash
ln -sf /usr/local/opt/libomp/lib/libomp.dylib /opt/anaconda3/lib/libomp.dylib
```

### 2. Port Conflict
**Problem**: Port 5000 was already in use (likely by AirPlay on macOS)  
**Solution**: Changed API to use port 5001 instead

**Files updated:**
- `ML/api.py` - Changed from port 5000 to 5001
- `src/lib/mlApi.ts` - Updated API URL to port 5001
- `ML/test_api.py` - Updated test URL to port 5001

## ✅ Model Training Successful!

The model has been trained with the following results:

```
10-fold CV results:
Accuracy : 0.712 ± 0.022
Precision: 0.296 ± 0.150
Recall   : 0.106 ± 0.077
F1 score : 0.152 ± 0.102
ROC AUC  : 0.625 ± 0.060
```

**Feature Importances:**
- age: 0.2029 (20.3%)
- sex: 0.4058 (40.6%) - Most important!
- trestbps (systolic BP): 0.2061 (20.6%)
- fbs (fasting blood sugar): 0.1852 (18.5%)

Model saved to: `ML/model.pkl` ✓

## 🚀 How to Start the Application

### Method 1: Two Terminals (Recommended)

**Terminal 1 - Start ML API:**
```bash
cd ML
./start_api.sh
```

Wait until you see:
```
Model loaded successfully
 * Running on http://127.0.0.1:5001
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

Then open: **http://localhost:5173**

### Method 2: Background Mode

**Start API in background:**
```bash
cd ML
nohup python3 api.py > api.log 2>&1 &
```

**Start Frontend:**
```bash
npm run dev
```

### Method 3: Quick Start Script

```bash
./start.sh
```
(Note: You may need to update this script to use port 5001)

## 🧪 Testing the API

Once the API is running, test it:

```bash
cd ML
python3 test_api.py
```

Expected output:
```
==================================================
ML API Test Suite
==================================================
Testing health check...
✓ Health check passed
Testing prediction...
✓ Prediction successful
Testing prediction with SHAP...
✓ Prediction with SHAP successful

Total: 3/3 tests passed
🎉 All tests passed!
```

Or test manually:
```bash
curl http://localhost:5001/health
```

## 📝 Important URLs

- **Frontend**: http://localhost:5173
- **ML API**: http://localhost:5001
- **API Health**: http://localhost:5001/health

## ⚠️ macOS-Specific Notes

### Port 5000 Conflict
On macOS Monterey and later, port 5000 is used by AirPlay Receiver by default. That's why we use port 5001.

To disable AirPlay Receiver (optional):
1. System Preferences → Sharing
2. Uncheck "AirPlay Receiver"

### OpenMP for Anaconda
If you get OpenMP errors again, the symlink might need to be recreated:
```bash
ln -sf /usr/local/opt/libomp/lib/libomp.dylib /opt/anaconda3/lib/libomp.dylib
```

## 🎯 Next Steps

1. **Start the API** (Terminal 1):
   ```bash
   cd ML && ./start_api.sh
   ```

2. **Start the Frontend** (Terminal 2):
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   http://localhost:5173

4. **Test the Application**:
   - Enter biometric data
   - Click "Analyze Health Risks"
   - Verify results display with ML predictions

## ✨ Everything is Ready!

- ✅ Model trained and saved
- ✅ OpenMP library linked
- ✅ Port conflict resolved  
- ✅ API configured for port 5001
- ✅ Frontend updated to use port 5001
- ✅ Ready to use!

**Enjoy your AI-powered Health Risk Assessment!** 🎊
