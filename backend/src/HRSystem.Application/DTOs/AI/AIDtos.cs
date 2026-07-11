namespace HRSystem.Application.DTOs.AI;

public record AskAssistantRequestDto(string Question);

public record AskAssistantResponseDto(string Answer, DateTime AnsweredAt);

public record ConversationHistoryDto(Guid Id, string Question, string Answer, DateTime CreatedAt);

/// <summary>
/// Payload sent to the Python FastAPI AI microservice. Carries structured
/// HR context so the AI service can ground its answer instead of hallucinating.
/// </summary>
public record AIAssistantContextDto(
    string Question,
    string EmployeeName,
    string JobTitle,
    string DepartmentName,
    List<LeaveBalanceContextDto> LeaveBalances,
    AttendanceSummaryContextDto AttendanceSummary
);

public record LeaveBalanceContextDto(string LeaveType, decimal TotalAllotted, decimal Used, decimal Remaining);

public record AttendanceSummaryContextDto(int PresentDaysThisMonth, int LateDaysThisMonth, int AbsentDaysThisMonth);
