import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PRECISION_OPTIONS,
  biasMargin,
  loaMargin,
  percentileMargin,
  precisionCurve,
  precisionSeries,
  quantileVariance,
  replicateSamplingError,
  sampleSizeForTarget,
} from './precisionModel.ts';
import {
  checkGrid,
  formatMismatches,
  modulesFixture,
} from '../../stats/testing/fixtures.ts';

describe('quantileVariance', () => {
  it('reproduces the values the source notebook printed at n = 64', () => {
    // The strongest check available: these numbers were published in the
    // notebook output, so matching them verifies the port against something
    // this code had no way to derive on its own.
    const worked = modulesFixture.precision_worked_n64;
    expect(quantileVariance(0.5, 64)).toBeCloseTo(worked.var_p50, 12);
    expect(quantileVariance(0.9, 64)).toBeCloseTo(worked.var_p90, 12);
    expect(percentileMargin(0.5, 64, 0.95)).toBeCloseTo(worked.margin_p50, 12);
    expect(percentileMargin(0.9, 64, 0.95)).toBeCloseTo(worked.margin_p90, 12);

    // And against the notebook's own printed, rounded output.
    expect(percentileMargin(0.5, 64, 0.95)).toBeCloseTo(0.1965, 4);
    expect(percentileMargin(0.9, 64, 0.95)).toBeCloseTo(0.3633, 4);
  });

  it('diverges as the percentile approaches the tail', () => {
    // Documents the formula's real limitation rather than hiding it: the
    // half-normal density in the denominator goes to zero, so the variance of
    // an extreme percentile estimate blows up.
    expect(quantileVariance(0.5, 50)).toBeLessThan(quantileVariance(0.9, 50));
    expect(quantileVariance(0.9, 50)).toBeLessThan(quantileVariance(0.99, 50));
    expect(quantileVariance(0.999, 50)).toBeGreaterThan(1);
  });

  it('scales as 1/n', () => {
    expect(quantileVariance(0.5, 100) / quantileVariance(0.5, 200)).toBeCloseTo(2, 12);
  });
});

describe('precisionCurve', () => {
  it('matches the fixture across the whole plotted range', () => {
    const curve = precisionCurve({
      ...DEFAULT_PRECISION_OPTIONS,
      minN: 5,
      maxN: 199,
    });
    const byN = new Map(curve.map((point) => [point.n, point]));

    const bad = checkGrid(
      modulesFixture.precision_curve,
      (c) => ({
        got: byN.get(c.n)?.bias ?? Number.NaN,
        want: c.bias,
        label: `bias(n=${c.n})`,
      }),
      1e-11,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);

    const badLoa = checkGrid(
      modulesFixture.precision_curve,
      (c) => ({
        got: byN.get(c.n)?.loa ?? Number.NaN,
        want: c.loa_exact,
        label: `loa(n=${c.n})`,
      }),
      1e-11,
    );
    expect(badLoa, formatMismatches(badLoa)).toHaveLength(0);

    const badP90 = checkGrid(
      modulesFixture.precision_curve,
      (c) => ({
        got: byN.get(c.n)?.p90 ?? Number.NaN,
        want: c.p90,
        label: `p90(n=${c.n})`,
      }),
      1e-11,
    );
    expect(badP90, formatMismatches(badP90)).toHaveLength(0);
  });

  it('every margin shrinks monotonically with n', () => {
    const curve = precisionCurve(DEFAULT_PRECISION_OPTIONS);
    for (const key of ['bias', 'loa', 'p50', 'p90']) {
      for (let i = 1; i < curve.length; i += 1) {
        expect(curve[i]![key]!).toBeLessThan(curve[i - 1]![key]!);
      }
    }
  });

  it('ranks the estimands the way the module exists to show', () => {
    // The headline claim of the whole chart: at any n, the bias is pinned down
    // far more tightly than the limits of agreement or an upper percentile. If
    // this ever inverted, the module's argument would be wrong.
    for (const n of [10, 30, 64, 150]) {
      const bias = biasMargin(n, 0.95);
      expect(bias).toBeLessThan(percentileMargin(0.9, n, 0.95));
      expect(bias).toBeLessThan(loaMargin(n, 0.95, 1.96));
    }
  });
});

describe('loaMargin', () => {
  it('matches the fixture across confidence levels and multipliers', () => {
    const bad = checkGrid(
      modulesFixture.loa_parameterised,
      (c) => ({
        got: loaMargin(c.n, c.confidence, c.k),
        want: c.want,
        label: `loa(n=${c.n}, conf=${c.confidence}, k=${c.k})`,
      }),
      1e-11,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('exceeds the notebook’s 1.71 approximation, most at small n', () => {
    // The (n-1) correction. Understating a margin of error is the dangerous
    // direction for a sample-size tool, so the sign matters as much as the size.
    for (const [n, minRatio] of [
      [5, 1.07],
      [12, 1.02],
    ] as const) {
      const approx = 1.71 * biasMargin(n, 0.95);
      expect(loaMargin(n, 0.95, 1.959963984540054) / approx).toBeGreaterThan(minRatio);
    }
    // ...and converges away at large n.
    const approx150 = 1.71 * biasMargin(150, 0.95);
    expect(loaMargin(150, 0.95, 1.959963984540054) / approx150).toBeLessThan(1.01);
  });
});

describe('percentileMargin', () => {
  it('matches the fixture across confidence levels and percentiles', () => {
    const bad = checkGrid(
      modulesFixture.percentile_parameterised,
      (c) => ({
        got: percentileMargin(c.p, c.n, c.confidence),
        want: c.want,
        label: `p${c.p}(n=${c.n}, conf=${c.confidence})`,
      }),
      1e-11,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('widens with the confidence level', () => {
    expect(percentileMargin(0.9, 64, 0.99)).toBeGreaterThan(
      percentileMargin(0.9, 64, 0.95),
    );
    expect(percentileMargin(0.9, 64, 0.95)).toBeGreaterThan(
      percentileMargin(0.9, 64, 0.9),
    );
  });
});

describe('precisionSeries', () => {
  it('keeps a series on the same colour slot when others change', () => {
    // Colour follows the entity, not its rank. Adding a percentile must not
    // repaint bias or the limits of agreement.
    const two = precisionSeries({
      ...DEFAULT_PRECISION_OPTIONS,
      percentiles: [0.5, 0.9],
    });
    const three = precisionSeries({
      ...DEFAULT_PRECISION_OPTIONS,
      percentiles: [0.5, 0.68, 0.9],
    });
    expect(two.find((s) => s.key === 'bias')!.colorSlot).toBe(
      three.find((s) => s.key === 'bias')!.colorSlot,
    );
    expect(two.find((s) => s.key === 'loa')!.colorSlot).toBe(
      three.find((s) => s.key === 'loa')!.colorSlot,
    );
  });

  it('produces one series per percentile plus bias and LoA', () => {
    const series = precisionSeries({
      ...DEFAULT_PRECISION_OPTIONS,
      percentiles: [0.5, 0.68, 0.9, 0.95],
    });
    expect(series).toHaveLength(6);
    expect(series.map((s) => s.key)).toEqual([
      'bias',
      'loa',
      'p50',
      'p68',
      'p90',
      'p95',
    ]);
  });
});

describe('sampleSizeForTarget', () => {
  it('finds the smallest n meeting a target margin', () => {
    const n = sampleSizeForTarget(0.25, 'bias', DEFAULT_PRECISION_OPTIONS);
    expect(n).not.toBeNull();
    expect(biasMargin(n!, 0.95)).toBeLessThanOrEqual(0.25);
    expect(biasMargin(n! - 1, 0.95)).toBeGreaterThan(0.25);
  });

  it('needs a larger n for a percentile than for the bias', () => {
    const forBias = sampleSizeForTarget(0.3, 'bias', DEFAULT_PRECISION_OPTIONS)!;
    const forP90 = sampleSizeForTarget(0.3, 'p90', DEFAULT_PRECISION_OPTIONS)!;
    expect(forP90).toBeGreaterThan(forBias);
  });

  it('returns null when the target is unreachable in range', () => {
    expect(sampleSizeForTarget(0.001, 'bias', DEFAULT_PRECISION_OPTIONS)).toBeNull();
    expect(sampleSizeForTarget(0, 'bias', DEFAULT_PRECISION_OPTIONS)).toBeNull();
  });
});

describe('replicateSamplingError', () => {
  it('matches the closed form the notebook simulated', () => {
    const bad = checkGrid(
      modulesFixture.replicates,
      (c) => ({
        got: replicateSamplingError(c.replicates),
        want: c.mean_abs_z,
        label: `replicates=${c.replicates}`,
      }),
      1e-14,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('starts at the half-normal mean and falls as 1/sqrt(j)', () => {
    expect(replicateSamplingError(1)).toBeCloseTo(Math.sqrt(2 / Math.PI), 14);
    expect(replicateSamplingError(4) / replicateSamplingError(16)).toBeCloseTo(2, 12);
  });
});
