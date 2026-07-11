// Mirrors the C# DTOs in HRSystem.Application/DTOs so the frontend and backend
// contracts stay in sync. Keep these in lockstep with backend changes.

export type UserRole = "HRManager" | "DepartmentManager" | "Employee";

export interface UserInfo {
  id: string;
  email: string;
  role: UserRole;
  employeeId: string;
  fullName: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string | null;
  jobTitle: string;
  departmentId: string;
  departmentName: string;
  managerId: string | null;
  managerName: string | null;
  hireDate: string;
  salary: number | null;
  dateOfBirth: string | null;
  address: string | null;
  profileImageUrl: string | null;
  isActive: boolean;
  email: string;
}

export interface EmployeeSummary {
  id: string;
  employeeCode: string;
  fullName: string;
  jobTitle: string;
  departmentName: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  managerId: string | null;
  managerName: string | null;
  employeeCount: number;
}

export type AttendanceStatus = "Present" | "Late" | "Absent" | "OnLeave" | "HalfDay";

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: AttendanceStatus;
  workedHours: number | null;
  notes: string | null;
}

export interface AttendanceReport {
  employeeId: string;
  employeeName: string;
  totalDays: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  onLeaveDays: number;
  totalWorkedHours: number;
}

export type LeaveType = "Annual" | "Sick" | "Unpaid" | "Maternity" | "Paternity" | "Other";
export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string | null;
  status: LeaveStatus;
  reviewedById: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  reviewComment: string | null;
  createdAt: string;
}

export interface LeaveBalance {
  id: string;
  leaveType: LeaveType;
  year: number;
  totalAllotted: number;
  used: number;
  remaining: number;
}

export interface ConversationHistory {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface ApiErrorResponse {
  title: string;
  status: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
