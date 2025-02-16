from server.agents.orchestrator import orchestrator
from server.settings import settings

if __name__ == "__main__":
    import asyncio

    # Example job and task
    job_title = "Head of Developer Relations"
    job_description = """
    The role involves leading Anthropic's developer relations strategy and team,
    building strong relationships with the developer community, creating technical content,
    speaking at conferences, gathering developer feedback, collaborating with product teams,
    and helping developers successfully integrate and build with Claude and other Anthropic APIs.
    """
    
    task = "Create technical documentation for a new API endpoint"

    print("\nEvaluating task automation potential...")
    print(f"Job Title: {job_title}")
    print(f"Task: {task}")
    print("\nAnalyzing...")

    # Run the async function and print results
    result = asyncio.run(orchestrator(task, job_title, job_description))
    
    print("\nResults:")
    print("-" * 50)
    print(f"Task Category: {result.task_category}")
    print(f"Reasoning: {result.reasoning}")
    print(f"Best Score: {result.best_score}")
    
    if result.system_prompt:
        print("\nSystem Prompt:")
        print(result.system_prompt)
    
    if result.tools_needed:
        print("\nRequired Tools:")
        for tool in result.tools_needed:
            print(f"- {tool}")