import { useId, type SVGProps } from 'react';

interface MeridianLogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

/**
 * Meridian Biosystems corporate brand logo (ADR-010).
 * Stylized meridian latitude ring interwoven with an optical PPG pulse waveform
 * (systolic peak and dicrotic notch) inside a precision biosensor bezel.
 */
export function MeridianLogo({
  size = 32,
  showText = false,
  subtitle = 'WEARABLE HEALTH TECHNOLOGIES',
  className = '',
  ...props
}: MeridianLogoProps) {
  const uid = useId().replace(/:/g, '');
  const ringGradId = `meridian-ring-${uid}`;
  const pulseGradId = `meridian-pulse-${uid}`;
  const coreGlowId = `meridian-glow-${uid}`;

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Meridian Biosystems Logo"
      role="img"
      className="shrink-0"
      {...props}
    >
      <defs>
        <linearGradient id={ringGradId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0284c7" />
          <stop offset="0.5" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id={pulseGradId} x1="6" y1="20" x2="34" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="0.6" stopColor="#34d399" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <radialGradient id={coreGlowId} cx="20" cy="20" r="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0284c7" stopOpacity="0.25" />
          <stop offset="1" stopColor="#0284c7" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sensor Pod Outer Bezel */}
      <rect width="40" height="40" rx="10" fill="#090d16" />
      <rect x="1" y="1" width="38" height="38" rx="9" stroke={`url(#${ringGradId})`} strokeWidth="1.5" strokeOpacity="0.6" />

      {/* Internal Core Optical Glow */}
      <circle cx="20" cy="20" r="14" fill={`url(#${coreGlowId})`} />

      {/* Meridian Longitude / Latitude Ellipses */}
      <ellipse cx="20" cy="20" rx="13" ry="5.5" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="2 2" transform="rotate(-25 20 20)" />
      <circle cx="20" cy="20" r="12" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />

      {/* Stylized PPG Biosignal Arterial Pulse (Systolic Peak, Dicrotic Notch, Diastolic Runoff) */}
      <path
        d="M6 21 L12 21 L15 21 L17 11 L19 27 L21 17 L23 21 L26 21 L28 19 L30 21 L34 21"
        stroke={`url(#${pulseGradId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Optical Sensor Diode Core (530nm Green LED Emitter Mark) */}
      <circle cx="20" cy="20" r="2.2" fill="#10b981" />
      <circle cx="20" cy="20" r="4" stroke="#34d399" strokeWidth="0.8" strokeOpacity="0.7" />
    </svg>
  );

  if (!showText) {
    return <div className={`inline-flex items-center ${className}`}>{icon}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {icon}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-bold tracking-tight text-ink text-sm sm:text-base leading-none">
            MERIDIAN
          </span>
          <span className="font-light tracking-wide text-ink-muted text-sm sm:text-base leading-none">
            BIOSYSTEMS
          </span>
        </div>
        {subtitle && (
          <span className="text-[9px] font-semibold tracking-wider text-cyan-600 dark:text-cyan-400 mt-1 uppercase">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

/** Standalone icon-only shortcut */
export function MeridianIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <MeridianLogo size={size} showText={false} className={className} />;
}
