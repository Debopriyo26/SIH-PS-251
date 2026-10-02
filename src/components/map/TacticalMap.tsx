import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationNode } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowUpRight, Navigation, Info } from 'lucide-react';
import { PUBLIC_DATA_DISCLAIMER } from '../../services/demoData';

interface TacticalMapProps {
  locations: LocationNode[];
  selectedLocation: LocationNode | null;
  onSelectLocation: (loc: LocationNode) => void;
  onViewDetails?: (loc: LocationNode) => void;
  className?: string;
}

// Invalidate size component to guarantee correct rendering upon tab switch or container resize
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// Create custom high-contrast military-styled map marker icons
function createStatusIcon(status: 'operational' | 'attention' | 'critical') {
  let borderColor = '#3FA34D';
  let fillColor = '#3FA34D';

  if (status === 'attention') {
    borderColor = '#D39B32';
    fillColor = '#D39B32';
  } else if (status === 'critical') {
    borderColor = '#C43C3C';
    fillColor = '#C43C3C';
  }

  const svgHtml = `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #101B13; border: 2.5px solid ${borderColor}; box-shadow: 0 2px 6px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${fillColor};"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-map-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onViewDetails,
  className = '',
}) => {
  // Center roughly on India's northern/western logistics sector
  const defaultCenter: [number, number] = [28.5, 73.5];

  return (
    <div className={`relative w-full h-full min-h-[420px] rounded-sm overflow-hidden border border-[#263F2B] bg-[#07100B] flex flex-col ${className}`}>
      {/* Subtle Map Legend Header */}
      <div className="bg-[#101B13] border-b border-[#263F2B] px-3.5 py-2 flex flex-wrap items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-[#E7E9E2] font-semibold">
          <Navigation className="w-3.5 h-3.5 text-[#B5A47A]" />
          <span>LOGISTICS MAP — DEMONSTRATION ZONES</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#8B9B8E]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3FA34D]" /> Normal</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#D39B32]" /> Attention</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#C43C3C]" /> Critical</span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[380px]">
        <MapContainer
          center={defaultCenter}
          zoom={5}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', minHeight: '380px', backgroundColor: '#101B13' }}
        >
          <MapResizer />
          {/* Reliable OpenStreetMap standard tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
          />

          {locations.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={createStatusIcon(loc.status)}
              eventHandlers={{
                click: () => onSelectLocation(loc),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[210px] font-sans text-xs">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1.5 mb-2">
                    <span className="font-bold text-gray-900">{loc.name}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                      {loc.status}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-gray-700">
                    <div className="flex justify-between">
                      <span>Supply Readiness:</span>
                      <strong>{loc.inventory_readiness_pct}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Weather Risk:</span>
                      <strong>{loc.weather_risk}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport Avail:</span>
                      <strong>{loc.transport_availability_pct}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Days of Cover:</span>
                      <strong>{loc.days_of_cover}d</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected Shortage:</span>
                      <strong className={loc.projected_shortage === 'NONE' ? 'text-green-700' : 'text-red-700'}>
                        {loc.projected_shortage}
                      </strong>
                    </div>
                  </div>

                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(loc)}
                      className="mt-3 w-full py-1 px-2 bg-[#263F2B] text-white rounded text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-[#325338]"
                    >
                      <span>VIEW DETAILS</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Subtle Geographic Disclaimer Footer */}
      <div className="bg-[#101B13] border-t border-[#263F2B] px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-mono text-[#8B9B8E]">
        <Info className="w-3 h-3 text-[#B5A47A] shrink-0" />
        <span className="truncate">{PUBLIC_DATA_DISCLAIMER}</span>
      </div>
    </div>
  );
};
