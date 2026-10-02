"""
Predictive Shortage Engine
Computes multi-dimensional logistics risk:
Current Inventory + Predicted Consumption + Safety Threshold + Transport Availability + Weather Risk -> Supply Risk
Explainable AI (XAI): outputs specific root causes for logistics planners and operators.
"""

from typing import Dict, Any, List

class ShortageEngine:
    @staticmethod
    def calculate_risk(
        current_stock: float,
        daily_consumption: float,
        safety_threshold: float,
        predicted_7d_consumption: float,
        transport_availability_pct: float,
        weather_risk_level: str
    ) -> Dict[str, Any]:
        days_of_cover = current_stock / daily_consumption if daily_consumption > 0 else 999.0
        projected_buffer_after_7d = current_stock - predicted_7d_consumption

        reasons: List[str] = []
        risk_level = "LOW"

        # 1. Depletion evaluation
        if projected_buffer_after_7d < 0:
            risk_level = "CRITICAL"
            reasons.append("Projected consumption exceeds total available on-hand stock")
        elif projected_buffer_after_7d < safety_threshold * 0.5:
            risk_level = "CRITICAL"
            reasons.append("Stock approaches critical floor (<50% safety buffer remaining)")
        elif projected_buffer_after_7d < safety_threshold:
            risk_level = "HIGH"
            reasons.append("Stock breaches mandated safety threshold within 7 days")
        elif days_of_cover < 10:
            risk_level = "MODERATE"
            reasons.append("Days of cover narrowing towards reorder trigger")

        # 2. Transport compounding factor
        if transport_availability_pct < 60:
            if risk_level in ["LOW", "MODERATE"]:
                risk_level = "HIGH"
            reasons.append(f"Regional transport availability severely degraded ({transport_availability_pct:.0f}% active)")
        elif transport_availability_pct < 75 and risk_level == "LOW":
            risk_level = "MODERATE"
            reasons.append(f"Reduced transport availability ({transport_availability_pct:.0f}%) delays routine resupply")

        # 3. Weather compounding factor
        if weather_risk_level in ["HIGH", "CRITICAL"]:
            if risk_level == "LOW":
                risk_level = "MODERATE"
            reasons.append(f"Elevated IMD weather warning ({weather_risk_level}) restricts pass movement")

        if not reasons:
            reasons.append("Adequate stock cushion and operational transport corridors verified")

        return {
            "days_of_cover": round(days_of_cover, 1),
            "projected_buffer_after_7d": round(projected_buffer_after_7d, 1),
            "risk_level": risk_level,
            "reasons": reasons
        }

shortage_engine = ShortageEngine()
