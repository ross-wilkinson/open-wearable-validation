import { describe, expect, it } from 'vitest';
import {
  computeWinnerCurseMetrics,
  computePairedDividend,
  computeClusteredEffectiveN,
  mapMonkToFitzpatrick,
  generateCadenceLockSimulation,
  computeClopperPearsonZeroEventBound,
  evaluateTwoGateLaunchEngine,
  computeTransitiveBridge,
} from './academyModel.ts';

describe('academyModel', () => {
  describe('Module 1: computeWinnerCurseMetrics', () => {
    it('shows high winner curse probability at N=5 and high elimination power for catastrophic losers', () => {
      const result = computeWinnerCurseMetrics(5, 3.0, 0.3, 5.0);
      expect(result.seDiff).toBeCloseTo(1.897, 2);
      expect(result.snr).toBeLessThan(0.2);
      expect(result.winnerCurseProbability).toBeGreaterThan(50);
      expect(result.catastrophicEliminationPower).toBeGreaterThan(95);
    });

    it('decreases winner curse rate as sample size scales to N=40', () => {
      const n5 = computeWinnerCurseMetrics(5, 3.0);
      const n40 = computeWinnerCurseMetrics(40, 3.0);
      expect(n40.seDiff).toBeLessThan(n5.seDiff);
      expect(n40.snr).toBeGreaterThan(n5.snr);
    });
  });

  describe('Module 2: computePairedDividend', () => {
    it('computes massive sample size and cost reduction when rho = 0.95', () => {
      const result = computePairedDividend(190, 0.95, 1300);
      expect(result.varianceReductionPct).toBe(95);
      expect(result.pairedSampleSize).toBe(10);
      expect(result.independentCost).toBe(247000);
      expect(result.pairedCost).toBe(13000);
      expect(result.costSaved).toBe(234000);
      expect(result.costSavedPct).toBeCloseTo(94.7, 1);
    });

    it('clamps minimum paired sample size to safe floor', () => {
      const result = computePairedDividend(20, 0.99, 1000);
      expect(result.pairedSampleSize).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Module 3: computeClusteredEffectiveN', () => {
    it('exposes massive pseudoreplication understatement on 45-min HIIT data', () => {
      // 25 participants x 2700 replicates, ICC = 0.85
      const result = computeClusteredEffectiveN(25, 2700, 0.85, 4.0);
      expect(result.totalRows).toBe(67500);
      expect(result.vif).toBeGreaterThan(2000);
      expect(result.effectiveN).toBeLessThan(35);
      expect(result.effectiveN).toBeGreaterThan(25);
      expect(result.uncertaintyUnderstatementPct).toBeGreaterThan(90);
    });

    it('handles independent replicates with ICC = 0', () => {
      const result = computeClusteredEffectiveN(10, 5, 0.0, 2.0);
      expect(result.vif).toBe(1);
      expect(result.effectiveN).toBe(50);
      expect(result.trueSe).toBeCloseTo(result.naiveSe, 4);
    });
  });

  describe('Module 4: mapMonkToFitzpatrick', () => {
    it('maps Monk distribution to 5 Fitzpatrick buckets and verifies FDA 15% rule', () => {
      // 30 participants, balanced
      const monkCounts = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
      const result = mapMonkToFitzpatrick(monkCounts);
      expect(result.totalEnrolled).toBe(30);
      expect(result.fitzpatrickBuckets).toHaveLength(5);
      // MST 09 + 10 = 6 out of 30 = 20%
      expect(result.darkSkinPercentage).toBe(20);
      expect(result.satisfiesFda15PctRule).toBe(true);
      expect(result.minDarkSkinRequired).toBe(5);
    });

    it('flags failure when dark skin quota falls below 15%', () => {
      // Only 1 person in MST 9, 0 in MST 10 out of 20
      const monkCounts = [5, 5, 4, 3, 1, 1, 0, 0, 1, 0];
      const result = mapMonkToFitzpatrick(monkCounts);
      expect(result.darkSkinPercentage).toBe(5);
      expect(result.satisfiesFda15PctRule).toBe(false);
    });
  });

  describe('Module 5: generateCadenceLockSimulation', () => {
    it('generates crossover data and flags high HCI in severe cadence lock', () => {
      const { samples, metrics } = generateCadenceLockSimulation(10, 'severe', 25);
      expect(samples.length).toBeGreaterThan(50);
      expect(metrics.harmonicContaminationIndex).toBeGreaterThan(0);
      expect(metrics.imuSamplingRateHz).toBe(25);
      expect(metrics.imuPeriodMs).toBe(40);
      expect(metrics.imuResolutionVerdict).toBe('INSUFFICIENT');
    });

    it('passes IMU resolution when sampling rate >= 100 Hz', () => {
      const { metrics } = generateCadenceLockSimulation(5, 'none', 100);
      expect(metrics.imuPeriodMs).toBe(10);
      expect(metrics.gctTemporalResolutionErrorPct).toBeLessThan(5);
      expect(metrics.imuResolutionVerdict).toBe('SUFFICIENT');
    });
  });

  describe('Module 6: computeClopperPearsonZeroEventBound', () => {
    it('computes exact Clopper-Pearson upper bound of ~0.30% for 0/1000 events', () => {
      const result = computeClopperPearsonZeroEventBound(1000, 0.95, 1000000, 10000);
      expect(result.exactUpperBoundPct).toBeCloseTo(0.299, 2);
      expect(result.ruleOfThreeUpperBoundPct).toBeCloseTo(0.300, 2);
      expect(result.annualPopulationFalseAlarms).toBeGreaterThan(25000000);
    });

    it('tightens upper bound as trial count increases to 5000', () => {
      const r1k = computeClopperPearsonZeroEventBound(1000);
      const r5k = computeClopperPearsonZeroEventBound(5000);
      expect(r5k.exactUpperBoundPct).toBeLessThan(r1k.exactUpperBoundPct);
    });
  });

  describe('Module 7: evaluateTwoGateLaunchEngine', () => {
    it('awards GREEN_LIGHT when both Gate 1 and Gate 2 pass', () => {
      const result = evaluateTwoGateLaunchEngine(2.1, 3.0, 0.6, 1.5);
      expect(result.verdict).toBe('GREEN_LIGHT');
      expect(result.gate1Pass).toBe(true);
      expect(result.gate2Pass).toBe(true);
    });

    it('assigns AMBER_PARITY_RISK when Gate 1 passes but Gate 2 fails', () => {
      const result = evaluateTwoGateLaunchEngine(2.5, 3.0, 1.9, 1.5);
      expect(result.verdict).toBe('AMBER_PARITY_RISK');
    });

    it('assigns AMBER_QUALITY_DEBT when Gate 1 fails but Gate 2 passes', () => {
      const result = evaluateTwoGateLaunchEngine(3.8, 3.0, 0.5, 1.5);
      expect(result.verdict).toBe('AMBER_QUALITY_DEBT');
    });

    it('assigns RED_LIGHT when both fail', () => {
      const result = evaluateTwoGateLaunchEngine(4.2, 3.0, 2.3, 1.5);
      expect(result.verdict).toBe('RED_LIGHT');
    });
  });

  describe('Module 8: computeTransitiveBridge', () => {
    it('propagates variance and computes indirect contrast for Gen 3 vs Gen 1', () => {
      const result = computeTransitiveBridge(0.3, 0.3, 0.2, 0.3, 1.5, 0);
      expect(result.transitiveDelta).toBeCloseTo(0.5, 2);
      expect(result.transitiveSe).toBeCloseTo(0.424, 3);
      expect(result.isNonInferior).toBe(true);
      expect(result.driftCanaryAlert).toBe(false);
    });

    it('alerts on silent quality drift when upper CI exceeds non-inferiority bound', () => {
      const result = computeTransitiveBridge(0.9, 0.4, 0.8, 0.4, 1.5, 0);
      expect(result.transitiveDelta).toBeCloseTo(1.7, 2);
      expect(result.isNonInferior).toBe(false);
      expect(result.driftCanaryAlert).toBe(true);
      expect(result.driftWarningMessage).toContain('Silent Quality Drift Detected');
    });

    it('alerts on reference standard drift canary', () => {
      const result = computeTransitiveBridge(0.2, 0.2, 0.2, 0.2, 1.5, 1.5);
      expect(result.driftCanaryAlert).toBe(true);
      expect(result.driftWarningMessage).toContain('Canary Warning: Reference standard baseline shifted');
    });

    it('surfaces BOTH canary warning and silent quality drift when both occur', () => {
      // Delta = 0.9 + 0.8 = 1.7 > 1.5 AND baseline shift = 1.8 > 1.0
      const result = computeTransitiveBridge(0.9, 0.4, 0.8, 0.4, 1.5, 1.8);
      expect(result.driftCanaryAlert).toBe(true);
      expect(result.driftWarningMessage).toContain('Canary Warning: Reference standard baseline shifted');
      expect(result.driftWarningMessage).toContain('Silent Quality Drift Detected');
    });
  });

  describe('Robustness and Boundary Handling', () => {
    it('handles NaN and negative inputs safely across all mathematical functions', () => {
      // Module 1
      const act1 = computeWinnerCurseMetrics(NaN, NaN);
      expect(Number.isFinite(act1.seDiff)).toBe(true);
      expect(Number.isFinite(act1.winnerCurseProbability)).toBe(true);

      // Module 2
      const act2 = computePairedDividend(NaN, NaN, NaN);
      expect(Number.isFinite(act2.pairedSampleSize)).toBe(true);
      expect(Number.isFinite(act2.costSavedPct)).toBe(true);

      // Module 3
      const act3 = computeClusteredEffectiveN(NaN, NaN, NaN, NaN);
      expect(Number.isFinite(act3.effectiveN)).toBe(true);
      expect(Number.isFinite(act3.uncertaintyUnderstatementPct)).toBe(true);

      // Module 4
      const act4 = mapMonkToFitzpatrick([NaN, -5, 0, 0, 0, 0, 0, 0, 0, 0]);
      expect(Number.isFinite(act4.totalEnrolled)).toBe(true);
      expect(Number.isFinite(act4.darkSkinPercentage)).toBe(true);
      expect(act4.satisfiesFda15PctRule).toBe(false);

      // Module 5
      const act5 = generateCadenceLockSimulation(NaN, 'severe', NaN);
      expect(Number.isFinite(act5.metrics.harmonicContaminationIndex)).toBe(true);
      expect(Number.isFinite(act5.metrics.imuPeriodMs)).toBe(true);

      // Module 6
      const act6 = computeClopperPearsonZeroEventBound(NaN, NaN, NaN, NaN);
      expect(Number.isFinite(act6.exactUpperBoundPct)).toBe(true);
      expect(Number.isFinite(act6.annualPopulationFalseAlarms)).toBe(true);

      // Module 7
      const act7 = evaluateTwoGateLaunchEngine(NaN, NaN, NaN, NaN);
      expect(act7.verdict).toBe('RED_LIGHT');

      // Module 8
      const act8 = computeTransitiveBridge(NaN, NaN, NaN, NaN, NaN, NaN);
      expect(Number.isFinite(act8.transitiveDelta)).toBe(true);
      expect(Number.isFinite(act8.ciUpper)).toBe(true);
    });

    it('ensures Cadence Lock simulation is deterministic and reproducible', () => {
      const run1 = generateCadenceLockSimulation(10, 'severe', 25);
      const run2 = generateCadenceLockSimulation(10, 'severe', 25);
      expect(run1.metrics.harmonicContaminationIndex).toBe(run2.metrics.harmonicContaminationIndex);
      expect(run1.metrics.maxDiscrepancyBpm).toBe(run2.metrics.maxDiscrepancyBpm);
      expect(run1.samples[20]?.ppgHeartRateBpm).toBe(run2.samples[20]?.ppgHeartRateBpm);
    });
  });
});
