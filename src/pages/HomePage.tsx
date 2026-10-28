import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Copy,
  Cpu,
  ExternalLink,
  Layers,
  ShieldCheck,
  Sliders,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { OpenWearableValidationLogo } from '../components/brand/OpenWearableValidationLogo.tsx';
import { AgreekitLogo } from '../components/brand/AgreekitLogo.tsx';

/* ============================================================================
 * 1. HERO CENTERPIECE: CLINICAL BIOSENSOR VALIDATION INSTRUMENT
 *    Authentic physiological validation data science:
 *    - Mode A: Real-time Bland-Altman Agreement Plot (ΔHR vs Mean HR) with 95% LoA
 *    - Mode B: Synchronized Beat Interval Tachogram (ECG R-R vs PPG Peak-to-Peak)
 * ============================================================================ */
function HeroClinicalInstrument() {
  const [viewMode, setViewMode] = useState<'bland-altman' | 'tachogram'>('bland-altman');
  const [motionProvocation, setMotionProvocation] = useState(false);
  const uid = useId().replace(/:/g, '');
  const corridorGradId = `hero-corridor-${uid}`;

  // 32 Realistic paired cardiac observations: Mean HR (X: 55-145 bpm) vs Difference (Y: Test - Ref bpm)
  // Baseline: tight clustering around bias +0.34 bpm within [-3.8, +4.5] bpm
  // Motion provoked: variance inflation + cadence-lock divergence at higher HR
  const scatterPoints = [
    { mean: 58, diff: 0.2, provDiff: 0.4 },
    { mean: 62, diff: -0.8, provDiff: -1.2 },
    { mean: 65, diff: 0.5, provDiff: 0.8 },
    { mean: 68, diff: 1.1, provDiff: 1.9 },
    { mean: 71, diff: -0.3, provDiff: -0.6 },
    { mean: 73, diff: 0.4, provDiff: 1.1 },
    { mean: 76, diff: -1.2, provDiff: -1.8 },
    { mean: 79, diff: 0.7, provDiff: 1.4 },
    { mean: 82, diff: 0.1, provDiff: 0.5 },
    { mean: 85, diff: -0.6, provDiff: -1.1 },
    { mean: 88, diff: 1.4, provDiff: 2.8 },
    { mean: 91, diff: 0.3, provDiff: 1.2 },
    { mean: 94, diff: -0.9, provDiff: -2.1 },
    { mean: 97, diff: 0.6, provDiff: 2.3 },
    { mean: 101, diff: 0.2, provDiff: 1.8 },
    { mean: 104, diff: -1.4, provDiff: -3.5 },
    { mean: 108, diff: 0.8, provDiff: 3.2 },
    { mean: 112, diff: 1.2, provDiff: 4.6 },
    { mean: 115, diff: -0.4, provDiff: -2.8 },
    { mean: 119, diff: 0.9, provDiff: 5.4 },
    { mean: 122, diff: -1.1, provDiff: -4.2 },
    { mean: 126, diff: 1.5, provDiff: 6.8 },
    { mean: 129, diff: 0.4, provDiff: 3.9 },
    { mean: 132, diff: -0.7, provDiff: -5.1 },
    { mean: 135, diff: 1.8, provDiff: 8.2 },
    { mean: 138, diff: 0.5, provDiff: 4.7 },
    { mean: 141, diff: -1.5, provDiff: -6.4 },
    { mean: 144, diff: 0.8, provDiff: 7.9 },
  ];

  // Tachogram extracted inter-beat interval time series (ms) for 24 cardiac cycles
  const rriSeries = [842, 835, 828, 819, 812, 804, 796, 788, 782, 775, 768, 762, 758, 754, 750, 746, 742, 739, 736, 734, 731, 729, 727, 725];
  const ppiBaseline = [840, 837, 826, 821, 810, 806, 794, 790, 780, 777, 766, 764, 756, 756, 748, 748, 740, 741, 734, 736, 729, 731, 725, 727];
  const ppiMotion = [840, 837, 826, 821, 810, 835, 820, 842, 815, 830, 805, 822, 790, 810, 785, 802, 775, 792, 765, 780, 755, 770, 745, 760];
  const activePpi = motionProvocation ? ppiMotion : ppiBaseline;

  // Coordinate scales for 800x170 Bland-Altman SVG
  // X: Mean HR [50..150] -> pixel [55..665]
  // Y: Diff [-15..+15] -> pixel [145..15], centered at y=80 (0 bpm)
  const mapMeanX = (m: number) => 55 + ((m - 50) / 100) * 610;
  const mapDiffY = (d: number) => 80 - (d / 15) * 65;

  // LoA values
  const upperLoA = motionProvocation ? 8.4 : 4.48;
  const lowerLoA = motionProvocation ? -6.8 : -3.8;
  const meanBias = motionProvocation ? 1.62 : 0.34;

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Subtle atmospheric glow behind the clinical instrument */}
      <div
        className="pointer-events-none absolute -inset-x-8 -top-10 h-72 rounded-full bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-indigo-500/10 blur-3xl opacity-70"
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-2xl border border-hairline bg-[#090d16] text-slate-100 shadow-2xl">
        {/* Top Instrument Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/90 bg-[#060911] px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-mono text-xs font-bold tracking-wider uppercase text-slate-200">
              Live Biosensor Validation Engine
            </span>
            <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-slate-700/60 hidden sm:inline">
              500 Hz Sync • Paired Epoch Stream
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: LoA vs Tachogram */}
            <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/90 p-0.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setViewMode('bland-altman')}
                className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                  viewMode === 'bland-altman'
                    ? 'bg-slate-800 text-sky-400 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                LoA Scatter Plane
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tachogram')}
                className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                  viewMode === 'tachogram'
                    ? 'bg-slate-800 text-emerald-400 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                R-R vs Peak-to-Peak Sync
              </button>
            </div>

            {/* Provocation Stress-Test Trigger */}
            <button
              type="button"
              onClick={() => setMotionProvocation(!motionProvocation)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-mono font-semibold transition-all cursor-pointer ${
                motionProvocation
                  ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Zap size={12} className={motionProvocation ? 'text-amber-400' : 'text-slate-500'} />
              <span>{motionProvocation ? 'Cadence Lock Provoked' : 'Resting Baseline'}</span>
            </button>
          </div>
        </div>

        {/* Analytical Visualization Stage */}
        <div className="p-5 sm:p-6">
          {viewMode === 'bland-altman' ? (
            /* ================================================================
             * VIEW A: TRUE BLAND-ALTMAN DIFFERENCE SCATTER PLOT
             * ================================================================ */
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    Paired Observations (Δ = Test − Ref)
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <span className="h-0.5 w-3 bg-emerald-400" />
                    Mean Bias ({meanBias >= 0 ? `+${meanBias.toFixed(2)}` : meanBias.toFixed(2)} bpm)
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-400 hidden sm:inline-flex">
                    <span className="h-0.5 w-3 bg-slate-500 border-dashed border-t" />
                    95% LoA Corridor ([{lowerLoA.toFixed(1)}, +{upperLoA.toFixed(1)}] bpm)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">ISO 80601-2-61 • N = 48 Paired Beats</span>
              </div>

              <svg viewBox="0 0 800 170" className="w-full h-auto select-none overflow-visible" aria-hidden="true">
                <defs>
                  <linearGradient id={corridorGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={motionProvocation ? '#f59e0b' : '#10b981'}
                      stopOpacity="0.14"
                    />
                    <stop
                      offset="100%"
                      stopColor={motionProvocation ? '#f59e0b' : '#10b981'}
                      stopOpacity="0.03"
                    />
                  </linearGradient>
                </defs>

                {/* 95% LoA Shaded Corridor */}
                <rect
                  x="55"
                  y={mapDiffY(upperLoA)}
                  width="610"
                  height={mapDiffY(lowerLoA) - mapDiffY(upperLoA)}
                  fill={`url(#${corridorGradId})`}
                />

                {/* Horizontal Reference Lines */}
                <line x1="55" y1="15" x2="665" y2="15" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="55" y1={mapDiffY(10)} x2="665" y2={mapDiffY(10)} stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="55" y1={mapDiffY(5)} x2="665" y2={mapDiffY(5)} stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="55" y1={mapDiffY(0)} x2="665" y2={mapDiffY(0)} stroke="#475569" strokeWidth="1" strokeDasharray="4 2" />
                <line x1="55" y1={mapDiffY(-5)} x2="665" y2={mapDiffY(-5)} stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="55" y1={mapDiffY(-10)} x2="665" y2={mapDiffY(-10)} stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="55" y1="150" x2="665" y2="150" stroke="#1e293b" />

                {/* Vertical Reference Grid */}
                {[60, 80, 100, 120, 140].map((bpm) => (
                  <line
                    key={bpm}
                    x1={mapMeanX(bpm)}
                    y1="15"
                    x2={mapMeanX(bpm)}
                    y2="150"
                    stroke="#1e293b"
                    strokeDasharray="3 3"
                  />
                ))}

                {/* Upper 95% LoA Line */}
                <line
                  x1="55"
                  y1={mapDiffY(upperLoA)}
                  x2="665"
                  y2={mapDiffY(upperLoA)}
                  stroke={motionProvocation ? '#f59e0b' : '#10b981'}
                  strokeWidth="1.5"
                  strokeDasharray="5 3"
                />
                <text
                  x="675"
                  y={mapDiffY(upperLoA) + 4}
                  fill={motionProvocation ? '#f59e0b' : '#10b981'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  +1.96 SD (+{upperLoA.toFixed(1)})
                </text>

                {/* Mean Bias Line */}
                <line
                  x1="55"
                  y1={mapDiffY(meanBias)}
                  x2="665"
                  y2={mapDiffY(meanBias)}
                  stroke="#38bdf8"
                  strokeWidth="1.75"
                />
                <text
                  x="675"
                  y={mapDiffY(meanBias) + 4}
                  fill="#38bdf8"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  Bias ({meanBias >= 0 ? `+${meanBias.toFixed(1)}` : meanBias.toFixed(1)})
                </text>

                {/* Lower 95% LoA Line */}
                <line
                  x1="55"
                  y1={mapDiffY(lowerLoA)}
                  x2="665"
                  y2={mapDiffY(lowerLoA)}
                  stroke={motionProvocation ? '#f59e0b' : '#10b981'}
                  strokeWidth="1.5"
                  strokeDasharray="5 3"
                />
                <text
                  x="675"
                  y={mapDiffY(lowerLoA) + 4}
                  fill={motionProvocation ? '#f59e0b' : '#10b981'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  −1.96 SD ({lowerLoA.toFixed(1)})
                </text>

                {/* Scatter Points */}
                {scatterPoints.map((pt, i) => {
                  const val = motionProvocation ? pt.provDiff : pt.diff;
                  const cx = mapMeanX(pt.mean);
                  const cy = mapDiffY(val);
                  const isOutlier = val > upperLoA || val < lowerLoA;
                  return (
                    <g key={i}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isOutlier ? 4.5 : 3.5}
                        fill={isOutlier ? '#f59e0b' : '#38bdf8'}
                        stroke="#090d16"
                        strokeWidth="1.5"
                      />
                      {isOutlier && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={7.5}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Axis Labels */}
                <text x="360" y="165" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  Mean Heart Rate (ECG + PPG) / 2 [bpm]
                </text>
                <text
                  x="15"
                  y="85"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                  transform="rotate(-90 15 85)"
                >
                  Δ (PPG − ECG) [bpm]
                </text>
              </svg>
            </div>
          ) : (
            /* ================================================================
             * VIEW B: EXTRACTED BEAT INTERVAL TACHOGRAM (R-R vs Peak-to-Peak)
             * ================================================================ */
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Reference: Holter ECG R-R Interval (RRI)
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sky-400">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    Test: Optical PPG Inter-Pulse Interval (PPI)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">Beat-by-Beat Temporal Alignment</span>
              </div>

              <svg viewBox="0 0 800 170" className="w-full h-auto select-none overflow-visible" aria-hidden="true">
                {/* Horizontal Timing Grid */}
                {[720, 760, 800, 840].map((ms) => {
                  const y = 20 + ((860 - ms) / 160) * 125;
                  return (
                    <g key={ms}>
                      <line x1="50" y1={y} x2="750" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                      <text x="42" y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
                        {ms} ms
                      </text>
                    </g>
                  );
                })}

                {/* ECG R-R Trace (Emerald) */}
                <path
                  d={rriSeries
                    .map((val, idx) => {
                      const x = 55 + idx * 30;
                      const y = 20 + ((860 - val) / 160) * 125;
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* PPG PPI Trace (Sky) */}
                <path
                  d={activePpi
                    .map((val, idx) => {
                      const x = 55 + idx * 30;
                      const y = 20 + ((860 - val) / 160) * 125;
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeDasharray={motionProvocation ? '4 2' : undefined}
                />

                {/* Individual Beat Nodes */}
                {rriSeries.map((val, idx) => {
                  const x = 55 + idx * 30;
                  const y = 20 + ((860 - val) / 160) * 125;
                  return <circle key={idx} cx={x} cy={y} r="3" fill="#10b981" />;
                })}
                {activePpi.map((val, idx) => {
                  const x = 55 + idx * 30;
                  const y = 20 + ((860 - val) / 160) * 125;
                  return <circle key={idx} cx={x} cy={y} r="2.5" fill="#38bdf8" />;
                })}

                {/* X-Axis Beat Index */}
                <line x1="50" y1="150" x2="750" y2="150" stroke="#334155" />
                <text x="400" y="165" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">
                  Sequential Cardiac Beat Index (1 .. 24)
                </text>
              </svg>
            </div>
          )}
        </div>

        {/* Bottom DOM Telemetry Strip — Crisp HTML Elements (Family.co style) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-800/90 bg-[#060911] divide-x divide-slate-800/80">
          <div className="px-5 py-3.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Mean Bias (d&#772;)
            </div>
            <div
              className={`mt-0.5 font-mono text-base sm:text-lg font-bold ${
                motionProvocation ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {motionProvocation ? '+1.62 bpm' : '+0.34 bpm'}
            </div>
          </div>

          <div className="px-5 py-3.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              95% Limits of Agreement
            </div>
            <div className="mt-0.5 font-mono text-base sm:text-lg font-bold text-slate-100">
              {motionProvocation ? '[-6.8, +8.4] bpm' : '[-3.80, +4.48] bpm'}
            </div>
          </div>

          <div className="px-5 py-3.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Concordance CCC (&rho;<sub>c</sub>)
            </div>
            <div className="mt-0.5 font-mono text-base sm:text-lg font-bold text-sky-400">
              {motionProvocation ? '0.941' : '0.988'}
            </div>
          </div>

          <div className="px-5 py-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Clinical Verdict
              </div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${
                    motionProvocation
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      motionProvocation ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                  {motionProvocation ? 'CADENCE SENSITIVITY' : 'PASS • FDA 510(k) READY'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 2. WORKBENCH CARD 1: PROTOCOL STUDIO
 *    Interactive cohort slider running Greenwood precision equation
 * ============================================================================ */
function ProtocolStudioCard() {
  const [sampleN, setSampleN] = useState(42);
  const uid = useId().replace(/:/g, '');
  const curveGradId = `protocol-curve-${uid}`;

  // Greenwood LoA confidence margin width: w = 1.96 * sqrt(3 * s^2 / N)
  // For physiological heart rate std dev s = 2.5 bpm
  const marginWidth = (1.96 * Math.sqrt((3 * 6.25) / sampleN)).toFixed(1);

  const minN = 15;
  const maxN = 120;
  const ratio = (sampleN - minN) / (maxN - minN);
  const markerX = 24 + ratio * 552;
  const markerY = 28 + 108 * (1 - Math.pow(ratio, 0.48));

  // Precision curve coordinates
  const curvePoints: string[] = [];
  const upperBandPoints: string[] = [];
  const lowerBandPoints: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = 24 + t * 552;
    const y = 28 + 108 * (1 - Math.pow(t, 0.48));
    const spread = 18 * (1 - 0.65 * t);
    curvePoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    upperBandPoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(y - spread).toFixed(1)}`);
    lowerBandPoints.unshift(`L ${x.toFixed(1)} ${(y + spread).toFixed(1)}`);
  }
  const areaPath = `${upperBandPoints.join(' ')} ${lowerBandPoints.join(' ')} Z`;
  const linePath = curvePoints.join(' ');

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-6 sm:p-8 shadow-sm transition-colors hover:border-ink/25">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-sky-400">
            PROTOCOL STUDIO
          </span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-0.5 font-mono text-xs font-bold text-emerald-400">
            LoA Precision Margin: &plusmn;{marginWidth} bpm
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          <Link to="/protocol-studio" className="hover:underline focus:outline-hidden">
            Design your validation study
          </Link>
        </h2>
        <p className="text-sm text-ink-secondary max-w-2xl">
          Sizing a study too small risks inconclusive results, while sizing it too large wastes time and budget. Design protocols for internal product KPIs, predecessor comparisons, or regulatory submissions that properly account for measurement agreement, repeated measures, and demographic quotas before enrolling participants.
        </p>
      </div>

      {/* Edge-to-Edge Responsive Precision Canvas */}
      <div className="my-6 rounded-xl border border-slate-800/90 bg-[#090d16] p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <label
            htmlFor="protocol-n-slider"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-300 cursor-pointer"
          >
            <Sliders size={13} className="text-sky-400" />
            <span>Simulate Participant Cohort (N):</span>
          </label>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="rounded bg-sky-500/20 border border-sky-500/40 px-2.5 py-0.5 font-bold text-sky-300">
              N = {sampleN} subjects
            </span>
            <span className="text-slate-400 hidden sm:inline">Non-Central t Exact Inversion</span>
          </div>
        </div>

        {/* Range Slider aligned with SVG coordinates */}
        <div className="px-2">
          <input
            id="protocol-n-slider"
            type="range"
            min={minN}
            max={maxN}
            value={sampleN}
            onChange={(e) => setSampleN(Number(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer h-2 rounded-lg bg-slate-800"
          />
        </div>

        <svg viewBox="0 0 600 165" className="w-full h-auto select-none mt-2 overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id={curveGradId} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#38bdf8" stopOpacity="0.28" />
              <stop offset="1" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Reference Gridlines */}
          <line x1="24" y1="35" x2="576" y2="35" stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="24" y1="85" x2="576" y2="85" stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="24" y1="138" x2="576" y2="138" stroke="#334155" />

          {/* Clinical Tolerance Threshold */}
          <line x1="24" y1="96" x2="576" y2="96" stroke="#10b981" strokeWidth="1" strokeDasharray="6 4" strokeOpacity="0.6" />
          <text x="572" y="90" fill="#10b981" fontSize="11" fontFamily="monospace" textAnchor="end">
            Clinical Target Corridor (&plusmn;2.5 bpm)
          </text>

          {/* Precision Envelope & Curve */}
          <path d={areaPath} fill={`url(#${curveGradId})`} />
          <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />

          {/* 1:1 Synchronized Caliper Line */}
          <line
            x1={markerX}
            y1="12"
            x2={markerX}
            y2="138"
            stroke="#f59e0b"
            strokeWidth="1.75"
            strokeDasharray="3 3"
          />
          <circle cx={markerX} cy={markerY} r="6" fill="#f59e0b" stroke="#090d16" strokeWidth="2.5" />

          {/* Caliper Callout */}
          <g transform={`translate(${Math.max(70, Math.min(530, markerX))}, ${Math.max(26, markerY - 22)})`}>
            <rect x="-62" y="-16" width="124" height="22" rx="5" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.2" />
            <text x="0" y="-1" fill="#fde68a" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              N={sampleN} &bull; &plusmn;{marginWidth} bpm
            </text>
          </g>

          <text x="24" y="156" fill="#64748b" fontSize="11" fontFamily="monospace">
            N = 15 (Underpowered)
          </text>
          <text x="300" y="156" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="middle">
            N = 42 (FDA Standard)
          </text>
          <text x="576" y="156" fill="#64748b" fontSize="11" fontFamily="monospace" textAnchor="end">
            N = 120 (High Precision)
          </text>
        </svg>
      </div>

      <div className="flex items-center justify-between border-t border-hairline pt-4">
        <span className="text-xs font-mono text-ink-muted">
          Greenwood Variance &bull; Repeated-Measures ANOVA &bull; Monk Skin Tone Quotas
        </span>
        <Link
          to="/protocol-studio"
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-surface transition-all hover:opacity-90 shrink-0"
        >
          <span>Enter Protocol Studio</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

/* ============================================================================
 * 3. WORKBENCH CARD 2: REPORT STUDIO
 *    Tactile DOM 2x2 Launch Gate Scorecard
 * ============================================================================ */
function ReportStudioCard() {
  const [candidate, setCandidate] = useState<'v1' | 'v2.4'>('v2.4');

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-6 sm:p-8 shadow-sm transition-colors hover:border-ink/25">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
            REPORT STUDIO
          </span>

          <div className="inline-flex rounded-lg border border-hairline bg-plane p-0.5 text-xs font-mono font-semibold">
            <button
              type="button"
              onClick={() => setCandidate('v1')}
              className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                candidate === 'v1'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              V1 Predecessor
            </button>
            <button
              type="button"
              onClick={() => setCandidate('v2.4')}
              className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                candidate === 'v2.4'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              V2.4 Candidate
            </button>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          <Link to="/report-studio/overview" className="hover:underline focus:outline-hidden">
            Evaluate product launch readiness
          </Link>
        </h2>
        <p className="text-sm text-ink-secondary">
          Discover the right metrics and KPI frameworks to evaluate wearable performance, and synthesize your results into clear decision scorecards that your stakeholders can all understand and trust.
        </p>
      </div>

      {/* Tactile 2x2 Decision Matrix in DOM */}
      <div className="my-6 rounded-xl border border-slate-800/90 bg-[#090d16] p-4 text-white">
        <div className="grid grid-cols-2 gap-2.5 relative">
          {/* Quadrant II: Top-Left */}
          <div
            className={`rounded-lg border p-3.5 transition-all ${
              candidate === 'v1'
                ? 'border-amber-500/60 bg-amber-500/15 shadow-lg shadow-amber-500/5'
                : 'border-slate-800 bg-slate-900/40 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-amber-400">Q II &bull; PARITY RISK</span>
              {candidate === 'v1' && (
                <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-300 font-medium">
              Meets absolute bound, underpowered vs. predecessor
            </p>
            {candidate === 'v1' && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                V1 Firmware: &sigma; = 4.9 bpm
              </div>
            )}
          </div>

          {/* Quadrant I: Top-Right (Green Light) */}
          <div
            className={`rounded-lg border p-3.5 transition-all ${
              candidate === 'v2.4'
                ? 'border-emerald-500/60 bg-emerald-500/15 shadow-lg shadow-emerald-500/5'
                : 'border-slate-800 bg-slate-900/40 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-emerald-400">Q I &bull; GREEN LIGHT</span>
              {candidate === 'v2.4' && (
                <span className="rounded bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  PASS
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-300 font-medium">
              Superior to predicate &amp; inside clinical LoA corridor
            </p>
            {candidate === 'v2.4' && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                V2.4 Candidate: 98.4% CI
              </div>
            )}
          </div>

          {/* Quadrant III: Bottom-Left */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/30 p-3 opacity-55">
            <div className="text-[11px] font-mono font-bold text-rose-400">Q III &bull; REJECT GATE</div>
            <p className="mt-1 text-xs text-slate-400">
              Exceeds clinical error bounds &amp; degrades lineage
            </p>
          </div>

          {/* Quadrant IV: Bottom-Right */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/30 p-3 opacity-55">
            <div className="text-[11px] font-mono font-bold text-amber-400/80">Q IV &bull; QUALITY DEBT</div>
            <p className="mt-1 text-xs text-slate-400">
              Beats legacy baseline but fails clinical spec
            </p>
          </div>
        </div>

        {/* Clear Verdict Readout Bar */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3 font-mono text-xs">
          <span className="text-slate-400">Gate Decision:</span>
          {candidate === 'v2.4' ? (
            <span className="font-bold text-emerald-400">
              SHIP CANDIDATE V2.4 (98.4% Bivariate Confidence)
            </span>
          ) : (
            <span className="font-bold text-amber-400">
              HOLD V1 RELEASE (Parity Risk in High-Motion Stratum)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-hairline pt-4">
        <span className="text-xs font-mono text-ink-muted">
          2x2 Equivalence Gate &bull; Subgroup Audits &bull; Automated Decision Scorecards
        </span>
        <Link
          to="/report-studio/overview"
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-surface transition-all hover:opacity-90 shrink-0"
        >
          <span>Enter Report Studio</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}

/* ============================================================================
 * 4. WORKBENCH CARD 3: PITFALL EXPLORER
 * ============================================================================ */
function PitfallExplorerCard() {
  const [mode, setMode] = useState<'trap' | 'loa'>('loa');

  return (
    <article className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left 5 Columns: Narrative & Mode Switcher */}
        <div className="lg:col-span-5 space-y-4">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-400">
            PITFALL EXPLORER
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            <Link to="/explainers" className="hover:underline focus:outline-hidden">
              Avoid costly statistical pitfalls
            </Link>
          </h2>

          <p className="text-sm text-ink-secondary leading-relaxed">
            Standard statistical software was built to detect differences between groups rather than evaluate agreement, while generic AI assistants frequently fall into common statistical traps. Discover why standard methods fail when applied to paired wearable sensors, repeated measures, and rapid prototyping screens.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setMode('trap')}
              className={`rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-all cursor-pointer border ${
                mode === 'trap'
                  ? 'bg-rose-500/15 border-rose-500/50 text-rose-400'
                  : 'bg-plane border-hairline text-ink-secondary hover:text-ink'
              }`}
            >
              Trap #1: Pearson r = 0.96 Illusion
            </button>
            <button
              type="button"
              onClick={() => setMode('loa')}
              className={`rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-all cursor-pointer border ${
                mode === 'loa'
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                  : 'bg-plane border-hairline text-ink-secondary hover:text-ink'
              }`}
            >
              Solution: Repeated-Measures LoA
            </button>
          </div>

          <div className="pt-2">
            <Link
              to="/explainers"
              className="inline-flex items-center gap-2 text-xs font-bold text-ink hover:text-sky-400 transition-colors"
            >
              <span>Enter Pitfall Explorer</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right 7 Columns: Side-by-Side Proof */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-slate-800/90 bg-[#090d16] p-4 text-white">
          {/* Panel A: The Naive Correlation Trap */}
          <div
            className={`rounded-lg border p-4 transition-all ${
              mode === 'trap'
                ? 'border-rose-500/60 bg-rose-950/20'
                : 'border-slate-800 bg-slate-900/40 opacity-75'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-xs mb-2">
              <span className="font-bold text-rose-400">THE CORRELATION TRAP</span>
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                r = 0.96 (p &lt; 0.001)
              </span>
            </div>
            <svg viewBox="0 0 240 110" className="w-full h-auto select-none my-2" aria-hidden="true">
              <line x1="20" y1="95" x2="220" y2="95" stroke="#334155" />
              <line x1="20" y1="15" x2="20" y2="95" stroke="#334155" />
              <line x1="25" y1="90" x2="210" y2="25" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="25" y1="78" x2="210" y2="12" stroke="#f43f5e" strokeWidth="2" />
              <circle cx="45" cy="71" r="3.5" fill="#f43f5e" />
              <circle cx="80" cy="58" r="3.5" fill="#f43f5e" />
              <circle cx="115" cy="46" r="3.5" fill="#f43f5e" />
              <circle cx="155" cy="31" r="3.5" fill="#f43f5e" />
              <circle cx="195" cy="18" r="3.5" fill="#f43f5e" />
            </svg>
            <p className="text-xs text-slate-300 font-mono">
              Conceals a <strong className="text-rose-400">+8.4 bpm systematic bias</strong> despite near-perfect correlation.
            </p>
          </div>

          {/* Panel B: True Limits of Agreement */}
          <div
            className={`rounded-lg border p-4 transition-all ${
              mode === 'loa'
                ? 'border-emerald-500/60 bg-emerald-950/20'
                : 'border-slate-800 bg-slate-900/40 opacity-75'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-xs mb-2">
              <span className="font-bold text-emerald-400">TRUE AGREEMENT CORRIDOR</span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                &plusmn;1.96 SD Corridor
              </span>
            </div>
            <svg viewBox="0 0 240 110" className="w-full h-auto select-none my-2" aria-hidden="true">
              <rect x="20" y="28" width="200" height="54" fill="#10b981" fillOpacity="0.1" />
              <line x1="20" y1="28" x2="220" y2="28" stroke="#10b981" strokeWidth="1.5" />
              <line x1="20" y1="55" x2="220" y2="55" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 3" />
              <line x1="20" y1="82" x2="220" y2="82" stroke="#10b981" strokeWidth="1.5" />
              <circle cx="45" cy="51" r="3.5" fill="#10b981" />
              <circle cx="80" cy="62" r="3.5" fill="#10b981" />
              <circle cx="115" cy="48" r="3.5" fill="#10b981" />
              <circle cx="155" cy="59" r="3.5" fill="#10b981" />
              <circle cx="195" cy="53" r="3.5" fill="#10b981" />
            </svg>
            <p className="text-xs text-slate-300 font-mono">
              Exposes exact mean bias and <strong className="text-emerald-400">true Limits of Agreement</strong> across subjects.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ============================================================================
 * 5. THE VALIDATION ACADEMY: MERIDIAN PULSEBAND 2 (Learning Studio)
 * ============================================================================ */
function ValidationAcademyShowcase() {
  const [activeStep, setActiveStep] = useState(1);

  const modules = [
    {
      step: 1,
      phase: 'Prototyping',
      title: 'Optical Bench & SNR Baseline',
      desc: 'Evaluate raw green/red/IR PPG perfusion indices against benchtop phantoms before human trials.',
      metric: 'SNR Gate: > 18 dB',
    },
    {
      step: 2,
      phase: 'Study Sizing',
      title: 'Greenwood LoA Sample Sizing',
      desc: 'Size the Meridian PulseBand 2 cohort so outer 95% confidence bounds fit strictly inside ±5.0 bpm.',
      metric: 'Cohort: N = 48',
    },
    {
      step: 3,
      phase: 'Provocation',
      title: 'Cadence Lock Treadmill Protocol',
      desc: 'Stress-test optical heart rate tracking across step-frequency harmonics during incline running.',
      metric: 'Harmonic Reject: 94%',
    },
    {
      step: 4,
      phase: 'Equity & Quotas',
      title: 'Monk Skin Tone Stratification',
      desc: 'Balance participant recruitment across all 10 Monk Skin Tone levels to prevent melanin absorption bias.',
      metric: 'MST 8–10 Quota: ≥ 35%',
    },
    {
      step: 5,
      phase: 'Motion Compensation',
      title: 'Accelerometer Sensor Fusion',
      desc: 'Validate adaptive noise cancellation algorithms under high-G wrist kinematics.',
      metric: 'Motion RMSE: 2.1 bpm',
    },
    {
      step: 6,
      phase: 'Regulatory',
      title: 'FDA 510(k) Predicate Alignment',
      desc: 'Pair test data against clinical 3-lead ECG and arterial blood gas CO-oximetry predicates.',
      metric: 'ISO 80601-2-61',
    },
    {
      step: 7,
      phase: 'Launch Gate',
      title: 'Bivariate 2x2 Release Scorecard',
      desc: 'Synthesize subgroup performance into an executive Go/No-Go firmware release decision.',
      metric: 'Verdict: Q1 PASS',
    },
    {
      step: 8,
      phase: 'Post-Market',
      title: 'Multi-Year Algorithmic Drift Audit',
      desc: 'Monitor longitudinal firmware updates against locked reference datasets to prevent regression.',
      metric: 'Drift: < 0.2 bpm/yr',
    },
  ];

  const currentMod = (modules[activeStep - 1] ?? modules[0])!;

  return (
    <section
      aria-label="The Validation Academy Guided Curriculum"
      className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-[#0f172a] via-[#090d16] to-[#0c1324] p-6 sm:p-10 text-white shadow-xl"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-800 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-400">
              LEARNING STUDIO
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-0.5 font-mono text-xs font-bold text-indigo-300">
              <Sparkles size={12} />
              <span>8-Stage Longitudinal Flight Path</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            The Validation Academy
          </h2>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-indigo-200">
            <Link to="/academy" className="hover:underline focus:outline-hidden">
              Learn wearable validation hands-on
            </Link>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Step into the shoes of a lead validation scientist developing the fictional Meridian PulseBand 2. Work through 8 interactive modules spanning the full product journey—from early prototyping and product launch to investigating post-launch issues and tracking multi-year device iterations.
          </p>
        </div>

        <Link
          to="/academy"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-md transition-all hover:bg-slate-100 self-start lg:self-auto shrink-0"
        >
          <span>Enter Validation Academy</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* 8-Module Step Selector */}
      <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {modules.map((m) => {
          const isSelected = m.step === activeStep;
          return (
            <button
              key={m.step}
              type="button"
              onClick={() => setActiveStep(m.step)}
              className={`flex flex-col items-start justify-between rounded-xl border p-3 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-400 bg-indigo-500/20 text-white shadow-md'
                  : 'border-slate-800/90 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className={`font-mono text-xs font-bold ${isSelected ? 'text-indigo-300' : 'text-slate-500'}`}>
                M0{m.step}
              </span>
              <span className="mt-1 text-xs font-semibold line-clamp-1">{m.phase}</span>
            </button>
          );
        })}
      </div>

      {/* Active Module Detail */}
      <div className="relative z-10 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center rounded-2xl border border-slate-800 bg-[#060911]/90 p-5 sm:p-6">
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-indigo-400 font-bold uppercase">
              Module 0{currentMod.step} // {currentMod.phase}
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-300 font-semibold">
              {currentMod.metric}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">{currentMod.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">{currentMod.desc}</p>
        </div>

        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-end gap-2 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
          <div className="text-xs font-mono text-slate-400 lg:text-right">
            Includes interactive sandbox, synthetic sensor dataset &amp; reference solution.
          </div>
          <Link
            to="/academy"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-400/40 bg-indigo-500/15 hover:bg-indigo-500/25 px-4 py-2 text-xs font-mono font-bold text-indigo-200 transition-colors"
          >
            <span>Launch Module 0{currentMod.step} Sandbox</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 * 6. MAIN HOMEPAGE COMPONENT
 * ============================================================================ */
export default function HomePage() {
  const [copiedPip, setCopiedPip] = useState(false);
  const [replTab, setReplTab] = useState<'python' | 'cli'>('python');

  function handleCopyPip() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('pip install agreekit');
      setCopiedPip(true);
      setTimeout(() => setCopiedPip(false), 2000);
    }
  }

  return (
    <div className="relative flex flex-col gap-20 sm:gap-28 py-6 sm:py-12">
      {/* =====================================================================
          STAGE 1: ARCHITECTURAL HERO
          ===================================================================== */}
      <section className="space-y-10">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/90 px-4 py-1.5 text-xs font-mono font-semibold text-ink-secondary shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>OPEN-SOURCE VALIDATION</span>
            <span className="text-ink-muted">&bull;</span>
            <span className="text-sky-400">100% Local Browser Execution</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] text-ink leading-[1.04]">
            Measure Ground Truth. Validate With Confidence.
          </h1>

          <p className="mx-auto max-w-3xl text-base sm:text-lg lg:text-xl leading-relaxed text-ink-secondary font-normal">
            The open-source suite for wearable sensors and health algorithms. Plan robust clinical protocols, calculate defensible sample sizes, evaluate performance against clinical reference standards, and make confident product launch decisions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/protocol-studio"
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-bold text-surface shadow-sm transition-all hover:opacity-90"
            >
              <span>Explore Validation Studios</span>
              <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              onClick={handleCopyPip}
              className="group inline-flex items-center gap-2.5 rounded-xl border border-hairline bg-surface px-4 py-3 font-mono text-xs sm:text-sm text-ink-secondary transition-all hover:border-ink/30 hover:bg-plane cursor-pointer"
            >
              <Terminal size={14} className="text-amber-400 shrink-0" />
              <span className="text-ink font-semibold">$ pip install agreekit</span>
              {copiedPip ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <Copy size={14} className="text-ink-muted group-hover:text-ink transition-colors" />
              )}
            </button>

            <a
              href="https://github.com/ross-wilkinson/open-wearable-validation"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-plane/70 px-4 py-3 text-xs sm:text-sm font-semibold text-ink-secondary hover:text-ink hover:border-ink/25 transition-all"
            >
              <span>GitHub</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Clinical Biosensor Validation Instrument */}
        <HeroClinicalInstrument />
      </section>

      {/* =====================================================================
          STAGE 2: INTERACTIVE WORKBENCHES (In-Browser Studios)
          ===================================================================== */}
      <section aria-label="Interactive Validation Workbenches" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-hairline pb-5">
          <div className="space-y-1.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-sky-400">
              IN-BROWSER STATISTICAL WORKBENCHES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-ink">
              Interactive Validation Studios
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-ink-secondary max-w-md">
            Interact with the live statistical engines below, or open each full studio workbench. Zero patient data ever leaves your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-7 flex">
            <ProtocolStudioCard />
          </div>
          <div className="lg:col-span-5 flex">
            <ReportStudioCard />
          </div>
          <div className="lg:col-span-12">
            <PitfallExplorerCard />
          </div>
        </div>
      </section>

      {/* =====================================================================
          STAGE 3: THE VALIDATION ACADEMY
          ===================================================================== */}
      <ValidationAcademyShowcase />

      {/* =====================================================================
          STAGE 4: OPEN-SOURCE ECOSYSTEM & CLINICAL REFERENCE BASELINES
          ===================================================================== */}
      <section aria-label="Developer Engines and Reference Catalogs" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-hairline pb-5">
          <div className="space-y-1.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
              PYTHON ENGINE &bull; NHANES DISTRIBUTIONS &bull; 510(K) PREDICATES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-ink">
              Code Pipelines &amp; Clinical Reference Standards
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-ink-secondary max-w-md">
            Run reproducible validation pipelines in Python or ground your clinical protocol in normative population datasets and hardware comparator specs.
          </p>
        </div>

        {/* 3-Column Responsive Grid matching test: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {/* Card 1: agreekit Python Engine */}
          <article className="flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-6 shadow-sm hover:border-ink/25 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-amber-400">
                  <AgreekitLogo size={14} />
                  <span>AGREEKIT</span>
                </span>
                <span className="rounded bg-plane px-2 py-0.5 font-mono text-[11px] text-ink-muted border border-hairline">
                  Python &bull; CLI &bull; MCP
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-ink">
                <Link to="/agreekit" className="hover:underline focus:outline-hidden">
                  Execute agreement analyses in Python
                </Link>
              </h2>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                An open-source Python package and MCP server built specifically for wearable health and algorithm validation studies. Execute exact agreement statistics, variance decompositions, and cluster-bootstrap confidence intervals directly within your own research pipelines and AI workflows.
              </p>
            </div>

            <div className="my-5 rounded-xl border border-slate-800 bg-[#090d16] p-4 font-mono text-xs text-slate-200 space-y-3">
              {/* Install Bar matching test: pip install agreekit */}
              <div className="flex items-center justify-between rounded-lg bg-slate-900/90 px-2.5 py-1.5 border border-slate-800 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Terminal size={12} className="text-amber-400 shrink-0" aria-hidden />
                  <span className="text-amber-400 select-none">$</span>
                  <span className="text-slate-100 font-semibold">pip install agreekit</span>
                </div>
                <span className="text-[10px] text-slate-500 font-sans">PyPI</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReplTab('python')}
                    className={`rounded px-2 py-0.5 text-[11px] cursor-pointer ${
                      replTab === 'python' ? 'bg-slate-800 text-sky-300 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Python API
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplTab('cli')}
                    className={`rounded px-2 py-0.5 text-[11px] cursor-pointer ${
                      replTab === 'cli' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    CLI / MCP
                  </button>
                </div>
              </div>

              {replTab === 'python' ? (
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <p>
                    <span className="text-purple-400">import</span> agreekit <span className="text-purple-400">as</span> ak
                  </p>
                  <p>
                    res = ak.<span className="text-sky-400">analyze</span>(ref=ecg, test=ppg, cluster=id)
                  </p>
                  <p className="text-emerald-400"># Repeated-measures limits-of-agreement &amp; CIs</p>
                </div>
              ) : (
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <p>
                    <span className="text-amber-400">$</span> agreekit analyze --data paired_hr.csv --cluster id
                  </p>
                  <p className="text-emerald-400">&check; Pass: Mean Bias +0.34 bpm, 95% LoA [-3.8, +4.5]</p>
                </div>
              )}

              {/* Exact badge tokens for testing */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                <span>Bland-Altman</span>
                <span>&bull;</span>
                <span>Bootstrap CI</span>
                <span>&bull;</span>
                <span>Non-Inferiority</span>
              </div>
            </div>

            <div className="border-t border-hairline pt-4 flex items-center justify-between">
              <span className="font-mono text-[11px] text-ink-muted">Python &bull; CLI &bull; MCP Server</span>
              <Link
                to="/agreekit"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline"
              >
                <span>Enter agreekit Hub</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </article>

          {/* Card 2: Population Reference Distributions */}
          <article className="flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-6 shadow-sm hover:border-ink/25 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase text-purple-400">
                  HEALTH DATA CATALOG
                </span>
                <span className="rounded bg-plane px-2 py-0.5 font-mono text-[11px] text-ink-muted border border-hairline">
                  CDC NHANES &bull; SCIN
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-ink">
                <Link to="/health-data-distributions" className="hover:underline focus:outline-hidden">
                  Ground your protocol in population data
                </Link>
              </h2>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Planning an accurate study requires knowing how physiological measures naturally vary in real populations. Access reference distributions across various subject demographics and health measures to set realistic baselines before writing your protocol.
              </p>
            </div>

            {/* Clean DOM + SVG Distribution Preview */}
            <div className="my-5 rounded-xl border border-slate-800 bg-[#090d16] p-4 text-white">
              <svg viewBox="0 0 300 95" className="w-full h-auto select-none" aria-hidden="true">
                <line x1="15" y1="80" x2="285" y2="80" stroke="#334155" />
                <path
                  d="M 25 80 C 65 80, 95 16, 130 16 C 165 16, 195 80, 235 80 Z"
                  fill="#a855f7"
                  fillOpacity="0.2"
                />
                <path
                  d="M 25 80 C 65 80, 95 16, 130 16 C 165 16, 195 80, 235 80"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.2"
                />
                <path
                  d="M 65 80 C 105 80, 135 28, 170 28 C 205 28, 235 80, 275 80"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <line x1="130" y1="16" x2="130" y2="80" stroke="#a855f7" strokeDasharray="2 2" />
              </svg>
              <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-2 font-mono text-[11px] text-slate-300">
                <span>P5: 52 bpm</span>
                <span className="font-bold text-purple-300">Median: 71 bpm</span>
                <span>P95: 96 bpm</span>
              </div>
            </div>

            <div className="border-t border-hairline pt-4 flex items-center justify-between">
              <span className="font-mono text-[11px] text-ink-muted">Weighted Population Baselines</span>
              <Link
                to="/health-data-distributions"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:underline"
              >
                <span>Enter Health Data Hub</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </article>

          {/* Card 3: Reference Device Catalog */}
          <article className="flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-6 shadow-sm hover:border-ink/25 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase text-sky-400">
                  REFERENCE DEVICE CATALOG
                </span>
                <span className="rounded bg-plane px-2 py-0.5 font-mono text-[11px] text-ink-muted border border-hairline">
                  12 Biometric Domains
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-ink">
                <Link to="/reference-device-catalog" className="hover:underline focus:outline-hidden">
                  Evaluate clinical reference standards
                </Link>
              </h2>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Selecting the right reference comparator determines regulatory clearance, data pipeline friction, and sample size inflation. Explore 10-dimension engineering profiles across 12 biometric domains covering FDA 510(k) predicates, hardware sync triggers, and consumable budgets.
              </p>
            </div>

            {/* Tactile DOM Comparator Tier Cards */}
            <div className="my-5 space-y-2 rounded-xl border border-slate-800 bg-[#090d16] p-3.5 font-mono text-xs">
              <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                <div>
                  <span className="font-bold text-amber-300">GOLD</span>
                  <span className="ml-2 text-slate-200">3-Lead Holter / CO-Ox</span>
                </div>
                <span className="text-amber-300 font-bold">&sigma;_ref &asymp; 0</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2">
                <div>
                  <span className="font-bold text-sky-300">SILVER</span>
                  <span className="ml-2 text-slate-200">Masimo / Bittium Faros</span>
                </div>
                <span className="text-sky-300 font-bold">+25% N Penalty</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2">
                <div>
                  <span className="font-bold text-rose-300">BRONZE</span>
                  <span className="ml-2 text-slate-200">Consumer Optical Strap</span>
                </div>
                <span className="text-rose-300 font-bold">+120% N Penalty</span>
              </div>
            </div>

            <div className="border-t border-hairline pt-4 flex items-center justify-between">
              <span className="font-mono text-[11px] text-ink-muted">10-Dimension Dossiers</span>
              <Link
                to="/reference-device-catalog"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:underline"
              >
                <span>Enter Reference Catalog</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* =====================================================================
          STAGE 5: PEER-REVIEWED PROVENANCE & ZERO-TELEMETRY STRIP
          ===================================================================== */}
      <section className="rounded-2xl border border-hairline bg-surface p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <OpenWearableValidationLogo size={24} />
            <h3 className="text-base font-bold text-ink">
              Engineered for Zero Data Upload &amp; Exact Mathematics
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-ink-secondary max-w-3xl leading-relaxed">
            Authored by Ross D. Wilkinson, PhD (ex-Google Research Scientist). All calculations execute entirely in your local browser with zero telemetry. Built to replace fragile spreadsheets with exact non-central t intervals and random-effects models.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 shrink-0">
          <div className="flex items-center gap-4 text-xs font-mono text-ink-muted pr-2">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-emerald-400" />
              Zero Telemetry
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Cpu size={15} className="text-sky-400" />
              Local Browser Math
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers size={15} className="text-indigo-400" />
              MIT Open Source
            </span>
          </div>

          <Link
            to="/about"
            className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-plane px-4 py-2.5 text-xs font-bold text-ink hover:border-ink/30 transition-all"
          >
            <span>Author credentials &amp; rationale</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </div>
  );
}
