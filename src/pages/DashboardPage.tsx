import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CloudAlert, 
  Truck, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight, 
  MapPin, 
  Layers, 
  Boxes, 
  Droplet, 
  Flame, 
  HeartPulse, 
  Utensils, 
  Package
} from 'lucide-react';
import { KpiCard } from '../components/common/KpiCard';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TacticalMap } from '../components/map/TacticalMap';
import { inventoryService } from '../services/inventoryService';
import { alertService } from '../services/alertService';
import { transportService } from '../services/transportService';
import { LocationNode, InventoryRecord, AlertItem, TransportAsset } from '../types';
import { NavTab } from '../components/layout/Header';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  onSelectLocationForDetail?: (loc: LocationNode) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectLocationForDetail,
}) => {
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [transports, setTransports] = useState<TransportAsset[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationNode | null>(null);

  useEffect(() => {
    async function loadData() {
      const [locs, invs, alts, trans] = await Promise.all([
        inventoryService.getLocations(),
        inventoryService.getInventory(),
        alertService.getAlerts(),
        transportService.getTransports(),
      ]);
      setLocations(locs);
      setInventory(invs);
      setAlerts(alts);
      setTransports(trans);
      if (locs.length > 0) {
        setSelectedLocation(locs[2]); // Default focus on Distribution Node Alpha (has attention status)
      }
    }
    loadData();
  }, []);

  // Compute live KPIs
  const activeAlertsCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const availableTransports = transports.filter(t => t.availability === 'AVAILABLE').length;
  const transportAvailPct = transports.length > 0 ? Math.round((availableTransports / transports.length) * 100) : 76;

  // Supply category icons
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
      {/* Page Title & Sector Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Tactical Command Dashboard
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Real-Time Logistics Operations • Northern & Forward Mountain Commands
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-mono text-xs text-[#8B9B8E] bg-[#101B13] border border-[#263F2B] px-3 py-1.5 rounded-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3FA34D] animate-ping" />
            <span>REALTIME TELEMETRY: 6 LOGISTICS NODES</span>
          </div>
        </div>
      </div>

      {/* Main KPI Cards: 5 core indicators specified in requirements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Supply Readiness"
          value="87"
          unit="%"
          delta="+2.4% vs last week"
          deltaPositive={true}
          statusText="Overall Fleet & Depot"
          icon={ShieldCheck}
          variant="success"
        />

        <KpiCard
          label="Weather Risk"
          value="42"
          unit="%"
          delta="Orange Alert Sector Pass"
          deltaPositive={false}
          statusText="IMD Precipitation Advisory"
          icon={CloudAlert}
          variant="warning"
        />

        <KpiCard
          label="Transport Availability"
          value={transportAvailPct}
          unit="%"
          delta={`${availableTransports}/${transports.length} Assets Active`}
          deltaPositive={true}
          statusText="Fleet Capacity: 44.5 Tonnes"
          icon={Truck}
          variant="default"
        />

        <KpiCard
          label="Active Alerts"
          value={`0${activeAlertsCount}`}
          delta="2 High / 1 Critical"
          deltaPositive={false}
          statusText="Pending Command Action"
          icon={AlertTriangle}
          variant={activeAlertsCount > 0 ? 'critical' : 'success'}
        />

        <KpiCard
          label="Forecast Confidence"
          value="89"
          unit="%"
          delta="XGBoost Baseline"
          deltaPositive={true}
          statusText="Horizon: 7 Days"
          icon={TrendingUp}
          variant="default"
        />
      </div>

      {/* Central Tactical Row: Interactive Map & Live Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Live Tactical Map */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-tactical font-semibold tracking-wider text-sm text-[#E7E9E2] uppercase flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#B5A47A]" />
              <span>Forward Sector Logistics GIS</span>
            </h3>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs font-mono text-[#B5A47A] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Full Screen Map</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <TacticalMap
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
            onViewDetails={(loc) => {
              if (onSelectLocationForDetail) onSelectLocationForDetail(loc);
              onNavigate('inventory');
            }}
            className="h-[480px]"
          />
        </div>

        {/* Right 4 Cols: Tactical Active Alerts Feed */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-tactical font-semibold tracking-wider text-sm text-[#E7E9E2] uppercase flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#C43C3C]" />
              <span>High Priority Directives</span>
            </h3>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-mono text-[#B5A47A] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Alert Center ({alerts.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 bg-[#101B13] border border-[#263F2B] p-3 rounded-sm space-y-3 overflow-y-auto max-h-[480px]">
            {alerts.filter(a => a.status === 'ACTIVE').slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-2 hover:border-[#596B3A] transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-[#B5A47A] uppercase tracking-wider">
                    {alert.alert_type}
                  </span>
                  <StatusBadge status={alert.severity} size="sm" pulse={alert.severity === 'CRITICAL'} />
                </div>

                <h4 className="font-tactical font-semibold text-xs text-[#E7E9E2] leading-tight">
                  {alert.title}
                </h4>

                <p className="font-mono text-[11px] text-[#8B9B8E] leading-relaxed line-clamp-2">
                  {alert.message}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#1A2C1E] text-[10px] font-mono">
                  <span className="text-[#8B9B8E]">{alert.location_name}</span>
                  <button
                    onClick={() => onNavigate('alerts')}
                    className="text-[#4ade80] hover:underline"
                  >
                    View Directive &rarr;
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => onNavigate('simulator')}
              className="w-full py-2.5 px-3 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <span>Test Stress Scenarios in Simulator</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B5A47A]" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Forward Depot Stock Health (Distribution Node Alpha & Forward Node A focus) */}
      <TacticalCard
        title="Forward Node Inventory Readiness & Days of Cover"
        subtitle="Live burn rates calculated against mission safety thresholds"
        headerAction={
          <button
            onClick={() => onNavigate('inventory')}
            className="text-xs font-mono text-[#B5A47A] hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Manage All Stocks</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {inventory.slice(0, 5).map((item) => {
            const isStress = item.risk_status === 'HIGH' || item.risk_status === 'CRITICAL';
            return (
              <div
                key={item.id}
                className="bg-[#07100B] border border-[#1A2C1E] p-4 rounded-xs space-y-3 hover:border-[#596B3A] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {categoryIcon(item.supply?.category || '')}
                    <span className="font-tactical font-semibold text-xs text-[#E7E9E2] uppercase">
                      {item.supply?.category}
                    </span>
                  </div>
                  <StatusBadge status={item.risk_status} size="sm" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#8B9B8E]">Current Stock:</span>
                    <span className="text-[#E7E9E2] font-bold">
                      {item.current_stock.toLocaleString()} {item.supply?.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#8B9B8E]">Daily Burn:</span>
                    <span className="text-[#8B9B8E]">
                      {item.daily_consumption} /day
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#8B9B8E]">7d Forecast:</span>
                    <span className="text-[#fbbf24] font-semibold">
                      {item.forecast_demand_7d.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Days of Cover Progress Bar */}
                <div className="space-y-1 pt-1 border-t border-[#1A2C1E]">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-[#8B9B8E]">Days of Cover</span>
                    <span className={item.days_of_cover < 7 ? 'text-[#f87171] font-bold' : 'text-[#4ade80] font-bold'}>
                      {item.days_of_cover}d
                    </span>
                  </div>
                  <div className="w-full bg-[#1A2C1E] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.days_of_cover < 6 ? 'bg-[#C43C3C]' : item.days_of_cover < 10 ? 'bg-[#D39B32]' : 'bg-[#3FA34D]'
                      }`}
                      style={{ width: `${Math.min(100, (item.days_of_cover / 20) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </TacticalCard>
    </div>
  );
};
