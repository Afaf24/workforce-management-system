"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import type { EmployeeSummary } from "@/types";
import { Search, Plus } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(true);
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      api
        .get<EmployeeSummary[]>(`/api/v1/employees${query}`)
        .then(setEmployees)
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <ProtectedShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage your organization&apos;s employees.</p>
        </div>
        <Link href="/employees/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, code, or job title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Job Title</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Loading...</td></tr>
              )}
              {!isLoading && employees.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No employees found.</td></tr>
              )}
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{emp.employeeCode}</td>
                  <td className="px-4 py-3">
                    <Link href={`/employees/${emp.id}`} className="font-medium text-primary hover:underline">
                      {emp.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{emp.jobTitle}</td>
                  <td className="px-4 py-3">{emp.departmentName}</td>
                  <td className="px-4 py-3">
                    <Badge variant={emp.isActive ? "success" : "secondary"}>
                      {emp.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </ProtectedShell>
  );
}
