import type {
  DataGranularityTier,
  FeatureDomain,
  FeatureDomainId,
  FormFactorType,
  OffloadMechanism,
  ReferenceDevice,
  ReferenceTier,
} from '../../content/referenceDevices/types.ts';
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

export interface ProtocolConstraints {
  endpointStatus: 'any' | 'exploratory_trend' | 'formal_trial_endpoint';
  physiologicalConstruct: 'any' | 'nocturnal_or_resting' | 'continuous_24h_ambulatory';
  requiredGranularity: 'any' | 'summary_or_5min' | 'epoch_30s_clinical' | 'beat_to_beat_or_raw';
  monitoringCadence: 'any' | 'episodic_1_to_2_nights' | 'habitual_multi_week';
  dataOffloadModel: 'any' | 'remote_cloud_sync' | 'direct_local_offload';
}

export interface ProtocolFitEvaluation {
  status: 'compatible' | 'conditional' | 'mismatch';
  headline: string;
  reasons: string[];
  tradeoffs: string[];
}

export interface StudyArchetypePreset {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  recommendedDomain?: FeatureDomainId;
  constraints: ProtocolConstraints;
}

export const DEFAULT_PROTOCOL_CONSTRAINTS: ProtocolConstraints = {
  endpointStatus: 'any',
  physiologicalConstruct: 'any',
  requiredGranularity: 'any',
  monitoringCadence: 'any',
  dataOffloadModel: 'any',
};

export const STUDY_ARCHETYPE_PRESETS: StudyArchetypePreset[] = [
  {
    id: 'all',
    name: 'All Devices (Unfiltered)',
    shortLabel: 'Unfiltered Catalog',
    description: 'Inspect all Gold, Silver, and Bronze devices without protocol constraint filtering.',
    constraints: { ...DEFAULT_PROTOCOL_CONSTRAINTS },
  },
  {
    id: 'longitudinal_neuro_sleep_hrv',
    name: 'Longitudinal Clinical Trial: 24h HRV + Habitual Sleep Endpoint',
    shortLabel: '24h HRV + Longitudinal Sleep Trial',
    description:
      'Pressure-tests devices against simultaneous demands for formal endpoint stability, continuous 24-hour beat-to-beat intervals, and multi-week habitual wear in aging or neurodegenerative cohorts.',
    recommendedDomain: 'hr',
    constraints: {
      endpointStatus: 'formal_trial_endpoint',
      physiologicalConstruct: 'continuous_24h_ambulatory',
      requiredGranularity: 'beat_to_beat_or_raw',
      monitoringCadence: 'habitual_multi_week',
      dataOffloadModel: 'any',
    },
  },
  {
    id: 'habitual_nocturnal_recovery',
    name: 'Multi-Week Habitual Sleep & Nocturnal Resting HRV',
    shortLabel: 'Habitual Sleep & Nocturnal HRV',
    description:
      'Prioritizes multi-week participant compliance, low charging friction, and remote cloud offloading for overnight resting RMSSD and sleep trend tracking.',
    recommendedDomain: 'sleep',
    constraints: {
      endpointStatus: 'exploratory_trend',
      physiologicalConstruct: 'nocturnal_or_resting',
      requiredGranularity: 'summary_or_5min',
      monitoringCadence: 'habitual_multi_week',
      dataOffloadModel: 'remote_cloud_sync',
    },
  },
  {
    id: 'episodic_autonomic_benchmark',
    name: 'Episodic 24–48h Clinical Autonomic / Sleep Benchmark',
    shortLabel: 'Episodic 24–48h Clinical Snapshot',
    description:
      'Captures high-resolution raw waveforms or 30-second clinical epochs over 1–2 nights at baseline and follow-up milestones with locked firmware and direct local offload.',
    recommendedDomain: 'hr',
    constraints: {
      endpointStatus: 'formal_trial_endpoint',
      physiologicalConstruct: 'continuous_24h_ambulatory',
      requiredGranularity: 'beat_to_beat_or_raw',
      monitoringCadence: 'episodic_1_to_2_nights',
      dataOffloadModel: 'direct_local_offload',
    },
  },
];

export const FORM_FACTOR_LABELS: Record<FormFactorType, string> = {
  chest_strap: 'Chest Strap',
  adhesive_patch: 'Adhesive Patch',
  holter_harness: 'Holter Lead Harness',
  smartwatch_wrist: 'Wristwatch / Band',
  smart_ring: 'Smart Ring',
  fingertip_clip: 'Fingertip Oximeter / Probe',
  eeg_headband: 'EEG Headband',
  under_mattress_mat: 'Under-Mattress Sensor',
  arm_cuff: 'Brachial / Wrist Cuff',
  ingestible_pill: 'Ingestible Telemetry Pill',
  skin_logger: 'Cutaneous Patch / Logger',
  footpod_imu: 'Shoe Footpod / Motion Capture',
  benchtop_clinical: 'In-Lab / Benchtop System',
  cgm_sensor: 'Transcutaneous CGM Filament',
};

export const DATA_GRANULARITY_LABELS: Record<DataGranularityTier, string> = {
  raw_waveform: 'Raw Waveform (Hz)',
  beat_to_beat_ibi: 'Beat-to-Beat (RR / IBI)',
  epoch_30s_clinical: '30-sec Clinical Epochs',
  epoch_1m_to_5m: '1–5 min Epoch Blocks',
  summary_only: 'Session / Daily Summaries',
};

export const OFFLOAD_MECHANISM_LABELS: Record<OffloadMechanism, string> = {
  direct_local_usb_sd: 'Direct USB / SD Local Export',
  open_ble_sdk: 'Open BLE GATT / Local SDK',
  cloud_rest_api: 'Vendor Cloud Portal / REST API',
  mobile_os_sandbox: 'Mobile OS Sandbox (HealthKit)',
  manual_entry: 'Manual eCRF Transcription',
};

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

/**
 * Returns true if any protocol constraint is set to a non-'any' value.
 */
export function hasActiveProtocolConstraints(constraints: ProtocolConstraints): boolean {
  return (
    constraints.endpointStatus !== 'any' ||
    constraints.physiologicalConstruct !== 'any' ||
    constraints.requiredGranularity !== 'any' ||
    constraints.monitoringCadence !== 'any' ||
    constraints.dataOffloadModel !== 'any'
  );
}

/**
 * Evaluates a device against the 5 foundational study protocol constraints.
 */
export function evaluateProtocolFit(
  device: ReferenceDevice,
  constraints: ProtocolConstraints,
): ProtocolFitEvaluation {
  if (!hasActiveProtocolConstraints(constraints)) {
    return {
      status: 'compatible',
      headline: 'Meets active criteria',
      reasons: [],
      tradeoffs: [],
    };
  }

  const inst = device.studyInstrument;
  const mismatches: string[] = [];
  const tradeoffs: string[] = [];
  const positives: string[] = [];

  // 1. Endpoint Status & Firmware Lock
  if (constraints.endpointStatus === 'formal_trial_endpoint') {
    const canLock = inst ? inst.firmwareLockSupported : device.tier !== 'bronze';
    if (!canLock) {
      mismatches.push(
        'Uncontrolled OTA firmware and cloud scoring updates cannot be frozen, risking non-biological step changes across longitudinal endpoints.',
      );
    } else if (device.tier === 'bronze') {
      tradeoffs.push(
        'Consumer wellness classification (OTC) lacks FDA 510(k) clearance for primary clinical trial endpoints.',
      );
    } else {
      positives.push('Supports locked firmware / auditable clinical scoring pipeline.');
    }
  }

  // 2. Physiological Construct (Nocturnal/Resting vs. 24-Hour Continuous Ambulatory)
  if (constraints.physiologicalConstruct === 'continuous_24h_ambulatory') {
    const supports24h = inst ? inst.supportedCapabilities.continuous24hIbi : device.tier !== 'bronze';
    if (!supports24h) {
      mismatches.push(
        'Cannot capture continuous 24-hour waking + sleeping intervals; daytime motion artifacts restrict optical PPG to opportunistic rest or sleep windows.',
      );
    } else {
      positives.push('Captures continuous 24-hour ambulatory signal across waking and sleeping states.');
    }
  }

  // 3. Required Temporal Granularity
  if (constraints.requiredGranularity === 'beat_to_beat_or_raw') {
    const gran = inst?.dataGranularity;
    const hasRawOrIbi =
      gran === 'raw_waveform' ||
      gran === 'beat_to_beat_ibi' ||
      (!gran && device.dataPipeline.rawSignalAccess);
    if (!hasRawOrIbi) {
      mismatches.push(
        `Exposes ${gran ? DATA_GRANULARITY_LABELS[gran] : 'processed summaries'} rather than raw waveforms or beat-to-beat intervals.`,
      );
    } else {
      positives.push('Exports raw physiological waveforms or millisecond beat-to-beat intervals.');
    }
  } else if (constraints.requiredGranularity === 'epoch_30s_clinical') {
    const gran = inst?.dataGranularity;
    const supports30s =
      gran === 'raw_waveform' ||
      gran === 'beat_to_beat_ibi' ||
      gran === 'epoch_30s_clinical' ||
      Boolean(inst?.supportedCapabilities.aasm30sSleepStaging);
    if (!supports30s) {
      mismatches.push(
        'Exports 5-minute blocks or nightly summaries rather than standard 30-second clinical AASM epochs.',
      );
    } else {
      positives.push('Supports 30-second clinical epoch resolution or raw waveform scoring.');
    }
  }

  // 4. Monitoring Cadence (Episodic 1-2 Nights vs. Habitual Multi-Week)
  if (constraints.monitoringCadence === 'habitual_multi_week') {
    const habitualOk = inst ? inst.supportedCapabilities.multiWeekHabitualCompliance : device.tier === 'bronze';
    if (!habitualOk) {
      mismatches.push(
        `High participant wear burden (${inst ? FORM_FACTOR_LABELS[inst.formFactor] : 'clinical harness/benchtop'}) is unsuitable for continuous multi-week habitual wear.`,
      );
    } else if (inst && inst.typicalBatteryLife.toLowerCase().includes('daily')) {
      tradeoffs.push(
        `Daily charging requirement (${inst.typicalBatteryLife}) increases nocturnal data dropout in aging and neurodegenerative cohorts.`,
      );
    } else {
      positives.push('Form factor and battery life support multi-week habitual compliance.');
    }
  }

  // 5. Data Offload Mechanism
  if (constraints.dataOffloadModel === 'direct_local_offload') {
    const mech = inst?.offloadMechanism;
    const isDirectLocal = mech === 'direct_local_usb_sd' || mech === 'open_ble_sdk';
    if (mech && !isDirectLocal) {
      tradeoffs.push(
        `Relies on ${OFFLOAD_MECHANISM_LABELS[mech]} rather than direct local USB/SD or open BLE offload.`,
      );
    } else if (isDirectLocal) {
      positives.push(`Supports ${OFFLOAD_MECHANISM_LABELS[mech]} without mandatory cloud paywalls.`);
    }
  } else if (constraints.dataOffloadModel === 'remote_cloud_sync') {
    const mech = inst?.offloadMechanism;
    if (mech === 'direct_local_usb_sd' || mech === 'manual_entry') {
      tradeoffs.push(
        `Requires physical device return or in-clinic offload (${OFFLOAD_MECHANISM_LABELS[mech]}) rather than passive remote cloud sync.`,
      );
    } else if (mech === 'cloud_rest_api') {
      positives.push('Supports automated remote cloud synchronization via participant smartphone.');
    }
  }

  if (mismatches.length > 0) {
    return {
      status: 'mismatch',
      headline: `Protocol Mismatch (${mismatches.length} issue${mismatches.length > 1 ? 's' : ''})`,
      reasons: mismatches,
      tradeoffs,
    };
  }

  if (tradeoffs.length > 0) {
    return {
      status: 'conditional',
      headline: 'Conditional Fit (Requires Trade-Off)',
      reasons: positives,
      tradeoffs,
    };
  }

  return {
    status: 'compatible',
    headline: 'Protocol Match',
    reasons: positives,
    tradeoffs: [],
  };
}

/**
 * Diagnoses structural conflicts across protocol constraints (e.g., simultaneous
 * demand for continuous 24-hour beat-to-beat HRV and multi-week habitual sleep wear)
 * and provides a clinical study design recommendation.
 */
export function diagnoseProtocolConflicts(
  domainId: FeatureDomainId,
  constraints: ProtocolConstraints,
  evaluations: { device: ReferenceDevice; fit: ProtocolFitEvaluation }[],
): {
  hasConflict: boolean;
  title: string;
  explanation: string;
  recommendedResolution: string;
} | null {
  if (!hasActiveProtocolConstraints(constraints)) {
    return null;
  }

  const compatibleCount = evaluations.filter((e) => e.fit.status === 'compatible').length;

  // Classic 24h HRV + Multi-Week Habitual Sleep conflict
  if (
    constraints.physiologicalConstruct === 'continuous_24h_ambulatory' &&
    constraints.monitoringCadence === 'habitual_multi_week' &&
    (domainId === 'hr' || domainId === 'sleep' || compatibleCount === 0)
  ) {
    return {
      hasConflict: true,
      title: 'Structural Protocol Conflict: Continuous 24h Beat-to-Beat IBI vs. Multi-Week Habitual Wear',
      explanation:
        'No single consumer wearable satisfies both constraints. Optical wrist and finger sensors (Oura, Apple Watch, WHOOP, Garmin) achieve high multi-week compliance during sleep, but daytime motion artifacts physically preclude continuous waking 24-hour beat-to-beat intervals—and consumer platforms push unannounced OTA firmware updates. Conversely, biopotential ECG patches and chest straps capture sub-millisecond 24-hour RR intervals with locked firmware, but adhesive irritation or strap fatigue limits continuous wear to episodic windows.',
      recommendedResolution:
        'Deploy a Two-Tier Hybrid Protocol: (1) Use an unobtrusive passive monitor (e.g., ActiGraph LEAP for locked-firmware clinical actigraphy, or Oura Ring / Withings Sleep Mat if exploratory 5-min epochs are acceptable) for continuous multi-week sleep tracking, and (2) deploy a 510(k)-cleared ECG patch (e.g., Bittium Faros 180 or VitalPatch) for 24–48 hour episodic deep-dives at baseline and follow-up milestones.',
    };
  }

  if (compatibleCount === 0) {
    return {
      hasConflict: true,
      title: 'Zero Single-Device Matches Under Current Protocol Constraints',
      explanation:
        'Your active combination of endpoint rigor, temporal granularity, monitoring cadence, and data offload rules out every standalone device in this domain.',
      recommendedResolution:
        'Inspect the "Conditional Fit" devices below to see which operational trade-off (e.g., episodic 48-hour wear instead of multi-week continuous wear, or in-clinic USB offload instead of remote cloud sync) preserves your primary scientific estimand.',
    };
  }

  return null;
}
