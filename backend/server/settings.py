from pydantic_ai.settings import ModelSettings
import os
import base64


class Settings:
    model: str = "anthropic:claude-3-5-sonnet-latest"
    anthropic_api_key: str = None
    supabase_url: str = None
    supabase_key: str = None
    langfuse_public_key: str = None
    langfuse_secret_key: str = None
    model_settings: ModelSettings = ModelSettings(temperature=0)
    max_retries: int = 3

    def load_settings(self):
        self.model: str = os.getenv("MODEL")
        self.logfire_token: str = os.getenv("LOGFIRE_TOKEN")
        self.anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY")
        self.supabase_url: str = os.getenv("SUPABASE_URL")
        self.supabase_key: str = os.getenv("SUPABASE_ANON_KEY")
        self.langfuse_public_key: str = os.getenv("LANGFUSE_PUBLIC_KEY")
        self.langfuse_secret_key: str = os.getenv("LANGFUSE_SECRET_KEY")
        self.langfuse_auth: str = base64.b64encode(
            f"{self.langfuse_public_key}:{self.langfuse_secret_key}".encode()
        ).decode()

        os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = (
            "https://cloud.langfuse.com/api/public/otel"  # EU data region
        )
        # os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = "https://us.cloud.langfuse.com/api/public/otel" # US data region
        os.environ["OTEL_EXPORTER_OTLP_HEADERS"] = (
            f"Authorization=Basic {self.langfuse_auth}"
        )


settings = Settings()
