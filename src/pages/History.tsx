import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getAssessmentsForUser, StoredAssessment, removeAssessmentForUser, clearAssessmentsForUser, saveAssessmentForUser } from "@/lib/storage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const History: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<StoredAssessment[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    const loaded = getAssessmentsForUser(user.email);
    setItems(loaded);
  }, [user]);

  // Soft-delete: mark an item as pending deletion and show inline Undo inside the card
  const handleDelete = (id: string) => {
    if (!user) return;
    const ok = confirm("Delete this assessment? You will have a short time to undo.");
    if (!ok) return;

    // don't schedule if already pending
    if (pendingDeletes[id]) return;

    const timeoutId = window.setTimeout(() => {
      // perform permanent deletion
      removeAssessmentForUser(user.email, id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      setPendingDeletes((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      toast.success("Assessment permanently deleted");
    }, 64000); // 64s undo window

    setPendingDeletes((prev) => ({ ...prev, [id]: timeoutId }));
  };

  const handleUndo = (id: string) => {
    if (!user) return;
    const toUndo = pendingDeletes[id];
    if (!toUndo) return;
    clearTimeout(toUndo);
    setPendingDeletes((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    toast.success("Delete undone");
  };

  const handleClearAll = () => {
    if (!user) return;
    const ok = confirm("Clear all saved assessments for your account?");
    if (!ok) return;
    clearAssessmentsForUser(user.email);
    setItems([]);
    setPendingDeletes({});
    setPage(1);
    toast.success("All assessments cleared");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-6">Please log in to see your assessments.</Card>
      </div>
    );
  }

  // Filter and paginate
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => {
      const ts = new Date(it.timestamp).toLocaleString().toLowerCase();
      const heart = it.assessment.heartDisease.risk.toLowerCase();
      const neuro = it.assessment.neurologicalDisorders.risk.toLowerCase();
      const joined = `${ts} ${heart} ${neuro} ${JSON.stringify(it.data)}`;
      return joined.includes(s);
    });
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">My Assessments</h2>
          <div className="flex items-center gap-3">
            <input
              placeholder="Search by date, risk, or value"
              className="input bg-background border border-input rounded px-3 py-2 text-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            {items.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleClearAll}>Clear all</Button>
            )}
          </div>
        </div>

        {items.length === 0 && (
          <Card className="p-6">No assessments found. Run an assessment to save it to your account.</Card>
        )}

        <div className="space-y-4">
          {pageItems.map((it) => {
            const isPending = !!pendingDeletes[it.id];
            return (
              <Card key={it.id} className={`p-4 flex justify-between items-center ${isPending ? "opacity-60" : ""}`}>
                <div>
                  <div className="text-sm text-muted-foreground">{new Date(it.timestamp).toLocaleString()}</div>
                  <div className="font-medium">Heart disease: {it.assessment.heartDisease.risk} ({it.assessment.heartDisease.score.toFixed(2)})</div>
                  <div className="font-medium">Neurological: {it.assessment.neurologicalDisorders.risk} ({it.assessment.neurologicalDisorders.score.toFixed(2)})</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(JSON.stringify(it))}>Copy JSON</Button>
                  {!isPending && (
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(it.id)}>Delete</Button>
                  )}
                  {isPending && (
                    <Button variant="outline" size="sm" onClick={() => handleUndo(it.id)}>Undo</Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">Showing {filtered.length} result(s)</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
            <div className="text-sm">Page {currentPage} / {totalPages}</div>
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
