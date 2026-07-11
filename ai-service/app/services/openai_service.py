"""
Service responsible for talking to the OpenAI API. Builds a grounded system
prompt from the employee context (leave balances, attendance summary, HR policy)
so the assistant answers using real data rather than hallucinating.
"""
import logging

from openai import AsyncOpenAI, APIError, APITimeoutError, RateLimitError

from app.core.config import get_settings
from app.schemas.assistant import AssistantRequest
from app.services.hr_policy import HR_POLICY_DOCUMENT

logger = logging.getLogger(__name__)

settings = get_settings()
client = AsyncOpenAI(api_key=settings.openai_api_key)

FALLBACK_MESSAGE = (
    "I'm sorry, I'm unable to answer right now. Please try again in a moment, "
    "or contact HR directly for urgent questions."
)


def _build_system_prompt(request: AssistantRequest) -> str:
    """Builds a grounded system prompt containing the employee's real data."""
    balances_text = "\n".join(
        f"  - {b.leave_type}: {b.remaining} day(s) remaining "
        f"(used {b.used} of {b.total_allotted})"
        for b in request.leave_balances
    ) or "  - No leave balance records found for the current year."

    attendance_text = (
        f"  - Present days this month: {request.attendance_summary.present_days_this_month}\n"
        f"  - Late days this month: {request.attendance_summary.late_days_this_month}\n"
        f"  - Absent days this month: {request.attendance_summary.absent_days_this_month}"
    )

    return f"""You are an AI HR Assistant for a company's internal HR Management System.
You are speaking with {request.employee_name}, who works as a {request.job_title}
in the {request.department_name} department.

You can answer questions about:
- Company HR policies (leave rules, attendance rules, working hours, code of conduct)
- This employee's own leave balances
- This employee's own attendance summary for the current month
- General HR support questions

Here is the official HR policy document:
---
{HR_POLICY_DOCUMENT}
---

Here is this employee's current leave balance data for this year:
{balances_text}

Here is this employee's attendance summary for the current month:
{attendance_text}

INSTRUCTIONS:
- Answer ONLY using the policy document and the employee data provided above.
- Be concise, friendly, and professional. Use plain language, not legal jargon.
- If asked about another employee's data, politely explain you can only discuss
  the current employee's own information.
- If the question is unrelated to HR topics, politely redirect the conversation
  back to HR matters.
- If you don't have enough information to answer accurately, say so honestly
  and suggest the employee contact HR directly.
- Keep answers under 150 words unless the question requires a longer explanation.
"""


async def ask_assistant(request: AssistantRequest) -> str:
    """Sends the grounded prompt + question to OpenAI and returns the answer text."""
    system_prompt = _build_system_prompt(request)

    try:
        completion = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.question},
            ],
            temperature=0.4,
            max_tokens=400,
        )
        answer = completion.choices[0].message.content
        return answer.strip() if answer else FALLBACK_MESSAGE

    except RateLimitError as exc:
        logger.error("OpenAI rate limit exceeded: %s", exc)
        return "The AI Assistant is currently busy. Please try again in a moment."

    except APITimeoutError as exc:
        logger.error("OpenAI request timed out: %s", exc)
        return "The AI Assistant took too long to respond. Please try again."

    except APIError as exc:
        logger.error("OpenAI API error: %s", exc)
        return FALLBACK_MESSAGE

    except Exception as exc:  # noqa: BLE001 - last-resort safety net for an external call
        logger.exception("Unexpected error calling OpenAI: %s", exc)
        return FALLBACK_MESSAGE
