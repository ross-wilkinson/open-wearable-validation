import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart3,
  GitCompare,
  Layers,
  LineChart,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import NextSteps from '../app/study/NextSteps.tsx';

interface ReportStudioTile {
  to: string;
  number: string;
  title: string;
  question: string;
  method: string;
  description: string;
  icon: typeof BarChart3;
  tag: string;
}

const REPORT_STUDIO_TILES: ReportStudioTile[] = [
  {
    to: '/report-studio?vector=vector1',
    number: '01',
    title: 'Accuracy Metrics & KPI Reporting',
    question: 'How do I quantify accuracy without misleading stakeholders?',
    method: 'RMSE, MAE, Bland-Altman LoA & ISO 80601-2-61 Arms',
    description:
      'Rigorous mathematical taxonomy for continuous physiological validation. Details the distinct penalties of quadratic RMSE vs linear MAE, and contrasts true agreement against deceptive Pearson correlation.',
    icon: BarChart3,
    tag: 'KPI Standards',
  },
  {
    to: '/report-studio?vector=vector2',
    number: '02',
    title: 'Error Distributions & Morphology',
    question: 'When and how should I compare error distribution curves?',
    method: 'Subject-Weighted ECDF Envelopes & Crossover Points',
    description:
      'Replaces misleading pooled rows with subject-weighted ECDF envelopes that honor between-subject hierarchical clustering. Pinpoints morphology crossover points where candidate algorithms switch dominance.',
    icon: LineChart,
    tag: 'ECDF Envelopes',
  },
  {
    to: '/report-studio?vector=vector3',
    number: '03',
    title: 'Head-to-Head Algorithm Comparison',
    question: 'Which algorithm performed better in our paired validation trial?',
    method: 'Synchronous Paired Differences & Cliff\'s Delta Dominance',
    description:
      'Overcomes the pairing discard fallacy by evaluating synchronous error differences (Δ = |e1| - |e2|) with clinical tie margins (τ = 3 bpm) to determine participant win counts (e.g. 21 of 25 participants).',
    icon: GitCompare,
    tag: 'Paired Dominance',
  },
  {
    to: '/report-studio?vector=vector4',
    number: '04',
    title: 'Commercial Launch Decision Plane',
    question: 'Is this algorithm ready for commercial release or FDA submission?',
    method: 'Gate 1 (Clinical Standard) vs Gate 2 (Predecessor Parity)',
    description:
      'Maps candidate algorithms into an interactive 2D decision plane with joint confidence ellipses. Verifies whether a new build satisfies absolute clinical safety and matches or beats prior generation hardware.',
    icon: ShieldCheck,
    tag: 'Two-Gate Matrix',
  },
  {
    to: '/report-studio?vector=vector5',
    number: '05',
    title: 'Firmware Drift Canary Tracking',
    question: 'How do I detect silent degradation across software updates?',
    method: 'Multi-Generation Transitive Network Canary Synthesis',
    description:
      'Catches creeping performance regressions across sequential firmware revisions (1 → 2 → 3) by synthesizing transitive comparisons back to the baseline anchor before cumulative drift reaches customers.',
    icon: TrendingDown,
    tag: 'Software Evolution',
  },
];

const AUXILIARY_TOOLS = [
  {
    to: '/chance-kpi',
    title: 'Pass-by-Chance Permutation Auditor',
    method: '10,000x Permutation Null & Preiss–Fisher Separation',
    description:
      'Tests whether passing an accuracy KPI was genuine or an artifact of narrow reference dynamic range (e.g. sitting still at 98% SpO2).',
    icon: Activity,
    tag: 'Null Auditor',
  },
  {
    to: '/effect-size',
    title: 'Exact Effect Size & Equivalence Bounds',
    method: "Non-Central t Distribution Inversion for Cohen's d",
    description:
      'Calculates exact confidence intervals for standardized mean differences without relying on asymptotic normal approximations that drift at small n.',
    icon: Layers,
    tag: 'Exact Bounds',
  },
];

export default function ReportStudioLandingPage() {
  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* Hero Banner */}
      <section className="rounded-3xl border border-hairline bg-surface p-6 sm:p-9 shadow-sm">
        <div className="max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-ink/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-ink">
              REPORT STUDIO
            </span>
            <span className="text-xs text-ink-muted">Validation Analysis &amp; Evidence Synthesis</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Evaluate Product Launch Readiness &amp; Synthesize Clinical Evidence
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-ink-secondary">
            From raw sensor time-series to defensible commercial launch decisions: Report Studio provides
            focused analytical workbenches across five core reporting areas. Select an entry point below to begin:
          </p>
        </div>
      </section>

      {/* The 5 Core Reporting Workbenches - Whole Tile Clickable */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Core Reporting Focus Areas
          </h2>
          <span className="text-xs text-ink-muted">Click any focus area to launch workbench</span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {REPORT_STUDIO_TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.to}
                to={tile.to}
                className="group flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-5 sm:p-6 shadow-2xs transition-all hover:border-ink/25 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-ink">
                      <Icon size={16} />
                      <span className="font-mono text-xs font-bold text-ink-muted">{tile.number}</span>
                    </div>
                    <span className="rounded-md bg-ink/5 px-2 py-0.5 text-[10px] font-semibold text-ink-secondary">
                      {tile.tag}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-ink group-hover:text-ink transition-colors">
                      {tile.title}
                    </h3>
                    <p className="text-xs font-medium text-ink-muted">{tile.question}</p>
                  </div>

                  <p className="text-xs leading-relaxed text-ink-secondary">{tile.description}</p>
                </div>

                <div className="mt-5 border-t border-hairline pt-3 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-ink-muted truncate max-w-[170px]">
                    {tile.method}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-ink group-hover:underline">
                    <span>Open Workbench</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Auxiliary Validation Tools */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Specialized Validation Auditors
          </h2>
          <span className="text-xs text-ink-muted">Statistical diagnostics &amp; permutation tests</span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {AUXILIARY_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.to}
                to={tool.to}
                className="group flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-5 sm:p-6 shadow-2xs transition-all hover:border-ink/25 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-ink">
                      <Icon size={16} />
                    </div>
                    <span className="rounded-md bg-ink/5 px-2 py-0.5 text-[10px] font-semibold text-ink-secondary">
                      {tool.tag}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-ink group-hover:text-ink transition-colors">
                      {tool.title}
                    </h3>
                    <p className="font-mono text-[11px] text-ink-muted">{tool.method}</p>
                  </div>

                  <p className="text-xs leading-relaxed text-ink-secondary">{tool.description}</p>
                </div>

                <div className="mt-5 border-t border-hairline pt-3 flex items-center justify-end text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-ink group-hover:underline">
                    <span>Open Auditor</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <NextSteps
        steps={[
          {
            to: '/protocol-studio',
            title: 'Protocol Studio: Study Design & Sizing',
            description:
              'Design pre-registered validation protocols, calculate required n, and establish demographic quotas.',
          },
          {
            to: '/academy',
            title: 'Validation Academy: 8 Interactive Modules',
            description:
              'Experience hands-on clinical validation engineering across the Meridian PulseBand 2 product journey.',
          },
        ]}
      />
    </div>
  );
}
