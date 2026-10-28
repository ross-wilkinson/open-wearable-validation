import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-8 py-4">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
          <Compass size={13} aria-hidden />
          404 Error
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl text-ink">
          Page not found
        </h1>
        <p className="mt-3 leading-relaxed text-ink-secondary">
          The link you followed does not exist or may have moved. Use the directory below
          to jump directly to the module or calculator you need:
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/agreement"
          className="group rounded-xl border border-hairline bg-surface p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Protocol Studio: Agreement Sample Size</span>
            <ArrowRight size={14} className="text-series-1 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </div>
          <p className="mt-1 text-xs text-ink-secondary">
            Calculate participants needed for Bland–Altman limits, non-inferiority, or equivalence.
          </p>
        </Link>

        <Link
          to="/repeated-measures"
          className="group rounded-xl border border-hairline bg-surface p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Protocol Studio: Repeated Measures Sizing</span>
            <ArrowRight size={14} className="text-series-1 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </div>
          <p className="mt-1 text-xs text-ink-secondary">
            Size studies with within-subject replicates and variance components.
          </p>
        </Link>

        <Link
          to="/report-studio"
          className="group rounded-xl border border-hairline bg-surface p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Report Studio: Validation Report Studio</span>
            <ArrowRight size={14} className="text-series-1 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </div>
          <p className="mt-1 text-xs text-ink-secondary">
            Executive clinical scorecard, Bland–Altman clusters, and 4-quadrant gates.
          </p>
        </Link>

        <Link
          to="/explainers"
          className="group rounded-xl border border-hairline bg-surface p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Pitfall Explorer: Statistical Explainers</span>
            <ArrowRight size={14} className="text-series-1 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </div>
          <p className="mt-1 text-xs text-ink-secondary">
            Interactive demonstrations on RMSE, ICC, and rapid prototyping traps.
          </p>
        </Link>

        <Link
          to="/academy"
          className="group rounded-xl border border-hairline bg-surface p-4 transition-shadow hover:shadow-md sm:col-span-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Validation Academy: 8 Interactive Modules</span>
            <ArrowRight size={14} className="text-series-1 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </div>
          <p className="mt-1 text-xs text-ink-secondary">
            Hands-on clinical validation engineering across the Meridian PulseBand 2 product lifecycle.
          </p>
        </Link>
      </div>

      <div className="border-t border-hairline pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-plane transition-opacity hover:opacity-90"
        >
          <Home size={15} aria-hidden />
          Back to the modules overview
        </Link>
      </div>
    </div>
  );
}
