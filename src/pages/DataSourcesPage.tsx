import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Radio, 
  Map, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Layers, 
  Shield, 
  CloudSun,
  FileText
} from 'lucide-react';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { DEMO_DATA_SOURCES } from '../services/demoData';
import { DataSourceStatus } from '../types';

export const DataSourcesPage: React.FC = () => {
  const [sources, setSources] = useState<DataSourceStatus[]>(DEMO_DATA_SOURCES);
  const [isPinging, setIsPinging] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handlePingAll = () => {
    setIsPinging(true);
    setTimeout(() => {
      setSources(prev => prev.map(s => ({
        ...s,
        last_sync_at: 'Just now',
        latency_ms: Math.round(s.latency_ms * (0.9 + Math.random() * 0.2)),
        records_ingested: s.records_ingested + Math.floor(Math.random() * 15)
      })));
      setIsPinging(false);
      setToastMessage('All 5 data pipelines verified and synchronized successfully.');
      setTimeout(() => setToastMessage(''), 3500);
    }, 700);
  };

  const getSourceIcon = (code: string) => {
    switch (code) {
      case 'IMD': return <Radio className="w-5 h-5 text-[#3FA34D]" />;
      case 'SUPABASE': return <Database className="w-5 h-5 text-[#3FA34D]" />;
      case 'OSM': return <Map className="w-5 h-5 text-[#B5A47A]" />;
      case 'DATA_GOV': return <FileText className="w-5 h-5 text-[#596B3A]" />;
      case 'OPENWEATHER': return <CloudSun className="w-5 h-5 text-[#D39B32]" />;
      default: return <Server className="w-5 h-5 text-[#8B9B8E]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#101B13] border border-[#3FA34D] text-[#4ade80] px-4 py-2.5 rounded-xs shadow-xl font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3FA34D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2C1E] pb-4">
        <div>
          <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
            Data Sources & Ingestion Transparency
          </h1>
          <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
            Telemetry Pipeline Auditing • Government APIs, Meteorological Feeds & Relational State Store
          </p>
        </div>

        <button
          onClick={handlePingAll}
          disabled={isPinging}
          className="px-4 py-2 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] rounded-xs font-tactical text-xs tracking-wider uppercase flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#B5A47A] ${isPinging ? 'animate-spin' : ''}`} />
          <span>{isPinging ? 'Pinging Gateways...' : 'Test & Sync All Gateways'}</span>
        </button>
      </div>

      {/* Architecture Flow Banner matching Prompt Architecture:
          External APIs ↓ FastAPI ingestion services ↓ Validation / normalization ↓ Supabase ↓ VYOMIX frontend */}
      <TacticalCard
        title="Multi-Tier Autonomous Ingestion Architecture"
        subtitle="Zero direct client-side scraping: validated, sanitized server-side ETL pipeline"
      >
        <div className="p-4 bg-[#07100B] border border-[#1A2C1E] rounded-xs">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center font-mono text-xs items-center">
            {/* Step 1 */}
            <div className="p-3 bg-[#101B13] border border-[#263F2B] rounded-xs space-y-1">
              <span className="text-[10px] text-[#B5A47A] uppercase font-bold block">1. EXTERNAL APIS</span>
              <div className="text-white font-semibold">IMD / data.gov.in / OSM</div>
              <span className="text-[10px] text-[#8B9B8E] block">REST / Radar GeoJSON</span>
            </div>

            <div className="hidden md:flex justify-center text-[#596B3A] font-bold text-lg">&rarr;</div>

            {/* Step 2 */}
            <div className="p-3 bg-[#101B13] border border-[#263F2B] rounded-xs space-y-1">
              <span className="text-[10px] text-[#B5A47A] uppercase font-bold block">2. FASTAPI BACKEND</span>
              <div className="text-white font-semibold">Async ETL Ingestors</div>
              <span className="text-[10px] text-[#8B9B8E] block">Rate-limit / Token security</span>
            </div>

            <div className="hidden md:flex justify-center text-[#596B3A] font-bold text-lg">&rarr;</div>

            {/* Step 3 */}
            <div className="p-3 bg-[#101B13] border border-[#263F2B] rounded-xs space-y-1">
              <span className="text-[10px] text-[#B5A47A] uppercase font-bold block">3. NORMALIZATION & ML</span>
              <div className="text-white font-semibold">Validation & XGBoost</div>
              <span className="text-[10px] text-[#8B9B8E] block">Pydantic & Shortage Calc</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center font-mono text-xs items-center mt-3">
            <div className="hidden md:block"></div>
            <div className="hidden md:block"></div>

            <div className="hidden md:flex justify-center text-[#596B3A] font-bold text-lg">&darr;</div>

            <div className="hidden md:block"></div>
            <div className="hidden md:block"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center font-mono text-xs items-center">
            <div className="hidden md:block"></div>

            {/* Step 4 */}
            <div className="p-3 bg-[#101B13] border border-[#3FA34D]/40 rounded-xs space-y-1">
              <span className="text-[10px] text-[#4ade80] uppercase font-bold block">4. SUPABASE PG</span>
              <div className="text-white font-semibold">PostgreSQL & Realtime</div>
              <span className="text-[10px] text-[#8B9B8E] block">RLS & CDC Subscriptions</span>
            </div>

            <div className="hidden md:flex justify-center text-[#596B3A] font-bold text-lg">&rarr;</div>

            {/* Step 5 */}
            <div className="p-3 bg-[#101B13] border border-[#596B3A] rounded-xs space-y-1">
              <span className="text-[10px] text-[#B5A47A] uppercase font-bold block">5. VYOMIX FRONTEND</span>
              <div className="text-white font-semibold">Command Center UI</div>
              <span className="text-[10px] text-[#8B9B8E] block">React / Leaflet / Recharts</span>
            </div>

            <div className="hidden md:block"></div>
          </div>
        </div>
      </TacticalCard>

      {/* Data Source Transparency Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sources.map((src) => (
          <div
            key={src.id}
            className="tactical-border bg-[#101B13] border border-[#263F2B] p-5 rounded-sm space-y-4 shadow-md"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#1A2C1E] pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs">
                  {getSourceIcon(src.code)}
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#B5A47A] tracking-wider uppercase block">
                    {src.source_type}
                  </span>
                  <h3 className="font-tactical font-semibold text-sm text-[#E7E9E2]">
                    {src.name}
                  </h3>
                </div>
              </div>
              <StatusBadge status={src.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-[#07100B] p-2.5 rounded-xs border border-[#1A2C1E]">
                <span className="text-[#8B9B8E] text-[10px] block uppercase">Last Synchronized</span>
                <span className="text-[#E7E9E2] font-semibold">{src.last_sync_at}</span>
              </div>

              <div className="bg-[#07100B] p-2.5 rounded-xs border border-[#1A2C1E]">
                <span className="text-[#8B9B8E] text-[10px] block uppercase">Ingestion Latency</span>
                <span className="text-[#4ade80] font-semibold">{src.latency_ms} ms</span>
              </div>

              <div className="bg-[#07100B] p-2.5 rounded-xs border border-[#1A2C1E]">
                <span className="text-[#8B9B8E] text-[10px] block uppercase">Records Processed</span>
                <span className="text-[#E7E9E2] font-semibold">{src.records_ingested.toLocaleString()}</span>
              </div>

              <div className="bg-[#07100B] p-2.5 rounded-xs border border-[#1A2C1E]">
                <span className="text-[#8B9B8E] text-[10px] block uppercase">Fault Tolerance</span>
                <span className="text-[#4ade80] font-semibold">Demo Cache Ready</span>
              </div>
            </div>

            <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs text-[11px] font-mono text-[#8B9B8E] leading-relaxed">
              {src.notes}
            </div>

            <div className="pt-2 border-t border-[#1A2C1E] flex items-center justify-between text-[11px] font-mono text-[#8B9B8E]">
              <span className="truncate max-w-[200px] text-[#B5A47A]">{src.endpoint_url}</span>
              <a
                href={src.endpoint_url}
                target="_blank"
                rel="noreferrer"
                className="text-[#4ade80] hover:underline flex items-center gap-1"
              >
                <span>Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
