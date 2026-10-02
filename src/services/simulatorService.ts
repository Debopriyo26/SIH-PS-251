import { SimulationParams, SimulationOutcome, SupplyCategory, RiskLevel } from '../types';

class SimulatorService {
  public runSimulation(params: SimulationParams): SimulationOutcome {
    const { demandChangePct, transportAvailPct, weatherSeverity, rainfallMm, inventoryStartingPct } = params;

    // Multipliers
    const demandMultiplier = 1 + demandChangePct / 100;
    const inventoryMultiplier = inventoryStartingPct / 100;
    const transportPenalty = Math.max(0.2, 1 + transportAvailPct / 100);

    const weatherPenaltyMap = {
      LOW: 1.0,
      MODERATE: 1.15,
      HIGH: 1.35,
      CRITICAL: 1.65,
    };
    const weatherMult = weatherPenaltyMap[weatherSeverity] * (1 + rainfallMm / 200);

    // Baseline categories with stock & daily burn
    const categories: {
      category: SupplyCategory;
      baselineStock: number;
      dailyConsumption: number;
      safetyThreshold: number;
      unit: string;
      baselineDays: number;
    }[] = [
      { category: 'Fuel', baselineStock: 4820, dailyConsumption: 510, safetyThreshold: 3500, unit: 'Liters', baselineDays: 9.4 },
      { category: 'Food', baselineStock: 3200, dailyConsumption: 310, safetyThreshold: 1800, unit: 'Ration-Packs', baselineDays: 10.3 },
      { category: 'Medical', baselineStock: 145, dailyConsumption: 28, safetyThreshold: 120, unit: 'Kits', baselineDays: 5.2 },
      { category: 'Water', baselineStock: 8500, dailyConsumption: 750, safetyThreshold: 4500, unit: 'Liters', baselineDays: 11.3 },
      { category: 'General Supplies', baselineStock: 780, dailyConsumption: 35, safetyThreshold: 300, unit: 'Units', baselineDays: 22.3 },
    ];

    const affectedCategories: SupplyCategory[] = [];
    const categoryResults = categories.map(cat => {
      const simulatedStock = cat.baselineStock * inventoryMultiplier;
      // High weather and demand increases daily consumption burn
      const simulatedDailyBurn = cat.dailyConsumption * demandMultiplier * (weatherSeverity === 'HIGH' || weatherSeverity === 'CRITICAL' ? 1.15 : 1.0);
      const simulatedDaysOfCover = simulatedDailyBurn > 0 ? Number((simulatedStock / simulatedDailyBurn).toFixed(1)) : 999;

      let baselineRisk: RiskLevel = 'LOW';
      if (cat.baselineDays < 6) baselineRisk = 'HIGH';
      else if (cat.baselineDays < 10) baselineRisk = 'MODERATE';

      let simulatedRisk: RiskLevel = 'LOW';
      let stressFactor = 'Normal operational tolerance';

      // Effective cover considering replenishment delays due to transport reduction
      const effectiveReplenishmentDays = 4 / transportPenalty;

      if (simulatedDaysOfCover < effectiveReplenishmentDays || simulatedDaysOfCover < 4.0) {
        simulatedRisk = 'CRITICAL';
        stressFactor = `Severe depletion: Stock exhausts in ${simulatedDaysOfCover}d before delayed transport (${effectiveReplenishmentDays.toFixed(1)}d) can arrive`;
        affectedCategories.push(cat.category);
      } else if (simulatedDaysOfCover < 8.0) {
        simulatedRisk = 'HIGH';
        stressFactor = `Stress threshold breached: Days of cover reduced by ${Math.round((1 - simulatedDaysOfCover / cat.baselineDays) * 100)}% under surge`;
        if (!affectedCategories.includes(cat.category)) affectedCategories.push(cat.category);
      } else if (simulatedDaysOfCover < 12.0) {
        simulatedRisk = 'MODERATE';
        stressFactor = 'Adequate reserve, but safety threshold cushion narrowing';
      }

      const shortageUnits = Math.max(0, Math.round(cat.safetyThreshold - (simulatedStock - simulatedDailyBurn * 7)));

      return {
        category: cat.category,
        baselineDaysOfCover: cat.baselineDays,
        simulatedDaysOfCover,
        baselineRisk,
        simulatedRisk,
        projectedShortageUnits: shortageUnits,
        unit: cat.unit,
        stressFactor
      };
    });

    // Overall risk rollup
    let simulatedRisk: RiskLevel = 'LOW';
    if (categoryResults.some(c => c.simulatedRisk === 'CRITICAL')) {
      simulatedRisk = 'CRITICAL';
    } else if (categoryResults.some(c => c.simulatedRisk === 'HIGH')) {
      simulatedRisk = 'HIGH';
    } else if (categoryResults.some(c => c.simulatedRisk === 'MODERATE')) {
      simulatedRisk = 'MODERATE';
    }

    const baselineReadiness = 82;
    const penalty = (demandChangePct > 0 ? demandChangePct * 0.25 : 0) +
                    (transportAvailPct < 0 ? Math.abs(transportAvailPct) * 0.35 : 0) +
                    (weatherSeverity === 'CRITICAL' ? 22 : weatherSeverity === 'HIGH' ? 14 : weatherSeverity === 'MODERATE' ? 6 : 0) +
                    (inventoryStartingPct < 100 ? (100 - inventoryStartingPct) * 0.3 : 0);

    const simulatedReadiness = Math.max(32, Math.round(baselineReadiness - penalty));

    const recommendations: string[] = [];
    if (affectedCategories.includes('Fuel')) {
      recommendations.push('Immediate pre-positioning of heavy bowser TR-001 with 8,000L POL reserve to Distribution Node Alpha.');
    }
    if (affectedCategories.includes('Medical')) {
      recommendations.push('Authorize priority cold-chain aerial or 4x4 dispatch of trauma kits to offset high burn rate.');
    }
    if (transportAvailPct < -20) {
      recommendations.push('Mobilize Falcon Convoy Unit (24T capacity) from Central Reserve to compensate for regional transit deficit.');
    }
    if (weatherSeverity === 'HIGH' || weatherSeverity === 'CRITICAL' || rainfallMm > 30) {
      recommendations.push(`Apply 40% transit buffer on high-altitude passes; restrict night movement across flooded sectors.`);
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain current routine replenishment schedules. No critical escalation required.');
    }

    return {
      baselineRisk: 'MODERATE',
      simulatedRisk,
      affectedCategories,
      overallReadinessBefore: baselineReadiness,
      overallReadinessAfter: simulatedReadiness,
      categoryResults,
      recommendations
    };
  }
}

export const simulatorService = new SimulatorService();
