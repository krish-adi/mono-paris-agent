from server.db.client import database
from server.db.models import TaskItem
from typing import List


async def query_create_user_request(
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
    print("user_request_for_report_created", data)
    return "user_request_for_report_created"


async def query_complete_job_description_agent(
    report_id: str,
    job_description: str,
    job_requirements: List[str],
    job_skills: List[str],
    job_responsibilities: List[str],
    job_tasks: List[TaskItem],
    status: str = "job_description_agent_completed",
):
    data = await (
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
    print("job_description_agent_completed", data)

    for task in job_tasks:
        data = await (
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
        print("job_task_created", data)
    return "Job description agent completed"


async def query_create_job_task_subtask(
    sub_task_id: str,
    job_task_id: str,
    sub_task: str,
    description: str,
    task_category: str,
    reasoning: str,
    llm_prompt: str,
    tools_needed: List[str],
    best_score: float,
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
                "task_category": task_category,
                "reasoning": reasoning,
                "llm_prompt": llm_prompt,
                "tools_needed": tools_needed,
                "best_score": best_score,
                "job_sub_task_status": "job_sub_task_created",
            }
        )
        .execute()
    )


async def query_update_report_complete(
    report_id: str,
    status: str = "report_complete",
):
    data = await (
        database.client()
        .table("reports")
        .update(
            {
                "report_status": status,
            }
        )
        .eq("id", report_id)
        .execute()
    )
    print("report_complete", data)
