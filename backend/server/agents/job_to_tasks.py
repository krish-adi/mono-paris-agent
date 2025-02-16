from pydantic import BaseModel
from pydantic_ai import Agent
from typing import List

from server.settings import settings

class TaskItem(BaseModel):
    task: str
    description: str
    timePercentage: float

class JobTasks(BaseModel):
    tasks: List[TaskItem]

class JobSkillsAndTasks(BaseModel):
    job_title: str
    job_description: str
    job_requirements: List[str]
    job_skills: List[str]
    job_responsibilities: List[str]
    job_tasks: List[TaskItem]

JOB_TO_TASKS_PROMPT = """Given a job title and job description, analyze and break down the role into its key components.

You will receive input in the format:
{job_title}
{job_description}

Please provide a JSON object with the following structure:
{
    "job_title": string,
    "job_description": string,
    "job_requirements": string[],
    "job_skills": string[],
    "job_responsibilities": string[],
    "job_tasks": [
        {
            "task": string,
            "description": string,
            "timePercentage": float
        }
    ]
}

Format the response as valid JSON only, with no additional text.

Example output:
{
    "job_title": "Software Engineer",
    "job_description": "Backend developer position focusing on Python",
    "job_requirements": ["Bachelor's degree in CS", "3+ years experience", "Python expertise"],
    "job_skills": ["Python", "SQL", "Git", "API Development"],
    "job_responsibilities": ["Develop backend services", "Maintain existing codebase", "Review code"],
    "job_tasks": [
        {
            "task": "Write code",
            "description": "Implement new features and functionality in Python",
            "timePercentage": 40.0
        },
        {
            "task": "Code review",
            "description": "Review pull requests and provide feedback to team members",
            "timePercentage": 20.0
        },
        {
            "task": "Technical design",
            "description": "Create technical specifications for new features",
            "timePercentage": 40.0
        }
    ]
}"""

async def job_to_tasks(job_title: str, job_description: str) -> JobSkillsAndTasks:
    agent = Agent(
        model=settings.model,
        system_prompt=JOB_TO_TASKS_PROMPT,
        result_type=JobSkillsAndTasks,
    )

    # Create the input message by combining title and description
    input_message = f"{job_title}\n{job_description}"
    result = await agent.run(input_message)
    return result.data  # Access the parsed data through .data attribute

