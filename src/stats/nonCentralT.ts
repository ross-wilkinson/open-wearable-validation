/**
 * Non-central t distribution.
 *
 * This is the only genuinely difficult distribution in the toolkit, and the
 * reason it is here at all is Module 5: a correct confidence interval for
 * Cohen's d comes from inverting *this*, not from a normal approximation
 * around d. Most published effect-size intervals get that wrong.
 *
 * The CDF is Algorithm AS 243 (Lenth 1989), which builds the answer as a
 * Poisson-weighted mixture of incomplete beta terms:
 *
 *     P(T <= t) = Phi(-delta) + sum_j [ p_j * I_x(j + 1/2, v/2)
 *                                     + q_j * I_x(j + 1,   v/2) ]
 *
 * with x = t^2 / (t^2 + v), and p_j / q_j the odd and even Poisson weights in
 * lambda = delta^2 / 2. The two series are advanced together — "twin series" —
 * with the incomplete betas updated by recurrence rather than recomputed, so
 * the whole sum costs one `incompleteBeta` call regardless of term count.
 *
 * Accuracy caveat, inherited from AS 243 and shared with R's `pt(ncp=)`: the
 * expansion loses digits for very large |delta|. The guard below is the same
 * one R uses. In this app delta = d * sqrt(n), so reaching it would take an
 * implausible effect size — but it fails loudly rather than silently.
 */

import { incompleteBeta, logBeta } from './special.ts';
import { invertCdf } from './rootFind.ts';
import * as normal from './normal.ts';
import * as studentT from './studentT.ts';

const ERROR_MAX = 1e-14;
const ITERATION_MAX = 1000;

/** Beyond this the leading Phi(-delta) term underflows and AS 243 degrades. */
export const MAX_RELIABLE_NONCENTRALITY = 37.62;

export function cdf(t: number, df: number, nc: number): number {
  if (df <= 0 || Number.isNaN(t) || Number.isNaN(nc)) return Number.NaN;
  if (nc === 0) return studentT.cdf(t, df);
  if (t === Number.NEGATIVE_INFINITY) return 0;
  if (t === Number.POSITIVE_INFINITY) return 1;

  // The series is derived for t >= 0. Negative t is handled by the reflection
  // P(T <= t | delta) = 1 - P(T <= -t | -delta).
  const negate = t < 0;
  const tt = negate ? -t : t;
  const delta = negate ? -nc : nc;

  let result = tnc(tt, df, delta);
  result += normal.cdf(-delta);

  if (negate) result = 1 - result;
  return Math.min(1, Math.max(0, result));
}

/** The AS 243 twin series, for t >= 0. Excludes the Phi(-delta) term. */
function tnc(t: number, df: number, delta: number): number {
  const x = (t * t) / (t * t + df);
  if (x <= 0) return 0;

  const lambda = delta * delta;
  let p = 0.5 * Math.exp(-0.5 * lambda);
  let q = (Math.SQRT2 / Math.sqrt(Math.PI)) * p * delta;
  let s = 0.5 - p;
  // For large lambda, `0.5 - p` cancels to exactly 0.5 and the remaining
  // Poisson mass has to be tracked from the other end, otherwise the error
  // bound never tightens and the loop always runs to ITERATION_MAX.
  if (s <= 0) s = 0.5;

  let a = 0.5;
  const b = 0.5 * df;
  const rxb = Math.pow(1 - x, b);
  const albeta = logBeta(a, b);

  let xOdd = incompleteBeta(x, a, b);
  let gOdd = 2 * rxb * Math.exp(a * Math.log(x) - albeta);
  let xEven = 1 - rxb;
  let gEven = b * x * rxb;

  let total = p * xOdd + q * xEven;
  let en = 1;

  for (let i = 0; i < ITERATION_MAX; i += 1) {
    a += 1;
    xOdd -= gOdd;
    xEven -= gEven;
    gOdd *= (x * (a + b - 1)) / a;
    gEven *= (x * (a + b - 0.5)) / (a + 0.5);
    p *= lambda / (2 * en);
    q *= lambda / (2 * en + 1);
    s -= p;
    en += 1;
    total += p * xOdd + q * xEven;

    const errorBound = 2 * s * (xOdd - gOdd);
    if (errorBound <= ERROR_MAX) break;
  }
  return total;
}

export function sf(t: number, df: number, nc: number): number {
  return 1 - cdf(t, df, nc);
}

export function ppf(p: number, df: number, nc: number): number {
  if (df <= 0 || Number.isNaN(p) || p < 0 || p > 1) return Number.NaN;
  if (p === 0) return Number.NEGATIVE_INFINITY;
  if (p === 1) return Number.POSITIVE_INFINITY;
  if (nc === 0) return studentT.ppf(p, df);

  // Seed near the distribution's centre: for moderate df the non-central t is
  // roughly a t shifted by the noncentrality.
  const guess = nc + studentT.ppf(p, df);
  return invertCdf((x) => cdf(x, df, nc), p, {
    guess,
    step: Math.max(1, Math.abs(guess) * 0.5),
  });
}
