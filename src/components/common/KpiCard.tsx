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
      border: 'border-[#D8DFD5]',
      accentBar: 'bg-[#355E3B]',
      iconBg: 'bg-[#E8EEE5]',
      iconColor: 'text-[#355E3B]',
      valColor: 'text-[#1F2933]',
    },
    success: {
      border: 'border-[#A5D6A7]',
      accentBar: 'bg-[#2F6B3C]',
      iconBg: 'bg-[#E8F5E9]',
      iconColor: 'text-[#2F6B3C]',
      valColor: 'text-[#2F6B3C]',
    },
    warning: {
      border: 'border-[#FDE047]',
      accentBar: 'bg-[#A16207]',
      iconBg: 'bg-[#FEF08A]',
      iconColor: 'text-[#A16207]',
      valColor: 'text-[#A16207]',
    },
    critical: {
      border: 'border-[#FDA29B]',
      accentBar: 'bg-[#B42318]',
      iconBg: 'bg-[#FEE4E2]',
      iconColor: 'text-[#B42318]',
      valColor: 'text-[#B42318]',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`relative bg-white border ${style.border} p-4 rounded-sm transition-all duration-200 hover:border-[#6B7444] shadow-xs flex flex-col justify-between overflow-hidden`}
    >
      {/* Small Army Green Top Accent Bar (Requirement 17) */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${style.accentBar}`} />

      <div className="flex items-center justify-between">
        <span className="font-tactical text-xs uppercase tracking-wider text-[#52606D] font-semibold">
          {label}
        </span>
        <div className={`p-2 rounded-xs ${style.iconBg} ${style.iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className={`font-mono text-3xl font-bold tracking-tight ${style.valColor}`}>
          {value}
        </span>
        {unit && <span className="font-mono text-xs text-[#52606D] font-medium">{unit}</span>}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono border-t border-[#F0F4EE] pt-2">
        {statusText && <span className="text-[#52606D] truncate">{statusText}</span>}
        {delta && (
          <span className={`font-semibold shrink-0 ${deltaPositive ? 'text-[#2F6B3C]' : 'text-[#B42318]'}`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
};
