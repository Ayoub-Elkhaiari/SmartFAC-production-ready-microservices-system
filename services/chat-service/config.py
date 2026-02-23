from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openrouter_api_key: str = ""
    openrouter_model: str = "google/gemma-3-27b-it:free"
    openrouter_site_url: str = "http://localhost"
    openrouter_site_name: str = "Smart Faculty"
    request_timeout_seconds: int = 60

    class Config:
        env_file = ".env"


settings = Settings()
