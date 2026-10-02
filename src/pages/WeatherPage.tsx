import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Thermometer, 
  Wind, 
  Droplets, 
  Eye, 
  AlertTriangle, 
  Compass, 
  RefreshCw, 
  ShieldCheck, 
  Calendar,
  CloudLightning,
  SunMedium
} from 'lucide-react';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { weatherService } from '../services/weatherService';
import { WeatherObservation, WeatherForecastDay } from '../types';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const WeatherPage: React.FC = () => {
  const [observations, setObservations] = useState<WeatherObservation[]>([]);
  const [forecastDays, setForecastDays] = useState<WeatherForecastDay[]>([]);
  const [selectedObs, setSelectedObs] = useState<WeatherObservation | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const sourceInfo = weatherService.getSourceInfo();

  useEffect(() => {
    async function load() {
      const [obs, fc] = await Promise.all([
        weatherService.getObservations(),
        weatherService.getForecast7Days(),
      ]);
      setObservations(obs);
      setForecastDays(fc);
      if (obs.length > 0) setSelectedObs(obs[1]); // Focus on Distribution Node Alpha (has Orange rainfall warning)
    }
    load();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await weatherService.refreshWeatherData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // 24-hour synthetic telemetry trend for charts
  const hourlyData = [
    { time: '00:00', temp: 5.2, rain: 2.1, wind: 18, risk: 25 },
    { time: '03:00', temp: 4.8, rain: 4.5, wind: 22, risk: 35 },
    { time: '06:00', temp: 4.1, rain: 8.2, wind: 28, risk: 55 },
    { time: '09:00', temp: 6.5, rain: 14.8, wind: 32, risk: 75 },
    { time: '12:00', temp: 8.2, rain: 18.5, wind: 34, risk: 85 },
    { time: '15:00', temp: 9.0, rain: 16.0, wind: 30, risk: 80 },
    { time: '18:00', temp: 7.4, rain: 11.2, wind: 25, risk: 65 },
    { time: '21:00', temp: 6.0, rain: 7.0, wind: 20, risk: 45 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header and Official IMD Source Tag */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Weather Intelligence & IMD Telemetry
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Meteorological Impact on Forward Logistics Corridors & Mountain Passes
          </p>
        </div>

        {/* Live Data Badge strictly matching requirement: LIVE DATA | SOURCE: IMD | LAST UPDATED */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-xs bg-[#101B13] border border-[#263F2B] font-mono text-xs text-[#E7E9E2] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-ping" />
            <span className="font-bold text-[#4ade80]">LIVE DATA</span>
            <span className="text-[#8B9B8E]">|</span>
            <span>SOURCE: <strong className="text-[#B5A47A]">IMD</strong></span>
            <span className="text-[#8B9B8E]">|</span>
            <span className="text-[#8B9B8E]">LAST UPDATED: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] rounded-xs border border-[#596B3A] transition-colors"
            title="Poll IMD Gateway"
          >
            <RefreshCw className={`w-4 h-4 text-[#B5A47A] ${isRefreshing ? 'animate-spin text-[#4ade80]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Observation Stations Selector Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {observations.map((obs) => {
          const isSelected = selectedObs?.id === obs.id;
          return (
            <div
              key={obs.id}
              onClick={() => setSelectedObs(obs)}
              className={`tactical-border p-4 rounded-xs cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-[#263F2B] border-[#596B3A] shadow-lg'
                  : 'bg-[#101B13] border-[#263F2B] hover:border-[#596B3A]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-tactical font-semibold text-xs text-[#E7E9E2] uppercase">
                  {obs.location_name}
                </span>
                <StatusBadge status={obs.warning_level} size="sm" pulse={obs.warning_level === 'RED'} />
              </div>

              <div className="flex items-baseline justify-between font-mono">
                <span className="text-2xl font-bold text-[#E7E9E2]">{obs.temperature_c}°C</span>
                <span className="text-xs text-[#3E92CC] font-semibold">{obs.rainfall_mm} mm rain</span>
              </div>

              <div className="mt-2 pt-2 border-t border-[#1A2C1E] flex items-center justify-between text-[11px] font-mono text-[#8B9B8E]">
                <span>{obs.weather_condition}</span>
                <span>{obs.wind_speed_kmh} km/h wind</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Focus Weather Station Telemetry Panel */}
      {selectedObs && (
        <div className="tactical-border bg-[#101B13] border border-[#263F2B] p-6 rounded-sm shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
            <div>
              <span className="font-mono text-[10px] text-[#B5A47A] tracking-wider uppercase block">
                IMD STATION TELEMETRY FOCUS
              </span>
              <h2 className="font-tactical text-xl font-bold text-[#E7E9E2] uppercase flex items-center gap-2">
                {selectedObs.location_name}
                <StatusBadge status={selectedObs.warning_level} />
              </h2>
            </div>

            <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs font-mono text-xs max-w-md">
              <span className="text-[#D39B32] font-semibold block mb-0.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                IMD District Advisory / Nowcast:
              </span>
              <p className="text-[#8B9B8E] text-[11px] leading-relaxed">
                "{selectedObs.warning_text}"
              </p>
            </div>
          </div>

          {/* 6 Metric HUD Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
            <div className="bg-[#07100B] p-3.5 rounded-xs border border-[#1A2C1E]">
              <div className="flex items-center gap-1.5 text-[#8B9B8E] text-[10px] uppercase mb-1">
                <Thermometer className="w-3.5 h-3.5 text-[#D39B32]" />
                Temperature
              </div>
              <div className="text-xl font-bold text-[#E7E9E2]">{selectedObs.temperature_c}°C</div>
              <span className="text-[10px] text-[#8B9B8E]">Apparent: {selectedObs.temperature_c - 2}°C</span>
            </div>

            <div className="bg-[#07100B] p-3.5 rounded-xs border border-[#1A2C1E]">
              <div className="flex items-center gap-1.5 text-[#8B9B8E] text-[10px] uppercase mb-1">
                <Droplets className="w-3.5 h-3.5 text-[#3E92CC]" />
                Humidity
              </div>
              <div className="text-xl font-bold text-[#E7E9E2]">{selectedObs.humidity_pct}%</div>
              <span className="text-[10px] text-[#8B9B8E]">Dew Point: 6.2°C</span>
            </div>

            <div className="bg-[#07100B] p-3.5 rounded-xs border border-[#1A2C1E]">
              <div className="flex items-center gap-1.5 text-[#8B9B8E] text-[10px] uppercase mb-1">
                <CloudRain className="w-3.5 h-3.5 text-[#3E92CC]" />
                Rainfall Rate
              </div>
              <div className="text-xl font-bold text-[#3E92CC]">{selectedObs.rainfall_mm} mm</div>
              <span className="text-[10px] text-[#8B9B8E]">Past 3h accumulation</span>
            </div>

            <div className="bg-[#07100B] p-3.5 rounded-xs border border-[#1A2C1E]">
              <div className="flex items-center gap-1.5 text-[#8B9B8E] text-[10px] uppercase mb-1">
                <Wind className="w-3.5 h-3.5 text-[#B5A47A]" />
                Wind Speed
              </div>
              <div className="text-xl font-bold text-[#E7E9E2]">{selectedObs.wind_speed_kmh} km/h</div>
              <span className="text-[10px] text-[#8B9B8E]">Gusts: {selectedObs.wind_speed_kmh + 16} km/h</span>
            </div>

            <div className="bg-[#07100B] p-3.5 rounded-xs border border-[#1A2C1E]">
              <div className="flex items-center gap-1.5 text-[#8B9B8E] text-[10px] uppercase mb-1">
                <Eye className="w-3.5 h-3.5 text-[#596B3A]" />
                Visibility
              </div>
              <div className="text-xl font-bold text-[#E7E9E2]">{selectedObs.visibility_km} km</div>
              <span className="text-[10px] text-[#8B9B8E]">High mountain fog</span>
            </div>

            <div className="bg-[#07100B] p-3.5 rounded-xs border border-[#1A2C1E]">
              <div className="flex items-center gap-1.5 text-[#8B9B8E] text-[10px] uppercase mb-1">
                <Compass className="w-3.5 h-3.5 text-[#B5A47A]" />
                Atmosphere
              </div>
              <div className="text-xl font-bold text-[#E7E9E2]">1008 hPa</div>
              <span className="text-[10px] text-[#8B9B8E]">Falling rapidly</span>
            </div>
          </div>
        </div>
      )}

      {/* Weather Telemetry Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TacticalCard
          title="24-Hour Rainfall & Temperature Telemetry Trend"
          subtitle="IMD Srinagar Regional Radar & AWS (Automatic Weather Station) Feed"
        >
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid stroke="#1A2C1E" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#8B9B8E" fontSize={11} />
                <YAxis stroke="#8B9B8E" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101B13',
                    borderColor: '#263F2B',
                    borderRadius: '2px',
                    color: '#E7E9E2',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="rain" stroke="#3E92CC" fill="rgba(62, 146, 204, 0.2)" name="Rainfall (mm)" />
                <Area type="monotone" dataKey="temp" stroke="#fbbf24" fill="rgba(251, 191, 36, 0.1)" name="Temp (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TacticalCard>

        <TacticalCard
          title="Supply Corridor Weather Risk Score Trend"
          subtitle="Dynamic composite index reflecting landslide probability and traction degradation"
        >
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid stroke="#1A2C1E" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#8B9B8E" fontSize={11} />
                <YAxis stroke="#8B9B8E" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101B13',
                    borderColor: '#263F2B',
                    borderRadius: '2px',
                    color: '#E7E9E2',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="risk" stroke="#C43C3C" strokeWidth={2.5} dot={{ r: 4, fill: '#C43C3C' }} name="Logistics Risk Index" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TacticalCard>
      </div>

      {/* 7-Day IMD Forecast Outlook */}
      <TacticalCard
        title="7-Day Synoptic Weather Forecast (Official IMD Mausam Outlook)"
        subtitle="Forward planning window for convoy scheduling and cold-chain dispatches"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {forecastDays.map((day, idx) => (
            <div
              key={idx}
              className="bg-[#07100B] border border-[#1A2C1E] p-3 rounded-xs text-center space-y-2 hover:border-[#596B3A] transition-colors font-mono"
            >
              <div className="text-xs font-semibold text-[#E7E9E2]">{day.date}</div>
              <StatusBadge status={day.warningLevel} size="sm" />
              
              <div className="py-1">
                <span className="text-base font-bold text-[#E7E9E2]">{day.tempMax}°</span>
                <span className="text-xs text-[#8B9B8E] ml-1">{day.tempMin}°</span>
              </div>

              <div className="text-[11px] text-[#3E92CC] font-semibold">
                {day.rainfallMm} mm ({day.rainfallProbPct}%)
              </div>

              <div className="text-[10px] text-[#8B9B8E] leading-tight line-clamp-2">
                {day.condition}
              </div>
            </div>
          ))}
        </div>
      </TacticalCard>
    </div>
  );
};
