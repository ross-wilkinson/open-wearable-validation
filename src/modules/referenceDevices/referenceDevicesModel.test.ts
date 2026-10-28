import { describe, expect, it } from 'vitest';
import {
  calculateReferenceNoiseImpact,
  calculateStudyConsumableBudget,
  filterDevices,
  getDevicesForDomain,
  getDomainById,
} from './referenceDevicesModel.ts';
import { FEATURE_DOMAINS, REFERENCE_DEVICES } from '../../content/referenceDevices/catalog.ts';

describe('referenceDevicesModel calculations', () => {
  it('calculates zero sample size inflation when reference noise is zero', () => {
    const impact = calculateReferenceNoiseImpact(100, 2.0, 0);
    expect(impact.sdInflationRatio).toBeCloseTo(1.0, 5);
    expect(impact.sampleSizeMultiplier).toBeCloseTo(1.0, 5);
    expect(impact.adjustedN).toBe(100);
    expect(impact.penaltySubjects).toBe(0);
  });

  it('correctly inflates sample size when reference noise is present', () => {
    // If DUT SD = 2.0 and REF SD = 1.0
    // Var_diff = 4.0 + 1.0 = 5.0
    // Multiplier = 5.0 / 4.0 = 1.25 (+25% subjects required)
    const impact = calculateReferenceNoiseImpact(100, 2.0, 1.0);
    expect(impact.totalDiffSd).toBeCloseTo(Math.sqrt(5), 4);
    expect(impact.sampleSizeMultiplier).toBeCloseTo(1.25, 4);
    expect(impact.adjustedN).toBe(125);
    expect(impact.penaltySubjects).toBe(25);
  });

  it('handles small base sample sizes cleanly', () => {
    const impact = calculateReferenceNoiseImpact(15, 1.5, 1.5);
    // Var_diff = 1.5^2 + 1.5^2 = 2 * 1.5^2 => Multiplier = 2.0
    expect(impact.sampleSizeMultiplier).toBeCloseTo(2.0, 4);
    expect(impact.adjustedN).toBe(30);
    expect(impact.penaltySubjects).toBe(15);
  });

  it('calculates consumable budget with attrition buffer', () => {
    // 50 subjects at $18/subject with 15% attrition = ceil(57.5) = 58 kits = $1044
    const budget = calculateStudyConsumableBudget(50, 18, 0.15);
    expect(budget.targetSubjects).toBe(50);
    expect(budget.totalKitsNeeded).toBe(58);
    expect(budget.totalConsumableCostUsd).toBe(58 * 18);
  });
});

describe('reference catalog consistency', () => {
  it('contains all 12 feature domains', () => {
    expect(FEATURE_DOMAINS.length).toBe(12);
    const ids = FEATURE_DOMAINS.map((d) => d.id);
    expect(ids).toContain('hr');
    expect(ids).toContain('spo2');
    expect(ids).toContain('sleep');
    expect(ids).toContain('bp');
    expect(ids).toContain('temperature');
    expect(ids).toContain('running_dynamics');
  });

  it('verifies that the top 5 priority domains each contain at least one gold and silver reference device', () => {
    const top5 = ['hr', 'spo2', 'sleep', 'bp', 'temperature'] as const;
    for (const domain of top5) {
      const devices = getDevicesForDomain(domain);
      expect(devices.length).toBeGreaterThanOrEqual(2);
      const tiers = devices.map((d) => d.tier);
      expect(tiers).toContain('gold');
      expect(tiers).toContain('silver');
    }
  });

  it('filters devices by tier properly', () => {
    const goldHr = filterDevices('hr', 'gold');
    expect(goldHr.length).toBeGreaterThanOrEqual(1);
    expect(goldHr.every((d) => d.tier === 'gold')).toBe(true);

    const silverHr = filterDevices('hr', 'silver');
    expect(silverHr.length).toBeGreaterThanOrEqual(1);
    expect(silverHr.every((d) => d.tier === 'silver')).toBe(true);

    const allHr = filterDevices('hr', 'all');
    expect(allHr.length).toBe(goldHr.length + silverHr.length + filterDevices('hr', 'bronze').length);
  });

  it('retrieves domain by id cleanly with fallback', () => {
    const domain = getDomainById('spo2');
    expect(domain).toBeDefined();
    expect(domain.name).toBe('Blood Oxygen Saturation');
    expect(domain.primaryUnit).toBe('%');

    // Fallback to first domain if not found
    // @ts-expect-error Testing invalid domain fallback
    const fallback = getDomainById('invalid_id');
    expect(fallback).toBeDefined();
    expect(fallback.id).toBe('hr');
  });

  it('verifies every device has valid regulatory and operational profiles', () => {
    for (const dev of REFERENCE_DEVICES) {
      expect(dev.id).toBeTruthy();
      expect(dev.name).toBeTruthy();
      expect(dev.vendor).toBeTruthy();
      expect(dev.regulatory.clearancePathway).toBeTruthy();
      expect(dev.regulatory.predicateChain).toBeTruthy();
      expect(dev.dataPipeline.easeScore).toBeGreaterThanOrEqual(1);
      expect(dev.dataPipeline.easeScore).toBeLessThanOrEqual(5);
      expect(dev.economics.perSubjectConsumableCost).toBeGreaterThanOrEqual(0);
      expect(dev.measurementSd).toBeGreaterThanOrEqual(0);
      expect(dev.repeatabilityLimit).toBeCloseTo(dev.measurementSd * 2.77, 1);
    }
  });
});
