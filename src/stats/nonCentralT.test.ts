import { describe, expect, it } from 'vitest';
import * as nct from './nonCentralT.ts';
import * as studentT from './studentT.ts';
import { checkGrid, formatMismatches, nonCentralTFixture } from './testing/fixtures.ts';

describe('nonCentralT', () => {
  it('cdf matches SciPy across the (df, nc, x) grid', () => {
    // 1e-9 relative OR 1e-13 absolute. The absolute arm is what covers the
    // deep tail: AS 243 sums Poisson-weighted incomplete betas built by
    // repeated subtraction of O(1) terms, so it has a roundoff floor around
    // 1e-15 no matter how small the true answer is. R's `pt(ncp=)` carries the
    // same limitation from the same algorithm.
    //
    // This is fine for what the toolkit does with it. Module 5 inverts this
    // CDF at p = 0.025 and 0.975 — probabilities of order 1, where the
    // relative arm applies and holds to 1e-9. Nothing in the app reads a
    // non-central t probability of 1e-77.
    const bad = checkGrid(
      nonCentralTFixture.cdf,
      (c) => ({
        got: nct.cdf(c.x, c.df, c.nc),
        want: c.want,
        label: `cdf(${c.x}, df=${c.df}, nc=${c.nc})`,
      }),
      1e-9,
      1e-13,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('is accurate in relative terms wherever the probability is usable', () => {
    // The complement of the test above: inside this range the absolute escape
    // hatch is removed entirely and full relative accuracy is demanded, so a
    // loose absolute tolerance cannot hide a real bug.
    //
    // Where to put the cutoff falls straight out of the roundoff floor:
    // achievable relative error is roughly atol / want, so a floor of ~3e-15
    // supports a 1e-9 relative claim only for want > ~3e-6. Measured, cases at
    // exactly 1e-6 fail at 1e-9 to 3.4e-9 — the arithmetic, confirmed. The
    // cutoff is set at 1e-4 for two orders of margin.
    const usable = nonCentralTFixture.cdf.filter(
      (c) => c.want > 1e-4 && c.want < 1 - 1e-4,
    );
    expect(usable.length).toBeGreaterThan(500);
    const bad = checkGrid(
      usable,
      (c) => ({
        got: nct.cdf(c.x, c.df, c.nc),
        want: c.want,
        label: `cdf(${c.x}, df=${c.df}, nc=${c.nc})`,
      }),
      1e-9,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('ppf matches SciPy across the (df, nc, p) grid', () => {
    const bad = checkGrid(
      nonCentralTFixture.ppf,
      (c) => ({
        got: nct.ppf(c.p, c.df, c.nc),
        want: c.want,
        label: `ppf(${c.p}, df=${c.df}, nc=${c.nc})`,
      }),
      1e-7,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('degenerates exactly to the central t when nc = 0', () => {
    // A cheap invariant that catches whole classes of series-expansion errors:
    // every Poisson weight but the first must vanish at nc = 0.
    const bad = checkGrid(
      nonCentralTFixture.reduces_to_central_t,
      (c) => ({
        got: nct.ppf(c.p, c.df, 0),
        want: c.want,
        label: `ppf(${c.p}, df=${c.df}, nc=0)`,
      }),
      1e-10,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('stays finite where SciPy itself returns NaN', () => {
    // SciPy's Cephes routine gives up in the extreme tail — e.g.
    // nct.cdf(-6, df=199, nc=21), a ~27-sigma event whose true value underflows
    // to zero. There is no golden value to match here, because the reference is
    // the broken one. The claim is only that this implementation degrades
    // gracefully instead of propagating NaN into a chart.
    expect(nonCentralTFixture.cdf_scipy_nan.length).toBeGreaterThan(0);
    for (const c of nonCentralTFixture.cdf_scipy_nan) {
      const got = nct.cdf(c.x, c.df, c.nc);
      expect(Number.isFinite(got), `cdf(${c.x}, ${c.df}, ${c.nc}) = ${got}`).toBe(true);
      expect(got).toBeGreaterThanOrEqual(0);
      expect(got).toBeLessThanOrEqual(1);
    }
  });

  it('is a proper CDF: monotonic in t', () => {
    // Allowed to dip by the algorithm's roundoff floor, but no further — deep
    // in the lower tail consecutive values are both numerical noise around
    // zero, so demanding exact monotonicity there would be testing the noise.
    const noiseFloor = 1e-13;
    for (const [df, ncp] of [
      [10, 2],
      [43, 3.31],
      [199, 8],
    ] as const) {
      let previous = -1;
      for (let x = -5; x <= 20; x += 0.5) {
        const value = nct.cdf(x, df, ncp);
        expect(
          value,
          `cdf(${x}, ${df}, ${ncp}) dropped below cdf(${x - 0.5}, ...)`,
        ).toBeGreaterThanOrEqual(previous - noiseFloor);
        previous = value;
      }
    }
  });

  it('ppf inverts cdf', () => {
    for (const [df, ncp] of [
      [9, 1],
      [43, 3.31],
      [99, 12],
    ] as const) {
      for (const p of [0.025, 0.5, 0.975]) {
        const x = nct.ppf(p, df, ncp);
        expect(nct.cdf(x, df, ncp)).toBeCloseTo(p, 8);
      }
    }
  });

  it('shifts with the noncentrality the way a mean shift should', () => {
    // Independent sanity property: for large df the non-central t is close to a
    // normal centred near nc, so the median should track nc.
    expect(nct.ppf(0.5, 5000, 3)).toBeCloseTo(3, 1);
    expect(nct.ppf(0.5, 5000, 0)).toBeCloseTo(0, 6);
  });

  it('matches the central t at nc = 0 for the CDF too', () => {
    for (const df of [1, 5, 43, 199]) {
      for (const x of [-2, 0, 1.5, 4]) {
        expect(nct.cdf(x, df, 0)).toBeCloseTo(studentT.cdf(x, df), 12);
      }
    }
  });
});
