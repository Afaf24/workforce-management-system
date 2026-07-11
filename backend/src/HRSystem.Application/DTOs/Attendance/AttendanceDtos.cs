namespace HRSystem.Application.DTOs.Attendance;

public record AttendanceDto(
    Guid Id,
    Guid EmployeeId,
    string EmployeeName,
    DateTime Date,
    DateTime? ClockIn,
    DateTime? ClockOut,
    string Status,
    decimal? WorkedHours,
    string? Notes
);

public record ClockInRequestDto(string? Notes);
public record ClockOutRequestDto(string? Notes);

public record AttendanceReportDto(
    Guid EmployeeId,
    string EmployeeName,
    int TotalDays,
    int PresentDays,
    int LateDays,
    int AbsentDays,
    int OnLeaveDays,
    decimal TotalWorkedHours
);
