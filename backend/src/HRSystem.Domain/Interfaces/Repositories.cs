using HRSystem.Domain.Entities;

namespace HRSystem.Domain.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
}

public interface IEmployeeRepository : IRepository<Employee>
{
    Task<Employee?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Employee?> GetWithDetailsAsync(Guid employeeId, CancellationToken cancellationToken = default);
    Task<List<Employee>> SearchAsync(string? searchTerm, Guid? departmentId, CancellationToken cancellationToken = default);
    Task<bool> EmployeeCodeExistsAsync(string code, CancellationToken cancellationToken = default);
}

public interface IDepartmentRepository : IRepository<Department> { }

public interface IAttendanceRepository : IRepository<Attendance>
{
    Task<Attendance?> GetByEmployeeAndDateAsync(Guid employeeId, DateTime date, CancellationToken cancellationToken = default);
    Task<List<Attendance>> GetByEmployeeAsync(Guid employeeId, DateTime? from, DateTime? to, CancellationToken cancellationToken = default);
}

public interface ILeaveRequestRepository : IRepository<LeaveRequest>
{
    Task<List<LeaveRequest>> GetByEmployeeAsync(Guid employeeId, CancellationToken cancellationToken = default);
    Task<List<LeaveRequest>> GetPendingForManagerAsync(Guid managerId, CancellationToken cancellationToken = default);
}

public interface ILeaveBalanceRepository : IRepository<LeaveBalance>
{
    Task<List<LeaveBalance>> GetByEmployeeAndYearAsync(Guid employeeId, int year, CancellationToken cancellationToken = default);
}

public interface IAIConversationRepository : IRepository<AIConversation> { }

/// <summary>
/// Unit of Work coordinates repositories and commits changes in a single transaction.
/// </summary>
public interface IUnitOfWork
{
    IUserRepository Users { get; }
    IEmployeeRepository Employees { get; }
    IDepartmentRepository Departments { get; }
    IAttendanceRepository Attendances { get; }
    ILeaveRequestRepository LeaveRequests { get; }
    ILeaveBalanceRepository LeaveBalances { get; }
    IAIConversationRepository AIConversations { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
