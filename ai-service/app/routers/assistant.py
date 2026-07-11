from fastapi import APIRouter, Depends

from app.core.security import verify_internal_api_key
from app.schemas.assistant import AssistantRequest, AssistantResponse
from app.services.openai_service import ask_assistant

router = APIRouter(prefix="/api/v1/assistant", tags=["AI Assistant"])


@router.post(
    "/ask",
    response_model=AssistantResponse,
    dependencies=[Depends(verify_internal_api_key)],
    summary="Ask the AI HR Assistant a question, grounded in the employee's own HR data.",
)
async def ask(request: AssistantRequest) -> AssistantResponse:
    answer = await ask_assistant(request)
    return AssistantResponse(answer=answer)
