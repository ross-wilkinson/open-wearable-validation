/**
 * Validation Academy Mathematical Engine.
 *
 * Implements exact formulas and estimators across the 8-module Meridian Biosystems
 * product lifecycle curriculum:
 * - Module 1: Permutation null, standard error inflation, and Winner's Curse
 * - Module 2: Paired variance reduction and sample size dividend
 * - Module 3: Clustered repeated measures variance partitioning & VIF
 * - Module 4: Dual-Scale Monk (MST 1–10) to Fitzpatrick (I–VI) bridge & quota solver
 * - Module 5: Cadence Lock Provocation Protocol & IMU temporal resolution bounds
 * - Module 6: Exact Clopper-Pearson one-sided binomial upper bounds for zero events & Rule of Three
 * - Module 7: Two-Gate 4-Quadrant commercial launch decision engine
 * - Module 8: Transitive Predecessor Bridge contrast propagation & drift canary
 */

// ============================================================================
// Module 1: Winner's Curse & Rapid Prototyping
// ============================================================================

export interface WinnerCurseMetrics {
  seDiff: number;
  snr: number;
  winnerCurseProbability: number;
  catastrophicEliminationPower: number;
}

export function computeWinnerCurseMetrics(
  n: number,
  noiseSd: number,
  subtleDifference: number = 0.3,
  catastrophicThreshold: number = 5.0,
): WinnerCurseMetrics {
  const safeN = Number.isFinite(n) ? Math.max(Math.round(n), 2) : 5;
  const safeNoise = Number.isFinite(noiseSd) ? Math.max(noiseSd, 0.1) : 3.0;
  const safeSubtle = Number.isFinite(subtleDifference) ? Math.max(subtleDifference, 0.01) : 0.3;
  const safeThreshold = Number.isFinite(catastrophicThreshold) ? Math.max(catastrophicThreshold, 1.0) : 5.0;

  const seDiff = Math.sqrt((safeNoise ** 2) / safeN + (safeNoise ** 2) / safeN);
  const snr = safeSubtle / seDiff;

  // Probability that noise inverts ranking among 5 close candidates
  // At N=5 and noise=3, SE ~ 1.9 bpm. Signal ~ 0.3 bpm -> ~75% chance of picking lucky noise
  const z = safeSubtle / seDiff;
  // Approximation of winner curse rate in a 5-way contest
  const singlePairInversionProb = 0.5 * (1 - Math.min(Math.max(z / 2, 0), 0.95));
  const winnerCurseProbability = Math.min(Math.max(1 - (1 - singlePairInversionProb) ** 4, 0.1), 0.85);

  // Power to eliminate catastrophic candidate (true diff >= 5 bpm)
  const zElim = (safeThreshold - 2.0) / (safeNoise / Math.sqrt(safeN));
  // Cumulative standard normal approx
  const catastrophicEliminationPower = Math.min(
    Math.max(1 - 0.5 * Math.exp(-0.717 * zElim - 0.416 * (zElim ** 2)), 0.5),
    0.999,
  );

  return {
    seDiff,
    snr,
    winnerCurseProbability: winnerCurseProbability * 100,
    catastrophicEliminationPower: catastrophicEliminationPower * 100,
  };
}

// ============================================================================
// Module 2: Paired Correlation Dividend
// ============================================================================

export interface PairedDividendMetrics {
  rho: number;
  varianceReductionPct: number;
  independentSampleSize: number;
  pairedSampleSize: number;
  independentCost: number;
  pairedCost: number;
  costSaved: number;
  costSavedPct: number;
}

export function computePairedDividend(
  independentN: number = 190,
  rho: number = 0.95,
  costPerSubject: number = 1300,
): PairedDividendMetrics {
  const safeIndN = Number.isFinite(independentN) ? Math.max(Math.round(independentN), 10) : 190;
  const safeCost = Number.isFinite(costPerSubject) ? Math.max(costPerSubject, 1) : 1300;
  const clampedRho = Number.isFinite(rho) ? Math.min(Math.max(rho, 0), 0.99) : 0.95;

  // Var(pair) = 2*sigma^2*(1 - rho) compared to 2*sigma^2
  const varianceReductionPct = clampedRho * 100;
  // Sizing scales with variance
  const pairedN = Math.max(Math.ceil(safeIndN * (1 - clampedRho)), 8);
  const independentCost = safeIndN * safeCost;
  const pairedCost = pairedN * safeCost;
  const costSaved = independentCost - pairedCost;
  const costSavedPct = independentCost > 0 ? (costSaved / independentCost) * 100 : 0;

  return {
    rho: clampedRho,
    varianceReductionPct,
    independentSampleSize: safeIndN,
    pairedSampleSize: pairedN,
    independentCost,
    pairedCost,
    costSaved,
    costSavedPct,
  };
}

// ============================================================================
// Module 3: Clustered Repeated Measures & Pseudoreplication
// ============================================================================

export interface ClusteredMetrics {
  totalRows: number;
  vif: number;
  effectiveN: number;
  betweenVariancePct: number;
  withinVariancePct: number;
  naiveSe: number;
  trueSe: number;
  uncertaintyUnderstatementPct: number;
}

export function computeClusteredEffectiveN(
  participants: number = 25,
  replicatesPerParticipant: number = 2700,
  icc: number = 0.85,
  totalSd: number = 4.0,
): ClusteredMetrics {
  const n = Number.isFinite(participants) ? Math.max(Math.round(participants), 1) : 25;
  const m = Number.isFinite(replicatesPerParticipant) ? Math.max(Math.round(replicatesPerParticipant), 1) : 2700;
  const clampedIcc = Number.isFinite(icc) ? Math.min(Math.max(icc, 0), 0.999) : 0.85;
  const safeSd = Number.isFinite(totalSd) ? Math.max(totalSd, 0.01) : 4.0;
  const totalRows = n * m;

  // Design effect (VIF) = 1 + (m - 1) * ICC
  const vif = 1 + (m - 1) * clampedIcc;
  // Effective sample size
  const effectiveN = Math.max(totalRows / vif, 1);

  const naiveSe = safeSd / Math.sqrt(totalRows);
  const trueSe = naiveSe * Math.sqrt(vif);
  const uncertaintyUnderstatementPct = trueSe > 0 ? ((trueSe - naiveSe) / trueSe) * 100 : 0;

  return {
    totalRows,
    vif,
    effectiveN,
    betweenVariancePct: clampedIcc * 100,
    withinVariancePct: (1 - clampedIcc) * 100,
    naiveSe,
    trueSe,
    uncertaintyUnderstatementPct,
  };
}

// ============================================================================
// Module 4: Dual-Scale Monk (MST 1–10) vs Fitzpatrick (I–VI) Bridge
// ============================================================================

export interface FitzpatrickBucket {
  fitzpatrickType: string;
  romanNumeral: string;
  monkEquivalent: string;
  melaninClassification: string;
  count: number;
  percentage: number;
}

export interface DemographicBridgeResult {
  totalEnrolled: number;
  monkCounts: number[];
  fitzpatrickBuckets: FitzpatrickBucket[];
  darkSkinPercentage: number; // Fitzpatrick V–VI
  satisfiesFda15PctRule: boolean;
  minDarkSkinRequired: number;
}

export function mapMonkToFitzpatrick(
  monkCounts: number[], // Array of 10 numbers for MST 01 through MST 10
): DemographicBridgeResult {
  const safeCounts = Array.from({ length: 10 }, (_, i) => {
    const val = monkCounts?.[i];
    return Number.isFinite(val) ? Math.max(Math.round(val!), 0) : 0;
  });
  const totalEnrolled = safeCounts.reduce((acc, c) => acc + c, 0);
  const safeTotal = Math.max(totalEnrolled, 1);

  // Monk to Fitzpatrick standard mapping
  // MST 01-02 -> Fitzpatrick I-II (Pale / Fair)
  // MST 03-04 -> Fitzpatrick II-III (Light / Fair)
  // MST 05-06 -> Fitzpatrick III-IV (Medium / Olive)
  // MST 07-08 -> Fitzpatrick IV-V (Brown / Tan)
  // MST 09-10 -> Fitzpatrick V-VI (Dark / Deep Melanin)
  const countI_II = safeCounts[0]! + safeCounts[1]!;
  const countII_III = safeCounts[2]! + safeCounts[3]!;
  const countIII_IV = safeCounts[4]! + safeCounts[5]!;
  const countIV_V = safeCounts[6]! + safeCounts[7]!;
  const countV_VI = safeCounts[8]! + safeCounts[9]!;

  const fitzpatrickBuckets: FitzpatrickBucket[] = [
    {
      fitzpatrickType: 'Type I / II',
      romanNumeral: 'I–II',
      monkEquivalent: 'MST 01–02',
      melaninClassification: 'Very Light / Porcelain',
      count: countI_II,
      percentage: (countI_II / safeTotal) * 100,
    },
    {
      fitzpatrickType: 'Type II / III',
      romanNumeral: 'II–III',
      monkEquivalent: 'MST 03–04',
      melaninClassification: 'Light / Fair',
      count: countII_III,
      percentage: (countII_III / safeTotal) * 100,
    },
    {
      fitzpatrickType: 'Type III / IV',
      romanNumeral: 'III–IV',
      monkEquivalent: 'MST 05–06',
      melaninClassification: 'Medium / Olive',
      count: countIII_IV,
      percentage: (countIII_IV / safeTotal) * 100,
    },
    {
      fitzpatrickType: 'Type IV / V',
      romanNumeral: 'IV–V',
      monkEquivalent: 'MST 07–08',
      melaninClassification: 'Tan / Darker Olive',
      count: countIV_V,
      percentage: (countIV_V / safeTotal) * 100,
    },
    {
      fitzpatrickType: 'Type V / VI',
      romanNumeral: 'V–VI',
      monkEquivalent: 'MST 09–10',
      melaninClassification: 'Dark / Deep Brown Melanin',
      count: countV_VI,
      percentage: (countV_VI / safeTotal) * 100,
    },
  ];

  const darkSkinPercentage = totalEnrolled > 0 ? (countV_VI / safeTotal) * 100 : 0;
  // ISO 80601-2-61 requires >= 15% and at least 2 dark skin participants
  const minDarkSkinRequired = Math.max(Math.ceil(totalEnrolled * 0.15), 2);
  const satisfiesFda15PctRule = totalEnrolled >= 10 && countV_VI >= minDarkSkinRequired;

  return {
    totalEnrolled,
    monkCounts: safeCounts,
    fitzpatrickBuckets,
    darkSkinPercentage,
    satisfiesFda15PctRule,
    minDarkSkinRequired,
  };
}

// ============================================================================
// Module 5: Cadence Lock Provocation Protocol & IMU Nyquist Limit
// ============================================================================

export interface CadenceLockSample {
  timeSec: number;
  cadenceSpm: number;
  refHeartRateBpm: number;
  ppgHeartRateBpm: number;
  isLocked: boolean;
}

export interface CadenceLockMetrics {
  totalDurationSec: number;
  lockedDurationSec: number;
  harmonicContaminationIndex: number; // HCI %
  maxDiscrepancyBpm: number;
  imuSamplingRateHz: number;
  imuPeriodMs: number;
  groundContactTimeMs: number;
  gctTemporalResolutionErrorPct: number;
  imuResolutionVerdict: 'SUFFICIENT' | 'INSUFFICIENT';
}

export function generateCadenceLockSimulation(
  treadmillSpeedRampMinutes: number = 10,
  lockSeverity: 'none' | 'moderate' | 'severe' = 'severe',
  imuSamplingRateHz: number = 25,
): { samples: CadenceLockSample[]; metrics: CadenceLockMetrics } {
  const safeMinutes = Number.isFinite(treadmillSpeedRampMinutes)
    ? Math.max(treadmillSpeedRampMinutes, 1)
    : 10;
  const safeHz = Number.isFinite(imuSamplingRateHz) ? Math.max(imuSamplingRateHz, 1) : 25;
  const totalDurationSec = safeMinutes * 60;
  const samples: CadenceLockSample[] = [];
  let lockedDurationSec = 0;
  let maxDiscrepancy = 0;

  // Running Cadence sits around 165 - 175 spm
  // Subject Heart Rate ramps up from 130 bpm up to 185 bpm
  // Harmonic collision occurs between minutes 4 and 7 (time 240s to 420s)
  const stepSec = 10;
  for (let t = 0; t <= totalDurationSec; t += stepSec) {
    const progress = t / totalDurationSec;
    // Reference heart rate steadily climbs
    const refHr = 130 + progress * 55; // 130 to 185 bpm
    // Cadence stays around 170 spm with subtle stride frequency modulation
    const cadence = 168 + Math.sin(t / 40) * 3;

    // Deterministic pseudo-noise to avoid random jitter on renders
    const detNoise = Math.sin(t * 1.7) * 0.75;

    // Device behavior based on lock severity
    let ppgHr = refHr;
    const hrCadenceDist = Math.abs(refHr - cadence);

    let isLocked = false;
    if (lockSeverity === 'severe' && hrCadenceDist < 12) {
      // Locks onto cadence
      ppgHr = cadence + detNoise;
      if (Math.abs(ppgHr - cadence) <= 3 && Math.abs(refHr - cadence) > 5) {
        isLocked = true;
        lockedDurationSec += stepSec;
      }
    } else if (lockSeverity === 'moderate' && hrCadenceDist < 6) {
      ppgHr = 0.5 * refHr + 0.5 * cadence + detNoise * 0.5;
      if (Math.abs(ppgHr - cadence) <= 3 && Math.abs(refHr - cadence) > 5) {
        isLocked = true;
        lockedDurationSec += stepSec;
      }
    } else {
      ppgHr = refHr + Math.sin(t * 1.3) * 0.8;
    }

    const discrepancy = Math.abs(ppgHr - refHr);
    if (discrepancy > maxDiscrepancy) {
      maxDiscrepancy = discrepancy;
    }

    samples.push({
      timeSec: t,
      cadenceSpm: Number(cadence.toFixed(1)),
      refHeartRateBpm: Number(refHr.toFixed(1)),
      ppgHeartRateBpm: Number(ppgHr.toFixed(1)),
      isLocked,
    });
  }

  const hci = totalDurationSec > 0 ? (lockedDurationSec / totalDurationSec) * 100 : 0;
  const imuPeriodMs = 1000 / safeHz;
  const groundContactTimeMs = 220; // typical sprint/fast run GCT
  const gctTemporalResolutionErrorPct = (imuPeriodMs / groundContactTimeMs) * 100;
  const imuResolutionVerdict = safeHz >= 100 ? 'SUFFICIENT' : 'INSUFFICIENT';

  return {
    samples,
    metrics: {
      totalDurationSec,
      lockedDurationSec,
      harmonicContaminationIndex: Number(hci.toFixed(1)),
      maxDiscrepancyBpm: Number(maxDiscrepancy.toFixed(1)),
      imuSamplingRateHz: safeHz,
      imuPeriodMs: Number(imuPeriodMs.toFixed(1)),
      groundContactTimeMs,
      gctTemporalResolutionErrorPct: Number(gctTemporalResolutionErrorPct.toFixed(1)),
      imuResolutionVerdict,
    },
  };
}

// ============================================================================
// Module 6: Aggressor Noise & Zero-Event Rare Event Bounds (Clopper-Pearson)
// ============================================================================

export interface RareEventMetrics {
  trials: number;
  observedEvents: number;
  confidence: number;
  exactUpperBoundPct: number;
  ruleOfThreeUpperBoundPct: number;
  annualPopulationFalseAlarms: number;
}

export function computeClopperPearsonZeroEventBound(
  trials: number = 1000,
  confidence: number = 0.95,
  populationSize: number = 1000000,
  windowsPerUserPerYear: number = 10000,
): RareEventMetrics {
  const n = Number.isFinite(trials) ? Math.max(Math.round(trials), 10) : 1000;
  const safeConf = Number.isFinite(confidence) ? Math.min(Math.max(confidence, 0.5), 0.999) : 0.95;
  const safePop = Number.isFinite(populationSize) ? Math.max(populationSize, 100) : 1000000;
  const safeWindows = Number.isFinite(windowsPerUserPerYear) ? Math.max(windowsPerUserPerYear, 10) : 10000;

  const alpha = 1 - safeConf;

  // Exact one-sided Clopper-Pearson bound when k = 0: (1 - p)^n = alpha => p = 1 - alpha^(1/n)
  const exactUpperBound = 1 - Math.pow(alpha, 1 / n);
  // Rule of Three approximation: p ~ -ln(alpha) / n ~ 3 / n
  const ruleOfThree = -Math.log(alpha) / n;

  // Annual false alarms across user population
  const totalAnnualWindows = safePop * safeWindows;
  const annualPopulationFalseAlarms = Math.round(totalAnnualWindows * exactUpperBound);

  return {
    trials: n,
    observedEvents: 0,
    confidence: safeConf * 100,
    exactUpperBoundPct: exactUpperBound * 100,
    ruleOfThreeUpperBoundPct: ruleOfThree * 100,
    annualPopulationFalseAlarms,
  };
}

// ============================================================================
// Module 7: Two-Gate 4-Quadrant Commercial Launch Engine
// ============================================================================

export type LaunchVerdict =
  | 'GREEN_LIGHT'
  | 'AMBER_PARITY_RISK'
  | 'AMBER_QUALITY_DEBT'
  | 'RED_LIGHT';

export interface TwoGateMetrics {
  gate1Observed: number; // e.g. RMSE vs ECG reference (lower is better)
  gate1Threshold: number; // e.g. 3.0 bpm
  gate1Pass: boolean;
  gate2Observed: number; // e.g. Difference vs Predecessor (lower is better)
  gate2Threshold: number; // e.g. 1.5 bpm
  gate2Pass: boolean;
  verdict: LaunchVerdict;
  verdictTitle: string;
  verdictRecommendation: string;
}

export function evaluateTwoGateLaunchEngine(
  gate1Observed: number,
  gate1Threshold: number = 3.0,
  gate2Observed: number = 0.8,
  gate2Threshold: number = 1.5,
): TwoGateMetrics {
  const safeG1Obs = Number.isFinite(gate1Observed) ? Math.max(gate1Observed, 0) : 999;
  const safeG1Thresh = Number.isFinite(gate1Threshold) ? Math.max(gate1Threshold, 0.1) : 3.0;
  const safeG2Obs = Number.isFinite(gate2Observed) ? Math.max(gate2Observed, 0) : 999;
  const safeG2Thresh = Number.isFinite(gate2Threshold) ? Math.max(gate2Threshold, 0.1) : 1.5;

  const gate1Pass = safeG1Obs <= safeG1Thresh;
  const gate2Pass = safeG2Obs <= safeG2Thresh;

  let verdict: LaunchVerdict = 'RED_LIGHT';
  let verdictTitle = 'RED LIGHT: Unacceptable Commercial Risk';
  let verdictRecommendation =
    'Block production firmware. Both clinical accuracy and predecessor parity thresholds failed.';

  if (gate1Pass && gate2Pass) {
    verdict = 'GREEN_LIGHT';
    verdictTitle = 'GREEN LIGHT: Commercial Launch Approved';
    verdictRecommendation =
      'Executive committee approval granted. Meets rigorous absolute clinical standard and proves parity/superiority over predecessor.';
  } else if (gate1Pass && !gate2Pass) {
    verdict = 'AMBER_PARITY_RISK';
    verdictTitle = 'AMBER: Predecessor Parity Risk';
    verdictRecommendation =
      'Device meets clinical tolerance but exhibits regression against PulseBand 1. Risk of high return rates and customer backlash.';
  } else if (!gate1Pass && gate2Pass) {
    verdict = 'AMBER_QUALITY_DEBT';
    verdictTitle = 'AMBER: Inherited Quality Debt';
    verdictRecommendation =
      'Device matches predecessor performance, but both fall short of the required clinical gold standard tolerance.';
  }

  return {
    gate1Observed: safeG1Obs,
    gate1Threshold: safeG1Thresh,
    gate1Pass,
    gate2Observed: safeG2Obs,
    gate2Threshold: safeG2Thresh,
    gate2Pass,
    verdict,
    verdictTitle,
    verdictRecommendation,
  };
}

// ============================================================================
// Module 8: Transitive Predecessor Bridge & Drift Canary
// ============================================================================

export interface TransitiveBridgeResult {
  delta32: number;
  se32: number;
  delta21: number;
  se21: number;
  transitiveDelta: number; // Delta_3_1 = Delta_3_2 + Delta_2_1
  transitiveSe: number; // sqrt(se32^2 + se21^2)
  ciLower: number;
  ciUpper: number;
  nonInferiorityMargin: number;
  isNonInferior: boolean;
  driftCanaryAlert: boolean;
  driftWarningMessage?: string;
}

export function computeTransitiveBridge(
  delta32: number, // PulseBand 3 vs PulseBand 2 difference (bpm)
  se32: number,
  delta21: number, // PulseBand 2 vs PulseBand 1 difference (bpm)
  se21: number,
  nonInferiorityMargin: number = 1.5,
  baselineRefShift: number = 0, // Drift in ECG reference standard mean across years
): TransitiveBridgeResult {
  const safeD32 = Number.isFinite(delta32) ? delta32 : 0;
  const safeSe32 = Number.isFinite(se32) ? Math.max(se32, 0.01) : 0.35;
  const safeD21 = Number.isFinite(delta21) ? delta21 : 0;
  const safeSe21 = Number.isFinite(se21) ? Math.max(se21, 0.01) : 0.35;
  const safeMargin = Number.isFinite(nonInferiorityMargin) ? Math.max(nonInferiorityMargin, 0.1) : 1.5;
  const safeShift = Number.isFinite(baselineRefShift) ? baselineRefShift : 0;

  // Transitive contrast estimation: Delta_3_1 = Delta_3_2 + Delta_2_1
  const transitiveDelta = safeD32 + safeD21;
  // Variance propagation across independent cohorts
  const transitiveSe = Math.sqrt(safeSe32 ** 2 + safeSe21 ** 2);
  const ciLower = transitiveDelta - 1.96 * transitiveSe;
  const ciUpper = transitiveDelta + 1.96 * transitiveSe;

  const isNonInferior = ciUpper <= safeMargin;
  const driftCanaryAlert = Math.abs(safeShift) >= 1.0 || ciUpper > safeMargin;

  const messages: string[] = [];
  if (Math.abs(safeShift) >= 1.0) {
    messages.push(`Canary Warning: Reference standard baseline shifted by ${safeShift.toFixed(1)} bpm between study years. Longitudinal comparison may be biased!`);
  }
  if (ciUpper > safeMargin) {
    messages.push(`Silent Quality Drift Detected: PulseBand 3 meets parity with PulseBand 2, but the transitive bridge reveals a cumulative regression of +${transitiveDelta.toFixed(2)} bpm vs PulseBand 1!`);
  }
  const driftWarningMessage = messages.length > 0 ? messages.join(' ') : undefined;

  return {
    delta32,
    se32,
    delta21,
    se21,
    transitiveDelta,
    transitiveSe,
    ciLower,
    ciUpper,
    nonInferiorityMargin,
    isNonInferior,
    driftCanaryAlert,
    driftWarningMessage,
  };
}
