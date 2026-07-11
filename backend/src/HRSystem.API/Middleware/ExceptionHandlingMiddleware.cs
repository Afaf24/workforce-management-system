using HRSystem.Domain.Exceptions;
using System.Net;
using System.Text.Json;
using ValidationException = HRSystem.Application.Common.Exceptions.ValidationException;

namespace HRSystem.API.Middleware;

/// <summary>
/// Translates domain/application exceptions into consistent JSON error responses,
/// so controllers never need try/catch boilerplate for known failure modes.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        object responseBody;

        switch (exception)
        {
            case ValidationException validationEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                responseBody = new { title = "Validation failed", status = 400, errors = validationEx.Errors };
                break;

            case NotFoundException notFoundEx:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                responseBody = new { title = "Not found", status = 404, detail = notFoundEx.Message };
                break;

            case BusinessRuleException businessEx:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                responseBody = new { title = "Business rule violation", status = 400, detail = businessEx.Message };
                break;

            case ForbiddenAccessException forbiddenEx:
                context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                responseBody = new { title = "Forbidden", status = 403, detail = forbiddenEx.Message };
                break;

            default:
                _logger.LogError(exception, "Unhandled exception occurred.");
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                responseBody = new { title = "An unexpected error occurred", status = 500 };
                break;
        }

        var json = JsonSerializer.Serialize(responseBody, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        await context.Response.WriteAsync(json);
    }
}
