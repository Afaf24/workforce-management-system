using HRSystem.Domain.Enums;

namespace HRSystem.Domain.Entities;

public class Attendance : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public DateTime Date { get; set; }
    public DateTime? ClockIn { get; set; }
    public DateTime? ClockOut { get; set; }
    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    public decimal? WorkedHours { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public Employee? Employee { get; set; }
}
