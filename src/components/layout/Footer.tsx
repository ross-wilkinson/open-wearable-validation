import { Link } from 'react-router-dom';
import { AUTHOR } from '../../content/author.ts';

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface/50">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs text-ink-muted sm:px-6">
        <p>
          Built by{' '}
          <a
            href={AUTHOR.scholarUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-ink-secondary underline underline-offset-2 hover:text-ink"
          >
            {AUTHOR.name}
          </a>{' '}
          (ex-Google Research Scientist) &bull; 100% Local Browser Execution &bull; Zero Telemetry
        </p>
        <Link to="/about" className="font-medium text-ink-secondary hover:text-ink">
          About &amp; rationale &rarr;
        </Link>
      </div>
    </footer>
  );
}
