using HRSystem.Application.DTOs.Leave;
using HRSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRSystem.API.Controllers;

[ApiController]
[Route("api/v1/leave")]
[Authorize]
public class LeaveController : ControllerBase
{
    private readonly ILeaveService _leaveService;
    private readonly ICurrentUserService _currentUserService;

    public LeaveController(ILeaveService leaveService, ICurrentUserService currentUserService)
    {
        _leaveService = leaveService;
        _currentUserService = currentUserService;
    }

    /// <summary>Submit a new leave request for the current authenticated employee.</summary>
    [HttpPost("requests")]
    public async Task<ActionResult<LeaveRequestDto>> SubmitRequest([FromBody] CreateLeaveRequestDto request, CancellationToken ct)
    {
        var result = await _leaveService.SubmitRequestAsync(_currentUserService.EmployeeId!.Value, request, ct);
        return Ok(result);
    }

    /// <summary>Approve or reject a pending leave request. HR/Department Manager only.</summary>
    [HttpPut("requests/{requestId:guid}/review")]
    [Authorize(Roles = "HRManager,DepartmentManager")]
    public async Task<ActionResult<LeaveRequestDto>> Review(
        Guid requestId, [FromBody] ReviewLeaveRequestDto review, CancellationToken ct)
    {
        var result = await _leaveService.ReviewRequestAsync(requestId, _currentUserService.EmployeeId!.Value, review, ct);
        return Ok(result);
    }

    /// <summary>Get the current employee's leave request history.</summary>
    [HttpGet("requests/me")]
    public async Task<ActionResult<List<LeaveRequestDto>>> GetMyHistory(CancellationToken ct)
    {
        var result = await _leaveService.GetHistoryAsync(_currentUserService.EmployeeId!.Value, ct);
        return Ok(result);
    }

    /// <summary>Get leave requests submitted to the current employee for review (their direct reports). Manager only.</summary>
    [HttpGet("requests/pending")]
    [Authorize(Roles = "HRManager,DepartmentManager")]
    public async Task<ActionResult<List<LeaveRequestDto>>> GetPendingForReview(CancellationToken ct)
    {
        var result = await _leaveService.GetPendingForManagerAsync(_currentUserService.EmployeeId!.Value, ct);
        return Ok(result);
    }

    /// <summary>Get the current employee's leave balances for a given year (defaults to current year).</summary>
    [HttpGet("balances")]
    public async Task<ActionResult<List<LeaveBalanceDto>>> GetMyBalances([FromQuery] int? year, CancellationToken ct)
    {
        var result = await _leaveService.GetBalancesAsync(_currentUserService.EmployeeId!.Value, year ?? DateTime.UtcNow.Year, ct);
        return Ok(result);
    }

    /// <summary>Get any employee's leave balances. HR/Department Manager only.</summary>
    [HttpGet("balances/{employeeId:guid}")]
    [Authorize(Roles = "HRManager,DepartmentManager")]
    public async Task<ActionResult<List<LeaveBalanceDto>>> GetEmployeeBalances(
        Guid employeeId, [FromQuery] int? year, CancellationToken ct)
    {
        var result = await _leaveService.GetBalancesAsync(employeeId, year ?? DateTime.UtcNow.Year, ct);
        return Ok(result);
    }
}
