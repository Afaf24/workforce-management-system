"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api-client";
import type { Attendance } from "@/types";
import { format } from "date-fns";

export default function AttendancePage() {
  const [today, setToday] = useState<Attendance | null>(null);
  const [recent, setRecent] = useState<Attendance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isClocking, setIsClocking] = useState(false);

  function loadData() {
    api.get<Attendance | null>("/api/v1/attendance/today").then(setToday).catch(() => {});
    api.get<Attendance[]>("/api/v1/attendance/history").then((data) => setRecent(data.slice(0, 10))).catch(() => {});
  }

  useEffect(() => { loadData(); }, []);

  async function handleClockIn() {
    setIsClocking(true);
    setError(null);
    try {
      const result = await api.post<Attendance>("/api/v1/attendance/clock-in", { notes: null });
      setToday(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to clock in.");
    } finally {
      setIsClocking(false);
    }
  }

  async function handleClockOut() {
    setIsClocking(true);
    setError(null);
    try {
      const result = await api.post<Attendance>("/api/v1/attendance/clock-out", { notes: null });
      setToday(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to clock out.");
    } finally {
      setIsClocking(false);
    }
  }

  return (
    <ProtectedShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Clock in and out, and review your recent records.</p>
        </div>
        <Link href="/attendance/history"><Button variant="outline">View Full History</Button></Link>
      </div>

      <Card className="mb-6 max-w-md">
        <CardHeader><CardTitle className="text-base">Today</CardTitle></CardHeader>
        <CardContent>
          {today?.clockIn ? (
            <div className="space-y-2 text-sm">
              <p>Clocked in: <span className="font-medium">{new Date(today.clockIn).toLocaleTimeString()}</span></p>
              {today.clockOut && <p>Clocked out: <span className="font-medium">{new Date(today.clockOut).toLocaleTimeString()}</span></p>}
              {today.workedHours && <p>Worked: <span className="font-medium">{today.workedHours} hours</span></p>}
              <Badge variant={today.status === "Late" ? "warning" : "success"}>{today.status}</Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">You haven&apos;t clocked in yet today.</p>
          )}
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          <div className="mt-4 flex gap-2">
            {!today?.clockIn && <Button onClick={handleClockIn} disabled={isClocking}>Clock In</Button>}
            {today?.clockIn && !today?.clockOut && (
              <Button variant="secondary" onClick={handleClockOut} disabled={isClocking}>Clock Out</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Records</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Clock In</th>
                <th className="px-4 py-3 font-medium">Clock Out</th>
                <th className="px-4 py-3 font-medium">Hours</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No records yet.</td></tr>
              )}
              {recent.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{format(new Date(r.date), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3">{r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : "—"}</td>
                  <td className="px-4 py-3">{r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : "—"}</td>
                  <td className="px-4 py-3">{r.workedHours ?? "—"}</td>
                  <td className="px-4 py-3"><Badge variant={r.status === "Late" ? "warning" : "success"}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </ProtectedShell>
  );
}
