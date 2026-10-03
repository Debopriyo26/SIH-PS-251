import React from 'react';

interface TacticalCardProps {
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  glow?: 'none' | 'green' | 'amber' | 'red';
}

export const TacticalCard: React.FC<TacticalCardProps> = ({
  title,
  subtitle,
  badge,
  headerAction,
  children,
  className = '',
  glow = 'none',
}) => {
  const glowMap = {
    none: '',
    green: 'border-l-4 border-l-[#2F6B3C]',
    amber: 'border-l-4 border-l-[#A16207]',
    red: 'border-l-4 border-l-[#B42318]',
  };

  return (
    <div
      className={`bg-white border border-[#D8DFD5] rounded-xs p-5 shadow-xs transition-all duration-200 hover:border-[#6B7444] ${glowMap[glow]} ${className}`}
    >
      {(title || headerAction || badge) && (
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#F0F4EE]">
          <div>
            {title && (
              <h3 className="font-tactical font-bold tracking-wider text-[#1F2933] text-sm uppercase flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#355E3B] inline-block rounded-xs"></span>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="font-mono text-[11px] text-[#52606D] mt-0.5 tracking-tight">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {badge}
            {headerAction}
          </div>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
