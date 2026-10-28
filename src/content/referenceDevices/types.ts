/**
 * Types and interfaces for Reference Device Selection across clinical validation.
 *
 * Grounded in regulatory standards (FDA 510(k), De Novo, ISO 80601-2-61, ISO 81060-2,
 * ANSI/AAMI EC13, AASM) and engineering realities (data pipelines, clock drift,
 * signal synchronization, consumable burn rates).
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
}
