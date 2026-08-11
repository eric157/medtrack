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
        <linearGradient id="logo-bg" x1="96" y1="32" x2="416" y2="480" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5EEAD4" />
          <stop offset="0.35" stopColor="#14B8A6" />
          <stop offset="1" stopColor="#065F46" />
        </linearGradient>
        <radialGradient id="logo-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 140) rotate(90) scale(180 220)">
          <stop stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="logo-pill-body" x1="160" y1="256" x2="352" y2="256" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F0FDFA" />
        </linearGradient>
        <linearGradient id="logo-pill-taken" x1="160" y1="256" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop stopColor="#99F6E4" />
          <stop offset="1" stopColor="#ECFDF5" />
        </linearGradient>
        <filter id="logo-pill-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#042F2E" floodOpacity="0.35" />
        </filter>
        <filter id="logo-badge-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#042F2E" floodOpacity="0.25" />
        </filter>
        <clipPath id="logo-pill-left-clip">
          <rect x="136" y="200" width="120" height="112" />
        </clipPath>
      </defs>

      <rect width="512" height="512" rx="118" fill="url(#logo-bg)" />
      <rect width="512" height="512" rx="118" fill="url(#logo-glow)" />

      <g filter="url(#logo-pill-shadow)" transform="translate(256 256) rotate(-10) translate(-256 -256)">
        <rect x="136" y="200" width="240" height="112" rx="56" fill="url(#logo-pill-body)" />
        <rect x="136" y="200" width="240" height="112" rx="56" fill="url(#logo-pill-taken)" clipPath="url(#logo-pill-left-clip)" />
        <rect x="136" y="200" width="240" height="112" rx="56" stroke="#FFFFFF" strokeWidth="7" fill="none" />
        <line x1="256" y1="212" x2="256" y2="300" stroke="#5EEAD4" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <path
          d="M176 256L206 286L240 226"
          stroke="#0F766E"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <g filter="url(#logo-badge-shadow)">
        <circle cx="372" cy="360" r="54" fill="#FFFFFF" />
        <path
          d="M346 360L364 378L398 342"
          stroke="#0D9488"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function Logo({ size = 'md', showWordmark = true, className = '' }: LogoProps) {
  const config = sizeMap[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div
        className={`${config.box} rounded-[22%] overflow-hidden shadow-lg shadow-teal-600/30 shrink-0`}
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
