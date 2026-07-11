using HRSystem.Application.Interfaces;
using HRSystem.Domain.Interfaces;
using HRSystem.Infrastructure.Identity;
using HRSystem.Infrastructure.Persistence;
using HRSystem.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;


namespace HRSystem.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<HRSystemDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddSingleton<IPasswordHasher, PasswordHasher>();

        var aiServiceBaseUrl = configuration["AIService:BaseUrl"] ?? "http://localhost:8000";
        var aiServiceApiKey = configuration["AIService:InternalApiKey"] ?? "CHANGE_THIS_SHARED_SECRET";
        services.AddHttpClient<IAIAssistantClient, AIAssistantHttpClient>(client =>
        {
            client.BaseAddress = new Uri(aiServiceBaseUrl);
            client.Timeout = TimeSpan.FromSeconds(30);
            client.DefaultRequestHeaders.Add("X-Internal-Api-Key", aiServiceApiKey);
        });

        return services;
    }
}
