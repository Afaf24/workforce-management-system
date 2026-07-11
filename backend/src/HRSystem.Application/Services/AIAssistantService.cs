using HRSystem.Application.DTOs.AI;
using HRSystem.Application.Interfaces;
using HRSystem.Domain.Entities;
using HRSystem.Domain.Enums;
using HRSystem.Domain.Exceptions;
using HRSystem.Domain.Interfaces;

namespace HRSystem.Application.Services;

/// <summary>
/// Orchestrates the AI HR Assistant flow: gathers grounding context (leave balances,
/// attendance summary) from the database, sends it to the Python AI microservice,
/// and persists the Q&A for history. This keeps prompt construction and grounding
/// logic in .NET, while the actual LLM call lives in the AI microservice.
/// </summary>
public class AIAssistantService : IAIAssistantService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IAIAssistantClient _aiClient;

    public AIAssistantService(IUnitOfWork unitOfWork, IAIAssistantClient aiClient)
    {
        _unitOfWork = unitOfWork;
        _aiClient = aiClient;
    }

    public async Task<AskAssistantResponseDto> AskAsync(Guid employeeId, AskAssistantRequestDto request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Question))
        {
            throw new BusinessRuleException("Question cannot be empty.");
        }

        var employee = await _unitOfWork.Employees.GetWithDetailsAsync(employeeId, ct)
            ?? throw new NotFoundException(nameof(Employee), employeeId);

        var currentYear = DateTime.UtcNow.Year;
        var balances = await _unitOfWork.LeaveBalances.GetByEmployeeAndYearAsync(employeeId, currentYear, ct);

        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var attendanceThisMonth = await _unitOfWork.Attendances.GetByEmployeeAsync(employeeId, monthStart, DateTime.UtcNow, ct);

        var context = new AIAssistantContextDto(
            request.Question,
            employee.FullName,
            employee.JobTitle,
            employee.Department?.Name ?? string.Empty,
            balances.Select(b => new LeaveBalanceContextDto(b.LeaveType.ToString(), b.TotalAllotted, b.Used, b.Remaining)).ToList(),
            new AttendanceSummaryContextDto(
                attendanceThisMonth.Count(a => a.Status == AttendanceStatus.Present),
                attendanceThisMonth.Count(a => a.Status == AttendanceStatus.Late),
                attendanceThisMonth.Count(a => a.Status == AttendanceStatus.Absent)
            )
        );

        var answer = await _aiClient.AskAsync(context, ct);

        var conversation = new AIConversation
        {
            EmployeeId = employeeId,
            Question = request.Question,
            Answer = answer
        };
        await _unitOfWork.AIConversations.AddAsync(conversation, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return new AskAssistantResponseDto(answer, conversation.CreatedAt);
    }

    public async Task<List<ConversationHistoryDto>> GetHistoryAsync(Guid employeeId, int take, CancellationToken ct = default)
    {
        var conversations = await _unitOfWork.AIConversations.FindAsync(c => c.EmployeeId == employeeId, ct);

        return conversations
            .OrderByDescending(c => c.CreatedAt)
            .Take(take)
            .Select(c => new ConversationHistoryDto(c.Id, c.Question, c.Answer, c.CreatedAt))
            .ToList();
    }
}
