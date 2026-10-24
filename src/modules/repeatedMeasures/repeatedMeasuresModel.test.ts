import { describe, expect, it } from 'vitest';
import { biasMargin, loaMargin } from '../precision/precisionModel.ts';
import {
  analyzeRepeatedMeasuresDesign,
  biasMarginRepeated,
  designEffect,
  effectiveSampleSize,
  loaMarginRepeated,
  maxEffectiveSampleSize,
  partitionFromIcc,
  partitionFromSds,
  replicateSweep,
  solveRequiredM,
  subjectSweep,
} from './repeatedMeasuresModel.ts';

describe('repeatedMeasuresModel', () => {
  describe('k = 1 collapses identically to single-observation formulas', () => {
    it('matches precisionModel biasMargin for various m and confidence levels', () => {
      const confidences = [0.9, 0.95, 0.99];
      const mValues = [5, 10, 25, 50, 100];
      const iccValues = [0.0, 0.3, 0.6, 0.9];

      for (const m of mValues) {
        for (const conf of confidences) {
          for (const icc of iccValues) {
            const repeated = biasMarginRepeated(m, 1, icc, conf);
            const standard = biasMargin(m, conf);
            expect(repeated).toBeCloseTo(standard, 10);
          }
        }
      }
    });

    it('matches precisionModel loaMargin for various m, kLoa, and confidences', () => {
      const confidences = [0.9, 0.95];
      const mValues = [5, 12, 30, 80];
      const kLoaValues = [1.959963984540054, 2.0];
      const iccValues = [0.0, 0.4, 0.8];

      for (const m of mValues) {
        for (const conf of confidences) {
          for (const kLoa of kLoaValues) {
            for (const icc of iccValues) {
              const repeated = loaMarginRepeated(m, 1, icc, conf, kLoa);
              const standard = loaMargin(m, conf, kLoa);
              expect(repeated).toBeCloseTo(standard, 10);
            }
          }
        }
      }
    });

    it('gives n_effective = m and DEFF = 1 when k = 1', () => {
      for (const m of [10, 50, 100]) {
        for (const icc of [0.1, 0.5, 0.9]) {
          expect(effectiveSampleSize(m, 1, icc)).toBeCloseTo(m, 10);
          expect(designEffect(1, icc)).toBeCloseTo(1.0, 10);
        }
      }
    });
  });

  describe('variance partitioning', () => {
    it('partitions from SDs correctly', () => {
      const part = partitionFromSds(3, 4);
      expect(part.varBetween).toBe(9);
      expect(part.varWithin).toBe(16);
      expect(part.varTotal).toBe(25);
      expect(part.sdTotal).toBe(5);
      expect(part.icc).toBeCloseTo(0.36, 10);
      expect(part.betweenSharePct).toBeCloseTo(36, 10);
      expect(part.withinSharePct).toBeCloseTo(64, 10);
    });

    it('partitions from ICC correctly', () => {
      const part = partitionFromIcc(10, 0.6);
      expect(part.varTotal).toBe(100);
      expect(part.varBetween).toBeCloseTo(60, 10);
      expect(part.varWithin).toBeCloseTo(40, 10);
      expect(part.sdBetween).toBeCloseTo(Math.sqrt(60), 10);
      expect(part.sdWithin).toBeCloseTo(Math.sqrt(40), 10);
      expect(part.icc).toBe(0.6);
      expect(part.betweenSharePct).toBe(60);
      expect(part.withinSharePct).toBe(40);
    });
  });

  describe('effective sample size and design effect', () => {
    it('yields n_effective = m * k when rho = 0 (independence)', () => {
      const m = 30;
      const k = 10;
      expect(designEffect(k, 0)).toBe(1.0);
      expect(effectiveSampleSize(m, k, 0)).toBe(300);
    });

    it('caps n_effective at m when rho = 1 (complete clustering)', () => {
      const m = 40;
      const k = 8;
      expect(designEffect(k, 1)).toBe(8);
      expect(effectiveSampleSize(m, k, 1)).toBe(40);
    });

    it('computes intermediate effective sample sizes correctly', () => {
      // 50 subjects, 5 replicates each, rho = 0.5
      // DEFF = 1 + (5 - 1)*0.5 = 3
      // n_effective = 250 / 3 = 83.333
      const m = 50;
      const k = 5;
      const icc = 0.5;
      expect(designEffect(k, icc)).toBe(3.0);
      expect(effectiveSampleSize(m, k, icc)).toBeCloseTo(250 / 3, 10);
      expect(maxEffectiveSampleSize(m, icc)).toBe(100); // 50 / 0.5
    });

    it('strictly satisfies m <= n_effective <= m * k for valid inputs', () => {
      for (const icc of [0.05, 0.25, 0.5, 0.75, 0.95]) {
        const nEff = effectiveSampleSize(25, 6, icc);
        expect(nEff).toBeGreaterThanOrEqual(25);
        expect(nEff).toBeLessThanOrEqual(150);
      }
    });
  });

  describe('bias and limits of agreement precision', () => {
    it('scales with measurement SD', () => {
      const m = 30;
      const k = 5;
      const icc = 0.5;
      const marginUnit = biasMarginRepeated(m, k, icc, 0.95, 1.0);
      const marginScaled = biasMarginRepeated(m, k, icc, 0.95, 3.5);
      expect(marginScaled).toBeCloseTo(marginUnit * 3.5, 10);

      const loaUnit = loaMarginRepeated(m, k, icc, 0.95, 1.96, 1.0);
      const loaScaled = loaMarginRepeated(m, k, icc, 0.95, 1.96, 4.0);
      expect(loaScaled).toBeCloseTo(loaUnit * 4.0, 10);
    });

    it('widens when confidence level increases', () => {
      const m = 40;
      const k = 4;
      const icc = 0.6;
      const b90 = biasMarginRepeated(m, k, icc, 0.9);
      const b95 = biasMarginRepeated(m, k, icc, 0.95);
      const b99 = biasMarginRepeated(m, k, icc, 0.99);

      expect(b90).toBeLessThan(b95);
      expect(b95).toBeLessThan(b99);

      const l90 = loaMarginRepeated(m, k, icc, 0.9);
      const l95 = loaMarginRepeated(m, k, icc, 0.95);
      const l99 = loaMarginRepeated(m, k, icc, 0.99);

      expect(l90).toBeLessThan(l95);
      expect(l95).toBeLessThan(l99);
    });

    it('shows that naive independent calculations substantially understate uncertainty', () => {
      const m = 25;
      const k = 10;
      const icc = 0.65;
      const summary = analyzeRepeatedMeasuresDesign(m, k, icc);

      expect(summary.naiveBiasMargin).toBeLessThan(summary.biasMargin);
      expect(summary.naiveLoaMargin).toBeLessThan(summary.loaMargin);
      expect(summary.underestimationBiasPct).toBeGreaterThan(50);
      expect(summary.underestimationLoaPct).toBeGreaterThan(30);
    });
  });

  describe('sweeps and solvers', () => {
    it('exhibits diminishing returns in replicate sweep', () => {
      const m = 30;
      const icc = 0.6;
      const sweep = replicateSweep(m, icc, 15);

      expect(sweep).toHaveLength(15);
      // As k grows, marginal gain in LoA precision drops
      const gain2 = sweep[1]!.marginalLoaGainPct;
      const gain10 = sweep[9]!.marginalLoaGainPct;
      expect(gain2).toBeGreaterThan(gain10);
      expect(gain10).toBeGreaterThan(0);
    });

    it('computes subject sweep monotonically', () => {
      const sweep = subjectSweep(5, 0.5, 10, 50, 10);
      expect(sweep).toHaveLength(5);
      for (let i = 1; i < sweep.length; i += 1) {
        expect(sweep[i]!.biasMargin).toBeLessThan(sweep[i - 1]!.biasMargin);
        expect(sweep[i]!.loaMargin).toBeLessThan(sweep[i - 1]!.loaMargin);
        expect(sweep[i]!.nEffective).toBeGreaterThan(sweep[i - 1]!.nEffective);
      }
    });

    it('solves for required m given target LoA margin', () => {
      const target = 0.35;
      const k = 6;
      const icc = 0.55;
      const reqM = solveRequiredM(target, k, icc);
      expect(reqM).not.toBeNull();
      expect(reqM!).toBeGreaterThan(10);

      // Verify that reqM achieves target, and reqM - 1 does not
      const achieved = loaMarginRepeated(reqM!, k, icc);
      const previous = loaMarginRepeated(reqM! - 1, k, icc);
      expect(achieved).toBeLessThanOrEqual(target);
      expect(previous).toBeGreaterThan(target);
    });

    it('returns 2 if target is large enough to be met at m = 2', () => {
      const m2Margin = loaMarginRepeated(2, 5, 0.5);
      const reqM = solveRequiredM(m2Margin + 0.1, 5, 0.5);
      expect(reqM).toBe(2);
    });

    it('returns null if target is unreachable within maxM', () => {
      // Extremely tight margin cannot be achieved with maxM = 50
      const reqM = solveRequiredM(0.01, 2, 0.8, 0.95, 1.959963984540054, 1.0, 50);
      expect(reqM).toBeNull();
    });

    it('handles extreme ICC values 0.0 and 1.0 in solver', () => {
      const reqM0 = solveRequiredM(0.3, 5, 0.0);
      const reqM1 = solveRequiredM(0.3, 5, 1.0);
      expect(reqM0).not.toBeNull();
      expect(reqM1).not.toBeNull();
      // Completely clustered (rho = 1) requires more subjects than independent (rho = 0)
      expect(reqM1!).toBeGreaterThan(reqM0!);
    });

    it('handles large k = 50 and k = 100 in solver', () => {
      const reqM = solveRequiredM(0.25, 100, 0.6);
      expect(reqM).not.toBeNull();
      expect(reqM!).toBeGreaterThan(2);
      expect(loaMarginRepeated(reqM!, 100, 0.6)).toBeLessThanOrEqual(0.25);
    });
  });

  describe('edge cases and guards', () => {
    it('handles non-positive and boundary inputs safely', () => {
      expect(effectiveSampleSize(0, 5, 0.5)).toBeNaN();
      expect(effectiveSampleSize(10, 0, 0.5)).toBeNaN();
      expect(biasMarginRepeated(1, 5, 0.5)).toBeNaN();
      expect(loaMarginRepeated(1, 5, 0.5)).toBeNaN();
      expect(solveRequiredM(0, 5, 0.5)).toBeNull();
      expect(solveRequiredM(-0.5, 5, 0.5)).toBeNull();
      expect(solveRequiredM(0.3, 0, 0.5)).toBeNull();
      expect(solveRequiredM(0.3, 5, 0.5, 0.95, 1.96, 1.0, 1)).toBeNull();
    });
  });
});
