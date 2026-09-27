import React from 'react';

interface AtomicLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  className?: string;
  showText?: boolean;
  textPosition?: 'right' | 'bottom';
  variant?: 'full' | 'mark' | 'white';
}

export const AtomicLogo: React.FC<AtomicLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  textPosition = 'right',
}) => {
  const pixelSizes: Record<string, number> = {
    xs: 28,
    sm: 38,
    md: 52,
    lg: 72,
    xl: 96,
    '2xl': 140,
  };

  const dimension = typeof size === 'number' ? size : pixelSizes[size] || 52;

  // Exact brand colors sampled from the logo
  const MAROON = '#6d1a22';       // Main cog & banner maroon
  const DARK_MAROON = '#521218';  // Shadow & text maroon
  const CREAM = '#fcf7ee';        // Warm parchment cream inner circle
  const LIGHT_CREAM = '#ffffff';  // Crisp white text on banner
  const PINK_BALLS = '#d92662';   // Newton's cradle pendulum balls
  const BLUE_ORBIT = '#2563eb';   // Electron orbit ellipses
  const ORANGE_ATOM = '#ea580c';  // Atomic nucleus
  const GREEN_DNA = '#16a34a';    // Biological DNA double helix

  return (
    <div
      className={`inline-flex items-center gap-3 ${
        textPosition === 'bottom' ? 'flex-col text-center' : 'flex-row'
      } ${className}`}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm select-none"
        aria-label="অ্যাটমিক শিক্ষা পরিবার - Atomic Inside Logo"
      >
        <defs>
          {/* Subtle 3D gradient for cogwheel */}
          <linearGradient id="maroonGrad" x1="50" y1="50" x2="350" y2="350" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7a1f28" />
            <stop offset="1" stopColor="#5d141b" />
          </linearGradient>

          {/* Banner gradient */}
          <linearGradient id="bannerGrad" x1="60" y1="200" x2="340" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#691820" />
            <stop offset="0.5" stopColor="#7e1d25" />
            <stop offset="1" stopColor="#5b1319" />
          </linearGradient>

        </defs>

        {/* 12-TOOTH COGWHEEL (Outer Gear Silhouette) */}
        <g id="gear-cogwheel">
          {/* 12 Gear Cogs around perimeter */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <rect
              key={deg}
              x="176"
              y="20"
              width="48"
              height="34"
              rx="4"
              fill="url(#maroonGrad)"
              transform={`rotate(${deg} 200 200)`}
            />
          ))}
          {/* Main Gear Disc */}
          <circle cx="200" cy="200" r="160" fill="url(#maroonGrad)" stroke="#4a0f14" strokeWidth="2" />
        </g>

        {/* INNER DISC (Warm Ivory / Cream) */}
        <circle cx="200" cy="200" r="126" fill={CREAM} stroke={MAROON} strokeWidth="5" />

        {/* UPPER QUADRANTS CONTAINER (Masked inside circle) */}
        <g id="upper-science-quadrants">
          <clipPath id="upperDiscClip">
            <circle cx="200" cy="200" r="123" />
          </clipPath>

          <g clipPath="url(#upperDiscClip)">
            {/* Dividing Lines separating the 4 upper sectors */}
            {/* Vertical midline */}
            <line x1="200" y1="76" x2="200" y2="195" stroke={MAROON} strokeWidth="3" />
            {/* Diagonal line left (135 deg) */}
            <line x1="200" y1="195" x2="110" y2="110" stroke={MAROON} strokeWidth="3" />
            {/* Diagonal line right (45 deg) */}
            <line x1="200" y1="195" x2="290" y2="110" stroke={MAROON} strokeWidth="3" />

            {/* SECTOR 1: NEWTON'S CRADLE (Upper Left Sector) */}
            <g id="newtons-cradle" transform="translate(136, 105)">
              {/* Top Support Bar */}
              <rect x="-30" y="2" width="60" height="7" rx="2" fill="#2d3748" />
              <rect x="-32" y="1" width="64" height="2" fill="#1a202c" />

              {/* Strings & Pendulum balls */}
              <line x1="-20" y1="9" x2="-34" y2="40" stroke="#1f2937" strokeWidth="1.5" />
              <line x1="-16" y1="9" x2="-30" y2="40" stroke="#1f2937" strokeWidth="1.5" />
              <circle cx="-32" cy="42" r="6.5" fill={PINK_BALLS} stroke="#9f1239" strokeWidth="1" />
              <circle cx="-34" cy="40" r="2" fill="#fda4af" />

              <line x1="-10" y1="9" x2="-10" y2="45" stroke="#1f2937" strokeWidth="1.5" />
              <line x1="-6" y1="9" x2="-10" y2="45" stroke="#1f2937" strokeWidth="1.5" />
              <circle cx="-10" cy="47" r="6.5" fill={PINK_BALLS} stroke="#9f1239" strokeWidth="1" />
              <circle cx="-12" cy="45" r="2" fill="#fda4af" />

              <line x1="0" y1="9" x2="2" y2="45" stroke="#1f2937" strokeWidth="1.5" />
              <line x1="4" y1="9" x2="2" y2="45" stroke="#1f2937" strokeWidth="1.5" />
              <circle cx="2" cy="47" r="6.5" fill={PINK_BALLS} stroke="#9f1239" strokeWidth="1" />
              <circle cx="0" cy="45" r="2" fill="#fda4af" />

              <line x1="12" y1="9" x2="14" y2="43" stroke="#1f2937" strokeWidth="1.5" />
              <line x1="16" y1="9" x2="14" y2="43" stroke="#1f2937" strokeWidth="1.5" />
              <circle cx="14" cy="45" r="6.5" fill={PINK_BALLS} stroke="#9f1239" strokeWidth="1" />
              <circle cx="12" cy="43" r="2" fill="#fda4af" />

              <line x1="22" y1="9" x2="29" y2="41" stroke="#1f2937" strokeWidth="1.5" />
              <line x1="26" y1="9" x2="29" y2="41" stroke="#1f2937" strokeWidth="1.5" />
              <circle cx="29" cy="42" r="6.5" fill={PINK_BALLS} stroke="#9f1239" strokeWidth="1" />
              <circle cx="27" cy="40" r="2" fill="#fda4af" />
            </g>

            {/* SECTOR 2: PI (π) WITH MATHEMATICAL PRECISION RINGS (Upper Right Sector) */}
            <g id="math-pi" transform="translate(245, 142)">
              <circle cx="0" cy="0" r="38" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2 2" fill="none" opacity="0.6" />
              <circle cx="0" cy="0" r="28" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="1.5 2" fill="none" opacity="0.5" />

              <circle cx="0" cy="0" r="17" fill="#fdfbf7" stroke={DARK_MAROON} strokeWidth="1.2" />

              <path
                d="M -9 -7 L 9 -7 M -9 -7 C -9 -7 -8 -4 -6 -4 L 8 -4 M -5 -4 L -5 7 C -5 7 -5 9 -8 9 M 5 -4 L 5 8 C 5 8 5 9 8 9"
                stroke={DARK_MAROON}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>

            {/* SECTOR 3: ATOM MODEL (Middle-Left Sector) */}
            <g id="science-atom" transform="translate(122, 172)">
              <ellipse cx="0" cy="0" rx="25" ry="9" stroke={BLUE_ORBIT} strokeWidth="1.5" fill="none" transform="rotate(-15)" />
              <ellipse cx="0" cy="0" rx="25" ry="9" stroke={BLUE_ORBIT} strokeWidth="1.5" fill="none" transform="rotate(45)" />
              <ellipse cx="0" cy="0" rx="25" ry="9" stroke={BLUE_ORBIT} strokeWidth="1.5" fill="none" transform="rotate(105)" />

              <circle cx="-18" cy="-8" r="2.8" fill={BLUE_ORBIT} stroke="#ffffff" strokeWidth="0.8" />
              <circle cx="16" cy="11" r="2.8" fill={BLUE_ORBIT} stroke="#ffffff" strokeWidth="0.8" />
              <circle cx="11" cy="-14" r="2.8" fill={BLUE_ORBIT} stroke="#ffffff" strokeWidth="0.8" />

              <circle cx="-2.5" cy="-2.5" r="4.2" fill={ORANGE_ATOM} />
              <circle cx="3" cy="-1.5" r="3.8" fill="#dc2626" />
              <circle cx="-1" cy="3" r="3.8" fill="#fbbf24" />
              <circle cx="2" cy="2" r="3.2" fill={ORANGE_ATOM} />
            </g>

            {/* SECTOR 4: DNA DOUBLE HELIX (Middle-Right Sector) */}
            <g id="dna-helix" transform="translate(275, 172) rotate(22)">
              {[-22, -14, -6, 2, 10, 18, 26].map((x, i) => {
                const height = Math.abs(Math.sin(i * 0.9)) * 14 + 3;
                return (
                  <line
                    key={i}
                    x1={x}
                    y1={-height / 2}
                    x2={x}
                    y2={height / 2}
                    stroke="#15803d"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                );
              })}
              <path
                d="M -26 0 Q -18 -12 -10 0 T 6 0 T 22 0 T 32 0"
                stroke={GREEN_DNA}
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M -26 0 Q -18 12 -10 0 T 6 0 T 22 0 T 32 0"
                stroke="#15803d"
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="-10" cy="0" r="2.2" fill="#84cc16" />
              <circle cx="6" cy="0" r="2.2" fill="#84cc16" />
              <circle cx="22" cy="0" r="2.2" fill="#84cc16" />
            </g>
          </g>
        </g>

        {/* CENTER MAROON BANNER FOR "অ্যাটমিক" */}
        <g id="center-maroon-banner">
          <path
            d="M 85 195 L 315 195 C 322 195 328 200 327 207 L 322 248 C 321 254 316 259 310 259 L 90 259 C 84 259 79 254 78 248 L 73 207 C 72 200 78 195 85 195 Z"
            fill="url(#bannerGrad)"
            stroke="#450d12"
            strokeWidth="3.5"
          />
          <path
            d="M 89 200 L 311 200 L 306 254 L 94 254 Z"
            fill="none"
            stroke="#991b1b"
            strokeWidth="1"
            opacity="0.6"
          />

          {/* BENGALI LOGO TEXT: "অ্যাটমিক" */}
          <text
            x="200"
            y="244"
            textAnchor="middle"
            fill={LIGHT_CREAM}
            fontFamily="'Anek Bangla', 'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif"
            fontWeight="900"
            fontSize="45"
            letterSpacing="0"
            style={{
              filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.45))',
            }}
          >
            অ্যাটমিক
          </text>
        </g>

        {/* LOWER SECTION: "শিক্ষা পরিবার" */}
        <g id="lower-family-text">
          <text
            x="200"
            y="306"
            textAnchor="middle"
            fill={DARK_MAROON}
            fontFamily="'Anek Bangla', 'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif"
            fontWeight="800"
            fontSize="30"
            letterSpacing="0"
          >
            শিক্ষা পরিবার
          </text>
        </g>

        {/* Outer Circular Rim Accents */}
        <circle cx="200" cy="200" r="158" fill="none" stroke="#fef2f2" strokeWidth="1" opacity="0.3" />
        <circle cx="200" cy="200" r="124" fill="none" stroke="#fae8e0" strokeWidth="1.5" opacity="0.5" />
      </svg>

      {/* Optional Brand Text Beside/Below Logo */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xl md:text-2xl font-black tracking-tight text-[#6d1a22] font-serif">
              Atomic Inside
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#6d1a22] text-[#fcf7ee] uppercase tracking-wider">
              ERP
            </span>
          </div>
          <span className="text-xs md:text-sm font-semibold text-[#88242d] font-bangla">
            অ্যাটমিক শিক্ষা পরিবার
          </span>
          <span className="text-[11px] text-[#71717a] font-medium hidden sm:inline">
            Smart Coaching & Financial Management
          </span>
        </div>
      )}
    </div>
  );
};

export default AtomicLogo;
