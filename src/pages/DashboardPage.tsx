import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CloudAlert, 
  Truck, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  MapPin, 
  Boxes, 
  CheckCircle2, 
  Droplet, 
  Flame, 
  HeartPulse, 
  Utensils, 
  Package,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { KpiCard } from '../components/common/KpiCard';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataStatus } from '../components/common/DataStatus';
import { TacticalMap } from '../components/map/TacticalMap';
import { inventoryService } from '../services/inventoryService';
import { alertService } from '../services/alertService';
import { transportService } from '../services/transportService';
import { weatherService } from '../services/weatherService';
import { LocationNode, InventoryRecord, AlertItem, TransportAsset, DataStatusInfo } from '../types';
import { NavTab } from '../components/layout/Header';
import { PUBLIC_DATA_DISCLAIMER } from '../services/demoData';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  onSelectLocationForDetail?: (loc: LocationNode) => void;
  selectedLocationId: string;
  onLocationChange: (locId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectLocationForDetail,
  selectedLocationId,
  onLocationChange,
}) => {
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [transports, setTransports] = useState<TransportAsset[]>([]);
  const [weatherStatus, setWeatherStatus] = useState<DataStatusInfo>(weatherService.getStatusInfo());

  useEffect(() => {
    async function loadData() {
      const [locs, invs, alts, trans] = await Promise.all([
        inventoryService.getLocations(),
        inventoryService.getInventory(selectedLocationId),
        alertService.getAlerts(selectedLocationId),
        transportService.getTransports(),
      ]);
      setLocations(locs);
      setInventory(invs);
      setAlerts(alts);
      setTransports(trans);
      setWeatherStatus(weatherService.getStatusInfo());
    }
    loadData();
  }, [selectedLocationId]);

  // Compute metrics based on selected location
  const isAll = selectedLocationId === 'ALL';
  const activeLoc = locations.find(l => l.id === selectedLocationId);

  const supplyReadiness = isAll ? 87 : (activeLoc ? activeLoc.inventory_readiness_pct : 87);
  const weatherRisk = isAll ? '42%' : (activeLoc ? (activeLoc.weather_risk === 'HIGH' ? '78%' : activeLoc.weather_risk === 'MODERATE' ? '45%' : '18%') : '42%');
  const availableTransports = transports.filter(t => t.availability === 'AVAILABLE').length;
  const transportAvailPct = isAll 
    ? (transports.length > 0 ? Math.round((availableTransports / transports.length) * 100) : 76)
    : (activeLoc ? activeLoc.transport_availability_pct : 76);
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');

  // Top predictive alert for "WHAT MAY HAPPEN?"
  const topPredictiveAlert = alerts.find(a => a.alert_type === 'Predictive Shortage' && a.status === 'ACTIVE') || alerts[0];

  // Locations requiring attention for "WHAT NEEDS ATTENTION?"
  const attentionLocations = locations.filter(l => l.status === 'attention' || l.status === 'critical');

  return (
    <div className="space-y-6">
      {/* Top Header with Global Location Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Logistics Dashboard
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Real-time supply readiness, predictive shortage forecasting, and logistics routing
          </p>
        </div>

        {/* Global Location Selector matching requirement 7 */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#8B9B8E]">LOCATION:</span>
          <select
            value={selectedLocationId}
            onChange={(e) => onLocationChange(e.target.value)}
            className="bg-[#101B13] border border-[#263F2B] focus:border-[#596B3A] text-xs font-mono text-[#E7E9E2] px-3.5 py-2 rounded-xs focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* QUESTION 1: WHAT IS HAPPENING? -> Top 4 KPI Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#B5A47A] font-bold">
            WHAT IS HAPPENING? — CURRENT METRICS
          </span>
          <DataStatus mode={weatherStatus.mode} source={weatherStatus.source} size="sm" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Supply Readiness"
            value={supplyReadiness}
            unit="%"
            statusText={isAll ? 'Overall Fleet & Depots' : `${activeLoc?.name} Buffer`}
            icon={ShieldCheck}
            variant={supplyReadiness >= 85 ? 'success' : 'warning'}
          />

          <KpiCard
            label="Weather Risk"
            value={weatherRisk}
            statusText={isAll ? 'Northern Mountain Advisory' : `${activeLoc?.name} Conditions`}
            icon={CloudAlert}
            variant={activeLoc?.weather_risk === 'HIGH' ? 'critical' : 'warning'}
          />

          <KpiCard
            label="Transport Availability"
            value={transportAvailPct}
            unit="%"
            statusText={`${availableTransports}/${transports.length} Fleet Assets Active`}
            icon={Truck}
            variant="default"
          />

          <KpiCard
            label="Active Alerts"
            value={`0${activeAlerts.length}`}
            statusText="Directives Pending Action"
            icon={AlertTriangle}
            variant={activeAlerts.length > 0 ? 'critical' : 'success'}
          />
        </div>
      </div>

      {/* QUESTION 2: WHAT MAY HAPPEN? -> Predictive Alert Card */}
      {topPredictiveAlert && (
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#B5A47A] font-bold">
            WHAT MAY HAPPEN? — PREDICTIVE RISK FORECAST
          </span>

          <div className="p-4 bg-[#101B13] border-l-4 border-l-[#C43C3C] border border-[#263F2B] rounded-xs shadow-lg flex flex-wrap items-center justify-between gap-4 font-mono">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#f87171] bg-[rgba(196,60,60,0.2)] px-2 py-0.5 rounded-xs">
                  PREDICTIVE SHORTAGE DETECTED
                </span>
                <span className="text-xs text-[#8B9B8E]">• {topPredictiveAlert.location_name}</span>
              </div>
              <h3 className="font-tactical font-bold text-sm text-[#E7E9E2]">
                {topPredictiveAlert.title}
              </h3>
              <p className="text-xs text-[#8B9B8E] leading-relaxed">
                {topPredictiveAlert.message}
              </p>
              {topPredictiveAlert.recommendations && (
                <div className="text-[11px] text-[#4ade80] font-semibold pt-1">
                  Action Directive: {topPredictiveAlert.recommendations}
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('forecast')}
              className="px-4 py-2 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Examine Forecast Model</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B5A47A]" />
            </button>
          </div>
        </div>
      )}

      {/* QUESTION 3: WHAT NEEDS ATTENTION? -> Locations Requiring Attention (3-4 locations) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#B5A47A] font-bold">
            WHAT NEEDS ATTENTION? — LOCATIONS REQUIRING ATTENTION
          </span>
          <button
            onClick={() => onNavigate('locations')}
            className="text-xs font-mono text-[#B5A47A] hover:underline flex items-center gap-1"
          >
            <span>View All Zones</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {locations.map((loc) => {
            const isSelected = selectedLocationId === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => onLocationChange(loc.id)}
                className={`p-4 rounded-xs border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#263F2B] border-[#596B3A] shadow-md'
                    : 'bg-[#101B13] border-[#263F2B] hover:border-[#596B3A]'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-tactical font-semibold text-xs text-[#E7E9E2]">
                      {loc.name}
                    </h4>
                    <span className="text-[10px] font-mono text-[#8B9B8E]">{loc.region}</span>
                  </div>
                  <StatusBadge status={loc.status} size="sm" />
                </div>

                <div className="space-y-1 font-mono text-xs border-t border-[#1A2C1E] pt-2">
                  <div className="flex justify-between">
                    <span className="text-[#8B9B8E]">Supply Readiness:</span>
                    <strong className="text-[#E7E9E2]">{loc.inventory_readiness_pct}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B9B8E]">Days of Cover:</span>
                    <strong className={loc.days_of_cover < 8 ? 'text-[#f87171]' : 'text-[#4ade80]'}>
                      {loc.days_of_cover}d
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B9B8E]">Projected Shortage:</span>
                    <strong className={loc.projected_shortage === 'NONE' ? 'text-[#4ade80]' : 'text-[#fbbf24]'}>
                      {loc.projected_shortage}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Map & Recent Alerts Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Logistics Map */}
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B5A47A] font-bold">
              LOGISTICS MAP (DEMONSTRATION ZONES)
            </span>
            <button
              onClick={() => onNavigate('locations')}
              className="text-xs font-mono text-[#B5A47A] hover:underline flex items-center gap-1"
            >
              <span>Full Screen Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <TacticalMap
            locations={isAll ? locations : locations.filter(l => l.id === selectedLocationId)}
            selectedLocation={activeLoc || null}
            onSelectLocation={(loc) => {
              onLocationChange(loc.id);
            }}
            onViewDetails={(loc) => {
              if (onSelectLocationForDetail) onSelectLocationForDetail(loc);
              onNavigate('supplies');
            }}
            className="h-[440px]"
          />
        </div>

        {/* Right 4 Cols: Recent Alerts */}
        <div className="lg:col-span-4 space-y-2 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#B5A47A] font-bold">
              RECENT ALERTS ({alerts.length})
            </span>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-mono text-[#B5A47A] hover:underline flex items-center gap-1"
            >
              <span>Alert Center</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-[#101B13] border border-[#263F2B] p-3 rounded-xs space-y-3 flex-1 overflow-y-auto max-h-[440px]">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-1.5 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#B5A47A] uppercase font-semibold">
                    {alert.alert_type}
                  </span>
                  <StatusBadge status={alert.severity} size="sm" pulse={alert.severity === 'CRITICAL'} />
                </div>

                <h4 className="font-tactical font-semibold text-xs text-[#E7E9E2]">
                  {alert.title}
                </h4>

                <p className="text-[11px] text-[#8B9B8E] line-clamp-2">
                  {alert.message}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-[#1A2C1E] text-[10px] text-[#8B9B8E]">
                  <span>{alert.location_name}</span>
                  <button
                    onClick={() => onNavigate('alerts')}
                    className="text-[#4ade80] hover:underline"
                  >
                    View &rarr;
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => onNavigate('simulator')}
              className="w-full py-2 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Run Scenario Simulation</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B5A47A]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
