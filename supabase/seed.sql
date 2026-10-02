-- ==============================================================================
-- VYOMIX — Demonstration Seed Data
-- Public Geographic Logistics Zones and Synthetic Inventory
-- ==============================================================================

-- 1. LOCATIONS (Public Geographic Demonstration Zones)
INSERT INTO locations (id, code, name, type, latitude, longitude, altitude_m, region, status, inventory_readiness_pct, weather_risk, transport_availability_pct, projected_shortage, notes)
VALUES
('a1111111-1111-1111-1111-111111111111', 'LOC-SXR', 'Srinagar Logistics Zone', 'Logistics Zone', 34.0837, 74.7973, 1585, 'Northern Sector', 'attention', 78.00, 'HIGH', 65.00, 'FUEL / MEDICAL', 'High-altitude logistics staging zone with mountain corridor access subject to weather delays.'),
('a2222222-2222-2222-2222-222222222222', 'LOC-JSA', 'Jaisalmer Logistics Zone', 'Logistics Zone', 26.9157, 70.9083, 225, 'Western Sector', 'operational', 91.00, 'LOW', 86.00, 'NONE', 'Arid climate supply staging depot with high solar exposure and heavy fleet capacity.'),
('a3333333-3333-3333-3333-333333333333', 'LOC-AMD', 'Ahmedabad Logistics Base', 'Logistics Base', 23.0225, 72.5714, 53, 'Central Support', 'operational', 96.00, 'LOW', 94.00, 'NONE', 'Primary reserve logistics hub with multi-modal railhead and heavy storage warehousing.'),
('a4444444-4444-4444-4444-444444444444', 'LOC-KUT', 'Kutch Logistics Zone', 'Logistics Zone', 23.2420, 69.6669, 110, 'Coastal Flank', 'attention', 74.00, 'MODERATE', 70.00, 'WATER / POL', 'Coastal plain logistics staging area with variable maritime humidity and road corridors.')
ON CONFLICT (code) DO NOTHING;

-- 2. SUPPLIES
INSERT INTO supplies (id, item_code, name, category, unit, criticality, shelf_life_days, standard_pack_size)
VALUES
('b1111111-1111-1111-1111-111111111111', 'SUP-POL-01', 'High-Altitude Diesel & Fuel (POL)', 'Fuel', 'Liters', 'CRITICAL', 720, 200.0),
('b2222222-2222-2222-2222-222222222222', 'SUP-RAT-01', 'Composite MRE Rations', 'Food', 'Ration-Packs', 'HIGH', 360, 24.0),
('b3333333-3333-3333-3333-333333333333', 'SUP-MED-01', 'Emergency Medical & Trauma Kits', 'Medical', 'Kits', 'CRITICAL', 180, 10.0),
('b4444444-4444-4444-4444-444444444444', 'SUP-WAT-01', 'Purified Bulk Potable Water', 'Water', 'Liters', 'CRITICAL', 90, 1000.0),
('b5555555-5555-5555-5555-555555555555', 'SUP-GEN-01', 'Extreme Weather Protective Gear', 'General Supplies', 'Units', 'MEDIUM', 1080, 50.0)
ON CONFLICT (item_code) DO NOTHING;

-- 3. INVENTORY (Srinagar, Jaisalmer, Ahmedabad, Kutch)
INSERT INTO inventory (location_id, supply_id, current_stock, daily_consumption, safety_threshold, reorder_point, forecast_demand_7d, risk_status)
VALUES
-- Srinagar Logistics Zone (Attention / Fuel & Medical pressure)
('a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 12400.00, 1600.00, 8000.00, 11000.00, 11800.00, 'HIGH'),
('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 8200.00, 650.00, 3000.00, 4500.00, 4700.00, 'LOW'),
('a1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 180.00, 35.00, 150.00, 250.00, 280.00, 'CRITICAL'),
('a1111111-1111-1111-1111-111111111111', 'b4444444-4444-4444-4444-444444444444', 18000.00, 1500.00, 8000.00, 12000.00, 11000.00, 'LOW'),
('a1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555', 2100.00, 80.00, 600.00, 900.00, 600.00, 'LOW'),

-- Jaisalmer Logistics Zone (Operational, Stable)
('a2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 32000.00, 1100.00, 7000.00, 10000.00, 8200.00, 'LOW'),
('a2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 14500.00, 520.00, 3000.00, 4200.00, 3900.00, 'LOW'),
('a2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', 750.00, 18.00, 100.00, 160.00, 140.00, 'LOW'),
('a2222222-2222-2222-2222-222222222222', 'b4444444-4444-4444-4444-444444444444', 45000.00, 2200.00, 12000.00, 16000.00, 16500.00, 'LOW'),
('a2222222-2222-2222-2222-222222222222', 'b5555555-5555-5555-5555-555555555555', 3800.00, 45.00, 400.00, 600.00, 350.00, 'LOW'),

-- Ahmedabad Logistics Base (Main Support Hub)
('a3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 85000.00, 2100.00, 15000.00, 22000.00, 16000.00, 'LOW'),
('a3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 42000.00, 1200.00, 8000.00, 12000.00, 9000.00, 'LOW'),
('a3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 3200.00, 60.00, 400.00, 600.00, 450.00, 'LOW'),
('a3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444', 98000.00, 3100.00, 20000.00, 30000.00, 24000.00, 'LOW'),
('a3333333-3333-3333-3333-333333333333', 'b5555555-5555-5555-5555-555555555555', 9200.00, 110.00, 1200.00, 1800.00, 850.00, 'LOW'),

-- Kutch Logistics Zone (Attention / Water & POL)
('a4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 9800.00, 950.00, 5000.00, 7500.00, 7200.00, 'MODERATE'),
('a4444444-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', 7400.00, 480.00, 2500.00, 3800.00, 3600.00, 'LOW'),
('a4444444-4444-4444-4444-444444444444', 'b3333333-3333-3333-3333-333333333333', 380.00, 22.00, 120.00, 200.00, 170.00, 'LOW'),
('a4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 11500.00, 1400.00, 6000.00, 9000.00, 10200.00, 'HIGH'),
('a4444444-4444-4444-4444-444444444444', 'b5555555-5555-5555-5555-555555555555', 1650.00, 40.00, 350.00, 500.00, 320.00, 'LOW')
ON CONFLICT (location_id, supply_id) DO NOTHING;

-- 4. TRANSPORT ASSETS
INSERT INTO transport_assets (asset_code, name, type, capacity_tonnes, current_location_id, destination_location_id, assigned_route, availability, status, fuel_efficiency_kmpl)
VALUES
('TR-001', 'Logistics Carrier 01', 'Heavy Transport', 8.00, 'a3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Corridor Ahmedabad - Srinagar', 'AVAILABLE', 'Operational', 3.2),
('TR-002', 'Medium Hauler 02', 'Medium Transport', 5.00, 'a1111111-1111-1111-1111-111111111111', NULL, 'Standby Depot Srinagar', 'MAINTENANCE', 'Brake Assembly Overhaul', 4.1),
('TR-003', 'All-Terrain 03', 'Light 4x4', 2.50, 'a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'High Pass Route', 'IN_TRANSIT', 'En-route with Emergency Med Pack', 5.8),
('TR-004', 'Fleet Unit Falcon', 'Convoy Unit', 24.00, 'a3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'Corridor Ahmedabad - Jaisalmer', 'AVAILABLE', 'Ready for Dispatch', 3.0),
('TR-005', 'Cold-Chain Cryo 05', 'Specialized Cold-Chain', 3.50, 'a3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Corridor Ahmedabad - Srinagar', 'AVAILABLE', 'Temperature Calibrated (-20°C)', 4.4),
('TR-006', 'Heavy Transport 06', 'Heavy Transport', 8.00, 'a4444444-4444-4444-4444-444444444444', NULL, 'Kutch Zone Logistics Base', 'UNAVAILABLE', 'Scheduled Routine Maintenance', 3.1)
ON CONFLICT (asset_code) DO NOTHING;

-- 5. WEATHER OBSERVATIONS
INSERT INTO weather_observations (location_id, recorded_at, temperature_c, humidity_pct, rainfall_mm, wind_speed_kmh, weather_condition, visibility_km, warning_level, warning_text, source)
VALUES
('a1111111-1111-1111-1111-111111111111', NOW(), 8.2, 86.0, 18.5, 34.0, 'Heavy Rain / Sleet', 3.2, 'ORANGE', 'Regional Met advisory: Heavy precipitation and road wetness', 'IMD'),
('a2222222-2222-2222-2222-222222222222', NOW(), 34.5, 24.0, 0.0, 16.0, 'Clear & Arid', 10.0, 'GREEN', 'Normal conditions, routes clear', 'IMD'),
('a3333333-3333-3333-3333-333333333333', NOW(), 31.0, 48.0, 0.0, 11.0, 'Clear Skies', 10.0, 'GREEN', 'Optimal operational clearance', 'IMD'),
('a4444444-4444-4444-4444-444444444444', NOW(), 29.0, 76.0, 3.2, 22.0, 'Humid / Coastal Breeze', 7.5, 'YELLOW', 'Moderate sea breeze and humid conditions', 'IMD')
ON CONFLICT DO NOTHING;

-- 6. ALERTS
INSERT INTO alerts (alert_type, severity, location_id, supply_id, title, message, root_cause, recommendations, status)
VALUES
('PREDICTIVE SHORTAGE', 'HIGH', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Fuel Demand Exceeds Projected Stock', 'Fuel demand is projected to exceed current available inventory within the forecast horizon (Days of Cover: 7.8 vs 14d target buffer).', 'Increased heating generator demand combined with weather corridor delays.', 'Dispatch TR-001 from Ahmedabad Logistics Base with 8,000L POL reserve.', 'ACTIVE'),
('WEATHER WARNING', 'HIGH', 'a1111111-1111-1111-1111-111111111111', NULL, 'Advisory: Mountain Precipitation & Sleet', 'Heavy precipitation reported along corridor access route; transit speeds reduced.', 'Active seasonal weather system reported by regional meteorological centre.', 'Prioritize emergency medical transport via high-clearance assets; hold heavy convoys until conditions clear.', 'ACTIVE'),
('PREDICTIVE SHORTAGE', 'CRITICAL', 'a1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 'Emergency Medical Kit Depletion Risk', 'Srinagar Logistics Zone has approximately 5 days of trauma kits remaining against sustained consumption.', 'Accelerated winter requirements; previous transit consignment delayed.', 'Prioritize dispatch from Ahmedabad Logistics Base via express logistics courier.', 'ACTIVE'),
('TRANSPORT ALERT', 'MEDIUM', 'a1111111-1111-1111-1111-111111111111', NULL, 'Transport Fleet Capacity Reduced by 35%', 'Asset TR-002 offline for maintenance; single corridor operational.', 'Scheduled routine mechanical maintenance on heavy fleet asset.', 'Coordinate with Ahmedabad Logistics Base to schedule additional transport capacity.', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- 7. DATA SOURCES
INSERT INTO data_sources (code, name, source_type, endpoint_url, status, last_sync_at, records_ingested, latency_ms, notes)
VALUES
('IMD', 'India Meteorological Department (Mausam API)', 'Government Meteorological API', 'https://mausam.imd.gov.in/imd_latest/contents/api.pdf', 'CONNECTED', NOW(), 1420, 112, 'Live ingestion of city forecasts, district nowcasts, and severe weather warnings.'),
('SUPABASE', 'Supabase PostgreSQL & Realtime', 'Relational Engine & State Store', 'https://supabase.co', 'CONNECTED', NOW(), 9850, 48, 'Primary secure state store with WebSocket realtime replication.'),
('OSM', 'OpenStreetMap Tiles', 'Geographic GIS Engine', 'https://tile.openstreetmap.org', 'CONNECTED', NOW(), 450, 65, 'Standard open cartography vector and raster tiles layer.'),
('DATA_GOV', 'Government Open Data (data.gov.in)', 'National Open Data Portal', 'https://data.gov.in/api/v1', 'AVAILABLE', NOW() - INTERVAL '2 hours', 3200, 310, 'Historical consumption patterns, district demographic baselines, and highway data.'),
('OPENWEATHER', 'OpenWeather API (Secondary Backup)', 'Commercial Meteorological Fallback', 'https://api.openweathermap.org/data/2.5', 'OPTIONAL', NOW() - INTERVAL '4 hours', 450, 180, 'Fallback weather provider if IMD gateway undergoes routine maintenance.')
ON CONFLICT (code) DO NOTHING;
