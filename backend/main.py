"""
VYOMIX — Predictive Logistics & Forward Supply Chain Intelligence Platform
FastAPI Backend Application
Problem Statement: SIH2625 | Indian Army Predictive Logistics
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
    title="VYOMIX Tactical Logistics Intelligence API",
    description="Backend microservices supporting AI predictive logistics, IMD weather ingestion, and forward supply-chain planning for the Indian Army (SIH2625).",
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
# IN-MEMORY DEMO STATE (Synchronized with seed.sql)
# ==============================================================================
DEMO_LOCATIONS = [
    {
        "id": "loc-sh-n",
        "code": "LOC-SH-N",
        "name": "Supply Hub North",
        "type": "Supply Hub",
        "latitude": 34.0837,
        "longitude": 74.7973,
        "altitude_m": 1585,
        "region": "Northern Sector",
        "status": "operational",
        "inventory_readiness_pct": 82.0,
        "weather_risk": "LOW",
        "transport_availability_pct": 91.0,
        "projected_shortage": "NONE",
        "notes": "Central logistics node for northern forward operational commands."
    },
    {
        "id": "loc-sh-c",
        "code": "LOC-SH-C",
        "name": "Supply Hub Central",
        "type": "Supply Hub",
        "latitude": 32.7266,
        "longitude": 74.8570,
        "altitude_m": 327,
        "region": "Central Reserve",
        "status": "operational",
        "inventory_readiness_pct": 94.0,
        "weather_risk": "LOW",
        "transport_availability_pct": 88.0,
        "projected_shortage": "NONE",
        "notes": "High-capacity heavy logistics base with dual runway and railhead links."
    },
    {
        "id": "loc-dn-a",
        "code": "LOC-DN-A",
        "name": "Distribution Node Alpha",
        "type": "Distribution Node",
        "latitude": 33.7782,
        "longitude": 75.1500,
        "altitude_m": 2200,
        "region": "Eastern Flank",
        "status": "attention",
        "inventory_readiness_pct": 68.0,
        "weather_risk": "HIGH",
        "transport_availability_pct": 62.0,
        "projected_shortage": "FUEL / MEDICAL",
        "notes": "Mountain transit point with single-lane access corridor vulnerable to rain."
    },
    {
        "id": "loc-dn-b",
        "code": "LOC-DN-B",
        "name": "Distribution Node Bravo",
        "type": "Distribution Node",
        "latitude": 33.2778,
        "longitude": 74.3405,
        "altitude_m": 1750,
        "region": "Western Ridge",
        "status": "operational",
        "inventory_readiness_pct": 89.0,
        "weather_risk": "MODERATE",
        "transport_availability_pct": 74.0,
        "projected_shortage": "NONE",
        "notes": "Sub-depot staging point for mobile tactical brigades."
    },
    {
        "id": "loc-fn-a",
        "code": "LOC-FN-A",
        "name": "Forward Node A",
        "type": "Forward Node",
        "latitude": 34.4250,
        "longitude": 75.3200,
        "altitude_m": 3100,
        "region": "High Altitude Pass",
        "status": "critical",
        "inventory_readiness_pct": 58.0,
        "weather_risk": "HIGH",
        "transport_availability_pct": 50.0,
        "projected_shortage": "WATER / MEDICAL",
        "notes": "High-altitude outpost; weather-dependent resupply via specialized convoys."
    },
    {
        "id": "loc-fn-b",
        "code": "LOC-FN-B",
        "name": "Forward Node B",
        "type": "Forward Node",
        "latitude": 34.1980,
        "longitude": 74.5800,
        "altitude_m": 2650,
        "region": "Valley Perimeter",
        "status": "operational",
        "inventory_readiness_pct": 86.0,
        "weather_risk": "LOW",
        "transport_availability_pct": 82.0,
        "projected_shortage": "NONE",
        "notes": "Forward perimeter logistics post equipped with all-weather landing pad."
    }
]

DEMO_SUPPLIES = [
    {"id": "sup-fuel", "item_code": "SUP-POL-01", "name": "High-Altitude Diesel & POL Fuel", "category": "Fuel", "unit": "Liters", "criticality": "CRITICAL", "shelf_life_days": 720},
    {"id": "sup-food", "item_code": "SUP-RAT-01", "name": "Special Composite MRE Rations", "category": "Food", "unit": "Ration-Packs", "criticality": "HIGH", "shelf_life_days": 360},
    {"id": "sup-med", "item_code": "SUP-MED-01", "name": "Tactical Trauma & High-Altitude Med Kits", "category": "Medical", "unit": "Kits", "criticality": "CRITICAL", "shelf_life_days": 180},
    {"id": "sup-water", "item_code": "SUP-WAT-01", "name": "Purified Bulk Potable Water", "category": "Water", "unit": "Liters", "criticality": "CRITICAL", "shelf_life_days": 90},
    {"id": "sup-gen", "item_code": "SUP-GEN-01", "name": "Extreme Cold Weather Gear & Spares", "category": "General Supplies", "unit": "Units", "criticality": "MEDIUM", "shelf_life_days": 1080},
]

DEMO_INVENTORY = [
    {
        "id": "inv-dna-fuel",
        "location_id": "loc-dn-a",
        "supply_id": "sup-fuel",
        "current_stock": 4820.0,
        "daily_consumption": 510.0,
        "safety_threshold": 3500.0,
        "reorder_point": 5000.0,
        "forecast_demand_7d": 6240.0,
        "days_of_cover": 9.4,
        "risk_status": "MODERATE",
        "last_restocked_at": "2026-09-28T04:00:00Z",
        "supply": DEMO_SUPPLIES[0],
        "location": DEMO_LOCATIONS[2]
    },
    {
        "id": "inv-dna-med",
        "location_id": "loc-dn-a",
        "supply_id": "sup-med",
        "current_stock": 145.0,
        "daily_consumption": 28.0,
        "safety_threshold": 120.0,
        "reorder_point": 180.0,
        "forecast_demand_7d": 210.0,
        "days_of_cover": 5.2,
        "risk_status": "HIGH",
        "last_restocked_at": "2026-09-26T06:00:00Z",
        "supply": DEMO_SUPPLIES[2],
        "location": DEMO_LOCATIONS[2]
    },
    {
        "id": "inv-fna-med",
        "location_id": "loc-fn-a",
        "supply_id": "sup-med",
        "current_stock": 42.0,
        "daily_consumption": 14.0,
        "safety_threshold": 40.0,
        "reorder_point": 60.0,
        "forecast_demand_7d": 110.0,
        "days_of_cover": 3.0,
        "risk_status": "CRITICAL",
        "last_restocked_at": "2026-09-22T05:00:00Z",
        "supply": DEMO_SUPPLIES[2],
        "location": DEMO_LOCATIONS[4]
    }
]

DEMO_TRANSPORTS = [
    {"id": "tr-001", "asset_code": "TR-001", "name": "Heavy Transport Carrier", "type": "Heavy Transport", "capacity_tonnes": 8.0, "current_location_id": "loc-sh-n", "destination_location_id": "loc-dn-a", "assigned_route": "Corridor North-Alpha", "availability": "AVAILABLE", "status": "Operational", "fuel_efficiency_kmpl": 3.2},
    {"id": "tr-002", "asset_code": "TR-002", "name": "Medium Hauler 02", "type": "Medium Transport", "capacity_tonnes": 5.0, "current_location_id": "loc-dn-a", "destination_location_id": None, "assigned_route": "Standby Depot Alpha", "availability": "MAINTENANCE", "status": "Brake Assembly Overhaul", "fuel_efficiency_kmpl": 4.1},
    {"id": "tr-003", "asset_code": "TR-003", "name": "All-Terrain Recon Hauler", "type": "Light 4x4", "capacity_tonnes": 2.5, "current_location_id": "loc-dn-a", "destination_location_id": "loc-fn-a", "assigned_route": "Pass High-Ascent", "availability": "IN_TRANSIT", "status": "En-route with Emergency Med Pack", "fuel_efficiency_kmpl": 5.8},
    {"id": "tr-004", "asset_code": "TR-004", "name": "Tactical Convoy Unit Falcon", "type": "Convoy Unit", "capacity_tonnes": 24.0, "current_location_id": "loc-sh-c", "destination_location_id": "loc-sh-n", "assigned_route": "Highway Central-North", "availability": "AVAILABLE", "status": "Ready for Staged Dispatch", "fuel_efficiency_kmpl": 3.0},
]

DEMO_ALERTS = [
    {
        "id": "alt-001",
        "alert_type": "PREDICTIVE SHORTAGE",
        "severity": "HIGH",
        "location_id": "loc-dn-a",
        "location_name": "Distribution Node Alpha",
        "title": "Fuel Demand Exceeds Projected Stock Threshold",
        "message": "Fuel demand is projected to exceed current available inventory within the forecast horizon (Days of Cover: 9.4 vs 14d mission buffer).",
        "root_cause": "Projected demand increase (+24%) + inventory approaching safety threshold (3,500L) + transport corridor degraded by rain.",
        "recommendations": "Dispatch TR-001 heavy carrier from Supply Hub North with 8,000 L fuel prior to afternoon weather deterioration.",
        "is_acknowledged": False,
        "status": "ACTIVE",
        "created_at": "2026-10-02T05:10:00Z"
    },
    {
        "id": "alt-003",
        "alert_type": "PREDICTIVE SHORTAGE",
        "severity": "CRITICAL",
        "location_id": "loc-fn-a",
        "location_name": "Forward Node A",
        "title": "Critical Medical Trauma Kit Depletion Imminent",
        "message": "Forward Node A has only 3.0 days of medical trauma kits remaining (42 kits in stock vs 110 projected 7-day requirement).",
        "root_cause": "Expedited winter deployment surge in high-altitude frostbite treatments coinciding with road pass blockage.",
        "recommendations": "Authorize priority emergency airlift or snow-cleared armored carrier resupply immediately from Supply Hub North.",
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
        "system_status": "OPERATIONAL",
        "problem_statement": "SIH2625 | Indian Army Predictive Logistics",
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
    if location_id:
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
async def get_weather_forecast(location_id: str = "loc-dn-a"):
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
            {"code": "OSM", "name": "OpenStreetMap Tactical Tiles", "status": "CONNECTED", "latency_ms": 65, "source_type": "GIS Cartography"},
            {"code": "DATA_GOV", "name": "data.gov.in Open Data", "status": "AVAILABLE", "latency_ms": 310, "source_type": "Open Data Portal"},
            {"code": "OPENWEATHER", "name": "OpenWeather Standby API", "status": "OPTIONAL", "latency_ms": 180, "source_type": "Secondary Fallback"}
        ]
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
