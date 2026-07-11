using HRSystem.Domain.Entities;
using HRSystem.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.Infrastructure.Persistence.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(HRSystemDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet.SingleOrDefaultAsync(u => u.Email == email, cancellationToken);
    }
}

public class EmployeeRepository : Repository<Employee>, IEmployeeRepository
{
    public EmployeeRepository(HRSystemDbContext context) : base(context) { }

    public async Task<Employee?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(e => e.Department)
            .Include(e => e.Manager)
            .Include(e => e.User)
            .SingleOrDefaultAsync(e => e.UserId == userId, cancellationToken);
    }

    public async Task<Employee?> GetWithDetailsAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(e => e.Department)
            .Include(e => e.Manager)
            .Include(e => e.User)
            .SingleOrDefaultAsync(e => e.Id == employeeId, cancellationToken);
    }

    public async Task<List<Employee>> SearchAsync(string? searchTerm, Guid? departmentId, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Include(e => e.Department).AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.Trim().ToLower();
            query = query.Where(e =>
                e.FirstName.ToLower().Contains(term) ||
                e.LastName.ToLower().Contains(term) ||
                e.EmployeeCode.ToLower().Contains(term) ||
                e.JobTitle.ToLower().Contains(term));
        }

        if (departmentId.HasValue)
        {
            query = query.Where(e => e.DepartmentId == departmentId.Value);
        }

        return await query.OrderBy(e => e.FirstName).ToListAsync(cancellationToken);
    }

    public async Task<bool> EmployeeCodeExistsAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet.AnyAsync(e => e.EmployeeCode == code, cancellationToken);
    }
}

public class DepartmentRepository : Repository<Department>, IDepartmentRepository
{
    public DepartmentRepository(HRSystemDbContext context) : base(context) { }

    public override async Task<List<Department>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.Manager)
            .Include(d => d.Employees)
            .ToListAsync(cancellationToken);
    }

    public override async Task<Department?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(d => d.Manager)
            .Include(d => d.Employees)
            .SingleOrDefaultAsync(d => d.Id == id, cancellationToken);
    }
}

public class AttendanceRepository : Repository<Attendance>, IAttendanceRepository
{
    public AttendanceRepository(HRSystemDbContext context) : base(context) { }

    public async Task<Attendance?> GetByEmployeeAndDateAsync(Guid employeeId, DateTime date, CancellationToken cancellationToken = default)
    {
        return await DbSet.SingleOrDefaultAsync(a => a.EmployeeId == employeeId && a.Date == date.Date, cancellationToken);
    }

    public async Task<List<Attendance>> GetByEmployeeAsync(Guid employeeId, DateTime? from, DateTime? to, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(a => a.EmployeeId == employeeId);

        if (from.HasValue) query = query.Where(a => a.Date >= from.Value.Date);
        if (to.HasValue) query = query.Where(a => a.Date <= to.Value.Date);

        return await query.OrderByDescending(a => a.Date).ToListAsync(cancellationToken);
    }
}

public class LeaveRequestRepository : Repository<LeaveRequest>, ILeaveRequestRepository
{
    public LeaveRequestRepository(HRSystemDbContext context) : base(context) { }

    public async Task<List<LeaveRequest>> GetByEmployeeAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(l => l.EmployeeId == employeeId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<LeaveRequest>> GetPendingForManagerAsync(Guid managerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(l => l.Employee)
            .Where(l => l.Status == Domain.Enums.LeaveStatus.Pending && l.Employee!.ManagerId == managerId)
            .OrderBy(l => l.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}

public class LeaveBalanceRepository : Repository<LeaveBalance>, ILeaveBalanceRepository
{
    public LeaveBalanceRepository(HRSystemDbContext context) : base(context) { }

    public async Task<List<LeaveBalance>> GetByEmployeeAndYearAsync(Guid employeeId, int year, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(l => l.EmployeeId == employeeId && l.Year == year)
            .ToListAsync(cancellationToken);
    }
}

public class AIConversationRepository : Repository<AIConversation>, IAIConversationRepository
{
    public AIConversationRepository(HRSystemDbContext context) : base(context) { }
}
