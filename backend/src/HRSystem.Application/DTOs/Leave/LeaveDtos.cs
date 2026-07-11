namespace HRSystem.Application.DTOs.Leave;

public record LeaveRequestDto(
    Guid Id,
    Guid EmployeeId,
    string EmployeeName,
    string LeaveType,
    DateTime StartDate,
    DateTime EndDate,
    decimal TotalDays,
    string? Reason,
    string Status,
    Guid? ReviewedById,
    string? ReviewedByName,
    DateTime? ReviewedAt,
    string? ReviewComment,
    DateTime CreatedAt
);

public record CreateLeaveRequestDto(
    string LeaveType,
    DateTime StartDate,
    DateTime EndDate,
    string? Reason
);

public record ReviewLeaveRequestDto(
    bool Approve,
    string? Comment
);

public record LeaveBalanceDto(
    Guid Id,
    string LeaveType,
    int Year,
    decimal TotalAllotted,
    decimal Used,
    decimal Remaining
);
