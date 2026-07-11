using HRSystem.Application.DTOs.Attendance;
using HRSystem.Application.Interfaces;
using HRSystem.Domain.Entities;
using HRSystem.Domain.Enums;
using HRSystem.Domain.Exceptions;
using HRSystem.Domain.Interfaces;

namespace HRSystem.Application.Services;

public class AttendanceService : IAttendanceService
{
    private readonly IUnitOfWork _unitOfWork;
    private static readonly TimeSpan StandardWorkStart = new(9, 0, 0);
    private static readonly TimeSpan LateThreshold = new(9, 15, 0);

    public AttendanceService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<AttendanceDto> ClockInAsync(Guid employeeId, ClockInRequestDto request, CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        var existing = await _unitOfWork.Attendances.GetByEmployeeAndDateAsync(employeeId, today, ct);

        if (existing is not null && existing.ClockIn is not null)
        {
            throw new BusinessRuleException("You have already clocked in today.");
        }

        var now = DateTime.UtcNow;
        var status = now.TimeOfDay > LateThreshold ? AttendanceStatus.Late : AttendanceStatus.Present;

        Attendance attendance;
        if (existing is not null)
        {
            existing.ClockIn = now;
            existing.Status = status;
            existing.Notes = request.Notes;
            _unitOfWork.Attendances.Update(existing);
            attendance = existing;
        }
        else
        {
            attendance = new Attendance
            {
                EmployeeId = employeeId,
                Date = today,
                ClockIn = now,
                Status = status,
                Notes = request.Notes
            };
            await _unitOfWork.Attendances.AddAsync(attendance, ct);
        }

        await _unitOfWork.SaveChangesAsync(ct);

        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId, ct);
        return MapToDto(attendance, employee?.FullName ?? string.Empty);
    }

    public async Task<AttendanceDto> ClockOutAsync(Guid employeeId, ClockOutRequestDto request, CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        var attendance = await _unitOfWork.Attendances.GetByEmployeeAndDateAsync(employeeId, today, ct)
            ?? throw new BusinessRuleException("You must clock in before clocking out.");

        if (attendance.ClockIn is null)
        {
            throw new BusinessRuleException("You must clock in before clocking out.");
        }

        if (attendance.ClockOut is not null)
        {
            throw new BusinessRuleException("You have already clocked out today.");
        }

        var now = DateTime.UtcNow;
        attendance.ClockOut = now;
        attendance.WorkedHours = Math.Round((decimal)(now - attendance.ClockIn.Value).TotalHours, 2);

        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            attendance.Notes = string.IsNullOrWhiteSpace(attendance.Notes)
                ? request.Notes
                : $"{attendance.Notes}; {request.Notes}";
        }

        _unitOfWork.Attendances.Update(attendance);
        await _unitOfWork.SaveChangesAsync(ct);

        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId, ct);
        return MapToDto(attendance, employee?.FullName ?? string.Empty);
    }

    public async Task<List<AttendanceDto>> GetHistoryAsync(Guid employeeId, DateTime? from, DateTime? to, CancellationToken ct = default)
    {
        var records = await _unitOfWork.Attendances.GetByEmployeeAsync(employeeId, from, to, ct);
        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId, ct);
        var name = employee?.FullName ?? string.Empty;

        return records.Select(r => MapToDto(r, name)).ToList();
    }

    public async Task<AttendanceReportDto> GetReportAsync(Guid employeeId, DateTime from, DateTime to, CancellationToken ct = default)
    {
        var records = await _unitOfWork.Attendances.GetByEmployeeAsync(employeeId, from, to, ct);
        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId, ct)
            ?? throw new NotFoundException(nameof(Employee), employeeId);

        return new AttendanceReportDto(
            employeeId,
            employee.FullName,
            records.Count,
            records.Count(r => r.Status == AttendanceStatus.Present),
            records.Count(r => r.Status == AttendanceStatus.Late),
            records.Count(r => r.Status == AttendanceStatus.Absent),
            records.Count(r => r.Status == AttendanceStatus.OnLeave),
            records.Sum(r => r.WorkedHours ?? 0)
        );
    }

    public async Task<AttendanceDto?> GetTodayAsync(Guid employeeId, CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        var record = await _unitOfWork.Attendances.GetByEmployeeAndDateAsync(employeeId, today, ct);
        if (record is null) return null;

        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId, ct);
        return MapToDto(record, employee?.FullName ?? string.Empty);
    }

    private static AttendanceDto MapToDto(Attendance a, string employeeName) => new(
        a.Id,
        a.EmployeeId,
        employeeName,
        a.Date,
        a.ClockIn,
        a.ClockOut,
        a.Status.ToString(),
        a.WorkedHours,
        a.Notes
    );
}
