/**
 * Student t distribution.
 *
 * The CDF is an exact identity on the regularized incomplete beta:
 *   F(x; v) = 1 - 0.5 * I_{v/(v+x^2)}(v/2, 1/2)   for x > 0
 * so accuracy is inherited wholesale from `incompleteBeta` rather than coming
 * from a separate approximation with its own error budget.
 *
 * The quantile function is inverted numerically, with the two closed-form
 * cases (v = 1 Cauchy, v = 2) handled directly — they are both exact and they
 * are precisely the heavy-tailed cases where a numerical bracket has to travel
 * furthest.
 */

import { incompleteBeta, logBeta } from './special.ts';
import { invertCdf } from './rootFind.ts';
import * as normal from './normal.ts';

export function pdf(x: number, df: number): number {
  if (df <= 0) return Number.NaN;
  const logValue =
    -0.5 * (df + 1) * Math.log1p((x * x) / df) -
    0.5 * Math.log(df) -
    logBeta(0.5 * df, 0.5);
  return Math.exp(logValue);
}

export function cdf(x: number, df: number): number {
  if (df <= 0) return Number.NaN;
  if (Number.isNaN(x)) return Number.NaN;
  if (x === Number.NEGATIVE_INFINITY) return 0;
  if (x === Number.POSITIVE_INFINITY) return 1;

  const half = 0.5 * incompleteBeta(df / (df + x * x), 0.5 * df, 0.5);
  return x > 0 ? 1 - half : half;
}

export function sf(x: number, df: number): number {
  return cdf(-x, df);
}

export function ppf(p: number, df: number): number {
  if (df <= 0 || Number.isNaN(p) || p < 0 || p > 1) return Number.NaN;
  if (p === 0) return Number.NEGATIVE_INFINITY;
  if (p === 1) return Number.POSITIVE_INFINITY;
  if (p === 0.5) return 0;

  // Closed forms. Also the two worst cases for a numerical inversion: at df=1
  // the 0.0001 quantile is about -3183, so seeding the bracket from a normal
  // approximation would take many expansions to reach it.
  if (df === 1) return Math.tan(Math.PI * (p - 0.5));
  if (df === 2) return (2 * p - 1) * Math.sqrt(2 / (4 * p * (1 - p)));

  // A normal quantile is a good starting guess and gets better as df grows;
  // the bracket search only has to cover the t distribution's heavier tail.
  const guess = normal.ppf(p);
  return invertCdf((x) => cdf(x, df), p, {
    guess,
    step: Math.max(1, Math.abs(guess)),
  });
}

/**
 * Two-sided critical value: the multiplier on a standard error that produces a
 * `confidence`-level interval. `criticalValue(0.95, n - 1)` is `t.ppf(0.975, n-1)`.
 *
 * Exposed as its own function because "confidence level" is what the UI asks
 * the user for, and converting it to a tail probability at each call site is
 * exactly the sort of thing that gets done inconsistently.
 */
export function criticalValue(confidence: number, df: number): number {
  return ppf(1 - (1 - confidence) / 2, df);
}
