import { useId, type SVGProps } from 'react';
import { BRAND_CONFIG } from '../../config/brand.ts';

export interface OpenWearableValidationLogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  showText?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Open Wearable Validation umbrella suite brand logo.
 * Geometric mark embodying metrological ground truth:
 * - Precision caliper jaws (bracket boundaries)
 * - Limits-of-agreement tolerance bounds (Bland-Altman)
 * - Dual confidence envelope curves converging asymptotically to ground truth
 * - Golden precision target anchor at focal point
 */
export function OpenWearableValidationLogo({
  size = 32,
  showText = false,
  className = '',
  title,
  subtitle,
  ...props
}: OpenWearableValidationLogoProps) {
  const uid = useId().replace(/:/g, '');
  const bgGradId = `owv-bg-${uid}`;
  const cyanGradId = `owv-cyan-${uid}`;
  const goldGradId = `owv-gold-${uid}`;

  const displayTitle = title ?? BRAND_CONFIG.shortName ?? BRAND_CONFIG.siteName;
  const displaySubtitle = subtitle !== undefined ? subtitle : BRAND_CONFIG.subtitle;

  const svgGraphic = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${displayTitle} Logo`}
      role="img"
      className={showText ? 'shrink-0' : className}
      {...props}
    >
      <defs>
        <linearGradient id={bgGradId} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0a101d" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id={cyanGradId} x1="7" y1="11" x2="28" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={goldGradId} x1="7" y1="25" x2="28" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
      </defs>

      {/* Rounded squircle container */}
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

      {/* Bland-Altman Limits of Agreement bounds (Upper & Lower Tolerance Limits) */}
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

      {/* Caliper Jaw Brackets */}
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

      {/* Dual Confidence Convergence Envelopes (Narrowing to Ground Truth) */}
      <path
        d="M 7.5 11.5 C 13.5 12.8, 19.5 16.2, 27 17.5"
        stroke={`url(#${cyanGradId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M 7.5 24.5 C 13.5 23.2, 19.5 19.8, 27 18.5"
        stroke={`url(#${goldGradId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Vernier Calibration Ticks */}
      <line x1="13" y1="16.5" x2="13" y2="19.5" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
      <line x1="20" y1="16.5" x2="20" y2="19.5" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />

      {/* Ground Truth Focal Reticle */}
      <circle
        cx="27.5"
        cy="18"
        r="3"
        fill="#0a101d"
        stroke="var(--color-series-4, #eda100)"
        strokeWidth="1.4"
      />
      <circle cx="27.5" cy="18" r="1.1" fill="#ffffff" />
    </svg>
  );

  if (!showText) {
    return svgGraphic;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {svgGraphic}
      <div className="flex flex-col">
        <span className="text-sm font-bold tracking-tight text-ink leading-none">
          {displayTitle}
        </span>
        {displaySubtitle ? (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mt-1">
            {displaySubtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** Standalone icon-only shortcut */
export function OpenWearableValidationIcon({
  size = 24,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return <OpenWearableValidationLogo size={size} showText={false} className={className} />;
}

// Aliases for umbrella branding & backward compatibility
export {
  OpenWearableValidationLogo as SiteLogo,
  OpenWearableValidationIcon as SiteIcon,
  OpenWearableValidationLogo as OpenValidationLogo,
  OpenWearableValidationIcon as OpenValidationIcon,
};
