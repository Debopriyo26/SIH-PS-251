from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class LocationSchema(BaseModel):
    id: str
    code: str
    name: str
    type: str
    latitude: float
    longitude: float
    altitude_m: int
    region: str
    status: str
    inventory_readiness_pct: float
    weather_risk: str
    transport_availability_pct: float
    projected_shortage: str
    notes: Optional[str] = None

class SupplySchema(BaseModel):
    id: str
    item_code: str
    name: str
    category: str
    unit: str
    criticality: str
    shelf_life_days: int

class InventorySchema(BaseModel):
    id: str
    location_id: str
    supply_id: str
    current_stock: float
    daily_consumption: float
    safety_threshold: float
    reorder_point: float
    forecast_demand_7d: float
    days_of_cover: float
    risk_status: str
    last_restocked_at: Optional[str] = None
    supply: Optional[SupplySchema] = None
    location: Optional[LocationSchema] = None

class WeatherObsSchema(BaseModel):
    id: str
    location_id: str
    location_name: Optional[str] = None
    recorded_at: str
    temperature_c: float
    humidity_pct: float
    rainfall_mm: float
    wind_speed_kmh: float
    weather_condition: str
    visibility_km: float
    warning_level: str
    warning_text: str
    source: str = "IMD"

class WeatherForecastDaySchema(BaseModel):
    date: str
    dayName: str
    tempMin: float
    tempMax: float
    rainfallMm: float
    rainfallProbPct: float
    condition: str
    warningLevel: str
    source: str = "IMD"

class TransportAssetSchema(BaseModel):
    id: str
    asset_code: str
    name: str
    type: str
    capacity_tonnes: float
    current_location_id: Optional[str] = None
    destination_location_id: Optional[str] = None
    assigned_route: str
    availability: str
    status: str
    fuel_efficiency_kmpl: float

class ForecastRequest(BaseModel):
    location_id: str
    category: str
    horizon_days: int = 7

class ForecastPointSchema(BaseModel):
    date: str
    historicalDemand: Optional[float] = None
    forecastDemand: float
    upperConfidence: float
    lowerConfidence: float
    rainfallMm: float
    riskLevel: str

class ForecastResponse(BaseModel):
    location_id: str
    category: str
    horizon_days: int
    current_stock: float
    projected_demand: float
    safety_threshold: float
    confidence_score: float
    risk_level: str
    risk_reasons: List[str]
    points: List[ForecastPointSchema]

class SimulationRequest(BaseModel):
    demandChangePct: float = Field(0.0, ge=-50.0, le=100.0)
    transportAvailPct: float = Field(0.0, ge=-60.0, le=50.0)
    weatherSeverity: str = Field("LOW")
    rainfallMm: float = Field(0.0, ge=0.0, le=100.0)
    inventoryStartingPct: float = Field(100.0, ge=50.0, le=150.0)

class CategorySimResult(BaseModel):
    category: str
    baselineDaysOfCover: float
    simulatedDaysOfCover: float
    baselineRisk: str
    simulatedRisk: str
    projectedShortageUnits: float
    unit: str
    stressFactor: str

class SimulationResponse(BaseModel):
    baselineRisk: str
    simulatedRisk: str
    affectedCategories: List[str]
    overallReadinessBefore: int
    overallReadinessAfter: int
    categoryResults: List[CategorySimResult]
    recommendations: List[str]

class AlertSchema(BaseModel):
    id: str
    alert_type: str
    severity: str
    location_id: Optional[str] = None
    location_name: Optional[str] = None
    title: str
    message: str
    root_cause: Optional[str] = None
    recommendations: Optional[str] = None
    is_acknowledged: bool
    status: str
    created_at: str

class AssistantQueryRequest(BaseModel):
    query: str

class AssistantQueryResponse(BaseModel):
    id: str
    role: str = "assistant"
    content: str
    timestamp: str
    sourcesUsed: List[str]
    suggestedPrompts: List[str]
