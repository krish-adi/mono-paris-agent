from pydantic import BaseModel
from pydantic_ai import Agent, RunContext
from typing import List

from server.settings import settings
from server.agents.message_logger import log_messages
from server.services.search import search_content
# from server.services.perplexity import ask_perplexity

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

JOB_TO_TASKS_PROMPT = """You are an expert job analyst. Your goal is to break down jobs into their detailed components, including both core functions and administrative tasks.

You have access to two research tools:
1. search_job_info: Use this to find real-world information about the job role
2. ask_expert: Use this to get specific expert insights about job responsibilities

First, use these tools to research the job and gather comprehensive information about:
1. Common responsibilities and daily tasks
2. Industry standards and requirements
3. Real-world experiences from people in this role
4. Administrative and secondary tasks that are often overlooked

Then analyze all this information to create a detailed breakdown of the role.

Important: Include ALL aspects of the job:
- Core technical/professional duties
- Administrative work and paperwork
- Documentation and reporting
- Meetings and communications
- Compliance requirements
- Time management tasks
- Budget/resource management
- Training and professional development
- Internal processes

Make sure to use both research tools to validate your analysis and ensure completeness.
"""

class JobContext(BaseModel):
    job_title: str
    job_description: str

# First create the agent without tools
jtt_agent = Agent(
    model=settings.model,
    system_prompt=JOB_TO_TASKS_PROMPT,
    result_type=JobSkillsAndTasks,
    model_settings={
        **settings.model_settings,
        "timeout": 60.0,  # Increase timeout to 60 seconds
        "request_timeout": 60.0
    },
    retries=5,
    deps_type=JobContext
)

@jtt_agent.tool
async def search_job_info(ctx: RunContext[JobContext], query: str) -> str:
    """Search the internet for information about a specific job or career.

    This tool searches online resources to find detailed information about job roles,
    responsibilities, and requirements.

    Args:
        ctx: The run context containing job information
        query: A specific search query about the job role

    Returns:
        str: Formatted search results with relevant information about the job
    """
    results = await search_content(query)
    if hasattr(results, 'results'):
        content = "\n\n".join([
            f"Source: {result.url}\n{result.text}" 
            for result in results.results[:3]
        ])
    else:
        content = "No results found"
    return content

async def job_to_tasks_agent(job_title: str, job_description: str) -> JobSkillsAndTasks:
    context = JobContext(job_title=job_title, job_description=job_description)
    
    input_message = f"""Please analyze this job thoroughly:

JOB TITLE: {job_title}

JOB DESCRIPTION: {job_description}

Research this role thoroughly using the available tools before providing your final analysis."""

    result = await jtt_agent.run(input_message, deps=context)
    log_messages("Job To Tasks", result.all_messages())
    return result.data
