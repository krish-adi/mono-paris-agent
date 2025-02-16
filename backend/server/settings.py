from pydantic import BaseModel
from pydantic_ai.settings import ModelSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseModel):
    model: str = os.getenv("MODEL")
    model_settings: ModelSettings = ModelSettings(
        temperature=0
    )
    max_retries: int = 3,
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY")
    logfire_token: str = os.getenv("LOGFIRE_TOKEN")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        arbitrary_types_allowed = True

settings = Settings()