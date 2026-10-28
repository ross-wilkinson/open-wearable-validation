import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  DollarSign,
  ExternalLink,
  Layers,
  Scale,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import NextSteps from '../app/study/NextSteps.tsx';
import { FEATURE_DOMAINS } from '../content/referenceDevices/catalog.ts';
import { getDevicesForDomain } from '../modules/referenceDevices/referenceDevicesModel.ts';

const TEN_DIMENSIONS = [
  {
    num: '01',
    title: 'Regulatory & Predicate',
    desc: 'FDA 510(k), PMA, De Novo clearance pathways, product codes, and cited predicates.',
    icon: ShieldCheck,
  },
  {
    num: '02',
    title: 'Clearance Accuracy',
    desc: 'Reported Arms, RMSE, and 95% limits of agreement from pivotal validation submissions.',
    icon: Scale,
  },
  {
    num: '03',
    title: 'Data Pipeline & Files',
    desc: 'Raw sensor export methods (CSV, EDF, Parquet), batch CLI tools, and cloud paywalls.',
    icon: Database,
  },
  {
    num: '04',
    title: 'Multi-Stream Sync',
    desc: 'Hardware TTL/BNC sync triggers, native sampling rates, and oscillator clock drift (ppm).',
    icon: Zap,
  },
  {
    num: '05',
    title: 'Hardware CapEx',
    desc: 'Upfront capital expense, lab lease terms, and recurring software licensing fees.',
    icon: DollarSign,
  },
  {
    num: '06',
    title: 'Subject Consumables',
    desc: 'Per-subject single-use electrodes, disposable sensors, reagent kits, and shelf-life alerts.',
    icon: DollarSign,
  },
  {
    num: '07',
    title: 'Calibration Cadence',
    desc: 'Factory recalibration intervals, on-site optical checks, and factory RMA turnarounds.',
    icon: Cpu,
  },
  {
    num: '08',
    title: 'Vendor Clinical SLA',
    desc: 'Support team headquarters, active timezones, and clinical trial response SLAs.',
    icon: CheckCircle2,
  },
  {
    num: '09',
    title: 'Field Gotchas & Traps',
    desc: 'Hard-won lessons from live studies: optical DC leaks, cold extremities, and motion artifacts.',
    icon: AlertTriangle,
  },
  {
    num: '10',
    title: 'Noise Floor (σ_REF)',
    desc: 'Empirical measurement error standard deviation and resulting study sample size penalty.',
    icon: Layers,
  },
];

export default function ReferenceDeviceCatalogLandingPage() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'priority'>('all');

  const displayedDomains = FEATURE_DOMAINS.filter((d) =>
    selectedFilter === 'priority' ? d.isPriorityTop5 : true,
  );

  return (
    <div className="flex flex-col gap-10 sm:gap-14 py-2 sm:py-4">
      {/* Hero Section */}
      <section className="rounded-3xl border border-hairline bg-surface p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col gap-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-hairline bg-plane px-3.5 py-1 text-xs font-semibold text-series-1 shadow-2xs">
            <Sparkles size={13} aria-hidden />
            <span>Open-Source Biometric Reference Ecosystem</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl leading-tight">
            Clinical Reference Device Catalog for Wearable Biometrics
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-ink-secondary max-w-3xl">
            Selecting a reference standard is not a mere logistics detail — it defines your FDA 510(k)
            predicate chain, raw data pipeline friction, hardware synchronization architecture,
            consumables budget, and sample size inflation.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/reference-devices"
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-xs sm:text-sm font-semibold text-plane shadow-sm transition-opacity hover:opacity-90"
            >
              <span>Launch Interactive Selector Workbench</span>
              <ArrowRight size={15} />
            </Link>

            <a
              href="https://github.com/ross-wilkinson/reference-device-catalog"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-plane px-4 py-3 text-xs sm:text-sm font-semibold text-ink transition-colors hover:bg-ink/5"
            >
              <span>GitHub Specification Schema</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* 4 Stat Badges */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-hairline sm:grid-cols-4 text-xs">
          <div className="rounded-xl border border-hairline bg-plane p-3 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Coverage</span>
            <div className="font-mono text-base font-extrabold text-ink">12 Domains</div>
            <p className="text-[11px] text-ink-muted">Vital signs, sleep, gait &amp; metabolism</p>
          </div>
          <div className="rounded-xl border border-hairline bg-plane p-3 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Standards</span>
            <div className="font-mono text-base font-extrabold text-amber-600">3 Tiers</div>
            <p className="text-[11px] text-ink-muted">Gold, Silver &amp; Bronze taxonomy</p>
          </div>
          <div className="rounded-xl border border-hairline bg-plane p-3 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Framework</span>
            <div className="font-mono text-base font-extrabold text-series-1">10 Dimensions</div>
            <p className="text-[11px] text-ink-muted">Regulatory, pipeline, sync &amp; budget</p>
          </div>
          <div className="rounded-xl border border-hairline bg-plane p-3 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Privacy</span>
            <div className="font-mono text-base font-extrabold text-emerald-600">Zero Egress</div>
            <p className="text-[11px] text-ink-muted">100% in-browser client execution</p>
          </div>
        </div>
      </section>

      {/* 3-Tier Hierarchy Explanation */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-ink">The 3-Tier Reference Standard Hierarchy</h2>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Understanding when to use each tier prevents study under-powering and regulatory clearance roadblocks.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-amber-500/30 bg-surface p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                Gold Standard
              </span>
              <span className="font-mono text-xs font-bold text-ink-muted">σ_REF ≈ 0</span>
            </div>
            <h3 className="text-base font-bold text-ink">Clinical Criterion</h3>
            <p className="text-xs leading-relaxed text-ink-secondary">
              Direct invasive measurements or laboratory criterion instruments (e.g. ABL90 CO-oximetry blood gas,
              12-lead telemetry ECG, Level 1 in-lab Polysomnography). Essential for pivotal FDA submissions and
              non-inferiority claims.
            </p>
            <div className="text-[11px] font-medium text-amber-800 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
              ✓ Zero reference noise penalty; maximum regulatory credibility; highest operational CapEx.
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-surface p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                Silver Standard
              </span>
              <span className="font-mono text-xs font-bold text-ink-muted">σ_REF &gt; 0</span>
            </div>
            <h3 className="text-base font-bold text-ink">Clinical Research Benchmark</h3>
            <p className="text-xs leading-relaxed text-ink-secondary">
              Continuous hospital-grade monitors or ambulatory research instruments (e.g. Masimo Radical-7,
              Cosmed K5, Biopac MP160). Enables real-world testing and dynamic exercise protocols outside ICUs.
            </p>
            <div className="text-[11px] font-medium text-blue-800 bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">
              ⚠️ Introduces reference noise floor; requires inflating target sample size n to protect power.
            </div>
          </div>

          <div className="rounded-2xl border border-orange-500/30 bg-surface p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-orange-700">
                Bronze Standard
              </span>
              <span className="font-mono text-xs font-bold text-ink-muted">High Noise Floor</span>
            </div>
            <h3 className="text-base font-bold text-ink">Consumer &amp; Field Surrogate</h3>
            <p className="text-xs leading-relaxed text-ink-secondary">
              Commercial smartwatches and chest straps (e.g. Apple Watch, WHOOP, Polar H10). High convenience
              and zero subject burden, but subject to proprietary firmware drift and black-box algorithms.
            </p>
            <div className="text-[11px] font-medium text-orange-800 bg-orange-500/5 p-2 rounded-lg border border-orange-500/10">
              ❌ Unacceptable for FDA pivotal claims; ideal for early pilot screening and exploratory studies.
            </div>
          </div>
        </div>
      </section>

      {/* 10-Dimension Evaluation Framework Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-ink">The 10-Dimension Reference Dossier Framework</h2>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Every device in our catalog is profiled across 10 mission-critical engineering and regulatory dimensions:
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-xs">
          {TEN_DIMENSIONS.map((dim) => {
            const Icon = dim.icon;
            return (
              <div
                key={dim.num}
                className="rounded-2xl border border-hairline bg-surface p-4 space-y-2 hover:border-series-1/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-series-1">{dim.num}</span>
                  <Icon size={15} className="text-ink-muted" />
                </div>
                <h3 className="font-bold text-ink">{dim.title}</h3>
                <p className="text-[11px] leading-relaxed text-ink-secondary">{dim.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Domains Catalog Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink">Biometric Feature Domains</h2>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1">
              Select a domain to inspect candidate reference standards, predicate chains, and noise sizers:
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-hairline bg-plane p-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-surface font-bold text-ink shadow-2xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              All 12 Domains
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('priority')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
                selectedFilter === 'priority'
                  ? 'bg-surface font-bold text-series-1 shadow-2xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Priority Core 5
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedDomains.map((domain) => {
            const devices = getDevicesForDomain(domain.id);
            const gold = devices.find((d) => d.tier === 'gold');
            const silver = devices.find((d) => d.tier === 'silver');

            return (
              <Link
                key={domain.id}
                to={`/reference-devices?domain=${domain.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-hairline bg-surface p-5 shadow-2xs transition-all hover:border-series-1/40 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-series-1"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      {domain.primaryUnit}
                    </span>
                    {domain.isPriorityTop5 && (
                      <span className="rounded-md bg-series-1/10 px-1.5 py-0.5 text-[9px] font-bold text-series-1 uppercase">
                        Core 5
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-ink group-hover:text-series-1 transition-colors">
                      {domain.name}
                    </h3>
                    <p className="text-xs text-ink-secondary mt-1 leading-relaxed line-clamp-2">
                      {domain.description}
                    </p>
                  </div>

                  {/* Standards Summary */}
                  <div className="border-t border-hairline pt-2.5 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-700 font-semibold">Gold Standard:</span>
                      <span className="font-medium text-ink truncate max-w-[150px]">
                        {gold?.name ?? 'Clinical Criterion'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700 font-semibold">Silver Benchmark:</span>
                      <span className="font-medium text-ink truncate max-w-[150px]">
                        {silver?.name ?? 'Research Telemetry'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-hairline pt-3 flex items-center justify-between text-xs font-semibold text-series-1">
                  <span>Explore Standards</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Noise Inflation Equation Banner */}
      <section className="rounded-2xl border border-hairline bg-plane p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Scale size={18} className="text-series-1" />
          <h2 className="text-sm sm:text-base font-bold text-ink">
            Statistical Consequence: Reference Noise Variance Inflation
          </h2>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-ink-secondary max-w-3xl">
          When assessing limits of agreement (Bland &amp; Altman 1999), total paired difference variance
          is the sum of device error variance and reference error variance:{' '}
          <strong className="text-ink">σ²_diff = σ²_DUT + σ²_REF</strong>. Sizing your clinical trial
          assuming an error-free gold standard while collecting against an ambulatory silver comparator
          underpowers your limits-of-agreement precision by:
        </p>

        <div className="rounded-xl border border-hairline bg-surface p-4 font-mono text-xs sm:text-sm text-center">
          n_adjusted = n_gold × [ 1 + (σ_REF / σ_DUT)² ]
        </div>

        <div className="text-xs text-ink-secondary">
          Our interactive selector calculates this penalty automatically for every candidate comparator and propagates
          the adjusted <span className="font-mono font-semibold text-ink">n</span> directly into Protocol Studio.
        </div>
      </section>

      {/* Next Steps Bridges */}
      <NextSteps
        steps={[
          {
            to: '/reference-devices',
            title: 'Interactive Reference Selector Workbench',
            description:
              'Evaluate candidates side-by-side, simulate reference noise inflation, and inspect 10-dimension dossiers.',
          },
          {
            to: '/agreement',
            title: 'Sample Size for Agreement',
            description:
              'Apply your reference-inflated σ_diff to compute defensible Bland-Altman limits-of-agreement confidence intervals.',
          },
          {
            to: '/health-data-distributions',
            title: 'Health Data Distributions Hub',
            description:
              'Ground your protocol in real-world CDC NHANES and SCIN population physiological priors.',
          },
        ]}
      />
    </div>
  );
}
