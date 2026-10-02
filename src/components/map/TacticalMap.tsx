import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { LocationNode } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Shield, CloudRain, Truck, Package, ArrowUpRight, Navigation } from 'lucide-react';

interface TacticalMapProps {
  locations: LocationNode[];
  selectedLocation: LocationNode | null;
  onSelectLocation: (loc: LocationNode) => void;
  onViewDetails?: (loc: LocationNode) => void;
  className?: string;
}

// Custom tactical SVG marker icons
function createTacticalIcon(status: 'operational' | 'attention' | 'critical', type: string) {
  let color = '#3FA34D';
  let pulseClass = '';

  if (status === 'attention') {
    color = '#D39B32';
  } else if (status === 'critical') {
    color = '#C43C3C';
    pulseClass = 'animate-pulse';
  }

  const isHub = type === 'Supply Hub';

  const svgHtml = `
    <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none">
      ${status === 'critical' ? `<div class="absolute w-10 h-10 rounded-full border border-[${color}] animate-ping opacity-60"></div>` : ''}
      <div class="w-7 h-7 rounded-sm flex items-center justify-center shadow-lg border-2 ${pulseClass}" style="background-color: #101B13; border-color: ${color};">
        ${isHub ? `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        ` : `
          <div class="w-2.5 h-2.5 rounded-xs" style="background-color: ${color};"></div>
        `}
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-tactical-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

// Realistic synthetic transport routes connecting the nodes
const ROUTES: { from: string; to: string; status: 'clear' | 'degraded' | 'restricted' }[] = [
  { from: 'LOC-SH-C', to: 'LOC-SH-N', status: 'clear' },
  { from: 'LOC-SH-N', to: 'LOC-DN-A', status: 'degraded' },
  { from: 'LOC-SH-N', to: 'LOC-DN-B', status: 'clear' },
  { from: 'LOC-DN-A', to: 'LOC-FN-A', status: 'restricted' },
  { from: 'LOC-DN-B', to: 'LOC-FN-B', status: 'clear' },
];

export const TacticalMap: React.FC<TacticalMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onViewDetails,
  className = '',
}) => {
  const mapCenter: [number, number] = [33.7, 74.8];

  const getRouteCoordinates = (fromCode: string, toCode: string): [number, number][] => {
    const loc1 = locations.find(l => l.code === fromCode);
    const loc2 = locations.find(l => l.code === toCode);
    if (!loc1 || !loc2) return [];
    return [
      [loc1.latitude, loc1.longitude],
      [loc2.latitude, loc2.longitude]
    ];
  };

  return (
    <div className={`relative w-full h-[600px] rounded-sm overflow-hidden border border-[#263F2B] bg-[#07100B] ${className}`}>
      {/* Map Control HUD Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-[#101B13]/90 backdrop-blur-md border border-[#263F2B] p-2.5 rounded-xs text-xs font-mono">
        <div className="flex items-center gap-2 text-[#B5A47A] font-semibold mb-1">
          <Navigation className="w-3.5 h-3.5 text-[#3FA34D]" />
          <span>TACTICAL CARTOGRAPHY (LEAFLET GIS)</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#8B9B8E]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-xs bg-[#3FA34D]"></span> OPERATIONAL</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-xs bg-[#D39B32]"></span> ATTENTION</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-xs bg-[#C43C3C]"></span> CRITICAL</span>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={8}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Dark Tactical CartoDB Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          className="tactical-tiles"
        />

        {/* Tactical Routes */}
        {ROUTES.map((route, idx) => {
          const coords = getRouteCoordinates(route.from, route.to);
          if (coords.length < 2) return null;

          let color = '#3FA34D';
          let dashArray = '4, 4';
          if (route.status === 'degraded') {
            color = '#D39B32';
            dashArray = '6, 6';
          } else if (route.status === 'restricted') {
            color = '#C43C3C';
            dashArray = '8, 4';
          }

          return (
            <Polyline
              key={idx}
              positions={coords}
              pathOptions={{
                color,
                weight: 2.5,
                dashArray,
                opacity: 0.8,
              }}
            >
              <Tooltip sticky className="font-mono text-xs">
                <span>Route {route.from} ➔ {route.to} [{route.status.toUpperCase()}]</span>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* Location Markers */}
        {locations.map((loc) => {
          const isSelected = selectedLocation?.id === loc.id;
          return (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={createTacticalIcon(loc.status, loc.type)}
              eventHandlers={{
                click: () => onSelectLocation(loc),
              }}
            >
              <Popup className="tactical-popup">
                <div className="p-1 min-w-[200px] font-sans">
                  <div className="flex items-center justify-between border-b border-[#263F2B] pb-1.5 mb-2">
                    <div>
                      <div className="font-mono text-[10px] text-[#8B9B8E] tracking-wider uppercase">
                        {loc.type}
                      </div>
                      <div className="font-tactical font-bold text-sm text-[#E7E9E2]">
                        {loc.name}
                      </div>
                    </div>
                    <StatusBadge status={loc.status} size="sm" />
                  </div>

                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-[#8B9B8E]">
                      <span>Inventory Readiness:</span>
                      <span className="text-[#E7E9E2] font-semibold">{loc.inventory_readiness_pct}%</span>
                    </div>
                    <div className="flex justify-between text-[#8B9B8E]">
                      <span>Demand Forecast:</span>
                      <span className="text-[#fbbf24] font-semibold">+14%</span>
                    </div>
                    <div className="flex justify-between text-[#8B9B8E]">
                      <span>Weather Risk:</span>
                      <span className={loc.weather_risk === 'LOW' ? 'text-[#4ade80]' : loc.weather_risk === 'MODERATE' ? 'text-[#fbbf24]' : 'text-[#f87171]'}>
                        {loc.weather_risk}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#8B9B8E]">
                      <span>Transport Avail:</span>
                      <span className="text-[#E7E9E2] font-semibold">{loc.transport_availability_pct}%</span>
                    </div>
                    <div className="flex justify-between text-[#8B9B8E]">
                      <span>Projected Shortage:</span>
                      <span className={loc.projected_shortage === 'NONE' ? 'text-[#4ade80]' : 'text-[#f87171] font-bold'}>
                        {loc.projected_shortage}
                      </span>
                    </div>
                  </div>

                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(loc)}
                      className="mt-3 w-full py-1.5 px-3 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>VIEW DETAILS</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#B5A47A]" />
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Selected Location Tactical Panel overlay (Bottom or Right side) */}
      {selectedLocation && (
        <div className="absolute bottom-4 right-4 z-[1000] w-80 bg-[#101B13]/95 backdrop-blur-md border border-[#263F2B] p-4 rounded-xs shadow-2xl tactical-border">
          <div className="flex items-center justify-between border-b border-[#1A2C1E] pb-2 mb-3">
            <div>
              <span className="font-mono text-[10px] text-[#8B9B8E] uppercase tracking-wider">
                LOCATION NODE
              </span>
              <h4 className="font-tactical font-bold text-base text-[#E7E9E2]">
                {selectedLocation.name}
              </h4>
            </div>
            <StatusBadge status={selectedLocation.status} />
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#8B9B8E]">Inventory Readiness</span>
              <span className="text-[#E7E9E2] font-semibold">{selectedLocation.inventory_readiness_pct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8B9B8E]">Demand Forecast</span>
              <span className="text-[#fbbf24] font-semibold">+14%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8B9B8E]">Weather Risk</span>
              <span className={selectedLocation.weather_risk === 'LOW' ? 'text-[#4ade80]' : 'text-[#f87171] font-semibold'}>
                {selectedLocation.weather_risk}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8B9B8E]">Transport Availability</span>
              <span className="text-[#E7E9E2] font-semibold">{selectedLocation.transport_availability_pct}%</span>
            </div>
            <div className="flex justify-between border-t border-[#1A2C1E] pt-2">
              <span className="text-[#8B9B8E]">Projected Shortage</span>
              <span className={selectedLocation.projected_shortage === 'NONE' ? 'text-[#4ade80]' : 'text-[#f87171] font-bold'}>
                {selectedLocation.projected_shortage}
              </span>
            </div>
          </div>

          {onViewDetails && (
            <button
              onClick={() => onViewDetails(selectedLocation)}
              className="mt-4 w-full py-2 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>VIEW FULL INVENTORY & TELEMETRY</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#B5A47A]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
