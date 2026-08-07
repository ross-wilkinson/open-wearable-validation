import { describe, expect, it } from 'vitest';
import { bracketRoot, invertCdf, solveMonotonic } from './rootFind.ts';
import * as normal from './normal.ts';

describe('solveMonotonic', () => {
  it('solves a linear root exactly', () => {
    expect(solveMonotonic((x) => x - 3, { lo: 0, hi: 10 })).toBeCloseTo(3, 12);
  });

  it('does not stagnate on a strongly convex function', () => {
    // REGRESSION TEST. Plain false position retains one endpoint forever on a
    // convex function: `lo` never leaves 0, the bracket never narrows, the
    // tolerance check never fires, and the loop falls through to the bracket
    // midpoint — returning very nearly half the true root.
    //
    // exp(x) - 1 - 1e6 is convex and steep, the worst case for that failure.
    // Its root is log(1 + 1e6) ~ 13.8155.
    const root = solveMonotonic((x) => Math.exp(x) - 1 - 1e6, { lo: 0, hi: 100 });
    expect(root).toBeCloseTo(Math.log(1 + 1e6), 9);

    // Explicitly assert it is not the stagnation artefact.
    expect(root).not.toBeCloseTo(Math.log(1 + 1e6) / 2, 3);
  });

  it('converges in far fewer iterations than the budget on a real CDF', () => {
    // Guards the other direction from the stagnation test: a "fix" that merely
    // raised maxIterations, or fell back to pure bisection everywhere, would
    // still pass that test while doing far more work than Illinois needs.
    //
    // Measured on an actual CDF inversion rather than the pathological
    // exponential above, because that is the real workload — and because a
    // bounded function in [0, 1] is a genuinely easier problem than one
    // spanning 43 orders of magnitude. (The exponential needs ~150 calls; it
    // is kept as a correctness case, not a performance one.)
    let calls = 0;
    const f = (x: number) => {
      calls += 1;
      return normal.cdf(x) - 0.975;
    };
    const root = solveMonotonic(f, { lo: -5, hi: 5 });
    expect(root).toBeCloseTo(normal.ppf(0.975), 9);
    expect(calls).toBeLessThan(40);
  });

  it('throws rather than returning a wrong root when the bracket is invalid', () => {
    expect(() => solveMonotonic((x) => x - 3, { lo: 5, hi: 10 })).toThrow(
      /sign change/,
    );
  });

  it('returns an exact endpoint when the root sits on one', () => {
    expect(solveMonotonic((x) => x - 5, { lo: 5, hi: 10 })).toBe(5);
    expect(solveMonotonic((x) => x - 10, { lo: 5, hi: 10 })).toBe(10);
  });
});

describe('bracketRoot', () => {
  it('expands geometrically to reach a distant root', () => {
    const { lo, hi } = bracketRoot((x) => x - 5000, { guess: 0, step: 1 });
    expect(lo).toBeLessThanOrEqual(5000);
    expect(hi).toBeGreaterThanOrEqual(5000);
  });

  it('throws when no sign change exists', () => {
    expect(() => bracketRoot(() => 1, { guess: 0, step: 1 })).toThrow(/bracket/);
  });
});

describe('invertCdf', () => {
  it('recovers the normal quantile from the normal CDF', () => {
    for (const p of [0.001, 0.025, 0.5, 0.975, 0.999]) {
      expect(invertCdf(normal.cdf, p)).toBeCloseTo(normal.ppf(p), 8);
    }
  });

  it('returns infinities at the boundaries', () => {
    expect(invertCdf(normal.cdf, 0)).toBe(Number.NEGATIVE_INFINITY);
    expect(invertCdf(normal.cdf, 1)).toBe(Number.POSITIVE_INFINITY);
  });
});
