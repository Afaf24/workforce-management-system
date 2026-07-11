using HRSystem.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace HRSystem.Infrastructure.Identity;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public Guid? UserId
    {
        get
        {
            var value = User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }

    public Guid? EmployeeId
    {
        get
        {
            var value = User?.FindFirstValue("employeeId");
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }

    public string? Role => User?.FindFirstValue(ClaimTypes.Role);

    public string? Email => User?.FindFirstValue(ClaimTypes.Email);
}
