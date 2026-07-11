using HRSystem.Application.DTOs.Leave;
using HRSystem.Application.Interfaces;
using HRSystem.Domain.Entities;
using HRSystem.Domain.Enums;
using HRSystem.Domain.Exceptions;
using HRSystem.Domain.Interfaces;

namespace HRSystem.Application.Services;

public class LeaveService : ILeaveService
{
    private readonly IUnitOfWork _unitOfWork;

    public LeaveService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<LeaveRequestDto> SubmitRequestAsync(Guid employeeId, CreateLeaveRequestDto request, CancellationToken ct = default)
    {
        if (!Enum.TryParse<LeaveType>(request.LeaveType, ignoreCase: true, out var leaveType))
        {
            throw new BusinessRuleException($"Invalid leave type '{request.LeaveType}'.");
        }

        if (request.EndDate < request.StartDate)
        {
            throw new BusinessRuleException("End date cannot be before start date.");
        }

        var totalDays = (decimal)(request.EndDate.Date - request.StartDate.Date).TotalDays + 1;
        var year = request.StartDate.Year;

        var balances = await _unitOfWork.LeaveBalances.GetByEmployeeAndYearAsync(employeeId, year, ct);
        var balance = balances.FirstOrDefault(b => b.LeaveType == leaveType);

        if (balance is not null && leaveType != LeaveType.Unpaid && balance.Remaining < totalDays)
        {
            throw new BusinessRuleException(
                $"Insufficient {leaveType} leave balance. Remaining: {balance.Remaining} day(s), requested: {totalDays} day(s).");
        }

        var leaveRequest = new LeaveRequest
        {
            EmployeeId = employeeId,
            LeaveType = leaveType,
            StartDate = request.StartDate.Date,
            EndDate = request.EndDate.Date,
            TotalDays = totalDays,
            Reason = request.Reason,
            Status = LeaveStatus.Pending
        };

        await _unitOfWork.LeaveRequests.AddAsync(leaveRequest, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId, ct);
        return MapToDto(leaveRequest, employee?.FullName ?? string.Empty, null);
    }

    public async Task<LeaveRequestDto> ReviewRequestAsync(Guid requestId, Guid reviewerId, ReviewLeaveRequestDto review, CancellationToken ct = default)
    {
        var leaveRequest = await _unitOfWork.LeaveRequests.GetByIdAsync(requestId, ct)
            ?? throw new NotFoundException(nameof(LeaveRequest), requestId);

        if (leaveRequest.Status != LeaveStatus.Pending)
        {
            throw new BusinessRuleException("Only pending leave requests can be reviewed.");
        }

        leaveRequest.Status = review.Approve ? LeaveStatus.Approved : LeaveStatus.Rejected;
        leaveRequest.ReviewedById = reviewerId;
        leaveRequest.ReviewedAt = DateTime.UtcNow;
        leaveRequest.ReviewComment = review.Comment;

        if (review.Approve)
        {
            var year = leaveRequest.StartDate.Year;
            var balances = await _unitOfWork.LeaveBalances.GetByEmployeeAndYearAsync(leaveRequest.EmployeeId, year, ct);
            var balance = balances.FirstOrDefault(b => b.LeaveType == leaveRequest.LeaveType);

            if (balance is not null)
            {
                balance.Used += leaveRequest.TotalDays;
                balance.Remaining = balance.TotalAllotted - balance.Used;
                _unitOfWork.LeaveBalances.Update(balance);
            }
        }

        _unitOfWork.LeaveRequests.Update(leaveRequest);
        await _unitOfWork.SaveChangesAsync(ct);

        var employee = await _unitOfWork.Employees.GetByIdAsync(leaveRequest.EmployeeId, ct);
        var reviewer = await _unitOfWork.Employees.GetByIdAsync(reviewerId, ct);

        return MapToDto(leaveRequest, employee?.FullName ?? string.Empty, reviewer?.FullName);
    }

    public async Task<List<LeaveRequestDto>> GetHistoryAsync(Guid employeeId, CancellationToken ct = default)
    {
        var requests = await _unitOfWork.LeaveRequests.GetByEmployeeAsync(employeeId, ct);
        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeId, ct);
        var name = employee?.FullName ?? string.Empty;

        var result = new List<LeaveRequestDto>();
        foreach (var r in requests)
        {
            string? reviewerName = null;
            if (r.ReviewedById is not null)
            {
                var reviewer = await _unitOfWork.Employees.GetByIdAsync(r.ReviewedById.Value, ct);
                reviewerName = reviewer?.FullName;
            }
            result.Add(MapToDto(r, name, reviewerName));
        }

        return result;
    }

    public async Task<List<LeaveRequestDto>> GetPendingForManagerAsync(Guid managerId, CancellationToken ct = default)
    {
        var requests = await _unitOfWork.LeaveRequests.GetPendingForManagerAsync(managerId, ct);

        var result = new List<LeaveRequestDto>();
        foreach (var r in requests)
        {
            var employee = await _unitOfWork.Employees.GetByIdAsync(r.EmployeeId, ct);
            result.Add(MapToDto(r, employee?.FullName ?? string.Empty, null));
        }

        return result;
    }

    public async Task<List<LeaveBalanceDto>> GetBalancesAsync(Guid employeeId, int year, CancellationToken ct = default)
    {
        var balances = await _unitOfWork.LeaveBalances.GetByEmployeeAndYearAsync(employeeId, year, ct);

        return balances.Select(b => new LeaveBalanceDto(
            b.Id, b.LeaveType.ToString(), b.Year, b.TotalAllotted, b.Used, b.Remaining
        )).ToList();
    }

    private static LeaveRequestDto MapToDto(LeaveRequest r, string employeeName, string? reviewerName) => new(
        r.Id,
        r.EmployeeId,
        employeeName,
        r.LeaveType.ToString(),
        r.StartDate,
        r.EndDate,
        r.TotalDays,
        r.Reason,
        r.Status.ToString(),
        r.ReviewedById,
        reviewerName,
        r.ReviewedAt,
        r.ReviewComment,
        r.CreatedAt
    );
}
