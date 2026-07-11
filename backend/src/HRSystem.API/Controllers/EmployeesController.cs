using HRSystem.Application.DTOs.Employee;
using HRSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRSystem.API.Controllers;

[ApiController]
[Route("api/v1/employees")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly ICurrentUserService _currentUserService;

    public EmployeesController(IEmployeeService employeeService, ICurrentUserService currentUserService)
    {
        _employeeService = employeeService;
        _currentUserService = currentUserService;
    }

    /// <summary>Search/list employees. Available to HR Managers and Department Managers.</summary>
    [HttpGet]
    [Authorize(Roles = "HRManager,DepartmentManager")]
    public async Task<ActionResult<List<EmployeeSummaryDto>>> Search(
        [FromQuery] string? search, [FromQuery] Guid? departmentId, CancellationToken ct)
    {
        var result = await _employeeService.SearchAsync(search, departmentId, ct);
        return Ok(result);
    }

    /// <summary>Get a single employee's full profile by id.</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EmployeeDto>> GetById(Guid id, CancellationToken ct)
    {
        var result = await _employeeService.GetByIdAsync(id, ct);
        return Ok(result);
    }

    /// <summary>Get the currently authenticated user's own employee profile.</summary>
    [HttpGet("me")]
    public async Task<ActionResult<EmployeeDto>> GetMyProfile(CancellationToken ct)
    {
        var result = await _employeeService.GetByUserIdAsync(_currentUserService.UserId!.Value, ct);
        return Ok(result);
    }

    /// <summary>Create a new employee (and their linked user account). HR Manager only.</summary>
    [HttpPost]
    [Authorize(Roles = "HRManager")]
    public async Task<ActionResult<EmployeeDto>> Create([FromBody] CreateEmployeeRequestDto request, CancellationToken ct)
    {
        var result = await _employeeService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update an employee's profile. HR Manager only.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "HRManager")]
    public async Task<ActionResult<EmployeeDto>> Update(Guid id, [FromBody] UpdateEmployeeRequestDto request, CancellationToken ct)
    {
        var result = await _employeeService.UpdateAsync(id, request, ct);
        return Ok(result);
    }

    /// <summary>Deactivate (soft-delete) an employee. HR Manager only.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "HRManager")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _employeeService.DeleteAsync(id, ct);
        return NoContent();
    }
}
