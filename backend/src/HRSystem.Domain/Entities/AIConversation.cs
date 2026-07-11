namespace HRSystem.Domain.Entities;

/// <summary>
/// Stores a single Q&A exchange with the AI HR Assistant for history/audit purposes.
/// </summary>
public class AIConversation : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;

    // Navigation
    public Employee? Employee { get; set; }
}
