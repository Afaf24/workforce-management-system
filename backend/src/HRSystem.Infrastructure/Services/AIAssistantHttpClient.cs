using HRSystem.Application.DTOs.AI;
using HRSystem.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;
using System.Text.Json;

namespace HRSystem.Infrastructure.Services;

/// <summary>
/// Talks to the Python FastAPI AI microservice over HTTP. Configured via
/// HttpClient (named "AIService") with BaseAddress set from appsettings.
/// </summary>
public class AIAssistantHttpClient : IAIAssistantClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AIAssistantHttpClient> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public AIAssistantHttpClient(HttpClient httpClient, ILogger<AIAssistantHttpClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<string> AskAsync(AIAssistantContextDto context, CancellationToken ct = default)
    {
        try
        {
            var payload = new
            {
                question = context.Question,
                employee_name = context.EmployeeName,
                job_title = context.JobTitle,
                department_name = context.DepartmentName,
                leave_balances = context.LeaveBalances.Select(b => new
                {
                    leave_type = b.LeaveType,
                    total_allotted = b.TotalAllotted,
                    used = b.Used,
                    remaining = b.Remaining
                }),
                attendance_summary = new
                {
                    present_days_this_month = context.AttendanceSummary.PresentDaysThisMonth,
                    late_days_this_month = context.AttendanceSummary.LateDaysThisMonth,
                    absent_days_this_month = context.AttendanceSummary.AbsentDaysThisMonth
                }
            };

            var response = await _httpClient.PostAsJsonAsync("/api/v1/assistant/ask", payload, ct);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<AIServiceResponse>(JsonOptions, ct);
            return result?.Answer ?? "I'm sorry, I couldn't generate a response right now.";
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to reach AI microservice.");
            return "The AI Assistant is currently unavailable. Please try again later.";
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "AI microservice request timed out.");
            return "The AI Assistant took too long to respond. Please try again.";
        }
    }

    private sealed class AIServiceResponse
    {
        public string Answer { get; set; } = string.Empty;
    }
}
