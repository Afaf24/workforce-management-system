using HRSystem.Application.DTOs.Employee;
using HRSystem.Application.Interfaces;
using HRSystem.Domain.Entities;
using HRSystem.Domain.Enums;
using HRSystem.Domain.Exceptions;
using HRSystem.Domain.Interfaces;

namespace HRSystem.Application.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;

    public EmployeeService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
    }

    public async Task<EmployeeDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetWithDetailsAsync(id, ct)
            ?? throw new NotFoundException(nameof(Employee), id);

        return MapToDto(employee);
    }

    public async Task<EmployeeDto> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetByUserIdAsync(userId, ct)
            ?? throw new NotFoundException(nameof(Employee), userId);

        var detailed = await _unitOfWork.Employees.GetWithDetailsAsync(employee.Id, ct)
            ?? throw new NotFoundException(nameof(Employee), employee.Id);

        return MapToDto(detailed);
    }

    public async Task<List<EmployeeSummaryDto>> SearchAsync(string? searchTerm, Guid? departmentId, CancellationToken ct = default)
    {
        var employees = await _unitOfWork.Employees.SearchAsync(searchTerm, departmentId, ct);

        return employees.Select(e => new EmployeeSummaryDto(
            e.Id,
            e.EmployeeCode,
            e.FullName,
            e.JobTitle,
            e.Department?.Name ?? string.Empty,
            e.IsActive
        )).ToList();
    }

    public async Task<EmployeeDto> CreateAsync(CreateEmployeeRequestDto request, CancellationToken ct = default)
    {
        var existingUser = await _unitOfWork.Users.GetByEmailAsync(request.Email, ct);
        if (existingUser is not null)
        {
            throw new BusinessRuleException($"A user with email '{request.Email}' already exists.");
        }

        if (!Enum.TryParse<UserRole>(request.Role, ignoreCase: true, out var role))
        {
            throw new BusinessRuleException($"Invalid role '{request.Role}'.");
        }

        var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Department), request.DepartmentId);

        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = role,
            IsActive = true
        };
        await _unitOfWork.Users.AddAsync(user, ct);

        var employeeCode = await GenerateEmployeeCodeAsync(ct);

        var employee = new Employee
        {
            UserId = user.Id,
            EmployeeCode = employeeCode,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            JobTitle = request.JobTitle,
            DepartmentId = request.DepartmentId,
            ManagerId = request.ManagerId,
            HireDate = request.HireDate,
            Salary = request.Salary,
            DateOfBirth = request.DateOfBirth,
            Address = request.Address,
            IsActive = true
        };
        await _unitOfWork.Employees.AddAsync(employee, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        // Seed default leave balances for the current year (Annual + Sick).
        var currentYear = DateTime.UtcNow.Year;
        await _unitOfWork.LeaveBalances.AddAsync(new LeaveBalance
        {
            EmployeeId = employee.Id, LeaveType = LeaveType.Annual, Year = currentYear,
            TotalAllotted = 21, Used = 0, Remaining = 21
        }, ct);
        await _unitOfWork.LeaveBalances.AddAsync(new LeaveBalance
        {
            EmployeeId = employee.Id, LeaveType = LeaveType.Sick, Year = currentYear,
            TotalAllotted = 10, Used = 0, Remaining = 10
        }, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        var detailed = await _unitOfWork.Employees.GetWithDetailsAsync(employee.Id, ct)
            ?? throw new NotFoundException(nameof(Employee), employee.Id);

        return MapToDto(detailed);
    }

    public async Task<EmployeeDto> UpdateAsync(Guid id, UpdateEmployeeRequestDto request, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Employee), id);

        var department = await _unitOfWork.Departments.GetByIdAsync(request.DepartmentId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Department), request.DepartmentId);

        if (request.ManagerId == id)
        {
            throw new BusinessRuleException("An employee cannot be their own manager.");
        }

        employee.FirstName = request.FirstName;
        employee.LastName = request.LastName;
        employee.PhoneNumber = request.PhoneNumber;
        employee.JobTitle = request.JobTitle;
        employee.DepartmentId = request.DepartmentId;
        employee.ManagerId = request.ManagerId;
        employee.Salary = request.Salary;
        employee.DateOfBirth = request.DateOfBirth;
        employee.Address = request.Address;
        employee.IsActive = request.IsActive;

        _unitOfWork.Employees.Update(employee);
        await _unitOfWork.SaveChangesAsync(ct);

        var detailed = await _unitOfWork.Employees.GetWithDetailsAsync(id, ct)
            ?? throw new NotFoundException(nameof(Employee), id);

        return MapToDto(detailed);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var employee = await _unitOfWork.Employees.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Employee), id);

        // Soft delete: deactivate rather than hard-delete, to preserve attendance/leave history integrity.
        employee.IsActive = false;
        _unitOfWork.Employees.Update(employee);

        var user = await _unitOfWork.Users.GetByIdAsync(employee.UserId, ct);
        if (user is not null)
        {
            user.IsActive = false;
            _unitOfWork.Users.Update(user);
        }

        await _unitOfWork.SaveChangesAsync(ct);
    }

    private async Task<string> GenerateEmployeeCodeAsync(CancellationToken ct)
    {
        var all = await _unitOfWork.Employees.GetAllAsync(ct);
        var nextNumber = all.Count + 1;
        string code;
        do
        {
            code = $"EMP{nextNumber:D3}";
            nextNumber++;
        } while (await _unitOfWork.Employees.EmployeeCodeExistsAsync(code, ct));

        return code;
    }

    private static EmployeeDto MapToDto(Employee e) => new(
        e.Id,
        e.EmployeeCode,
        e.FirstName,
        e.LastName,
        e.FullName,
        e.PhoneNumber,
        e.JobTitle,
        e.DepartmentId,
        e.Department?.Name ?? string.Empty,
        e.ManagerId,
        e.Manager?.FullName,
        e.HireDate,
        e.Salary,
        e.DateOfBirth,
        e.Address,
        e.ProfileImageUrl,
        e.IsActive,
        e.User?.Email ?? string.Empty
    );
}
