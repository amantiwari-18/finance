from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/expense_tracker"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 5256000 # 10 years
    
    # SMTP Configuration (to be filled by user or use Mailhog/Mailpit locally)
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 1025
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "expense@tracker.local"
    SMTP_ENABLED: bool = True
    SMTP_TLS: bool = False
    SMTP_USE_SSL: bool = False
    
    # Scheduler
    SCHEDULER_ENABLED: bool = True
    DAILY_SUMMARY_TIME: str = "21:00"  # 9 PM
    DAILY_BUDGET_CHECK_TIME: str = "08:00"  # 8 AM
    RECURRING_CHECK_TIME: str = "06:00"  # 6 AM
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()
