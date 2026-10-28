import { useState } from 'react';
import { ChevronRight, HelpCircle, Scale, Sparkles } from 'lucide-react';

interface MappingItem {
  domain: string;
  gPowerApproach: string;
  validationApproach: string;
  whyItDiffers: string;
  designerToolPath: string;
  designerToolLabel: string;
}

const ROSETTA_STONE_MAPPINGS: MappingItem[] = [
  {
    domain: 'Primary Statistical Question',
    gPowerApproach: 'Is there a statistically significant difference between Method A and Method B? (H₀: μ₁ = μ₂)',
    validationApproach: 'Do Method A and Method B agree within a clinically acceptable tolerance window? (H₀: |μ_diff| ≥ Δ_tol or LoA bounds exceed limits)',
    whyItDiffers:
      'Failing to reject the null hypothesis in G*Power (p > 0.05) does NOT prove equivalence—it merely proves your study was too small to detect the difference. Validation requires asserting agreement directly.',
    designerToolPath: '/agreement',
    designerToolLabel: 'Agreement & Equivalence Designer',
  },
  {
    domain: 'Sample Size Determination',
    gPowerApproach: 'Sized to achieve 80% or 90% power to detect an effect size d = (μ₁ - μ₂) / σ.',
    validationApproach: 'Sized so that the margin of error around the 95% Limits of Agreement (LoA) or error percentiles drops below a pre-specified clinical boundary.',
    whyItDiffers:
      'G*Power treats the difference as a signal to be detected. Sizing for LoA precision is an interval-width problem, not a hypothesis rejection problem.',
    designerToolPath: '/precision',
    designerToolLabel: 'Precision vs Sample Size Sweeper',
  },
  {
    domain: 'Paired Replicates & Repeated Measures',
    gPowerApproach: 'Assumes independent observations or single paired t-test differences. Cannot partition within- vs between-subject variance.',
    validationApproach: 'Random-effects ANOVA or linear mixed-effects model decomposing total variance into between-subject biological variation (s_b²) and within-subject measurement error (s_w²).',
    whyItDiffers:
      'When participants provide hundreds of continuous optical sensor samples, G*Power treats them as independent rows, underestimating required sample sizes by up to 70% (pseudoreplication).',
    designerToolPath: '/repeated-measures',
    designerToolLabel: 'Repeated Measures Designer',
  },
  {
    domain: 'Algorithm OTA Firmware Re-Runs',
    gPowerApproach: 'Two-sample independent power calculation requiring full clinical cohort re-enrollment (e.g. N=190, $250k).',
    validationApproach: 'Paired variance dividend: σ²_pair = 2σ²(1 - ρ). Because algorithms re-run on identical optical data streams, correlation is extreme (ρ ≥ 0.95).',
    whyItDiffers:
      'High intra-subject correlation cancels biological variance, allowing sample sizes to drop from N=190 down to N=10–12 for identical statistical power.',
    designerToolPath: '/agreement',
    designerToolLabel: 'Paired Non-Inferiority Sizer',
  },
  {
    domain: 'Demographic Representation',
    gPowerApproach: 'Total sample size only. No mechanism to enforce stratum quotas or prevent walk-in bias.',
    validationApproach: 'Dual-scale floor and ceiling quotas across the Monk Skin Tone Scale (MST 01–10) and FDA ISO 80601-2-61 Table 1.',
    whyItDiffers:
      'Without demographic ceiling caps, walk-in suburban clinics fill studies with light skin tones before enrolling required dark skin cohorts.',
    designerToolPath: '/demographics',
    designerToolLabel: 'Demographic Segment Planner',
  },
];

interface GPowerRosettaStoneProps {
  className?: string;
}

export function GPowerRosettaStone({ className = '' }: GPowerRosettaStoneProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const current = ROSETTA_STONE_MAPPINGS[selectedIdx]!;

  return (
    <div
      className={`rounded-2xl border border-hairline bg-surface p-5 sm:p-7 shadow-xs ${className}`}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-series-2/10 px-2.5 py-0.5 text-xs font-semibold text-series-2">
            Methodological Rosetta Stone
          </span>
          <span className="text-xs text-ink-muted">Bridging G*Power &amp; Agreement Science</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
          G*Power vs. Validation Study Designer
        </h3>
        <p className="text-sm leading-relaxed text-ink-secondary max-w-3xl">
          Researchers worldwide rely on G*Power for hypothesis testing, ANOVA, and difference detection.
          However, clinical device validation poses fundamentally different statistical questions.
          Here is how familiar G*Power paradigms translate into agreement science:
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex flex-wrap gap-1.5 border-b border-hairline pb-2.5">
        {ROSETTA_STONE_MAPPINGS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              selectedIdx === idx
                ? 'bg-ink text-plane shadow-2xs'
                : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'
            }`}
          >
            {item.domain}
          </button>
        ))}
      </div>

      {/* Comparison Detail Card */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Left: G*Power Framing */}
        <div className="rounded-xl border border-hairline bg-plane p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              G*Power Classical Paradigm
            </span>
            <Scale size={14} className="text-ink-muted" />
          </div>
          <h4 className="text-sm font-bold text-ink">Hypothesis Testing / Difference Detection</h4>
          <p className="text-xs text-ink-secondary leading-relaxed bg-surface/70 p-2.5 rounded border border-hairline">
            {current.gPowerApproach}
          </p>
        </div>

        {/* Right: Validation Study Designer Framing */}
        <div className="rounded-xl border border-series-1/30 bg-series-1/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-series-1">
              Validation Study Designer
            </span>
            <Sparkles size={14} className="text-series-1" />
          </div>
          <h4 className="text-sm font-bold text-ink">Agreement &amp; Equivalence Precision</h4>
          <p className="text-xs text-ink-secondary leading-relaxed bg-surface/70 p-2.5 rounded border border-hairline">
            {current.validationApproach}
          </p>
        </div>
      </div>

      {/* Why It Differs Explanation Box */}
      <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
          <HelpCircle size={14} />
          <span>Why Sizing in G*Power Breaks Down Here</span>
        </div>
        <p className="text-xs leading-relaxed text-ink-secondary">{current.whyItDiffers}</p>
        <div className="pt-2 border-t border-hairline flex items-center justify-between">
          <span className="text-[11px] text-ink-muted">Recommended Validation Module:</span>
          <a
            href={`#${current.designerToolPath}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-series-1 hover:underline"
          >
            <span>{current.designerToolLabel}</span>
            <ChevronRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
