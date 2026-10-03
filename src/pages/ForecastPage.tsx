import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Calendar,
  AlertTriangle,
  HelpCircle,
  Send,
  CheckCircle2,
  Boxes,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataStatus } from '../components/common/DataStatus';
import { forecastService } from '../services/forecastService';
import { inventoryService } from '../services/inventoryService';
import { useAuth } from '../lib/authContext';
import { resolveLocationId, getLocationZoneName } from '../lib/zones';
import { 
  ForecastSummary, 
  LocationNode, 
  SupplyCategory, 
  DemandForecastPoint, 
  AIRequirementItem,
  LogisticsZone 
} from '../types';
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
  const { user } = useAuth();
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const isMainHead = user?.role === 'MAIN_HEAD';
  const effectiveZone = (user?.zone as LogisticsZone) || 'Srinagar';

  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    isMainHead ? 'a1111111-1111-1111-1111-111111111111' : resolveLocationId(effectiveZone)
  );
  const [selectedCategory, setSelectedCategory] = useState<SupplyCategory>('Fuel');
  const [horizonDays, setHorizonDays] = useState<number>(7);
  const [forecast, setForecast] = useState<ForecastSummary | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [transmittingId, setTransmittingId] = useState<string | null>(null);

  // Strict Zone Isolation: Lock location to user's assigned zone if Zonal Head
  useEffect(() => {
    if (!isMainHead && user?.zone) {
      setSelectedLocationId(resolveLocationId(user.zone));
    }
  }, [isMainHead, user?.zone]);

  useEffect(() => {
    async function init() {
      const locs = await inventoryService.getLocations(user?.role, user?.zone as LogisticsZone);
      setLocations(locs);
      loadForecastData(selectedLocationId, selectedCategory, horizonDays);
    }
    init();
  }, [selectedLocationId, selectedCategory, horizonDays, user?.role, user?.zone]);

  const loadForecastData = async (locId: string, cat: SupplyCategory, days: number) => {
    setIsLoading(true);
    const targetLocId = !isMainHead && user?.zone ? resolveLocationId(user.zone) : locId;
    const result = await forecastService.getForecast(
      targetLocId, 
      cat, 
      days, 
      user?.role, 
      user?.zone as LogisticsZone
    );
    
    // Strict domain validation before chart rendering (Requirement 31):
    // Demand and inventory are physical absolute quantities and must never be negative.
    if (result && result.points) {
      result.points = result.points.map((pt: DemandForecastPoint) => ({
        ...pt,
        historicalDemand: pt.historicalDemand !== undefined ? Math.max(0, pt.historicalDemand) : undefined,
        forecastDemand: Math.max(0, pt.forecastDemand),
        upperConfidence: Math.max(0, pt.upperConfidence || 0),
        lowerConfidence: Math.max(0, pt.lowerConfidence || 0),
      }));
      result.projectedDemand = Math.max(0, result.projectedDemand);
      result.currentStock = Math.max(0, result.currentStock);
      result.projectedShortfall = Math.max(0, result.projectedShortfall);
    }

    setForecast(result);
    setIsLoading(false);
  };

  const handleTransmitRequirement = async (req: AIRequirementItem) => {
    setTransmittingId(req.id);
    try {
      const targetZone = (!isMainHead && user?.zone) ? user.zone : getLocationZoneName(selectedLocationId);
      await forecastService.transmitAIRequirementToMainHead(
        req, 
        targetZone, 
        user?.fullName || `${targetZone} Logistics Officer`
      );
      setToastMessage(`Requirement for ${req.supply_name} (${req.suggested_order_qty} ${req.unit}) transmitted to Main Head.`);
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err: any) {
      console.error('Error transmitting requirement:', err);
      setToastMessage('Failed to transmit requirement to Main Head.');
      setTimeout(() => setToastMessage(null), 4500);
    } finally {
      setTransmittingId(null);
    }
  };

  const activeLoc = locations.find(l => l.id === selectedLocationId) || locations[0];

  // Derive metric unit
  const getUnit = (cat: SupplyCategory): string => {
    switch (cat) {
      case 'Fuel': return 'Liters';
      case 'Water': return 'Liters';
      case 'Food': return 'Ration-Packs';
      case 'Medical': return 'Kits';
      default: return 'Units';
    }
  };

  const metricUnit = getUnit(selectedCategory);

  // Custom Chart Tooltip explaining metrics (Requirement 19)
  const CustomForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#D8DFD5] p-3 rounded-xs shadow-md font-mono text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-[#1F2933] border-b border-[#F0F4EE] pb-1">
            Date: {label}
          </div>
          {payload.map((entry: any, index: number) => {
            const isHistorical = entry.dataKey === 'historicalDemand';
            const isForecast = entry.dataKey === 'forecastDemand';
            const isBand = entry.dataKey === 'upperConfidence';

            let meaningText = '';
            if (isHistorical) meaningText = 'Actual recorded consumption';
            else if (isForecast) meaningText = 'Predicted future demand';
            else if (isBand) meaningText = 'Expected variance interval (88%-112%)';

            return (
              <div key={`tooltip-${index}`} className="flex flex-col text-[11px]">
                <div className="flex justify-between items-center">
                  <span style={{ color: entry.color }} className="font-semibold">
                    {entry.name}:
                  </span>
                  <strong className="text-[#1F2933]">
                    {entry.value?.toLocaleString()} {metricUnit}
                  </strong>
                </div>
                {meaningText && (
                  <span className="text-[10px] text-[#52606D]">{meaningText}</span>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification for Transmitting AI Requirement */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white border border-[#2F6B3C] text-[#2F6B3C] px-4 py-2.5 rounded-xs shadow-lg font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2F6B3C]" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls (Strict Zone Isolation - Requirement 6 & 33) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D8DFD5] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#1F2933] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#355E3B] inline-block rounded-xs"></span>
            Demand Forecast & Depletion Outlook
          </h1>
          <p className="font-mono text-xs text-[#52606D] mt-0.5">
            {isMainHead
              ? 'Multi-sector consumption forecasting, safety cushion analysis and requirement judgement'
              : `Predictive demand forecasting & AI requirement generation for ${user?.zone || 'assigned'} Zone`}
          </p>
        </div>

        {/* Quick Selection Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          {/* Horizon Pills */}
          <div className="flex items-center gap-1 bg-white p-1 border border-[#D8DFD5] rounded-xs shadow-xs">
            <span className="text-[#52606D] px-2 font-bold">HORIZON:</span>
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setHorizonDays(d)}
                className={`px-3 py-1 rounded-xs transition-colors cursor-pointer font-bold ${
                  horizonDays === d
                    ? 'bg-[#355E3B] text-white border border-[#1F3D27] shadow-xs'
                    : 'text-[#52606D] hover:text-[#1F2933]'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>

          {/* Location Selector: Main Head ONLY (Requirement 6 & 33) */}
          {isMainHead ? (
            <div className="flex items-center gap-2">
              <span className="text-[#52606D] font-bold">ZONE:</span>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-[#1F2933] px-3 py-1.5 rounded-xs focus:outline-hidden cursor-pointer font-bold shadow-xs"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#F0F4EE] border border-[#CAD3C8] px-3 py-1.5 rounded-xs">
              <span className="text-[10px] text-[#52606D] font-bold uppercase">MY ZONE:</span>
              <span className="text-xs font-bold text-[#355E3B] uppercase">
                ⚑ {user?.zone || 'Srinagar'}
              </span>
            </div>
          )}

          {/* Supply Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as SupplyCategory)}
            className="bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-[#1F2933] px-3 py-1.5 rounded-xs focus:outline-hidden cursor-pointer font-bold shadow-xs"
          >
            {['Fuel', 'Food', 'Medical', 'Water', 'General Supplies'].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Key Summary Metrics (Requirement 10 & 11) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 bg-white border border-[#D8DFD5] rounded-xs space-y-1 shadow-xs border-l-4 border-l-[#355E3B]">
          <span className="text-[10px] text-[#52606D] uppercase font-bold block">Selected Sector</span>
          <div className="font-bold text-[#1F2933] text-sm truncate">{activeLoc?.name}</div>
          <span className="text-[11px] text-[#355E3B] font-semibold">{selectedCategory} ({metricUnit})</span>
        </div>

        <div className="p-4 bg-white border border-[#D8DFD5] rounded-xs space-y-1 shadow-xs border-l-4 border-l-[#6B7444]">
          <span className="text-[10px] text-[#52606D] uppercase font-bold block">On-Hand Stock</span>
          <div className="font-bold text-[#1F2933] text-base">
            {forecast?.currentStock.toLocaleString()} {metricUnit}
          </div>
          <span className="text-[10px] text-[#52606D]">Safety Floor: {forecast?.safetyThreshold.toLocaleString()} {metricUnit}</span>
        </div>

        <div className="p-4 bg-white border border-[#D8DFD5] rounded-xs space-y-1 shadow-xs border-l-4 border-l-[#A16207]">
          <span className="text-[10px] text-[#52606D] uppercase font-bold block">Projected {horizonDays}d Demand</span>
          <div className="font-bold text-[#A16207] text-base">
            {forecast?.projectedDemand.toLocaleString()} {metricUnit}
          </div>
          <span className="text-[10px] text-[#52606D]">Expected Total Consumption</span>
        </div>

        <div className="p-4 bg-white border border-[#D8DFD5] rounded-xs space-y-1 shadow-xs border-l-4 border-l-[#B42318]">
          <span className="text-[10px] text-[#52606D] uppercase font-bold block">AI Requirement Assessment</span>
          <div className="pt-0.5">
            <span className={`px-2 py-0.5 rounded-xs text-[11px] font-bold uppercase tracking-wider border ${
              forecast?.aiDecision === 'CRITICAL SHORTAGE' ? 'bg-[#FEE4E2] text-[#B42318] border-[#FDA29B]' :
              forecast?.aiDecision === 'URGENT REPLENISH' ? 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]' :
              forecast?.aiDecision === 'REPLENISH' ? 'bg-[#FEF08A] text-[#A16207] border-[#FDE047]' :
              'bg-[#E8F5E9] text-[#2F6B3C] border-[#A5D6A7]'
            }`}>
              {forecast?.aiDecision || 'MONITOR'}
            </span>
          </div>
          <span className="text-[10px] text-[#52606D] block pt-1">
            Shortfall: <strong className={forecast?.projectedShortfall ? 'text-[#B42318]' : 'text-[#2F6B3C]'}>
              {forecast?.projectedShortfall?.toLocaleString() || 0} {metricUnit}
            </strong>
          </span>
        </div>
      </div>

      {/* Main Forecast Chart & Risk Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Chart */}
        <div className="lg:col-span-8 bg-white border border-[#D8DFD5] p-5 rounded-xs space-y-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between border-b border-[#F0F4EE] pb-2.5 gap-2">
            <div>
              <h2 className="text-xs font-tactical uppercase tracking-wider text-[#1F2933] font-bold">
                Demand Forecast — {selectedCategory} ({metricUnit})
              </h2>
              <p className="text-[11px] font-mono text-[#52606D]">
                Expected quantity required based on historical consumption, troop strength, and weather inputs
              </p>
            </div>
            <DataStatus
              mode={forecast?.isModelCalculated ? 'LIVE' : 'DEMO'}
              source={forecast?.modelLabel || 'Forecasting Engine'}
              size="sm"
            />
          </div>

          {/* Informational Guidance Note (Requirement 31 & 32) */}
          <div className="flex items-center gap-2 p-2 bg-[#F0F4EE] rounded-xs border border-[#D8DFD5] text-[11px] font-mono text-[#52606D]">
            <HelpCircle className="w-3.5 h-3.5 text-[#355E3B] shrink-0" />
            <span>
              <strong>Historical:</strong> Actual recorded consumption • <strong>Forecast:</strong> Predicted demand. Non-negative physical quantities strictly enforced.
            </span>
          </div>

          <div className="h-72 w-full font-mono text-xs pt-2">
            {forecast && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecast.points} margin={{ top: 15, right: 20, left: 15, bottom: 25 }}>
                  <CartesianGrid stroke="#E2E8DF" strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#52606D" 
                    fontSize={11}
                    label={{ value: 'Date', position: 'insideBottom', offset: -15, fill: '#52606D', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis 
                    stroke="#52606D" 
                    fontSize={11}
                    domain={[0, 'auto']}
                    label={{ value: metricUnit, angle: -90, position: 'insideLeft', offset: -5, fill: '#52606D', fontSize: 11, fontWeight: 600 }}
                  />
                  <Tooltip content={<CustomForecastTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '10px' }} 
                  />
                  <Area
                    type="monotone"
                    dataKey="upperConfidence"
                    stroke="none"
                    fill="rgba(53, 94, 59, 0.12)"
                    name="Confidence Envelope"
                  />
                  <Line
                    type="monotone"
                    dataKey="historicalDemand"
                    stroke="#52606D"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#52606D' }}
                    name="Historical (Recorded)"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecastDemand"
                    stroke="#A16207"
                    strokeWidth={2.5}
                    strokeDasharray="4 2"
                    dot={{ r: 3.5, fill: '#A16207' }}
                    name="Forecast (Predicted)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right 4 Cols: AI Decision Layer & Explainability (Requirements 10, 11, 12) */}
        <div className="lg:col-span-4 bg-white border border-[#D8DFD5] p-5 rounded-xs space-y-4 font-mono text-xs flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="border-b border-[#F0F4EE] pb-2">
              <span className="text-[10px] text-[#355E3B] uppercase font-bold tracking-wider block">
                AI REQUIREMENT JUDGEMENT
              </span>
              <h3 className="font-tactical font-bold text-sm text-[#1F2933]">
                Sector Decision Assessment
              </h3>
            </div>

            {/* AI Decision Breakdown Box (Requirement 11) */}
            <div className="p-3 bg-[#F9FAF8] border border-[#D8DFD5] rounded-xs space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#52606D]">Forecast Demand:</span>
                <strong className="text-[#1F2933]">{forecast?.projectedDemand.toLocaleString()} {metricUnit}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52606D]">Available + Incoming:</span>
                <strong className="text-[#1F2933]">{forecast?.projectedAvailable.toLocaleString()} {metricUnit}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52606D]">Mandatory Safety Stock:</span>
                <strong className="text-[#1F2933]">{forecast?.safetyThreshold.toLocaleString()} {metricUnit}</strong>
              </div>
              <div className="border-t border-[#D8DFD5] pt-1 flex justify-between font-bold">
                <span className={forecast?.projectedShortfall ? 'text-[#B42318]' : 'text-[#2F6B3C]'}>
                  Projected Shortfall:
                </span>
                <span className={forecast?.projectedShortfall ? 'text-[#B42318]' : 'text-[#2F6B3C]'}>
                  {forecast?.projectedShortfall?.toLocaleString() || 0} {metricUnit}
                </span>
              </div>
            </div>

            {/* AI Explainability (Requirement 12) */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-[#52606D] uppercase font-bold tracking-wider block">
                WHY THIS REQUIREMENT WAS GENERATED:
              </span>
              <div className="space-y-1.5">
                {forecast?.riskReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs">
                    <span className="text-[#355E3B] font-bold text-xs mt-0.5">•</span>
                    <span className="text-[#1F2933] text-[11px] leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F0F4EE]">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-[#355E3B] hover:underline flex items-center justify-between w-full text-xs font-semibold cursor-pointer"
            >
              <span>{showTechnicalDetails ? 'Hide Model Details' : 'View Model Metrics'}</span>
              {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showTechnicalDetails && (
              <div className="mt-2.5 p-3 bg-[#F0F4EE] border border-[#D8DFD5] rounded-xs space-y-1 text-[11px] text-[#52606D]">
                <div>Model: <strong className="text-[#1F2933]">{forecast?.modelLabel}</strong></div>
                <div>Horizon: <strong className="text-[#1F2933]">{horizonDays} Days forward</strong></div>
                <div>Features: <strong className="text-[#1F2933]">Burn Rate Lags, Troop Strength, IMD Rainfall Telemetry</strong></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DYNAMIC AI-GENERATED REQUIREMENT LIST (Requirements 13 & 14) */}
      <div className="bg-white border border-[#D8DFD5] rounded-xs p-5 shadow-xs space-y-3 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F4EE] pb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-4 bg-[#355E3B] inline-block rounded-xs"></span>
              <h2 className="font-tactical font-bold text-sm text-[#1F2933] uppercase tracking-wider">
                AI-GENERATED REQUIREMENT LIST — {activeLoc?.name}
              </h2>
            </div>
            <p className="text-[11px] text-[#52606D] mt-0.5">
              Dynamically calculated requirements across sector supplies based on forecast demand and mandatory safety reserves
            </p>
          </div>
          <span className="px-2.5 py-1 bg-[#E8EEE5] text-[#355E3B] rounded-xs font-bold text-[10px] uppercase border border-[#CAD3C8]">
            MODEL GENERATED REQUIREMENTS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-[#F0F4EE] border-b border-[#D8DFD5] text-[#52606D] uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 font-bold">Supply Item</th>
                <th className="py-2.5 px-3 font-bold">Forecast Demand</th>
                <th className="py-2.5 px-3 font-bold">Available Buffer</th>
                <th className="py-2.5 px-3 font-bold">Safety Stock</th>
                <th className="py-2.5 px-3 font-bold">Shortfall</th>
                <th className="py-2.5 px-3 font-bold">Priority</th>
                <th className="py-2.5 px-3 font-bold">AI Decision</th>
                <th className="py-2.5 px-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4EE]">
              {forecast?.aiRequirements && forecast.aiRequirements.length > 0 ? (
                forecast.aiRequirements.map((req) => {
                  const needsReplenishment = req.projected_shortfall > 0 || req.decision === 'REPLENISH' || req.decision === 'URGENT REPLENISH' || req.decision === 'CRITICAL SHORTAGE';
                  const isTransmitting = transmittingId === req.id;

                  return (
                    <tr key={req.id} className="hover:bg-[#F9FAF8] transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#1F2933]">
                        <div>{req.supply_name}</div>
                        <div className="text-[10px] text-[#52606D] font-medium">{req.supply_category}</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[#1F2933]">
                        {req.projected_demand.toLocaleString()} {req.unit}
                      </td>
                      <td className="py-2.5 px-3 text-[#52606D]">
                        {req.projected_available.toLocaleString()} {req.unit}
                      </td>
                      <td className="py-2.5 px-3 text-[#52606D]">
                        {req.safety_stock.toLocaleString()} {req.unit}
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        <span className={req.projected_shortfall > 0 ? 'text-[#B42318]' : 'text-[#2F6B3C]'}>
                          {req.projected_shortfall > 0 ? `${req.projected_shortfall.toLocaleString()} ${req.unit}` : '0 (None)'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase border ${
                          req.priority === 'CRITICAL' ? 'bg-[#FEE4E2] text-[#B42318] border-[#FDA29B]' :
                          req.priority === 'HIGH' ? 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]' :
                          req.priority === 'MEDIUM' ? 'bg-[#FEF08A] text-[#A16207] border-[#FDE047]' :
                          'bg-[#E8F5E9] text-[#2F6B3C] border-[#A5D6A7]'
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] uppercase border ${
                          req.decision === 'CRITICAL SHORTAGE' ? 'bg-[#FEE4E2] text-[#B42318] border-[#FDA29B]' :
                          req.decision === 'URGENT REPLENISH' ? 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]' :
                          req.decision === 'REPLENISH' ? 'bg-[#FEF08A] text-[#A16207] border-[#FDE047]' :
                          'bg-[#E8F5E9] text-[#2F6B3C] border-[#A5D6A7]'
                        }`}>
                          {req.decision}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {needsReplenishment ? (
                          <button
                            onClick={() => handleTransmitRequirement(req)}
                            disabled={isTransmitting}
                            className="px-3 py-1 bg-[#355E3B] hover:bg-[#1F3D27] text-white border border-[#1F3D27] rounded-xs font-mono text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <Send className="w-3 h-3 text-[#B5A47A]" />
                            <span>{isTransmitting ? 'Sending...' : 'Transmit to Main Head'}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#2F6B3C] font-semibold bg-[#E8F5E9] px-2 py-0.5 rounded-xs border border-[#A5D6A7]">
                            Sufficient Buffer
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-[#52606D]">
                    Calculating multi-supply predictive requirements...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;
