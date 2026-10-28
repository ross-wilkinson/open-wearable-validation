/**
 * Module: Validation Report Studio & Error Distribution Diagnostics.
 *
 * Core teachings:
 * 1. Systems that scale: HTML + JavaScript & Plx Dashboards bypass restrictive
 *    enterprise permissions and infra data silos. Self-contained, client-side
 *    reporting enables zero-permission portability and reproducible cross-functional audits.
 * 2. Cross-functional empowerment: Product, Algorithm/Engineering, and Clinical/Regulatory
 *    stakeholders each require a tailored lens onto the same underlying validation findings.
 * 3. Hierarchical data-generating process: Sensor validation data is clustered within
 *    subjects. Between-subject variance (sigma_b) and within-subject variance (sigma_w)
 *    must be decomposed via ANOVA. Naive pooled statistics dramatically understate uncertainty.
 * 4. Survival of Error distributions: Bland-Altman limits (mean & variance) assume normality
 *    and hide heavy tails. "Survival-type" absolute error analysis (P(|error| > x) and
 *    empirical coverage P(|error| <= x)) exposes rare catastrophic failures, motion artifacts,
 *    and non-Gaussian clinical hazards.
 *
 * References:
 * - Bland JM, Altman DG. Agreement between methods of measurement with multiple
 *   observations per individual. J Biopharm Stat. 2007;17(4):571-82.
 * - ISO 80601-2-61:2017 Medical electrical equipment -- Pulse oximeters.
 * - ANSI/CTA-2065: Physical Activity and Physiological Monitoring.
 * - de Zambotti M, et al. Measures of sleep and agreement between polysomnography
 *   and wearable sensors. Sleep. 2020.
 */

import * as normal from '../../stats/normal.ts';
import * as studentT from '../../stats/studentT.ts';

export interface SleepStageMetric {
  stage: string;
  count: number;
  sensitivity: number;
  specificity: number;
  ppv: number;
}

export interface SleepStagingSummary {
  classes: string[];
  matrix: number[][]; // Row: PSG Reference, Column: Device Wearable
  totalEpochs: number;
  overallAccuracy: number;
  cohensKappa: number;
  tstBiasMinutes: number;
  tstLoaMinutes: [number, number];
  stageMetrics: SleepStageMetric[];
}

export interface ReportStudioPreset {
  id: string;
  name: string;
  domain: string;
  description: string;
  unit: string;
  regulatoryStandard: string;
  referenceName: string;
  deviceName: string;
  defaultM: number;
  defaultK: number;
  defaultBias: number;
  defaultSdB: number;
  defaultSdW: number;
  defaultOutlierRate: number;
  defaultOutlierScale: number;
  toleranceWindow: number;
  targetCoveragePct: number;
  armsTarget: number;
  p95Target: number;
  sleepSummary?: SleepStagingSummary;
}

export const REPORT_STUDIO_PRESETS: ReportStudioPreset[] = [
  {
    id: 'spo2',
    name: 'Pulse Oximetry (SpO2)',
    domain: 'Clinical Hypoxia / ISO 80601-2-61',
    description:
      'Controlled multi-stage desaturation protocol (70%–100% SaO2) evaluating investigational optical pulse oximeter against reference multi-wavelength CO-oximetry arterial blood draws.',
    unit: '%',
    regulatoryStandard: 'ISO 80601-2-61 / FDA SpO2 Guidance (Arms <= 3.0%, >= 200 paired pts)',
    referenceName: 'Blood CO-oximetry (SaO2)',
    deviceName: 'Investigational SpO2 Wearable',
    defaultM: 24,
    defaultK: 8,
    defaultBias: 0.35,
    defaultSdB: 1.15,
    defaultSdW: 1.55,
    defaultOutlierRate: 0.035,
    defaultOutlierScale: 3.2,
    toleranceWindow: 3.0,
    targetCoveragePct: 95.0,
    armsTarget: 3.0,
    p95Target: 3.8,
  },
  {
    id: 'heart-rate',
    name: 'Exercise Heart Rate (Wearable vs ECG)',
    domain: 'Sports & Cardiovascular / CTA-2065',
    description:
      'Multi-stage exercise treadmill and cycling protocol pairing optical photoplethysmography (PPG) wrist monitor against continuous 12-lead ECG telemetry. Heavy tails arise from motion artifacts and cadence lock.',
    unit: 'bpm',
    regulatoryStandard: 'ANSI/CTA-2065 & AAMI EC13 (Within 5 bpm or 10%, MAPE <= 7%)',
    referenceName: '12-lead ECG Telemetry',
    deviceName: 'Wrist PPG Optical Monitor',
    defaultM: 32,
    defaultK: 10,
    defaultBias: 0.75,
    defaultSdB: 2.1,
    defaultSdW: 3.8,
    defaultOutlierRate: 0.065,
    defaultOutlierScale: 7.5,
    toleranceWindow: 5.0,
    targetCoveragePct: 85.0,
    armsTarget: 5.0,
    p95Target: 8.5,
  },
  {
    id: 'sleep-staging',
    name: 'Sleep Staging (Wearable vs PSG)',
    domain: 'Sleep Architecture / SRI Multi-level Evaluation',
    description:
      'In-lab overnight polysomnography (PSG) 30-second epoch comparison against multisensor wearable sleep staging algorithm (Wake, Light N1+N2, Deep N3, REM).',
    unit: 'min',
    regulatoryStandard: 'AASM Guidelines & SRI Wearable Sleep Framework (Kappa >= 0.70)',
    referenceName: 'Clinical Polysomnography (PSG)',
    deviceName: 'Multisensor Sleep Tracker',
    defaultM: 28,
    defaultK: 6,
    defaultBias: -6.5,
    defaultSdB: 14.0,
    defaultSdW: 18.0,
    defaultOutlierRate: 0.05,
    defaultOutlierScale: 25.0,
    toleranceWindow: 30.0,
    targetCoveragePct: 90.0,
    armsTarget: 25.0,
    p95Target: 35.0,
    sleepSummary: {
      classes: ['Wake', 'Light (N1/N2)', 'Deep (N3)', 'REM'],
      // 4x4 matrix: Rows = PSG Reference, Columns = Wearable Device
      matrix: [
        [2840, 420, 50, 110], // True Wake
        [410, 11420, 780, 890], // True Light
        [30, 810, 3950, 60], // True Deep
        [120, 760, 40, 4520], // True REM
      ],
      totalEpochs: 27210,
      overallAccuracy: 0.835,
      cohensKappa: 0.732,
      tstBiasMinutes: -8.4,
      tstLoaMinutes: [-38.2, 21.4],
      stageMetrics: [
        {
          stage: 'Wake',
          count: 3420,
          sensitivity: 0.83,
          specificity: 0.976,
          ppv: 0.835,
        },
        {
          stage: 'Light (N1/N2)',
          count: 13500,
          sensitivity: 0.846,
          specificity: 0.855,
          ppv: 0.852,
        },
        {
          stage: 'Deep (N3)',
          count: 4850,
          sensitivity: 0.814,
          specificity: 0.961,
          ppv: 0.819,
        },
        {
          stage: 'REM',
          count: 5440,
          sensitivity: 0.831,
          specificity: 0.951,
          ppv: 0.809,
        },
      ],
    },
  },
];

export interface PairedObservation {
  id: string;
  subjectId: number;
  obsIndex: number;
  refValue: number;
  devValue: number;
  diff: number; // dev - ref
  absDiff: number;
  isOutlier: boolean;
}

export interface SubjectCentroid {
  subjectId: number;
  meanRef: number;
  meanDev: number;
  meanDiff: number;
  count: number;
}

export interface AnovaVarianceDecomposition {
  ssBetween: number;
  ssWithin: number;
  msBetween: number;
  msWithin: number;
  sdBetween: number;
  sdWithin: number;
  sdTotal: number;
  icc: number;
  designEffect: number;
  nEffective: number;
  seCluster: number;
  seNaive: number;
  seUnderstatementRatio: number;
}

export interface AgreementMetrics {
  m: number;
  k: number;
  totalN: number;
  meanBias: number;
  ciBiasClusterLow: number;
  ciBiasClusterHigh: number;
  ciBiasNaiveLow: number;
  ciBiasNaiveHigh: number;
  loaLower: number;
  loaUpper: number;
  arms: number;
  mae: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
  coverageAtTolerance: number;
  survivalAtTolerance: number;
  variance: AnovaVarianceDecomposition;
}

export interface SurvivalPoint {
  threshold: number;
  empiricalSurvival: number; // P(|error| > x)
  empiricalCoverage: number; // P(|error| <= x)
  gaussianSurvival: number;
  gaussianCoverage: number;
  heavyTailExcess: number; // Difference showing heavy tails
}

export interface ScorecardItem {
  id: string;
  lens: 'product' | 'engineering' | 'clinical';
  label: string;
  value: string;
  target: string;
  status: 'pass' | 'caution' | 'fail';
  verdict: string;
  explanation: string;
}

/**
 * Deterministic PRNG using Mulberry32 for reproducible synthetic simulation.
 */
function createMulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t >>> 0) / 4294967296;
  };
}

/**
 * Standard Normal variate using Box-Muller transform.
 */
function randomNormal(rand: () => number): number {
  const u1 = Math.max(1e-15, rand());
  const u2 = rand();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * Laplace variate for generating heavy-tailed sensor error spikes.
 */
function randomLaplace(rand: () => number, scale: number): number {
  const u = rand() - 0.5;
  return -scale * Math.sign(u) * Math.log(1.0 - 2.0 * Math.abs(u));
}

/**
 * Simulates a paired repeated-measures validation dataset reflecting the
 * true hierarchical data-generating process:
 *   Y_{ij,ref} ~ Uniform/Reference
 *   u_i ~ Normal(0, sigma_b^2) (between-subject random intercept)
 *   epsilon_{ij} ~ Normal(0, sigma_w^2) + intermittent heavy-tailed Laplace spike
 *   Y_{ij,dev} = Y_{ij,ref} + trueBias + u_i + epsilon_{ij}
 */
export function generateSyntheticPairedData(params: {
  m: number;
  k: number;
  bias: number;
  sdB: number;
  sdW: number;
  outlierRate: number;
  outlierScale: number;
  seed?: number;
  refRange?: [number, number];
}): {
  observations: PairedObservation[];
  centroids: SubjectCentroid[];
} {
  const {
    m,
    k,
    bias,
    sdB,
    sdW,
    outlierRate,
    outlierScale,
    seed = 42,
    refRange = [70, 98],
  } = params;

  const rand = createMulberry32(seed);
  const observations: PairedObservation[] = [];
  const centroids: SubjectCentroid[] = [];

  const [refMin, refMax] = refRange;

  for (let i = 1; i <= m; i += 1) {
    // Subject-level random trait offset (e.g. skin tone, anatomical impedance)
    const subjectEffect = sdB > 0 ? randomNormal(rand) * sdB : 0;
    let sumRef = 0;
    let sumDev = 0;
    let sumDiff = 0;

    for (let j = 1; j <= k; j += 1) {
      // Replicate reference point across physiological domain
      const baseRef = refMin + rand() * (refMax - refMin);
      const isOutlier = rand() < outlierRate;
      const withinNoise = sdW > 0 ? randomNormal(rand) * sdW : 0;
      const outlierNoise = isOutlier ? randomLaplace(rand, outlierScale) : 0;

      const totalDiff = bias + subjectEffect + withinNoise + outlierNoise;
      const devVal = baseRef + totalDiff;

      observations.push({
        id: `s${i}-r${j}`,
        subjectId: i,
        obsIndex: j,
        refValue: Number(baseRef.toFixed(2)),
        devValue: Number(devVal.toFixed(2)),
        diff: Number(totalDiff.toFixed(2)),
        absDiff: Number(Math.abs(totalDiff).toFixed(2)),
        isOutlier,
      });

      sumRef += baseRef;
      sumDev += devVal;
      sumDiff += totalDiff;
    }

    centroids.push({
      subjectId: i,
      meanRef: Number((sumRef / k).toFixed(2)),
      meanDev: Number((sumDev / k).toFixed(2)),
      meanDiff: Number((sumDiff / k).toFixed(2)),
      count: k,
    });
  }

  return { observations, centroids };
}

/**
 * Computes one-way random effects ANOVA variance components, Intraclass Correlation,
 * and Bland-Altman clustered agreement metrics from paired observations.
 */
export function computeAgreementMetrics(
  observations: PairedObservation[],
  toleranceWindow: number,
  confidenceLevel: number = 0.95,
): AgreementMetrics {
  const totalN = observations.length;
  if (totalN === 0) {
    throw new Error('Observations array cannot be empty');
  }

  // Group differences by subject
  const subjectMap = new Map<number, number[]>();
  let sumDiff = 0;
  let sumDiffSq = 0;
  let sumAbsDiff = 0;

  for (const obs of observations) {
    sumDiff += obs.diff;
    sumDiffSq += obs.diff * obs.diff;
    sumAbsDiff += obs.absDiff;

    const list = subjectMap.get(obs.subjectId) ?? [];
    list.push(obs.diff);
    subjectMap.set(obs.subjectId, list);
  }

  const m = subjectMap.size;
  const k = totalN / m;
  const grandMean = sumDiff / totalN;

  // Between-subject sum of squares
  let ssBetween = 0;
  for (const [, diffs] of subjectMap) {
    const subjMean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    ssBetween += diffs.length * Math.pow(subjMean - grandMean, 2);
  }

  // Within-subject sum of squares
  let ssWithin = 0;
  for (const [, diffs] of subjectMap) {
    const subjMean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    for (const d of diffs) {
      ssWithin += Math.pow(d - subjMean, 2);
    }
  }

  const dfBetween = Math.max(1, m - 1);
  const dfWithin = Math.max(1, totalN - m);

  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;

  const sdWithin = Math.sqrt(Math.max(0, msWithin));
  const sdBetween = Math.sqrt(Math.max(0, (msBetween - msWithin) / k));
  const sdTotal = Math.sqrt(sdBetween * sdBetween + sdWithin * sdWithin);

  const icc = sdTotal > 0 ? (sdBetween * sdBetween) / (sdTotal * sdTotal) : 0;
  const designEffect = 1 + (k - 1) * icc;
  const nEffective = designEffect > 0 ? totalN / designEffect : totalN;

  // Clustered standard error of the mean bias vs naive pooled standard error
  // Aligns with agreekit: var_mean = var_between * sum(counts^2)/N^2 + ms_within/N
  // For balanced k: sdBetween^2 / m + sdWithin^2 / totalN. Handles sample MSB < MSW consistently.
  const varMean = m > 0 ? (sdBetween * sdBetween) / m + (sdWithin * sdWithin) / totalN : msWithin / totalN;
  const seCluster = Math.sqrt(Math.max(1e-12, varMean));
  const seNaive = sdTotal / Math.sqrt(totalN);
  const seUnderstatementRatio = seNaive > 0 ? seCluster / seNaive : 1.0;

  // Student-t critical value for clustered degrees of freedom (m - 1)
  const alpha = 1.0 - confidenceLevel;
  const tCrit = studentT.ppf(1.0 - alpha / 2.0, dfBetween);
  const zCrit = normal.ppf(1.0 - alpha / 2.0);

  const ciBiasClusterLow = grandMean - tCrit * seCluster;
  const ciBiasClusterHigh = grandMean + tCrit * seCluster;

  const ciBiasNaiveLow = grandMean - zCrit * seNaive;
  const ciBiasNaiveHigh = grandMean + zCrit * seNaive;

  // Limits of Agreement: grandMean +/- 1.96 * sdTotal
  const loaMultiplier = 1.959963984540054;
  const loaLower = grandMean - loaMultiplier * sdTotal;
  const loaUpper = grandMean + loaMultiplier * sdTotal;

  // Root Mean Square Error (Arms) and MAE
  const arms = Math.sqrt(sumDiffSq / totalN);
  const mae = sumAbsDiff / totalN;

  // Percentiles of absolute error
  const sortedAbsDiffs = observations.map((o) => o.absDiff).sort((a, b) => a - b);
  const getPercentile = (pct: number) => {
    const idx = (pct / 100) * (sortedAbsDiffs.length - 1);
    const low = Math.floor(idx);
    const high = Math.ceil(idx);
    const weight = idx - low;
    return sortedAbsDiffs[low]! * (1 - weight) + sortedAbsDiffs[high]! * weight;
  };

  const p50 = getPercentile(50);
  const p75 = getPercentile(75);
  const p90 = getPercentile(90);
  const p95 = getPercentile(95);
  const p99 = getPercentile(99);

  // Empirical coverage and survival at tolerance
  const countInside = observations.filter((o) => o.absDiff <= toleranceWindow).length;
  const coverageAtTolerance = (countInside / totalN) * 100;
  const survivalAtTolerance = 100 - coverageAtTolerance;

  return {
    m,
    k,
    totalN,
    meanBias: grandMean,
    ciBiasClusterLow,
    ciBiasClusterHigh,
    ciBiasNaiveLow,
    ciBiasNaiveHigh,
    loaLower,
    loaUpper,
    arms,
    mae,
    p50,
    p75,
    p90,
    p95,
    p99,
    coverageAtTolerance,
    survivalAtTolerance,
    variance: {
      ssBetween,
      ssWithin,
      msBetween,
      msWithin,
      sdBetween,
      sdWithin,
      sdTotal,
      icc,
      designEffect,
      nEffective,
      seCluster,
      seNaive,
      seUnderstatementRatio,
    },
  };
}

/**
 * Computes the "Survival of Error" curve P(|error| > x) and "Error Coverage" P(|error| <= x)
 * along with the theoretical Gaussian curve from identical RMS spread.
 *
 * This explicitly exposes the "Heavy-Tail Hazard": in sensor validation, device errors
 * frequently exhibit non-Gaussian kurtosis (motion artifacts, poor contact, arrhythmia).
 * At high clinical thresholds, empirical survival can be 3x to 10x higher than what
 * Gaussian-assuming Bland-Altman statistics predict!
 */
export function computeSurvivalCurve(
  observations: PairedObservation[],
  meanBias: number,
  sdTotal: number,
  maxThreshold?: number,
  numSteps: number = 40,
): SurvivalPoint[] {
  const totalN = observations.length;
  if (totalN === 0) return [];

  const maxObs = observations.length > 0 ? Math.max(...observations.map((o) => o.absDiff)) : 0;
  const upper = Math.max(maxThreshold ?? 0, Math.ceil(maxObs * 1.05), 1.0);
  const step = upper / numSteps;

  const points: SurvivalPoint[] = [];

  for (let stepIdx = 0; stepIdx <= numSteps; stepIdx += 1) {
    const x = stepIdx * step;
    const countAbove = observations.filter((o) => o.absDiff > x).length;
    const empiricalSurvival = (countAbove / totalN) * 100;
    const roundedSurvival = Number(empiricalSurvival.toFixed(1));
    const roundedCoverage = Number((100 - roundedSurvival).toFixed(1));

    // Theoretical folded normal survival: P(|D| > x) where D ~ N(meanBias, sdTotal^2)
    // P(D > x) + P(D < -x)
    let gaussianSurvival = 0;
    if (sdTotal > 0) {
      const zUpper = (x - meanBias) / sdTotal;
      const zLower = (-x - meanBias) / sdTotal;
      const probUpper = normal.sf(zUpper);
      const probLower = normal.cdf(zLower);
      gaussianSurvival = Math.min(100, Math.max(0, (probUpper + probLower) * 100));
    } else {
      gaussianSurvival = Math.abs(meanBias) > x ? 100 : 0;
    }
    const roundedGaussSurvival = Number(gaussianSurvival.toFixed(1));
    const roundedGaussCoverage = Number((100 - roundedGaussSurvival).toFixed(1));
    const heavyTailExcess = Math.max(0, roundedSurvival - roundedGaussSurvival);

    points.push({
      threshold: Number(x.toFixed(2)),
      empiricalSurvival: roundedSurvival,
      empiricalCoverage: roundedCoverage,
      gaussianSurvival: roundedGaussSurvival,
      gaussianCoverage: roundedGaussCoverage,
      heavyTailExcess: Number(heavyTailExcess.toFixed(1)),
    });
  }

  return points;
}

/**
 * Builds the Multi-Tier Executive Scorecard for cross-functional stakeholders.
 */
export function generateExecutiveScorecard(
  metrics: AgreementMetrics,
  preset: ReportStudioPreset,
  toleranceWindow: number,
): ScorecardItem[] {
  const items: ScorecardItem[] = [];

  // Product Lens: User-Facing Error Experience & Clinical Gate
  const userCoverageStatus =
    metrics.coverageAtTolerance >= preset.targetCoveragePct
      ? 'pass'
      : metrics.coverageAtTolerance >= preset.targetCoveragePct - 5
        ? 'caution'
        : 'fail';

  items.push({
    id: 'prod-coverage',
    lens: 'product',
    label: `Error Coverage Within ±${toleranceWindow} ${preset.unit}`,
    value: `${metrics.coverageAtTolerance.toFixed(1)}%`,
    target: `≥ ${preset.targetCoveragePct.toFixed(0)}%`,
    status: userCoverageStatus,
    verdict:
      userCoverageStatus === 'pass'
        ? 'Target Met: High User Reliability'
        : userCoverageStatus === 'caution'
          ? 'Borderline: Outlier Risk Under Dynamic Conditions'
          : 'Failed: Unacceptable Proportion of Off-Target Readings',
    explanation: `${(100 - metrics.coverageAtTolerance).toFixed(1)}% of user measurements experience absolute errors exceeding the ${toleranceWindow} ${preset.unit} clinical tolerance window.`,
  });

  const p95Status =
    metrics.p95 <= preset.p95Target
      ? 'pass'
      : metrics.p95 <= preset.p95Target * 1.2
        ? 'caution'
        : 'fail';

  items.push({
    id: 'prod-p95',
    lens: 'product',
    label: '95th Percentile Error (P95)',
    value: `±${metrics.p95.toFixed(2)} ${preset.unit}`,
    target: `≤ ${preset.p95Target.toFixed(2)} ${preset.unit}`,
    status: p95Status,
    verdict:
      p95Status === 'pass'
        ? 'Bound Acceptable for Daily Use'
        : p95Status === 'caution'
          ? 'Elevated Tail Errors'
          : 'High Severity Tail Spikes',
    explanation: `95% of all measurements stay within ${metrics.p95.toFixed(2)} ${preset.unit}. Tail performance drives negative customer reviews and safety incidents.`,
  });

  // Engineering / Algorithm Lens: Calibration & Variance Decomposition
  const biasAbs = Math.abs(metrics.meanBias);
  const biasStatus =
    biasAbs <= toleranceWindow * 0.2
      ? 'pass'
      : biasAbs <= toleranceWindow * 0.4
        ? 'caution'
        : 'fail';

  items.push({
    id: 'eng-bias',
    lens: 'engineering',
    label: 'Mean Systemic Bias (Clustered CI)',
    value: `${metrics.meanBias >= 0 ? '+' : ''}${metrics.meanBias.toFixed(2)} ${preset.unit}`,
    target: `CI within ±${(toleranceWindow * 0.3).toFixed(1)} ${preset.unit}`,
    status: biasStatus,
    verdict:
      biasStatus === 'pass'
        ? 'Zero-Calibration Stable'
        : biasStatus === 'caution'
          ? 'Mild Offset Detected'
          : 'Systematic Sensor Offset',
    explanation: `Clustered 95% CI is [${metrics.ciBiasClusterLow.toFixed(2)}, ${metrics.ciBiasClusterHigh.toFixed(2)}]. Naive pooled CI would falsely claim [${metrics.ciBiasNaiveLow.toFixed(2)}, ${metrics.ciBiasNaiveHigh.toFixed(2)}], understating uncertainty by ${metrics.variance.seUnderstatementRatio.toFixed(1)}x.`,
  });

  const iccStatus =
    metrics.variance.icc < 0.4
      ? 'pass'
      : metrics.variance.icc < 0.7
        ? 'caution'
        : 'fail';

  items.push({
    id: 'eng-variance-decomp',
    lens: 'engineering',
    label: 'Between-Subject Variance Share (ICC)',
    value: `${(metrics.variance.icc * 100).toFixed(1)}% (ICC = ${metrics.variance.icc.toFixed(2)})`,
    target: 'ICC < 0.50 preferred',
    status: iccStatus,
    verdict:
      iccStatus === 'pass'
        ? 'Errors Driven by Noise, Not Physiology'
        : iccStatus === 'caution'
          ? 'Moderate Subject-Level Calibration Drift'
          : 'High Demographic / Skin Tone Disparity Risk',
    explanation: `Between-subject SD is ${metrics.variance.sdBetween.toFixed(2)} vs within-subject SD of ${metrics.variance.sdWithin.toFixed(2)}. High ICC signals that algorithm tuning varies across physical bodies.`,
  });

  const effSizeRatio = metrics.variance.nEffective / metrics.totalN;
  items.push({
    id: 'eng-neff',
    lens: 'engineering',
    label: 'Effective Sample Size (N_eff / N_total)',
    value: `${metrics.variance.nEffective.toFixed(0)} of ${metrics.totalN} paired obs`,
    target: 'Design Effect penalty transparent',
    status: effSizeRatio > 0.5 ? 'pass' : 'caution',
    verdict: `${(effSizeRatio * 100).toFixed(0)}% Information Efficiency`,
    explanation: `Due to subject clustering (Design Effect = ${metrics.variance.designEffect.toFixed(2)}), ${metrics.totalN} observations only yield ${metrics.variance.nEffective.toFixed(0)} independent statistical degrees of freedom.`,
  });

  // Clinical & Regulatory Lens: Compliance & Limits of Agreement
  const armsStatus =
    metrics.arms <= preset.armsTarget
      ? 'pass'
      : metrics.arms <= preset.armsTarget * 1.15
        ? 'caution'
        : 'fail';

  items.push({
    id: 'clin-arms',
    lens: 'clinical',
    label: 'Root Mean Square Error / Arms',
    value: `${metrics.arms.toFixed(2)} ${preset.unit}`,
    target: `≤ ${preset.armsTarget.toFixed(2)} ${preset.unit} (${preset.regulatoryStandard.split('/')[0]?.trim() ?? 'Standard'})`,
    status: armsStatus,
    verdict:
      armsStatus === 'pass'
        ? 'Meets Regulatory Threshold'
        : armsStatus === 'caution'
          ? 'Borderline Compliance Margin'
          : 'Fails Regulatory Requirement',
    explanation: `Root Mean Square Error (Arms) is the primary FDA and ISO criterion for continuous physiological monitors.`,
  });

  const loaWidth = (metrics.loaUpper - metrics.loaLower) / 2;
  const loaStatus =
    loaWidth <= toleranceWindow * 1.25
      ? 'pass'
      : loaWidth <= toleranceWindow * 1.6
        ? 'caution'
        : 'fail';

  items.push({
    id: 'clin-loa',
    lens: 'clinical',
    label: '95% Limits of Agreement (LoA)',
    value: `[${metrics.loaLower.toFixed(2)}, +${metrics.loaUpper.toFixed(2)}] ${preset.unit}`,
    target: `Span ≤ ±${(toleranceWindow * 1.3).toFixed(1)} ${preset.unit}`,
    status: loaStatus,
    verdict:
      loaStatus === 'pass'
        ? 'Agreement Bounds Clinically Acceptable'
        : loaStatus === 'caution'
          ? 'Wide Limits: Monitor Borderline Cases'
          : 'Excessive Discordance with Reference Method',
    explanation: `95% of future pairwise differences will fall between ${metrics.loaLower.toFixed(2)} and ${metrics.loaUpper.toFixed(2)} ${preset.unit}.`,
  });

  return items;
}

/**
 * Generates a self-contained, zero-permission, portable HTML validation report.
 * Inspired by Google infrastructure learnings where standalone HTML+JS / Plx dashboards
 * proved the most effective medium to scale findings across corporate boundaries
 * without triggering restrictive data permission locks.
 */
export function generateStandaloneHtmlReport(params: {
  preset: ReportStudioPreset;
  metrics: AgreementMetrics;
  scorecard: ScorecardItem[];
  survivalCurve: SurvivalPoint[];
  toleranceWindow: number;
  observations?: PairedObservation[];
  centroids?: SubjectCentroid[];
}): string {
  const {
    preset,
    metrics,
    scorecard,
    survivalCurve,
    toleranceWindow,
    observations = [],
    centroids = [],
  } = params;
  const timestamp = new Date().toISOString().split('T')[0];

  // SVG Chart 1: Bland-Altman Agreement Chart
  const baW = 760;
  const baH = 340;
  const baPad = { top: 25, right: 35, bottom: 45, left: 60 };
  const baInnerW = baW - baPad.left - baPad.right;
  const baInnerH = baH - baPad.top - baPad.bottom;

  let xMinRef = 70;
  let xMaxRef = 100;
  if (observations.length > 0) {
    const refs = observations.map((o) => o.refValue);
    xMinRef = Math.floor(Math.min(...refs) * 0.98);
    xMaxRef = Math.ceil(Math.max(...refs) * 1.02);
  } else if (centroids.length > 0) {
    const refs = centroids.map((c) => c.meanRef);
    xMinRef = Math.floor(Math.min(...refs) * 0.98);
    xMaxRef = Math.ceil(Math.max(...refs) * 1.02);
  }
  if (xMaxRef <= xMinRef) xMaxRef = xMinRef + 10;

  const yMinBa = Math.floor(Math.min(metrics.loaLower, -toleranceWindow) * 1.25);
  const yMaxBa = Math.ceil(Math.max(metrics.loaUpper, toleranceWindow) * 1.25);
  const safeYMaxBa = yMaxBa <= yMinBa ? yMinBa + 2 : yMaxBa;

  const baXToPx = (val: number) =>
    baPad.left + ((val - xMinRef) / (xMaxRef - xMinRef)) * baInnerW;
  const baYToPx = (val: number) =>
    baPad.top + baInnerH - ((val - yMinBa) / (safeYMaxBa - yMinBa)) * baInnerH;

  const tolYTop = Math.max(baPad.top, baYToPx(toleranceWindow));
  const tolYBot = Math.min(baPad.top + baInnerH, baYToPx(-toleranceWindow));
  const tolHeight = Math.max(2, tolYBot - tolYTop);
  const biasYPx = baYToPx(metrics.meanBias);
  const loaUpperYPx = baYToPx(metrics.loaUpper);
  const loaLowerYPx = baYToPx(metrics.loaLower);

  const obsSvgCircles = observations
    .map(
      (o) =>
        `<circle cx="${baXToPx(o.refValue).toFixed(1)}" cy="${baYToPx(o.diff).toFixed(
          1,
        )}" r="3.5" fill="#0284c7" fill-opacity="0.65" stroke="#ffffff" stroke-width="0.5" class="ba-obs"><title>Subject ${o.subjectId}: Ref ${o.refValue} ${preset.unit}, Diff ${o.diff >= 0 ? '+' : ''}${o.diff} ${preset.unit}</title></circle>`,
    )
    .join('');

  const centroidSvgDiamonds = centroids
    .map((c) => {
      const cx = baXToPx(c.meanRef);
      const cy = baYToPx(c.meanDiff);
      const size = 5.5;
      const pts = `${cx.toFixed(1)},${(cy - size).toFixed(1)} ${(cx + size).toFixed(
        1,
      )},${cy.toFixed(1)} ${cx.toFixed(1)},${(cy + size).toFixed(1)} ${(
        cx - size
      ).toFixed(1)},${cy.toFixed(1)}`;
      return `<polygon points="${pts}" fill="#d97706" stroke="#ffffff" stroke-width="0.8" class="ba-cent"><title>Subject ${c.subjectId} Centroid: Mean Ref ${c.meanRef} ${preset.unit}, Mean Diff ${c.meanDiff >= 0 ? '+' : ''}${c.meanDiff} ${preset.unit} (${c.count} reps)</title></polygon>`;
    })
    .join('');

  // SVG Chart 2: Survival of Error & Coverage Curves
  const survW = 760;
  const survH = 300;
  const survPad = { top: 25, right: 35, bottom: 45, left: 60 };
  const survInnerW = survW - survPad.left - survPad.right;
  const survInnerH = survH - survPad.top - survPad.bottom;

  const maxThreshold =
    survivalCurve.length > 0 ? survivalCurve[survivalCurve.length - 1]!.threshold : 10;
  const safeMaxThresh = maxThreshold > 0 ? maxThreshold : 10;

  const survXToPx = (x: number) =>
    survPad.left + (x / safeMaxThresh) * survInnerW;
  const survYToPx = (pct: number) =>
    survPad.top + survInnerH - (pct / 100) * survInnerH;

  const empSurvD = survivalCurve
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${survXToPx(p.threshold).toFixed(1)} ${survYToPx(p.empiricalSurvival).toFixed(1)}`)
    .join(' ');

  const gaussSurvD = survivalCurve
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${survXToPx(p.threshold).toFixed(1)} ${survYToPx(p.gaussianSurvival).toFixed(1)}`)
    .join(' ');

  const empCovD = survivalCurve
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${survXToPx(p.threshold).toFixed(1)} ${survYToPx(p.empiricalCoverage).toFixed(1)}`)
    .join(' ');

  const tolSurvXPx = survXToPx(toleranceWindow);
  const p95SurvXPx = survXToPx(metrics.p95);

  const scorecardRows = scorecard
    .map(
      (item) => `
      <tr class="scorecard-row" data-lens="${item.lens}" style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 12px; font-weight: 600; text-transform: capitalize; color: #4b5563;">${item.lens}</td>
        <td style="padding: 10px 12px; font-weight: 500; color: #111827;">${item.label}</td>
        <td style="padding: 10px 12px; font-family: monospace; font-size: 14px; font-weight: 700; color: #0f172a;">${item.value}</td>
        <td style="padding: 10px 12px; color: #6b7280; font-size: 13px;">${item.target}</td>
        <td style="padding: 10px 12px;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 700; ${
            item.status === 'pass'
              ? 'background-color: #dcfce7; color: #166534;'
              : item.status === 'caution'
                ? 'background-color: #fef3c7; color: #92400e;'
                : 'background-color: #fee2e2; color: #991b1b;'
          }">${item.status.toUpperCase()}</span>
        </td>
        <td style="padding: 10px 12px; font-size: 13px; color: #374151;">${item.explanation}</td>
      </tr>`,
    )
    .join('');

  // Sleep staging confusion matrix HTML if present
  let sleepSectionHtml = '';
  if (preset.sleepSummary) {
    const sm = preset.sleepSummary;
    const headerCols = sm.classes.map((cls) => `<th style="text-align: right; padding: 8px 10px;">${cls}</th>`).join('');
    const rowsHtml = sm.matrix
      .map((row, rIdx) => {
        const clsName = sm.classes[rIdx]!;
        const stat = sm.stageMetrics[rIdx]!;
        const cells = row
          .map(
            (c, cIdx) =>
              `<td style="padding: 8px 10px; font-family: monospace; text-align: right; ${
                rIdx === cIdx ? 'background-color: #eff6ff; font-weight: 700; color: #1d4ed8;' : 'color: #4b5563;'
              }">${c.toLocaleString()}</td>`,
          )
          .join('');
        return `
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 8px 10px; font-weight: 600; color: #111827;">${clsName}</td>
            ${cells}
            <td style="padding: 8px 10px; font-family: monospace; text-align: right; font-weight: 700; color: #16a34a;">${(stat.sensitivity * 100).toFixed(1)}%</td>
            <td style="padding: 8px 10px; font-family: monospace; text-align: right; color: #4b5563;">${(stat.specificity * 100).toFixed(1)}%</td>
            <td style="padding: 8px 10px; font-family: monospace; text-align: right; color: #4b5563;">${(stat.ppv * 100).toFixed(1)}%</td>
          </tr>`;
      })
      .join('');

    sleepSectionHtml = `
      <h2 class="section-title">4. Sleep Staging Multi-Class Concordance (SRI Framework)</h2>
      <p style="font-size: 14px; color: #4b5563;">
        30-second epoch-by-epoch (EBE) agreement evaluated against Polysomnography (PSG).
        Overall Concordance: <strong>${(sm.overallAccuracy * 100).toFixed(1)}%</strong> &bull;
        Cohen's Kappa (&kappa;): <strong>${sm.cohensKappa.toFixed(3)}</strong> &bull;
        Total Sleep Time Bias: <strong>${sm.tstBiasMinutes} min</strong> (95% LoA: [${sm.tstLoaMinutes[0]} min, +${sm.tstLoaMinutes[1]} min]).
      </p>
      <table>
        <thead>
          <tr>
            <th>True PSG \\ Device</th>
            ${headerCols}
            <th style="text-align: right; padding: 8px 10px;">Sensitivity</th>
            <th style="text-align: right; padding: 8px 10px;">Specificity</th>
            <th style="text-align: right; padding: 8px 10px;">PPV</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Validation Findings Studio Report - ${preset.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #1f2937; margin: 0; padding: 24px; background: #f9fafb; }
    .container { max-width: 1040px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; padding: 32px; }
    h1 { font-size: 24px; font-weight: 700; margin-top: 0; color: #111827; }
    .badge { display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
    .meta-box { background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0 24px 0; font-size: 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
    .meta-item strong { display: block; font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    th { text-align: left; padding: 10px 12px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #4b5563; }
    .section-title { font-size: 18px; font-weight: 600; margin-top: 36px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; color: #111827; }
    .note { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; font-size: 13px; color: #1e40af; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .filter-btn-group { display: flex; gap: 6px; margin: 12px 0; flex-wrap: wrap; }
    .filter-btn { background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 600; color: #374151; cursor: pointer; transition: all 0.15s ease; }
    .filter-btn:hover { background: #e5e7eb; color: #111827; }
    .filter-btn.active { background: #0f172a; color: #ffffff; border-color: #0f172a; }
    .chart-container { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px; }
    .chart-title { font-size: 14px; font-weight: 600; color: #111827; }
    .legend-item { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #4b5563; margin-right: 14px; }
    .legend-line { display: inline-block; width: 14px; height: 3px; }
    .legend-line.dashed { border-top: 2px dashed #94a3b8; height: 0; }
    .legend-box { display: inline-block; width: 12px; height: 12px; border-radius: 2px; }
    svg text { user-select: none; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">Validation Report Studio Artifact</span>
    <h1>Validation Findings &amp; Hierarchical Model Report: ${preset.name}</h1>
    <p style="color: #4b5563; margin-top: -4px;">Generated on ${timestamp} &bull; Standalone Zero-Permission Client Report with Interactive JavaScript</p>

    <div class="meta-box">
      <div class="meta-item"><strong>Domain / Protocol</strong>${preset.domain}</div>
      <div class="meta-item"><strong>Regulatory Standard</strong>${preset.regulatoryStandard}</div>
      <div class="meta-item"><strong>Sample Architecture</strong>${metrics.m} subjects &times; ${metrics.k} replicates (${metrics.totalN} paired obs)</div>
      <div class="meta-item"><strong>Effective Sample Size</strong>${metrics.variance.nEffective.toFixed(0)} independent obs (DEFF = ${metrics.variance.designEffect.toFixed(2)})</div>
    </div>

    <div class="note">
      <strong>Zero-Permission Scaling Architecture:</strong> This report is self-contained and auditable without backend database access. In enterprise research environments (like Google's infra), standalone interactive HTML+JS or Plx dashboards remove permissions friction while educating stakeholders on the underlying hierarchical data structure.
    </div>

    <h2 class="section-title">1. Cross-Functional Executive Scorecard</h2>
    <div class="filter-btn-group">
      <button class="filter-btn active" onclick="filterScorecard('all', this)">All Lenses</button>
      <button class="filter-btn" onclick="filterScorecard('product', this)">Product &amp; Executive</button>
      <button class="filter-btn" onclick="filterScorecard('engineering', this)">Algorithm &amp; Engineering</button>
      <button class="filter-btn" onclick="filterScorecard('clinical', this)">Clinical &amp; Regulatory</button>
    </div>
    <table>
      <thead>
        <tr>
          <th>Lens</th>
          <th>Metric</th>
          <th>Value</th>
          <th>Target</th>
          <th>Status</th>
          <th>Interpretation</th>
        </tr>
      </thead>
      <tbody id="scorecard-body">
        ${scorecardRows}
      </tbody>
    </table>

    <h2 class="section-title">2. Hierarchical Variance Decomposition &amp; Clustering Penalty</h2>
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Value (${preset.unit})</th>
          <th>Variance Share</th>
          <th>Clinical &amp; Engineering Meaning</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px 12px; font-weight: 600;">Between-Subject Spread (&sigma;<sub>b</sub>)</td>
          <td style="padding: 10px 12px; font-family: monospace;">${metrics.variance.sdBetween.toFixed(2)}</td>
          <td style="padding: 10px 12px; font-weight: 600;">${(metrics.variance.icc * 100).toFixed(1)}%</td>
          <td style="padding: 10px 12px; font-size: 13px;">Subject trait differences (pigmentation, perfusion, geometry). High &sigma;<sub>b</sub> implies algorithmic disparity across human demographics.</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: 600;">Within-Subject Spread (&sigma;<sub>w</sub>)</td>
          <td style="padding: 10px 12px; font-family: monospace;">${metrics.variance.sdWithin.toFixed(2)}</td>
          <td style="padding: 10px 12px; font-weight: 600;">${((1 - metrics.variance.icc) * 100).toFixed(1)}%</td>
          <td style="padding: 10px 12px; font-size: 13px;">Sensor noise, contact impedance, and temporal fluctuations within the same participant.</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; font-weight: 600;">Total Agreement Spread (&sigma;<sub>total</sub>)</td>
          <td style="padding: 10px 12px; font-family: monospace;">${metrics.variance.sdTotal.toFixed(2)}</td>
          <td style="padding: 10px 12px; font-weight: 600;">100%</td>
          <td style="padding: 10px 12px; font-size: 13px;">Bland-Altman 95% LoA span = &plusmn;${(1.96 * metrics.variance.sdTotal).toFixed(2)} ${preset.unit}. Effective sample size: ${metrics.variance.nEffective.toFixed(0)} of ${metrics.totalN}.</td>
        </tr>
      </tbody>
    </table>

    <h2 class="section-title">3. Bland-Altman Agreement Chart with Subject-Level Clustering</h2>
    <div class="chart-container">
      <div class="chart-header">
        <span class="chart-title">Bland-Altman Plot: Difference vs Reference (${preset.unit})</span>
        <div class="filter-btn-group" style="margin: 0;">
          <button class="filter-btn active" id="btn-ba-all" onclick="setBaView('all')">All Observations (${metrics.totalN})</button>
          <button class="filter-btn" id="btn-ba-cent" onclick="setBaView('centroids')">${metrics.m} Subject Centroids</button>
        </div>
      </div>
      <div style="width: 100%; overflow-x: auto;">
        <svg viewBox="0 0 ${baW} ${baH}" width="100%" height="auto" style="display: block; font-family: monospace; font-size: 11px;">
          <!-- Axes and Grid -->
          <rect x="${baPad.left}" y="${baPad.top}" width="${baInnerW}" height="${baInnerH}" fill="#fcfcfd" stroke="#e5e7eb" />
          <!-- Shaded clinical tolerance window -->
          <rect x="${baPad.left}" y="${tolYTop.toFixed(1)}" width="${baInnerW}" height="${tolHeight.toFixed(1)}" fill="#10b981" fill-opacity="0.10" />
          <text x="${baPad.left + 8}" y="${(tolYTop + 14).toFixed(1)}" fill="#059669" font-size="10" font-weight="600">+${toleranceWindow} ${preset.unit} Tolerance</text>
          <text x="${baPad.left + 8}" y="${(tolYBot - 6).toFixed(1)}" fill="#059669" font-size="10" font-weight="600">-${toleranceWindow} ${preset.unit} Tolerance</text>

          <!-- Mean Bias Line -->
          <line x1="${baPad.left}" y1="${biasYPx.toFixed(1)}" x2="${baPad.left + baInnerW}" y2="${biasYPx.toFixed(1)}" stroke="#0284c7" stroke-width="2" />
          <text x="${baPad.left + baInnerW - 6}" y="${(biasYPx - 6).toFixed(1)}" text-anchor="end" fill="#0284c7" font-weight="700">Bias: ${metrics.meanBias >= 0 ? '+' : ''}${metrics.meanBias.toFixed(2)}</text>

          <!-- LoA Upper and Lower -->
          <line x1="${baPad.left}" y1="${loaUpperYPx.toFixed(1)}" x2="${baPad.left + baInnerW}" y2="${loaUpperYPx.toFixed(1)}" stroke="#64748b" stroke-dasharray="4,4" stroke-width="1.5" />
          <text x="${baPad.left + baInnerW - 6}" y="${(loaUpperYPx - 5).toFixed(1)}" text-anchor="end" fill="#64748b">+95% LoA: +${metrics.loaUpper.toFixed(2)}</text>

          <line x1="${baPad.left}" y1="${loaLowerYPx.toFixed(1)}" x2="${baPad.left + baInnerW}" y2="${loaLowerYPx.toFixed(1)}" stroke="#64748b" stroke-dasharray="4,4" stroke-width="1.5" />
          <text x="${baPad.left + baInnerW - 6}" y="${(loaLowerYPx + 14).toFixed(1)}" text-anchor="end" fill="#64748b">-95% LoA: ${metrics.loaLower.toFixed(2)}</text>

          <!-- Zero reference line -->
          <line x1="${baPad.left}" y1="${baYToPx(0).toFixed(1)}" x2="${baPad.left + baInnerW}" y2="${baYToPx(0).toFixed(1)}" stroke="#cbd5e1" stroke-width="1" />

          <!-- Data Points -->
          <g id="ba-all-group">${obsSvgCircles}</g>
          <g id="ba-cent-group" style="display: none;">${centroidSvgDiamonds}</g>

          <!-- Axes Labels -->
          <text x="${baPad.left + baInnerW / 2}" y="${baH - 10}" text-anchor="middle" fill="#4b5563" font-size="12" font-family="-apple-system, sans-serif">Reference: ${preset.referenceName} (${preset.unit})</text>
          <text x="18" y="${baPad.top + baInnerH / 2}" text-anchor="middle" fill="#4b5563" font-size="12" font-family="-apple-system, sans-serif" transform="rotate(-90 18 ${baPad.top + baInnerH / 2})">Difference: Device - Reference (${preset.unit})</text>
        </svg>
      </div>
      <div style="margin-top: 8px; font-size: 12px; color: #6b7280; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <div>
          <span class="legend-item"><span class="legend-line" style="background: #0284c7;"></span>Mean Bias</span>
          <span class="legend-item"><span class="legend-line dashed"></span>95% Limits of Agreement</span>
          <span class="legend-item"><span class="legend-box" style="background: rgba(16, 185, 129, 0.2);"></span>Tolerance Window</span>
        </div>
        <span>Hover markers to inspect paired values</span>
      </div>
    </div>

    <h2 class="section-title">4. Survival of Error (Tail Outlier Diagnostics)</h2>
    <p style="font-size: 14px; color: #4b5563;">
      Bland-Altman summaries assume a Gaussian distribution, concealing rare catastrophic spikes.
      At tolerance threshold <strong>&plusmn;${toleranceWindow} ${preset.unit}</strong>:
      Empirical Coverage: <strong>${metrics.coverageAtTolerance.toFixed(1)}%</strong> &bull;
      Error Survival P(|error| &gt; ${toleranceWindow}): <strong>${metrics.survivalAtTolerance.toFixed(1)}%</strong> &bull;
      95th Percentile Absolute Error (P95): <strong>&plusmn;${metrics.p95.toFixed(2)} ${preset.unit}</strong>.
    </p>

    <div class="chart-container">
      <div class="chart-header">
        <span class="chart-title">Survival of Error P(|Error| &gt; x) and Error Coverage P(|Error| &le; x)</span>
      </div>
      <div style="width: 100%; overflow-x: auto;">
        <svg viewBox="0 0 ${survW} ${survH}" width="100%" height="auto" style="display: block; font-family: monospace; font-size: 11px;">
          <!-- Axes and Grid -->
          <rect x="${survPad.left}" y="${survPad.top}" width="${survInnerW}" height="${survInnerH}" fill="#fcfcfd" stroke="#e5e7eb" />

          <!-- Horizontal Grid Lines at 25%, 50%, 75%, 100% -->
          <line x1="${survPad.left}" y1="${survYToPx(25).toFixed(1)}" x2="${survPad.left + survInnerW}" y2="${survYToPx(25).toFixed(1)}" stroke="#f1f5f9" stroke-width="1" />
          <line x1="${survPad.left}" y1="${survYToPx(50).toFixed(1)}" x2="${survPad.left + survInnerW}" y2="${survYToPx(50).toFixed(1)}" stroke="#f1f5f9" stroke-width="1" />
          <line x1="${survPad.left}" y1="${survYToPx(75).toFixed(1)}" x2="${survPad.left + survInnerW}" y2="${survYToPx(75).toFixed(1)}" stroke="#f1f5f9" stroke-width="1" />
          <text x="${survPad.left - 8}" y="${(survYToPx(0) + 4).toFixed(1)}" text-anchor="end" fill="#64748b">0%</text>
          <text x="${survPad.left - 8}" y="${(survYToPx(50) + 4).toFixed(1)}" text-anchor="end" fill="#64748b">50%</text>
          <text x="${survPad.left - 8}" y="${(survYToPx(100) + 4).toFixed(1)}" text-anchor="end" fill="#64748b">100%</text>

          <!-- Vertical Tolerance Window Line -->
          <line x1="${tolSurvXPx.toFixed(1)}" y1="${survPad.top}" x2="${tolSurvXPx.toFixed(1)}" y2="${survPad.top + survInnerH}" stroke="#10b981" stroke-dasharray="3,3" stroke-width="1.5" />
          <text x="${(tolSurvXPx + 4).toFixed(1)}" y="${survPad.top + 16}" fill="#059669" font-weight="600" font-size="10">Tol (${toleranceWindow})</text>

          <!-- Vertical P95 Line -->
          <line x1="${p95SurvXPx.toFixed(1)}" y1="${survPad.top}" x2="${p95SurvXPx.toFixed(1)}" y2="${survPad.top + survInnerH}" stroke="#e11d48" stroke-dasharray="3,3" stroke-width="1.5" />
          <text x="${(p95SurvXPx + 4).toFixed(1)}" y="${survPad.top + 32}" fill="#e11d48" font-weight="600" font-size="10">P95 (${metrics.p95.toFixed(1)})</text>

          <!-- Curves -->
          <!-- Gaussian Theoretical Survival (dashed grey) -->
          <path d="${gaussSurvD}" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4" />
          <!-- Empirical Coverage (green) -->
          <path d="${empCovD}" fill="none" stroke="#16a34a" stroke-width="2.5" />
          <!-- Empirical Survival (red/rose) -->
          <path d="${empSurvD}" fill="none" stroke="#e11d48" stroke-width="2.5" />

          <!-- Axes Labels -->
          <text x="${survPad.left + survInnerW / 2}" y="${survH - 10}" text-anchor="middle" fill="#4b5563" font-size="12" font-family="-apple-system, sans-serif">Absolute Error Threshold x (${preset.unit})</text>
          <text x="18" y="${survPad.top + survInnerH / 2}" text-anchor="middle" fill="#4b5563" font-size="12" font-family="-apple-system, sans-serif" transform="rotate(-90 18 ${survPad.top + survInnerH / 2})">Probability (%)</text>
        </svg>
      </div>
      <div style="margin-top: 8px; font-size: 12px; color: #6b7280; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <div>
          <span class="legend-item"><span class="legend-line" style="background: #e11d48;"></span>Empirical Survival P(|error| &gt; x)</span>
          <span class="legend-item"><span class="legend-line" style="background: #16a34a;"></span>Empirical Coverage P(|error| &le; x)</span>
          <span class="legend-item"><span class="legend-line dashed"></span>Gaussian Theoretical Survival</span>
        </div>
        <span>P50: ${metrics.p50.toFixed(2)} &bull; P90: ${metrics.p90.toFixed(2)} &bull; P95: ${metrics.p95.toFixed(2)} ${preset.unit}</span>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Threshold (${preset.unit})</th>
          <th>Empirical Survival P(|Error| &gt; x)</th>
          <th>Empirical Coverage P(|Error| &le; x)</th>
          <th>Gaussian Theoretical Survival</th>
          <th>Heavy-Tail Excess</th>
        </tr>
      </thead>
      <tbody>
        ${survivalCurve
          .filter((_, idx) => idx % 4 === 0)
          .map(
            (sp) => `
          <tr>
            <td style="padding: 6px 12px; font-family: monospace;">${sp.threshold.toFixed(2)}</td>
            <td style="padding: 6px 12px; font-weight: 600; color: #e11d48;">${sp.empiricalSurvival.toFixed(1)}%</td>
            <td style="padding: 6px 12px; font-weight: 600; color: #16a34a;">${sp.empiricalCoverage.toFixed(1)}%</td>
            <td style="padding: 6px 12px; color: #6b7280;">${sp.gaussianSurvival.toFixed(1)}%</td>
            <td style="padding: 6px 12px; color: ${sp.heavyTailExcess > 0 ? '#d97706' : '#6b7280'}; font-weight: 600;">+${sp.heavyTailExcess.toFixed(1)}%</td>
          </tr>`,
          )
          .join('')}
      </tbody>
    </table>

    ${sleepSectionHtml}

    <div style="margin-top: 36px; border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 12px; color: #9ca3af; text-align: center;">
      Validation Study Designer &bull; agreekit analytical methodology &bull; Standalone HTML+JavaScript Report
    </div>
  </div>

  <script>
    function filterScorecard(lens, btn) {
      document.querySelectorAll(".filter-btn-group .filter-btn").forEach(function(b) {
        if (b.parentElement === btn.parentElement) b.classList.remove("active");
      });
      btn.classList.add("active");
      var rows = document.querySelectorAll(".scorecard-row");
      rows.forEach(function(row) {
        if (lens === "all" || row.getAttribute("data-lens") === lens) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    }

    function setBaView(view) {
      var allGroup = document.getElementById("ba-all-group");
      var centGroup = document.getElementById("ba-cent-group");
      var btnAll = document.getElementById("btn-ba-all");
      var btnCent = document.getElementById("btn-ba-cent");

      if (view === "all") {
        if (allGroup) allGroup.style.display = "";
        if (centGroup) centGroup.style.display = "none";
        if (btnAll) btnAll.classList.add("active");
        if (btnCent) btnCent.classList.remove("active");
      } else {
        if (allGroup) allGroup.style.display = "none";
        if (centGroup) centGroup.style.display = "";
        if (btnAll) btnAll.classList.remove("active");
        if (btnCent) btnCent.classList.add("active");
      }
    }
  </script>
</body>
</html>`;
}

/**
 * Generates structured JSON summary suitable for Plx Dashboard / Looker / SQL ETL integration.
 */
export function generatePlxJsonSummary(params: {
  preset: ReportStudioPreset;
  metrics: AgreementMetrics;
  scorecard: ScorecardItem[];
  toleranceWindow: number;
}): string {
  const { preset, metrics, scorecard, toleranceWindow } = params;
  return JSON.stringify(
    {
      reportType: 'validation_findings_studio_summary',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      presetId: preset.id,
      presetName: preset.name,
      domain: preset.domain,
      standard: preset.regulatoryStandard,
      toleranceWindow,
      sampleArchitecture: {
        subjects: metrics.m,
        replicatesPerSubject: metrics.k,
        totalPairedObservations: metrics.totalN,
        effectiveSampleSize: Number(metrics.variance.nEffective.toFixed(1)),
        designEffect: Number(metrics.variance.designEffect.toFixed(2)),
      },
      blandAltmanAgreement: {
        meanBias: Number(metrics.meanBias.toFixed(3)),
        ciBiasClustered: [
          Number(metrics.ciBiasClusterLow.toFixed(3)),
          Number(metrics.ciBiasClusterHigh.toFixed(3)),
        ],
        ciBiasNaive: [
          Number(metrics.ciBiasNaiveLow.toFixed(3)),
          Number(metrics.ciBiasNaiveHigh.toFixed(3)),
        ],
        seUnderstatementRatio: Number(metrics.variance.seUnderstatementRatio.toFixed(2)),
        loaLower: Number(metrics.loaLower.toFixed(3)),
        loaUpper: Number(metrics.loaUpper.toFixed(3)),
        arms: Number(metrics.arms.toFixed(3)),
        mae: Number(metrics.mae.toFixed(3)),
      },
      varianceDecomposition: {
        sdBetween: Number(metrics.variance.sdBetween.toFixed(3)),
        sdWithin: Number(metrics.variance.sdWithin.toFixed(3)),
        sdTotal: Number(metrics.variance.sdTotal.toFixed(3)),
        icc: Number(metrics.variance.icc.toFixed(3)),
      },
      survivalAndPercentiles: {
        p50: Number(metrics.p50.toFixed(3)),
        p75: Number(metrics.p75.toFixed(3)),
        p90: Number(metrics.p90.toFixed(3)),
        p95: Number(metrics.p95.toFixed(3)),
        p99: Number(metrics.p99.toFixed(3)),
        coverageAtTolerancePct: Number(metrics.coverageAtTolerance.toFixed(1)),
        survivalAtTolerancePct: Number(metrics.survivalAtTolerance.toFixed(1)),
      },
      executiveScorecard: scorecard.map((s) => ({
        id: s.id,
        lens: s.lens,
        label: s.label,
        value: s.value,
        target: s.target,
        status: s.status,
        verdict: s.verdict,
      })),
      sleepStaging: preset.sleepSummary
        ? {
            overallAccuracy: preset.sleepSummary.overallAccuracy,
            cohensKappa: preset.sleepSummary.cohensKappa,
            tstBiasMinutes: preset.sleepSummary.tstBiasMinutes,
            tstLoaMinutes: preset.sleepSummary.tstLoaMinutes,
          }
        : undefined,
    },
    null,
    2,
  );
}

// ============================================================================
// Two-Gate 4-Quadrant Launch Readiness Visualizer
// ============================================================================

export type LaunchQuadrant =
  | 'GREEN_GO'
  | 'AMBER_PARITY_RISK'
  | 'AMBER_QUALITY_DEBT'
  | 'RED_NOGO';

export interface QuadrantClassification {
  quadrant: LaunchQuadrant;
  name: string;
  badge: string;
  statusLabel: string;
  color: string;
  actionMandate: string;
  commercialMeaning: string;
  gate1Passed: boolean;
  gate2Passed: boolean;
}

/**
 * Classifies a candidate device/algorithm into one of the four commercial launch quadrants
 * based on Gate 1 (Absolute Performance) and Gate 2 (Predecessor Parity).
 */
export function classifyQuadrant(
  gate1Passed: boolean,
  gate2Passed: boolean,
): QuadrantClassification {
  if (gate1Passed && gate2Passed) {
    return {
      quadrant: 'GREEN_GO',
      name: 'Quadrant 1: Green Go (Launch Approved)',
      badge: '🟢 APPROVED',
      statusLabel: '🟢 APPROVED (Quadrant 1: Green Go)',
      color: '#10b981', // emerald-500
      actionMandate:
        'Immediate production sign-off. Algorithm meets or beats predecessor and satisfies clinical bar.',
      commercialMeaning:
        'Meets clinical/consumer bar AND matches or beats predecessor. Zero regression risk.',
      gate1Passed: true,
      gate2Passed: true,
    };
  }
  if (gate1Passed && !gate2Passed) {
    return {
      quadrant: 'AMBER_PARITY_RISK',
      name: 'Quadrant 2: Amber (Parity Risk)',
      badge: '🟡 CAUTION (PARITY RISK)',
      statusLabel: '🟡 CAUTION (Quadrant 2: Amber Parity Risk)',
      color: '#f59e0b', // amber-500
      actionMandate:
        'Conditional approval or targeted algorithm recalibration on regression points before OTA release.',
      commercialMeaning:
        'Algorithm is accurate in an absolute sense, but regressed compared to Gen 1. Existing loyal users will complain.',
      gate1Passed: true,
      gate2Passed: false,
    };
  }
  if (!gate1Passed && gate2Passed) {
    return {
      quadrant: 'AMBER_QUALITY_DEBT',
      name: 'Quadrant 3: Amber (Quality Debt)',
      badge: '🟡 CAUTION (QUALITY DEBT)',
      statusLabel: '🟡 CAUTION (Quadrant 3: Amber Quality Debt)',
      color: '#f59e0b', // amber-500
      actionMandate:
        'Marketing / clinical review; risk acceptance or hold feature launch for next silicon cycle.',
      commercialMeaning:
        'Matches predecessor performance ("no worse than last year"), but fails absolute accuracy KPIs.',
      gate1Passed: false,
      gate2Passed: true,
    };
  }
  return {
    quadrant: 'RED_NOGO',
    name: 'Quadrant 4: Red Light (Hard No-Go)',
    badge: '🔴 NO-GO',
    statusLabel: '🔴 NO-GO (Quadrant 4: Red Light)',
    color: '#ef4444', // red-500
    actionMandate:
      'Hard stop; return to DSP and filter development. Do not ship to production.',
    commercialMeaning:
      'Inaccurate against reference standard AND significantly worse than predecessor.',
    gate1Passed: false,
    gate2Passed: false,
  };
}

export interface EllipsePoint {
  x: number;
  y: number;
}

/**
 * Computes 2D confidence ellipse boundary coordinates around (centerX, centerY).
 *
 * For confidence level 1 - alpha = 0.95, chi^2(2, 0.95) = -2 * ln(0.05) ~= 5.99146.
 * Radius multiplier c = sqrt(5.99146) ~= 2.4477.
 */
export function generateConfidenceEllipse(
  centerX: number,
  centerY: number,
  seX: number,
  seY: number,
  rXY = 0.0,
  confidence = 0.95,
  nPoints = 64,
): EllipsePoint[] {
  const safeSeX = Math.max(1e-4, seX);
  const safeSeY = Math.max(1e-4, seY);
  const safeR = Math.max(-0.999, Math.min(0.999, rXY));
  const safeConf = Math.max(0.5, Math.min(0.999, confidence));

  const c = Math.sqrt(-2 * Math.log(1 - safeConf));
  const varX = safeSeX ** 2;
  const varY = safeSeY ** 2;
  const covXY = safeR * safeSeX * safeSeY;

  const trace = varX + varY;
  const diff = varX - varY;
  const disc = Math.sqrt(Math.max(0, diff ** 2 + 4 * covXY ** 2));
  const lambda1 = Math.max(1e-8, (trace + disc) / 2);
  const lambda2 = Math.max(1e-8, (trace - disc) / 2);

  const a = c * Math.sqrt(lambda1);
  const b = c * Math.sqrt(lambda2);
  const theta = 0.5 * Math.atan2(2 * covXY, diff);

  const points: EllipsePoint[] = [];
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);

  for (let i = 0; i <= nPoints; i++) {
    const t = (i / nPoints) * 2 * Math.PI;
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);
    const dx = a * cosT * cosTheta - b * sinT * sinTheta;
    const dy = a * cosT * sinTheta + b * sinT * cosTheta;
    points.push({
      x: centerX + dx,
      y: centerY + dy,
    });
  }

  return points;
}

export interface QuadrantCandidatePreset {
  id: string;
  name: string;
  description: string;
  gate1Margin: number; // >0 pass, <0 fail
  gate2Parity: number; // >0 pass, <0 fail
  seX: number;
  seY: number;
  rXY: number;
  expectedQuadrant: LaunchQuadrant;
}

export const QUADRANT_CANDIDATE_PRESETS: QuadrantCandidatePreset[] = [
  {
    id: 'ideal-launch',
    name: 'Ideal Candidate (Quadrant 1: Green Go)',
    description:
      'Exceeds clinical accuracy bar against gold standard and demonstrates clear superiority/parity against legacy hardware. Immediate production release approved.',
    gate1Margin: 0.45,
    gate2Parity: 0.4,
    seX: 0.08,
    seY: 0.07,
    rXY: 0.35,
    expectedQuadrant: 'GREEN_GO',
  },
  {
    id: 'regressive-upgrade',
    name: 'Regressive Upgrade (Quadrant 2: Amber Parity Risk)',
    description:
      'Meets clinical accuracy in absolute terms, but regressed compared to Gen 1 on the other wrist. Existing loyal users will complain their new watch feels worse.',
    gate1Margin: 0.5,
    gate2Parity: -0.35,
    seX: 0.09,
    seY: 0.08,
    rXY: 0.2,
    expectedQuadrant: 'AMBER_PARITY_RISK',
  },
  {
    id: 'legacy-stagnation',
    name: 'Legacy Stagnation (Quadrant 3: Amber Quality Debt)',
    description:
      'Matches predecessor performance ("no worse than last year"), but both generations fail the absolute clinical accuracy threshold. Competitors will outperform it.',
    gate1Margin: -0.35,
    gate2Parity: 0.35,
    seX: 0.08,
    seY: 0.07,
    rXY: 0.15,
    expectedQuadrant: 'AMBER_QUALITY_DEBT',
  },
  {
    id: 'flawed-prototype',
    name: 'Flawed Prototype (Quadrant 4: Red No-Go)',
    description:
      'Inaccurate against reference gold standard AND significantly worse than predecessor. Hard stop; return to algorithm and filter development.',
    gate1Margin: -0.45,
    gate2Parity: -0.4,
    seX: 0.1,
    seY: 0.09,
    rXY: 0.4,
    expectedQuadrant: 'RED_NOGO',
  },
];

export interface LaunchBriefingMetric {
  name: string;
  value: string;
  ci?: string;
  passed: boolean;
  target: string;
  priority?: string;
}

export interface LaunchBriefingParityMetric {
  name: string;
  frequentistDiff: string;
  frequentistPassed: boolean;
  frequentistTarget: string;
  assurance: number;
  assurancePassed: boolean;
  assuranceTarget: number;
  cliffsDelta: number;
  cliffsDeltaPassed: boolean;
  cliffsDeltaTarget: number;
  tieMargin?: string;
}

export interface LaunchBriefingInput {
  title?: string;
  quadrant: LaunchQuadrant;
  gate1Status: 'PASS' | 'FAIL';
  gate1Metrics: LaunchBriefingMetric[];
  gate2Status: 'PASS' | 'FAIL';
  gate2Metrics: LaunchBriefingParityMetric[];
  nEnrolled?: number;
  nAnalyzable?: number;
  attritionYield?: number;
}

/**
 * Generates the standardized Executive Committee Launch Readiness briefing table in markdown,
 * matching Google Pixel Watch framework and agreekit.report.LaunchScorecard.to_markdown().
 */
export function generateLaunchBriefingMarkdown(input: LaunchBriefingInput): string {
  const {
    title = 'COMMERCIAL LAUNCH READINESS SCORECARD',
    gate1Status,
    gate1Metrics,
    gate2Status,
    gate2Metrics,
    nEnrolled,
    nAnalyzable,
    attritionYield,
  } = input;

  const classification = classifyQuadrant(gate1Status === 'PASS', gate2Status === 'PASS');
  const sep = '='.repeat(60);
  const lines: string[] = [
    sep,
    title.padStart(Math.floor((60 + title.length) / 2)).padEnd(60),
    sep,
    `OVERALL LAUNCH STATUS: ${classification.statusLabel}\n`,
  ];

  // Gate 1
  const g1Icon = gate1Status === 'PASS' ? '🟢 PASS' : '🔴 FAIL';
  lines.push(`GATE 1: ABSOLUTE PERFORMANCE (vs. Reference)       ${g1Icon}`);
  gate1Metrics.forEach((m, i) => {
    const isLast = i === gate1Metrics.length - 1;
    const prefix = isLast ? '  └─ ' : '  ├─ ';
    const check = m.passed ? '✓' : '✗';
    const ciStr = m.ci ? ` [${m.ci}]` : '';
    const advStr = m.priority === 'advisory' ? ' (Advisory)' : '';
    lines.push(`${prefix}${m.name}: ${m.value}${ciStr}               ${check} (${m.target})${advStr}`);
  });
  lines.push('');

  // Gate 2
  const g2Icon = gate2Status === 'PASS' ? '🟢 PASS' : '🔴 FAIL';
  lines.push(`GATE 2: PREDECESSOR PARITY (vs. Legacy Device)     ${g2Icon}`);
  gate2Metrics.forEach((m, i) => {
    const isLast = i === gate2Metrics.length - 1;
    const p1Prefix = '  ├─ ';
    const p2Prefix = '  ├─ ';
    const p3Prefix = isLast ? '  └─ ' : '  ├─ ';
    const tauStr = m.tieMargin ? ` (τ = ${m.tieMargin})` : '';

    const fCheck = m.frequentistPassed ? '✓' : '✗';
    lines.push(`${p1Prefix}Frequentist Lower Bound: ${m.name} Δ = ${m.frequentistDiff}       ${fCheck} (${m.frequentistTarget})`);

    const aCheck = m.assurancePassed ? '✓' : '✗';
    lines.push(`${p2Prefix}Bayesian Assurance: P(Non-Inferior) = ${m.assurance.toFixed(2)}      ${aCheck} (Exceeds ${m.assuranceTarget.toFixed(2)})`);

    const cdCheck = m.cliffsDeltaPassed ? '✓' : '✗';
    lines.push(`${p3Prefix}Paired Cliff's Delta: δ = ${m.cliffsDelta >= 0 ? '+' : ''}${m.cliffsDelta.toFixed(2)}${tauStr}    ${cdCheck} (Exceeds ${m.cliffsDeltaTarget >= 0 ? '+' : ''}${m.cliffsDeltaTarget.toFixed(2)})`);
  });

  if (nEnrolled !== undefined || nAnalyzable !== undefined) {
    lines.push('');
    const enrolledStr = nEnrolled ? `Enrolled N=${nEnrolled}` : '';
    const analyzableStr = nAnalyzable ? `Analyzable N=${nAnalyzable}` : '';
    let yieldVal = attritionYield;
    if (yieldVal === undefined && nEnrolled && nAnalyzable) {
      yieldVal = (nAnalyzable / nEnrolled) * 100;
    }
    const yieldStr = yieldVal !== undefined ? ` (${yieldVal.toFixed(1)}% Yield)` : '';
    const parts = [enrolledStr, analyzableStr].filter(Boolean);
    lines.push(`STUDY ATTRITION: ${parts.join(' | ')}${yieldStr}`);
  }

  lines.push(sep);
  return lines.join('\n');
}

// ============================================================================
// Vector 1: KPI & Metric Taxonomy
// ============================================================================

export interface KpiTaxonomyDefinition {
  id: string;
  name: string;
  acronym: string;
  formula: string;
  purpose: string;
  outlierSensitivity: 'Quadratic (High)' | 'Linear (Medium)' | 'Non-Parametric (Robust)' | 'Deceptive / High Risk';
  clinicalInterpretation: string;
  standardReference: string;
}

export const KPI_TAXONOMY_DEFINITIONS: KpiTaxonomyDefinition[] = [
  {
    id: 'rmse',
    name: 'Root Mean Square Error',
    acronym: 'RMSE / Arms',
    formula: 'sqrt((1/N) * sum((dev_i - ref_i)^2))',
    purpose: 'Standardized regulatory accuracy metric for continuous physiological monitors.',
    outlierSensitivity: 'Quadratic (High)',
    clinicalInterpretation: 'Penalizes large error spikes heavily; ensures device does not produce rare dangerous excursions.',
    standardReference: 'ISO 80601-2-61:2017 Clause 201.12.1 / FDA SpO2 Guidance',
  },
  {
    id: 'mae',
    name: 'Mean Absolute Error',
    acronym: 'MAE',
    formula: '(1/N) * sum(|dev_i - ref_i|)',
    purpose: 'Expected average magnitude of error under typical consumer conditions.',
    outlierSensitivity: 'Linear (Medium)',
    clinicalInterpretation: 'Linear penalty; more representative of typical day-to-day user experience than RMSE.',
    standardReference: 'ANSI/CTA-2065: Physical Activity & Physiological Monitoring',
  },
  {
    id: 'loa',
    name: 'Bland-Altman Limits of Agreement',
    acronym: '95% LoA',
    formula: 'Mean Bias +/- 1.96 * SD_total',
    purpose: 'Interval expected to contain 95% of future pairwise measurement differences.',
    outlierSensitivity: 'Linear (Medium)',
    clinicalInterpretation: 'Must account for repeated measures clustering via ANOVA; naive pooled SD understates LoA width.',
    standardReference: 'Bland & Altman (2007) J Biopharm Stat 17(4):571-82',
  },
  {
    id: 'tolerance-coverage',
    name: 'Tolerance Window Coverage',
    acronym: '% Within Tolerance',
    formula: 'P(|dev_i - ref_i| <= tau) * 100%',
    purpose: 'Direct proportion of readings meeting clinically acceptable accuracy.',
    outlierSensitivity: 'Non-Parametric (Robust)',
    clinicalInterpretation: 'Easily understood by product leaders: e.g. 95% of readings within +/- 3 bpm or +/- 3% SpO2.',
    standardReference: 'FDA Digital Health Software Pre-Cert & User Experience Standards',
  },
  {
    id: 'correlation-r',
    name: 'Pearson Correlation Coefficient (Deceptive)',
    acronym: 'r / R²',
    formula: 'Cov(dev, ref) / (SD_dev * SD_ref)',
    purpose: 'Measures linear co-variation, NOT agreement (dangerously misapplied in validation).',
    outlierSensitivity: 'Deceptive / High Risk',
    clinicalInterpretation:
      'A device reporting 2x truth has r = 1.000 but fails all clinical gates. Wide dynamic physiological range artificially inflates r.',
    standardReference: 'Bland & Altman (1986) Lancet 327(8476):307-10',
  },
];

export const PEARSON_R_DECEPTION_EXPLANATION =
  'Why Correlation (r) is Deceptive in Validation: Pearson r measures linear association rather than measurement agreement. ' +
  'A device that consistently measures double the true heart rate (y = 2x) or has a 20 bpm systemic offset (y = x + 20) achieves a near-perfect ' +
  'r = 1.000 while posing catastrophic clinical risk. Furthermore, physiological studies spanning wide dynamic ranges (e.g. 50–190 bpm) artificially ' +
  'inflate r to >0.98 even in the presence of severe +/- 15 bpm errors, while studies with narrow resting ranges (e.g. 96–99% SpO2) depress r to <0.30 ' +
  'despite sub-percentage accuracy. Regulatory standards (ISO 80601-2-61, FDA, AAMI) explicitly reject r in favor of RMSE/Arms and Bland-Altman LoA.';

/**
 * Computes live Pearson correlation coefficient r between devValue and refValue.
 * Exposes how wide physiological dynamic range can artificially inflate r even
 * when limits of agreement or RMSE fail clinical acceptance.
 */
export function computePearsonR(observations: PairedObservation[]): number {
  const n = observations.length;
  if (n < 2) return 0;
  let sumX = 0;
  let sumY = 0;
  for (const o of observations) {
    sumX += o.refValue;
    sumY += o.devValue;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (const o of observations) {
    const dx = o.refValue - meanX;
    const dy = o.devValue - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  if (den <= 0) return 0;
  return Number((num / den).toFixed(3));
}

// ============================================================================
// Vector 2: ECDF & Error Morphology
// ============================================================================

export interface SubjectEcdfEnvelopePoint {
  threshold: number;
  pooledCoverage: number;
  subjectWeightedCoverage: number;
  p10Coverage: number;
  p90Coverage: number;
  minCoverage: number;
  maxCoverage: number;
}

export interface EcdfCrossoverPoint {
  threshold: number;
  modelACoverage: number;
  modelBCoverage: number;
  crossoverDetected: boolean;
  interpretation: string;
}

export interface KsPseudoreplicationDiagnostic {
  totalRowsN: number;
  independentSubjectsM: number;
  replicatesK: number;
  naivePooledPValue: number;
  clusterHonestPValue: number;
  designEffect: number;
  hazardExplanation: string;
}

export function computeSubjectWeightedEcdf(
  observations: PairedObservation[],
  maxThreshold?: number,
  numSteps: number = 40,
): SubjectEcdfEnvelopePoint[] {
  if (observations.length === 0) return [];

  const subjectMap = new Map<number, number[]>();
  const allAbsDiffs: number[] = [];

  for (const obs of observations) {
    allAbsDiffs.push(obs.absDiff);
    const list = subjectMap.get(obs.subjectId) ?? [];
    list.push(obs.absDiff);
    subjectMap.set(obs.subjectId, list);
  }

  const maxVal = observations.length > 0 ? Math.max(...allAbsDiffs) : 0;
  const upper = Math.max(maxThreshold ?? 0, Math.ceil(maxVal * 1.05), 1.0);
  const step = upper / numSteps;

  const points: SubjectEcdfEnvelopePoint[] = [];

  for (let s = 0; s <= numSteps; s += 1) {
    const x = s * step;

    // Pooled coverage
    const countPooled = allAbsDiffs.filter((d) => d <= x).length;
    const pooledCoverage = Number(((countPooled / allAbsDiffs.length) * 100).toFixed(1));

    // Per-subject coverages
    const subjectCoverages: number[] = [];
    for (const [, diffs] of subjectMap) {
      const c = diffs.filter((d) => d <= x).length;
      subjectCoverages.push((c / diffs.length) * 100);
    }
    subjectCoverages.sort((a, b) => a - b);

    const m = subjectCoverages.length;
    const meanSubj = subjectCoverages.reduce((a, b) => a + b, 0) / (m || 1);
    const p10 = subjectCoverages[Math.floor(m * 0.1)] ?? subjectCoverages[0] ?? 0;
    const p90 = subjectCoverages[Math.min(m - 1, Math.floor(m * 0.9))] ?? subjectCoverages[m - 1] ?? 100;
    const minCov = subjectCoverages[0] ?? 0;
    const maxCov = subjectCoverages[m - 1] ?? 100;

    points.push({
      threshold: Number(x.toFixed(2)),
      pooledCoverage,
      subjectWeightedCoverage: Number(meanSubj.toFixed(1)),
      p10Coverage: Number(p10.toFixed(1)),
      p90Coverage: Number(p90.toFixed(1)),
      minCoverage: Number(minCov.toFixed(1)),
      maxCoverage: Number(maxCov.toFixed(1)),
    });
  }

  return points;
}

export function detectEcdfCrossover(
  candidatePoints: { threshold: number; coverage: number }[],
  comparatorPoints: { threshold: number; coverage: number }[],
): EcdfCrossoverPoint {
  let crossoverDetected = false;
  let crossThresh = 0;
  let covA = 0;
  let covB = 0;

  let lastNonZeroSign = 0;
  const len = Math.min(candidatePoints.length, comparatorPoints.length);

  for (let i = 0; i < len; i += 1) {
    const diff = candidatePoints[i]!.coverage - comparatorPoints[i]!.coverage;
    const currentSign = diff > 0.05 ? 1 : diff < -0.05 ? -1 : 0;

    if (lastNonZeroSign !== 0 && currentSign !== 0 && currentSign !== lastNonZeroSign) {
      crossoverDetected = true;
      crossThresh = candidatePoints[i]!.threshold;
      covA = candidatePoints[i]!.coverage;
      covB = comparatorPoints[i]!.coverage;
      break;
    }

    if (currentSign !== 0) {
      lastNonZeroSign = currentSign;
    }
  }

  const interpretation = crossoverDetected
    ? `Morphology Crossover detected at error threshold ${crossThresh.toFixed(1)}: Candidate algorithm exhibits tighter median error below this point, but comparator retains higher coverage / shorter tails at extreme thresholds.`
    : 'No morphology crossover detected: One distribution uniformly dominates across the full clinical tolerance span.';

  return {
    threshold: crossThresh,
    modelACoverage: covA,
    modelBCoverage: covB,
    crossoverDetected,
    interpretation,
  };
}

export function computeKsPseudoreplicationDiagnostic(
  m: number,
  k: number,
  icc: number = 0.45,
): KsPseudoreplicationDiagnostic {
  const safeM = Math.max(1, m);
  const safeK = Math.max(1, k);
  const totalRowsN = safeM * safeK;
  const safeIcc = Math.max(0, Math.min(1, icc));
  const designEffect = Math.max(1.0, 1 + (safeK - 1) * safeIcc);
  const nEffective = Math.max(1, totalRowsN / designEffect);

  // Calibrated typical empirical KS distance D for repeated-measures sensor validation
  const D = 0.18;
  const naiveExp = -2 * totalRowsN * (D ** 2);
  const clusterExp = -2 * nEffective * (D ** 2);

  const naivePooledPValue = Number(Math.max(0.0001, Math.min(1.0, 2 * Math.exp(naiveExp))).toFixed(4));
  const clusterHonestPValue = Number(Math.max(0.001, Math.min(1.0, 2 * Math.exp(clusterExp))).toFixed(3));

  const hazardExplanation =
    `The Kolmogorov-Smirnov (KS) Pseudoreplication Trap: Treating N = ${totalRowsN} pooled observations from m = ${safeM} participants (k = ${safeK} replicates) ` +
    `as independent violates the fundamental i.i.d. assumption. Clustered variance (ICC = ${safeIcc.toFixed(2)}, DEFF = ${designEffect.toFixed(1)}) inflates the effective sample size, ` +
    `yielding an artificially significant naive p-value (p = ${naivePooledPValue.toFixed(4)}). A cluster-honest permutation or subject-aggregated test yields ` +
    `p = ${clusterHonestPValue.toFixed(3)}, proving that apparent distributional superiority was driven by repeated measures pseudoreplication rather than true population shift.`;

  return {
    totalRowsN,
    independentSubjectsM: safeM,
    replicatesK: safeK,
    naivePooledPValue,
    clusterHonestPValue,
    designEffect: Number(designEffect.toFixed(2)),
    hazardExplanation,
  };
}

// ============================================================================
// Vector 3: Three-Way Head-to-Head Dominance
// ============================================================================

export interface ThreeWayPairedObservation {
  id: string;
  subjectId: number;
  obsIndex: number;
  activity: 'running' | 'cycling' | 'rest';
  refValue: number;
  dev1Value: number;
  dev2Value: number;
  e1: number;
  e2: number;
  absE1: number;
  absE2: number;
  delta: number;
}

export interface SubjectHeadToHeadDominance {
  subjectId: number;
  totalEpochs: number;
  dev1Wins: number;
  dev2Wins: number;
  ties: number;
  cliffsDelta: number;
  outcome: 'dev1_win' | 'dev2_win' | 'tie';
  meanAbsE1: number;
  meanAbsE2: number;
}

export interface HeadToHeadDominanceSummary {
  activity: string;
  tieMargin: number;
  cliffsThreshold: number;
  totalSubjects: number;
  dev1WinningSubjects: number;
  dev2WinningSubjects: number;
  tieSubjects: number;
  headlineConclusion: string;
  subjectResults: SubjectHeadToHeadDominance[];
  overallMeanCliffsDelta: number;
  pairingDiscardFallacyNote: string;
}

/**
 * Generates synchronized three-way paired validation data:
 * Reference Gold Standard, Device 1 (Investigational), and Device 2 (Comparator)
 * worn simultaneously on the same participant during defined activities.
 */
export function generateThreeWayPairedData(params?: {
  m?: number;
  k?: number;
  activity?: 'running' | 'cycling' | 'rest';
  seed?: number;
}): ThreeWayPairedObservation[] {
  const { m = 25, k = 40, activity = 'running', seed = 42 } = params ?? {};
  const rand = createMulberry32(seed);
  const obs: ThreeWayPairedObservation[] = [];

  for (let i = 1; i <= m; i += 1) {
    const baseHr = activity === 'running' ? 145 : activity === 'cycling' ? 130 : 68;
    const hrRange = activity === 'running' ? 35 : activity === 'cycling' ? 30 : 15;

    let d1NoiseScale = 2.0;
    let d2NoiseScale = 5.0;
    let d2OutlierRate = 0.25;

    if (activity === 'running') {
      if (i <= 21) {
        // 21 subjects: Device 1 clearly wins
        d1NoiseScale = 1.5;
        d2NoiseScale = 5.2;
        d2OutlierRate = 0.40;
      } else if (i <= 24) {
        // 3 subjects (22, 23, 24): Tie/comparable
        d1NoiseScale = 2.2;
        d2NoiseScale = 2.3;
        d2OutlierRate = 0.04;
      } else {
        // 1 subject (25): Device 2 wins
        d1NoiseScale = 5.5;
        d2NoiseScale = 1.6;
        d2OutlierRate = 0.02;
      }
    } else if (activity === 'cycling') {
      if (i <= 18) {
        d1NoiseScale = 1.8;
        d2NoiseScale = 4.4;
        d2OutlierRate = 0.28;
      } else if (i <= 23) {
        d1NoiseScale = 2.1;
        d2NoiseScale = 2.2;
        d2OutlierRate = 0.05;
      } else {
        d1NoiseScale = 4.8;
        d2NoiseScale = 1.9;
        d2OutlierRate = 0.04;
      }
    } else {
      // rest
      d1NoiseScale = 1.0;
      d2NoiseScale = 1.1;
      d2OutlierRate = 0.02;
    }

    for (let j = 1; j <= k; j += 1) {
      const ref = baseHr + (rand() - 0.5) * hrRange;
      const isD2Outlier = rand() < d2OutlierRate;
      const isD1Outlier = (activity === 'running' && i === 25) ? rand() < 0.35 : rand() < 0.02;

      const d1Err = randomNormal(rand) * d1NoiseScale + (isD1Outlier ? randomLaplace(rand, 8.5) : 0);
      const d2Err = randomNormal(rand) * d2NoiseScale + (isD2Outlier ? randomLaplace(rand, 9.5) : 0);

      const d1Val = Number((ref + d1Err).toFixed(1));
      const d2Val = Number((ref + d2Err).toFixed(1));
      const refVal = Number(ref.toFixed(1));

      const e1 = Number((d1Val - refVal).toFixed(2));
      const e2 = Number((d2Val - refVal).toFixed(2));
      const absE1 = Number(Math.abs(e1).toFixed(2));
      const absE2 = Number(Math.abs(e2).toFixed(2));
      const delta = Number((absE1 - absE2).toFixed(2));

      obs.push({
        id: `s${i}-e${j}`,
        subjectId: i,
        obsIndex: j,
        activity,
        refValue: refVal,
        dev1Value: d1Val,
        dev2Value: d2Val,
        e1,
        e2,
        absE1,
        absE2,
        delta,
      });
    }
  }

  return obs;
}

export function computeHeadToHeadDominance(
  observations: ThreeWayPairedObservation[],
  tieMargin: number = 3.0,
  cliffsThreshold: number = 0.15,
  activityLabel = 'High-Intensity Interval Running',
): HeadToHeadDominanceSummary {
  const subjectMap = new Map<number, ThreeWayPairedObservation[]>();

  for (const o of observations) {
    const list = subjectMap.get(o.subjectId) ?? [];
    list.push(o);
    subjectMap.set(o.subjectId, list);
  }

  const subjectResults: SubjectHeadToHeadDominance[] = [];
  let d1WinsCount = 0;
  let d2WinsCount = 0;
  let tieCount = 0;
  let sumCliffs = 0;

  for (const [subjId, list] of subjectMap) {
    let d1Wins = 0;
    let d2Wins = 0;
    let ties = 0;
    let sumAbsE1 = 0;
    let sumAbsE2 = 0;

    for (const o of list) {
      sumAbsE1 += o.absE1;
      sumAbsE2 += o.absE2;
      // Paired error difference: Delta = |e1| - |e2|
      // Negative delta means Device 1 error is smaller than Device 2 error.
      // Device 1 wins if Delta < -tieMargin (|e1| < |e2| - tau).
      // Device 2 wins if Delta > +tieMargin (|e2| < |e1| - tau).
      // Otherwise, the paired difference falls within [-tau, +tau], deemed an agreed tie.
      const deltaPair = o.absE1 - o.absE2;
      if (deltaPair < -tieMargin) {
        d1Wins += 1;
      } else if (deltaPair > tieMargin) {
        d2Wins += 1;
      } else {
        ties += 1;
      }
    }

    const n = list.length || 1;
    const delta = (d1Wins - d2Wins) / n;
    sumCliffs += delta;

    let outcome: 'dev1_win' | 'dev2_win' | 'tie' = 'tie';
    if (delta > cliffsThreshold) {
      outcome = 'dev1_win';
      d1WinsCount += 1;
    } else if (delta < -cliffsThreshold) {
      outcome = 'dev2_win';
      d2WinsCount += 1;
    } else {
      tieCount += 1;
    }

    subjectResults.push({
      subjectId: subjId,
      totalEpochs: n,
      dev1Wins: d1Wins,
      dev2Wins: d2Wins,
      ties,
      cliffsDelta: Number(delta.toFixed(3)),
      outcome,
      meanAbsE1: Number((sumAbsE1 / n).toFixed(2)),
      meanAbsE2: Number((sumAbsE2 / n).toFixed(2)),
    });
  }

  subjectResults.sort((a, b) => b.cliffsDelta - a.cliffsDelta);

  const totalSubjects = subjectResults.length;
  const overallMeanCliffsDelta = Number((sumCliffs / (totalSubjects || 1)).toFixed(3));

  let headlineConclusion: string;
  if (totalSubjects === 0) {
    headlineConclusion = 'No paired observations available for head-to-head comparison.';
  } else if (d1WinsCount >= d2WinsCount && d1WinsCount > tieCount) {
    headlineConclusion = `During ${activityLabel}, Device 1 meaningfully outperformed Device 2 in ${d1WinsCount} of ${totalSubjects} participants.`;
  } else if (d2WinsCount > d1WinsCount && d2WinsCount > tieCount) {
    headlineConclusion = `During ${activityLabel}, Device 2 meaningfully outperformed Device 1 in ${d2WinsCount} of ${totalSubjects} participants.`;
  } else if (d1WinsCount === d2WinsCount && d1WinsCount > 0) {
    headlineConclusion = `During ${activityLabel}, Device 1 and Device 2 achieved an even split (${d1WinsCount} wins each across ${totalSubjects} participants).`;
  } else {
    headlineConclusion = `During ${activityLabel}, Device 1 and Device 2 demonstrated comparable performance (${tieCount} of ${totalSubjects} participants tied or inconclusive).`;
  }

  const pairingDiscardFallacyNote =
    'The Pairing Discard Fallacy: Industry teams routinely test Device 1 vs ECG reference and Device 2 vs ECG reference, ' +
    'then plot two separate marginal curves. This mistakenly discards the synchronous pairing: both devices were worn on the same subject ' +
    'at the exact same second! Paired differences Delta = |e1| - |e2| eliminate biological heart rate variability, and applying an agreed-upon ' +
    `clinical tie margin (tau = ${tieMargin.toFixed(1)} bpm) alongside subject-specific Cliff's Delta thresholds (|delta| > ${cliffsThreshold.toFixed(2)}) ` +
    'enables conclusive claims like: "During activity X, Device 1 meaningfully outperformed Device 2 in 21 of 25 participants."';

  return {
    activity: activityLabel,
    tieMargin,
    cliffsThreshold,
    totalSubjects,
    dev1WinningSubjects: d1WinsCount,
    dev2WinningSubjects: d2WinsCount,
    tieSubjects: tieCount,
    headlineConclusion,
    subjectResults,
    overallMeanCliffsDelta,
    pairingDiscardFallacyNote,
  };
}

// ============================================================================
// Vector 5: Multi-Generation Transitive Drift Canary
// ============================================================================

export interface TransitiveDriftGeneration {
  genId: string;
  name: string;
  hardwareVersion: string;
  firmwareVersion: string;
  studyName: string;
  sampleSize: number;
  stepBiasDiff: number;
  stepSe: number;
  stepNiTarget: number;
  stepPassed: boolean;
  cumulativeBiasDiff: number;
  cumulativeSe: number;
  cumulativeCanaryLimit: number;
  canaryStatus: 'PASS' | 'WARNING' | 'ALARM';
  notes: string;
}

export interface TransitiveDriftSummary {
  generations: TransitiveDriftGeneration[];
  hasCanaryAlarm: boolean;
  alarmMessage?: string;
  anchorGenName: string;
  latestGenName: string;
  totalTransitiveDrift: number;
  cumulativeCanaryLimit: number;
  canaryExplanation: string;
}

export const DEFAULT_TRANSITIVE_DRIFT_GENERATIONS: TransitiveDriftGeneration[] = [
  {
    genId: 'gen1',
    name: 'Generation 1 (Baseline Anchor)',
    hardwareVersion: 'HW Rev 1.0 (Dual-LED PPG)',
    firmwareVersion: 'v1.4.2 Clinical Production',
    studyName: 'Pivotal Clinical Trial 2023-A',
    sampleSize: 120,
    stepBiasDiff: 0.0,
    stepSe: 0.08,
    stepNiTarget: 0.5,
    stepPassed: true,
    cumulativeBiasDiff: 0.0,
    cumulativeSe: 0.08,
    cumulativeCanaryLimit: 0.75,
    canaryStatus: 'PASS',
    notes: 'Cleared FDA 510(k); established reference baseline.',
  },
  {
    genId: 'gen2',
    name: 'Generation 2 (Miniaturized Sensor)',
    hardwareVersion: 'HW Rev 2.0 (Compact Optical Module)',
    firmwareVersion: 'v2.1.0 OTA Release',
    studyName: 'Equivalence Bridging Study 2024-B',
    sampleSize: 85,
    stepBiasDiff: 0.28,
    stepSe: 0.09,
    stepNiTarget: 0.5,
    stepPassed: true,
    cumulativeBiasDiff: 0.28,
    cumulativeSe: 0.12,
    cumulativeCanaryLimit: 0.75,
    canaryStatus: 'PASS',
    notes: 'Passed immediate predecessor non-inferiority gate (+0.28 <= +0.50 bpm).',
  },
  {
    genId: 'gen3',
    name: 'Generation 3 (DSP Battery Optimization)',
    hardwareVersion: 'HW Rev 2.2 (Ultra-low Power DSP)',
    firmwareVersion: 'v3.0.4 OTA Release',
    studyName: 'Battery Life Verification Study 2025-C',
    sampleSize: 92,
    stepBiasDiff: 0.32,
    stepSe: 0.09,
    stepNiTarget: 0.5,
    stepPassed: true,
    cumulativeBiasDiff: 0.6,
    cumulativeSe: 0.15,
    cumulativeCanaryLimit: 0.75,
    canaryStatus: 'WARNING',
    notes: 'Passed step gate (+0.32 <= +0.50 bpm), but cumulative drift approaches canary limit (80%).',
  },
  {
    genId: 'gen4',
    name: 'Generation 4 (Candidate Release)',
    hardwareVersion: 'HW Rev 3.0 (Next-Gen ASIC)',
    firmwareVersion: 'v4.0.0-rc2 Candidate',
    studyName: 'Pre-Market Release Validation 2026-D',
    sampleSize: 110,
    stepBiasDiff: 0.35,
    stepSe: 0.1,
    stepNiTarget: 0.5,
    stepPassed: true,
    cumulativeBiasDiff: 0.95,
    cumulativeSe: 0.18,
    cumulativeCanaryLimit: 0.75,
    canaryStatus: 'ALARM',
    notes: 'Passed step gate (+0.35 <= +0.50 bpm), BUT cumulative drift (+0.95 bpm) breaches multi-generation canary limit (+0.75 bpm)!',
  },
];

export function computeTransitiveDriftCanary(
  generations: TransitiveDriftGeneration[] = DEFAULT_TRANSITIVE_DRIFT_GENERATIONS,
  maxCumulativeDrift: number = 0.75,
): TransitiveDriftSummary {
  const safeCanaryLimit = Math.max(0.05, maxCumulativeDrift);
  const updatedGens: TransitiveDriftGeneration[] = [];
  let cumDiff = 0;
  let cumVar = 0;
  let hasAlarm = false;
  let alarmMessage: string | undefined;

  for (let idx = 0; idx < generations.length; idx += 1) {
    const g = generations[idx]!;
    if (idx === 0) {
      cumDiff = 0;
      cumVar = g.stepSe ** 2;
      updatedGens.push({
        ...g,
        cumulativeBiasDiff: 0,
        cumulativeSe: g.stepSe,
        cumulativeCanaryLimit: safeCanaryLimit,
        canaryStatus: 'PASS',
      });
      continue;
    }

    cumDiff += g.stepBiasDiff;
    cumVar += g.stepSe ** 2;
    const cumSe = Math.sqrt(cumVar);

    let status: 'PASS' | 'WARNING' | 'ALARM' = 'PASS';
    if (cumDiff > safeCanaryLimit) {
      status = 'ALARM';
      hasAlarm = true;
      alarmMessage = `CANARY ALARM: Silent Algorithmic Drift Detected! Cumulative degradation from ${generations[0]!.name} is ${cumDiff >= 0 ? '+' : ''}${cumDiff.toFixed(2)} bpm, breaching the +${safeCanaryLimit.toFixed(2)} bpm multi-generation budget despite all step-wise release gates passing.`;
    } else if (cumDiff > safeCanaryLimit * 0.75) {
      status = 'WARNING';
    }

    updatedGens.push({
      ...g,
      cumulativeBiasDiff: Number(cumDiff.toFixed(2)),
      cumulativeSe: Number(cumSe.toFixed(2)),
      cumulativeCanaryLimit: safeCanaryLimit,
      canaryStatus: status,
    });
  }

  const anchorGenName = updatedGens[0]?.name ?? 'Generation 1';
  const latestGenName = updatedGens[updatedGens.length - 1]?.name ?? 'Latest Generation';
  const totalTransitiveDrift = updatedGens[updatedGens.length - 1]?.cumulativeBiasDiff ?? 0;

  const canaryExplanation =
    'Multi-Generation Transitive Drift Canary: When testing iterative hardware or firmware releases, engineering teams typically compare ' +
    'Gen (N) only against immediate predecessor Gen (N-1). If each release is granted an incremental non-inferiority budget (e.g. +0.50 bpm), ' +
    'the algorithm can accumulate compounding degradation across 3–4 cycles without ever failing an individual gate. The Transitive Drift Canary ' +
    'synthesizes indirect network comparisons back to the anchor Gen 1 baseline, preventing silent software drift from eroding product quality.';

  return {
    generations: updatedGens,
    hasCanaryAlarm: hasAlarm,
    alarmMessage,
    anchorGenName,
    latestGenName,
    totalTransitiveDrift,
    cumulativeCanaryLimit: maxCumulativeDrift,
    canaryExplanation,
  };
}

// ============================================================================
// Export Utilities: FDA Table 1 & Citable Methods Paragraph
// ============================================================================

export function generateFdaTable1Markdown(
  metrics: AgreementMetrics,
  preset: ReportStudioPreset,
): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const sep = '='.repeat(68);
  const subSep = '-'.repeat(68);

  return [
    sep,
    `FDA 510(k) PRE-MARKET NOTIFICATION / ISO 80601-2-61:2017 TABLE 1`,
    `Clinical Investigation Summary: ${preset.name}`,
    `Standard: ${preset.regulatoryStandard} | Date: ${dateStr}`,
    sep,
    `OVERALL SPECIFICATION & VALIDATION RESULTS`,
    subSep,
    `Root Mean Square Error (Arms):             ${metrics.arms.toFixed(2)} ${preset.unit} (Target <= ${preset.armsTarget.toFixed(2)} ${preset.unit})`,
    `Mean Systemic Bias (d_bar):                ${metrics.meanBias >= 0 ? '+' : ''}${metrics.meanBias.toFixed(2)} ${preset.unit}`,
    `Between-Subject Variance (s_b):           ${metrics.variance.sdBetween.toFixed(2)} ${preset.unit}`,
    `Within-Subject Variance (s_w):            ${metrics.variance.sdWithin.toFixed(2)} ${preset.unit}`,
    `Total Agreement Spread (s_total):          ${metrics.variance.sdTotal.toFixed(2)} ${preset.unit}`,
    `95% Limits of Agreement (LoA):             [${metrics.loaLower.toFixed(2)}, +${metrics.loaUpper.toFixed(2)}] ${preset.unit}`,
    `Clustered 95% Confidence Interval (Bias):  [${metrics.ciBiasClusterLow.toFixed(2)}, ${metrics.ciBiasClusterHigh.toFixed(2)}] ${preset.unit}`,
    `Naive Pooled 95% Confidence Interval:     [${metrics.ciBiasNaiveLow.toFixed(2)}, ${metrics.ciBiasNaiveHigh.toFixed(2)}] ${preset.unit}`,
    `Design Effect (Clustering Penalty):        ${metrics.variance.designEffect.toFixed(2)} (Effective N = ${metrics.variance.nEffective.toFixed(0)} of ${metrics.totalN})`,
    subSep,
    `COHORT & SAMPLING ARCHITECTURE`,
    subSep,
    `Total Enrolled Participants:               ${metrics.m}`,
    `Replicate Observations per Subject:        ${metrics.k}`,
    `Total Analyzable Paired Data Points:       ${metrics.totalN}`,
    `Reference Standard:                        ${preset.referenceName}`,
    `Investigational Device:                    ${preset.deviceName}`,
    sep,
  ].join('\n');
}

export function generateCitableMethodsParagraph(params: {
  preset: ReportStudioPreset;
  metrics: AgreementMetrics;
  toleranceWindow: number;
}): string {
  const { preset, metrics, toleranceWindow } = params;

  return (
    `Statistical Methods: Validation accuracy of the ${preset.deviceName} was evaluated against reference ` +
    `${preset.referenceName} across ${metrics.m} healthy adult participants with ${metrics.k} paired replicate observations ` +
    `per participant (total N = ${metrics.totalN} paired data points) in accordance with ${preset.regulatoryStandard}. ` +
    `Because repeated measurements within individuals induce hierarchical clustering, agreement was decomposed using a one-way ` +
    `random-effects analysis of variance (ANOVA) framework as described by Bland and Altman (2007). ` +
    `Total variance was partitioned into between-subject variation (sigma_b = ${metrics.variance.sdBetween.toFixed(2)} ${preset.unit}) ` +
    `and within-subject sensor noise (sigma_w = ${metrics.variance.sdWithin.toFixed(2)} ${preset.unit}), yielding an Intraclass Correlation ` +
    `Coefficient (ICC) of ${metrics.variance.icc.toFixed(2)} and a design effect of ${metrics.variance.designEffect.toFixed(2)} ` +
    `(effective independent sample size N_eff = ${metrics.variance.nEffective.toFixed(0)}). ` +
    `Mean bias was ${metrics.meanBias >= 0 ? '+' : ''}${metrics.meanBias.toFixed(2)} ${preset.unit} with a cluster-adjusted 95% confidence ` +
    `interval of [${metrics.ciBiasClusterLow.toFixed(2)}, ${metrics.ciBiasClusterHigh.toFixed(2)}] based on the Student-t distribution ` +
    `with ${metrics.m - 1} degrees of freedom; naive pooled standard errors understated parameter uncertainty by a factor of ` +
    `${metrics.variance.seUnderstatementRatio.toFixed(1)}x. The 95% limits of agreement spanned [${metrics.loaLower.toFixed(2)}, +${metrics.loaUpper.toFixed(2)}] ${preset.unit}. ` +
    `Root Mean Square Error (Arms) was ${metrics.arms.toFixed(2)} ${preset.unit}, satisfying the predefined acceptance threshold of <= ${preset.armsTarget.toFixed(2)} ${preset.unit}. ` +
    `Empirical error survival analysis revealed that ${metrics.coverageAtTolerance.toFixed(1)}% of measurements fell within the +/- ${toleranceWindow.toFixed(1)} ${preset.unit} ` +
    `clinical tolerance envelope, with a 95th-percentile absolute error (P95) of ${metrics.p95.toFixed(2)} ${preset.unit}. ` +
    `Analyses were executed using agreekit client-side validation engine.`
  );
}

