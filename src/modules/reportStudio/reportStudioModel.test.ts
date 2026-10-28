import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TRANSITIVE_DRIFT_GENERATIONS,
  KPI_TAXONOMY_DEFINITIONS,
  PEARSON_R_DECEPTION_EXPLANATION,
  QUADRANT_CANDIDATE_PRESETS,
  REPORT_STUDIO_PRESETS,
  type PairedObservation,
  type ThreeWayPairedObservation,
  classifyQuadrant,
  computeAgreementMetrics,
  computeHeadToHeadDominance,
  computeKsPseudoreplicationDiagnostic,
  computePearsonR,
  computeSubjectWeightedEcdf,
  computeSurvivalCurve,
  computeTransitiveDriftCanary,
  detectEcdfCrossover,
  generateCitableMethodsParagraph,
  generateConfidenceEllipse,
  generateExecutiveScorecard,
  generateFdaTable1Markdown,
  generateLaunchBriefingMarkdown,
  generatePlxJsonSummary,
  generateStandaloneHtmlReport,
  generateSyntheticPairedData,
  generateThreeWayPairedData,
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

  it('classifies all four commercial launch quadrants correctly', () => {
    // Q1: Both pass
    const q1 = classifyQuadrant(true, true);
    expect(q1.quadrant).toBe('GREEN_GO');
    expect(q1.statusLabel).toContain('APPROVED');

    // Q2: Gate 1 passes, Gate 2 fails
    const q2 = classifyQuadrant(true, false);
    expect(q2.quadrant).toBe('AMBER_PARITY_RISK');
    expect(q2.statusLabel).toContain('Parity Risk');

    // Q3: Gate 1 fails, Gate 2 passes
    const q3 = classifyQuadrant(false, true);
    expect(q3.quadrant).toBe('AMBER_QUALITY_DEBT');
    expect(q3.statusLabel).toContain('Quality Debt');

    // Q4: Both fail
    const q4 = classifyQuadrant(false, false);
    expect(q4.quadrant).toBe('RED_NOGO');
    expect(q4.statusLabel).toContain('NO-GO');
  });

  it('generates closed 2D confidence ellipses with correct geometric bounds', () => {
    const points = generateConfidenceEllipse(0.5, 0.4, 0.1, 0.08, 0.2, 0.95, 64);
    expect(points.length).toBe(65); // 64 segments + 1 closing point

    // First and last points should match
    expect(points[0]!.x).toBeCloseTo(points[64]!.x, 4);
    expect(points[0]!.y).toBeCloseTo(points[64]!.y, 4);

    // Center of ellipse bounds should approximate center point
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const midY = (Math.min(...ys) + Math.max(...ys)) / 2;
    expect(midX).toBeCloseTo(0.5, 2);
    expect(midY).toBeCloseTo(0.4, 2);

    // Higher confidence yields wider ellipse
    const points99 = generateConfidenceEllipse(0.5, 0.4, 0.1, 0.08, 0.2, 0.99, 64);
    const width95 = Math.max(...xs) - Math.min(...xs);
    const xs99 = points99.map((p) => p.x);
    const width99 = Math.max(...xs99) - Math.min(...xs99);
    expect(width99).toBeGreaterThan(width95);
  });

  it('defines valid QUADRANT_CANDIDATE_PRESETS spanning all 4 quadrants', () => {
    expect(QUADRANT_CANDIDATE_PRESETS).toHaveLength(4);
    const quadrants = QUADRANT_CANDIDATE_PRESETS.map((p) => p.expectedQuadrant);
    expect(quadrants).toContain('GREEN_GO');
    expect(quadrants).toContain('AMBER_PARITY_RISK');
    expect(quadrants).toContain('AMBER_QUALITY_DEBT');
    expect(quadrants).toContain('RED_NOGO');

    for (const preset of QUADRANT_CANDIDATE_PRESETS) {
      const cl = classifyQuadrant(preset.gate1Margin >= 0, preset.gate2Parity >= 0);
      expect(cl.quadrant).toBe(preset.expectedQuadrant);
    }
  });

  it('generates standardized markdown executive briefing table', () => {
    const md = generateLaunchBriefingMarkdown({
      title: 'COMMERCIAL LAUNCH READINESS SCORECARD',
      quadrant: 'GREEN_GO',
      gate1Status: 'PASS',
      gate1Metrics: [
        { name: "Cohen's Kappa", value: '0.63', ci: '0.60, 0.66', passed: true, target: 'KPI >= 0.60' },
        { name: '4-Stage Accuracy', value: '69.2%', ci: '66.1%, 72.3%', passed: true, target: 'KPI >= 68.0%' },
      ],
      gate2Status: 'PASS',
      gate2Metrics: [
        {
          name: 'Kappa',
          frequentistDiff: '-0.02',
          frequentistPassed: true,
          frequentistTarget: 'Exceeds -0.05',
          assurance: 0.92,
          assurancePassed: true,
          assuranceTarget: 0.90,
          cliffsDelta: 0.08,
          cliffsDeltaPassed: true,
          cliffsDeltaTarget: -0.20,
          tieMargin: '15 min',
        },
      ],
      nEnrolled: 141,
      nAnalyzable: 102,
      attritionYield: 72.3,
    });

    expect(md).toContain('COMMERCIAL LAUNCH READINESS SCORECARD');
    expect(md).toContain('OVERALL LAUNCH STATUS: 🟢 APPROVED (Quadrant 1: Green Go)');
    expect(md).toContain('GATE 1: ABSOLUTE PERFORMANCE (vs. Reference)       🟢 PASS');
    expect(md).toContain("Cohen's Kappa: 0.63 [0.60, 0.66]");
    expect(md).toContain('GATE 2: PREDECESSOR PARITY (vs. Legacy Device)     🟢 PASS');
    expect(md).toContain('Bayesian Assurance: P(Non-Inferior) = 0.92');
    expect(md).toContain("Paired Cliff's Delta: δ = +0.08 (τ = 15 min)");
    expect(md).toContain('STUDY ATTRITION: Enrolled N=141 | Analyzable N=102 (72.3% Yield)');
  });

  it('defines Vector 1 KPI taxonomy items and addresses why Pearson r is deceptive', () => {
    expect(KPI_TAXONOMY_DEFINITIONS.length).toBeGreaterThanOrEqual(5);
    const ids = KPI_TAXONOMY_DEFINITIONS.map((k) => k.id);
    expect(ids).toContain('rmse');
    expect(ids).toContain('mae');
    expect(ids).toContain('loa');
    expect(ids).toContain('tolerance-coverage');
    expect(ids).toContain('correlation-r');

    expect(PEARSON_R_DECEPTION_EXPLANATION).toContain('association rather than measurement agreement');
    expect(PEARSON_R_DECEPTION_EXPLANATION).toContain('wide dynamic ranges');
  });

  it('computes Vector 2 subject-weighted ECDF envelopes and detects morphology crossovers', () => {
    const { observations } = generateSyntheticPairedData({
      m: 15,
      k: 6,
      bias: 0.3,
      sdB: 1.2,
      sdW: 1.5,
      outlierRate: 0.04,
      outlierScale: 3.5,
      seed: 88,
    });

    const envelope = computeSubjectWeightedEcdf(observations, 10, 20);
    expect(envelope.length).toBe(21);
    expect(envelope[0]!.threshold).toBe(0);

    for (const pt of envelope) {
      expect(pt.minCoverage).toBeLessThanOrEqual(pt.p10Coverage + 1e-6);
      expect(pt.p10Coverage).toBeLessThanOrEqual(pt.p90Coverage + 1e-6);
      expect(pt.p90Coverage).toBeLessThanOrEqual(pt.maxCoverage + 1e-6);
      expect(pt.minCoverage).toBeLessThanOrEqual(pt.subjectWeightedCoverage + 1e-6);
      expect(pt.subjectWeightedCoverage).toBeLessThanOrEqual(pt.maxCoverage + 1e-6);
    }

    // Test crossover detection
    const curveA = [
      { threshold: 1, coverage: 50 },
      { threshold: 2, coverage: 70 },
      { threshold: 3, coverage: 85 },
      { threshold: 4, coverage: 90 },
    ];
    const curveB = [
      { threshold: 1, coverage: 40 },
      { threshold: 2, coverage: 65 },
      { threshold: 3, coverage: 88 },
      { threshold: 4, coverage: 95 },
    ];
    const crossover = detectEcdfCrossover(curveA, curveB);
    expect(crossover.crossoverDetected).toBe(true);
    expect(crossover.threshold).toBe(3);

    // Test KS pseudoreplication diagnostic
    const ksDiag = computeKsPseudoreplicationDiagnostic(25, 10, 0.45);
    expect(ksDiag.totalRowsN).toBe(250);
    expect(ksDiag.independentSubjectsM).toBe(25);
    expect(ksDiag.naivePooledPValue).toBeLessThan(0.01);
    expect(ksDiag.clusterHonestPValue).toBeGreaterThan(0.05);
    expect(ksDiag.hazardExplanation).toContain('Kolmogorov-Smirnov (KS) Pseudoreplication Trap');
  });

  it('computes Vector 3 Three-Way Head-to-Head Dominance with agreed-upon tie margin and subject Cliff Delta threshold', () => {
    const obs = generateThreeWayPairedData({
      m: 25,
      k: 40,
      activity: 'running',
      seed: 42,
    });

    expect(obs.length).toBe(1000);

    const summary = computeHeadToHeadDominance(obs, 3.0, 0.15, 'High-Intensity Interval Running');

    expect(summary.totalSubjects).toBe(25);
    expect(summary.tieMargin).toBe(3.0);
    expect(summary.cliffsThreshold).toBe(0.15);

    // Exactly 21 of 25 participants meaningfully outperformed
    expect(summary.dev1WinningSubjects).toBe(21);
    expect(summary.tieSubjects).toBe(3);
    expect(summary.dev2WinningSubjects).toBe(1);

    expect(summary.headlineConclusion).toBe(
      'During High-Intensity Interval Running, Device 1 meaningfully outperformed Device 2 in 21 of 25 participants.',
    );
    expect(summary.pairingDiscardFallacyNote).toContain('Pairing Discard Fallacy');
  });

  it('computes Vector 5 Multi-Generation Transitive Drift Canary and flags silent drift alarm', () => {
    const summary = computeTransitiveDriftCanary(DEFAULT_TRANSITIVE_DRIFT_GENERATIONS, 0.75);

    expect(summary.generations.length).toBe(4);
    // All individual steps passed
    expect(summary.generations.every((g) => g.stepPassed)).toBe(true);

    // Gen 4 cumulative drift is +0.95 bpm > 0.75 bpm limit
    const gen4 = summary.generations.find((g) => g.genId === 'gen4')!;
    expect(gen4.cumulativeBiasDiff).toBe(0.95);
    expect(gen4.canaryStatus).toBe('ALARM');

    expect(summary.hasCanaryAlarm).toBe(true);
    expect(summary.alarmMessage).toContain('CANARY ALARM: Silent Algorithmic Drift Detected!');
    expect(summary.canaryExplanation).toContain('Transitive Drift Canary');
  });

  it('generates FDA Table 1 markdown and Citable Methods paragraph', () => {
    const preset = REPORT_STUDIO_PRESETS[0]!;
    const { observations } = generateSyntheticPairedData({
      m: 24,
      k: 8,
      bias: 0.35,
      sdB: 1.15,
      sdW: 1.55,
      outlierRate: 0.035,
      outlierScale: 3.2,
      seed: 42,
    });

    const metrics = computeAgreementMetrics(observations, preset.toleranceWindow);

    const table1 = generateFdaTable1Markdown(metrics, preset);
    expect(table1).toContain('FDA 510(k) PRE-MARKET NOTIFICATION');
    expect(table1).toContain('ISO 80601-2-61:2017 TABLE 1');
    expect(table1).toContain('Root Mean Square Error (Arms):');
    expect(table1).toContain('Total Enrolled Participants:');

    const methods = generateCitableMethodsParagraph({
      preset,
      metrics,
      toleranceWindow: preset.toleranceWindow,
    });
    expect(methods).toContain('Statistical Methods:');
    expect(methods).toContain('Bland and Altman (2007)');
    expect(methods).toContain('random-effects analysis of variance (ANOVA)');
    expect(methods).toContain('Intraclass Correlation Coefficient (ICC)');
    expect(methods).toContain('agreekit');
  });

  describe('Vector Edge Cases & Mathematical Diagnostics', () => {
    it('computePearsonR handles empty, single observation, flat data, and linear correlations', () => {
      // Empty array
      expect(computePearsonR([])).toBe(0);

      // Single observation
      expect(
        computePearsonR([
          { id: '1', subjectId: 1, obsIndex: 1, refValue: 10, devValue: 10, diff: 0, absDiff: 0, isOutlier: false },
        ]),
      ).toBe(0);

      // Zero variance / flat line
      expect(
        computePearsonR([
          { id: '1', subjectId: 1, obsIndex: 1, refValue: 10, devValue: 5, diff: -5, absDiff: 5, isOutlier: false },
          { id: '2', subjectId: 1, obsIndex: 2, refValue: 10, devValue: 7, diff: -3, absDiff: 3, isOutlier: false },
        ]),
      ).toBe(0);

      // Perfect positive correlation
      const posData: PairedObservation[] = [
        { id: '1', subjectId: 1, obsIndex: 1, refValue: 1, devValue: 2, diff: 1, absDiff: 1, isOutlier: false },
        { id: '2', subjectId: 1, obsIndex: 2, refValue: 2, devValue: 4, diff: 2, absDiff: 2, isOutlier: false },
        { id: '3', subjectId: 1, obsIndex: 3, refValue: 3, devValue: 6, diff: 3, absDiff: 3, isOutlier: false },
      ];
      expect(computePearsonR(posData)).toBe(1);

      // Negative correlation
      const negData: PairedObservation[] = [
        { id: '1', subjectId: 1, obsIndex: 1, refValue: 1, devValue: 9, diff: 8, absDiff: 8, isOutlier: false },
        { id: '2', subjectId: 1, obsIndex: 2, refValue: 2, devValue: 7, diff: 5, absDiff: 5, isOutlier: false },
        { id: '3', subjectId: 1, obsIndex: 3, refValue: 3, devValue: 5, diff: 2, absDiff: 2, isOutlier: false },
      ];
      expect(computePearsonR(negData)).toBe(-1);
    });

    it('detectEcdfCrossover handles curves starting at threshold 0 with 0 coverage without false positive crossover', () => {
      const curveA = [
        { threshold: 0, coverage: 0 },
        { threshold: 1, coverage: 50 },
        { threshold: 2, coverage: 75 },
        { threshold: 3, coverage: 90 },
      ];
      const curveB = [
        { threshold: 0, coverage: 0 },
        { threshold: 1, coverage: 40 },
        { threshold: 2, coverage: 65 },
        { threshold: 3, coverage: 80 },
      ];
      // Curve A uniformly dominates after threshold 0
      const res = detectEcdfCrossover(curveA, curveB);
      expect(res.crossoverDetected).toBe(false);
      expect(res.interpretation).toContain('No morphology crossover detected');
    });

    it('computeKsPseudoreplicationDiagnostic calculates DEFF=1.0 and equal p-values when k=1 and ICC=0', () => {
      const diag = computeKsPseudoreplicationDiagnostic(30, 1, 0.0);
      expect(diag.designEffect).toBe(1.0);
      expect(diag.totalRowsN).toBe(30);
      expect(diag.independentSubjectsM).toBe(30);
      // Naive and cluster-honest p-values should match when DEFF = 1.0 (differ only by 3 vs 4 decimal rounding)
      expect(diag.naivePooledPValue).toBeCloseTo(diag.clusterHonestPValue, 2);
    });

    it('computeHeadToHeadDominance handles empty inputs, Device 2 dominance, and tie dominance', () => {
      // Empty input
      const emptyRes = computeHeadToHeadDominance([], 3.0, 0.15, 'Rest');
      expect(emptyRes.totalSubjects).toBe(0);
      expect(emptyRes.headlineConclusion).toContain('No paired observations available');

      // Device 2 dominance data
      const dev2WinsObs: ThreeWayPairedObservation[] = [
        {
          id: 's1-1',
          subjectId: 1,
          obsIndex: 1,
          activity: 'running',
          refValue: 150,
          dev1Value: 165,
          dev2Value: 151,
          e1: 15,
          e2: 1,
          absE1: 15,
          absE2: 1,
          delta: 14,
        },
        {
          id: 's1-2',
          subjectId: 1,
          obsIndex: 2,
          activity: 'running',
          refValue: 152,
          dev1Value: 168,
          dev2Value: 153,
          e1: 16,
          e2: 1,
          absE1: 16,
          absE2: 1,
          delta: 15,
        },
      ];
      const dev2Res = computeHeadToHeadDominance(dev2WinsObs, 3.0, 0.15, 'Running');
      expect(dev2Res.dev2WinningSubjects).toBe(1);
      expect(dev2Res.dev1WinningSubjects).toBe(0);
      expect(dev2Res.headlineConclusion).toBe(
        'During Running, Device 2 meaningfully outperformed Device 1 in 1 of 1 participants.',
      );

      // Large tie margin -> all ties
      const tieRes = computeHeadToHeadDominance(dev2WinsObs, 20.0, 0.15, 'Running');
      expect(tieRes.tieSubjects).toBe(1);
      expect(tieRes.dev1WinningSubjects).toBe(0);
      expect(tieRes.dev2WinningSubjects).toBe(0);
      expect(tieRes.headlineConclusion).toContain('demonstrated comparable performance (1 of 1 participants tied or inconclusive)');
    });

    it('computeTransitiveDriftCanary handles negative step bias differences with clean signed formatting', () => {
      const generations = [
        {
          genId: 'g1',
          name: 'Gen 1',
          hardwareVersion: 'HW 1',
          firmwareVersion: 'v1.0',
          studyName: 'Study 1',
          sampleSize: 100,
          stepBiasDiff: 0,
          stepSe: 0.1,
          stepNiTarget: 0.5,
          stepPassed: true,
          cumulativeBiasDiff: 0,
          cumulativeSe: 0.1,
          cumulativeCanaryLimit: 0.75,
          canaryStatus: 'PASS' as const,
          notes: 'Baseline',
        },
        {
          genId: 'g2',
          name: 'Gen 2',
          hardwareVersion: 'HW 2',
          firmwareVersion: 'v2.0',
          studyName: 'Study 2',
          sampleSize: 100,
          stepBiasDiff: -0.25,
          stepSe: 0.1,
          stepNiTarget: 0.5,
          stepPassed: true,
          cumulativeBiasDiff: -0.25,
          cumulativeSe: 0.14,
          cumulativeCanaryLimit: 0.75,
          canaryStatus: 'PASS' as const,
          notes: 'Improvement',
        },
      ];

      const res = computeTransitiveDriftCanary(generations, 0.75);
      expect(res.generations[1]!.cumulativeBiasDiff).toBe(-0.25);
      expect(res.hasCanaryAlarm).toBe(false);
    });
  });
});


