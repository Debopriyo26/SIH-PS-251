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

export const DEMO_LOCATIONS: LocationNode[] = [
  {
    id: 'loc-sh-n',
    code: 'LOC-SH-N',
    name: 'Supply Hub North',
    type: 'Supply Hub',
    latitude: 34.0837,
    longitude: 74.7973,
    altitude_m: 1585,
    region: 'Northern Sector',
    status: 'operational',
    inventory_readiness_pct: 82,
    weather_risk: 'LOW',
    transport_availability_pct: 91,
    projected_shortage: 'NONE',
    notes: 'Central heavy logistics base with dual runway and multi-corridor transit.'
  },
  {
    id: 'loc-sh-c',
    code: 'LOC-SH-C',
    name: 'Supply Hub Central',
    type: 'Supply Hub',
    latitude: 32.7266,
    longitude: 74.8570,
    altitude_m: 327,
    region: 'Central Reserve',
    status: 'operational',
    inventory_readiness_pct: 94,
    weather_risk: 'LOW',
    transport_availability_pct: 88,
    projected_shortage: 'NONE',
    notes: 'Primary reserve depot linking railway corridors to forward tactical commands.'
  },
  {
    id: 'loc-dn-a',
    code: 'LOC-DN-A',
    name: 'Distribution Node Alpha',
    type: 'Distribution Node',
    latitude: 33.7782,
    longitude: 75.1500,
    altitude_m: 2200,
    region: 'Eastern Flank',
    status: 'attention',
    inventory_readiness_pct: 68,
    weather_risk: 'HIGH',
    transport_availability_pct: 62,
    projected_shortage: 'FUEL / MEDICAL',
    notes: 'Single mountain pass transit corridor experiencing rainfall-triggered degradation.'
  },
  {
    id: 'loc-dn-b',
    code: 'LOC-DN-B',
    name: 'Distribution Node Bravo',
    type: 'Distribution Node',
    latitude: 33.2778,
    longitude: 74.3405,
    altitude_m: 1750,
    region: 'Western Ridge',
    status: 'operational',
    inventory_readiness_pct: 89,
    weather_risk: 'MODERATE',
    transport_availability_pct: 74,
    projected_shortage: 'NONE',
    notes: 'Sub-depot staging point supporting mobile high-altitude reconnaissance detachments.'
  },
  {
    id: 'loc-fn-a',
    code: 'LOC-FN-A',
    name: 'Forward Node A',
    type: 'Forward Node',
    latitude: 34.4250,
    longitude: 75.3200,
    altitude_m: 3100,
    region: 'High Altitude Pass',
    status: 'critical',
    inventory_readiness_pct: 58,
    weather_risk: 'HIGH',
    transport_availability_pct: 50,
    projected_shortage: 'WATER / MEDICAL',
    notes: 'High-altitude outpost; road access heavily constrained by snowfall and low visibility.'
  },
  {
    id: 'loc-fn-b',
    code: 'LOC-FN-B',
    name: 'Forward Node B',
    type: 'Forward Node',
    latitude: 34.1980,
    longitude: 74.5800,
    altitude_m: 2650,
    region: 'Valley Perimeter',
    status: 'operational',
    inventory_readiness_pct: 86,
    weather_risk: 'LOW',
    transport_availability_pct: 82,
    projected_shortage: 'NONE',
    notes: 'Forward fortified perimeter post equipped with all-weather emergency helipad.'
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
  // Distribution Node Alpha (Highlighted in requirement: Fuel 4,820 L, 510 L/day, Forecast 6,240 L, Days 9.4, Risk MODERATE)
  {
    id: 'inv-dna-fuel',
    location_id: 'loc-dn-a',
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
    location: DEMO_LOCATIONS[2]
  },
  {
    id: 'inv-dna-food',
    location_id: 'loc-dn-a',
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
    location: DEMO_LOCATIONS[2]
  },
  {
    id: 'inv-dna-med',
    location_id: 'loc-dn-a',
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
    location: DEMO_LOCATIONS[2]
  },
  {
    id: 'inv-dna-water',
    location_id: 'loc-dn-a',
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
    location: DEMO_LOCATIONS[2]
  },
  {
    id: 'inv-dna-gen',
    location_id: 'loc-dn-a',
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
    location: DEMO_LOCATIONS[2]
  },

  // Supply Hub North (Robust reserves)
  {
    id: 'inv-shn-fuel',
    location_id: 'loc-sh-n',
    supply_id: 'sup-fuel',
    current_stock: 24500,
    daily_consumption: 1400,
    safety_threshold: 7000,
    reorder_point: 10000,
    forecast_demand_7d: 10500,
    days_of_cover: 17.5,
    risk_status: 'LOW',
    last_restocked_at: '2026-10-01T15:00:00Z',
    supply: DEMO_SUPPLIES[0],
    location: DEMO_LOCATIONS[0]
  },
  {
    id: 'inv-shn-food',
    location_id: 'loc-sh-n',
    supply_id: 'sup-food',
    current_stock: 15200,
    daily_consumption: 850,
    safety_threshold: 4000,
    reorder_point: 6000,
    forecast_demand_7d: 6200,
    days_of_cover: 17.9,
    risk_status: 'LOW',
    last_restocked_at: '2026-10-01T15:00:00Z',
    supply: DEMO_SUPPLIES[1],
    location: DEMO_LOCATIONS[0]
  },
  {
    id: 'inv-shn-med',
    location_id: 'loc-sh-n',
    supply_id: 'sup-med',
    current_stock: 1800,
    daily_consumption: 45,
    safety_threshold: 300,
    reorder_point: 500,
    forecast_demand_7d: 340,
    days_of_cover: 40.0,
    risk_status: 'LOW',
    last_restocked_at: '2026-10-01T15:00:00Z',
    supply: DEMO_SUPPLIES[2],
    location: DEMO_LOCATIONS[0]
  },
  {
    id: 'inv-shn-water',
    location_id: 'loc-sh-n',
    supply_id: 'sup-water',
    current_stock: 38000,
    daily_consumption: 2200,
    safety_threshold: 12000,
    reorder_point: 18000,
    forecast_demand_7d: 16000,
    days_of_cover: 17.3,
    risk_status: 'LOW',
    last_restocked_at: '2026-10-01T15:00:00Z',
    supply: DEMO_SUPPLIES[3],
    location: DEMO_LOCATIONS[0]
  },
  {
    id: 'inv-shn-gen',
    location_id: 'loc-sh-n',
    supply_id: 'sup-gen',
    current_stock: 4200,
    daily_consumption: 95,
    safety_threshold: 1000,
    reorder_point: 1500,
    forecast_demand_7d: 720,
    days_of_cover: 44.2,
    risk_status: 'LOW',
    last_restocked_at: '2026-10-01T15:00:00Z',
    supply: DEMO_SUPPLIES[4],
    location: DEMO_LOCATIONS[0]
  },

  // Forward Node A (High Altitude Pass - Critical Water & Medical)
  {
    id: 'inv-fna-fuel',
    location_id: 'loc-fn-a',
    supply_id: 'sup-fuel',
    current_stock: 1850,
    daily_consumption: 220,
    safety_threshold: 1200,
    reorder_point: 1600,
    forecast_demand_7d: 1750,
    days_of_cover: 8.4,
    risk_status: 'MODERATE',
    last_restocked_at: '2026-09-27T07:00:00Z',
    supply: DEMO_SUPPLIES[0],
    location: DEMO_LOCATIONS[4]
  },
  {
    id: 'inv-fna-food',
    location_id: 'loc-fn-a',
    supply_id: 'sup-food',
    current_stock: 1100,
    daily_consumption: 140,
    safety_threshold: 600,
    reorder_point: 900,
    forecast_demand_7d: 1050,
    days_of_cover: 7.8,
    risk_status: 'LOW',
    last_restocked_at: '2026-09-28T08:00:00Z',
    supply: DEMO_SUPPLIES[1],
    location: DEMO_LOCATIONS[4]
  },
  {
    id: 'inv-fna-med',
    location_id: 'loc-fn-a',
    supply_id: 'sup-med',
    current_stock: 42,
    daily_consumption: 14,
    safety_threshold: 40,
    reorder_point: 60,
    forecast_demand_7d: 110,
    days_of_cover: 3.0,
    risk_status: 'CRITICAL',
    last_restocked_at: '2026-09-22T05:00:00Z',
    supply: DEMO_SUPPLIES[2],
    location: DEMO_LOCATIONS[4]
  },
  {
    id: 'inv-fna-water',
    location_id: 'loc-fn-a',
    supply_id: 'sup-water',
    current_stock: 1900,
    daily_consumption: 480,
    safety_threshold: 2000,
    reorder_point: 3000,
    forecast_demand_7d: 3600,
    days_of_cover: 3.9,
    risk_status: 'CRITICAL',
    last_restocked_at: '2026-09-25T09:00:00Z',
    supply: DEMO_SUPPLIES[3],
    location: DEMO_LOCATIONS[4]
  },
  {
    id: 'inv-fna-gen',
    location_id: 'loc-fn-a',
    supply_id: 'sup-gen',
    current_stock: 410,
    daily_consumption: 18,
    safety_threshold: 250,
    reorder_point: 350,
    forecast_demand_7d: 150,
    days_of_cover: 22.8,
    risk_status: 'LOW',
    last_restocked_at: '2026-09-25T09:00:00Z',
    supply: DEMO_SUPPLIES[4],
    location: DEMO_LOCATIONS[4]
  }
];

export const DEMO_TRANSPORTS: TransportAsset[] = [
  {
    id: 'tr-001',
    asset_code: 'TR-001',
    name: 'Heavy Transport Carrier',
    type: 'Heavy Transport',
    capacity_tonnes: 8.0,
    current_location_id: 'loc-sh-n',
    destination_location_id: 'loc-dn-a',
    current_location_name: 'Supply Hub North',
    destination_location_name: 'Distribution Node Alpha',
    assigned_route: 'Corridor North-Alpha',
    availability: 'AVAILABLE',
    status: 'Operational',
    fuel_efficiency_kmpl: 3.2,
    last_updated: '12 min ago'
  },
  {
    id: 'tr-002',
    asset_code: 'TR-002',
    name: 'Medium Hauler 02',
    type: 'Medium Transport',
    capacity_tonnes: 5.0,
    current_location_id: 'loc-dn-a',
    current_location_name: 'Distribution Node Alpha',
    assigned_route: 'Standby Depot Alpha',
    availability: 'MAINTENANCE',
    status: 'Brake Assembly Overhaul',
    fuel_efficiency_kmpl: 4.1,
    last_updated: '28 min ago'
  },
  {
    id: 'tr-003',
    asset_code: 'TR-003',
    name: 'All-Terrain Recon Hauler',
    type: 'Light 4x4',
    capacity_tonnes: 2.5,
    current_location_id: 'loc-dn-a',
    destination_location_id: 'loc-fn-a',
    current_location_name: 'Distribution Node Alpha',
    destination_location_name: 'Forward Node A',
    assigned_route: 'Pass High-Ascent',
    availability: 'IN_TRANSIT',
    status: 'En-route with Emergency Med Pack',
    fuel_efficiency_kmpl: 5.8,
    last_updated: '4 min ago'
  },
  {
    id: 'tr-004',
    asset_code: 'TR-004',
    name: 'Tactical Convoy Unit Falcon',
    type: 'Convoy Unit',
    capacity_tonnes: 24.0,
    current_location_id: 'loc-sh-c',
    destination_location_id: 'loc-sh-n',
    current_location_name: 'Supply Hub Central',
    destination_location_name: 'Supply Hub North',
    assigned_route: 'Highway Central-North',
    availability: 'AVAILABLE',
    status: 'Ready for Staged Dispatch',
    fuel_efficiency_kmpl: 3.0,
    last_updated: '18 min ago'
  },
  {
    id: 'tr-005',
    asset_code: 'TR-005',
    name: 'Cold-Chain Cryo Unit',
    type: 'Specialized Cold-Chain',
    capacity_tonnes: 3.5,
    current_location_id: 'loc-sh-n',
    destination_location_id: 'loc-fn-a',
    current_location_name: 'Supply Hub North',
    destination_location_name: 'Forward Node A',
    assigned_route: 'High Ridge Logistics Route',
    availability: 'AVAILABLE',
    status: 'Temperature Calibrated (-20°C)',
    fuel_efficiency_kmpl: 4.4,
    last_updated: '7 min ago'
  },
  {
    id: 'tr-006',
    asset_code: 'TR-006',
    name: 'Heavy Transport Logistics Unit',
    type: 'Heavy Transport',
    capacity_tonnes: 8.0,
    current_location_id: 'loc-dn-b',
    current_location_name: 'Distribution Node Bravo',
    assigned_route: 'Western Sector Staging',
    availability: 'UNAVAILABLE',
    status: 'Scheduled Engine Retrofit',
    fuel_efficiency_kmpl: 3.1,
    last_updated: '45 min ago'
  }
];

export const DEMO_WEATHER_OBSERVATIONS: WeatherObservation[] = [
  {
    id: 'w-obs-shn',
    location_id: 'loc-sh-n',
    location_name: 'Supply Hub North',
    recorded_at: '2026-10-02T05:30:00Z',
    temperature_c: 14.5,
    humidity_pct: 58,
    rainfall_mm: 1.2,
    wind_speed_kmh: 14,
    weather_condition: 'Partly Cloudy',
    visibility_km: 8.5,
    warning_level: 'GREEN',
    warning_text: 'Routine operational weather; highway open.',
    source: 'IMD'
  },
  {
    id: 'w-obs-dna',
    location_id: 'loc-dn-a',
    location_name: 'Distribution Node Alpha',
    recorded_at: '2026-10-02T05:45:00Z',
    temperature_c: 8.2,
    humidity_pct: 86,
    rainfall_mm: 18.5,
    wind_speed_kmh: 34,
    weather_condition: 'Heavy Rainfall / Sleet',
    visibility_km: 3.2,
    warning_level: 'ORANGE',
    warning_text: 'IMD Nowcast: Heavy localized rainfall with mudslide hazard along Sector Pass corridor.',
    source: 'IMD'
  },
  {
    id: 'w-obs-fna',
    location_id: 'loc-fn-a',
    location_name: 'Forward Node A',
    recorded_at: '2026-10-02T05:40:00Z',
    temperature_c: -2.4,
    humidity_pct: 91,
    rainfall_mm: 8.4,
    wind_speed_kmh: 48,
    weather_condition: 'Snow Squalls & High Wind',
    visibility_km: 1.8,
    warning_level: 'RED',
    warning_text: 'Gale-force gusts and whiteout conditions; road convoy speed capped at 15 km/h.',
    source: 'IMD'
  },
  {
    id: 'w-obs-shc',
    location_id: 'loc-sh-c',
    location_name: 'Supply Hub Central',
    recorded_at: '2026-10-02T05:15:00Z',
    temperature_c: 21.0,
    humidity_pct: 45,
    rainfall_mm: 0.0,
    wind_speed_kmh: 9,
    weather_condition: 'Clear Skies',
    visibility_km: 10.0,
    warning_level: 'GREEN',
    warning_text: 'Optimal operational clearance.',
    source: 'IMD'
  }
];

export const DEMO_WEATHER_FORECAST_DAYS: WeatherForecastDay[] = [
  { date: 'Today (02 Oct)', dayName: 'Thu', tempMin: 6, tempMax: 14, rainfallMm: 18.5, rainfallProbPct: 88, condition: 'Heavy Rain / Sleet', warningLevel: 'ORANGE', source: 'IMD' },
  { date: 'Tomorrow (03 Oct)', dayName: 'Fri', tempMin: 4, tempMax: 11, rainfallMm: 24.0, rainfallProbPct: 92, condition: 'Persistent Heavy Rain', warningLevel: 'ORANGE', source: 'IMD' },
  { date: '04 Oct', dayName: 'Sat', tempMin: 2, tempMax: 9, rainfallMm: 12.0, rainfallProbPct: 65, condition: 'Scattered Showers', warningLevel: 'YELLOW', source: 'IMD' },
  { date: '05 Oct', dayName: 'Sun', tempMin: 1, tempMax: 12, rainfallMm: 4.0, rainfallProbPct: 35, condition: 'Overcast', warningLevel: 'GREEN', source: 'IMD' },
  { date: '06 Oct', dayName: 'Mon', tempMin: 3, tempMax: 15, rainfallMm: 0.5, rainfallProbPct: 15, condition: 'Partly Cloudy', warningLevel: 'GREEN', source: 'IMD' },
  { date: '07 Oct', dayName: 'Tue', tempMin: 4, tempMax: 16, rainfallMm: 0.0, rainfallProbPct: 10, condition: 'Clear Skies', warningLevel: 'GREEN', source: 'IMD' },
  { date: '08 Oct', dayName: 'Wed', tempMin: 5, tempMax: 16, rainfallMm: 0.0, rainfallProbPct: 5, condition: 'Clear Skies', warningLevel: 'GREEN', source: 'IMD' },
];

export const DEMO_ALERTS: AlertItem[] = [
  {
    id: 'alt-001',
    alert_type: 'PREDICTIVE SHORTAGE',
    severity: 'HIGH',
    location_id: 'loc-dn-a',
    location_name: 'Distribution Node Alpha',
    category: 'Fuel',
    title: 'Fuel Demand Exceeds Projected Stock Threshold',
    message: 'Fuel demand is projected to exceed current available inventory within the forecast horizon (Days of Cover: 9.4 vs 14d mission buffer).',
    root_cause: 'Projected demand increase (+24%) + inventory approaching safety threshold (3,500L) + transport corridor degraded by rain.',
    recommendations: 'Dispatch TR-001 heavy carrier from Supply Hub North with 8,000 L fuel prior to afternoon weather deterioration.',
    is_acknowledged: false,
    status: 'ACTIVE',
    created_at: '2026-10-02T05:10:00Z'
  },
  {
    id: 'alt-002',
    alert_type: 'WEATHER WARNING',
    severity: 'HIGH',
    location_id: 'loc-dn-a',
    location_name: 'Distribution Node Alpha',
    title: 'IMD Orange Warning: Heavy Mountain Precipitation',
    message: 'Torrential rainfall (18.5 mm/h) reported along access corridor; road transit speed degraded by 40%. Mud-flow risk active.',
    root_cause: 'Active Western Disturbance reported by IMD Srinagar regional radar telemetry.',
    recommendations: 'Shift non-bulk priority dispatches to Light 4x4 high-clearance assets; hold heavy convoys until 16:00 IST.',
    is_acknowledged: false,
    status: 'ACTIVE',
    created_at: '2026-10-02T05:25:00Z'
  },
  {
    id: 'alt-003',
    alert_type: 'PREDICTIVE SHORTAGE',
    severity: 'CRITICAL',
    location_id: 'loc-fn-a',
    location_name: 'Forward Node A',
    category: 'Medical',
    title: 'Critical Medical Trauma Kit Depletion Imminent',
    message: 'Forward Node A has only 3.0 days of medical trauma kits remaining (42 kits in stock vs 110 projected 7-day requirement).',
    root_cause: 'Expedited winter deployment surge in high-altitude frostbite treatments coinciding with road pass blockage.',
    recommendations: 'Authorize priority emergency airlift or snow-cleared armored carrier resupply immediately from Supply Hub North.',
    is_acknowledged: false,
    status: 'ACTIVE',
    created_at: '2026-10-02T04:45:00Z'
  },
  {
    id: 'alt-004',
    alert_type: 'TRANSPORT ALERT',
    severity: 'MEDIUM',
    location_id: 'loc-dn-a',
    location_name: 'Distribution Node Alpha',
    title: 'Transport Fleet Capacity Reduced by 38%',
    message: 'Asset TR-002 offline for unexpected brake assembly overhaul; single transit lane operational.',
    root_cause: 'Component wear from steep gradient descent on wet road bed.',
    recommendations: 'Reassign TR-004 convoy unit from Central Reserve to offset payload deficit.',
    is_acknowledged: true,
    status: 'ACKNOWLEDGED',
    created_at: '2026-10-02T03:50:00Z'
  },
  {
    id: 'alt-005',
    alert_type: 'INVENTORY ALERT',
    severity: 'CRITICAL',
    location_id: 'loc-fn-a',
    location_name: 'Forward Node A',
    category: 'Water',
    title: 'Potable Water Reserve Approaching Critical Floor',
    message: 'Bulk potable water reserves (1,900 L) are now below the mandatory safety threshold of 2,000 L. Days of Cover: 3.9 days.',
    root_cause: 'Freezing line failure at auxiliary storage coupled with increased boiling fuel requirements.',
    recommendations: 'Initiate thermal bowser convoy TR-005 from Supply Hub North.',
    is_acknowledged: false,
    status: 'ACTIVE',
    created_at: '2026-10-02T05:05:00Z'
  }
];

export const DEMO_DATA_SOURCES: DataSourceStatus[] = [
  {
    id: 'src-imd',
    code: 'IMD',
    name: 'India Meteorological Department (Mausam API)',
    source_type: 'Government Meteorological API',
    endpoint_url: 'https://mausam.imd.gov.in/imd_latest/contents/api.pdf',
    status: 'CONNECTED',
    last_sync_at: '2 minutes ago',
    records_ingested: 1420,
    latency_ms: 112,
    notes: 'Real-time city forecasts, district nowcasts, and severe weather warnings synced every 15 minutes.'
  },
  {
    id: 'src-supa',
    code: 'SUPABASE',
    name: 'Supabase PostgreSQL & Realtime',
    source_type: 'Tactical Relational Engine',
    endpoint_url: 'https://supabase.co',
    status: 'CONNECTED',
    last_sync_at: 'Realtime WebSocket active',
    records_ingested: 9850,
    latency_ms: 48,
    notes: 'Primary relational state store with Row-Level Security and live CDC event broadcasting.'
  },
  {
    id: 'src-osm',
    code: 'OSM',
    name: 'OpenStreetMap / Carto Tactical Vector Tiles',
    source_type: 'Geographic Information System',
    endpoint_url: 'https://tile.openstreetmap.org',
    status: 'CONNECTED',
    last_sync_at: 'Live CDN cache active',
    records_ingested: 450,
    latency_ms: 65,
    notes: 'Tactical dark vector cartography layer with caching for offline fallback resilience.'
  },
  {
    id: 'src-data-gov',
    code: 'DATA_GOV',
    name: 'Government Open Data Portal (data.gov.in)',
    source_type: 'National Open Data Portal',
    endpoint_url: 'https://data.gov.in/api/v1',
    status: 'AVAILABLE',
    last_sync_at: '2 hours ago',
    records_ingested: 3200,
    latency_ms: 310,
    notes: 'Historical consumption benchmarks, highway sector road types, and seasonal supply standards.'
  },
  {
    id: 'src-owm',
    code: 'OPENWEATHER',
    name: 'OpenWeather API (Secondary Backup)',
    source_type: 'Commercial Meteorological Provider',
    endpoint_url: 'https://api.openweathermap.org/data/2.5',
    status: 'OPTIONAL',
    last_sync_at: '4 hours ago',
    records_ingested: 450,
    latency_ms: 180,
    notes: 'Redundant fallback channel engaged if IMD gateway undergoes scheduled maintenance.'
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
    const rainfall = i >= 6 && i <= 8 ? (i === 7 ? 24 : 18) : (i === 6 ? 12 : 2);
    
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
