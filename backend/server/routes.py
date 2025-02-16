from typing import Dict, List, Optional
from fastapi import APIRouter
from uuid import uuid4
from server.agents import job_to_tasks
from server.settings import settings

router = APIRouter()


@router.get("/")
def read_root():
    # Debug print to verify settings
    print(f"Using model: {settings.model}")
    print(f"API key set: {'Yes' if settings.anthropic_api_key else 'No'}")
    return {"Hello": "World"}


@router.post("/agent/request")
def request_agent_run(job_title: str, job_description: Optional[str] = None):
    """
    Request an agent run and return the report id to keep track of the request.
    """
    report_id = uuid4()
    return {"report_id": report_id}


@router.post("/agent/job-description")
async def build_complete_job_description(
    job_title: str, job_description: Optional[str] = None
):
    """
    Runs an agent that takes a job title and optional job description as input and generates
    a complete job description, including tasks, required skills, and responsibilities.
    The agent analyzes the inputs to create a comprehensive breakdown of the role's
    requirements and expectations.
    """
    # If no description provided, create a default one
    if job_description is None:
        job_description = f"This is a {job_title} position that requires relevant experience and skills."
    else:
        # Combine title and description for better context
        job_description = f"{job_title}: {job_description}"

    # Use the job_to_tasks agent to generate the complete breakdown
    result = await job_to_tasks.job_to_tasks(job_title, job_description)

    # Convert TaskItem objects to dictionaries with model_dump() instead of dict()
    return {
        "job_title": result.job_title,
        "job_description": result.job_description,
        "job_requirements": result.job_requirements,
        "job_skills": result.job_skills,
        "job_responsibilities": result.job_responsibilities,
        "job_tasks": [task.model_dump() for task in result.job_tasks],
    }


@router.post("/agent/job-task-sub-tasks")
def build_job_task_sub_tasks(
    job_task: str,
    job_description: str,
    job_title: str,
    job_skills: list[str],
    job_responsibilities: list[str],
    job_requirements: list[str],
):
    """
    Runs an agent that takes a job task, job description, job title, job skills, job responsibilities,
    and job requirements as input and generates a list of sub-tasks that are part of the job task.
    """
    _request = {
        "job_title": job_title,
        "job_task": job_task,
        "job_description": job_description,
        "job_skills": job_skills,
        "job_responsibilities": job_responsibilities,
        "job_requirements": job_requirements,
    }

    _response = {
        "job_title": job_title,
        "job_task": job_task,
        "job_sub_tasks": ["Sub Task 1", "Sub Task 2", "Sub Task 3"],
    }
    return _response


@router.post("/agent/sub-task-with-agent")
def build_sub_task_with_agent(
    job_task_sub_task: str,
    job_task: str,
    job_description: str,
    job_title: str,
    job_skills: list[str],
    job_responsibilities: list[str],
    job_requirements: list[str],
):
    """
    Runs an agents that takes a job task sub-task, job task, job description, job title, job skills,
    job responsibilities, and job requirements as input and generates a system prompt for the job task sub-task.
    It also returns the automation index for the job task sub-task that can be performed by an agent.
    """
    _request = {
        "job_title": job_title,
        "job_task": job_task,
        "job_description": job_description,
        "job_skills": job_skills,
        "job_responsibilities": job_responsibilities,
        "job_requirements": job_requirements,
    }

    _response = {
        "job_title": job_title,
        "job_task": job_task,
        "job_task_sub_task": job_task_sub_task,
        "automation_index": 0.5,
        "system_prompt": "You are a helpful assistant that can help with the job task sub-task.",
    }
    return _response


@router.post("/agent/job-automation-index")
def build_job_automation_index(
    job_title: str,
    job_description: str,
    # List of sub-tasks for a job task, amount of time spent doing it, automation index, and system prompt
    job_task: List[Dict[str, str]],
    job_skills: list[str],
    job_responsibilities: list[str],
    job_requirements: list[str],
):
    """
    Runs an agent that takes a job title, job description, job task, job skills, job responsibilities,
    and job requirements as input and generates a list of automation indexes for the job task. And the over
    all automation index for the job task.
    """
    _request = {
        "job_title": job_title,
        "job_description": job_description,
        "job_task": job_task,
        "job_skills": job_skills,
        "job_responsibilities": job_responsibilities,
        "job_requirements": job_requirements,
    }

    _response = {
        "job_title": job_title,
        "complete_job_automation_index": 0.5,
    }
    return _response
