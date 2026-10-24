import { AUTHOR } from '../content/author.ts';

export default function AboutPage() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">About</h1>
      </header>

      <section className="flex flex-col gap-4 leading-relaxed text-ink-secondary">
        <p>
          G*Power and its clones cover classical power analysis — t-tests, ANOVA — and
          stop there. Validation work runs on <em>agreement</em> statistics: bias,
          limits of agreement, effective sample size, and percentile error. There is no
          free tool for sizing a study around those, so it traditionally gets done in spreadsheets.
        </p>
        <p>
          This toolkit provides that calculation, done properly. Everything runs locally in
          your browser; nothing is uploaded, stored, or sent anywhere.
        </p>
      </section>

      <section className="flex flex-col gap-4 leading-relaxed text-ink-secondary">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          The Human-Subject Validation Ecosystem
        </h2>
        <p>
          The Validation Study Designer is part of an integrated, open-source set of tools
          for human-subject measurement research:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>
            <strong className="text-ink">Validation Study Designer (this site)</strong>: Plan
            study architecture, size sample for agreement and repeated measures, allocate demographic
            quotas, and simulate project timelines.
          </li>
          <li>
            <a
              href="https://ross-wilkinson.github.io/health-data-distributions/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-series-1 underline underline-offset-2 hover:opacity-80"
            >
              Health Data Distributions ↗
            </a>
            : Standardized reference percentiles and standard deviations across demographic
            subgroups (resting heart rate, pulse, SpO2, skin tone) derived from NHANES, SCIN, and public cohorts.
          </li>
          <li>
            <a
              href="https://github.com/ross-wilkinson/agreekit"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-series-1 underline underline-offset-2 hover:opacity-80"
            >
              agreekit (Python) ↗
            </a>
            : The analysis package for paired data. Decomposes variance components, computes
            repeated-measures Bland-Altman statistics with cluster-bootstrap confidence intervals,
            and outputs citable methods text.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4 leading-relaxed text-ink-secondary">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Who made it</h2>
        <p>{AUTHOR.shortBio}</p>
        <p>{AUTHOR.credentialLine}</p>
        <p>
          <a
            href={AUTHOR.scholarUrl}
            target="_blank"
            rel="noreferrer"
            className="text-series-1 underline underline-offset-2"
          >
            Publications on Google Scholar
          </a>
        </p>
      </section>

      <section className="flex flex-col gap-4 leading-relaxed text-ink-secondary">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          How the numbers are checked
        </h2>
        <p>
          The browser has no SciPy, so every distribution here — normal, Student t,
          half-normal, Poisson, non-central t — is implemented from scratch in
          TypeScript. Hand-rolled special functions are subtly wrong by default, so each
          one is tested against golden values generated from SciPy across thousands of
          grid points, and those fixtures are verified in CI to catch any drift.
        </p>
        <p>
          Where published references or common spreadsheets take shortcuts — such as using
          the naive 1.96√(3/n) approximation or treating repeated measures as independent —
          this site explicitly calculates the exact formulation (Bland &amp; Altman 2007,
          Zou 2013) and flags the difference.
        </p>
      </section>

      <section className="flex flex-col gap-4 leading-relaxed text-ink-secondary">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Caveats</h2>
        <p>
          Every module assumes measurement errors are normally distributed unless it
          says otherwise. If your errors grow proportionally with measurement level,
          data should be transformed (e.g. logarithmic or ratio scale) prior to limits-of-agreement
          analysis.
        </p>
        <p>
          These are planning tools. They tell you what precision a design can deliver;
          they are not a substitute for a qualified biostatistician on a regulatory submission.
        </p>
      </section>
    </article>
  );
}
