"""
AI Logistics Assistant (Backend Service)
Grounded Question-Answering Engine over current logistics demonstration state.
"""

from typing import Dict, Any, List
from datetime import datetime

class AssistantService:
    @staticmethod
    def answer_query(query: str) -> Dict[str, Any]:
        lower = query.lower()
        now_ist = datetime.now().strftime("%H:%M IST")

        if "supplies" in lower and ("risk" in lower or "shortage" in lower):
            content = (
                "### ⚠️ Supply Risk Assessment\n\n"
                "Based on current consumption rates and 7-day projected forecasts, supply items at elevated risk include:\n\n"
                "- **High-Altitude Diesel & POL Fuel** at *Srinagar Logistics Zone*: Stock is **12,400 L** with **7.8 Days of Cover** remaining. Status: **HIGH**.\n\n"
                "- **Emergency Medical & Trauma Kits** at *Srinagar Logistics Zone*: Stock is **180 Kits** with **5.1 Days of Cover** remaining. Status: **CRITICAL**.\n\n"
                "- **Purified Bulk Potable Water** at *Kutch Logistics Zone*: Stock is **11,500 L** with **8.2 Days of Cover** remaining. Status: **HIGH**.\n\n"
                "**Recommended Action:** Dispatch transport carrier TR-001 from Ahmedabad Logistics Base with supplemental supplies."
            )
            sources = ["Inventory Intelligence DB", "Predictive Shortage Engine"]

        elif "fuel" in lower or "pol" in lower:
            content = (
                "### ⛽ Fuel (POL) Demand & Depletion Outlook\n\n"
                "- **Srinagar Logistics Zone:** Current Stock is **12,400 L** against a daily consumption of **1,600 L/day**.\n"
                "- **7-Day Projected Demand:** **11,800 L** (Increased consumption expected due to generator and heating runtimes).\n"
                "- **Days of Cover:** **7.8 days** (Below recommended 14-day operational buffer).\n"
                "- **Corridor Status:** Weather advisory in Northern sector slowing transport movement.\n\n"
                "**Recommendation:** Schedule top-up shipment from Ahmedabad Logistics Base before conditions deteriorate."
            )
            sources = ["Demand Forecasting Engine (ML)", "IMD Weather Telemetry"]

        elif "weather" in lower or "imd" in lower or "rain" in lower:
            content = (
                "### 🛰️ Meteorological Assessment\n\n"
                "Data Source: **India Meteorological Department (Mausam API)**\n\n"
                "Weather conditions across demonstration zones:\n\n"
                "- **Srinagar Logistics Zone** [ORANGE Advisory]: Temp 8.2°C, Rainfall 18.5mm, Wind 34km/h. Advisory: *'Heavy localized precipitation and reduced visibility.'*\n\n"
                "- **Kutch Logistics Zone** [YELLOW Advisory]: Temp 29.0°C, Rainfall 3.2mm, Wind 22km/h. Moderate coastal wind.\n\n"
                "- **Jaisalmer Logistics Zone** [GREEN]: Clear and arid, 34.5°C.\n\n"
                "- **Ahmedabad Logistics Base** [GREEN]: Clear skies, 31.0°C."
            )
            sources = ["IMD Official Gateway (Mausam API)", "Weather Telemetry"]

        elif "alert" in lower or "critical" in lower:
            content = (
                "### 🚨 Active Operational Alerts (Today)\n\n"
                "Active operational alerts:\n\n"
                "1. **[CRITICAL] Emergency Medical Kit Depletion Risk** (Srinagar Logistics Zone)\n"
                "2. **[HIGH] Fuel Demand Exceeds Projected Stock Threshold** (Srinagar Logistics Zone)\n"
                "3. **[HIGH] Advisory: Mountain Precipitation & Sleet** (Northern Corridor)\n"
                "4. **[MEDIUM] Transport Fleet Capacity Reduced by 35%** (TR-002 Routine Maintenance)"
            )
            sources = ["Logistics Alert Center", "Supabase Realtime Stream"]

        else:
            content = (
                "### 📊 Logistics System Operational Overview\n\n"
                "- **Supply Readiness:** 86% across all zones\n"
                "- **Weather Risk:** 38% (Precipitation advisory active in Northern Sector)\n"
                "- **Transport Availability:** 82% (4 active transport assets tracked)\n"
                "- **Active Alerts:** 4 operational alerts requiring logistics manager review\n\n"
                "You can ask specific questions such as:\n"
                "• *'Which supplies are currently at risk?'*\n"
                "• *'What is the projected fuel demand?'*\n"
                "• *'Which locations have elevated weather risk?'*\n"
                "• *'Show today's critical alerts.'*"
            )
            sources = ["VYOMIX Logistics Intelligence Engine"]

        return {
            "id": f"msg-{int(datetime.now().timestamp())}",
            "role": "assistant",
            "content": content,
            "timestamp": now_ist,
            "sourcesUsed": sources,
            "suggestedPrompts": [
                "Which supplies are currently at risk?",
                "What is the projected fuel demand?",
                "Which locations have elevated weather risk?",
                "Show today's critical alerts."
            ]
        }

assistant_service = AssistantService()
