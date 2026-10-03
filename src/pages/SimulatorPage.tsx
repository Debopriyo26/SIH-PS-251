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
  Package
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { simulatorService } from '../services/simulatorService';
import { SimulationParams, SimulationOutcome } from '../types';

export const SimulatorPage: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    demandChangePct: 25,
    transportAvailPct: -30,
    weatherSeverity: 'HIGH',
    inventoryStartingPct: 100,
  });

  const [outcome, setOutcome] = useState<SimulationOutcome>(() => 
    simulatorService.runSimulation({
      demandChangePct: 25,
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
    }, 250);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D8DFD5] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#1F2933] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#355E3B] inline-block rounded-xs"></span>
            Operational Scenario Simulator
          </h1>
          <p className="font-mono text-xs text-[#52606D] mt-0.5">
            Stress-test supply chain viability under hypothetical weather shocks, transport corridor disruptions, and consumption surges
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-1.5 bg-white hover:bg-[#F0F4EE] text-[#52606D] hover:text-[#1F2933] border border-[#D8DFD5] rounded-xs font-mono text-xs font-semibold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#355E3B]" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* 2-Column Clean Layout: Controls (Left) + Outcome (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Sliders & Controls */}
        <div className="lg:col-span-5 bg-white border border-[#D8DFD5] p-5 rounded-xs space-y-5 font-mono text-xs shadow-xs">
          <div className="flex items-center justify-between border-b border-[#F0F4EE] pb-2.5">
            <span className="font-tactical font-bold text-xs text-[#1F2933] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#355E3B]" />
              Simulation Variables
            </span>
            <span className="text-[10px] text-[#52606D]">Adjust & Execute</span>
          </div>

          {/* 1. Demand Change */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#52606D] font-semibold">Demand Surge / Decline:</span>
              <strong className={params.demandChangePct > 0 ? 'text-[#B42318]' : 'text-[#2F6B3C]'}>
                {params.demandChangePct > 0 ? `+${params.demandChangePct}%` : `${params.demandChangePct}%`}
              </strong>
            </div>
            <input
              type="range"
              min={-30}
              max={60}
              step={5}
              value={params.demandChangePct}
              onChange={(e) => setParams({ ...params, demandChangePct: Number(e.target.value) })}
              className="w-full accent-[#355E3B] cursor-pointer"
            />
          </div>

          {/* 2. Transport Availability */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#52606D] font-semibold">Transport Availability:</span>
              <strong className={params.transportAvailPct < 0 ? 'text-[#B42318]' : 'text-[#2F6B3C]'}>
                {params.transportAvailPct > 0 ? `+${params.transportAvailPct}%` : `${params.transportAvailPct}%`}
              </strong>
            </div>
            <input
              type="range"
              min={-50}
              max={30}
              step={5}
              value={params.transportAvailPct}
              onChange={(e) => setParams({ ...params, transportAvailPct: Number(e.target.value) })}
              className="w-full accent-[#355E3B] cursor-pointer"
            />
          </div>

          {/* 3. Weather Severity */}
          <div className="space-y-1.5">
            <span className="text-[#52606D] font-semibold block">Weather Severity:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setParams({ ...params, weatherSeverity: lvl })}
                  className={`py-1.5 text-center rounded-xs text-[11px] font-bold cursor-pointer border transition-colors ${
                    params.weatherSeverity === lvl
                      ? 'bg-[#355E3B] border-[#1F3D27] text-white shadow-xs'
                      : 'bg-[#F0F4EE] border-[#D8DFD5] text-[#52606D] hover:text-[#1F2933]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Starting Inventory */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#52606D] font-semibold">Initial Stock Level:</span>
              <strong className="text-[#1F2933]">{params.inventoryStartingPct}%</strong>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={params.inventoryStartingPct}
              onChange={(e) => setParams({ ...params, inventoryStartingPct: Number(e.target.value) })}
              className="w-full accent-[#355E3B] cursor-pointer"
            />
          </div>

          <button
            onClick={handleRunScenario}
            disabled={isSimulating}
            className="w-full py-2.5 bg-[#355E3B] hover:bg-[#1F3D27] text-white border border-[#1F3D27] font-tactical font-bold text-xs tracking-wider uppercase rounded-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#B5A47A]" />
            <span>{isSimulating ? 'Simulating Impact...' : 'RUN STRESS SCENARIO'}</span>
          </button>
        </div>

        {/* Right 7 Cols: Outcome & Depletion Projections */}
        <div className="lg:col-span-7 space-y-4 font-mono text-xs">
          {/* Top Outcome Summary */}
          <div className="bg-white border border-[#D8DFD5] p-5 rounded-xs space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F0F4EE] pb-2.5">
              <span className="font-tactical font-bold text-xs text-[#1F2933] uppercase tracking-wider">
                Simulated Impact Outlook
              </span>
              <StatusBadge status={outcome.simulatedRisk} size="md" pulse={outcome.simulatedRisk === 'CRITICAL'} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs space-y-0.5">
                <span className="text-[10px] text-[#52606D] uppercase font-bold block">Readiness Before</span>
                <strong className="text-base text-[#1F2933]">
                  {outcome.overallReadinessBefore}%
                </strong>
              </div>

              <div className="p-3 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs space-y-0.5">
                <span className="text-[10px] text-[#52606D] uppercase font-bold block">Readiness Simulated</span>
                <strong className={`text-base ${
                  outcome.overallReadinessAfter < 75 ? 'text-[#B42318]' : 'text-[#2F6B3C]'
                }`}>
                  {outcome.overallReadinessAfter}%
                </strong>
              </div>

              <div className="p-3 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-[#52606D] uppercase font-bold block">Affected Categories</span>
                <strong className="text-base text-[#B42318]">
                  {outcome.affectedCategories.length} Categories
                </strong>
              </div>
            </div>

            {/* Impacted Categories */}
            <div className="space-y-2 pt-2 border-t border-[#F0F4EE]">
              <span className="text-[10px] text-[#52606D] uppercase font-bold block">
                Resource Buffer Resilience:
              </span>
              <div className="space-y-2">
                {outcome.categoryResults.map((cr) => (
                  <div key={cr.category} className="p-3 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1F2933]">{cr.category}</span>
                        <span className="text-[10px] text-[#52606D]">({cr.simulatedDaysOfCover}d buffer vs {cr.baselineDaysOfCover}d baseline)</span>
                      </div>
                      <div className="text-[10px] text-[#52606D] mt-0.5">{cr.stressFactor}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={cr.simulatedRisk} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="pt-2 border-t border-[#F0F4EE] space-y-1.5">
              <span className="text-[10px] text-[#52606D] uppercase font-bold block">
                Mitigation Directives:
              </span>
              <div className="space-y-1.5">
                {outcome.recommendations.map((rec, i) => (
                  <div key={i} className="p-2.5 bg-[#E8F5E9] border border-[#A5D6A7] rounded-xs text-[#2F6B3C] text-[11px] font-semibold leading-relaxed">
                    • {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
