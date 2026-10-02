import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  pulse = false,
}) => {
  const norm = (status || '').toUpperCase();

  let bg = 'bg-[#1A2C1E]';
  let text = 'text-[#8B9B8E]';
  let border = 'border-[#263F2B]';
  let dot = 'bg-[#8B9B8E]';

  if (norm === 'LOW' || norm === 'OPERATIONAL' || norm === 'CONNECTED' || norm === 'GREEN' || norm === 'AVAILABLE' || norm === 'RESOLVED') {
    bg = 'bg-[rgba(63,163,77,0.12)]';
    text = 'text-[#4ade80]';
    border = 'border-[#3fa34d]/40';
    dot = 'bg-[#3fa34d]';
  } else if (norm === 'MODERATE' || norm === 'ATTENTION' || norm === 'YELLOW' || norm === 'ACKNOWLEDGED' || norm === 'IN_TRANSIT' || norm === 'MEDIUM') {
    bg = 'bg-[rgba(211,155,50,0.12)]';
    text = 'text-[#fbbf24]';
    border = 'border-[#d39b32]/40';
    dot = 'bg-[#d39b32]';
  } else if (norm === 'HIGH' || norm === 'ORANGE' || norm === 'MAINTENANCE') {
    bg = 'bg-[rgba(211,155,50,0.2)]';
    text = 'text-[#f59e0b]';
    border = 'border-[#d39b32]/60';
    dot = 'bg-[#f59e0b]';
  } else if (norm === 'CRITICAL' || norm === 'RED' || norm === 'UNAVAILABLE' || norm === 'OFFLINE') {
    bg = 'bg-[rgba(196,60,60,0.18)]';
    text = 'text-[#f87171]';
    border = 'border-[#c43c3c]/60';
    dot = 'bg-[#c43c3c]';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-wider uppercase rounded-sm border ${bg} ${text} ${border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${pulse ? 'animate-ping' : ''}`} />
      <span>{status}</span>
    </span>
  );
};
