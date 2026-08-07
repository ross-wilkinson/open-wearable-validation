import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { EXPLAINER_ROUTES } from '../app/navigation.ts';

export default function ExplainersPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Explainers
        </h1>
        <p className="mt-3 leading-relaxed text-ink-secondary">
          Two arguments about measurement statistics that come up constantly in
          validation work, each with a demonstration you can poke at rather than a claim
          you have to take on trust.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {EXPLAINER_ROUTES.map((route) => (
          <Link
            key={route.path}
            to={route.path}
            className="rounded-xl border border-hairline bg-surface p-5 transition-shadow hover:shadow-md focus-visible:shadow-md"
          >
            <h2 className="text-base font-semibold tracking-tight">{route.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              {route.blurb}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-series-1">
              Read <ArrowRight size={14} aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
