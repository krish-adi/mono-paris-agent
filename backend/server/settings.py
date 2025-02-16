from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    model: str = os.getenv("MODEL")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY")
    logfire_token: str = os.getenv("LOGFIRE_TOKEN")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()