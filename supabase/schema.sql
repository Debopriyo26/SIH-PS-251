-- ==============================================================================
-- VYOMIX — Predictive Logistics & Forward Supply Chain Intelligence Platform
-- Database Schema: Supabase PostgreSQL
-- Problem Statement: SIH2625 | Indian Army Predictive Logistics
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. LOCATIONS (Synthetic tactical nodes & hubs)
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Supply Hub', 'Distribution Node', 'Forward Node', 'Transit Depot')),
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    altitude_m INTEGER DEFAULT 1200,
    region VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'attention', 'critical')),
    inventory_readiness_pct DECIMAL(5, 2) DEFAULT 85.00,
    weather_risk VARCHAR(50) DEFAULT 'LOW' CHECK (weather_risk IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    transport_availability_pct DECIMAL(5, 2) DEFAULT 80.00,
    projected_shortage VARCHAR(100) DEFAULT 'NONE',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SUPPLIES (Master catalogue of essential supply items)
CREATE TABLE IF NOT EXISTS supplies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Food', 'Fuel', 'Medical', 'Water', 'General Supplies')),
    unit VARCHAR(50) NOT NULL,
    criticality VARCHAR(50) NOT NULL DEFAULT 'HIGH' CHECK (criticality IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    shelf_life_days INTEGER DEFAULT 365,
    standard_pack_size DECIMAL(10, 2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INVENTORY (Real-time stock state per location)
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    supply_id UUID NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
    current_stock DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    daily_consumption DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    safety_threshold DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    reorder_point DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    forecast_demand_7d DECIMAL(12, 2) DEFAULT 0.00,
    days_of_cover DECIMAL(6, 2) GENERATED ALWAYS AS (
        CASE WHEN daily_consumption > 0 THEN current_stock / daily_consumption ELSE 999.99 END
    ) STORED,
    risk_status VARCHAR(50) NOT NULL DEFAULT 'LOW' CHECK (risk_status IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    last_restocked_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(location_id, supply_id)
);

-- 4. CONSUMPTION HISTORY (Historical burn rate records for ML training)
CREATE TABLE IF NOT EXISTS consumption_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    supply_id UUID NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    quantity_consumed DECIMAL(12, 2) NOT NULL,
    troop_strength INTEGER DEFAULT 250,
    temperature_c DECIMAL(5, 2),
    rainfall_mm DECIMAL(6, 2) DEFAULT 0.00,
    weather_condition VARCHAR(100) DEFAULT 'Clear',
    transport_disruption_flag BOOLEAN DEFAULT FALSE,
    special_operation_factor DECIMAL(4, 2) DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(location_id, supply_id, record_date)
);

-- 5. WEATHER OBSERVATIONS (Current and logged observations, e.g. from IMD)
CREATE TABLE IF NOT EXISTS weather_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    temperature_c DECIMAL(5, 2) NOT NULL,
    humidity_pct DECIMAL(5, 2) NOT NULL,
    rainfall_mm DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    wind_speed_kmh DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    weather_condition VARCHAR(100) NOT NULL,
    visibility_km DECIMAL(5, 2) DEFAULT 10.0,
    atmospheric_pressure_hpa DECIMAL(6, 2) DEFAULT 1013.25,
    warning_level VARCHAR(50) DEFAULT 'GREEN' CHECK (warning_level IN ('GREEN', 'YELLOW', 'ORANGE', 'RED')),
    warning_text TEXT,
    source VARCHAR(50) NOT NULL DEFAULT 'IMD',
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WEATHER FORECASTS (Predictive weather outlook from IMD / secondary)
CREATE TABLE IF NOT EXISTS weather_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    temp_min DECIMAL(5, 2) NOT NULL,
    temp_max DECIMAL(5, 2) NOT NULL,
    rainfall_prob_pct DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    expected_rainfall_mm DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    condition VARCHAR(100) NOT NULL,
    warning_level VARCHAR(50) DEFAULT 'GREEN' CHECK (warning_level IN ('GREEN', 'YELLOW', 'ORANGE', 'RED')),
    warning_description TEXT,
    source VARCHAR(50) NOT NULL DEFAULT 'IMD',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(location_id, forecast_date, source)
);

-- 7. TRANSPORT ASSETS (Tactical logistical fleet)
CREATE TABLE IF NOT EXISTS transport_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('Heavy Transport', 'Medium Transport', 'Light 4x4', 'Specialized Cold-Chain', 'Convoy Unit')),
    capacity_tonnes DECIMAL(6, 2) NOT NULL,
    current_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    destination_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    assigned_route VARCHAR(255),
    availability VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (availability IN ('AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE', 'UNAVAILABLE')),
    status VARCHAR(100) NOT NULL DEFAULT 'Operational',
    fuel_efficiency_kmpl DECIMAL(5, 2) DEFAULT 3.5,
    last_serviced_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FORECAST RESULTS (Outputs from ML Demand & Risk Models)
CREATE TABLE IF NOT EXISTS forecast_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    supply_id UUID NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
    forecast_horizon_days INTEGER NOT NULL DEFAULT 7,
    predicted_demand DECIMAL(12, 2) NOT NULL,
    confidence_interval_lower DECIMAL(12, 2),
    confidence_interval_upper DECIMAL(12, 2),
    confidence_score DECIMAL(5, 2) NOT NULL DEFAULT 88.50,
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    risk_factors JSONB,
    model_version VARCHAR(50) DEFAULT 'VYOMIX-RF-v1.4',
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ALERTS (Tactical alerts and recommendations)
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('PREDICTIVE SHORTAGE', 'WEATHER WARNING', 'INVENTORY ALERT', 'TRANSPORT ALERT', 'SYSTEM ALERT')),
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    supply_id UUID REFERENCES supplies(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    root_cause TEXT,
    recommendations TEXT,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DATA SOURCES (Ingestion transparency status tracker)
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    endpoint_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'CONNECTED' CHECK (status IN ('CONNECTED', 'AVAILABLE', 'OPTIONAL', 'OFFLINE')),
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    last_failure_at TIMESTAMPTZ,
    records_ingested INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 45,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SYSTEM EVENTS (Audit log and realtime change stream)
CREATE TABLE IF NOT EXISTS system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    actor VARCHAR(100) DEFAULT 'SYSTEM',
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_inventory_location_supply ON inventory(location_id, supply_id);
CREATE INDEX IF NOT EXISTS idx_consumption_loc_sup_date ON consumption_history(location_id, supply_id, record_date);
CREATE INDEX IF NOT EXISTS idx_weather_obs_loc_time ON weather_observations(location_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_fc_loc_date ON weather_forecasts(location_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_alerts_status_severity ON alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_transport_avail ON transport_assets(availability);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR DEMO / APP
-- ==============================================================================
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated and anonymous users in demo mode
CREATE POLICY "Public read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public read supplies" ON supplies FOR SELECT USING (true);
CREATE POLICY "Public read inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Public update inventory" ON inventory FOR UPDATE USING (true);
CREATE POLICY "Public read consumption" ON consumption_history FOR SELECT USING (true);
CREATE POLICY "Public read weather_obs" ON weather_observations FOR SELECT USING (true);
CREATE POLICY "Public read weather_fc" ON weather_forecasts FOR SELECT USING (true);
CREATE POLICY "Public read transport" ON transport_assets FOR SELECT USING (true);
CREATE POLICY "Public update transport" ON transport_assets FOR UPDATE USING (true);
CREATE POLICY "Public read forecast" ON forecast_results FOR SELECT USING (true);
CREATE POLICY "Public read alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Public update alerts" ON alerts FOR UPDATE USING (true);
CREATE POLICY "Public insert alerts" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read data_sources" ON data_sources FOR SELECT USING (true);
CREATE POLICY "Public read system_events" ON system_events FOR SELECT USING (true);

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
-- Enable Realtime for dynamic live updates
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE transport_assets;
ALTER PUBLICATION supabase_realtime ADD TABLE weather_observations;
