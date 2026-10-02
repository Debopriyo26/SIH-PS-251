import React, { useState } from 'react';
import { 
  Sliders, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  HeartPulse, 
  Utensils, 
  Droplet, 
  Package,
  Info
} from 'lucide-react';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { simulatorService } from '../services/simulatorService';
import { SimulationParams, SimulationOutcome, SupplyCategory } from '../types';
import { PUBLIC_DATA_DISCLAIMER } from '../services/demoData';

export const SimulatorPage: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    demandChangePct: 20,
    transportAvailPct: -30,
    weatherSeverity: 'HIGH',
    inventoryStartingPct: 100,
  });

  const [outcome, setOutcome] = useState<SimulationOutcome>(() => 
    simulatorService.runSimulation({
      demandChangePct: 20,
      transportAvailPct: -30,
      weatherSeverity: 'HIGH',
      inventoryStartingPct: 100,
    })
  );

  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunScenario = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const result = simulatorService.runSimulation(params);
      setOutcome(result);
      setIsSimulating(false);
    }, 300);
  };

  const handleReset = () => {
    const defaults: SimulationParams = {
      demandChangePct: 0,
      transportAvailPct: 0,
      weatherSeverity: 'LOW',
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
            Scenario Simulator
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Synthetic stress-testing of forward logistics resilience under hypothetical disruptions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-[#101B13] hover:bg-[#1A2C1E] text-[#8B9B8E] hover:text-[#E7E9E2] border border-[#263F2B] rounded-xs font-mono text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {/* Button strictly matching requirement 20: [ RUN SCENARIO ] */}
          <button
            onClick={handleRunScenario}
            disabled={isSimulating}
            className="px-6 py-2 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 text-[#B5A47A] fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'COMPUTING SCENARIO...' : 'RUN SCENARIO'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: 4 Simplified Controls as per requirement 20 */}
        <div className="lg:col-span-5 space-y-4">
          <TacticalCard
            title="Scenario Parameters"
            subtitle="Configure hypothetical environmental and operational shocks"
          >
            <div className="space-y-4 font-mono text-xs">
              {/* 1. Demand Change */}
              <div className="space-y-1.5 bg-[#07100B] p-3 rounded-xs border border-[#1A2C1E]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8B9B8E] uppercase font-medium text-[11px]">
                    Demand Change:
                  </span>
                  <span className={`font-bold ${params.demandChangePct > 0 ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
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
                  <span>-50%</span>
                  <span>0% Nominal</span>
                  <span>+100% Surge</span>
                </div>
              </div>

              {/* 2. Transport Availability */}
              <div className="space-y-1.5 bg-[#07100B] p-3 rounded-xs border border-[#1A2C1E]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8B9B8E] uppercase font-medium text-[11px]">
                    Transport Availability:
                  </span>
                  <span className={`font-bold ${params.transportAvailPct < 0 ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
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
                  <span>-60% Road Cut</span>
                  <span>0% Nominal</span>
                  <span>+40% Reserve</span>
                </div>
              </div>

              {/* 3. Weather Severity */}
              <div className="space-y-1.5 bg-[#07100B] p-3 rounded-xs border border-[#1A2C1E]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8B9B8E] uppercase font-medium text-[11px]">
                    Weather Severity:
                  </span>
                  <StatusBadge status={params.weatherSeverity} size="sm" />
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setParams({ ...params, weatherSeverity: lvl })}
                      className={`py-1.5 rounded-xs font-mono text-[10px] uppercase font-bold border transition-colors cursor-pointer ${
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

              {/* 4. Inventory Starting Level */}
              <div className="space-y-1.5 bg-[#07100B] p-3 rounded-xs border border-[#1A2C1E]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8B9B8E] uppercase font-medium text-[11px]">
                    Inventory Starting Level:
                  </span>
                  <span className="font-bold text-[#E7E9E2]">{params.inventoryStartingPct}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={params.inventoryStartingPct}
                  onChange={(e) => setParams({ ...params, inventoryStartingPct: Number(e.target.value) })}
                  className="w-full accent-[#B5A47A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8B9B8E]">
                  <span>50% Depleted</span>
                  <span>100% Normal</span>
                  <span>150% Stockpiled</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunScenario}
                className="w-full py-2.5 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical font-bold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>RUN SCENARIO</span>
              </button>
            </div>
          </TacticalCard>
        </div>

        {/* Right 7 Cols: Results Panel matching requirement 20 */}
        <div className="lg:col-span-7 space-y-4">
          <TacticalCard
            title="Scenario Results Comparison"
            subtitle="Current Situation vs Simulated Situation"
          >
            <div className="space-y-4 font-mono text-xs">
              {/* Current Situation vs Simulated Situation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-2">
                  <div className="flex justify-between items-center border-b border-[#1A2C1E] pb-1.5">
                    <span className="text-[#8B9B8E] font-bold text-[11px] uppercase">
                      CURRENT SITUATION
                    </span>
                    <StatusBadge status={outcome.baselineRisk} size="sm" />
                  </div>
                  <div className="text-[11px] text-[#8B9B8E] space-y-1">
                    <div>Readiness: <strong className="text-[#E7E9E2]">{outcome.overallReadinessBefore}%</strong></div>
                    <div>Demand Deviation: <span className="text-[#E7E9E2]">0% Baseline</span></div>
                    <div>Transport Fleet: <span className="text-[#E7E9E2]">100% Nominal</span></div>
                  </div>
                </div>

                <div className="p-3.5 bg-[#07100B] border border-[#596B3A]/40 rounded-xs space-y-2">
                  <div className="flex justify-between items-center border-b border-[#1A2C1E] pb-1.5">
                    <span className="text-[#B5A47A] font-bold text-[11px] uppercase">
                      SIMULATED SITUATION
                    </span>
                    <StatusBadge status={outcome.simulatedRisk} size="sm" pulse={true} />
                  </div>
                  <div className="text-[11px] text-[#8B9B8E] space-y-1">
                    <div>Readiness: <strong className={outcome.overallReadinessAfter < 65 ? 'text-[#f87171]' : 'text-[#fbbf24]'}>{outcome.overallReadinessAfter}%</strong></div>
                    <div>Demand: <span className={params.demandChangePct > 0 ? 'text-[#f87171]' : 'text-[#4ade80]'}>{params.demandChangePct > 0 ? `+${params.demandChangePct}%` : `${params.demandChangePct}%`}</span></div>
                    <div>Transport: <span className={params.transportAvailPct < 0 ? 'text-[#f87171]' : 'text-[#4ade80]'}>{params.transportAvailPct}%</span></div>
                  </div>
                </div>
              </div>

              {/* Affected Supplies Indicator */}
              {outcome.affectedCategories.length > 0 && (
                <div className="p-3 bg-[rgba(196,60,60,0.12)] border border-[#C43C3C]/50 rounded-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#f87171] font-semibold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>AFFECTED SUPPLIES:</span>
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

              {/* Category Breakdown Table */}
              <div className="space-y-2">
                <span className="text-[10px] text-[#B5A47A] uppercase font-bold tracking-wider block">
                  Supply Category Days of Cover Impact:
                </span>
                <div className="space-y-2">
                  {outcome.categoryResults.map((catRes) => (
                    <div
                      key={catRes.category}
                      className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {categoryIcon(catRes.category)}
                          <span className="font-semibold text-[#E7E9E2]">{catRes.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-[#8B9B8E]">
                            Cover: {catRes.baselineDaysOfCover}d ➔ <strong className={catRes.simulatedDaysOfCover < 6 ? 'text-[#f87171]' : 'text-[#fbbf24]'}>{catRes.simulatedDaysOfCover}d</strong>
                          </span>
                          <StatusBadge status={catRes.simulatedRisk} size="sm" />
                        </div>
                      </div>
                      <div className="text-[10px] text-[#8B9B8E]">
                        {catRes.stressFactor}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Directives / Recommendations */}
              <div className="p-3.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-2">
                <span className="text-[10px] text-[#B5A47A] uppercase font-bold tracking-wider block">
                  Logistics Recommendations:
                </span>
                <ul className="space-y-1">
                  {outcome.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#E7E9E2] text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3FA34D] shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TacticalCard>
        </div>
      </div>
    </div>
  );
};
