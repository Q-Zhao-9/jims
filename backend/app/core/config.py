from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Use postgresql://user:pass@localhost:5432/jims for PostgreSQL (see docker-compose).
    database_url: str = "sqlite:///./jims.db"
    secret_key: str = "change-me-in-production-use-long-random-secret"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    upload_dir: Path = Path("uploads")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
