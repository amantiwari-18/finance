from sqlalchemy import create_engine, text
from config import get_settings
import sys

try:
    settings = get_settings()
    print(f"Connecting to: {settings.DATABASE_URL.split('@')[-1]}")  # Hide password
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("Database connection successful!")
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
