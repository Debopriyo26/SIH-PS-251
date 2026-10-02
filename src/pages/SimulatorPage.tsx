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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-3">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Scenario Simulator
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Test supply chain resilience under hypothetical weather, transport, and demand changes
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 bg-[#101B13] hover:bg-[#1A2C1E] text-[#8B9B8E] hover:text-[#E7E9E2] border border-[#263F2B] rounded-xs font-mono text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* 2-Column Clean Layout: Controls (Left) + Outcome (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Sliders & Controls */}
        <div className="lg:col-span-5 bg-[#101B13] border border-[#263F2B] p-5 rounded-xs space-y-5 font-mono text-xs shadow-md">
          <div className="flex items-center justify-between border-b border-[#1A2C1E] pb-2">
            <span className="font-tactical font-semibold text-xs text-[#E7E9E2] uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#B5A47A]" />
              Simulation Variables
            </span>
            <span className="text-[10px] text-[#8B9B8E]">Adjust & Run</span>
          </div>

          {/* 1. Demand Change */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#8B9B8E]">Demand Surge / Decline:</span>
              <strong className={params.demandChangePct > 0 ? 'text-[#f87171]' : 'text-[#4ade80]'}>
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
              className="w-full accent-[#596B3A] cursor-pointer"
            />
          </div>

          {/* 2. Transport Availability */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#8B9B8E]">Transport Availability:</span>
              <strong className={params.transportAvailPct < 0 ? 'text-[#f87171]' : 'text-[#4ade80]'}>
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
              className="w-full accent-[#596B3A] cursor-pointer"
            />
          </div>

          {/* 3. Weather Severity */}
          <div className="space-y-1.5">
            <span className="text-[#8B9B8E] block">Weather Severity:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setParams({ ...params, weatherSeverity: lvl })}
                  className={`py-1.5 text-center rounded-xs text-[11px] font-semibold cursor-pointer border transition-colors ${
                    params.weatherSeverity === lvl
                      ? 'bg-[#263F2B] border-[#596B3A] text-[#E7E9E2]'
                      : 'bg-[#07100B] border-[#1A2C1E] text-[#8B9B8E] hover:text-[#E7E9E2]'
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
              <span className="text-[#8B9B8E]">Initial Stock Level:</span>
              <strong className="text-[#E7E9E2]">{params.inventoryStartingPct}%</strong>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              step={10}
              value={params.inventoryStartingPct}
              onChange={(e) => setParams({ ...params, inventoryStartingPct: Number(e.target.value) })}
              className="w-full accent-[#596B3A] cursor-pointer"
            />
          </div>

          {/* Run Scenario Button */}
          <button
            onClick={handleRunScenario}
            disabled={isSimulating}
            className="w-full py-2.5 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 text-[#B5A47A] fill-current ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'SIMULATING...' : 'RUN SCENARIO'}</span>
          </button>
        </div>

        {/* Right 7 Cols: Outcome & Before vs After Impact */}
        <div className="lg:col-span-7 space-y-4 font-mono text-xs">
          {/* Top Comparison Card */}
          <div className="bg-[#101B13] border border-[#263F2B] p-5 rounded-xs shadow-md space-y-4">
            <span className="font-tactical font-semibold text-xs text-[#E7E9E2] uppercase tracking-wider block border-b border-[#1A2C1E] pb-2">
              Scenario Outcome Summary
            </span>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-1">
                <span className="text-[10px] text-[#8B9B8E] uppercase block">Current Readiness</span>
                <div className="font-bold text-[#4ade80] text-lg">
                  {outcome.overallReadinessBefore}%
                </div>
              </div>

              <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-1">
                <span className="text-[10px] text-[#8B9B8E] uppercase block">Simulated Readiness</span>
                <div className={`font-bold text-lg ${outcome.overallReadinessAfter < 70 ? 'text-[#f87171]' : 'text-[#fbbf24]'}`}>
                  {outcome.overallReadinessAfter}%
                </div>
              </div>

              <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-1">
                <span className="text-[10px] text-[#8B9B8E] uppercase block">Readiness Delta</span>
                <div className="font-bold text-[#f87171] text-lg">
                  -{outcome.overallReadinessBefore - outcome.overallReadinessAfter}%
                </div>
              </div>
            </div>

            {/* Affected Supplies Chips */}
            <div className="space-y-2 pt-2 border-t border-[#1A2C1E]">
              <span className="text-[11px] text-[#8B9B8E] block uppercase font-semibold">
                Supplies Facing Immediate Risk:
              </span>
              <div className="flex flex-wrap gap-2">
                {outcome.affectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 bg-[rgba(196,60,60,0.18)] border border-[#C43C3C]/50 text-[#f87171] text-[11px] rounded-xs font-semibold flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Recommendation */}
            {outcome.recommendations && outcome.recommendations.length > 0 && (
              <div className="p-3 bg-[#07100B] border-l-2 border-l-[#B5A47A] border border-[#1A2C1E] rounded-xs space-y-1">
                <span className="text-[10px] text-[#B5A47A] uppercase font-bold tracking-wider block">
                  Recommended Logistics Action:
                </span>
                <p className="text-[#E7E9E2] text-xs leading-relaxed">
                  {outcome.recommendations[0]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
