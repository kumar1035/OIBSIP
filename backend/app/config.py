from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/voice_assist"
    jwt_secret_key: str = "change-this-secret"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080  # 7 days
    anthropic_api_key: str = ""
    allowed_origins: list = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
