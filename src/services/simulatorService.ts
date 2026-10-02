import { SimulationParams, SimulationOutcome, SupplyCategory, RiskLevel } from '../types';

class SimulatorService {
  public runSimulation(params: SimulationParams): SimulationOutcome {
    const { demandChangePct, transportAvailPct, weatherSeverity, inventoryStartingPct } = params;

    const demandMultiplier = 1 + demandChangePct / 100;
    const inventoryMultiplier = inventoryStartingPct / 100;
    const transportPenalty = Math.max(0.2, 1 + transportAvailPct / 100);

    const weatherPenaltyMap = {
      LOW: 1.0,
      MODERATE: 1.15,
      HIGH: 1.35,
      CRITICAL: 1.6,
    };
    const weatherMult = weatherPenaltyMap[weatherSeverity];

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
      const simulatedDailyBurn = cat.dailyConsumption * demandMultiplier * weatherMult;
      const simulatedDaysOfCover = simulatedDailyBurn > 0 ? Number((simulatedStock / simulatedDailyBurn).toFixed(1)) : 999;

      let baselineRisk: RiskLevel = 'LOW';
      if (cat.baselineDays < 6) baselineRisk = 'HIGH';
      else if (cat.baselineDays < 10) baselineRisk = 'MODERATE';

      let simulatedRisk: RiskLevel = 'LOW';
      let stressFactor = 'Normal operational tolerance';

      const effectiveReplenishmentDays = 4 / transportPenalty;

      if (simulatedDaysOfCover < effectiveReplenishmentDays || simulatedDaysOfCover < 4.0) {
        simulatedRisk = 'CRITICAL';
        stressFactor = `Severe depletion: Stock depletes in ${simulatedDaysOfCover}d before delayed transport (${effectiveReplenishmentDays.toFixed(1)}d) arrives`;
        affectedCategories.push(cat.category);
      } else if (simulatedDaysOfCover < 8.0) {
        simulatedRisk = 'HIGH';
        stressFactor = `Threshold breached: Days of cover reduced by ${Math.round((1 - simulatedDaysOfCover / cat.baselineDays) * 100)}%`;
        if (!affectedCategories.includes(cat.category)) affectedCategories.push(cat.category);
      } else if (simulatedDaysOfCover < 12.0) {
        simulatedRisk = 'MODERATE';
        stressFactor = 'Adequate reserve, safety cushion narrowing';
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

    let simulatedRisk: RiskLevel = 'LOW';
    if (categoryResults.some(c => c.simulatedRisk === 'CRITICAL')) {
      simulatedRisk = 'CRITICAL';
    } else if (categoryResults.some(c => c.simulatedRisk === 'HIGH')) {
      simulatedRisk = 'HIGH';
    } else if (categoryResults.some(c => c.simulatedRisk === 'MODERATE')) {
      simulatedRisk = 'MODERATE';
    }

    const baselineReadiness = 85;
    const penalty = (demandChangePct > 0 ? demandChangePct * 0.25 : 0) +
                    (transportAvailPct < 0 ? Math.abs(transportAvailPct) * 0.35 : 0) +
                    (weatherSeverity === 'CRITICAL' ? 20 : weatherSeverity === 'HIGH' ? 12 : weatherSeverity === 'MODERATE' ? 5 : 0) +
                    (inventoryStartingPct < 100 ? (100 - inventoryStartingPct) * 0.3 : 0);

    const simulatedReadiness = Math.max(30, Math.round(baselineReadiness - penalty));

    const recommendations: string[] = [];
    if (affectedCategories.includes('Fuel')) {
      recommendations.push('Pre-position heavy transport carrier TR-001 with 8,000L POL reserve to Srinagar Logistics Zone.');
    }
    if (affectedCategories.includes('Medical')) {
      recommendations.push('Authorize priority express medical kit replenishment from Ahmedabad Logistics Base.');
    }
    if (affectedCategories.includes('Water')) {
      recommendations.push('Reassign bulk water purification assets to Kutch Logistics Zone.');
    }
    if (transportAvailPct < -20) {
      recommendations.push('Mobilize Heavy Convoy Unit Falcon to compensate for regional transit deficit.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Standard replenishment cycle is sufficient. No escalation required.');
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
