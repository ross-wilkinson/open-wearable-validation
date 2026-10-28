import type { FeatureDomain, FeatureDomainId, ReferenceDevice, ReferenceTier } from '../../content/referenceDevices/types.ts';
import { FEATURE_DOMAINS, REFERENCE_DEVICES } from '../../content/referenceDevices/catalog.ts';

export interface ReferenceNoiseImpact {
  dutSd: number;
  refSd: number;
  totalDiffSd: number;
  sdInflationRatio: number;
  sampleSizeMultiplier: number;
  adjustedN: number;
  penaltySubjects: number;
}

/**
 * Calculates the statistical inflation penalty caused by reference measurement noise.
 *
 * When validating a wearable against a reference device, the observed difference
 * variance is:
 *   σ²_diff = σ²_DUT + σ²_REF
 *
 * Sizing a study assuming σ_REF = 0 when using a noisy silver or bronze reference
 * systematically underpowers the trial. This function computes the exact
 * variance inflation and required sample size adjustment.
 */
export function calculateReferenceNoiseImpact(
  baseN: number,
  dutSd: number,
  refSd: number,
): ReferenceNoiseImpact {
  const safeDutSd = Math.max(0.001, dutSd);
  const safeRefSd = Math.max(0, refSd);

  const totalDiffVar = safeDutSd * safeDutSd + safeRefSd * safeRefSd;
  const totalDiffSd = Math.sqrt(totalDiffVar);

  const sdInflationRatio = totalDiffSd / safeDutSd;
  const sampleSizeMultiplier = totalDiffVar / (safeDutSd * safeDutSd);

  const adjustedN = Math.ceil(baseN * sampleSizeMultiplier);
  const penaltySubjects = Math.max(0, adjustedN - baseN);

  return {
    dutSd: safeDutSd,
    refSd: safeRefSd,
    totalDiffSd,
    sdInflationRatio,
    sampleSizeMultiplier,
    adjustedN,
    penaltySubjects,
  };
}

/**
 * Computes projected consumable costs across a participant cohort with attrition buffer.
 */
export function calculateStudyConsumableBudget(
  nSubjects: number,
  perSubjectCost: number,
  attritionRate = 0.15,
): {
  targetSubjects: number;
  totalKitsNeeded: number;
  totalConsumableCostUsd: number;
} {
  const safeN = Math.max(1, Math.round(nSubjects));
  const safeCost = Math.max(0, perSubjectCost);
  const totalKitsNeeded = Math.ceil(safeN * (1 + attritionRate));
  const totalConsumableCostUsd = totalKitsNeeded * safeCost;

  return {
    targetSubjects: safeN,
    totalKitsNeeded,
    totalConsumableCostUsd,
  };
}

/**
 * Finds all reference devices for a specific domain.
 */
export function getDevicesForDomain(domainId: FeatureDomainId): ReferenceDevice[] {
  return REFERENCE_DEVICES.filter((d) => d.domainId === domainId);
}

/**
 * Filters reference devices by domain and optional tier.
 */
export function filterDevices(
  domainId: FeatureDomainId,
  tierFilter?: ReferenceTier | 'all',
): ReferenceDevice[] {
  const list = getDevicesForDomain(domainId);
  if (!tierFilter || tierFilter === 'all') {
    return list;
  }
  return list.filter((d) => d.tier === tierFilter);
}

/**
 * Returns the primary feature domain descriptor.
 */
export function getDomainById(domainId: FeatureDomainId): FeatureDomain {
  return FEATURE_DOMAINS.find((d) => d.id === domainId) ?? FEATURE_DOMAINS[0]!;
}
