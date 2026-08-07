import { describe, expect, it } from 'vitest';
import {
  incompleteBeta,
  incompleteGammaLower,
  incompleteGammaUpper,
  logBeta,
  logGamma,
} from './special.ts';
import { checkGrid, formatMismatches, specialFixture } from './testing/fixtures.ts';

describe('logGamma', () => {
  it('matches SciPy', () => {
    const bad = checkGrid(
      specialFixture.logGamma,
      (c) => ({ got: logGamma(c.x), want: c.want, label: `logGamma(${c.x})` }),
      1e-14,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('reproduces known exact values', () => {
    expect(logGamma(1)).toBeCloseTo(0, 13);
    expect(logGamma(2)).toBeCloseTo(0, 13);
    expect(logGamma(0.5)).toBeCloseTo(Math.log(Math.sqrt(Math.PI)), 13);
    // log(5!) = log(120)
    expect(logGamma(6)).toBeCloseTo(Math.log(120), 12);
  });
});

describe('logBeta', () => {
  it('matches an EXACT reference on the lopsided pairs that cancel', () => {
    // This is the tight assertion, and it grades against exact arithmetic
    // rather than against SciPy — because here SciPy is the less accurate one.
    //
    // `scipy.special.betaln` is the naive gammaln(a) + gammaln(b) -
    // gammaln(a+b), i.e. exactly the cancelling form this module replaced. Its
    // absolute error grows from 1.5e-16 at a=5 to 7.7e-13 at a=1000. Measured
    // against the exact closed form B(a, 1/2) = (a-1)! a! 4^a / (2a)! computed
    // over exact integers, this implementation is accurate to <1e-15 at
    // a = 250, 500 and 1000, where SciPy is off by 4.3e-14, 3.3e-13 and
    // 7.7e-13 respectively.
    //
    // The general lesson, and the reason the exact fixture exists at all: a
    // golden-value test is only as good as the oracle. When a well-tested port
    // disagrees with its reference in a way that gets *worse* with argument
    // size, suspect the reference before patching the port.
    const bad = checkGrid(
      specialFixture.logBeta_exact,
      (c) => ({
        got: logBeta(c.a, c.b),
        want: c.want,
        label: `logBeta(${c.a}, ${c.b})`,
      }),
      1e-14,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('agrees with SciPy to within SciPy’s own accuracy', () => {
    // Kept as a coverage net over the wider pair grid (including pairs with no
    // closed form), but graded at 1e-12 — the bound is SciPy's error, not
    // ours, per the test above.
    const bad = checkGrid(
      specialFixture.logBeta,
      (c) => ({
        got: logBeta(c.a, c.b),
        want: c.want,
        label: `logBeta(${c.a}, ${c.b})`,
      }),
      1e-12,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('is symmetric in its arguments', () => {
    // Also checks that the large/small dispatch cannot disagree with itself.
    for (const [a, b] of [
      [0.5, 250],
      [3, 400],
      [2, 3],
      [100, 100],
    ] as const) {
      expect(logBeta(a, b)).toBeCloseTo(logBeta(b, a), 13);
    }
  });

  it('is continuous across the recurrence/Stirling seam', () => {
    // At x = 30 `logGammaDelta` stops walking the argument up by recurrence and
    // evaluates Stirling directly. The two paths must agree to full precision
    // there: a discontinuity would be invisible in a fixture grid sampled on
    // round numbers, but would show up as a kink in a rendered curve.
    for (const b of [0.5, 1, 7]) {
      const below = logBeta(30 - 1e-7, b);
      const above = logBeta(30 + 1e-7, b);
      expect(Math.abs(above - below)).toBeLessThan(1e-7);
    }
  });
});

describe('incompleteBeta', () => {
  it('matches SciPy', () => {
    const bad = checkGrid(
      specialFixture.incompleteBeta,
      (c) => ({
        got: incompleteBeta(c.x, c.a, c.b),
        want: c.want,
        label: `I_${c.x}(${c.a}, ${c.b})`,
      }),
      1e-13,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('satisfies the reflection identity', () => {
    // I_x(a,b) = 1 - I_(1-x)(b,a) exercises both sides of the continued
    // fraction's convergence pivot against each other.
    for (const [a, b] of [
      [2, 3],
      [24.5, 0.5],
      [250, 0.5],
    ] as const) {
      for (const x of [0.1, 0.5, 0.9]) {
        expect(incompleteBeta(x, a, b)).toBeCloseTo(
          1 - incompleteBeta(1 - x, b, a),
          12,
        );
      }
    }
  });

  it('clamps at the boundaries', () => {
    expect(incompleteBeta(0, 2, 3)).toBe(0);
    expect(incompleteBeta(1, 2, 3)).toBe(1);
  });
});

describe('incomplete gamma', () => {
  it('lower matches SciPy', () => {
    // 1e-12 for the same reason the Poisson PMF is: both evaluate
    // `exp(-x + a*log(x) - logGamma(a))`, which cancels for large `a`. At
    // a = 70, x = 70 the exponent terms are -70, +297.4 and -226.2 summing to
    // ~1.2, so two-plus digits go before `exp` runs. Every failure at 1e-13
    // sits at a = 70 and nowhere else.
    //
    // This does NOT reach `normal.cdf`, which is the heaviest consumer of this
    // function: it calls Q(1/2, x^2/2), where `a` is small, logGamma(0.5) is
    // 0.57, and nothing cancels. That path is verified separately to 1e-14 in
    // normal.test.ts, including the far tails.
    const bad = checkGrid(
      specialFixture.incompleteGammaLower,
      (c) => ({
        got: incompleteGammaLower(c.a, c.x),
        want: c.want,
        label: `P(${c.a}, ${c.x})`,
      }),
      1e-12,
      1e-300,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('upper matches SciPy', () => {
    const bad = checkGrid(
      specialFixture.incompleteGammaUpper,
      (c) => ({
        got: incompleteGammaUpper(c.a, c.x),
        want: c.want,
        label: `Q(${c.a}, ${c.x})`,
      }),
      1e-12,
      1e-300,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('lower and upper sum to one', () => {
    for (const a of [0.5, 5, 70]) {
      for (const x of [0.1, 5, 70, 150]) {
        expect(incompleteGammaLower(a, x) + incompleteGammaUpper(a, x)).toBeCloseTo(
          1,
          13,
        );
      }
    }
  });
});
