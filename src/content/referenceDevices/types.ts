/**
 * Types and interfaces for Reference Device & Clinical Trial Instrument Selection
 * across wearable biometric validation and clinical research.
 *
 * Grounded in regulatory standards (FDA 510(k), De Novo, ISO 80601-2-61, ISO 81060-2,
 * ANSI/AAMI EC13, AASM) and engineering/clinical trial realities (data pipelines,
 * firmware version control, API/contract walls, clock drift, signal synchronization,
 * cohort sensitivities, and consumable burn rates).
 */

export type ReferenceTier = 'gold' | 'silver' | 'bronze';

export type FeatureDomainId =
  | 'hr'
  | 'spo2'
  | 'sleep'
  | 'bp'
  | 'temperature'
  | 'running_dynamics'
  | 'ecg_arrhythmia'
  | 'glucose'
  | 'womens_health'
  | 'cardiorespiratory'
  | 'activity_calories'
  | 'eda_stress';

export type FormFactorType =
  | 'chest_strap'
  | 'adhesive_patch'
  | 'holter_harness'
  | 'smartwatch_wrist'
  | 'smart_ring'
  | 'fingertip_clip'
  | 'eeg_headband'
  | 'under_mattress_mat'
  | 'arm_cuff'
  | 'ingestible_pill'
  | 'skin_logger'
  | 'footpod_imu'
  | 'benchtop_clinical'
  | 'cgm_sensor';

export type DataGranularityTier =
  | 'raw_waveform'        // Unfiltered Hz-level physiological waveform (e.g., 1000 Hz EDF+ ECG)
  | 'beat_to_beat_ibi'    // Millisecond R-R or inter-beat intervals
  | 'epoch_30s_clinical'  // Standard 30-second clinical scoring epochs (e.g., AASM sleep staging)
  | 'epoch_1m_to_5m'      // Consumer multi-minute blocks (e.g., Oura 5-min sleep/HRV arrays)
  | 'summary_only';       // Daily/nightly or session aggregate summaries only

export type OffloadMechanism =
  | 'direct_local_usb_sd' // Physical USB mass storage / SD card (no cloud required)
  | 'open_ble_sdk'        // Direct Bluetooth Low Energy GATT / open local SDK
  | 'cloud_rest_api'      // Vendor cloud portal + REST API
  | 'mobile_os_sandbox'   // On-phone database only (e.g., Apple HealthKit SQLite)
  | 'manual_entry';       // Visual display / manual eCRF transcription

export interface ValidationCitation {
  authors: string;        // e.g., "Gilgen-Ammann et al."
  year: number;           // e.g., 2019
  title: string;
  journal: string;        // e.g., "Eur J Appl Physiol"
  doiOrPmid?: string;     // e.g., "10.1007/s00421-019-04142-5"
  sampleSize: string;     // e.g., "n = 30 healthy adults"
  protocolContext: string;// e.g., "Graded exercise from rest to vigorous running vs. 3-lead Holter"
  reportedResult: string; // Traceable result (e.g., "RR interval correlation r = 0.994; 99.6% valid beats")
}

export interface StudyInstrumentProfile {
  formFactor: FormFactorType;
  typicalBatteryLife: string;            // e.g., "4–7 days", "18–36 hours (requires daily charging)"
  dataGranularity: DataGranularityTier;
  granularityDetails: string;            // Explicit statement of what is accessible vs. locked
  offloadMechanism: OffloadMechanism;
  firmwareLockSupported: boolean;        // Can firmware & scoring algorithms be frozen for longitudinal trials?
  algorithmStabilityNotes: string;       // Notes on OTA drift, cloud re-scoring, or version locking
  contractAndCostWalls: string[];        // Unexpected commercial/API walls (minimum seats, subscriptions, BAA fees)
  supportedCapabilities: {
    continuous24hIbi: boolean;           // True only if device captures waking + sleeping beat-to-beat intervals
    nocturnalRestingHrv: boolean;        // Overnight resting RMSSD / SDNN
    aasm30sSleepStaging: boolean;        // 30-second epoch sleep staging
    consumerSleepSummary: boolean;       // 5-min blocks or nightly TST / WASO / efficiency summaries
    multiWeekHabitualCompliance: boolean;// Feasible for weeks/months of free-living wear in older cohorts
  };
  useFor: string[];                      // Specific study designs and estimands this device is fit for
  doNotUseFor: string[];                 // Study designs where this device will fail or mislead
  cohortConsiderations: {
    agingAndNeuro: string;               // Tremor, cognitive charging burden, skin fragility, nocturnal wandering
    arrhythmiaAndEctopy: string;         // How AFib/PVCs affect the reported metrics
    skinToneAndPerfusion: string;        // Melanin absorption or peripheral vasoconstriction impacts
  };
  validationCitations: ValidationCitation[];
  measurementSdSource: string;           // Citation or derivation note for measurementSd (or "Unsourced assumption")
  reviewStatus: 'draft' | 'reviewed';    // Per CLAUDE.md Invariant 6
}

export interface FeatureDomain {
  id: FeatureDomainId;
  name: string;
  shortName: string;
  tagline: string;
  primaryUnit: string;
  isPriorityTop5: boolean;
  clinicalEndpoints: string[];
  primaryFdaProductCodes: string[];
  keyConsensusStandards: string[];
  description: string;
}

export interface RegulatoryProfile {
  clearancePathway: '510(k)' | 'De Novo' | 'PMA' | 'Exempt' | 'In Vitro Diagnostic' | 'Consumer / OTC';
  clearanceNumber?: string; // e.g. "K170564" or "DEN180044"
  productCode: string; // e.g. "MWI", "DQA", "GWQ", "DXN", "FLL"
  regulationNumber?: string; // e.g. "21 CFR 870.2700"
  predicateChain: string; // The explicit device/predicate cited to clear FDA hurdle
  consensusStandards: string[]; // e.g. ["ISO 80601-2-61:2019", "CLSI C46-A2"]
  reportedClearanceResults: {
    metric: string; // e.g. "Arms", "Mean Bias", "Limits of Agreement", "Kappa"
    value: string; // e.g. "1.41%", "0.3 bpm ± 2.1 bpm", "0.78"
    context: string; // e.g. "Controlled desaturation 70-100% SaO2, non-motion"
  }[];
}

export interface DataPipelineProfile {
  fileFormats: string[]; // e.g. ["EDF+", "CSV", "Open BLE GATT", "Proprietary Binary"]
  exportMethod: string; // e.g. "Direct USB Mass Storage", "Bluetooth SDK", "Cloud REST API"
  easeScore: 1 | 2 | 3 | 4 | 5; // 1 = proprietary binary blob locked behind dongle, 5 = instant open drag-and-drop
  easeSummary: string;
  licensingPaywall: string; // e.g. "Free / Open", "Requires $5,000 research license", "Per-subject cloud fee"
  rawSignalAccess: boolean; // True if raw un-decimated/un-filtered sensor samples are accessible
}

export interface SynchronizationProfile {
  nativeSamplingRate: string; // e.g. "1000 Hz", "62.5 Hz", "1 Hz", "30-sec epochs"
  auxiliaryStreams: string[]; // e.g. ["3-axis accelerometer", "raw photoplethysmogram", "respiratory effort"]
  syncHardware: string[]; // e.g. ["TTL trigger input", "BNC 0-1V analog out", "BLE time sync", "Manual marker"]
  clockDriftPpm: number; // Typical quartz oscillator drift in parts per million
  alignmentNotes: string; // Guidance on how to align this stream with the wearable under test
}

export interface EconomicsAndOperationsProfile {
  capexRange: string; // e.g. "$2,500 – $4,000"
  opexOrSubscription: string; // e.g. "None", "$30/month per device", "$1,500/night lab fee"
  consumablesRequired: string[]; // e.g. ["Snap electrodes", "Skin prep abrasive", "Alcohol swabs"]
  perSubjectConsumableCost: number; // USD per subject per test session
  shelfLifeAlert?: string; // e.g. "Cartridges expire 30 days after unsealing"
  calibration: {
    intervalMonths: number; // 0 if self-calibrating / single-use
    type: string; // e.g. "Factory NIST-traceable", "Daily internal automated QC", "Water bath pre-test"
    rmaTurnaroundWeeks: number; // Typical repair / replacement turnaround time
    fieldRepairable: boolean;
  };
  vendorSupport: {
    hqLocation: string; // e.g. "Oulu, Finland", "Irvine, CA, USA"
    supportTimezone: string; // e.g. "EET (UTC+2)", "PST (UTC-8)"
    clinicalSupportTier: string; // e.g. "Dedicated clinical trial engineering team", "Enterprise ticketing", "Consumer queue"
  };
}

export interface ReferenceDevice {
  id: string;
  name: string;
  vendor: string;
  model: string;
  domainId: FeatureDomainId;
  tier: ReferenceTier;
  tagline: string;
  summary: string;
  imageUrl?: string;
  websiteUrl?: string;

  // The 10 Essential Dimensions
  regulatory: RegulatoryProfile;
  dataPipeline: DataPipelineProfile;
  synchronization: SynchronizationProfile;
  economics: EconomicsAndOperationsProfile;

  // Clinical & Statistical Dimensions
  strengths: string[];
  limitations: string[];
  fieldGotchas: string[]; // Hard-learned clinical traps (cadence lock, vasoconstriction, first-night effect, etc.)

  // Statistical Noise Floor (for sample size inflation calculations)
  measurementSd: number; // Reference noise standard deviation in domain primaryUnit
  repeatabilityLimit: number; // 2.77 * measurementSd

  // Clinical Trial Instrument & Protocol Fit Profile
  studyInstrument?: StudyInstrumentProfile;
}
