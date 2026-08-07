import { describe, expect, it } from 'vitest';
import * as poisson from './poisson.ts';
import { checkGrid, formatMismatches, poissonFixture } from './testing/fixtures.ts';

describe('poisson', () => {
  it('pmf matches SciPy across the lambda grid', () => {
    // 1e-12, not the 1e-14 the other distributions hold to, and the reason is
    // worth stating rather than hiding.
    //
    // `-lambda + k*log(lambda) - logGamma(k+1)` cancels: at k=92, lambda=70
    // the three terms are -70, +390.8 and -320.7, summing to about 0.1. Three
    // or four significant digits are lost before `exp` ever runs, which shows
    // up as ~1.7e-13 relative error near the mode of large-lambda cases and
    // nowhere else.
    //
    // The textbook cure is Loader's saddle-point form (the `bd0`/`stirlerr`
    // decomposition R and SciPy use), and it was deliberately not implemented.
    // The same cancellation was fixed in `logBeta` because the Student t sits
    // underneath every confidence interval in the app, so error there
    // propagates everywhere. This PMF is only ever read to draw a phase-
    // duration distribution — the timeline Monte Carlo *samples* from Poisson
    // rather than evaluating it — where 1e-13 is eleven digits past anything
    // that renders. Knowing which precision problems are worth fixing is the
    // point; fixing all of them uniformly is not.
    const bad = checkGrid(
      poissonFixture.pmf,
      (c) => ({
        got: poisson.pmf(c.k, c.lam),
        want: c.want,
        label: `pmf(${c.k}, ${c.lam})`,
      }),
      1e-12,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('cdf matches SciPy across the lambda grid', () => {
    const bad = checkGrid(
      poissonFixture.cdf,
      (c) => ({
        got: poisson.cdf(c.k, c.lam),
        want: c.want,
        label: `cdf(${c.k}, ${c.lam})`,
      }),
      1e-12,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('ppf matches SciPy across the lambda grid', () => {
    const bad = checkGrid(
      poissonFixture.ppf,
      (c) => ({
        got: poisson.ppf(c.p, c.lam),
        want: c.want,
        label: `ppf(${c.p}, ${c.lam})`,
      }),
      0,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('survives lambda = 70 without overflowing a factorial', () => {
    // The reason the PMF is evaluated in log space: 110! is ~1.6e178, and the
    // naive lambda^k / k! form loses the race long before that.
    expect(poisson.pmf(110, 70)).toBeGreaterThan(0);
    expect(Number.isFinite(poisson.pmf(110, 70))).toBe(true);
  });

  it('pmf sums to 1 over its support', () => {
    let total = 0;
    for (let k = 0; k <= 200; k += 1) total += poisson.pmf(k, 70);
    expect(total).toBeCloseTo(1, 12);
  });

  it('cdf agrees with a direct sum of the pmf', () => {
    // Independent cross-check: the CDF uses the incomplete gamma identity, so
    // agreeing with a running PMF sum exercises two different code paths.
    for (const lam of [0.5, 4, 28]) {
      let running = 0;
      for (let k = 0; k <= 60; k += 1) {
        running += poisson.pmf(k, lam);
        expect(poisson.cdf(k, lam)).toBeCloseTo(running, 12);
      }
    }
  });
});
