import type { FeatureDomain, ReferenceDevice } from './types.ts';
import { HR_DEVICES } from './domains/hrDevices.ts';
import { SLEEP_DEVICES } from './domains/sleepDevices.ts';
import { CORE_VITAL_DEVICES } from './domains/coreVitalDevices.ts';
import { EXPANDED_DOMAINS_DEVICES } from './domains/expandedDomainsDevices.ts';

export const FEATURE_DOMAINS: FeatureDomain[] = [
  {
    id: 'hr',
    name: 'Heart Rate & HRV',
    shortName: 'HR / HRV',
    tagline: 'Resting HR, Active Exercise HR, Beat-to-Beat HRV, and Consumer / Clinical Wearable Instruments',
    primaryUnit: 'bpm',
    isPriorityTop5: true,
    clinicalEndpoints: ['Resting Heart Rate', 'Exercise Peak HR', 'RMSSD / SDNN HRV', 'Continuous 24h IBI vs Nocturnal HRV'],
    primaryFdaProductCodes: ['MWI', 'DPS', 'DRT', 'QDA'],
    keyConsensusStandards: ['ANSI/AAMI EC13:2002/(R)2014', 'ANSI/AAMI EC38:2007', 'IEC 60601-2-47:2012', 'Task Force 1996 HRV Standards'],
    description:
      'Cardiac chronotropic evaluation and autonomic nervous system recovery spanning clinical multi-lead Holters, FDA-cleared cardiac patches, ECG chest straps, and high-compliance consumer rings and smartwatches.',
  },
  {
    id: 'spo2',
    name: 'Blood Oxygen Saturation',
    shortName: 'SpO2',
    tagline: 'Arterial Oxygenation across Normoxia and Controlled Hypoxemia (70%–100%)',
    primaryUnit: '%',
    isPriorityTop5: true,
    clinicalEndpoints: ['Steady-State SaO2 / SpO2', 'Oxygen Desaturation Index (ODI)', 'Arms Accuracy (70–100%)', 'Skin Tone Equity'],
    primaryFdaProductCodes: ['DQA', 'GHS'],
    keyConsensusStandards: ['ISO 80601-2-61:2019', 'CLSI C46-A2', 'FDA 2013 Pulse Oximeter Guidance'],
    description:
      'Fraction of oxygenated hemoglobin in arterial blood. Regulatory validation requires invasive desaturation testing against multi-wavelength CO-oximetry across diverse Monk and Fitzpatrick skin tones.',
  },
  {
    id: 'sleep',
    name: 'Sleep Architecture & Apnea',
    shortName: 'Sleep & AHI',
    tagline: '4-Stage Sleep Staging, Total Sleep Time, WASO, Sleep Disordered Breathing & Longitudinal Habitual Sleep',
    primaryUnit: 'stages / AHI',
    isPriorityTop5: true,
    clinicalEndpoints: ['4-Stage Concordance (Wake, Light, Deep, REM)', 'Total Sleep Time (TST)', 'WASO', 'Apnea-Hypopnea Index (AHI)'],
    primaryFdaProductCodes: ['GWQ', 'OLZ', 'MNR', 'LXH'],
    keyConsensusStandards: ['AASM Manual for the Scoring of Sleep', 'IEC 60601-2-26', 'SBSM Actigraphy Guidelines'],
    description:
      'Epoch-by-epoch (30s) classification of human sleep architecture, respiratory disturbances, and multi-week habitual sleep-wake rhythms across Type 1 PSG, home sleep apnea tests, research actigraphy, and consumer wearables.',
  },
  {
    id: 'bp',
    name: 'Blood Pressure & Hemodynamics',
    shortName: 'Blood Pressure',
    tagline: 'Systolic/Diastolic BP, 24-Hour Diurnal Dipping, and Continuous Peñáz Waveforms',
    primaryUnit: 'mmHg',
    isPriorityTop5: true,
    clinicalEndpoints: ['Systolic Blood Pressure (SBP)', 'Diastolic Blood Pressure (DBP)', 'Mean Arterial Pressure (MAP)', 'Ambulatory Dipping Ratio'],
    primaryFdaProductCodes: ['DXN', 'DSJ'],
    keyConsensusStandards: ['ISO 81060-2:2018 / AMD 1:2020', 'ANSI/AAMI/ISO 81060-1', 'ESH International Protocol 2010'],
    description:
      'Vascular pressure dynamics. Non-invasive clearance mandates dual-observer auscultation using calibrated mercury or aneroid sphygmomanometers with a Y-tube stethoscope following strict ISO 81060-2 protocols.',
  },
  {
    id: 'temperature',
    name: 'Body & Skin Temperature',
    shortName: 'Temperature',
    tagline: 'Gastrointestinal Core Temperature vs. Calibrated High-Resolution Peripheral Skin Loggers',
    primaryUnit: '°C',
    isPriorityTop5: true,
    clinicalEndpoints: ['Core Body Temperature', 'Nocturnal Wrist Skin Delta', 'Heat-Flux Dissipation', 'Circadian Acrophase'],
    primaryFdaProductCodes: ['FLL'],
    keyConsensusStandards: ['ISO 80601-2-56:2017', 'ASTM E1112-00(2018)'],
    description:
      'Human thermal homeostasis. Core temperature reflects central organ blood temperature (measured via ingestible telemetry pill or esophageal probe), while peripheral wearables measure vasomotor cutaneous dynamics.',
  },
  {
    id: 'running_dynamics',
    name: 'Running Dynamics & Gait Biomechanics',
    shortName: 'Running Dynamics',
    tagline: 'Pace, Stride Cadence, Ground Contact Time (GCT), Vertical Oscillation & Stride Length',
    primaryUnit: 'ms / cm / spm',
    isPriorityTop5: false,
    clinicalEndpoints: ['Ground Contact Time (GCT)', 'Vertical Oscillation (VO)', 'Running Cadence (spm)', 'Stride Length', 'Running Pace (min/km)'],
    primaryFdaProductCodes: ['LXH'],
    keyConsensusStandards: ['ASTM F2157 (Treadmill Biomechanics)', 'ISB Recommendations on Gait Kinematics'],
    description:
      'Locomotor biomechanics during running and walking. Gold standard utilizes 3D optical motion capture (retroreflective markers) synchronized with high-frequency force plate instrumented treadmills.',
  },
  {
    id: 'ecg_arrhythmia',
    name: 'ECG & Arrhythmia (AFib)',
    shortName: 'ECG / AFib',
    tagline: 'Single-Lead Rhythm Classification and PPG Irregular Rhythm Notifications',
    primaryUnit: 'binary rhythm',
    isPriorityTop5: false,
    clinicalEndpoints: ['Atrial Fibrillation Sensitivity', 'AFib Specificity', 'QRS Morphology', 'Sinus Rhythm Agreement'],
    primaryFdaProductCodes: ['DXH', 'QDA', 'DPS', 'DQK'],
    keyConsensusStandards: ['ANSI/AAMI EC57:2012', 'IEC 60601-2-25', 'FDA 2022 OTC AFib Guidance'],
    description:
      'Cardiac rhythm classification for subclinical atrial fibrillation. Validated against 12-lead diagnostic ECG strips or continuous 14-day clinical ambulatory cardiac telemetry patches.',
  },
  {
    id: 'glucose',
    name: 'Continuous Glucose Monitoring (CGM)',
    shortName: 'Glucose / CGM',
    tagline: 'Continuous Interstitial Glucose vs. Laboratory Venous Clamp Benchmarks',
    primaryUnit: 'mg/dL',
    isPriorityTop5: false,
    clinicalEndpoints: ['Mean Absolute Relative Difference (MARD)', 'Clarke Error Grid Zones A & B', 'Time in Range (70–180 mg/dL)', 'Hypoglycemia Detection'],
    primaryFdaProductCodes: ['QBJ', 'CGA'],
    keyConsensusStandards: ['21 CFR 862.1355 (iCGM Special Controls)', 'CLSI POCT12-A3'],
    description:
      'Glycemic monitoring across euglycemic, hyperglycemic, and hypoglycemic states. Regulatory clearance evaluates MARD against laboratory glucose oxidase analyzers during venous glucose clamp protocols.',
  },
  {
    id: 'womens_health',
    name: "Women's Health & Ovulation",
    shortName: "Women's Health",
    tagline: 'Serial Follicular Ultrasound and Quantitative Serum Immunoassay vs. Basal Body Temperature',
    primaryUnit: 'ovulation day',
    isPriorityTop5: false,
    clinicalEndpoints: ['Retrospective Ovulation Confirmation', 'Fertile Window Prediction', 'LH Surge Detection', 'Luteal Phase Length'],
    primaryFdaProductCodes: ['OTH', 'JFG', 'QHI'],
    keyConsensusStandards: ['FDA 2018 Digital Fertility Software Guidance', 'CLSI I/LA21-A2'],
    description:
      'Menstrual cycle and ovulatory tracking. Diagnostic ground truth is serial transvaginal ultrasound confirming dominant follicle collapse alongside daily serum endocrine blood assays (LH, E2, P4).',
  },
  {
    id: 'cardiorespiratory',
    name: 'Cardiorespiratory Fitness (VO2 Max)',
    shortName: 'VO2 Max & Resp',
    tagline: 'Breath-by-Breath Gas Exchange Calorimetry and Submaximal Wearable VO2max Estimation',
    primaryUnit: 'mL/kg/min',
    isPriorityTop5: false,
    clinicalEndpoints: ['Maximal Oxygen Uptake (VO2max)', 'Ventilatory Thresholds (VT1/VT2)', 'Exercise Respiration Rate', 'Respiratory Exchange Ratio (RER)'],
    primaryFdaProductCodes: ['BZO', 'BZQ'],
    keyConsensusStandards: ['ISO 80601-2-55:2018', 'ACSM Guidelines for Exercise Testing', 'INTERLIVE VO2max Validation Statement'],
    description:
      'Aerobic capacity and respiratory mechanics. Gold standard requires indirect calorimetry metabolic carts analyzing expired O2 and CO2 concentrations during graded exercise tests to exhaustion.',
  },
  {
    id: 'activity_calories',
    name: 'Activity & Energy Expenditure',
    shortName: 'Steps & Calories',
    tagline: 'Step Counting, Raw Accelerometry, and Free-Living Doubly Labeled Water Caloric Burn',
    primaryUnit: 'steps / kcal',
    isPriorityTop5: false,
    clinicalEndpoints: ['Cadence-Stratified Step Count', 'Total Daily Energy Expenditure (TDEE)', 'MVPA / ENMO Volume', 'MET Minutes'],
    primaryFdaProductCodes: ['LXH'],
    keyConsensusStandards: ['CTA-2056 Step Counting Standard', 'IAEA Doubly Labeled Water Standard Protocol'],
    description:
      'Human motion bioenergetics. Step count gold standard is dual-rater high-speed video annotation; free-living caloric expenditure gold standard is the doubly labeled water (2H2 18O) mass spectrometry method.',
  },
  {
    id: 'eda_stress',
    name: 'Electrodermal Activity (EDA) & Stress',
    shortName: 'EDA / Stress',
    tagline: 'Laboratory Constant-Voltage Palmar Skin Conductance vs. Wearable cEDA Electrodes',
    primaryUnit: 'µS',
    isPriorityTop5: false,
    clinicalEndpoints: ['Skin Conductance Level (SCL)', 'Non-Specific Skin Conductance Responses (NS.SCRs)', 'Sympathetic Arousal Latency', 'Tonic vs. Phasic Decomposition'],
    primaryFdaProductCodes: ['GZO'],
    keyConsensusStandards: ['Society for Psychophysiological Research (SPR) EDA Guidelines'],
    description:
      'Sudomotor nerve activity driven by sympathetic autonomic activation. Laboratory gold standard uses 0.5V DC constant-voltage circuits with Ag/AgCl wet gel electrodes on palmar or medial phalanx sites.',
  },
];

export const REFERENCE_DEVICES: ReferenceDevice[] = [
  ...HR_DEVICES,
  ...CORE_VITAL_DEVICES.filter((d) => d.domainId === 'spo2'),
  ...SLEEP_DEVICES,
  ...CORE_VITAL_DEVICES.filter((d) => d.domainId !== 'spo2'),
  ...EXPANDED_DOMAINS_DEVICES,
];
