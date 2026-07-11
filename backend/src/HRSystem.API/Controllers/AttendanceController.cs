using HRSystem.Application.DTOs.Attendance;
using HRSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRSystem.API.Controllers;

[ApiController]
[Route("api/v1/attendance")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;
    private readonly ICurrentUserService _currentUserService;

    public AttendanceController(IAttendanceService attendanceService, ICurrentUserService currentUserService)
    {
        _attendanceService = attendanceService;
        _currentUserService = currentUserService;
    }

    /// <summary>Clock in for the current day (current authenticated employee).</summary>
    [HttpPost("clock-in")]
    public async Task<ActionResult<AttendanceDto>> ClockIn([FromBody] ClockInRequestDto request, CancellationToken ct)
    {
        var result = await _attendanceService.ClockInAsync(_currentUserService.EmployeeId!.Value, request, ct);
        return Ok(result);
    }

    /// <summary>Clock out for the current day (current authenticated employee).</summary>
    [HttpPost("clock-out")]
    public async Task<ActionResult<AttendanceDto>> ClockOut([FromBody] ClockOutRequestDto request, CancellationToken ct)
    {
        var result = await _attendanceService.ClockOutAsync(_currentUserService.EmployeeId!.Value, request, ct);
        return Ok(result);
    }

    /// <summary>Get today's attendance status for the current employee (or null if not clocked in).</summary>
    [HttpGet("today")]
    public async Task<ActionResult<AttendanceDto?>> GetToday(CancellationToken ct)
    {
        var result = await _attendanceService.GetTodayAsync(_currentUserService.EmployeeId!.Value, ct);
        return Ok(result);
    }

    /// <summary>Get attendance history for the current employee, optionally filtered by date range.</summary>
    [HttpGet("history")]
    public async Task<ActionResult<List<AttendanceDto>>> GetMyHistory(
        [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        var result = await _attendanceService.GetHistoryAsync(_currentUserService.EmployeeId!.Value, from, to, ct);
        return Ok(result);
    }

    /// <summary>Get attendance history for any employee. HR/Department Manager only.</summary>
    [HttpGet("history/{employeeId:guid}")]
    [Authorize(Roles = "HRManager,DepartmentManager")]
    public async Task<ActionResult<List<AttendanceDto>>> GetEmployeeHistory(
        Guid employeeId, [FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken ct)
    {
        var result = await _attendanceService.GetHistoryAsync(employeeId, from, to, ct);
        return Ok(result);
    }

    /// <summary>Get an aggregated attendance report for an employee over a date range. HR/Department Manager only.</summary>
    [HttpGet("report/{employeeId:guid}")]
    [Authorize(Roles = "HRManager,DepartmentManager")]
    public async Task<ActionResult<AttendanceReportDto>> GetReport(
        Guid employeeId, [FromQuery] DateTime from, [FromQuery] DateTime to, CancellationToken ct)
    {
        var result = await _attendanceService.GetReportAsync(employeeId, from, to, ct);
        return Ok(result);
    }
}
