namespace HRSystem.Domain.Entities;

public class Employee : BaseEntity
{
    public Guid UserId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public Guid? ManagerId { get; set; }
    public DateTime HireDate { get; set; }
    public decimal? Salary { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Address { get; set; }
    public string? ProfileImageUrl { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public User? User { get; set; }
    public Department? Department { get; set; }
    public Employee? Manager { get; set; }
    public ICollection<Employee> DirectReports { get; set; } = new List<Employee>();
    public ICollection<Attendance> AttendanceRecords { get; set; } = new List<Attendance>();
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<LeaveBalance> LeaveBalances { get; set; } = new List<LeaveBalance>();

    public string FullName => $"{FirstName} {LastName}";
}
