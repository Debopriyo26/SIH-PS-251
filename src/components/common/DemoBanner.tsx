import React from 'react';
import { ShieldAlert, Database, Radio } from 'lucide-react';

interface DemoBannerProps {
  className?: string;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ className = '' }) => {
  return (
    <div
      className={`bg-[#101B13] border-b border-[#263F2B] px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-mono select-none ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[#B5A47A] font-semibold tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5 text-[#D39B32] animate-pulse" />
          <span>DEMONSTRATION MODE</span>
        </div>
        <span className="text-[#8B9B8E] hidden sm:inline">•</span>
        <span className="text-[#8B9B8E] hidden sm:inline">
          Synthetic Forward Supply Chain Data (SIH Problem Statement: SIH2625)
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-[#8B9B8E]">
        <div className="flex items-center gap-1.5">
          <Database className="w-3 h-3 text-[#3FA34D]" />
          <span>STATE ENGINE: ONLINE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-[#3FA34D] animate-pulse" />
          <span>IMD TELEMETRY: ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
