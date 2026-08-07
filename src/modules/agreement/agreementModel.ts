/**
 * Module 2 — sample size for agreement and equivalence.
 *
 * Two related questions:
 *   1. "My device must agree within X. How many subjects until my limits of
 *      agreement are pinned down that tightly?"
 *   2. "How many subjects to demonstrate equivalence within a stated margin,
 *      at a given power?"
 *
 * The first shares its arithmetic with Module 1 rather than reimplementing it —
 * see the note on `loaPrecision` below.
 */

import * as normal from '../../stats/normal.ts';
import { loaMargin } from '../precision/precisionModel.ts';

/**
 * Precision of the limits of agreement at sample size n, in units of SD.
 *
 * Deliberately delegates to Module 1's `loaMargin` instead of carrying its own
 * copy. The source notebook uses `1.96 * sqrt(3/n)`, which is the same quantity
 * with two approximations baked in: `sqrt(3)` stands in for
 * `sqrt(1 + 1.96^2/2) = 1.709`, and the normal quantile 1.96 stands in for the
 * t quantile at n-1 degrees of freedom. Both are fine at large n and both
 * understate the margin at small n, which is where the answer matters.
 *
 * Keeping one implementation means the "how big is my study" page and the
 * "how precise will it be" page can never quietly disagree.
 */
export function loaPrecision(n: number, confidence = 0.95, k = 1.959963984540054) {
  return loaMargin(n, confidence, k);
}

/** The source notebook's approximation, kept so the two can be compared. */
export function loaPrecisionApproximate(n: number): number {
  return 1.96 * Math.sqrt(3 / n);
}

export interface ThresholdResult {
  /** Smallest n whose LoA precision is at or below the threshold. */
  n: number | null;
  /** What the approximation would have answered, for comparison. */
  approximateN: number | null;
}

/**
 * Smallest n at which LoA precision reaches `threshold` SD.
 *
 * Searched rather than solved in closed form: the exact expression involves a
 * t quantile whose degrees of freedom depend on n, so there is no clean
 * inverse. The curve is monotonic, so a scan is both correct and fast enough.
 */
export function sampleSizeForThreshold(
  threshold: number,
  confidence = 0.95,
  k = 1.959963984540054,
  maxN = 100000,
): ThresholdResult {
  if (!(threshold > 0)) return { n: null, approximateN: null };

  let exact: number | null = null;
  let approximate: number | null = null;

  for (let n = 2; n <= maxN; n += 1) {
    if (exact === null && loaPrecision(n, confidence, k) < threshold) exact = n;
    if (approximate === null && loaPrecisionApproximate(n) < threshold) approximate = n;
    if (exact !== null && approximate !== null) break;
  }
  return { n: exact, approximateN: approximate };
}

export interface EquivalenceInput {
  /** False-positive rate. */
  alpha: number;
  /** Desired power, 1 - false-negative rate. */
  power: number;
  /** Error SD, or the RMSE when the mean error is zero. */
  sigma: number;
  /** Upper bound of the equivalence region. */
  delta: number;
  /** True difference in means. */
  epsilon: number;
}

/**
 * Sample size for a one-sample equivalence test.
 *
 * Chow, Wang & Shao (2007), *Sample Size Calculations in Clinical Research*,
 * formula 3.1.9:
 *
 *     n = (z_alpha + z_(beta/2))^2 * sigma^2 / (delta - |epsilon|)^2
 *
 * Note the asymmetry, which is not a typo: alpha enters one-sided while beta is
 * halved. That is the standard form for the two one-sided tests (TOST)
 * procedure — rejecting both one-sided nulls at alpha gives an overall
 * false-positive rate of alpha, not 2*alpha.
 *
 * Returns null when `|epsilon| >= delta`: the true difference lies outside the
 * equivalence region, so no sample size can demonstrate equivalence. The
 * formula would happily return a finite (and meaningless) number here by
 * squaring a negative denominator, so the guard matters.
 */
export function sampleSizeForEquivalence(input: EquivalenceInput): number | null {
  const { alpha, power, sigma, delta, epsilon } = input;
  if (!(alpha > 0 && alpha < 1) || !(power > 0 && power < 1)) return null;
  if (!(sigma > 0) || !(delta > 0)) return null;

  const gap = delta - Math.abs(epsilon);
  if (gap <= 0) return null;

  const zAlpha = normal.ppf(1 - alpha);
  const zBeta = normal.ppf(1 - (1 - power) / 2);
  return Math.ceil(((zAlpha + zBeta) ** 2 * sigma ** 2) / gap ** 2);
}

/** Curve of LoA precision against n, for plotting. */
export interface PrecisionRow {
  n: number;
  exact: number;
  approximate: number;
}

/**
 * Curve for plotting. Starts at n = 5, not n = 2.
 *
 * At n = 2 there is one degree of freedom, the t multiplier is 12.7, and the
 * precision comes out at 19.8 SD — twenty times any other point on the curve,
 * which flattens everything else against the axis and makes the chart
 * unreadable. It is also not a number anyone needs: a Bland-Altman analysis on
 * two subjects is not a study. Starting at 5 matches Module 1's floor.
 */
export const MIN_PLOTTED_N = 5;

export function loaPrecisionCurve(
  maxN: number,
  confidence = 0.95,
  k = 1.959963984540054,
): PrecisionRow[] {
  const rows: PrecisionRow[] = [];
  for (let n = MIN_PLOTTED_N; n <= maxN; n += 1) {
    rows.push({
      n,
      exact: loaPrecision(n, confidence, k),
      approximate: loaPrecisionApproximate(n),
    });
  }
  return rows;
}
