import asyncio
import dotenv
import traceback
dotenv.load_dotenv()
import logfire

logfire.configure()
logfire.instrument_httpx(capture_all=True)

from server.agents.agent_designer import design_agent
from server.settings import settings 

from server.services.get_composio_tools import get_apps

print(get_apps())

async def test_agent_designer():
    print("\nTesting agent designer...")
    
    # Test case 1: Design a code review agent
    print("\n1. Testing design of a code review agent...")
    try:
        result = await design_agent(
            "Code Review Assistant",
            """Review this Python code:
            def add_numbers(a, b):
                return a + b
            
            Please check for best practices and potential issues."""
        )
        print("\nDesign successful!")
        print("\nSystem Prompt:", result.system_prompt)
        print("\nRequired Tools:", result.required_tools)
        print("\nExplanation:", result.explanation)
    except Exception as e:
        print("Design error:", str(e))
        print("\nFull traceback:")
        traceback.print_exc()

if __name__ == "__main__":
    print("Running agent designer tests...")
    asyncio.run(test_agent_designer())
    print("\nTests completed!")
