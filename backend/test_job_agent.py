import asyncio
import dotenv
dotenv.load_dotenv()
import logfire

logfire.configure()
logfire.instrument_httpx(capture_all=True)

from server.agents.job_to_tasks_agent import job_to_tasks_agent

async def test_job_analysis():
    print("\nTesting job analysis with research tools...")
    
    # Test case 1: Software Engineer
    print("\n1. Testing Software Engineer role...")
    try:
        result = await job_to_tasks_agent(
            "Senior Software Engineer",
            """We are looking for a Senior Software Engineer to join our backend team. 
            The ideal candidate will have strong Python experience and will be responsible 
            for designing and implementing scalable services."""
        )
        print("\nAnalysis successful!")
        print("\nRequirements:", result.job_requirements)
        print("\nSkills:", result.job_skills)
        print("\nResponsibilities:", result.job_responsibilities)
        print("\nDetailed Tasks:")
        for task in result.job_tasks:
            print(f"\n• {task.task} ({task.timePercentage}%)")
            print(f"  {task.description}")
    except Exception as e:
        print("Analysis error:", str(e))

if __name__ == "__main__":
    print("Running job analysis tests...")
    asyncio.run(test_job_analysis())
    print("\nTests completed!") 