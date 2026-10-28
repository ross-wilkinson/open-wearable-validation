import { Link } from 'react-router-dom';
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
              className="text-ink-secondary underline underline-offset-2 hover:text-ink font-medium"
            >
              {AUTHOR.name}
            </a>
            {' '}(ex-Google Research Scientist). Every module states its method, its assumptions, and its references.{' '}
            <Link to="/about" className="text-series-1 underline underline-offset-2 hover:opacity-80">
              About the design &amp; author &rarr;
            </Link>
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-ink-secondary">
            <Link to="/protocol-studio" className="hover:text-ink text-series-1 font-semibold">
              Protocol Studio Overview
            </Link>
            <Link to="/report-studio/overview" className="hover:text-ink text-series-2 font-semibold">
              Report Studio Overview
            </Link>
            <Link to="/agreekit" className="hover:text-ink text-series-7 font-semibold">
              agreekit Hub
            </Link>
            <Link to="/health-data-distributions" className="hover:text-ink text-series-5 font-semibold">
              Health Data Catalog Hub
            </Link>
            <a
              href="https://ross-wilkinson.github.io/health-data-distributions/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink"
            >
              Live App ↗
            </a>
            <a
              href="https://github.com/ross-wilkinson/agreekit"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink"
            >
              GitHub ↗
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
