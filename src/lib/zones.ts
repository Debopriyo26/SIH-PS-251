import { LogisticsZone, LocationNode } from '../types';

export interface ZoneConfig {
  zone: LogisticsZone;
  dbId: string;
  demoId: string;
  code: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  altitude_m: number;
  region: string;
  leadTimeDays: number;
  terrainFactor: number;
  terrainDescription: string;
}

export const ZONES_CONFIG: Record<LogisticsZone, ZoneConfig> = {
  Srinagar: {
    zone: 'Srinagar',
    dbId: 'a1111111-1111-1111-1111-111111111111',
    demoId: 'loc-srinagar',
    code: 'LOC-SXR',
    name: 'Srinagar Logistics Zone',
    type: 'Logistics Zone',
    latitude: 34.0837,
    longitude: 74.7973,
    altitude_m: 1585,
    region: 'Northern Sector',
    leadTimeDays: 3.5,
    terrainFactor: 1.35,
    terrainDescription: 'High-Altitude Mountain Corridor (1,585m+), Snow & Sleet Vulnerability'
  },
  Jaisalmer: {
    zone: 'Jaisalmer',
    dbId: 'a2222222-2222-2222-2222-222222222222',
    demoId: 'loc-jaisalmer',
    code: 'LOC-JSA',
    name: 'Jaisalmer Logistics Zone',
    type: 'Logistics Zone',
    latitude: 26.9157,
    longitude: 70.9083,
    altitude_m: 225,
    region: 'Western Sector',
    leadTimeDays: 1.5,
    terrainFactor: 1.15,
    terrainDescription: 'Arid Desert Plain, Extreme Heat & Dust Infiltration'
  },
  Ahmedabad: {
    zone: 'Ahmedabad',
    dbId: 'a3333333-3333-3333-3333-333333333333',
    demoId: 'loc-ahmedabad',
    code: 'LOC-AMD',
    name: 'Ahmedabad Logistics Base',
    type: 'Logistics Base',
    latitude: 23.0225,
    longitude: 72.5714,
    altitude_m: 53,
    region: 'Central Support',
    leadTimeDays: 0.5,
    terrainFactor: 1.00,
    terrainDescription: 'Plains Infrastructure, Multi-Modal Railhead & Heavy Storage Depot'
  },
  Kutch: {
    zone: 'Kutch',
    dbId: 'a4444444-4444-4444-4444-444444444444',
    demoId: 'loc-kutch',
    code: 'LOC-KUT',
    name: 'Kutch Logistics Zone',
    type: 'Logistics Zone',
    latitude: 23.2420,
    longitude: 69.6669,
    altitude_m: 110,
    region: 'Coastal Flank',
    leadTimeDays: 2.0,
    terrainFactor: 1.20,
    terrainDescription: 'Coastal Marshland Corridor, Tidal Humidity & Road Salinity'
  }
};

export const ALL_ZONES: LogisticsZone[] = ['Srinagar', 'Jaisalmer', 'Ahmedabad', 'Kutch'];

/**
 * Resolves any zone string, location ID or location code to standard database UUID
 */
export function resolveLocationId(input?: string | null): string {
  if (!input) return ZONES_CONFIG.Srinagar.dbId;
  const s = input.toLowerCase().trim();

  if (s.includes('srinagar') || s.includes('sxr') || s === 'a1111111-1111-1111-1111-111111111111' || s === 'loc-srinagar') {
    return ZONES_CONFIG.Srinagar.dbId;
  }
  if (s.includes('jaisalmer') || s.includes('jsa') || s === 'a2222222-2222-2222-2222-222222222222' || s === 'loc-jaisalmer') {
    return ZONES_CONFIG.Jaisalmer.dbId;
  }
  if (s.includes('ahmedabad') || s.includes('amd') || s === 'a3333333-3333-3333-3333-333333333333' || s === 'loc-ahmedabad') {
    return ZONES_CONFIG.Ahmedabad.dbId;
  }
  if (s.includes('kutch') || s.includes('kut') || s === 'a4444444-4444-4444-4444-444444444444' || s === 'loc-kutch') {
    return ZONES_CONFIG.Kutch.dbId;
  }

  return input;
}

/**
 * Resolves standard zone name from any identifier
 */
export function getLocationZoneName(input?: string | null): LogisticsZone {
  if (!input) return 'Srinagar';
  const s = input.toLowerCase().trim();

  if (s.includes('srinagar') || s.includes('sxr') || s === 'a1111111-1111-1111-1111-111111111111' || s === 'loc-srinagar') {
    return 'Srinagar';
  }
  if (s.includes('jaisalmer') || s.includes('jsa') || s === 'a2222222-2222-2222-2222-222222222222' || s === 'loc-jaisalmer') {
    return 'Jaisalmer';
  }
  if (s.includes('ahmedabad') || s.includes('amd') || s === 'a3333333-3333-3333-3333-333333333333' || s === 'loc-ahmedabad') {
    return 'Ahmedabad';
  }
  if (s.includes('kutch') || s.includes('kut') || s === 'a4444444-4444-4444-4444-444444444444' || s === 'loc-kutch') {
    return 'Kutch';
  }

  return 'Srinagar';
}

/**
 * Checks whether an identifier (id, code, name) matches a given zone
 */
export function matchesZone(identifier?: string | null, targetZone?: LogisticsZone | string | null): boolean {
  if (!identifier || !targetZone) return false;
  const z1 = getLocationZoneName(identifier);
  const z2 = getLocationZoneName(targetZone);
  return z1 === z2;
}

/**
 * Gets location node from zone name
 */
export function getLocationNodeForZone(zone: LogisticsZone): LocationNode {
  const c = ZONES_CONFIG[zone];
  return {
    id: c.dbId,
    code: c.code,
    name: c.name,
    type: c.type as any,
    latitude: c.latitude,
    longitude: c.longitude,
    altitude_m: c.altitude_m,
    region: c.region,
    status: zone === 'Srinagar' || zone === 'Kutch' ? 'attention' : 'operational',
    inventory_readiness_pct: zone === 'Ahmedabad' ? 96 : (zone === 'Jaisalmer' ? 91 : (zone === 'Srinagar' ? 78 : 74)),
    weather_risk: zone === 'Srinagar' ? 'HIGH' : (zone === 'Kutch' ? 'MODERATE' : 'LOW'),
    transport_availability_pct: zone === 'Ahmedabad' ? 94 : (zone === 'Jaisalmer' ? 86 : (zone === 'Srinagar' ? 65 : 70)),
    days_of_cover: zone === 'Ahmedabad' ? 22.0 : (zone === 'Jaisalmer' ? 14.5 : (zone === 'Srinagar' ? 7.2 : 8.8)),
    projected_shortage: zone === 'Srinagar' ? 'FUEL / MEDICAL' : (zone === 'Kutch' ? 'WATER / POL' : 'NONE'),
    notes: c.terrainDescription
  };
}
