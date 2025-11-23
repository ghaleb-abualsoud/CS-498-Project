import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getAssessmentsForUser, StoredAssessment, removeAssessmentForUser, clearAssessmentsForUser, saveAssessmentForUser } from "@/lib/storage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const History: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<StoredAssessment[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<Record<string, { timeoutId: number; expiresAt: number }>>({});
  const [now, setNow] = useState<number>(Date.now());
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "moderate" | "high">("all");
  const [dateStart, setDateStart] = useState<string>("");
  const [dateEnd, setDateEnd] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
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

  // tick every second to update countdowns for pending deletes
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Soft-delete: schedule permanent removal (used after modal confirmation)
  const performSoftDelete = (id: string) => {
    if (!user) return;
    if (pendingDeletes[id]) return;
        const expiresAt = Date.now() + 64000; // 64s
        const timeoutId = window.setTimeout(() => {
      removeAssessmentForUser(user.email, id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      setPendingDeletes((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      toast.success("Assessment permanently deleted");
        }, 64000); // 64s undo window
    setPendingDeletes((prev) => ({ ...prev, [id]: { timeoutId, expiresAt } }));
  };

  const handleDelete = (id: string) => {
    // open confirmation modal
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const handleUndo = (id: string) => {
    if (!user) return;
    const entry = pendingDeletes[id];
    if (!entry) return;
    clearTimeout(entry.timeoutId);
    setPendingDeletes((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    toast.success("Delete undone");
  };

  const handleClearAll = () => {
    // open confirmation modal
    setClearDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-6">Please log in to see your assessments.</Card>
      </div>
    );
  }

  // Filter and paginate with risk and date range
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    const start = dateStart ? new Date(dateStart) : null;
    const end = dateEnd ? new Date(dateEnd) : null;
    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    return items.filter((it) => {
      // risk filter: match either heart or neuro
      if (riskFilter !== "all") {
        const heart = it.assessment.heartDisease.risk.toLowerCase();
        const neuro = it.assessment.neurologicalDisorders.risk.toLowerCase();
        if (heart !== riskFilter && neuro !== riskFilter) return false;
      }

      // date range
      const ts = new Date(it.timestamp);
      if (start && ts < start) return false;
      if (end && ts > end) return false;

      if (!s) return true;

      const tsStr = ts.toLocaleString().toLowerCase();
      const heart = it.assessment.heartDisease.risk.toLowerCase();
      const neuro = it.assessment.neurologicalDisorders.risk.toLowerCase();
      const joined = `${tsStr} ${heart} ${neuro} ${JSON.stringify(it.data)}`;
      return joined.includes(s);
    });
  }, [items, search, riskFilter, dateStart, dateEnd]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
          <h2 className="text-2xl font-semibold">My Assessments</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label>Risk</Label>
              <select
                value={riskFilter}
                onChange={(e) => { setRiskFilter(e.target.value as any); setPage(1); }}
                className="bg-background border border-input rounded px-2 py-1 text-sm"
              >
                <option value="all">Any</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Label>From</Label>
              <Input type="date" value={dateStart} onChange={(e) => { setDateStart(e.target.value); setPage(1); }} />
            </div>

            <div className="flex items-center gap-2">
              <Label>To</Label>
              <Input type="date" value={dateEnd} onChange={(e) => { setDateEnd(e.target.value); setPage(1); }} />
            </div>

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
            const entry = pendingDeletes[it.id];
            const isPending = !!entry;
            const remainingSeconds = entry ? Math.max(0, Math.ceil((entry.expiresAt - now) / 1000)) : 0;
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
                    <>
                      <div className="text-sm text-muted-foreground">Undo in {remainingSeconds}s</div>
                      <Button variant="outline" size="sm" onClick={() => handleUndo(it.id)}>Undo</Button>
                    </>
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

        {/* Delete confirmation dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete assessment</DialogTitle>
              <DialogDescription>Are you sure you want to delete this assessment? You will have a short time to undo.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteTargetId) performSoftDelete(deleteTargetId);
                  setDeleteDialogOpen(false);
                  setDeleteTargetId(null);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear all confirmation dialog */}
        <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear all assessments</DialogTitle>
              <DialogDescription>This will permanently remove all saved assessments from your account. Continue?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setClearDialogOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!user) return;
                  clearAssessmentsForUser(user.email);
                  setItems([]);
                  setPendingDeletes({});
                  setPage(1);
                  setClearDialogOpen(false);
                  toast.success("All assessments cleared");
                }}
              >
                Clear all
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default History;
