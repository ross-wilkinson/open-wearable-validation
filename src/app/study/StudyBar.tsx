import { ClipboardList, RotateCcw } from 'lucide-react';
import { useStudy } from './StudyContext.tsx';

interface StudyBarProps {
  /**
   * The sample size this page is currently working with, when it has one.
   * Supplying it lets the bar say when the page and the plan have diverged,
   * which is the moment a user needs to be told — silently showing one number
   * while the plan holds another is how the wrong figure ends up in a protocol.
   */
  currentN?: number | null;
  /** Label for the save action, e.g. "Use 149 in my plan". */
  saveLabel?: string;
}

/**
 * A persistent, honest summary of the plan carried between modules.
 *
 * Deliberately not silent. The alternative design — quietly syncing every
 * module to a shared n — means a user changes a number on one page and finds a
 * different page has changed too, with nothing on screen explaining why. This
 * shows the plan, shows when the current page disagrees with it, and makes
 * adopting or discarding the difference a decision rather than a side effect.
 */
export default function StudyBar({ currentN, saveLabel }: StudyBarProps) {
  const { study, updateStudy, clearStudy, planned } = useStudy();

  if (!planned) return null;

  const diverged =
    typeof currentN === 'number' && currentN > 0 && currentN !== study.n;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-hairline bg-surface px-4 py-2.5 text-sm">
      <span className="flex items-center gap-2 font-medium">
        <ClipboardList size={15} aria-hidden className="text-series-1" />
        Your plan
      </span>

      <span className="text-ink-secondary">
        <strong className="tabular text-ink">{study.n}</strong> participants
        {study.nSource && (
          <span className="text-ink-muted"> (from {study.nSource})</span>
        )}
      </span>

      <span className="text-ink-secondary">
        <strong className="tabular text-ink">
          {(study.confidence * 100).toFixed(0)}%
        </strong>{' '}
        confidence
      </span>

      {study.measurementSd !== null && (
        <span className="text-ink-secondary">
          SD{' '}
          <strong className="tabular text-ink">
            {study.measurementSd}
            {study.unit && ` ${study.unit}`}
          </strong>
        </span>
      )}

      <span className="ml-auto flex items-center gap-2">
        {diverged && (
          <button
            type="button"
            onClick={() =>
              updateStudy({ n: currentN, nSource: 'this page' })
            }
            className="rounded-md border border-series-1 px-2.5 py-1 text-xs font-medium text-series-1 transition-colors hover:bg-series-1/10"
          >
            {saveLabel ?? `Update plan to ${currentN}`}
          </button>
        )}
        <button
          type="button"
          onClick={clearStudy}
          className="inline-flex items-center gap-1 rounded-md border border-hairline px-2.5 py-1 text-xs text-ink-secondary transition-colors hover:bg-ink/5"
        >
          <RotateCcw size={12} aria-hidden />
          Clear
        </button>
      </span>

      {diverged && (
        <p className="w-full text-xs text-ink-muted">
          This page is set to {currentN}, your plan says {study.n}. Nothing is saved
          until you choose.
        </p>
      )}
    </div>
  );
}
