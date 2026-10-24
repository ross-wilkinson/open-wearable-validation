/**
 * Chance KPI Permutation Model.
 *
 * Implements the mispairing / permutation test for clinical and sensor KPI evaluation,
 * founded on Preiss & Fisher (2008):
 * "A Measure of Confidence in Bland–Altman Analysis for the Interchangeability of Two Methods of Measurement."
 *
 * The core hazard: When the dynamic range of a physiological variable is narrow
 * (e.g. ambulatory daytime SpO2: 96%–99%, SD ~0.8%; or resting core temperature: 36.5–37.5°C),
 * an uncoupled dummy device or noise generator can achieve a low RMSE (e.g. ~1.2%)
 * simply because no measurement is ever far from the population mean.
 * If a team sets an arbitrary KPI (e.g. RMSE <= 3.5%), a non-functional device will
 * pass purely by chance >95% of the time!
 *
 * By randomly mispairing paired samples 10,000 times, this module constructs the
 * empirical null distribution under independence (chance), revealing:
 * 1. Chance Passing Rate: P(Metric_permuted <= Proposed KPI Threshold).
 * 2. Defensible 5% KPI Threshold: The 5th percentile (P0.05) of the null distribution.
 *    To be 95% confident against passing by chance, the KPI must be set <= P0.05.
 * 3. Permutation p-value: Fraction of mispairings beating the observed device KPI.
 * 4. Preiss–Fisher Separation Index: Ratio of observed error to chance expected error.
 *
 * Closed-form analytical reference:
 * E[MSE_chance] = Var(X) + Var(Y) + (mu_X - mu_Y)^2 when Cov(X, Y) = 0.
 */

import { cdf } from '../../stats/normal.ts';
import { createRng, quantiles, sampleNormal } from '../../stats/random.ts';

export type MetricType = 'rmse' | 'mae' | 'loa';

export interface PairedPoint {
  reference: number;
  device: number;
}

export interface ChanceKpiPreset {
  id: string;
  name: string;
  shortName: string;
  description: string;
  hazardNote: string;
  referenceMean: number;
  referenceSd: number;
  deviceBias: number;
  deviceErrorSd: number;
  proposedKpi: number;
  unit: string;
  metric: MetricType;
  sampleSize: number;
}

export interface ChanceKpiConfig {
  sampleSize: number;
  referenceMean: number;
  referenceSd: number;
  deviceBias: number;
  deviceErrorSd: number;
  proposedKpi: number;
  metric: MetricType;
  desiredAlpha?: number; // False positive error rate ceiling (default 0.05)
  iterations?: number;
  seed?: number;
  pairs?: PairedPoint[];
}

export type HazardVerdict = 'CRITICAL_HAZARD' | 'MODERATE_HAZARD' | 'DEFENSIBLE';

export interface HistogramBin {
  bin: number;
  binStart: number;
  binEnd: number;
  count: number;
  densityPercent: number;
  cumulativePercent: number;
}

export interface ChanceKpiResult {
  sampleSize: number;
  metric: MetricType;
  proposedKpi: number;
  observedMetric: number;
  observedRmse: number;
  observedMae: number;
  observedLoa: number;
  observedBias: number;
  observedSdDiff: number;
  referenceMean: number;
  referenceSd: number;
  referencePopVar: number;
  referenceSampleVar: number;
  deviceMean: number;
  deviceSd: number;
  devicePopVar: number;
  deviceSampleVar: number;

  // Closed-form analytical null references under Cov(X, Y) = 0:
  analyticalChanceMse: number;
  analyticalChanceRmse: number;
  analyticalChanceLoa: number;
  analyticalChanceMae: number;
  analyticalExpected: number;

  // Monte Carlo permutation distribution:
  iterations: number;
  desiredAlpha: number;
  desiredConfidence: number;
  meanChanceMetric: number;
  sdChanceMetric: number;
  medianChanceMetric: number;
  chancePassingRate: number; // percentage [0, 100]
  defensibleThreshold: number; // quantile at desiredAlpha (e.g. P0.05)
  defensible5PctThreshold: number; // 5th percentile P0.05
  defensible1PctThreshold: number; // 1st percentile P0.01
  permutationPValue: number;
  preissFisherSeparationIndex: number; // observed / meanChanceMetric

  // Qualitative verdict & guidance:
  hazardVerdict: HazardVerdict;
  hazardVerdictTitle: string;
  hazardVerdictDescription: string;

  // Visualization:
  histogram: HistogramBin[];
  permutedDistribution: number[];
  pairedPoints: PairedPoint[];
}

export const CHANCE_KPI_PRESETS: ChanceKpiPreset[] = [
  {
    id: 'ambulatory-spo2',
    name: 'Ambulatory SpO2 (Narrow Dynamic Range Hazard)',
    shortName: 'Ambulatory SpO2',
    description:
      'Daytime SpO2 in healthy individuals varies within a tiny range (96%–99%, SD ~0.8%). Setting a standard KPI of 3.5% RMSE creates a severe false-pass hazard: completely uncoupled dummy devices or random noise pass ~99% of the time purely by chance.',
    hazardNote: 'Severe Hazard: High false-pass rate due to narrow reference range.',
    referenceMean: 97.5,
    referenceSd: 0.8,
    deviceBias: 0.1,
    deviceErrorSd: 1.2,
    proposedKpi: 3.5,
    unit: '%SpO2',
    metric: 'rmse',
    sampleSize: 100,
  },
  {
    id: 'hypoxia-spo2',
    name: 'Controlled Hypoxia SpO2 (Wide Dynamic Range)',
    shortName: 'Hypoxia SpO2',
    description:
      'Laboratory desaturation protocols deliberately span 70%–100% (SD ~8.5%). With broad dynamic range, passing a 3.0% RMSE KPI is virtually impossible by chance (<0.1%), proving true sensor coupling.',
    hazardNote: 'Statistically Defensible: Broad dynamic range rules out chance pass.',
    referenceMean: 85.0,
    referenceSd: 8.5,
    deviceBias: 0.0,
    deviceErrorSd: 1.8,
    proposedKpi: 3.0,
    unit: '%SpO2',
    metric: 'rmse',
    sampleSize: 100,
  },
  {
    id: 'resting-temperature',
    name: 'Resting Body Temperature (Narrow Dynamic Range)',
    shortName: 'Resting Temp',
    description:
      'Core body temperature at rest spans 36.5°C–37.5°C (SD ~0.25°C). Setting a KPI of 0.5°C RMSE allows an uncoupled device outputting ~37.0°C to pass ~98% of the time without measuring actual temperature.',
    hazardNote: 'Severe Hazard: Uncoupled sensor passes 0.5°C KPI almost every time.',
    referenceMean: 37.0,
    referenceSd: 0.25,
    deviceBias: 0.05,
    deviceErrorSd: 0.2,
    proposedKpi: 0.5,
    unit: '°C',
    metric: 'rmse',
    sampleSize: 100,
  },
  {
    id: 'exercise-heart-rate',
    name: 'Exercise Heart Rate (Wide Dynamic Range)',
    shortName: 'Exercise HR',
    description:
      'Heart rate during graded exercise spans 60–180 bpm (SD ~25 bpm). Passing a 5 bpm RMSE KPI requires genuine optical tracking; random mispaired readings yield errors >30 bpm.',
    hazardNote: 'Statistically Defensible: High variance rules out chance passing.',
    referenceMean: 120.0,
    referenceSd: 25.0,
    deviceBias: 0.5,
    deviceErrorSd: 3.5,
    proposedKpi: 5.0,
    unit: 'bpm',
    metric: 'rmse',
    sampleSize: 100,
  },
];

export function getChancePreset(id: string): ChanceKpiPreset {
  const preset = CHANCE_KPI_PRESETS.find((p) => p.id === id);
  if (!preset) {
    throw new Error(`Unknown chance KPI preset: "${id}"`);
  }
  return preset;
}

/**
 * Generate simulated paired reference and device readings.
 */
export function generatePairedData(
  sampleSize: number,
  referenceMean: number,
  referenceSd: number,
  deviceBias: number,
  deviceErrorSd: number,
  rng: () => number,
): PairedPoint[] {
  const points: PairedPoint[] = new Array(sampleSize);
  for (let i = 0; i < sampleSize; i += 1) {
    const ref = referenceMean + sampleNormal(rng) * referenceSd;
    const dev = ref + deviceBias + sampleNormal(rng) * deviceErrorSd;
    points[i] = { reference: ref, device: dev };
  }
  return points;
}

/** Compute the observed metric directly from paired vectors. */
export function computeMetric(
  metric: MetricType,
  references: Float64Array | number[],
  devices: Float64Array | number[],
): number {
  const n = references.length;
  if (n === 0) return 0;

  if (metric === 'rmse') {
    let sumSq = 0;
    for (let i = 0; i < n; i += 1) {
      const diff = (references[i] ?? 0) - (devices[i] ?? 0);
      sumSq += diff * diff;
    }
    return Math.sqrt(sumSq / n);
  }

  if (metric === 'mae') {
    let sumAbs = 0;
    for (let i = 0; i < n; i += 1) {
      sumAbs += Math.abs((references[i] ?? 0) - (devices[i] ?? 0));
    }
    return sumAbs / n;
  }

  // Limits of Agreement (95% half-width: 1.96 * SD_diff)
  if (n < 2) return 0;
  let sumDiff = 0;
  for (let i = 0; i < n; i += 1) {
    sumDiff += (references[i] ?? 0) - (devices[i] ?? 0);
  }
  const meanDiff = sumDiff / n;
  let sumSqDiff = 0;
  for (let i = 0; i < n; i += 1) {
    const d = (references[i] ?? 0) - (devices[i] ?? 0) - meanDiff;
    sumSqDiff += d * d;
  }
  const sdDiff = Math.sqrt(sumSqDiff / (n - 1));
  return 1.96 * sdDiff;
}

/**
 * Compute sample mean and sample variance (N-1) of an array.
 */
function sampleMoments(arr: Float64Array | number[]): {
  mean: number;
  sampleVar: number;
  popVar: number;
  sd: number;
} {
  const n = arr.length;
  if (n === 0) return { mean: 0, sampleVar: 0, popVar: 0, sd: 0 };
  let sum = 0;
  for (let i = 0; i < n; i += 1) sum += arr[i] ?? 0;
  const m = sum / n;
  let sumSq = 0;
  for (let i = 0; i < n; i += 1) {
    const diff = (arr[i] ?? 0) - m;
    sumSq += diff * diff;
  }
  const popVar = sumSq / n;
  const sampleVar = n > 1 ? sumSq / (n - 1) : 0;
  return { mean: m, sampleVar, popVar, sd: Math.sqrt(sampleVar) };
}

/**
 * Parse raw paired text (CSV, TSV, space-separated, semicolon-separated).
 * Automatically ignores header rows, empty lines, and comments (#).
 */
export function parsePairedCsv(raw: string): PairedPoint[] {
  const lines = raw.split(/\r?\n/);
  const points: PairedPoint[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/[\t,;]+|\s{2,}/).map((s) => s.trim());
    if (parts.length >= 2) {
      const ref = Number(parts[0]);
      const dev = Number(parts[1]);
      if (Number.isFinite(ref) && Number.isFinite(dev)) {
        points.push({ reference: ref, device: dev });
      }
    }
  }
  return points;
}

/**
 * Format paired points back to comma-separated text.
 */
export function formatPairedCsv(pairs: PairedPoint[]): string {
  return pairs.map((p) => `${p.reference.toFixed(2)}, ${p.device.toFixed(2)}`).join('\n');
}

/**
 * Closed-form analytical expectations under the null hypothesis of uncoupled / random mispairing (Cov(X, Y) = 0):
 * E_perm[MSE_chance] = popVar(X) + popVar(Y) + (mu_X - mu_Y)^2.
 * E_perm[s_d^2] = sampleVar(X) + sampleVar(Y).
 * E_perm[LoA_halfwidth_chance] = 1.96 * sqrt(sampleVar(X) + sampleVar(Y)).
 * E_perm[MAE_chance] = Folded Normal Mean for D ~ N(mu_D, sigma_D^2).
 */
export function computeAnalyticalChance(
  refMean: number,
  refPopVar: number,
  devMean: number,
  devPopVar: number,
  sampleRefVar?: number,
  sampleDevVar?: number,
): {
  mse: number;
  rmse: number;
  loa: number;
  mae: number;
} {
  const diffMean = refMean - devMean;
  // Exact permutation expectation for MSE:
  const pooledPopVar = Math.max(0, refPopVar + devPopVar);
  const mse = pooledPopVar + diffMean * diffMean;
  const rmse = Math.sqrt(mse);

  // Exact permutation expectation for sample variance of differences:
  const sVarX = sampleRefVar ?? refPopVar;
  const sVarY = sampleDevVar ?? devPopVar;
  const pooledSampleVar = Math.max(0, sVarX + sVarY);
  const loa = 1.96 * Math.sqrt(pooledSampleVar);

  // Folded Normal expectation for MAE:
  const sigmaD = Math.sqrt(pooledSampleVar);
  let mae = 0;
  if (sigmaD > 0) {
    const z = diffMean / sigmaD;
    mae =
      sigmaD * Math.sqrt(2 / Math.PI) * Math.exp(-0.5 * z * z) +
      diffMean * (1 - 2 * cdf(-z));
  } else {
    mae = Math.abs(diffMean);
  }

  return { mse, rmse, loa, mae };
}

/**
 * Run fast Monte Carlo permutation analysis.
 * Randomly mispairs Y relative to X over B = 10,000 iterations.
 */
export function runChanceKpiAnalysis(config: ChanceKpiConfig): ChanceKpiResult {
  const sampleSize = Math.max(3, Math.floor(config.sampleSize));
  const iterations = Math.max(100, Math.floor(config.iterations ?? 10000));
  const seed = config.seed ?? 42;
  const rng = createRng(seed);
  const desiredAlpha = Math.max(0.001, Math.min(0.5, config.desiredAlpha ?? 0.05));
  const desiredConfidence = Number(((1 - desiredAlpha) * 100).toFixed(1));

  // Obtain or simulate paired data
  const pairs: PairedPoint[] =
    config.pairs && config.pairs.length >= 3
      ? config.pairs
      : generatePairedData(
          sampleSize,
          config.referenceMean,
          config.referenceSd,
          config.deviceBias,
          config.deviceErrorSd,
          rng,
        );

  const n = pairs.length;
  const refs = new Float64Array(n);
  const devs = new Float64Array(n);
  for (let i = 0; i < n; i += 1) {
    refs[i] = pairs[i]!.reference;
    devs[i] = pairs[i]!.device;
  }

  // Observed sample statistics
  const refMoments = sampleMoments(refs);
  const devMoments = sampleMoments(devs);
  const observedRmse = computeMetric('rmse', refs, devs);
  const observedMae = computeMetric('mae', refs, devs);
  const observedLoa = computeMetric('loa', refs, devs);
  const observedMetric =
    config.metric === 'rmse'
      ? observedRmse
      : config.metric === 'mae'
        ? observedMae
        : observedLoa;

  let sumDiff = 0;
  let sumSqDiff = 0;
  for (let i = 0; i < n; i += 1) {
    sumDiff += refs[i]! - devs[i]!;
  }
  const observedBias = sumDiff / n;
  for (let i = 0; i < n; i += 1) {
    const d = refs[i]! - devs[i]! - observedBias;
    sumSqDiff += d * d;
  }
  const observedSdDiff = n > 1 ? Math.sqrt(sumSqDiff / (n - 1)) : 0;

  // Closed-form analytical reference under Cov(X, Y) = 0:
  // MSE expectation uses population variances; LoA expectation uses sample variances
  const analytical = computeAnalyticalChance(
    refMoments.mean,
    refMoments.popVar,
    devMoments.mean,
    devMoments.popVar,
    refMoments.sampleVar,
    devMoments.sampleVar,
  );
  let analyticalExpected = analytical.rmse;
  if (config.metric === 'mae') analyticalExpected = analytical.mae;
  if (config.metric === 'loa') analyticalExpected = analytical.loa;

  // Optimization pre-calculations for fast permutation
  let sumX2 = 0;
  let sumY2 = 0;
  for (let i = 0; i < n; i += 1) {
    sumX2 += refs[i]! * refs[i]!;
    sumY2 += devs[i]! * devs[i]!;
  }
  const sumSquaresTotal = sumX2 + sumY2;
  const meanDiff = refMoments.mean - devMoments.mean;
  const meanDiffTerm = n * meanDiff * meanDiff;

  // Permutation simulation
  const permuted = new Float64Array(iterations);
  const currentY = new Float64Array(devs);

  let passingCount = 0;
  let beatObservedCount = 0;

  for (let b = 0; b < iterations; b += 1) {
    // Fisher-Yates shuffle of currentY
    for (let i = n - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = currentY[i]!;
      currentY[i] = currentY[j]!;
      currentY[j] = tmp;
    }

    let metricVal = 0;
    if (config.metric === 'rmse') {
      // MSE = (sum(X^2) + sum(Y^2) - 2*sum(X*Y_perm)) / n
      let dot = 0;
      for (let i = 0; i < n; i += 1) {
        dot += refs[i]! * currentY[i]!;
      }
      const mse = Math.max(0, (sumSquaresTotal - 2 * dot) / n);
      metricVal = Math.sqrt(mse);
    } else if (config.metric === 'loa') {
      // s_d^2 = (sum(D^2) - n * mean(D)^2) / (n - 1)
      let dot = 0;
      for (let i = 0; i < n; i += 1) {
        dot += refs[i]! * currentY[i]!;
      }
      const sumD2 = sumSquaresTotal - 2 * dot;
      const sd2 = Math.max(0, (sumD2 - meanDiffTerm) / (n - 1));
      metricVal = 1.96 * Math.sqrt(sd2);
    } else {
      // MAE
      let sumAbs = 0;
      for (let i = 0; i < n; i += 1) {
        sumAbs += Math.abs(refs[i]! - currentY[i]!);
      }
      metricVal = sumAbs / n;
    }

    permuted[b] = metricVal;
    if (metricVal <= config.proposedKpi) {
      passingCount += 1;
    }
    if (metricVal <= observedMetric) {
      beatObservedCount += 1;
    }
  }

  // Sort permuted values for quantile evaluation
  const sortedPermuted = Array.from(permuted).sort((a, b) => a - b);

  // Empirical null summary
  let sumPerm = 0;
  for (let i = 0; i < iterations; i += 1) sumPerm += sortedPermuted[i]!;
  const meanChanceMetric = sumPerm / iterations;

  let sumSqDev = 0;
  for (let i = 0; i < iterations; i += 1) {
    const diff = sortedPermuted[i]! - meanChanceMetric;
    sumSqDev += diff * diff;
  }
  const sdChanceMetric = Math.sqrt(sumSqDev / (iterations - 1));

  // Key quantiles: desiredAlpha (defensible threshold), P0.01, P0.05, P0.50 (median)
  const [pDesired, p01, p05, p50] = quantiles(
    sortedPermuted,
    [desiredAlpha, 0.01, 0.05, 0.5],
  );
  const defensibleThreshold = pDesired ?? meanChanceMetric;
  const defensible5PctThreshold = p05 ?? meanChanceMetric;
  const defensible1PctThreshold = p01 ?? meanChanceMetric;
  const medianChanceMetric = p50 ?? meanChanceMetric;

  const chancePassingRate = (passingCount / iterations) * 100;
  const permutationPValue = (beatObservedCount + 1) / (iterations + 1);
  const preissFisherSeparationIndex =
    meanChanceMetric > 0 ? observedMetric / meanChanceMetric : 1;

  // Qualitative hazard verdict based on desired alpha threshold
  const alphaPercent = desiredAlpha * 100;
  let hazardVerdict: HazardVerdict = 'DEFENSIBLE';
  let hazardVerdictTitle = 'Statistically Defensible KPI: Passing is Not by Chance';
  let hazardVerdictDescription = `Only ${chancePassingRate.toFixed(1)}% of randomly mispaired datasets pass this KPI (well within the ${alphaPercent.toFixed(0)}% false-positive ceiling). Passing this KPI is strong statistical evidence of true measurement agreement across the observed dynamic range.`;

  if (chancePassingRate > 20) {
    hazardVerdict = 'CRITICAL_HAZARD';
    hazardVerdictTitle = 'Severe False-Pass Hazard: KPI Passed by Chance';
    hazardVerdictDescription = `${chancePassingRate.toFixed(1)}% of completely uncoupled, randomly mispaired datasets achieve this KPI threshold or better! Passing this KPI provides virtually NO proof that the device works — it is an artifact of the narrow reference dynamic range (SD ~${refMoments.sd.toFixed(2)}). To be ${desiredConfidence}% confident against passing by chance, the KPI must be tightened to ≤ ${defensibleThreshold.toFixed(2)}.`;
  } else if (chancePassingRate > alphaPercent) {
    hazardVerdict = 'MODERATE_HAZARD';
    hazardVerdictTitle = `Moderate False-Pass Risk: Exceeds ${alphaPercent.toFixed(0)}% False Positive Rate`;
    hazardVerdictDescription = `${chancePassingRate.toFixed(1)}% of randomly mispaired datasets pass this KPI. In clinical study design, false-positive error rates should not exceed ${alphaPercent.toFixed(0)}%. Tighten the threshold to ≤ ${defensibleThreshold.toFixed(2)} or expand the reference dynamic range.`;
  }

  // Construct histogram
  const histogram = buildHistogram(sortedPermuted);

  return {
    sampleSize: n,
    metric: config.metric,
    proposedKpi: config.proposedKpi,
    observedMetric,
    observedRmse,
    observedMae,
    observedLoa,
    observedBias,
    observedSdDiff,
    referenceMean: refMoments.mean,
    referenceSd: refMoments.sd,
    referencePopVar: refMoments.popVar,
    referenceSampleVar: refMoments.sampleVar,
    deviceMean: devMoments.mean,
    deviceSd: devMoments.sd,
    devicePopVar: devMoments.popVar,
    deviceSampleVar: devMoments.sampleVar,

    analyticalChanceMse: analytical.mse,
    analyticalChanceRmse: analytical.rmse,
    analyticalChanceLoa: analytical.loa,
    analyticalChanceMae: analytical.mae,
    analyticalExpected,

    iterations,
    desiredAlpha,
    desiredConfidence,
    meanChanceMetric,
    sdChanceMetric,
    medianChanceMetric,
    chancePassingRate,
    defensibleThreshold,
    defensible5PctThreshold,
    defensible1PctThreshold,
    permutationPValue,
    preissFisherSeparationIndex,

    hazardVerdict,
    hazardVerdictTitle,
    hazardVerdictDescription,

    histogram,
    permutedDistribution: sortedPermuted,
    pairedPoints: pairs,
  };
}

/**
 * Build histogram bins from the permuted distribution.
 */
function buildHistogram(
  sortedValues: number[],
  binCount = 35,
): HistogramBin[] {
  if (sortedValues.length === 0) return [];

  const minVal = sortedValues[0]!;
  const maxVal = sortedValues[sortedValues.length - 1]!;
  const span = maxVal - minVal;
  const padding = span > 0 ? span * 0.05 : 0.1;
  const start = Math.max(0, minVal - padding);
  const end = maxVal + padding;
  const binWidth = (end - start) / binCount;

  const counts = new Array<number>(binCount).fill(0);
  for (let i = 0; i < sortedValues.length; i += 1) {
    const val = sortedValues[i]!;
    const idx = Math.min(binCount - 1, Math.max(0, Math.floor((val - start) / binWidth)));
    counts[idx]! += 1;
  }

  let cumulative = 0;
  const total = sortedValues.length;
  return counts.map((count, index) => {
    cumulative += count;
    const binStart = start + index * binWidth;
    const binEnd = binStart + binWidth;
    return {
      bin: (binStart + binEnd) / 2,
      binStart,
      binEnd,
      count,
      densityPercent: Number(((count / total) * 100).toFixed(2)),
      cumulativePercent: Number(((cumulative / total) * 100).toFixed(2)),
    };
  });
}
