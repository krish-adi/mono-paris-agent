from pydantic import BaseModel
from pydantic_ai import Agent
from typing import List

from server.settings import settings
from server.agents.message_logger import log_messages

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

JOB_TO_TASKS_PROMPT = """Given a job title and job description, analyze and break down the role into ALL its components, including both core job functions AND administrative/bureaucratic tasks.

Important: Make sure to include not just the primary responsibilities, but also all the secondary tasks that people in this role have to handle, such as:
- Administrative paperwork
- Documentation and reporting
- Meetings and communications
- Compliance requirements
- Time tracking and scheduling
- Budget/expense management
- Equipment/resource management
- Training and certifications
- Internal processes and procedures

For example:
- A teacher spends significant time on attendance reports, parent communications, and administrative paperwork
- A freelance designer must handle client invoicing, tax documentation, and business development
- A police officer dedicates substantial time to paperwork, court appearances, and mandatory training

You will receive input in the format:
{job_title}
{job_description}

Please provide a JSON object with the following structure:
{
    "job_title": "Software Engineer",
    "job_description": "Backend developer position focusing on Python",
    "job_requirements": ["Bachelor's degree in CS", "3+ years experience", "Python expertise"],
    "job_skills": ["Python", "SQL", "Git", "API Development", "Documentation", "Communication"],
    "job_responsibilities": ["Develop backend services", "Maintain existing codebase", "Review code", "Collaborate with team members", "Ensure code quality"],
    "job_tasks": [
        {
            "task": "Write code",
            "description": "Implement new features and functionality in Python",
            "timePercentage": 30.0
        },
        {
            "task": "Code review",
            "description": "Review pull requests and provide feedback to team members",
            "timePercentage": 15.0
        },
        {
            "task": "Technical design",
            "description": "Create technical specifications for new features",
            "timePercentage": 15.0
        },
        {
            "task": "Meetings",
            "description": "Attend daily standups, sprint planning, retrospectives, and other team meetings",
            "timePercentage": 15.0
        },
        {
            "task": "Documentation",
            "description": "Write and maintain technical documentation, API specs, and internal wikis",
            "timePercentage": 10.0
        },
        {
            "task": "Administrative tasks",
            "description": "Time tracking, expense reports, status updates, and other administrative duties",
            "timePercentage": 5.0
        },
        {
            "task": "Learning and training",
            "description": "Keep up with new technologies, complete required trainings, and maintain certifications",
            "timePercentage": 5.0
        },
        {
            "task": "Production support",
            "description": "Handle on-call duties, investigate production issues, and maintain system stability",
            "timePercentage": 5.0
        }
    ]
}"""

job_to_tasks_agent = Agent(
    model=settings.model,
    system_prompt=JOB_TO_TASKS_PROMPT,
    result_type=JobSkillsAndTasks,
    model_settings=settings.model_settings,
    retries=settings.max_retries
)

async def job_to_tasks(job_title: str, job_description: str) -> JobSkillsAndTasks:
    input_message = f"JOB TITLE: {job_title}\n\n\nJOB DESCRIPTION: {job_description}"
    result = await job_to_tasks_agent.run(input_message)
    log_messages("Job To Tasks", result.all_messages())
    return result.data
