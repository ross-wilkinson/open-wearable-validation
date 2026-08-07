/**
 * Standard normal distribution.
 *
 * The CDF is built on the exact identity
 *
 *     Phi(-|x|) = 0.5 * erfc(|x| / sqrt(2)) = 0.5 * Q(1/2, x^2 / 2)
 *
 * where Q is the regularized upper incomplete gamma from `special.ts`. That
 * routine already runs a properly convergent Lentz continued fraction, so this
 * inherits its accuracy — measured at ~1e-15 relative all the way out to
 * Phi(-30) ~ 5e-198 — instead of introducing a separate approximation with its
 * own error budget.
 *
 * A first version used Hart's (1968) rational approximation, the one that
 * circulates as "the double-precision normal CDF". Its central branch is
 * genuinely good, but its tail branch is a *fixed* five-level continued
 * fraction, and five levels are nowhere near converged around |x| = 7: it
 * returned only ~1e-9 relative accuracy there, which the fixture grid caught
 * immediately. Tail accuracy is not academic here — every confidence interval
 * in this app evaluates a quantile at 0.975 or beyond, and Module 5 works with
 * non-central t noncentralities where Phi(-delta) is the leading term.
 *
 * The quantile function is Wichura's AS 241 (PPND16), which is directly
 * double-precision accurate and needs no Newton refinement step.
 */

import { incompleteGammaUpper } from './special.ts';

const SQRT_2PI = 2.5066282746310002;

export function pdf(x: number): number {
  return Math.exp(-0.5 * x * x) / SQRT_2PI;
}

export function cdf(x: number): number {
  if (Number.isNaN(x)) return Number.NaN;
  if (x === 0) return 0.5;
  if (x === Number.NEGATIVE_INFINITY) return 0;
  if (x === Number.POSITIVE_INFINITY) return 1;

  // Always compute the *lower* tail, which is the branch that carries full
  // relative precision, then reflect. Computing the upper tail directly and
  // subtracting would throw away every significant digit for large x.
  const lowerTail = 0.5 * incompleteGammaUpper(0.5, (x * x) / 2);
  return x < 0 ? lowerTail : 1 - lowerTail;
}

/**
 * Upper tail, 1 - cdf(x), evaluated without cancellation.
 * `sf(10)` is ~7.6e-24; `1 - cdf(10)` is exactly 0.
 */
export function sf(x: number): number {
  return cdf(-x);
}

// Wichura AS 241 (PPND16) coefficients.
//
// Written as the exact doubles they round to, not as the decimal strings the
// 1988 paper prints. The published values carry ~21 significant digits — more
// than a float64 holds — so a literal copy is silently truncated by the
// compiler and flagged by `no-loss-of-precision`. These are those same
// constants passed through Number and printed at shortest round-trip
// precision: identical bits, honest source.
const A = [
  3.3871328727963665, 133.14166789178438, 1971.5909503065513, 13731.69376550946,
  45921.95393154987, 67265.7709270087, 33430.57558358813, 2509.0809287301227,
];
const B = [
  1, 42.31333070160091, 687.1870074920579, 5394.196021424751, 21213.794301586597,
  39307.89580009271, 28729.085735721943, 5226.495278852854,
];
const C = [
  1.4234371107496835, 4.630337846156546, 5.769497221460691, 3.6478483247632045,
  1.2704582524523684, 0.2417807251774506, 0.022723844989269184, 0.0007745450142783414,
];
const D = [
  1, 2.053191626637759, 1.6763848301838038, 0.6897673349851, 0.14810397642748008,
  0.015198666563616457, 0.0005475938084995345, 1.0507500716444169e-9,
];
const E = [
  6.657904643501103, 5.463784911164114, 1.7848265399172913, 0.29656057182850487,
  0.026532189526576124, 0.0012426609473880784, 0.000027115555687434876,
  2.0103343992922881e-7,
];
const F = [
  1, 0.599832206555888, 0.1369298809227358, 0.014875361290850615, 0.0007868691311456133,
  0.000018463183175100548, 1.421511758316446e-7, 2.0442631033899397e-15,
];

function polynomialRatio(num: readonly number[], den: readonly number[], r: number) {
  let n = 0;
  let d = 0;
  for (let i = num.length - 1; i >= 0; i -= 1) n = n * r + num[i]!;
  for (let i = den.length - 1; i >= 0; i -= 1) d = d * r + den[i]!;
  return n / d;
}

/** Quantile function (inverse CDF). Wichura AS 241, PPND16. */
export function ppf(p: number): number {
  if (Number.isNaN(p) || p < 0 || p > 1) return Number.NaN;
  if (p === 0) return Number.NEGATIVE_INFINITY;
  if (p === 1) return Number.POSITIVE_INFINITY;

  const q = p - 0.5;

  if (Math.abs(q) <= 0.425) {
    const r = 0.180625 - q * q;
    return q * polynomialRatio(A, B, r);
  }

  let r = q < 0 ? p : 1 - p;
  r = Math.sqrt(-Math.log(r));

  let value: number;
  if (r <= 5) {
    value = polynomialRatio(C, D, r - 1.6);
  } else {
    value = polynomialRatio(E, F, r - 5);
  }

  return q < 0 ? -value : value;
}
