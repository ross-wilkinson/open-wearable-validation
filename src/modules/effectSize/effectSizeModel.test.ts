import { describe, expect, it } from 'vitest';
import {
  cohensDInterval,
  intervalCurve,
  sampleSizeToExcludeZero,
} from './effectSizeModel.ts';
import {
  checkGrid,
  formatMismatches,
  modulesFixture,
} from '../../stats/testing/fixtures.ts';

describe('cohensDInterval', () => {
  it('matches SciPy on both scales across the fixture grid', () => {
    const badLower = checkGrid(
      modulesFixture.cohens_d,
      (c) => ({
        got:
          cohensDInterval({
            d: c.d,
            n: c.n,
            confidence: 1 - c.alpha,
            design: 'one-sample',
          })?.lower ?? Number.NaN,
        want: c.lo,
        label: `lower(d=${c.d}, n=${c.n}, alpha=${c.alpha})`,
      }),
      1e-6,
    );
    expect(badLower, formatMismatches(badLower)).toHaveLength(0);

    const badUpper = checkGrid(
      modulesFixture.cohens_d,
      (c) => ({
        got:
          cohensDInterval({
            d: c.d,
            n: c.n,
            confidence: 1 - c.alpha,
            design: 'one-sample',
          })?.upper ?? Number.NaN,
        want: c.hi,
        label: `upper(d=${c.d}, n=${c.n}, alpha=${c.alpha})`,
      }),
      1e-6,
    );
    expect(badUpper, formatMismatches(badUpper)).toHaveLength(0);
  });

  it('reproduces the notebook’s t-scale bounds, and rescales them', () => {
    // The notebook prints (1.34, 5.63) as a CI for d = 0.5 at n = 44.
    // Reproducing that exactly confirms the port is faithful; the d-scale
    // values are what it should have printed.
    const result = cohensDInterval({
      d: 0.5,
      n: 44,
      confidence: 0.95,
      design: 'one-sample',
    })!;

    expect(result.tScaleLower).toBeCloseTo(1.34, 2);
    expect(result.tScaleUpper).toBeCloseTo(5.63, 2);
    expect(result.lower).toBeCloseTo(0.203, 3);
    expect(result.upper).toBeCloseTo(0.849, 3);
  });

  it('the interval contains the point estimate — the notebook’s does not', () => {
    // The single clearest symptom of the missing /sqrt(n): an interval for an
    // effect size of 0.5 that excludes 0.5.
    for (const [d, n] of [
      [0.5, 44],
      [0.2, 200],
      [0.8, 20],
      [-0.5, 44],
      [1.2, 100],
    ] as const) {
      const r = cohensDInterval({ d, n, confidence: 0.95, design: 'one-sample' })!;
      expect(r.lower, `d=${d} n=${n}`).toBeLessThan(d);
      expect(r.upper, `d=${d} n=${n}`).toBeGreaterThan(d);

      // And the t-scale version does not, for a positive d of any size.
      if (d > 0.1) {
        expect(r.tScaleLower).toBeGreaterThan(d);
      }
    }
  });

  it('agrees closely with the Hedges-Olkin approximation, without matching it', () => {
    // Close enough to confirm neither is wildly wrong; different enough that
    // showing both is worth the space.
    const r = cohensDInterval({
      d: 0.5,
      n: 44,
      confidence: 0.95,
      design: 'one-sample',
    })!;
    expect(r.approxLower).toBeCloseTo(0.19, 1);
    expect(r.approxUpper).toBeCloseTo(0.81, 1);
    expect(Math.abs(r.lower - r.approxLower)).toBeLessThan(0.05);
    expect(r.lower).not.toBeCloseTo(r.approxLower, 6);
  });

  it('the approximation is worst at small n and large |d|', () => {
    // The reason to bother with the non-central t at all.
    const small = cohensDInterval({
      d: 1.2,
      n: 8,
      confidence: 0.95,
      design: 'one-sample',
    })!;
    const large = cohensDInterval({
      d: 1.2,
      n: 400,
      confidence: 0.95,
      design: 'one-sample',
    })!;
    const smallGap = Math.abs(small.upper - small.approxUpper);
    const largeGap = Math.abs(large.upper - large.approxUpper);
    expect(smallGap).toBeGreaterThan(largeGap * 5);
  });

  it('is symmetric under a sign flip of d', () => {
    const positive = cohensDInterval({
      d: 0.6,
      n: 30,
      confidence: 0.95,
      design: 'one-sample',
    })!;
    const negative = cohensDInterval({
      d: -0.6,
      n: 30,
      confidence: 0.95,
      design: 'one-sample',
    })!;
    expect(negative.lower).toBeCloseTo(-positive.upper, 8);
    expect(negative.upper).toBeCloseTo(-positive.lower, 8);
  });

  it('brackets zero when d is zero', () => {
    const r = cohensDInterval({ d: 0, n: 30, confidence: 0.95, design: 'one-sample' })!;
    expect(r.lower).toBeLessThan(0);
    expect(r.upper).toBeGreaterThan(0);
    expect(r.excludesZero).toBe(false);
  });

  it('widens with the confidence level and narrows with n', () => {
    const width = (n: number, confidence: number) => {
      const r = cohensDInterval({ d: 0.5, n, confidence, design: 'one-sample' })!;
      return r.upper - r.lower;
    };
    expect(width(44, 0.99)).toBeGreaterThan(width(44, 0.95));
    expect(width(44, 0.95)).toBeGreaterThan(width(44, 0.9));
    expect(width(200, 0.95)).toBeLessThan(width(44, 0.95));
  });

  it('uses the right df and scale per design', () => {
    const paired = cohensDInterval({
      d: 0.5,
      n: 44,
      confidence: 0.95,
      design: 'paired',
    })!;
    const oneSample = cohensDInterval({
      d: 0.5,
      n: 44,
      confidence: 0.95,
      design: 'one-sample',
    })!;
    // A paired test is a one-sample test on the differences.
    expect(paired.lower).toBeCloseTo(oneSample.lower, 12);

    const twoSample = cohensDInterval({
      d: 0.5,
      n: 44,
      confidence: 0.95,
      design: 'two-sample',
    })!;
    expect(twoSample.df).toBe(86);
    expect(twoSample.scaleFactor).toBeCloseTo(Math.sqrt(22), 12);

    // This assertion originally read "less than", on the reasoning that 44 per
    // group is 88 people and therefore more information. That is wrong, and
    // the failure is worth keeping as a comment.
    //
    // The noncentrality is d*sqrt(n/2) for two independent groups against
    // d*sqrt(n) for one sample, so 44 per group carries *less* information
    // about a standardised effect than 44 paired observations do — a
    // between-subject comparison pays for the between-subject variance that a
    // within-subject one differences away. It is the standard argument for
    // paired designs, and here it falls straight out of the scale factor.
    expect(twoSample.upper - twoSample.lower).toBeGreaterThan(
      oneSample.upper - oneSample.lower,
    );

    // Matched on total participants, the two-sample design is the weaker one.
    const twoSampleMatched = cohensDInterval({
      d: 0.5,
      n: 22,
      confidence: 0.95,
      design: 'two-sample',
    })!;
    expect(twoSampleMatched.upper - twoSampleMatched.lower).toBeGreaterThan(
      oneSample.upper - oneSample.lower,
    );
  });

  it('reports the common-language effect size', () => {
    // d = 0 means a coin flip.
    expect(
      cohensDInterval({ d: 0, n: 30, confidence: 0.95, design: 'two-sample' })!
        .commonLanguage,
    ).toBeCloseTo(0.5, 10);
    // The notebook's own check: d = 0.35 gives CLES 63.5%.
    expect(
      cohensDInterval({ d: 0.35, n: 34, confidence: 0.95, design: 'one-sample' })!
        .commonLanguage,
    ).toBeCloseTo(0.6368, 3);
  });

  it('rejects invalid inputs rather than guessing', () => {
    expect(
      cohensDInterval({ d: 0.5, n: 1, confidence: 0.95, design: 'one-sample' }),
    ).toBeNull();
    expect(
      cohensDInterval({ d: 0.5, n: 44, confidence: 0, design: 'one-sample' }),
    ).toBeNull();
    expect(
      cohensDInterval({ d: Number.NaN, n: 44, confidence: 0.95, design: 'one-sample' }),
    ).toBeNull();
  });

  it('refuses noncentralities where AS 243 is unreliable', () => {
    // d * sqrt(n) past ~37.6. Returning null beats a confidently wrong answer.
    expect(
      cohensDInterval({ d: 5, n: 400, confidence: 0.95, design: 'one-sample' }),
    ).toBeNull();
  });
});

describe('intervalCurve', () => {
  it('narrows monotonically with n', () => {
    const curve = intervalCurve(0.5, 0.95, 'one-sample', 5, 120);
    for (let i = 1; i < curve.length; i += 1) {
      const previous = curve[i - 1]!;
      const current = curve[i]!;
      expect(current.upper - current.lower).toBeLessThan(
        previous.upper - previous.lower,
      );
    }
  });

  it('always contains d', () => {
    for (const point of intervalCurve(0.35, 0.95, 'one-sample', 5, 80)) {
      expect(point.lower).toBeLessThan(0.35);
      expect(point.upper).toBeGreaterThan(0.35);
    }
  });
});

describe('sampleSizeToExcludeZero', () => {
  it('needs more subjects for a smaller effect', () => {
    const big = sampleSizeToExcludeZero(0.8, 0.95, 'one-sample')!;
    const small = sampleSizeToExcludeZero(0.2, 0.95, 'one-sample')!;
    expect(small).toBeGreaterThan(big);
  });

  it('is null for a null effect', () => {
    expect(sampleSizeToExcludeZero(0, 0.95, 'one-sample')).toBeNull();
  });

  it('lands where the interval genuinely first excludes zero', () => {
    const n = sampleSizeToExcludeZero(0.5, 0.95, 'one-sample')!;
    expect(
      cohensDInterval({ d: 0.5, n, confidence: 0.95, design: 'one-sample' })!
        .excludesZero,
    ).toBe(true);
    expect(
      cohensDInterval({ d: 0.5, n: n - 1, confidence: 0.95, design: 'one-sample' })!
        .excludesZero,
    ).toBe(false);
  });
});
