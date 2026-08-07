import { Link } from 'react-router-dom';
import { ArrowRight, Check, Plus } from 'lucide-react';
import { useStudy } from './StudyContext.tsx';

export interface NextStep {
  to: string;
  title: string;
  description: string;
}

interface NextStepsProps {
  /**
   * A sample size this page produced that is worth carrying forward, and the
   * name of the page for the plan summary to cite.
   */
  offer?: { n: number; source: string } | undefined;
  /** Confidence level to carry with it, if this page owns one. */
  confidence?: number;
  steps: readonly NextStep[];
}

/**
 * The end of a page, and the start of the next task.
 *
 * Sizing a study, planning recruitment, and building a timeline are one job.
 * Previously each module ended in a result and a dead end, leaving the user to
 * work out for themselves which page came next and to retype the number when
 * they got there. Carrying the number is an explicit action, not an automatic
 * one — see StudyBar for why.
 */
export default function NextSteps({ offer, confidence, steps }: NextStepsProps) {
  const { study, updateStudy } = useStudy();
  const alreadyCarried = offer !== undefined && study.n === offer.n;

  return (
    <section aria-labelledby="next-steps" className="border-t border-hairline pt-6">
      <h2
        id="next-steps"
        className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
      >
        Next
      </h2>

      {offer && (
        <div className="mt-3">
          {alreadyCarried ? (
            <p className="inline-flex items-center gap-2 text-sm text-ink-secondary">
              <Check size={15} aria-hidden className="text-good" />
              <span>
                <strong className="tabular text-ink">{offer.n}</strong> participants is
                in your plan and will carry to the pages below.
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={() =>
                updateStudy({
                  n: offer.n,
                  nSource: offer.source,
                  ...(confidence === undefined ? {} : { confidence }),
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-plane transition-opacity hover:opacity-90"
            >
              <Plus size={15} aria-hidden />
              Carry {offer.n} participants into my plan
            </button>
          )}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <Link
            key={step.to}
            to={step.to}
            className="group rounded-xl border border-hairline bg-surface p-4 transition-shadow hover:shadow-md focus-visible:shadow-md"
          >
            <span className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              {step.title}
              <ArrowRight
                size={14}
                aria-hidden
                className="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
              />
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-ink-secondary">
              {step.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
