import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  ShieldAlert, 
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { DEMO_DATA_SOURCES, PUBLIC_DATA_DISCLAIMER } from '../services/demoData';
import { StatusBadge } from '../components/common/StatusBadge';

export const HelpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'metrics' | 'datasources' | 'about'>('quickstart');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#D8DFD5] pb-4">
        <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#1F2933] uppercase flex items-center gap-2.5">
          <span className="w-2.5 h-6 bg-[#355E3B] inline-block rounded-xs"></span>
          Help & Operational Documentation
        </h1>
        <p className="font-mono text-xs text-[#52606D] mt-0.5">
          Quick start guides, operational metric definitions, and data integrations
        </p>
      </div>

      {/* 4 Clean Master Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#D8DFD5] pb-2 font-mono text-xs">
        {[
          { id: 'quickstart' as const, label: '🚀 Quick Start (Workflow)' },
          { id: 'metrics' as const, label: '📊 Metric & Risk Definitions' },
          { id: 'datasources' as const, label: '🔌 Data & Integrations' },
          { id: 'about' as const, label: 'ℹ️ About & Disclaimer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xs transition-colors cursor-pointer font-bold ${
              activeTab === tab.id
                ? 'bg-[#355E3B] text-white border border-[#1F3D27] shadow-xs'
                : 'bg-white text-[#52606D] hover:text-[#1F2933] border border-[#D8DFD5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Quick Start Workflow */}
      {activeTab === 'quickstart' && (
        <div className="bg-white border border-[#D8DFD5] p-5 rounded-xs space-y-4 font-mono text-xs shadow-xs">
          <span className="font-tactical font-bold text-xs text-[#1F2933] uppercase tracking-wider block border-b border-[#F0F4EE] pb-2">
            Standard Operational Workflow
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { step: '1', title: 'Open Dashboard', desc: 'Inspect Supply Readiness, Weather Risk, and Priority Shortage Alerts across all regional zones.' },
              { step: '2', title: 'Review Bhuvan Map', desc: 'Interact with the official Government of India Bhuvan NRSC geospatial layer for Srinagar, Jaisalmer, Ahmedabad, and Kutch.' },
              { step: '3', title: 'Inspect Supplies', desc: 'Review on-hand stock and days of cover. Adjust stock values with instant recalculation and database persistence.' },
              { step: '4', title: 'Evaluate Forecast', desc: 'Examine predicted demand curves cross-referenced against historical burn rates and IMD precipitation.' },
              { step: '5', title: 'Tactical Weather Forecasting', desc: 'Monitor live sector meteorological telemetry, mountain pass transit advisories, and 7-day corridor forecasts.' },
              { step: '6', title: 'Manage Alerts', desc: 'Filter by location and severity. Acknowledge warnings or mark directives resolved with automatic archiving.' },
            ].map((s) => (
              <div key={s.step} className="p-3 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs space-y-1">
                <div className="flex items-center gap-2 text-[#355E3B] font-bold">
                  <span className="w-5 h-5 rounded-full bg-[#E8EEE5] text-[#355E3B] border border-[#CAD3C8] flex items-center justify-center text-[10px]">
                    {s.step}
                  </span>
                  <span>{s.title}</span>
                </div>
                <p className="text-[#52606D] text-[11px] leading-relaxed pl-7">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Metric Definitions */}
      {activeTab === 'metrics' && (
        <div className="bg-white border border-[#D8DFD5] p-5 rounded-xs space-y-4 font-mono text-xs shadow-xs">
          <span className="font-tactical font-bold text-xs text-[#1F2933] uppercase tracking-wider block border-b border-[#F0F4EE] pb-2">
            Key Metric Calculations
          </span>

          <div className="space-y-3">
            <div className="p-3.5 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs space-y-1">
              <strong className="text-[#1F2933] text-xs">Days of Cover:</strong>
              <p className="text-[#52606D] text-[11px]">
                Calculated as <code>Current Stock / Daily Consumption</code>. Indicates how many operating days current inventory can sustain before depletion.
              </p>
            </div>

            <div className="p-3.5 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs space-y-1">
              <strong className="text-[#1F2933] text-xs">Safety Threshold:</strong>
              <p className="text-[#52606D] text-[11px]">
                The mandatory emergency reserve cushion. Dropping below this threshold triggers immediate HIGH or CRITICAL alert directives.
              </p>
            </div>

            <div className="p-3.5 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs space-y-1">
              <strong className="text-[#1F2933] text-xs">Alert Severity Order:</strong>
              <p className="text-[#52606D] text-[11px]">
                Strict priority order: 1. CRITICAL (Weight 4) &gt; 2. HIGH (Weight 3) &gt; 3. MEDIUM (Weight 2) &gt; 4. LOW (Weight 1).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Data Sources */}
      {activeTab === 'datasources' && (
        <div className="bg-white border border-[#D8DFD5] p-5 rounded-xs space-y-4 font-mono text-xs shadow-xs">
          <span className="font-tactical font-bold text-xs text-[#1F2933] uppercase tracking-wider block border-b border-[#F0F4EE] pb-2">
            Connected Systems & Government Providers
          </span>

          <div className="space-y-3">
            {DEMO_DATA_SOURCES.map((ds) => (
              <div key={ds.id} className="p-3.5 bg-[#F7F8F4] border border-[#D8DFD5] rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <strong className="text-[#1F2933] text-sm">{ds.name}</strong>
                    <span className="text-[10px] text-[#355E3B] font-bold">[{ds.code}]</span>
                  </div>
                  <StatusBadge status={ds.status} size="sm" />
                </div>
                <p className="text-[#52606D] text-[11px] leading-relaxed">{ds.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: About & Disclaimer */}
      {activeTab === 'about' && (
        <div className="bg-white border border-[#D8DFD5] p-6 rounded-xs space-y-4 font-mono text-xs shadow-xs">
          <span className="font-tactical font-bold text-sm text-[#1F2933] uppercase tracking-wider block border-b border-[#F0F4EE] pb-2">
            About VYOMIX Platform
          </span>

          <p className="text-[#52606D] text-xs leading-relaxed">
            VYOMIX is a predictive logistics decision support system integrating inventory management, geospatial cartography from official Government of India web services (Bhuvan — ISRO / NRSC), and machine learning demand forecasting.
          </p>

          <div className="p-4 bg-[#E8EEE5] border border-[#CAD3C8] rounded-xs space-y-2 text-[#1F2933]">
            <div className="flex items-center gap-2 font-bold text-[#355E3B]">
              <Info className="w-4 h-4" />
              <span>Public Regional Demonstration Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {PUBLIC_DATA_DISCLAIMER}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
