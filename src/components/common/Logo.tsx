import React from 'react';

export interface LogoProps {
  variant?: 'full' | 'compact' | 'horizontal' | 'official' | 'icon-only';
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showTagline?: boolean;
}

/**
 * Official Al Shaheed Trading & Equipment Co. Logo Component
 * Precision recreation of the green 3D recycling loop, globe core, leaves,
 * typography, and REDUCE • REUSE • RECYCLE motto.
 */
export const AlShaheedEmblem: React.FC<{ sizeClass?: string; className?: string }> = ({
  sizeClass = 'w-10 h-10',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClass} ${className}`}>
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          {/* Globe Radial Glow & Ocean */}
          <radialGradient id="globeOceanGrad" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="35%" stopColor="#22c55e" />
            <stop offset="75%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#052e16" />
          </radialGradient>

          {/* Continent Fill Gradient */}
          <linearGradient id="continentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0fdf4" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#dcfce7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#86efac" stopOpacity="0.8" />
          </linearGradient>

          {/* Top-Right Arrow Gradient */}
          <linearGradient id="arrowGradTop" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="40%" stopColor="#4ade80" />
            <stop offset="85%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>

          {/* Left Arrow Gradient */}
          <linearGradient id="arrowGradLeft" x1="0%" y1="30%" x2="100%" y2="70%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="90%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#052e16" />
          </linearGradient>

          {/* Bottom-Right Arrow Gradient */}
          <linearGradient id="arrowGradBottom" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="45%" stopColor="#22c55e" />
            <stop offset="80%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          {/* Arrow Fold / Shadow Gradients for 3D realism */}
          <linearGradient id="foldShadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#052e16" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#14532d" stopOpacity="0.2" />
          </linearGradient>

          {/* Glass / Sphere Highlight */}
          <radialGradient id="sphereHighlight" cx="35%" cy="30%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- 1. GLOBE (Earth at the center) --- */}
        <circle cx="120" cy="100" r="54" fill="url(#globeOceanGrad)" />
        
        {/* Continents outlines / silhouettes */}
        <g fill="url(#continentGrad)" opacity="0.88">
          {/* North America */}
          <path d="M96 72 C98 65 106 60 114 62 C118 64 122 70 120 76 C116 80 112 85 107 88 C104 90 98 87 97 83 C95 78 94 75 96 72 Z" />
          {/* Central & South America */}
          <path d="M110 92 C113 90 116 93 118 97 C120 102 122 112 118 120 C115 125 111 128 108 124 C106 119 107 106 110 92 Z" />
          {/* Europe & Africa */}
          <path d="M128 66 C134 64 140 68 142 74 C144 80 142 86 138 90 C136 94 138 102 142 108 C144 114 140 124 135 122 C130 120 128 110 130 100 C131 92 127 82 125 76 C124 70 126 67 128 66 Z" />
          {/* Asia / Islands */}
          <path d="M148 72 C154 70 162 74 164 80 C165 86 158 92 153 90 C149 88 147 78 148 72 Z" />
        </g>

        {/* Globe 3D Spherical Light Gloss */}
        <circle cx="120" cy="100" r="54" fill="url(#sphereHighlight)" />

        {/* --- 2. 3D RECYCLING MOBIUS ARROWS --- */}
        {/* ARROW 1: TOP / RIGHT */}
        {/* Fold underlayer */}
        <path
          d="M84 48 L152 42 C168 40 182 52 184 68 L170 82 C168 72 160 62 148 62 L94 66 Z"
          fill="url(#foldShadow)"
        />
        {/* Main Ribbon Body */}
        <path
          d="M74 46 C80 32 100 24 124 24 C152 24 178 38 186 64 L204 60 L188 98 L152 76 L168 72 C162 56 145 44 124 44 C106 44 92 50 86 60 Z"
          fill="url(#arrowGradTop)"
        />

        {/* ARROW 2: LEFT / INCLINED */}
        {/* Fold underlayer */}
        <path
          d="M174 136 L130 178 C118 190 98 186 86 174 L74 158 C82 166 94 168 104 162 L150 122 Z"
          fill="url(#foldShadow)"
        />
        {/* Main Ribbon Body */}
        <path
          d="M62 78 L78 62 L80 84 C70 96 66 112 70 128 C76 150 94 168 116 174 L114 194 C84 186 60 162 52 134 C46 112 50 92 62 78 Z"
          fill="url(#arrowGradLeft)"
        />
        {/* Left Arrow Head */}
        <polygon points="40,76 88,48 78,98" fill="url(#arrowGradLeft)" />

        {/* ARROW 3: BOTTOM / RIGHT VERTICAL LOOP */}
        {/* Main Ribbon Body */}
        <path
          d="M168 96 C176 110 178 126 174 142 C166 168 142 186 116 190 L118 170 C136 166 152 152 156 134 C158 122 156 112 150 102 Z"
          fill="url(#arrowGradBottom)"
        />
        {/* Bottom Arrow Head pointing downwards */}
        <polygon points="132,154 184,188 148,206" fill="url(#arrowGradBottom)" />

        {/* --- 3. DUAL SPROUT LEAVES AT BASE --- */}
        <g transform="translate(120, 206)">
          {/* Left Leaf */}
          <path
            d="M0 0 C-6 -8 -16 -10 -22 -6 C-24 0 -18 10 -8 10 C-3 10 -1 6 0 0 Z"
            fill="#4ade80"
          />
          <path d="M0 0 C-8 4 -16 2 -20 -4" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round" />
          {/* Right Leaf */}
          <path
            d="M0 0 C6 -8 16 -10 22 -6 C24 0 18 10 8 10 C3 10 1 6 0 0 Z"
            fill="#22c55e"
          />
          <path d="M0 0 C8 4 16 2 20 -4" stroke="#166534" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
  showTagline = true,
}) => {
  const iconSizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  const titleSizeMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
  };

  if (variant === 'icon-only' || variant === 'compact') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <AlShaheedEmblem sizeClass={iconSizeMap[size]} />
      </div>
    );
  }

  // Official Emblem Card (Vertical Stacked with full branding & motto)
  if (variant === 'official') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <AlShaheedEmblem sizeClass={iconSizeMap[size]} className="mb-2" />

        {/* AL SHAHEED */}
        <h1 className="font-black tracking-tight text-emerald-950 dark:text-emerald-400 text-2xl sm:text-3xl uppercase leading-none font-serif mt-1">
          AL SHAHEED
        </h1>

        {/* TRADING AND EQUIPMENT CO */}
        <div className="text-[10px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-[0.25em] uppercase mt-1.5 font-sans">
          TRADING AND EQUIPMENT CO
        </div>

        {/* Divider with Diamond & Motto */}
        {showTagline && (
          <div className="w-full max-w-[260px] flex items-center justify-center gap-2 mt-2 pt-1.5 border-t border-emerald-800/30 dark:border-emerald-500/30">
            <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-900 dark:text-emerald-200 uppercase tracking-widest flex items-center gap-1.5">
              <span>REDUCE</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
              <span>REUSE</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
              <span>RECYCLE</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  // Horizontal Header / Navbar Lockup (default)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AlShaheedEmblem sizeClass={iconSizeMap[size]} />

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-slate-900 dark:text-white font-serif uppercase ${titleSizeMap[size]}`}>
            <span className="text-emerald-600 dark:text-emerald-400">AL</span> SHAHEED
          </span>
        </div>

        <div className="text-[9px] sm:text-[10px] font-bold text-emerald-800 dark:text-emerald-300 tracking-[0.18em] uppercase leading-tight mt-0.5">
          TRADING &amp; EQUIPMENT CO
        </div>

        {showTagline && (
          <div className="hidden sm:flex items-center gap-1 text-[8px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-0.5">
            <span>REDUCE</span>
            <span className="text-emerald-500">&bull;</span>
            <span>REUSE</span>
            <span className="text-emerald-500">&bull;</span>
            <span>RECYCLE</span>
          </div>
        )}
      </div>
    </div>
  );
};
