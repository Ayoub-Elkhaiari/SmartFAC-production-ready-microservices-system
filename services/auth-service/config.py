from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://faculty_user:faculty_pass@localhost/auth_db"
    redis_url: str = "redis://localhost:6379"
    secret_key: str = "dev-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_pass: str = ""
    email_from: str = "noreply@example.com"
    notification_service_url: str = "http://localhost:8006"
    user_service_url: str = "http://user-service-1:8002"

    class Config:
        env_file = ".env"


settings = Settings()
