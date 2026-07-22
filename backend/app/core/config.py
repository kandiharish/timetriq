from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Timetriq"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Firebase configuration will go here
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()
