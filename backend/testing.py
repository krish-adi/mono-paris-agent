from server.agents.orchestrator import orchestrator
if __name__ == "__main__":
    import asyncio

    # Get inputs from command line
    job_title = input("Enter job title: ")
    job_description = input("Enter job description: ")

    # Run the async function and print results
    result = asyncio.run(orchestrator(job_title, job_description))
    print("\nResults:")
    print(result.model_dump_json(indent=2))