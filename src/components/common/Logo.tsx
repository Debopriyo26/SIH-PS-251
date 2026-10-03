import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showTagline = false,
}) => {
  const sizeMap = {
    sm: { box: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { box: 36, text: 'text-xl', sub: 'text-[10px]' },
    lg: { box: 48, text: 'text-2xl', sub: 'text-xs' },
    xl: { box: 64, text: 'text-3xl', sub: 'text-sm' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Tactical Insignia Shield */}
      <div className="relative flex items-center justify-center">
        <svg
          width={current.box}
          height={current.box}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          {/* Outer Tactical Hexagonal Shield */}
          <polygon
            points="50,6 88,24 88,68 50,94 12,68 12,24"
            stroke="#355E3B"
            strokeWidth="3.5"
            fill="#FFFFFF"
          />
          {/* Inner Inset Boundary */}
          <polygon
            points="50,15 80,30 80,63 50,85 20,63 20,30"
            stroke="#1F3D27"
            strokeWidth="2"
            fill="#E8EEE5"
          />
          {/* Abstract V / Y Intersection In Gold/Khaki */}
          <path
            d="M30 32 L50 63 L50 78"
            stroke="#B5A36A"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M70 32 L50 63"
            stroke="#B5A36A"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M50 20 L50 42"
            stroke="#355E3B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Center Target Point */}
          <circle cx="50" cy="49" r="3.5" fill="#355E3B" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-tactical font-black tracking-widest text-[#1F2933] ${current.text}`}>
              VYOMIX
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#355E3B] animate-pulse"></span>
          </div>
          {showTagline && (
            <span className={`font-mono text-[#52606D] font-semibold tracking-wider uppercase mt-0.5 ${current.sub}`}>
              Predict. Prepare. Deliver.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
