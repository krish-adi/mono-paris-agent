from pydantic import BaseModel
from pydantic_ai import Agent
from server.settings import settings
from server.agents.message_logger import log_messages

class EvaluationResult(BaseModel):
    score: int  # 0-10
    reasoning: str
    improvement_suggestions: str

EVALUATOR_PROMPT = """You are an expert at evaluating AI agents. Your job is to assess how well an agent's design would perform on a specific test case.

You should evaluate:
1. Whether the system prompt would guide the AI to produce the expected output
2. If the selected tools are sufficient and appropriate
3. How well the design handles edge cases and potential issues

Provide:
1. A score from 0-10 where:
   - 0-3: Cannot perform the task adequately
   - 4-6: Can perform but with significant issues
   - 7-8: Can perform well with minor issues
   - 9-10: Can perform excellently
2. Detailed reasoning for the score, in 1-2 sentences
3. Specific suggestions for improvement, in 1-2 sentences

Return only a JSON object with the evaluation details."""

evaluator_agent = Agent(
    model=settings.model,
    system_prompt=EVALUATOR_PROMPT,
    result_type=EvaluationResult,
    model_settings=settings.model_settings,
    retries=settings.max_retries
)

async def evaluate_agent(
    task: str,
    test_case: str,
    system_prompt: str,
    expected_output: str
) -> EvaluationResult:
    prompt = f"""
Task being evaluated: {task}

Test Case:
{test_case}

System Prompt:
{system_prompt}

Expected Output:
{expected_output}

Please evaluate how well this agent design would perform on this test case."""

    result = await evaluator_agent.run(prompt)
    log_messages("Agent Evaluator", result.all_messages())
    return result.data 