using HRSystem.Domain.Interfaces;
using HRSystem.Infrastructure.Persistence.Repositories;

namespace HRSystem.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    private readonly HRSystemDbContext _context;

    private IUserRepository? _users;
    private IEmployeeRepository? _employees;
    private IDepartmentRepository? _departments;
    private IAttendanceRepository? _attendances;
    private ILeaveRequestRepository? _leaveRequests;
    private ILeaveBalanceRepository? _leaveBalances;
    private IAIConversationRepository? _aiConversations;

    public UnitOfWork(HRSystemDbContext context)
    {
        _context = context;
    }

    public IUserRepository Users => _users ??= new UserRepository(_context);
    public IEmployeeRepository Employees => _employees ??= new EmployeeRepository(_context);
    public IDepartmentRepository Departments => _departments ??= new DepartmentRepository(_context);
    public IAttendanceRepository Attendances => _attendances ??= new AttendanceRepository(_context);
    public ILeaveRequestRepository LeaveRequests => _leaveRequests ??= new LeaveRequestRepository(_context);
    public ILeaveBalanceRepository LeaveBalances => _leaveBalances ??= new LeaveBalanceRepository(_context);
    public IAIConversationRepository AIConversations => _aiConversations ??= new AIConversationRepository(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}
