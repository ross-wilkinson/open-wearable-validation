/**
 * Half-normal distribution — the distribution of |e| when e ~ N(0, 1).
 *
 * This is what makes the percentile machinery in Module 1 meaningful: study
 * errors are signed, but the quantity a practitioner cares about ("95% of
 * users are within X") is a percentile of the *absolute* error. Every
 * expression here is an exact identity on the standard normal, so there is no
 * separate approximation to verify.
 */

import * as normal from './normal.ts';

export function pdf(x: number): number {
  if (x < 0) return 0;
  return 2 * normal.pdf(x);
}

export function cdf(x: number): number {
  if (x < 0) return 0;
  return 2 * normal.cdf(x) - 1;
}

export function ppf(p: number): number {
  if (Number.isNaN(p) || p < 0 || p > 1) return Number.NaN;
  return normal.ppf((1 + p) / 2);
}

/**
 * Density evaluated at the p-th quantile, f(x_p).
 *
 * Its own function because this exact composition is the denominator of the
 * sample-quantile variance in Module 1, and because it is where that formula
 * degenerates: as p approaches 0 or 1 the density goes to zero and the
 * variance diverges. Naming it makes that failure mode findable.
 */
export function densityAtQuantile(p: number): number {
  return pdf(ppf(p));
}
