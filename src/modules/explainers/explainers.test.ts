import { describe, expect, it } from 'vitest';
import { ICC_DATASETS, computeIcc } from './iccModel.ts';
import { compareErrorMetrics } from './errorMetricsModel.ts';
import { DEFAULT_SNIFF_PROTOTYPES, simulateSniffTest } from './sniffTestModel.ts';
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

describe('simulateSniffTest', () => {
  it('demonstrates Winner’s Curse at N=5: true best prototype loses >55% of the time', () => {
    const res = simulateSniffTest(DEFAULT_SNIFF_PROTOTYPES, 5, 3.0, 3000, 42);

    expect(res.sampleSize).toBe(5);
    expect(res.noiseSd).toBe(3.0);
    // Winner's Curse: noise causes another prototype to win ~65% of the time
    expect(res.winnerCurseRate).toBeGreaterThan(55);
    expect(res.winnerCurseRate).toBeLessThan(80);
    expect(res.trueWinnerWinRate).toBeGreaterThan(20);
    expect(res.trueWinnerWinRate).toBeLessThan(45);

    // Over-optimism: winning candidate appears to perform better than its true error
    expect(res.expectedWinnerOverOptimism).toBeGreaterThan(0.2);

    // Elimination power: flawed prototype E (8.5 bpm) is caught and eliminated >95%
    expect(res.flawedEliminationRate).toBeGreaterThan(95);
  });

  it('mitigates Winner’s Curse when N is increased to 35', () => {
    const res = simulateSniffTest(DEFAULT_SNIFF_PROTOTYPES, 35, 3.0, 3000, 42);

    expect(res.sampleSize).toBe(35);
    // With true errors 2.0 vs 2.3 bpm (gap 0.3) and SE=0.51 bpm, win rate climbs from ~30% (at N=5) to ~58%
    expect(res.trueWinnerWinRate).toBeGreaterThan(50);
    expect(res.winnerCurseRate).toBeLessThan(50);

    // Elimination of catastrophic flaw is virtually 100%
    expect(res.flawedEliminationRate).toBeGreaterThan(99.5);
  });

  it('is deterministic for a given seed', () => {
    const run1 = simulateSniffTest(DEFAULT_SNIFF_PROTOTYPES, 5, 3.0, 1000, 123);
    const run2 = simulateSniffTest(DEFAULT_SNIFF_PROTOTYPES, 5, 3.0, 1000, 123);

    expect(run1.winnerCurseRate).toBe(run2.winnerCurseRate);
    expect(run1.trueWinnerWinRate).toBe(run2.trueWinnerWinRate);
    expect(run1.flawedEliminationRate).toBe(run2.flawedEliminationRate);
    expect(run1.expectedWinnerOverOptimism).toBe(run2.expectedWinnerOverOptimism);
  });

  it('safely clamps sampleSize below 3 and noiseSd below 0.5', () => {
    const res = simulateSniffTest(DEFAULT_SNIFF_PROTOTYPES, 1, 0.1, 500, 42);

    expect(res.sampleSize).toBe(3);
    expect(res.noiseSd).toBe(0.5);
    expect(res.prototypes.length).toBe(DEFAULT_SNIFF_PROTOTYPES.length);
  });

  it('computes well-formed confidence intervals and rates across all prototypes', () => {
    const res = simulateSniffTest(DEFAULT_SNIFF_PROTOTYPES, 5, 3.0, 1000, 42);

    for (const proto of res.prototypes) {
      expect(proto.ciUpper).toBeGreaterThan(proto.sampleMean);
      expect(proto.ciLower).toBeLessThanOrEqual(proto.sampleMean);
      expect(proto.winRate).toBeGreaterThanOrEqual(0);
      expect(proto.winRate).toBeLessThanOrEqual(100);
      expect(proto.eliminationRate).toBeGreaterThanOrEqual(0);
      expect(proto.eliminationRate).toBeLessThanOrEqual(100);
    }

    // Sum of win counts must equal total iterations
    const totalWins = res.prototypes.reduce((acc, p) => acc + p.winCount, 0);
    expect(totalWins).toBe(1000);
  });
});

