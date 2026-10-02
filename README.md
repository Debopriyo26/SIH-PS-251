# VYOMIX — Predictive Logistics Intelligence

> **Predict. Prepare. Deliver.**  
> *An intelligent logistics platform that combines inventory, weather, transportation and demand data to identify potential supply risks before they become critical.*

---

## 1. Overview

**VYOMIX** is an autonomous logistics intelligence platform engineered for mission-critical supply networks. By synthesizing real-time inventory levels, historical consumption patterns, meteorological intelligence from the India Meteorological Department (IMD), geographic topography (GIS), and fleet availability, VYOMIX enables logistics teams to:

1. **Answer Core Operational Questions:**
   - *What is happening?* (Current stock levels, weather advisories, transport readiness)
   - *What may happen?* (Machine-learning demand projections and depletion timelines)
   - *What needs attention?* (Priority locations and actionable shortage alerts)
2. **Forecast Supply Burn Rates:** Multi-horizon demand prediction (7-day, 14-day, 30-day) with confidence envelopes.
3. **Simulate Scenarios:** Multi-variable stress testing across demand spikes, weather events, transport disruptions, and initial inventory constraints.
4. **Enforce Truthful Data Operations:** Strict separation between `LIVE`, `DEMO`, and `OFFLINE` data modes.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        METEOROLOGICAL & DATA SOURCES                   │
│   • Official IMD Mausam API (City forecasts, district advisories)      │
│   • OpenStreetMap Standard Tiles Layer                                 │
│   • data.gov.in Open Data Ingestion                                    │
│   • OpenWeather API (Secondary Standby Fallback)                       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND SERVICE                         │
│   • Asynchronous Ingestion & Normalization Engine                      │
│   • Scikit-Learn Machine Learning Demand Regressor                     │
│   • Multi-Factor Explainable Shortage Engine                           │
│   • Logistics Scenario Simulation Engine                               │
│   • Operational Grounded Assistant Engine                              │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE POSTGRESQL & AUTH                      │
│   • Supabase Auth (Email / Password, Session Persistence)              │
│   • Row Level Security (RLS) with Authenticated Mutation Policies      │
│   • Relational Schema (locations, supplies, inventory, alerts, etc.)   │
│   • Realtime WebSocket Channels                                        │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        VYOMIX REACT FRONTEND                           │
│   • React 18 + TypeScript + Vite + Tailwind CSS                        │
│   • Clean 6-Page Navigation Structure                                  │
│   • Leaflet GIS Map with Status Markers & InvalidateSize Resizing      │
│   • Truthful DataStatus Badges (LIVE / DEMO / OFFLINE)                 │
│   • Comprehensive Help Center & Interactive Simulator                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Navigation & Key Modules

| Navigation Item | Functionality |
|---|---|
| **Dashboard** | Unified executive overview answering *What is happening*, *What may happen*, and *What needs attention*. Top KPI cards, global location selector, priority location cards, predictive alert banner, and embedded GIS map. |
| **Locations** | Interactive Leaflet GIS map displaying public demonstration zones with color-coded status markers (Green = Normal, Amber = Attention, Red = Critical), filter controls (All, At Risk, Weather Risk), and detailed inspection panel. |
| **Supplies** | Simplified inventory management tracking supply items, stock, daily consumption, days of cover, forecast demand, risk levels, and manual stock replenishment controls. |
| **Forecast** | Machine learning demand outlook with Recharts confidence bands, explainable risk rationale, and transparent model architecture details. |
| **Simulator** | Scenario stress-testing interface with 4 simplified controls: Demand Change, Transport Availability, Weather Severity, and Starting Inventory Level. |
| **Alerts** | Operational notification centre categorized into Predictive Shortage, Weather, Inventory, Transport, and System alerts with Acknowledge and Resolve actions. |
| **Help** | 12-section comprehensive documentation suite, 7-step quick start guide, metric glossaries, risk level definitions, and Data & Integrations status. |
| **Profile** | User profile card, active session role, quick links to Help, Data & Integrations, and secure Logout. |

---

## 4. Public Geographic Demonstration Zones

To ensure complete operational privacy, VYOMIX utilizes public geographic coordinates for visualization:

1. **Srinagar Logistics Zone** (34.0837° N, 74.7973° E) — Northern Sector
2. **Jaisalmer Logistics Zone** (26.9157° N, 70.9083° E) — Western Sector
3. **Ahmedabad Logistics Base** (23.0225° N, 72.5714° E) — Central Support
4. **Kutch Logistics Zone** (23.2420° N, 69.6669° E) — Coastal Flank

> **Data Disclaimer:** Geographic locations represent public regions. Inventory, transport and readiness values are synthetic demonstration data and do not represent actual military operations.

---

## 5. Authentication Flow

VYOMIX enforces Supabase Authentication to protect operational views:

```
Unauthenticated User ──► Landing Page ──► [ SIGN IN ] / [ CREATE ACCOUNT ]
                                                │
                                                ▼
                                         Supabase Auth
                                 (or One-Click Demo Session)
                                                │
                                                ▼
                                        Logistics Dashboard
                                                │
                                                ▼
                              Protected Operational Pages:
                          Locations, Supplies, Forecast, Simulator, Alerts
```

Routes:
- `/` — Public product landing page
- `/login` — Email & password sign-in (with instant demo access)
- `/signup` — Account registration (Full Name, Email, Password, Confirm Password)
- `/forgot-password` — Password reset recovery

---

## 6. Truthful Data States

Every operational module features a transparent `DataStatus` indicator:

- **● LIVE** — Directly connected to live APIs (e.g., IMD Mausam API, Supabase Realtime).
- **● DEMO** — Clearly labeled synthetic scenario data designed for demonstration and offline planning.
- **● OFFLINE** — Indicating fallback mode when upstream network services are temporarily unavailable.

---

## 7. Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/example/vyomix.git
cd vyomix

# Install frontend dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Backend Setup (Optional)
```bash
# Create and activate Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API documentation available at [http://localhost:8000/docs](http://localhost:8000/docs).

### Supabase Database Setup
1. Create a project in [Supabase](https://supabase.com).
2. Execute `supabase/schema.sql` in the Supabase SQL Editor.
3. Execute `supabase/seed.sql` to populate public demonstration zones.
4. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`.

---

## 8. License

Proprietary enterprise logistics software. All rights reserved.
