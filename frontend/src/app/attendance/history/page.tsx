"use client";

import { useEffect, useState } from "react";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import type { Attendance } from "@/types";
import { format } from "date-fns";

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());
    const query = params.toString() ? `?${params.toString()}` : "";

    api
      .get<Attendance[]>(`/api/v1/attendance/history${query}`)
      .then(setRecords)
      .finally(() => setIsLoading(false));
  }, [from, to]);

  return (
    <ProtectedShell>
      <h1 className="mb-2 text-2xl font-bold">Attendance History</h1>
      <p className="mb-6 text-muted-foreground">Filter your full attendance record by date range.</p>

      <div className="mb-4 flex gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="from">From</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">To</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Clock In</th>
                <th className="px-4 py-3 font-medium">Clock Out</th>
                <th className="px-4 py-3 font-medium">Hours</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Loading...</td></tr>
              )}
              {!isLoading && records.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">No records found.</td></tr>
              )}
              {records.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{format(new Date(r.date), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3">{r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : "—"}</td>
                  <td className="px-4 py-3">{r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : "—"}</td>
                  <td className="px-4 py-3">{r.workedHours ?? "—"}</td>
                  <td className="px-4 py-3"><Badge variant={r.status === "Late" ? "warning" : "success"}>{r.status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{r.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </ProtectedShell>
  );
}
