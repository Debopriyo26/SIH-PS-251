import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Cpu, 
  AlertTriangle, 
  HelpCircle, 
  Calendar, 
  Sliders, 
  ShieldCheck, 
  CheckCircle2, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { forecastService } from '../services/forecastService';
import { inventoryService } from '../services/inventoryService';
import { ForecastSummary, LocationNode, SupplyCategory, RiskLevel } from '../types';
import { 
  ComposedChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export const ForecastPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('loc-dn-a');
  const [selectedCategory, setSelectedCategory] = useState<SupplyCategory>('Fuel');
  const [horizonDays, setHorizonDays] = useState<number>(7);
  const [forecast, setForecast] = useState<ForecastSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const locs = await inventoryService.getLocations();
      setLocations(locs);
      loadForecastData(selectedLocationId, selectedCategory, horizonDays);
    }
    init();
  }, [selectedLocationId, selectedCategory, horizonDays]);

  const loadForecastData = async (locId: string, cat: SupplyCategory, days: number) => {
    setLoading(true);
    const result = await forecastService.getForecast(locId, cat, days);
    setForecast(result);
    setLoading(false);
  };

  const activeLoc = locations.find(l => l.id === selectedLocationId) || locations[2];

  return (
    <div className="space-y-6">
      {/* Header and Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Predictive Demand & Shortage Engine
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Machine Learning Forecasting • Multi-Factor Non-Black-Box Supply Risk Scoring
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#101B13] p-1 border border-[#263F2B] rounded-xs font-mono text-xs">
            <span className="text-[#8B9B8E] px-2">HORIZON:</span>
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setHorizonDays(d)}
                className={`px-3 py-1 rounded-xs transition-colors ${
                  horizonDays === d
                    ? 'bg-[#263F2B] text-[#E7E9E2] font-semibold border border-[#596B3A]'
                    : 'text-[#8B9B8E] hover:text-[#E7E9E2]'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>

          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="bg-[#101B13] border border-[#263F2B] text-xs font-mono text-[#E7E9E2] px-3.5 py-2 rounded-xs focus:outline-hidden"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as SupplyCategory)}
            className="bg-[#101B13] border border-[#263F2B] text-xs font-mono text-[#E7E9E2] px-3.5 py-2 rounded-xs focus:outline-hidden"
          >
            {['Fuel', 'Food', 'Medical', 'Water', 'General Supplies'].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Performance & Telemetry Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#101B13] border border-[#263F2B] p-4 rounded-xs font-mono text-xs">
        <div>
          <span className="text-[#8B9B8E] block text-[10px] uppercase">Active ML Model</span>
          <span className="text-[#E7E9E2] font-bold text-sm">VYOMIX-RF Ensemble v1.4</span>
          <span className="text-[#3FA34D] block text-[11px]">Feature Weights: Burn Lag + Weather + Fleet</span>
        </div>
        <div>
          <span className="text-[#8B9B8E] block text-[10px] uppercase">Model Confidence Score</span>
          <span className="text-[#4ade80] font-bold text-lg">{forecast?.confidenceScore || 89.2}%</span>
          <span className="text-[#8B9B8E] block text-[11px]">Validated on 180-day backtest</span>
        </div>
        <div>
          <span className="text-[#8B9B8E] block text-[10px] uppercase">Projected {horizonDays}-Day Consumption</span>
          <span className="text-[#fbbf24] font-bold text-lg">
            {forecast?.projectedDemand.toLocaleString()} Units
          </span>
          <span className="text-[#8B9B8E] block text-[11px]">Baseline: 510/day + surge factor</span>
        </div>
        <div>
          <span className="text-[#8B9B8E] block text-[10px] uppercase">Calculated Supply Risk</span>
          <div className="mt-1">
            <StatusBadge status={forecast?.riskLevel || 'MODERATE'} size="md" pulse={forecast?.riskLevel === 'CRITICAL'} />
          </div>
        </div>
      </div>

      {/* Main ML Forecast Visualization Chart */}
      <TacticalCard
        title={`Historical vs Projected Demand Horizon (${selectedCategory} at ${activeLoc?.name})`}
        subtitle="Confidence envelope (80%-120%) calculated with IMD weather precipitation cross-correlation"
      >
        <div className="h-80 w-full pt-4">
          {forecast && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecast.points} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid stroke="#1A2C1E" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#8B9B8E" fontSize={11} tickLine={false} />
                <YAxis yAxisId="demand" stroke="#8B9B8E" fontSize={11} />
                <YAxis yAxisId="rain" orientation="right" stroke="#3E92CC" fontSize={11} unit="mm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101B13',
                    borderColor: '#263F2B',
                    borderRadius: '2px',
                    color: '#E7E9E2',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    paddingTop: '10px'
                  }}
                />
                {/* Confidence Interval Envelope */}
                <Area
                  yAxisId="demand"
                  type="monotone"
                  dataKey="upperConfidence"
                  stroke="none"
                  fill="rgba(89, 107, 58, 0.15)"
                  name="Upper Confidence (90th percentile)"
                />
                <Area
                  yAxisId="demand"
                  type="monotone"
                  dataKey="lowerConfidence"
                  stroke="none"
                  fill="rgba(7, 16, 11, 0.9)"
                  name="Lower Confidence (10th percentile)"
                />
                {/* Rainfall Bars from IMD */}
                <Bar
                  yAxisId="rain"
                  dataKey="rainfallMm"
                  fill="#3E92CC"
                  opacity={0.35}
                  name="IMD Rainfall (mm)"
                  barSize={12}
                />
                {/* Historical Demand Line */}
                <Line
                  yAxisId="demand"
                  type="monotone"
                  dataKey="historicalDemand"
                  stroke="#8B9B8E"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#8B9B8E' }}
                  name="Historical Actual Consumption"
                />
                {/* ML Forecast Line */}
                <Line
                  yAxisId="demand"
                  type="monotone"
                  dataKey="forecastDemand"
                  stroke="#fbbf24"
                  strokeWidth={2.5}
                  strokeDasharray="4 2"
                  dot={{ r: 4, fill: '#fbbf24' }}
                  name="ML Predicted Demand"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </TacticalCard>

      {/* Explainable AI & Shortage Risk Attribution Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TacticalCard
          title="Predictive Shortage Engine — Explainable Factors"
          subtitle="Mathematical risk decomposition: Inventory + Demand + Safety Floor + Weather + Transport"
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs flex items-center justify-between">
              <span className="text-[#8B9B8E]">Calculated Risk Status:</span>
              <StatusBadge status={forecast?.riskLevel || 'MODERATE'} size="md" pulse={forecast?.riskLevel === 'CRITICAL'} />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-tactical uppercase tracking-wider text-[#B5A47A] block">
                Primary Attribution Drivers (Why this risk exists):
              </span>
              {forecast?.riskReasons.map((reason, i) => (
                <div
                  key={i}
                  className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs flex items-start gap-2.5 text-[#E7E9E2]"
                >
                  <AlertTriangle className="w-4 h-4 text-[#D39B32] shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-2 text-[11px]">
              <span className="text-[#B5A47A] uppercase font-semibold block">Risk Equation:</span>
              <div className="text-[#8B9B8E] bg-[#101B13] p-2 rounded-xs border border-[#263F2B]">
                Risk = (Projected Consumption × Weather Surge Factor) - Current Inventory + (Safety Floor ÷ Transport Availability)
              </div>
            </div>
          </div>
        </TacticalCard>

        <TacticalCard
          title="Tactical AI Mitigation Directives"
          subtitle="Actionable steps generated from inventory thresholds and weather outlook"
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-2">
              <div className="flex items-center gap-2 text-[#4ade80] font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>DIRECTIVE 1: STAGE FORWARD CONVOY TR-001</span>
              </div>
              <p className="text-[#8B9B8E] text-[11px] leading-relaxed">
                Dispatch 8-tonne heavy transport carrier from Supply Hub North before IMD Orange rain warning reaches peak intensity at 14:00 IST.
              </p>
            </div>

            <div className="p-3.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-2">
              <div className="flex items-center gap-2 text-[#fbbf24] font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>DIRECTIVE 2: DYNAMIC CONSERVATION MEASURES</span>
              </div>
              <p className="text-[#8B9B8E] text-[11px] leading-relaxed">
                Implement temporary non-critical generator cycling at Distribution Node Alpha to reduce daily POL burn from 510 L/day to 420 L/day (+2.1 days buffer).
              </p>
            </div>

            <div className="p-3.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-2">
              <div className="flex items-center gap-2 text-[#B5A47A] font-semibold text-xs">
                <Info className="w-4 h-4" />
                <span>DIRECTIVE 3: REDUNDANT ROUTE CLEARANCE</span>
              </div>
              <p className="text-[#8B9B8E] text-[11px] leading-relaxed">
                Notify Northern Sector Road Maintenance Command to pre-position bulldozers along Sector Pass corridor to mitigate mudslide delays.
              </p>
            </div>
          </div>
        </TacticalCard>
      </div>
    </div>
  );
};
