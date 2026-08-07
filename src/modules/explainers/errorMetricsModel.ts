/**
 * Explainer — misled by RMSE and MAE.
 *
 * Device errors are heavy-tailed: usually tiny, occasionally enormous. RMSE and
 * MAE are summaries built for a normal distribution, and applied to a
 * heavy-tailed one their practical meaning drifts — the *proportion* of users
 * inside "the RMSE" is not a constant, it depends on the shape.
 *
 * A point the source notebook stops just short of making, and which is the
 * strongest form of its argument: for a Student t with df <= 2 the population
 * variance does not exist. At the notebook's df = 1.3, RMSE is estimating a
 * quantity that is undefined. The sample RMSE of 45.7 it reports is not a
 * noisy estimate of something — it is an artefact of that particular sample,
 * and it grows without bound as the sample grows.
 */

import { createRng, quantiles, sampleNormal, sampleStudentT } from '../../stats/random.ts';

export interface ErrorMetrics {
  rmse: number;
  mae: number;
  p50: number;
  p68: number;
  p95: number;
  /** Percentage of absolute errors at or below the RMSE. */
  withinRmse: number;
  /** Percentage of absolute errors at or below the MAE. */
  withinMae: number;
}

export interface ComparisonResult {
  df: number;
  sampleSize: number;
  /** Heavy-tailed sample. */
  heavy: ErrorMetrics;
  /** Normal sample with SD matched to the heavy-tailed one. */
  normal: ErrorMetrics;
  /** Matched SD, i.e. the RMSE both distributions share by construction. */
  matchedSd: number;
  /** True when the t distribution's population variance is undefined (df <= 2). */
  varianceUndefined: boolean;
  /** Histogram of absolute errors, clipped for display. */
  histogram: { bin: number; heavy: number; normal: number }[];
}

function metrics(values: number[]): ErrorMetrics {
  const n = values.length;
  const absolute = values.map(Math.abs);

  let sumSquares = 0;
  let sumAbsolute = 0;
  for (const value of absolute) {
    sumSquares += value * value;
    sumAbsolute += value;
  }
  const rmse = Math.sqrt(sumSquares / n);
  const mae = sumAbsolute / n;

  const [p50, p68, p95] = quantiles(absolute, [0.5, 0.68, 0.95]);

  let belowRmse = 0;
  let belowMae = 0;
  for (const value of absolute) {
    if (value <= rmse) belowRmse += 1;
    if (value <= mae) belowMae += 1;
  }

  return {
    rmse,
    mae,
    p50: p50!,
    p68: p68!,
    p95: p95!,
    withinRmse: (belowRmse / n) * 100,
    withinMae: (belowMae / n) * 100,
  };
}

/**
 * Draw a heavy-tailed sample and a normal sample with the *same* SD, and
 * compare what each summary statistic actually means for each.
 *
 * Matching on the sample SD is what makes the demonstration land: both samples
 * then have the same RMSE by construction, so any difference in "how many users
 * fall inside it" is entirely about shape.
 */
export function compareErrorMetrics(
  df: number,
  sampleSize = 10000,
  seed = 42,
): ComparisonResult {
  const rng = createRng(seed);

  const heavySample = new Array<number>(sampleSize);
  for (let i = 0; i < sampleSize; i += 1) heavySample[i] = sampleStudentT(rng, df);

  // Match the normal sample's SD to the heavy sample's *observed* SD.
  let total = 0;
  for (const value of heavySample) total += value;
  const heavyMean = total / sampleSize;
  let sumSquares = 0;
  for (const value of heavySample) sumSquares += (value - heavyMean) ** 2;
  const matchedSd = Math.sqrt(sumSquares / (sampleSize - 1));

  const normalSample = new Array<number>(sampleSize);
  for (let i = 0; i < sampleSize; i += 1) {
    normalSample[i] = sampleNormal(rng) * matchedSd;
  }

  const heavy = metrics(heavySample);
  const normal = metrics(normalSample);

  return {
    df,
    sampleSize,
    heavy,
    normal,
    matchedSd,
    varianceUndefined: df <= 2,
    histogram: buildHistogram(heavySample, normalSample, heavy.p95 * 1.5),
  };
}

/**
 * Absolute-error histograms on a shared scale, clipped at `limit`.
 *
 * Clipping is unavoidable: with df near 1 the maximum absolute error can be in
 * the thousands, and a chart scaled to it shows one spike and nothing else. The
 * UI states the clipping rather than hiding it, and every statistic above is
 * computed on the *unclipped* sample.
 */
function buildHistogram(
  heavy: number[],
  normal: number[],
  limit: number,
  bins = 40,
): { bin: number; heavy: number; normal: number }[] {
  const width = limit / bins;
  if (!(width > 0)) return [];

  const heavyCounts = new Array<number>(bins).fill(0);
  const normalCounts = new Array<number>(bins).fill(0);

  for (const value of heavy) {
    const index = Math.floor(Math.abs(value) / width);
    if (index < bins) heavyCounts[index]! += 1;
  }
  for (const value of normal) {
    const index = Math.floor(Math.abs(value) / width);
    if (index < bins) normalCounts[index]! += 1;
  }

  return heavyCounts.map((count, index) => ({
    bin: (index + 0.5) * width,
    heavy: (count / heavy.length) * 100,
    normal: (normalCounts[index]! / normal.length) * 100,
  }));
}
