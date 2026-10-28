import { describe, expect, it } from 'vitest';
import {
  PAIRED_ALGORITHM_PRESETS,
  correlationSweep,
  loaPrecision,
  loaPrecisionApproximate,
  sampleSizeForAttrition,
  sampleSizeForEquivalence,
  sampleSizeForThreshold,
  sampleSizePairedNonInferiority,
} from './agreementModel.ts';
import {
  checkGrid,
  formatMismatches,
  modulesFixture,
} from '../../stats/testing/fixtures.ts';

describe('loaPrecisionApproximate', () => {
  it('matches the notebook formula exactly', () => {
    const bad = checkGrid(
      modulesFixture.loa_precision,
      (c) => ({
        got: loaPrecisionApproximate(c.n),
        want: c.precision,
        label: `1.96*sqrt(3/${c.n})`,
      }),
      1e-13,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });
});

describe('sampleSizeForThreshold', () => {
  it('reproduces the notebook’s worked answer of n = 150', () => {
    // threshold = 15/54, the notebook's own case. The approximation is what it
    // used, so that arm must land on the published number.
    const result = sampleSizeForThreshold(15 / 54);
    expect(result.approximateN).toBe(150);
  });

  it('matches the fixture on every threshold case', () => {
    const bad = checkGrid(
      modulesFixture.threshold_cases,
      (c) => ({
        got: sampleSizeForThreshold(c.threshold).approximateN ?? Number.NaN,
        want: c.want_n,
        label: `threshold ${c.threshold}`,
      }),
      0,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('the approximation errs in opposite directions either side of n = 117', () => {
    // This test was originally written asserting the approximation always
    // understates the sample size. It failed, and the assumption was the thing
    // that was wrong — a more useful failure than a bug would have been.
    //
    // Two errors in `1.96 * sqrt(3/n)` pull opposite ways:
    //   - sqrt(3) = 1.7321 replaces sqrt(1 + k^2/2) = 1.7090, inflating it;
    //   - the normal quantile 1.96 replaces t at n-1 df, deflating it.
    // The t correction is large at small n and vanishes as n grows, so it wins
    // early and loses late. The curves cross at n = 117.
    //
    // Practical consequence, and the reason the UI shows both: for the small
    // studies this tool is mostly used to plan, the notebook's formula
    // understates how many subjects are needed.
    const { n: exactSmall, approximateN: approxSmall } = sampleSizeForThreshold(1.0);
    expect(approxSmall!).toBeLessThan(exactSmall!);

    const { n: exactLarge, approximateN: approxLarge } = sampleSizeForThreshold(0.2);
    expect(approxLarge!).toBeGreaterThan(exactLarge!);
  });

  it('locates the crossover at n = 117', () => {
    let crossover: number | null = null;
    for (let n = 3; n < 500; n += 1) {
      if (loaPrecisionApproximate(n) >= loaPrecision(n)) {
        crossover = n;
        break;
      }
    }
    expect(crossover).toBe(117);
  });

  it('returns null for a non-positive threshold', () => {
    expect(sampleSizeForThreshold(0).n).toBeNull();
    expect(sampleSizeForThreshold(-1).n).toBeNull();
  });

  it('is monotonic: a tighter threshold never needs fewer subjects', () => {
    const loose = sampleSizeForThreshold(0.5).n!;
    const tight = sampleSizeForThreshold(0.2).n!;
    expect(tight).toBeGreaterThan(loose);
  });
});

describe('loaPrecision', () => {
  it('shrinks monotonically with n', () => {
    for (let n = 3; n < 200; n += 1) {
      expect(loaPrecision(n)).toBeLessThan(loaPrecision(n - 1));
    }
  });

  it('widens with the confidence level', () => {
    expect(loaPrecision(50, 0.99)).toBeGreaterThan(loaPrecision(50, 0.95));
  });
});

describe('sampleSizeForEquivalence', () => {
  it('reproduces the notebook’s worked answer of n = 14', () => {
    expect(
      sampleSizeForEquivalence({
        alpha: 0.05,
        power: 0.8,
        sigma: 2.5,
        delta: 4,
        epsilon: 2,
      }),
    ).toBe(14);
  });

  it('matches the fixture across parameter combinations', () => {
    const bad = checkGrid(
      modulesFixture.equivalence,
      (c) => ({
        got:
          sampleSizeForEquivalence({
            alpha: c.alpha,
            power: c.power,
            sigma: c.sigma,
            delta: c.delta,
            epsilon: c.epsilon,
          }) ?? Number.NaN,
        want: c.want_n,
        label: `alpha=${c.alpha} power=${c.power} sigma=${c.sigma} delta=${c.delta}`,
      }),
      0,
    );
    expect(bad, formatMismatches(bad)).toHaveLength(0);
  });

  it('returns null when the true difference is outside the equivalence region', () => {
    // The formula squares (delta - |epsilon|), so a negative gap yields a
    // positive, finite, entirely meaningless n. Guarding this is the point.
    expect(
      sampleSizeForEquivalence({
        alpha: 0.05,
        power: 0.8,
        sigma: 1,
        delta: 2,
        epsilon: 3,
      }),
    ).toBeNull();
    expect(
      sampleSizeForEquivalence({
        alpha: 0.05,
        power: 0.8,
        sigma: 1,
        delta: 2,
        epsilon: 2,
      }),
    ).toBeNull();
  });

  it('rejects out-of-range probabilities and non-positive scales', () => {
    const base = { alpha: 0.05, power: 0.8, sigma: 1, delta: 1, epsilon: 0 };
    expect(sampleSizeForEquivalence({ ...base, alpha: 0 })).toBeNull();
    expect(sampleSizeForEquivalence({ ...base, alpha: 1 })).toBeNull();
    expect(sampleSizeForEquivalence({ ...base, power: 1 })).toBeNull();
    expect(sampleSizeForEquivalence({ ...base, sigma: 0 })).toBeNull();
    expect(sampleSizeForEquivalence({ ...base, delta: 0 })).toBeNull();
  });

  it('needs more subjects for tighter margins, more power, or noisier data', () => {
    const base = { alpha: 0.05, power: 0.8, sigma: 1, delta: 0.5, epsilon: 0 };
    const n = sampleSizeForEquivalence(base)!;
    expect(sampleSizeForEquivalence({ ...base, delta: 0.25 })!).toBeGreaterThan(n);
    expect(sampleSizeForEquivalence({ ...base, power: 0.95 })!).toBeGreaterThan(n);
    expect(sampleSizeForEquivalence({ ...base, sigma: 2 })!).toBeGreaterThan(n);
  });
});

describe('sampleSizePairedNonInferiority', () => {
  it('reproduces Benchmark Case 2: drops N from 191 (uncorrelated) to 12 at rho=0.94', () => {
    // Benchmark Case 2: margin = 1.5, sigma = 5.0, alpha = 0.05, power = 0.90
    const uncoupled = sampleSizePairedNonInferiority({
      margin: 1.5,
      delta: 0.0,
      sigma: 5.0,
      rho: 0.0,
      alpha: 0.05,
      power: 0.90,
    });
    expect(uncoupled).toBe(191);

    const paired = sampleSizePairedNonInferiority({
      margin: 1.5,
      delta: 0.0,
      sigma: 5.0,
      rho: 0.94,
      alpha: 0.05,
      power: 0.90,
    });
    expect(paired).toBe(12);

    const extreme = sampleSizePairedNonInferiority({
      margin: 1.5,
      delta: 0.0,
      sigma: 5.0,
      rho: 0.95,
      alpha: 0.05,
      power: 0.90,
    });
    expect(extreme).toBe(10);
  });

  it('supports direct sigmaPair input', () => {
    // var_pair = 2.5 -> sigmaPair = sqrt(2.5)
    const n = sampleSizePairedNonInferiority({
      margin: 1.5,
      delta: 0.0,
      sigmaPair: Math.sqrt(2.5),
      alpha: 0.05,
      power: 0.90,
    });
    expect(n).toBe(10);
  });

  it('handles higherIsBetter metrics (e.g. Kappa parity)', () => {
    const n = sampleSizePairedNonInferiority({
      margin: 0.05,
      delta: 0.0,
      sigmaPair: 0.15,
      alpha: 0.025,
      power: 0.80,
      higherIsBetter: true,
    });
    expect(n).toBe(71);
  });

  it('returns null for invalid inputs or non-achievable non-inferiority', () => {
    expect(
      sampleSizePairedNonInferiority({
        margin: 1.0,
        delta: 1.2, // Expected degradation exceeds margin
        sigma: 2.0,
        rho: 0.9,
      }),
    ).toBeNull();

    expect(
      sampleSizePairedNonInferiority({
        margin: -1.0,
        sigma: 2.0,
      }),
    ).toBeNull();

    expect(
      sampleSizePairedNonInferiority({
        margin: 1.0,
        sigma: -2.0,
      }),
    ).toBeNull();
  });

  it('computes correlationSweep monotonically decreasing with rho', () => {
    const points = correlationSweep({
      margin: 1.5,
      delta: 0.0,
      sigma: 5.0,
      alpha: 0.05,
      power: 0.90,
    });
    expect(points.length).toBeGreaterThan(10);
    expect(points[0]!.rho).toBe(0.0);
    expect(points[0]!.n).toBe(191);

    for (let i = 1; i < points.length; i++) {
      expect(points[i]!.n!).toBeLessThanOrEqual(points[i - 1]!.n!);
    }
  });

  it('defines valid PAIRED_ALGORITHM_PRESETS', () => {
    expect(PAIRED_ALGORITHM_PRESETS.length).toBeGreaterThanOrEqual(3);
    for (const preset of PAIRED_ALGORITHM_PRESETS) {
      const computed = sampleSizePairedNonInferiority({
        margin: preset.margin,
        delta: preset.delta,
        sigma: preset.sigma,
        rho: preset.rho,
        sigmaPair: preset.sigmaPair,
        alpha: preset.alpha,
        power: preset.power,
        higherIsBetter: preset.higherIsBetter,
      });
      expect(computed).toBe(preset.pairedN);

      if (preset.sigma !== undefined) {
        const computedUncorrelated = sampleSizePairedNonInferiority({
          margin: preset.margin,
          delta: preset.delta,
          sigma: preset.sigma,
          rho: 0.0,
          alpha: preset.alpha,
          power: preset.power,
          higherIsBetter: preset.higherIsBetter,
        });
        expect(computedUncorrelated).toBe(preset.uncorrelatedN);
      }
    }
  });
});

describe('sampleSizeForAttrition', () => {
  it('calculates single dropout rate attrition correctly', () => {
    // 100 analyzable at 30% dropout -> 100 / 0.70 = 142.85 -> 143
    expect(sampleSizeForAttrition(100, 0.30)).toBe(143);
  });

  it('calculates compound attrition rates correctly', () => {
    // 15% TST < 3h, 10% SQ < 85%, 5% alignment failure
    // Retention = 0.85 * 0.90 * 0.95 = 0.72675
    // 100 / 0.72675 = 137.59 -> 138
    expect(sampleSizeForAttrition(100, [0.15, 0.10, 0.05])).toBe(138);
  });

  it('guards against invalid rates or non-positive analyzable count', () => {
    expect(sampleSizeForAttrition(0, 0.2)).toBeNull();
    expect(sampleSizeForAttrition(100, 1.0)).toBeNull();
    expect(sampleSizeForAttrition(100, -0.1)).toBeNull();
  });
});

