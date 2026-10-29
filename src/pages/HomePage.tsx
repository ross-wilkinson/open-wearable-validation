import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { AgreekitLogo } from '../components/brand/AgreekitLogo.tsx';

const HERO_EDGE_FADE_MASK: React.CSSProperties = {
  maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
};

/**
 * Directional Panoramic Underlay Masks:
 * Fades the left edge where the graphic overlaps behind left-aligned copy,
 * or fades the right edge where the graphic overlaps behind right-aligned copy.
 */
const UNDERLAY_RIGHT_MASK: React.CSSProperties = {
  maskImage:
    'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 18%, black 34%, black 88%, transparent 100%)',
  WebkitMaskImage:
    'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 18%, black 34%, black 88%, transparent 100%)',
};

const UNDERLAY_LEFT_MASK: React.CSSProperties = {
  maskImage:
    'linear-gradient(to left, transparent 0%, rgba(0,0,0,0.35) 18%, black 34%, black 88%, transparent 100%)',
  WebkitMaskImage:
    'linear-gradient(to left, transparent 0%, rgba(0,0,0,0.35) 18%, black 34%, black 88%, transparent 100%)',
};

/* ============================================================================
 * 1. BORDERLESS CINEMATIC HERO VISUAL: RAW GLOWING PPG & ECG TRACES
 * ============================================================================ */
function HeroVisualSignpost() {
  const uid = useId().replace(/:/g, '');
  const ppgGlowId = `ppg-glow-${uid}`;
  const ecgGlowId = `ecg-glow-${uid}`;
  const peakGlowId = `peak-glow-${uid}`;
  const ppgAreaId = `ppg-area-${uid}`;

  const ecgPeaks = [150, 320, 490, 660, 830];
  const ppgPeaks = [188, 358, 528, 698, 868];

  const ppgPathSegments: string[] = [
    'M 0 100 C 12 100, 18 28, 28 28 C 39 28, 46 63, 54 64 C 61 65, 66 63, 74 68 C 96 80, 132 100, 158 100',
  ];
  for (let i = 0; i < ppgPeaks.length; i++) {
    const p = ppgPeaks[i]!;
    const nextFoot = i < ppgPeaks.length - 1 ? ecgPeaks[i + 1]! + 8 : 960;
    if (i < ppgPeaks.length - 1) {
      ppgPathSegments.push(
        `C ${p - 20} 100, ${p - 12} 28, ${p} 28`,
        `C ${p + 11} 28, ${p + 18} 63, ${p + 26} 64`,
        `C ${p + 33} 65, ${p + 38} 63, ${p + 46} 68`,
        `C ${p + 68} 80, ${nextFoot - 28} 100, ${nextFoot} 100`,
      );
    } else {
      ppgPathSegments.push(
        `C ${p - 20} 100, ${p - 12} 28, ${p} 28`,
        `C ${p + 11} 28, ${p + 18} 63, ${p + 26} 64`,
        `C ${p + 40} 66, ${p + 65} 92, 960 98`,
      );
    }
  }
  const ppgWavePath = ppgPathSegments.join(' ');
  const ppgAreaPath = `${ppgWavePath} L 960 108 L 0 108 Z`;

  const ecgPathSegments: string[] = [
    'M 0 180 L 14 180 C 20 180, 26 154, 35 154 C 44 154, 48 180, 56 180',
  ];
  for (const r of ecgPeaks) {
    ecgPathSegments.push(
      `L ${r - 38} 180`,
      `C ${r - 33} 180, ${r - 31} 169, ${r - 26} 169`,
      `C ${r - 21} 169, ${r - 19} 180, ${r - 14} 180`,
      `L ${r - 7} 180`,
      `L ${r - 3.5} 188`,
      `L ${r} 118`,
      `L ${r + 5} 200`,
      `L ${r + 11} 180`,
      `C ${r + 19} 180, ${r + 25} 154, ${r + 34} 154`,
      `C ${r + 43} 154, ${r + 47} 180, ${r + 55} 180`,
    );
  }
  ecgPathSegments.push('L 960 180');
  const ecgWavePath = ecgPathSegments.join(' ');

  return (
    <div className="relative mx-auto w-full max-w-5xl select-none">
      <div
        className="pointer-events-none absolute inset-x-12 top-2 h-40 rounded-full bg-gradient-to-r from-sky-500/10 via-cyan-500/8 to-emerald-500/10 blur-3xl"
        aria-hidden="true"
      />

      <svg
        viewBox="0 0 960 212"
        style={HERO_EDGE_FADE_MASK}
        className="relative w-full h-auto overflow-visible"
        role="img"
        aria-label="Stacked physiological waveform comparison showing Optical PPG systolic peaks delayed relative to 3-Lead ECG R-peaks"
      >
        <defs>
          <filter id={ppgGlowId} x="-10%" y="-20%" width="120%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id={ecgGlowId} x="-10%" y="-20%" width="120%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id={peakGlowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id={ppgAreaId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={ppgAreaPath} fill={`url(#${ppgAreaId})`} />
        <path
          d={ppgWavePath}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${ppgGlowId})`}
        />

        <path
          d={ecgWavePath}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${ecgGlowId})`}
        />

        {ppgPeaks.map((px) => (
          <g key={`ppg-dot-${px}`} filter={`url(#${peakGlowId})`}>
            <circle cx={px} cy={28} r="7" fill="#f43f5e" fillOpacity="0.28" />
            <circle cx={px} cy={28} r="4.25" fill="#f43f5e" stroke="#fecdd3" strokeWidth="1.2" />
          </g>
        ))}

        {ecgPeaks.map((rx) => (
          <g key={`ecg-dot-${rx}`} filter={`url(#${peakGlowId})`}>
            <circle cx={rx} cy={118} r="7" fill="#f43f5e" fillOpacity="0.28" />
            <circle cx={rx} cy={118} r="4.25" fill="#f43f5e" stroke="#fecdd3" strokeWidth="1.2" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ============================================================================
 * 2. MAIN HOMEPAGE COMPONENT
 *    Sequential Full-Width Vertical Narrative with Panoramic Overlapping
 *    Underlays, Equal 320px Vertical Cadence, and Matched Focal Backlighting.
 * ============================================================================ */
export default function HomePage() {
  const [copiedPip, setCopiedPip] = useState(false);
  const uid = useId().replace(/:/g, '');
  const lineGradId = `academy-ring-${uid}`;
  const areaGradId = `academy-core-${uid}`;
  const curveGradId = `protocol-curve-${uid}`;
  const trapGlowId = `trap-glow-${uid}`;
  const distGlowId = `dist-glow-${uid}`;
  const distGradId = `dist-grad-${uid}`;
  const pulseKeyframesName = `report-pulse-${uid}`;
  const labelFadeKeyframesName = `report-fade-${uid}`;

  // 8-stage circular lifecycle coordinates around center (cx = 480, cy = 130, R = 88)
  const cycleCx = 480;
  const cycleCy = 130;
  const cycleR = 88;
  const labelR = 113;
  const academyCircularNodes = Array.from({ length: 8 }, (_, i) => {
    const angleDeg = -90 + i * 45;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      num: `0${i + 1}`,
      x: Math.round((cycleCx + cycleR * Math.cos(rad)) * 10) / 10,
      y: Math.round((cycleCy + cycleR * Math.sin(rad)) * 10) / 10,
      lx: Math.round((cycleCx + labelR * Math.cos(rad)) * 10) / 10,
      ly: Math.round((cycleCy + labelR * Math.sin(rad)) * 10) / 10 + 4,
    };
  });

  // Scatter points tightly fitted to the biased regression line from (0, 210) to (760, 14):
  // y_fit(x) = 210 - (196 / 760) * x, with small alternating +/- 4.5px residuals (r = 0.99)
  const scatterPoints = [
    { x: 80, y: 194 },
    { x: 145, y: 168 },
    { x: 210, y: 160 },
    { x: 275, y: 134 },
    { x: 340, y: 127 },
    { x: 405, y: 101 },
    { x: 470, y: 93 },
    { x: 535, y: 67 },
    { x: 600, y: 60 },
    { x: 665, y: 34 },
  ];

  function handleCopyPip() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('pip install agreekit');
      setCopiedPip(true);
      setTimeout(() => setCopiedPip(false), 2000);
    }
  }

  return (
    <div className="relative flex flex-col py-2 sm:py-4">
      {/* =====================================================================
          HERO: BORDERLESS INFINITE FADING SVG HERO
          ===================================================================== */}
      <section className="space-y-4 border-b border-hairline dark:border-[#27272a] pb-12 sm:pb-14">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] text-ink leading-[1.05] max-w-4xl mx-auto">
            Validate Wearable Sensors <br className="hidden sm:inline" />
            &amp;{' '}
            <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
              Health Algorithms.
            </span>
          </h1>

          <p className="mx-auto max-w-3xl text-sm sm:text-base leading-relaxed text-ink-secondary">
            Purpose-built tools for sensor engineers, researchers, and data scientists validating physiological algorithms and wearable biosensors. Plan robust protocols, calculate defensible sample sizes, evaluate performance against clinical reference standards, and make confident product launch decisions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              to="/academy"
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-surface shadow-sm transition-opacity hover:opacity-90"
            >
              <span>Explore The Academy &rarr;</span>
            </Link>

            <button
              type="button"
              onClick={handleCopyPip}
              className="group inline-flex items-center gap-2.5 rounded-xl border border-[#27272a] bg-[#090d16] px-4 py-2.5 font-mono text-xs sm:text-sm text-zinc-300 transition-colors hover:border-zinc-600 cursor-pointer"
            >
              <Terminal size={14} className="text-amber-400 shrink-0" />
              <span className="text-white font-semibold">$ pip install agreekit</span>
              {copiedPip ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <Copy size={14} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              )}
            </button>

            <a
              href="https://github.com/ross-wilkinson/open-wearable-validation"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink-secondary hover:text-ink transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        <HeroVisualSignpost />
      </section>

      {/* =====================================================================
          ROW 01 (LEFT FOREGROUND COPY / RIGHT PANORAMIC UNDERLAY): ACADEMY
          Theme Color: INDIGO (Toned-Down Focal Glow + Circular Lifecycle Timeline)
          ===================================================================== */}
      <Link
        to="/academy"
        aria-label="The Validation Academy Guided Curriculum"
        className="group relative flex flex-col lg:flex-row lg:items-center justify-between border-b border-hairline dark:border-[#27272a] py-12 lg:py-0 lg:h-[320px] min-h-[320px] overflow-hidden"
      >
        {/* Toned-Down Pure Indigo Focal Backlight */}
        <div
          className="pointer-events-none absolute top-1/2 right-[8%] h-64 w-[520px] -translate-y-1/2 rounded-full opacity-60 blur-[90px] transition-all duration-500 group-hover:scale-105 group-hover:opacity-85"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(99,102,241,0.22) 0%, rgba(129,140,248,0.10) 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 lg:max-w-md space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
              LEARNING STUDIO
            </span>
            <span className="text-slate-400 dark:text-slate-600">&bull;</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 dark:bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-300">
              <Sparkles size={11} />
              <span>8-Stage Flight Path</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-ink transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
            The Validation Academy: Learn wearable validation hands-on
          </h2>

          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            Follow the fictional Meridian PulseBand 2 across an interactive 8-module validation journey from optical bench prototyping to product launch.
          </p>
        </div>

        {/* Panoramic Borderless Underlay: Circular 8-Stage Product Lifecycle */}
        <div
          className="relative lg:absolute lg:right-0 lg:inset-y-0 lg:w-[68%] flex items-center mt-8 lg:mt-0 pointer-events-none"
          style={UNDERLAY_RIGHT_MASK}
        >
          <svg
            viewBox="0 0 760 260"
            className="w-full h-64 sm:h-72 block select-none"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={lineGradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a5b4fc" />
              </linearGradient>
              <radialGradient id={areaGradId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
                <stop offset="70%" stopColor="#818cf8" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
              </radialGradient>
            </defs>

            {/* Concentric Orbital Depth Rings bleeding into the panoramic field */}
            <circle
              cx={cycleCx}
              cy={cycleCy}
              r="195"
              fill="none"
              stroke="#6366f1"
              strokeOpacity="0.1"
              strokeWidth="1"
              strokeDasharray="3 6"
            />
            <circle
              cx={cycleCx}
              cy={cycleCy}
              r="142"
              fill="none"
              stroke="#6366f1"
              strokeOpacity="0.16"
              strokeWidth="1"
              strokeDasharray="4 5"
            />

            {/* Soft Illuminated Core Inside the Lifecycle Ring */}
            <circle cx={cycleCx} cy={cycleCy} r={cycleR} fill={`url(#${areaGradId})`} />

            {/* Inner Dashed Reference Ring */}
            <circle
              cx={cycleCx}
              cy={cycleCy}
              r="54"
              fill="none"
              stroke="#818cf8"
              strokeOpacity="0.28"
              strokeWidth="1.2"
              strokeDasharray="3 4"
            />

            {/* Primary Continuous Circular Lifecycle Track */}
            <circle
              cx={cycleCx}
              cy={cycleCy}
              r={cycleR}
              fill="none"
              stroke={`url(#${lineGradId})`}
              strokeWidth="3"
            />

            {/* Clockwise Cycle-Continuation Arrowhead between Stage 08 and Stage 01 (V1 -> V2) */}
            <g transform="translate(446.3, 48.7) rotate(-22.5)">
              <polygon points="7,0 -6,-5 -3,0 -6,5" fill="#818cf8" />
            </g>
            {/* Second Clockwise Arrowhead between Stage 04 and Stage 05 */}
            <g transform="translate(513.7, 211.3) rotate(157.5)">
              <polygon points="7,0 -6,-5 -3,0 -6,5" fill="#818cf8" />
            </g>

            {/* Center V1 -> V2 Iterative Cycle Hub */}
            <text
              x={cycleCx}
              y={cycleCy - 3}
              textAnchor="middle"
              className="fill-indigo-600 dark:fill-indigo-300"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="700"
            >
              V1 &rarr; V2
            </text>
            <text
              x={cycleCx}
              y={cycleCy + 12}
              textAnchor="middle"
              className="fill-indigo-500/70 dark:fill-indigo-400/70"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="600"
            >
              LIFECYCLE
            </text>

            {/* 8 Stage Nodes Arranged Radially Around the Circle */}
            {academyCircularNodes.map((pt, i) => {
              const nodeColor = i === 0 || i === 7 ? '#a5b4fc' : '#818cf8';
              return (
                <g key={pt.num}>
                  <circle cx={pt.x} cy={pt.y} r="13" fill="#6366f1" fillOpacity="0.2" />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5.5"
                    fill={nodeColor}
                    stroke="var(--color-plane)"
                    strokeWidth="2"
                  />
                  <text
                    x={pt.lx}
                    y={pt.ly}
                    className="fill-indigo-700 dark:fill-indigo-200"
                    fontSize="11.5"
                    fontFamily="monospace"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {pt.num}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </Link>

      {/* =====================================================================
          ROW 02 (LEFT PANORAMIC UNDERLAY / RIGHT FOREGROUND COPY): PROTOCOL
          Theme Color: SKY BLUE (Toned-Down Sky Focal Glow + Zero Black Gridlines)
          ===================================================================== */}
      <Link
        to="/protocol-studio"
        className="group relative flex flex-col lg:flex-row lg:items-center justify-end border-b border-hairline dark:border-[#27272a] py-12 lg:py-0 lg:h-[320px] min-h-[320px] overflow-hidden"
      >
        {/* Toned-Down Pure Sky Focal Backlight */}
        <div
          className="pointer-events-none absolute top-1/2 left-[10%] h-64 w-[500px] -translate-y-1/2 rounded-full opacity-60 blur-[90px] transition-all duration-500 group-hover:scale-105 group-hover:opacity-85"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(56,189,248,0.22) 0%, rgba(14,165,233,0.10) 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div
          className="relative lg:absolute lg:left-0 lg:inset-y-0 lg:w-[68%] flex items-center order-2 lg:order-1 mt-8 lg:mt-0 pointer-events-none"
          style={UNDERLAY_LEFT_MASK}
        >
          <svg
            viewBox="0 0 760 260"
            className="w-full h-60 sm:h-72 block select-none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={curveGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Target CI Width Threshold Line (Sky/Cyan dashed) */}
            <line
              x1="0"
              y1="168"
              x2="760"
              y2="168"
              stroke="#0ea5e9"
              strokeWidth="1.25"
              strokeDasharray="5 5"
              strokeOpacity="0.55"
            />

            <path
              d="M 0 18 C 160 120, 330 176, 760 218 L 760 260 L 0 260 Z"
              fill={`url(#${curveGradId})`}
            />
            <path
              d="M 0 18 C 160 120, 330 176, 760 218"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
            />

            <line
              x1="310"
              y1="12"
              x2="310"
              y2="260"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeOpacity="0.75"
            />
            <circle
              cx="310"
              cy="154"
              r="6"
              fill="#38bdf8"
              stroke="var(--color-plane)"
              strokeWidth="2"
            />
            <text
              x="326"
              y="140"
              className="fill-sky-600 dark:fill-sky-300"
              fontSize="14"
              fontWeight="700"
              fontFamily="monospace"
            >
              N = 42
            </text>
          </svg>
        </div>

        <div className="relative z-10 lg:max-w-md space-y-3 order-1 lg:order-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-sky-500 dark:text-sky-400">
            PROTOCOL STUDIO
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink transition-colors group-hover:text-sky-500 dark:group-hover:text-sky-400">
            Design your validation study
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            Size clinical cohorts for Limits of Agreement, repeated measures, and demographic quotas.
          </p>
        </div>
      </Link>

      {/* =====================================================================
          ROW 03 (LEFT FOREGROUND COPY / RIGHT PANORAMIC UNDERLAY): REPORT STUDIO
          Theme Color: EMERALD (Alternating GO & NO GO Flashing Quadrants)
          ===================================================================== */}
      <Link
        to="/report-studio/overview"
        className="group relative flex flex-col lg:flex-row lg:items-center justify-between border-b border-hairline dark:border-[#27272a] py-12 lg:py-0 lg:h-[320px] min-h-[320px] overflow-hidden"
      >
        {/* Toned-Down Pure Emerald Focal Backlight */}
        <div
          className="pointer-events-none absolute top-1/2 right-[8%] h-64 w-[500px] -translate-y-1/2 rounded-full opacity-60 blur-[90px] transition-all duration-500 group-hover:scale-105 group-hover:opacity-85"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(16,185,129,0.22) 0%, rgba(52,211,153,0.10) 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 lg:max-w-md space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            REPORT STUDIO
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            Evaluate product launch readiness
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            Synthesize validation performance into clear 2&times;2 equivalence decision gates.
          </p>
        </div>

        <div
          className="relative lg:absolute lg:right-0 lg:inset-y-0 lg:w-[68%] flex items-center mt-8 lg:mt-0 pointer-events-none"
          style={UNDERLAY_RIGHT_MASK}
        >
          <svg
            viewBox="0 0 760 260"
            className="w-full h-60 sm:h-72 block select-none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <style>{`
                @keyframes ${pulseKeyframesName} {
                  0% { transform: scale(0.75); opacity: 0.75; }
                  38% { transform: scale(2.15); opacity: 0; }
                  50%, 100% { transform: scale(0.75); opacity: 0; }
                }
                @keyframes ${labelFadeKeyframesName} {
                  0%, 6% { opacity: 0.18; }
                  18%, 36% { opacity: 1; }
                  50%, 100% { opacity: 0.18; }
                }
              `}</style>
            </defs>

            {/* Top-Right "GO" Quadrant Wash (Emerald) */}
            <rect x="380" y="0" width="380" height="130" fill="#10b981" fillOpacity="0.12" />

            {/* Bottom-Left "NO GO" Quadrant Wash (Subtle Red/Rose) */}
            <rect x="0" y="130" width="380" height="130" fill="#f43f5e" fillOpacity="0.09" />

            {/* Delicate Theme-Safe 2x2 Quadrant Divider Lines */}
            <line
              x1="0"
              y1="130"
              x2="760"
              y2="130"
              stroke="#10b981"
              strokeOpacity="0.3"
              strokeWidth="1.2"
              strokeDasharray="5 4"
            />
            <line
              x1="380"
              y1="0"
              x2="380"
              y2="260"
              stroke="#10b981"
              strokeOpacity="0.3"
              strokeWidth="1.2"
              strokeDasharray="5 4"
            />

            {/* ===============================================================
                TOP-RIGHT QUADRANT: "GO" POINT + SYNCHRONIZED LABEL (Phase 0s)
                =============================================================== */}
            <circle
              cx="550"
              cy="65"
              r="16"
              fill="#10b981"
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                animation: `${pulseKeyframesName} 4s cubic-bezier(0, 0, 0.2, 1) infinite`,
              }}
            />
            <g
              style={{
                animation: `${labelFadeKeyframesName} 4s ease-in-out infinite`,
              }}
            >
              <circle
                cx="550"
                cy="65"
                r="22"
                fill="#10b981"
                fillOpacity="0.18"
                stroke="#10b981"
                strokeOpacity="0.55"
                strokeWidth="1.25"
              />
              <text
                x="582"
                y="70"
                className="fill-emerald-600 dark:fill-emerald-400"
                fontSize="14"
                fontWeight="700"
                fontFamily="monospace"
              >
                GO
              </text>
            </g>
            <circle cx="550" cy="65" r="6" fill="#10b981" stroke="#a7f3d0" strokeWidth="2" />

            {/* ===============================================================
                BOTTOM-LEFT QUADRANT: "NO GO" POINT + SYNCHRONIZED LABEL (Phase +2s)
                =============================================================== */}
            <circle
              cx="272"
              cy="195"
              r="16"
              fill="#f43f5e"
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                animation: `${pulseKeyframesName} 4s cubic-bezier(0, 0, 0.2, 1) 2s infinite`,
                opacity: 0,
              }}
            />
            <g
              style={{
                animation: `${labelFadeKeyframesName} 4s ease-in-out 2s infinite`,
                opacity: 0.18,
              }}
            >
              <circle
                cx="272"
                cy="195"
                r="22"
                fill="#f43f5e"
                fillOpacity="0.18"
                stroke="#f43f5e"
                strokeOpacity="0.55"
                strokeWidth="1.25"
              />
              <text
                x="304"
                y="200"
                className="fill-rose-600 dark:fill-rose-400"
                fontSize="14"
                fontWeight="700"
                fontFamily="monospace"
              >
                NO GO
              </text>
            </g>
            <circle cx="272" cy="195" r="6" fill="#f43f5e" stroke="#fecdd3" strokeWidth="2" />
          </svg>
        </div>
      </Link>

      {/* =====================================================================
          ROW 04 (LEFT PANORAMIC UNDERLAY / RIGHT FOREGROUND COPY): PITFALLS
          Theme Color: ROSE (Toned-Down Rose Focal Glow + Fitted Regression Line)
          ===================================================================== */}
      <Link
        to="/explainers"
        className="group relative flex flex-col lg:flex-row lg:items-center justify-end border-b border-hairline dark:border-[#27272a] py-12 lg:py-0 lg:h-[320px] min-h-[320px] overflow-hidden"
      >
        {/* Toned-Down Pure Rose Focal Backlight */}
        <div
          className="pointer-events-none absolute top-1/2 left-[10%] h-64 w-[500px] -translate-y-1/2 rounded-full opacity-60 blur-[90px] transition-all duration-500 group-hover:scale-105 group-hover:opacity-85"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(244,63,94,0.22) 0%, rgba(251,113,133,0.10) 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div
          className="relative lg:absolute lg:left-0 lg:inset-y-0 lg:w-[68%] flex items-center order-2 lg:order-1 mt-8 lg:mt-0 pointer-events-none"
          style={UNDERLAY_LEFT_MASK}
        >
          <svg
            viewBox="0 0 760 260"
            className="w-full h-60 sm:h-72 block select-none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <filter id={trapGlowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Shaded Bias Gap Between True Identity Line and Biased Best-Fit Line */}
            <polygon points="0,250 760,54 760,14 0,210" fill="#f43f5e" fillOpacity="0.12" />

            {/* Subtle Theme-Safe Identity Reference Line */}
            <line
              x1="0"
              y1="250"
              x2="760"
              y2="54"
              stroke="#f43f5e"
              strokeOpacity="0.38"
              strokeWidth="1.25"
              strokeDasharray="5 5"
            />

            {/* Biased Line of Best Fit Passing Directly Through the Scatter Points */}
            <line
              x1="0"
              y1="210"
              x2="760"
              y2="14"
              stroke="#f43f5e"
              strokeWidth="3"
              filter={`url(#${trapGlowId})`}
            />

            {scatterPoints.map((pt) => (
              <g key={pt.x}>
                <circle cx={pt.x} cy={pt.y} r="8" fill="#f43f5e" fillOpacity="0.22" />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#fb7185"
                  stroke="var(--color-plane)"
                  strokeWidth="1.25"
                />
              </g>
            ))}

            <text
              x="120"
              y="44"
              className="fill-rose-600 dark:fill-rose-400"
              fontSize="13"
              fontWeight="700"
              fontFamily="monospace"
            >
              r = 0.96 &bull; BIAS TRAP
            </text>
          </svg>
        </div>

        <div className="relative z-10 lg:max-w-md space-y-3 order-1 lg:order-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">
            PITFALL EXPLORER
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink transition-colors group-hover:text-rose-500 dark:group-hover:text-rose-400">
            Avoid costly statistical pitfalls
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            See why standard correlation metrics fail on paired wearable sensor data.
          </p>
        </div>
      </Link>

      {/* =====================================================================
          ROW 05 (LEFT FOREGROUND COPY / RIGHT PANORAMIC CODE): AGREEKIT
          Theme Color: AMBER (Toned-Down Pure Amber Focal Glow)
          ===================================================================== */}
      <Link
        to="/agreekit"
        className="group relative flex flex-col lg:flex-row lg:items-center justify-between border-b border-hairline dark:border-[#27272a] py-12 lg:py-0 lg:h-[320px] min-h-[320px] overflow-hidden"
      >
        {/* Toned-Down Pure Amber Focal Backlight */}
        <div
          className="pointer-events-none absolute top-1/2 right-[8%] h-64 w-[500px] -translate-y-1/2 rounded-full opacity-60 blur-[90px] transition-all duration-500 group-hover:scale-105 group-hover:opacity-85"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(245,158,11,0.20) 0%, rgba(251,191,36,0.10) 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 lg:max-w-md space-y-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">
            <AgreekitLogo size={14} />
            <span>AGREEKIT</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink transition-colors group-hover:text-amber-500 dark:group-hover:text-amber-400">
            Execute agreement analyses in Python
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            Run exact agreement statistics, variance decompositions, and bootstrap confidence intervals in Python.
          </p>
        </div>

        <div
          className="relative lg:absolute lg:right-0 lg:inset-y-0 lg:w-[62%] flex flex-col justify-center mt-8 lg:mt-0 font-mono text-xs sm:text-sm space-y-3"
          style={UNDERLAY_RIGHT_MASK}
        >
          <div className="flex items-center justify-between border-b border-hairline dark:border-[#27272a] pb-3 px-8 lg:pl-20">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-amber-600 dark:text-amber-400 font-bold">$ pip install agreekit</span>
          </div>

          <div className="px-8 lg:pl-20 py-2 space-y-2.5 leading-relaxed">
            <p>
              <span className="text-purple-600 dark:text-purple-400">import</span>{' '}
              <span className="text-ink font-semibold">agreekit</span>{' '}
              <span className="text-purple-600 dark:text-purple-400">as</span>{' '}
              <span className="text-ink font-semibold">ak</span>
            </p>
            <p>
              <span className="text-ink-secondary">res = </span>
              <span className="text-sky-600 dark:text-sky-400 font-semibold">ak.analyze</span>
              <span className="text-ink-secondary">(ref=</span>
              <span className="text-amber-600 dark:text-amber-400">ecg</span>
              <span className="text-ink-secondary">, test=</span>
              <span className="text-amber-600 dark:text-amber-400">ppg</span>
              <span className="text-ink-secondary">)</span>
            </p>
            <p className="flex items-center text-emerald-600 dark:text-emerald-400">
              <span># Bland-Altman &bull; Bootstrap CI &bull; Non-Inferiority</span>
              <span
                className="ml-2 inline-block h-4 w-2 bg-amber-500 dark:bg-amber-400 animate-pulse"
                aria-hidden="true"
              />
            </p>
          </div>
        </div>
      </Link>

      {/* =====================================================================
          ROW 06 (LEFT PANORAMIC UNDERLAY / RIGHT FOREGROUND COPY): HEALTH DATA
          Theme Color: SKY / CYAN (Toned-Down Sky/Cyan Focal Glow)
          ===================================================================== */}
      <Link
        to="/health-data-distributions"
        className="group relative flex flex-col lg:flex-row lg:items-center justify-end border-b border-hairline dark:border-[#27272a] py-12 lg:py-0 lg:h-[320px] min-h-[320px] overflow-hidden"
      >
        {/* Toned-Down Pure Sky/Cyan Focal Backlight */}
        <div
          className="pointer-events-none absolute top-1/2 left-[10%] h-64 w-[500px] -translate-y-1/2 rounded-full opacity-60 blur-[90px] transition-all duration-500 group-hover:scale-105 group-hover:opacity-85"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(56,189,248,0.22) 0%, rgba(34,211,238,0.10) 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div
          className="relative lg:absolute lg:left-0 lg:inset-y-0 lg:w-[68%] flex items-center order-2 lg:order-1 mt-8 lg:mt-0 pointer-events-none"
          style={UNDERLAY_LEFT_MASK}
        >
          <svg
            viewBox="0 0 760 260"
            className="w-full h-60 sm:h-72 block select-none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <filter id={distGlowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id={distGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Secondary Stratified Cohort Curve */}
            <path
              d="M 0 248 C 200 248, 315 64, 440 64 C 565 64, 660 248, 760 248"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeOpacity="0.5"
            />

            <path
              d="M 0 248 C 160 248, 265 32, 380 32 C 495 32, 600 248, 760 248 L 760 260 L 0 260 Z"
              fill={`url(#${distGradId})`}
            />
            <path
              d="M 0 248 C 160 248, 265 32, 380 32 C 495 32, 600 248, 760 248"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              filter={`url(#${distGlowId})`}
            />

            <g filter={`url(#${distGlowId})`}>
              <line x1="204" y1="146" x2="204" y2="256" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="204" cy="146" r="4" fill="#22d3ee" />

              <line x1="380" y1="32" x2="380" y2="256" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="380" cy="32" r="5.5" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="1.5" />

              <line x1="556" y1="146" x2="556" y2="256" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="556" cy="146" r="4" fill="#22d3ee" />
            </g>

            <g fontFamily="monospace" fontSize="12" fontWeight="700">
              <text x="194" y="136" className="fill-sky-600 dark:fill-cyan-300" textAnchor="end">
                P5
              </text>
              <text x="380" y="20" className="fill-sky-700 dark:fill-sky-100" textAnchor="middle">
                MEDIAN
              </text>
              <text x="566" y="136" className="fill-sky-600 dark:fill-cyan-300" textAnchor="start">
                P95
              </text>
            </g>
          </svg>
        </div>

        <div className="relative z-10 lg:max-w-md space-y-3 order-1 lg:order-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-sky-500 dark:text-sky-400">
            HEALTH DATA CATALOG
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink transition-colors group-hover:text-sky-500 dark:group-hover:text-sky-400">
            Ground your protocol in population data
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            Reference normative physiological distributions across age, sex, and skin tone cohorts.
          </p>
        </div>
      </Link>

      {/* =====================================================================
          ROW 07 (LEFT FOREGROUND COPY / RIGHT TALL METALLIC PILLARS): REFERENCE
          Theme Color: EMERALD (Toned-Down Emerald Focal Glow)
          ===================================================================== */}
      <Link
        to="/reference-device-catalog"
        className="group relative flex flex-col lg:flex-row lg:items-center justify-between border-b border-hairline dark:border-[#27272a] py-12 lg:py-0 lg:h-[320px] min-h-[320px] overflow-hidden"
      >
        {/* Toned-Down Pure Emerald Focal Backlight */}
        <div
          className="pointer-events-none absolute top-1/2 right-[8%] h-64 w-[500px] -translate-y-1/2 rounded-full opacity-60 blur-[90px] transition-all duration-500 group-hover:scale-105 group-hover:opacity-85"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(16,185,129,0.20) 0%, rgba(52,211,153,0.10) 50%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 lg:max-w-md space-y-3">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            REFERENCE DEVICE CATALOG
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            Evaluate clinical reference standards
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            Compare clinical predicates, reference uncertainties, and sample-size penalties across 12 domains.
          </p>
        </div>

        {/* 3 Vertical Borderless Metallic Pillars Filling the Section Height */}
        <div className="relative z-10 lg:w-[58%] grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 lg:mt-0 font-mono text-xs">
          <div className="h-52 flex flex-col justify-between border-t-2 border-[#fbbf24] bg-[linear-gradient(180deg,rgba(251,191,36,0.18)_0%,transparent_100%)] p-5">
            <span className="font-bold text-sm text-amber-600 dark:text-[#fbbf24]">GOLD</span>
            <span className="font-semibold text-base text-ink">3-Lead Holter</span>
            <span className="font-bold text-sm text-amber-600 dark:text-[#fbbf24] drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]">
              &sigma;_ref &asymp; 0
            </span>
          </div>

          <div className="h-52 flex flex-col justify-between border-t-2 border-[#94a3b8] bg-[linear-gradient(180deg,rgba(148,163,184,0.18)_0%,transparent_100%)] p-5">
            <span className="font-bold text-sm text-slate-600 dark:text-[#94a3b8]">SILVER</span>
            <span className="font-semibold text-base text-ink">Clinical Patch</span>
            <span className="font-bold text-sm text-slate-700 dark:text-[#cbd5e1] drop-shadow-[0_0_6px_rgba(148,163,184,0.3)]">
              +25% N
            </span>
          </div>

          <div className="h-52 flex flex-col justify-between border-t-2 border-[#b45309] bg-[linear-gradient(180deg,rgba(180,83,9,0.24)_0%,transparent_100%)] p-5">
            <span className="font-bold text-sm text-amber-700 dark:text-[#d97706]">BRONZE</span>
            <span className="font-semibold text-base text-ink">Optical Strap</span>
            <span className="font-bold text-sm text-amber-700 dark:text-[#f59e0b] drop-shadow-[0_0_6px_rgba(217,119,6,0.35)]">
              +120% N
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
