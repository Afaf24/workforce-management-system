using HRSystem.Application.DTOs.AI;
using HRSystem.Application.DTOs.Attendance;
using HRSystem.Application.DTOs.Auth;
using HRSystem.Application.DTOs.Department;
using HRSystem.Application.DTOs.Employee;
using HRSystem.Application.DTOs.Leave;

namespace HRSystem.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken ct = default);
    Task<LoginResponseDto> RefreshTokenAsync(string refreshToken, CancellationToken ct = default);
    Task RevokeRefreshTokenAsync(Guid userId, CancellationToken ct = default);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequestDto request, CancellationToken ct = default);
}

public interface ICurrentUserService
{
    Guid? UserId { get; }
    Guid? EmployeeId { get; }
    string? Role { get; }
    string? Email { get; }
}

public interface IEmployeeService
{
    Task<EmployeeDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<EmployeeDto> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<List<EmployeeSummaryDto>> SearchAsync(string? searchTerm, Guid? departmentId, CancellationToken ct = default);
    Task<EmployeeDto> CreateAsync(CreateEmployeeRequestDto request, CancellationToken ct = default);
    Task<EmployeeDto> UpdateAsync(Guid id, UpdateEmployeeRequestDto request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}

public interface IDepartmentService
{
    Task<List<DepartmentDto>> GetAllAsync(CancellationToken ct = default);
    Task<DepartmentDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<DepartmentDto> CreateAsync(CreateDepartmentRequestDto request, CancellationToken ct = default);
    Task<DepartmentDto> UpdateAsync(Guid id, UpdateDepartmentRequestDto request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}

public interface IAttendanceService
{
    Task<AttendanceDto> ClockInAsync(Guid employeeId, ClockInRequestDto request, CancellationToken ct = default);
    Task<AttendanceDto> ClockOutAsync(Guid employeeId, ClockOutRequestDto request, CancellationToken ct = default);
    Task<List<AttendanceDto>> GetHistoryAsync(Guid employeeId, DateTime? from, DateTime? to, CancellationToken ct = default);
    Task<AttendanceReportDto> GetReportAsync(Guid employeeId, DateTime from, DateTime to, CancellationToken ct = default);
    Task<AttendanceDto?> GetTodayAsync(Guid employeeId, CancellationToken ct = default);
}

public interface ILeaveService
{
    Task<LeaveRequestDto> SubmitRequestAsync(Guid employeeId, CreateLeaveRequestDto request, CancellationToken ct = default);
    Task<LeaveRequestDto> ReviewRequestAsync(Guid requestId, Guid reviewerId, ReviewLeaveRequestDto review, CancellationToken ct = default);
    Task<List<LeaveRequestDto>> GetHistoryAsync(Guid employeeId, CancellationToken ct = default);
    Task<List<LeaveRequestDto>> GetPendingForManagerAsync(Guid managerId, CancellationToken ct = default);
    Task<List<LeaveBalanceDto>> GetBalancesAsync(Guid employeeId, int year, CancellationToken ct = default);
}

/// <summary>
/// Faces the Python FastAPI AI microservice. Implementations live in Infrastructure
/// since they involve an outbound HTTP call (an external concern).
/// </summary>
public interface IAIAssistantClient
{
    Task<string> AskAsync(AIAssistantContextDto context, CancellationToken ct = default);
}

public interface IAIAssistantService
{
    Task<AskAssistantResponseDto> AskAsync(Guid employeeId, AskAssistantRequestDto request, CancellationToken ct = default);
    Task<List<ConversationHistoryDto>> GetHistoryAsync(Guid employeeId, int take, CancellationToken ct = default);
}

public interface IJwtTokenGenerator
{
    (string token, DateTime expiresAt) GenerateAccessToken(Guid userId, string email, string role, Guid employeeId);
    string GenerateRefreshToken();
}

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}
