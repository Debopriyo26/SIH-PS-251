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
      <div className="border-b border-[#1A2C1E] pb-3">
        <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
          <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
          Help & Documentation
        </h1>
        <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
          Quick start guides, operational metric definitions, and data integrations
        </p>
      </div>

      {/* 4 Clean Master Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1A2C1E] pb-2 font-mono text-xs">
        {[
          { id: 'quickstart' as const, label: '🚀 Quick Start (Workflow)' },
          { id: 'metrics' as const, label: '📊 Metric & Risk Definitions' },
          { id: 'datasources' as const, label: '🔌 Data & Integrations' },
          { id: 'about' as const, label: 'ℹ️ About & Disclaimer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xs transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#263F2B] text-[#E7E9E2] font-semibold border border-[#596B3A]'
                : 'bg-[#101B13] text-[#8B9B8E] hover:text-[#E7E9E2] border border-[#1A2C1E]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Quick Start Workflow */}
      {activeTab === 'quickstart' && (
        <div className="bg-[#101B13] border border-[#263F2B] p-5 rounded-xs space-y-4 font-mono text-xs shadow-md">
          <span className="font-tactical font-semibold text-xs text-[#E7E9E2] uppercase tracking-wider block border-b border-[#1A2C1E] pb-2">
            7-Step Standard Operational Workflow
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { step: '1', title: 'Open Dashboard', desc: 'Scan the 4 top KPI cards (Readiness, Weather Risk, Transport, Active Alerts) for an immediate high-level overview.' },
              { step: '2', title: 'Review Alerts', desc: 'Check the priority predictive alert to see which supply item may face shortfalls within 7 days.' },
              { step: '3', title: 'Select a Zone', desc: 'Use the Zone dropdown to filter data for Srinagar, Jaisalmer, Ahmedabad, or Kutch.' },
              { step: '4', title: 'Inspect Map', desc: 'Navigate to Locations to inspect the GIS map with color-coded status markers.' },
              { step: '5', title: 'Check Supplies', desc: 'Open Supplies to review on-hand stock levels, daily burn rates, and days of cover.' },
              { step: '6', title: 'Review Forecast', desc: 'Visit Forecast to inspect the 7, 14, or 30-day machine-learning consumption projections.' },
              { step: '7', title: 'Run a Scenario', desc: 'Use the Simulator to test how severe weather or demand surges would affect your stock levels.' }
            ].map((s) => (
              <div key={s.step} className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-1">
                <div className="flex items-center gap-2 text-[#B5A47A] font-bold">
                  <span className="w-5 h-5 rounded-full bg-[#263F2B] border border-[#596B3A] flex items-center justify-center text-[10px]">
                    {s.step}
                  </span>
                  <span>{s.title}</span>
                </div>
                <p className="text-[11px] text-[#8B9B8E] leading-relaxed pl-7">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Metric & Risk Definitions */}
      {activeTab === 'metrics' && (
        <div className="bg-[#101B13] border border-[#263F2B] p-5 rounded-xs space-y-4 font-mono text-xs shadow-md">
          <span className="font-tactical font-semibold text-xs text-[#E7E9E2] uppercase tracking-wider block border-b border-[#1A2C1E] pb-2">
            Plain-English Metric Glossary
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { term: 'Supply Readiness (%)', def: 'Percentage of inventory currently above mandatory safety thresholds across all tracked supplies in a zone.' },
              { term: 'Days of Cover', def: 'How many days current on-hand stock will last at the present daily consumption rate (Stock ÷ Daily Burn).' },
              { term: 'Demand Forecast', def: 'Machine learning estimation of future daily consumption based on historical trends, troop strength, and weather.' },
              { term: 'Weather Risk', def: 'Impact rating based on IMD precipitation and wind advisories that could slow road transport corridors.' },
              { term: 'Transport Readiness', def: 'Percentage of the transport vehicle fleet currently available and operational for supply dispatch.' },
              { term: 'Projected Shortage', def: 'Supply categories flagged to breach safety floors within the upcoming 7-day window.' },
            ].map((m) => (
              <div key={m.term} className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-1">
                <strong className="text-xs text-[#E7E9E2] block">{m.term}</strong>
                <p className="text-[11px] text-[#8B9B8E] leading-relaxed">{m.def}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Data & Integrations */}
      {activeTab === 'datasources' && (
        <div className="bg-[#101B13] border border-[#263F2B] p-5 rounded-xs space-y-4 font-mono text-xs shadow-md">
          <span className="font-tactical font-semibold text-xs text-[#E7E9E2] uppercase tracking-wider block border-b border-[#1A2C1E] pb-2">
            Integrated Data Sources
          </span>

          <div className="space-y-2.5">
            {DEMO_DATA_SOURCES.map((src) => (
              <div
                key={src.code}
                className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs flex flex-wrap items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs text-[#E7E9E2]">{src.name}</strong>
                    <span className="text-[10px] text-[#B5A47A]">({src.source_type})</span>
                  </div>
                  <p className="text-[11px] text-[#8B9B8E]">{src.notes}</p>
                </div>
                <StatusBadge status={src.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: About & Disclaimer */}
      {activeTab === 'about' && (
        <div className="bg-[#101B13] border border-[#263F2B] p-5 rounded-xs space-y-4 font-mono text-xs shadow-md">
          <span className="font-tactical font-semibold text-xs text-[#E7E9E2] uppercase tracking-wider block border-b border-[#1A2C1E] pb-2">
            About VYOMIX Platform
          </span>

          <div className="space-y-3 text-[#8B9B8E] leading-relaxed text-xs">
            <p>
              <strong className="text-[#E7E9E2]">VYOMIX (Predictive Logistics Intelligence)</strong> is an enterprise platform that unites inventory, weather, transport, and consumption data to preempt supply shortages before they become critical.
            </p>
            <div className="p-3.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs text-[11px] text-[#B5A47A] leading-relaxed">
              <strong>Public Data Notice: </strong>
              {PUBLIC_DATA_DISCLAIMER}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
