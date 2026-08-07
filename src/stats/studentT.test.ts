import { describe, expect, it } from 'vitest';
import * as studentT from './studentT.ts';
import { checkGrid, formatMismatches, studentTFixture } from './testing/fixtures.ts';

describe('studentT', () => {
  it('pdf matches SciPy across the df grid', () => {
    const bad = checkGrid(
      studentTFixture.pdf,
      (c) => ({
        got: studentT.pdf(c.x, c.df),
        want: c.want,
        label: `pdf(${c.x}, df=${c.df})`,
      }),
      1e-13,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('cdf matches SciPy across the df grid', () => {
    const bad = checkGrid(
      studentTFixture.cdf,
      (c) => ({
        got: studentT.cdf(c.x, c.df),
        want: c.want,
        label: `cdf(${c.x}, df=${c.df})`,
      }),
      1e-13,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('ppf matches SciPy across the df grid', () => {
    const bad = checkGrid(
      studentTFixture.ppf,
      (c) => ({
        got: studentT.ppf(c.p, c.df),
        want: c.want,
        label: `ppf(${c.p}, df=${c.df})`,
      }),
      1e-10,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('reproduces the 95% critical value for every sample size the app plots', () => {
    // The single most-evaluated call in the whole toolkit — Module 1 alone
    // makes ~200 of these per render.
    const bad = checkGrid(
      studentTFixture.ppf_975,
      (c) => ({
        got: studentT.ppf(0.975, c.df),
        want: c.want,
        label: `ppf(0.975, df=${c.df})`,
      }),
      1e-11,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('criticalValue converts a confidence level to the right tail', () => {
    expect(studentT.criticalValue(0.95, 63)).toBeCloseTo(studentT.ppf(0.975, 63), 13);
    expect(studentT.criticalValue(0.9, 30)).toBeCloseTo(studentT.ppf(0.95, 30), 13);
    expect(studentT.criticalValue(0.99, 10)).toBeCloseTo(studentT.ppf(0.995, 10), 13);
  });

  it('converges to the normal distribution as df grows', () => {
    // Not a fixture check — an independent property. If the incomplete beta
    // were subtly wrong this would drift even while matching a grid.
    expect(studentT.ppf(0.975, 1e6)).toBeCloseTo(1.959963984540054, 5);
  });

  it('is symmetric', () => {
    for (const df of [1, 2, 7, 30, 200]) {
      expect(studentT.cdf(-1.3, df)).toBeCloseTo(1 - studentT.cdf(1.3, df), 14);
      expect(studentT.ppf(0.1, df)).toBeCloseTo(-studentT.ppf(0.9, df), 10);
    }
  });
});
