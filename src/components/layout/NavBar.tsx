import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ClipboardList,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { EXPLAINER_ROUTES, MODULE_ROUTES } from '../../app/navigation.ts';
import { useStudy } from '../../app/study/StudyContext.tsx';
import ThemeToggle from './ThemeToggle.tsx';
import { OpenWearableValidationLogo } from '../brand/OpenWearableValidationLogo.tsx';
import { BRAND_CONFIG } from '../../config/brand.ts';

const DESIGN_PATHS = [
  '/reference-devices',
  '/agreement',
  '/repeated-measures',
  '/precision',
  '/demographics',
  '/timeline',
];

const ANALYSIS_PATHS = [
  '/report-studio',
  '/chance-kpi',
  '/effect-size',
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [explainersOpen, setExplainersOpen] = useState(false);
  const [ecosystemOpen, setEcosystemOpen] = useState(false);

  const designRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const explainersRef = useRef<HTMLDivElement>(null);
  const ecosystemRef = useRef<HTMLDivElement>(null);

  const designTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analysisTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const explainersTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ecosystemTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleDesignEnter() {
    if (designTimer.current) clearTimeout(designTimer.current);
    setDesignOpen(true);
  }
  function handleDesignLeave() {
    if (designTimer.current) clearTimeout(designTimer.current);
    designTimer.current = setTimeout(() => setDesignOpen(false), 150);
  }

  function handleAnalysisEnter() {
    if (analysisTimer.current) clearTimeout(analysisTimer.current);
    setAnalysisOpen(true);
  }
  function handleAnalysisLeave() {
    if (analysisTimer.current) clearTimeout(analysisTimer.current);
    analysisTimer.current = setTimeout(() => setAnalysisOpen(false), 150);
  }

  function handleExplainersEnter() {
    if (explainersTimer.current) clearTimeout(explainersTimer.current);
    setExplainersOpen(true);
  }
  function handleExplainersLeave() {
    if (explainersTimer.current) clearTimeout(explainersTimer.current);
    explainersTimer.current = setTimeout(() => setExplainersOpen(false), 150);
  }

  function handleEcosystemEnter() {
    if (ecosystemTimer.current) clearTimeout(ecosystemTimer.current);
    setEcosystemOpen(true);
  }
  function handleEcosystemLeave() {
    if (ecosystemTimer.current) clearTimeout(ecosystemTimer.current);
    ecosystemTimer.current = setTimeout(() => setEcosystemOpen(false), 150);
  }

  const location = useLocation();
  const { study, planned } = useStudy();

  const isDesignActive =
    DESIGN_PATHS.includes(location.pathname) ||
    location.pathname === '/protocol-studio' ||
    location.pathname === '/protocol';
  const isAnalysisActive =
    ANALYSIS_PATHS.includes(location.pathname) ||
    location.pathname === '/report-studio-overview' ||
    location.pathname === '/report-studio/overview' ||
    location.pathname === '/report-overview';
  const isExplainersActive = location.pathname.startsWith('/explainers');
  const isEcosystemActive =
    location.pathname === '/agreekit' ||
    location.pathname === '/health-data-distributions' ||
    location.pathname === '/reference-devices' ||
    location.pathname === '/reference-device-catalog';

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (designRef.current && !designRef.current.contains(event.target as Node)) {
        setDesignOpen(false);
      }
      if (analysisRef.current && !analysisRef.current.contains(event.target as Node)) {
        setAnalysisOpen(false);
      }
      if (explainersRef.current && !explainersRef.current.contains(event.target as Node)) {
        setExplainersOpen(false);
      }
      if (ecosystemRef.current && !ecosystemRef.current.contains(event.target as Node)) {
        setEcosystemOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDesignOpen(false);
        setAnalysisOpen(false);
        setExplainersOpen(false);
        setEcosystemOpen(false);
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function closeDropdowns() {
    if (designTimer.current) clearTimeout(designTimer.current);
    if (analysisTimer.current) clearTimeout(analysisTimer.current);
    if (explainersTimer.current) clearTimeout(explainersTimer.current);
    if (ecosystemTimer.current) clearTimeout(ecosystemTimer.current);
    setDesignOpen(false);
    setAnalysisOpen(false);
    setExplainersOpen(false);
    setEcosystemOpen(false);
    setOpen(false);
  }

  // Close dropdowns on route change during render (React-recommended pattern)
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setDesignOpen(false);
    setAnalysisOpen(false);
    setExplainersOpen(false);
    setEcosystemOpen(false);
    setOpen(false);
  }

  const designRoutes = DESIGN_PATHS.map((p) => MODULE_ROUTES.find((r) => r.path === p)!);
  const analysisRoutes = ANALYSIS_PATHS.map((p) => MODULE_ROUTES.find((r) => r.path === p)!);

  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-plane/90 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <NavLink to="/" onClick={closeDropdowns} className="mr-auto flex items-center gap-2.5">
          <OpenWearableValidationLogo size={24} />
          <span className="text-base font-semibold tracking-tight text-ink">
            {BRAND_CONFIG.siteName}
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <nav aria-label="Main Navigation" className="hidden items-center gap-1.5 md:flex">
          {/* Study Design Dropdown */}
          <div
            ref={designRef}
            className="relative"
            onMouseEnter={handleDesignEnter}
            onMouseLeave={handleDesignLeave}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setDesignOpen(false);
              }
            }}
          >
            <NavLink
              to="/protocol-studio"
              onClick={closeDropdowns}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                isDesignActive
                  ? 'bg-ink/10 text-ink font-semibold'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              Protocol Studio
              <ChevronDown
                size={14}
                className={`transition-transform duration-150 ${designOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </NavLink>

            {designOpen && (
              <div className="absolute left-0 top-full pt-1.5 w-64 z-30">
                <div
                  role="menu"
                  className="rounded-xl border border-hairline bg-surface p-1.5 shadow-lg focus:outline-none"
                >
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Protocol Tools
                  </div>
                  {designRoutes.map((route) => {
                    const active = location.pathname === route.path;
                    return (
                      <NavLink
                        key={route.path}
                        to={route.path}
                        role="menuitem"
                        onClick={closeDropdowns}
                        className={`block rounded-lg px-2.5 py-2 text-xs transition-colors ${
                          active
                            ? 'bg-ink/10 text-ink font-medium'
                            : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                        }`}
                      >
                        <div className="font-medium text-ink">{route.label}</div>
                        <div className="mt-0.5 text-[11px] text-ink-muted truncate">
                          {route.method}
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Analysis & Decision Gates Dropdown */}
          <div
            ref={analysisRef}
            className="relative"
            onMouseEnter={handleAnalysisEnter}
            onMouseLeave={handleAnalysisLeave}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setAnalysisOpen(false);
              }
            }}
          >
            <NavLink
              to="/report-studio/overview"
              onClick={closeDropdowns}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                isAnalysisActive
                  ? 'bg-ink/10 text-ink font-semibold'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              Report Studio
              <ChevronDown
                size={14}
                className={`transition-transform duration-150 ${analysisOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </NavLink>

            {analysisOpen && (
              <div className="absolute left-0 top-full pt-1.5 w-64 z-30">
                <div
                  role="menu"
                  className="rounded-xl border border-hairline bg-surface p-1.5 shadow-lg focus:outline-none"
                >
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Analysis &amp; Reporting
                  </div>
                  {analysisRoutes.map((route) => {
                    const active = location.pathname === route.path;
                    return (
                      <NavLink
                        key={route.path}
                        to={route.path}
                        role="menuitem"
                        onClick={closeDropdowns}
                        className={`block rounded-lg px-2.5 py-2 text-xs transition-colors ${
                          active
                            ? 'bg-ink/10 text-ink font-medium'
                            : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                        }`}
                      >
                        <div className="font-medium text-ink">{route.label}</div>
                        <div className="mt-0.5 text-[11px] text-ink-muted truncate">
                          {route.method}
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Explainers Dropdown */}
          <div
            ref={explainersRef}
            className="relative"
            onMouseEnter={handleExplainersEnter}
            onMouseLeave={handleExplainersLeave}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setExplainersOpen(false);
              }
            }}
          >
            <NavLink
              to="/explainers"
              onClick={closeDropdowns}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                isExplainersActive
                  ? 'bg-ink/10 text-ink font-semibold'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              Pitfall Explorer
              <ChevronDown
                size={14}
                className={`transition-transform duration-150 ${explainersOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </NavLink>

            {explainersOpen && (
              <div className="absolute left-0 top-full pt-1.5 w-64 z-30">
                <div
                  role="menu"
                  className="rounded-xl border border-hairline bg-surface p-1.5 shadow-lg focus:outline-none"
                >
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Statistical Pitfalls
                  </div>
                  {EXPLAINER_ROUTES.map((route) => {
                    const active = location.pathname === route.path;
                    return (
                      <NavLink
                        key={route.path}
                        to={route.path}
                        role="menuitem"
                        onClick={closeDropdowns}
                        className={`block rounded-lg px-2.5 py-2 text-xs transition-colors ${
                          active
                            ? 'bg-ink/10 text-ink font-medium'
                            : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                        }`}
                      >
                        <div className="font-medium text-ink">{route.label}</div>
                        <div className="mt-0.5 text-[11px] text-ink-muted truncate">
                          {route.title}
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Validation Academy Link */}
          <NavLink
            to="/academy"
            className={({ isActive }) =>
              `inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                isActive
                  ? 'bg-ink/10 text-ink font-semibold'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`
            }
          >
            <span>Validation Academy</span>
            <span className="rounded-full bg-ink/10 px-1.5 py-0.5 text-[10px] font-bold text-ink">
              8 Modules
            </span>
          </NavLink>

          {/* Ecosystem Dropdown */}
          <div
            ref={ecosystemRef}
            className="relative"
            onMouseEnter={handleEcosystemEnter}
            onMouseLeave={handleEcosystemLeave}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setEcosystemOpen(false);
              }
            }}
          >
            <NavLink
              to="/agreekit"
              onClick={closeDropdowns}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                isEcosystemActive
                  ? 'bg-ink/10 text-ink font-semibold'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              Ecosystem
              <ChevronDown
                size={14}
                className={`transition-transform duration-150 ${ecosystemOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </NavLink>

            {ecosystemOpen && (
              <div className="absolute right-0 top-full pt-1.5 w-64 z-30">
                <div
                  role="menu"
                  className="rounded-xl border border-hairline bg-surface p-1.5 shadow-lg focus:outline-none"
                >
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Open-Source Ecosystem
                  </div>
                  <NavLink
                    to="/agreekit"
                    role="menuitem"
                    onClick={closeDropdowns}
                    className={`block rounded-lg px-2.5 py-2 text-xs transition-colors ${
                      location.pathname === '/agreekit'
                        ? 'bg-ink/10 text-ink font-medium'
                        : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink">agreekit (Python)</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-ink-muted truncate">
                      Exact agreement statistics &amp; MCP server
                    </div>
                  </NavLink>
                  <NavLink
                    to="/health-data-distributions"
                    role="menuitem"
                    onClick={closeDropdowns}
                    className={`block rounded-lg px-2.5 py-2 text-xs transition-colors ${
                      location.pathname === '/health-data-distributions'
                        ? 'bg-ink/10 text-ink font-medium'
                        : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink">Health Data Catalog</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-ink-muted truncate">
                      CDC NHANES &amp; SCIN population distributions
                    </div>
                  </NavLink>
                  <NavLink
                    to="/reference-device-catalog"
                    role="menuitem"
                    onClick={closeDropdowns}
                    className={`block rounded-lg px-2.5 py-2 text-xs transition-colors ${
                      location.pathname === '/reference-devices' || location.pathname === '/reference-device-catalog'
                        ? 'bg-ink/10 text-ink font-medium'
                        : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink">Reference Device Catalog</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-ink-muted truncate">
                      Clinical gold/silver standards &amp; 510(k) predicates
                    </div>
                  </NavLink>
                </div>
              </div>
            )}
          </div>

          {/* About Link */}
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                isActive
                  ? 'bg-series-1/10 text-series-1 font-semibold'
                  : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`
            }
          >
            About
          </NavLink>
        </nav>

        {/* Active Study Plan Indicator Pill (when staged in memory) */}
        {planned && study.n !== null && (
          <NavLink
            to="/precision"
            title={`Active Study Plan: ${study.n} participants (${(study.confidence * 100).toFixed(0)}% confidence). Click to view precision.`}
            className="hidden items-center gap-1.5 rounded-full border border-series-1/30 bg-series-1/10 px-2.5 py-1 text-xs font-medium text-series-1 transition-colors hover:bg-series-1/20 sm:inline-flex"
          >
            <ClipboardList size={13} aria-hidden />
            <span>Plan: <strong className="tabular font-semibold">{study.n}</strong> pts</span>
          </NavLink>
        )}

        <ThemeToggle />

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="rounded-md p-2 text-ink-secondary hover:bg-ink/5 hover:text-ink md:hidden"
        >
          {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile Navigation"
          className="max-h-[85vh] overflow-y-auto border-t border-hairline px-4 pb-4 sm:px-6 md:hidden"
        >
          {/* Active Plan Mobile Card */}
          {planned && study.n !== null && (
            <div className="mt-3 rounded-lg border border-series-1/30 bg-series-1/5 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold text-series-1">
                  <ClipboardList size={14} aria-hidden />
                  Active Study Plan
                </span>
                <span className="font-semibold text-ink">
                  {study.n} participants
                </span>
              </div>
              <div className="mt-1 text-[11px] text-ink-secondary">
                {(study.confidence * 100).toFixed(0)}% confidence
                {study.nSource ? ` • from ${study.nSource}` : ''}
              </div>
            </div>
          )}

          <div className="mt-3 space-y-4">
            {/* Protocol Studio Section */}
            <div>
              <span className="block px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Protocol Studio
              </span>
              <ul className="mt-1 flex flex-col gap-1">
                <li>
                  <NavLink
                    to="/protocol-studio"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-series-1/10 text-series-1'
                          : 'text-series-1 hover:bg-ink/5'
                      }`
                    }
                  >
                    Protocol Studio Overview &rarr;
                  </NavLink>
                </li>
                {designRoutes.map((route) => (
                  <li key={route.path}>
                    <NavLink
                      to={route.path}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-series-1/10 text-series-1 font-semibold'
                            : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                        }`
                      }
                    >
                      {route.label} — <span className="text-ink-muted font-normal">{route.method}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Report Studio Section */}
            <div>
              <span className="block px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Report Studio
              </span>
              <ul className="mt-1 flex flex-col gap-1">
                <li>
                  <NavLink
                    to="/report-studio/overview"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-series-2/10 text-series-2'
                          : 'text-series-2 hover:bg-ink/5'
                      }`
                    }
                  >
                    Report Studio Overview &rarr;
                  </NavLink>
                </li>
                {analysisRoutes.map((route) => (
                  <li key={route.path}>
                    <NavLink
                      to={route.path}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-series-2/10 text-series-2 font-semibold'
                            : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                        }`
                      }
                    >
                      {route.label} — <span className="text-ink-muted font-normal">{route.method}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pitfall Explorer Section */}
            <div>
              <span className="block px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Pitfall Explorer
              </span>
              <ul className="mt-1 flex flex-col gap-1">
                <li>
                  <NavLink
                    to="/explainers"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-series-4/10 text-series-4 font-semibold'
                          : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                      }`
                    }
                  >
                    All Explainers
                  </NavLink>
                </li>
                {EXPLAINER_ROUTES.map((route) => (
                  <li key={route.path}>
                    <NavLink
                      to={route.path}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-series-4/10 text-series-4 font-semibold'
                            : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                        }`
                      }
                    >
                      {route.label} — <span className="text-ink-muted font-normal">{route.title}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Validation Academy Section */}
            <div>
              <span className="block px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Validation Academy
              </span>
              <ul className="mt-1 flex flex-col gap-1">
                <li>
                  <NavLink
                    to="/academy"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-series-3/10 text-series-3 font-semibold'
                          : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                      }`
                    }
                  >
                    <span>Validation Academy Case Studies</span>
                    <span className="rounded-full bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                      8 Modules
                    </span>
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* About & Ecosystem Section */}
            <div className="border-t border-hairline pt-3">
              <span className="block px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                About &amp; Ecosystem
              </span>
              <ul className="mt-1 flex flex-col gap-1">
                <li>
                  <NavLink
                    to="/about"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-series-1/10 text-series-1 font-semibold'
                          : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                      }`
                    }
                  >
                    About the Platform &amp; Author
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/agreekit"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-series-7/10 text-series-7 font-semibold'
                          : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                      }`
                    }
                  >
                    <span>agreekit (Python Hub)</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/health-data-distributions"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-series-5/10 text-series-5 font-semibold'
                          : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                      }`
                    }
                  >
                    <span>Health Data Catalog Hub</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/reference-device-catalog"
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-series-1/10 text-series-1 font-semibold'
                          : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                      }`
                    }
                  >
                    <span>Reference Device Catalog</span>
                  </NavLink>
                </li>
                <li>
                  <a
                    href="https://ross-wilkinson.github.io/health-data-distributions/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-secondary hover:bg-ink/5 hover:text-ink"
                  >
                    <span>Health Data Distributions</span>
                    <ExternalLink size={12} className="text-ink-muted" aria-hidden />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/ross-wilkinson/agreekit"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-secondary hover:bg-ink/5 hover:text-ink"
                  >
                    <span>agreekit (Python)</span>
                    <ExternalLink size={12} className="text-ink-muted" aria-hidden />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
