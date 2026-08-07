/**
 * Seeded pseudo-random sampling.
 *
 * Deliberately seeded, not `Math.random()`. A Monte Carlo whose answer changes
 * every time the page re-renders is not a tool anyone can plan a study with —
 * two people reading the same inputs must see the same distribution, and a
 * screenshot has to still be true tomorrow. The seed is part of the input.
 *
 * That also makes the samplers testable: with a fixed seed, a distributional
 * assertion is deterministic rather than flaky.
 */

/**
 * mulberry32 — small, fast, and statistically sound enough for Monte Carlo
 * over study durations. This is not a cryptographic generator and must never
 * be used as one.
 */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

/** Standard normal, via the polar form of Box-Muller. */
export function sampleNormal(rng: Rng): number {
  // The polar form rejects rather than calling sin/cos, and avoids the
  // `log(0)` that the basic form hits when rng() returns exactly 0.
  let u: number;
  let v: number;
  let s: number;
  do {
    u = 2 * rng() - 1;
    v = 2 * rng() - 1;
    s = u * u + v * v;
  } while (s === 0 || s >= 1);
  return u * Math.sqrt((-2 * Math.log(s)) / s);
}

/**
 * Gamma(shape, scale), via Marsaglia & Tsang (2000).
 *
 * The algorithm requires shape >= 1; smaller shapes use the standard boost
 * Gamma(a) = Gamma(a+1) * U^(1/a).
 */
export function sampleGamma(rng: Rng, shape: number, scale: number): number {
  if (!(shape > 0) || !(scale > 0)) return Number.NaN;

  if (shape < 1) {
    return sampleGamma(rng, shape + 1, scale) * Math.pow(rng(), 1 / shape);
  }

  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  for (;;) {
    const x = sampleNormal(rng);
    const v = (1 + c * x) ** 3;
    if (v <= 0) continue;

    const u = rng();
    const x2 = x * x;
    // The cheap squeeze first; the log test only when it fails.
    if (u < 1 - 0.0331 * x2 * x2) return d * v * scale;
    if (Math.log(u) < 0.5 * x2 + d * (1 - v + Math.log(v))) return d * v * scale;
  }
}

/** Beta(alpha, beta), as the ratio of two gamma draws. */
export function sampleBeta(rng: Rng, alpha: number, beta: number): number {
  const x = sampleGamma(rng, alpha, 1);
  const y = sampleGamma(rng, beta, 1);
  const total = x + y;
  return total === 0 ? 0 : x / total;
}

/**
 * Poisson(lambda).
 *
 * Knuth's product method below ~30, where it is simple and fast. Above that
 * `exp(-lambda)` underflows toward zero and the loop degenerates, so it
 * switches to Atkinson's rejection method, which is stable for large lambda.
 */
export function samplePoisson(rng: Rng, lambda: number): number {
  if (!(lambda > 0)) return 0;

  if (lambda < 30) {
    const limit = Math.exp(-lambda);
    let k = 0;
    let product = rng();
    while (product > limit) {
      k += 1;
      product *= rng();
    }
    return k;
  }

  const c = 0.767 - 3.36 / lambda;
  const beta = Math.PI / Math.sqrt(3 * lambda);
  const alpha = beta * lambda;
  const k = Math.log(c) - lambda - Math.log(beta);

  for (;;) {
    const u = rng();
    const x = (alpha - Math.log((1 - u) / u)) / beta;
    const n = Math.floor(x + 0.5);
    if (n < 0) continue;
    const v = rng();
    const y = alpha - beta * x;
    const temp = 1 + Math.exp(y);
    const lhs = y + Math.log(v / (temp * temp));
    const rhs = k + n * Math.log(lambda) - logFactorial(n);
    if (lhs <= rhs) return n;
  }
}

const LOG_FACTORIAL_CACHE: number[] = [0, 0];
function logFactorial(n: number): number {
  if (n < 2) return 0;
  const cached = LOG_FACTORIAL_CACHE[n];
  if (cached !== undefined) return cached;
  let total = LOG_FACTORIAL_CACHE[LOG_FACTORIAL_CACHE.length - 1]!;
  for (let i = LOG_FACTORIAL_CACHE.length; i <= n; i += 1) {
    total += Math.log(i);
    LOG_FACTORIAL_CACHE[i] = total;
  }
  return total;
}

/**
 * Lognormal with a given arithmetic mean and SD on the *observed* scale.
 *
 * Callers think in "this phase takes about 28 days, give or take 10", not in
 * the mean and SD of the underlying normal — so the conversion happens here:
 *
 *     sigma^2 = ln(1 + sd^2/mean^2)
 *     mu      = ln(mean) - sigma^2/2
 */
export function sampleLognormal(rng: Rng, mean: number, sd: number): number {
  if (!(mean > 0)) return Number.NaN;
  if (!(sd > 0)) return mean;
  const sigmaSquared = Math.log1p((sd * sd) / (mean * mean));
  const mu = Math.log(mean) - sigmaSquared / 2;
  return Math.exp(mu + Math.sqrt(sigmaSquared) * sampleNormal(rng));
}

/**
 * Beta-PERT from a three-point estimate.
 *
 * The estimating form project planners actually use: optimistic, most likely,
 * pessimistic. `lambda` is the weight on the mode (4 is the PERT convention);
 * lowering it widens the distribution without moving the endpoints.
 *
 *     alpha = 1 + lambda * (mode - min) / (max - min)
 *     beta  = 1 + lambda * (max - mode) / (max - min)
 *
 * Note these take the **mode**, not the mean. A first version used the PERT
 * mean, (min + lambda*mode + max)/(lambda + 2), in both — which looks
 * plausible and is wrong: for (10, 20, 60) it produced a sample mean of 28.3
 * against the correct 25. Substituting the mode form gives
 * alpha + beta = lambda + 2 exactly, so the scaled mean telescopes back to the
 * PERT mean by construction. Caught by asserting the closed-form moment rather
 * than eyeballing a histogram.
 */
export function samplePert(
  rng: Rng,
  min: number,
  mode: number,
  max: number,
  lambda = 4,
): number {
  if (!(max > min)) return min;
  const clampedMode = Math.min(Math.max(mode, min), max);
  const range = max - min;

  const alpha = 1 + (lambda * (clampedMode - min)) / range;
  const beta = 1 + (lambda * (max - clampedMode)) / range;

  return min + sampleBeta(rng, alpha, beta) * range;
}

/** Sample quantiles from an unsorted array. Sorts a copy; does not mutate. */
export function quantiles(values: readonly number[], ps: readonly number[]): number[] {
  if (values.length === 0) return ps.map(() => Number.NaN);
  const sorted = [...values].sort((a, b) => a - b);
  return ps.map((p) => {
    // Linear interpolation between order statistics — the same convention as
    // numpy.percentile's default, so results are comparable to the notebook.
    const index = p * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower]! * (1 - weight) + sorted[upper]! * weight;
  });
}

export function mean(values: readonly number[]): number {
  if (values.length === 0) return Number.NaN;
  let total = 0;
  for (const value of values) total += value;
  return total / values.length;
}

export function standardDeviation(values: readonly number[]): number {
  if (values.length < 2) return Number.NaN;
  const m = mean(values);
  let total = 0;
  for (const value of values) total += (value - m) ** 2;
  return Math.sqrt(total / (values.length - 1));
}
