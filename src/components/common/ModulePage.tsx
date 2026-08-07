import type { ReactNode } from 'react';
import { BookOpen } from 'lucide-react';

interface ModulePageProps {
  /** The user's question, used as the page heading. */
  title: string;
  /** The statistical method, shown small above the heading. */
  method?: string;
  /**
   * What this module gives you and what decision it informs. One or two
   * sentences, in the user's terms — never in terms of how it was built.
   */
  intro: ReactNode;
  /**
   * The assumption the answer rests on, stated where it cannot be missed.
   * A validation lead who takes a number from here into a protocol needs to
   * know what has to be true for it to hold.
   */
  assumption?: ReactNode;
  /**
   * Derivations, method comparisons, references. Collapsed by default: it is
   * what a reviewer needs to audit the number and what nobody needs in order to
   * use it, so it belongs on the page but not in front of the answer.
   */
  methodNotes?: ReactNode;
  /** Controls column. Sticky on wide screens, stacked above on narrow ones. */
  controls: ReactNode;
  children: ReactNode;
}

/**
 * Shared two-column layout for every calculator module: controls on the left,
 * results on the right, stacking to a single column below `lg`.
 *
 * The controls column comes first in the DOM as well as visually, so tab order
 * and screen-reader order both follow the actual workflow — set the inputs,
 * then read the outputs.
 */
export default function ModulePage({
  title,
  method,
  intro,
  assumption,
  methodNotes,
  controls,
  children,
}: ModulePageProps) {
  return (
    <div className="flex flex-col gap-8">
      <header className="max-w-3xl">
        {method && (
          <p className="text-sm font-medium text-series-1">{method}</p>
        )}
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <div className="mt-3 flex flex-col gap-3 leading-relaxed text-ink-secondary">
          {intro}
        </div>
        {assumption && (
          <p className="mt-4 rounded-lg border border-hairline bg-surface px-4 py-3 text-sm leading-relaxed text-ink-secondary">
            <span className="font-medium text-ink">This assumes: </span>
            {assumption}
          </p>
        )}
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-72">
          <div className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface p-5">
            {controls}
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          {children}
          {methodNotes && (
            <details className="group rounded-xl border border-hairline bg-surface">
              <summary className="flex cursor-pointer items-center gap-2 px-5 py-4 text-sm font-medium marker:content-none">
                <BookOpen size={16} aria-hidden className="text-ink-muted" />
                Method and sources
                <span className="ml-auto text-xs font-normal text-ink-muted">
                  derivation, comparisons, references
                </span>
              </summary>
              <div className="flex flex-col gap-3 border-t border-hairline px-5 py-4 text-sm leading-relaxed text-ink-secondary">
                {methodNotes}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
