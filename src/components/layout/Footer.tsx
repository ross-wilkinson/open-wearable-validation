import { AUTHOR } from '../../content/author.ts';

export default function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-ink-muted sm:px-6">
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
        <p>
          Everything runs in your browser. No data is uploaded, stored, or sent
          anywhere.
        </p>
      </div>
    </footer>
  );
}
