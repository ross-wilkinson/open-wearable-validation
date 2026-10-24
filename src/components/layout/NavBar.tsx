import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { MODULE_ROUTES } from '../../app/navigation.ts';
import ThemeToggle from './ThemeToggle.tsx';

function linkClass({ isActive }: { isActive: boolean }): string {
  return [
    'whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors xl:text-sm',
    isActive
      ? 'bg-series-1/10 text-series-1'
      : 'text-ink-secondary hover:bg-ink/5 hover:text-ink',
  ].join(' ');
}

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const navLinks = MODULE_ROUTES.filter((route) => route.inNav);

  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-plane/85 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <NavLink to="/" className="mr-auto flex items-baseline gap-2">
          <span className="text-base font-semibold tracking-tight">
            Validation Study Designer
          </span>
        </NavLink>

        <nav aria-label="Modules" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((route) => (
            <NavLink key={route.path} to={route.path} className={linkClass}>
              {route.label}
            </NavLink>
          ))}
          <NavLink to="/explainers" className={linkClass}>
            Explainers
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
        </nav>

        <ThemeToggle />

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="rounded-md p-2 text-ink-secondary hover:bg-ink/5 hover:text-ink lg:hidden"
        >
          {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Modules"
          className="border-t border-hairline px-4 pb-3 sm:px-6 lg:hidden"
        >
          <ul className="flex flex-col gap-1 pt-2">
            {navLinks.map((route) => (
              <li key={route.path}>
                <NavLink
                  to={route.path}
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  {route.label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                to="/explainers"
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                Explainers
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={linkClass} onClick={() => setOpen(false)}>
                About
              </NavLink>
            </li>
            <li className="mt-2 border-t border-hairline pt-2">
              <span className="block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Ecosystem
              </span>
            </li>
            <li>
              <a
                href="https://ross-wilkinson.github.io/health-data-distributions/"
                target="_blank"
                rel="noreferrer"
                className="block rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-secondary hover:bg-ink/5 hover:text-ink"
              >
                Health Data Distributions ↗
              </a>
            </li>
            <li>
              <a
                href="https://github.com/ross-wilkinson/agreekit"
                target="_blank"
                rel="noreferrer"
                className="block rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-secondary hover:bg-ink/5 hover:text-ink"
              >
                agreekit (Python) ↗
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
