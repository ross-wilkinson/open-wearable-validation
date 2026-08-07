/**
 * Module 1 — precision vs sample size.
 *
 * For a given n, how tightly can you pin down each of the things a validation
 * study actually reports? All margins are expressed in units of the
 * measurement SD, so the chart is independent of what is being measured: read
 * off a margin of 0.25 and it means "a quarter of a standard deviation",
 * whether that SD is 3 bpm or 400 steps.
 *
 * Four estimands, because a validation report quotes all four and they do not
 * converge at the same rate:
 *   - the bias (mean difference)
 *   - the 95% limits of agreement
 *   - a central error percentile (P50)
 *   - an upper error percentile (P90)
 *
 * The headline finding the chart exists to make visible: percentiles and
 * limits of agreement need substantially more subjects than the bias does, and
 * studies routinely get sized on the bias alone.
 */

import * as halfNormal from '../../stats/halfNormal.ts';
import * as studentT from '../../stats/studentT.ts';

export interface PrecisionOptions {
  /** Confidence level for the margin of error, e.g. 0.95. */
  confidence: number;
  /**
   * Multiplier defining the limits of agreement, e.g. 1.96 for "95% LoAs".
   *
   * Deliberately separate from `confidence`. These are two different things
   * that the source notebook conflates by hard-coding 1.71 (which silently
   * embeds k = 1.96) while taking the confidence level as a parameter. Asking
   * for a 90% *confidence interval* around the 95% *limits of agreement* is a
   * perfectly ordinary request, and it needs both numbers.
   */
  loaMultiplier: number;
  /** Error percentiles to track, as fractions, e.g. [0.5, 0.9]. */
  percentiles: number[];
  minN: number;
  maxN: number;
}

export const DEFAULT_PRECISION_OPTIONS: PrecisionOptions = {
  confidence: 0.95,
  loaMultiplier: 1.959963984540054,
  percentiles: [0.5, 0.9],
  minN: 5,
  maxN: 200,
};

/**
 * Asymptotic variance of a sample quantile of the absolute error:
 *
 *     var = p(1 - p) / (n * f(x_p)^2)
 *
 * with f the half-normal density — the distribution of |e| when the error e is
 * normal with unit SD.
 *
 * NAMING. The source notebook calls this "Greenwood variance", carried over
 * from the Kaplan-Meier survival context it was first read in. That is a
 * misnomer worth not propagating: Greenwood's formula proper is the variance
 * of a Kaplan-Meier survival estimate. This is the standard asymptotic
 * variance of a sample quantile (Serfling 1980, §2.3.3). The arithmetic is
 * identical to the notebook's; only the label changes.
 *
 * Note the failure mode this inherits: f(x_p) goes to zero as p approaches 1,
 * so the variance diverges. Estimating a P99 error from a handful of subjects
 * is not something a formula can rescue, and the curve says so by shooting up.
 */
export function quantileVariance(p: number, n: number): number {
  if (n <= 0 || p <= 0 || p >= 1) return Number.NaN;
  const density = halfNormal.densityAtQuantile(p);
  return (p * (1 - p)) / (n * density * density);
}

/** Margin of error around an error percentile, in units of SD. */
export function percentileMargin(p: number, n: number, confidence: number): number {
  if (n < 2) return Number.NaN;
  return studentT.criticalValue(confidence, n - 1) * Math.sqrt(quantileVariance(p, n));
}

/**
 * Margin of error around the bias (mean difference), in units of SD.
 * SE(d_bar) = sigma / sqrt(n) — the familiar one.
 */
export function biasMargin(n: number, confidence: number): number {
  if (n < 2) return Number.NaN;
  return studentT.criticalValue(confidence, n - 1) / Math.sqrt(n);
}

/**
 * Margin of error around a limit of agreement, in units of SD.
 *
 * A limit of agreement is `d_bar +/- k*s`, so its variance combines the
 * uncertainty in both terms:
 *
 *     Var(d_bar +/- k*s) = Var(d_bar) + k^2 * Var(s)
 *                        = sigma^2/n + k^2 * sigma^2 / (2(n-1))
 *
 * The `(n-1)` is the part worth getting right. The notebook uses a constant
 * 1.71 times the bias margin, which is `sqrt(1 + k^2/2)` rounded — algebraically
 * the `2n` version of the second term. Against the correct `2(n-1)` form that
 * understates the margin by 7.9% at n=5 and 2.9% at n=12, converging away by
 * n=150. Small n is precisely where someone consults a sample-size tool, so
 * the approximation is worst exactly where it is read most carefully.
 */
export function loaMargin(n: number, confidence: number, k: number): number {
  if (n < 2) return Number.NaN;
  const variance = 1 / n + (k * k) / (2 * (n - 1));
  return studentT.criticalValue(confidence, n - 1) * Math.sqrt(variance);
}

/** Identifier for one plotted series. Stable across renders and re-parameterisation. */
export interface PrecisionSeries {
  key: string;
  label: string;
  /** Which categorical colour slot this series owns, 1-indexed. */
  colorSlot: number;
  description: string;
}

/** A row of the curve: one n, one value per series, keyed by `PrecisionSeries.key`. */
export interface PrecisionPoint {
  n: number;
  [seriesKey: string]: number;
}

export function percentileKey(p: number): string {
  return `p${Math.round(p * 100)}`;
}

export function percentileLabel(p: number): string {
  return `${Math.round(p * 100)}th percentile`;
}

/**
 * The series list for a given set of options.
 *
 * Colour slots are assigned here, once, so that a series keeps its colour when
 * other series are added or removed — the rule that colour follows the entity,
 * never its position in the current list. Bias is always slot 1 and LoA always
 * slot 2 no matter which percentiles the user picks.
 */
export function precisionSeries(options: PrecisionOptions): PrecisionSeries[] {
  const kRounded = Number(options.loaMultiplier.toFixed(2));
  const series: PrecisionSeries[] = [
    {
      key: 'bias',
      label: 'Bias',
      colorSlot: 1,
      description: 'Mean difference between the device and the reference.',
    },
    {
      key: 'loa',
      label: `Limits of agreement (±${kRounded} SD)`,
      colorSlot: 2,
      description:
        'The interval containing most individual differences. Combines uncertainty in both the mean and the SD, so it converges more slowly than the bias.',
    },
  ];

  // Percentiles take slots 3 upward, in the order given.
  options.percentiles.forEach((p, index) => {
    series.push({
      key: percentileKey(p),
      label: percentileLabel(p),
      colorSlot: 3 + index,
      description: `Magnitude of absolute error that ${Math.round(
        p * 100,
      )}% of measurements fall within.`,
    });
  });

  return series;
}

/** The full curve: margin of error against n, for every series. */
export function precisionCurve(options: PrecisionOptions): PrecisionPoint[] {
  const { confidence, loaMultiplier, percentiles, minN, maxN } = options;
  const points: PrecisionPoint[] = [];

  for (let n = Math.max(2, minN); n <= maxN; n += 1) {
    const point: PrecisionPoint = {
      n,
      bias: biasMargin(n, confidence),
      loa: loaMargin(n, confidence, loaMultiplier),
    };
    for (const p of percentiles) {
      point[percentileKey(p)] = percentileMargin(p, n, confidence);
    }
    points.push(point);
  }
  return points;
}

/**
 * Smallest n at which a series' margin drops to `target` SD or below.
 *
 * This is the question the chart is really being read to answer — "how many
 * subjects do I need?" — so it is computed rather than left to the user to
 * eyeball off the axis. Returns null when the target is not reached inside the
 * plotted range, which is itself a useful answer: it means the study as
 * specified cannot deliver that precision at any feasible size.
 */
export function sampleSizeForTarget(
  target: number,
  seriesKey: string,
  options: PrecisionOptions,
): number | null {
  if (!(target > 0)) return null;
  const curve = precisionCurve(options);
  for (const point of curve) {
    const value = point[seriesKey];
    if (value !== undefined && Number.isFinite(value) && value <= target) {
      return point.n;
    }
  }
  return null;
}

/**
 * Mean absolute sampling error of a mean of `replicates` measurements, in SD.
 *
 * From the "Measurement Error vs Replicates" notebook, which obtained this by
 * Monte Carlo over 10,000 draws per replicate count. It has an exact closed
 * form: the mean of j draws from N(0, 1) is N(0, 1/j), and the expectation of
 * a half-normal with scale s is s*sqrt(2/pi), giving
 *
 *     E|z| = sqrt(2/pi) / sqrt(j)
 *
 * Worth stating rather than simulating: the simulation's own sampling noise
 * was the only thing separating its curve from this line.
 */
export function replicateSamplingError(replicates: number): number {
  if (replicates < 1) return Number.NaN;
  return Math.sqrt(2 / Math.PI) / Math.sqrt(replicates);
}
