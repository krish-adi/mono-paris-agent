import asyncio
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter
from uuid import uuid4
from server.settings import settings
from server.db.queries import query_create_user_request

from server.agents.complete import complete_agent

router = APIRouter()


@router.get("/")
def read_root():
    # Debug print to verify settings
    print(f"Using model: {settings.model}")
    print(f"API key set: {'Yes' if settings.anthropic_api_key else 'No'}")
    return {"Hello": "World"}


class RequestAgentRunRequest(BaseModel):
    job_title: str
    job_description: Optional[str] = None


class RequestAgentRunResponse(BaseModel):
    report_id: str


@router.post("/agent/request")
async def request_agent_run(request: RequestAgentRunRequest) -> RequestAgentRunResponse:
    """
    Request an agent run and return the report id to keep track of the request.
    """
    report_id = str(uuid4())
    _response_1 = await query_create_user_request(report_id, request.job_title)
    print(_response_1)
    asyncio.create_task(complete_agent(report_id, request.job_title, request.job_description))  # Run task in background
    return RequestAgentRunResponse(report_id=report_id)


@router.post("/test")
async def test_agent():
    print("\nTesting job analysis with research tools...")
    job_title = "Senior Software Engineer"
    job_description = """We are looking for a Senior Software Engineer to join our backend team. 
        The ideal candidate will have strong Python experience and will be responsible 
        for designing and implementing scalable services."""

    report_id = str(uuid4())
    # TODO: return the report_id
    _response_1 = await query_create_user_request(report_id, job_title)
    print(_response_1)
    _response_2 = await complete_agent(report_id, job_title, job_description)
    print(_response_2)
    return {"report_id": report_id}