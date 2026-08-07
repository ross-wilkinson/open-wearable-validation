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
    <div className="flex flex-col gap-12">
      <section className="max-w-3xl">
        <p className="text-sm font-medium text-series-1">
          Sample size for agreement statistics
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Design a measurement-validation study
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-secondary">
          You are validating a device, sensor, or algorithm. How many subjects do you
          need, across what demographic spread, over how long — and what precision will
          you actually end up with?
        </p>
        <p className="mt-4 leading-relaxed text-ink-secondary">
          Classical power analysis tools stop at t-tests and ANOVA. Validation work runs
          on <em>agreement</em> statistics — bias, limits of agreement, percentile error
          — and sizing a study around those is normally done in a spreadsheet. This is
          that calculation, done properly, in your browser.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Modules
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULE_ROUTES.map((route) => (
            <ModuleCard key={route.path} route={route} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Explainers
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {EXPLAINER_ROUTES.map((route) => (
            <ModuleCard key={route.path} route={route} />
          ))}
        </div>
      </section>
    </div>
  );
}
