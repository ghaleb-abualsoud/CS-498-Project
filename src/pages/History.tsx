import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getAssessmentsForUser, StoredAssessment, removeAssessmentForUser, clearAssessmentsForUser } from "@/lib/storage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const History: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<StoredAssessment[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    const loaded = getAssessmentsForUser(user.email);
    setItems(loaded);
  }, [user]);

  const handleDelete = (id: string) => {
    if (!user) return;
    const ok = confirm("Delete this assessment? This action cannot be undone.");
    if (!ok) return;
    const removed = removeAssessmentForUser(user.email, id);
    if (removed) {
      setItems((prev) => prev.filter((p) => p.id !== id));
      toast.success("Assessment deleted");
    } else {
      toast.error("Failed to delete assessment");
    }
  };

  const handleClearAll = () => {
    if (!user) return;
    const ok = confirm("Clear all saved assessments for your account?");
    if (!ok) return;
    clearAssessmentsForUser(user.email);
    setItems([]);
    toast.success("All assessments cleared");
  };

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">My Assessments</h2>
          {items.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleClearAll}>Clear all</Button>
          )}
        </div>

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
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(JSON.stringify(it))}>Copy JSON</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(it.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
