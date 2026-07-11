"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api-client";

const LEAVE_TYPES = ["Annual", "Sick", "Unpaid", "Maternity", "Paternity", "Other"];

export default function NewLeaveRequestPage() {
  const router = useRouter();
  const [leaveType, setLeaveType] = useState("Annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post("/api/v1/leave/requests", {
        leaveType,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        reason: reason || null,
      });
      router.push("/leaves");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ProtectedShell>
      <h1 className="mb-6 text-2xl font-bold">New Leave Request</h1>

      <Card className="max-w-lg">
        <CardHeader><CardTitle>Request Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="leaveType">Leave Type</Label>
              <select
                id="leaveType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly explain your leave request..." />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/leaves")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ProtectedShell>
  );
}
