/**
 * Special functions the distributions are built on.
 *
 * These are the pieces `scipy.special` would provide. Everything here is pure,
 * dependency-free, and verified against SciPy in `special.test.ts`.
 */

/** Natural log of the gamma function, via the Lanczos approximation (g=7, n=9). */
export function logGamma(x: number): number {
  if (Number.isNaN(x)) return Number.NaN;
  if (x <= 0 && Number.isInteger(x)) return Number.POSITIVE_INFINITY;

  // Reflection formula for x < 0.5, where the Lanczos series is not valid.
  if (x < 0.5) {
    return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - logGamma(1 - x);
  }

  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7,
  ];

  const z = x - 1;
  let a = c[0]!;
  const t = z + g + 0.5;
  for (let i = 1; i < g + 2; i += 1) {
    a += c[i]! / (z + i);
  }
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a);
}

/**
 * Stirling's correction term S(x), where
 *   logGamma(x) = (x - 1/2) ln x - x + (1/2) ln(2*pi) + S(x)
 * Truncated after the x^-9 term, which is below double precision for x >= 30.
 */
function stirlingCorrection(x: number): number {
  const inv = 1 / x;
  const inv2 = inv * inv;
  return (
    inv *
    (1 / 12 - inv2 * (1 / 360 - inv2 * (1 / 1260 - inv2 * (1 / 1680 - inv2 / 1188))))
  );
}

/** Smallest argument at which the Stirling asymptotics hold to full precision. */
const STIRLING_MIN = 30;

/**
 * logGamma(x + delta) - logGamma(x) via Stirling, valid for x >= STIRLING_MIN.
 * Expanding both Stirling forms and collecting terms gives
 *
 *   (x - 1/2) * log1p(delta/x) + delta * ln(x + delta) - delta + S(x+delta) - S(x)
 *
 * The `log1p` is what does the work: writing the leading difference as
 * ln(x+delta) - ln(x) and evaluating it directly would subtract two numbers
 * that agree to many digits, which is the very cancellation being avoided.
 */
function stirlingGammaDelta(x: number, delta: number): number {
  return (
    (x - 0.5) * Math.log1p(delta / x) +
    delta * Math.log(x + delta) -
    delta +
    stirlingCorrection(x + delta) -
    stirlingCorrection(x)
  );
}

/**
 * logGamma(x + delta) - logGamma(x) for any x > 0.
 *
 * For small x the Stirling series is not accurate, so the argument is walked
 * up into its valid range using the exact recurrence
 *
 *   D(x) = D(x + 1) - log1p(delta / x)
 *
 * which follows from Gamma(z+1) = z * Gamma(z) applied to both terms. Each
 * step is a `log1p` of a small quantity, so the walk adds no cancellation of
 * its own — the alternative, `logGamma(x) + logGamma(b) - logGamma(x+b)` at
 * small x, is what loses the digits.
 */
function logGammaDelta(x: number, delta: number): number {
  let result = 0;
  let current = x;
  while (current < STIRLING_MIN) {
    result -= Math.log1p(delta / current);
    current += 1;
  }
  return result + stirlingGammaDelta(current, delta);
}

/**
 * Natural log of the beta function.
 *
 * The textbook form `logGamma(a) + logGamma(b) - logGamma(a+b)` is fine when a
 * and b are comparable, and quietly loses three significant digits when one
 * dominates. At df = 500 the Student t PDF needs logBeta(250, 0.5): logGamma
 * (250) = 1176.6 and logGamma(250.5) = 1177.7 agree to four digits, and their
 * difference *is* the answer. Relative error of 1e-16 on inputs of that size
 * lands as ~1e-13 on the result, and `exp` carries that straight through to
 * the density. The fixture grid caught it as a systematic ~3e-13 failure at
 * df = 500 and df = 199 only — never at small df, which is exactly the
 * fingerprint of a cancellation bug rather than a wrong formula.
 */
export function logBeta(a: number, b: number): number {
  if (a <= 0 || b <= 0) return Number.NaN;
  const small = Math.min(a, b);
  const large = Math.max(a, b);
  // Always the stable path. `logGammaDelta` handles small `large` by walking
  // the argument up with an exact recurrence, so there is no threshold at
  // which the accuracy story changes — which also means no seam in the middle
  // of the range where a chart could develop a kink.
  return logGamma(small) - logGammaDelta(large, small);
}

const TINY = 1e-300;
const EPS = 3e-16;

/**
 * Continued-fraction expansion for the incomplete beta, evaluated with the
 * modified Lentz algorithm. Converges quickly for x < (a+1)/(a+b+2); callers
 * use the symmetry relation outside that range.
 */
function betaContinuedFraction(x: number, a: number, b: number): number {
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;

  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= 300; m += 1) {
    const m2 = 2 * m;

    // Even step.
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    h *= d * c;

    // Odd step.
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/**
 * Regularized incomplete beta function I_x(a, b) — SciPy's `betainc`.
 *
 * This is the workhorse: the Student t CDF is a thin wrapper around it, and
 * the non-central t series calls it once per term.
 */
export function incompleteBeta(x: number, a: number, b: number): number {
  if (Number.isNaN(x) || Number.isNaN(a) || Number.isNaN(b)) return Number.NaN;
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - logBeta(a, b));

  // The continued fraction converges fast only on one side of this pivot;
  // reflect to the other side when needed.
  return x < (a + 1) / (a + b + 2)
    ? (front * betaContinuedFraction(x, a, b)) / a
    : 1 - (front * betaContinuedFraction(1 - x, b, a)) / b;
}

/** Series expansion of the regularized lower incomplete gamma P(a, x). */
function gammaSeries(a: number, x: number): number {
  let ap = a;
  let sum = 1 / a;
  let del = sum;
  for (let i = 0; i < 1000; i += 1) {
    ap += 1;
    del *= x / ap;
    sum += del;
    if (Math.abs(del) < Math.abs(sum) * EPS) break;
  }
  return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
}

/** Continued fraction for the regularized upper incomplete gamma Q(a, x). */
function gammaContinuedFraction(a: number, x: number): number {
  let b = x + 1 - a;
  let c = 1 / TINY;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= 1000; i += 1) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < TINY) d = TINY;
    c = b + an / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h * Math.exp(-x + a * Math.log(x) - logGamma(a));
}

/** Regularized lower incomplete gamma P(a, x) — SciPy's `gammainc`. */
export function incompleteGammaLower(a: number, x: number): number {
  if (x < 0 || a <= 0) return Number.NaN;
  if (x === 0) return 0;
  return x < a + 1 ? gammaSeries(a, x) : 1 - gammaContinuedFraction(a, x);
}

/** Regularized upper incomplete gamma Q(a, x) — SciPy's `gammaincc`. */
export function incompleteGammaUpper(a: number, x: number): number {
  if (x < 0 || a <= 0) return Number.NaN;
  if (x === 0) return 1;
  return x < a + 1 ? 1 - gammaSeries(a, x) : gammaContinuedFraction(a, x);
}
