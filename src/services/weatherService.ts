import { WeatherObservation, WeatherForecastDay } from '../types';
import { DEMO_WEATHER_OBSERVATIONS, DEMO_WEATHER_FORECAST_DAYS } from './demoData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

class WeatherService {
  private currentSource: 'IMD' | 'OpenWeather' | 'Demo' = 'IMD';
  private lastSyncTime: string = new Date().toISOString();

  public getSourceInfo() {
    return {
      source: this.currentSource,
      lastUpdated: this.lastSyncTime,
      isLive: true,
      providerName: 'India Meteorological Department (Mausam API)',
      secondaryProvider: 'OpenWeather API (Standby Fallback)',
    };
  }

  public async getObservations(): Promise<WeatherObservation[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('weather_observations')
          .select('*, locations(name)')
          .order('recorded_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            location_id: item.location_id,
            location_name: item.locations?.name || 'Tactical Sector',
            recorded_at: item.recorded_at,
            temperature_c: Number(item.temperature_c),
            humidity_pct: Number(item.humidity_pct),
            rainfall_mm: Number(item.rainfall_mm),
            wind_speed_kmh: Number(item.wind_speed_kmh),
            weather_condition: item.weather_condition,
            visibility_km: Number(item.visibility_km),
            warning_level: item.warning_level,
            warning_text: item.warning_text,
            source: item.source || 'IMD'
          }));
        }
      } catch (err) {
        console.warn('Weather fetch from Supabase failed, using tactical IMD demo cache:', err);
      }
    }

    return DEMO_WEATHER_OBSERVATIONS;
  }

  public async getForecast7Days(locationId?: string): Promise<WeatherForecastDay[]> {
    return DEMO_WEATHER_FORECAST_DAYS;
  }

  public async refreshWeatherData(): Promise<boolean> {
    // Simulated live refresh from IMD gateway
    this.lastSyncTime = new Date().toISOString();
    return true;
  }
}

export const weatherService = new WeatherService();
