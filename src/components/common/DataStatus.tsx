import React from 'react';
import { DataMode } from '../../types';

interface DataStatusProps {
  mode: DataMode;
  source?: string;
  updated?: string;
  message?: string;
  size?: 'sm' | 'md';
  onRetry?: () => void;
  className?: string;
}

export const DataStatus: React.FC<DataStatusProps> = ({
  mode,
  source,
  updated,
  message,
  size = 'md',
  onRetry,
  className = '',
}) => {
  const isLive = mode === 'LIVE';
  const isDemo = mode === 'DEMO';
  const isOffline = mode === 'OFFLINE';

  const dotColor = isLive
    ? 'bg-[#2F6B3C]'
    : isDemo
    ? 'bg-[#B5A36A]'
    : 'bg-[#B42318]';

  const badgeBg = isLive
    ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#2F6B3C]'
    : isDemo
    ? 'bg-[#F0F4EE] border-[#CAD3C8] text-[#6B7444]'
    : 'bg-[#FEE4E2] border-[#FDA29B] text-[#B42318]';

  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 font-mono ${className}`}>
      <span className={`inline-flex items-center gap-1.5 rounded-xs border font-bold uppercase tracking-wider ${badgeBg} ${pad}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isLive ? 'animate-pulse' : ''}`} />
        <span>{mode}</span>
      </span>

      {source && (
        <span className="text-[11px] text-[#52606D]">
          Source: <strong className="text-[#1F2933]">{source}</strong>
        </span>
      )}

      {updated && (
        <span className="text-[11px] text-[#52606D] hidden sm:inline">
          • Updated: <strong className="text-[#1F2933]">{updated}</strong>
        </span>
      )}

      {message && (
        <span className="text-[11px] text-[#52606D]">
          ({message})
        </span>
      )}

      {onRetry && isOffline && (
        <button
          onClick={onRetry}
          className="text-[10px] text-[#B42318] hover:underline font-bold uppercase tracking-wider ml-1 cursor-pointer"
        >
          [RETRY]
        </button>
      )}
    </div>
  );
};
