/**
 * Module 5 — confidence intervals for Cohen's d.
 *
 * The point of this module is a correction. A confidence interval for a
 * standardised effect size comes from inverting the *non-central* t
 * distribution: given an observed d and sample size n, the interval is the set
 * of noncentralities consistent with what was seen. Most published intervals
 * use a normal approximation around d instead, which is noticeably wrong for
 * small n and for large |d|.
 *
 * THE BUG BEING FIXED. The source notebook computes the right quantiles and
 * then prints them on the wrong scale:
 *
 *     nc     = d * sqrt(n)
 *     bounds = nct.ppf([alpha/2, 1 - alpha/2], df=n-1, nc=nc)
 *
 * and reports `bounds` as "the 95% CI for Cohen's d". Those bounds are on the
 * *t* scale. Since d = t / sqrt(n) for a one-sample or paired design, the
 * d-scale interval needs the same rescaling. For its own worked case (d = 0.5,
 * n = 44) the notebook prints (1.34, 5.63) — an interval for an effect size of
 * 0.5 that does not contain 0.5. Divided by sqrt(44) it becomes
 * (0.203, 0.849), which brackets the estimate and agrees closely with the
 * Hedges-Olkin approximation.
 *
 * A second function in the same notebook (`cohens_d_ci`) has an independent
 * error: its standard error is sqrt((1 - d^2/(2*df))/df), which *shrinks* as
 * |d| grows. The sampling variance of d increases with |d|; that sign is
 * inverted. Neither notebook version is ported.
 */

import * as nonCentralT from '../../stats/nonCentralT.ts';
import * as normal from '../../stats/normal.ts';

export type Design = 'one-sample' | 'paired' | 'two-sample';

export interface EffectSizeInput {
  /** Observed Cohen's d. */
  d: number;
  /** Sample size. For a two-sample design, the size of each group. */
  n: number;
  /** Two-sided confidence level, e.g. 0.95. */
  confidence: number;
  design: Design;
}

export interface EffectSizeResult {
  d: number;
  n: number;
  confidence: number;
  design: Design;
  /** Degrees of freedom for the design. */
  df: number;
  /** Noncentrality parameter, d * sqrt(effective n). */
  nc: number;
  /** Factor converting the t scale to the d scale. */
  scaleFactor: number;
  /** The correct d-scale interval. */
  lower: number;
  upper: number;
  /** The raw t-scale bounds — what the notebook printed as a d interval. */
  tScaleLower: number;
  tScaleUpper: number;
  /** Hedges-Olkin large-sample normal approximation, for comparison. */
  approxLower: number;
  approxUpper: number;
  /** Common-language effect size: P(a random case exceeds a random control). */
  commonLanguage: number;
  /** True when the interval excludes zero. */
  excludesZero: boolean;
}

/**
 * Effective n and degrees of freedom by design.
 *
 * One-sample and paired designs share their arithmetic — a paired test is a
 * one-sample test on the differences. Two-sample designs use the harmonic-mean
 * form: nc = d * sqrt(n/2) with df = 2n - 2, for n per group.
 */
function designParameters(n: number, design: Design): { df: number; scale: number } {
  if (design === 'two-sample') {
    return { df: 2 * n - 2, scale: Math.sqrt(n / 2) };
  }
  return { df: n - 1, scale: Math.sqrt(n) };
}

export function cohensDInterval(input: EffectSizeInput): EffectSizeResult | null {
  const { d, n, confidence, design } = input;
  if (!Number.isFinite(d)) return null;
  if (!Number.isFinite(n) || n < 2) return null;
  if (!(confidence > 0 && confidence < 1)) return null;

  const { df, scale } = designParameters(n, design);
  if (df < 1) return null;

  const alpha = 1 - confidence;
  const nc = d * scale;

  if (Math.abs(nc) > nonCentralT.MAX_RELIABLE_NONCENTRALITY) {
    // AS 243 loses accuracy beyond this, and R's pt(ncp=) carries the same
    // limit. Refusing is better than returning a confidently wrong interval.
    return null;
  }

  const tLower = nonCentralT.ppf(alpha / 2, df, nc);
  const tUpper = nonCentralT.ppf(1 - alpha / 2, df, nc);

  // The rescaling the notebook omits.
  const lower = tLower / scale;
  const upper = tUpper / scale;

  // Hedges & Olkin's large-sample SE, shown alongside so the difference
  // between the exact and approximate methods is visible rather than asserted.
  const effectiveN = design === 'two-sample' ? n / 2 : n;
  const se = Math.sqrt(1 / effectiveN + (d * d) / (2 * effectiveN));
  const z = normal.ppf(1 - alpha / 2);

  return {
    d,
    n,
    confidence,
    design,
    df,
    nc,
    scaleFactor: scale,
    lower,
    upper,
    tScaleLower: tLower,
    tScaleUpper: tUpper,
    approxLower: d - z * se,
    approxUpper: d + z * se,
    // For a two-sample comparison, P(X > Y) = Phi(d / sqrt(2)).
    commonLanguage: normal.cdf(design === 'two-sample' ? d / Math.SQRT2 : d),
    excludesZero: lower > 0 || upper < 0,
  };
}

export interface IntervalCurvePoint {
  n: number;
  lower: number;
  upper: number;
  d: number;
}

/** How the interval tightens with n, holding d fixed. */
export function intervalCurve(
  d: number,
  confidence: number,
  design: Design,
  minN = 5,
  maxN = 200,
): IntervalCurvePoint[] {
  const points: IntervalCurvePoint[] = [];
  for (let n = Math.max(3, minN); n <= maxN; n += 1) {
    const result = cohensDInterval({ d, n, confidence, design });
    if (!result) continue;
    points.push({ n, lower: result.lower, upper: result.upper, d });
  }
  return points;
}

/** Smallest n at which the interval excludes zero, or null within range. */
export function sampleSizeToExcludeZero(
  d: number,
  confidence: number,
  design: Design,
  maxN = 2000,
): number | null {
  if (d === 0) return null;
  for (let n = 3; n <= maxN; n += 1) {
    const result = cohensDInterval({ d, n, confidence, design });
    if (result?.excludesZero) return n;
  }
  return null;
}
