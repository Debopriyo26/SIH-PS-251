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

  let bg = 'bg-[#F0F4EE]';
  let text = 'text-[#52606D]';
  let border = 'border-[#D8DFD5]';
  let dot = 'bg-[#6B7444]';

  if (norm === 'LOW' || norm === 'OPERATIONAL' || norm === 'CONNECTED' || norm === 'GREEN' || norm === 'AVAILABLE' || norm === 'RESOLVED') {
    bg = 'bg-[#E8F5E9]';
    text = 'text-[#2F6B3C]';
    border = 'border-[#A5D6A7]';
    dot = 'bg-[#2F6B3C]';
  } else if (norm === 'MODERATE' || norm === 'ATTENTION' || norm === 'YELLOW' || norm === 'ACKNOWLEDGED' || norm === 'IN_TRANSIT' || norm === 'MEDIUM') {
    bg = 'bg-[#FEF08A]/70';
    text = 'text-[#A16207]';
    border = 'border-[#FDE047]';
    dot = 'bg-[#A16207]';
  } else if (norm === 'HIGH' || norm === 'ORANGE' || norm === 'MAINTENANCE') {
    bg = 'bg-[#FFEDD5]';
    text = 'text-[#C2410C]';
    border = 'border-[#FDBA74]';
    dot = 'bg-[#C2410C]';
  } else if (norm === 'CRITICAL' || norm === 'RED' || norm === 'UNAVAILABLE' || norm === 'OFFLINE') {
    bg = 'bg-[#FEE4E2]';
    text = 'text-[#B42318]';
    border = 'border-[#FDA29B]';
    dot = 'bg-[#B42318]';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wider uppercase rounded-xs border ${bg} ${text} ${border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${pulse ? 'animate-ping' : ''}`} />
      <span>{status}</span>
    </span>
  );
};
