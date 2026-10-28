import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Check,
  Copy,
  Cpu,
  ExternalLink,
  Layers,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { OpenWearableValidationLogo } from '../components/brand/OpenWearableValidationLogo.tsx';
import { AgreekitLogo } from '../components/brand/AgreekitLogo.tsx';

/**
 * Interactive Hero Biosensor Validation Stage
 *
 * Demonstrates real-time sensor waveform comparison: raw wrist PPG vs gold-standard ECG,
 * featuring an interactive motion artifact toggle and dynamic Bland-Altman caliper readouts.
 */
function HeroValidationStage() {
  const [hasMotion, setHasMotion] = useState(false);
  const uid = useId().replace(/:/g, '');
  const ppgGradId = `hero-ppg-${uid}`;
  const ecgGradId = `hero-ecg-${uid}`;

  return (
    <div className="relative overflow-hidden rounded-2xl hairline-card bg-surface/90 backdrop-blur-md p-5 sm:p-6 shadow-xl border-subpixel">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-series-1/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-series-3/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-mono text-xs font-semibold tracking-wide text-ink">
            LIVE COMPARATOR STAGE
          </span>
          <span className="rounded bg-plane px-2 py-0.5 font-mono text-[10px] text-ink-muted">
            500 Hz Sync
          </span>
        </div>

        {/* Motion Artifact Toggle */}
        <button
          type="button"
          onClick={() => setHasMotion(!hasMotion)}
          className={`group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
            hasMotion
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'border-hairline bg-plane text-ink-secondary hover:text-ink hover:border-ink/20'
          }`}
          title="Toggle treadmill motion artifact simulation"
        >
          <Zap size={12} className={hasMotion ? 'text-amber-500 animate-bounce' : 'text-ink-muted'} />
          <span>Motion Artifact: {hasMotion ? 'Provoked' : 'Baseline'}</span>
        </button>
      </div>

      {/* Oscilloscope Waveform Display */}
      <div className="relative z-10 my-4 rounded-xl border border-hairline/70 bg-[#090d16] p-4 text-white select-none">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
            <span>Wrist Optical PPG (Test Device)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span>3-Lead ECG Holter (Ground Truth)</span>
          </div>
        </div>

        {/* Oscilloscope SVG */}
        <svg viewBox="0 0 500 130" className="w-full h-32 select-none" aria-hidden="true">
          <defs>
            <linearGradient id={ppgGradId} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="1" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={ecgGradId} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="1" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid coordinates */}
          <line x1="0" y1="35" x2="500" y2="35" stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="0" y1="65" x2="500" y2="65" stroke="#1e293b" />
          <line x1="0" y1="95" x2="500" y2="95" stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="125" y1="0" x2="125" y2="130" stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="250" y1="0" x2="250" y2="130" stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="375" y1="0" x2="375" y2="130" stroke="#1e293b" strokeDasharray="4 4" />

          {/* ECG Trace (Clean QRS Complex) */}
          <path
            d="M 0 65 L 40 65 L 48 62 L 54 65 L 62 65 L 66 75 L 72 20 L 78 82 L 84 65 L 94 65 L 102 58 L 110 65 L 165 65 L 173 62 L 179 65 L 187 65 L 191 75 L 197 20 L 203 82 L 209 65 L 219 65 L 227 58 L 235 65 L 290 65 L 298 62 L 304 65 L 312 65 L 316 75 L 322 20 L 328 82 L 334 65 L 344 65 L 352 58 L 360 65 L 415 65 L 423 62 L 429 65 L 437 65 L 441 75 L 447 20 L 453 82 L 459 65 L 469 65 L 477 58 L 485 65 L 500 65"
            fill="none"
            stroke="#10b981"
            strokeWidth="1.75"
            strokeLinecap="round"
          />

          {/* Optical PPG Trace (Smooth Pulsatile vs Motion Noise) */}
          {hasMotion ? (
            <path
              d="M 0 68 C 25 65, 35 35, 75 35 C 100 35, 110 85, 130 95 C 150 105, 175 40, 200 40 C 225 40, 240 100, 265 85 C 290 70, 310 25, 335 25 C 360 25, 380 90, 410 80 C 440 70, 465 45, 500 55"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M 0 68 C 20 68, 55 38, 75 38 C 90 38, 105 56, 115 52 C 125 48, 145 68, 165 68 C 185 68, 220 38, 240 38 C 255 38, 270 56, 280 52 C 290 48, 310 68, 330 68 C 350 68, 385 38, 405 38 C 420 38, 435 56, 445 52 C 455 48, 475 68, 500 68"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Real-time Telemetry Caliper Readout */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-[11px] font-mono">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-slate-400">Mean Bias: </span>
              <span className={hasMotion ? 'font-bold text-amber-400' : 'font-bold text-emerald-400'}>
                {hasMotion ? '+4.82 bpm' : '+0.34 bpm'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">95% LoA: </span>
              <span className="font-semibold text-slate-200">
                {hasMotion ? '[-12.4, +22.0] bpm' : '[-3.8, +4.5] bpm'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                hasMotion
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {hasMotion ? 'MOTION ARTIFACT DETECTED' : 'AGREEMENT VERIFIED'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Specs */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-series-1" />
          <span>Repeated-Measures Agreement ANOVA</span>
        </div>
        <span className="font-mono text-[11px]">ISO 80601-2-61 • FDA 510(k) Ready</span>
      </div>
    </div>
  );
}

/**
 * Flagship Studio 1: Protocol Studio Workbench
 * With live interactive Sample Size N slider updating the precision curve in real time.
 */
function ProtocolStudioWorkbench() {
  const [sampleN, setSampleN] = useState(42);
  const uid = useId().replace(/:/g, '');
  const areaGradId = `sd-area-${uid}`;

  // Calculated LoA margin: shrinks with 1 / sqrt(N - 1)
  const marginWidth = Math.round((18.4 / Math.sqrt(sampleN - 1)) * 10) / 10;
  // Normalized X position on canvas for N between 15 and 120
  const normalizedX = 35 + ((sampleN - 15) / (120 - 15)) * 180;
  const curveY = 25 + 75 * (1 - (sampleN - 15) / 105) ** 0.55;

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="rounded-md bg-series-1/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-series-1 border border-series-1/20">
            PROTOCOL STUDIO
          </span>
          <span className="rounded bg-plane px-2 py-0.5 font-mono text-[11px] font-semibold text-series-1">
            Live Math: N = {sampleN}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink group-hover:text-series-1 transition-colors leading-snug">
          Design your validation study
        </h2>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-ink-secondary">
          Sizing a study too small risks inconclusive results, while sizing it too large wastes time and budget. Design protocols for internal product KPIs, predecessor comparisons, or regulatory submissions that properly account for measurement agreement, repeated measures, and demographic quotas before enrolling participants.
        </p>
      </div>

      {/* Interactive Precision Instrument */}
      <div className="rounded-xl border border-hairline/70 bg-plane/70 p-4 space-y-3">
        {/* Real-time Slider Control */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <label htmlFor="sample-size-slider" className="font-semibold text-ink">
            Simulate Participant Cohort (N):
          </label>
          <span className="font-mono font-bold text-series-1 text-sm">{sampleN} subjects</span>
        </div>
        <input
          id="sample-size-slider"
          type="range"
          min="15"
          max="120"
          value={sampleN}
          onChange={(e) => setSampleN(Number(e.target.value))}
          className="w-full accent-series-1 cursor-pointer"
        />

        {/* Dynamic Precision Curve SVG */}
        <svg viewBox="0 0 320 120" className="w-full h-28 select-none" aria-hidden="true">
          <defs>
            <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="var(--color-series-1)" stopOpacity="0.25" />
              <stop offset="1" stopColor="var(--color-series-1)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="35" y1="18" x2="225" y2="18" stroke="var(--color-hairline)" strokeDasharray="3 3" />
          <line x1="35" y1="60" x2="225" y2="60" stroke="var(--color-hairline)" strokeDasharray="3 3" />
          <line x1="35" y1="100" x2="225" y2="100" stroke="var(--color-hairline)" />
          <line x1="35" y1="15" x2="35" y2="100" stroke="var(--color-hairline)" />

          {/* Uncertainty envelope */}
          <path
            d="M 45 25 C 85 45, 125 72, 215 90 L 215 100 C 125 90, 85 68, 45 45 Z"
            fill={`url(#${areaGradId})`}
          />

          {/* Precision curve */}
          <path
            d="M 45 35 C 85 52, 125 78, 215 95"
            fill="none"
            stroke="var(--color-series-1)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Interactive Dynamic Marker */}
          <line
            x1={normalizedX}
            y1="18"
            x2={normalizedX}
            y2="100"
            stroke="var(--color-series-4)"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <circle
            cx={normalizedX}
            cy={curveY}
            r="4.5"
            fill="var(--color-series-4)"
            stroke="var(--color-surface)"
            strokeWidth="1.5"
          />

          {/* Marker Pill */}
          <rect
            x={Math.max(45, Math.min(185, normalizedX - 24))}
            y="12"
            width="48"
            height="15"
            rx="3"
            fill="var(--color-surface)"
            stroke="var(--color-series-4)"
            strokeWidth="1"
          />
          <text
            x={Math.max(45, Math.min(185, normalizedX - 24)) + 24}
            y="23"
            fill="var(--color-series-4)"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
          >
            N = {sampleN}
          </text>

          {/* Caliper Section */}
          <line x1="245" y1="25" x2="275" y2="25" stroke="var(--color-series-2)" strokeWidth="2" strokeLinecap="round" />
          <text x="280" y="28" fill="var(--color-series-2)" fontSize="8.5" fontWeight="bold">+1.96 SD</text>

          <path d="M 242 25 L 235 25 L 235 57 L 230 60 L 235 63 L 235 95 L 242 95" fill="none" stroke="var(--color-series-1)" strokeWidth="1.5" />
          <text x="226" y="63" fill="var(--color-series-1)" fontSize="8" fontWeight="bold" textAnchor="end">LoA</text>

          <line x1="242" y1="60" x2="265" y2="60" stroke="var(--color-ink-secondary)" strokeWidth="1.2" strokeDasharray="3 2" />
          <text x="270" y="63" fill="var(--color-ink-muted)" fontSize="8">Bias</text>

          <line x1="245" y1="95" x2="275" y2="95" stroke="var(--color-series-2)" strokeWidth="2" strokeLinecap="round" />
          <text x="280" y="98" fill="var(--color-series-2)" fontSize="8.5" fontWeight="bold">-1.96 SD</text>
        </svg>

        {/* Dynamic calculation result */}
        <div className="flex items-center justify-between text-xs text-ink-secondary font-mono border-t border-hairline pt-2">
          <span>Limits of Agreement Margin: <strong className="text-series-1">±{marginWidth} bpm</strong></span>
          <span className="text-[11px] text-ink-muted">Non-Central t Exact Inversion</span>
        </div>
      </div>

      <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs font-semibold text-series-1">
        <span>Enter Protocol Studio</span>
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
      </div>
    </div>
  );
}

/**
 * Companion Studio 2: Report Studio Gate Matrix
 * Featuring an interactive candidate selector that updates the bivariate 4-quadrant scatter plane.
 */
function ReportStudioGateMatrix() {
  const [candidate, setCandidate] = useState<'v1' | 'v2.4'>('v2.4');
  const uid = useId().replace(/:/g, '');
  const ellipseGradId = `pg-ellipse-${uid}`;

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="rounded-md bg-series-2/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-series-2 border border-series-2/20">
            REPORT STUDIO
          </span>
          <div className="flex rounded-lg border border-hairline bg-plane p-0.5 text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => setCandidate('v1')}
              className={`rounded px-1.5 py-0.5 transition-all ${
                candidate === 'v1' ? 'bg-surface text-ink shadow-xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              V1 Predecessor
            </button>
            <button
              type="button"
              onClick={() => setCandidate('v2.4')}
              className={`rounded px-1.5 py-0.5 transition-all ${
                candidate === 'v2.4' ? 'bg-emerald-500 text-white shadow-xs font-bold' : 'text-ink-muted hover:text-ink'
              }`}
            >
              V2.4 Candidate
            </button>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink group-hover:text-series-2 transition-colors leading-snug">
          Evaluate product launch readiness
        </h2>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-ink-secondary">
          Discover the right metrics and KPI frameworks to evaluate wearable performance, and synthesize your results into clear decision scorecards that your stakeholders can all understand and trust.
        </p>
      </div>

      {/* 4-Quadrant Visualizer */}
      <div className="rounded-xl border border-hairline/70 bg-plane/70 p-3 flex flex-col items-center justify-center">
        <svg viewBox="0 0 320 130" className="w-full h-32 select-none" aria-hidden="true">
          <defs>
            <radialGradient id={ellipseGradId} cx="50%" cy="50%" r="50%">
              <stop stopColor={candidate === 'v2.4' ? '#10b981' : '#f59e0b'} stopOpacity="0.35" />
              <stop offset="1" stopColor={candidate === 'v2.4' ? '#10b981' : '#f59e0b'} stopOpacity="0.08" />
            </radialGradient>
          </defs>

          {/* Quadrants */}
          <rect x="155" y="12" width="105" height="52" rx="4" fill="#10b981" fillOpacity={candidate === 'v2.4' ? 0.16 : 0.08} />
          <rect x="50" y="12" width="105" height="52" rx="4" fill="#f59e0b" fillOpacity={candidate === 'v1' ? 0.18 : 0.08} />
          <rect x="50" y="64" width="105" height="52" rx="4" fill="#ef4444" fillOpacity="0.08" />
          <rect x="155" y="64" width="105" height="52" rx="4" fill="#f59e0b" fillOpacity="0.08" />

          {/* Labels */}
          <text x="252" y="24" fill="#10b981" fontSize="7.5" fontWeight="bold" textAnchor="end">Q I • GREEN LIGHT</text>
          <text x="58" y="24" fill="#f59e0b" fontSize="7" fontWeight="600">Q II • PARITY RISK</text>
          <text x="58" y="110" fill="#ef4444" fontSize="7" fontWeight="600">Q III • REJECT</text>
          <text x="252" y="110" fill="#f59e0b" fontSize="7" fontWeight="600" textAnchor="end">Q IV • QUALITY DEBT</text>

          {/* Axes */}
          <line x1="40" y1="64" x2="265" y2="64" stroke="var(--color-ink-secondary)" strokeWidth="1.2" />
          <line x1="155" y1="12" x2="155" y2="116" stroke="var(--color-ink-secondary)" strokeWidth="1.2" />

          {/* Candidate position */}
          {candidate === 'v2.4' ? (
            <g>
              <ellipse cx="200" cy="38" rx="26" ry="14" transform="rotate(-15 200 38)" fill={`url(#${ellipseGradId})`} stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 2" />
              <circle cx="200" cy="38" r="4" fill="#10b981" stroke="var(--color-surface)" strokeWidth="1.5" />
              <rect x="175" y="47" width="52" height="13" rx="2" fill="var(--color-surface)" stroke="#10b981" strokeWidth="0.75" />
              <text x="201" y="56" fill="#10b981" fontSize="7" fontWeight="bold" textAnchor="middle">Candidate V2.4</text>
            </g>
          ) : (
            <g>
              <ellipse cx="105" cy="38" rx="26" ry="14" transform="rotate(10 105 38)" fill={`url(#${ellipseGradId})`} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
              <circle cx="105" cy="38" r="4" fill="#f59e0b" stroke="var(--color-surface)" strokeWidth="1.5" />
              <rect x="80" y="47" width="52" height="13" rx="2" fill="var(--color-surface)" stroke="#f59e0b" strokeWidth="0.75" />
              <text x="106" y="56" fill="#f59e0b" fontSize="7" fontWeight="bold" textAnchor="middle">Predecessor V1</text>
            </g>
          )}

          <circle cx="155" cy="64" r="3.5" fill="var(--color-ink-muted)" stroke="var(--color-surface)" strokeWidth="1.5" />
          <text x="148" y="75" fill="var(--color-ink-muted)" fontSize="7" textAnchor="end">Origin (0, 0)</text>
        </svg>

        <div className="w-full text-center text-xs font-mono font-semibold pt-2 border-t border-hairline">
          {candidate === 'v2.4' ? (
            <span className="text-emerald-500">Verdict: PASS (98.4% Confidence in Q1)</span>
          ) : (
            <span className="text-amber-500">Verdict: PARITY RISK (Underpowered in Q2)</span>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs font-semibold text-series-2">
        <span>Enter Report Studio</span>
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
      </div>
    </div>
  );
}

/**
 * Companion Studio 3: Pitfall Explorer
 * Demonstrating the N=5 spurious difference test vs True Limits-of-Agreement corridor.
 */
function PitfallExplorerCard() {
  const [activeTrap, setActiveTrap] = useState<'trap' | 'loa'>('loa');

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="rounded-md bg-series-4/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-series-4 border border-series-4/20">
            PITFALL EXPLORER
          </span>
          <div className="flex rounded-lg border border-hairline bg-plane p-0.5 text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveTrap('trap')}
              className={`rounded px-1.5 py-0.5 transition-all ${
                activeTrap === 'trap' ? 'bg-red-500 text-white font-bold' : 'text-ink-muted hover:text-ink'
              }`}
            >
              N=5 Trap
            </button>
            <button
              type="button"
              onClick={() => setActiveTrap('loa')}
              className={`rounded px-1.5 py-0.5 transition-all ${
                activeTrap === 'loa' ? 'bg-emerald-500 text-white font-bold' : 'text-ink-muted hover:text-ink'
              }`}
            >
              True Agreement
            </button>
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink group-hover:text-series-4 transition-colors leading-snug">
          Avoid costly statistical pitfalls
        </h2>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-ink-secondary">
          Standard statistical software was built to detect differences between groups rather than evaluate agreement, while generic AI assistants frequently fall into common statistical traps. Discover why standard methods fail when applied to paired wearable sensors, repeated measures, and rapid prototyping screens.
        </p>
      </div>

      {/* Side-by-side or Toggled Pitfall Graphic */}
      <div className="rounded-xl border border-hairline/70 bg-plane/70 p-3">
        <svg viewBox="0 0 320 130" className="w-full h-32 select-none" aria-hidden="true">
          {/* Left Panel: N=5 Noise Trap */}
          <rect x="18" y="10" width="130" height="110" rx="6" fill="var(--color-surface)" stroke={activeTrap === 'trap' ? '#ef4444' : 'var(--color-hairline)'} strokeWidth={activeTrap === 'trap' ? 1.5 : 1} />
          <rect x="26" y="16" width="114" height="16" rx="3" fill="#ef4444" fillOpacity="0.12" />
          <text x="83" y="27" fill="#ef4444" fontSize="7.5" fontWeight="bold" textAnchor="middle">
            N=5 NOISE TRAP (p &lt; 0.05)
          </text>
          <line x1="35" y1="90" x2="130" y2="45" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="40" cy="85" r="3" fill="#ef4444" />
          <circle cx="62" cy="78" r="3" fill="#ef4444" />
          <circle cx="82" cy="68" r="3" fill="#ef4444" />
          <circle cx="108" cy="48" r="3" fill="#ef4444" />
          <circle cx="128" cy="52" r="3" fill="#ef4444" />
          <text x="83" y="102" fill="#ef4444" fontSize="7" fontWeight="600" textAnchor="middle">Winner&apos;s Curse Fallacy</text>
          <text x="83" y="112" fill="var(--color-ink-muted)" fontSize="6.5" textAnchor="middle">Hides 8 bpm systematic bias</text>

          {/* Divider */}
          <line x1="160" y1="20" x2="160" y2="110" stroke="var(--color-hairline)" strokeDasharray="2 2" />
          <circle cx="160" cy="65" r="8" fill="var(--color-surface)" stroke="var(--color-hairline)" />
          <text x="160" y="68" fill="var(--color-ink-muted)" fontSize="7.5" fontWeight="bold" textAnchor="middle">vs</text>

          {/* Right Panel: True Agreement Corridor */}
          <rect x="172" y="10" width="130" height="110" rx="6" fill="var(--color-surface)" stroke={activeTrap === 'loa' ? '#10b981' : 'var(--color-hairline)'} strokeWidth={activeTrap === 'loa' ? 1.5 : 1} />
          <rect x="180" y="16" width="114" height="16" rx="3" fill="#10b981" fillOpacity="0.12" />
          <text x="237" y="27" fill="#10b981" fontSize="7.5" fontWeight="bold" textAnchor="middle">
            TRUE AGREEMENT (LoA)
          </text>
          <rect x="182" y="42" width="110" height="48" fill="#10b981" fillOpacity="0.08" />
          <line x1="182" y1="42" x2="292" y2="42" stroke="#10b981" strokeWidth="1.2" />
          <line x1="182" y1="66" x2="292" y2="66" stroke="var(--color-ink-muted)" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="182" y1="90" x2="292" y2="90" stroke="#10b981" strokeWidth="1.2" />
          <circle cx="198" cy="63" r="2.5" fill="#10b981" />
          <circle cx="215" cy="58" r="2.5" fill="#10b981" />
          <circle cx="232" cy="72" r="2.5" fill="#10b981" />
          <circle cx="250" cy="61" r="2.5" fill="#10b981" />
          <circle cx="268" cy="69" r="2.5" fill="#10b981" />
          <circle cx="282" cy="65" r="2.5" fill="#10b981" />
          <text x="237" y="102" fill="#10b981" fontSize="7" fontWeight="600" textAnchor="middle">Repeated Measures ANOVA</text>
          <text x="237" y="112" fill="var(--color-ink-muted)" fontSize="6.5" textAnchor="middle">Exact ±1.96 SD limits</text>
        </svg>

        <div className="text-center text-xs font-mono pt-2 border-t border-hairline">
          <span className="text-ink-secondary">High correlation does not equal measurement agreement.</span>
        </div>
      </div>

      <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs font-semibold text-series-4">
        <span>Enter Pitfall Explorer</span>
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
      </div>
    </div>
  );
}

/**
 * Flagship Studio 4: Learning Studio Interactive Flight Path
 * Following the fictional Meridian PulseBand 2 product lifecycle through 8 interactive modules.
 */
function LearningStudioFlightPath() {
  const [activeStep, setActiveStep] = useState(5);
  const uid = useId().replace(/:/g, '');
  const podRingGradId = `ac-pod-${uid}`;
  const greenGlowId = `ac-glow-${uid}`;

  const stepDescriptions = [
    'Module 1: Breadboard Optical Benchmarking & SNR',
    'Module 2: Greenwood LoA Precision & Sample Sizing',
    'Module 3: Cadence Lock Dynamic Provocation Protocol',
    'Module 4: Monk Skin Tone Scale Melanin Compensation',
    'Module 5: Active Exercise & Accelerometer Motion Rejection',
    'Module 6: FDA 510(k) Clinical Predicate Alignment',
    'Module 7: Launch Gate 2x2 Decision Scorecard Matrix',
    'Module 8: Multi-Year Optical Sensor & Algorithmic Drift',
  ];

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="rounded-md bg-series-3/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-series-3 border border-series-3/20">
            LEARNING STUDIO
          </span>
          <span className="rounded bg-plane px-2 py-0.5 font-mono text-[11px] font-semibold text-series-3">
            Case Study: Module {activeStep} of 8
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink group-hover:text-series-3 transition-colors leading-snug">
          Learn wearable validation hands-on
        </h2>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-ink-secondary">
          Step into the shoes of a lead validation scientist developing the fictional Meridian PulseBand 2. Work through 8 interactive modules spanning the full product journey—from early prototyping and product launch to investigating post-launch issues and tracking multi-year device iterations.
        </p>
      </div>

      {/* Interactive 8-Stage Lifecycle Flightpath */}
      <div className="rounded-xl border border-hairline/70 bg-plane/70 p-4 space-y-3">
        {/* Module step selector */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setActiveStep(s)}
              className={`rounded-lg py-1.5 text-xs font-mono font-bold transition-all ${
                activeStep === s
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-surface text-ink-secondary hover:text-ink hover:bg-plane border border-hairline'
              }`}
            >
              M{s}
            </button>
          ))}
        </div>

        {/* Biosensor Pod Schematics Graphic */}
        <svg viewBox="0 0 320 120" className="w-full h-28 select-none" aria-hidden="true">
          <defs>
            <linearGradient id={podRingGradId} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#0284c7" />
              <stop offset="0.5" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
            <filter id={greenGlowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Orbits */}
          <ellipse cx="160" cy="60" rx="120" ry="42" fill="none" stroke="var(--color-hairline)" strokeWidth="1" strokeDasharray="3 3" />
          <ellipse cx="160" cy="60" rx="85" ry="30" fill="none" stroke="var(--color-series-1)" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.4" />

          {/* Center Pod */}
          <rect x="135" y="40" width="50" height="40" rx="10" fill="#090d16" stroke={`url(#${podRingGradId})`} strokeWidth="1.5" />
          <circle cx="147" cy="55" r="3" fill="#22c55e" filter={`url(#${greenGlowId})`} />
          <circle cx="160" cy="55" r="3" fill="#ef4444" />
          <circle cx="173" cy="55" r="3" fill="#a855f7" />
          <rect x="146" y="64" width="28" height="5" rx="1.5" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.5" />

          {/* Orbit Nodes */}
          <circle cx="50" cy="60" r="7" fill={activeStep === 1 ? '#10b981' : 'var(--color-surface)'} stroke="var(--color-series-1)" strokeWidth="1.5" />
          <text x="50" y="63" fill={activeStep === 1 ? '#ffffff' : 'var(--color-ink)'} fontSize="7" fontWeight="bold" textAnchor="middle">1</text>

          <circle cx="85" cy="35" r="7" fill={activeStep === 2 ? '#10b981' : 'var(--color-surface)'} stroke="var(--color-series-1)" strokeWidth="1.5" />
          <text x="85" y="38" fill={activeStep === 2 ? '#ffffff' : 'var(--color-ink)'} fontSize="7" fontWeight="bold" textAnchor="middle">2</text>

          <circle cx="120" cy="22" r="7" fill={activeStep === 3 ? '#10b981' : 'var(--color-surface)'} stroke="var(--color-series-3)" strokeWidth="1.5" />
          <text x="120" y="25" fill={activeStep === 3 ? '#ffffff' : 'var(--color-ink)'} fontSize="7" fontWeight="bold" textAnchor="middle">3</text>

          <circle cx="200" cy="22" r="7" fill={activeStep === 4 ? '#10b981' : 'var(--color-surface)'} stroke="var(--color-series-3)" strokeWidth="1.5" />
          <text x="200" y="25" fill={activeStep === 4 ? '#ffffff' : 'var(--color-ink)'} fontSize="7" fontWeight="bold" textAnchor="middle">4</text>

          <circle cx="235" cy="35" r="7" fill={activeStep === 5 ? '#10b981' : 'var(--color-surface)'} stroke="var(--color-series-4)" strokeWidth="1.5" />
          <text x="235" y="38" fill={activeStep === 5 ? '#ffffff' : 'var(--color-ink)'} fontSize="7" fontWeight="bold" textAnchor="middle">5</text>

          <circle cx="270" cy="60" r="7" fill={activeStep === 6 ? '#10b981' : 'var(--color-surface)'} stroke="var(--color-series-4)" strokeWidth="1.5" />
          <text x="270" y="63" fill={activeStep === 6 ? '#ffffff' : 'var(--color-ink)'} fontSize="7" fontWeight="bold" textAnchor="middle">6</text>

          <circle cx="235" cy="85" r="7" fill={activeStep === 7 ? '#10b981' : 'var(--color-surface)'} stroke="#10b981" strokeWidth="1.5" />
          <text x="235" y="88" fill={activeStep === 7 ? '#ffffff' : 'var(--color-ink)'} fontSize="7" fontWeight="bold" textAnchor="middle">7</text>

          <circle cx="85" cy="85" r="7" fill={activeStep === 8 ? '#10b981' : 'var(--color-surface)'} stroke="#10b981" strokeWidth="1.5" />
          <text x="85" y="88" fill={activeStep === 8 ? '#ffffff' : 'var(--color-ink)'} fontSize="7" fontWeight="bold" textAnchor="middle">8</text>
        </svg>

        {/* Current phase readout */}
        <div className="flex items-center justify-between text-xs text-ink-secondary border-t border-hairline pt-2 font-mono">
          <span className="font-semibold text-emerald-500">{stepDescriptions[activeStep - 1]}</span>
          <span className="text-[11px] text-ink-muted">Interactive Sandbox</span>
        </div>
      </div>

      <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs font-semibold text-series-3">
        <span>Enter Learning Studio</span>
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
      </div>
    </div>
  );
}

/**
 * Tactical Ecosystem Engine 1: agreekit Python REPL
 */
function AgreekitReplWidget() {
  const [tab, setTab] = useState<'python' | 'cli'>('python');
  const [copied, setCopied] = useState(false);

  function copyCode() {
    const code = tab === 'cli' ? 'agreekit analyze --data paired_spo2.csv' : 'import agreekit as ak\nres = ak.bland_altman(ref=ecg, test=ppg)\nprint(res.summary())';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function copyInstall() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('pip install agreekit');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="rounded-xl border border-hairline/70 bg-[#090d16] text-white p-3.5 space-y-2.5 font-mono text-xs select-none">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-[10px] text-slate-400">agreekit v1.0 • Python REPL</span>
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="text-slate-400 hover:text-white transition-colors"
          title="Copy snippet"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
      </div>

      {/* Quick Install Pill */}
      <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-900/90 px-2.5 py-1.5 border border-slate-800 text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Terminal size={12} className="text-amber-400 shrink-0" aria-hidden />
          <span className="text-amber-400 select-none">$</span>
          <span className="text-slate-100 font-semibold">pip install agreekit</span>
        </div>
        <button
          type="button"
          onClick={copyInstall}
          className="text-slate-400 hover:text-amber-400 transition-colors text-[10px] font-sans font-medium"
        >
          Copy
        </button>
      </div>

      {/* Interactive Tabs */}
      <div className="flex items-center gap-2 text-[11px] pt-0.5">
        <button
          type="button"
          onClick={() => setTab('python')}
          className={`px-2 py-0.5 rounded transition-all ${tab === 'python' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Python API
        </button>
        <button
          type="button"
          onClick={() => setTab('cli')}
          className={`px-2 py-0.5 rounded transition-all ${tab === 'cli' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          CLI Terminal
        </button>
      </div>

      {tab === 'python' ? (
        <div className="text-[11px] leading-relaxed text-slate-300 min-h-[44px]">
          <p><span className="text-purple-400">import</span> agreekit <span className="text-purple-400">as</span> ak</p>
          <p>res = ak.<span className="text-cyan-400">analyze</span>(ref=ecg, test=wrist_ppg)</p>
          <p className="text-emerald-400"># Limits of agreement &amp; parameter confidence</p>
        </div>
      ) : (
        <div className="text-[11px] leading-relaxed text-slate-300 min-h-[44px]">
          <p><span className="text-amber-400">$</span> agreekit analyze --data paired_spo2.csv</p>
          <p className="text-slate-400"># Pairwise limits-of-agreement analysis</p>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
        <span>Bland-Altman</span>
        <span>•</span>
        <span>Bootstrap CI</span>
        <span>•</span>
        <span>Non-Inferiority</span>
      </div>
    </div>
  );
}

/**
 * Tactical Ecosystem Engine 2: Population Data Curves
 */
function PopulationDataWidget() {
  const uid = useId().replace(/:/g, '');
  const popGrad1Id = `pop-g1-${uid}`;
  const popGrad2Id = `pop-g2-${uid}`;

  return (
    <div className="rounded-xl border border-hairline/70 bg-plane/70 p-3">
      <svg viewBox="0 0 320 120" className="w-full h-28 select-none" aria-hidden="true">
        <defs>
          <linearGradient id={popGrad1Id} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="var(--color-series-5)" stopOpacity="0.25" />
            <stop offset="1" stopColor="var(--color-series-5)" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id={popGrad2Id} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="var(--color-series-1)" stopOpacity="0.22" />
            <stop offset="1" stopColor="var(--color-series-1)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <line x1="30" y1="95" x2="290" y2="95" stroke="var(--color-hairline)" strokeWidth="1" />
        <path d="M 50 95 C 90 95, 115 28, 145 28 C 175 28, 200 95, 240 95 Z" fill={`url(#${popGrad1Id})`} />
        <path d="M 50 95 C 90 95, 115 28, 145 28 C 175 28, 200 95, 240 95" fill="none" stroke="var(--color-series-5)" strokeWidth="2" />
        <path d="M 85 95 C 125 95, 155 38, 185 38 C 215 38, 245 95, 285 95 Z" fill={`url(#${popGrad2Id})`} />
        <path d="M 85 95 C 125 95, 155 38, 185 38 C 215 38, 245 95, 285 95" fill="none" stroke="var(--color-series-1)" strokeWidth="2" />

        <line x1="85" y1="48" x2="85" y2="95" stroke="var(--color-ink-muted)" strokeWidth="1" strokeDasharray="2 2" />
        <text x="85" y="44" fill="var(--color-ink-muted)" fontSize="7" textAnchor="middle">P5</text>
        <line x1="165" y1="20" x2="165" y2="95" stroke="var(--color-series-5)" strokeWidth="1.5" strokeDasharray="2 2" />
        <rect x="145" y="10" width="40" height="13" rx="2" fill="var(--color-surface)" stroke="var(--color-series-5)" strokeWidth="0.75" />
        <text x="165" y="19" fill="var(--color-series-5)" fontSize="7.5" fontWeight="bold" textAnchor="middle">Median</text>
        <line x1="245" y1="48" x2="245" y2="95" stroke="var(--color-ink-muted)" strokeWidth="1" strokeDasharray="2 2" />
        <text x="245" y="44" fill="var(--color-ink-muted)" fontSize="7" textAnchor="middle">P95</text>

        <text x="50" y="108" fill="var(--color-ink-muted)" fontSize="7.5">50 bpm</text>
        <text x="165" y="108" fill="var(--color-ink-muted)" fontSize="7.5" textAnchor="middle">75 bpm</text>
        <text x="260" y="108" fill="var(--color-ink-muted)" fontSize="7.5" textAnchor="end">100 bpm</text>
      </svg>
      <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted border-t border-hairline pt-2">
        <span>CDC NHANES • SCIN Baseline</span>
        <span className="font-semibold text-series-5">Weighted Densities</span>
      </div>
    </div>
  );
}

/**
 * Tactical Ecosystem Engine 3: Reference Device Spec Sheet
 */
function ReferenceDeviceWidget() {
  return (
    <div className="rounded-xl border border-hairline/70 bg-plane/70 p-3">
      <svg viewBox="0 0 320 120" className="w-full h-28 select-none" aria-hidden="true">
        <rect x="10" y="8" width="300" height="104" rx="8" fill="var(--color-surface)" stroke="var(--color-hairline)" />

        {/* Tier 1: Gold */}
        <g transform="translate(24, 16)">
          <rect x="0" y="0" width="84" height="60" rx="6" fill="#f59e0b" fillOpacity="0.08" stroke="#f59e0b" strokeWidth="1" />
          <rect x="6" y="6" width="38" height="12" rx="3" fill="#f59e0b" fillOpacity="0.18" />
          <text x="25" y="15" fill="#d97706" fontSize="6.5" fontWeight="bold" textAnchor="middle">GOLD</text>
          <text x="10" y="30" fill="var(--color-ink)" fontSize="7.5" fontWeight="bold">Clinical True</text>
          <text x="10" y="42" fill="var(--color-ink-muted)" fontSize="6.5">CO-Ox / Holter</text>
          <text x="10" y="52" fill="#d97706" fontSize="6.5" fontWeight="bold">σ_ref ≈ 0</text>
        </g>

        {/* Tier 2: Silver */}
        <g transform="translate(118, 16)">
          <rect x="0" y="0" width="84" height="60" rx="6" fill="#0284c7" fillOpacity="0.08" stroke="#0284c7" strokeWidth="1" />
          <rect x="6" y="6" width="42" height="12" rx="3" fill="#0284c7" fillOpacity="0.18" />
          <text x="27" y="15" fill="#0284c7" fontSize="6.5" fontWeight="bold" textAnchor="middle">SILVER</text>
          <text x="10" y="30" fill="var(--color-ink)" fontSize="7.5" fontWeight="bold">Research Bench</text>
          <text x="10" y="42" fill="var(--color-ink-muted)" fontSize="6.5">Masimo / Faros</text>
          <text x="10" y="52" fill="#0284c7" fontSize="6.5" fontWeight="bold">+25% n penalty</text>
        </g>

        {/* Tier 3: Bronze */}
        <g transform="translate(212, 16)">
          <rect x="0" y="0" width="84" height="60" rx="6" fill="#ea580c" fillOpacity="0.08" stroke="#ea580c" strokeWidth="1" />
          <rect x="6" y="6" width="46" height="12" rx="3" fill="#ea580c" fillOpacity="0.18" />
          <text x="29" y="15" fill="#ea580c" fontSize="6.5" fontWeight="bold" textAnchor="middle">BRONZE</text>
          <text x="10" y="30" fill="var(--color-ink)" fontSize="7.5" fontWeight="bold">Consumer Head</text>
          <text x="10" y="42" fill="var(--color-ink-muted)" fontSize="6.5">Wrist Optical PPG</text>
          <text x="10" y="52" fill="#ea580c" fontSize="6.5" fontWeight="bold">+120% n penalty</text>
        </g>

        <rect x="24" y="84" width="272" height="18" rx="4" fill="var(--color-plane)" stroke="var(--color-hairline)" />
        <text x="160" y="96" fill="var(--color-ink)" fontSize="6.8" fontWeight="600" textAnchor="middle">
          FDA 510(k) Predicates • 10-Dimension Dossiers • Hardware Sync Triggers
        </text>
      </svg>
      <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted border-t border-hairline pt-2">
        <span>Predicate Chains</span>
        <span className="font-semibold text-series-1">12 Biometric Domains</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [copiedPip, setCopiedPip] = useState(false);

  function handleCopyPip() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('pip install agreekit');
      setCopiedPip(true);
      setTimeout(() => setCopiedPip(false), 2000);
    }
  }

  return (
    <div className="relative flex flex-col gap-16 sm:gap-24 py-4 sm:py-8">
      {/* =========================================================================
          HERO SECTION — 12-Column Asymmetric Canvas (Vercel & Nextra Standard)
          ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left 5 Columns: Authoritative Headline, Action Pills, Telemetry Chips */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/85 px-3.5 py-1 text-xs font-semibold text-series-1 shadow-2xs backdrop-blur-sm transition-all hover:border-series-1/30">
            <Sparkles size={13} className="text-series-1 shrink-0" aria-hidden />
            <span>OPEN-SOURCE VALIDATION</span>
            <span className="text-ink-muted/50">•</span>
            <span className="text-ink-secondary font-medium">Wearable Health Algorithms</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink sm:text-5xl lg:text-6xl leading-[1.06]">
              Measure Ground Truth. Validate With Confidence.
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-ink-secondary max-w-xl font-normal">
              The open-source suite for wearable sensors and health algorithms.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              to="/academy"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs sm:text-sm font-semibold text-surface shadow-xs transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <span>Explore The Academy</span>
              <ArrowRight size={15} aria-hidden />
            </Link>

            <button
              type="button"
              onClick={handleCopyPip}
              title="Copy install command"
              className="group inline-flex items-center gap-2.5 rounded-xl border border-hairline bg-surface px-3.5 py-2.5 font-mono text-xs text-ink-secondary shadow-2xs transition-all hover:border-ink/25 hover:bg-plane active:scale-[0.98]"
            >
              <Terminal size={13} className="text-series-7 shrink-0" aria-hidden />
              <span className="text-ink font-semibold">$ pip install agreekit</span>
              {copiedPip ? (
                <Check size={13} className="text-good" aria-label="Copied" />
              ) : (
                <Copy size={13} className="text-ink-muted group-hover:text-ink transition-colors" aria-hidden />
              )}
            </button>

            <a
              href="https://github.com/ross-wilkinson/open-wearable-validation"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-plane px-3.5 py-2.5 text-xs font-semibold text-ink-secondary shadow-2xs hover:text-ink hover:border-ink/20 hover:bg-surface transition-all"
            >
              <span>GitHub</span>
              <ExternalLink size={12} aria-hidden />
            </a>
          </div>

          {/* Micro-Trust Indicators */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-ink-muted border-t border-hairline/60">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-series-3 shrink-0" aria-hidden />
              <span>Zero Data Upload</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Cpu size={14} className="text-series-1 shrink-0" aria-hidden />
              <span>100% In-Browser Math</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers size={14} className="text-series-4 shrink-0" aria-hidden />
              <span>Peer-Reviewed Algorithms</span>
            </span>
          </div>
        </div>

        {/* Right 6 Columns: The Live Biosensor Validation Stage */}
        <div className="lg:col-span-6">
          <HeroValidationStage />
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: THE VALIDATION ACADEMY — Asymmetric Editorial Bento
          ========================================================================= */}
      <section aria-label="In-Browser Validation Studios" className="space-y-6 sm:space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-hairline pb-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2">
              <span className="rounded-md bg-series-1/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-series-1 border border-series-1/20">
                IN-BROWSER WORKBENCHES
              </span>
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                ZERO DATA UPLOAD
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              The Validation Academy
            </h2>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
              The open-source interactive web suite hosting 4 specialized workspaces:
              <strong className="text-ink"> Learning Studio</strong>,
              <strong className="text-ink"> Protocol Studio</strong>,
              <strong className="text-ink"> Report Studio</strong>, and
              <strong className="text-ink"> Pitfall Explorer</strong>.
            </p>
          </div>
          <Link
            to="/academy"
            className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface px-4 py-2.5 text-xs font-semibold text-ink shadow-2xs hover:bg-plane hover:border-ink/25 transition-all self-start md:self-end shrink-0"
          >
            <span>Enter Validation Academy</span>
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>

        {/* Asymmetric Bento Architecture: Row 1 = 8 + 4, Row 2 = 4 + 8 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7">
          {/* Row 1, Left: Flagship Protocol Studio (8 Cols) */}
          <Link
            to="/protocol-studio"
            className="lg:col-span-8 group relative flex flex-col justify-between overflow-hidden rounded-2xl hairline-card-interactive bg-surface p-6 sm:p-7 shadow-2xs hover:-translate-y-1 text-left"
          >
            <ProtocolStudioWorkbench />
          </Link>

          {/* Row 1, Right: Companion Report Studio (4 Cols) */}
          <Link
            to="/report-studio/overview"
            className="lg:col-span-4 group relative flex flex-col justify-between overflow-hidden rounded-2xl hairline-card-interactive bg-surface p-6 sm:p-7 shadow-2xs hover:-translate-y-1 text-left"
          >
            <ReportStudioGateMatrix />
          </Link>

          {/* Row 2, Left: Companion Pitfall Explorer (4 Cols) */}
          <Link
            to="/explainers"
            className="lg:col-span-4 group relative flex flex-col justify-between overflow-hidden rounded-2xl hairline-card-interactive bg-surface p-6 sm:p-7 shadow-2xs hover:-translate-y-1 text-left"
          >
            <PitfallExplorerCard />
          </Link>

          {/* Row 2, Right: Flagship Learning Studio (8 Cols) */}
          <Link
            to="/academy"
            className="lg:col-span-8 group relative flex flex-col justify-between overflow-hidden rounded-2xl hairline-card-interactive bg-surface p-6 sm:p-7 shadow-2xs hover:-translate-y-1 text-left"
          >
            <LearningStudioFlightPath />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: DEVELOPER ENGINES & REFERENCE STANDARDS — 3 Tactical Artifacts
          ========================================================================= */}
      <section aria-label="Open Tools & Clinical Reference Baselines" className="space-y-6 sm:space-y-8">
        <div className="space-y-2 border-b border-hairline pb-5">
          <div className="inline-flex items-center gap-2">
            <span className="rounded-md bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/20">
              DEVELOPER ENGINES &amp; STANDARDS
            </span>
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              PIPELINE INTEGRATION
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
            Analysis Engines, Reference Standards &amp; Population Baselines
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed max-w-3xl">
            Open-source computational libraries, normative population reference curves, and clinical comparator specifications for production validation workflows.
          </p>
        </div>

        {/* 3-Column Ecosystem Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {/* Card 1: agreekit Python REPL */}
          <Link
            to="/agreekit"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl hairline-card-interactive bg-surface p-6 sm:p-7 shadow-2xs hover:-translate-y-1 text-left"
          >
            <div className="flex flex-1 flex-col space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <AgreekitLogo size={13} />
                  <span>AGREEKIT</span>
                </span>
                <span className="font-mono text-[10px] text-ink-muted bg-plane px-2 py-0.5 rounded border border-hairline">
                  Python • CLI • MCP
                </span>
              </div>
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-amber-500 leading-snug">
                  Execute agreement analyses in Python
                </h2>
                <p className="text-[11px] font-semibold tracking-wider text-ink-muted">
                  Python agreement engine, CLI, MCP server
                </p>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-ink-secondary">
                An open-source Python package and MCP server built specifically for wearable health and algorithm validation studies. Execute exact agreement statistics, variance decompositions, and cluster-bootstrap confidence intervals directly within your own research pipelines and AI workflows.
              </p>
            </div>

            <div className="my-5">
              <AgreekitReplWidget />
            </div>

            <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
              <span>Enter agreekit Hub</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" aria-hidden />
            </div>
          </Link>

          {/* Card 2: Health Data Catalog */}
          <Link
            to="/health-data-distributions"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl hairline-card-interactive bg-surface p-6 sm:p-7 shadow-2xs hover:-translate-y-1 text-left"
          >
            <div className="flex flex-1 flex-col space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-series-5/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-series-5 border border-series-5/20">
                  HEALTH DATA CATALOG
                </span>
                <span className="font-mono text-[10px] text-ink-muted bg-plane px-2 py-0.5 rounded border border-hairline">
                  Distributions &amp; Baselines
                </span>
              </div>
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-series-5 leading-snug">
                  Ground your protocol in population data
                </h2>
                <p className="text-[11px] font-semibold tracking-wider text-ink-muted">
                  Population Reference Baselines
                </p>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-ink-secondary">
                Planning an accurate study requires knowing how physiological measures naturally vary in real populations. Access reference distributions across various subject demographics and health measures to set realistic baselines before writing your protocol.
              </p>
            </div>

            <div className="my-5">
              <PopulationDataWidget />
            </div>

            <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs font-semibold text-series-5">
              <span>Enter Health Data Hub</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" aria-hidden />
            </div>
          </Link>

          {/* Card 3: Reference Device Catalog */}
          <Link
            to="/reference-device-catalog"
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl hairline-card-interactive bg-surface p-6 sm:p-7 shadow-2xs hover:-translate-y-1 text-left"
          >
            <div className="flex flex-1 flex-col space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-series-1/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-series-1 border border-series-1/20">
                  REFERENCE DEVICE CATALOG
                </span>
                <span className="font-mono text-[10px] text-ink-muted bg-plane px-2 py-0.5 rounded border border-hairline">
                  Predicates &amp; Standards
                </span>
              </div>
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-series-1 leading-snug">
                  Evaluate clinical reference standards
                </h2>
                <p className="text-[11px] font-semibold tracking-wider text-ink-muted">
                  Clinical Comparators &amp; 510(k) Predicates
                </p>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-ink-secondary">
                Selecting the right reference comparator determines regulatory clearance, data pipeline friction, and sample size inflation. Explore 10-dimension engineering profiles across 12 biometric domains covering FDA 510(k) predicates, hardware sync triggers, and consumable budgets.
              </p>
            </div>

            <div className="my-5">
              <ReferenceDeviceWidget />
            </div>

            <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs font-semibold text-series-1">
              <span>Enter Reference Catalog</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" aria-hidden />
            </div>
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PEER-REVIEWED PROVENANCE & ZERO-TELEMETRY STRIP
          ========================================================================= */}
      <section className="rounded-2xl hairline-card bg-surface p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <OpenWearableValidationLogo size={22} />
            <h3 className="text-sm font-semibold text-ink">
              Engineered for Zero Data Upload &amp; Exact Mathematics
            </h3>
          </div>
          <p className="text-xs text-ink-muted max-w-2xl leading-relaxed">
            Authored by Ross D. Wilkinson, PhD (ex-Google Research Scientist). All calculations
            execute entirely in your local browser with zero telemetry. Built to replace fragile
            spreadsheets with exact non-central t intervals and random-effects models.
          </p>
        </div>

        <Link
          to="/about"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-series-1 hover:underline self-start sm:self-center"
        >
          <span>Author credentials &amp; rationale</span>
          <ArrowRight size={13} aria-hidden />
        </Link>
      </section>
    </div>
  );
}
