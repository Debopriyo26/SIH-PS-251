import React, { useState, useEffect } from 'react';
import { TacticalMap } from '../components/map/TacticalMap';
import { StatusBadge } from '../components/common/StatusBadge';
import { inventoryService } from '../services/inventoryService';
import { LocationNode } from '../types';
import { MapPin, ArrowRight, Info, Layers, Eye } from 'lucide-react';
import { NavTab } from '../components/layout/Header';
import { PUBLIC_DATA_DISCLAIMER } from '../services/demoData';
import { useAuth } from '../lib/authContext';
import { LogisticsZone } from '../types';
import { resolveLocationId } from '../lib/zones';

interface LocationsPageProps {
  onNavigate: (tab: NavTab) => void;
  onSelectLocationForDetail?: (loc: LocationNode) => void;
  selectedLocationId: string;
  onLocationChange: (locId: string) => void;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({
  onNavigate,
  onSelectLocationForDetail,
  selectedLocationId,
  onLocationChange,
}) => {
  const { user } = useAuth();
  const isMainHead = user?.role === 'MAIN_HEAD';
  const effectiveZone = (user?.zone as LogisticsZone) || 'Srinagar';

  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'RISK' | 'WEATHER'>('ALL');

  useEffect(() => {
    async function load() {
      const locs = await inventoryService.getLocations(user?.role, user?.zone as LogisticsZone);
      setLocations(locs);
      if (!isMainHead && user?.zone) {
        onLocationChange(resolveLocationId(user.zone));
      } else if (!selectedLocationId || selectedLocationId === 'ALL') {
        if (locs.length > 0) onLocationChange(locs[0].id);
      }
    }
    load();
  }, [user?.role, user?.zone]);

  const activeLocation = locations.find(l => l.id === selectedLocationId) || locations[0];

  const filteredLocations = locations.filter((loc) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'RISK') return loc.status === 'attention' || loc.status === 'critical';
    if (filterType === 'WEATHER') return loc.weather_risk === 'HIGH' || loc.weather_risk === 'MODERATE';
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header & Clean Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D8DFD5] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#1F2933] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#355E3B] inline-block rounded-xs"></span>
            Geospatial Logistics Map
          </h1>
          <p className="font-mono text-xs text-[#52606D] mt-0.5">
            Demonstration regional zones powered by Government of India Bhuvan (ISRO / NRSC)
          </p>
        </div>

        {/* Clean Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xs border border-[#D8DFD5] font-mono text-xs shadow-xs">
          {[
            { id: 'ALL' as const, label: 'All Demonstration Zones' },
            { id: 'RISK' as const, label: 'Requires Attention' },
            { id: 'WEATHER' as const, label: 'Weather Warnings' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer font-bold ${
                filterType === btn.id
                  ? 'bg-[#355E3B] text-white border border-[#1F3D27] shadow-xs'
                  : 'text-[#52606D] hover:text-[#1F2933]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Side Zone Inspector (Requirement 2 & 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Large Clean Map (8 Cols) */}
        <div className="lg:col-span-8">
          <TacticalMap
            locations={filteredLocations}
            selectedLocation={activeLocation || null}
            onSelectLocation={(loc) => onLocationChange(loc.id)}
            onViewDetails={(loc) => {
              if (onSelectLocationForDetail) onSelectLocationForDetail(loc);
              onNavigate('supplies');
            }}
            className="h-[520px] rounded-xs border border-[#D8DFD5] shadow-xs"
          />
        </div>

        {/* Selected Zone Summary (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {activeLocation ? (
            <div className="bg-white border border-[#D8DFD5] p-5 rounded-xs shadow-xs space-y-4 font-mono text-xs">
              <div className="flex items-start justify-between border-b border-[#F0F4EE] pb-3">
                <div>
                  <span className="text-[10px] text-[#355E3B] uppercase font-bold tracking-wider block">
                    SELECTED DEMONSTRATION ZONE
                  </span>
                  <h3 className="font-tactical font-bold text-base text-[#1F2933]">
                    {activeLocation.name}
                  </h3>
                  <span className="text-[11px] text-[#52606D] font-medium">{activeLocation.region}</span>
                </div>
                <StatusBadge status={activeLocation.status} />
              </div>

              {/* Core Stats */}
              <div className="space-y-2">
                <div className="p-2.5 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs flex justify-between items-center">
                  <span className="text-[#52606D] font-semibold">Supply Readiness:</span>
                  <strong className="text-sm text-[#1F2933]">{activeLocation.inventory_readiness_pct}%</strong>
                </div>

                <div className="p-2.5 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs flex justify-between items-center">
                  <span className="text-[#52606D] font-semibold">Weather Status:</span>
                  <StatusBadge status={activeLocation.weather_risk} size="sm" />
                </div>

                <div className="p-2.5 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs flex justify-between items-center">
                  <span className="text-[#52606D] font-semibold">Days of Cover:</span>
                  <strong className={activeLocation.days_of_cover < 8 ? 'text-[#B42318] font-bold' : 'text-[#2F6B3C] font-bold'}>
                    {activeLocation.days_of_cover} Days
                  </strong>
                </div>

                <div className="p-2.5 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs flex justify-between items-center">
                  <span className="text-[#52606D] font-semibold">Projected Shortage:</span>
                  <strong className={activeLocation.projected_shortage === 'NONE' ? 'text-[#2F6B3C]' : 'text-[#B42318]'}>
                    {activeLocation.projected_shortage}
                  </strong>
                </div>
              </div>

              {/* Action Button: View Details */}
              <button
                onClick={() => {
                  if (onSelectLocationForDetail) onSelectLocationForDetail(activeLocation);
                  onNavigate('supplies');
                }}
                className="w-full py-2.5 bg-[#355E3B] hover:bg-[#1F3D27] text-white border border-[#1F3D27] rounded-xs font-tactical text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <span>[VIEW ZONE SUPPLIES]</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B5A47A]" />
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#D8DFD5] p-6 text-center text-[#52606D] font-mono text-xs rounded-xs">
              Click any marker on the map to inspect zone details.
            </div>
          )}

          {/* Quick Zone Picker Chips (Srinagar, Jaisalmer, Ahmedabad, Kutch) */}
          <div className="bg-white border border-[#D8DFD5] p-3.5 rounded-xs space-y-2 font-mono text-xs shadow-xs">
            <span className="text-[10px] text-[#52606D] uppercase tracking-wider block font-bold">
              {isMainHead ? 'REGIONAL DEMONSTRATION ZONES:' : `ASSIGNED LOGISTICS ZONE (${user?.zone}):`}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => onLocationChange(loc.id)}
                  className={`p-2 text-left rounded-xs border text-[11px] truncate cursor-pointer transition-colors ${
                    selectedLocationId === loc.id
                      ? 'bg-[#E8EEE5] border-[#355E3B] text-[#1F2933] font-bold'
                      : 'bg-[#F7F8F4] border-[#D8DFD5] text-[#52606D] hover:text-[#1F2933] hover:border-[#6B7444]'
                  }`}
                >
                  {loc.name.replace(' Logistics Zone', '').replace(' Logistics Base', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
