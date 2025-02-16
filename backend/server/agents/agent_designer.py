from pydantic import BaseModel
from typing import List
from pydantic_ai import Agent
from server.settings import settings
from server.agents.message_logger import log_messages
import json
class AgentDesign(BaseModel):
    system_prompt: str
    required_tools: List[str]
    explanation: str

AGENT_DESIGN_PROMPT = f"""You are an expert at designing AI agents. Your job is to create effective system prompts and identify required tools for AI agents to perform specific tasks.

Available tools to choose from:
{json.dumps(settings.tools, indent=2)}

When designing an agent, you should:
1. Create a clear, specific system prompt that guides the AI
2. Identify which tools the agent needs access to
3. Explain your design decisions

The system prompt should:
- Be specific and unambiguous
- Include important constraints and guidelines
- Focus on the quality of output
- Include error handling guidance

Return only a JSON object with the design details."""


print(AGENT_DESIGN_PROMPT)

agent_design_agent = Agent(
    model=settings.model,
    system_prompt=AGENT_DESIGN_PROMPT,
    result_type=AgentDesign,
    model_settings=settings.model_settings,
    retries=settings.max_retries
)

async def design_agent(task: str, test_case: str) -> AgentDesign:
    prompt = f"""
Task to design agent for: {task}

Test Case:
{test_case}

Please design an agent that can effectively perform this task."""

    result = await agent_design_agent.run(prompt)
    log_messages("Agent Designer", result.all_messages())
    return result.data 