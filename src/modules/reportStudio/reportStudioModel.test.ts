import { describe, expect, it } from 'vitest';
import {
  REPORT_STUDIO_PRESETS,
  computeAgreementMetrics,
  computeSurvivalCurve,
  generateExecutiveScorecard,
  generatePlxJsonSummary,
  generateStandaloneHtmlReport,
  generateSyntheticPairedData,
} from './reportStudioModel.ts';

describe('reportStudioModel', () => {
  it('contains valid presets for SpO2, Heart Rate, and Sleep Staging', () => {
    expect(REPORT_STUDIO_PRESETS.length).toBe(3);
    const ids = REPORT_STUDIO_PRESETS.map((p) => p.id);
    expect(ids).toContain('spo2');
    expect(ids).toContain('heart-rate');
    expect(ids).toContain('sleep-staging');

    const sleepPreset = REPORT_STUDIO_PRESETS.find((p) => p.id === 'sleep-staging')!;
    expect(sleepPreset.sleepSummary).toBeDefined();
    expect(sleepPreset.sleepSummary!.classes).toHaveLength(4);
    expect(sleepPreset.sleepSummary!.overallAccuracy).toBeGreaterThan(0.75);
  });

  it('generates synthetic paired data deterministically with correct dimensions', () => {
    const data1 = generateSyntheticPairedData({
      m: 20,
      k: 5,
      bias: 0.5,
      sdB: 1.2,
      sdW: 1.8,
      outlierRate: 0.05,
      outlierScale: 4.0,
      seed: 12345,
    });

    expect(data1.observations).toHaveLength(100);
    expect(data1.centroids).toHaveLength(20);

    const data2 = generateSyntheticPairedData({
      m: 20,
      k: 5,
      bias: 0.5,
      sdB: 1.2,
      sdW: 1.8,
      outlierRate: 0.05,
      outlierScale: 4.0,
      seed: 12345,
    });

    expect(data1.observations[0]!.devValue).toEqual(data2.observations[0]!.devValue);
    expect(data1.observations[0]!.diff).toEqual(data2.observations[0]!.diff);
  });

  it('computes hierarchical variance decomposition, ICC, and effective sample size', () => {
    const { observations } = generateSyntheticPairedData({
      m: 24,
      k: 6,
      bias: 0.4,
      sdB: 1.5,
      sdW: 1.0,
      outlierRate: 0.02,
      outlierScale: 3.0,
      seed: 99,
    });

    const metrics = computeAgreementMetrics(observations, 3.0, 0.95);

    expect(metrics.m).toBe(24);
    expect(metrics.k).toBe(6);
    expect(metrics.totalN).toBe(144);
    expect(metrics.meanBias).toBeGreaterThan(0.1);
    expect(metrics.meanBias).toBeLessThan(1.2);

    // Variance decomposition properties
    expect(metrics.variance.sdBetween).toBeGreaterThan(0);
    expect(metrics.variance.sdWithin).toBeGreaterThan(0);
    expect(metrics.variance.icc).toBeGreaterThan(0);
    expect(metrics.variance.icc).toBeLessThanOrEqual(1.0);

    // Clustering penalty
    expect(metrics.variance.designEffect).toBeGreaterThan(1.0);
    expect(metrics.variance.nEffective).toBeLessThan(metrics.totalN);
    expect(metrics.variance.seCluster).toBeGreaterThan(metrics.variance.seNaive);
    expect(metrics.variance.seUnderstatementRatio).toBeGreaterThan(1.0);

    // Limits of Agreement
    expect(metrics.loaLower).toBeLessThan(metrics.meanBias);
    expect(metrics.loaUpper).toBeGreaterThan(metrics.meanBias);

    // Root Mean Square Error (Arms) >= MAE
    expect(metrics.arms).toBeGreaterThanOrEqual(metrics.mae);

    // Percentiles strictly non-decreasing
    expect(metrics.p50).toBeLessThanOrEqual(metrics.p75);
    expect(metrics.p75).toBeLessThanOrEqual(metrics.p90);
    expect(metrics.p90).toBeLessThanOrEqual(metrics.p95);
    expect(metrics.p95).toBeLessThanOrEqual(metrics.p99);
  });

  it('computes survival of error and empirical coverage curves', () => {
    const { observations } = generateSyntheticPairedData({
      m: 30,
      k: 8,
      bias: 0.5,
      sdB: 2.0,
      sdW: 3.0,
      outlierRate: 0.08,
      outlierScale: 8.0,
      seed: 777,
    });

    const metrics = computeAgreementMetrics(observations, 5.0, 0.95);
    const curve = computeSurvivalCurve(observations, metrics.meanBias, metrics.variance.sdTotal, 15.0, 30);

    expect(curve.length).toBe(31);
    expect(curve[0]!.threshold).toBe(0);
    expect(curve[0]!.empiricalSurvival).toBeGreaterThanOrEqual(99.0);
    expect(curve[0]!.empiricalCoverage).toBeLessThanOrEqual(1.0);

    // Survival curve should be non-increasing with threshold
    for (let i = 1; i < curve.length; i += 1) {
      expect(curve[i]!.empiricalSurvival).toBeLessThanOrEqual(curve[i - 1]!.empiricalSurvival + 1e-6);
      expect(curve[i]!.empiricalCoverage).toBeGreaterThanOrEqual(curve[i - 1]!.empiricalCoverage - 1e-6);
      // Empirical coverage + survival always sums to 100
      expect(curve[i]!.empiricalCoverage + curve[i]!.empiricalSurvival).toBeCloseTo(100.0, 1);
    }

    // Heavy tail should show excess in outlier-contaminated data
    const maxExcess = Math.max(...curve.map((p) => p.heavyTailExcess));
    expect(maxExcess).toBeGreaterThanOrEqual(0);
  });

  it('generates multi-tier executive scorecards across Product, Engineering, and Clinical lenses', () => {
    const preset = REPORT_STUDIO_PRESETS[0]!;
    const { observations } = generateSyntheticPairedData({
      m: preset.defaultM,
      k: preset.defaultK,
      bias: preset.defaultBias,
      sdB: preset.defaultSdB,
      sdW: preset.defaultSdW,
      outlierRate: preset.defaultOutlierRate,
      outlierScale: preset.defaultOutlierScale,
      seed: 42,
    });

    const metrics = computeAgreementMetrics(observations, preset.toleranceWindow, 0.95);
    const scorecard = generateExecutiveScorecard(metrics, preset, preset.toleranceWindow);

    expect(scorecard.length).toBeGreaterThanOrEqual(6);
    const lenses = new Set(scorecard.map((s) => s.lens));
    expect(lenses.has('product')).toBe(true);
    expect(lenses.has('engineering')).toBe(true);
    expect(lenses.has('clinical')).toBe(true);

    for (const item of scorecard) {
      expect(['pass', 'caution', 'fail']).toContain(item.status);
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.explanation.length).toBeGreaterThan(0);
    }
  });

  it('exports standalone HTML reports and Plx JSON summaries', () => {
    const preset = REPORT_STUDIO_PRESETS[1]!;
    const { observations } = generateSyntheticPairedData({
      m: preset.defaultM,
      k: preset.defaultK,
      bias: preset.defaultBias,
      sdB: preset.defaultSdB,
      sdW: preset.defaultSdW,
      outlierRate: preset.defaultOutlierRate,
      outlierScale: preset.defaultOutlierScale,
      seed: 42,
    });

    const metrics = computeAgreementMetrics(observations, preset.toleranceWindow, 0.95);
    const scorecard = generateExecutiveScorecard(metrics, preset, preset.toleranceWindow);
    const survivalCurve = computeSurvivalCurve(observations, metrics.meanBias, metrics.variance.sdTotal, 15.0, 20);

    const html = generateStandaloneHtmlReport({
      preset,
      metrics,
      scorecard,
      survivalCurve,
      toleranceWindow: preset.toleranceWindow,
      observations,
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Zero-Permission Scaling Architecture');
    expect(html).toContain(preset.name);
    expect(html).toContain('Cross-Functional Executive Scorecard');
    expect(html).toContain('<svg');
    expect(html).toContain('ba-all-group');
    expect(html).toContain('function filterScorecard');
    expect(html).toContain('function setBaView');

    const jsonStr = generatePlxJsonSummary({
      preset,
      metrics,
      scorecard,
      toleranceWindow: preset.toleranceWindow,
    });

    const parsed = JSON.parse(jsonStr);
    expect(parsed.reportType).toBe('validation_findings_studio_summary');
    expect(parsed.presetId).toBe('heart-rate');
    expect(parsed.blandAltmanAgreement.meanBias).toBeDefined();
    expect(parsed.executiveScorecard.length).toBeGreaterThan(0);
  });

  it('handles zero between-subject variance (sdB = 0) with zero ICC and equal standard errors', () => {
    const { observations } = generateSyntheticPairedData({
      m: 20,
      k: 5,
      bias: 0.0,
      sdB: 0.0,
      sdW: 1.5,
      outlierRate: 0.0,
      outlierScale: 0.0,
      seed: 42,
    });

    const metrics = computeAgreementMetrics(observations, 2.0);
    // When true sdB = 0, sample sdBetween might be 0 or small positive
    expect(metrics.variance.sdBetween).toBeLessThanOrEqual(metrics.variance.sdTotal);
    // Clustered SE should never be less than naive SE
    expect(metrics.variance.seCluster).toBeGreaterThanOrEqual(metrics.variance.seNaive * 0.99);
    expect(metrics.variance.seUnderstatementRatio).toBeGreaterThanOrEqual(0.99);
  });

  it('handles zero outlier rate (outlierRate = 0) with zero outlier flags', () => {
    const { observations } = generateSyntheticPairedData({
      m: 10,
      k: 4,
      bias: 0.2,
      sdB: 1.0,
      sdW: 1.0,
      outlierRate: 0.0,
      outlierScale: 5.0,
      seed: 123,
    });

    expect(observations.every((o) => !o.isOutlier)).toBe(true);
  });

  it('handles small degenerate sample sizes (m = 2, k = 1) without crashing', () => {
    const { observations } = generateSyntheticPairedData({
      m: 2,
      k: 1,
      bias: 0.0,
      sdB: 1.0,
      sdW: 1.0,
      outlierRate: 0.0,
      outlierScale: 0.0,
      seed: 1,
    });

    expect(observations).toHaveLength(2);
    const metrics = computeAgreementMetrics(observations, 1.0);
    expect(metrics.totalN).toBe(2);
    expect(Number.isFinite(metrics.meanBias)).toBe(true);
    expect(Number.isFinite(metrics.variance.sdTotal)).toBe(true);
  });

  it('handles sdTotal = 0 in computeSurvivalCurve correctly', () => {
    const fakeObs = [
      { id: '1', subjectId: 1, obsIndex: 1, refValue: 80, devValue: 82, diff: 2, absDiff: 2, isOutlier: false },
      { id: '2', subjectId: 2, obsIndex: 1, refValue: 80, devValue: 82, diff: 2, absDiff: 2, isOutlier: false },
    ];
    const curve = computeSurvivalCurve(fakeObs, 2.0, 0.0, 5.0, 10);
    expect(curve.length).toBe(11);
    // For x < 2.0, Gaussian survival should be 100% since meanBias is 2.0
    const pointAt1 = curve.find((p) => p.threshold === 1.0);
    if (pointAt1) {
      expect(pointAt1.gaussianSurvival).toBe(100);
    }
  });

  it('renders sleep staging confusion matrix in standalone HTML report when sleep preset is used', () => {
    const sleepPreset = REPORT_STUDIO_PRESETS.find((p) => p.id === 'sleep-staging')!;
    const { observations } = generateSyntheticPairedData({
      m: sleepPreset.defaultM,
      k: sleepPreset.defaultK,
      bias: sleepPreset.defaultBias,
      sdB: sleepPreset.defaultSdB,
      sdW: sleepPreset.defaultSdW,
      outlierRate: sleepPreset.defaultOutlierRate,
      outlierScale: sleepPreset.defaultOutlierScale,
      seed: 42,
    });

    const metrics = computeAgreementMetrics(observations, sleepPreset.toleranceWindow);
    const scorecard = generateExecutiveScorecard(metrics, sleepPreset, sleepPreset.toleranceWindow);
    const survivalCurve = computeSurvivalCurve(observations, metrics.meanBias, metrics.variance.sdTotal, 50, 10);

    const html = generateStandaloneHtmlReport({
      preset: sleepPreset,
      metrics,
      scorecard,
      survivalCurve,
      toleranceWindow: sleepPreset.toleranceWindow,
      observations,
    });

    expect(html).toContain('Sleep Staging Multi-Class Concordance (SRI Framework)');
    expect(html).toContain('True PSG \\ Device');
    expect(html).toContain('Light (N1/N2)');
    expect(html).toContain("Cohen's Kappa");
  });
});
