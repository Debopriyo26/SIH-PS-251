"""
Scenario Simulator Service (Backend)
Executes what-if logistics stress simulations across supply categories:
Fuel, Food, Medical, Water, General Supplies.
Recalculates Days of Cover, Stress Factors, and Logistics Recommendations.
"""

from typing import Dict, Any, List

class SimulatorService:
    @staticmethod
    def simulate(
        demand_change_pct: float,
        transport_avail_pct: float,
        weather_severity: str,
        rainfall_mm: float,
        inventory_starting_pct: float
    ) -> Dict[str, Any]:
        demand_mult = 1.0 + (demand_change_pct / 100.0)
        inv_mult = inventory_starting_pct / 100.0
        transport_eff = max(0.2, 1.0 + (transport_avail_pct / 100.0))

        weather_penalty = {"LOW": 1.0, "MODERATE": 1.15, "HIGH": 1.35, "CRITICAL": 1.65}.get(weather_severity, 1.0)
        burn_weather_mult = 1.15 if weather_severity in ["HIGH", "CRITICAL"] else 1.0

        categories = [
            {"category": "Fuel", "baselineStock": 4820.0, "dailyConsumption": 510.0, "safetyThreshold": 3500.0, "unit": "Liters", "baselineDays": 9.4},
            {"category": "Food", "baselineStock": 3200.0, "dailyConsumption": 310.0, "safetyThreshold": 1800.0, "unit": "Ration-Packs", "baselineDays": 10.3},
            {"category": "Medical", "baselineStock": 145.0, "dailyConsumption": 28.0, "safetyThreshold": 120.0, "unit": "Kits", "baselineDays": 5.2},
            {"category": "Water", "baselineStock": 8500.0, "dailyConsumption": 750.0, "safetyThreshold": 4500.0, "unit": "Liters", "baselineDays": 11.3},
            {"category": "General Supplies", "baselineStock": 780.0, "dailyConsumption": 35.0, "safetyThreshold": 300.0, "unit": "Units", "baselineDays": 22.3},
        ]

        affected_categories: List[str] = []
        category_results: List[Dict[str, Any]] = []

        for cat in categories:
            sim_stock = cat["baselineStock"] * inv_mult
            sim_daily = cat["dailyConsumption"] * demand_mult * burn_weather_mult
            sim_days = round(sim_stock / sim_daily, 1) if sim_daily > 0 else 999.0

            baseline_risk = "LOW"
            if cat["baselineDays"] < 6:
                baseline_risk = "HIGH"
            elif cat["baselineDays"] < 10:
                baseline_risk = "MODERATE"

            sim_risk = "LOW"
            stress_factor = "Normal operational tolerance"
            effective_transit_days = 4.0 / transport_eff

            if sim_days < effective_transit_days or sim_days < 4.0:
                sim_risk = "CRITICAL"
                stress_factor = f"Severe depletion: Stock exhausts in {sim_days}d before delayed transport ({effective_transit_days:.1f}d) arrives"
                affected_categories.append(cat["category"])
            elif sim_days < 8.0:
                sim_risk = "HIGH"
                stress_factor = f"Stress threshold breached: Days of cover reduced by {round((1 - sim_days / cat['baselineDays']) * 100)}% under surge"
                if cat["category"] not in affected_categories:
                    affected_categories.append(cat["category"])
            elif sim_days < 12.0:
                sim_risk = "MODERATE"
                stress_factor = "Adequate reserve, but safety threshold cushion narrowing"

            shortage_units = max(0.0, round(cat["safetyThreshold"] - (sim_stock - sim_daily * 7), 1))

            category_results.append({
                "category": cat["category"],
                "baselineDaysOfCover": cat["baselineDays"],
                "simulatedDaysOfCover": sim_days,
                "baselineRisk": baseline_risk,
                "simulatedRisk": sim_risk,
                "projectedShortageUnits": shortage_units,
                "unit": cat["unit"],
                "stressFactor": stress_factor
            })

        overall_sim_risk = "LOW"
        if any(c["simulatedRisk"] == "CRITICAL" for c in category_results):
            overall_sim_risk = "CRITICAL"
        elif any(c["simulatedRisk"] == "HIGH" for c in category_results):
            overall_sim_risk = "HIGH"
        elif any(c["simulatedRisk"] == "MODERATE" for c in category_results):
            overall_sim_risk = "MODERATE"

        baseline_readiness = 82
        penalty = (
            (demand_change_pct * 0.25 if demand_change_pct > 0 else 0) +
            (abs(transport_avail_pct) * 0.35 if transport_avail_pct < 0 else 0) +
            (22 if weather_severity == "CRITICAL" else (14 if weather_severity == "HIGH" else (6 if weather_severity == "MODERATE" else 0))) +
            ((100 - inventory_starting_pct) * 0.3 if inventory_starting_pct < 100 else 0)
        )
        simulated_readiness = max(32, round(baseline_readiness - penalty))

        recommendations = []
        if "Fuel" in affected_categories:
            recommendations.append("Immediate pre-positioning of heavy bowser TR-001 with 8,000L POL reserve to Distribution Node Alpha.")
        if "Medical" in affected_categories:
            recommendations.append("Authorize priority cold-chain aerial or 4x4 dispatch of trauma kits to offset high burn rate.")
        if transport_avail_pct < -20:
            recommendations.append("Mobilize Falcon Convoy Unit (24T capacity) from Central Reserve to compensate for regional transit deficit.")
        if weather_severity in ["HIGH", "CRITICAL"] or rainfall_mm > 30:
            recommendations.append("Apply 40% transit buffer on high-altitude passes; restrict night movement across flooded sectors.")
        if not recommendations:
            recommendations.append("Maintain current routine replenishment schedules. No critical escalation required.")

        return {
            "baselineRisk": "MODERATE",
            "simulatedRisk": overall_sim_risk,
            "affectedCategories": affected_categories,
            "overallReadinessBefore": baseline_readiness,
            "overallReadinessAfter": simulated_readiness,
            "categoryResults": category_results,
            "recommendations": recommendations
        }

simulator_service = SimulatorService()
