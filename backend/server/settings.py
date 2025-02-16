from pydantic_ai.settings import ModelSettings
import os


class Settings():
    model: str = None
    anthropic_api_key: str = None
    supabase_url: str = None
    supabase_key: str = None

    def load_settings(self):
        self.model: str = os.getenv("MODEL")
        self.max_retries: int = 3,
        self.logfire_token: str = os.getenv("LOGFIRE_TOKEN")
        self.anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY")
        self.supabase_url: str = os.getenv("SUPABASE_URL")
        self.supabase_key: str = os.getenv("SUPABASE_ANON_KEY")
        self.model_settings: ModelSettings = ModelSettings(temperature=0)



settings = Settings()
