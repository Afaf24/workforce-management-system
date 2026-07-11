using FluentValidation;
using HRSystem.Application.Interfaces;
using HRSystem.Application.Services;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace HRSystem.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IDepartmentService, DepartmentService>();
        services.AddScoped<IAttendanceService, AttendanceService>();
        services.AddScoped<ILeaveService, LeaveService>();
        services.AddScoped<IAIAssistantService, AIAssistantService>();

        return services;
    }
}
