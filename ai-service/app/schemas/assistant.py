"""
Request/response schemas for the AI Assistant endpoint.
Field names use snake_case to match the JSON payload sent by the .NET
AIAssistantHttpClient (see HRSystem.Infrastructure/Services/AIAssistantHttpClient.cs).
"""
from pydantic import BaseModel, Field


class LeaveBalanceContext(BaseModel):
    leave_type: str
    total_allotted: float
    used: float
    remaining: float


class AttendanceSummaryContext(BaseModel):
    present_days_this_month: int
    late_days_this_month: int
    absent_days_this_month: int


class AssistantRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)
    employee_name: str
    job_title: str
    department_name: str
    leave_balances: list[LeaveBalanceContext] = []
    attendance_summary: AttendanceSummaryContext


class AssistantResponse(BaseModel):
    answer: str


class HealthResponse(BaseModel):
    status: str
    service: str
