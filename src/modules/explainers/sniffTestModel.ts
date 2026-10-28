/**
 * The Sniff Test Trap: Winner's Curse and Catastrophic Elimination in Rapid Prototyping.
 *
 * Founded on ADR-003 and Wearable Feature Validation Benchmark Suite:
 *
 * Hardware and algorithm teams routinely run rapid N=5 "sniff tests" (e.g. testing 5 candidate
 * optical sensor geometries or filter tunings on 5 colleagues).
 *
 * Two mathematical realities emerge:
 * 1. SELECTION TRAP (The Winner's Curse):
 *    Between-subject and motion noise (sigma ~ 3.0 bpm) dwarfs the subtle true difference
 *    between viable prototypes (Delta ~ 0.3-0.6 bpm). With N=5, standard error is sigma / sqrt(5) ~= 1.34 bpm.
 *    The prototype that wins an N=5 screen is usually just the one that got lucky noise.
 *    In repeated simulations, the apparent winner is the true best prototype only ~30-35% of the time!
 * 2. ELIMINATION POWER:
 *    However, if a prototype has a fatal flaw (e.g. poor optical skin contact or severe motion
 *    sensitivity causing true error ~ 8-10 bpm), N=5 provides >99% statistical power to detect
 *    and eliminate it.
 *
 * Heuristic Rule (ADR-003):
 * "Elimination, Not Selection: Use N=5 rapid screens strictly to discard catastrophic losers,
 * NEVER to crown a single winner."
 */

import { createRng, sampleNormal } from '../../stats/random.ts';
import * as studentT from '../../stats/studentT.ts';

export interface PrototypeCandidate {
  id: string;
  name: string;
  trueMeanError: number;
  isFlawed?: boolean;
  description: string;
}

export const DEFAULT_SNIFF_PROTOTYPES: PrototypeCandidate[] = [
  {
    id: 'proto-a',
    name: 'Prototype A (True Best)',
    trueMeanError: 2.0,
    description: 'Gold-standard lens geometry; true lowest error (2.0 bpm).',
  },
  {
    id: 'proto-b',
    name: 'Prototype B (Viable Contender)',
    trueMeanError: 2.3,
    description: 'Alternative bevel angle; true error 2.3 bpm (only 0.3 bpm worse).',
  },
  {
    id: 'proto-c',
    name: 'Prototype C (Viable Contender)',
    trueMeanError: 2.6,
    description: 'Thinner cover glass; true error 2.6 bpm.',
  },
  {
    id: 'proto-d',
    name: 'Prototype D (Mediocre)',
    trueMeanError: 3.2,
    description: 'Lower LED power setting; true error 3.2 bpm.',
  },
  {
    id: 'proto-e',
    name: 'Prototype E (Catastrophic Flaw)',
    trueMeanError: 8.5,
    isFlawed: true,
    description: 'Poor optical seal susceptible to motion decoupling; true error 8.5 bpm.',
  },
];

export interface PrototypeSimulationStat {
  id: string;
  name: string;
  trueMean: number;
  sampleMean: number;
  ciLower: number;
  ciUpper: number;
  isFlawed: boolean;
  winCount: number;
  winRate: number;
  eliminatedCount: number;
  eliminationRate: number;
}

export interface SniffTestSimulationResult {
  sampleSize: number;
  noiseSd: number;
  iterations: number;
  winnerCurseRate: number; // % of times the observed winner was NOT Prototype A
  trueWinnerWinRate: number; // % of times Prototype A won
  flawedEliminationRate: number; // % of times Prototype E was eliminated (error > eliminationThreshold)
  expectedWinnerOverOptimism: number; // Observed winner mean error minus true mean error
  eliminationThreshold: number;
  prototypes: PrototypeSimulationStat[];
}

/**
 * Simulates rapid prototyping screening across candidates to measure Winner's Curse and Elimination Power.
 */
export function simulateSniffTest(
  prototypes: PrototypeCandidate[] = DEFAULT_SNIFF_PROTOTYPES,
  sampleSize = 5,
  noiseSd = 3.0,
  iterations = 3000,
  seed = 42,
  eliminationThreshold = 5.0,
): SniffTestSimulationResult {
  const safeN = Math.max(3, Math.round(sampleSize));
  const safeSd = Math.max(0.5, noiseSd);
  const rng = createRng(seed);

  const k = prototypes.length;
  const winCounts = new Array<number>(k).fill(0);
  const eliminatedCounts = new Array<number>(k).fill(0);
  const sampleMeanSums = new Array<number>(k).fill(0);
  let winnerTrueMeanSum = 0;
  let winnerObservedMeanSum = 0;

  for (let iter = 0; iter < iterations; iter++) {
    let bestObsMean = Infinity;
    let winnerIdx = -1;

    for (let p = 0; p < k; p++) {
      const proto = prototypes[p]!;
      let sum = 0;
      for (let i = 0; i < safeN; i++) {
        sum += proto.trueMeanError + safeSd * sampleNormal(rng);
      }
      const obsMean = sum / safeN;
      sampleMeanSums[p] = (sampleMeanSums[p] ?? 0) + obsMean;

      if (obsMean < bestObsMean) {
        bestObsMean = obsMean;
        winnerIdx = p;
      }

      if (obsMean > eliminationThreshold) {
        eliminatedCounts[p] = (eliminatedCounts[p] ?? 0) + 1;
      }
    }

    if (winnerIdx >= 0) {
      winCounts[winnerIdx] = (winCounts[winnerIdx] ?? 0) + 1;
      winnerTrueMeanSum += prototypes[winnerIdx]!.trueMeanError;
      winnerObservedMeanSum += bestObsMean;
    }
  }

  // Find true best prototype (lowest trueMeanError)
  let trueBestIdx = 0;
  for (let i = 1; i < k; i++) {
    if (prototypes[i]!.trueMeanError < prototypes[trueBestIdx]!.trueMeanError) {
      trueBestIdx = i;
    }
  }

  const trueWinnerWins = winCounts[trueBestIdx] ?? 0;
  const trueWinnerWinRate = (trueWinnerWins / iterations) * 100;
  const winnerCurseRate = 100 - trueWinnerWinRate;

  // Catastrophic flawed prototype index
  const flawedIdx = prototypes.findIndex((p) => p.isFlawed);
  const flawedEliminationRate =
    flawedIdx >= 0 ? ((eliminatedCounts[flawedIdx] ?? 0) / iterations) * 100 : 100;

  // Selection over-optimism bias: difference between true ability and observed estimate
  const avgWinnerObs = winnerObservedMeanSum / iterations;
  const avgWinnerTrue = winnerTrueMeanSum / iterations;
  const expectedWinnerOverOptimism = Math.max(0, avgWinnerTrue - avgWinnerObs);

  // Degrees of freedom for confidence intervals
  const tCrit = studentT.ppf(0.975, safeN - 1);
  const se = safeSd / Math.sqrt(safeN);

  const stats: PrototypeSimulationStat[] = prototypes.map((p, idx) => {
    const avgObs = sampleMeanSums[idx]! / iterations;
    const rawLower = avgObs - tCrit * se;
    const ciLower = avgObs >= 0 ? Math.max(0, rawLower) : rawLower;
    return {
      id: p.id,
      name: p.name,
      trueMean: p.trueMeanError,
      sampleMean: avgObs,
      ciLower,
      ciUpper: avgObs + tCrit * se,
      isFlawed: Boolean(p.isFlawed),
      winCount: winCounts[idx]!,
      winRate: (winCounts[idx]! / iterations) * 100,
      eliminatedCount: eliminatedCounts[idx]!,
      eliminationRate: ((eliminatedCounts[idx]! / iterations) * 100),
    };
  });

  return {
    sampleSize: safeN,
    noiseSd: safeSd,
    iterations,
    winnerCurseRate,
    trueWinnerWinRate,
    flawedEliminationRate,
    expectedWinnerOverOptimism,
    eliminationThreshold,
    prototypes: stats,
  };
}
