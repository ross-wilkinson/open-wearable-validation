import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  Cpu,
  ExternalLink,
  Lock,
  Scale,
  Sparkles,
  Database,
} from 'lucide-react';
import NextSteps from '../app/study/NextSteps.tsx';
import { AUTHOR } from '../content/author.ts';
import { ValidationMaturityMatrix } from '../components/common/ValidationMaturityMatrix.tsx';

export default function AboutPage() {
  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-12">
      {/* Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-medium text-series-1">
          <Sparkles size={13} aria-hidden />
          Scientific Provenance &amp; Design Rationale
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl text-ink">
          Why Validation Study Designer Was Built
        </h1>
        <p className="text-lg leading-relaxed text-ink-secondary">
          Commercial health-tech and wearable programs routinely burn millions of dollars and months of
          clinical testing on validation studies that fail regulatory audit or collapse during production.
          This platform was designed by an industry validation scientist to eliminate the statistical traps
          of generic AI, spreadsheets, and textbook hypothesis tests.
        </p>
      </header>

      {/* Quick Jump Signpost Navigation */}
      <nav
        aria-label="About page sections"
        className="sticky top-14 z-10 -mx-2 sm:mx-0 flex flex-wrap items-center gap-1.5 sm:gap-2 rounded-2xl border border-hairline bg-surface/95 backdrop-blur px-3.5 py-2.5 text-xs shadow-xs"
      >
        <span className="px-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">Jump to:</span>
        <a
          href="#statistical-traps"
          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-series-4 hover:bg-series-4/10 transition-colors"
        >
          1. 5 Statistical Traps
        </a>
        <a
          href="#author-credentials"
          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-series-1 hover:bg-series-1/10 transition-colors"
        >
          2. Creator &amp; Track Record
        </a>
        <a
          href="#maturity-matrix"
          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
        >
          3. Maturity Matrix
        </a>
        <a
          href="#engineering"
          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-series-2 hover:bg-series-2/10 transition-colors"
        >
          4. Architecture &amp; Privacy
        </a>
        <a
          href="#ecosystem"
          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-series-3 hover:bg-series-3/10 transition-colors"
        >
          5. Research Trifecta
        </a>
        <a
          href="#caveats"
          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
        >
          6. Regulatory Guidance
        </a>
      </nav>

      {/* Section 1: The Multi-Million Dollar Statistical Traps */}
      <section id="statistical-traps" className="space-y-6 scroll-mt-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-series-4/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-series-4 border border-series-4/20">
              Section 1 • Statistical Failure Modes
            </span>
            <span className="text-xs text-ink-muted">5 Core Diagnostic Traps</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            The Multi-Million Dollar Statistical Traps
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary max-w-3xl">
            In human-subject clinical validation, mathematical misunderstandings do not just produce bad charts
            — they trigger failed FDA 510(k) clearances, rejected commercial claims, and costly study re-runs.
            We have consolidated these failure modes into five foundational statistical traps:
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Trap 1: Pseudoreplication */}
          <div className="flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-6 shadow-2xs space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-series-1/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-series-1">
                  Trap 1 • Protocol Sizing
                </span>
                <Scale size={16} className="text-series-1" aria-hidden />
              </div>
              <h3 className="text-base font-bold text-ink">
                1. Pseudoreplication in Repeated Measures
              </h3>
              <p className="text-xs leading-relaxed text-ink-secondary">
                When 30 participants provide 10 repeated measurements each (300 data points total), standard
                tools treat the rows as 300 independent observations. Because within-subject measurements are
                correlated (ICC often &gt; 0.60), the true effective sample size is often less than 80.
                Treating clustered data as independent shrinks confidence intervals by 40–70%, guaranteeing that
                reported precision claims fail replication.
              </p>
            </div>
            <div className="pt-3 border-t border-hairline">
              <Link
                to="/repeated-measures"
                className="inline-flex items-center gap-1 text-xs font-semibold text-series-1 hover:underline"
              >
                <span>Repeated Measures Designer &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Trap 2: G*Power */}
          <div className="flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-6 shadow-2xs space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-series-1/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-series-1">
                  Trap 2 • Hypothesis Fallacy
                </span>
                <Scale size={16} className="text-series-1" aria-hidden />
              </div>
              <h3 className="text-base font-bold text-ink">
                2. The G*Power / Hypothesis Testing Fallacy
              </h3>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Tools like G*Power are designed for hypothesis testing (<span className="italic">detecting differences</span>{' '}
                with t-tests and ANOVA). Validation asks the exact opposite: proving that two methods{' '}
                <span className="italic">agree</span> within a predefined clinical tolerance window. Sizing a
                validation study with a two-sample t-test is mathematically invalid; validation requires sizing for
                limits of agreement (LoA), RMSE precision, or two one-sided equivalence tests (TOST).
              </p>
            </div>
            <div className="pt-3 border-t border-hairline">
              <Link
                to="/agreement"
                className="inline-flex items-center gap-1 text-xs font-semibold text-series-1 hover:underline"
              >
                <span>Agreement &amp; Equivalence Sizing &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Trap 3: Generic AI */}
          <div className="flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-6 shadow-2xs space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-series-4/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-series-4">
                  Trap 3 • AI Hallucinations
                </span>
                <AlertTriangle size={16} className="text-series-4" aria-hidden />
              </div>
              <h3 className="text-base font-bold text-ink">
                3. Generic AI &amp; LLM Hallucinations
              </h3>
              <p className="text-xs leading-relaxed text-ink-secondary">
                When engineering teams ask generic LLMs (ChatGPT, Claude) to calculate validation sample sizes,
                models frequently hallucinate formulas, default to naive normal approximations (such as{' '}
                <code className="text-[10px] bg-ink/5 px-1 py-0.5 rounded">1.96√(3/n)</code>), or ignore
                degrees of freedom entirely. Sizing a clinical protocol on a hallucinated prompt can waste $500k
                to $2M on an underpowered study that regulators reject.
              </p>
            </div>
            <div className="pt-3 border-t border-hairline">
              <Link
                to="/precision"
                className="inline-flex items-center gap-1 text-xs font-semibold text-series-4 hover:underline"
              >
                <span>Exact Precision Bounds &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Trap 4: Prototyping Winner's Curse */}
          <div className="flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-6 shadow-2xs space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-series-3/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-series-3">
                  Trap 4 • Pilot Selection
                </span>
                <Cpu size={16} className="text-series-3" aria-hidden />
              </div>
              <h3 className="text-base font-bold text-ink">
                4. The Rapid Prototyping "Winner's Curse"
              </h3>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Early-stage sensor teams frequently test 5–6 prototype variants on N=5 subjects and declare the
                candidate with the lowest numerical error the "winner." In reality, small-sample measurement noise
                swamps true performance differences: the apparent winner is almost always just lucky noise. An N=5
                pilot cannot safely pick a winner, though it can reliably eliminate catastrophic losers.
              </p>
            </div>
            <div className="pt-3 border-t border-hairline">
              <Link
                to="/explainers/sniff-test"
                className="inline-flex items-center gap-1 text-xs font-semibold text-series-3 hover:underline"
              >
                <span>Interactive Sniff Test Explainer &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Trap 5: Spreadsheet Fragility (Spans full width on desktop for visual balance) */}
          <div className="flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-6 shadow-2xs space-y-4 md:col-span-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-series-4/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-series-4">
                  Trap 5 • Calculation Integrity
                </span>
                <AlertTriangle size={16} className="text-series-4" aria-hidden />
              </div>
              <h3 className="text-base font-bold text-ink">
                5. Spreadsheet Fragility &amp; Silent Cell Errors
              </h3>
              <p className="text-xs leading-relaxed text-ink-secondary">
                Executing complex non-linear root-finding, variance decompositions (one-way random-effects ANOVA),
                or Monte Carlo timeline simulations in Excel or Google Sheets leads to catastrophic silent failures.
                Unflagged formula typos, truncation errors in normal approximations, broken circular references, and
                copy-paste cell mismatches routinely shift sample size recommendations by 30–50% with zero unit test
                coverage, type verification, or git audit trails.
              </p>
            </div>
            <div className="pt-3 border-t border-hairline">
              <Link
                to="/report-studio"
                className="inline-flex items-center gap-1 text-xs font-semibold text-series-4 hover:underline"
              >
                <span>Validation Report Studio &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: About the Author */}
      <section id="author-credentials" className="space-y-6 rounded-2xl border border-hairline bg-surface p-6 sm:p-8 scroll-mt-20 shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-series-1/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-series-1 border border-series-1/20">
                Section 2 • Provenance &amp; Credentials
              </span>
              <span className="text-xs text-ink-muted">Creator &amp; Methodologist</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {AUTHOR.name}
            </h2>
            <p className="text-sm font-medium text-ink-muted">{AUTHOR.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={AUTHOR.scholarUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-ink/5 hover:text-ink"
            >
              Google Scholar <ExternalLink size={13} aria-hidden />
            </a>
            <a
              href={AUTHOR.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-hairline px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-ink/5 hover:text-ink"
            >
              GitHub <ExternalLink size={13} aria-hidden />
            </a>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-ink-secondary sm:text-base">
          {AUTHOR.extendedBio}
        </p>

        {/* Track Record Stats Dashboard */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
          <div className="rounded-xl border border-hairline bg-plane p-4 text-center">
            <div className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">15+</div>
            <div className="mt-1 text-xs font-medium text-ink-muted">
              Pixel Watch Algorithms Validated
            </div>
          </div>
          <div className="rounded-xl border border-hairline bg-plane p-4 text-center">
            <div className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">2</div>
            <div className="mt-1 text-xs font-medium text-ink-muted">
              FDA Regulatory Submissions
            </div>
          </div>
          <div className="rounded-xl border border-hairline bg-plane p-4 text-center">
            <div className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">3.5 yrs</div>
            <div className="mt-1 text-xs font-medium text-ink-muted">
              Research Scientist at Google
            </div>
          </div>
          <div className="rounded-xl border border-hairline bg-plane p-4 text-center">
            <div className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">100%</div>
            <div className="mt-1 text-xs font-medium text-ink-muted">
              Client-Side (Zero Data Egress)
            </div>
          </div>
        </div>

        <div className="border-t border-hairline pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Applied Validation Background
          </h3>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 text-xs text-ink-secondary">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-series-1" aria-hidden />
              <span>
                <strong className="text-ink">15+ Pixel Watch Algorithms:</strong> Contributed statistical
                validation across Sleep Stages, optical PPG heart rate, blood oxygen (SpO2), Irregular Rhythm
                Notifications, and running kinematics.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-series-1" aria-hidden />
              <span>
                <strong className="text-ink">2 FDA Regulatory Submissions:</strong> Structured statistical
                analyses and documentation for Irregular Rhythm Notification and Blood Oxygen Variation clearances.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-series-1" aria-hidden />
              <span>
                <strong className="text-ink">17% Sleep Algorithm Gain &amp; Claims:</strong> Supported statistical
                substantiation for sleep staging accuracy improvements and marketing claim boundaries.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-series-1" aria-hidden />
              <span>
                <strong className="text-ink">Two-Gate Decision Scorecards:</strong> Structured objective
                performance metrics and non-inferiority criteria to evaluate firmware releases against prior versions.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-series-1" aria-hidden />
              <span>
                <strong className="text-ink">Demographic Quota Allocations:</strong> Structured enrollment quotas
                across the Monk Skin Tone Scale, age brackets, and wrist sizes to ensure equitable sensor performance.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-series-1" aria-hidden />
              <span>
                <strong className="text-ink">Reproducible Pipelines:</strong> Authored open-source statistical
                routines that reduce validation review turnaround from weeks to a single day.
              </span>
            </li>
          </ul>
        </div>

        {/* Selected Methods Publication & Clinical Credentials */}
        <div className="border-t border-hairline pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Peer-Reviewed Methodology &amp; Clinical Credentials
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-hairline bg-surface/60 p-3 text-xs">
              <span className="font-semibold text-ink">
                Rethinking the Statistical Analysis of Neuromechanical Data (2023)
              </span>
              <p className="mt-1 text-[11px] text-ink-muted">
                <span className="italic">Exercise and Sport Sciences Reviews</span> &bull; First Author
              </p>
              <p className="mt-1.5 leading-relaxed text-ink-secondary">
                Foundational peer-reviewed methods paper advocating linear mixed-effects models and variance
                decomposition for human-subject data with repeated measures, individual differences, and unbalanced designs.
              </p>
            </div>
            <div className="rounded-lg border border-hairline bg-surface/60 p-3 text-xs">
              <span className="font-semibold text-ink">
                Good Clinical Practice (ICH GCP) Certificate
              </span>
              <p className="mt-1 text-[11px] text-ink-muted">
                NIDA Clinical Trials Network &bull; Human Subjects Clinical Research Standard
              </p>
              <p className="mt-1.5 leading-relaxed text-ink-secondary">
                Certified in International Council for Harmonisation (ICH) Good Clinical Practice guidelines for
                designing, conducting, recording, and reporting trials that involve human subjects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: The 2-Axis Validation Maturity Matrix Section */}
      <section id="maturity-matrix" aria-labelledby="maturity-matrix-heading" className="space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            Section 3 • Organizational Diagnostic
          </span>
          <span className="text-xs text-ink-muted">2-Axis Maturity Assessment</span>
        </div>
        <h2 id="maturity-matrix-heading" className="sr-only">
          2-Axis Validation Maturity Matrix
        </h2>
        <ValidationMaturityMatrix />
      </section>

      {/* Section 4: How the Toolkit Was Engineered */}
      <section id="engineering" className="space-y-6 scroll-mt-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-series-2/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-series-2 border border-series-2/20">
              Section 4 • Architecture &amp; Privacy
            </span>
            <span className="text-xs text-ink-muted">Zero-Egress Mathematics</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            How the Toolkit Was Engineered
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            Built with zero-compromise scientific standards to replace opaque spreadsheets and unverified AI approximations:
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-hairline bg-surface p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-series-1/10 text-series-1">
              <Lock size={18} aria-hidden />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-ink">Zero-Backend Privacy</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
              Everything runs locally in your browser via TypeScript and Web Standards. Your study protocols,
              sample sizes, proprietary performance targets, and uploaded CSVs never touch a remote server —
              guaranteeing zero HIPAA, GDPR, or IP leakage risk.
            </p>
          </div>

          <div className="rounded-xl border border-hairline bg-surface p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-series-2/10 text-series-2">
              <BookOpen size={18} aria-hidden />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-ink">Exact Mathematical Methods</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
              Hand-rolled special functions (Student's t, non-central t, half-normal, Poisson, Zou's MOVER
              confidence bounds) avoid the crude asymptotic shortcuts found in spreadsheets and textbooks,
              preserving exact precision even at small sample sizes.
            </p>
          </div>

          <div className="rounded-xl border border-hairline bg-surface p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-series-3/10 text-series-3">
              <Award size={18} aria-hidden />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-ink">SciPy Golden Fixture Testing</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
              Every distribution and numerical solver is tested against thousands of golden values generated
              from Python's SciPy library. Over 300 automated unit tests run in CI to catch numerical drift and
              verify boundary edge cases.
            </p>
          </div>
        </div>

        {/* 3-Tier Data Storage & Execution Architecture */}
        <div className="rounded-2xl border border-hairline bg-plane p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-series-1" />
            <h3 className="text-sm font-bold text-ink uppercase tracking-wide">
              3-Tier Data Storage &amp; Execution Architecture
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <div className="rounded-xl border border-hairline bg-surface p-4 space-y-1.5">
              <span className="font-semibold text-series-1 uppercase text-[10px] tracking-wider">
                Tier 1 • Client Runtime
              </span>
              <h4 className="font-bold text-ink">Zero-Egress Static JSON</h4>
              <p className="text-ink-secondary leading-relaxed">
                Client-side execution with bundled JSON fixtures. Calculations run in browser memory without
                external network egress, guaranteeing compliance with enterprise medical privacy standards.
              </p>
            </div>

            <div className="rounded-xl border border-hairline bg-surface p-4 space-y-1.5">
              <span className="font-semibold text-series-4 uppercase text-[10px] tracking-wider">
                Tier 2 • Python Pipelines
              </span>
              <h4 className="font-bold text-ink">Parquet + DuckDB (agreekit)</h4>
              <p className="text-ink-secondary leading-relaxed">
                For Python analytics and notebook research, <code className="font-mono text-[10px]">agreekit</code>{' '}
                leverages columnar Parquet and in-process DuckDB queries to process millions of time-series rows
                with zero database administration overhead.
              </p>
            </div>

            <div className="rounded-xl border border-hairline bg-surface p-4 space-y-1.5">
              <span className="font-semibold text-series-2 uppercase text-[10px] tracking-wider">
                Tier 3 • Population Reference
              </span>
              <h4 className="font-bold text-ink">Static API + Parquet Exports</h4>
              <p className="text-ink-secondary leading-relaxed">
                Health Data Distributions serves pre-calculated demographic quantiles from CDC NHANES and SCIN
                via static CDN endpoints and partitioned Parquet files for sub-second offline querying.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: The Ecosystem */}
      <section id="ecosystem" className="space-y-4 scroll-mt-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-series-3/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-series-3 border border-series-3/20">
              Section 5 • Connected Tools
            </span>
            <span className="text-xs text-ink-muted">The Research Trifecta</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            The Human-Subject Research &amp; Validation Ecosystem
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            The Validation Study Designer is part of an integrated, open-source trifecta designed for end-to-end
            human-subject measurement science:
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-hairline bg-surface p-5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-series-2">
              Phase 0: Reference Data
            </span>
            <h3 className="mt-1 text-sm font-semibold text-ink">
              <a
                href="https://ross-wilkinson.github.io/health-data-distributions/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Health Data Distributions ↗
              </a>
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
              Clean, tidy reference percentiles and SDs for resting heart rate, SpO2, and skin tone
              distributions across age, sex, and race, derived from CDC NHANES and SCIN cohorts.
            </p>
          </div>

          <div className="rounded-xl border-2 border-series-1/30 bg-surface p-5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-series-1">
              Phase 1: Sizing &amp; Architecture
            </span>
            <h3 className="mt-1 text-sm font-semibold text-ink">Validation Study Designer</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
              This interactive suite: plan sample sizes, trade off participants vs replicates, evaluate
              false-pass KPI risks, allocate demographic quotas, and simulate project timelines.
            </p>
          </div>

          <div className="rounded-xl border border-hairline bg-surface p-5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-series-4">
              Phase 2: Post-Collection Analysis
            </span>
            <h3 className="mt-1 text-sm font-semibold text-ink">
              <a
                href="https://github.com/ross-wilkinson/agreekit"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                agreekit (Python) ↗
              </a>
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
              Open-source Python analysis engine for paired data: decomposes variance components via random-effects
              ANOVA, computes cluster-bootstrap Bland–Altman limits, and emits citable methods text.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Caveats & Best Practices */}
      <section id="caveats" className="space-y-4 border-t border-hairline pt-8 scroll-mt-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 border border-amber-500/20">
              Section 6 • Regulatory Guidance
            </span>
            <span className="text-xs text-ink-muted">Methodological Boundaries</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Methodological Caveats &amp; Regulatory Best Practices
          </h2>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-ink-secondary">
          <p>
            <strong className="text-ink">Error Distribution Assumptions:</strong> Standard limits of agreement
            and confidence intervals assume that paired differences are normally distributed. If measurement error
            grows proportionally with measurement magnitude (heteroscedasticity), data should be log-transformed
            or analyzed on a ratio scale prior to limits-of-agreement estimation.
          </p>
          <p>
            <strong className="text-ink">Study Protocol Planning:</strong> These calculators establish the
            statistical boundaries and required sample sizes for a sound protocol. While designed directly from
            methods used in cleared FDA submissions, they are planning tools and do not substitute for a qualified
            biostatistician on your regulatory submission team.
          </p>
        </div>
      </section>

      {/* Workflow Bridge Cards */}
      <NextSteps
        steps={[
          {
            to: '/agreement',
            title: 'Protocol Studio: Study Design & Sizing',
            description:
              'Calculate defensible sample sizes, non-inferiority margins, and repeated-measures protocols.',
          },
          {
            to: '/report-studio',
            title: 'Report Studio: Launch Gates & Scorecards',
            description:
              'Evaluate empirical sensor performance against clinical benchmarks using 2-gate decision matrices.',
          },
          {
            to: '/explainers',
            title: 'Pitfall Explorer: Statistical Pitfalls',
            description:
              'Understand why standard methods like RMSE and ICC fail on wearable sensor data.',
          },
          {
            to: '/academy',
            title: 'Validation Academy: 8 Interactive Modules',
            description:
              'Experience hands-on clinical validation engineering across the Meridian PulseBand 2 lifecycle.',
          },
        ]}
      />
    </article>
  );
}
