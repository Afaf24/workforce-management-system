namespace HRSystem.Domain.Enums;

public enum UserRole
{
    HRManager,
    DepartmentManager,
    Employee
}

public enum LeaveStatus
{
    Pending,
    Approved,
    Rejected,
    Cancelled
}

public enum LeaveType
{
    Annual,
    Sick,
    Unpaid,
    Maternity,
    Paternity,
    Other
}

public enum AttendanceStatus
{
    Present,
    Late,
    Absent,
    OnLeave,
    HalfDay
}
