from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://faculty_user:faculty_pass@localhost/meetings_db"
    secret_key: str = "dev-secret"
    jwt_algorithm: str = "HS256"


settings = Settings()
