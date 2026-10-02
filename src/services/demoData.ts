import { 
  LocationNode, 
  SupplyItem, 
  InventoryRecord, 
  TransportAsset, 
  WeatherObservation, 
  WeatherForecastDay,
  AlertItem, 
  DataSourceStatus,
  DemandForecastPoint
} from '../types';

export const PUBLIC_DATA_DISCLAIMER = 
  "Geographic locations represent public regions. Inventory, transport and readiness values are synthetic demonstration data and do not represent actual military operations.";

export const DEMO_LOCATIONS: LocationNode[] = [
  {
    id: 'loc-srinagar',
    code: 'LOC-SXR',
    name: 'Srinagar Logistics Zone',
    type: 'Logistics Zone',
    latitude: 34.0837,
    longitude: 74.7973,
    altitude_m: 1585,
    region: 'Northern Sector',
    status: 'attention',
    inventory_readiness_pct: 78,
    weather_risk: 'HIGH',
    transport_availability_pct: 65,
    days_of_cover: 7.2,
    projected_shortage: 'FUEL / MEDICAL',
    notes: 'High-altitude logistics staging zone with mountain corridor access subject to weather delays.'
  },
  {
    id: 'loc-jaisalmer',
    code: 'LOC-JSA',
    name: 'Jaisalmer Logistics Zone',
    type: 'Logistics Zone',
    latitude: 26.9157,
    longitude: 70.9083,
    altitude_m: 225,
    region: 'Western Sector',
    status: 'operational',
    inventory_readiness_pct: 91,
    weather_risk: 'LOW',
    transport_availability_pct: 86,
    days_of_cover: 14.5,
    projected_shortage: 'NONE',
    notes: 'Arid climate supply staging depot with high solar exposure and heavy fleet capacity.'
  },
  {
    id: 'loc-ahmedabad',
    code: 'LOC-AMD',
    name: 'Ahmedabad Logistics Base',
    type: 'Logistics Base',
    latitude: 23.0225,
    longitude: 72.5714,
    altitude_m: 53,
    region: 'Central Support',
    status: 'operational',
    inventory_readiness_pct: 96,
    weather_risk: 'LOW',
    transport_availability_pct: 94,
    days_of_cover: 22.0,
    projected_shortage: 'NONE',
    notes: 'Primary reserve logistics hub with multi-modal railhead and heavy storage warehousing.'
  },
  {
    id: 'loc-kutch',
    code: 'LOC-KUT',
    name: 'Kutch Logistics Zone',
    type: 'Logistics Zone',
    latitude: 23.2420,
    longitude: 69.6669,
    altitude_m: 110,
    region: 'Coastal Flank',
    status: 'attention',
    inventory_readiness_pct: 74,
    weather_risk: 'MODERATE',
    transport_availability_pct: 70,
    days_of_cover: 8.8,
    projected_shortage: 'WATER',
    notes: 'Coastal frontier logistics zone with specialized bulk water purification requirements.'
  }
];

export const DEMO_SUPPLIES: SupplyItem[] = [
  {
    id: 'sup-fuel',
    item_code: 'SUP-POL-01',
    name: 'High-Altitude Diesel & POL Fuel',
    category: 'Fuel',
    unit: 'Liters',
    criticality: 'CRITICAL',
    shelf_life_days: 720,
    standard_pack_size: 200
  },
  {
    id: 'sup-food',
    item_code: 'SUP-RAT-01',
    name: 'Special Composite MRE Rations',
    category: 'Food',
    unit: 'Ration-Packs',
    criticality: 'HIGH',
    shelf_life_days: 360,
    standard_pack_size: 24
  },
  {
    id: 'sup-med',
    item_code: 'SUP-MED-01',
    name: 'Tactical Trauma & High-Altitude Med Kits',
    category: 'Medical',
    unit: 'Kits',
    criticality: 'CRITICAL',
    shelf_life_days: 180,
    standard_pack_size: 10
  },
  {
    id: 'sup-water',
    item_code: 'SUP-WAT-01',
    name: 'Purified Bulk Potable Water',
    category: 'Water',
    unit: 'Liters',
    criticality: 'CRITICAL',
    shelf_life_days: 90,
    standard_pack_size: 1000
  },
  {
    id: 'sup-gen',
    item_code: 'SUP-GEN-01',
    name: 'Extreme Cold Weather Gear & Spares',
    category: 'General Supplies',
    unit: 'Units',
    criticality: 'MEDIUM',
    shelf_life_days: 1080,
    standard_pack_size: 50
  }
];

export const DEMO_INVENTORY: InventoryRecord[] = [
  // Srinagar Logistics Zone
  {
    id: 'inv-srinagar-fuel',
    location_id: 'loc-srinagar',
    supply_id: 'sup-fuel',
    current_stock: 4820,
    daily_consumption: 510,
    safety_threshold: 3500,
    reorder_point: 5000,
    forecast_demand_7d: 6240,
    days_of_cover: 9.4,
    risk_status: 'MODERATE',
    last_restocked_at: '2026-09-28T04:00:00Z',
    supply: DEMO_SUPPLIES[0],
    location: DEMO_LOCATIONS[0]
  },
  {
    id: 'inv-srinagar-food',
    location_id: 'loc-srinagar',
    supply_id: 'sup-food',
    current_stock: 3200,
    daily_consumption: 310,
    safety_threshold: 1800,
    reorder_point: 2500,
    forecast_demand_7d: 2350,
    days_of_cover: 10.3,
    risk_status: 'LOW',
    last_restocked_at: '2026-09-29T10:00:00Z',
    supply: DEMO_SUPPLIES[1],
    location: DEMO_LOCATIONS[0]
  },
  {
    id: 'inv-srinagar-med',
    location_id: 'loc-srinagar',
    supply_id: 'sup-med',
    current_stock: 145,
    daily_consumption: 28,
    safety_threshold: 120,
    reorder_point: 180,
    forecast_demand_7d: 210,
    days_of_cover: 5.2,
    risk_status: 'HIGH',
    last_restocked_at: '2026-09-26T06:00:00Z',
    supply: DEMO_SUPPLIES[2],
    location: DEMO_LOCATIONS[0]
  },
  {
    id: 'inv-srinagar-water',
    location_id: 'loc-srinagar',
    supply_id: 'sup-water',
    current_stock: 8500,
    daily_consumption: 750,
    safety_threshold: 4500,
    reorder_point: 6000,
    forecast_demand_7d: 5800,
    days_of_cover: 11.3,
    risk_status: 'LOW',
    last_restocked_at: '2026-09-30T12:00:00Z',
    supply: DEMO_SUPPLIES[3],
    location: DEMO_LOCATIONS[0]
  },
  {
    id: 'inv-srinagar-gen',
    location_id: 'loc-srinagar',
    supply_id: 'sup-gen',
    current_stock: 780,
    daily_consumption: 35,
    safety_threshold: 300,
    reorder_point: 500,
    forecast_demand_7d: 280,
    days_of_cover: 22.3,
    risk_status: 'LOW',
    last_restocked_at: '2026-09-24T08:00:00Z',
    supply: DEMO_SUPPLIES[4],
    location: DEMO_LOCATIONS[0]
  },

  // Ahmedabad Logistics Base (Heavy Reserves)
  {
    id: 'inv-amd-fuel',
    location_id: 'loc-ahmedabad',
    supply_id: 'sup-fuel',
    current_stock: 28500,
    daily_consumption: 1100,
    safety_threshold: 8000,
    reorder_point: 12000,
    forecast_demand_7d: 8200,
    days_of_cover: 25.9,
    risk_status: 'LOW',
    last_restocked_at: '2026-10-01T15:00:00Z',
    supply: DEMO_SUPPLIES[0],
    location: DEMO_LOCATIONS[2]
  },
  {
    id: 'inv-amd-med',
    location_id: 'loc-ahmedabad',
    supply_id: 'sup-med',
    current_stock: 2400,
    daily_consumption: 40,
    safety_threshold: 500,
    reorder_point: 800,
    forecast_demand_7d: 300,
    days_of_cover: 60.0,
    risk_status: 'LOW',
    last_restocked_at: '2026-10-01T15:00:00Z',
    supply: DEMO_SUPPLIES[2],
    location: DEMO_LOCATIONS[2]
  },

  // Jaisalmer Logistics Zone
  {
    id: 'inv-jsa-fuel',
    location_id: 'loc-jaisalmer',
    supply_id: 'sup-fuel',
    current_stock: 8200,
    daily_consumption: 620,
    safety_threshold: 3500,
    reorder_point: 5500,
    forecast_demand_7d: 4500,
    days_of_cover: 13.2,
    risk_status: 'LOW',
    last_restocked_at: '2026-09-30T09:00:00Z',
    supply: DEMO_SUPPLIES[0],
    location: DEMO_LOCATIONS[1]
  },
  {
    id: 'inv-jsa-water',
    location_id: 'loc-jaisalmer',
    supply_id: 'sup-water',
    current_stock: 12500,
    daily_consumption: 1100,
    safety_threshold: 6000,
    reorder_point: 9000,
    forecast_demand_7d: 8100,
    days_of_cover: 11.3,
    risk_status: 'LOW',
    last_restocked_at: '2026-09-29T11:00:00Z',
    supply: DEMO_SUPPLIES[3],
    location: DEMO_LOCATIONS[1]
  },

  // Kutch Logistics Zone
  {
    id: 'inv-kut-water',
    location_id: 'loc-kutch',
    supply_id: 'sup-water',
    current_stock: 4200,
    daily_consumption: 820,
    safety_threshold: 4000,
    reorder_point: 6000,
    forecast_demand_7d: 6100,
    days_of_cover: 5.1,
    risk_status: 'HIGH',
    last_restocked_at: '2026-09-28T10:00:00Z',
    supply: DEMO_SUPPLIES[3],
    location: DEMO_LOCATIONS[3]
  },
  {
    id: 'inv-kut-fuel',
    location_id: 'loc-kutch',
    supply_id: 'sup-fuel',
    current_stock: 4100,
    daily_consumption: 450,
    safety_threshold: 2500,
    reorder_point: 3800,
    forecast_demand_7d: 3200,
    days_of_cover: 9.1,
    risk_status: 'MODERATE',
    last_restocked_at: '2026-09-27T14:00:00Z',
    supply: DEMO_SUPPLIES[0],
    location: DEMO_LOCATIONS[3]
  }
];

export const DEMO_TRANSPORTS: TransportAsset[] = [
  {
    id: 'tr-001',
    asset_code: 'TR-001',
    name: 'Heavy Logistics Carrier',
    type: 'Heavy Transport',
    capacity_tonnes: 8.0,
    current_location_id: 'loc-ahmedabad',
    destination_location_id: 'loc-srinagar',
    current_location_name: 'Ahmedabad Logistics Base',
    destination_location_name: 'Srinagar Logistics Zone',
    assigned_route: 'Corridor West-North',
    availability: 'AVAILABLE',
    status: 'Operational',
    fuel_efficiency_kmpl: 3.2,
    last_updated: '15 min ago'
  },
  {
    id: 'tr-002',
    asset_code: 'TR-002',
    name: 'Medium Hauler Unit 02',
    type: 'Medium Transport',
    capacity_tonnes: 5.0,
    current_location_id: 'loc-srinagar',
    current_location_name: 'Srinagar Logistics Zone',
    assigned_route: 'Standby Depot Srinagar',
    availability: 'MAINTENANCE',
    status: 'Routine Brake Servicing',
    fuel_efficiency_kmpl: 4.1,
    last_updated: '30 min ago'
  },
  {
    id: 'tr-003',
    asset_code: 'TR-003',
    name: 'All-Terrain Transit Hauler',
    type: 'Light 4x4',
    capacity_tonnes: 2.5,
    current_location_id: 'loc-kutch',
    destination_location_id: 'loc-jaisalmer',
    current_location_name: 'Kutch Logistics Zone',
    destination_location_name: 'Jaisalmer Logistics Zone',
    assigned_route: 'Coastal-Desert Transit',
    availability: 'IN_TRANSIT',
    status: 'En-route with Water Purification Modules',
    fuel_efficiency_kmpl: 5.8,
    last_updated: '5 min ago'
  },
  {
    id: 'tr-004',
    asset_code: 'TR-004',
    name: 'Heavy Convoy Unit Falcon',
    type: 'Convoy Unit',
    capacity_tonnes: 24.0,
    current_location_id: 'loc-ahmedabad',
    destination_location_id: 'loc-kutch',
    current_location_name: 'Ahmedabad Logistics Base',
    destination_location_name: 'Kutch Logistics Zone',
    assigned_route: 'Highway Central-Kutch',
    availability: 'AVAILABLE',
    status: 'Ready for Staged Dispatch',
    fuel_efficiency_kmpl: 3.0,
    last_updated: '20 min ago'
  }
];

export const DEMO_WEATHER_OBSERVATIONS: WeatherObservation[] = [
  {
    id: 'w-obs-srinagar',
    location_id: 'loc-srinagar',
    location_name: 'Srinagar Logistics Zone',
    recorded_at: '2026-10-02T07:30:00Z',
    temperature_c: 8.2,
    humidity_pct: 84,
    rainfall_mm: 18.5,
    wind_speed_kmh: 32,
    weather_condition: 'Heavy Mountain Rain / Sleet',
    visibility_km: 3.2,
    warning_level: 'ORANGE',
    warning_text: 'IMD Nowcast: Moderate to heavy precipitation along northern passes.',
    source: 'IMD',
    is_live: false
  },
  {
    id: 'w-obs-jaisalmer',
    location_id: 'loc-jaisalmer',
    location_name: 'Jaisalmer Logistics Zone',
    recorded_at: '2026-10-02T07:15:00Z',
    temperature_c: 34.0,
    humidity_pct: 28,
    rainfall_mm: 0.0,
    wind_speed_kmh: 18,
    weather_condition: 'Clear / Arid',
    visibility_km: 10.0,
    warning_level: 'GREEN',
    warning_text: 'Normal desert conditions; transport routes fully open.',
    source: 'IMD',
    is_live: false
  },
  {
    id: 'w-obs-ahmedabad',
    location_id: 'loc-ahmedabad',
    location_name: 'Ahmedabad Logistics Base',
    recorded_at: '2026-10-02T07:00:00Z',
    temperature_c: 29.5,
    humidity_pct: 54,
    rainfall_mm: 0.0,
    wind_speed_kmh: 12,
    weather_condition: 'Partly Cloudy',
    visibility_km: 9.5,
    warning_level: 'GREEN',
    warning_text: 'Optimal transit conditions across central logistics corridors.',
    source: 'IMD',
    is_live: false
  },
  {
    id: 'w-obs-kutch',
    location_id: 'loc-kutch',
    location_name: 'Kutch Logistics Zone',
    recorded_at: '2026-10-02T07:20:00Z',
    temperature_c: 31.0,
    humidity_pct: 72,
    rainfall_mm: 4.5,
    wind_speed_kmh: 26,
    weather_condition: 'Breezy / Coastal Overcast',
    visibility_km: 7.0,
    warning_level: 'YELLOW',
    warning_text: 'Coastal breeze; light precipitation across marshland fringes.',
    source: 'IMD',
    is_live: false
  }
];

export const DEMO_WEATHER_FORECAST_DAYS: WeatherForecastDay[] = [
  { date: 'Today (02 Oct)', dayName: 'Thu', tempMin: 6, tempMax: 14, rainfallMm: 18.5, rainfallProbPct: 85, condition: 'Heavy Rain / Sleet', warningLevel: 'ORANGE', source: 'IMD' },
  { date: 'Tomorrow (03 Oct)', dayName: 'Fri', tempMin: 4, tempMax: 11, rainfallMm: 22.0, rainfallProbPct: 90, condition: 'Persistent Heavy Rain', warningLevel: 'ORANGE', source: 'IMD' },
  { date: '04 Oct', dayName: 'Sat', tempMin: 3, tempMax: 10, rainfallMm: 10.0, rainfallProbPct: 60, condition: 'Scattered Showers', warningLevel: 'YELLOW', source: 'IMD' },
  { date: '05 Oct', dayName: 'Sun', tempMin: 2, tempMax: 12, rainfallMm: 3.0, rainfallProbPct: 30, condition: 'Overcast', warningLevel: 'GREEN', source: 'IMD' },
  { date: '06 Oct', dayName: 'Mon', tempMin: 4, tempMax: 15, rainfallMm: 0.5, rainfallProbPct: 15, condition: 'Partly Cloudy', warningLevel: 'GREEN', source: 'IMD' },
  { date: '07 Oct', dayName: 'Tue', tempMin: 5, tempMax: 16, rainfallMm: 0.0, rainfallProbPct: 10, condition: 'Clear Skies', warningLevel: 'GREEN', source: 'IMD' },
  { date: '08 Oct', dayName: 'Wed', tempMin: 6, tempMax: 16, rainfallMm: 0.0, rainfallProbPct: 5, condition: 'Clear Skies', warningLevel: 'GREEN', source: 'IMD' },
];

export const DEMO_ALERTS: AlertItem[] = [
  {
    id: 'alt-001',
    alert_type: 'Predictive Shortage',
    severity: 'HIGH',
    location_id: 'loc-srinagar',
    location_name: 'Srinagar Logistics Zone',
    category: 'Fuel',
    title: 'Fuel Demand Exceeds Projected Stock Buffer',
    message: 'Fuel demand is projected to exceed current available inventory within the 7-day forecast horizon (Days of Cover: 9.4 days vs 14-day mission requirement).',
    root_cause: 'Projected demand increase (+24%) + inventory approaching safety threshold (3,500L) + rain pass slowdown.',
    recommendations: 'Dispatch TR-001 heavy carrier from Ahmedabad Logistics Base with 8,000 L fuel reserve.',
    is_acknowledged: false,
    status: 'ACTIVE',
    created_at: '2026-10-02T05:10:00Z'
  },
  {
    id: 'alt-002',
    alert_type: 'Weather',
    severity: 'HIGH',
    location_id: 'loc-srinagar',
    location_name: 'Srinagar Logistics Zone',
    title: 'IMD Orange Warning: Heavy Mountain Precipitation',
    message: 'Torrential rainfall (18.5 mm) reported along mountain corridor; road transit speed degraded by 40%.',
    root_cause: 'Active Western Disturbance reported in IMD regional telemetry.',
    recommendations: 'Shift non-bulk priority dispatches to Light 4x4 assets; hold heavy convoys until evening.',
    is_acknowledged: false,
    status: 'ACTIVE',
    created_at: '2026-10-02T05:25:00Z'
  },
  {
    id: 'alt-003',
    alert_type: 'Predictive Shortage',
    severity: 'CRITICAL',
    location_id: 'loc-srinagar',
    location_name: 'Srinagar Logistics Zone',
    category: 'Medical',
    title: 'Medical Trauma Kit Depletion Risk',
    message: 'Srinagar Logistics Zone has only 5.2 days of medical trauma kits remaining (145 kits in stock vs 210 projected requirement).',
    root_cause: 'Recent deployment surge in high-altitude frostbite treatments coinciding with road transit delay.',
    recommendations: 'Authorize priority emergency express courier dispatch from Ahmedabad Base.',
    is_acknowledged: false,
    status: 'ACTIVE',
    created_at: '2026-10-02T04:45:00Z'
  },
  {
    id: 'alt-004',
    alert_type: 'Predictive Shortage',
    severity: 'HIGH',
    location_id: 'loc-kutch',
    location_name: 'Kutch Logistics Zone',
    category: 'Water',
    title: 'Purified Water Reserve Below Safety Ceiling',
    message: 'Bulk potable water reserves (4,200 L) are at 5.1 Days of Cover against high salinity environment.',
    root_cause: 'Auxiliary desalination plant undergoing maintenance.',
    recommendations: 'Reassign TR-004 convoy unit from Ahmedabad to deliver thermal bowsers.',
    is_acknowledged: false,
    status: 'ACTIVE',
    created_at: '2026-10-02T06:00:00Z'
  }
];

export const DEMO_DATA_SOURCES: DataSourceStatus[] = [
  {
    id: 'src-imd',
    code: 'IMD',
    name: 'India Meteorological Department (Mausam API)',
    source_type: 'Meteorological Telemetry',
    endpoint_url: 'https://mausam.imd.gov.in/imd_latest/contents/api.pdf',
    status: 'CONNECTED',
    last_sync_at: '12:34 IST (15m interval)',
    records_ingested: 1420,
    latency_ms: 112,
    purpose: 'City weather, district nowcasts, and severe precipitation warnings.',
    source: 'Official IMD Mausam Gateway',
    notes: 'Normalized on backend; fallback engages automatically if gateway is unreachable.'
  },
  {
    id: 'src-supa',
    code: 'SUPABASE',
    name: 'Supabase PostgreSQL & Realtime',
    source_type: 'Relational Database & CDC',
    endpoint_url: 'https://supabase.co',
    status: 'CONNECTED',
    last_sync_at: 'Realtime active',
    records_ingested: 9850,
    latency_ms: 48,
    purpose: 'Persistent stock ledger, alerts audit log, and fleet statuses.',
    source: 'Supabase Cloud (PostgreSQL 15)',
    notes: 'Row Level Security applied. Anonymous updates restricted to authenticated officers.'
  },
  {
    id: 'src-osm',
    code: 'OSM',
    name: 'OpenStreetMap Standard Tiles',
    source_type: 'GIS Cartography Layer',
    endpoint_url: 'https://tile.openstreetmap.org',
    status: 'CONNECTED',
    last_sync_at: 'Tile CDN active',
    records_ingested: 450,
    latency_ms: 65,
    purpose: 'High-contrast topographic geographic base tiles.',
    source: 'OpenStreetMap Foundation CDN',
    notes: 'Reliable global standard cartographic tile stream.'
  },
  {
    id: 'src-data-gov',
    code: 'DATA_GOV',
    name: 'Government Open Data Portal (data.gov.in)',
    source_type: 'Public Consumption Benchmarks',
    endpoint_url: 'https://data.gov.in/api/v1',
    status: 'AVAILABLE',
    last_sync_at: '2 hours ago',
    records_ingested: 3200,
    latency_ms: 310,
    purpose: 'Historical district consumption patterns and road transit baselines.',
    source: 'National Data Sharing & Accessibility Portal',
    notes: 'Importable via CSV or JSON abstraction on backend.'
  },
  {
    id: 'src-owm',
    code: 'OPENWEATHER',
    name: 'OpenWeather API (Secondary Backup)',
    source_type: 'Commercial Weather Provider',
    endpoint_url: 'https://api.openweathermap.org/data/2.5',
    status: 'OPTIONAL',
    last_sync_at: 'Standby',
    records_ingested: 450,
    latency_ms: 180,
    purpose: 'Redundant fallback channel if IMD gateway undergoes scheduled maintenance.',
    source: 'OpenWeatherMap API',
    notes: 'Configurable via backend OPENWEATHER_API_KEY environment variable.'
  }
];

export function generateForecastTimeline(baseStock: number = 4820, dailyBurn: number = 510): DemandForecastPoint[] {
  const points: DemandForecastPoint[] = [];
  const days = ['26 Sep', '27 Sep', '28 Sep', '29 Sep', '30 Sep', '01 Oct', '02 Oct (Today)', '03 Oct', '04 Oct', '05 Oct', '06 Oct', '07 Oct', '08 Oct', '09 Oct'];
  
  for (let i = 0; i < 14; i++) {
    const isHistorical = i < 7;
    const baseDemand = dailyBurn * (1 + (i - 6) * 0.035);
    const noise = Math.sin(i * 1.8) * 35;
    const demand = Math.round(baseDemand + noise);
    const rainfall = i >= 6 && i <= 8 ? (i === 7 ? 22 : 18) : (i === 6 ? 10 : 0);
    
    points.push({
      date: days[i],
      historicalDemand: isHistorical ? Math.round(dailyBurn + Math.sin(i) * 30 - 20) : undefined,
      forecastDemand: demand,
      upperConfidence: Math.round(demand * 1.12),
      lowerConfidence: Math.round(demand * 0.88),
      rainfallMm: rainfall,
      riskLevel: demand > dailyBurn * 1.2 ? 'HIGH' : (demand > dailyBurn * 1.05 ? 'MODERATE' : 'LOW')
    });
  }
  
  return points;
}
