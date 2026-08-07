import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-ink-secondary">
        That route does not exist yet. Some modules are still being built.
      </p>
      <Link
        to="/"
        className="mt-5 inline-block text-series-1 underline underline-offset-2"
      >
        Back to the modules
      </Link>
    </div>
  );
}
