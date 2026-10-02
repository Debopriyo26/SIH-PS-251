import React, { useState, useEffect } from 'react';
import { TacticalMap } from '../components/map/TacticalMap';
import { StatusBadge } from '../components/common/StatusBadge';
import { inventoryService } from '../services/inventoryService';
import { LocationNode } from '../types';
import { MapPin, ArrowRight } from 'lucide-react';
import { NavTab } from '../components/layout/Header';

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
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | 'RISK' | 'WEATHER'>('ALL');

  useEffect(() => {
    async function load() {
      const locs = await inventoryService.getLocations();
      setLocations(locs);
      if (!selectedLocationId || selectedLocationId === 'ALL') {
        if (locs.length > 0) onLocationChange(locs[0].id);
      }
    }
    load();
  }, []);

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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-3">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Logistics Map
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Select a logistics demonstration zone to view supply status
          </p>
        </div>

        {/* Clean Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-[#101B13] p-1 rounded-xs border border-[#263F2B] font-mono text-xs">
          {[
            { id: 'ALL' as const, label: 'All Zones' },
            { id: 'RISK' as const, label: 'Needs Attention' },
            { id: 'WEATHER' as const, label: 'Weather Risk' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              className={`px-3 py-1.5 rounded-xs transition-colors cursor-pointer ${
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

      {/* Main Map + Side Zone Inspector */}
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
            className="h-[520px] rounded-xs border border-[#263F2B]"
          />
        </div>

        {/* Selected Zone Summary (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {activeLocation ? (
            <div className="bg-[#101B13] border border-[#263F2B] p-5 rounded-xs shadow-md space-y-4 font-mono text-xs">
              <div className="flex items-start justify-between border-b border-[#1A2C1E] pb-3">
                <div>
                  <span className="text-[10px] text-[#B5A47A] uppercase font-bold tracking-wider block">
                    SELECTED ZONE
                  </span>
                  <h3 className="font-tactical font-bold text-base text-[#E7E9E2]">
                    {activeLocation.name}
                  </h3>
                  <span className="text-[11px] text-[#8B9B8E]">{activeLocation.region}</span>
                </div>
                <StatusBadge status={activeLocation.status} />
              </div>

              {/* 3 Core Stats */}
              <div className="space-y-2">
                <div className="p-2.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs flex justify-between items-center">
                  <span className="text-[#8B9B8E]">Supply Readiness:</span>
                  <strong className="text-sm text-[#E7E9E2]">{activeLocation.inventory_readiness_pct}%</strong>
                </div>

                <div className="p-2.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs flex justify-between items-center">
                  <span className="text-[#8B9B8E]">Weather Status:</span>
                  <StatusBadge status={activeLocation.weather_risk} size="sm" />
                </div>

                <div className="p-2.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs flex justify-between items-center">
                  <span className="text-[#8B9B8E]">Days of Cover:</span>
                  <strong className={activeLocation.days_of_cover < 8 ? 'text-[#f87171] font-bold' : 'text-[#4ade80] font-bold'}>
                    {activeLocation.days_of_cover} Days
                  </strong>
                </div>

                <div className="p-2.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs flex justify-between items-center">
                  <span className="text-[#8B9B8E]">Projected Shortage:</span>
                  <strong className={activeLocation.projected_shortage === 'NONE' ? 'text-[#4ade80]' : 'text-[#f87171]'}>
                    {activeLocation.projected_shortage}
                  </strong>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  if (onSelectLocationForDetail) onSelectLocationForDetail(activeLocation);
                  onNavigate('supplies');
                }}
                className="w-full py-2.5 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>View Zone Supplies</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B5A47A]" />
              </button>
            </div>
          ) : (
            <div className="bg-[#101B13] border border-[#263F2B] p-6 text-center text-[#8B9B8E] font-mono text-xs rounded-xs">
              Click any marker on the map to inspect zone.
            </div>
          )}

          {/* Quick Zone Picker Chips */}
          <div className="bg-[#101B13] border border-[#263F2B] p-3 rounded-xs space-y-2 font-mono text-xs">
            <span className="text-[10px] text-[#8B9B8E] uppercase tracking-wider block font-bold">
              QUICK SWITCH:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => onLocationChange(loc.id)}
                  className={`p-2 text-left rounded-xs border text-[11px] truncate cursor-pointer transition-colors ${
                    selectedLocationId === loc.id
                      ? 'bg-[#263F2B] border-[#596B3A] text-[#E7E9E2] font-semibold'
                      : 'bg-[#07100B] border-[#1A2C1E] text-[#8B9B8E] hover:text-[#E7E9E2]'
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
