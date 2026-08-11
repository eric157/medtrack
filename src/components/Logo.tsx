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
        <linearGradient id="logo-bg" x1="64" y1="48" x2="448" y2="464" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop stopColor="#0D9488" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="logo-pill" x1="144" y1="256" x2="368" y2="256" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#ECFDF5" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#logo-bg)" />
      <rect x="128" y="208" width="256" height="96" rx="48" fill="url(#logo-pill)" />
      <rect x="248" y="208" width="16" height="96" fill="#D1FAE5" />
      <path
        d="M196 256L228 288L316 200"
        stroke="#059669"
        strokeWidth="28"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="384" cy="128" r="36" fill="#F59E0B" />
      <circle cx="384" cy="128" r="18" fill="#FDE68A" />
    </svg>
  );
}

export function Logo({ size = 'md', showWordmark = true, className = '' }: LogoProps) {
  const config = sizeMap[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div
        className={`${config.box} rounded-xl overflow-hidden shadow-md shadow-emerald-500/20 shrink-0`}
      >
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
