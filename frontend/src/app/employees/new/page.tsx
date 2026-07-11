"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api-client";
import type { Department } from "@/types";

export default function NewEmployeePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    jobTitle: "",
    departmentId: "",
    hireDate: new Date().toISOString().slice(0, 10),
    role: "Employee",
  });

  useEffect(() => {
    api.get<Department[]>("/api/v1/departments").then(setDepartments).catch(() => {});
  }, []);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post("/api/v1/employees", {
        ...form,
        phoneNumber: form.phoneNumber || null,
        hireDate: new Date(form.hireDate).toISOString(),
      });
      router.push("/employees");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create employee.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ProtectedShell>
      <h1 className="mb-6 text-2xl font-bold">Add Employee</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Temporary Password</Label>
                <Input id="password" type="password" required minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" required value={form.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" value={form.phoneNumber} onChange={(e) => update("phoneNumber", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="departmentId">Department</Label>
                <select
                  id="departmentId"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.departmentId}
                  onChange={(e) => update("departmentId", e.target.value)}
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                >
                  <option value="Employee">Employee</option>
                  <option value="DepartmentManager">Department Manager</option>
                  <option value="HRManager">HR Manager</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input id="hireDate" type="date" required value={form.hireDate} onChange={(e) => update("hireDate", e.target.value)} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Employee"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/employees")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ProtectedShell>
  );
}
