"""Application configuration loaded from environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "postgresql://nahid:nahidpass@db:5432/nahidpharmacy"

    # Auth
    jwt_secret: str = "nahid-pharmacy-secret-key-change-in-production-2024"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24
    SECRET_KEY: str = "nahid-pharmacy-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    admin_username: str = "admin"
    admin_password: str = "admin123"

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    OPENAI_API_KEY: str = ""

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # App
    app_name: str = "Nahid Pharmacy Distribution Platform"
    APP_NAME: str = "Nahid Pharmacy Distribution Platform"
    APP_VERSION: str = "1.0.0"
    cors_origins: str = "*"
    FRONTEND_URL: str = "http://localhost:3000"


settings = Settings()
