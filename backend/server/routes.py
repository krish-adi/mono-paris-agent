from typing import Dict, List
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def read_root():
    return {"Hello": "World"}


@router.post("/agent/job-description")
def build_complete_job_description(job_title: str):
    """
    Runs an agent that takes a job title as input and generates a complete job description,
    including tasks, required skills, and responsibilities. The agent analyzes the job title
    to create a comprehensive breakdown of the role's requirements and expectations.
    """
    _request = {
        "job_title": job_title,
    }

    _response = {
        "job_title": job_title,
        "job_description": "This is a job description",
        "job_requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
        "job_skills": ["Skill 1", "Skill 2", "Skill 3"],
        "job_responsibilities": [
            "Responsibility 1",
            "Responsibility 2",
            "Responsibility 3",
        ],
        "job_tasks": ["Task 1", "Task 2", "Task 3"],
    }
    return _response


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
