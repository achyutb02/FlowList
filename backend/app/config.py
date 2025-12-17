from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Application
    app_name: str = "FlowList"
    debug: bool = True
    
    # Database - SQLite by default for easy local development
    # Set DATABASE_URL env var to use PostgreSQL in production
    database_url: str = "sqlite:///./flowlist.db"
    
    # JWT
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

