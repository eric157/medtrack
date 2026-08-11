import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { box: 'w-8 h-8', icon: 32, text: 'text-lg' },
  md: { box: 'w-10 h-10', icon: 40, text: 'text-xl' },
  lg: { box: 'w-16 h-16', icon: 64, text: 'text-3xl' },
};

export function LogoIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-primaryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="512" height="512" rx="110" fill="url(#logo-primaryGradient)" />
      <circle cx="256" cy="256" r="140" stroke="#FFFFFF" strokeWidth="32" fill="none" />
      <polyline
        points="180,256 230,306 332,190"
        stroke="#FFFFFF"
        strokeWidth="40"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({ size = 'md', showWordmark = true, className = '' }: LogoProps) {
  const config = sizeMap[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${config.box} rounded-[22%] overflow-hidden shrink-0`}>
        <LogoIcon size={config.icon} />
      </div>
      {showWordmark && (
        <div>
          <span className={`font-extrabold ${config.text} tracking-tight text-slate-900 dark:text-white`}>
            MedTrack
          </span>
          {size !== 'sm' && (
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
              PWA
            </span>
          )}
        </div>
      )}
    </div>
  );
}
