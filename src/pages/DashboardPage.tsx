import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CloudAlert, 
  Truck, 
  AlertTriangle, 
  ArrowRight, 
  ChevronRight,
  Boxes,
  MapPin
} from 'lucide-react';
import { KpiCard } from '../components/common/KpiCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataStatus } from '../components/common/DataStatus';
import { TacticalMap } from '../components/map/TacticalMap';
import { inventoryService } from '../services/inventoryService';
import { alertService } from '../services/alertService';
import { transportService } from '../services/transportService';
import { weatherService } from '../services/weatherService';
import { LocationNode, InventoryRecord, AlertItem, TransportAsset, DataStatusInfo } from '../types';
import { NavTab } from '../components/layout/Header';

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

  const isAll = selectedLocationId === 'ALL';
  const activeLoc = locations.find(l => l.id === selectedLocationId);

  const supplyReadiness = isAll ? 87 : (activeLoc ? activeLoc.inventory_readiness_pct : 87);
  const weatherRisk = isAll ? '42%' : (activeLoc ? (activeLoc.weather_risk === 'HIGH' ? '78%' : activeLoc.weather_risk === 'MODERATE' ? '45%' : '18%') : '42%');
  const availableTransports = transports.filter(t => t.availability === 'AVAILABLE').length;
  const transportAvailPct = isAll 
    ? (transports.length > 0 ? Math.round((availableTransports / transports.length) * 100) : 76)
    : (activeLoc ? activeLoc.transport_availability_pct : 76);
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');

  // Priority predictive risk alert
  const priorityAlert = alerts.find(a => a.alert_type === 'Predictive Shortage' && a.status === 'ACTIVE') || alerts[0];

  return (
    <div className="space-y-6">
      {/* Clean Top Bar: Title & Global Location Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Logistics Dashboard
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Supply readiness, predictive alerts, and geographic status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#8B9B8E]">ZONE:</span>
          <select
            value={selectedLocationId}
            onChange={(e) => onLocationChange(e.target.value)}
            className="bg-[#101B13] border border-[#263F2B] focus:border-[#596B3A] text-xs font-mono text-[#E7E9E2] px-3.5 py-2 rounded-xs focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Logistics Zones</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Supply Readiness"
          value={supplyReadiness}
          unit="%"
          statusText={isAll ? 'Average Across All Zones' : `${activeLoc?.name}`}
          icon={ShieldCheck}
          variant={supplyReadiness >= 85 ? 'success' : 'warning'}
        />

        <KpiCard
          label="Weather Risk"
          value={weatherRisk}
          statusText={isAll ? 'Northern Advisory Active' : `${activeLoc?.name} Outlook`}
          icon={CloudAlert}
          variant={activeLoc?.weather_risk === 'HIGH' ? 'critical' : 'warning'}
        />

        <KpiCard
          label="Transport Readiness"
          value={transportAvailPct}
          unit="%"
          statusText={`${availableTransports}/${transports.length} Fleet Units Available`}
          icon={Truck}
          variant="default"
        />

        <KpiCard
          label="Active Alerts"
          value={activeAlerts.length}
          statusText="Requires Attention"
          icon={AlertTriangle}
          variant={activeAlerts.length > 0 ? 'critical' : 'success'}
        />
      </div>

      {/* Main Grid: Interactive Map (Left) + Focused Action Panels (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: GIS Map Preview */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tactical uppercase tracking-wider text-[#E7E9E2] font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#B5A47A]" />
              Geographic Demonstration Zones
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
            onSelectLocation={(loc) => onLocationChange(loc.id)}
            onViewDetails={(loc) => {
              if (onSelectLocationForDetail) onSelectLocationForDetail(loc);
              onNavigate('supplies');
            }}
            className="h-[400px]"
          />
        </div>

        {/* Right 5 Columns: Priority Alert & Key Locations */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Priority Predictive Alert */}
          {priorityAlert && (
            <div className="p-4 bg-[#101B13] border-l-4 border-l-[#C43C3C] border border-[#263F2B] rounded-xs shadow-md space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#f87171] bg-[rgba(196,60,60,0.18)] px-2 py-0.5 rounded-xs">
                  PRIORITY ALERT
                </span>
                <span className="text-[11px] text-[#8B9B8E]">{priorityAlert.location_name}</span>
              </div>
              <h3 className="font-tactical font-semibold text-sm text-[#E7E9E2]">
                {priorityAlert.title}
              </h3>
              <p className="text-xs text-[#8B9B8E] line-clamp-2">
                {priorityAlert.message}
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-[#1A2C1E]">
                <button
                  onClick={() => onNavigate('forecast')}
                  className="text-xs text-[#B5A47A] hover:underline font-tactical tracking-wider uppercase flex items-center gap-1 cursor-pointer"
                >
                  <span>Forecast Outlook</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onNavigate('alerts')}
                  className="px-2.5 py-1 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] text-xs rounded-xs border border-[#596B3A] cursor-pointer"
                >
                  Resolve Alert
                </button>
              </div>
            </div>
          )}

          {/* Zones Summary List */}
          <div className="bg-[#101B13] border border-[#263F2B] p-4 rounded-xs space-y-3 flex-1">
            <div className="flex items-center justify-between border-b border-[#1A2C1E] pb-2">
              <span className="text-xs font-tactical uppercase tracking-wider text-[#E7E9E2] font-semibold">
                Logistics Zones Status
              </span>
              <button
                onClick={() => onNavigate('supplies')}
                className="text-xs font-mono text-[#B5A47A] hover:underline flex items-center gap-1"
              >
                <span>View Supplies</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {locations.map((loc) => {
                const isSelected = selectedLocationId === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => onLocationChange(loc.id)}
                    className={`p-2.5 rounded-xs border cursor-pointer flex items-center justify-between font-mono text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#263F2B] border-[#596B3A]'
                        : 'bg-[#07100B] border-[#1A2C1E] hover:border-[#596B3A]'
                    }`}
                  >
                    <div>
                      <div className="font-tactical font-semibold text-xs text-[#E7E9E2]">
                        {loc.name}
                      </div>
                      <div className="text-[10px] text-[#8B9B8E]">
                        Readiness: {loc.inventory_readiness_pct}% • Cover: {loc.days_of_cover}d
                      </div>
                    </div>
                    <StatusBadge status={loc.status} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
