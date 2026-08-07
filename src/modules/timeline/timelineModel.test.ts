import { describe, expect, it } from 'vitest';
import { createRng, mean, standardDeviation } from '../../stats/random.ts';
import {
  DEFAULT_PHASES,
  phaseExpectedValue,
  samplePhase,
  simulateTimeline,
  type Phase,
} from './timelineModel.ts';

function phase(overrides: Partial<Phase>): Phase {
  return {
    id: 'p',
    name: 'Phase',
    distribution: 'gamma',
    mean: 28,
    sd: 10,
    min: 14,
    mode: 28,
    max: 60,
    lambda: 4,
    ...overrides,
  };
}

function drawPhase(p: Phase, count: number, seed = 99): number[] {
  const rng = createRng(seed);
  const out = new Array<number>(count);
  for (let i = 0; i < count; i += 1) out[i] = samplePhase(rng, p);
  return out;
}

describe('samplePhase', () => {
  it('gamma hits the requested mean and SD', () => {
    const values = drawPhase(
      phase({ distribution: 'gamma', mean: 28, sd: 10 }),
      100000,
    );
    expect(mean(values)).toBeCloseTo(28, 0);
    expect(standardDeviation(values)).toBeCloseTo(10, 0);
  });

  it('lognormal hits the requested mean and SD', () => {
    const values = drawPhase(
      phase({ distribution: 'lognormal', mean: 28, sd: 14 }),
      100000,
    );
    expect(mean(values)).toBeCloseTo(28, 0);
    expect(standardDeviation(values)).toBeCloseTo(14, 0);
  });

  it('poisson forces variance to equal the mean — the flaw being fixed', () => {
    // The module exists because this is not a plausible model of an IRB
    // review. Asserting it explicitly documents what the alternatives buy.
    const values = drawPhase(
      phase({ distribution: 'poisson', mean: 28, sd: 14 }),
      100000,
    );
    expect(mean(values)).toBeCloseTo(28, 0);
    expect(standardDeviation(values)).toBeCloseTo(Math.sqrt(28), 0);
    // The requested SD of 14 is simply ignored — Poisson has no room for it.
    expect(standardDeviation(values)).toBeLessThan(7);
  });

  it('pert respects its three-point bounds', () => {
    const values = drawPhase(
      phase({ distribution: 'pert', min: 10, mode: 20, max: 60 }),
      50000,
    );
    expect(Math.min(...values)).toBeGreaterThanOrEqual(10);
    expect(Math.max(...values)).toBeLessThanOrEqual(60);
    expect(mean(values)).toBeCloseTo((10 + 4 * 20 + 60) / 6, 0);
  });

  it('fixed has no spread', () => {
    const values = drawPhase(phase({ distribution: 'fixed', mean: 21 }), 100);
    expect(new Set(values)).toEqual(new Set([21]));
  });

  it('never returns a negative duration', () => {
    for (const distribution of [
      'poisson',
      'gamma',
      'lognormal',
      'pert',
      'fixed',
    ] as const) {
      const values = drawPhase(phase({ distribution, mean: 3, sd: 5 }), 20000);
      expect(Math.min(...values), distribution).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('phaseExpectedValue', () => {
  it('uses the PERT mean formula for three-point phases', () => {
    expect(
      phaseExpectedValue(phase({ distribution: 'pert', min: 10, mode: 20, max: 60 })),
    ).toBeCloseTo(25, 10);
  });

  it('uses the stated mean otherwise', () => {
    expect(phaseExpectedValue(phase({ distribution: 'gamma', mean: 28 }))).toBe(28);
  });
});

describe('simulateTimeline', () => {
  const input = { phases: DEFAULT_PHASES, iterations: 20000, seed: 7 };

  it('is deterministic for a given seed', () => {
    const a = simulateTimeline(input);
    const b = simulateTimeline(input);
    expect(a.p50).toBe(b.p50);
    expect(a.mean).toBe(b.mean);
  });

  it('changes with the seed', () => {
    const a = simulateTimeline(input);
    const b = simulateTimeline({ ...input, seed: 8 });
    expect(a.p50).not.toBe(b.p50);
  });

  it('total mean matches the sum of the phase means', () => {
    // Expectation is additive whatever the shapes, so this is an exact
    // structural property, not a distributional coincidence.
    const result = simulateTimeline(input);
    const summed = result.phases.reduce((total, p) => total + p.mean, 0);
    expect(result.mean).toBeCloseTo(summed, 6);
  });

  it('total variance is sub-additive in SD — phases partly cancel', () => {
    // Independent phases add in variance, not in SD, so the total SD is less
    // than the sum of the phase SDs. Study plans that add worst cases across
    // phases systematically overstate the risk, and this is why.
    const result = simulateTimeline(input);
    const summedSd = result.phases.reduce((total, p) => total + p.sd, 0);
    expect(result.sd).toBeLessThan(summedSd);

    const rootSumSquares = Math.sqrt(
      result.phases.reduce((total, p) => total + p.sd * p.sd, 0),
    );
    expect(result.sd).toBeCloseTo(rootSumSquares, 0);
  });

  it('orders its quantiles', () => {
    const result = simulateTimeline(input);
    expect(result.min).toBeLessThanOrEqual(result.p5);
    expect(result.p5).toBeLessThan(result.p50);
    expect(result.p50).toBeLessThan(result.p80);
    expect(result.p80).toBeLessThan(result.p95);
    expect(result.p95).toBeLessThanOrEqual(result.max);
  });

  it('the deterministic total sits well below the 95th percentile', () => {
    // The practical lesson the module is for: planning to the sum of expected
    // durations is planning to roughly a coin flip, not to a safe date.
    const result = simulateTimeline(input);
    expect(result.deterministicTotal).toBeLessThan(result.p95);
    expect(result.p95 - result.deterministicTotal).toBeGreaterThan(10);
  });

  it('builds a histogram covering every iteration', () => {
    const result = simulateTimeline(input);
    const counted = result.histogram.reduce((total, bin) => total + bin.count, 0);
    expect(counted).toBe(input.iterations);
    expect(result.histogram.every((bin) => bin.end > bin.start)).toBe(true);
    const totalDensity = result.histogram.reduce((t, bin) => t + bin.density, 0);
    expect(totalDensity).toBeCloseTo(1, 10);
  });

  it('summarises every phase', () => {
    const result = simulateTimeline(input);
    expect(result.phases).toHaveLength(DEFAULT_PHASES.length);
    expect(result.phases.map((p) => p.id)).toEqual(DEFAULT_PHASES.map((p) => p.id));
  });

  it('all-Poisson reproduces the notebook’s much tighter spread', () => {
    // The notebook's own configuration: four Poisson phases at 14/14/28/14,
    // total lambda 70, SD sqrt(70) = 8.4 days. Compare against the defaults,
    // which carry realistic per-phase spread.
    const poissonPhases = [14, 14, 28, 14].map((m, i) =>
      phase({ id: `p${i}`, distribution: 'poisson', mean: m }),
    );
    const notebook = simulateTimeline({
      phases: poissonPhases,
      iterations: 20000,
      seed: 5,
    });
    expect(notebook.mean).toBeCloseTo(70, 0);
    expect(notebook.sd).toBeCloseTo(Math.sqrt(70), 0);

    const realistic = simulateTimeline(input);
    expect(realistic.sd).toBeGreaterThan(notebook.sd * 2);
  });
});
