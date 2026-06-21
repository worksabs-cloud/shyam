"""Application configuration loaded from environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "postgresql://pharma:pharma@db:5432/pharma_procurement"

    # Auth
    jwt_secret: str = "change-me-in-production-super-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24
    admin_username: str = "admin"
    admin_password: str = "admin123"

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4.1"

    # App
    app_name: str = "MedSupply AI — Pharmacy Procurement Platform"
    cors_origins: str = "*"


settings = Settings()
