import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Database,
  ExternalLink,
  Layers,
  Sparkles,
  Users,
} from 'lucide-react';
import { EXPLAINER_ROUTES, MODULE_ROUTES } from '../app/navigation.ts';
import type { ModuleRoute } from '../app/navigation.ts';

function ModuleCard({ route }: { route: ModuleRoute }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight">{route.title}</h3>
        {route.status === 'planned' && (
          <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-xs text-ink-muted">
            In progress
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-ink-muted">{route.method}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{route.blurb}</p>
      {route.status === 'ready' && (
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-series-1">
          Open <ArrowRight size={14} aria-hidden />
        </span>
      )}
    </>
  );

  const shell = 'rounded-xl border border-hairline bg-surface p-5';

  return route.status === 'ready' ? (
    <Link
      to={route.path}
      className={`${shell} block transition-shadow hover:shadow-md focus-visible:shadow-md`}
    >
      {body}
    </Link>
  ) : (
    <div className={`${shell} opacity-70`}>{body}</div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-14">
      {/* Hero Section */}
      <section className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-medium text-series-1">
          <Sparkles size={13} aria-hidden />
          The Human-Subject Research &amp; Validation Studio
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to design, size, and analyze human-subject validation studies
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-secondary">
          Whether you are evaluating a wearable sensor, an optical biosensor, a clinical
          algorithm, or a digital health diagnostic, proving agreement requires specialized
          statistical methods. This toolkit covers within-subject repeated-measures designs,
          population reference distributions, demographic recruitment quotas, and post-collection
          analysis.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/repeated-measures"
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-plane transition-opacity hover:opacity-90"
          >
            Plan repeated measures study <ArrowRight size={15} aria-hidden />
          </Link>
          <Link
            to="/agreement"
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-ink/5"
          >
            Single-sample sizing
          </Link>
          <a
            href="https://ross-wilkinson.github.io/health-data-distributions/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-ink/5 hover:text-ink"
          >
            Population Norms <ExternalLink size={14} aria-hidden />
          </a>
        </div>
      </section>

      {/* The 4 Pillars of Human-Subject Validation Research */}
      <section aria-labelledby="lifecycle-heading" className="space-y-4">
        <h2
          id="lifecycle-heading"
          className="text-xs font-semibold uppercase tracking-wider text-ink-muted"
        >
          The Complete Human-Subject Research Framework
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-hairline bg-surface p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-series-1/10 text-series-1">
              <Database size={18} aria-hidden />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-ink">
              1. Population Norms
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
              Ground your protocol in real subgroup distributions (resting heart rate,
              pulse, SpO2, skin tone) via Health Data Distributions rather than arbitrary guesses.
            </p>
          </div>

          <div className="rounded-xl border border-hairline bg-surface p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-series-2/10 text-series-2">
              <Layers size={18} aria-hidden />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-ink">
              2. Study Architecture
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
              Decompose between- vs within-subject variance for repeated measures, compute
              effective sample size, and size for limits of agreement or TOST equivalence.
            </p>
          </div>

          <div className="rounded-xl border border-hairline bg-surface p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-series-3/10 text-series-3">
              <Users size={18} aria-hidden />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-ink">
              3. Quotas &amp; Operations
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
              Set mathematically sound demographic caps across sex, age, and Monk skin tone
              scales. Simulate recruitment and lab testing durations with Monte Carlo.
            </p>
          </div>

          <div className="rounded-xl border border-hairline bg-surface p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-series-4/10 text-series-4">
              <BarChart3 size={18} aria-hidden />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-ink">
              4. Analysis Pipeline
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
              Execute cluster-aware Bland-Altman agreement tables, ANOVA variance components,
              and non-central t confidence intervals in Python with agreekit.
            </p>
          </div>
        </div>
      </section>

      {/* Sister Projects Showcase: Health Data Distributions & agreekit */}
      <section aria-labelledby="ecosystem-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2
            id="ecosystem-heading"
            className="text-xs font-semibold uppercase tracking-wider text-ink-muted"
          >
            Companion Resources for Human-Subject Researchers
          </h2>
          <span className="text-xs text-ink-muted">Open source &amp; citable</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Health Data Distributions */}
          <div className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-6 transition-shadow hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-series-1/10 px-2.5 py-0.5 text-xs font-semibold text-series-1">
                  Reference Population Data
                </span>
                <ExternalLink size={15} className="text-ink-muted" aria-hidden />
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink">
                Health Data Distributions
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                Sizing a study requires knowing the expected spread of the measure in the
                target population. Health Data Distributions publishes tidy, citable percentiles
                and SDs stratified by sex, age, and race/ethnicity for metrics like resting heart
                rate, pulse, and skin tone distributions — recomputed directly from CDC NHANES
                and SCIN datasets.
              </p>
            </div>
            <div className="mt-5 border-t border-hairline pt-4">
              <a
                href="https://ross-wilkinson.github.io/health-data-distributions/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-series-1 hover:underline"
              >
                Browse Population Reference Tables <ArrowRight size={14} aria-hidden />
              </a>
            </div>
          </div>

          {/* agreekit */}
          <div className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-6 transition-shadow hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-series-4/10 px-2.5 py-0.5 text-xs font-semibold text-series-4">
                  Python Analysis Library
                </span>
                <ExternalLink size={15} className="text-ink-muted" aria-hidden />
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink">
                agreekit (Python)
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                The post-collection analysis counterpart to the Validation Study Designer.
                agreekit takes paired human-subject data with multiple observations per individual,
                decomposes variance using one-way random-effects ANOVA, computes cluster-bootstrap
                limits of agreement, and outputs publication-ready methods text.
              </p>
            </div>
            <div className="mt-5 border-t border-hairline pt-4">
              <a
                href="https://github.com/ross-wilkinson/agreekit"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-series-1 hover:underline"
              >
                View agreekit on GitHub <ArrowRight size={14} aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* The "Am I in the right place?" Question Directory */}
      <section aria-labelledby="questions">
        <h2
          id="questions"
          className="text-xs font-semibold uppercase tracking-wider text-ink-muted"
        >
          What question are you trying to answer?
        </h2>
        <ul className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          {[
            {
              path: '/repeated-measures',
              question: 'How many subjects and replicates do I need for a paired study?',
            },
            {
              path: '/agreement',
              question: 'How many participants do I need to prove agreement?',
            },
            {
              path: '/precision',
              question: 'How precise will my study be with our fixed sample size?',
            },
            {
              path: '/demographics',
              question: 'Who do I need to recruit to ensure demographic equity?',
            },
            {
              path: '/timeline',
              question: 'How long will IRB review, recruitment, and testing take?',
            },
            {
              path: '/effect-size',
              question: "How do I report Cohen's d confidence intervals honestly at small n?",
            },
            {
              path: '/report-studio',
              question: 'How do I present and report validation findings across cross-functional teams?',
            },
            {
              path: '/explainers/agreement-vs-icc',
              question: 'Why can two devices have identical agreement but wildly different ICCs?',
            },
            {
              path: '/explainers/rmse-mae',
              question: 'Why does RMSE fail on heavy-tailed sensor errors?',
            },
          ].map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="group flex items-baseline gap-2 py-1.5 text-ink-secondary transition-colors hover:text-ink"
              >
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 self-start rounded-full bg-series-1"
                />
                <span className="text-sm">{item.question}</span>
                <ArrowRight
                  size={13}
                  aria-hidden
                  className="shrink-0 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Concrete Worked Example Box */}
      <section className="rounded-xl border border-hairline bg-surface p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          What an answer looks like
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink-secondary">
          In a repeated-measures study with <strong className="text-ink">30 participants</strong> and{' '}
          <strong className="text-ink">6 replicates each</strong> (180 total observations, ICC = 0.60),
          the <strong className="text-ink">effective sample size is only 75 independent observations</strong>.
          The limits of agreement are pinned down to <strong className="tabular text-ink">±0.36 SD</strong>.
          An analyst who mistakenly treats the 180 rows as independent would claim ±0.22 SD, understating
          uncertainty by nearly 40%.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Knowing your effective sample size and variance decomposition before recruiting is the
          difference between a study that satisfies FDA/regulatory review and one whose intervals
          fail replication.
        </p>
      </section>

      {/* Interactive Tool Modules Grid */}
      <section aria-labelledby="tools-heading">
        <h2
          id="tools-heading"
          className="text-xs font-semibold uppercase tracking-wider text-ink-muted"
        >
          Study Design Modules
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULE_ROUTES.map((route) => (
            <ModuleCard key={route.path} route={route} />
          ))}
        </div>
      </section>

      {/* Educational & Methodological Explainers */}
      <section aria-labelledby="explainers-heading">
        <h2
          id="explainers-heading"
          className="text-xs font-semibold uppercase tracking-wider text-ink-muted"
        >
          Before you choose a metric
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          Two statistics that routinely get reported as evidence of accuracy in sensor
          and algorithm literature, and what they actually tell you.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {EXPLAINER_ROUTES.map((route) => (
            <ModuleCard key={route.path} route={route} />
          ))}
        </div>
      </section>

      {/* Why not G*Power / Methodological Rationale */}
      <section className="max-w-3xl border-t border-hairline pt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Why not G*Power or standard power analysis?
        </h2>
        <p className="mt-3 leading-relaxed text-ink-secondary">
          Classical power analysis software (like G*Power) sizes studies for hypothesis testing
          (t-tests, ANOVA) — tools designed to <em>detect differences</em>. Validation asks the
          opposite question: how closely two measurement methods <em>agree</em>. Sizing for
          agreement runs on bias, limits of agreement, variance components, and error percentiles.
          Practitioners often try to adapt t-test formulas or rely on fragile spreadsheets.
          This platform implements exact Bland-Altman and repeated-measures statistics directly in
          your browser, with zero tracking and no data uploaded anywhere.
        </p>
      </section>
    </div>
  );
}
