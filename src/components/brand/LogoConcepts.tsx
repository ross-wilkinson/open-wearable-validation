import { useId, useState, type SVGProps } from 'react';
import { Sparkles, Eye, Layers, Maximize2, Check, Compass } from 'lucide-react';

export interface AbstractLogoProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  withPlate?: boolean;
  className?: string;
}

/* ============================================================================
 * ROUND 8 (DEFAULT): R2-01 STYLING EVOLUTION (VERIFIED PULSE WAVE & 180° TWIN)
 * Reincorporates the clean, confident, athletic watch styling of OWV Round 2 - 01:
 * - Fluid, single-stroke vector with bold 5.5px rounded stroke (zero clutter).
 * - Circular open wearable bezel ('O') with subtle watch lugs.
 * - Dynamic pulse waveform checking boldly out of the open bezel.
 * - Iconic terminal accent dot crowning the breakout tip.
 * - agreekit: Exact 180° rotation with Neutral Brushed Slate Bezel,
 *   Pythonic Blue body, and Pythonic Yellow terminal dot.
 * ============================================================================ */

/**
 * OWV Concept 01 (Round 8): "The Verified Pulse Wave (Direct R2-01 Evolution)"
 * Directly evolves the beloved Round 2 - 01 mark with polished vector dynamics:
 * - Open Bezel ('O'): Sky-400 (#38bdf8 -> #0284c7) with rounded end-caps.
 * - Inner Pulse Checkmark: Emerald-400 (#10b981 -> #34d399) bold 5.5px vector.
 * - Terminal Accent Dot: Glowing Amber-Gold (#fbbf24) crowning the breakout tip.
 */
export function OwvConcept1Aperture({
  size = 64,
  withPlate = false,
  className = '',
  ...props
}: AbstractLogoProps) {
  const uid = useId().replace(/:/g, '');
  const plateGrad = `owv-r8-1-plate-${uid}`;
  const bezelOGrad = `owv-r8-1-o-${uid}`;
  const pulseGrad = `owv-r8-1-pulse-${uid}`;
  const dotGrad = `owv-r8-1-dot-${uid}`;
  const emitterGlow = `owv-r8-1-glow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Open Wearable Validation Concept 1: The Pure Pulse Aperture"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={plateGrad} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0b111e" />
          <stop offset="1" stopColor="#05070c" />
        </linearGradient>
        <linearGradient id={bezelOGrad} x1="9" y1="12" x2="53" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0f2fe" />
          <stop offset="0.4" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id={pulseGrad} x1="15" y1="43" x2="54" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="0.6" stopColor="#34d399" />
          <stop offset="1" stopColor="#6ee7b7" />
        </linearGradient>
        <linearGradient id={dotGrad} x1="52" y1="11" x2="57" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <radialGradient id={emitterGlow} cx="32" cy="34" r="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" stopOpacity="0.18" />
          <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {withPlate && (
        <>
          <rect width="64" height="64" rx="14" fill={`url(#${plateGrad})`} />
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="62.5"
            rx="13.25"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
          />
        </>
      )}

      {/* Optical Backlight */}
      <circle cx="32" cy="34" r="17" fill={`url(#${emitterGlow})`} />

      {/* Subtle Wearable Watch Strap Lugs */}
      <path d="M 23 7.5 L 37 7.5 M 23 59.5 L 37 59.5" stroke="rgba(148,163,184,0.45)" strokeWidth="3" strokeLinecap="round" />

      {/* The 'O': Open-Top-Right Circular Wearable Bezel with Signature R2-01 Proportions */}
      <path
        d="M 49.6 41.8 A 21 21 0 1 1 43.5 17.9"
        stroke={`url(#${bezelOGrad})`}
        strokeWidth="5.5"
        strokeLinecap="round"
      />

      {/* The Pure R2-01 Pulse-Checkmark Vector */}
      <path
        d="M 15.5 34.5 L 21 34.5 L 24.2 27.5 L 29.8 43 L 54.5 14"
        stroke={`url(#${pulseGrad})`}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Terminal Node Accent Dot */}
      <circle cx="54.5" cy="14" r="3.2" fill={`url(#${dotGrad})`} />
    </svg>
  );
}

/**
 * OWV Concept 02 (Round 8): "The Continuous O-W-V Trace"
 * Weaves 'O', 'W', and 'V' into ONE single, unbroken, fluid line using R2-01 styling:
 * - A 5.2px pulse wave with two systolic peaks ('W') that flows naturally into a
 *   deep validation dip ('V') and surges triumphantly out through the open bezel.
 * - Zero overlapping shapes, zero stroke collisions, maximum athletic watch elegance.
 */
export function OwvConcept2Eclipse({
  size = 64,
  withPlate = false,
  className = '',
  ...props
}: AbstractLogoProps) {
  const uid = useId().replace(/:/g, '');
  const plateGrad = `owv-r8-2-plate-${uid}`;
  const bezelOGrad = `owv-r8-2-o-${uid}`;
  const owvTraceGrad = `owv-r8-2-trace-${uid}`;
  const dotGrad = `owv-r8-2-dot-${uid}`;
  const emitterGlow = `owv-r8-2-glow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Open Wearable Validation Concept 2: The Continuous O-W-V Trace"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={plateGrad} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0b111e" />
          <stop offset="1" stopColor="#05070c" />
        </linearGradient>
        <linearGradient id={bezelOGrad} x1="9" y1="12" x2="53" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0f2fe" />
          <stop offset="0.4" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id={owvTraceGrad} x1="14" y1="44" x2="55" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="0.6" stopColor="#34d399" />
          <stop offset="1" stopColor="#6ee7b7" />
        </linearGradient>
        <linearGradient id={dotGrad} x1="52" y1="11" x2="57" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <radialGradient id={emitterGlow} cx="32" cy="34" r="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" stopOpacity="0.18" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
      </defs>

      {withPlate && (
        <>
          <rect width="64" height="64" rx="14" fill={`url(#${plateGrad})`} />
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="62.5"
            rx="13.25"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
          />
        </>
      )}

      {/* Optical Backlight */}
      <circle cx="32" cy="34" r="17" fill={`url(#${emitterGlow})`} />

      {/* Subtle Wearable Watch Strap Lugs */}
      <path d="M 23 7.5 L 37 7.5 M 23 59.5 L 37 59.5" stroke="rgba(148,163,184,0.45)" strokeWidth="3" strokeLinecap="round" />

      {/* The 'O': Open-Top-Right Circular Wearable Bezel */}
      <path
        d="M 49.6 41.8 A 21 21 0 1 1 43.5 17.9"
        stroke={`url(#${bezelOGrad})`}
        strokeWidth="5.5"
        strokeLinecap="round"
      />

      {/* Continuous O-W-V Trace: W Double Peak Flowing Seamlessly into the V Checkmark in 1 Fluid Stroke */}
      <path
        d="M 14.5 33.5 L 18.5 33.5 L 23 23.5 L 28 35.5 L 33 23.5 L 38.5 44 L 54.5 13.5"
        stroke={`url(#${owvTraceGrad})`}
        strokeWidth="5.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Terminal Node Accent Dot */}
      <circle cx="54.5" cy="13.5" r="3.2" fill={`url(#${dotGrad})`} />
    </svg>
  );
}

/**
 * OWV Concept 03 (Round 8): "The Hero-Triad Verified Pulse"
 * Combines the clean R2-01 pulse wave with the Hero Headline color triad:
 * - Sky-400 Bezel + Emerald-400 Pulse Wave + Hero Indigo-Purple (#818cf8) dot.
 * - Subtle clinical ground-truth datum guideline at y=34.5 for metrological grounding.
 */
export function OwvConcept3Monolith({
  size = 64,
  withPlate = false,
  className = '',
  ...props
}: AbstractLogoProps) {
  const uid = useId().replace(/:/g, '');
  const plateGrad = `owv-r8-3-plate-${uid}`;
  const bezelOGrad = `owv-r8-3-bezel-${uid}`;
  const pulseGrad = `owv-r8-3-pulse-${uid}`;
  const purpleDotGrad = `owv-r8-3-dot-${uid}`;
  const heroGlow = `owv-r8-3-glow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Open Wearable Validation Concept 3: The Hero-Triad Verified Pulse"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={plateGrad} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0b111e" />
          <stop offset="1" stopColor="#05070c" />
        </linearGradient>
        <linearGradient id={bezelOGrad} x1="9" y1="12" x2="53" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0f2fe" />
          <stop offset="0.5" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id={pulseGrad} x1="15" y1="43" x2="54" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="0.6" stopColor="#34d399" />
          <stop offset="1" stopColor="#6ee7b7" />
        </linearGradient>
        <linearGradient id={purpleDotGrad} x1="52" y1="11" x2="57" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c084fc" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
        <radialGradient id={heroGlow} cx="32" cy="34" r="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" stopOpacity="0.2" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
      </defs>

      {withPlate && (
        <>
          <rect width="64" height="64" rx="14" fill={`url(#${plateGrad})`} />
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="62.5"
            rx="13.25"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
          />
        </>
      )}

      {/* Optical Photodiode Backlight */}
      <circle cx="32" cy="34" r="17" fill={`url(#${heroGlow})`} />

      {/* Subtle Clinical Ground-Truth Horizon Guideline */}
      <line x1="12" y1="34.5" x2="21" y2="34.5" stroke="rgba(56,189,248,0.3)" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />
      <line x1="43" y1="34.5" x2="51" y2="34.5" stroke="rgba(56,189,248,0.3)" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />

      {/* Subtle Wearable Watch Strap Lugs */}
      <path d="M 23 7.5 L 37 7.5 M 23 59.5 L 37 59.5" stroke="rgba(148,163,184,0.45)" strokeWidth="3" strokeLinecap="round" />

      {/* The 'O': Open Circular Wearable Bezel in Hero Sky-400 */}
      <path
        d="M 49.6 41.8 A 21 21 0 1 1 43.5 17.9"
        stroke={`url(#${bezelOGrad})`}
        strokeWidth="5.5"
        strokeLinecap="round"
      />

      {/* Verified Pulse Checkmark in Hero Emerald-400 */}
      <path
        d="M 15.5 34.5 L 21 34.5 L 24.2 27.5 L 29.8 43 L 54.5 14"
        stroke={`url(#${pulseGrad})`}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Hero Indigo-Purple Accent Terminal Node */}
      <circle cx="54.5" cy="14" r="3.4" fill={`url(#${purpleDotGrad})`} />
    </svg>
  );
}

/**
 * agreekit Concept 01 (Round 8): "The Pythonic Inversion (180° Twin)"
 * Exact 180° rotation of OWV Concept 01 (R2-01 evolution) with a Neutral Brushed
 * Slate-Silver bezel (#f8fafc -> #94a3b8 -> #475569), eliminating blue-on-blue
 * crowding so the Pythonic Blue signal (#2563eb -> #38bdf8) and Pythonic Yellow
 * terminal dot (#ffd43b) pop with razor-sharp contrast.
 */
export function AgreekitConcept1Mobius({
  size = 64,
  withPlate = false,
  className = '',
  ...props
}: AbstractLogoProps) {
  const uid = useId().replace(/:/g, '');
  const plateGrad = `ak-r8-1-plate-${uid}`;
  const neutralBezelGrad = `ak-r8-1-o-${uid}`;
  const pyBlueGrad = `ak-r8-1-v-${uid}`;
  const pyYellowDotGrad = `ak-r8-1-dot-${uid}`;
  const emitterGlow = `ak-r8-1-glow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="agreekit Concept 1: The Pythonic Inversion"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={plateGrad} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0b111e" />
          <stop offset="1" stopColor="#05070c" />
        </linearGradient>
        <linearGradient id={neutralBezelGrad} x1="9" y1="12" x2="53" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f8fafc" />
          <stop offset="0.5" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
        <linearGradient id={pyBlueGrad} x1="15" y1="43" x2="54" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="0.6" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#93c5fd" />
        </linearGradient>
        <linearGradient id={pyYellowDotGrad} x1="52" y1="11" x2="57" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffd43b" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <radialGradient id={emitterGlow} cx="32" cy="34" r="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" stopOpacity="0.2" />
          <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {withPlate && (
        <>
          <rect width="64" height="64" rx="14" fill={`url(#${plateGrad})`} />
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="62.5"
            rx="13.25"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
          />
        </>
      )}

      {/* Exact 180° Rotation of OWV 01 with Neutral Brushed Slate-Silver Bezel */}
      <g transform="rotate(180 32 32)">
        <circle cx="32" cy="34" r="17" fill={`url(#${emitterGlow})`} />

        {/* Watch Strap Lugs */}
        <path d="M 23 7.5 L 37 7.5 M 23 59.5 L 37 59.5" stroke="rgba(148,163,184,0.4)" strokeWidth="3" strokeLinecap="round" />

        {/* Neutral Brushed Slate-Silver Bezel */}
        <path
          d="M 49.6 41.8 A 21 21 0 1 1 43.5 17.9"
          stroke={`url(#${neutralBezelGrad})`}
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Pythonic Blue Pulse Vector */}
        <path
          d="M 15.5 34.5 L 21 34.5 L 24.2 27.5 L 29.8 43 L 54.5 14"
          stroke={`url(#${pyBlueGrad})`}
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pythonic Yellow Terminal Node Accent Dot */}
        <circle cx="54.5" cy="14" r="3.2" fill={`url(#${pyYellowDotGrad})`} />
      </g>
    </svg>
  );
}

/**
 * agreekit Concept 02 (Round 8): "The Continuous Capital 'A' Inversion (180° Twin)"
 * Exact 180° rotation of OWV Concept 02 (Continuous O-W-V Trace):
 * Inverted, the 'V' peak shoots up into a soaring Capital 'A' pinnacle at the top,
 * while the double peak of the 'W' forms the stabilizing crossbar and right flank.
 * Finished with a Neutral Brushed Slate bezel, Pythonic Blue stroke, and Pythonic Yellow dot.
 */
export function AgreekitConcept2PhaseArray({
  size = 64,
  withPlate = false,
  className = '',
  ...props
}: AbstractLogoProps) {
  const uid = useId().replace(/:/g, '');
  const plateGrad = `ak-r8-2-plate-${uid}`;
  const neutralBezelGrad = `ak-r8-2-bezel-${uid}`;
  const pyBlueTraceGrad = `ak-r8-2-trace-${uid}`;
  const pyYellowDotGrad = `ak-r8-2-dot-${uid}`;
  const emitterGlow = `ak-r8-2-glow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="agreekit Concept 2: The Continuous Capital A Inversion"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={plateGrad} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0b111e" />
          <stop offset="1" stopColor="#05070c" />
        </linearGradient>
        <linearGradient id={neutralBezelGrad} x1="9" y1="12" x2="53" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f8fafc" />
          <stop offset="0.5" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
        <linearGradient id={pyBlueTraceGrad} x1="14" y1="44" x2="55" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563eb" />
          <stop offset="0.55" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#93c5fd" />
        </linearGradient>
        <linearGradient id={pyYellowDotGrad} x1="52" y1="11" x2="57" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffd43b" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <radialGradient id={emitterGlow} cx="32" cy="34" r="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" stopOpacity="0.2" />
          <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {withPlate && (
        <>
          <rect width="64" height="64" rx="14" fill={`url(#${plateGrad})`} />
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="62.5"
            rx="13.25"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
          />
        </>
      )}

      {/* Exact 180° Rotation of OWV Concept 02 Continuous O-W-V Trace */}
      <g transform="rotate(180 32 32)">
        <circle cx="32" cy="34" r="17" fill={`url(#${emitterGlow})`} />

        {/* Watch Strap Lugs */}
        <path d="M 23 7.5 L 37 7.5 M 23 59.5 L 37 59.5" stroke="rgba(148,163,184,0.4)" strokeWidth="3" strokeLinecap="round" />

        {/* Neutral Brushed Slate-Silver Bezel */}
        <path
          d="M 49.6 41.8 A 21 21 0 1 1 43.5 17.9"
          stroke={`url(#${neutralBezelGrad})`}
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Continuous Capital 'A' Inversion Trace in Pythonic Blue */}
        <path
          d="M 14.5 33.5 L 18.5 33.5 L 23 23.5 L 28 35.5 L 33 23.5 L 38.5 44 L 54.5 13.5"
          stroke={`url(#${pyBlueTraceGrad})`}
          strokeWidth="5.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pythonic Yellow Terminal Node Accent Dot */}
        <circle cx="54.5" cy="13.5" r="3.2" fill={`url(#${pyYellowDotGrad})`} />
      </g>
    </svg>
  );
}

/**
 * agreekit Concept 03 (Round 8): "The Hero-Triad 180° Twin (Sky + Emerald + Purple)"
 * Exact 180° rotation of OWV Concept 03 in the full Hero Headline palette:
 * - Sky-400 Bezel + Emerald-400 Wave + Hero Indigo-Purple (#818cf8) Accent Dot.
 * - Symmetrical metrological ground-truth datum line.
 */
export function AgreekitConcept3Equilibrium({
  size = 64,
  withPlate = false,
  className = '',
  ...props
}: AbstractLogoProps) {
  const uid = useId().replace(/:/g, '');
  const plateGrad = `ak-r8-3-plate-${uid}`;
  const bezelGrad = `ak-r8-3-bezel-${uid}`;
  const emeraldWaveGrad = `ak-r8-3-emerald-${uid}`;
  const purpleDotGrad = `ak-r8-3-dot-${uid}`;
  const heroGlow = `ak-r8-3-glow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="agreekit Concept 3: The Hero-Triad 180-Degree Twin"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id={plateGrad} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0b111e" />
          <stop offset="1" stopColor="#05070c" />
        </linearGradient>
        <linearGradient id={bezelGrad} x1="9" y1="12" x2="53" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0f2fe" />
          <stop offset="0.5" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id={emeraldWaveGrad} x1="15" y1="43" x2="54" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="0.6" stopColor="#34d399" />
          <stop offset="1" stopColor="#6ee7b7" />
        </linearGradient>
        <linearGradient id={purpleDotGrad} x1="52" y1="11" x2="57" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c084fc" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
        <radialGradient id={heroGlow} cx="32" cy="34" r="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" stopOpacity="0.22" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
      </defs>

      {withPlate && (
        <>
          <rect width="64" height="64" rx="14" fill={`url(#${plateGrad})`} />
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="62.5"
            rx="13.25"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
          />
        </>
      )}

      {/* Exact 180° Rotation of OWV 03 in Hero Headline Palette */}
      <g transform="rotate(180 32 32)">
        <circle cx="32" cy="34" r="17" fill={`url(#${heroGlow})`} />

        {/* Clinical Ground-Truth Horizon Guidelines */}
        <line x1="12" y1="34.5" x2="21" y2="34.5" stroke="rgba(56,189,248,0.3)" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />
        <line x1="43" y1="34.5" x2="51" y2="34.5" stroke="rgba(56,189,248,0.3)" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />

        {/* Watch Strap Lugs */}
        <path d="M 23 7.5 L 37 7.5 M 23 59.5 L 37 59.5" stroke="rgba(148,163,184,0.45)" strokeWidth="3" strokeLinecap="round" />

        {/* The 'O' Bezel in Sky-400 */}
        <path
          d="M 49.6 41.8 A 21 21 0 1 1 43.5 17.9"
          stroke={`url(#${bezelGrad})`}
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Emerald-400 Wave Checkmark */}
        <path
          d="M 15.5 34.5 L 21 34.5 L 24.2 27.5 L 29.8 43 L 54.5 14"
          stroke={`url(#${emeraldWaveGrad})`}
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hero Indigo-Purple Accent Dot */}
        <circle cx="54.5" cy="14" r="3.4" fill={`url(#${purpleDotGrad})`} />
      </g>
    </svg>
  );
}

/* ============================================================================
 * ARCHIVED ROUNDS (ROUNDS 7, 6, 5, 3, 2, AND 1 FOR COMPARISON)
 * ============================================================================ */

export function OwvRound7HeroTriad({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 7 Hero Triad" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
      <path d="M 23.2 35.6 L 32 19.5 L 40.8 35.6" stroke="#818cf8" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 14.5 19.5 L 32 52 L 54.5 10.5" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OwvRound7NeutralBezel({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 7 Neutral Bezel" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
      <path d="M 23.2 35.6 L 32 19.5 L 40.8 35.6" stroke="#818cf8" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 14.5 19.5 L 32 52 L 54.5 10.5" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OwvRound7SkyIndigo({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 7 Sky Indigo" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
      <path d="M 23.2 35.6 L 32 19.5 L 40.8 35.6" stroke="#38bdf8" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 14.5 19.5 L 32 52 L 54.5 10.5" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AgreekitRound7NeutralPythonic({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 7 Neutral Pythonic" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <g transform="rotate(180 32 32)">
        <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
        <path d="M 23.2 35.6 L 32 19.5 L 40.8 35.6" stroke="#ffd43b" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 14.5 19.5 L 32 52 L 54.5 10.5" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function AgreekitRound7HeroTwin({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 7 Hero Twin" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <g transform="rotate(180 32 32)">
        <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
        <path d="M 23.2 35.6 L 32 19.5 L 40.8 35.6" stroke="#818cf8" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 14.5 19.5 L 32 52 L 54.5 10.5" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function AgreekitRound7WarmGraphite({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 7 Warm Graphite" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <g transform="rotate(180 32 32)">
        <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
        <path d="M 23.2 35.6 L 32 19.5 L 40.8 35.6" stroke="#ffd43b" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 14.5 19.5 L 32 52 L 54.5 10.5" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function OwvRound6DepartingW({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 6 Departing W" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
      <path d="M 23.2 35.6 L 32 19.5 L 40.8 35.6" stroke="#fbbf24" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 14.5 19.5 L 32 52 L 54.5 10.5" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AgreekitRound6InvertedA({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 6 Inverted A" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <g transform="rotate(180 32 32)">
        <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
        <path d="M 23.2 35.6 L 32 19.5 L 40.8 35.6" stroke="#ffd43b" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 14.5 19.5 L 32 52 L 54.5 10.5" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function OwvRound6Curved({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 6 Curved" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
      <path d="M 22.8 34.8 C 26.5 26, 28.2 19.5, 32 19.5 C 35.8 19.5, 37.5 26, 41.2 34.8" stroke="#fbbf24" strokeWidth="4.8" strokeLinecap="round" />
      <path d="M 14.5 19.5 L 32 52 L 54.5 10.5" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OwvRound6Stencil({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 6 Stencil" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
      <path d="M 14.5 19.5 L 32 52.5 L 54.5 10.5" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 25.2 31.5 L 32 19 L 38.8 31.5" stroke="#38bdf8" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AgreekitRound6WaveA({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 6 Wave A" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <g transform="rotate(180 32 32)">
        <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
        <path d="M 22.8 34.8 C 26.5 26, 28.2 19.5, 32 19.5 C 35.8 19.5, 37.5 26, 41.2 34.8" stroke="#ffd43b" strokeWidth="4.8" strokeLinecap="round" />
        <path d="M 14.5 19.5 L 32 52 L 54.5 10.5" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function AgreekitRound6StencilA({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 6 Stencil A" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <g transform="translate(0 64) scale(1 -1)">
        <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
        <path d="M 14.5 19.5 L 32 52.5 L 54.5 10.5" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 25.2 31.5 L 32 19 L 38.8 31.5" stroke="#ffd43b" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function OwvRound5Collinear({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 5 Collinear" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
      <path d="M 14.5 19.5 L 23.2 35.5 L 32 19.5 L 40.8 35.5 L 54.5 10.5" stroke="#ffffff" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 25.4 39.5 L 32 51.6 L 38.6 39.5" stroke="#10b981" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OwvRound5Cradle({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 5 Cradle" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
      <path d="M 15.5 19 L 23.8 34.5 L 32 19.5 L 40.2 34.5 L 54.5 10" stroke="#38bdf8" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 19.5 37.5 L 32 52.5 L 44.5 37.5" stroke="#10b981" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OwvRound5Docked({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 5 Docked" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 52.8 38.5 A 21.5 21.5 0 1 1 43.2 15.6" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
      <path d="M 18 37.5 L 32 54.5 L 46 37.5" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 13.5 23 L 23.2 35.5 L 32 20.5 L 40.8 35.5 L 55 10.5" stroke="#fbbf24" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AgreekitRound5WhoopSpine({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 5 WHOOP Spine" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <rect x="29.25" y="10" width="5.5" height="16.5" rx="2.75" fill="#38bdf8" />
      <rect x="29.25" y="44.5" width="5.5" height="8" rx="2.75" fill="#ffd43b" />
      <path d="M 9 36.5 C 9 21.5, 24 21.5, 28.5 29.5 L 35.5 41.5 L 54 50.5" stroke="#38bdf8" strokeWidth="5.2" strokeLinecap="round" />
      <path d="M 27 43.5 L 37 28.5" stroke="#070a12" strokeWidth="8.2" strokeLinecap="round" />
      <path d="M 9 36.5 C 9 51.5, 24 51.5, 28.5 42.5 L 35.5 30.5 L 54 21.5" stroke="#ffd43b" strokeWidth="5.2" strokeLinecap="round" />
      <rect x="27.25" y="24.5" width="9.5" height="23" rx="4" fill="rgba(7,10,18,0.35)" stroke="#38bdf8" strokeWidth="2.8" />
    </svg>
  );
}

export function AgreekitRound5SinusoidalWhoop({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 5 Sinusoidal WHOOP" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <rect x="28.5" y="10" width="7" height="42.5" rx="3.5" fill="#070a12" stroke="#38bdf8" strokeWidth="3.2" />
      <path d="M 9 36.5 C 9 21.5, 23 21.5, 28 30.5 C 31 35.5, 33 36.5, 36 41.5 C 40 48, 46 50.5, 54.5 50.5" stroke="#38bdf8" strokeWidth="5.2" strokeLinecap="round" />
      <path d="M 27.5 42.5 L 36.5 29.5" stroke="#070a12" strokeWidth="7.8" strokeLinecap="round" />
      <path d="M 9 36.5 C 9 51.5, 23 51.5, 28 41.5 C 31 36.5, 33 35.5, 36 30.5 C 40 24, 46 21.5, 54.5 21.5" stroke="#ffd43b" strokeWidth="5.2" strokeLinecap="round" />
    </svg>
  );
}

export function AgreekitRound5WovenWhoop({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 5 Woven WHOOP" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <rect x="29" y="9.5" width="6" height="16" rx="2" fill="#ffd43b" />
      <rect x="29" y="45.5" width="6" height="7.5" rx="2" fill="#38bdf8" />
      <path d="M 9 36 C 9 21.5, 23.5 21.5, 28 29 L 36 42 L 54 50.5" stroke="#38bdf8" strokeWidth="5.2" strokeLinecap="round" />
      <path d="M 9 36 C 9 50.5, 23.5 50.5, 28 42 L 36 29 L 54 21.5" stroke="#ffd43b" strokeWidth="5.2" strokeLinecap="round" />
      <rect x="27" y="25" width="10" height="21" rx="3.5" fill="#070a12" stroke="#38bdf8" strokeWidth="3" />
      <path d="M 28.5 30 L 35.5 41" stroke="#38bdf8" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M 28.5 41 L 35.5 30" stroke="#ffd43b" strokeWidth="4.4" strokeLinecap="round" />
    </svg>
  );
}

export function OwvRound3Asymmetric({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 3 Asymmetric" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 23 7.5 L 37 7.5 M 23 59.5 L 37 59.5" stroke="rgba(148,163,184,0.45)" strokeWidth="3" strokeLinecap="round" />
      <path d="M 50.2 41.2 A 21.2 21.2 0 1 1 43.2 17.5" stroke="#38bdf8" strokeWidth="5.2" strokeLinecap="round" />
      <path d="M 14.5 27 L 21.5 43.5 L 29.5 28" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 29.5 28 L 37.5 43.5 L 54.5 13.5" stroke="#34d399" strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="29.5" cy="28" r="2.3" fill="#ffffff" />
      <circle cx="54.5" cy="13.5" r="3" fill="#fbbf24" />
    </svg>
  );
}

export function OwvRound3Sequential({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 3 Sequential" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 50.8 40.5 A 21.5 21.5 0 1 1 42.2 16.5" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
      <path d="M 13.5 27 L 17.8 40.5 L 22.8 28.5 L 27.8 40.5 L 32.8 25" stroke="#38bdf8" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 32.8 25 L 39.5 45 L 55.5 13.5" stroke="#34d399" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="55.5" cy="13.5" r="3" fill="#fbbf24" />
    </svg>
  );
}

export function OwvRound3Concentric({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 3 Concentric" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 51.5 41 A 21.5 21.5 0 1 1 43.5 16.5" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
      <path d="M 16.5 23.5 L 23 35 L 29.5 24.5 L 36 35 L 42.5 23.5" stroke="#bae6fd" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 19.5 39 L 31 50 L 55 14" stroke="#34d399" strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="55" cy="14" r="3" fill="#fbbf24" />
    </svg>
  );
}

export function AgreekitRound3Sinusoidal({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 3 Sinusoidal ak" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 27 27 C 22.5 20.5, 9 21.5, 9 35.5 C 9 49.5, 22.5 50.5, 27 43.5" stroke="#38bdf8" strokeWidth="5.2" strokeLinecap="round" />
      <path d="M 27.5 22 L 27.5 45.5 C 27.5 48.5, 29.5 49.5, 32 49.5" stroke="#fbbf24" strokeWidth="5.2" strokeLinecap="round" />
      <path d="M 38.5 12.5 L 38.5 49.5" stroke="#38bdf8" strokeWidth="5.4" strokeLinecap="round" />
      <path d="M 54.5 22.5 C 46.5 22.5, 43 32, 39.5 35.5 C 43 39, 46.5 49.5, 54.5 49.5" stroke="#fbbf24" strokeWidth="5.2" strokeLinecap="round" />
      <circle cx="39.5" cy="35.5" r="3.2" fill="#070a12" stroke="#ffffff" strokeWidth="2.8" />
    </svg>
  );
}

export function AgreekitRound3TwinRibbon({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 3 Twin Ribbon ak" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 26.5 26 C 21 20, 8.5 22, 8.5 36 C 8.5 49, 21.5 50.5, 27.5 43.5 L 38.5 12.5 L 38.5 50" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 26.5 22 L 26.5 45 C 26.5 50.5, 33 50.5, 39.5 36.5 L 53.5 23.5 M 39.5 36.5 L 54 50" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="39.5" cy="36.5" r="3.2" fill="#ffffff" />
    </svg>
  );
}

export function AgreekitRound3SharedSpine({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 3 Shared Spine ak" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 31 48.5 C 10.5 48.5, 10.5 23.5, 31 23.5 C 39 23.5, 42 35.5, 53.5 25" stroke="#38bdf8" strokeWidth="5.2" strokeLinecap="round" />
      <path d="M 15.5 44 C 22 50.5, 31 46, 32.5 36.5 C 40 36.5, 43.5 48.5, 53.5 47" stroke="#fbbf24" strokeWidth="5.2" strokeLinecap="round" />
      <line x1="31" y1="12" x2="31" y2="50.5" stroke="#ffffff" strokeWidth="5.6" strokeLinecap="round" />
      <rect x="46" y="21" width="8.5" height="30" rx="4.25" stroke="#ffffff" strokeWidth="3" fill="rgba(7, 10, 18, 0.55)" />
    </svg>
  );
}

export function OwvRound2PulseRing({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 2 Verified Pulse Ring" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 23 7.5 L 37 7.5 M 23 59.5 L 37 59.5" stroke="rgba(148,163,184,0.45)" strokeWidth="3" strokeLinecap="round" />
      <path d="M 49.6 41.8 A 21 21 0 1 1 43.5 17.9" stroke="#38bdf8" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M 15.5 34.5 L 21 34.5 L 24.2 27.5 L 29.8 43 L 54.5 14" stroke="#34d399" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="54.5" cy="14" r="3" fill="#fbbf24" />
    </svg>
  );
}

export function OwvRound2CaliperLock({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 2 Caliper Lock" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 18 11 L 12 11 A 4.5 4.5 0 0 0 7.5 15.5 L 7.5 48.5 A 4.5 4.5 0 0 0 12 53 L 18 53 M 46 11 L 52 11 A 4.5 4.5 0 0 1 56.5 15.5 L 56.5 48.5 A 4.5 4.5 0 0 1 52 53 L 46 53" stroke="#cbd5e1" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M 14.5 19.5 C 24 19.5, 26.5 32, 45.5 32" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
      <path d="M 14.5 44.5 C 24 44.5, 26.5 32, 45.5 32" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" />
      <circle cx="46" cy="32" r="6" fill="#070a12" stroke="#ffffff" strokeWidth="3.5" />
      <circle cx="46" cy="32" r="2.6" fill="#10b981" />
    </svg>
  );
}

export function OwvRound2Shield({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 2 Biometric Shield" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <rect x="22" y="4.5" width="20" height="4.5" rx="2.25" fill="#38bdf8" opacity="0.55" />
      <rect x="24" y="55" width="16" height="4.5" rx="2.25" fill="#2563eb" opacity="0.55" />
      <path d="M 21 11.5 L 43 11.5 A 8.5 8.5 0 0 1 51.5 20 L 51.5 32.5 C 51.5 42.5, 42 49, 32 53 C 22 49, 12.5 42.5, 12.5 32.5 L 12.5 20 A 8.5 8.5 0 0 1 21 11.5 Z" stroke="#38bdf8" strokeWidth="4.4" />
      <path d="M 17.5 33 L 23.5 33 L 28.5 20.5 L 34.5 41 L 39.5 27.5 L 42.5 33 L 46.5 33" stroke="#34d399" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="28.5" cy="20.5" r="2.8" fill="#fbbf24" />
    </svg>
  );
}

export function AgreekitRound2EquivalenceA({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 2 Equivalence A" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <line x1="13.5" y1="52.5" x2="32" y2="10.5" stroke="#38bdf8" strokeWidth="6.2" strokeLinecap="round" />
      <line x1="50.5" y1="52.5" x2="32" y2="10.5" stroke="#fbbf24" strokeWidth="6.2" strokeLinecap="round" />
      <path d="M 16.5 33.5 C 22.5 28.5, 27 28.5, 32 33.5 C 37 38.5, 41.5 38.5, 47.5 33.5" stroke="#ffffff" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M 14 42.5 C 21.5 37.5, 27 37.5, 32 42.5 C 37 47.5, 42.5 47.5, 50 42.5" stroke="#fbbf24" strokeWidth="4.4" strokeLinecap="round" />
      <circle cx="32" cy="10.5" r="3.4" fill="#ffffff" />
    </svg>
  );
}

export function AgreekitRound2BlandAltman({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 2 Bland-Altman Corridor" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 10 19 L 10 13.5 L 54 13.5 L 54 19" stroke="#fbbf24" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 10 45 L 10 50.5 L 54 50.5 L 54 45" stroke="#38bdf8" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 10 32 C 15.5 18, 22 46, 28.5 32 C 33.5 22, 38.5 40, 43.5 32 L 54 32" stroke="#ffffff" strokeWidth="4.8" strokeLinecap="round" />
      <circle cx="50" cy="32" r="4.2" fill="#070a12" stroke="#ffffff" strokeWidth="3.2" />
    </svg>
  );
}

export function AgreekitRound2PairedBraid({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 2 Paired Braid" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 10 17 C 21 17, 23 40, 34 40 C 41 40, 43 27.5, 55 27.5" stroke="#38bdf8" strokeWidth="5.4" strokeLinecap="round" />
      <path d="M 10 47 C 21 47, 23 24, 34 24 C 41 24, 43 36.5, 55 36.5" stroke="#fbbf24" strokeWidth="5.4" strokeLinecap="round" />
      <circle cx="10" cy="17" r="3.4" fill="#38bdf8" />
      <circle cx="10" cy="47" r="3.4" fill="#fbbf24" />
      <rect x="45.5" y="21.5" width="9" height="21" rx="4.5" stroke="#ffffff" strokeWidth="3.2" fill="rgba(7, 10, 18, 0.55)" />
    </svg>
  );
}

export function OwvRound1Aperture({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 1 Isometric Aperture" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 10 41.5 L 10 19.2 L 32 6.5 L 50.2 17 L 41.2 22.2 L 32 16.9 L 19 24.4 L 19 46.7 Z" fill="#e0f2fe" />
      <path d="M 54 22.5 L 54 44.8 L 32 57.5 L 13.8 47 L 22.8 41.8 L 32 47.1 L 45 39.6 L 45 17.3 Z" fill="#0284c7" />
      <path d="M 32 23.6 L 39.3 27.8 L 32 32 L 24.7 27.8 Z" fill="#34d399" />
      <path d="M 32 32 L 39.3 27.8 L 39.3 36.2 L 32 40.4 Z" fill="#10b981" />
      <path d="M 32 32 L 24.7 27.8 L 24.7 36.2 L 32 40.4 Z" fill="#065f46" />
    </svg>
  );
}

export function OwvRound1Eclipse({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 1 Eclipse" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 12.2 46.8 A 25 25 0 0 1 46.8 12.2 L 39 20 A 14 14 0 0 0 20 39 Z" fill="#bae6fd" />
      <path d="M 50.2 19.4 A 21.5 21.5 0 0 1 19.4 50.2 L 24.6 45 A 14 14 0 0 0 45 24.6 Z" fill="#06b6d4" />
      <circle cx="33.2" cy="30.8" r="6.4" fill="#fbbf24" />
    </svg>
  );
}

export function OwvRound1Monolith({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="OWV Round 1 Monolith" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 22 8 L 44 8 L 53 17 L 31 17 L 23 25 L 14 16 Z" fill="#f8fafc" />
      <path d="M 56 22 L 56 44 L 47 53 L 47 31 L 39 23 L 48 14 Z" fill="#38bdf8" />
      <path d="M 42 56 L 20 56 L 11 47 L 33 47 L 41 39 L 50 48 Z" fill="#0284c7" />
      <path d="M 8 42 L 8 20 L 17 11 L 17 33 L 25 41 L 16 50 Z" fill="#fbbf24" />
      <polygon points="32,27.5 36.5,32 32,36.5 27.5,32" fill="#ffffff" />
    </svg>
  );
}

export function AgreekitRound1Mobius({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 1 Mobius" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 22 44 L 15 37 A 11 11 0 0 1 30.5 21.5 L 44.5 35.5" stroke="#38bdf8" strokeWidth="7.5" strokeLinecap="round" />
      <path d="M 42 20 L 49 27 A 11 11 0 0 1 33.5 42.5 L 19.5 28.5" stroke="#fbbf24" strokeWidth="7.5" strokeLinecap="round" />
      <rect x="29.2" y="29.2" width="5.6" height="5.6" rx="1.2" transform="rotate(45 32 32)" fill="#ffffff" />
    </svg>
  );
}

export function AgreekitRound1PhaseArray({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 1 Phase Array" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <g transform="rotate(-28 32 32)">
        <rect x="13" y="13" width="16" height="6.5" rx="3.25" fill="#38bdf8" />
        <rect x="33" y="13" width="14" height="6.5" rx="3.25" fill="#ffffff" />
        <rect x="8" y="23.5" width="21" height="6.5" rx="3.25" fill="#38bdf8" />
        <rect x="33" y="23.5" width="23" height="6.5" rx="3.25" fill="#fbbf24" />
        <rect x="8" y="34" width="23" height="6.5" rx="3.25" fill="#38bdf8" />
        <rect x="35" y="34" width="21" height="6.5" rx="3.25" fill="#fbbf24" />
        <rect x="17" y="44.5" width="14" height="6.5" rx="3.25" fill="#ffffff" />
        <rect x="35" y="44.5" width="16" height="6.5" rx="3.25" fill="#fbbf24" />
      </g>
    </svg>
  );
}

export function AgreekitRound1Equilibrium({ size = 64, withPlate = false, className = '', ...props }: AbstractLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="agreekit Round 1 Equilibrium" className={className} {...props}>
      {withPlate && <rect width="64" height="64" rx="14" fill="#080c16" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />}
      <path d="M 14 37 L 14 23 A 10 10 0 0 1 24 13 L 45 13" stroke="#38bdf8" strokeWidth="6.5" strokeLinecap="round" />
      <circle cx="48" cy="13" r="4.8" fill="#38bdf8" />
      <path d="M 50 27 L 50 41 A 10 10 0 0 1 40 51 L 19 51" stroke="#fbbf24" strokeWidth="6.5" strokeLinecap="round" />
      <circle cx="16" cy="51" r="4.8" fill="#fbbf24" />
      <line x1="22" y1="22" x2="42" y2="42" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="5.2" fill="#070a12" stroke="#ffffff" strokeWidth="3.2" />
    </svg>
  );
}

/* ============================================================================
 * PART 3: DARK-MODE BRAND MARK SHOWCASE GRID (LogoConcepts.tsx)
 * ============================================================================ */

interface ConceptDescriptor {
  id: string;
  round: 1 | 2 | 3 | 5 | 6 | 7 | 8;
  brand: 'owv' | 'agreekit';
  brandLabel: string;
  wordmark: string;
  badge: string;
  title: string;
  subtitle: string;
  identityLink: string;
  rationale: string;
  accentGlow: string;
  borderHover: string;
  badgeClasses: string;
  Component: React.ComponentType<AbstractLogoProps>;
}

export const LOGO_CONCEPTS: ConceptDescriptor[] = [
  // ROUND 8 (DEFAULT): R2-01 REFINED STYLING (CLEAN SINGLE-STROKE CONTINUITY & 180° TWINS)
  {
    id: 'owv-r8-01-pure-pulse',
    round: 8,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 8 • 01',
    title: 'The Pure Pulse Aperture',
    subtitle: 'Direct R2-01 Evolution: 5.5px Open Bezel + Fluid Pulse Checkmark + Accent Node',
    identityLink: 'Open Bezel ("O") + Systolic Pulse ("W") + Validation Dip ("V") in 1 Fluid Stroke',
    rationale:
      'Direct evolution of the beloved Round 2 • 01 geometry: an open smartwatch bezel framing an athletic 5.5px physiological pulse checkmark that surges through the bezel opening to an amber terminal node.',
    accentGlow: 'from-sky-500/25 via-emerald-400/20 to-amber-500/20',
    borderHover: 'hover:border-emerald-400/60 hover:shadow-[0_0_55px_-12px_rgba(16,185,129,0.45)]',
    badgeClasses: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    Component: OwvConcept1Aperture,
  },
  {
    id: 'owv-r8-02-continuous-owv',
    round: 8,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 8 • 02',
    title: 'The Continuous O-W-V Trace',
    subtitle: 'One Fluid 5.2px Vector Weaving Double Systolic Peak ("W") into Validation Check ("V")',
    identityLink: 'Zero Overlapping Shapes // Complete "O-W-V" in a Single Unbroken Trace',
    rationale:
      'Eliminates all intersecting line crowding by weaving the "W" double peak seamlessly into the deep "V" validation dip in one continuous athletic stroke, culminating at the upper-right aperture.',
    accentGlow: 'from-emerald-500/25 via-sky-400/20 to-teal-500/20',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.45)]',
    badgeClasses: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    Component: OwvConcept2Eclipse,
  },
  {
    id: 'owv-r8-03-hero-triad-pulse',
    round: 8,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 8 • 03',
    title: 'The Hero-Triad Verified Pulse',
    subtitle: 'Sky Bezel + Emerald Pulse Checkmark + Hero Indigo-Purple Terminal Accent Node',
    identityLink: 'R2-01 Architecture with HomePage Hero Headline Triad Palette',
    rationale:
      'Unites the uncluttered R2-01 pulse geometry with the HomePage Hero Headline palette: Sky-400 bezel, Emerald-400 validation stroke, and Hero Indigo-Purple (#818cf8) terminal node over clinical datum guides.',
    accentGlow: 'from-sky-500/25 via-indigo-500/20 to-emerald-400/25',
    borderHover: 'hover:border-indigo-400/60 hover:shadow-[0_0_55px_-12px_rgba(129,140,248,0.45)]',
    badgeClasses: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    Component: OwvConcept3Monolith,
  },
  {
    id: 'ak-r8-01-pythonic-inversion',
    round: 8,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 8 • 01',
    title: 'The Pythonic Inversion (180° Twin)',
    subtitle: 'Exact 180° Rotation of OWV 01 with Neutral Brushed Slate-Silver Bezel',
    identityLink: '180° Inverted R2-01 Twin // Neutral Bezel Eliminates Blue-on-Blue Clash',
    rationale:
      'Exact 180° rotation of OWV 01 in Pythonic Blue and Yellow: the neutral brushed slate bezel creates optical breathing room so the inverted blue vector and yellow terminal dot pop with razor contrast.',
    accentGlow: 'from-sky-500/25 via-amber-400/20 to-slate-400/20',
    borderHover: 'hover:border-amber-400/60 hover:shadow-[0_0_55px_-12px_rgba(245,158,11,0.4)]',
    badgeClasses: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    Component: AgreekitConcept1Mobius,
  },
  {
    id: 'ak-r8-02-capital-a-inversion',
    round: 8,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 8 • 02',
    title: 'The Continuous Capital "A" Inversion',
    subtitle: 'Exact 180° Rotation of OWV 02: Inverted "V" Soars as Capital "A" Apex',
    identityLink: '180° Inverted OWV 02 // Stylized Capital "A" with Pythonic Yellow Node',
    rationale:
      'Rotating the Continuous O-W-V trace 180° inverts the deep validation dip into a soaring Capital "A" apex, while the double peak becomes the horizontal structural support in Pythonic Blue.',
    accentGlow: 'from-sky-500/25 via-blue-500/20 to-amber-400/20',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.45)]',
    badgeClasses: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    Component: AgreekitConcept2PhaseArray,
  },
  {
    id: 'ak-r8-03-hero-triad-inversion',
    round: 8,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 8 • 03',
    title: 'The Hero-Triad 180° Twin',
    subtitle: 'Exact 180° Rotation of OWV 03 in Full Hero Headline Sky + Emerald + Purple',
    identityLink: '100% Identical R2-01 Hero Palette & Geometry Rotated 180°',
    rationale:
      'Literal 180° twin of OWV Concept 03 in the exact Hero Headline triad: Sky-400 bezel, Emerald-400 validation stroke, and Hero Indigo-Purple terminal accent node.',
    accentGlow: 'from-indigo-500/25 via-emerald-400/20 to-sky-400/25',
    borderHover: 'hover:border-indigo-400/60 hover:shadow-[0_0_55px_-12px_rgba(129,140,248,0.45)]',
    badgeClasses: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    Component: AgreekitConcept3Equilibrium,
  },

  // ROUND 7 ARCHIVE: HERO-HEADLINE PURPLE FOR OWV & NEUTRAL BEZEL FOR AGREEKIT
  {
    id: 'owv-r7-01-hero-triad',
    round: 7,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 7 • 01',
    title: 'The Hero-Triad OWV (Sky + Emerald + Purple)',
    subtitle: 'Matches HomePage Hero Headline: Sky-400 Bezel + Emerald-400 "V" + Indigo-Purple "W" Peak',
    identityLink: 'Hero Headline Triad // Sky-400 + Emerald-400 + Indigo-400',
    rationale:
      'Replaces the legacy gold "W" peak with the Indigo-to-Purple (#6366F1 → #818CF8 → #C084FC) from the HomePage Hero Headline gradient (`from-sky-400 via-emerald-400 to-indigo-400`), uniting the logo with the site hero.',
    accentGlow: 'from-sky-500/25 via-emerald-400/20 to-indigo-500/25',
    borderHover: 'hover:border-indigo-400/60 hover:shadow-[0_0_55px_-12px_rgba(129,140,248,0.45)]',
    badgeClasses: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    Component: OwvRound7HeroTriad,
  },
  {
    id: 'owv-r7-02-neutral-bezel-hero',
    round: 7,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 7 • 02',
    title: 'The Neutral-Bezel Hero OWV',
    subtitle: 'Brushed Slate-Silver Bezel ("O") + Emerald Ground-Truth "V" + Indigo-Purple "W" Peak',
    identityLink: 'Shared Neutral Hardware Bezel + Emerald "V" & Hero Purple "W"',
    rationale:
      'Uses the same neutral Brushed Slate-Silver wearable bezel (#F8FAFC → #94A3B8 → #475569) as agreekit 01, so both brands share a neutral hardware ring while their interior vectors carry their two signature colors.',
    accentGlow: 'from-emerald-500/25 via-indigo-500/20 to-purple-500/25',
    borderHover: 'hover:border-emerald-400/60 hover:shadow-[0_0_55px_-12px_rgba(16,185,129,0.4)]',
    badgeClasses: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    Component: OwvRound7NeutralBezel,
  },
  {
    id: 'owv-r7-03-neutral-sky-indigo',
    round: 7,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 7 • 03',
    title: 'The Neutral-Bezel Sky & Indigo OWV',
    subtitle: 'Brushed Slate-Silver Bezel + Emerald-White "V" + Sky-to-Indigo Gradient "W" Peak',
    identityLink: 'Neutral Bezel + Full Hero Gradient ("sky-400 -> indigo-400") Inside',
    rationale:
      'Frames all three Hero Headline hues inside a neutral Brushed Slate-Silver bezel by rendering the departing "W" peak as a Sky-to-Indigo-Purple gradient (#38BDF8 → #818CF8 → #C084FC) against the Emerald-to-White Ground-Truth "V".',
    accentGlow: 'from-sky-500/25 via-indigo-500/20 to-emerald-400/20',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.45)]',
    badgeClasses: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    Component: OwvRound7SkyIndigo,
  },
  {
    id: 'ak-r7-01-neutral-bezel-pythonic',
    round: 7,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 7 • 01',
    title: 'The Neutral-Bezel Pythonic "A"',
    subtitle: 'Neutral Brushed Slate-Silver Bezel + Pythonic Blue Capital "A" + Pythonic Yellow Crossbar',
    identityLink: 'Neutral Bezel Solves Blue-on-Blue Collision // Pure Pythonic "A" Inside',
    rationale:
      'Replacing the blue bezel with a neutral Brushed Slate-Silver ring (#F8FAFC → #94A3B8 → #475569) eliminates the blue-on-blue collision at the apex and lets the Pythonic Blue Capital "A" and Pythonic Yellow crossbar pop cleanly.',
    accentGlow: 'from-sky-500/25 via-amber-400/20 to-slate-400/20',
    borderHover: 'hover:border-amber-400/60 hover:shadow-[0_0_55px_-12px_rgba(245,158,11,0.4)]',
    badgeClasses: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    Component: AgreekitRound7NeutralPythonic,
  },
  {
    id: 'ak-r7-02-hero-triad-twin',
    round: 7,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 7 • 02',
    title: 'The Hero-Triad 180° Twin (agreekit)',
    subtitle: 'Literal 180° Rotation of OWV 01 in Sky-400 Bezel + Emerald "A" + Indigo-Purple Crossbar',
    identityLink: '100% Identical Hero-Triad Palette & Geometry Rotated 180°',
    rationale:
      'Literally the exact OWV Concept 01 SVG rotated 180°: the Sky-400 bezel, Emerald-to-White Capital "A" frame, and Hero Indigo-Purple crossbar match the site Hero Headline 1:1.',
    accentGlow: 'from-indigo-500/25 via-emerald-400/20 to-sky-400/25',
    borderHover: 'hover:border-indigo-400/60 hover:shadow-[0_0_55px_-12px_rgba(129,140,248,0.45)]',
    badgeClasses: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    Component: AgreekitRound7HeroTwin,
  },
  {
    id: 'ak-r7-03-warm-graphite-pythonic',
    round: 7,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 7 • 03',
    title: 'The Warm-Graphite Bezel Pythonic "A"',
    subtitle: 'Subtle Matte Graphite-Slate Bezel + High-Saturation Pythonic Blue & Yellow Capital "A"',
    identityLink: 'Recessed Matte Graphite Bezel // Maximum Focus on Pythonic "A"',
    rationale:
      'Steps the neutral bezel down to a quieter matte graphite-slate (#E2E8F0 → #64748B → #334155) so the circular bezel acts as a subtle framing halo while the Pythonic Blue & Yellow Capital "A" dominates.',
    accentGlow: 'from-amber-500/25 via-sky-500/20 to-slate-500/20',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.45)]',
    badgeClasses: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    Component: AgreekitRound7WarmGraphite,
  },

  // ROUND 6 ARCHIVE: ONE-PIECE GROUND-TRUTH 'V' + DEPARTING 'W' SIGNAL & UPSIDE-DOWN CAPITAL 'A' INVERSION
  {
    id: 'owv-r6-01-departing-w',
    round: 6,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 6 • 01',
    title: 'The Ground-Truth "V" & Departing "W" Signal',
    subtitle: 'One-Piece Ground-Truth "V" + Contrasting Central "W" Peak Departing & Returning',
    identityLink: 'Unbroken Ground-Truth "V" + Departing Amber Signal Completing the "W"',
    rationale:
      'The "V" is a single unbroken Emerald-to-White ground-truth vector (breaking out of the open "O" bezel), while the non-overlapping central peak of the "W" is rendered in contrasting Amber-Gold so it reads as a signal departing from and returning to ground truth.',
    accentGlow: 'from-emerald-500/25 via-sky-400/20 to-amber-500/20',
    borderHover: 'hover:border-emerald-400/60 hover:shadow-[0_0_55px_-12px_rgba(16,185,129,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound6DepartingW,
  },
  {
    id: 'owv-r6-02-curved-departure',
    round: 6,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 6 • 02',
    title: 'The Curved Signal-Departure "W-V" Roundel',
    subtitle: 'Linear One-Piece Ground-Truth "V" + Curved Systolic Wave Forming Center of "W"',
    identityLink: 'Rigid Metrological "V" + Organic Systolic Wave Crest Completing "W"',
    rationale:
      'Contrasts a razor-straight one-piece Ground-Truth "V" against a smooth systolic wave crest for the center of the "W"—vividly showing an organic wearable signal peeling off linear ground truth and converging back.',
    accentGlow: 'from-sky-500/25 via-emerald-400/15 to-amber-500/20',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound6Curved,
  },
  {
    id: 'owv-r6-03-stencil-gap',
    round: 6,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 6 • 03',
    title: 'The Stencil-Gap Ground-Truth "V" & "W" Core',
    subtitle: 'One-Piece Ground-Truth "V" + Floating Contrasting "W" Center Chevron',
    identityLink: 'Unbroken Ground-Truth "V" + Stencil-Separated Central "W" Peak',
    rationale:
      'Separates the contrasting Sky-Cyan central "W" chevron from the unbroken Emerald-to-White Ground-Truth "V" with a crisp negative-space channel, ensuring zero junction crowding even at 16px.',
    accentGlow: 'from-sky-500/25 via-blue-500/15 to-emerald-500/20',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound6Stencil,
  },
  {
    id: 'ak-r6-01-inverted-a',
    round: 6,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 6 • 01',
    title: 'The 180° Inverted Capital "A" Monogram',
    subtitle: 'Exact Upside-Down OWV 01 in Pythonic Blue & Yellow ("WV" Becomes Capital "A")',
    identityLink: '180° Inverted OWV Mark -> Pythonic Blue "A" + Yellow Chevron Crossbar',
    rationale:
      'Rotating OWV Concept 01 upside down (180°) in strict Pythonic Blue & Yellow transforms the one-piece "V" into the ascending frame of a Capital "A", while the central "W" peak becomes the yellow V-chevron crossbar of the "A".',
    accentGlow: 'from-sky-500/25 via-amber-400/20 to-yellow-500/20',
    borderHover: 'hover:border-amber-400/60 hover:shadow-[0_0_55px_-12px_rgba(245,158,11,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound6InvertedA,
  },
  {
    id: 'ak-r6-02-wave-crossbar-a',
    round: 6,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 6 • 02',
    title: 'The Wave-Crossbar Capital "A" Inversion',
    subtitle: 'Exact Upside-Down OWV 02 -> Linear Blue "A" + Curved Yellow Wave Crossbar',
    identityLink: '180° Inverted OWV 02 -> Capital "A" with Smooth Equivalence Wave Crossbar',
    rationale:
      'Inverting OWV Concept 02 turns the straight ground-truth "V" into a sharp Pythonic Blue Capital "A" apex bridged by a smooth Pythonic Yellow wave crossbar.',
    accentGlow: 'from-sky-400/25 via-blue-500/15 to-amber-400/25',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound6WaveA,
  },
  {
    id: 'ak-r6-03-stencil-a-reflection',
    round: 6,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 6 • 03',
    title: 'The Stencil-Gap Capital "A" Reflection',
    subtitle: 'Vertical Mirror of OWV 03 -> Right Leg Breaks Bottom-Right Bezel + Stencil Crossbar',
    identityLink: 'Vertically Flipped OWV 03 -> Stencil Capital "A" in Pythonic Blue & Yellow',
    rationale:
      'Vertically reflecting OWV Concept 03 turns the "WV" into an architectural stencil Capital "A" where the floating Pythonic Yellow chevron sits cleanly inside the Pythonic Blue "A" apex.',
    accentGlow: 'from-amber-500/25 via-sky-500/15 to-yellow-500/20',
    borderHover: 'hover:border-amber-400/60 hover:shadow-[0_0_55px_-12px_rgba(251,191,36,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound6StencilA,
  },

  // ROUND 5 ARCHIVE
  {
    id: 'owv-r5-01-collinear-vw',
    round: 5,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 5 • 01',
    title: 'The Inverted-VW Bezel Break',
    subtitle: 'Collinear Volkswagen Geometry ("W" Over Symmetric "V") + Bezel-Breaking "W"',
    identityLink: 'Open "O" + Bezel-Breaking Upper "W" + Symmetric Lower "V"',
    rationale:
      'Round 5 exploration: Outer legs of the upper "W" continue across a horizontal slot into a symmetric lower "V".',
    accentGlow: 'from-emerald-500/25 via-sky-400/20 to-cyan-500/20',
    borderHover: 'hover:border-emerald-400/60 hover:shadow-[0_0_55px_-12px_rgba(16,185,129,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound5Collinear,
  },
  {
    id: 'owv-r5-02-cradle-vw',
    round: 5,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 5 • 02',
    title: 'The Parallel-Cradle Inverted-VW Roundel',
    subtitle: 'Wide Symmetric Lower "V" Cradling Upper "W" + Bezel-Breaking Right Leg',
    identityLink: 'Symmetric Lower "V" Cradle + Upper "W" Breaking Open Bezel',
    rationale:
      'Round 5 exploration: Wide symmetric lower "V" beneath the two troughs of the upper "W".',
    accentGlow: 'from-sky-500/25 via-emerald-400/15 to-cyan-500/20',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound5Cradle,
  },
  {
    id: 'owv-r5-03-docked-vw',
    round: 5,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 5 • 03',
    title: 'The Ring-Docked Inverted-VW Emblem',
    subtitle: 'Ring-Fused Symmetric Lower "V" & Left "W" Shoulder + Breaking Right "W"',
    identityLink: 'Authentic Ring-Docked VW Construction + Bezel-Breaking "W"',
    rationale:
      'Round 5 exploration: Ring-docked symmetric "V" and upper "W" with right leg breaking bezel.',
    accentGlow: 'from-sky-500/25 via-blue-500/15 to-amber-500/20',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound5Docked,
  },
  {
    id: 'ak-r5-01-whoop-spine',
    round: 5,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 5 • 01',
    title: 'The WHOOP-Band Spine "ak"',
    subtitle: '1 Blue Braid + 1 Yellow Braid Crossing Through Shared WHOOP Tracker Spine',
    identityLink: 'Central WHOOP Tracker Stem ("a"+"k") + 2-Color Braid Crossover',
    rationale:
      'Round 5 exploration: Two-color Blue & Yellow braids crossing through a central vertical WHOOP-style tracker band stem.',
    accentGlow: 'from-sky-500/25 via-amber-400/20 to-yellow-500/20',
    borderHover: 'hover:border-amber-400/60 hover:shadow-[0_0_55px_-12px_rgba(245,158,11,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound5WhoopSpine,
  },
  {
    id: 'ak-r5-02-sinusoidal-whoop',
    round: 5,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 5 • 02',
    title: 'The Sinusoidal WHOOP-Strap "ak"',
    subtitle: 'Smooth S-Curve Blue & Yellow Braids Weaving Through Full-Height Tracker Strap',
    identityLink: 'Full-Height Tracker Band Stem + Sinusoidal 2-Color "ak" Weave',
    rationale:
      'Round 5 exploration: Full-height vertical tracker strap with sinusoidal S-curve Blue and Yellow braids.',
    accentGlow: 'from-sky-400/25 via-blue-500/15 to-amber-400/25',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound5SinusoidalWhoop,
  },
  {
    id: 'ak-r5-03-woven-whoop-clasp',
    round: 5,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 5 • 03',
    title: 'The Woven WHOOP-Clasp "ak" Monogram',
    subtitle: 'Ribbed Telemetry Band & U-Buckle Spine + Visible X-Crossover Window',
    identityLink: 'Ribbed WHOOP Band Stem + Open Sensor Window Braid Crossover',
    rationale:
      'Round 5 exploration: Ribbed telemetry band stem with central U-clasp window.',
    accentGlow: 'from-amber-500/25 via-sky-500/15 to-yellow-500/20',
    borderHover: 'hover:border-amber-400/60 hover:shadow-[0_0_55px_-12px_rgba(251,191,36,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound5WovenWhoop,
  },

  // ROUND 3 ARCHIVE
  {
    id: 'owv-r3-01-asymmetric-owv',
    round: 3,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 3 • 01',
    title: 'The Asymmetric O-W-V Pulse Check',
    subtitle: 'Open Bezel ("O") + Shared-Vertex "W" Waveform & "V" Checkmark',
    identityLink: 'Open Bezel "O" + Left Cyan "W" Wave + Right Emerald "V" Check',
    rationale:
      'Round 3 exploration: Open-top circular wearable bezel ("O") with a 5-vertex "W" whose right half surges out as a "V" validation check.',
    accentGlow: 'from-emerald-500/25 via-sky-400/20 to-cyan-500/20',
    borderHover: 'hover:border-emerald-400/60 hover:shadow-[0_0_55px_-12px_rgba(16,185,129,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound3Asymmetric,
  },
  {
    id: 'owv-r3-02-sequential-owv',
    round: 3,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 3 • 02',
    title: 'The Sequential O-W-V Systolic Trace',
    subtitle: 'Open Bezel ("O") + Full 5-Point "W" Wave Flowing into "V" Check',
    identityLink: 'Open Bezel "O" + Continuous "W" Systolic Wave → "V" Validation Gate',
    rationale:
      'Round 3 exploration: Complete 5-point "W" wave on the left transitioning into a deep "V" validation checkmark on the right.',
    accentGlow: 'from-sky-500/25 via-emerald-400/15 to-amber-500/20',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound3Sequential,
  },
  {
    id: 'owv-r3-03-concentric-owv',
    round: 3,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 3 • 03',
    title: 'The Concentric O-W-V Harmonic Lock',
    subtitle: 'Open Bezel ("O") + Floating "W" Wave Cradled by "V" Checkmark',
    identityLink: 'Open Bezel "O" + Stacked Harmonic "W" Wave & Cradling "V" Check',
    rationale:
      'Round 3 exploration: Upper Sky-Cyan "W" sensor wave nested inside a cradling Emerald-to-Gold "V" validation checkmark.',
    accentGlow: 'from-sky-500/25 via-blue-500/15 to-emerald-500/25',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound3Concentric,
  },
  {
    id: 'ak-r3-01-sinusoidal-ak',
    round: 3,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 3 • 01',
    title: 'The Sinusoidal Braid "ak" Monogram',
    subtitle: 'Paired Blue & Gold Braids Forming Lowercase "a" + Sinusoidal "k"',
    identityLink: 'Braided Lowercase "a" Loop/Stem + Sinusoidal Convergence "k"',
    rationale:
      'Round 3 exploration: Paired Blue and Gold streams forming a lowercase "a" on the left and a sinusoidal "k" on the right.',
    accentGlow: 'from-sky-500/25 via-amber-400/20 to-orange-500/20',
    borderHover: 'hover:border-amber-400/60 hover:shadow-[0_0_55px_-12px_rgba(245,158,11,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound3Sinusoidal,
  },
  {
    id: 'ak-r3-02-twin-ribbon-ak',
    round: 3,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 3 • 02',
    title: 'The Continuous Twin-Ribbon "ak" Weave',
    subtitle: 'Unbroken Crossing Blue & Gold Streams Tracing "a" into "k"',
    identityLink: 'Continuous Crossover Braid Linking Lowercase "a" and "k"',
    rationale:
      'Round 3 exploration: Unbroken Blue and Gold streams crossing between lowercase "a" and "k".',
    accentGlow: 'from-sky-400/25 via-blue-500/15 to-amber-400/25',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound3TwinRibbon,
  },
  {
    id: 'ak-r3-03-shared-spine-ak',
    round: 3,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 3 • 03',
    title: 'The Shared-Spine "ak" Clasp Ligature',
    subtitle: 'Unified Zero-Bias Spine ("a" + "k") + Equivalence Gate Clasp',
    identityLink: 'Monolithic "ak" Braid Ligature + White Equivalence Clasp',
    rationale:
      'Round 3 exploration: Lowercase "a" and "k" fused around a shared central spine with a right-hand equivalence clasp.',
    accentGlow: 'from-amber-500/25 via-sky-500/15 to-indigo-500/20',
    borderHover: 'hover:border-amber-400/60 hover:shadow-[0_0_55px_-12px_rgba(251,191,36,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound3SharedSpine,
  },

  // ROUND 2 ARCHIVE
  {
    id: 'owv-r2-01-pulse-ring',
    round: 2,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 2 • 01',
    title: 'The Verified Pulse Ring',
    subtitle: 'Open Wearable Bezel + Pulse-to-Checkmark Vector',
    identityLink: 'Open Sensor Ring + Cardiac Pulse + Validation Checkmark',
    rationale:
      'Round 2 exploration: Open-top wearable sensor bezel framing a physiological pulse wave that inflects into a validation checkmark.',
    accentGlow: 'from-emerald-500/25 via-sky-400/20 to-cyan-500/20',
    borderHover: 'hover:border-emerald-400/60 hover:shadow-[0_0_55px_-12px_rgba(16,185,129,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound2PulseRing,
  },
  {
    id: 'owv-r2-02-caliper-lock',
    round: 2,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 2 • 02',
    title: 'The Optical Caliper & Reference Lock',
    subtitle: 'Metrological Caliper Jaws + Dual-Signal Ground Truth Convergence',
    identityLink: 'Tolerance Calipers + Optical PPG vs. Clinical Reference Lock',
    rationale:
      'Round 2 exploration: Precision caliper brackets framing two converging biometric signals locking into a ground-truth reticle.',
    accentGlow: 'from-sky-500/25 via-emerald-400/15 to-amber-500/20',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound2CaliperLock,
  },
  {
    id: 'owv-r2-03-biometric-shield',
    round: 2,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 2 • 03',
    title: 'The Biometric Shield & Photonic Pulse',
    subtitle: 'Wearable Watch Chassis + Regulatory Shield + Systolic Crest',
    identityLink: 'Smartwatch Case & Lugs + FDA Validation Shield + Photonic Pulse',
    rationale:
      'Round 2 exploration: Wrist-worn wearable chassis tapering into a clinical regulatory shield bisected by an optical pulse peak.',
    accentGlow: 'from-sky-500/25 via-blue-500/15 to-emerald-500/25',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound2Shield,
  },
  {
    id: 'ak-r2-01-equivalence-a',
    round: 2,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 2 • 01',
    title: 'The Equivalence "A" Monogram',
    subtitle: 'Paired Method Pillars ("A") + Mathematical Agreement Crossbar ("≈")',
    identityLink: '"A" for agreekit + "≈" Equivalence Symbol + Python Blue/Gold',
    rationale:
      'Round 2 exploration: Bold geometric "A" with paired Blue/Gold pillars bridged by an "≈" equivalence wave crossbar.',
    accentGlow: 'from-sky-500/25 via-amber-400/20 to-orange-500/20',
    borderHover: 'hover:border-amber-400/60 hover:shadow-[0_0_55px_-12px_rgba(245,158,11,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound2EquivalenceA,
  },
  {
    id: 'ak-r2-02-bland-altman',
    round: 2,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 2 • 02',
    title: 'The Bland-Altman Corridor',
    subtitle: 'Upper/Lower LoA Bounds (±1.96 SD) + Damped Zero-Bias Convergence',
    identityLink: 'Limits of Agreement Corridor + Paired Residual Convergence',
    rationale:
      'Round 2 exploration: Upper and lower Limit-of-Agreement caliper beams framing a damped paired-difference wave.',
    accentGlow: 'from-sky-400/25 via-blue-500/15 to-amber-400/25',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound2BlandAltman,
  },
  {
    id: 'ak-r2-03-paired-braid',
    round: 2,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 2 • 03',
    title: 'The Paired Convergence Braid',
    subtitle: 'Intertwining Pythonic Streams Locked in Equivalence Clasp',
    identityLink: 'Two Divergent Streams Braiding into Phase-Locked Agreement',
    rationale:
      'Round 2 exploration: Two measurement streams crossing and locking into parallel agreement inside a white equivalence clasp.',
    accentGlow: 'from-amber-500/25 via-sky-500/15 to-indigo-500/20',
    borderHover: 'hover:border-amber-400/60 hover:shadow-[0_0_55px_-12px_rgba(251,191,36,0.4)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound2PairedBraid,
  },

  // ROUND 1 ARCHIVE
  {
    id: 'owv-r1-01-aperture',
    round: 1,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 1 • 01',
    title: 'The Isometric Aperture',
    subtitle: 'Interlocking Architectural Frame & Prism Core',
    identityLink: 'Pure Isometric Architectural Symmetry',
    rationale:
      'Round 1 exploration: Two 30°/60° isometric cantilevers in 180° rotational symmetry around a negative-space diamond aperture.',
    accentGlow: 'from-sky-500/25 via-cyan-400/15 to-emerald-500/20',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.38)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound1Aperture,
  },
  {
    id: 'owv-r1-02-eclipse',
    round: 1,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 1 • 02',
    title: 'The Eclipse Counterbalance',
    subtitle: 'Optical Split-Torus & Suspended Equilibrium Sphere',
    identityLink: 'Pure Radial Optical Tension',
    rationale:
      'Round 1 exploration: High-contrast geometric torus sliced along a 45° diagonal shear plane with a suspended amber core.',
    accentGlow: 'from-cyan-500/25 via-emerald-400/15 to-amber-500/20',
    borderHover: 'hover:border-emerald-400/60 hover:shadow-[0_0_55px_-12px_rgba(16,185,129,0.38)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound1Eclipse,
  },
  {
    id: 'owv-r1-03-monolith',
    round: 1,
    brand: 'owv',
    brandLabel: 'Open Wearable Validation',
    wordmark: 'Open Wearable Validation',
    badge: 'OWV // ROUND 1 • 03',
    title: 'The Dihedral Monolith',
    subtitle: 'Four-Blade Rotational Turbine & Diamond Sanctuary',
    identityLink: 'Pure Rotational Turbine Framing',
    rationale:
      'Round 1 exploration: Four bevelled architectural blades mitred in 90° rotational symmetry around a central diamond aperture.',
    accentGlow: 'from-sky-500/25 via-blue-500/15 to-amber-500/20',
    borderHover: 'hover:border-amber-400/60 hover:shadow-[0_0_55px_-12px_rgba(251,191,36,0.35)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: OwvRound1Monolith,
  },
  {
    id: 'ak-r1-01-mobius',
    round: 1,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 1 • 01',
    title: 'The Structural Phase Loop',
    subtitle: 'Interlocking Topological Ribbon & Equilibrium Node',
    identityLink: 'Pure Topological Loop Symmetry',
    rationale:
      'Round 1 exploration: Two stadium vector loops weaving in 180° rotational symmetry around a central white diamond.',
    accentGlow: 'from-sky-500/25 via-amber-400/15 to-orange-500/20',
    borderHover: 'hover:border-amber-400/60 hover:shadow-[0_0_55px_-12px_rgba(245,158,11,0.38)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound1Mobius,
  },
  {
    id: 'ak-r1-02-phase-array',
    round: 1,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 1 • 02',
    title: 'The Harmonic Phase Array',
    subtitle: 'Rhythmic Vector Slabs & Synchronization Channel',
    identityLink: 'Pure Rhythmic Parallel Slabs',
    rationale:
      'Round 1 exploration: Four vector bars sliding into central phase alignment at a -28° shear.',
    accentGlow: 'from-sky-400/25 via-blue-500/15 to-amber-400/25',
    borderHover: 'hover:border-sky-400/60 hover:shadow-[0_0_55px_-12px_rgba(56,189,248,0.38)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound1PhaseArray,
  },
  {
    id: 'ak-r1-03-equilibrium',
    round: 1,
    brand: 'agreekit',
    brandLabel: 'agreekit',
    wordmark: 'agreekit',
    badge: 'AGREEKIT // ROUND 1 • 03',
    title: 'The Equilibrium Dyad',
    subtitle: 'Counter-Flowing Vector Paths & Tension Bridge',
    identityLink: 'Pure Orbital Counterbalance',
    rationale:
      'Round 1 exploration: Two opposing geometric L-vectors with terminal mass nodes framing a 45° tension bridge.',
    accentGlow: 'from-amber-500/25 via-sky-500/15 to-indigo-500/20',
    borderHover: 'hover:border-amber-400/60 hover:shadow-[0_0_55px_-12px_rgba(251,191,36,0.38)]',
    badgeClasses: 'border-zinc-700 bg-zinc-800/80 text-zinc-300',
    Component: AgreekitRound1Equilibrium,
  },
];

export function LogoConcepts() {
  const [withPlate, setWithPlate] = useState(false);
  const [activeRound, setActiveRound] = useState<8 | 7 | 6 | 5 | 3 | 2 | 1>(8);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleConcepts = LOGO_CONCEPTS.filter((c) => c.round === activeRound);
  const owvConcepts = visibleConcepts.filter((c) => c.brand === 'owv');
  const agreekitConcepts = visibleConcepts.filter((c) => c.brand === 'agreekit');

  const renderConceptCard = (concept: ConceptDescriptor) => {
    const { Component } = concept;
    const isSelected = selectedId === concept.id;

    return (
      <div
        key={concept.id}
        role="button"
        tabIndex={0}
        onClick={() => setSelectedId(isSelected ? null : concept.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedId(isSelected ? null : concept.id);
          }
        }}
        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-[#090d16] p-6 transition-all duration-500 ease-out cursor-pointer ${
          isSelected
            ? 'border-sky-400/80 shadow-[0_0_65px_-10px_rgba(56,189,248,0.45)] ring-1 ring-sky-400/40'
            : `border-white/10 ${concept.borderHover}`
        }`}
      >
        {/* Smooth Hover-State Radial Glow Backlight */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br ${concept.accentGlow} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100`}
        />

        {/* Top Metadata Bar */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${concept.badgeClasses}`}
          >
            {concept.badge}
          </span>
          <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase transition-colors duration-300 group-hover:text-zinc-300">
            64×64 VECTOR // 16PX READY
          </span>
        </div>

        {/* Center Billboard Stage (132px Responsive Mark + Coordinate Reticle) */}
        <div className="relative z-10 my-5 flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#05070c]/90 py-9 overflow-hidden transition-colors duration-500 group-hover:border-white/15">
          {/* Subtle Architectural Crosshair Lines */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:16px_16px] opacity-60"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent"
          />

          {/* Ambient Stage Halo on Hover */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute h-36 w-36 rounded-full bg-gradient-to-tr ${concept.accentGlow} opacity-25 blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-90`}
          />

          {/* Primary Responsive SVG Mark */}
          <div className="relative z-10 transition-transform duration-500 ease-out group-hover:scale-110">
            <Component
              size={132}
              withPlate={withPlate}
              className="drop-shadow-[0_12px_28px_rgba(0,0,0,0.65)]"
            />
          </div>
        </div>

        {/* Semiotic Identity Link Pill */}
        <div className="relative z-10 mb-3 flex items-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/[0.06] px-2.5 py-1.5 font-mono text-[10px] font-semibold text-sky-300">
          <Compass size={12} className="shrink-0 text-sky-400" />
          <span className="truncate">{concept.identityLink}</span>
        </div>

        {/* Multi-Scale Optical Verification Strip (16px Favicon, 28px Nav, Lockup) */}
        <div className="relative z-10 mb-4 flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" title="16px Favicon Scale">
              <Component size={16} withPlate={withPlate} />
              <span className="font-mono text-[10px] text-zinc-500">16px</span>
            </div>
            <span className="text-zinc-800">|</span>
            <div className="flex items-center gap-1.5" title="28px Navbar Scale">
              <Component size={28} withPlate={withPlate} />
              <span className="font-mono text-[10px] text-zinc-500">28px</span>
            </div>
          </div>

          {/* Horizontal Brand Lockup Preview */}
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#05070c] px-2.5 py-1.5">
            <Component size={20} withPlate={withPlate} />
            <span
              className={`text-xs font-bold tracking-tight text-white ${
                concept.brand === 'agreekit' ? 'font-mono' : 'font-sans'
              }`}
            >
              {concept.brand === 'owv' ? 'OpenValidation' : 'agreekit'}
            </span>
          </div>
        </div>

        {/* Title, Subtitle & Architectural Rationale */}
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-sky-300">
              {concept.title}
            </h3>
            {isSelected && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-300">
                <Check size={11} /> Selected
              </span>
            )}
          </div>
          <p className="font-mono text-[11px] font-medium text-zinc-400">{concept.subtitle}</p>
          <p className="text-xs leading-relaxed text-zinc-400/90 pt-1">{concept.rationale}</p>
        </div>
      </div>
    );
  };

  return (
    <section
      aria-label="Abstract Brand Mark Concepts"
      className="rounded-3xl border border-white/10 bg-[#05070c] p-6 sm:p-10 text-zinc-100 shadow-2xl space-y-12"
    >
      {/* Studio Header & Controls */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-white/10 pb-8">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
            <Sparkles size={13} /> Design Round 08 // R2-01 Refined Styling &amp; 180° Rotational Twins
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Pure Pulse Continuity:
            R2-01 Single-Stroke Vector &amp;{' '}
            <code className="font-mono text-emerald-300">180°</code> Rotational Twins
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-zinc-400">
            Refining the marks with the athletic single-stroke clarity of{' '}
            <strong className="text-white">Round 2 • 01</strong>: bold continuous physiological
            pulse lines (5.2–5.5px) inside an open wearable bezel, paired with mathematically
            exact <code className="font-mono text-zinc-200">180°</code> rotational twins for{' '}
            <strong className="text-white">agreekit</strong> featuring neutral brushed slate
            bezels and Pythonic / Hero colorways.
          </p>
        </div>

        {/* Interactive Round & Framing Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-end">
          <button
            type="button"
            onClick={() => setActiveRound(8)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-semibold transition-all ${
              activeRound === 8
                ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Round 8: R2-01 Refined
          </button>
          <button
            type="button"
            onClick={() => setActiveRound(7)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-semibold transition-all ${
              activeRound === 7
                ? 'border-sky-400/60 bg-sky-500/15 text-sky-300 shadow-[0_0_20px_-5px_rgba(56,189,248,0.4)]'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Round 7: 180° Twins
          </button>
          <button
            type="button"
            onClick={() => setActiveRound(6)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-semibold transition-all ${
              activeRound === 6
                ? 'border-sky-400/60 bg-sky-500/15 text-sky-300 shadow-[0_0_20px_-5px_rgba(56,189,248,0.4)]'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Round 6
          </button>
          <button
            type="button"
            onClick={() => setActiveRound(5)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-semibold transition-all ${
              activeRound === 5
                ? 'border-sky-400/60 bg-sky-500/15 text-sky-300 shadow-[0_0_20px_-5px_rgba(56,189,248,0.4)]'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Round 5
          </button>
          <button
            type="button"
            onClick={() => setActiveRound(3)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-semibold transition-all ${
              activeRound === 3
                ? 'border-sky-400/60 bg-sky-500/15 text-sky-300 shadow-[0_0_20px_-5px_rgba(56,189,248,0.4)]'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Round 3
          </button>
          <button
            type="button"
            onClick={() => setActiveRound(2)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-semibold transition-all ${
              activeRound === 2
                ? 'border-sky-400/60 bg-sky-500/15 text-sky-300 shadow-[0_0_20px_-5px_rgba(56,189,248,0.4)]'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Round 2
          </button>
          <button
            type="button"
            onClick={() => setActiveRound(1)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-semibold transition-all ${
              activeRound === 1
                ? 'border-sky-400/60 bg-sky-500/15 text-sky-300 shadow-[0_0_20px_-5px_rgba(56,189,248,0.4)]'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Round 1
          </button>

          <span className="hidden sm:inline text-zinc-800">|</span>

          <button
            type="button"
            onClick={() => setWithPlate(false)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-semibold transition-all ${
              !withPlate
                ? 'border-sky-400/60 bg-sky-500/15 text-sky-300'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Maximize2 size={13} /> Floating Glyph
          </button>
          <button
            type="button"
            onClick={() => setWithPlate(true)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-semibold transition-all ${
              withPlate
                ? 'border-sky-400/60 bg-sky-500/15 text-sky-300'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers size={13} /> Carbon App Squircle
          </button>
        </div>
      </header>

      {/* SECTION 1: OPEN WEARABLE VALIDATION (3 CONCEPTS) */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-sky-400">
              01 // OPEN WEARABLE VALIDATION (0° REFERENCE ORIENTATION: &ldquo;O-W-V&rdquo;)
            </div>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-white">
              {activeRound === 8
                ? '01: Pure Pulse Aperture • 02: Continuous O-W-V Trace • 03: Hero-Triad Verified Pulse'
                : '01: OWV Palette • 02: AGREEKIT Pythonic Palette • 03: Dealer’s Choice (660nm Laser & Titanium)'}
            </h2>
          </div>
          <span className="font-mono text-xs text-zinc-500">
            {activeRound === 8
              ? 'R2-01 Single-Stroke Styling with 5.5px Vectors & Open Watch Bezel'
              : 'Locked Round 6 • 01 Geometry Across 3 Unified Colorways'}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {owvConcepts.map(renderConceptCard)}
        </div>
      </div>

      {/* SECTION 2: AGREEKIT (3 CONCEPTS) */}
      <div className="space-y-5 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">
              02 // AGREEKIT (EXACT 180° ROTATION OF EACH OWV MARK &rarr; CAPITAL &ldquo;A&rdquo;)
            </div>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-white">
              Each Concept Below Is Literally a 180° Rotation of Its Corresponding OWV Twin Above
            </h2>
          </div>
          <span className="font-mono text-xs text-zinc-500">
            {activeRound === 8
              ? 'Neutral Brushed Slate Bezel Eliminates Blue-on-Blue Crowding'
              : '100% Identical Geometry & Palette Rotated 180°'}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {agreekitConcepts.map(renderConceptCard)}
        </div>
      </div>

      {/* Side-by-Side 16px Favicon & Lockup Comparison Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#090d16] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
            <Eye size={14} className="text-sky-400" /> Optical Stress Test // 16px Browser Tab &amp;
            Navbar Lockup Matrix
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            True 1:1 Pixel Rendering Verification
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {visibleConcepts.map((c) => {
            const { Component } = c;
            return (
              <div
                key={`stress-${c.id}`}
                className="flex flex-col items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#05070c] p-3.5 transition-colors hover:border-white/20"
              >
                <span className="font-mono text-[10px] font-semibold text-zinc-400">
                  {c.badge.replace(/ROUND \d • /, '')}
                </span>
                <div className="flex items-center gap-3 py-1">
                  <Component size={16} withPlate={withPlate} />
                  <Component size={32} withPlate={withPlate} />
                </div>
                <span className="text-[11px] font-medium text-zinc-300 text-center line-clamp-1">
                  {c.title.replace(/^The\s+/, '')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default LogoConcepts;
