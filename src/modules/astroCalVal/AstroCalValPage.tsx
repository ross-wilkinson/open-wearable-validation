import { useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { seriesColor } from '../../styles/chartTheme.ts';
import { KPI_ROW_DEFINITIONS } from './sadlerMath.ts';
import {
  SHOWCASE,
  type ActivePipeline,
  type PipelineKey,
  type UAxisMode,
} from './showcaseData.ts';
import Tab1Coverage from './Tab1Coverage.tsx';
import Tab2Agreement from './Tab2Agreement.tsx';
import Tab3Ecdf from './Tab3Ecdf.tsx';
import Tab4TimeSeries from './Tab4TimeSeries.tsx';

type TabKey = 'coverage' | 'agreement' | 'ecdf' | 'time';

const COLOR_A = seriesColor(2); // Orange — Pipeline A (Legacy Template Fitting)
const COLOR_B = seriesColor(1); // Blue   — Pipeline B (Deep Learning Hybrid)

interface TabSpec {
  key: TabKey;
  index: string;
  label: string;
  question: string;
}

const TABS: TabSpec[] = [
  {
    key: 'coverage',
    index: '1',
    label: 'Coverage & Floor Clipping',
    question: 'Does the pipeline return valid outputs across brightness, or clip at the zero-redshift floor?',
  },
  {
    key: 'agreement',
    index: '2',
    label: 'Correlation & Curved Agreement',
    question: 'How wide are the 95% Limits of Agreement as redshift grows, and what is the smallest detectable shift?',
  },
  {
    key: 'ecdf',
    index: '3',
    label: 'Cumulative Error (ECDF)',
    question: 'What percentage of pooled observations and individual targets fall within the accuracy standard?',
  },
  {
    key: 'time',
    index: '4',
    label: 'Error Over Time',
    question: 'Does accuracy degrade during twilight & high-airmass transients or across repeated visits?',
  },
];

const PERSPECTIVES: Array<{
  key: ActivePipeline;
  title: string;
  shortLabel: string;
  subtitle: string;
  color: string;
  badgeText: string;
}> = [
  {
    key: 'a',
    title: 'Pipeline A vs. Reference',
    shortLabel: 'Pipeline A vs. Ref',
    subtitle: 'Legacy Template Fitting evaluated against Spectroscopic Reference (z_spec)',
    color: COLOR_A,
    badgeText: '1 of 6 Gates Passed',
  },
  {
    key: 'b',
    title: 'Pipeline B vs. Reference',
    shortLabel: 'Pipeline B vs. Ref',
    subtitle: 'Deep Learning Hybrid evaluated against Spectroscopic Reference (z_spec)',
    color: COLOR_B,
    badgeText: '6 of 6 Gates Passed',
  },
  {
    key: 'h2h',
    title: 'Head-to-Head (A vs. B)',
    shortLabel: 'Head-to-Head (A vs. B)',
    subtitle: 'Direct paired superiority, Cliff’s Delta dominance, and win/tie/loss split',
    color: '#0f172a',
    badgeText: 'Pipeline B Superior',
  },
];

export function AstroCalValPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>('agreement');
  const [activePipeline, setActivePipeline] = useState<ActivePipeline>('b');
  const [uAxisMode, setUAxisMode] = useState<UAxisMode>('reference');

  const { metadata, pipelines, comparison, coverage, agreement, kpi, ecdf, time } = SHOWCASE;
  const isH2H = activePipeline === 'h2h';
  const primaryKey: PipelineKey = activePipeline === 'b' ? 'b' : 'a';
  const primarySummary = pipelines[primaryKey];
  const primaryKpi = kpi[primaryKey];
  const primaryColor = primaryKey === 'a' ? COLOR_A : COLOR_B;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      {/* Top Breadcrumb & Companion Guides Bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link to="/academy" className="hover:text-slate-900">
              Validation Academy
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900">
              Three-Way Photometric Redshift Validation Report
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/academy/astro-calval/study-protocol"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <span>What Is This Study? Protocol &amp; Glossary</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/academy/astro-calval/primers/variance-function"
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              <span>Methodological Primers (6 Topics)</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Header & Test Details Block */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                <span>Three-Way Validation Benchmark (Reference vs. Pipeline A vs. Pipeline B)</span>
              </div>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Rubin Commissioning Photometric Redshift Validation Report
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Evaluates <strong>Pipeline A (Legacy Template Fitting)</strong> and{' '}
                <strong>Pipeline B (Deep Learning Hybrid)</strong> against high-precision{' '}
                <strong>Spectroscopic Reference Redshift (z_spec)</strong> across{' '}
                <span className="font-mono font-semibold text-slate-800">
                  {metadata.n_galaxies}
                </span>{' '}
                commissioned galaxy targets and{' '}
                <span className="font-mono font-semibold text-slate-800">
                  {metadata.n_exposures.toLocaleString()}
                </span>{' '}
                repeated imaging exposures.
              </p>
            </div>

            {/* Test Details & Study Configuration Card */}
            <div className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-4 lg:w-[430px]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Test Details &amp; Study Configuration
                </span>
                <Link
                  to="/academy/astro-calval/study-protocol"
                  className="text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  Full Study Protocol →
                </Link>
              </div>
              <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <dt className="text-[11px] text-slate-500">Gold-Standard Reference</dt>
                  <dd className="font-semibold text-slate-900">Spectroscopic z_spec</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500">Sample Size</dt>
                  <dd className="font-mono font-semibold text-slate-900">
                    {metadata.n_galaxies} targets · {metadata.n_exposures.toLocaleString()} visits
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500">Normalized Residual</dt>
                  <dd className="font-mono font-semibold text-slate-900">
                    Δz / (1 + z_spec)
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500">Science Gates (Typical / Edge)</dt>
                  <dd className="font-mono font-semibold text-slate-900">
                    ≤ {kpi.typical_standard.toFixed(3)} / ≤ {kpi.edge_standard.toFixed(3)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Tier 1 Navigation: Clean 3-Card Analysis Perspective Selector */}
          <div className="mt-7">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Choose Validation Perspective
              </span>
              <span className="text-xs text-slate-500">
                Controls both the KPI Summary Scorecard and all 4 Diagnostic Sections below
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {PERSPECTIVES.map((item) => {
                const selected = activePipeline === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActivePipeline(item.key)}
                    className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                      selected
                        ? 'border-slate-900 bg-white shadow-sm ring-2 ring-slate-900/10'
                        : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-bold text-slate-900">{item.title}</span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          selected
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-200/80 text-slate-700'
                        }`}
                      >
                        {item.badgeText}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      {item.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Part I: Executive KPI Summary Scorecard */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {!isH2H ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Executive KPI Summary · {primarySummary.label} vs. Spectroscopic Reference
                  </span>
                </div>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Two-Tier Validation Scorecard ({primaryKpi.rows.filter((r) => r.passed).length} of{' '}
                  {primaryKpi.rows.length} Accuracy Standards Passed)
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs">
                  <span className="text-slate-500">Robust Scatter (σ_NMAD): </span>
                  <span className="font-mono font-bold text-slate-900">
                    {primarySummary.sigma_nmad.toFixed(4)}
                  </span>
                  <span className="ml-2 text-slate-400">
                    (Req ≤ {kpi.srd_sigma_requirement.toFixed(3)})
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs">
                  <span className="text-slate-500">Catastrophic Outliers: </span>
                  <span className="font-mono font-bold text-slate-900">
                    {(primarySummary.outlier_fraction * 100).toFixed(1)}%
                  </span>
                </div>
                <span
                  className={`rounded-xl px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider ${
                    primaryKpi.passed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {primaryKpi.passed ? 'Overall Verdict: PASS' : 'Overall Verdict: FAIL'}
                </span>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="px-3 py-2.5">KPI Metric</th>
                    <th className="px-3 py-2.5">Definition</th>
                    <th className="px-3 py-2.5">Estimate</th>
                    <th className="px-3 py-2.5">95% CI</th>
                    <th className="px-3 py-2.5">Standard</th>
                    <th className="px-3 py-2.5">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {primaryKpi.rows.map((row) => (
                    <tr key={row.key}>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">
                        {row.label}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {KPI_ROW_DEFINITIONS[row.key] ?? ''}
                      </td>
                      <td className="px-3 py-2.5 font-mono font-bold text-slate-900">
                        {row.estimate.toFixed(4)}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-600">
                        [{row.ci_lower.toFixed(4)}, {row.ci_upper.toFixed(4)}]
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-700">
                        ≤ {row.standard.toFixed(4)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            row.passed
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {row.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Head-to-Head Scorecard */
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Direct Head-to-Head Comparison · Pipeline A vs. Pipeline B
                </span>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Head-to-Head Practical Equivalence &amp; Dominance Scorecard
                </h2>
              </div>
              <span className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider text-white">
                {kpi.head_to_head.verdict}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-xs font-bold text-slate-700">
                  Practical Equivalence &amp; Dominance Test
                </div>
                <div className="mt-1 font-mono text-xl font-extrabold text-slate-900">
                  Cliff&apos;s δ = {kpi.head_to_head.delta >= 0 ? '+' : ''}
                  {kpi.head_to_head.delta.toFixed(3)} ({kpi.head_to_head.dominance})
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  95% CI [{kpi.head_to_head.ci[0].toFixed(3)}, {kpi.head_to_head.ci[1].toFixed(3)}] · Tie Margin ±{kpi.head_to_head.margin.toFixed(3)}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-xs font-bold text-slate-700">
                  Robust Scatter Reduction (σ_NMAD)
                </div>
                <div className="mt-1 font-mono text-xl font-extrabold text-emerald-700">
                  {pipelines.a.sigma_nmad.toFixed(4)} → {pipelines.b.sigma_nmad.toFixed(4)}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {(((pipelines.a.sigma_nmad - pipelines.b.sigma_nmad) / pipelines.a.sigma_nmad) * 100).toFixed(1)}% tighter core dispersion in Pipeline B
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-xs font-bold text-slate-700">
                  Catastrophic Outlier Reduction
                </div>
                <div className="mt-1 font-mono text-xl font-extrabold text-emerald-700">
                  {(pipelines.a.outlier_fraction * 100).toFixed(1)}% →{' '}
                  {(pipelines.b.outlier_fraction * 100).toFixed(1)}%
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  3.2× reduction in severe redshift failures (|Δz|/(1+z) &gt; 0.15)
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Part II: Sticky Diagnostic Section Navigation + Active Tab Viewport */}
      <div className="mt-8">
        {/* Clean Sticky Navigation Bar (Matches HomePage/AcademyPage Visual Standard) */}
        <div className="sticky top-0 z-30 border-y border-slate-200 bg-white/95 shadow-xs backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            {/* Left: Diagnostic Tabs 1 to 4 */}
            <nav aria-label="Diagnostic Analysis Sections" className="flex flex-wrap items-center gap-1.5">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.index}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Clean Active Perspective Status Badge */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">
                Active Perspective:
              </span>
              {(() => {
                const activeMeta =
                  PERSPECTIVES.find((p) => p.key === activePipeline) ?? PERSPECTIVES[0]!;
                return (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: activeMeta.color }}
                    />
                    <span>{activeMeta.shortLabel}</span>
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Active Diagnostic Tab Viewport */}
        <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          {activeTab === 'coverage' && (
            <Tab1Coverage coverage={coverage} activePipeline={activePipeline} />
          )}
          {activeTab === 'agreement' && (
            <Tab2Agreement
              agreement={agreement}
              pipelines={pipelines}
              activePipeline={activePipeline}
              uAxisMode={uAxisMode}
              onUAxisModeChange={setUAxisMode}
            />
          )}
          {activeTab === 'ecdf' && (
            <Tab3Ecdf
              ecdf={ecdf}
              kpi={kpi}
              comparison={comparison}
              activePipeline={activePipeline}
            />
          )}
          {activeTab === 'time' && (
            <Tab4TimeSeries
              time={time}
              kpi={kpi}
              activePipeline={activePipeline}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default AstroCalValPage;
