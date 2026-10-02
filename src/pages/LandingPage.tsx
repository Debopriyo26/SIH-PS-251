import React from 'react';
import { Shield, ArrowRight, CheckCircle2, TrendingUp, Boxes, Sliders, MapPin } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { NavTab } from '../components/layout/Header';

interface LandingPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-between bg-[#07100B]">
      {/* Background subtle tactical grid */}
      <div className="absolute inset-0 bg-tactical-grid opacity-30 pointer-events-none" />

      {/* Main Content Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 flex-1 flex flex-col justify-center">
        {/* Category tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#101B13] border border-[#263F2B] text-xs font-mono text-[#B5A47A] mb-8 w-fit">
          <Shield className="w-3.5 h-3.5 text-[#3FA34D]" />
          <span>FORWARD SUPPLY CHAIN INTELLIGENCE</span>
        </div>

        {/* Product Brand Header */}
        <div className="space-y-4 mb-6">
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

        {/* Clean Product Description matching requirement 4 */}
        <p className="max-w-2xl text-base md:text-lg text-[#8B9B8E] leading-relaxed mb-10 font-sans">
          An intelligent logistics platform that combines inventory, weather, transportation and demand data to identify potential supply risks before they become critical.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 mb-16">
          <button
            onClick={() => onNavigate('login')}
            className="px-8 py-3.5 bg-[#263F2B] hover:bg-[#325338] text-[#E7E9E2] border border-[#596B3A] hover:border-[#B5A47A] rounded-xs font-tactical font-bold text-xs tracking-widest uppercase flex items-center gap-3 transition-colors shadow-lg cursor-pointer"
          >
            <span>SIGN IN</span>
            <ArrowRight className="w-4 h-4 text-[#B5A47A]" />
          </button>

          <button
            onClick={() => onNavigate('signup')}
            className="px-8 py-3.5 bg-[#101B13] hover:bg-[#1A2C1E] text-[#E7E9E2] border border-[#263F2B] hover:border-[#596B3A] rounded-xs font-tactical font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
          >
            <span>CREATE ACCOUNT</span>
          </button>
        </div>

        {/* 3 Core Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-[#1A2C1E]">
          <div className="p-5 bg-[#101B13] border border-[#263F2B] rounded-xs space-y-2">
            <div className="flex items-center gap-2 font-tactical font-semibold text-sm text-[#E7E9E2] uppercase">
              <Boxes className="w-4 h-4 text-[#B5A47A]" />
              <span>Multi-Depot Inventory</span>
            </div>
            <p className="font-mono text-xs text-[#8B9B8E] leading-relaxed">
              Real-time monitoring of fuel, medical, rations, and potable water reserves calculated against mandatory mission safety floors.
            </p>
          </div>

          <div className="p-5 bg-[#101B13] border border-[#263F2B] rounded-xs space-y-2">
            <div className="flex items-center gap-2 font-tactical font-semibold text-sm text-[#E7E9E2] uppercase">
              <TrendingUp className="w-4 h-4 text-[#4ade80]" />
              <span>Predictive Demand ML</span>
            </div>
            <p className="font-mono text-xs text-[#8B9B8E] leading-relaxed">
              Machine learning models cross-correlating historical burn rate lags, troop strength, and IMD precipitation telemetry.
            </p>
          </div>

          <div className="p-5 bg-[#101B13] border border-[#263F2B] rounded-xs space-y-2">
            <div className="flex items-center gap-2 font-tactical font-semibold text-sm text-[#E7E9E2] uppercase">
              <Sliders className="w-4 h-4 text-[#3E92CC]" />
              <span>Scenario Simulator</span>
            </div>
            <p className="font-mono text-xs text-[#8B9B8E] leading-relaxed">
              Stress-test supply chain viability under hypothetical weather shocks, transport corridor disruptions, and consumption surges.
            </p>
          </div>
        </div>
      </div>

      {/* Clean Footer */}
      <footer className="bg-[#101B13] border-t border-[#263F2B] py-4 px-6 text-xs font-mono text-[#8B9B8E] flex flex-wrap items-center justify-between gap-4">
        <div>
          VYOMIX — Predictive Logistics Intelligence
        </div>
        <div className="text-[11px] text-[#8B9B8E]">
          Synthetic demonstration data for public logistics planning
        </div>
      </footer>
    </div>
  );
};
