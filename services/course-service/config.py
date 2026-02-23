from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://faculty_user:faculty_pass@localhost/courses_db"
    secret_key: str = "dev-secret"
    jwt_algorithm: str = "HS256"
    upload_dir: str = "/var/uploads"
    notification_service_url: str = "http://localhost:8006"


settings = Settings()
