using HRSystem.Application.DTOs.Department;
using HRSystem.Application.Interfaces;
using HRSystem.Domain.Entities;
using HRSystem.Domain.Exceptions;
using HRSystem.Domain.Interfaces;

namespace HRSystem.Application.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IUnitOfWork _unitOfWork;

    public DepartmentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<DepartmentDto>> GetAllAsync(CancellationToken ct = default)
    {
        var departments = await _unitOfWork.Departments.GetAllAsync(ct);
        return departments.Select(MapToDto).ToList();
    }

    public async Task<DepartmentDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Department), id);

        return MapToDto(department);
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentRequestDto request, CancellationToken ct = default)
    {
        var department = new Department
        {
            Name = request.Name,
            Description = request.Description,
            ManagerId = request.ManagerId
        };

        await _unitOfWork.Departments.AddAsync(department, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(department);
    }

    public async Task<DepartmentDto> UpdateAsync(Guid id, UpdateDepartmentRequestDto request, CancellationToken ct = default)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Department), id);

        department.Name = request.Name;
        department.Description = request.Description;
        department.ManagerId = request.ManagerId;

        _unitOfWork.Departments.Update(department);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(department);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Department), id);

        if (department.Employees.Any())
        {
            throw new BusinessRuleException("Cannot delete a department that still has employees assigned.");
        }

        _unitOfWork.Departments.Remove(department);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private static DepartmentDto MapToDto(Department d) => new(
        d.Id,
        d.Name,
        d.Description,
        d.ManagerId,
        d.Manager?.FullName,
        d.Employees?.Count ?? 0
    );
}
