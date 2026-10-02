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
    green: 'tactical-glow-green border-[#3FA34D]/40',
    amber: 'tactical-glow-amber border-[#D39B32]/40',
    red: 'tactical-glow-red border-[#C43C3C]/40',
  };

  return (
    <div
      className={`tactical-border rounded-sm transition-all duration-200 bg-[#101B13] border border-[#263F2B] p-5 shadow-lg ${glowMap[glow]} ${className}`}
    >
      {(title || headerAction || badge) && (
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#1A2C1E]">
          <div>
            {title && (
              <h3 className="font-tactical font-semibold tracking-wider text-[#E7E9E2] text-sm uppercase flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#B5A47A] inline-block rounded-xs"></span>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="font-mono text-[11px] text-[#8B9B8E] mt-0.5 tracking-tight">
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
