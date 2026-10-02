import React from 'react';
import { 
  Shield, 
  Terminal, 
  ArrowRight, 
  Activity, 
  Radio, 
  Cpu, 
  TrendingUp, 
  Boxes, 
  Sliders, 
  MapPin, 
  CheckCircle2, 
  Database,
  CloudRain
} from 'lucide-react';
import { Logo } from '../components/common/Logo';

interface LandingPageProps {
  onEnter: () => void;
  onViewArchitecture: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onViewArchitecture }) => {
  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-between overflow-hidden bg-[#07100B]">
      {/* Background Tactical Radar & Grid */}
      <div className="absolute inset-0 bg-tactical-grid opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[#263F2B]/30 pointer-events-none">
        <div className="w-full h-full rounded-full border border-[#596B3A]/20 scale-75"></div>
        <div className="w-full h-full rounded-full border border-[#B5A47A]/10 scale-50"></div>
        {/* Radar beam effect */}
        <div className="absolute inset-0 rounded-full bg-radar-conic animate-radar-sweep pointer-events-none opacity-30" />
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-12 flex-1 flex flex-col justify-center">
        {/* Military Command Center Inscription */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#101B13] border border-[#263F2B] text-xs font-mono text-[#B5A47A] mb-8 w-fit shadow-md">
          <Shield className="w-3.5 h-3.5 text-[#3FA34D]" />
          <span>INDIAN ARMY — PREDICTIVE LOGISTICS MANAGEMENT PLATFORM (SIH2625)</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-4">
            <Logo size="xl" showText={false} />
            <h1 className="font-tactical font-black text-5xl md:text-7xl lg:text-8xl tracking-wider text-[#E7E9E2]">
              VYOMIX
            </h1>
          </div>
          <h2 className="font-tactical text-2xl md:text-3xl font-semibold tracking-wide text-[#B5A47A] uppercase">
            Predictive Logistics Intelligence
          </h2>
          <p className="font-mono text-sm md:text-base text-[#4ade80] tracking-wider uppercase font-medium">
            "Predict. Prepare. Deliver."
          </p>
        </div>

        {/* Platform Purpose Statement */}
        <p className="max-w-2xl text-base md:text-lg text-[#8B9B8E] leading-relaxed mb-10 font-sans">
          An AI-powered logistics intelligence platform for forecasting forward supply requirements, 
          monitoring high-altitude inventory risk, ingesting live IMD meteorological telemetry, 
          and executing real-time supply disruption simulations.
        </p>

        {/* Interactive Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 mb-14">
          <button
            onClick={onEnter}
            className="px-7 py-4 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] hover:border-[#B5A47A] rounded-xs font-tactical font-bold text-sm tracking-widest uppercase flex items-center gap-3 transition-all duration-200 shadow-xl group cursor-pointer"
          >
            <span>ENTER COMMAND CENTER</span>
            <ArrowRight className="w-4 h-4 text-[#B5A47A] group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onViewArchitecture}
            className="px-6 py-4 bg-[#101B13] hover:bg-[#1A2C1E] text-[#8B9B8E] hover:text-[#E7E9E2] border border-[#263F2B] rounded-xs font-tactical font-semibold text-sm tracking-wider uppercase transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Database className="w-4 h-4 text-[#596B3A]" />
            <span>VIEW SYSTEM ARCHITECTURE</span>
          </button>
        </div>

        {/* Tactical Readiness Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl pt-8 border-t border-[#1A2C1E]">
          <div className="tactical-border bg-[#101B13] border border-[#263F2B] p-3.5 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3FA34D] animate-pulse"></div>
            <div>
              <div className="font-tactical text-xs font-semibold text-[#E7E9E2] uppercase">
                SYSTEM STATUS
              </div>
              <div className="font-mono text-xs text-[#4ade80]">
                OPERATIONAL
              </div>
            </div>
          </div>

          <div className="tactical-border bg-[#101B13] border border-[#263F2B] p-3.5 flex items-center gap-3">
            <Radio className="w-4 h-4 text-[#B5A47A]" />
            <div>
              <div className="font-tactical text-xs font-semibold text-[#E7E9E2] uppercase">
                DATA PIPELINES
              </div>
              <div className="font-mono text-xs text-[#E7E9E2]">
                IMD & SUPABASE ACTIVE
              </div>
            </div>
          </div>

          <div className="tactical-border bg-[#101B13] border border-[#263F2B] p-3.5 flex items-center gap-3">
            <Cpu className="w-4 h-4 text-[#596B3A]" />
            <div>
              <div className="font-tactical text-xs font-semibold text-[#E7E9E2] uppercase">
                AI ENGINE
              </div>
              <div className="font-mono text-xs text-[#E7E9E2]">
                PREDICTIVE SHORTAGE ONLINE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="relative z-10 bg-[#101B13] border-t border-[#263F2B] py-4 px-6 text-xs font-mono text-[#8B9B8E] flex flex-wrap items-center justify-between gap-4">
        <div>
          VYOMIX DEFENSE INTELLIGENCE PLATFORM • SIH PROBLEM STATEMENT: SIH2625
        </div>
        <div className="flex items-center gap-4 text-[#B5A47A]">
          <span>RESTRICTED LOGISTICS DEMO</span>
          <span>•</span>
          <span>NON-CLASSIFIED SYNTHETIC DATASET</span>
        </div>
      </div>
    </div>
  );
};
