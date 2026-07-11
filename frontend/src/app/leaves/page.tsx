"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError } from "@/lib/api-client";
import type { LeaveRequest } from "@/types";
import { format } from "date-fns";
import { Plus } from "lucide-react";

function statusVariant(status: string): "success" | "warning" | "destructive" | "secondary" {
  if (status === "Approved") return "success";
  if (status === "Pending") return "warning";
  if (status === "Rejected") return "destructive";
  return "secondary";
}

export default function LeavesPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<LeaveRequest[]>([]);
  const [pending, setPending] = useState<LeaveRequest[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const isManager = user?.role === "HRManager" || user?.role === "DepartmentManager";

  function loadData() {
    api.get<LeaveRequest[]>("/api/v1/leave/requests/me").then(setHistory).catch(() => {});
    if (isManager) {
      api.get<LeaveRequest[]>("/api/v1/leave/requests/pending").then(setPending).catch(() => {});
    }
  }

  useEffect(() => { loadData(); }, [isManager]);

  async function handleReview(requestId: string, approve: boolean) {
    setError(null);
    try {
      await api.put(`/api/v1/leave/requests/${requestId}/review`, {
        approve,
        comment: comments[requestId] || null,
      });
      loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to review request.");
    }
  }

  return (
    <ProtectedShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leave Requests</h1>
          <p className="text-muted-foreground">Submit and track leave requests.</p>
        </div>
        <Link href="/leaves/new">
          <Button><Plus className="mr-2 h-4 w-4" /> New Request</Button>
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {isManager && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Pending Approvals</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending requests.</p>}
            {pending.map((req) => (
              <div key={req.id} className="rounded-md border border-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{req.employeeName}</p>
                    <p className="text-sm text-muted-foreground">
                      {req.leaveType} · {format(new Date(req.startDate), "MMM d")} – {format(new Date(req.endDate), "MMM d, yyyy")} ({req.totalDays} days)
                    </p>
                  </div>
                  <Badge variant={statusVariant(req.status)}>{req.status}</Badge>
                </div>
                {req.reason && <p className="mb-2 text-sm text-muted-foreground">&ldquo;{req.reason}&rdquo;</p>}
                <Textarea
                  placeholder="Optional comment..."
                  className="mb-2"
                  value={comments[req.id] || ""}
                  onChange={(e) => setComments((prev) => ({ ...prev, [req.id]: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleReview(req.id, true)}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReview(req.id, false)}>Reject</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">My Leave History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Days</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Reviewed By</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No leave requests yet.</td></tr>
              )}
              {history.map((req) => (
                <tr key={req.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{req.leaveType}</td>
                  <td className="px-4 py-3">{format(new Date(req.startDate), "MMM d")} – {format(new Date(req.endDate), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3">{req.totalDays}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(req.status)}>{req.status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{req.reviewedByName || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </ProtectedShell>
  );
}
