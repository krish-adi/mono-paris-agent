import traceback
from uuid import uuid4
from server.db.queries import (
    query_complete_job_description_agent,
    query_create_job_task_subtask,
    query_update_report_complete,
)
from server.agents.job_to_tasks_agent import job_to_tasks_agent
from server.agents.subtask_agent import subtask_agent_run
from server.db.models import TaskItem as DBTaskItem


async def complete_agent(report_id: str, job_title: str, job_description: str = None):
    print("\nTesting job analysis with research tools...")
    # Example job and task
    try:
        print("\n1. Testing Software Engineer role...")
        if job_description is None:
            job_description = f"This is a {job_title} position that requires relevant experience and skills."

        result = await job_to_tasks_agent(job_title, job_description)
        print("\nAnalysis successful!")
        print("\nRequirements:", result.job_requirements)
        print("\nSkills:", result.job_skills)
        print("\nResponsibilities:", result.job_responsibilities)
        print("\nDetailed Tasks:")
        # conver the tasks to fit the database task item schema
        _converted_tasks = [
            DBTaskItem(
                id=str(uuid4()),
                task=task.task,
                description=task.description,
                timePercentage=task.timePercentage,
            )
            for task in result.job_tasks
        ]
        _response_2 = await query_complete_job_description_agent(
            report_id,
            result.job_description,
            result.job_requirements,
            result.job_skills,
            result.job_responsibilities,
            _converted_tasks,
        )
        print(_response_2)
        for task in _converted_tasks:
            print(f"\n• {task.task} ({task.timePercentage}%)")
            print(f"  {task.description}")
            subtask_result = await subtask_agent_run(
                task.task, job_title, job_description
            )
            await query_create_job_task_subtask(
                sub_task_id=str(uuid4()),
                job_task_id=task.id,
                sub_task=task.task,
                description=task.description,
                task_category=subtask_result.task_category,
                reasoning=subtask_result.reasoning,
                llm_prompt=subtask_result.system_prompt,
                tools_needed=subtask_result.tools_needed,
                best_score=subtask_result.best_score,
            )
            print(f"Subtask Result: {subtask_result}\n\n")

        await query_update_report_complete(report_id)

    except Exception as e:
        print("Analysis error:", str(e))
        print("\nFull traceback:")
        traceback.print_exc()

    return "Analysis complete"
