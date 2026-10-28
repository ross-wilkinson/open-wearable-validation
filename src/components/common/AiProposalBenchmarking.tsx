import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Terminal,
} from 'lucide-react';

export interface RubricDimension {
  id: string;
  name: string;
  weight: string;
  teamLeadQuestion: string;
  passingStandard: string;
  hallucinationRisk: string;
}

export const AI_BENCHMARK_RUBRIC: RubricDimension[] = [
  {
    id: 'test_chosen',
    name: '1. Statistical Test Chosen',
    weight: '15%',
    teamLeadQuestion: 'Does the proposal use an agreement or equivalence framework rather than difference detection?',
    passingStandard:
      'Bland-Altman 95% Limits of Agreement (LoA), Two One-Sided Equivalence Tests (TOST), or exact percentile error bounds.',
    hallucinationRisk:
      'Recommending a two-sample Student t-test or ANOVA with H₀: μ₁ = μ₂ (treating p > 0.05 as proof of accuracy).',
  },
  {
    id: 'linear_model',
    name: '2. Linear Model & Variance Structure',
    weight: '15%',
    teamLeadQuestion: 'What linear model structure does it specify to handle repeated within-subject measurements?',
    passingStandard:
      'One-way random-effects ANOVA (Bland & Altman 2007) or Linear Mixed-Effects Model (LMEM) with random intercepts for subjects.',
    hallucinationRisk:
      'Naive Ordinary Least Squares (OLS) regression or unclustered standard errors treating multiple rows per person as independent.',
  },
  {
    id: 'error_metric',
    name: '3. Error Metric Specification',
    weight: '10%',
    teamLeadQuestion: 'What loss function or accuracy metric is evaluated against clinical truth?',
    passingStandard:
      'Arms (RMSE for SpO2 under ISO 80601-2-61), Mean Absolute Error (MAE), and robust quantiles: P50 (median), P90, and P95 absolute error.',
    hallucinationRisk:
      'Relying solely on Pearson r correlation or overall RMSE without checking heavy-tailed dropouts.',
  },
  {
    id: 'clustering_decomposition',
    name: '4. Within- vs Between-Subject Variance',
    weight: '15%',
    teamLeadQuestion: 'Does it explicitly calculate intraclass correlation (ICC) and effective sample size (N_eff)?',
    passingStandard:
      'Decomposes total variance into s_between² and s_within²; applies variance inflation factor VIF = 1 + (m - 1)·ICC to derive N_eff.',
    hallucinationRisk:
      'Dividing error variance by total observations (N × m) rather than effective independent subject count.',
  },
  {
    id: 'provocation_conditions',
    name: '5. Test Conditions & Provocation Protocols',
    weight: '10%',
    teamLeadQuestion: 'Does the protocol specify active provocation to trigger known sensor failure modes?',
    passingStandard:
      'Structured stress conditions: running speed ramp to provoke cadence lock harmonic collisions (160–185 spm), high ambient optical illuminance (50k lux), and peripheral vasoconstriction cold-pressor challenge.',
    hallucinationRisk:
      'Proposing only passive, calm indoor treadmill walking or resting laboratory conditions that hide dynamic edge-case failures.',
  },
  {
    id: 'sample_size_method',
    name: '6. Sample Size Sizing Formulation',
    weight: '15%',
    teamLeadQuestion: 'Is the sample size calculated via exact mathematical formulation or asymptotic heuristics?',
    passingStandard:
      'Exact non-central t distribution for LoA margin inversion or Greenwood variance for percentile coverage.',
    hallucinationRisk:
      'Hallucinating generic rule-of-thumb formulas (e.g. 1.96√(3/n)) without Student t degrees of freedom.',
  },
  {
    id: 'attrition_dropouts',
    name: '7. Sensor Attrition & Dropout Buffer',
    weight: '5%',
    teamLeadQuestion: 'Does the protocol account for real-world optical detachment, motion invalidation, and subject dropouts?',
    passingStandard:
      'Explicitly specifies an attrition buffer (typically 15–20% additional subjects) with clear data-exclusion rules.',
    hallucinationRisk:
      'Assuming 100% data yield across every participant and sensor channel.',
  },
  {
    id: 'economics_timeline',
    name: '8. Study Economics & Phased Timeline',
    weight: '5%',
    teamLeadQuestion: 'Is timeline duration modeled stochastically with phase-by-phase recruitment caps?',
    passingStandard:
      'Monte Carlo phase duration modeling (e.g. Gamma or PERT distributions) accounting for rare-segment recruitment pacing.',
    hallucinationRisk:
      'A single optimistic timeline estimate based on linear walk-in enrollment.',
  },
  {
    id: 'acceptance_criteria',
    name: '9. Pre-Specified Acceptance Criteria & Launch Gates',
    weight: '10%',
    teamLeadQuestion: 'Are go/no-go decision gates pre-specified prior to data unblinding?',
    passingStandard:
      'Two-gate decision scorecard: Gate 1 (absolute clinical tolerance, e.g. Arms ≤ 3.5%) and Gate 2 (predecessor non-inferiority, Δ ≤ 0.5 bpm).',
    hallucinationRisk:
      'Vague post-hoc claims of "good agreement" or relying on statistical significance (p < 0.05).',
  },
];

const STRUCTURED_JSON_SCHEMA_EXAMPLE = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ValidationStudyProposal",
  "type": "object",
  "required": [
    "statistical_framework",
    "linear_model_specification",
    "error_metrics",
    "variance_decomposition",
    "provocation_protocols",
    "sample_size_calculation",
    "attrition_allowance",
    "recruitment_quotas",
    "acceptance_criteria"
  ],
  "properties": {
    "statistical_framework": {
      "type": "string",
      "enum": ["bland_altman_loa", "tost_equivalence", "percentile_bound"]
    },
    "linear_model_specification": {
      "type": "object",
      "properties": {
        "model_type": { "type": "string", "enum": ["random_effects_anova", "lmem"] },
        "random_effects": { "type": "array", "items": { "type": "string" } },
        "fixed_effects": { "type": "array", "items": { "type": "string" } }
      }
    },
    "error_metrics": {
      "type": "array",
      "items": { "type": "string", "enum": ["arms", "mae", "p50_abs", "p90_abs", "p95_abs"] }
    },
    "variance_decomposition": {
      "type": "object",
      "properties": {
        "expected_icc": { "type": "number", "minimum": 0, "maximum": 1 },
        "effective_n_calculation": { "type": "string" }
      }
    },
    "provocation_protocols": {
      "type": "array",
      "items": { "type": "string" }
    },
    "sample_size_calculation": {
      "type": "object",
      "properties": {
        "participants_n": { "type": "integer" },
        "replicates_m": { "type": "integer" },
        "exact_formulation": { "type": "string" }
      }
    },
    "acceptance_criteria": {
      "type": "object",
      "properties": {
        "clinical_tolerance_bound": { "type": "number" },
        "predecessor_non_inferiority_margin": { "type": "number" }
      }
    }
  }
}`;

export function AiProposalBenchmarking({ className = '' }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopyPrompt() {
    const promptText = `Act as an expert Clinical Validation Scientist & Biostatistician. When designing a sensor or algorithm validation study proposal, you MUST adhere to the following 9-dimension team lead evaluation rubric:

1. Statistical Test: Use Bland-Altman LoA, TOST equivalence, or exact error quantiles. Strictly prohibit naive two-sample t-tests or difference null hypotheses.
2. Linear Model & Variance: Specify a random-effects ANOVA or Linear Mixed-Effects Model (LMEM) with random subject intercepts.
3. Error Metrics: Specify Arms (for SpO2/RMSE), MAE, and robust percentiles (P50, P90, P95).
4. Variance Decomposition: Decompose between- vs within-subject variance; calculate ICC and design effect VIF = 1 + (m - 1)*ICC to determine Effective N.
5. Provocation Protocols: Specify active stress conditions (e.g. cadence-lock speed ramp 160-185 spm, optical aggressor ambient light, vasoconstriction).
6. Sample Size Formulation: Use exact non-central t or Greenwood variance. Reject asymptotic shortcuts.
7. Attrition: Buffer for 15-20% dropouts and optical sensor artifacts.
8. Economics & Timeline: Model phase durations stochastically (Gamma/PERT).
9. Acceptance Criteria: Pre-specify two-gate decision bounds (clinical tolerance window & predecessor non-inferiority).

Output your response adhering to this JSON Schema:
${STRUCTURED_JSON_SCHEMA_EXAMPLE}`;

    if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(promptText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch(() => {
          // Fallback or ignore rejection
        });
    }
  }

  return (
    <div
      className={`rounded-2xl border border-hairline bg-surface p-5 sm:p-7 shadow-xs ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-series-4/15 px-2.5 py-0.5 text-xs font-semibold text-series-4">
              AI Benchmarking &amp; Quality Rubric
            </span>
            <span className="text-xs text-ink-muted">Team Lead Proposal Review</span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Benchmarking AI Study Proposals
          </h3>
        </div>

        <button
          type="button"
          onClick={handleCopyPrompt}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-plane transition-opacity hover:opacity-90 self-start sm:self-auto shadow-2xs"
        >
          {copied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span>{copied ? 'Copied Prompt & Schema!' : 'Copy Evaluation Prompt'}</span>
        </button>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
        Audit study proposals and prompt outputs across 9 core clinical validation criteria to verify statistical test
        structures, provocation protocols, and variance partitioning before committing clinical resources.
      </p>

      {/* 9 Dimensions Table / Cards */}
      <div className="mt-6 space-y-3">
        {AI_BENCHMARK_RUBRIC.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-hairline bg-plane p-4 transition-colors hover:border-hairline/80"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-ink">{item.name}</h4>
              <span className="rounded bg-ink/5 px-2 py-0.5 font-mono text-[10px] font-semibold text-ink-muted">
                Weight: {item.weight}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-ink">{item.teamLeadQuestion}</p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 pt-2 border-t border-hairline/60 text-xs">
              <div className="flex items-start gap-2 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  <strong>Passing Standard:</strong> {item.passingStandard}
                </span>
              </div>
              <div className="flex items-start gap-2 text-rose-800 dark:text-rose-300">
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>
                  <strong>Hallucination Red Flag:</strong> {item.hallucinationRisk}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* JSON Schema Preview Accordion / Code Box */}
      <div className="mt-6 rounded-xl border border-hairline bg-surface p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <Terminal size={14} className="text-series-1" />
            <span>Structured Output Block (Machine-Readable JSON Schema)</span>
          </div>
          <span className="text-[10px] text-ink-muted">JSON-Schema Draft 2020-12</span>
        </div>
        <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-plane p-3 font-mono text-[11px] leading-relaxed text-ink-secondary">
          {STRUCTURED_JSON_SCHEMA_EXAMPLE}
        </pre>
      </div>
    </div>
  );
}
