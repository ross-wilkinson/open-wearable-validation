import { useId, type SVGProps } from 'react';

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  showText?: boolean;
  className?: string;
}

/**
 * Validation Study Designer primary brand logo.
 * Sleek vector geometric mark combining limits-of-agreement precision bounds,
 * a Gaussian calibration contour, and caliper-grade alignment guides.
 */
export function ValidationStudyDesignerLogo({
  size = 32,
  showText = false,
  className = '',
  ...props
}: LogoProps) {
  const uid = useId().replace(/:/g, '');
  const bgGradId = `vsd-bg-${uid}`;
  const curveGradId = `vsd-crv-${uid}`;

  const svgGraphic = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Validation Study Designer Logo"
      role="img"
      className={showText ? '' : className}
      {...props}
    >
      <defs>
        <linearGradient id={bgGradId} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-series-1, #2a78d6)" />
          <stop offset="1" stopColor="var(--color-series-7, #4a3aa7)" />
        </linearGradient>
        <linearGradient id={curveGradId} x1="6" y1="18" x2="30" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="var(--color-series-4, #eda100)" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="9" fill={`url(#${bgGradId})`} />

      {/* Caliper Alignment Marks (Upper & Lower Tolerance Limits) */}
      <line x1="6" y1="10" x2="30" y2="10" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeDasharray="2 2" />
      <line x1="6" y1="26" x2="30" y2="26" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeDasharray="2 2" />
      
      {/* Left & Right Caliper Jaws */}
      <line x1="8" y1="8" x2="8" y2="12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="8" x2="28" y2="12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="24" x2="8" y2="28" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="24" x2="28" y2="28" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Central Precision Inversion / LoA Convergence Curve */}
      <path
        d="M7 26 C 13 25.5, 17 19.5, 29 11"
        stroke={`url(#${curveGradId})`}
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Reference Centerline */}
      <line x1="6" y1="18" x2="30" y2="18" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3 3" />

      {/* Golden Precision Anchor Point */}
      <circle cx="29" cy="11" r="3.2" fill="var(--color-series-4, #eda100)" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="29" cy="11" r="1.2" fill="#ffffff" />
    </svg>
  );

  if (showText) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {svgGraphic}
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-ink leading-none">
            Validation Study Designer
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mt-0.5">
            Wearable Clinical Suite
          </span>
        </div>
      </div>
    );
  }

  return svgGraphic;
}
