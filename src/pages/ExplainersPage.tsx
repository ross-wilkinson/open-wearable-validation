import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Lightbulb } from 'lucide-react';
import { EXPLAINER_ROUTES } from '../app/navigation.ts';
import NextSteps from '../app/study/NextSteps.tsx';

const EXPLAINER_METADATA: Record<
  string,
  { tag: string; tagColor: string; takeaway: string; relatedTo: { label: string; to: string } }
> = {
  '/explainers/rmse-mae': {
    tag: 'Error Distribution Trap',
    tagColor: 'bg-series-1/10 text-series-1',
    takeaway:
      'Why quadratic penalty metrics blind product teams to heavy-tailed sensor dropouts and catastrophic user failure rates.',
    relatedTo: { label: 'Report Studio', to: '/report-studio' },
  },
  '/explainers/agreement-vs-icc': {
    tag: 'Correlation Fallacy',
    tagColor: 'bg-series-2/10 text-series-2',
    takeaway:
      'Why high ICC can be manufactured simply by testing a wider dynamic range, while actual device agreement remains abysmal.',
    relatedTo: { label: 'Repeated Measures', to: '/repeated-measures' },
  },
  '/explainers/sniff-test': {
    tag: 'Prototyping Strategy',
    tagColor: 'bg-series-3/10 text-series-3',
    takeaway:
      'Why N=5 pilot screens suffer from the Winner’s Curse and cannot rank candidates, but act as high-power elimination filters.',
    relatedTo: { label: 'Sample Size', to: '/agreement' },
  },
};

export default function ExplainersPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="max-w-3xl">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-series-1/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-series-1">
            PITFALL EXPLORER
          </span>
          <span className="text-xs text-ink-muted">Foundational Validation Science</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl text-ink">
          Interactive Statistical Explainers
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-secondary">
          Core methodological traps and statistical counter-intuitions that arise repeatedly in
          sensor and algorithm validation. Each explainer pairs real-world production rationale
          with an interactive simulation you can stress-test yourself.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {EXPLAINER_ROUTES.map((route) => {
          const meta = EXPLAINER_METADATA[route.path];
          return (
            <div
              key={route.path}
              className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      meta?.tagColor ?? 'bg-ink/5 text-ink-muted'
                    }`}
                  >
                    {meta?.tag ?? 'Explainer'}
                  </span>
                  <BookOpen size={14} className="text-ink-muted" aria-hidden />
                </div>

                <h2 className="mt-3 text-base font-semibold tracking-tight text-ink">
                  {route.title}
                </h2>
                <p className="mt-1 text-xs font-medium text-ink-muted">{route.method}</p>

                <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                  {route.blurb}
                </p>

                {meta && (
                  <div className="mt-3 rounded-lg border border-hairline bg-surface/50 p-2.5 text-xs text-ink-secondary">
                    <div className="flex items-center gap-1 font-medium text-ink">
                      <Lightbulb size={12} className="text-series-1" aria-hidden />
                      Key Takeaway
                    </div>
                    <p className="mt-1 leading-relaxed text-ink-muted">{meta.takeaway}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-hairline pt-3 text-xs">
                <Link
                  to={route.path}
                  className="inline-flex items-center gap-1 font-semibold text-series-1 hover:underline"
                >
                  Explore Interactive Simulation <ArrowRight size={13} aria-hidden />
                </Link>
                {meta && (
                  <Link
                    to={meta.relatedTo.to}
                    className="text-ink-muted hover:text-ink hover:underline"
                  >
                    Tool: {meta.relatedTo.label} ↗
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <NextSteps
        steps={[
          {
            to: '/agreement',
            title: 'Protocol Studio: Sample Size',
            description:
              'Apply rigorous sample size planning to avoid small-N prototyping traps and false conclusions.',
          },
          {
            to: '/report-studio',
            title: 'Report Studio: Launch Gates',
            description:
              'Inspect empirical error distributions, Bland-Altman clusters, and executive scorecards.',
          },
        ]}
      />
    </div>
  );
}
