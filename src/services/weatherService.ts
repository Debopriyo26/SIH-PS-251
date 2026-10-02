import { WeatherObservation, WeatherForecastDay, DataStatusInfo } from '../types';
import { DEMO_WEATHER_OBSERVATIONS, DEMO_WEATHER_FORECAST_DAYS } from './demoData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000/api';

class WeatherService {
  private lastFetchLive: boolean = false;
  private lastSyncTime: string = '12:34 IST';
  private fetchError: boolean = false;

  public getStatusInfo(): DataStatusInfo {
    if (this.lastFetchLive) {
      return {
        mode: 'LIVE',
        source: 'IMD',
        lastUpdated: this.lastSyncTime,
        message: 'Live Mausam API telemetry'
      };
    }
    if (this.fetchError) {
      return {
        mode: 'OFFLINE',
        source: 'IMD Fallback',
        lastUpdated: this.lastSyncTime,
        message: 'IMD data temporarily unavailable. Showing cached observation.'
      };
    }
    return {
      mode: 'DEMO',
      source: 'Demonstration Data',
      lastUpdated: this.lastSyncTime,
      message: 'Synthetic demonstration weather telemetry'
    };
  }

  public async getObservations(): Promise<WeatherObservation[]> {
    // 1. Attempt to fetch from FastAPI backend
    try {
      const res = await fetch(`${BACKEND_URL}/weather/observations`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.lastFetchLive = true;
          this.fetchError = false;
          this.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
          return data.map((d: any) => ({
            ...d,
            is_live: true
          }));
        }
      }
    } catch (e) {
      // Backend not running or endpoint unreachable
    }

    // 2. Attempt Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('weather_observations')
          .select('*, locations(name)')
          .order('recorded_at', { ascending: false });

        if (!error && data && data.length > 0) {
          this.lastFetchLive = true;
          this.fetchError = false;
          return data.map((item: any) => ({
            id: item.id,
            location_id: item.location_id,
            location_name: item.locations?.name || 'Logistics Zone',
            recorded_at: item.recorded_at,
            temperature_c: Number(item.temperature_c),
            humidity_pct: Number(item.humidity_pct),
            rainfall_mm: Number(item.rainfall_mm),
            wind_speed_kmh: Number(item.wind_speed_kmh),
            weather_condition: item.weather_condition,
            visibility_km: Number(item.visibility_km),
            warning_level: item.warning_level,
            warning_text: item.warning_text,
            source: item.source || 'IMD',
            is_live: true
          }));
        }
      } catch (err) {
        this.fetchError = true;
      }
    }

    // 3. Truthful fallback demo data
    this.lastFetchLive = false;
    return DEMO_WEATHER_OBSERVATIONS;
  }

  public async getForecast7Days(locationId?: string): Promise<WeatherForecastDay[]> {
    try {
      const res = await fetch(`${BACKEND_URL}/weather/forecast?location_id=${locationId || 'loc-srinagar'}`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      // Fallback
    }

    return DEMO_WEATHER_FORECAST_DAYS;
  }

  public async refreshWeatherData(): Promise<DataStatusInfo> {
    await this.getObservations();
    return this.getStatusInfo();
  }
}

export const weatherService = new WeatherService();
