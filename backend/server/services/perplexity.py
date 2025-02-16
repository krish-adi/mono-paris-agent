from openai import OpenAI
from pydantic import BaseModel
from typing import List, Optional
from server.settings import settings

class PerplexityMessage(BaseModel):
    role: str
    content: str

class PerplexityChoice(BaseModel):
    index: int
    finish_reason: str
    message: PerplexityMessage
    delta: Optional[PerplexityMessage] = None

class PerplexityUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class PerplexityResponse(BaseModel):
    id: str
    model: str
    object: str
    created: int
    citations: Optional[List[str]] = None
    choices: List[PerplexityChoice]
    usage: PerplexityUsage

def ask_perplexity(
    query: str, 
    system_prompt: str = None,
    max_tokens: int = None,
    temperature: float = 0.2,
    top_p: float = 0.9,
    presence_penalty: float = 0,
    frequency_penalty: float = 1,
) -> str:
    """
    Query Perplexity AI using their API
    
    Args:
        query (str): The user's question
        system_prompt (str, optional): Custom system prompt
        max_tokens (int, optional): Maximum tokens in response
        temperature (float, optional): Response randomness (0-1)
        top_p (float, optional): Nucleus sampling parameter
        presence_penalty (float, optional): Penalty for new tokens
        frequency_penalty (float, optional): Penalty for frequent tokens
    
    Returns:
        str: Response content from Perplexity AI
    """

    if not settings.perplexity_api_key:
        raise ValueError("Perplexity API key is not set")

    client = OpenAI(
        api_key=settings.perplexity_api_key,
        base_url="https://api.perplexity.ai"
    )
    
    messages = [
        {
            "role": "system",
            "content": system_prompt or "Be precise and concise."
        },
        {
            "role": "user",
            "content": query
        }
    ]
    
    params = {
        "model": "sonar-pro",
        "messages": messages,
        "temperature": temperature,
        "top_p": top_p,
        "presence_penalty": presence_penalty,
        "frequency_penalty": frequency_penalty,
    }
    
    if max_tokens:
        params["max_tokens"] = max_tokens
    
    response = client.chat.completions.create(**params)
    return response.choices[0].message.content
