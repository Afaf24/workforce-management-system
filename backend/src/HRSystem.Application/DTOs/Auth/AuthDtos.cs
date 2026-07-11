namespace HRSystem.Application.DTOs.Auth;

public record LoginRequestDto(string Email, string Password);

public record LoginResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserInfoDto User
);

public record RefreshTokenRequestDto(string RefreshToken);

public record UserInfoDto(
    Guid Id,
    string Email,
    string Role,
    Guid EmployeeId,
    string FullName
);

public record ChangePasswordRequestDto(string CurrentPassword, string NewPassword);
