import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataStatus } from '../components/common/DataStatus';
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
  const [selectedLocationId, setSelectedLocationId] = useState<string>('loc-srinagar');
  const [selectedCategory, setSelectedCategory] = useState<SupplyCategory>('Fuel');
  const [horizonDays, setHorizonDays] = useState<number>(7);
  const [forecast, setForecast] = useState<ForecastSummary | null>(null);
  const [showModelDetails, setShowModelDetails] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const locs = await inventoryService.getLocations();
      setLocations(locs);
      loadForecastData(selectedLocationId, selectedCategory, horizonDays);
    }
    init();
  }, [selectedLocationId, selectedCategory, horizonDays]);

  const loadForecastData = async (locId: string, cat: SupplyCategory, days: number) => {
    setIsLoading(true);
    const result = await forecastService.getForecast(locId, cat, days);
    setForecast(result);
    setIsLoading(false);
  };

  const activeLoc = locations.find(l => l.id === selectedLocationId) || locations[0];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Demand Forecast
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Projected supply consumption horizons and explainable shortage risk assessment
          </p>
        </div>

        {/* Controls: Location, Supply, and Horizon Selector */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1 bg-[#101B13] p-1 border border-[#263F2B] rounded-xs">
            <span className="text-[#8B9B8E] px-2">HORIZON:</span>
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setHorizonDays(d)}
                className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                  horizonDays === d
                    ? 'bg-[#263F2B] text-[#E7E9E2] font-semibold border border-[#596B3A]'
                    : 'text-[#8B9B8E] hover:text-[#E7E9E2]'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="bg-[#101B13] border border-[#263F2B] text-[#E7E9E2] px-3.5 py-2 rounded-xs focus:outline-hidden cursor-pointer"
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
            className="bg-[#101B13] border border-[#263F2B] text-[#E7E9E2] px-3.5 py-2 rounded-xs focus:outline-hidden cursor-pointer"
          >
            {['Fuel', 'Food', 'Medical', 'Water', 'General Supplies'].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Strip matching requirement 19 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-[#101B13] border border-[#263F2B] rounded-xs space-y-1">
          <span className="text-[10px] text-[#8B9B8E] uppercase block">Selected Zone</span>
          <div className="font-bold text-[#E7E9E2] text-sm truncate">{activeLoc?.name}</div>
          <span className="text-[11px] text-[#B5A47A]">{selectedCategory}</span>
        </div>

        <div className="p-4 bg-[#101B13] border border-[#263F2B] rounded-xs space-y-1">
          <span className="text-[10px] text-[#8B9B8E] uppercase block">Current Stock</span>
          <div className="font-bold text-[#E7E9E2] text-lg">
            {forecast?.currentStock.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#8B9B8E]">Safety Floor: {forecast?.safetyThreshold.toLocaleString()}</span>
        </div>

        <div className="p-4 bg-[#101B13] border border-[#263F2B] rounded-xs space-y-1">
          <span className="text-[10px] text-[#8B9B8E] uppercase block">Projected {horizonDays}-Day Demand</span>
          <div className="font-bold text-[#fbbf24] text-lg">
            {forecast?.projectedDemand.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#8B9B8E]">Estimated total burn</span>
        </div>

        <div className="p-4 bg-[#101B13] border border-[#263F2B] rounded-xs space-y-1">
          <span className="text-[10px] text-[#8B9B8E] uppercase block">Calculated Risk Level</span>
          <div className="mt-1">
            <StatusBadge status={forecast?.riskLevel || 'MODERATE'} size="md" pulse={forecast?.riskLevel === 'CRITICAL'} />
          </div>
          <span className="text-[10px] text-[#8B9B8E] block pt-1">
            {forecast?.isModelCalculated ? 'Python ML Regressor' : 'Baseline Forecast'}
          </span>
        </div>
      </div>

      {/* Main Forecast Chart */}
      <TacticalCard
        title={`Consumption Horizon: ${selectedCategory} at ${activeLoc?.name}`}
        subtitle={`Historical burn vs ${horizonDays}-day projected requirements`}
        headerAction={
          <DataStatus
            mode={forecast?.isModelCalculated ? 'LIVE' : 'DEMO'}
            source={forecast?.modelLabel || 'Forecasting Engine'}
            size="sm"
          />
        }
      >
        <div className="h-72 w-full pt-4 font-mono">
          {forecast && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecast.points} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid stroke="#1A2C1E" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#8B9B8E" fontSize={11} />
                <YAxis stroke="#8B9B8E" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101B13',
                    borderColor: '#263F2B',
                    borderRadius: '2px',
                    color: '#E7E9E2',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    paddingTop: '8px'
                  }}
                />
                {/* Confidence Area */}
                <Area
                  type="monotone"
                  dataKey="upperConfidence"
                  stroke="none"
                  fill="rgba(89, 107, 58, 0.15)"
                  name="Upper Estimate"
                />
                {/* Historical Line */}
                <Line
                  type="monotone"
                  dataKey="historicalDemand"
                  stroke="#8B9B8E"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#8B9B8E' }}
                  name="Historical Actual"
                />
                {/* Forecast Line */}
                <Line
                  type="monotone"
                  dataKey="forecastDemand"
                  stroke="#fbbf24"
                  strokeWidth={2.5}
                  strokeDasharray="4 2"
                  dot={{ r: 3, fill: '#fbbf24' }}
                  name="Projected Forecast"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </TacticalCard>

      {/* Explainable AI: Why the risk exists */}
      <TacticalCard
        title="Why the Risk Exists (Explainable Factors)"
        subtitle="Decomposition of supply shortfall drivers"
      >
        <div className="space-y-3 font-mono text-xs">
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
      </TacticalCard>

      {/* Model Details Collapsible matching requirement 19 */}
      <div className="border border-[#263F2B] bg-[#101B13] rounded-xs font-mono text-xs">
        <button
          onClick={() => setShowModelDetails(!showModelDetails)}
          className="w-full p-3.5 flex items-center justify-between text-left text-[#B5A47A] hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#596B3A]" />
            <span className="font-semibold uppercase tracking-wider text-xs">Model Technical Details</span>
          </div>
          {showModelDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showModelDetails && (
          <div className="p-4 border-t border-[#1A2C1E] space-y-3 bg-[#07100B] text-[#8B9B8E] text-[11px] leading-relaxed">
            <div>
              <strong className="text-[#E7E9E2]">Model Architecture: </strong>
              <span>{forecast?.modelLabel}</span>
            </div>
            <div>
              <strong className="text-[#E7E9E2]">Engineered Features: </strong>
              <span>1-day & 7-day autoregressive consumption lags, troop strength, IMD precipitation rate, temperature, transport corridor delay penalty.</span>
            </div>
            {forecast?.confidenceScore && (
              <div>
                <strong className="text-[#E7E9E2]">Model Evaluation Score: </strong>
                <span className="text-[#4ade80]">{forecast.confidenceScore}% (Backtested cross-validation)</span>
              </div>
            )}
            <div className="text-[10px] text-[#8B9B8E] pt-1">
              Confidence intervals represent empirical residual error bounds.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
