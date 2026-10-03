"""
OpenWeather Fallback Ingestion Module
Secondary provider used if IMD is unreachable.
Supports OPENWEATHER_API_KEY environment variable securely on server-side.
"""

import os
# pyrefly: ignore [missing-import]
import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("vyomix.openweather")

class OpenWeatherIngestor:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENWEATHER_API_KEY", "")
        self.base_url = "https://api.openweathermap.org/data/2.5"

    async def fetch_weather_fallback(self, lat: float, lon: float) -> Dict[str, Any]:
        if not self.api_key or self.api_key == "your_openweather_api_key_optional":
            logger.info("OpenWeather API key not set; fallback remains in synthetic standby mode.")
            return {"status": "standby", "source": "OpenWeather", "data": None}

        url = f"{self.base_url}/weather"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, params={"lat": lat, "lon": lon, "appid": self.api_key, "units": "metric"})
                if resp.status_code == 200:
                    return {"status": "success", "source": "OpenWeather", "data": resp.json()}
        except Exception as e:
            logger.warning(f"OpenWeather request failed: {e}")

        return {"status": "error", "source": "OpenWeather", "data": None}

openweather_ingestor = OpenWeatherIngestor()
