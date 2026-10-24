/**
 * Module: Within-subject designs & repeated measures.
 *
 * Most device, wearable, and algorithm validation studies collect repeated
 * paired measurements from each participant (e.g. exercise stages, saturation
 * plateaus in SpO2, sleep epochs, or multi-day glucose readings).
 *
 * Analysing those rows as independent is the single most common error in
 * published validation work: it ignores between-subject clustering and makes
 * confidence intervals dramatically too narrow (often understating uncertainty
 * by 2x to 4x).
 *
 * This module provides the mathematical and study-design tools to:
 *   1. Decompose total variance into between-subject and within-subject components.
 *   2. Compute the Intraclass Correlation (ICC) and Design Effect (clustering penalty).
 *   3. Calculate the Effective Sample Size (n_effective) — how many truly
 *      independent observations the study actually yields.
 *   4. Determine the precision (margin of error) for both bias and limits of
 *      agreement across combinations of m participants and k replicates.
 *   5. Demonstrate the diminishing returns of adding replicates vs recruiting
 *      more participants.
 *
 * Statistical foundations:
 *   - Bland JM, Altman DG. Measuring agreement in method comparison studies.
 *     Stat Methods Med Res. 1999;8(2):135-60.
 *   - Bland JM, Altman DG. Agreement between methods of measurement with multiple
 *     observations per individual. J Biopharm Stat. 2007;17(4):571-82.
 *   - Zou GY. Confidence interval estimation for limits of agreement using
 *     paired data. Stat Med. 2013;32(23):3985-4000.
 */

import * as studentT from '../../stats/studentT.ts';

export interface RepeatedMeasuresPreset {
  id: string;
  name: string;
  domain: string;
  description: string;
  defaultM: number;
  defaultK: number;
  defaultIcc: number;
  suggestedSdTotal?: number;
  unit?: string;
  referenceGuideline?: string;
}

export const REPEATED_MEASURES_PRESETS: RepeatedMeasuresPreset[] = [
  {
    id: 'spo2',
    name: 'Pulse Oximetry (SpO2)',
    domain: 'Clinical Hypoxia / Oximetry',
    description:
      'Controlled desaturation protocol (70%–100% SaO2) with paired blood draws against reference multi-wavelength CO-oximetry.',
    defaultM: 24,
    defaultK: 6,
    defaultIcc: 0.65,
    suggestedSdTotal: 2.5,
    unit: '%',
    referenceGuideline: 'ISO 80601-2-61 / FDA SpO2 Guidance (>= 200 paired points, >= 10 subjects)',
  },
  {
    id: 'heart-rate',
    name: 'Wearable Heart Rate',
    domain: 'Sports & Cardiovascular Wearables',
    description:
      'Cardiorespiratory exercise protocol with multiple activity stages (rest, walk, run, cycle) paired against reference 12-lead ECG.',
    defaultM: 35,
    defaultK: 8,
    defaultIcc: 0.55,
    suggestedSdTotal: 3.5,
    unit: 'bpm',
    referenceGuideline: 'Consumer Technology Association (CTA) / ANSI Standards',
  },
  {
    id: 'blood-pressure',
    name: 'Non-Invasive Blood Pressure',
    domain: 'Cuff & Optical Blood Pressure',
    description:
      'Triplicate paired measurements per participant across varied posture and pressure ranges compared against auscultatory mercury reference.',
    defaultM: 85,
    defaultK: 3,
    defaultIcc: 0.4,
    suggestedSdTotal: 5.0,
    unit: 'mmHg',
    referenceGuideline: 'ISO 81060-2 (>= 85 subjects, 3 paired observations each)',
  },
  {
    id: 'cgm',
    name: 'Continuous Glucose Monitoring (CGM)',
    domain: 'Metabolic & Diabetes Technology',
    description:
      'Multi-day outpatient wear with paired sensor values matched against laboratory venous reference (YSI 2300 STAT Plus).',
    defaultM: 30,
    defaultK: 12,
    defaultIcc: 0.7,
    suggestedSdTotal: 12.0,
    unit: 'mg/dL',
    referenceGuideline: 'CLSI POCT05 / FDA iCGM Special Controls',
  },
];

export interface VariancePartition {
  varBetween: number;
  varWithin: number;
  varTotal: number;
  sdBetween: number;
  sdWithin: number;
  sdTotal: number;
  icc: number;
  betweenSharePct: number;
  withinSharePct: number;
}

/**
 * Partition total variance from known between- and within-subject standard deviations.
 */
export function partitionFromSds(sdBetween: number, sdWithin: number): VariancePartition {
  const vb = Math.max(0, sdBetween) ** 2;
  const vw = Math.max(0, sdWithin) ** 2;
  const vt = vb + vw;
  const icc = vt > 0 ? vb / vt : 0;
  return {
    varBetween: vb,
    varWithin: vw,
    varTotal: vt,
    sdBetween: Math.sqrt(vb),
    sdWithin: Math.sqrt(vw),
    sdTotal: Math.sqrt(vt),
    icc,
    betweenSharePct: icc * 100,
    withinSharePct: (1 - icc) * 100,
  };
}

/**
 * Partition total variance given total SD and ICC (rho).
 */
export function partitionFromIcc(sdTotal: number, icc: number): VariancePartition {
  const clampedIcc = Math.max(0, Math.min(1, icc));
  const vt = Math.max(0, sdTotal) ** 2;
  const vb = vt * clampedIcc;
  const vw = vt * (1 - clampedIcc);
  return {
    varBetween: vb,
    varWithin: vw,
    varTotal: vt,
    sdBetween: Math.sqrt(vb),
    sdWithin: Math.sqrt(vw),
    sdTotal: Math.sqrt(vt),
    icc: clampedIcc,
    betweenSharePct: clampedIcc * 100,
    withinSharePct: (1 - clampedIcc) * 100,
  };
}

/**
 * Design Effect (DEFF / variance inflation factor due to clustering):
 *
 *     DEFF = 1 + (k - 1) * rho
 *
 * When k = 1 or rho = 0, DEFF = 1 (no clustering penalty).
 * As rho -> 1, DEFF -> k (complete clustering, all replicates from a subject
 * provide the information of a single subject).
 */
export function designEffect(k: number, icc: number): number {
  if (k < 1) return Number.NaN;
  const clampedIcc = Math.max(0, Math.min(1, icc));
  return 1 + (k - 1) * clampedIcc;
}

/**
 * Effective sample size (n_effective) for estimating the mean bias:
 *
 *     n_effective = (m * k) / [1 + (k - 1) * rho] = m / [rho + (1 - rho) / k]
 *
 * Represents the number of truly independent paired observations that would
 * provide the exact same precision on the mean bias.
 */
export function effectiveSampleSize(m: number, k: number, icc: number): number {
  if (m <= 0 || k < 1) return Number.NaN;
  const clampedIcc = Math.max(0, Math.min(1, icc));
  const deff = designEffect(k, clampedIcc);
  if (deff <= 0) return Number.NaN;
  return (m * k) / deff;
}

/**
 * The asymptotic upper bound on effective sample size as k -> infinity:
 *
 *     lim_{k -> inf} n_effective = m / rho
 *
 * Highlights the fundamental limit of repeated measures: once replicates are
 * plentiful, between-subject variance completely bounds precision.
 */
export function maxEffectiveSampleSize(m: number, icc: number): number {
  if (m <= 0) return Number.NaN;
  const clampedIcc = Math.max(0, Math.min(1, icc));
  if (clampedIcc === 0) return Number.POSITIVE_INFINITY;
  return m / clampedIcc;
}

/**
 * Variance of the grand mean difference (bias) in a balanced repeated measures design:
 *
 *     Var(d_bar) = (sigma_b^2 + sigma_w^2 / k) / m
 *                = (sigma_total^2 / m) * [rho + (1 - rho) / k]
 *                = sigma_total^2 / n_effective
 *
 * Expressed in squared units of sigma_total (or scaled by sdTotal^2).
 */
export function biasVarianceRepeated(
  m: number,
  k: number,
  icc: number,
  sdTotal = 1.0,
): number {
  if (m <= 0 || k < 1) return Number.NaN;
  const clampedIcc = Math.max(0, Math.min(1, icc));
  const varTotal = sdTotal * sdTotal;
  return (varTotal / m) * (clampedIcc + (1 - clampedIcc) / k);
}

/**
 * Standard error of the grand mean bias:
 *
 *     SE(bias) = sqrt(Var(d_bar))
 */
export function biasStandardError(
  m: number,
  k: number,
  icc: number,
  sdTotal = 1.0,
): number {
  const v = biasVarianceRepeated(m, k, icc, sdTotal);
  return Number.isNaN(v) ? Number.NaN : Math.sqrt(v);
}

/**
 * Margin of error around the mean bias at the specified confidence level:
 *
 *     ME_bias = t_{1 - alpha/2, df = m - 1} * SE(bias)
 *
 * Clustering occurs at the participant level, so degrees of freedom is m - 1,
 * matching agreekit and Bland & Altman (2007).
 */
export function biasMarginRepeated(
  m: number,
  k: number,
  icc: number,
  confidence = 0.95,
  sdTotal = 1.0,
): number {
  if (m < 2 || k < 1) return Number.NaN;
  const se = biasStandardError(m, k, icc, sdTotal);
  const tCrit = studentT.criticalValue(confidence, m - 1);
  return tCrit * se;
}

/**
 * Variance of a Limit of Agreement (d_bar +/- k_loa * s_total) in a balanced
 * repeated measures design (Bland & Altman 1999, 2007; Zou 2013).
 *
 * For balanced m subjects and k replicates:
 *   E[MS_between] = sigma_total^2 * [1 + (k - 1) * rho]
 *   E[MS_within]  = sigma_total^2 * (1 - rho)
 *
 * The unbiased estimate of total variance is:
 *   s_total^2 = [MS_between + (k - 1) * MS_within] / k
 *
 * By Satterthwaite / delta method:
 *   Var(s_total) ~= [1 / (2 * k^2)] * [ MS_between^2 / (m - 1) + (k - 1) * MS_within^2 / m ]
 *
 * And since d_bar and s_total are asymptotically independent:
 *   Var(LoA) = Var(d_bar) + k_loa^2 * Var(s_total)
 *
 * Note: When k = 1, this simplifies exactly to:
 *   Var(LoA) = sigma_total^2 / m + k_loa^2 * sigma_total^2 / [2 * (m - 1)]
 * which is the classical single-observation Bland-Altman variance.
 */
export function loaVarianceRepeated(
  m: number,
  k: number,
  icc: number,
  kLoa = 1.959963984540054,
  sdTotal = 1.0,
): number {
  if (m < 2 || k < 1) return Number.NaN;
  const clampedIcc = Math.max(0, Math.min(1, icc));
  const varTotal = sdTotal * sdTotal;

  // Normalized mean squares (per unit of varTotal)
  const msBetweenNorm = 1 + (k - 1) * clampedIcc;
  const msWithinNorm = 1 - clampedIcc;

  // Normalized variance of mean difference
  const varMeanNorm = msBetweenNorm / (m * k);

  // Normalized variance of s_total
  const varSdNorm =
    (1 / (2 * k * k)) *
    ((msBetweenNorm * msBetweenNorm) / (m - 1) +
      ((k - 1) * msWithinNorm * msWithinNorm) / m);

  const totalLoaVarNorm = varMeanNorm + kLoa * kLoa * varSdNorm;
  return totalLoaVarNorm * varTotal;
}

/**
 * Standard error of a limit of agreement in a repeated-measures design.
 */
export function loaStandardError(
  m: number,
  k: number,
  icc: number,
  kLoa = 1.959963984540054,
  sdTotal = 1.0,
): number {
  const v = loaVarianceRepeated(m, k, icc, kLoa, sdTotal);
  return Number.isNaN(v) ? Number.NaN : Math.sqrt(v);
}

/**
 * Margin of error around a limit of agreement at specified confidence level:
 *
 *     ME_LoA = t_{1 - alpha/2, df = m - 1} * SE(LoA)
 */
export function loaMarginRepeated(
  m: number,
  k: number,
  icc: number,
  confidence = 0.95,
  kLoa = 1.959963984540054,
  sdTotal = 1.0,
): number {
  if (m < 2 || k < 1) return Number.NaN;
  const se = loaStandardError(m, k, icc, kLoa, sdTotal);
  const tCrit = studentT.criticalValue(confidence, m - 1);
  return tCrit * se;
}

/**
 * What a naive calculation would report if clustering were ignored and all
 * N = m * k rows were treated as independent subjects.
 */
export function naiveLoaMargin(
  m: number,
  k: number,
  confidence = 0.95,
  kLoa = 1.959963984540054,
  sdTotal = 1.0,
): number {
  const nTotal = m * k;
  if (nTotal < 2) return Number.NaN;
  const variance = 1 / nTotal + (kLoa * kLoa) / (2 * (nTotal - 1));
  const tCrit = studentT.criticalValue(confidence, nTotal - 1);
  return tCrit * Math.sqrt(variance) * sdTotal;
}

export function naiveBiasMargin(
  m: number,
  k: number,
  confidence = 0.95,
  sdTotal = 1.0,
): number {
  const nTotal = m * k;
  if (nTotal < 2) return Number.NaN;
  const tCrit = studentT.criticalValue(confidence, nTotal - 1);
  return (tCrit / Math.sqrt(nTotal)) * sdTotal;
}

export interface RepeatedMeasuresSummary {
  m: number;
  k: number;
  nObs: number;
  icc: number;
  deff: number;
  nEffective: number;
  maxNEffective: number;
  efficiencyRatio: number;
  biasMargin: number;
  loaMargin: number;
  naiveLoaMargin: number;
  naiveBiasMargin: number;
  underestimationBiasPct: number;
  underestimationLoaPct: number;
}

/**
 * Compute the full summary comparison for a study design (m subjects x k replicates).
 */
export function analyzeRepeatedMeasuresDesign(
  m: number,
  k: number,
  icc: number,
  confidence = 0.95,
  kLoa = 1.959963984540054,
  sdTotal = 1.0,
): RepeatedMeasuresSummary {
  const nObs = m * k;
  const deff = designEffect(k, icc);
  const nEff = effectiveSampleSize(m, k, icc);
  const maxEff = maxEffectiveSampleSize(m, icc);
  const efficiencyRatio = nObs > 0 ? nEff / nObs : 0;

  const biasM = biasMarginRepeated(m, k, icc, confidence, sdTotal);
  const loaM = loaMarginRepeated(m, k, icc, confidence, kLoa, sdTotal);

  const naiveLoa = naiveLoaMargin(m, k, confidence, kLoa, sdTotal);
  const naiveBias = naiveBiasMargin(m, k, confidence, sdTotal);

  const underestimationBiasPct =
    biasM > 0 && Number.isFinite(biasM)
      ? Math.max(0, ((biasM - naiveBias) / biasM) * 100)
      : 0;

  const underestimationLoaPct =
    loaM > 0 && Number.isFinite(loaM)
      ? Math.max(0, ((loaM - naiveLoa) / loaM) * 100)
      : 0;

  return {
    m,
    k,
    nObs,
    icc,
    deff,
    nEffective: nEff,
    maxNEffective: maxEff,
    efficiencyRatio,
    biasMargin: biasM,
    loaMargin: loaM,
    naiveLoaMargin: naiveLoa,
    naiveBiasMargin: naiveBias,
    underestimationBiasPct,
    underestimationLoaPct,
  };
}

export interface ReplicateSweepPoint {
  k: number;
  nObs: number;
  nEffective: number;
  biasMargin: number;
  loaMargin: number;
  marginalLoaGainPct: number;
}

/**
 * Sweep replicate depth k from 1 to maxK at fixed subject count m.
 * Highlights diminishing returns as k increases.
 */
export function replicateSweep(
  m: number,
  icc: number,
  maxK = 20,
  confidence = 0.95,
  kLoa = 1.959963984540054,
  sdTotal = 1.0,
): ReplicateSweepPoint[] {
  const points: ReplicateSweepPoint[] = [];
  let prevLoaMargin = 0;

  for (let k = 1; k <= maxK; k += 1) {
    const nEff = effectiveSampleSize(m, k, icc);
    const bM = biasMarginRepeated(m, k, icc, confidence, sdTotal);
    const lM = loaMarginRepeated(m, k, icc, confidence, kLoa, sdTotal);

    let marginalLoaGainPct = 0;
    if (k > 1 && prevLoaMargin > 0) {
      marginalLoaGainPct = ((prevLoaMargin - lM) / prevLoaMargin) * 100;
    }
    prevLoaMargin = lM;

    points.push({
      k,
      nObs: m * k,
      nEffective: nEff,
      biasMargin: bM,
      loaMargin: lM,
      marginalLoaGainPct,
    });
  }
  return points;
}

export interface SubjectSweepPoint {
  m: number;
  nObs: number;
  nEffective: number;
  biasMargin: number;
  loaMargin: number;
}

/**
 * Sweep participant count m from minM to maxM at fixed replicate count k.
 */
export function subjectSweep(
  k: number,
  icc: number,
  minM = 2,
  maxM = 150,
  step = 1,
  confidence = 0.95,
  kLoa = 1.959963984540054,
  sdTotal = 1.0,
): SubjectSweepPoint[] {
  const points: SubjectSweepPoint[] = [];
  for (let m = minM; m <= maxM; m += step) {
    points.push({
      m,
      nObs: m * k,
      nEffective: effectiveSampleSize(m, k, icc),
      biasMargin: biasMarginRepeated(m, k, icc, confidence, sdTotal),
      loaMargin: loaMarginRepeated(m, k, icc, confidence, kLoa, sdTotal),
    });
  }
  return points;
}

/**
 * Smallest number of participants m required to achieve a target LoA margin
 * for a specified replicate depth k and ICC.
 *
 * Uses integer binary search over [2, maxM], guaranteeing logarithmic O(log maxM)
 * convergence (~13 evaluations vs up to 5,000 for linear scan) without UI lag.
 */
export function solveRequiredM(
  targetLoaMargin: number,
  k: number,
  icc: number,
  confidence = 0.95,
  kLoa = 1.959963984540054,
  sdTotal = 1.0,
  maxM = 5000,
): number | null {
  if (!(targetLoaMargin > 0) || k < 1 || maxM < 2) return null;

  // Check boundary at m = 2
  const m2Margin = loaMarginRepeated(2, k, icc, confidence, kLoa, sdTotal);
  if (!Number.isFinite(m2Margin)) return null;
  if (m2Margin <= targetLoaMargin) return 2;

  // Check boundary at m = maxM
  const maxMargin = loaMarginRepeated(maxM, k, icc, confidence, kLoa, sdTotal);
  if (!Number.isFinite(maxMargin) || maxMargin > targetLoaMargin) {
    return null; // Unreachable in range
  }

  let low = 2;
  let high = maxM;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const margin = loaMarginRepeated(mid, k, icc, confidence, kLoa, sdTotal);
    if (Number.isFinite(margin) && margin <= targetLoaMargin) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return low;
}
