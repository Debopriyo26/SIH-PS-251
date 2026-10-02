import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  deltaPositive?: boolean;
  statusText?: string;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'critical' | 'success';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  unit = '',
  delta,
  deltaPositive = true,
  statusText,
  icon: Icon,
  variant = 'default',
}) => {
  const variantStyles = {
    default: {
      border: 'border-[#263F2B]',
      iconBg: 'bg-[#1A2C1E]',
      iconColor: 'text-[#B5A47A]',
      valColor: 'text-[#E7E9E2]',
    },
    success: {
      border: 'border-[#3FA34D]/40',
      iconBg: 'bg-[rgba(63,163,77,0.15)]',
      iconColor: 'text-[#4ade80]',
      valColor: 'text-[#4ade80]',
    },
    warning: {
      border: 'border-[#D39B32]/40',
      iconBg: 'bg-[rgba(211,155,50,0.15)]',
      iconColor: 'text-[#fbbf24]',
      valColor: 'text-[#fbbf24]',
    },
    critical: {
      border: 'border-[#C43C3C]/50',
      iconBg: 'bg-[rgba(196,60,60,0.2)]',
      iconColor: 'text-[#f87171]',
      valColor: 'text-[#f87171]',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`tactical-border bg-[#101B13] border ${style.border} p-4 rounded-sm transition-all duration-200 hover:border-[#596B3A] shadow-md`}
    >
      <div className="flex items-center justify-between">
        <span className="font-tactical text-xs uppercase tracking-wider text-[#8B9B8E] font-medium">
          {label}
        </span>
        <div className={`p-2 rounded-xs ${style.iconBg} ${style.iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className={`font-mono text-3xl font-bold tracking-tight ${style.valColor}`}>
          {value}
        </span>
        {unit && <span className="font-mono text-xs text-[#8B9B8E]">{unit}</span>}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] font-mono border-t border-[#1A2C1E] pt-2">
        {statusText && <span className="text-[#8B9B8E]">{statusText}</span>}
        {delta && (
          <span className={`font-medium ${deltaPositive ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
};
