import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
      {/* The method name keeps every module findable by its proper title for
          someone who already knows what they are looking for, without making
          the statistic the thing a newcomer has to decode first. */}
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
      <section className="max-w-3xl">
        <p className="text-sm font-medium text-series-1">
          Study design for wearables, sensors, and algorithms
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          How many participants does your validation study need?
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-secondary">
          You have to prove a device measures accurately enough. This works out how
          many people you need, who they should be, how long it will take, and what
          precision you will actually end up with — before you spend anything.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* bg-ink rather than bg-series-1: the brand blue against white is
              4.42:1, just under the 4.5:1 AA floor for 14px text. Ink on plane
              inverts correctly in dark mode and clears it comfortably in both. */}
          <Link
            to={MODULE_ROUTES[0]!.path}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-plane transition-opacity hover:opacity-90"
          >
            Start with sample size <ArrowRight size={15} aria-hidden />
          </Link>
          <Link
            to="/precision"
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-4 py-2 text-sm font-medium transition-colors hover:bg-ink/5"
          >
            I already have an n
          </Link>
        </div>
      </section>

      {/* The "am I in the right place?" test. Someone lands mid-task with a
          question already formed; the fastest way to answer them is to show
          that question in their own words and make it a link. */}
      <section aria-labelledby="questions">
        <h2
          id="questions"
          className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
        >
          You are in the right place if you are asking
        </h2>
        <ul className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
          {[
            ...MODULE_ROUTES.map((r) => ({ path: r.path, question: r.title })),
            {
              path: '/explainers/agreement-vs-icc',
              question: 'Is our ICC of 0.95 actually good?',
            },
            {
              path: '/explainers/rmse-mae',
              question: 'Why does our RMSE not match what users experience?',
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
                {item.question}
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

      <section className="rounded-xl border border-hairline bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          What an answer looks like
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink-secondary">
          With <strong className="text-ink">64 participants</strong>, a validation
          study pins down the mean bias to within{' '}
          <strong className="tabular text-ink">±0.20</strong> of a measurement SD, and
          each limit of agreement to within{' '}
          <strong className="tabular text-ink">±0.36</strong> — at 95% confidence.
          Double the sample to 128 and those tighten only to ±0.14 and ±0.26, because
          precision improves with the square root of n.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Knowing that before recruiting is the difference between a study that
          settles the question and one that produces a limit of agreement too wide to
          act on.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Plan a study
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULE_ROUTES.map((route) => (
            <ModuleCard key={route.path} route={route} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Before you choose a metric
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          Two statistics that routinely get reported as evidence of accuracy, and what
          they actually tell you.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {EXPLAINER_ROUTES.map((route) => (
            <ModuleCard key={route.path} route={route} />
          ))}
        </div>
      </section>

      <section className="max-w-3xl border-t border-hairline pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Why not G*Power
        </h2>
        <p className="mt-3 leading-relaxed text-ink-secondary">
          Classical power analysis sizes studies for t-tests and ANOVA — tools for
          detecting a difference. Validation asks the opposite question: how closely
          two methods <em>agree</em>. That runs on bias, limits of agreement, and error
          percentiles, and sizing a study around those is normally done by hand in a
          spreadsheet. This does that calculation properly, in your browser, with
          nothing uploaded anywhere.
        </p>
      </section>
    </div>
  );
}
