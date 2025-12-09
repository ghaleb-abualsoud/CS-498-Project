#!/usr/bin/env python3
"""
Test script for the ML API
"""
import requests
import json

API_URL = "http://localhost:5001"

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Health check passed: {data}")
            return True
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Health check error: {e}")
        return False

def test_prediction():
    """Test the prediction endpoint"""
    print("\nTesting prediction...")
    
    test_data = {
        "age": 55,
        "sex": "male",
        "systolicBP": 140,
        "fbs": 0
    }
    
    try:
        response = requests.post(
            f"{API_URL}/predict",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Prediction successful:")
            print(f"  - Risk Level: {data['risk_level']}")
            print(f"  - Risk Score: {data['risk_score']:.2f}%")
            print(f"  - Probability: {data['probability']:.3f}")
            return True
        else:
            print(f"✗ Prediction failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Prediction error: {e}")
        return False

def test_prediction_with_shap():
    """Test the prediction with SHAP endpoint"""
    print("\nTesting prediction with SHAP...")
    
    test_data = {
        "age": 62,
        "sex": "female",
        "systolicBP": 150,
        "fbs": 1
    }
    
    try:
        response = requests.post(
            f"{API_URL}/predict-with-shap",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30  # SHAP calculations can take longer
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Prediction with SHAP successful:")
            print(f"  - Risk Level: {data['risk_level']}")
            print(f"  - Risk Score: {data['risk_score']:.2f}%")
            print(f"  - Probability: {data['probability']:.3f}")
            
            if 'shap_values' in data:
                print(f"  - SHAP Values:")
                for feature, value in data['shap_values'].items():
                    print(f"    - {feature}: {value:.4f}")
            
            return True
        else:
            print(f"✗ Prediction with SHAP failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Prediction with SHAP error: {e}")
        return False

def main():
    print("=" * 50)
    print("ML API Test Suite")
    print("=" * 50)
    
    # Run tests
    results = []
    results.append(("Health Check", test_health_check()))
    results.append(("Prediction", test_prediction()))
    results.append(("Prediction with SHAP", test_prediction_with_shap()))
    
    # Summary
    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    exit(main())
