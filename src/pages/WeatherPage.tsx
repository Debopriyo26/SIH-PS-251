import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  CloudRain, 
  Wind, 
  Eye, 
  Thermometer, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  MapPin, 
  TrendingUp, 
  Calendar, 
  Shield, 
  ArrowRight,
  Info,
  Clock,
  Compass
} from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { weatherService } from '../services/weatherService';
import { WeatherObservation, WeatherForecastDay, DataStatusInfo, LogisticsZone } from '../types';
import { DataStatus } from '../components/common/DataStatus';
import { StatusBadge } from '../components/common/StatusBadge';
import { resolveLocationId, matchesZone } from '../lib/zones';

interface WeatherPageProps {
  selectedLocationId?: string;
  onLocationChange?: (locId: string) => void;
}

export const WeatherPage: React.FC<WeatherPageProps> = ({
  selectedLocationId = 'ALL',
  onLocationChange,
}) => {
  const { user } = useAuth();
  const isMainHead = user?.role === 'MAIN_HEAD';
  const effectiveZone = (user?.zone as LogisticsZone) || 'Srinagar';

  const [observations, setObservations] = useState<WeatherObservation[]>([]);
  const [forecastDays, setForecastDays] = useState<WeatherForecastDay[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>(() => {
    if (!isMainHead && user?.zone) return user.zone;
    return selectedLocationId !== 'ALL' ? selectedLocationId : 'Srinagar';
  });
  const [weatherStatus, setWeatherStatus] = useState<DataStatusInfo>(weatherService.getStatusInfo());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshFeedback, setRefreshFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, [selectedZone, user?.role, user?.zone]);

  const loadWeatherData = async () => {
    const obs = await weatherService.getObservations(user?.role, user?.zone);
    setObservations(obs);

    const targetZone = !isMainHead && user?.zone ? user.zone : selectedZone;
    const fcast = await weatherService.getForecast7Days(targetZone, user?.role, user?.zone);
    setForecastDays(fcast);
    setWeatherStatus(weatherService.getStatusInfo());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshFeedback(null);
    try {
      const result = await weatherService.refreshWeatherData();
      setWeatherStatus(result.statusInfo);
      await loadWeatherData();
      if (result.success) {
        setRefreshFeedback('Weather telemetry synchronized with IMD Mausam API & local observations.');
      } else {
        setRefreshFeedback(result.error || 'Unable to retrieve fresh weather data.');
      }
    } catch (err: any) {
      setRefreshFeedback(err.message || 'Error syncing telemetry.');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshFeedback(null), 4000);
    }
  };

  // Determine active observation
  const activeObs = observations.find(o => 
    matchesZone(o.location_name || '', !isMainHead ? effectiveZone : selectedZone) ||
    matchesZone(o.location_id, !isMainHead ? effectiveZone : selectedZone)
  ) || observations[0];

  const getWarningBadge = (level: string) => {
    switch (level) {
      case 'RED':
        return 'bg-[#FEE4E2] text-[#B42318] border-[#FDA29B]';
      case 'ORANGE':
        return 'bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]';
      case 'YELLOW':
        return 'bg-[#FEF08A] text-[#A16207] border-[#FDE047]';
      default:
        return 'bg-[#E8F5E9] text-[#2F6B3C] border-[#A5D6A7]';
    }
  };

  // Tactical operational impact based on zone
  const getOperationalImpact = (zone: string) => {
    if (matchesZone(zone, 'Srinagar')) {
      return {
        transitStatus: 'High Caution / Sleet Advisory',
        delayFactor: '+40% Convoy Delay Risk',
        routePass: 'Zojila & Sinthan Top Passes: Snow Chains Mandatory',
        resourceImpact: 'Heating fuel consumption surges +22%. Rations require insulated tarpaulin covers.',
        directive: 'Shift non-bulk priority cargo to Light 4x4 convoys. Schedule movements between 10:00 and 15:00 hrs.'
      };
    }
    if (matchesZone(zone, 'Jaisalmer')) {
      return {
        transitStatus: 'Normal Desert Route / Thermal Caution',
        delayFactor: 'No Transit Delays (<5% variance)',
        routePass: 'Western Desert Corridor: Clear & Dry',
        resourceImpact: 'High ambient temperature (34°C+). Potable water evaporation & consumption surges +28%.',
        directive: 'Schedule fuel and water bulk replenishment convoys during night and early morning hours to minimize thermal degradation.'
      };
    }
    if (matchesZone(zone, 'Ahmedabad')) {
      return {
        transitStatus: 'Optimal Multi-Modal Railhead Transit',
        delayFactor: 'Zero Delay Corridor',
        routePass: 'National Highway & Freight Corridors: Full Clear',
        resourceImpact: 'Standard operational burn rate. Ideal conditions for primary replenishment dispatches.',
        directive: 'Accelerate forward-staging of bulk reserves toward northern transit nodes.'
      };
    }
    return {
      transitStatus: 'Coastal Squall Warning / Marsh Salt Mist',
      delayFactor: '+15% Low Visibility Delay',
      routePass: 'Rann of Kutch Coastal Highway: Caution on Marsh Shoulders',
      resourceImpact: 'High salinity mist increases vehicle air filter maintenance requirements.',
      directive: 'Ensure freshwater washdowns after salt marsh patrols; operate convoys with anti-corrosion sealant protocols.'
    };
  };

  const impact = getOperationalImpact(!isMainHead ? effectiveZone : selectedZone);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D8DFD5] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-6 bg-[#355E3B] inline-block rounded-xs"></span>
            <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#1F2933] uppercase">
              {isMainHead ? 'Central Logistics Weather Surveillance' : `${effectiveZone.toUpperCase()} LOGISTICS WEATHER FORECAST`}
            </h1>
            <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider ${
              isMainHead ? 'bg-[#355E3B] text-white' : 'bg-[#6B7444] text-white'
            }`}>
              {isMainHead ? '★ ALL 4 ZONES' : `⚑ ${effectiveZone.toUpperCase()} SECTOR`}
            </span>
          </div>
          <p className="text-[#52606D]">
            {isMainHead 
              ? 'Multi-sector meteorological telemetry, corridor pass hazards & 7-day predictive impact analysis'
              : `Strictly isolated weather telemetry & 7-day operational transport advisory for ${effectiveZone} logistics corridors`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DataStatus
            mode={weatherStatus.mode}
            source="IMD (India Meteorological Department)"
            updated={weatherStatus.lastUpdated}
            size="sm"
          />

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F0F4EE] border border-[#D8DFD5] text-[#1F2933] rounded-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#355E3B] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Telemetry'}</span>
          </button>

          {/* Zone Selector: Only for Main Head */}
          {isMainHead ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#52606D] text-[11px] uppercase">Zone:</span>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-white border border-[#D8DFD5] focus:border-[#355E3B] text-xs font-bold text-[#1F2933] px-3.5 py-1.5 rounded-xs focus:outline-hidden cursor-pointer shadow-xs"
              >
                <option value="Srinagar">Srinagar (Mountain/Cold)</option>
                <option value="Jaisalmer">Jaisalmer (Desert/Arid)</option>
                <option value="Ahmedabad">Ahmedabad (Central Plains)</option>
                <option value="Kutch">Kutch (Coastal Marsh)</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#52606D] text-[11px] uppercase">Zone:</span>
              <span className="px-2.5 py-1 bg-[#E8EEE5] text-[#355E3B] border border-[#CAD3C8] rounded-xs font-bold uppercase">
                MY ZONE: {effectiveZone}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Alert */}
      {refreshFeedback && (
        <div className={`p-2.5 rounded-xs border flex items-center gap-2 ${
          refreshFeedback.includes('Unable') 
            ? 'bg-[#FEE4E2] text-[#B42318] border-[#FDA29B]' 
            : 'bg-[#E8F5E9] text-[#2F6B3C] border-[#A5D6A7]'
        }`}>
          <Info className="w-4 h-4 shrink-0" />
          <span>{refreshFeedback}</span>
        </div>
      )}

      {/* Main Head Multi-Zone Executive Comparison Cards */}
      {isMainHead && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-tactical text-xs font-bold uppercase tracking-wider text-[#1F2933]">
              All 4 Operational Sectors — Live Weather Overview (Click to Inspect)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {observations.map((obs) => {
              const zoneName = obs.location_name?.replace(' Logistics Zone', '').replace(' Logistics Base', '') || 'Sector';
              const isSelected = matchesZone(selectedZone, zoneName);
              return (
                <div
                  key={obs.id}
                  onClick={() => setSelectedZone(zoneName)}
                  className={`p-3.5 rounded-xs border cursor-pointer transition-colors shadow-xs ${
                    isSelected
                      ? 'bg-[#E8EEE5] border-[#355E3B] ring-1 ring-[#355E3B]'
                      : 'bg-white border-[#D8DFD5] hover:border-[#6B7444]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-tactical font-bold text-sm text-[#1F2933]">{zoneName}</span>
                    <span className={`px-2 py-0.5 rounded-xs text-[9px] font-bold uppercase border ${getWarningBadge(obs.warning_level)}`}>
                      {obs.warning_level}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-tactical text-2xl font-bold text-[#1F2933]">{obs.temperature_c}°C</span>
                    <span className="text-[#52606D] font-semibold text-[11px] truncate max-w-[130px]">{obs.weather_condition}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-[#52606D] border-t border-[#F0F4EE] pt-2">
                    <span>Rain: <strong className="text-[#1F2933]">{obs.rainfall_mm} mm</strong></span>
                    <span>Wind: <strong className="text-[#1F2933]">{obs.wind_speed_kmh} km/h</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Sector Detailed Telemetry & Tactical Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5 Cols: Current Telemetry Gauges */}
        <div className="lg:col-span-5 bg-white border border-[#D8DFD5] p-5 rounded-xs space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#F0F4EE] pb-2.5">
            <div>
              <span className="text-[10px] text-[#355E3B] uppercase font-bold tracking-wider block">
                SECTOR WEATHER STATION
              </span>
              <h3 className="font-tactical font-bold text-base text-[#1F2933]">
                {activeObs?.location_name || `${effectiveZone} Logistics Zone`}
              </h3>
            </div>
            <span className={`px-2.5 py-1 rounded-xs text-[10px] font-bold uppercase border ${getWarningBadge(activeObs?.warning_level || 'GREEN')}`}>
              {activeObs?.warning_level || 'GREEN'} ADVISORY
            </span>
          </div>

          {/* Large Temp & Condition Display */}
          <div className="p-4 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-[#52606D] uppercase font-bold block">Current Temperature</span>
              <div className="font-tactical text-4xl font-bold text-[#1F2933]">
                {activeObs?.temperature_c}°C
              </div>
              <span className="text-[11px] text-[#355E3B] font-semibold flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5 text-[#355E3B]" />
                {activeObs?.weather_condition}
              </span>
            </div>
            <div className="text-right space-y-1 text-xs">
              <div className="text-[#52606D]">Visibility: <strong className="text-[#1F2933]">{activeObs?.visibility_km} km</strong></div>
              <div className="text-[#52606D]">Precipitation: <strong className={activeObs?.rainfall_mm && activeObs.rainfall_mm > 5 ? 'text-[#B42318]' : 'text-[#2F6B3C]'}>{activeObs?.rainfall_mm} mm</strong></div>
              <div className="text-[#52606D]">Relative Humidity: <strong className="text-[#1F2933]">{activeObs?.humidity_pct}%</strong></div>
            </div>
          </div>

          {/* Key Meteorological Parameters */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#F9FAF8] border border-[#D8DFD5] rounded-xs flex items-center gap-2.5">
              <Wind className="w-4 h-4 text-[#355E3B]" />
              <div>
                <span className="text-[10px] text-[#52606D] block">Wind Velocity</span>
                <strong className="text-[#1F2933]">{activeObs?.wind_speed_kmh} km/h</strong>
              </div>
            </div>
            <div className="p-2.5 bg-[#F9FAF8] border border-[#D8DFD5] rounded-xs flex items-center gap-2.5">
              <Droplets className="w-4 h-4 text-[#2F6B3C]" />
              <div>
                <span className="text-[10px] text-[#52606D] block">Precipitation Rate</span>
                <strong className="text-[#1F2933]">{activeObs?.rainfall_mm} mm / 24h</strong>
              </div>
            </div>
            <div className="p-2.5 bg-[#F9FAF8] border border-[#D8DFD5] rounded-xs flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-[#6B7444]" />
              <div>
                <span className="text-[10px] text-[#52606D] block">Line-of-Sight Visibility</span>
                <strong className="text-[#1F2933]">{activeObs?.visibility_km} km</strong>
              </div>
            </div>
            <div className="p-2.5 bg-[#F9FAF8] border border-[#D8DFD5] rounded-xs flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-[#B5A47A]" />
              <div>
                <span className="text-[10px] text-[#52606D] block">Source Provider</span>
                <strong className="text-[#1F2933]">{activeObs?.source || 'IMD Telemetry'}</strong>
              </div>
            </div>
          </div>

          {/* Warning Notice Box */}
          <div className="p-3 bg-[#F0F4EE] border border-[#CAD3C8] rounded-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#1F2933] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#A16207]" />
              Official IMD Telemetry Advisory:
            </span>
            <p className="text-[11px] text-[#52606D] leading-relaxed">
              {activeObs?.warning_text || 'No severe meteorological disruptions reported in this sector.'}
            </p>
          </div>
        </div>

        {/* Right 7 Cols: Tactical Supply Chain & Route Impact */}
        <div className="lg:col-span-7 bg-white border border-[#D8DFD5] p-5 rounded-xs space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#F0F4EE] pb-2.5">
            <span className="font-tactical font-bold text-xs text-[#1F2933] uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#355E3B]" />
              Forward Supply Chain & Route Impact Assessment
            </span>
            <span className="text-[10px] text-[#52606D]">Sector Impact Matrix</span>
          </div>

          {/* Impact Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs space-y-1">
              <span className="text-[10px] text-[#52606D] uppercase font-bold block">Corridor Transit Feasibility</span>
              <strong className="text-sm text-[#1F2933] block">{impact.transitStatus}</strong>
              <span className="text-[11px] text-[#B42318] font-bold">{impact.delayFactor}</span>
            </div>

            <div className="p-3 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs space-y-1">
              <span className="text-[10px] text-[#52606D] uppercase font-bold block">Critical Mountain / Pass Bottleneck</span>
              <strong className="text-xs text-[#1F2933] block">{impact.routePass}</strong>
              <span className="text-[10px] text-[#2F6B3C] font-semibold">Tracked via ISRO Bhuvan GIS Corridor</span>
            </div>
          </div>

          {/* Resource & Consumption Burn Rate Impact */}
          <div className="p-3.5 bg-[#F9FAF8] border border-[#D8DFD5] rounded-xs space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[#1F2933] block">
              Predictive Demand & Burn Rate Correlation:
            </span>
            <p className="text-[11px] text-[#52606D] leading-relaxed">
              {impact.resourceImpact}
            </p>
          </div>

          {/* Tactical Logistics Directive */}
          <div className="p-3.5 bg-[#E8F5E9] border border-[#A5D6A7] rounded-xs space-y-1.5 text-[#2F6B3C]">
            <span className="text-[10px] uppercase font-bold block flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6B3C]" />
              Recommended Logistical Mitigation Directive:
            </span>
            <p className="text-[11px] font-semibold leading-relaxed">
              {impact.directive}
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Predictive Meteorological Forecast Table */}
      <div className="bg-white border border-[#D8DFD5] rounded-xs p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F4EE] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#355E3B]" />
              <h2 className="font-tactical font-bold text-sm text-[#1F2933] uppercase tracking-wider">
                7-Day Predictive Weather Outlook ({!isMainHead ? effectiveZone : selectedZone})
              </h2>
            </div>
            <p className="text-[10px] text-[#52606D] mt-0.5">
              Daily minimum/maximum temperature range, precipitation risk, and forward transit conditions
            </p>
          </div>
          <span className="px-2.5 py-1 bg-[#E8EEE5] text-[#355E3B] border border-[#CAD3C8] rounded-xs text-[10px] font-bold uppercase">
            SYNCHRONIZED IMD FORECAST
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {forecastDays.map((f, i) => (
            <div
              key={f.date}
              className={`p-3 rounded-xs border text-center font-mono space-y-2 transition-colors ${
                i === 0 
                  ? 'bg-[#E8EEE5] border-[#355E3B] shadow-xs' 
                  : 'bg-[#F9FAF8] border-[#D8DFD5] hover:border-[#6B7444]'
              }`}
            >
              <div className="border-b border-[#D8DFD5] pb-1.5">
                <span className="text-[10px] text-[#52606D] block font-bold">{f.dayName}</span>
                <span className="font-tactical text-xs font-bold text-[#1F2933] truncate block">{f.date}</span>
              </div>

              <div className="py-1">
                <CloudRain className={`w-5 h-5 mx-auto ${f.rainfallMm > 10 ? 'text-[#B42318]' : 'text-[#355E3B]'}`} />
                <span className="text-[10px] font-bold text-[#1F2933] block mt-1 line-clamp-1">
                  {f.condition}
                </span>
              </div>

              <div className="text-[11px] font-bold text-[#1F2933]">
                {f.tempMin}°C - {f.tempMax}°C
              </div>

              <div className="text-[10px] text-[#52606D] space-y-0.5 border-t border-[#F0F4EE] pt-1.5">
                <div>Rain: <strong className="text-[#1F2933]">{f.rainfallMm}mm</strong></div>
                <div>Prob: <strong className={f.rainfallProbPct > 50 ? 'text-[#B42318]' : 'text-[#2F6B3C]'}>{f.rainfallProbPct}%</strong></div>
              </div>

              <div className="pt-1">
                <span className={`px-1.5 py-0.2 rounded-xs text-[9px] font-bold uppercase border block truncate ${getWarningBadge(f.warningLevel)}`}>
                  {f.warningLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
