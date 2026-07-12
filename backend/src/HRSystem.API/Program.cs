using HRSystem.API.Middleware;
using HRSystem.Application;
using HRSystem.Infrastructure;
using HRSystem.Infrastructure.Persistence;
using HRSystem.Infrastructure.Persistence.Seed;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;


var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();

builder.Services.AddApplicationServices();

builder.Services.AddInfrastructureServices(builder.Configuration);


// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


// JWT
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new Exception("JWT Secret is missing");


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"]
            ?? "HRSystem.API",

        ValidateAudience = true,

        ValidAudience = builder.Configuration["Jwt:Audience"]
            ?? "HRSystem.Client",

        ValidateIssuerSigningKey = true,

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSecret)
        ),

        ValidateLifetime = true,

        ClockSkew = TimeSpan.FromMinutes(1)
    };
});


builder.Services.AddAuthorization();


builder.Services.AddEndpointsApiExplorer();


builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1",
        new OpenApiInfo
        {
            Title = "AI-Powered HR Management System API",
            Version = "v1"
        });


    options.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            Description =
            "Enter JWT token like: Bearer {token}",

            Name = "Authorization",

            In = ParameterLocation.Header,

            Type = SecuritySchemeType.Http,

            Scheme = "bearer",

            BearerFormat = "JWT"
        });


    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                    new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },

                Array.Empty<string>()
            }
        });
});


var app = builder.Build();



// Database migration + seed
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    try
    {
        var context = services.GetRequiredService<HRSystemDbContext>();

        context.Database.Migrate();

        await DbSeeder.SeedAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();

        logger.LogError(ex, 
            "Database setup failed");

        throw;
    }
}



app.UseSwagger();

app.UseSwaggerUI();


app.UseMiddleware<ExceptionHandlingMiddleware>();


// Render handles HTTPS
// app.UseHttpsRedirection();


app.UseCors("FrontendPolicy");


app.UseAuthentication();

app.UseAuthorization();


app.MapControllers();


app.Run();