from pydantic import BaseModel
from pydantic_ai import Agent
from server.settings import settings
from server.agents.message_logger import log_messages

class TestCase(BaseModel):
    input: str
    expected_output: str
    explanation: str

TEST_DESIGN_PROMPT = """You are a test case designer for AI agents. Your job is to create realistic test cases for evaluating AI's ability to perform specific tasks.

When given a task description, you should:
1. Create a specific, concrete test scenario
2. Provide both the input that would be given to the AI
3. Define what the expected correct output should look like
4. Explain why this test case is good for evaluating the AI's capabilities

The test case should be:
- Realistic and representative of real-world scenarios
- Specific enough to evaluate clearly
- Complex enough to test meaningful capabilities
- Simple enough to have a clear "correct" answer

Return only a JSON object with the test case details."""

test_design_agent = Agent(
    model=settings.model,
    system_prompt=TEST_DESIGN_PROMPT,
    result_type=TestCase,
    model_settings=settings.model_settings,
    retries=settings.max_retries
)

async def create_test_case(task: str, job_context: str) -> TestCase:
    prompt = f"""
Task to create test for: {task}

Job Context:
{job_context}

Please design a test case for evaluating an AI's ability to perform this task."""

    result = await test_design_agent.run(prompt)
    log_messages("Test Designer", result.all_messages())
    return result.data 