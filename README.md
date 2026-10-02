# VYOMIX — Predictive Logistics & Forward Supply Chain Intelligence Platform

> **"Predict. Prepare. Deliver."**  
> *AI-Powered Forward Logistics Management Platform for the Indian Army*  
> **Smart India Hackathon (SIH) Problem Statement:** SIH2625

---

## 1. Executive Summary & Problem Statement

Modern military operations across high-altitude and forward borders encounter extreme logistical friction:
- **Unpredictable Mountain Weather:** Flash rains, landslides, blizzards, and Western Disturbances disrupt passes.
- **Dynamic Burn Rates:** Extreme cold surges generator POL (Petroleum, Oil, and Lubricants) usage and high-altitude medical trauma treatments.
- **Constrained Transit Corridors:** Single-lane access passes, fleet maintenance deficits, and payload restrictions.
- **Isolated Data Silos:** Inventory logs, weather bulletins, and fleet telemetries often exist in disconnected legacy systems.

**VYOMIX** is an autonomous, AI-powered predictive logistics management platform designed to integrate inventory stores, historical consumption patterns, live India Meteorological Department (IMD) weather intelligence, geographic topography (GIS), and transport fleet availability to:
1. **Forecast future supply demands** across forward depots.
2. **Detect predictive shortage risks** *before* physical depletion occurs.
3. **Provide explainable AI (XAI)** decision rationale and actionable military directives.
4. **Stress-test forward logistics resilience** via a scenario simulator.

---

## 2. System Architecture

VYOMIX enforces a multi-tier, zero-direct-client-scraping architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL TELEMETRY SOURCES                      │
│   • Official IMD Mausam API (Nowcasts, District Warnings, Radar)       │
│   • OpenStreetMap / Tactical CartoDB Dark Tiles                       │
│   • data.gov.in Government Open Data Ingestion                         │
│   • OpenWeather API (Secondary / Fallback Standby)                    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND SERVICE                         │
│   • Async Ingestion Engine (backend/ingestion/imd_ingest.py)           │
│   • Pydantic Schema Validation & Normalization                         │
│   • Real ML Demand Forecaster (Scikit-Learn / RandomForest)            │
│   • Predictive Shortage Engine (Multi-Factor Non-Black-Box)            │
│   • Tactical Scenario Simulator Service                                │
│   • Grounded AI Assistant (VYOMIX ASSIST)                              │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE POSTGRESQL & REALTIME                  │
│   • Relational Schema (11 tables: locations, inventory, supplies, etc) │
│   • Row Level Security (RLS) & Indexed Queries                         │
│   • WebSocket CDC Realtime Subscriptions                              │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        VYOMIX REACT FRONTEND                           │
│   • Military Command Center Dark Tactical Interface                    │
│   • Leaflet Tactical GIS Topography with Live Route Status             │
│   • Recharts ML Confidence Envelopes & Burn Horizons                   │
│   • Multi-Variable Scenario Simulator                                  │
│   • Built-in Fault-Tolerant Offline Demonstration Engine               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Capabilities & Pages

| # | Page / Module | Tactical Functionality |
|---|---|---|
| 1 | **Landing Page** | Command Center entry portal featuring animated tactical radar, real-time pipeline indicators, and architectural mission statement. |
| 2 | **Command Dashboard** | Primary executive view: Supply Readiness (87%), Weather Risk (42%), Transport Availability (76%), Active Alerts (03), Forecast Confidence (89%), interactive GIS snapshot, and days of cover matrix. |
| 3 | **Logistics Map** | Leaflet tactical GIS displaying synthetic northern & central sector nodes, operational routes (clear/degraded/restricted), and click-to-inspect tactical HUD panels. |
| 4 | **Inventory Intelligence** | 5 essential supply categories (Fuel, Food, Medical, Water, General Supplies). Tracks on-hand stock, burn rates, safety floors, days of cover, and live stock adjustments. |
| 5 | **Demand Forecasting** | Machine Learning forecasting module using historical burn rates, lag features, troop strength, and weather cross-correlation with Recharts confidence envelopes (7, 14, 30-day horizons). |
| 6 | **Weather Intelligence** | Official IMD Mausam integration. Displays temperature, rainfall, humidity, wind gusts, atmospheric pressure, IMD district nowcasts, and 7-day synoptic outlooks. |
| 7 | **Transport Management** | Heavy transports, medium haulers, all-terrain 4x4s, and convoy units. Tracks payload capacities, route staging, availability statuses, and workshop maintenance. |
| 8 | **Scenario Simulator** | Multi-variable stress testing (Demand Surge -50% to +100%, Transport Availability -60% to +40%, IMD Weather Severity, Rainfall Rate, Depot Starting Stock). Before/after risk delta and directives. |
| 9 | **Alerts & Directives** | Military notification feed: PREDICTIVE SHORTAGE, WEATHER WARNING, INVENTORY ALERT, TRANSPORT ALERT. Explainable root-cause attribution and command resolution workflow. |
| 10 | **Data Sources** | Transparency audit of IMD, Supabase, OSM, data.gov.in, and OpenWeather pipelines showing latency, record counts, and synchronization health. |
| + | **VYOMIX ASSIST** | Grounded AI copilot answering operational questions based on live system state (e.g., *"Which supplies are currently at risk?"*, *"What is the projected fuel demand?"*). |

---

## 4. Visual Design & Military Aesthetics

VYOMIX adheres strictly to an authentic Indian Army command-center aesthetic:
- **Background:** `#07100B` (Near-black tactical base)
- **Panels:** `#101B13` (Dark tactical border framing)
- **Military Green:** `#263F2B`
- **Olive:** `#596B3A`
- **Khaki / Brass:** `#B5A47A`
- **Primary Text:** `#E7E9E2` (High-contrast military typography)
- **Warning Indicator:** `#D39B32` (Amber)
- **Critical Alert:** `#C43C3C` (Tactical Red)
- **Typography:** `Inter` (UI elements), `JetBrains Mono` (Data/telemetry coordinates), `Chakra Petch` (Military command headers).

---

## 5. Technology Stack

### Frontend
- **Framework:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS with military tokens, tactical border framing, and custom scan lines
- **Data Visualization:** Recharts (Composed charts, confidence intervals, rainfall overlays, days of cover)
- **Cartography / GIS:** Leaflet & React Leaflet with CartoDB dark vector tiles
- **Icons:** Lucide React

### Backend
- **Framework:** Python, FastAPI, Uvicorn
- **Validation:** Pydantic v2
- **Data Ingestion:** HTTPX (Async IMD Mausam API & data.gov.in adapter)
- **Machine Learning:** Scikit-Learn (RandomForestRegressor), NumPy, Pandas

### Database & Realtime
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Schema & Seeds:** `supabase/schema.sql` and `supabase/seed.sql`
- **Realtime:** Supabase WebSocket CDC channels

---

## 6. Database Schema Summary

The database consists of 11 relational tables (`supabase/schema.sql`):
1. `locations`: Synthetic tactical depots, coordinates, altitudes, readiness scores, and weather risk.
2. `supplies`: Master item catalogue, NATO classifications, units, and shelf lives.
3. `inventory`: Location-level on-hand stock, daily consumption, safety thresholds, and days of cover.
4. `consumption_history`: Historical burn rate time-series for ML training.
5. `weather_observations`: Real-time weather readings from IMD.
6. `weather_forecasts`: 7-day predictive weather forecasts.
7. `transport_assets`: Fleet inventory, payload tonnages, routes, and statuses.
8. `forecast_results`: ML inference results and confidence scores.
9. `alerts`: Active tactical alerts with root cause analysis and recommendations.
10. `data_sources`: Ingestion status, latency, and record counters.
11. `system_events`: Audit trail for state changes and user overrides.

---

## 7. Machine Learning & Predictive Shortage Logic

### ML Demand Forecasting Engine
The ML pipeline predicts forward daily consumption by conditioning on:
- $L_1, L_7$: 1-day and 7-day autoregressive consumption lags.
- $T$: Troop strength factor deployed in the sector.
- $W_{rain}, W_{temp}$: IMD precipitation and freezing weather factors.
- $A_{trans}$: Transport corridor delay penalty.
- $D_{dow}$: Day-of-week logistical surge pattern.

Confidence intervals are calculated using model residual variance:
$$\text{Confidence Interval} = \hat{y} \pm 1.96 \cdot \hat{\sigma}_{residual}$$

### Non-Black-Box Shortage Risk Engine
Rather than presenting an uninterpretable score, VYOMIX calculates:
$$\text{Projected Buffer} = \text{Current Stock} - \sum_{t=1}^{H} \hat{y}_t$$
$$\text{Supply Risk} = f(\text{Projected Buffer}, \text{Safety Threshold}, \text{Transport Availability}, \text{IMD Weather})$$

The engine automatically enumerates the exact causal reasons (e.g., *"Projected demand increase (+24%) approaches safety threshold of 3,500 L while Sector Pass is under an IMD Orange rainfall warning"*).

---

## 8. Installation & Local Development

### Prerequisites
- **Node.js:** v18+ (Node v24.19 LTS installed)
- **Python:** v3.10+ (Python 3.14 installed)
- **Git**

### Step 1: Clone Repository
```bash
git clone https://github.com/Debopriyo26/SIH-PS-251.git
cd SIH-PS-251
```

### Step 2: Frontend Setup & Launch
```bash
# Install dependencies
npm install

# Start Vite tactical development server
npm run dev
```
The frontend will start at **http://localhost:5173/**.

### Step 3: Backend Setup & Launch (Optional for Full API)
```bash
# In a separate terminal:
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI interactive documentation will be available at **http://localhost:8000/docs**.

---

## 9. Environment Variables

Create `.env` in the root directory (refer to `.env.example`):

```ini
# Frontend Variables (Vite)
VITE_APP_NAME="VYOMIX"
VITE_APP_TAGLINE="Predict. Prepare. Deliver."
VITE_DEMO_MODE=true
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key-here
VITE_BACKEND_API_URL=http://localhost:8000/api

# Backend Server Secrets (NEVER exposed to frontend)
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
ENVIRONMENT=development
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
IMD_API_BASE_URL=https://mausam.imd.gov.in/api
IMD_API_KEY=
OPENWEATHER_API_KEY=
DATA_GOV_API_KEY=
```

---

## 10. Supabase Database Setup

1. Open your [Supabase Dashboard](https://supabase.com).
2. Navigate to the **SQL Editor**.
3. Copy the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
4. Copy the contents of [`supabase/seed.sql`](supabase/seed.sql) and click **Run**.
5. Copy your project URL and anon public key into your `.env` file.

> **Zero Configuration Notice:** If Supabase credentials are not provided, VYOMIX automatically initializes in **Demonstration Mode**, loading synthetic military datasets with full interactivity, simulation execution, and zero crashes!

---

## 11. Security & Compliance

- **No Sensitive Military Coordinates:** All geographic nodes (Supply Hub North, Distribution Node Alpha, etc.) use synthetic, unclassified coordinates for logistics demonstration.
- **Credential Isolation:** Service keys and external meteorological tokens remain strictly on the backend.
- **Fail-Safe Operation:** Temporary unavailability of IMD or external gateways triggers automatic fallback to cached observations without interrupting dashboard monitoring.

---

## 12. Future Scope

1. **Satellite SAR Imagery Integration:** Ingest Sentinel-1 synthetic aperture radar to detect road avalanches and bridge washouts automatically.
2. **Autonomous Multi-Echelon UAV Routing:** Optimize tactical drone dispatch paths for urgent blood plasma and medical kits to cut-off forward posts.
3. **Offline Mobile Mesh Synchronization:** BLE/HF radio packet transmission for Forward Node operators operating without internet connectivity.

---

**Developed for Smart India Hackathon (SIH) | Problem Statement: SIH2625**  
*VYOMIX — Predictive Logistics & Forward Supply Chain Intelligence Platform*
