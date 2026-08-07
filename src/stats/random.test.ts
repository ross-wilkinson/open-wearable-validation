import { describe, expect, it } from 'vitest';
import {
  createRng,
  mean,
  quantiles,
  sampleBeta,
  sampleGamma,
  sampleLognormal,
  sampleNormal,
  samplePert,
  samplePoisson,
  standardDeviation,
} from './random.ts';

/**
 * Sampler tests are distributional: draw a large sample and check its moments
 * against the closed forms. Because the generator is seeded, these are exact
 * and deterministic rather than flaky — the tolerances below are chosen for
 * Monte Carlo error at the stated N, not padded to stop intermittent failures.
 */
const N = 200000;

function draw(count: number, fn: () => number): number[] {
  const out = new Array<number>(count);
  for (let i = 0; i < count; i += 1) out[i] = fn();
  return out;
}

describe('createRng', () => {
  it('is deterministic for a given seed', () => {
    const a = draw(50, createRng(42));
    const b = draw(50, createRng(42));
    expect(a).toEqual(b);
  });

  it('gives different streams for different seeds', () => {
    expect(draw(50, createRng(1))).not.toEqual(draw(50, createRng(2)));
  });

  it('stays inside [0, 1)', () => {
    const values = draw(50000, createRng(7));
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
  });

  it('is roughly uniform', () => {
    const values = draw(N, createRng(3));
    expect(mean(values)).toBeCloseTo(0.5, 2);
    // Uniform(0,1) has SD 1/sqrt(12) = 0.2887.
    expect(standardDeviation(values)).toBeCloseTo(0.2887, 2);
  });
});

describe('sampleNormal', () => {
  it('has mean 0 and SD 1', () => {
    const rng = createRng(11);
    const values = draw(N, () => sampleNormal(rng));
    expect(mean(values)).toBeCloseTo(0, 2);
    expect(standardDeviation(values)).toBeCloseTo(1, 2);
  });

  it('puts about 95% of mass within +/-1.96', () => {
    const rng = createRng(12);
    const values = draw(N, () => sampleNormal(rng));
    const inside = values.filter((v) => Math.abs(v) <= 1.959963984540054).length;
    expect(inside / N).toBeCloseTo(0.95, 2);
  });
});

describe('sampleGamma', () => {
  it('matches the closed-form mean and variance', () => {
    // Gamma(shape, scale): mean = shape*scale, variance = shape*scale^2.
    for (const [shape, scale] of [
      [2, 3],
      [7.84, 3.57],
      [0.5, 2],
    ] as const) {
      const rng = createRng(21);
      const values = draw(100000, () => sampleGamma(rng, shape, scale));
      expect(mean(values)).toBeCloseTo(shape * scale, 1);
      expect(standardDeviation(values) ** 2 / (shape * scale * scale)).toBeCloseTo(
        1,
        1,
      );
    }
  });

  it('handles shape < 1 through the boost path', () => {
    const rng = createRng(22);
    const values = draw(100000, () => sampleGamma(rng, 0.3, 5));
    expect(mean(values)).toBeCloseTo(1.5, 1);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
  });

  it('rejects invalid parameters', () => {
    const rng = createRng(23);
    expect(sampleGamma(rng, 0, 1)).toBeNaN();
    expect(sampleGamma(rng, 1, 0)).toBeNaN();
  });
});

describe('sampleBeta', () => {
  it('matches the closed-form mean and stays in [0, 1]', () => {
    const rng = createRng(31);
    const values = draw(100000, () => sampleBeta(rng, 2, 5));
    expect(mean(values)).toBeCloseTo(2 / 7, 2);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThanOrEqual(1);
  });
});

describe('samplePoisson', () => {
  it('matches mean = variance = lambda on the Knuth path', () => {
    for (const lambda of [0.5, 4, 14, 28]) {
      const rng = createRng(41);
      const values = draw(100000, () => samplePoisson(rng, lambda));
      expect(mean(values)).toBeCloseTo(lambda, 1);
      expect(standardDeviation(values)).toBeCloseTo(Math.sqrt(lambda), 1);
    }
  });

  it('matches mean = variance = lambda on the rejection path', () => {
    // Above lambda = 30 the implementation switches algorithms because
    // exp(-lambda) underflows toward zero and Knuth's loop degenerates.
    for (const lambda of [30, 70, 200]) {
      const rng = createRng(42);
      const values = draw(100000, () => samplePoisson(rng, lambda));
      expect(mean(values) / lambda).toBeCloseTo(1, 1);
      expect(standardDeviation(values) / Math.sqrt(lambda)).toBeCloseTo(1, 1);
    }
  });

  it('agrees across the algorithm switch', () => {
    // A discontinuity at lambda = 30 would be invisible in either test above.
    const below = mean(
      draw(
        100000,
        (
          (r) => () =>
            samplePoisson(r, 29.9)
        )(createRng(43)),
      ),
    );
    const above = mean(
      draw(
        100000,
        (
          (r) => () =>
            samplePoisson(r, 30.1)
        )(createRng(43)),
      ),
    );
    expect(Math.abs(above - below)).toBeLessThan(0.6);
  });

  it('returns whole numbers and never negatives', () => {
    const rng = createRng(44);
    const values = draw(20000, () => samplePoisson(rng, 70));
    expect(values.every((v) => Number.isInteger(v) && v >= 0)).toBe(true);
  });
});

describe('sampleLognormal', () => {
  it('hits the requested arithmetic mean and SD, not the log-scale ones', () => {
    // The whole point of the parameterisation: a caller says "28 days, give or
    // take 10" and gets exactly that back.
    const rng = createRng(51);
    const values = draw(N, () => sampleLognormal(rng, 28, 10));
    expect(mean(values)).toBeCloseTo(28, 0);
    expect(standardDeviation(values)).toBeCloseTo(10, 0);
  });

  it('is strictly positive and right-skewed', () => {
    const rng = createRng(52);
    const values = draw(50000, () => sampleLognormal(rng, 28, 14));
    expect(Math.min(...values)).toBeGreaterThan(0);
    // Right skew: the mean sits above the median.
    const [median] = quantiles(values, [0.5]);
    expect(mean(values)).toBeGreaterThan(median!);
  });
});

describe('samplePert', () => {
  it('respects its endpoints', () => {
    const rng = createRng(61);
    const values = draw(50000, () => samplePert(rng, 10, 20, 60));
    expect(Math.min(...values)).toBeGreaterThanOrEqual(10);
    expect(Math.max(...values)).toBeLessThanOrEqual(60);
  });

  it('matches the PERT mean formula', () => {
    // mean = (min + 4*mode + max) / 6
    const rng = createRng(62);
    const values = draw(N, () => samplePert(rng, 10, 20, 60));
    expect(mean(values)).toBeCloseTo((10 + 4 * 20 + 60) / 6, 1);
  });

  it('widens as the mode weight falls, without moving the endpoints', () => {
    const tight = standardDeviation(
      draw(
        50000,
        (
          (r) => () =>
            samplePert(r, 10, 20, 60, 8)
        )(createRng(63)),
      ),
    );
    const loose = standardDeviation(
      draw(
        50000,
        (
          (r) => () =>
            samplePert(r, 10, 20, 60, 1)
        )(createRng(63)),
      ),
    );
    expect(loose).toBeGreaterThan(tight);
  });

  it('degenerates safely when the range is empty', () => {
    const rng = createRng(64);
    expect(samplePert(rng, 20, 20, 20)).toBe(20);
  });
});

describe('quantiles', () => {
  it('interpolates the way numpy.percentile does', () => {
    // numpy.percentile([1,2,3,4], [0, 0.25, 0.5, 0.75, 1]) -> 1, 1.75, 2.5, 3.25, 4
    expect(quantiles([1, 2, 3, 4], [0, 0.25, 0.5, 0.75, 1])).toEqual([
      1, 1.75, 2.5, 3.25, 4,
    ]);
  });

  it('does not mutate its input', () => {
    const input = [3, 1, 2];
    quantiles(input, [0.5]);
    expect(input).toEqual([3, 1, 2]);
  });

  it('handles an empty sample', () => {
    expect(quantiles([], [0.5])).toEqual([Number.NaN]);
  });
});
