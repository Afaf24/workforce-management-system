using HRSystem.Application.DTOs.Auth;
using HRSystem.Application.Interfaces;
using HRSystem.Domain.Exceptions;
using HRSystem.Domain.Interfaces;

namespace HRSystem.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _tokenGenerator;
    private const int RefreshTokenExpiryDays = 7;

    public AuthService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, IJwtTokenGenerator tokenGenerator)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email, ct);

        if (user is null || !user.IsActive || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            // Intentionally generic message: never reveal whether the email exists.
            throw new BusinessRuleException("Invalid email or password.");
        }

        var employee = await _unitOfWork.Employees.GetByUserIdAsync(user.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Employee), user.Id);

        var (accessToken, expiresAt) = _tokenGenerator.GenerateAccessToken(user.Id, user.Email, user.Role.ToString(), employee.Id);
        var refreshToken = _tokenGenerator.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(RefreshTokenExpiryDays);
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);

        return new LoginResponseDto(
            accessToken,
            refreshToken,
            expiresAt,
            new UserInfoDto(user.Id, user.Email, user.Role.ToString(), employee.Id, employee.FullName)
        );
    }

    public async Task<LoginResponseDto> RefreshTokenAsync(string refreshToken, CancellationToken ct = default)
    {
        var users = await _unitOfWork.Users.FindAsync(u => u.RefreshToken == refreshToken, ct);
        var user = users.SingleOrDefault();

        if (user is null || user.RefreshTokenExpiryTime is null || user.RefreshTokenExpiryTime < DateTime.UtcNow)
        {
            throw new BusinessRuleException("Invalid or expired refresh token.");
        }

        var employee = await _unitOfWork.Employees.GetByUserIdAsync(user.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Employee), user.Id);

        var (accessToken, expiresAt) = _tokenGenerator.GenerateAccessToken(user.Id, user.Email, user.Role.ToString(), employee.Id);
        var newRefreshToken = _tokenGenerator.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(RefreshTokenExpiryDays);
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);

        return new LoginResponseDto(
            accessToken,
            newRefreshToken,
            expiresAt,
            new UserInfoDto(user.Id, user.Email, user.Role.ToString(), employee.Id, employee.FullName)
        );
    }

    public async Task RevokeRefreshTokenAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), userId);

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequestDto request, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), userId);

        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new BusinessRuleException("Current password is incorrect.");
        }

        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(ct);
    }
}
