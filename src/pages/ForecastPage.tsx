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
import { StatusBadge } from '../components/common/StatusBadge';
import { DataStatus } from '../components/common/DataStatus';
import { forecastService } from '../services/forecastService';
import { inventoryService } from '../services/inventoryService';
import { ForecastSummary, LocationNode, SupplyCategory } from '../types';
import { 
  ComposedChart, 
  Line, 
  Area, 
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
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-3">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Demand Forecast
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Projected consumption and stock depletion timelines
          </p>
        </div>

        {/* Quick Selection Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          {/* Horizon Pills */}
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
                {d} Days
              </button>
            ))}
          </div>

          {/* Location Selector */}
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="bg-[#101B13] border border-[#263F2B] text-[#E7E9E2] px-3 py-1.5 rounded-xs focus:outline-hidden cursor-pointer"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          {/* Supply Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as SupplyCategory)}
            className="bg-[#101B13] border border-[#263F2B] text-[#E7E9E2] px-3 py-1.5 rounded-xs focus:outline-hidden cursor-pointer"
          >
            {['Fuel', 'Food', 'Medical', 'Water', 'General Supplies'].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Key Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-3.5 bg-[#101B13] border border-[#263F2B] rounded-xs space-y-1">
          <span className="text-[10px] text-[#8B9B8E] uppercase block">Selected Zone</span>
          <div className="font-bold text-[#E7E9E2] text-sm truncate">{activeLoc?.name}</div>
          <span className="text-[11px] text-[#B5A47A]">{selectedCategory}</span>
        </div>

        <div className="p-3.5 bg-[#101B13] border border-[#263F2B] rounded-xs space-y-1">
          <span className="text-[10px] text-[#8B9B8E] uppercase block">On-Hand Stock</span>
          <div className="font-bold text-[#E7E9E2] text-base">
            {forecast?.currentStock.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#8B9B8E]">Safety Buffer: {forecast?.safetyThreshold.toLocaleString()}</span>
        </div>

        <div className="p-3.5 bg-[#101B13] border border-[#263F2B] rounded-xs space-y-1">
          <span className="text-[10px] text-[#8B9B8E] uppercase block">Projected {horizonDays}d Demand</span>
          <div className="font-bold text-[#fbbf24] text-base">
            {forecast?.projectedDemand.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#8B9B8E]">Expected Consumption</span>
        </div>

        <div className="p-3.5 bg-[#101B13] border border-[#263F2B] rounded-xs space-y-1">
          <span className="text-[10px] text-[#8B9B8E] uppercase block">Shortage Risk</span>
          <div className="mt-0.5">
            <StatusBadge status={forecast?.riskLevel || 'MODERATE'} size="sm" pulse={forecast?.riskLevel === 'CRITICAL'} />
          </div>
          <span className="text-[10px] text-[#8B9B8E] block pt-0.5">
            {forecast?.isModelCalculated ? 'Calculated ML Projection' : 'Baseline Forecast'}
          </span>
        </div>
      </div>

      {/* Main Forecast Chart & Risk Explanation (2-Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Clean Chart */}
        <div className="lg:col-span-8 bg-[#101B13] border border-[#263F2B] p-4 rounded-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#1A2C1E] pb-2">
            <span className="text-xs font-tactical uppercase tracking-wider text-[#E7E9E2] font-semibold">
              Consumption Horizon: {selectedCategory}
            </span>
            <DataStatus
              mode={forecast?.isModelCalculated ? 'LIVE' : 'DEMO'}
              source={forecast?.modelLabel || 'Forecasting Engine'}
              size="sm"
            />
          </div>

          <div className="h-64 w-full font-mono text-xs">
            {forecast && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecast.points} margin={{ top: 10, right: 15, left: 0, bottom: 10 }}>
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
                  <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '6px' }} />
                  <Area
                    type="monotone"
                    dataKey="upperConfidence"
                    stroke="none"
                    fill="rgba(89, 107, 58, 0.15)"
                    name="Confidence Band"
                  />
                  <Line
                    type="monotone"
                    dataKey="historicalDemand"
                    stroke="#8B9B8E"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#8B9B8E' }}
                    name="Historical"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecastDemand"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    dot={{ r: 3, fill: '#fbbf24' }}
                    name="Forecast"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Concise Explanation & Recommendation */}
        <div className="lg:col-span-4 bg-[#101B13] border border-[#263F2B] p-4 rounded-xs space-y-4 font-mono text-xs flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-tactical uppercase tracking-wider text-[#E7E9E2] font-semibold block border-b border-[#1A2C1E] pb-2">
              Why the Risk Exists
            </span>

            <div className="space-y-2">
              {forecast?.riskReasons.map((reason, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs flex items-start gap-2 text-[#E7E9E2] leading-relaxed text-[11px]"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D39B32] shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Details Accordion */}
          <div className="border border-[#1A2C1E] rounded-xs bg-[#07100B]">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full p-2.5 flex items-center justify-between text-[#8B9B8E] hover:text-[#E7E9E2] text-[11px] cursor-pointer"
            >
              <span>Model Details</span>
              {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showTechnicalDetails && (
              <div className="p-2.5 border-t border-[#1A2C1E] space-y-1 text-[10px] text-[#8B9B8E]">
                <div>Model: {forecast?.modelLabel}</div>
                <div>Confidence Score: {forecast?.confidenceScore || 89}%</div>
                <div>Features: Autoregressive lags, weather impact index.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
