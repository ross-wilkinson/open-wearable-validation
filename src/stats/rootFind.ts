/**
 * Root finding for numerically inverting CDFs.
 *
 * Every `ppf` in this codebase that has no closed form is a call to
 * `solveMonotonic`. Because a CDF is monotonically non-decreasing, bracketing
 * is always safe: expand outward until the sign changes, then bisect-with-
 * interpolation to full double precision. Newton's method would converge
 * faster but needs a derivative and can leave the bracket entirely — not worth
 * it for a function evaluated a few hundred times per chart.
 */

export interface BracketOptions {
  /** Starting guess. Expansion grows outward from here. */
  guess?: number;
  /** Initial half-width of the search bracket. */
  step?: number;
  maxExpansions?: number;
}

export interface Bracket {
  lo: number;
  hi: number;
}

/**
 * Find `lo < hi` with `f(lo) <= 0 <= f(hi)` for a non-decreasing `f`.
 * Throws if no bracket exists within the expansion budget — silently returning
 * a wrong root would be far worse than a loud failure in a numerical core.
 */
export function bracketRoot(
  f: (x: number) => number,
  { guess = 0, step = 1, maxExpansions = 200 }: BracketOptions = {},
): Bracket {
  let lo = guess - step;
  let hi = guess + step;
  let width = step;

  for (let i = 0; i < maxExpansions; i += 1) {
    const flo = f(lo);
    const fhi = f(hi);
    if (Number.isFinite(flo) && Number.isFinite(fhi) && flo <= 0 && fhi >= 0) {
      return { lo, hi };
    }
    // Geometric growth: reaches the tails of a Cauchy-like distribution in a
    // few dozen steps rather than thousands of linear ones.
    width *= 2;
    if (!(Number.isFinite(flo) && flo <= 0)) lo = guess - width;
    if (!(Number.isFinite(fhi) && fhi >= 0)) hi = guess + width;

    if (!Number.isFinite(lo) || !Number.isFinite(hi)) break;
  }
  throw new Error('bracketRoot: could not bracket a sign change');
}

/**
 * Solve `f(x) = 0` for a monotonically non-decreasing `f`, using the Illinois
 * variant of false position.
 *
 * WHY ILLINOIS AND NOT PLAIN FALSE POSITION — this was a real bug, and an
 * instructive one. The first version took a false-position step whenever it
 * landed inside the bracket, on the reasoning that it is "bisection but
 * faster". It is not. For a *convex* function — which every CDF is, on one
 * side of its median — false position converges from one side only: the same
 * endpoint is replaced every iteration and the other one never moves at all.
 * The bracket width therefore never approaches zero, the `hi - lo <= tol`
 * termination never fires, and the loop runs its full iteration budget before
 * falling through to `0.5 * (lo + hi)`.
 *
 * With `lo` still pinned at its initial value of 0, that fallthrough returns
 * *exactly half* the true root. Every Student t quantile came back at 50% of
 * SciPy's answer — a clean factor of two across the whole grid, which looks far
 * more like an algebra slip than a convergence failure. Worth remembering:
 * "wrong by a constant factor" does not imply the mistake was in a formula.
 *
 * Illinois fixes it in three lines: when the same endpoint is retained twice
 * in a row, halve its stored function value. That biases the next interpolation
 * toward the stagnant side and forces both endpoints to move, restoring
 * superlinear convergence while keeping the bracket guarantee that makes this
 * safe in the first place.
 */
export function solveMonotonic(
  f: (x: number) => number,
  bracket: Bracket,
  tolerance = 1e-12,
  maxIterations = 200,
): number {
  let { lo, hi } = bracket;
  let flo = f(lo);
  let fhi = f(hi);

  if (flo === 0) return lo;
  if (fhi === 0) return hi;
  if (flo > 0 || fhi < 0) {
    throw new Error('solveMonotonic: bracket does not contain a sign change');
  }

  // Which endpoint was retained last time: -1 = lo moved, +1 = hi moved.
  let lastMoved = 0;

  for (let i = 0; i < maxIterations; i += 1) {
    const mid = 0.5 * (lo + hi);

    const denom = fhi - flo;
    const interpolated = denom === 0 ? mid : lo - (flo * (hi - lo)) / denom;
    // Fall back to bisection whenever interpolation leaves the bracket, so a
    // pathological f can never break the invariant.
    const x =
      Number.isFinite(interpolated) && interpolated > lo && interpolated < hi
        ? interpolated
        : mid;

    const fx = f(x);
    if (fx === 0) return x;

    if (fx < 0) {
      lo = x;
      flo = fx;
      if (lastMoved === -1) fhi *= 0.5;
      lastMoved = -1;
    } else {
      hi = x;
      fhi = fx;
      if (lastMoved === 1) flo *= 0.5;
      lastMoved = 1;
    }

    // Relative tolerance, so this behaves the same for a t-value near 1 and a
    // Cauchy quantile in the thousands.
    if (hi - lo <= tolerance * Math.max(1, Math.abs(lo), Math.abs(hi))) {
      return 0.5 * (lo + hi);
    }
  }
  return 0.5 * (lo + hi);
}

/**
 * Invert a CDF: return x such that `cdf(x) = p`.
 * `guess`/`step` seed the bracket search and matter only for speed.
 */
export function invertCdf(
  cdf: (x: number) => number,
  p: number,
  options: BracketOptions = {},
): number {
  if (p <= 0) return Number.NEGATIVE_INFINITY;
  if (p >= 1) return Number.POSITIVE_INFINITY;
  const f = (x: number) => cdf(x) - p;
  return solveMonotonic(f, bracketRoot(f, options));
}
