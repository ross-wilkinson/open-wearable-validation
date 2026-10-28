import { useId, type SVGProps } from 'react';

export interface AgreekitLogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

/**
 * agreekit brand logo.
 * Unified design language with umbrella platform:
 * - Precision caliper jaws (bracket boundaries)
 * - Limits-of-agreement dashed bounds
 * - Pythonic intertwining paired-difference curves
 * - Paired subject variance residual points
 */
export function AgreekitLogo({
  size = 32,
  showText = false,
  subtitle = 'PYTHON AGREEMENT SUITE',
  className = '',
  ...props
}: AgreekitLogoProps) {
  const uid = useId().replace(/:/g, '');
  const bgGradId = `ak-bg-${uid}`;
  const blueGradId = `ak-blue-${uid}`;
  const goldGradId = `ak-gold-${uid}`;

  const svgGraphic = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="agreekit Logo"
      role="img"
      className={showText ? 'shrink-0' : className}
      {...props}
    >
      <defs>
        <linearGradient id={bgGradId} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0a101d" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id={blueGradId} x1="7" y1="12" x2="29" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={goldGradId} x1="7" y1="24" x2="29" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
      </defs>

      {/* Rounded squircle container matching Open Wearable Validation design system */}
      <rect width="36" height="36" rx="8" fill={`url(#${bgGradId})`} />
      <rect
        x="0.75"
        y="0.75"
        width="34.5"
        height="34.5"
        rx="7.25"
        stroke="rgba(56, 189, 248, 0.28)"
        strokeWidth="0.75"
      />

      {/* Bland-Altman Limits of Agreement bounds */}
      <line
        x1="7"
        y1="9.5"
        x2="29"
        y2="9.5"
        stroke="rgba(245, 158, 11, 0.45)"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />
      <line
        x1="7"
        y1="26.5"
        x2="29"
        y2="26.5"
        stroke="rgba(56, 189, 248, 0.45)"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />

      {/* Zero Bias Center Reference */}
      <line
        x1="6"
        y1="18"
        x2="30"
        y2="18"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      {/* Precision Caliper Jaws (Left & Right Brackets) */}
      <path
        d="M 9 7.5 L 6.5 7.5 L 6.5 28.5 L 9 28.5"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 27 7.5 L 29.5 7.5 L 29.5 28.5 L 27 28.5"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Pythonic Intertwining Convergence Curves */}
      <path
        d="M 8 13.5 C 13 13.5, 16 17.5, 21 17.5 C 24.5 17.5, 26.5 15, 28.5 14"
        stroke={`url(#${blueGradId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M 7.5 22.5 C 11.5 22.5, 14.5 18.5, 19.5 18.5 C 23.5 18.5, 25.5 22, 28.5 22"
        stroke={`url(#${goldGradId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Paired Subject Variance Residual Points */}
      <circle cx="11.5" cy="18" r="1.3" fill="#ffffff" opacity="0.85" />
      <circle cx="16" cy="15" r="1.4" fill="#38bdf8" />
      <circle cx="20.5" cy="20.5" r="1.4" fill="#f59e0b" />
      <circle cx="25" cy="17" r="1.4" fill="#ffffff" />
    </svg>
  );

  if (!showText) {
    return svgGraphic;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {svgGraphic}
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="font-mono text-sm sm:text-base font-bold tracking-tight text-ink leading-none">
            agreekit
          </span>
          <span className="rounded bg-amber-500/15 px-1 py-0.5 text-[9px] font-mono font-semibold text-amber-700 dark:text-amber-300">
            py
          </span>
        </div>
        {subtitle && (
          <span className="text-[9px] font-semibold tracking-wider text-ink-muted mt-1 uppercase">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

/** Standalone icon-only shortcut */
export function AgreekitIcon({
  size = 24,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return <AgreekitLogo size={size} showText={false} className={className} />;
}
