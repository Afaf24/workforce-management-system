"""
Application configuration, loaded from environment variables (.env file in development).
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # Service
    app_name: str = "AI HR Assistant Service"
    app_env: str = "development"
    allowed_origins: str = "http://localhost:5000,http://localhost:5001"

    # Internal API key shared with the .NET backend, so this service
    # is not directly callable by the public internet.
    internal_api_key: str = "CHANGE_THIS_SHARED_SECRET"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
