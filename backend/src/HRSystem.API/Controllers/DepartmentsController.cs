using HRSystem.Application.DTOs.Department;
using HRSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRSystem.API.Controllers;

[ApiController]
[Route("api/v1/departments")]
[Authorize]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _departmentService;

    public DepartmentsController(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    [HttpGet]
    public async Task<ActionResult<List<DepartmentDto>>> GetAll(CancellationToken ct)
    {
        return Ok(await _departmentService.GetAllAsync(ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DepartmentDto>> GetById(Guid id, CancellationToken ct)
    {
        return Ok(await _departmentService.GetByIdAsync(id, ct));
    }

    [HttpPost]
    [Authorize(Roles = "HRManager")]
    public async Task<ActionResult<DepartmentDto>> Create([FromBody] CreateDepartmentRequestDto request, CancellationToken ct)
    {
        var result = await _departmentService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "HRManager")]
    public async Task<ActionResult<DepartmentDto>> Update(Guid id, [FromBody] UpdateDepartmentRequestDto request, CancellationToken ct)
    {
        return Ok(await _departmentService.UpdateAsync(id, request, ct));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "HRManager")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _departmentService.DeleteAsync(id, ct);
        return NoContent();
    }
}
