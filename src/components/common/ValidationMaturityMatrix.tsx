import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Layers,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';

export type MaturityQuadrantId =
  | 'gold-standard'
  | 'academic-bottleneck'
  | 'fragile-shortcut'
  | 'ad-hoc-silos';

export interface MaturityQuadrant {
  id: MaturityQuadrantId;
  name: string;
  tagline: string;
  efficiency: 'Low Efficiency' | 'High Efficiency';
  system: 'Right System' | 'Wrong System';
  coordinates: { x: 'low' | 'high'; y: 'right' | 'wrong' };
  badgeColor: string;
  bgHighlight: string;
  borderColor: string;
  archetypeDescription: string;
  typicalPractices: string[];
  hiddenRisks: string[];
  howWeHelp: string;
}

export const MATURITY_QUADRANTS: Record<MaturityQuadrantId, MaturityQuadrant> = {
  'gold-standard': {
    id: 'gold-standard',
    name: 'The Gold Standard Engine',
    tagline: 'High Efficiency • Right System (The Ideal Destination)',
    efficiency: 'High Efficiency',
    system: 'Right System',
    coordinates: { x: 'high', y: 'right' },
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    bgHighlight: 'bg-emerald-500/5',
    borderColor: 'border-emerald-500/30',
    archetypeDescription:
      'Validation is embedded as an automated, standardized product engine. Studies run on exact agreement statistics, random-effects variance decompositions, and pre-specified clinical tolerance scorecards. Teams release devices rapidly and pass FDA regulatory audits with zero methodological rework.',
    typicalPractices: [
      'Pre-registered protocol sample sizing for Bland-Altman LoA and TOST equivalence.',
      'Automated paired variance decomposition cancelling biological noise for firmware releases.',
      'Recruitment ceiling caps enforcing representation across all Monk Skin Tone strata.',
      'Two-gate decision scorecards gating commercial release and marketing claims.',
    ],
    hiddenRisks: [
      'Maintaining continuous team alignment as new feature teams and external contractors join.',
    ],
    howWeHelp:
      'This platform, together with agreekit and Health Data Distributions, is engineered specifically to establish and sustain this gold-standard operational posture.',
  },
  'academic-bottleneck': {
    id: 'academic-bottleneck',
    name: 'The Academic Bottleneck',
    tagline: 'Low Efficiency • Right System (Rigorous but Trapped)',
    efficiency: 'Low Efficiency',
    system: 'Right System',
    coordinates: { x: 'low', y: 'right' },
    badgeColor: 'bg-series-1/10 text-series-1 border-series-1/20',
    bgHighlight: 'bg-series-1/5',
    borderColor: 'border-series-1/30',
    archetypeDescription:
      'The research team has world-class statistical expertise (linear mixed models, variance partitioning), but operations are bespoke and heavily manual. Because each analysis requires weeks of individual scripting, only a few flagship features receive rigorous validation while others lag behind.',
    typicalPractices: [
      'Bespoke, custom R and Python notebooks hand-written by a single senior scientist.',
      'Validation turnaround takes 4–6 weeks per hardware revision or firmware build.',
      'Engineering teams view validation as a release roadblock and seek bypasses.',
      'Uneven quality across features: one feature is gold-standard while adjacent sensors languish.',
    ],
    hiddenRisks: [
      'Scientist burnout and single-point-of-failure bottlenecks.',
      'Product managers skipping formal validation to meet aggressive commercial launch deadlines.',
    ],
    howWeHelp:
      'Standardizes exact methods into high-efficiency browser calculators and modular agreekit pipelines, collapsing analysis turnaround from weeks to a single day.',
  },
  'fragile-shortcut': {
    id: 'fragile-shortcut',
    name: 'The Fragile Shortcut',
    tagline: 'High Efficiency • Wrong System (Fast but Deceptive)',
    efficiency: 'High Efficiency',
    system: 'Wrong System',
    coordinates: { x: 'high', y: 'wrong' },
    badgeColor: 'bg-series-2/10 text-series-2 border-series-2/20',
    bgHighlight: 'bg-series-2/5',
    borderColor: 'border-series-2/30',
    archetypeDescription:
      'The team has streamlined its process to be fast and low friction, but relies on flawed or over-simplified statistical machinery: two-sample t-tests, standard textbook power equations (G*Power difference-testing), pooled RMSE, or unverified AI prompts.',
    typicalPractices: [
      'Running student t-tests or ANOVA to check if device and reference "are significantly different".',
      'Calculating sample sizes with G*Power difference tests rather than agreement intervals.',
      'Reporting a single pooled RMSE number that conceals 8 bpm dropouts in the tail.',
      'Walk-in clinical recruitment without demographic ceiling caps, starving dark skin representation.',
    ],
    hiddenRisks: [
      'Devastating regulatory rejections during FDA 510(k) or CE-mark audits.',
      'High post-market return rates and brand damage when real-world performance falls far short of claims.',
    ],
    howWeHelp:
      'Injects exact agreement statistics, random-effects ANOVA, and demographic quota caps into existing workflows without sacrificing execution velocity.',
  },
  'ad-hoc-silos': {
    id: 'ad-hoc-silos',
    name: 'The Ad-Hoc Silos',
    tagline: 'Low Efficiency • Wrong System (Chaotic & Expensive)',
    efficiency: 'Low Efficiency',
    system: 'Wrong System',
    coordinates: { x: 'low', y: 'wrong' },
    badgeColor: 'bg-critical/10 text-critical border-critical/20',
    bgHighlight: 'bg-critical/5',
    borderColor: 'border-critical/30',
    archetypeDescription:
      'Disconnected teams reinventing the validation wheel for every product release. Methodologies vary wildly between squads; data lives in siloed, error-prone spreadsheets; operational overhead is enormous; and results lack scientific defensibility.',
    typicalPractices: [
      'Spreadsheets with unverified formulas, broken circular references, and copy-paste errors.',
      'No common definition of acceptance criteria or clinical tolerance thresholds across teams.',
      'High operational burn ($250k+ per trial) with repeated inconclusive or underpowered trials.',
      'N=5 small-sample screens used to crown "winning" algorithms based purely on noise realizations.',
    ],
    hiddenRisks: [
      'Millions in wasted clinical ops expenditure with little reusable institutional knowledge.',
      'Inability to compare generation-over-generation performance across device iterations.',
    ],
    howWeHelp:
      'Provides a unified foundational curriculum (Validation Academy), standardized decision frameworks (Report Studio), and turnkey protocol sizing tools.',
  },
};

interface ValidationMaturityMatrixProps {
  className?: string;
  initialQuadrant?: MaturityQuadrantId;
}

export function ValidationMaturityMatrix({
  className = '',
  initialQuadrant = 'gold-standard',
}: ValidationMaturityMatrixProps) {
  const [activeId, setActiveId] = useState<MaturityQuadrantId>(initialQuadrant);
  const active = MATURITY_QUADRANTS[activeId];

  return (
    <div
      className={`rounded-2xl border border-hairline bg-surface p-5 sm:p-7 shadow-xs ${className}`}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-series-1/10 px-2.5 py-0.5 text-xs font-semibold text-series-1">
            Organizational Diagnostic
          </span>
          <span className="text-xs text-ink-muted">2-Axis Maturity Matrix</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
          Where Does Your Validation Team Sit?
        </h3>
        <p className="text-sm leading-relaxed text-ink-secondary max-w-3xl">
          Across the medical device and consumer health-tech industry, validation programs fall along two
          fundamental dimensions: <strong>Operational Efficiency</strong> (turnaround speed and execution overhead) and{' '}
          <strong>System Quality</strong> (methodological rigor and statistical correctness). Our suite is designed
          to guide teams from any quadrant into the <strong>Gold Standard Engine</strong>.
        </p>
      </div>

      {/* 2-Axis Spectrum Header */}
      <div className="mt-6 flex flex-col space-y-2">
        <div className="hidden sm:grid sm:grid-cols-2 gap-3 text-center text-xs font-bold uppercase tracking-wider text-ink-muted">
          <div className="rounded-lg bg-plane/80 py-1.5 border border-hairline/60">
            <span>← Low Operational Efficiency</span>
            <span className="block text-[10px] text-ink-muted font-normal lowercase">(bespoke scripts, manual spreadsheets, slow turnaround)</span>
          </div>
          <div className="rounded-lg bg-emerald-500/10 py-1.5 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
            <span>High Operational Efficiency →</span>
            <span className="block text-[10px] font-normal lowercase">(standardized engines, automated pipelines, rapid iteration)</span>
          </div>
        </div>

        {/* Row 1 Y-Axis Label: Right System */}
        <div className="flex items-center gap-2 pt-2 pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            ↑ Right System (Rigorous Methods &amp; Closed-Form Math)
          </span>
          <div className="flex-1 border-t border-hairline/80" />
        </div>

        {/* Interactive 2x2 Matrix Grid - Row 1 */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Quadrant 2: Academic Bottleneck (Top-Left) */}
          <button
            type="button"
            onClick={() => setActiveId('academic-bottleneck')}
            className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
              activeId === 'academic-bottleneck'
                ? 'border-series-1 bg-series-1/10 shadow-sm ring-1 ring-series-1'
                : 'border-hairline bg-plane hover:border-series-1/40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Low Efficiency • Right System
              </span>
              <span className="rounded-full bg-series-1/15 px-2 py-0.5 text-[10px] font-bold text-series-1">
                Quadrant II
              </span>
            </div>
            <h4 className="mt-1 text-base font-bold text-ink">The Academic Bottleneck</h4>
            <p className="mt-1 text-xs text-ink-secondary line-clamp-2">
              Rigorous statistical models trapped in bespoke scripts and scientist choke-points. Analysis takes weeks.
            </p>
          </button>

          {/* Quadrant 1: Gold Standard Engine (Top-Right) */}
          <button
            type="button"
            onClick={() => setActiveId('gold-standard')}
            className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
              activeId === 'gold-standard'
                ? 'border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500'
                : 'border-hairline bg-plane hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                High Efficiency • Right System
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Quadrant I • Ideal
              </span>
            </div>
            <h4 className="mt-1 text-base font-bold text-ink flex items-center gap-1.5">
              <span>The Gold Standard Engine</span>
              <Sparkles size={15} className="text-emerald-500" />
            </h4>
            <p className="mt-1 text-xs text-ink-secondary line-clamp-2">
              Automated, reproducible, exact agreement statistics and pre-specified clinical launch scorecards.
            </p>
          </button>
        </div>

        {/* Row 2 Y-Axis Label: Wrong System */}
        <div className="flex items-center gap-2 pt-3 pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            ↓ Wrong System (Spreadsheet Errors, Unverified AI &amp; Textbook Null Tests)
          </span>
          <div className="flex-1 border-t border-hairline/80" />
        </div>

        {/* Interactive 2x2 Matrix Grid - Row 2 */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Quadrant 3: Ad-Hoc Silos (Bottom-Left) */}
          <button
            type="button"
            onClick={() => setActiveId('ad-hoc-silos')}
            className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
              activeId === 'ad-hoc-silos'
                ? 'border-critical bg-critical/10 shadow-sm ring-1 ring-critical'
                : 'border-hairline bg-plane hover:border-critical/40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Low Efficiency • Wrong System
              </span>
              <span className="rounded-full bg-critical/15 px-2 py-0.5 text-[10px] font-bold text-critical">
                Quadrant III
              </span>
            </div>
            <h4 className="mt-1 text-base font-bold text-ink">The Ad-Hoc Silos</h4>
            <p className="mt-1 text-xs text-ink-secondary line-clamp-2">
              Fragmented teams, manual spreadsheets, inconsistent metrics, and zero cross-device benchmarking.
            </p>
          </button>

          {/* Quadrant 4: Fragile Shortcut (Bottom-Right) */}
          <button
            type="button"
            onClick={() => setActiveId('fragile-shortcut')}
            className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
              activeId === 'fragile-shortcut'
                ? 'border-series-2 bg-series-2/10 shadow-sm ring-1 ring-series-2'
                : 'border-hairline bg-plane hover:border-series-2/40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                High Efficiency • Wrong System
              </span>
              <span className="rounded-full bg-series-2/15 px-2 py-0.5 text-[10px] font-bold text-series-2">
                Quadrant IV
              </span>
            </div>
            <h4 className="mt-1 text-base font-bold text-ink">The Fragile Shortcut</h4>
            <p className="mt-1 text-xs text-ink-secondary line-clamp-2">
              Fast spreadsheets &amp; naive t-test formulas that fail FDA audits or mask heavy-tailed user failures.
            </p>
          </button>
        </div>
      </div>

      {/* Selected Quadrant Deep Dive */}
      <div
        className={`mt-6 rounded-xl border p-5 sm:p-6 transition-all ${active.borderColor} ${active.bgHighlight}`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${active.badgeColor}`}
              >
                {active.name}
              </span>
              <span className="text-xs text-ink-muted font-medium">{active.tagline}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink">{active.archetypeDescription}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {/* Practices */}
          <div className="space-y-2">
            <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <Layers size={14} className="text-series-1" />
              Typical Hallmarks &amp; Workflow
            </h5>
            <ul className="space-y-1.5 text-xs text-ink-secondary">
              {active.typicalPractices.map((practice, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-ink-muted mt-0.5">•</span>
                  <span>{practice}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks / Failure Modes */}
          <div className="space-y-2">
            <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <AlertTriangle size={14} className="text-amber-500" />
              Operational &amp; Scientific Hazards
            </h5>
            <ul className="space-y-1.5 text-xs text-ink-secondary">
              {active.hiddenRisks.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <ShieldAlert size={13} className="shrink-0 text-critical mt-0.5" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* The Solution Pathway */}
        <div className="mt-5 rounded-lg border border-hairline bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 max-w-xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <Zap size={14} className="text-series-1" />
              <span>How Validation Study Designer Accelerates the Transition:</span>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed">{active.howWeHelp}</p>
          </div>

          {activeId !== 'gold-standard' && (
            <button
              type="button"
              onClick={() => setActiveId('gold-standard')}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-plane transition-opacity hover:opacity-90 self-start sm:self-auto"
            >
              <span>View Target Gold Standard</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
