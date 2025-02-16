from pydantic import BaseModel
from typing import List


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
