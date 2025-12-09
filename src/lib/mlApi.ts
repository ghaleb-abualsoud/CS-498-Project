/**
 * API Service for Heart Disease Prediction
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001';

export interface PredictionRequest {
  age: number;
  sex: 'male' | 'female';
  systolicBP: number;
  diastolicBP?: number;
  heartRate?: number;
  bmi?: number;
  fbs?: number;
}

export interface PredictionResponse {
  prediction: number;
  probability: number;
  risk_level: 'low' | 'moderate' | 'high';
  risk_score: number;
  shap_values?: {
    age?: number;
    sex?: number;
    systolicBP?: number;
    fbs?: number;
  };
}

export interface ApiError {
  error: string;
}

/**
 * Check if the API is healthy
 */
export const checkHealth = async (): Promise<{ status: string; model_loaded: boolean }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

/**
 * Get prediction from the ML model
 */
export const getPrediction = async (data: PredictionRequest): Promise<PredictionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || `Prediction failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Prediction error:', error);
    throw error;
  }
};

/**
 * Get prediction with SHAP values for explainability
 */
export const getPredictionWithShap = async (
  data: PredictionRequest
): Promise<PredictionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/predict-with-shap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error || `Prediction failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Prediction with SHAP error:', error);
    throw error;
  }
};
