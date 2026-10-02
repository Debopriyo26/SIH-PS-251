import React, { useState } from 'react';
import { 
  Sliders, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Flame, 
  HeartPulse, 
  Utensils, 
  Droplet, 
  Package,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { simulatorService } from '../services/simulatorService';
import { SimulationParams, SimulationOutcome, SupplyCategory, RiskLevel } from '../types';

export const SimulatorPage: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    demandChangePct: 20, // +20% demand surge
    transportAvailPct: -30, // -30% transport deficit
    weatherSeverity: 'HIGH',
    rainfallMm: 28,
    inventoryStartingPct: 100,
  });

  const [outcome, setOutcome] = useState<SimulationOutcome>(() => 
    simulatorService.runSimulation({
      demandChangePct: 20,
      transportAvailPct: -30,
      weatherSeverity: 'HIGH',
      rainfallMm: 28,
      inventoryStartingPct: 100,
    })
  );

  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const result = simulatorService.runSimulation(params);
      setOutcome(result);
      setIsSimulating(false);
    }, 400);
  };

  const handleReset = () => {
    const defaults: SimulationParams = {
      demandChangePct: 0,
      transportAvailPct: 0,
      weatherSeverity: 'LOW',
      rainfallMm: 0,
      inventoryStartingPct: 100,
    };
    setParams(defaults);
    setOutcome(simulatorService.runSimulation(defaults));
  };

  const categoryIcon = (category: string) => {
    switch (category) {
      case 'Fuel': return <Flame className="w-4 h-4 text-[#D39B32]" />;
      case 'Water': return <Droplet className="w-4 h-4 text-[#3E92CC]" />;
      case 'Medical': return <HeartPulse className="w-4 h-4 text-[#C43C3C]" />;
      case 'Food': return <Utensils className="w-4 h-4 text-[#596B3A]" />;
      default: return <Package className="w-4 h-4 text-[#B5A47A]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            VYOMIX Scenario Simulator
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Forward Logistics Stress-Testing Engine • Multi-Variable Conflict & Disruption Modeling
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-[#101B13] hover:bg-[#1A2C1E] text-[#8B9B8E] hover:text-[#E7E9E2] border border-[#263F2B] rounded-xs font-tactical text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-6 py-2 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 text-[#B5A47A] fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'COMPUTING MODEL...' : 'RUN SIMULATION'}</span>
          </button>
        </div>
      </div>

      {/* Main Simulator Controls & Before/After Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Interactive Scenario Controls */}
        <div className="lg:col-span-5 space-y-4">
          <TacticalCard
            title="Stress Simulation Controls"
            subtitle="Adjust operational disruption variables to test logistics resilience"
          >
            <div className="space-y-5 font-mono text-xs">
              {/* 1. Demand Change */}
              <div className="space-y-1.5 bg-[#07100B] p-3.5 rounded-xs border border-[#1A2C1E]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8B9B8E] uppercase tracking-wider font-semibold text-[11px]">
                    Demand Surge / Drop:
                  </span>
                  <span className={`text-sm font-bold ${params.demandChangePct > 0 ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
                    {params.demandChangePct > 0 ? `+${params.demandChangePct}%` : `${params.demandChangePct}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="100"
                  step="5"
                  value={params.demandChangePct}
                  onChange={(e) => setParams({ ...params, demandChangePct: Number(e.target.value) })}
                  className="w-full accent-[#B5A47A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8B9B8E]">
                  <span>-50% (Troop Reduction)</span>
                  <span>0% (Baseline)</span>
                  <span>+100% (Full Mobilization)</span>
                </div>
              </div>

              {/* 2. Transport Availability */}
              <div className="space-y-1.5 bg-[#07100B] p-3.5 rounded-xs border border-[#1A2C1E]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8B9B8E] uppercase tracking-wider font-semibold text-[11px]">
                    Transport Fleet Capacity:
                  </span>
                  <span className={`text-sm font-bold ${params.transportAvailPct < 0 ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
                    {params.transportAvailPct > 0 ? `+${params.transportAvailPct}%` : `${params.transportAvailPct}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="40"
                  step="5"
                  value={params.transportAvailPct}
                  onChange={(e) => setParams({ ...params, transportAvailPct: Number(e.target.value) })}
                  className="w-full accent-[#B5A47A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8B9B8E]">
                  <span>-60% (Corridor Blocked)</span>
                  <span>0% (Nominal Fleet)</span>
                  <span>+40% (Surge Reserve)</span>
                </div>
              </div>

              {/* 3. Weather Severity */}
              <div className="space-y-1.5 bg-[#07100B] p-3.5 rounded-xs border border-[#1A2C1E]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8B9B8E] uppercase tracking-wider font-semibold text-[11px]">
                    IMD Weather Severity:
                  </span>
                  <StatusBadge status={params.weatherSeverity} size="sm" />
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setParams({ ...params, weatherSeverity: lvl })}
                      className={`py-1.5 rounded-xs font-mono text-[10px] uppercase font-bold border transition-colors ${
                        params.weatherSeverity === lvl
                          ? 'bg-[#263F2B] border-[#596B3A] text-[#E7E9E2]'
                          : 'bg-[#101B13] border-[#263F2B] text-[#8B9B8E] hover:text-[#E7E9E2]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Rainfall Rate */}
              <div className="space-y-1.5 bg-[#07100B] p-3.5 rounded-xs border border-[#1A2C1E]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8B9B8E] uppercase tracking-wider font-semibold text-[11px]">
                    Precipitation / Snow Accumulation:
                  </span>
                  <span className="text-sm font-bold text-[#3E92CC]">{params.rainfallMm} mm/h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="2"
                  value={params.rainfallMm}
                  onChange={(e) => setParams({ ...params, rainfallMm: Number(e.target.value) })}
                  className="w-full accent-[#3E92CC] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8B9B8E]">
                  <span>0 mm (Clear)</span>
                  <span>25 mm (Flash Rain)</span>
                  <span>80 mm (Extreme Blizzard)</span>
                </div>
              </div>

              {/* 5. Inventory Starting Level */}
              <div className="space-y-1.5 bg-[#07100B] p-3.5 rounded-xs border border-[#1A2C1E]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8B9B8E] uppercase tracking-wider font-semibold text-[11px]">
                    Depot Pre-Simulation Stock Level:
                  </span>
                  <span className="text-sm font-bold text-[#E7E9E2]">{params.inventoryStartingPct}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="130"
                  step="5"
                  value={params.inventoryStartingPct}
                  onChange={(e) => setParams({ ...params, inventoryStartingPct: Number(e.target.value) })}
                  className="w-full accent-[#B5A47A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8B9B8E]">
                  <span>50% (Depleted)</span>
                  <span>100% (Nominal)</span>
                  <span>130% (Stockpiled)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunSimulation}
                className="w-full py-3 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#B5A47A]" />
                <span>Execute Scenario Recalculation</span>
              </button>
            </div>
          </TacticalCard>
        </div>

        {/* Right 7 Cols: Before vs After Executive Comparison Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="tactical-border bg-[#101B13] border border-[#263F2B] p-5 rounded-sm shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1A2C1E] pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#B5A47A] uppercase tracking-wider">
                  SCENARIO OUTCOME MATRIX
                </span>
                <h3 className="font-tactical font-bold text-lg text-[#E7E9E2] uppercase">
                  Before vs After Disruption Evaluation
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#8B9B8E]">RESULT:</span>
                <StatusBadge status={outcome.simulatedRisk} pulse={outcome.simulatedRisk === 'CRITICAL'} />
              </div>
            </div>

            {/* Side by side comparison cards matching example prompt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-3">
                <div className="flex justify-between items-center border-b border-[#1A2C1E] pb-2">
                  <span className="font-tactical font-bold text-[#8B9B8E] uppercase tracking-wider">
                    BASELINE STATUS
                  </span>
                  <StatusBadge status={outcome.baselineRisk} size="sm" />
                </div>
                <div className="space-y-1.5 text-[#8B9B8E]">
                  <div>Overall Readiness: <strong className="text-[#E7E9E2]">{outcome.overallReadinessBefore}%</strong></div>
                  <div>Demand Deviation: <span className="text-[#E7E9E2]">0% Nominal</span></div>
                  <div>Transport Fleet: <span className="text-[#E7E9E2]">100% Operational</span></div>
                  <div>Weather Index: <span className="text-[#4ade80]">LOW Risk</span></div>
                </div>
              </div>

              <div className="p-4 bg-[#07100B] border border-[#596B3A]/40 rounded-xs space-y-3">
                <div className="flex justify-between items-center border-b border-[#1A2C1E] pb-2">
                  <span className="font-tactical font-bold text-[#B5A47A] uppercase tracking-wider">
                    SIMULATED SCENARIO
                  </span>
                  <StatusBadge status={outcome.simulatedRisk} size="sm" pulse={true} />
                </div>
                <div className="space-y-1.5 text-[#8B9B8E]">
                  <div>Simulated Readiness: <strong className={outcome.overallReadinessAfter < 60 ? 'text-[#f87171]' : 'text-[#fbbf24]'}>{outcome.overallReadinessAfter}%</strong></div>
                  <div>Demand: <span className={params.demandChangePct > 0 ? 'text-[#f87171]' : 'text-[#4ade80]'}>{params.demandChangePct > 0 ? `+${params.demandChangePct}%` : `${params.demandChangePct}%`}</span></div>
                  <div>Transport: <span className={params.transportAvailPct < 0 ? 'text-[#f87171]' : 'text-[#4ade80]'}>{params.transportAvailPct}%</span></div>
                  <div>Weather: <span className="text-[#f87171]">{params.weatherSeverity} ({params.rainfallMm}mm)</span></div>
                </div>
              </div>
            </div>

            {/* Affected Categories Alert */}
            {outcome.affectedCategories.length > 0 && (
              <div className="p-3 bg-[rgba(196,60,60,0.12)] border border-[#C43C3C]/50 rounded-xs flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2 text-[#f87171] font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>CRITICAL VULNERABILITY DETECTED IN CATEGORIES:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {outcome.affectedCategories.map((cat) => (
                    <span key={cat} className="px-2 py-0.5 bg-[#C43C3C] text-white font-bold rounded-xs text-[11px]">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category-by-Category Impact Table */}
            <div className="space-y-2">
              <span className="text-[11px] font-tactical uppercase tracking-wider text-[#B5A47A] block">
                Category Depletion Breakdown:
              </span>
              <div className="space-y-2 font-mono text-xs">
                {outcome.categoryResults.map((catRes) => (
                  <div
                    key={catRes.category}
                    className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-2 hover:border-[#263F2B] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {categoryIcon(catRes.category)}
                        <span className="font-tactical font-semibold text-xs text-[#E7E9E2]">
                          {catRes.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#8B9B8E] text-[11px]">
                          Cover: {catRes.baselineDaysOfCover}d ➔ <strong className={catRes.simulatedDaysOfCover < 6 ? 'text-[#f87171]' : 'text-[#fbbf24]'}>{catRes.simulatedDaysOfCover}d</strong>
                        </span>
                        <StatusBadge status={catRes.simulatedRisk} size="sm" />
                      </div>
                    </div>

                    <div className="text-[11px] text-[#8B9B8E] flex justify-between border-t border-[#1A2C1E] pt-1.5">
                      <span>{catRes.stressFactor}</span>
                      {catRes.projectedShortageUnits > 0 && (
                        <span className="text-[#f87171] font-bold">
                          Shortage: {catRes.projectedShortageUnits.toLocaleString()} {catRes.unit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Simulator Recommendations */}
            <div className="p-4 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-2.5 font-mono text-xs">
              <span className="font-tactical font-semibold text-xs text-[#B5A47A] uppercase tracking-wider block">
                Commanding Logistics Recommendations (Autonomous Engine):
              </span>
              <ul className="space-y-1.5">
                {outcome.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#E7E9E2] text-[11px] leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3FA34D] shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
