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
    ? 'bg-[#3FA34D]'
    : isDemo
    ? 'bg-[#B5A47A]'
    : 'bg-[#D39B32]';

  const badgeBg = isLive
    ? 'bg-[rgba(63,163,77,0.1)] border-[#3FA34D]/40 text-[#4ade80]'
    : isDemo
    ? 'bg-[rgba(181,164,122,0.1)] border-[#B5A47A]/30 text-[#D6C8A4]'
    : 'bg-[rgba(211,155,50,0.12)] border-[#D39B32]/40 text-[#fbbf24]';

  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 font-mono ${className}`}>
      <span className={`inline-flex items-center gap-1.5 rounded-xs border font-medium uppercase tracking-wider ${badgeBg} ${pad}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isLive ? 'animate-pulse' : ''}`} />
        <span>{mode}</span>
      </span>

      {source && (
        <span className="text-[11px] text-[#8B9B8E]">
          Source: <strong className="text-[#E7E9E2]">{source}</strong>
        </span>
      )}

      {updated && (
        <span className="text-[11px] text-[#8B9B8E] hidden sm:inline">
          • Updated: {updated}
        </span>
      )}

      {message && (
        <span className="text-[11px] text-[#8B9B8E]">
          ({message})
        </span>
      )}

      {onRetry && isOffline && (
        <button
          onClick={onRetry}
          className="text-[10px] text-[#B5A47A] hover:underline uppercase tracking-wider ml-1"
        >
          [RETRY]
        </button>
      )}
    </div>
  );
};
