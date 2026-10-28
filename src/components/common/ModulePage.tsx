import type { ReactNode } from 'react';
import { BookOpen } from 'lucide-react';
import StudyBar from '../../app/study/StudyBar.tsx';

interface ModulePageProps {
  /** The pillar eyebrow badge, e.g. "PROTOCOL STUDIO" */
  eyebrow?: string;
  /** Explicit series accent token or auto-detected from eyebrow */
  accent?: 'series-1' | 'series-2' | 'series-3' | 'series-4' | 'series-5' | 'series-7';
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
  /**
   * The sample size this page is working with, if any. Passed to the study bar
   * so it can point out when the page and the saved plan disagree.
   */
  currentN?: number | null;
  /** Controls column. Sticky on wide screens, stacked above on narrow ones. */
  controls: ReactNode;
  children: ReactNode;
}

function getAccentClasses(eyebrow?: string, explicitAccent?: string) {
  const token =
    explicitAccent ||
    (() => {
      if (!eyebrow) return 'series-1';
      if (eyebrow.includes('02') || eyebrow.toLowerCase().includes('report')) return 'series-2';
      if (eyebrow.includes('03') || eyebrow.toLowerCase().includes('pitfall')) return 'series-4';
      if (eyebrow.includes('04') || eyebrow.toLowerCase().includes('academy')) return 'series-3';
      if (
        eyebrow.includes('05') ||
        eyebrow.toLowerCase().includes('python') ||
        eyebrow.toLowerCase().includes('agreekit')
      )
        return 'series-7';
      if (
        eyebrow.includes('06') ||
        eyebrow.toLowerCase().includes('population') ||
        eyebrow.toLowerCase().includes('health data')
      )
        return 'series-5';
      return 'series-1';
    })();

  switch (token) {
    case 'series-2':
      return {
        badge: 'bg-series-2/10 text-series-2 border border-series-2/20',
        method: 'text-series-2',
      };
    case 'series-3':
      return {
        badge: 'bg-series-3/10 text-series-3 border border-series-3/20',
        method: 'text-series-3',
      };
    case 'series-4':
      return {
        badge: 'bg-series-4/10 text-series-4 border border-series-4/20',
        method: 'text-series-4',
      };
    case 'series-5':
      return {
        badge: 'bg-series-5/10 text-series-5 border border-series-5/20',
        method: 'text-series-5',
      };
    case 'series-7':
      return {
        badge: 'bg-series-7/10 text-series-7 border border-series-7/20',
        method: 'text-series-7',
      };
    case 'series-1':
    default:
      return {
        badge: 'bg-series-1/10 text-series-1 border border-series-1/20',
        method: 'text-series-1',
      };
  }
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
  eyebrow,
  accent,
  title,
  method,
  intro,
  assumption,
  methodNotes,
  currentN,
  controls,
  children,
}: ModulePageProps) {
  const accentClasses = getAccentClasses(eyebrow, accent);

  return (
    <div className="flex flex-col gap-8">
      <StudyBar currentN={currentN} />

      <header className="max-w-3xl">
        {eyebrow && (
          <div className="mb-2">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${accentClasses.badge}`}
            >
              {eyebrow}
            </span>
          </div>
        )}
        {method && <p className={`text-sm font-medium ${accentClasses.method}`}>{method}</p>}
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
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
