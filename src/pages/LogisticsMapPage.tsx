import React, { useState, useEffect } from 'react';
import { TacticalMap } from '../components/map/TacticalMap';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { inventoryService } from '../services/inventoryService';
import { LocationNode } from '../types';
import { MapPin, Navigation, Compass, Layers, Shield, CloudRain, AlertTriangle, ArrowRight } from 'lucide-react';
import { NavTab } from '../components/layout/Header';

interface LogisticsMapPageProps {
  onNavigate: (tab: NavTab) => void;
  onSelectLocationForDetail?: (loc: LocationNode) => void;
}

export const LogisticsMapPage: React.FC<LogisticsMapPageProps> = ({
  onNavigate,
  onSelectLocationForDetail,
}) => {
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<LocationNode | null>(null);

  useEffect(() => {
    async function load() {
      const locs = await inventoryService.getLocations();
      setLocations(locs);
      if (locs.length > 0) setSelectedLocation(locs[0]);
    }
    load();
  }, []);

  const filteredLocations = locations.filter((loc) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'HUBS') return loc.type === 'Supply Hub';
    if (filterType === 'FORWARD') return loc.type === 'Forward Node' || loc.type === 'Distribution Node';
    if (filterType === 'STRESS') return loc.status === 'attention' || loc.status === 'critical';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header & Filter Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Tactical GIS Logistics Map
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Geographic Information System • Synthetic Forward Command Topography
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-[#101B13] p-1 rounded-xs border border-[#263F2B] font-mono text-xs">
          {[
            { id: 'ALL', label: 'All Nodes' },
            { id: 'HUBS', label: 'Supply Hubs' },
            { id: 'FORWARD', label: 'Forward / Dist' },
            { id: 'STRESS', label: 'At-Risk Only' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              className={`px-3 py-1.5 rounded-xs transition-colors ${
                filterType === btn.id
                  ? 'bg-[#263F2B] text-[#E7E9E2] font-semibold border border-[#596B3A]'
                  : 'text-[#8B9B8E] hover:text-[#E7E9E2]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas */}
      <TacticalMap
        locations={filteredLocations}
        selectedLocation={selectedLocation}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        onViewDetails={(loc) => {
          if (onSelectLocationForDetail) onSelectLocationForDetail(loc);
          onNavigate('inventory');
        }}
        className="h-[640px]"
      />

      {/* Corridor & Sector Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TacticalCard
          title="Sector Road Corridors"
          subtitle="Real-time transit viability based on IMD rainfall nowcasts"
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs flex items-center justify-between">
              <div>
                <div className="text-[#E7E9E2] font-semibold">Central-to-North Expressway</div>
                <div className="text-[11px] text-[#8B9B8E]">Supply Hub Central ➔ Supply Hub North</div>
              </div>
              <StatusBadge status="OPERATIONAL" size="sm" />
            </div>

            <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs flex items-center justify-between">
              <div>
                <div className="text-[#fbbf24] font-semibold">Corridor North-Alpha</div>
                <div className="text-[11px] text-[#8B9B8E]">Supply Hub North ➔ Distribution Alpha</div>
              </div>
              <StatusBadge status="ATTENTION" size="sm" />
            </div>

            <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs flex items-center justify-between">
              <div>
                <div className="text-[#f87171] font-semibold">High-Ascent Ridge Pass</div>
                <div className="text-[11px] text-[#8B9B8E]">Distribution Alpha ➔ Forward Node A</div>
              </div>
              <StatusBadge status="CRITICAL" size="sm" pulse={true} />
            </div>
          </div>
        </TacticalCard>

        <TacticalCard
          title="Tactical Depot Readiness Matrix"
          subtitle="Consolidated readiness score per operational sector"
        >
          <div className="space-y-3 font-mono text-xs">
            {locations.map((loc) => (
              <div
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className={`p-2.5 rounded-xs border cursor-pointer transition-colors flex items-center justify-between ${
                  selectedLocation?.id === loc.id
                    ? 'bg-[#263F2B] border-[#596B3A] text-white'
                    : 'bg-[#07100B] border-[#1A2C1E] text-[#8B9B8E] hover:border-[#263F2B]'
                }`}
              >
                <div>
                  <div className="font-semibold text-[#E7E9E2]">{loc.name}</div>
                  <div className="text-[10px] text-[#8B9B8E]">{loc.region} • {loc.altitude_m}m AMSL</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#E7E9E2]">{loc.inventory_readiness_pct}%</div>
                  <StatusBadge status={loc.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </TacticalCard>

        <TacticalCard
          title="Air & Helipad Status"
          subtitle="Secondary high-altitude tactical resupply channels"
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#E7E9E2] font-semibold">Hub North Dual Runway</span>
                <span className="text-[#4ade80]">CAT-III CLEAR</span>
              </div>
              <p className="text-[11px] text-[#8B9B8E]">
                All-weather tactical transport aircraft landing capable. Fuel hydrant pumps operating at 100%.
              </p>
            </div>

            <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#E7E9E2] font-semibold">Forward Node A Helipad</span>
                <span className="text-[#f87171]">VISIBILITY MARGINAL (1.8km)</span>
              </div>
              <p className="text-[11px] text-[#8B9B8E]">
                Severe snow squalls and gusts (48 km/h). Rotary-wing medical airdrops on standby.
              </p>
            </div>

            <button
              onClick={() => onNavigate('weather')}
              className="w-full py-2 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <span>Examine IMD Weather Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B5A47A]" />
            </button>
          </div>
        </TacticalCard>
      </div>
    </div>
  );
};
