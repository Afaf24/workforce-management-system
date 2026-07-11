using HRSystem.Application.DTOs.AI;
using HRSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRSystem.API.Controllers;

[ApiController]
[Route("api/v1/ai-assistant")]
[Authorize]
public class AIAssistantController : ControllerBase
{
    private readonly IAIAssistantService _aiAssistantService;
    private readonly ICurrentUserService _currentUserService;

    public AIAssistantController(IAIAssistantService aiAssistantService, ICurrentUserService currentUserService)
    {
        _aiAssistantService = aiAssistantService;
        _currentUserService = currentUserService;
    }

    /// <summary>Ask the AI HR Assistant a question. Grounded with the employee's own leave/attendance data.</summary>
    [HttpPost("ask")]
    public async Task<ActionResult<AskAssistantResponseDto>> Ask([FromBody] AskAssistantRequestDto request, CancellationToken ct)
    {
        var result = await _aiAssistantService.AskAsync(_currentUserService.EmployeeId!.Value, request, ct);
        return Ok(result);
    }

    /// <summary>Get the current employee's recent AI conversation history.</summary>
    [HttpGet("history")]
    public async Task<ActionResult<List<ConversationHistoryDto>>> GetHistory([FromQuery] int take = 20, CancellationToken ct = default)
    {
        var result = await _aiAssistantService.GetHistoryAsync(_currentUserService.EmployeeId!.Value, take, ct);
        return Ok(result);
    }
}
