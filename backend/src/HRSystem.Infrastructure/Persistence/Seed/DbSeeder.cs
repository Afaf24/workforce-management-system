using HRSystem.Domain.Entities;
using HRSystem.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HRSystem.Infrastructure.Persistence.Seed;

/// <summary>
/// Seeds demo data on startup in Development environment only. Idempotent:
/// safe to run multiple times since it checks for existing data first.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(HRSystemDbContext context)
    {
        await context.Database.MigrateAsync();

        if (await context.Departments.AnyAsync()) return; // already seeded

        var hrDept = new Department { Name = "Human Resources", Description = "Handles HR operations" };
        var engDept = new Department { Name = "Engineering", Description = "Software development" };
        var financeDept = new Department { Name = "Finance", Description = "Accounting and finance" };

        context.Departments.AddRange(hrDept, engDept, financeDept);
        await context.SaveChangesAsync();

        var hasher = new HRSystem.Infrastructure.Identity.PasswordHasher();

        var hrUser = new User { Email = "hr.manager@company.com", PasswordHash = hasher.Hash("Passw0rd!"), Role = UserRole.HRManager };
        var mgrUser = new User { Email = "dept.manager@company.com", PasswordHash = hasher.Hash("Passw0rd!"), Role = UserRole.DepartmentManager };
        var empUser = new User { Email = "employee@company.com", PasswordHash = hasher.Hash("Passw0rd!"), Role = UserRole.Employee };

        context.Users.AddRange(hrUser, mgrUser, empUser);
        await context.SaveChangesAsync();

        var hrEmployee = new Employee
        {
            UserId = hrUser.Id, EmployeeCode = "EMP001", FirstName = "Sara", LastName = "Ahmed",
            JobTitle = "HR Manager", DepartmentId = hrDept.Id, HireDate = DateTime.SpecifyKind(new DateTime(2022, 1, 10), DateTimeKind.Utc)
        };
        var mgrEmployee = new Employee
        {
            UserId = mgrUser.Id, EmployeeCode = "EMP002", FirstName = "Omar", LastName = "Khalil",
            JobTitle = "Engineering Manager", DepartmentId = engDept.Id, HireDate = DateTime.SpecifyKind(new DateTime(2021, 3, 15), DateTimeKind.Utc)
        };

        context.Employees.AddRange(hrEmployee, mgrEmployee);
        await context.SaveChangesAsync();

        var empEmployee = new Employee
        {
            UserId = empUser.Id, EmployeeCode = "EMP003", FirstName = "Layla", LastName = "Hassan",
            JobTitle = "Software Engineer", DepartmentId = engDept.Id, ManagerId = mgrEmployee.Id,
            HireDate = DateTime.SpecifyKind(new DateTime(2023, 6, 1), DateTimeKind.Utc)
        };
        context.Employees.Add(empEmployee);

        engDept.ManagerId = mgrEmployee.Id;

        await context.SaveChangesAsync();

        var currentYear = DateTime.UtcNow.Year;
        context.LeaveBalances.AddRange(
            new LeaveBalance { EmployeeId = empEmployee.Id, LeaveType = LeaveType.Annual, Year = currentYear, TotalAllotted = 21, Used = 3, Remaining = 18 },
            new LeaveBalance { EmployeeId = empEmployee.Id, LeaveType = LeaveType.Sick, Year = currentYear, TotalAllotted = 10, Used = 1, Remaining = 9 },
            new LeaveBalance { EmployeeId = mgrEmployee.Id, LeaveType = LeaveType.Annual, Year = currentYear, TotalAllotted = 21, Used = 0, Remaining = 21 },
            new LeaveBalance { EmployeeId = mgrEmployee.Id, LeaveType = LeaveType.Sick, Year = currentYear, TotalAllotted = 10, Used = 0, Remaining = 10 },
            new LeaveBalance { EmployeeId = hrEmployee.Id, LeaveType = LeaveType.Annual, Year = currentYear, TotalAllotted = 21, Used = 0, Remaining = 21 },
            new LeaveBalance { EmployeeId = hrEmployee.Id, LeaveType = LeaveType.Sick, Year = currentYear, TotalAllotted = 10, Used = 0, Remaining = 10 }
        );

        await context.SaveChangesAsync();
    }
}