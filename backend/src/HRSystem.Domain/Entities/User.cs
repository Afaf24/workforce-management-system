using HRSystem.Domain.Enums;

namespace HRSystem.Domain.Entities;

/// <summary>
/// Represents an authenticated identity. Each User has exactly one Employee profile.
/// </summary>
public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Employee;
    public bool IsActive { get; set; } = true;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }

    // Navigation
    public Employee? Employee { get; set; }
}
