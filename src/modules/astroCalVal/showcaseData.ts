/**
 * Typed view of `showcase_data.json`, emitted by
 * `agreekit_astro_calval.export_showcase_json` (astro-calval repo).
 * Regenerate with `python -m agreekit_astro_calval.export_showcase_json` — never hand-edit.
 *
 * Feeds all 4 workbench tabs of the Astronomy Cal/Val Showcase.
 */
import raw from './showcase_data.json';

export type PipelineKey = 'a' | 'b';
export type ActivePipeline = 'a' | 'b' | 'h2h';
export type Interval = [number, number];
export type UAxisMode = 'reference' | 'mean';

export interface PipelineSummary {
  key: PipelineKey;
  label: string;
  bias: number;
  bias_ci: Interval;
  sd: number;
  loa_lower: number;
  loa_upper: number;
  loa_lower_ci: Interval;
  loa_upper_ci: Interval;
  median: number;
  sigma_nmad: number;
  robust_lower: number;
  robust_upper: number;
  outlier_fraction: number;
  sd_nmad_ratio: number;
  tost_equivalent: boolean;
  tost_p_value: number;
  tost_ci: Interval;
  srd_margin: number;
  n_subjects: number;
  n_obs: number;
  n_effective: number;
  icc: number;
  var_between: number;
  var_within: number;
}

export interface CliffsComparison {
  metric: string;
  interpretation: string;
  delta: number;
  ci: Interval;
  confidence: number;
  margin: number;
  dominance: string;
  p_pos: number;
  p_neg: number;
  p_tie: number;
  n_pairs: number;
  n_subjects: number;
}

export interface CoverageData {
  floor_r: number;
  floor_dropout_a: number;
  overall_dropout_a: number;
  floor_dropout_b: number;
  overall_dropout_b: number;
  bins: {
    r_center: number[];
    snr: number[];
    n: number[];
    completeness_a: number[];
    model_a: number[];
    completeness_b: number[];
    model_b: number[];
  };
  censoring: {
    z_center: number[];
    n: number[];
    floor: number;
    censored_a: (number | null)[];
    bias_a: (number | null)[];
    exclusion_a: number;
    n_in_zone_a: number;
    censored_b: (number | null)[];
    bias_b: (number | null)[];
    exclusion_b: number;
    n_in_zone_b: number;
  };
}

export interface SadlerCurveData {
  bias: number[];
  bias_lo: number[];
  bias_hi: number[];
  loa_lo: number[];
  loa_lo_lo: number[];
  loa_lo_hi: number[];
  loa_hi: number[];
  loa_hi_lo: number[];
  loa_hi_hi: number[];
  stats: {
    model: string;
    exponent: number;
    params: number[];
    dispersion: number;
    n_core: number;
    normalized_bias: number;
    normalized_sd: number;
    delta_bias: number;
    n_effective: number;
    bp_raw_chi2: number;
    bp_raw_p: number;
    bp_norm_chi2: number;
    bp_norm_p: number;
    slope: number;
    slope_ci: Interval;
    slope_p: number;
    censoring_threshold: number;
  };
}

export interface DetectionCurveData {
  slope: number;
  x_c: number[];
  x_d: number[];
  y_c: number[];
  sigma_0: number[];
  ratio: number[];
}

export interface AgreementData {
  y_limit: number;
  model: string;
  scatter: {
    z_spec: number[];
    dz_a: number[];
    dz_b: number[];
  };
  sadler: {
    reference: {
      u: number[];
      a: SadlerCurveData;
      b: SadlerCurveData;
    };
    mean: {
      u: number[];
      a: SadlerCurveData;
      b: SadlerCurveData;
    };
  };
  kde: {
    y: number[];
    a: number[];
    b: number[];
  };
  detection: {
    z0: number[];
    alpha: number;
    beta: number;
    m: number;
    a: DetectionCurveData;
    b: DetectionCurveData;
  };
}

export interface ValidationKpiRow {
  key: string;
  label: string;
  kind: 'typical' | 'edge';
  estimate: number;
  ci_lower: number;
  ci_upper: number;
  standard: number;
  passed: boolean;
}

export interface ValidationKpiBlock {
  a: {
    passed: boolean;
    rows: ValidationKpiRow[];
  };
  b: {
    passed: boolean;
    rows: ValidationKpiRow[];
  };
  head_to_head: {
    label: string;
    delta: number;
    ci: Interval;
    p_pos: number;
    p_tie: number;
    p_neg: number;
    dominance: string;
    verdict: string;
    margin: number;
    n_pairs: number;
    n_subjects: number;
  };
  typical_standard: number;
  edge_standard: number;
  srd_sigma_requirement: number;
  ci_level: number;
  n_boot: number;
  n_obs: number;
  n_subjects: number;
}

export interface EcdfData {
  p: number[];
  a: {
    pooled: number[];
    subject_p50: number[];
    subject_p95: number[];
  };
  b: {
    pooled: number[];
    subject_p50: number[];
    subject_p95: number[];
  };
  h2h: {
    subject_delta: number[];
    box: {
      min: number;
      q1: number;
      median: number;
      q3: number;
      max: number;
    };
    pooled_gap: number[];
  };
}

export interface FanQuantiles {
  p5: number[];
  p25: number[];
  p50: number[];
  p75: number[];
  p95: number[];
}

export interface TimeBlockData {
  t_min: number[];
  airmass: number[];
  cold_start_end_min: number;
  duration_min: number;
  tau: number;
  fan: {
    a: FanQuantiles;
    b: FanQuantiles;
    gap: FanQuantiles;
  };
  wtl: {
    b_wins: number[];
    tie: number[];
    a_wins: number[];
    window: number;
  };
  heat: {
    scale: number;
    a: number[][];
    b: number[][];
  };
  order: {
    a: number[];
    b: number[];
    h2h: number[];
  };
  archetypes: {
    a: { p5: number; p50: number; p95: number };
    b: { p5: number; p50: number; p95: number };
    h2h: { p5: number; p50: number; p95: number };
  };
  subjects: {
    id: number[];
    z_spec: number[];
    r_mag: number[];
    median_a: number[];
    median_b: number[];
    cliffs_delta: number[];
    outlier_a: number[];
    outlier_b: number[];
  };
}

export interface ShowcaseData {
  metadata: {
    title: string;
    synthetic: boolean;
    seed: number;
    benchmark_reference: string;
    pipeline_under_test: string;
    residual: string;
    n_galaxies: number;
    n_exposures: number;
    exposures_per_galaxy: Interval;
    z_spec_range: Interval;
    r_mag_range: Interval;
    mag_bin_edges: number[];
    srd_margin: number;
    outlier_threshold: number;
    cliffs_margin: number;
    n_points: number;
    panel: {
      n_subjects: number;
      n_epochs: number;
      duration_min: number;
    };
    agreekit_version: string;
  };
  pipelines: Record<PipelineKey, PipelineSummary>;
  comparison: { cliffs_delta: CliffsComparison };
  coverage: CoverageData;
  agreement: AgreementData;
  kpi: ValidationKpiBlock;
  ecdf: EcdfData;
  time: TimeBlockData;
}

export const SHOWCASE = raw as unknown as ShowcaseData;
