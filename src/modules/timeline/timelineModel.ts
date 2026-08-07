/**
 * Module 4 — study timeline Monte Carlo.
 *
 * Simulate total study duration by sampling each phase and summing.
 *
 * THE IMPROVEMENT OVER THE SOURCE NOTEBOOK. The notebook models every phase as
 * Poisson, which forces variance = mean. A 28-day IRB review therefore gets an
 * SD of sqrt(28) = 5.3 days — implying about 95% of reviews land between 18 and
 * 39 days. Nobody who has submitted to an IRB believes that. Poisson is a model
 * of counts of independent events, not of a duration governed by a committee's
 * calendar, and using it here quietly encodes a confidence nobody has.
 *
 * So the distribution is a per-phase choice. Poisson stays available for
 * comparison, and the alternatives let each phase carry a spread that matches
 * how it actually behaves: gamma and lognormal for right-skewed waits with a
 * long tail, PERT for the three-point estimate planners already think in.
 */

import {
  createRng,
  mean as arrayMean,
  quantiles,
  sampleGamma,
  sampleLognormal,
  samplePert,
  samplePoisson,
  standardDeviation,
  type Rng,
} from '../../stats/random.ts';

export type PhaseDistribution = 'poisson' | 'gamma' | 'lognormal' | 'pert' | 'fixed';

export interface Phase {
  id: string;
  name: string;
  distribution: PhaseDistribution;
  /** Expected duration in days. Used by poisson, gamma, lognormal and fixed. */
  mean: number;
  /** Spread in days. Used by gamma and lognormal. */
  sd: number;
  /** Three-point estimate, used by PERT. */
  min: number;
  mode: number;
  max: number;
  /** Weight on the mode for PERT. 4 is the convention; lower widens. */
  lambda: number;
}

export interface TimelineInput {
  phases: Phase[];
  iterations: number;
  seed: number;
}

export interface PhaseSummary {
  id: string;
  name: string;
  mean: number;
  sd: number;
  p5: number;
  p50: number;
  p95: number;
}

export interface HistogramBin {
  /** Bin centre, in days. */
  day: number;
  start: number;
  end: number;
  count: number;
  /** Share of all iterations, 0-1. */
  density: number;
}

export interface TimelineResult {
  iterations: number;
  mean: number;
  sd: number;
  p5: number;
  p50: number;
  p80: number;
  p95: number;
  min: number;
  max: number;
  histogram: HistogramBin[];
  phases: PhaseSummary[];
  /** Total duration if every phase ran exactly to its expected value. */
  deterministicTotal: number;
}

export const DEFAULT_PHASES: Phase[] = [
  makePhase('ethics', 'Ethics / IRB review', 'lognormal', 28, 14),
  makePhase('recruitment', 'Participant recruitment', 'gamma', 30, 15),
  makePhase('collection', 'Data collection', 'gamma', 28, 10),
  makePhase('analysis', 'Analysis & reporting', 'pert', 14, 6),
];

function makePhase(
  id: string,
  name: string,
  distribution: PhaseDistribution,
  mean: number,
  sd: number,
): Phase {
  return {
    id,
    name,
    distribution,
    mean,
    sd,
    // Three-point defaults derived from mean and sd so switching a phase to
    // PERT does not dump the user into meaningless numbers.
    min: Math.max(0, Math.round(mean - 1.5 * sd)),
    mode: mean,
    max: Math.round(mean + 3 * sd),
    lambda: 4,
  };
}

/** Draw one duration for a phase. Never negative — a phase cannot run backwards. */
export function samplePhase(rng: Rng, phase: Phase): number {
  switch (phase.distribution) {
    case 'fixed':
      return Math.max(0, phase.mean);

    case 'poisson':
      // Variance is locked to the mean here; that is the point of offering the
      // alternatives, not a limitation to work around.
      return samplePoisson(rng, phase.mean);

    case 'gamma': {
      if (!(phase.sd > 0)) return Math.max(0, phase.mean);
      // Method of moments: shape = (mean/sd)^2, scale = sd^2/mean.
      const shape = (phase.mean / phase.sd) ** 2;
      const scale = (phase.sd * phase.sd) / phase.mean;
      return sampleGamma(rng, shape, scale);
    }

    case 'lognormal':
      return sampleLognormal(rng, phase.mean, phase.sd);

    case 'pert':
      return samplePert(rng, phase.min, phase.mode, phase.max, phase.lambda);

    default:
      return Number.NaN;
  }
}

/** Expected duration of a phase under its own parameterisation. */
export function phaseExpectedValue(phase: Phase): number {
  if (phase.distribution === 'pert') {
    return (phase.min + phase.lambda * phase.mode + phase.max) / (phase.lambda + 2);
  }
  return phase.mean;
}

function buildHistogram(totals: number[], binCount = 48): HistogramBin[] {
  if (totals.length === 0) return [];
  let min = Infinity;
  let max = -Infinity;
  for (const value of totals) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (!(max > min)) return [];

  const width = (max - min) / binCount;
  const counts = new Array<number>(binCount).fill(0);
  for (const value of totals) {
    // The final bin is closed on the right, so the maximum lands inside it
    // rather than falling off the end of the array.
    const index = Math.min(binCount - 1, Math.floor((value - min) / width));
    counts[index]! += 1;
  }

  return counts.map((count, index) => {
    const start = min + index * width;
    const end = start + width;
    return {
      day: (start + end) / 2,
      start,
      end,
      count,
      density: count / totals.length,
    };
  });
}

/**
 * Run the simulation.
 *
 * Kept as a plain function with no DOM or worker dependency, so it can be
 * called directly in tests and from inside a Web Worker without a second
 * implementation.
 */
export function simulateTimeline(input: TimelineInput): TimelineResult {
  const { phases, iterations, seed } = input;
  const rng = createRng(seed);

  const totals = new Array<number>(iterations);
  // One column of draws per phase, so each phase's own distribution can be
  // summarised alongside the total.
  const perPhase = phases.map(() => new Array<number>(iterations));

  for (let i = 0; i < iterations; i += 1) {
    let total = 0;
    for (let p = 0; p < phases.length; p += 1) {
      const value = samplePhase(rng, phases[p]!);
      perPhase[p]![i] = value;
      total += value;
    }
    totals[i] = total;
  }

  const [p5, p50, p80, p95] = quantiles(totals, [0.05, 0.5, 0.8, 0.95]);

  return {
    iterations,
    mean: arrayMean(totals),
    sd: standardDeviation(totals),
    p5: p5!,
    p50: p50!,
    p80: p80!,
    p95: p95!,
    min: Math.min(...totals),
    max: Math.max(...totals),
    histogram: buildHistogram(totals),
    deterministicTotal: phases.reduce(
      (sum, phase) => sum + phaseExpectedValue(phase),
      0,
    ),
    phases: phases.map((phase, index) => {
      const column = perPhase[index]!;
      const [q5, q50, q95] = quantiles(column, [0.05, 0.5, 0.95]);
      return {
        id: phase.id,
        name: phase.name,
        mean: arrayMean(column),
        sd: standardDeviation(column),
        p5: q5!,
        p50: q50!,
        p95: q95!,
      };
    }),
  };
}

export const DISTRIBUTION_LABELS: Record<PhaseDistribution, string> = {
  poisson: 'Poisson (variance = mean)',
  gamma: 'Gamma (mean + SD)',
  lognormal: 'Lognormal (mean + SD)',
  pert: 'PERT (three-point)',
  fixed: 'Fixed (no uncertainty)',
};

export const DISTRIBUTION_NOTES: Record<PhaseDistribution, string> = {
  poisson:
    'Forces variance to equal the mean — a 28-day phase gets an SD of only 5.3 days. Included for comparison with the source notebook, rarely the right choice for a duration.',
  gamma:
    'Right-skewed, strictly positive, and takes an SD you choose. A good default for a wait with a long tail.',
  lognormal:
    'Right-skewed with a heavier tail than gamma. Suits phases where the bad case is very bad — IRB resubmission, say.',
  pert: 'The three-point estimate planners already think in: optimistic, most likely, pessimistic.',
  fixed: 'No uncertainty at all. Useful for a contractually fixed window.',
};
