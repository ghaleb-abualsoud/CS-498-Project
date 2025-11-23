import React, { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { getAssessmentsForUser, StoredAssessment } from "@/lib/storage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const History: React.FC = () => {
  const { user } = useAuth();

  const items: StoredAssessment[] = useMemo(() => {
    if (!user) return [];
    return getAssessmentsForUser(user.email);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-6">Please log in to see your assessments.</Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <h2 className="text-2xl font-semibold mb-4">My Assessments</h2>

        {items.length === 0 && (
          <Card className="p-6">No assessments found. Run an assessment to save it to your account.</Card>
        )}

        <div className="space-y-4">
          {items.map((it) => (
            <Card key={it.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="text-sm text-muted-foreground">{new Date(it.timestamp).toLocaleString()}</div>
                <div className="font-medium">Heart disease: {it.assessment.heartDisease.risk} ({it.assessment.heartDisease.score.toFixed(2)})</div>
                <div className="font-medium">Neurological: {it.assessment.neurologicalDisorders.risk} ({it.assessment.neurologicalDisorders.score.toFixed(2)})</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(it));
                }}>Copy JSON</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
