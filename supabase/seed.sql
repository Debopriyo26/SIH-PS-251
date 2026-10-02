-- ==============================================================================
-- VYOMIX — Seed Data for Tactical Demonstration
-- Fictional Operational Coordinates and Nodes
-- ==============================================================================

-- 1. LOCATIONS
INSERT INTO locations (id, code, name, type, latitude, longitude, altitude_m, region, status, inventory_readiness_pct, weather_risk, transport_availability_pct, projected_shortage, notes)
VALUES
('a1111111-1111-1111-1111-111111111111', 'LOC-SH-N', 'Supply Hub North', 'Supply Hub', 34.0837, 74.7973, 1585, 'Northern Sector', 'operational', 82.00, 'LOW', 91.00, 'NONE', 'Central logistics node for northern forward operational commands.'),
('a2222222-2222-2222-2222-222222222222', 'LOC-SH-C', 'Supply Hub Central', 'Supply Hub', 32.7266, 74.8570, 327, 'Central Reserve', 'operational', 94.00, 'LOW', 88.00, 'NONE', 'High-capacity heavy logistics base with dual runway and railhead links.'),
('a3333333-3333-3333-3333-333333333333', 'LOC-DN-A', 'Distribution Node Alpha', 'Distribution Node', 33.7782, 75.1500, 2200, 'Eastern Flank', 'attention', 68.00, 'HIGH', 62.00, 'FUEL / MEDICAL', 'Mountain transit point with single-lane access corridor vulnerable to rain.'),
('a4444444-4444-4444-4444-444444444444', 'LOC-DN-B', 'Distribution Node Bravo', 'Distribution Node', 33.2778, 74.3405, 1750, 'Western Ridge', 'operational', 89.00, 'MODERATE', 74.00, 'NONE', 'Sub-depot staging point for mobile tactical brigades.'),
('a5555555-5555-5555-5555-555555555555', 'LOC-FN-A', 'Forward Node A', 'Forward Node', 34.4250, 75.3200, 3100, 'High Altitude Pass', 'critical', 58.00, 'HIGH', 50.00, 'WATER / MEDICAL', 'High-altitude outpost; weather-dependent resupply via specialized convoys.'),
('a6666666-6666-6666-6666-666666666666', 'LOC-FN-B', 'Forward Node B', 'Forward Node', 34.1980, 74.5800, 2650, 'Valley Perimeter', 'operational', 86.00, 'LOW', 82.00, 'NONE', 'Forward perimeter logistics post equipped with all-weather landing pad.')
ON CONFLICT (code) DO NOTHING;

-- 2. SUPPLIES
INSERT INTO supplies (id, item_code, name, category, unit, criticality, shelf_life_days, standard_pack_size)
VALUES
('b1111111-1111-1111-1111-111111111111', 'SUP-POL-01', 'High-Altitude Diesel & Fuel (POL)', 'Fuel', 'Liters', 'CRITICAL', 720, 200.0),
('b2222222-2222-2222-2222-222222222222', 'SUP-RAT-01', 'Composite MRE Combat Rations', 'Food', 'Ration-Packs', 'HIGH', 360, 24.0),
('b3333333-3333-3333-3333-333333333333', 'SUP-MED-01', 'Tactical Trauma & High-Altitude Med Kits', 'Medical', 'Kits', 'CRITICAL', 180, 10.0),
('b4444444-4444-4444-4444-444444444444', 'SUP-WAT-01', 'Purified Bulk Potable Water', 'Water', 'Liters', 'CRITICAL', 90, 1000.0),
('b5555555-5555-5555-5555-555555555555', 'SUP-GEN-01', 'Cold Weather Gear & Spares (Extreme)', 'General Supplies', 'Units', 'MEDIUM', 1080, 50.0)
ON CONFLICT (item_code) DO NOTHING;

-- 3. INVENTORY (Distribution Node Alpha, Supply Hub North, Forward Node A)
INSERT INTO inventory (location_id, supply_id, current_stock, daily_consumption, safety_threshold, reorder_point, forecast_demand_7d, risk_status)
VALUES
-- Supply Hub North
('a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 24500.00, 1400.00, 7000.00, 10000.00, 10500.00, 'LOW'),
('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 15200.00, 850.00, 4000.00, 6000.00, 6200.00, 'LOW'),
('a1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 1800.00, 45.00, 300.00, 500.00, 340.00, 'LOW'),
('a1111111-1111-1111-1111-111111111111', 'b4444444-4444-4444-4444-444444444444', 38000.00, 2200.00, 12000.00, 18000.00, 16000.00, 'LOW'),
('a1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555', 4200.00, 95.00, 1000.00, 1500.00, 720.00, 'LOW'),

-- Distribution Node Alpha (Attention / Fuel & Medical stress)
('a3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 4820.00, 510.00, 3500.00, 5000.00, 6240.00, 'MODERATE'),
('a3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 3200.00, 310.00, 1800.00, 2500.00, 2350.00, 'LOW'),
('a3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 145.00, 28.00, 120.00, 180.00, 210.00, 'HIGH'),
('a3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444', 8500.00, 750.00, 4500.00, 6000.00, 5800.00, 'LOW'),
('a3333333-3333-3333-3333-333333333333', 'b5555555-5555-5555-5555-555555555555', 780.00, 35.00, 300.00, 500.00, 280.00, 'LOW'),

-- Forward Node A (High altitude, critical water and medical risk)
('a5555555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111', 1850.00, 220.00, 1200.00, 1600.00, 1750.00, 'MODERATE'),
('a5555555-5555-5555-5555-555555555555', 'b2222222-2222-2222-2222-222222222222', 1100.00, 140.00, 600.00, 900.00, 1050.00, 'LOW'),
('a5555555-5555-5555-5555-555555555555', 'b3333333-3333-3333-3333-333333333333', 42.00, 14.00, 40.00, 60.00, 110.00, 'CRITICAL'),
('a5555555-5555-5555-5555-555555555555', 'b4444444-4444-4444-4444-444444444444', 1900.00, 480.00, 2000.00, 3000.00, 3600.00, 'CRITICAL'),
('a5555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 410.00, 18.00, 250.00, 350.00, 150.00, 'LOW')
ON CONFLICT (location_id, supply_id) DO NOTHING;

-- 4. TRANSPORT ASSETS
INSERT INTO transport_assets (asset_code, name, type, capacity_tonnes, current_location_id, destination_location_id, assigned_route, availability, status, fuel_efficiency_kmpl)
VALUES
('TR-001', 'Tactical Carrier 01', 'Heavy Transport', 8.00, 'a1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'Corridor North-Alpha', 'AVAILABLE', 'Operational', 3.2),
('TR-002', 'Medium Hauler 02', 'Medium Transport', 5.00, 'a3333333-3333-3333-3333-333333333333', NULL, 'Standby Depot Alpha', 'MAINTENANCE', 'Brake Assembly Overhaul', 4.1),
('TR-003', 'All-Terrain 03', 'Light 4x4', 2.50, 'a3333333-3333-3333-3333-333333333333', 'a5555555-5555-5555-5555-555555555555', 'Pass High-Ascent', 'IN_TRANSIT', 'En-route with Emergency Med Pack', 5.8),
('TR-004', 'Convoy Unit Falcon', 'Convoy Unit', 24.00, 'a2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Highway Central-North', 'AVAILABLE', 'Ready for Dispatch', 3.0),
('TR-005', 'Cold-Chain Cryo 05', 'Specialized Cold-Chain', 3.50, 'a1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'High Ridge Logistics Route', 'AVAILABLE', 'Temperature Calibrated (-20°C)', 4.4),
('TR-006', 'Heavy Transport 06', 'Heavy Transport', 8.00, 'a4444444-4444-4444-4444-444444444444', NULL, 'Western Sector Staging', 'UNAVAILABLE', 'Scheduled Engine Retrofit', 3.1)
ON CONFLICT (asset_code) DO NOTHING;

-- 5. WEATHER OBSERVATIONS (Simulating live IMD ingestion)
INSERT INTO weather_observations (location_id, recorded_at, temperature_c, humidity_pct, rainfall_mm, wind_speed_kmh, weather_condition, visibility_km, warning_level, warning_text, source)
VALUES
('a1111111-1111-1111-1111-111111111111', NOW(), 14.5, 58.0, 1.2, 14.0, 'Partly Cloudy', 8.5, 'GREEN', 'Normal conditions, routes clear', 'IMD'),
('a3333333-3333-3333-3333-333333333333', NOW(), 8.2, 86.0, 18.5, 34.0, 'Heavy Rainfall / Sleet', 3.2, 'ORANGE', 'IMD Nowcast: Heavy rain and mud-flow risk along Sector Pass', 'IMD'),
('a5555555-5555-5555-5555-555555555555', NOW(), -2.4, 91.0, 8.4, 48.0, 'Snow & High Wind', 1.8, 'RED', 'High altitude gale warning; convoy speed restricted to 15 km/h', 'IMD'),
('a2222222-2222-2222-2222-222222222222', NOW(), 21.0, 45.0, 0.0, 9.0, 'Clear Skies', 10.0, 'GREEN', 'Optimal operational clearance', 'IMD')
ON CONFLICT DO NOTHING;

-- 6. ALERTS
INSERT INTO alerts (alert_type, severity, location_id, supply_id, title, message, root_cause, recommendations, status)
VALUES
('PREDICTIVE SHORTAGE', 'HIGH', 'a3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'Fuel Demand Exceeds Projected Stock', 'Fuel demand is projected to exceed current available inventory within the forecast horizon (Days of Cover: 9.4 vs 14d mission buffer).', 'Recent 24% uptick in patrol generator runtimes combined with weather pass delays.', 'Dispatch TR-001 from Supply Hub North with 8,000L POL reserve immediately.', 'ACTIVE'),
('WEATHER WARNING', 'HIGH', 'a3333333-3333-3333-3333-333333333333', NULL, 'IMD Orange Warning: Heavy Mountain Precipitation', 'Torrential rainfall (18.5mm/h) reported along distribution route to Sector Pass; road access degraded by 40%.', 'Active Western Disturbance reported by IMD Srinagar / Regional Met Centre.', 'Reroute critical medical supply via Light 4x4 high-clearance assets; hold heavy convoys until 16:00 IST.', 'ACTIVE'),
('PREDICTIVE SHORTAGE', 'CRITICAL', 'a5555555-5555-5555-5555-555555555555', 'b3333333-3333-3333-3333-333333333333', 'Critical Medical Trauma Kit Depletion', 'Forward Node A has only 3 days of medical trauma kits remaining against severe blizzard forecast.', 'Expedited winter deployment increased medical consumption; last supply transit delayed.', 'Priority air-drop or armored all-weather light transport dispatch from Hub North.', 'ACTIVE'),
('TRANSPORT ALERT', 'MEDIUM', 'a3333333-3333-3333-3333-333333333333', NULL, 'Transport Fleet Capacity Reduced by 38%', 'Asset TR-002 offline for maintenance; single convoy lane operational.', 'Routine brake overhaul coincident with unplanned electrical sensor fault.', 'Reassign TR-004 convoy unit from Central Reserve to offset payload deficit.', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- 7. DATA SOURCES
INSERT INTO data_sources (code, name, source_type, endpoint_url, status, last_sync_at, records_ingested, latency_ms, notes)
VALUES
('IMD', 'India Meteorological Department (Mausam API)', 'Government Meteorological API', 'https://mausam.imd.gov.in/imd_latest/contents/api.pdf', 'CONNECTED', NOW(), 1420, 112, 'Live ingestion of city forecasts, district nowcasts, and severe weather warnings.'),
('SUPABASE', 'Supabase PostgreSQL & Realtime', 'Tactical Relational Engine', 'https://supabase.co', 'CONNECTED', NOW(), 9850, 48, 'Primary secure state store with WebSocket realtime replication.'),
('OSM', 'OpenStreetMap / CartoDB Dark Tactical Tiles', 'Geographic GIS Engine', 'https://tile.openstreetmap.org', 'CONNECTED', NOW(), 450, 65, 'Tactical offline-tolerant dark vector cartography layer.'),
('DATA_GOV', 'Government Open Data (data.gov.in)', 'National Open Data Portal', 'https://data.gov.in/api/v1', 'AVAILABLE', NOW() - INTERVAL '2 hours', 3200, 310, 'Historical consumption patterns, district demographic baselines, and highway data.'),
('OPENWEATHER', 'OpenWeather API (Secondary Backup)', 'Commercial Meteorological Fallback', 'https://api.openweathermap.org/data/2.5', 'OPTIONAL', NOW() - INTERVAL '4 hours', 450, 180, 'Fallback weather provider if IMD gateway undergoes routine maintenance.')
ON CONFLICT (code) DO NOTHING;
