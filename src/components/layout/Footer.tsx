import { AUTHOR } from '../../content/author.ts';

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-ink-muted sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p>
            Built by{' '}
            <a
              href={AUTHOR.scholarUrl}
              target="_blank"
              rel="noreferrer"
              className="text-ink-secondary underline underline-offset-2 hover:text-ink"
            >
              {AUTHOR.name}
            </a>
            . Every module states its method, its assumptions, and its references.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-ink-secondary">
            <a
              href="https://ross-wilkinson.github.io/health-data-distributions/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink"
            >
              Health Data Distributions ↗
            </a>
            <a
              href="https://github.com/ross-wilkinson/agreekit"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink"
            >
              agreekit (Python) ↗
            </a>
          </div>
        </div>
        <p className="text-xs text-ink-muted">
          Everything runs locally in your browser. No data is uploaded, stored, or sent anywhere.
        </p>
      </div>
    </footer>
  );
}
