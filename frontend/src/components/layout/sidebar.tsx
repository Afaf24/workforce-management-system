"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Bot,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["HRManager", "DepartmentManager", "Employee"] },
  { href: "/employees", label: "Employees", icon: Users, roles: ["HRManager", "DepartmentManager"] },
  { href: "/attendance", label: "Attendance", icon: Clock, roles: ["HRManager", "DepartmentManager", "Employee"] },
  { href: "/leaves", label: "Leave Requests", icon: CalendarDays, roles: ["HRManager", "DepartmentManager", "Employee"] },
  { href: "/ai-assistant", label: "AI Assistant", icon: Bot, roles: ["HRManager", "DepartmentManager", "Employee"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["HRManager", "DepartmentManager", "Employee"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-white">
      <div className="border-b border-border px-6 py-5">
        <h1 className="text-lg font-bold text-primary">HR System</h1>
        <p className="text-xs text-muted-foreground">AI-Powered HR Management</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems
          .filter((item) => !user || item.roles.includes(user.role))
          .map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 px-1">
          <p className="text-sm font-medium">{user?.fullName}</p>
          <p className="text-xs text-muted-foreground">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
