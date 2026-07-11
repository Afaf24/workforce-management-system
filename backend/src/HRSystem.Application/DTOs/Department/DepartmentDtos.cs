namespace HRSystem.Application.DTOs.Department;

public record DepartmentDto(Guid Id, string Name, string? Description, Guid? ManagerId, string? ManagerName, int EmployeeCount);
public record CreateDepartmentRequestDto(string Name, string? Description, Guid? ManagerId);
public record UpdateDepartmentRequestDto(string Name, string? Description, Guid? ManagerId);
