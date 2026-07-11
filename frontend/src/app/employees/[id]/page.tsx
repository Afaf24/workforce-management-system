"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import type { Employee } from "@/types";
import { format } from "date-fns";

export default function EmployeeDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<Employee>(`/api/v1/employees/${params.id}`)
      .then(setEmployee)
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return (
      <ProtectedShell>
        <p className="text-muted-foreground">Loading...</p>
      </ProtectedShell>
    );
  }

  if (!employee) {
    return (
      <ProtectedShell>
        <p className="text-muted-foreground">Employee not found.</p>
      </ProtectedShell>
    );
  }

  return (
    <ProtectedShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{employee.fullName}</h1>
          <p className="text-muted-foreground">{employee.jobTitle} · {employee.departmentName}</p>
        </div>
        <Badge variant={employee.isActive ? "success" : "secondary"}>
          {employee.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Employee Code" value={employee.employeeCode} />
            <Row label="Email" value={employee.email} />
            <Row label="Phone" value={employee.phoneNumber || "—"} />
            <Row label="Address" value={employee.address || "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Employment Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Manager" value={employee.managerName || "—"} />
            <Row label="Hire Date" value={format(new Date(employee.hireDate), "MMM d, yyyy")} />
            <Row label="Date of Birth" value={employee.dateOfBirth ? format(new Date(employee.dateOfBirth), "MMM d, yyyy") : "—"} />
            <Row label="Salary" value={employee.salary ? `$${employee.salary.toLocaleString()}` : "—"} />
          </CardContent>
        </Card>
      </div>

      <Button variant="outline" className="mt-6" onClick={() => router.push("/employees")}>
        Back to list
      </Button>
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
