using HRSystem.Domain.Enums;

namespace HRSystem.Domain.Entities;

public class LeaveBalance : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public LeaveType LeaveType { get; set; }
    public int Year { get; set; }
    public decimal TotalAllotted { get; set; }
    public decimal Used { get; set; }
    public decimal Remaining { get; set; }

    // Navigation
    public Employee? Employee { get; set; }
}
