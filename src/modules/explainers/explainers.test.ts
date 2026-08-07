import { describe, expect, it } from 'vitest';
import { ICC_DATASETS, computeIcc } from './iccModel.ts';
import { compareErrorMetrics } from './errorMetricsModel.ts';
import { modulesFixture } from '../../stats/testing/fixtures.ts';

describe('computeIcc', () => {
  it('reproduces pingouin’s ICC2 for both notebook datasets', () => {
    // pingouin reports 0.200000 and 0.988732. Matching those to six decimals
    // without a stats library is the whole verification for this explainer.
    const narrow = computeIcc(ICC_DATASETS.narrow)!;
    const wide = computeIcc(ICC_DATASETS.wide)!;
    expect(narrow.icc2).toBeCloseTo(0.2, 9);
    expect(wide.icc2).toBeCloseTo(0.9887323943661972, 9);
  });

  it('matches the fixture on mean squares and both ICC forms', () => {
    const cases = [
      { fixture: modulesFixture.icc_examples[0]!, data: ICC_DATASETS.narrow },
      { fixture: modulesFixture.icc_examples[1]!, data: ICC_DATASETS.wide },
    ];
    for (const { fixture, data } of cases) {
      const result = computeIcc(data)!;
      expect(result.msBetween).toBeCloseTo(fixture.msb, 9);
      expect(result.msRaters).toBeCloseTo(fixture.msj, 9);
      expect(result.msError).toBeCloseTo(fixture.mse, 9);
      expect(result.icc2).toBeCloseTo(fixture.icc2, 9);
      expect(result.icc3).toBeCloseTo(fixture.icc3, 9);
    }
  });

  it('the two datasets have IDENTICAL differences — the whole point', () => {
    const narrow = computeIcc(ICC_DATASETS.narrow)!;
    const wide = computeIcc(ICC_DATASETS.wide)!;

    expect(narrow.differences).toEqual([-5, 5, 0, 0, 0]);
    expect(wide.differences).toEqual(narrow.differences);

    // Every agreement statistic is therefore identical...
    expect(wide.bias).toBe(narrow.bias);
    expect(wide.sdDifference).toBe(narrow.sdDifference);
    expect(wide.loaLower).toBe(narrow.loaLower);
    expect(wide.loaUpper).toBe(narrow.loaUpper);

    // ...while the ICC differs by a factor of nearly five.
    expect(wide.icc2 / narrow.icc2).toBeGreaterThan(4.9);
  });

  it('the ICC tracks between-subject spread, not measurement error', () => {
    const narrow = computeIcc(ICC_DATASETS.narrow)!;
    const wide = computeIcc(ICC_DATASETS.wide)!;
    expect(wide.betweenSubjectSd).toBeGreaterThan(narrow.betweenSubjectSd * 5);
    expect(wide.msError).toBeCloseTo(narrow.msError, 9);
  });

  it('rejects mismatched or degenerate input', () => {
    expect(computeIcc({ device: [1, 2], reference: [1] })).toBeNull();
    expect(computeIcc({ device: [1], reference: [1] })).toBeNull();
    expect(computeIcc({ device: [1, Number.NaN], reference: [1, 2] })).toBeNull();
  });
});

describe('compareErrorMetrics', () => {
  it('gives both samples essentially the same RMSE by construction', () => {
    const result = compareErrorMetrics(1.3, 10000, 42);
    // Matching the normal sample's SD to the heavy one's is what makes the
    // comparison fair: any difference in coverage is then purely about shape.
    expect(result.normal.rmse / result.heavy.rmse).toBeCloseTo(1, 1);
  });

  it('puts a far larger share of heavy-tailed errors inside the RMSE', () => {
    // The headline claim: identical RMSE, wildly different practical meaning.
    // For a normal, ~68% of values fall within one SD. For df = 1.3 it is
    // nearly everything, because the RMSE is dragged out by a few extremes.
    const result = compareErrorMetrics(1.3, 10000, 42);
    expect(result.normal.withinRmse).toBeGreaterThan(60);
    expect(result.normal.withinRmse).toBeLessThan(75);
    expect(result.heavy.withinRmse).toBeGreaterThan(90);
  });

  it('percentiles stay interpretable where RMSE does not', () => {
    // A P50 is the P50 whatever the shape. That is the recommendation.
    const result = compareErrorMetrics(1.3, 10000, 42);
    expect(result.heavy.p50).toBeLessThan(result.normal.p50);
    expect(result.heavy.p95).toBeLessThan(result.normal.p95);
    // Half the mass sits below the median, by definition, in both.
    expect(result.heavy.p50).toBeGreaterThan(0);
  });

  it('flags df <= 2, where the population variance does not exist', () => {
    // The strongest form of the argument: at df = 1.3 the RMSE is estimating
    // an undefined quantity, not merely a hard-to-estimate one.
    expect(compareErrorMetrics(1.3, 2000, 1).varianceUndefined).toBe(true);
    expect(compareErrorMetrics(2, 2000, 1).varianceUndefined).toBe(true);
    expect(compareErrorMetrics(5, 2000, 1).varianceUndefined).toBe(false);
  });

  it('coverage converges toward the normal case as df grows', () => {
    // At high df the t *is* essentially normal, so the gap should close —
    // evidence the effect is about tail weight and not an artefact.
    const heavy = compareErrorMetrics(1.3, 10000, 42);
    const light = compareErrorMetrics(50, 10000, 42);
    const heavyGap = Math.abs(heavy.heavy.withinRmse - heavy.normal.withinRmse);
    const lightGap = Math.abs(light.heavy.withinRmse - light.normal.withinRmse);
    expect(lightGap).toBeLessThan(heavyGap / 3);
  });

  it('is deterministic for a given seed', () => {
    expect(compareErrorMetrics(1.3, 5000, 7).heavy.rmse).toBe(
      compareErrorMetrics(1.3, 5000, 7).heavy.rmse,
    );
  });

  it('builds a shared-scale histogram', () => {
    const result = compareErrorMetrics(1.3, 10000, 42);
    expect(result.histogram.length).toBeGreaterThan(0);
    expect(result.histogram.every((bin) => bin.heavy >= 0 && bin.normal >= 0)).toBe(
      true,
    );
  });
});
