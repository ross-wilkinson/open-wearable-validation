import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export interface Citation {
  /** Rendered reference, e.g. "Bland JM, Altman DG. Lancet. 1986;327(8476):307-10." */
  text: string;
  url?: string;
}

interface MethodsTextProps {
  /**
   * The paragraph, with the live numbers already substituted. Plain text
   * rather than JSX because it has to survive being copied into a Word
   * document, which is the entire point of it.
   */
  text: string;
  citations: readonly Citation[];
  /** Overrides the default heading where a module needs to be more specific. */
  heading?: string;
}

/**
 * Protocol-ready wording for the numbers above.
 *
 * The reason this exists: a validation lead does not stop at the number. The
 * number has to go into a protocol or a statistical analysis plan, get past a
 * reviewer, and survive a question about where it came from. Producing the
 * sentence *and* the reference removes the step where someone paraphrases a
 * calculator from memory and quietly drops the assumption it rested on.
 *
 * The copy button takes the references with it, because a sentence pasted
 * without its citation is exactly the failure this is trying to prevent.
 */
export default function MethodsText({ text, citations, heading }: MethodsTextProps) {
  // What happened and to which text, rather than a bare boolean. That makes
  // "is the confirmation still true?" a derived value: change an input, the
  // paragraph changes, and the confirmation retires on its own. A boolean would
  // need an effect to clear it — the same derived-state-in-an-effect mistake
  // that `react-hooks/set-state-in-effect` exists to catch.
  const [outcome, setOutcome] = useState<
    { kind: 'copied' | 'failed'; text: string } | null
  >(null);
  const paragraph = useRef<HTMLParagraphElement>(null);

  const plainText = [text, '', ...citations.map((c) => c.text)].join('\n');
  const current = outcome?.text === plainText ? outcome.kind : null;

  // The timer is a real side effect, so it does belong in one. Failure sticks
  // around longer than success: it asks the user to do something.
  useEffect(() => {
    if (outcome === null) return undefined;
    const timer = setTimeout(
      () => setOutcome(null),
      outcome.kind === 'copied' ? 2000 : 6000,
    );
    return () => clearTimeout(timer);
  }, [outcome]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(plainText);
      setOutcome({ kind: 'copied', text: plainText });
    } catch {
      // The Clipboard API is unavailable over plain http, inside some embedded
      // webviews, and wherever the permission is refused. Doing nothing at all
      // is the worst response — the button appears broken. Selecting the text
      // instead leaves the user one keystroke from the same result.
      const node = paragraph.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setOutcome({ kind: 'failed', text: plainText });
    }
  }

  return (
    <section
      aria-labelledby="methods-text"
      className="rounded-xl border border-hairline bg-surface p-5"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="methods-text"
          className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
        >
          {heading ?? 'For your protocol'}
        </h2>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1 text-xs font-medium transition-colors hover:bg-ink/5"
        >
          {current === 'copied' ? (
            <>
              <Check size={13} aria-hidden className="text-good" />
              Copied
            </>
          ) : (
            <>
              <Copy size={13} aria-hidden />
              Copy
            </>
          )}
        </button>
      </div>

      <p
        ref={paragraph}
        className="mt-3 border-l-2 border-series-1/40 pl-4 leading-relaxed text-ink-secondary"
      >
        {text}
      </p>

      {/* aria-live so the outcome reaches a screen reader too — the icon swap
          on the button is invisible to one. */}
      <p aria-live="polite" className="sr-only">
        {current === 'copied' ? 'Copied to clipboard.' : ''}
      </p>

      {current === 'failed' && (
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          This browser would not let the page write to the clipboard. The text is
          selected above — press Ctrl+C, or Cmd+C on a Mac. The references are below.
        </p>
      )}

      <ul className="mt-4 flex flex-col gap-1.5 border-t border-hairline pt-3 text-xs leading-relaxed text-ink-muted">
        {citations.map((citation) => (
          <li key={citation.text}>
            {citation.url ? (
              <a
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-ink"
              >
                {citation.text}
              </a>
            ) : (
              citation.text
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
