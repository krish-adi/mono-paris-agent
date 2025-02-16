from server.db.client import database
from server.db.models import TaskItem, JobSkillsAndTasks, JobTasks
from typing import List


async def create_user_request(
    report_id: str,
    job_title: str,
    report_status: str = "user_request_for_report_created",
):
    data = (
        await database.client()
        .table("reports")
        .insert(
            {
                "id": report_id,
                "job_title": job_title,
                "report_status": report_status,
            }
        )
        .execute()
    )

    return data


async def complete_job_description_agent(
    report_id: str,
    job_description: str,
    job_requirements: List[str],
    job_skills: List[str],
    job_responsibilities: List[str],
    job_tasks: List[TaskItem],
    status: str = "job_description_agent_completed",
):
    await (
        database.client()
        .table("reports")
        .update(
            {
                "job_description": job_description,
                "report_status": status,
                "job_requirements": job_requirements,
                "job_skills": job_skills,
                "job_responsibilities": job_responsibilities,
            }
        )
        .eq("id", report_id)
        .execute()
    )

    for task in job_tasks:
        await (
            database.client()
            .table("job_tasks")
            .insert(
                {
                    "id": task.id,
                    "report_id": report_id,
                    "task": task.task,
                    "description": task.description,
                    "time_percentage": task.timePercentage,
                    "job_task_status": "job_task_created",
                }
            )
            .execute()
        )
    return "Job description agent completed"


async def create_job_task_subtask(
    sub_task_id: str,
    job_task_id: str,
    sub_task: str,
    description: str,
):
    await (
        database.client()
        .table("job_sub_tasks")
        .insert(
            {
                "id": sub_task_id,
                "task_id": job_task_id,
                "sub_task": sub_task,
                "description": description,
                "job_sub_task_status": "job_sub_task_created",
            }
        )
        .execute()
    )
