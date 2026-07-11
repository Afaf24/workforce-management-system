"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError } from "@/lib/api-client";
import type { Employee } from "@/types";

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Employee | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.get<Employee>("/api/v1/employees/me").then(setProfile).catch(() => {});
  }, []);

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    try {
      await api.post("/api/v1/auth/change-password", { currentPassword, newPassword });
      setMessage({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiError ? err.message : "Failed to update password." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ProtectedShell>
      <h1 className="mb-6 text-2xl font-bold">Profile Settings</h1>

      <div className="grid max-w-2xl gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">My Profile</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Name" value={profile?.fullName ?? user?.fullName ?? "—"} />
            <Row label="Email" value={profile?.email ?? user?.email ?? "—"} />
            <Row label="Role" value={user?.role ?? "—"} />
            <Row label="Job Title" value={profile?.jobTitle ?? "—"} />
            <Row label="Department" value={profile?.departmentName ?? "—"} />
            <Row label="Employee Code" value={profile?.employeeCode ?? "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              {message && (
                <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-destructive"}`}>
                  {message.text}
                </p>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
