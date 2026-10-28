import { useState } from 'react';
import { ArrowRight, CheckCircle2, DollarSign, Layers, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface HardwareTier {
  level: number;
  name: string;
  badge: string;
  hardwareChanges: string[];
  couplingMechanism: string;
  requiredValidation: string;
  sampleSizeRange: string;
  typicalBudget: string;
  statisticalRule: string;
  routeLink: string;
  routeLabel: string;
}

export const HARDWARE_TIERS: HardwareTier[] = [
  {
    level: 0,
    name: 'Pure Firmware / DSP Update',
    badge: 'Tier 0',
    hardwareChanges: [
      'Optical motion-filter coefficient tuning',
      'Activity classifier heuristic threshold adjust',
      'MCU C-code refactor for battery optimization',
    ],
    couplingMechanism:
      'Identical physical sensor, unchanged optical path length, zero mechanical variation.',
    requiredValidation:
      'Paired Data Non-Inferiority re-run on recorded historical raw optical signals (ρ ≥ 0.95).',
    sampleSizeRange: 'N = 10 – 15 subjects',
    typicalBudget: '$15,000 – $25,000',
    statisticalRule:
      'Paired variance reduction dividend: σ²_pair = 2σ²(1 - ρ). Cuts required sample size by >90% compared to independent testing.',
    routeLink: '/agreement',
    routeLabel: 'Size Paired Non-Inferiority',
  },
  {
    level: 1,
    name: 'Mechanical & Ergonomics Revision',
    badge: 'Tier 1',
    hardwareChanges: [
      'Wristband material swap (silicone to woven nylon)',
      'Chassis mass shift (±5 grams)',
      'Buckle geometry and retention spring tension',
    ],
    couplingMechanism:
      'Altered skin-sensor contact pressure, increased micro-gap optical light leak during high acceleration.',
    requiredValidation:
      'Motion Provocation Dual-Wrist Trial across running, cycling, and HIIT with opposite-wrist controls.',
    sampleSizeRange: 'N = 20 – 30 subjects',
    typicalBudget: '$40,000 – $60,000',
    statisticalRule:
      "Dual-wrist paired design with Cliff's Delta dominance or paired LoA with within-subject clustering.",
    routeLink: '/repeated-measures',
    routeLabel: 'Plan Repeated Measures',
  },
  {
    level: 2,
    name: 'Optical Stack Revision',
    badge: 'Tier 2',
    hardwareChanges: [
      'Photodiode active area or positioning',
      'LED center wavelength shift (525nm vs 535nm)',
      'Cover-glass sapphire curvature and anti-reflective coating',
    ],
    couplingMechanism:
      'Changes optical path length, melanin attenuation curves, and optical cross-talk. Nullifies historical priors.',
    requiredValidation:
      'Full Multi-Demographic Clinical Agreement Trial vs Gold Standard (ECG / CO-Oximeter).',
    sampleSizeRange: 'N = 40 – 60 subjects',
    typicalBudget: '$100,000 – $150,000',
    statisticalRule:
      'Regulatory Standard: Forces α₀ = 0 power prior discount. Requires strict Monk Skin Tone quota caps to ensure dark melanin statistical power.',
    routeLink: '/demographics',
    routeLabel: 'Set Demographic Quotas',
  },
  {
    level: 3,
    name: 'New Sensor Modality / Subsystem',
    badge: 'Tier 3',
    hardwareChanges: [
      'Adding titanium ECG electrodes or bio-impedance',
      'Multi-spectral spectrophotometry array',
      'New analog front-end (AFE) ASIC architecture',
    ],
    couplingMechanism:
      'Completely novel physical signal morphology with independent artifact generation and drift modes.',
    requiredValidation:
      'De Novo Clinical Trial satisfying FDA 510(k) Special Controls and ISO 80601-2-61 regulatory standards.',
    sampleSizeRange: 'N = 80 – 120+ subjects',
    typicalBudget: '$200,000 – $350,000+',
    statisticalRule:
      'Two-Gate 4-Quadrant commercial launch governance. Both Gate 1 (clinical tolerance) and Gate 2 (predecessor parity) must pass.',
    routeLink: '/report-studio',
    routeLabel: 'Open 4-Quadrant Visualizer',
  },
];

export function HardwareChangeMatrix() {
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const tier = HARDWARE_TIERS[selectedTier] ?? HARDWARE_TIERS[0]!;

  return (
    <div className="rounded-2xl border border-hairline bg-surface p-6 shadow-sm space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-series-1/10 px-2.5 py-0.5 text-xs font-semibold text-series-1">
            <Sparkles size={13} /> Hardware Change Impact Taxonomy
          </div>
          <h3 className="mt-2 text-lg font-semibold text-ink">
            Validation Tier Decision Matrix
          </h3>
          <p className="text-xs text-ink-secondary">
            Map physical modifications directly to required sample size, clinical budget, and statistical protocols.
          </p>
        </div>

        {/* Tier Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {HARDWARE_TIERS.map((t) => (
            <button
              key={t.level}
              type="button"
              onClick={() => setSelectedTier(t.level)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedTier === t.level
                  ? 'bg-ink text-plane shadow-sm'
                  : 'border border-hairline text-ink-secondary hover:bg-ink/5 hover:text-ink'
              }`}
            >
              {t.badge}
            </button>
          ))}
        </div>
      </div>

      {/* Active Tier Spotlight Card */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-ink">
              {tier.badge}: {tier.name}
            </h4>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {tier.sampleSizeRange}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Triggering Engineering Changes
            </span>
            <ul className="space-y-1.5">
              {tier.hardwareChanges.map((change, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-ink-secondary">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-series-1" />
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-hairline bg-plane/60 p-3.5 space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Physical Coupling Mechanism
            </span>
            <p className="text-xs text-ink-secondary leading-relaxed">
              {tier.couplingMechanism}
            </p>
          </div>

          <div className="rounded-xl border border-series-1/30 bg-series-1/5 p-3.5 space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-series-1">
              Statistical Protocol Rule
            </span>
            <p className="text-xs text-ink-secondary leading-relaxed">
              {tier.statisticalRule}
            </p>
          </div>
        </div>

        {/* Right Metric Summary Column */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-hairline bg-surface p-5 space-y-4">
          <div className="space-y-4">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                <Users size={14} /> Recommended Enrollment
              </span>
              <p className="mt-1 text-2xl font-bold tracking-tight text-ink">
                {tier.sampleSizeRange}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                Statistically powered for 90% power at α = 0.05
              </p>
            </div>

            <div className="border-t border-hairline pt-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                <DollarSign size={14} /> Estimated Clinical Budget
              </span>
              <p className="mt-1 text-xl font-bold tracking-tight text-series-3">
                {tier.typicalBudget}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                Includes participant stipends, lab technicians, and reference sensors
              </p>
            </div>

            <div className="border-t border-hairline pt-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                <Layers size={14} /> Required Trial Protocol
              </span>
              <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
                {tier.requiredValidation}
              </p>
            </div>
          </div>

          <div className="border-t border-hairline pt-3">
            <Link
              to={tier.routeLink}
              className="flex items-center justify-between rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-plane transition-opacity hover:opacity-90"
            >
              <span>{tier.routeLabel}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
