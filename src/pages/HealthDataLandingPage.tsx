import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Database,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import NextSteps from '../app/study/NextSteps.tsx';

interface ReferenceMetric {
  id: string;
  name: string;
  unit: string;
  source: string;
  cohort: string;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
  mean: number;
  sd: number;
  protocolImplication: string;
}

const REFERENCE_METRICS: ReferenceMetric[] = [
  {
    id: 'resting-hr',
    name: 'Resting Heart Rate (Adults 18–65)',
    unit: 'bpm',
    source: 'CDC NHANES 2017–2020 Continuous',
    cohort: 'N = 8,420 non-institutionalized U.S. adults',
    p5: 54,
    p25: 64,
    p50: 71,
    p75: 79,
    p95: 93,
    mean: 72.1,
    sd: 11.8,
    protocolImplication:
      'Provides expected biological between-subject variation (s_b ≈ 11.8 bpm) when sizing resting HR algorithms and baseline stability screens.',
  },
  {
    id: 'spo2-normative',
    name: 'Normative Ambulatory Pulse Oximetry (SpO2)',
    unit: '%',
    source: 'CDC NHANES Clinical Exam Oximetry',
    cohort: 'N = 6,290 seated room-air evaluations',
    p5: 95.0,
    p25: 97.0,
    p50: 98.0,
    p75: 99.0,
    p95: 100.0,
    mean: 97.8,
    sd: 1.4,
    protocolImplication:
      'Highlights the severe ceiling effect in healthy room-air cohorts (mean 97.8%). Proves why passing room-air SpO2 trials is trivial by chance and mandates controlled desaturation protocols.',
  },
  {
    id: 'monk-melanin',
    name: 'Optical Melanin Reflectance (530nm vs 660nm)',
    unit: 'Reflectance Index',
    source: 'SCIN (Skin Condition Image Network) Optical Ground Truth',
    cohort: 'N = 3,140 stratified across MST 01 through MST 10',
    p5: 0.12,
    p25: 0.28,
    p50: 0.52,
    p75: 0.74,
    p95: 0.91,
    mean: 0.51,
    sd: 0.23,
    protocolImplication:
      'Quantifies exponential photon absorption in MST 08–10, establishing required LED drive current overhead in Texas Instruments AFE4404 sensor stacks.',
  },
];

export default function HealthDataLandingPage() {
  const [selectedMetricId, setSelectedMetricId] = useState<string>('resting-hr');
  const metric =
    REFERENCE_METRICS.find((m) => m.id === selectedMetricId) ?? REFERENCE_METRICS[0]!;

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* Hero Banner */}
      <section className="rounded-3xl border border-hairline bg-surface p-6 sm:p-9 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-ink/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-ink">
                HEALTH DATA CATALOG
              </span>
              <span className="text-xs text-ink-muted">Empirical Physiological Baselines</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Health Data Catalog: Grounding Studies in Real Populations
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-ink-secondary">
              Designing a valid clinical trial or benchmark requires knowing how physiological signals
              naturally distribute across real human populations. <strong>Health Data Catalog</strong>{' '}
              provides clean, stratified reference percentiles and variance estimates derived from
              large-scale public cohorts (CDC NHANES and SCIN) across age brackets, sex, and the Monk Skin Tone Scale.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://ross-wilkinson.github.io/health-data-distributions/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-plane shadow-sm transition-opacity hover:opacity-90"
              >
                <span>Launch Live Distributions Tool</span>
                <ExternalLink size={14} />
              </a>
              <Link
                to="/protocol-studio"
                className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-plane px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-ink/5"
              >
                <ArrowRight size={14} />
                <span>Apply to Protocol Studio</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-hairline bg-plane p-6 lg:w-72 shrink-0 space-y-2">
            <span className="rounded-full bg-ink/10 px-3 py-1 font-mono text-xs font-bold text-ink">
              CDC NHANES • SCIN
            </span>
            <div className="text-center space-y-1">
              <div className="text-xs font-semibold text-ink">Zero-Egress Static CDN</div>
              <p className="text-[11px] text-ink-muted">Static JSON API &amp; Partitioned Parquet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-hairline bg-surface p-5 space-y-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-series-5/10 text-series-5">
            <Database size={18} />
          </div>
          <h3 className="text-sm font-bold text-ink">Static API + Parquet Exports</h3>
          <p className="text-xs leading-relaxed text-ink-secondary">
            Hosted statically via GitHub Pages and CDN. Query quantiles via simple fetch calls or download
            pre-partitioned columnar Parquet files for offline Python and R notebook exploration.
          </p>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-5 space-y-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-series-1/10 text-series-1">
            <Users size={18} />
          </div>
          <h3 className="text-sm font-bold text-ink">Monk Skin Tone Stratification</h3>
          <p className="text-xs leading-relaxed text-ink-secondary">
            Stratified across Google&apos;s 10-point Monk Skin Tone Scale (MST 01–10) and Fitzpatrick skin types,
            providing realistic variance baselines across protected demographic groups.
          </p>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-5 space-y-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-series-2/10 text-series-2">
            <TrendingUp size={18} />
          </div>
          <h3 className="text-sm font-bold text-ink">Quantiles Over Simple Means</h3>
          <p className="text-xs leading-relaxed text-ink-secondary">
            Physiological distributions are frequently skewed and heavy-tailed. Reports empirical percentiles
            (P5, P25, P50, P75, P95) rather than relying on flawed normal distribution assumptions.
          </p>
        </div>
      </section>

      {/* Interactive Reference Preview */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Cohort Reference Explorer Preview
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Inspect empirical distribution percentiles for study design:
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
            {REFERENCE_METRICS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMetricId(m.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedMetricId === m.id
                    ? 'bg-ink text-plane shadow-xs'
                    : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
                }`}
              >
                {m.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink text-base">{metric.name}</span>
                <span className="rounded bg-series-5/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-series-5">
                  Unit: {metric.unit}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                {metric.source} • {metric.cohort}
              </p>
            </div>
          </div>

          {/* Quantile Pill Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div className="rounded-xl border border-hairline bg-plane p-3 text-center">
              <span className="text-[10px] font-bold text-ink-muted uppercase">P5 (Lower Bound)</span>
              <p className="mt-1 text-xl font-extrabold text-ink tabular">{metric.p5} {metric.unit}</p>
            </div>
            <div className="rounded-xl border border-hairline bg-plane p-3 text-center">
              <span className="text-[10px] font-bold text-ink-muted uppercase">P25 (Q1)</span>
              <p className="mt-1 text-xl font-bold text-ink tabular">{metric.p25} {metric.unit}</p>
            </div>
            <div className="rounded-xl border border-series-5/30 bg-series-5/5 p-3 text-center">
              <span className="text-[10px] font-bold text-series-5 uppercase">P50 (Median)</span>
              <p className="mt-1 text-xl font-extrabold text-ink tabular">{metric.p50} {metric.unit}</p>
            </div>
            <div className="rounded-xl border border-hairline bg-plane p-3 text-center">
              <span className="text-[10px] font-bold text-ink-muted uppercase">P75 (Q3)</span>
              <p className="mt-1 text-xl font-bold text-ink tabular">{metric.p75} {metric.unit}</p>
            </div>
            <div className="rounded-xl border border-hairline bg-plane p-3 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-ink-muted uppercase">P95 (Upper Bound)</span>
              <p className="mt-1 text-xl font-extrabold text-ink tabular">{metric.p95} {metric.unit}</p>
            </div>
          </div>

          <div className="rounded-xl border border-hairline bg-plane p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <Sparkles size={14} className="text-series-5" />
              <span>Protocol Design Implication:</span>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed">{metric.protocolImplication}</p>
          </div>
        </div>
      </section>

      <NextSteps
        steps={[
          {
            to: '/demographics',
            title: 'Protocol Studio: Demographic Quotas',
            description:
              'Use real population distributions to set floor and ceiling quotas per segment.',
          },
          {
            to: '/chance-kpi',
            title: 'Pitfall Explorer: Pass by Chance?',
            description:
              'See how narrow population distributions in healthy subjects create false-pass KPI hazards.',
          },
        ]}
      />
    </div>
  );
}
