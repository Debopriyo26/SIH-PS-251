import React from 'react';
import { Shield, ArrowRight, Boxes, TrendingUp, CloudSun } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { NavTab } from '../components/layout/Header';

interface LandingPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-between bg-[#F7F8F4]">
      {/* Background subtle tactical grid */}
      <div className="absolute inset-0 bg-tactical-grid opacity-60 pointer-events-none" />

      {/* Main Content Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-14 flex-1 flex flex-col justify-center">
        {/* Category tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xs bg-white border border-[#D8DFD5] text-xs font-mono text-[#355E3B] font-semibold mb-8 w-fit shadow-xs">
          <Shield className="w-3.5 h-3.5 text-[#2F6B3C]" />
          <span>FORWARD SUPPLY CHAIN INTELLIGENCE</span>
        </div>

        {/* Product Brand Header */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <Logo size="xl" showText={false} />
            <h1 className="font-tactical font-black text-5xl md:text-7xl lg:text-8xl tracking-wider text-[#1F2933]">
              VYOMIX
            </h1>
          </div>
          <h2 className="font-tactical text-2xl md:text-3xl font-bold tracking-wide text-[#355E3B] uppercase">
            Predictive Logistics Intelligence
          </h2>
          <p className="font-mono text-sm md:text-base text-[#2F6B3C] tracking-wider uppercase font-semibold">
            "Predict. Prepare. Deliver."
          </p>
        </div>

        {/* Clean Product Description */}
        <p className="max-w-2xl text-base md:text-lg text-[#52606D] leading-relaxed mb-10 font-sans">
          An intelligent logistics platform that combines inventory, weather, transportation and demand data to identify potential supply risks before they become critical.
        </p>

        {/* Primary Action Buttons (Requirement 12) */}
        <div className="flex flex-wrap items-center gap-4 mb-16">
          <button
            onClick={() => onNavigate('login')}
            className="px-8 py-3.5 bg-[#355E3B] hover:bg-[#1F3D27] text-white border border-[#1F3D27] rounded-xs font-tactical font-bold text-xs tracking-widest uppercase flex items-center gap-3 transition-colors shadow-sm cursor-pointer"
          >
            <span>SIGN IN</span>
            <ArrowRight className="w-4 h-4 text-[#B5A47A]" />
          </button>

          <button
            onClick={() => onNavigate('signup')}
            className="px-8 py-3.5 bg-white hover:bg-[#F0F4EE] text-[#1F2933] border border-[#355E3B] hover:border-[#1F3D27] rounded-xs font-tactical font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer shadow-xs"
          >
            <span>CREATE ACCOUNT</span>
          </button>
        </div>

        {/* 3 Core Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-[#D8DFD5]">
          <div className="p-5 bg-white border border-[#D8DFD5] rounded-xs space-y-2 shadow-xs">
            <div className="flex items-center gap-2 font-tactical font-bold text-sm text-[#1F2933] uppercase">
              <Boxes className="w-4 h-4 text-[#355E3B]" />
              <span>Multi-Depot Inventory</span>
            </div>
            <p className="font-mono text-xs text-[#52606D] leading-relaxed">
              Real-time monitoring of fuel, medical, rations, and potable water reserves calculated against mandatory mission safety floors.
            </p>
          </div>

          <div className="p-5 bg-white border border-[#D8DFD5] rounded-xs space-y-2 shadow-xs">
            <div className="flex items-center gap-2 font-tactical font-bold text-sm text-[#1F2933] uppercase">
              <TrendingUp className="w-4 h-4 text-[#2F6B3C]" />
              <span>Predictive Demand ML</span>
            </div>
            <p className="font-mono text-xs text-[#52606D] leading-relaxed">
              Machine learning models cross-correlating historical burn rate lags, troop strength, and IMD precipitation telemetry.
            </p>
          </div>

          <div className="p-5 bg-white border border-[#D8DFD5] rounded-xs space-y-2 shadow-xs">
            <div className="flex items-center gap-2 font-tactical font-bold text-sm text-[#1F2933] uppercase">
              <CloudSun className="w-4 h-4 text-[#6B7444]" />
              <span>Tactical Weather Forecasting</span>
            </div>
            <p className="font-mono text-xs text-[#52606D] leading-relaxed">
              Real-time IMD meteorological surveillance, corridor pass transit advisories, and 7-day predictive logistics impacts.
            </p>
          </div>
        </div>
      </div>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-[#D8DFD5] py-4 px-6 text-xs font-mono text-[#52606D] flex flex-wrap items-center justify-between gap-4">
        <div className="font-semibold text-[#1F2933]">
          VYOMIX — Predictive Logistics Intelligence
        </div>
        <div className="text-[11px] text-[#52606D]">
          Synthetic demonstration data for public logistics planning
        </div>
      </footer>
    </div>
  );
};
