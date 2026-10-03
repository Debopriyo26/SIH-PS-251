import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationNode } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowUpRight, Navigation, Info, Layers } from 'lucide-react';
import { PUBLIC_DATA_DISCLAIMER } from '../../services/demoData';

interface TacticalMapProps {
  locations: LocationNode[];
  selectedLocation: LocationNode | null;
  onSelectLocation: (loc: LocationNode) => void;
  onViewDetails?: (loc: LocationNode) => void;
  className?: string;
}

// Invalidate size component to guarantee correct rendering upon tab switch, login, or container resize
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    // Invalidate immediately, then at 200ms and 500ms to guarantee complete layout computation
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 200);
    const t2 = setTimeout(() => map.invalidateSize(), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
}

// Create custom high-contrast light Army-styled map marker icons
function createStatusIcon(status: 'operational' | 'attention' | 'critical', isSelected: boolean = false) {
  let borderColor = '#2F6B3C';
  let fillColor = '#355E3B';

  if (status === 'attention') {
    borderColor = '#A16207';
    fillColor = '#C2410C';
  } else if (status === 'critical') {
    borderColor = '#B42318';
    fillColor = '#B42318';
  }

  const ringStyle = isSelected ? 'ring-3 ring-[#355E3B]/40 scale-110' : '';

  const svgHtml = `
    <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #FFFFFF; border: 2.5px solid ${borderColor}; box-shadow: 0 2px 6px rgba(31, 41, 51, 0.25); display: flex; align-items: center; justify-content: center;" class="${ringStyle}">
        <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${fillColor};"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-army-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onViewDetails,
  className = '',
}) => {
  // Center roughly on India's northern/western regional demonstration axis
  const defaultCenter: [number, number] = [28.2, 73.0];
  const [mapSource, setMapSource] = useState<'bhuvan_wms' | 'bhuvan_satellite'>('bhuvan_wms');

  return (
    <div className={`relative w-full h-full min-h-[420px] rounded-sm overflow-hidden border border-[#D8DFD5] bg-[#F7F8F4] flex flex-col shadow-xs ${className}`}>
      {/* Map Header with Official Source Banner and Layer Switcher */}
      <div className="bg-[#FFFFFF] border-b border-[#D8DFD5] px-3.5 py-2.5 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
        <div className="flex items-center gap-2 text-[#1F2933] font-semibold">
          <Navigation className="w-3.5 h-3.5 text-[#355E3B]" />
          <span>GEOSPATIAL SOURCE: BHUVAN — ISRO / NRSC</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-[#E8EEE5] text-[#355E3B] font-bold border border-[#CAD3C8]">
            GOVT OF INDIA
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#F0F4EE] p-0.5 rounded-xs border border-[#D8DFD5] text-[11px]">
            <button
              onClick={() => setMapSource('bhuvan_wms')}
              className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                mapSource === 'bhuvan_wms'
                  ? 'bg-[#355E3B] text-white font-semibold'
                  : 'text-[#52606D] hover:text-[#1F2933]'
              }`}
            >
              Bhuvan WMS
            </button>
            <button
              onClick={() => setMapSource('bhuvan_satellite')}
              className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                mapSource === 'bhuvan_satellite'
                  ? 'bg-[#355E3B] text-white font-semibold'
                  : 'text-[#52606D] hover:text-[#1F2933]'
              }`}
            >
              Bhuvan Thematic
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 text-[11px] text-[#52606D]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2F6B3C]" /> Normal</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#A16207]" /> Attention</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#B42318]" /> Critical</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[360px]">
        <MapContainer
          center={defaultCenter}
          zoom={5}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', minHeight: '360px', backgroundColor: '#E8EEE5' }}
        >
          <MapResizer />

          {/* Official Government of India Bhuvan NRSC WMS Service */}
          {mapSource === 'bhuvan_wms' ? (
            <WMSTileLayer
              url="https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms"
              layers="india3"
              format="image/png"
              transparent={false}
              attribution='&copy; <a href="https://bhuvan.nrsc.gov.in" target="_blank" rel="noopener noreferrer">Bhuvan, ISRO / NRSC</a> | Survey of India — Government of India'
            />
          ) : (
            <WMSTileLayer
              url="https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms"
              layers="india4"
              format="image/png"
              transparent={false}
              attribution='&copy; <a href="https://bhuvan.nrsc.gov.in" target="_blank" rel="noopener noreferrer">Bhuvan, ISRO / NRSC</a> | Survey of India — Government of India'
            />
          )}

          {/* Demonstration Regional Markers: Srinagar, Jaisalmer, Ahmedabad, Kutch */}
          {locations.map((loc) => {
            const isSelected = selectedLocation?.id === loc.id;
            return (
              <Marker
                key={loc.id}
                position={[loc.latitude, loc.longitude]}
                icon={createStatusIcon(loc.status, isSelected)}
                eventHandlers={{
                  click: () => onSelectLocation(loc),
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[210px] font-sans text-xs text-[#1F2933]">
                    <div className="flex items-center justify-between border-b border-[#D8DFD5] pb-1.5 mb-2">
                      <span className="font-bold text-[#1F2933]">{loc.name}</span>
                      <StatusBadge status={loc.status} size="sm" />
                    </div>

                    <div className="space-y-1 font-mono text-[11px] text-[#52606D]">
                      <div className="flex justify-between">
                        <span>Supply Readiness:</span>
                        <strong className="text-[#1F2933]">{loc.inventory_readiness_pct}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Weather Risk:</span>
                        <strong className="text-[#1F2933]">{loc.weather_risk}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Transport Avail:</span>
                        <strong className="text-[#1F2933]">{loc.transport_availability_pct}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Days of Cover:</span>
                        <strong className="text-[#1F2933]">{loc.days_of_cover}d</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Projected Shortage:</span>
                        <strong className={loc.projected_shortage === 'NONE' ? 'text-[#2F6B3C]' : 'text-[#B42318]'}>
                          {loc.projected_shortage}
                        </strong>
                      </div>
                    </div>

                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(loc)}
                        className="mt-3 w-full py-1.5 px-2 bg-[#355E3B] text-white rounded-xs text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-[#1F3D27] transition-colors cursor-pointer"
                      >
                        <span>VIEW DETAILS</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Mandatory Geographic & Demonstration Disclaimer Note (Requirement 2) */}
      <div className="bg-[#FFFFFF] border-t border-[#D8DFD5] px-3.5 py-1.5 flex items-center gap-1.5 text-[10px] font-mono text-[#52606D]">
        <Info className="w-3.5 h-3.5 text-[#355E3B] shrink-0" />
        <span className="truncate">{PUBLIC_DATA_DISCLAIMER}</span>
      </div>
    </div>
  );
};
