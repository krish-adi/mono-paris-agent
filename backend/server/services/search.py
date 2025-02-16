from exa_py import Exa
from server.settings import settings

async def search_content(query: str, max_characters: int = 3000) -> dict:
    """
    Search for content using Exa API
    
    Args:
        query (str): The search query string
        max_characters (int, optional): Maximum characters to return in results. Defaults to 3000.
    
    Returns:
        dict: Search results from Exa API
    """
    exa = Exa(api_key=settings.exa_api_key)
    result = exa.search_and_contents(
        query,
        text={"max_characters": max_characters}
    )
    return result