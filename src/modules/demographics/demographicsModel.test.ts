import { describe, expect, it } from 'vitest';
import { SEGMENT_PRESETS, planSegments } from './demographicsModel.ts';
import { modulesFixture } from '../../stats/testing/fixtures.ts';

describe('planSegments', () => {
  it('reproduces all three of the notebook’s worked examples', () => {
    for (const expected of modulesFixture.demographic) {
      const plan = planSegments({
        sampleSize: expected.n_sample,
        segments: expected.n_segments,
        minPercent: expected.perc_min,
      });
      expect(
        plan,
        `n=${expected.n_sample} segments=${expected.n_segments}`,
      ).not.toBeNull();
      expect(plan!.minSubjects).toBe(expected.n_min);
      expect(plan!.maxSubjects).toBe(expected.n_max);
      expect(plan!.maxPercent).toBeCloseTo(expected.perc_max, 10);
    }
  });

  it('matches the tables printed in the notebook', () => {
    // Example 1 — sex, n=65, 2 segments, 40% floor -> 26/39 and 40/60.
    const sex = planSegments({ sampleSize: 65, segments: 2, minPercent: 40 })!;
    expect([sex.minSubjects, sex.maxSubjects]).toEqual([26, 39]);
    expect(Math.ceil(sex.maxPercent)).toBe(60);

    // Example 2 — age, 4 segments, 10% floor -> 7/19 and 10/30.
    const age = planSegments({ sampleSize: 65, segments: 4, minPercent: 10 })!;
    expect([age.minSubjects, age.maxSubjects]).toEqual([7, 19]);
    expect(Math.ceil(age.maxPercent)).toBe(30);

    // Example 3 — Monk skin tone, 3 segments, 15% floor -> 10/27 and 15/43.
    const tone = planSegments({ sampleSize: 65, segments: 3, minPercent: 15 })!;
    expect([tone.minSubjects, tone.maxSubjects]).toEqual([10, 27]);
    expect(Math.ceil(tone.maxPercent)).toBe(43);
  });

  it('the cap always leaves exactly enough room for the floor', () => {
    // The module's whole argument, stated as an invariant: whatever the other
    // segments do within their caps, the rarest one can still reach its floor.
    for (const segments of [2, 3, 4, 5, 8]) {
      for (const minPercent of [5, 10, 15, 25, 40]) {
        const plan = planSegments({ sampleSize: 200, segments, minPercent });
        if (!plan) continue;
        const othersAtCap = plan.maxPercent * (segments - 1);
        expect(othersAtCap + minPercent).toBeCloseTo(100, 8);
      }
    }
  });

  it('rejects a single segment instead of dividing by zero', () => {
    // (1 - minPercent) / (segments - 1) is Infinity at segments = 1, which the
    // notebook's form produces silently.
    expect(planSegments({ sampleSize: 65, segments: 1, minPercent: 40 })).toBeNull();
    expect(planSegments({ sampleSize: 65, segments: 0, minPercent: 40 })).toBeNull();
  });

  it('rejects nonsensical inputs', () => {
    expect(planSegments({ sampleSize: 0, segments: 3, minPercent: 20 })).toBeNull();
    expect(planSegments({ sampleSize: -5, segments: 3, minPercent: 20 })).toBeNull();
    expect(planSegments({ sampleSize: 65, segments: 3, minPercent: 0 })).toBeNull();
    expect(planSegments({ sampleSize: 65, segments: 3, minPercent: 101 })).toBeNull();
    expect(planSegments({ sampleSize: 65, segments: 2.5, minPercent: 20 })).toBeNull();
  });

  it('flags an infeasible plan rather than returning one', () => {
    // Four segments each needing 30% is 120% of the study.
    const plan = planSegments({ sampleSize: 100, segments: 4, minPercent: 30 })!;
    expect(plan.feasible).toBe(false);
    expect(plan.minRequiredTotal).toBeGreaterThan(plan.sampleSize);
  });

  it('accepts a comfortable plan', () => {
    const plan = planSegments({ sampleSize: 65, segments: 2, minPercent: 40 })!;
    expect(plan.feasible).toBe(true);
  });

  it('rounds subjects the safe way in each direction', () => {
    // Floors round up and caps round down: both err toward a *stricter* plan,
    // never toward one that looks satisfiable but is not.
    const plan = planSegments({ sampleSize: 65, segments: 3, minPercent: 15 })!;
    expect(plan.minSubjects).toBeGreaterThanOrEqual((65 * 15) / 100);
    expect(plan.maxSubjects).toBeLessThanOrEqual((65 * plan.maxPercent) / 100);
  });
});

describe('SEGMENT_PRESETS', () => {
  it('every preset produces a feasible plan matching its segment count', () => {
    for (const preset of SEGMENT_PRESETS) {
      const plan = planSegments({
        sampleSize: preset.sampleSize,
        segments: preset.segmentLabels.length,
        minPercent: preset.minPercent,
      });
      expect(plan, preset.id).not.toBeNull();
      expect(plan!.feasible, preset.id).toBe(true);
    }
  });

  it('has unique ids', () => {
    const ids = SEGMENT_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
