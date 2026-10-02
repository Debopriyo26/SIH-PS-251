import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  MapPin, 
  Boxes, 
  TrendingUp, 
  Sliders, 
  Bell, 
  Database, 
  ShieldAlert, 
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { TacticalCard } from '../components/common/TacticalCard';
import { DEMO_DATA_SOURCES, PUBLIC_DATA_DISCLAIMER } from '../services/demoData';
import { StatusBadge } from '../components/common/StatusBadge';

export const HelpPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('quickstart');

  const navItems = [
    { id: 'about', label: '1. What is VYOMIX?' },
    { id: 'quickstart', label: '2. How to Use (Quick Start)' },
    { id: 'dashboard', label: '3. Dashboard Guide' },
    { id: 'locations', label: '4. Locations Guide' },
    { id: 'supplies', label: '5. Supplies Guide' },
    { id: 'forecast', label: '6. Forecast Guide' },
    { id: 'simulator', label: '7. Simulator Guide' },
    { id: 'alerts', label: '8. Alerts Guide' },
    { id: 'metrics', label: '9. Metric Definitions' },
    { id: 'risk', label: '10. Risk Level Definitions' },
    { id: 'datasources', label: '11. Data & Integrations' },
    { id: 'disclaimer', label: '12. About & Disclaimer' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#1A2C1E] pb-4">
        <h1 className="font-tactical text-2xl font-bold tracking-wider text-[#E7E9E2] uppercase flex items-center gap-2.5">
          <span className="w-2.5 h-6 bg-[#B5A47A] inline-block"></span>
          VYOMIX Help & User Documentation
        </h1>
        <p className="font-mono text-xs text-[#8B9B8E] mt-0.5">
          System guides, operational workflows, metrics glossary, and integration details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table of Contents Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="bg-[#101B13] border border-[#263F2B] p-3 rounded-xs space-y-1 font-mono text-xs sticky top-20">
            <span className="text-[10px] text-[#B5A47A] uppercase tracking-wider font-semibold block px-2 py-1">
              Documentation Index
            </span>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-3 py-2 rounded-xs transition-colors flex items-center justify-between ${
                  activeSection === item.id
                    ? 'bg-[#263F2B] text-[#E7E9E2] font-semibold border border-[#596B3A]'
                    : 'text-[#8B9B8E] hover:text-[#E7E9E2] hover:bg-[#1A2C1E]'
                }`}
              >
                <span>{item.label}</span>
                {activeSection === item.id && <ChevronRight className="w-3.5 h-3.5 text-[#B5A47A]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Section Content Area */}
        <div className="lg:col-span-8 space-y-6 font-mono text-xs">
          {/* 1. What is VYOMIX? */}
          {(activeSection === 'about' || activeSection === 'all') && (
            <TacticalCard title="1. What is VYOMIX?" subtitle="Overview and core purpose">
              <div className="space-y-3 text-[#E7E9E2] leading-relaxed">
                <p>
                  <strong>VYOMIX</strong> (Predictive Logistics Intelligence) is a decision-support platform designed for forward supply chain commanders and logistics officers.
                </p>
                <p className="text-[#8B9B8E]">
                  In challenging or remote terrain, supply replenishment is constantly affected by weather shifts, mountain corridor closures, and fluctuating troop consumption rates. VYOMIX consolidates multi-depot inventory, meteorological reports from the India Meteorological Department (IMD), fleet availability, and machine learning models into a unified interface to detect supply shortfalls before stock runs out.
                </p>
              </div>
            </TacticalCard>
          )}

          {/* 2. How to use (Quick Start 7 steps) */}
          {(activeSection === 'quickstart' || activeSection === 'all') && (
            <TacticalCard title="2. How to Use VYOMIX (Quick Start Guide)" subtitle="Standard operational workflow in 7 steps">
              <div className="space-y-3">
                {[
                  { step: 'STEP 1', title: 'Open Dashboard', desc: 'Log in to view the executive summary of all demonstration logistics zones.' },
                  { step: 'STEP 2', title: 'Review Supply Readiness and Alerts', desc: 'Scan the top KPI cards and active alert directives to identify immediate bottlenecks.' },
                  { step: 'STEP 3', title: 'Select a Location', desc: 'Use the global location dropdown to filter down to a specific zone (e.g., Srinagar or Kutch).' },
                  { step: 'STEP 4', title: 'Review Supplies and Weather', desc: 'Inspect current stock levels, daily burn rates, days of cover, and local precipitation advisories.' },
                  { step: 'STEP 5', title: 'Check Demand Forecast', desc: 'Open the Forecast tab to review 7 to 30-day consumption predictions and explainable risk factors.' },
                  { step: 'STEP 6', title: 'Run Scenario if Conditions Change', desc: 'Open the Simulator to test hypothetical demand surges, road delays, or weather shocks.' },
                  { step: 'STEP 7', title: 'Review Resulting Risk', desc: 'Inspect before-and-after comparisons and execute recommended logistics mitigations.' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-1">
                    <div className="flex items-center gap-2 text-[#B5A47A] font-bold text-xs">
                      <span className="px-1.5 py-0.5 bg-[#263F2B] text-white rounded-xs text-[10px]">{item.step}</span>
                      <span>{item.title}</span>
                    </div>
                    <p className="text-[#8B9B8E] text-[11px] leading-relaxed pl-7">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </TacticalCard>
          )}

          {/* 3. Dashboard Guide */}
          {(activeSection === 'dashboard' || activeSection === 'all') && (
            <TacticalCard title="3. Dashboard Guide" subtitle="Answering: What is happening? What may happen? What needs attention?">
              <div className="space-y-3 text-[#8B9B8E] leading-relaxed">
                <p>
                  The Dashboard is designed to deliver immediate clarity without information overload:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[#E7E9E2]">
                  <li><strong>What is happening:</strong> Top KPI indicators for Supply Readiness, Weather Risk, Transport Availability, and Active Alerts.</li>
                  <li><strong>What may happen:</strong> The central Predictive Alert panel highlighting projected supply depletions before they occur.</li>
                  <li><strong>What needs attention:</strong> Locations Requiring Attention ranking the most vulnerable zones with direct drill-down links.</li>
                  <li><strong>Interactive GIS Map:</strong> Leaflet geographic overview with status markers and click-to-inspect popups.</li>
                </ul>
              </div>
            </TacticalCard>
          )}

          {/* 4. Locations Guide */}
          {(activeSection === 'locations' || activeSection === 'all') && (
            <TacticalCard title="4. Locations Guide" subtitle="Monitoring demonstration zones">
              <div className="space-y-3 text-[#8B9B8E] leading-relaxed">
                <p>
                  The Locations module displays synthetic demonstration zones located in public geographic regions:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs">
                    <strong className="text-[#E7E9E2] block">Srinagar Logistics Zone</strong>
                    <span className="text-[11px]">High-altitude mountain transit corridor subject to rain and snow.</span>
                  </div>
                  <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs">
                    <strong className="text-[#E7E9E2] block">Jaisalmer Logistics Zone</strong>
                    <span className="text-[11px]">Arid desert supply depot with robust transport link availability.</span>
                  </div>
                  <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs">
                    <strong className="text-[#E7E9E2] block">Ahmedabad Logistics Base</strong>
                    <span className="text-[11px]">High-capacity central reserve depot with multi-modal link routes.</span>
                  </div>
                  <div className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs">
                    <strong className="text-[#E7E9E2] block">Kutch Logistics Zone</strong>
                    <span className="text-[11px]">Coastal perimeter zone with high demand for bulk purified water.</span>
                  </div>
                </div>
              </div>
            </TacticalCard>
          )}

          {/* 5. Supplies Guide */}
          {(activeSection === 'supplies' || activeSection === 'all') && (
            <TacticalCard title="5. Supplies Guide" subtitle="Managing essential supply categories">
              <div className="space-y-3 text-[#8B9B8E] leading-relaxed">
                <p>
                  Supplies monitors 5 critical commodities:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#E7E9E2]">
                  <li><strong>Fuel (POL):</strong> High-altitude diesel used for vehicle convoys and base heaters.</li>
                  <li><strong>Food:</strong> Special composite MRE (Meals Ready-to-Eat) combat rations.</li>
                  <li><strong>Medical:</strong> Tactical trauma kits, emergency frostbite remedies, and fluids.</li>
                  <li><strong>Water:</strong> Purified potable bulk water reserves.</li>
                  <li><strong>General Supplies:</strong> Extreme cold weather gear, batteries, and mechanical spares.</li>
                </ul>
              </div>
            </TacticalCard>
          )}

          {/* 6. Forecast Guide */}
          {(activeSection === 'forecast' || activeSection === 'all') && (
            <TacticalCard title="6. Demand Forecast Guide" subtitle="Machine learning prediction horizons">
              <div className="space-y-3 text-[#8B9B8E] leading-relaxed">
                <p>
                  The Forecast module projects forward consumption over 7, 14, or 30 days. It factors in:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#E7E9E2]">
                  <li>1-day and 7-day rolling historical consumption lags.</li>
                  <li>Troop strength deployed in the zone.</li>
                  <li>IMD weather telemetry (rainfall rate and freezing temperatures).</li>
                  <li>Transport corridor delay penalties.</li>
                </ul>
                <p>
                  The prediction chart renders an upper and lower confidence envelope. When connected to the Python backend, predictions are generated by a trained RandomForest Regressor; when offline, a clearly labeled baseline moving-average calculation is provided.
                </p>
              </div>
            </TacticalCard>
          )}

          {/* 7. Simulator Guide */}
          {(activeSection === 'simulator' || activeSection === 'all') && (
            <TacticalCard title="7. Scenario Simulator Guide" subtitle="Stress-testing supply chain resilience">
              <div className="space-y-3 text-[#8B9B8E] leading-relaxed">
                <p>
                  The Simulator allows officers to model hypothetical disruptions before they happen:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#E7E9E2]">
                  <li><strong>Demand Change:</strong> Test mobilization surges from -50% to +100%.</li>
                  <li><strong>Transport Availability:</strong> Simulate road transit deficits from -60% to +40%.</li>
                  <li><strong>Weather Severity:</strong> Model impact of Low, Moderate, High, or Critical weather.</li>
                  <li><strong>Depot Stock:</strong> Adjust starting reserve levels from 50% to 150%.</li>
                </ul>
                <p>
                  Clicking <strong>RUN SCENARIO</strong> recalculates days of cover across all 5 supply categories and generates tailored logistics recommendations.
                </p>
              </div>
            </TacticalCard>
          )}

          {/* 8. Alerts Guide */}
          {(activeSection === 'alerts' || activeSection === 'all') && (
            <TacticalCard title="8. Alerts Guide" subtitle="Prioritizing and resolving logistics directives">
              <div className="space-y-3 text-[#8B9B8E] leading-relaxed">
                <p>
                  Alerts are categorized by type:
                </p>
                <div className="space-y-2 pt-1 text-xs">
                  <div><strong className="text-[#f87171]">Predictive Shortage:</strong> Projected consumption will breach safety stock within 7 days.</div>
                  <div><strong className="text-[#fbbf24]">Weather:</strong> IMD rainfall, gale, or landslide warnings affecting transit corridors.</div>
                  <div><strong className="text-[#E7E9E2]">Inventory:</strong> On-hand reserves below mandatory emergency buffer.</div>
                  <div><strong className="text-[#4ade80]">Transport:</strong> Fleet asset availability reductions or maintenance delays.</div>
                </div>
              </div>
            </TacticalCard>
          )}

          {/* 9. Metric Definitions */}
          {(activeSection === 'metrics' || activeSection === 'all') && (
            <TacticalCard title="9. Metric Definitions Glossary" subtitle="Standardized terminology used across VYOMIX">
              <div className="space-y-3 font-mono text-xs">
                {[
                  { name: 'Supply Readiness', def: 'The percentage of essential supplies currently at or above mandated safety stock floors across a zone.' },
                  { name: 'Days of Cover', def: 'The number of days current on-hand stock will last at the present daily burn rate: (Current Stock ÷ Daily Burn).' },
                  { name: 'Demand Forecast', def: 'Expected cumulative quantity required across a specific forward horizon (7, 14, or 30 days).' },
                  { name: 'Forecast Confidence', def: 'Statistical certainty metric derived from historical prediction residuals and backtesting variance.' },
                  { name: 'Weather Risk', def: 'Composite index derived from IMD precipitation rate, wind gusts, temperature, and mountain pass vulnerability.' },
                  { name: 'Transport Availability', def: 'Percentage of the assigned logistical fleet currently operational and available for immediate sortie.' },
                  { name: 'Projected Shortage', def: 'Commodities predicted to deplete below emergency threshold if no top-up convoy is dispatched.' }
                ].map((m, idx) => (
                  <div key={idx} className="p-3 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-1">
                    <span className="text-[#B5A47A] font-bold text-xs uppercase block">{m.name}</span>
                    <p className="text-[#8B9B8E] text-[11px] leading-relaxed">{m.def}</p>
                  </div>
                ))}
              </div>
            </TacticalCard>
          )}

          {/* 10. Risk Level Definitions */}
          {(activeSection === 'risk' || activeSection === 'all') && (
            <TacticalCard title="10. Risk Level Definitions" subtitle="Operational risk classification thresholds">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-[#07100B] border border-[#3FA34D]/40 rounded-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#4ade80]">LOW RISK</span>
                    <StatusBadge status="LOW" size="sm" />
                  </div>
                  <p className="text-[#8B9B8E] text-[11px]">Days of Cover &gt; 12 days. Transport routes clear; normal replenishment cycle.</p>
                </div>

                <div className="p-3.5 bg-[#07100B] border border-[#D39B32]/40 rounded-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#fbbf24]">MODERATE RISK</span>
                    <StatusBadge status="MODERATE" size="sm" />
                  </div>
                  <p className="text-[#8B9B8E] text-[11px]">Days of Cover 8 to 12 days. Approaching reorder point; weather advisory in effect.</p>
                </div>

                <div className="p-3.5 bg-[#07100B] border border-[#D39B32]/60 rounded-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#f59e0b]">HIGH RISK</span>
                    <StatusBadge status="HIGH" size="sm" />
                  </div>
                  <p className="text-[#8B9B8E] text-[11px]">Days of Cover 4 to 8 days. Safety threshold breached; transport delays active.</p>
                </div>

                <div className="p-3.5 bg-[#07100B] border border-[#C43C3C]/50 rounded-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#f87171]">CRITICAL RISK</span>
                    <StatusBadge status="CRITICAL" size="sm" />
                  </div>
                  <p className="text-[#8B9B8E] text-[11px]">Days of Cover &lt; 4 days. Emergency resupply directive required immediately.</p>
                </div>
              </div>
            </TacticalCard>
          )}

          {/* 11. Data Sources & Integrations */}
          {(activeSection === 'datasources' || activeSection === 'all') && (
            <TacticalCard title="11. Data & Integrations" subtitle="External telemetry pipelines and truthfulness audit">
              <div className="space-y-4">
                <p className="text-[#8B9B8E]">
                  VYOMIX connects to verified government and spatial data providers. If an external service is unavailable, data is truthfully marked without false claims:
                </p>

                <div className="space-y-3">
                  {DEMO_DATA_SOURCES.map((src) => (
                    <div key={src.id} className="p-3.5 bg-[#07100B] border border-[#1A2C1E] rounded-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-[#E7E9E2] text-xs">{src.name}</strong>
                          <span className="text-[10px] text-[#B5A47A] block">{src.source_type}</span>
                        </div>
                        <StatusBadge status={src.status} size="sm" />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-[#8B9B8E] pt-1 border-t border-[#1A2C1E]">
                        <div>Purpose: <strong className="text-[#E7E9E2]">{src.purpose}</strong></div>
                        <div>Last Sync: <strong className="text-[#E7E9E2]">{src.last_sync_at}</strong></div>
                        <div>Latency: <strong className="text-[#4ade80]">{src.latency_ms} ms</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TacticalCard>
          )}

          {/* 12. About & Disclaimer */}
          {(activeSection === 'disclaimer' || activeSection === 'all') && (
            <TacticalCard title="12. About VYOMIX & Public Data Disclaimer" subtitle="Operational boundaries and terms of demonstration">
              <div className="space-y-4 text-[#8B9B8E] leading-relaxed">
                <div className="p-4 bg-[#07100B] border border-[#B5A47A]/30 rounded-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#B5A47A] font-semibold text-xs">
                    <Info className="w-4 h-4 text-[#3FA34D]" />
                    <span>MANDATORY PUBLIC DATA DISCLAIMER</span>
                  </div>
                  <p className="text-[#E7E9E2] text-xs">
                    "{PUBLIC_DATA_DISCLAIMER}"
                  </p>
                </div>

                <p>
                  <strong>VYOMIX</strong> is built as an independent, enterprise-grade predictive logistics intelligence system. It demonstrates the technical feasibility of cross-correlating open meteorological APIs (India Meteorological Department), relational database state stores (Supabase), and machine learning models for supply-chain resilience.
                </p>
                <div className="text-[11px] pt-2 border-t border-[#1A2C1E] flex justify-between">
                  <span>Version: 1.0.0 Production</span>
                  <span className="text-[#B5A47A]">VYOMIX Logistics Intelligence</span>
                </div>
              </div>
            </TacticalCard>
          )}
        </div>
      </div>
    </div>
  );
};
