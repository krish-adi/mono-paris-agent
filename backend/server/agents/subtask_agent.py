from server.settings import settings
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext
from typing import List
from server.agents.test_design import create_test_case, TestCase
from server.agents.agent_designer import design_agent, AgentDesign
from server.agents.agent_evaluator import evaluate_agent, EvaluationResult
from server.agents.message_logger import log_messages


PROMPT = """

You orchestrate a team of smart agents (tools) to complete a factual evaluation of a single task in the context of a human occupation.
Your job is to understand whether this individual task can be automated well with existing LLMs and tools.

After a careful analysis and a few rounds of testing and design you need to return 4 things:

- "task_category":which category of automation readiness the task falls into: HUMAN_ONLY (bots can't do it), AUGMENTATION_POSSIBLE (bots can help humans do it better), AUTOMATION_READY (bots can do it themselves well)

- "reasoning": one-two sentences explanation

- "system_prompt": the best possible system prompt for a tool that can complete this task

- "tools_needed": a list of tools that the LLM would need access to in order to complete this task with this system prompt (you will be provided with a list of possible tools, choose from them)


Here is how you should go about the task:

1. First, use test_design_tool to create a test for this task. For example, if the task is to write a resume, the test could be to write a resume for a made-up person. The test_tool willr return both the input and the expected output of this task.

2. Then, use agent_design_tool to design an agent that can complete this task. The agent_design_tool needs the description of the task and the test (but not the expected output). It will return back a system prompt and the list of tools that the LLM would need access to in order to complete this task with this system prompt.

3. Then, use the agent_evaluator_tool to evaluate the agent. You give it the test and the system prompt and expected output and it will return back the evaluation of how the agent performed. The evaluation is 0-10, where 0 is the worst and 10 is the best. It will also return some reasoning for why the agent performed poorly or well.

4. If the agent performed poorly (is given a score of 6 or below), you need to iterate on the system prompt (by giving more direction to the agent_design_tool). You can do this multiple times until your agent is performing well or until it is clear that the agent will never be able to do the task well.

5. Once you have the best possible result - return it back in the following format:

{
    "task_category": "HUMAN_ONLY" or "AUGMENTATION_POSSIBLE" or "AUTOMATION_READY",
    "reasoning": "one-two sentences explanation",
    "system_prompt": "the best performing system prompt for a tool that can complete this task", (leave this blank if the task is human only)
    "tools_needed": "a list of tools that the LLM would need access to in order to complete this task with this system prompt" (leave this blank if the task is human only),
    "best_score": the highest evaluation score achieved during testing (0-10, should be 0 for HUMAN_ONLY tasks)
}

If you have to iterate more than 3 times and can't get it to work, return HUMAN_ONLY.

Only return the JSON object, nothing else.

"""

class OrchestratorResult(BaseModel):
    task_category: str
    reasoning: str
    system_prompt: str | None
    tools_needed: List[str] | None
    best_score: float

subtask_agent = Agent(
    model=settings.model,
    system_prompt=PROMPT,
    result_type=OrchestratorResult,
    model_settings=settings.model_settings,
    retries=settings.max_retries
)

@subtask_agent.tool
async def test_design_tool(ctx: RunContext[None], task: str, job_context: str) -> TestCase:
    return await create_test_case(task, job_context)

@subtask_agent.tool
async def agent_design_tool(ctx: RunContext[None], task: str, test_case: str) -> AgentDesign:
    return await design_agent(task, test_case)

@subtask_agent.tool
async def agent_evaluator_tool(
    ctx: RunContext[None],
    task: str,
    test_case: str,
    system_prompt: str,
    expected_output: str
) -> EvaluationResult:
    return await evaluate_agent(task, test_case, system_prompt, expected_output)

async def subtask_agent_run(task: str, job_title: str, job_description: str) -> OrchestratorResult:
    context = f"""
JOB TITLE: {job_title}
JOB DESCRIPTION: {job_description}
TASK TO EVALUATE: {task}
"""
    try:
        result = await subtask_agent.run(context)
        log_messages("Subtask Agent", result.all_messages())
        return result.data
    except Exception as e:
        # If anything fails, return HUMAN_ONLY with score 0
        return OrchestratorResult(
            task_category="HUMAN_ONLY",
            reasoning="Failed to evaluate task due to an error",
            system_prompt=None,
            tools_needed=None,
            best_score=0
        )
