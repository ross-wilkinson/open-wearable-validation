import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Layers,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';
import NextSteps from '../app/study/NextSteps.tsx';

interface ToolOverviewCard {
  to: string;
  number: string;
  title: string;
  question: string;
  method: string;
  description: string;
  icon: typeof Scale;
}

const PROTOCOL_TOOLS: ToolOverviewCard[] = [
  {
    to: '/reference-devices',
    number: '00',
    title: 'Reference Standard Selector',
    question: 'Which reference standard should I validate against?',
    method: '10-Dimension Predicate & Error Allocation',
    description:
      'Evaluate Gold, Silver, and Bronze clinical comparators across 12 biometric domains. Model reference noise variance inflation (σ²_REF), FDA 510(k) predicate chains, hardware sync triggers, and per-subject consumable costs.',
    icon: ShieldCheck,
  },
  {
    to: '/agreement',
    number: '01',
    title: 'Sample Size for Agreement',
    question: 'How many participants do I need?',
    method: 'Bland-Altman LoA Inversion & Paired TOST Equivalence',
    description:
      'Set your target accuracy threshold as a fraction of measurement SD and solve for the exact n needed to guarantee limits of agreement stay within clinical bounds. Includes paired non-inferiority sizing for firmware updates.',
    icon: Scale,
  },
  {
    to: '/repeated-measures',
    number: '02',
    title: 'Repeated Measures & Clustering',
    question: 'How many subjects vs replicates do I need?',
    method: 'Closed-Form One-Way Random-Effects ANOVA (Bland & Altman 2007)',
    description:
      'Account for clustering in continuous sensor data. Partition total variation into between-subject biological differences (s_b²) and within-subject measurement noise (s_w²), compute ICC, and find the optimal cost frontier.',
    icon: Layers,
  },
  {
    to: '/precision',
    number: '03',
    title: 'Precision vs Sample Size',
    question: 'How precise will my study be?',
    method: 'Greenwood Percentile Variance & Bland-Altman Margin Sweeps',
    description:
      'Already capped by budget or fixed on an enrollment number? Sweep n from 5 to 200 to inspect the exact margin of error around bias, limits of agreement, and upper error percentiles (P50, P90, P95) before signing your protocol.',
    icon: BarChart3,
  },
  {
    to: '/demographics',
    number: '04',
    title: 'Demographic Quotas & Equity',
    question: 'Who do I need to recruit?',
    method: 'Dual-Scale Monk (MST 1–10) & ISO 80601-2-61 Ceiling Caps',
    description:
      'Turn total sample size into actionable recruitment quotas per sex, age band, or skin tone. Enforces recruitment ceiling caps so walk-in suburban clinics do not fill your study before dark skin quotas are met.',
    icon: Users,
  },
  {
    to: '/timeline',
    number: '05',
    title: 'Study Timeline Monte Carlo',
    question: 'How long will the study take?',
    method: 'Stochastic Phase Simulation (Poisson, Gamma, Lognormal, PERT)',
    description:
      'Simulate ethics review, recruitment ramp, data collection, and analysis phase-by-phase. Generate realistic confidence intervals on your completion date rather than a single optimistic spreadsheet guess.',
    icon: Calendar,
  },
];

export default function ProtocolStudioLandingPage() {
  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* Hero Banner */}
      <section className="rounded-3xl border border-hairline bg-surface p-6 sm:p-9 shadow-sm">
        <div className="max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-ink/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-ink">
              PROTOCOL STUDIO
            </span>
            <span className="text-xs text-ink-muted">Study Design &amp; Statistical Sizing</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Design Rigorous Wearable Validation Protocols
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-ink-secondary">
            Sizing a validation study too small risks inconclusive results or regulatory rejection, while
            sizing it too large wastes clinical capital. Select any design engine below to configure your protocol:
          </p>
        </div>
      </section>

      {/* The 5 Tools Overview Grid - Whole Tile Clickable */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Protocol Design Engines
          </h2>
          <span className="text-xs text-ink-muted">Click any engine to launch workbench</span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROTOCOL_TOOLS.map((tool) => {
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
                      <span className="font-mono text-xs font-bold text-ink-muted">{tool.number}</span>
                    </div>
                    <span className="rounded-md bg-ink/5 px-2 py-0.5 text-[10px] font-semibold text-ink-secondary">
                      {tool.method.split(' ')[0]}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-ink group-hover:text-ink transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs font-medium text-ink-muted">{tool.question}</p>
                  </div>

                  <p className="text-xs leading-relaxed text-ink-secondary">{tool.description}</p>
                </div>

                <div className="mt-5 border-t border-hairline pt-3 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-ink-muted truncate max-w-[170px]">
                    {tool.method}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-ink group-hover:underline">
                    <span>Open Engine</span>
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
    </div>
  );
}
