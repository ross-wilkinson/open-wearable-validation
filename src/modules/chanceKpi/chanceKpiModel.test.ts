import { describe, expect, it } from 'vitest';
import {
  CHANCE_KPI_PRESETS,
  computeAnalyticalChance,
  computeMetric,
  formatPairedCsv,
  generatePairedData,
  getChancePreset,
  parsePairedCsv,
  runChanceKpiAnalysis,
} from './chanceKpiModel.ts';
import { createRng } from '../../stats/random.ts';

describe('chanceKpiModel', () => {
  describe('Presets', () => {
    it('defines all 4 key clinical presets', () => {
      expect(CHANCE_KPI_PRESETS).toHaveLength(4);
      const ids = CHANCE_KPI_PRESETS.map((p) => p.id);
      expect(ids).toContain('ambulatory-spo2');
      expect(ids).toContain('hypoxia-spo2');
      expect(ids).toContain('resting-temperature');
      expect(ids).toContain('exercise-heart-rate');
    });

    it('retrieves preset by ID and throws on invalid ID', () => {
      const preset = getChancePreset('ambulatory-spo2');
      expect(preset.name).toContain('Ambulatory SpO2');
      expect(() => getChancePreset('unknown-id')).toThrowError(/Unknown chance KPI preset/);
    });

    it('demonstrates Ambulatory SpO2 false-pass hazard (~99% chance passing rate)', () => {
      const preset = getChancePreset('ambulatory-spo2');
      const result = runChanceKpiAnalysis({
        ...preset,
        iterations: 2000,
        seed: 123,
      });

      // Pure chance passes almost every time!
      expect(result.chancePassingRate).toBeGreaterThan(90);
      expect(result.hazardVerdict).toBe('CRITICAL_HAZARD');
      // The defensible KPI should be much lower than the proposed 3.5%
      expect(result.defensible5PctThreshold).toBeLessThan(2.0);
      expect(result.defensible5PctThreshold).toBeGreaterThan(0);
    });

    it('demonstrates Controlled Hypoxia SpO2 is statistically defensible (<0.1% chance pass)', () => {
      const preset = getChancePreset('hypoxia-spo2');
      const result = runChanceKpiAnalysis({
        ...preset,
        iterations: 2000,
        seed: 123,
      });

      // Broad dynamic range makes passing by chance virtually impossible
      expect(result.chancePassingRate).toBeLessThan(0.1);
      expect(result.hazardVerdict).toBe('DEFENSIBLE');
      expect(result.permutationPValue).toBeLessThan(0.01);
      // Separation index is small (device error is much tighter than chance)
      expect(result.preissFisherSeparationIndex).toBeLessThan(0.3);
    });

    it('demonstrates Resting Body Temperature false-pass hazard (~98% chance passing rate)', () => {
      const preset = getChancePreset('resting-temperature');
      const result = runChanceKpiAnalysis({
        ...preset,
        iterations: 2000,
        seed: 123,
      });

      expect(result.chancePassingRate).toBeGreaterThan(90);
      expect(result.hazardVerdict).toBe('CRITICAL_HAZARD');
      expect(result.defensible5PctThreshold).toBeLessThan(preset.proposedKpi);
    });

    it('demonstrates Exercise Heart Rate is statistically defensible', () => {
      const preset = getChancePreset('exercise-heart-rate');
      const result = runChanceKpiAnalysis({
        ...preset,
        iterations: 2000,
        seed: 123,
      });

      expect(result.chancePassingRate).toBeLessThan(0.1);
      expect(result.hazardVerdict).toBe('DEFENSIBLE');
    });
  });

  describe('Closed-form analytical reference and mathematical proof', () => {
    it('computes exact E[MSE_chance] = Var_pop(X) + Var_pop(Y) + (mu_X - mu_Y)^2', () => {
      const refMean = 100;
      const refPopVar = 16;
      const devMean = 102;
      const devPopVar = 9;

      const analytical = computeAnalyticalChance(refMean, refPopVar, devMean, devPopVar);
      // MSE = 16 + 9 + (100 - 102)^2 = 25 + 4 = 29
      expect(analytical.mse).toBeCloseTo(29, 6);
      expect(analytical.rmse).toBeCloseTo(Math.sqrt(29), 6);
      // LoA half-width = 1.96 * sqrt(16 + 9) = 1.96 * 5 = 9.8
      expect(analytical.loa).toBeCloseTo(1.96 * 5, 6);
    });

    it('exactly matches the theoretical average across all possible permutations', () => {
      // 4 points -> 4! = 24 permutations
      const X = [10, 20, 30, 40];
      const Y = [12, 18, 32, 44];
      const pairs = X.map((x, i) => ({ reference: x, device: Y[i]! }));

      // Enumerate all 24 permutations of Y
      const perms: number[][] = [];
      function permute(arr: number[], m: number[] = []) {
        if (arr.length === 0) perms.push(m);
        else {
          for (let i = 0; i < arr.length; i += 1) {
            const curr = arr.slice();
            const next = curr.splice(i, 1);
            permute(curr.slice(), m.concat(next));
          }
        }
      }
      permute(Y);
      expect(perms).toHaveLength(24);

      let sumMse = 0;
      for (const p of perms) {
        let mse_b = 0;
        for (let i = 0; i < 4; i += 1) {
          const diff = X[i]! - p[i]!;
          mse_b += diff * diff;
        }
        sumMse += mse_b / 4;
      }
      const theoreticalMeanMse = sumMse / 24;

      const res = runChanceKpiAnalysis({
        sampleSize: 4,
        referenceMean: 25,
        referenceSd: 10,
        deviceBias: 0,
        deviceErrorSd: 1,
        proposedKpi: 5,
        metric: 'rmse',
        pairs,
        iterations: 1000,
      });

      // analyticalChanceMse MUST match the exact permutation mean
      expect(res.analyticalChanceMse).toBeCloseTo(theoreticalMeanMse, 8);
    });

    it('matches Monte Carlo permutation mean closely at large iterations', () => {
      const result = runChanceKpiAnalysis({
        sampleSize: 100,
        referenceMean: 50,
        referenceSd: 5,
        deviceBias: 0,
        deviceErrorSd: 2,
        proposedKpi: 8,
        metric: 'rmse',
        iterations: 5000,
        seed: 999,
      });

      // Analytical RMSE should be very close to the mean of permuted distribution
      expect(Math.abs(result.meanChanceMetric - result.analyticalChanceRmse)).toBeLessThan(0.15);
    });
  });

  describe('Metric types (RMSE, MAE, LoA)', () => {
    it('computes RMSE correctly', () => {
      const refs = [1, 2, 3, 4];
      const devs = [1, 2, 3, 6];
      // diffs: 0, 0, 0, -2 -> sumSq = 4 -> meanSq = 1 -> sqrt = 1
      expect(computeMetric('rmse', refs, devs)).toBe(1);
    });

    it('computes MAE correctly', () => {
      const refs = [1, 2, 3, 4];
      const devs = [1, 2, 5, 6];
      // diffs: 0, 0, -2, -2 -> sumAbs = 4 -> MAE = 1
      expect(computeMetric('mae', refs, devs)).toBe(1);
    });

    it('computes LoA half-width correctly (1.96 * SD_diff)', () => {
      const refs = [10, 20, 30, 40];
      const devs = [10, 20, 30, 42]; // diffs: 0, 0, 0, -2. mean = -0.5, deviations: 0.5, 0.5, 0.5, -1.5
      // sum dev^2 = 0.25*3 + 2.25 = 3. SD = sqrt(3 / 3) = 1.
      expect(computeMetric('loa', refs, devs)).toBeCloseTo(1.96 * 1, 6);
    });

    it('runs permutations under MAE metric', () => {
      const result = runChanceKpiAnalysis({
        sampleSize: 60,
        referenceMean: 100,
        referenceSd: 10,
        deviceBias: 0,
        deviceErrorSd: 2,
        proposedKpi: 5,
        metric: 'mae',
        iterations: 1000,
        seed: 42,
      });

      expect(result.metric).toBe('mae');
      expect(result.meanChanceMetric).toBeGreaterThan(0);
      expect(result.histogram.length).toBeGreaterThan(0);
    });

    it('runs permutations under LoA metric', () => {
      const result = runChanceKpiAnalysis({
        sampleSize: 60,
        referenceMean: 100,
        referenceSd: 10,
        deviceBias: 0,
        deviceErrorSd: 2,
        proposedKpi: 15,
        metric: 'loa',
        iterations: 1000,
        seed: 42,
      });

      expect(result.metric).toBe('loa');
      expect(result.meanChanceMetric).toBeGreaterThan(0);
      expect(result.analyticalChanceLoa).toBeGreaterThan(0);
    });
  });

  describe('Desired False-Positive Rate (alpha) configurations', () => {
    it('adapts defensible threshold to desired alpha (1%, 5%, 10%)', () => {
      const configBase = {
        sampleSize: 100,
        referenceMean: 97.5,
        referenceSd: 0.8,
        deviceBias: 0,
        deviceErrorSd: 1.2,
        proposedKpi: 1.5,
        metric: 'rmse' as const,
        iterations: 2000,
        seed: 777,
      };

      const resAlpha01 = runChanceKpiAnalysis({ ...configBase, desiredAlpha: 0.01 });
      const resAlpha05 = runChanceKpiAnalysis({ ...configBase, desiredAlpha: 0.05 });
      const resAlpha10 = runChanceKpiAnalysis({ ...configBase, desiredAlpha: 0.10 });

      expect(resAlpha01.desiredAlpha).toBe(0.01);
      expect(resAlpha05.desiredAlpha).toBe(0.05);
      expect(resAlpha10.desiredAlpha).toBe(0.10);

      // A 1% false positive threshold must be stricter (smaller) than 5%, which is smaller than 10%
      expect(resAlpha01.defensibleThreshold).toBeLessThanOrEqual(resAlpha05.defensibleThreshold);
      expect(resAlpha05.defensibleThreshold).toBeLessThanOrEqual(resAlpha10.defensibleThreshold);
    });
  });

  describe('Custom paired data parsing and formatting', () => {
    it('parses CSV, TSV, space-separated, and handles comments and headers', () => {
      const raw = `
        # This is a comment
        Reference, Device
        97.5, 97.2
        98.0\t98.3
        96.5; 96.1
        99.0   98.8
      `;
      const points = parsePairedCsv(raw);
      expect(points).toHaveLength(4);
      expect(points[0]).toEqual({ reference: 97.5, device: 97.2 });
      expect(points[1]).toEqual({ reference: 98.0, device: 98.3 });
      expect(points[2]).toEqual({ reference: 96.5, device: 96.1 });
      expect(points[3]).toEqual({ reference: 99.0, device: 98.8 });
    });

    it('formats paired points to clean comma-separated text', () => {
      const pairs = [
        { reference: 97.5, device: 97.2 },
        { reference: 98.1, device: 98.4 },
      ];
      const text = formatPairedCsv(pairs);
      expect(text).toContain('97.50, 97.20');
      expect(text).toContain('98.10, 98.40');
    });

    it('handles custom paired data in runChanceKpiAnalysis with N >= 3', () => {
      const customPairs = [
        { reference: 98.0, device: 98.2 },
        { reference: 97.0, device: 97.1 },
        { reference: 99.0, device: 98.9 },
      ];

      const result = runChanceKpiAnalysis({
        sampleSize: 3,
        referenceMean: 97.5,
        referenceSd: 1.0,
        deviceBias: 0,
        deviceErrorSd: 0.2,
        proposedKpi: 1.5,
        metric: 'rmse',
        pairs: customPairs,
        iterations: 300,
      });

      expect(result.sampleSize).toBe(3);
      expect(result.pairedPoints).toHaveLength(3);
      expect(result.observedMetric).toBeGreaterThan(0);
    });
  });

  describe('Edge cases and boundary inputs', () => {
    it('is deterministic when provided a fixed seed', () => {
      const run1 = runChanceKpiAnalysis({
        sampleSize: 50,
        referenceMean: 98,
        referenceSd: 1,
        deviceBias: 0,
        deviceErrorSd: 0.5,
        proposedKpi: 2,
        metric: 'rmse',
        iterations: 500,
        seed: 12345,
      });

      const run2 = runChanceKpiAnalysis({
        sampleSize: 50,
        referenceMean: 98,
        referenceSd: 1,
        deviceBias: 0,
        deviceErrorSd: 0.5,
        proposedKpi: 2,
        metric: 'rmse',
        iterations: 500,
        seed: 12345,
      });

      expect(run1.chancePassingRate).toBe(run2.chancePassingRate);
      expect(run1.meanChanceMetric).toBe(run2.meanChanceMetric);
      expect(run1.defensibleThreshold).toBe(run2.defensibleThreshold);
    });

    it('handles near-zero reference SD without crashing', () => {
      const result = runChanceKpiAnalysis({
        sampleSize: 30,
        referenceMean: 98,
        referenceSd: 0.0001,
        deviceBias: 0,
        deviceErrorSd: 0.0001,
        proposedKpi: 0.001,
        metric: 'rmse',
        iterations: 200,
        seed: 42,
      });

      expect(result.histogram.length).toBeGreaterThan(0);
      expect(Number.isFinite(result.meanChanceMetric)).toBe(true);
      expect(Number.isFinite(result.defensibleThreshold)).toBe(true);
    });

    it('generates non-empty histogram bins with cumulative 100%', () => {
      const result = runChanceKpiAnalysis({
        sampleSize: 80,
        referenceMean: 100,
        referenceSd: 5,
        deviceBias: 0,
        deviceErrorSd: 1,
        proposedKpi: 4,
        metric: 'rmse',
        iterations: 1000,
      });

      expect(result.histogram.length).toBeGreaterThan(10);
      const lastBin = result.histogram[result.histogram.length - 1]!;
      expect(lastBin.cumulativePercent).toBeCloseTo(100, 0);
    });

    it('generates simulated paired points with requested parameters', () => {
      const rng = createRng(42);
      const pairs = generatePairedData(50, 100, 10, 0.5, 2.0, rng);
      expect(pairs).toHaveLength(50);
      expect(pairs[0]).toHaveProperty('reference');
      expect(pairs[0]).toHaveProperty('device');
    });
  });
});
