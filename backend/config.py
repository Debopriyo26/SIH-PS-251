import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "VYOMIX Backend"
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Supabase (Server-side)
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # IMD Meteorological API
    IMD_API_BASE_URL: str = os.getenv("IMD_API_BASE_URL", "https://mausam.imd.gov.in/api")
    IMD_API_KEY: Optional[str] = os.getenv("IMD_API_KEY", "")
    
    # OpenWeather (Fallback)
    OPENWEATHER_API_KEY: Optional[str] = os.getenv("OPENWEATHER_API_KEY", "")
    
    # Government Open Data (data.gov.in)
    DATA_GOV_API_KEY: Optional[str] = os.getenv("DATA_GOV_API_KEY", "")

    # CORS origins
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://localhost:3000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
