"""
VYOMIX — Predictive Logistics Intelligence
FastAPI Backend Application
Tagline: Predict. Prepare. Deliver.
"""

import uvicorn
from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime

from backend.config import settings
from backend.models.schemas import (
    LocationSchema,
    SupplySchema,
    InventorySchema,
    WeatherObsSchema,
    WeatherForecastDaySchema,
    TransportAssetSchema,
    ForecastRequest,
    ForecastResponse,
    SimulationRequest,
    SimulationResponse,
    AlertSchema,
    AssistantQueryRequest,
    AssistantQueryResponse
)
from backend.services.imd_service import imd_service
from backend.services.shortage_engine import shortage_engine
from backend.services.simulator_service import simulator_service
from backend.services.assistant_service import assistant_service
from backend.ml.forecast_model import demand_forecaster

app = FastAPI(
    title="VYOMIX — Predictive Logistics Intelligence API",
    description="Backend microservices supporting AI predictive logistics, IMD weather ingestion, and supply-chain planning.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# IN-MEMORY DEMO STATE (Synchronized with public demonstration zones)
# ==============================================================================
DEMO_LOCATIONS = [
    {
        "id": "loc-srinagar",
        "code": "LOC-SXR",
        "name": "Srinagar Logistics Zone",
        "type": "Logistics Zone",
        "latitude": 34.0837,
        "longitude": 74.7973,
        "altitude_m": 1585,
        "region": "Northern Sector",
        "status": "attention",
        "inventory_readiness_pct": 78.0,
        "weather_risk": "HIGH",
        "transport_availability_pct": 65.0,
        "projected_shortage": "FUEL / MEDICAL",
        "notes": "High-altitude logistics staging zone with mountain corridor access subject to weather delays."
    },
    {
        "id": "loc-jaisalmer",
        "code": "LOC-JSA",
        "name": "Jaisalmer Logistics Zone",
        "type": "Logistics Zone",
        "latitude": 26.9157,
        "longitude": 70.9083,
        "altitude_m": 225,
        "region": "Western Sector",
        "status": "operational",
        "inventory_readiness_pct": 91.0,
        "weather_risk": "LOW",
        "transport_availability_pct": 86.0,
        "projected_shortage": "NONE",
        "notes": "Arid climate supply staging depot with high solar exposure and heavy fleet capacity."
    },
    {
        "id": "loc-ahmedabad",
        "code": "LOC-AMD",
        "name": "Ahmedabad Logistics Base",
        "type": "Logistics Base",
        "latitude": 23.0225,
        "longitude": 72.5714,
        "altitude_m": 53,
        "region": "Central Support",
        "status": "operational",
        "inventory_readiness_pct": 96.0,
        "weather_risk": "LOW",
        "transport_availability_pct": 94.0,
        "projected_shortage": "NONE",
        "notes": "Primary reserve logistics hub with multi-modal railhead and heavy storage warehousing."
    },
    {
        "id": "loc-kutch",
        "code": "LOC-KUT",
        "name": "Kutch Logistics Zone",
        "type": "Logistics Zone",
        "latitude": 23.2420,
        "longitude": 69.6669,
        "altitude_m": 110,
        "region": "Coastal Flank",
        "status": "attention",
        "inventory_readiness_pct": 74.0,
        "weather_risk": "MODERATE",
        "transport_availability_pct": 70.0,
        "projected_shortage": "WATER / POL",
        "notes": "Coastal plain logistics staging area with variable maritime humidity and road corridors."
    }
]

DEMO_SUPPLIES = [
    {"id": "sup-fuel", "item_code": "SUP-POL-01", "name": "High-Altitude Diesel & POL Fuel", "category": "Fuel", "unit": "Liters", "criticality": "CRITICAL", "shelf_life_days": 720},
    {"id": "sup-food", "item_code": "SUP-RAT-01", "name": "Special Composite MRE Rations", "category": "Food", "unit": "Ration-Packs", "criticality": "HIGH", "shelf_life_days": 360},
    {"id": "sup-med", "item_code": "SUP-MED-01", "name": "Emergency Medical & Trauma Kits", "category": "Medical", "unit": "Kits", "criticality": "CRITICAL", "shelf_life_days": 180},
    {"id": "sup-water", "item_code": "SUP-WAT-01", "name": "Purified Bulk Potable Water", "category": "Water", "unit": "Liters", "criticality": "CRITICAL", "shelf_life_days": 90},
    {"id": "sup-gen", "item_code": "SUP-GEN-01", "name": "Extreme Weather Protective Gear", "category": "General Supplies", "unit": "Units", "criticality": "MEDIUM", "shelf_life_days": 1080},
]

DEMO_INVENTORY = [
    {
        "id": "inv-sxr-fuel",
        "location_id": "loc-srinagar",
        "supply_id": "sup-fuel",
        "current_stock": 12400.0,
        "daily_consumption": 1600.0,
        "safety_threshold": 8000.0,
        "reorder_point": 11000.0,
        "forecast_demand_7d": 11800.0,
        "days_of_cover": 7.8,
        "risk_status": "HIGH",
        "last_restocked_at": "2026-09-28T04:00:00Z",
        "supply": DEMO_SUPPLIES[0],
        "location": DEMO_LOCATIONS[0]
    },
    {
        "id": "inv-sxr-med",
        "location_id": "loc-srinagar",
        "supply_id": "sup-med",
        "current_stock": 180.0,
        "daily_consumption": 35.0,
        "safety_threshold": 150.0,
        "reorder_point": 250.0,
        "forecast_demand_7d": 280.0,
        "days_of_cover": 5.1,
        "risk_status": "CRITICAL",
        "last_restocked_at": "2026-09-26T06:00:00Z",
        "supply": DEMO_SUPPLIES[2],
        "location": DEMO_LOCATIONS[0]
    },
    {
        "id": "inv-kut-wat",
        "location_id": "loc-kutch",
        "supply_id": "sup-water",
        "current_stock": 11500.0,
        "daily_consumption": 1400.0,
        "safety_threshold": 6000.0,
        "reorder_point": 9000.0,
        "forecast_demand_7d": 10200.0,
        "days_of_cover": 8.2,
        "risk_status": "HIGH",
        "last_restocked_at": "2026-09-22T05:00:00Z",
        "supply": DEMO_SUPPLIES[3],
        "location": DEMO_LOCATIONS[3]
    }
]

DEMO_TRANSPORTS = [
    {"id": "tr-001", "asset_code": "TR-001", "name": "Logistics Carrier 01", "type": "Heavy Transport", "capacity_tonnes": 8.0, "current_location_id": "loc-ahmedabad", "destination_location_id": "loc-srinagar", "assigned_route": "Corridor Ahmedabad - Srinagar", "availability": "AVAILABLE", "status": "Operational", "fuel_efficiency_kmpl": 3.2},
    {"id": "tr-002", "asset_code": "TR-002", "name": "Medium Hauler 02", "type": "Medium Transport", "capacity_tonnes": 5.0, "current_location_id": "loc-srinagar", "destination_location_id": None, "assigned_route": "Standby Depot Srinagar", "availability": "MAINTENANCE", "status": "Brake Assembly Overhaul", "fuel_efficiency_kmpl": 4.1},
    {"id": "tr-003", "asset_code": "TR-003", "name": "All-Terrain 03", "type": "Light 4x4", "capacity_tonnes": 2.5, "current_location_id": "loc-srinagar", "destination_location_id": "loc-srinagar", "assigned_route": "High Pass Route", "availability": "IN_TRANSIT", "status": "En-route with Emergency Med Pack", "fuel_efficiency_kmpl": 5.8},
    {"id": "tr-004", "asset_code": "TR-004", "name": "Fleet Unit Falcon", "type": "Convoy Unit", "capacity_tonnes": 24.0, "current_location_id": "loc-ahmedabad", "destination_location_id": "loc-jaisalmer", "assigned_route": "Corridor Ahmedabad - Jaisalmer", "availability": "AVAILABLE", "status": "Ready for Dispatch", "fuel_efficiency_kmpl": 3.0},
]

DEMO_ALERTS = [
    {
        "id": "alt-001",
        "alert_type": "PREDICTIVE SHORTAGE",
        "severity": "HIGH",
        "location_id": "loc-srinagar",
        "location_name": "Srinagar Logistics Zone",
        "title": "Fuel Demand Exceeds Projected Stock Threshold",
        "message": "Fuel demand is projected to exceed current available inventory within the forecast horizon (Days of Cover: 7.8 vs 14d buffer).",
        "root_cause": "Increased heating generator demand combined with weather corridor delays.",
        "recommendations": "Dispatch TR-001 heavy carrier from Ahmedabad Logistics Base with 8,000 L fuel prior to afternoon weather deterioration.",
        "is_acknowledged": False,
        "status": "ACTIVE",
        "created_at": "2026-10-02T05:10:00Z"
    },
    {
        "id": "alt-002",
        "alert_type": "PREDICTIVE SHORTAGE",
        "severity": "CRITICAL",
        "location_id": "loc-srinagar",
        "location_name": "Srinagar Logistics Zone",
        "title": "Critical Medical Trauma Kit Depletion Risk",
        "message": "Srinagar Logistics Zone has approximately 5 days of trauma kits remaining against sustained consumption.",
        "root_cause": "Accelerated winter requirements; previous transit consignment delayed.",
        "recommendations": "Prioritize dispatch from Ahmedabad Logistics Base via express logistics courier.",
        "is_acknowledged": False,
        "status": "ACTIVE",
        "created_at": "2026-10-02T04:45:00Z"
    }
]

# ==============================================================================
# API ENDPOINTS
# ==============================================================================

@app.get("/")
def root():
    return {
        "platform": "VYOMIX",
        "tagline": "Predict. Prepare. Deliver.",
        "product": "VYOMIX — Predictive Logistics Intelligence",
        "system_status": "OPERATIONAL",
        "docs": "/docs",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/locations", response_model=List[LocationSchema])
def get_locations():
    return DEMO_LOCATIONS

@app.get("/api/supplies", response_model=List[SupplySchema])
def get_supplies():
    return DEMO_SUPPLIES

@app.get("/api/inventory", response_model=List[InventorySchema])
def get_inventory(location_id: Optional[str] = Query(None)):
    if location_id and location_id != "ALL":
        return [i for i in DEMO_INVENTORY if i["location_id"] == location_id]
    return DEMO_INVENTORY

@app.post("/api/forecast", response_model=ForecastResponse)
def compute_demand_forecast(req: ForecastRequest):
    # Lookup stock
    matching = [i for i in DEMO_INVENTORY if i["location_id"] == req.location_id]
    item = matching[0] if matching else DEMO_INVENTORY[0]

    current_stock = item["current_stock"]
    daily_consumption = item["daily_consumption"]
    safety_threshold = item["safety_threshold"]

    # Run ML model
    pred = demand_forecaster.predict_horizon(
        current_stock=current_stock,
        daily_consumption=daily_consumption,
        safety_threshold=safety_threshold,
        horizon_days=req.horizon_days
    )

    return {
        "location_id": req.location_id,
        "category": req.category,
        "horizon_days": req.horizon_days,
        "current_stock": current_stock,
        "projected_demand": pred["projected_demand"],
        "safety_threshold": safety_threshold,
        "confidence_score": pred["confidence_score"],
        "risk_level": pred["risk_level"],
        "risk_reasons": pred["risk_reasons"],
        "points": pred["points"]
    }

@app.get("/api/weather/observations", response_model=List[WeatherObsSchema])
async def get_weather_observations():
    return await imd_service.get_normalized_observations(DEMO_LOCATIONS)

@app.get("/api/weather/forecast", response_model=List[WeatherForecastDaySchema])
async def get_weather_forecast(location_id: str = "loc-srinagar"):
    return await imd_service.get_normalized_7day_forecast(location_id)

@app.get("/api/transports", response_model=List[TransportAssetSchema])
def get_transports():
    return DEMO_TRANSPORTS

@app.post("/api/simulate", response_model=SimulationResponse)
def execute_simulation(req: SimulationRequest):
    result = simulator_service.simulate(
        demand_change_pct=req.demandChangePct,
        transport_avail_pct=req.transportAvailPct,
        weather_severity=req.weatherSeverity,
        rainfall_mm=req.rainfallMm,
        inventory_starting_pct=req.inventoryStartingPct
    )
    return result

@app.get("/api/alerts", response_model=List[AlertSchema])
def get_alerts():
    return DEMO_ALERTS

@app.post("/api/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str = Path(...)):
    for a in DEMO_ALERTS:
        if a["id"] == alert_id:
            a["is_acknowledged"] = True
            a["status"] = "ACKNOWLEDGED"
            return {"status": "success", "alert_id": alert_id, "state": "ACKNOWLEDGED"}
    raise HTTPException(status_code=404, detail="Alert not found")

@app.post("/api/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str = Path(...)):
    for a in DEMO_ALERTS:
        if a["id"] == alert_id:
            a["status"] = "RESOLVED"
            return {"status": "success", "alert_id": alert_id, "state": "RESOLVED"}
    raise HTTPException(status_code=404, detail="Alert not found")

@app.post("/api/assistant/query", response_model=AssistantQueryResponse)
def assistant_inquiry(req: AssistantQueryRequest):
    return assistant_service.answer_query(req.query)

@app.get("/api/sources")
def get_sources():
    return {
        "status": "active",
        "sources": [
            {"code": "IMD", "name": "India Meteorological Department", "status": "CONNECTED", "latency_ms": 112, "source_type": "Government API"},
            {"code": "SUPABASE", "name": "Supabase PostgreSQL & Realtime", "status": "CONNECTED", "latency_ms": 48, "source_type": "Relational DB"},
            {"code": "OSM", "name": "OpenStreetMap", "status": "CONNECTED", "latency_ms": 65, "source_type": "GIS Cartography"},
            {"code": "DATA_GOV", "name": "data.gov.in Open Data", "status": "AVAILABLE", "latency_ms": 310, "source_type": "Open Data Portal"},
            {"code": "OPENWEATHER", "name": "OpenWeather API (Fallback)", "status": "OPTIONAL", "latency_ms": 180, "source_type": "Secondary Fallback"}
        ]
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
