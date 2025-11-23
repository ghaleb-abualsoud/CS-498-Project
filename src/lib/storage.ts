import { BiometricData, RiskAssessment, RiskFactor, ShapValues } from "@/types/health";

const ASSESSMENTS_PREFIX = "assessments_";

export type StoredAssessment = {
  id: string;
  timestamp: string; // ISO
  data: BiometricData;
  assessment: RiskAssessment;
  factors: RiskFactor[];
  shapValues?: ShapValues | null;
};

function keyFor(email: string) {
  // simple safe key
  const safe = email.replace(/[^a-z0-9@.\-_]/gi, "_").toLowerCase();
  return `${ASSESSMENTS_PREFIX}${safe}`;
}

export function saveAssessmentForUser(email: string, entry: Omit<StoredAssessment, "id" | "timestamp">) {
  try {
    const k = keyFor(email);
    const raw = localStorage.getItem(k);
    const arr: StoredAssessment[] = raw ? JSON.parse(raw) : [];
    const newEntry: StoredAssessment = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      data: entry.data,
      assessment: entry.assessment,
      factors: entry.factors,
      shapValues: entry.shapValues ?? null,
    };
    arr.unshift(newEntry);
    localStorage.setItem(k, JSON.stringify(arr));
    return newEntry;
  } catch (e) {
    console.error("saveAssessmentForUser error", e);
    return null;
  }
}

export function getAssessmentsForUser(email: string): StoredAssessment[] {
  try {
    const k = keyFor(email);
    const raw = localStorage.getItem(k);
    if (!raw) return [];
    return JSON.parse(raw) as StoredAssessment[];
  } catch (e) {
    return [];
  }
}

export function clearAssessmentsForUser(email: string) {
  try {
    const k = keyFor(email);
    localStorage.removeItem(k);
  } catch (e) {
    // ignore
  }
}
