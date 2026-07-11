-- ============================================================================
-- AI-Powered HR Management System
-- PostgreSQL Database Schema
-- Graduation Project
-- ============================================================================

-- Drop tables if they exist (clean re-run during development)
DROP TABLE IF EXISTS "AIConversations" CASCADE;
DROP TABLE IF EXISTS "LeaveBalances" CASCADE;
DROP TABLE IF EXISTS "LeaveRequests" CASCADE;
DROP TABLE IF EXISTS "Attendances" CASCADE;
DROP TABLE IF EXISTS "Employees" CASCADE;
DROP TABLE IF EXISTS "Departments" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('HRManager', 'DepartmentManager', 'Employee');

DROP TYPE IF EXISTS leave_status CASCADE;
CREATE TYPE leave_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Cancelled');

DROP TYPE IF EXISTS leave_type CASCADE;
CREATE TYPE leave_type AS ENUM ('Annual', 'Sick', 'Unpaid', 'Maternity', 'Paternity', 'Other');

DROP TYPE IF EXISTS attendance_status CASCADE;
CREATE TYPE attendance_status AS ENUM ('Present', 'Late', 'Absent', 'OnLeave', 'HalfDay');

-- ============================================================================
-- USERS  (authentication / identity table — separate from Employee profile)
-- ============================================================================
CREATE TABLE "Users" (
    "Id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Email"         VARCHAR(255) NOT NULL UNIQUE,
    "PasswordHash"  VARCHAR(500) NOT NULL,
    "Role"          user_role NOT NULL DEFAULT 'Employee',
    "IsActive"      BOOLEAN NOT NULL DEFAULT TRUE,
    "RefreshToken"  VARCHAR(500),
    "RefreshTokenExpiryTime" TIMESTAMP,
    "CreatedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON "Users" ("Email");

-- ============================================================================
-- DEPARTMENTS
-- ============================================================================
CREATE TABLE "Departments" (
    "Id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name"          VARCHAR(150) NOT NULL,
    "Description"   VARCHAR(500),
    "ManagerId"     UUID NULL,  -- FK to Employees, set after employee exists (nullable, added via ALTER below)
    "CreatedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- EMPLOYEES  (HR profile, 1:1 with Users)
-- ============================================================================
CREATE TABLE "Employees" (
    "Id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId"         UUID NOT NULL UNIQUE REFERENCES "Users"("Id") ON DELETE CASCADE,
    "EmployeeCode"   VARCHAR(20) NOT NULL UNIQUE,
    "FirstName"      VARCHAR(100) NOT NULL,
    "LastName"       VARCHAR(100) NOT NULL,
    "PhoneNumber"    VARCHAR(30),
    "JobTitle"       VARCHAR(150) NOT NULL,
    "DepartmentId"   UUID NOT NULL REFERENCES "Departments"("Id") ON DELETE RESTRICT,
    "ManagerId"      UUID NULL REFERENCES "Employees"("Id") ON DELETE SET NULL,
    "HireDate"       DATE NOT NULL,
    "Salary"         NUMERIC(12,2),
    "DateOfBirth"    DATE,
    "Address"        VARCHAR(300),
    "ProfileImageUrl" VARCHAR(500),
    "IsActive"       BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt"      TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt"      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employees_department ON "Employees" ("DepartmentId");
CREATE INDEX idx_employees_manager ON "Employees" ("ManagerId");
CREATE INDEX idx_employees_name ON "Employees" ("FirstName", "LastName");

-- Now that Employees exists, add the FK from Departments -> Employees (department manager)
ALTER TABLE "Departments"
    ADD CONSTRAINT fk_department_manager
    FOREIGN KEY ("ManagerId") REFERENCES "Employees"("Id") ON DELETE SET NULL;

-- ============================================================================
-- ATTENDANCE
-- ============================================================================
CREATE TABLE "Attendances" (
    "Id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EmployeeId"   UUID NOT NULL REFERENCES "Employees"("Id") ON DELETE CASCADE,
    "Date"         DATE NOT NULL,
    "ClockIn"      TIMESTAMP,
    "ClockOut"     TIMESTAMP,
    "Status"       attendance_status NOT NULL DEFAULT 'Present',
    "WorkedHours"  NUMERIC(5,2),
    "Notes"        VARCHAR(300),
    "CreatedAt"    TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt"    TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_employee_date UNIQUE ("EmployeeId", "Date")
);

CREATE INDEX idx_attendance_employee ON "Attendances" ("EmployeeId");
CREATE INDEX idx_attendance_date ON "Attendances" ("Date");

-- ============================================================================
-- LEAVE REQUESTS
-- ============================================================================
CREATE TABLE "LeaveRequests" (
    "Id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EmployeeId"      UUID NOT NULL REFERENCES "Employees"("Id") ON DELETE CASCADE,
    "LeaveType"       leave_type NOT NULL,
    "StartDate"       DATE NOT NULL,
    "EndDate"         DATE NOT NULL,
    "TotalDays"       NUMERIC(5,1) NOT NULL,
    "Reason"          VARCHAR(500),
    "Status"          leave_status NOT NULL DEFAULT 'Pending',
    "ReviewedById"    UUID NULL REFERENCES "Employees"("Id") ON DELETE SET NULL,
    "ReviewedAt"      TIMESTAMP,
    "ReviewComment"   VARCHAR(500),
    "CreatedAt"       TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt"       TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_leave_dates CHECK ("EndDate" >= "StartDate")
);

CREATE INDEX idx_leave_employee ON "LeaveRequests" ("EmployeeId");
CREATE INDEX idx_leave_status ON "LeaveRequests" ("Status");

-- ============================================================================
-- LEAVE BALANCES  (per employee, per year, per leave type)
-- ============================================================================
CREATE TABLE "LeaveBalances" (
    "Id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EmployeeId"     UUID NOT NULL REFERENCES "Employees"("Id") ON DELETE CASCADE,
    "LeaveType"      leave_type NOT NULL,
    "Year"           INT NOT NULL,
    "TotalAllotted"  NUMERIC(5,1) NOT NULL DEFAULT 0,
    "Used"           NUMERIC(5,1) NOT NULL DEFAULT 0,
    "Remaining"      NUMERIC(5,1) NOT NULL DEFAULT 0,
    "CreatedAt"      TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt"      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_employee_leavetype_year UNIQUE ("EmployeeId", "LeaveType", "Year")
);

CREATE INDEX idx_leavebalance_employee ON "LeaveBalances" ("EmployeeId");

-- ============================================================================
-- AI CONVERSATIONS  (optional: stores AI assistant chat history)
-- ============================================================================
CREATE TABLE "AIConversations" (
    "Id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EmployeeId"   UUID NOT NULL REFERENCES "Employees"("Id") ON DELETE CASCADE,
    "Question"     TEXT NOT NULL,
    "Answer"       TEXT NOT NULL,
    "CreatedAt"    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_employee ON "AIConversations" ("EmployeeId");

-- ============================================================================
-- TRIGGER: auto-update "UpdatedAt" columns
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON "Users" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_departments_updated_at BEFORE UPDATE ON "Departments" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_employees_updated_at BEFORE UPDATE ON "Employees" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_attendance_updated_at BEFORE UPDATE ON "Attendances" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_leaverequests_updated_at BEFORE UPDATE ON "LeaveRequests" FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_leavebalances_updated_at BEFORE UPDATE ON "LeaveBalances" FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- SEED DATA (for demo/testing)
-- ============================================================================

-- Departments
INSERT INTO "Departments" ("Id", "Name", "Description") VALUES
    ('11111111-1111-1111-1111-111111111111', 'Human Resources', 'Handles HR operations'),
    ('22222222-2222-2222-2222-222222222222', 'Engineering', 'Software development'),
    ('33333333-3333-3333-3333-333333333333', 'Finance', 'Accounting and finance');

-- Users (password for all demo users is "Passw0rd!" — hash generated via BCrypt in backend seeding, placeholder here)
-- NOTE: Real password hashes should be generated by the backend seeder (see SeedData.cs). These are placeholders.
INSERT INTO "Users" ("Id", "Email", "PasswordHash", "Role") VALUES
    ('a1111111-1111-1111-1111-111111111111', 'hr.manager@company.com', '$2a$11$PLACEHOLDER_HASH_REPLACED_BY_SEEDER', 'HRManager'),
    ('a2222222-2222-2222-2222-222222222222', 'dept.manager@company.com', '$2a$11$PLACEHOLDER_HASH_REPLACED_BY_SEEDER', 'DepartmentManager'),
    ('a3333333-3333-3333-3333-333333333333', 'employee@company.com', '$2a$11$PLACEHOLDER_HASH_REPLACED_BY_SEEDER', 'Employee');

-- Employees
INSERT INTO "Employees" ("Id", "UserId", "EmployeeCode", "FirstName", "LastName", "JobTitle", "DepartmentId", "HireDate") VALUES
    ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'EMP001', 'Sara', 'Ahmed', 'HR Manager', '11111111-1111-1111-1111-111111111111', '2022-01-10'),
    ('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'EMP002', 'Omar', 'Khalil', 'Engineering Manager', '22222222-2222-2222-2222-222222222222', '2021-03-15'),
    ('b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'EMP003', 'Layla', 'Hassan', 'Software Engineer', '22222222-2222-2222-2222-222222222222', '2023-06-01');

UPDATE "Departments" SET "ManagerId" = 'b2222222-2222-2222-2222-222222222222' WHERE "Id" = '22222222-2222-2222-2222-222222222222';
UPDATE "Employees" SET "ManagerId" = 'b2222222-2222-2222-2222-222222222222' WHERE "Id" = 'b3333333-3333-3333-3333-333333333333';

-- Leave balances for current year
INSERT INTO "LeaveBalances" ("EmployeeId", "LeaveType", "Year", "TotalAllotted", "Used", "Remaining") VALUES
    ('b3333333-3333-3333-3333-333333333333', 'Annual', 2026, 21, 3, 18),
    ('b3333333-3333-3333-3333-333333333333', 'Sick', 2026, 10, 1, 9);
