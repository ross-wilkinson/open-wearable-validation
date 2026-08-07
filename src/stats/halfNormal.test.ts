import { describe, expect, it } from 'vitest';
import * as halfNormal from './halfNormal.ts';
import { checkGrid, formatMismatches, halfNormalFixture } from './testing/fixtures.ts';

describe('halfNormal', () => {
  it('pdf matches SciPy', () => {
    const bad = checkGrid(
      halfNormalFixture.pdf,
      (c) => ({ got: halfNormal.pdf(c.x), want: c.want, label: `pdf(${c.x})` }),
      1e-14,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('cdf matches SciPy', () => {
    const bad = checkGrid(
      halfNormalFixture.cdf,
      (c) => ({ got: halfNormal.cdf(c.x), want: c.want, label: `cdf(${c.x})` }),
      1e-13,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('ppf matches SciPy', () => {
    const bad = checkGrid(
      halfNormalFixture.ppf,
      (c) => ({ got: halfNormal.ppf(c.p), want: c.want, label: `ppf(${c.p})` }),
      1e-13,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('densityAtQuantile matches SciPy — the composition Module 1 depends on', () => {
    const bad = checkGrid(
      halfNormalFixture.pdf_at_ppf,
      (c) => ({
        got: halfNormal.densityAtQuantile(c.p),
        want: c.want,
        label: `pdf(ppf(${c.p}))`,
      }),
      1e-13,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('has median 0.6744897501960817 — the 50% absolute error of a unit normal', () => {
    expect(halfNormal.ppf(0.5)).toBeCloseTo(0.6744897501960817, 13);
  });

  it('is zero below the origin', () => {
    expect(halfNormal.pdf(-1)).toBe(0);
    expect(halfNormal.cdf(-1)).toBe(0);
  });

  it('densityAtQuantile degenerates toward zero at the extremes', () => {
    // Documents where the sample-quantile variance formula blows up: as p
    // approaches 1 the density in its denominator goes to zero.
    expect(halfNormal.densityAtQuantile(0.999)).toBeLessThan(0.01);
    expect(halfNormal.densityAtQuantile(0.5)).toBeGreaterThan(0.5);
  });
});
