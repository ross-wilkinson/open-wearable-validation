/**
 * Poisson distribution.
 *
 * The PMF is evaluated in log space. Computed directly, `lambda^k * e^-lambda
 * / k!` overflows `k!` well before k = 100, while the log form is stable for
 * every lambda a study timeline could plausibly use.
 *
 * The CDF is the exact identity F(k; lambda) = Q(k+1, lambda), the regularized
 * upper incomplete gamma — not a running sum of PMF terms, which accumulates
 * error and costs O(k).
 */

import { incompleteGammaUpper, logGamma } from './special.ts';

export function pmf(k: number, lambda: number): number {
  if (lambda < 0 || k < 0 || !Number.isInteger(k)) return 0;
  if (lambda === 0) return k === 0 ? 1 : 0;
  return Math.exp(-lambda + k * Math.log(lambda) - logGamma(k + 1));
}

export function cdf(k: number, lambda: number): number {
  if (lambda < 0) return Number.NaN;
  const floored = Math.floor(k);
  if (floored < 0) return 0;
  return incompleteGammaUpper(floored + 1, lambda);
}

/** Smallest k with cdf(k) >= p. */
export function ppf(p: number, lambda: number): number {
  if (Number.isNaN(p) || p < 0 || p > 1 || lambda < 0) return Number.NaN;
  if (p === 0) return 0;
  if (p === 1) return Number.POSITIVE_INFINITY;

  // Start from the normal approximation rather than zero: for lambda = 70 that
  // is ~30 evaluations saved, and the walk below corrects any error.
  const sd = Math.sqrt(lambda);
  let k = Math.max(0, Math.floor(lambda + normalQuantileApprox(p) * sd));

  if (cdf(k, lambda) >= p) {
    while (k > 0 && cdf(k - 1, lambda) >= p) k -= 1;
    return k;
  }
  while (cdf(k, lambda) < p) k += 1;
  return k;
}

// A crude inverse-normal, used only to seed the search above. Deliberately not
// the accurate one from normal.ts: this only needs to land near the answer,
// and keeping poisson.ts from depending on normal.ts keeps the module graph
// flat.
function normalQuantileApprox(p: number): number {
  if (p <= 0) return -6;
  if (p >= 1) return 6;
  const t = Math.sqrt(-2 * Math.log(p < 0.5 ? p : 1 - p));
  const x = t - (2.30753 + 0.27061 * t) / (1 + (0.99229 + 0.04481 * t) * t);
  return p < 0.5 ? -x : x;
}
