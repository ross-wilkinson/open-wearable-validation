import { describe, expect, it } from 'vitest';
import * as normal from './normal.ts';
import { checkGrid, formatMismatches, normalFixture } from './testing/fixtures.ts';

describe('normal', () => {
  it('pdf matches SciPy', () => {
    const bad = checkGrid(
      normalFixture.pdf,
      (c) => ({ got: normal.pdf(c.x), want: c.want, label: `pdf(${c.x})` }),
      1e-14,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('cdf matches SciPy', () => {
    const bad = checkGrid(
      normalFixture.cdf,
      (c) => ({ got: normal.cdf(c.x), want: c.want, label: `cdf(${c.x})` }),
      1e-14,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('cdf keeps relative accuracy in the far tails', () => {
    // The reason this is a separate test: at x = -30 the true value is ~5e-198.
    // An absolute-error check passes there for literally any implementation
    // that returns something small, so only a relative check means anything.
    const bad = checkGrid(
      normalFixture.cdf_tail,
      (c) => ({ got: normal.cdf(c.x), want: c.want, label: `cdf(${c.x})` }),
      1e-12,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('ppf matches SciPy', () => {
    const bad = checkGrid(
      normalFixture.ppf,
      (c) => ({ got: normal.ppf(c.p), want: c.want, label: `ppf(${c.p})` }),
      1e-13,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('ppf inverts cdf', () => {
    for (const p of [0.001, 0.025, 0.1, 0.5, 0.9, 0.975, 0.999]) {
      expect(normal.cdf(normal.ppf(p))).toBeCloseTo(p, 12);
    }
  });

  it('sf is the complement of cdf without cancellation', () => {
    expect(normal.sf(5)).toBeCloseTo(1 - normal.cdf(5), 15);
    // 1 - cdf(10) loses every significant digit here; sf must not.
    expect(normal.sf(10)).toBeGreaterThan(0);
    expect(normal.sf(10) / 7.619853024160525e-24).toBeCloseTo(1, 10);
  });
});
