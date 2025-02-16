from pydantic_ai.settings import ModelSettings
import os
from server.services.get_composio_tools import get_apps
class Settings():
    model: str = "anthropic:claude-3-5-sonnet-latest"
    anthropic_api_key: str = None
    supabase_url: str = None
    supabase_key: str = None
    langfuse_public_key: str = None
    langfuse_secret_key: str = None
    model_settings: ModelSettings = ModelSettings(temperature=0)
    max_retries: int = 12
    logfire_token: str = None
    exa_api_key: str = None
    perplexity_api_key: str = None
    composio_api_key: str = None
    tools: list = []

    def load_settings(self):
        self.model: str = os.getenv("MODEL")
        self.max_retries: int = 3
        self.logfire_token: str = os.getenv("LOGFIRE_TOKEN")
        self.anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY")
        self.supabase_url: str = os.getenv("SUPABASE_URL")
        self.supabase_key: str = os.getenv("SUPABASE_ANON_KEY")
        self.logfire_token: str = os.getenv("LOGFIRE_TOKEN")
        # self.langfuse_public_key: str = os.getenv("LANGFUSE_PUBLIC_KEY")
        # self.langfuse_secret_key: str = os.getenv("LANGFUSE_SECRET_KEY")
        # self.langfuse_auth: str = base64.b64encode(
        #     f"{self.langfuse_public_key}:{self.langfuse_secret_key}".encode()
        # ).decode()
        self.model_settings: ModelSettings = ModelSettings(temperature=0)
        self.exa_api_key: str = os.getenv("EXA_API_KEY")
        self.perplexity_api_key: str = os.getenv("PERPLEXITY_API_KEY")
        self.composio_api_key: str = os.getenv("COMPOSIO_API_KEY")

        self.tools = get_apps()

settings = Settings()
