namespace HRSystem.Application.DTOs.Employee;

public record EmployeeDto(
    Guid Id,
    string EmployeeCode,
    string FirstName,
    string LastName,
    string FullName,
    string? PhoneNumber,
    string JobTitle,
    Guid DepartmentId,
    string DepartmentName,
    Guid? ManagerId,
    string? ManagerName,
    DateTime HireDate,
    decimal? Salary,
    DateTime? DateOfBirth,
    string? Address,
    string? ProfileImageUrl,
    bool IsActive,
    string Email
);

public record EmployeeSummaryDto(
    Guid Id,
    string EmployeeCode,
    string FullName,
    string JobTitle,
    string DepartmentName,
    bool IsActive
);

public record CreateEmployeeRequestDto(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    string JobTitle,
    Guid DepartmentId,
    Guid? ManagerId,
    DateTime HireDate,
    decimal? Salary,
    DateTime? DateOfBirth,
    string? Address,
    string Role
);

public record UpdateEmployeeRequestDto(
    string FirstName,
    string LastName,
    string? PhoneNumber,
    string JobTitle,
    Guid DepartmentId,
    Guid? ManagerId,
    decimal? Salary,
    DateTime? DateOfBirth,
    string? Address,
    bool IsActive
);
