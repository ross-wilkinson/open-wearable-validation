import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Cpu,
  Database,
  Filter,
  Layers,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sliders,
  Users,
  Zap,
} from 'lucide-react';
import { useStudy } from '../app/study/StudyContext.tsx';
import NextSteps from '../app/study/NextSteps.tsx';

interface ToolOverviewCard {
  to: string;
  number: string;
  category: 'comparators' | 'sample-size' | 'variance' | 'equity' | 'timeline';
  title: string;
  question: string;
  method: string;
  description: string;
  badge: string;
  icon: typeof Scale;
}

const PROTOCOL_TOOLS: ToolOverviewCard[] = [
  {
    to: '/reference-devices',
    number: '00',
    category: 'comparators',
    title: 'Reference Standard Selector',
    question: 'Which reference standard should I validate against?',
    method: '10-Dimension Predicate & Error Allocation',
    badge: 'Hardware Predicate',
    description:
      'Evaluate Gold, Silver, and Bronze clinical comparators across 12 biometric domains. Model reference noise variance inflation (σ²_REF), FDA 510(k) predicate chains, hardware sync triggers, and per-subject consumable costs.',
    icon: ShieldCheck,
  },
  {
    to: '/agreement',
    number: '01',
    category: 'sample-size',
    title: 'Sample Size for Agreement',
    question: 'How many participants do I need?',
    method: 'Bland-Altman LoA Inversion & Paired TOST Equivalence',
    badge: 'LoA Inversion',
    description:
      'Set your target accuracy threshold as a fraction of measurement SD and solve for the exact n needed to guarantee limits of agreement stay within clinical bounds. Includes paired non-inferiority sizing for firmware updates.',
    icon: Scale,
  },
  {
    to: '/repeated-measures',
    number: '02',
    category: 'variance',
    title: 'Repeated Measures & Clustering',
    question: 'How many subjects vs replicates do I need?',
    method: 'Closed-Form One-Way Random-Effects ANOVA (Bland & Altman 2007)',
    badge: 'Random Effects',
    description:
      'Account for clustering in continuous sensor data. Partition total variation into between-subject biological differences (s_b²) and within-subject measurement noise (s_w²), compute ICC, and find the optimal cost frontier.',
    icon: Layers,
  },
  {
    to: '/precision',
    number: '03',
    category: 'sample-size',
    title: 'Precision vs Sample Size',
    question: 'How precise will my study be?',
    method: 'Greenwood Percentile Variance & Bland-Altman Margin Sweeps',
    badge: 'Variance Sweep',
    description:
      'Already capped by budget or fixed on an enrollment number? Sweep n from 5 to 200 to inspect the exact margin of error around bias, limits of agreement, and upper error percentiles (P50, P90, P95) before signing your protocol.',
    icon: BarChart3,
  },
  {
    to: '/demographics',
    number: '04',
    category: 'equity',
    title: 'Demographic Quotas & Equity',
    question: 'Who do I need to recruit?',
    method: 'Dual-Scale Monk (MST 1–10) & ISO 80601-2-61 Ceiling Caps',
    badge: 'Monk Scale (MST)',
    description:
      'Turn total sample size into actionable recruitment quotas per sex, age band, or skin tone. Enforces recruitment ceiling caps so walk-in suburban clinics do not fill your study before dark skin quotas are met.',
    icon: Users,
  },
  {
    to: '/timeline',
    number: '05',
    category: 'timeline',
    title: 'Study Timeline Monte Carlo',
    question: 'How long will the study take?',
    method: 'Stochastic Phase Simulation (Poisson, Gamma, Lognormal, PERT)',
    badge: 'Monte Carlo PERT',
    description:
      'Simulate ethics review, recruitment ramp, data collection, and analysis phase-by-phase. Generate realistic confidence intervals on your completion date rather than a single optimistic spreadsheet guess.',
    icon: Calendar,
  },
];

const PRESETS = [
  { name: 'Optical Heart Rate (PPG)', n: 42, sd: 2.5, unit: 'bpm', measurand: 'HR' },
  { name: 'Pulse Oximetry (SpO₂)', n: 30, sd: 1.8, unit: '%', measurand: 'SpO₂' },
  { name: 'Continuous Glucose (CGM)', n: 55, sd: 12.0, unit: 'mg/dL', measurand: 'Glucose' },
  { name: 'Respiratory Rate (RR)', n: 36, sd: 1.2, unit: 'brpm', measurand: 'RR' },
];

export default function ProtocolStudioLandingPage() {
  const { study, updateStudy, clearStudy, planned } = useStudy();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPreset, setSelectedPreset] = useState<string>('Optical Heart Rate (PPG)');

  const filteredTools =
    selectedCategory === 'all'
      ? PROTOCOL_TOOLS
      : PROTOCOL_TOOLS.filter((t) => t.category === selectedCategory);

  function applyPreset(presetName: string) {
    const p = PRESETS.find((item) => item.name === presetName);
    if (!p) return;
    setSelectedPreset(presetName);
    updateStudy({
      n: p.n,
      measurementSd: p.sd,
      unit: p.unit,
      confidence: 0.95,
      nSource: `Preset: ${p.name}`,
    });
  }

  const currentN = study.n ?? 42;
  const currentSd = study.measurementSd ?? 2.5;
  const currentUnit = study.unit || 'bpm';

  return (
    <div className="space-y-8 py-2 sm:py-4">
      {/* =====================================================================
          1. CONSOLE HEADER & BREADCRUMB TELEMETRY
          ===================================================================== */}
      <header className="rounded-2xl border border-hairline dark:border-[#27272a] bg-surface dark:bg-[#090d16] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-sky-500 dark:text-sky-400">
                <Sliders size={12} className="text-sky-400" />
                PROTOCOL STUDIO
              </span>
              <span className="h-3 w-[1px] bg-zinc-300 dark:bg-zinc-700" />
              <span className="font-mono text-xs text-ink-muted">
                Study Design &amp; Statistical Sizing Console
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                ISO 80601-2-61
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] text-ink leading-tight">
              Design Rigorous Wearable Validation Protocols
            </h1>

            <p className="text-sm sm:text-base leading-relaxed text-ink-secondary">
              A Vercel-style engineering workspace for biometric protocol design. Size clinical
              cohorts for Limits of Agreement, isolate clustered within-subject variance, enforce
              demographic equity ceilings, and simulate study milestones.
            </p>
          </div>

          {/* Quick Telemetry Callout Box */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-hairline dark:border-[#27272a] pt-4 lg:pt-0 lg:pl-6">
            <div className="rounded-xl border border-hairline dark:border-[#27272a] bg-plane dark:bg-[#121318] p-3 min-w-[160px]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Active Study Target
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-xl font-extrabold text-sky-500 dark:text-sky-400">
                  N = {currentN}
                </span>
                <span className="text-xs text-ink-secondary font-mono">
                  &plusmn;{(currentSd * 0.48).toFixed(1)} {currentUnit}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-hairline dark:border-[#27272a] bg-plane dark:bg-[#121318] p-3 min-w-[160px]">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Power &amp; Confidence
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-xl font-extrabold text-ink">95% CI</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                  80% Pwr
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. TWO-COLUMN ARCHITECTURAL WORKSPACE (SIDEBAR + CARD GRID)
          ===================================================================== */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* -------------------------------------------------------------------
            LEFT COLUMN: FIXED / STICKY CONTROL & PARAMETERS SIDEBAR
            ------------------------------------------------------------------- */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          {/* Panel 1: Global Study Parameters */}
          <div className="rounded-2xl border border-hairline dark:border-[#27272a] bg-surface dark:bg-[#090d16] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-hairline dark:border-[#27272a] pb-3">
              <div className="flex items-center gap-2">
                <Sliders size={14} className="text-sky-400" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                  Protocol Parameters
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                  planned
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400'
                    : 'bg-zinc-500/10 border border-zinc-500/20 text-ink-muted'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    planned ? 'bg-emerald-400' : 'bg-zinc-400'
                  }`}
                />
                {planned ? 'PLANNED' : 'CONFIGURING'}
              </span>
            </div>

            {/* Quick Sizing Presets Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="protocol-preset" className="font-mono text-[11px] font-medium text-ink-muted flex items-center justify-between">
                <span>Clinical Domain Preset</span>
                <span className="text-sky-500 dark:text-sky-400 text-[10px]">Auto-seed</span>
              </label>
              <select
                id="protocol-preset"
                value={selectedPreset}
                onChange={(e) => applyPreset(e.target.value)}
                className="w-full rounded-lg border border-hairline dark:border-[#27272a] bg-plane dark:bg-[#121318] px-3 py-2 font-mono text-xs text-ink focus:border-sky-400 focus:outline-none"
              >
                {PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} (N={p.n})
                  </option>
                ))}
              </select>
            </div>

            {/* Parameter Stepper Controls */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-secondary">Sample Size (n):</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateStudy({ n: Math.max(10, currentN - 5) })}
                    className="h-6 w-6 rounded border border-hairline dark:border-[#27272a] bg-plane dark:bg-[#121318] font-mono text-xs font-bold text-ink hover:border-zinc-500 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-sky-500 dark:text-sky-400 w-8 text-center">
                    {currentN}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateStudy({ n: currentN + 5 })}
                    className="h-6 w-6 rounded border border-hairline dark:border-[#27272a] bg-plane dark:bg-[#121318] font-mono text-xs font-bold text-ink hover:border-zinc-500 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-secondary">Measurement SD:</span>
                <span className="font-mono text-ink">
                  {currentSd} {currentUnit}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-secondary">95% LoA CI Width:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  &plusmn;{(currentSd * 0.48).toFixed(2)} {currentUnit}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-secondary">Target Acceptance:</span>
                <span className="font-mono text-zinc-400">&plusmn;5.00 {currentUnit}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-hairline dark:border-[#27272a] pt-3 text-xs">
              <span className="text-[11px] text-ink-muted">
                {study.nSource || 'Default parameters'}
              </span>
              <button
                type="button"
                onClick={clearStudy}
                className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted hover:text-ink cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Panel 2: Engine Category Filters */}
          <div className="rounded-2xl border border-hairline dark:border-[#27272a] bg-surface dark:bg-[#090d16] p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-2 px-2 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
              <Filter size={13} />
              <span>Engine Categories</span>
            </div>

            <nav className="space-y-1" aria-label="Engine Category Filters">
              {[
                { id: 'all', label: 'All Engines (6)', count: 6 },
                { id: 'comparators', label: '00 Reference Comparators', count: 1 },
                { id: 'sample-size', label: '01 Sample Size & Sweeps', count: 2 },
                { id: 'variance', label: '02 Clustering & ANOVA', count: 1 },
                { id: 'equity', label: '03 Demographic Equity', count: 1 },
                { id: 'timeline', label: '04 Timeline Monte Carlo', count: 1 },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-mono transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-sky-500/15 border border-sky-400/40 text-sky-600 dark:text-sky-300 font-bold'
                      : 'text-ink-secondary hover:bg-plane dark:hover:bg-[#121318] hover:text-ink border border-transparent'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] ${
                      selectedCategory === cat.id
                        ? 'bg-sky-400 text-[#090d16] font-bold'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-ink-muted'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Panel 3: Regulatory & Checklist Rail */}
          <div className="rounded-2xl border border-hairline dark:border-[#27272a] bg-surface dark:bg-[#090d16] p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Protocol Checklist</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-ink-secondary">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Pre-specified Limits of Agreement acceptance gates (&plusmn;5 bpm)</span>
              </div>
              <div className="flex items-start gap-2 text-ink-secondary">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Repeated-measures ICC biological variance accounted</span>
              </div>
              <div className="flex items-start gap-2 text-ink-secondary">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Monk Skin Tone (MST 1–10) minimum 25% dark skin quota locked</span>
              </div>
              <div className="flex items-start gap-2 text-ink-secondary">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Hardware TTL sync clock drift &lt; 20 ppm calibrated</span>
              </div>
            </div>

            <div className="border-t border-hairline dark:border-[#27272a] pt-3">
              <Link
                to="/report-studio"
                className="inline-flex items-center justify-between w-full rounded-xl bg-ink text-surface dark:bg-white dark:text-[#090d16] px-3.5 py-2 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <span>Preview Launch Gates &rarr;</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </aside>

        {/* -------------------------------------------------------------------
            MAIN CONTENT CANVAS: HIGH-DENSITY VERCEL-STYLE OBSIDIAN CARDS
            ------------------------------------------------------------------- */}
        <main className="lg:col-span-8 space-y-6">
          {/* Subheader Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline dark:border-[#27272a] pb-3 font-mono text-xs text-ink-muted">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink">ACTIVE ENGINES</span>
              <span>//</span>
              <span className="text-sky-500 dark:text-sky-400">
                {filteredTools.length} modules visible
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              <span>LIVE INTERACTIVE SENSING</span>
            </div>
          </div>

          {/* Grid of Obsidian Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-hairline dark:border-[#27272a] bg-surface dark:bg-[#090d16] p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:border-sky-500/50 hover:shadow-[0_12px_32px_-8px_rgba(56,189,248,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  {/* Subtle Top-Corner Radial Hover Glow */}
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-sky-500/10 blur-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                    aria-hidden="true"
                  />

                  <div className="space-y-4">
                    {/* Top Row: Module # and Category Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 dark:text-sky-400">
                          <Icon size={14} />
                        </div>
                        <span className="font-mono text-xs font-bold text-sky-500 dark:text-sky-400">
                          STAGE {tool.number}
                        </span>
                      </div>
                      <span className="rounded-md border border-hairline dark:border-zinc-800 bg-plane dark:bg-[#121318] px-2 py-0.5 font-mono text-[10px] text-ink-secondary">
                        {tool.badge}
                      </span>
                    </div>

                    {/* Title & Core Question */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-sky-500 dark:group-hover:text-sky-400">
                        {tool.title}
                      </h3>
                      <p className="text-xs font-medium text-sky-600/80 dark:text-sky-400/80 font-mono">
                        {tool.question}
                      </p>
                    </div>

                    {/* Scientific Summary Description */}
                    <p className="text-xs leading-relaxed text-ink-secondary line-clamp-3">
                      {tool.description}
                    </p>

                    {/* Bespoke Interactive Preview / Edge-to-Edge Graphics */}
                    <div className="rounded-xl border border-hairline dark:border-zinc-800/80 bg-plane dark:bg-[#0d1017] p-3 overflow-hidden select-none">
                      {tool.number === '00' && (
                        /* Tool 00: Reference Predicate Selector Visual */
                        <div className="space-y-2 font-mono text-[10px]">
                          <div className="flex items-center justify-between text-ink-muted">
                            <span className="flex items-center gap-1.5">
                              <Cpu size={11} className="text-amber-400" />
                              <span>HARDWARE PREDICATES</span>
                            </span>
                            <span className="text-emerald-500 dark:text-emerald-400">TTL SYNC OK</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 text-center">
                            <div className="rounded border border-amber-500/40 bg-amber-500/10 p-1.5 text-amber-500 dark:text-amber-300">
                              <div className="font-bold">GOLD</div>
                              <div className="text-[9px] text-ink-muted">12-Lead ECG</div>
                            </div>
                            <div className="rounded border border-zinc-400/30 bg-zinc-400/10 p-1.5 text-ink-secondary">
                              <div className="font-bold">SILVER</div>
                              <div className="text-[9px] text-ink-muted">Patch (+25% N)</div>
                            </div>
                            <div className="rounded border border-amber-700/30 bg-amber-700/10 p-1.5 text-amber-700 dark:text-amber-500">
                              <div className="font-bold">BRONZE</div>
                              <div className="text-[9px] text-ink-muted">Strap (+120% N)</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {tool.number === '01' && (
                        /* Tool 01: Bland-Altman Precision Decay Curve Visual */
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between font-mono text-[10px] text-ink-muted">
                            <span>LoA CI WIDTH DECAY</span>
                            <span className="text-sky-400 font-bold">N={currentN} &rarr; &plusmn;1.2 {currentUnit}</span>
                          </div>
                          <svg
                            viewBox="0 0 280 48"
                            className="w-full h-11 block overflow-visible"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M 0 6 C 50 26, 110 36, 280 42"
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="2.5"
                            />
                            <line
                              x1="110"
                              y1="2"
                              x2="110"
                              y2="46"
                              stroke="#0ea5e9"
                              strokeWidth="1.2"
                              strokeDasharray="2 2"
                            />
                            <circle
                              cx="110"
                              cy="36"
                              r="4"
                              fill="#38bdf8"
                              stroke="#090d16"
                              strokeWidth="1.5"
                            />
                            <line
                              x1="0"
                              y1="36"
                              x2="280"
                              y2="36"
                              stroke="#10b981"
                              strokeWidth="1"
                              strokeDasharray="3 3"
                              strokeOpacity="0.6"
                            />
                          </svg>
                        </div>
                      )}

                      {tool.number === '02' && (
                        /* Tool 02: ANOVA Variance Decomposition Bar Visual */
                        <div className="space-y-1.5 font-mono text-[10px]">
                          <div className="flex items-center justify-between text-ink-muted">
                            <span>VARIANCE PARTITION (ICC = 0.82)</span>
                            <span className="text-indigo-400">ANOVA RE</span>
                          </div>
                          <div className="flex h-3 w-full rounded overflow-hidden">
                            <div
                              style={{ width: '82%' }}
                              className="bg-indigo-500/80 flex items-center justify-center text-[8px] text-white font-bold"
                            >
                              s_b² (82%)
                            </div>
                            <div
                              style={{ width: '18%' }}
                              className="bg-sky-400 flex items-center justify-center text-[8px] text-slate-900 font-bold"
                            >
                              s_w²
                            </div>
                          </div>
                          <div className="flex justify-between text-[9px] text-ink-muted">
                            <span>Between-Subject (Biological)</span>
                            <span>Within-Subject (Noise)</span>
                          </div>
                        </div>
                      )}

                      {tool.number === '03' && (
                        /* Tool 03: Greenwood Variance Sweeps Visual */
                        <div className="space-y-1.5 font-mono text-[10px]">
                          <div className="flex items-center justify-between text-ink-muted">
                            <span>PERCENTILE MARGIN SWEEPS</span>
                            <span className="text-sky-400 font-bold">P50 / P90 / P95</span>
                          </div>
                          <svg
                            viewBox="0 0 280 48"
                            className="w-full h-11 block overflow-visible"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M 0 44 C 60 40, 120 32, 280 28"
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="1.5"
                              strokeOpacity="0.4"
                            />
                            <path
                              d="M 0 30 C 60 25, 120 18, 280 14"
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="2"
                              strokeOpacity="0.75"
                            />
                            <path
                              d="M 0 16 C 60 12, 120 6, 280 4"
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="2.5"
                            />
                          </svg>
                        </div>
                      )}

                      {tool.number === '04' && (
                        /* Tool 04: Monk Skin Tone (MST 1-10) Equity Scale Visual */
                        <div className="space-y-1.5 font-mono text-[10px]">
                          <div className="flex items-center justify-between text-ink-muted">
                            <span>MONK SKIN TONE QUOTA (MST 1–10)</span>
                            <span className="text-amber-500 dark:text-amber-400 font-bold">&ge; 25% MST 7–10</span>
                          </div>
                          <div className="grid grid-cols-10 gap-1 h-3">
                            {[
                              '#f6ede4',
                              '#f3e7db',
                              '#f7ead0',
                              '#eadaba',
                              '#d7bd96',
                              '#9f7959',
                              '#82563c',
                              '#604134',
                              '#3a312a',
                              '#292420',
                            ].map((c, i) => (
                              <div
                                key={i}
                                style={{ backgroundColor: c }}
                                className={`rounded-xs ${i >= 6 ? 'ring-1 ring-amber-400' : ''}`}
                                title={`Monk Tone ${i + 1}`}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between text-[9px] text-ink-muted">
                            <span>MST 1 (Light)</span>
                            <span className="text-amber-500 dark:text-amber-300 font-bold">Ceiling Cap Enforced</span>
                            <span>MST 10 (Deep)</span>
                          </div>
                        </div>
                      )}

                      {tool.number === '05' && (
                        /* Tool 05: Monte Carlo Gantt Milestone Simulation Visual */
                        <div className="space-y-1.5 font-mono text-[10px]">
                          <div className="flex items-center justify-between text-ink-muted">
                            <span>STOCHASTIC TIMELINE CONFIDENCE</span>
                            <span className="text-emerald-500 dark:text-emerald-400">P50: 14.2w &bull; P90: 18.6w</span>
                          </div>
                          <div className="space-y-1">
                            <div className="h-1.5 w-full bg-zinc-700/30 rounded overflow-hidden flex">
                              <div style={{ width: '25%' }} className="bg-sky-500" />
                              <div style={{ width: '45%' }} className="bg-emerald-500" />
                              <div style={{ width: '30%' }} className="bg-indigo-500" />
                            </div>
                            <div className="flex justify-between text-[9px] text-ink-muted">
                              <span>Ethics Review</span>
                              <span>Enrollment Ramp</span>
                              <span>Data Extraction</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Method & Action Link */}
                  <div className="mt-5 border-t border-hairline dark:border-zinc-800/80 pt-3 flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-ink-muted truncate max-w-[170px]">
                      {tool.method}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all">
                      <span>Open Engine</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Hardware & Sync Trigger Protocol Pipeline Banner */}
          <section className="rounded-2xl border border-hairline dark:border-[#27272a] bg-surface dark:bg-[#090d16] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                    <span>Hardware Sync &amp; Multi-Stream Trigger Architecture</span>
                    <span className="font-mono text-[10px] font-semibold text-sky-500 dark:text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                      TTL / BNC &lt; 1 ms
                    </span>
                  </h4>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Multi-device clocks drift up to 30 ppm (&plusmn;108 ms/hour). Hardware TTL triggers align optical PPG with reference ECG R-peaks to prevent false limits of agreement inflation.
                  </p>
                </div>
              </div>

              <Link
                to="/protocol/reference-devices"
                className="inline-flex items-center gap-1.5 shrink-0 rounded-xl border border-hairline dark:border-[#27272a] bg-plane dark:bg-[#121318] px-4 py-2 font-mono text-xs font-semibold text-ink hover:border-zinc-500 transition-colors"
              >
                <Database size={13} className="text-sky-400" />
                <span>Reference Devices</span>
              </Link>
            </div>
          </section>

          {/* Workflow Bridge */}
          <NextSteps
            steps={[
              {
                to: '/report-studio',
                title: 'Report Studio: Launch Gates & Scorecards',
                description:
                  'Evaluate empirical sensor performance against clinical benchmarks using 2-gate decision scorecards.',
              },
              {
                to: '/academy',
                title: 'Validation Academy: 8 Interactive Modules',
                description:
                  'Experience hands-on clinical validation engineering across the Meridian PulseBand 2 product journey.',
              },
            ]}
          />
        </main>
      </div>
    </div>
  );
}
