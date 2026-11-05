import type { ReferenceDevice } from '../types.ts';

export const CORE_VITAL_DEVICES: ReferenceDevice[] = [
  // =========================================================================
  // DOMAIN 2: BLOOD OXYGEN SATURATION (SpO2)
  // =========================================================================
  {
    id: 'radiometer-abl90-flex',
    name: 'Radiometer ABL90 FLEX CO-Oximeter',
    vendor: 'Radiometer Medical ApS',
    model: 'ABL90 FLEX / ABL90 FLEX PLUS',
    domainId: 'spo2',
    tier: 'gold',
    tagline: 'The multi-wavelength benchtop blood gas CO-oximetry reference required for FDA SpO2 pivotal trials',
    summary:
      'The absolute regulatory criterion standard for blood oxygenation. Directly hemolyzes arterial blood samples and measures multi-wavelength optical absorbance across 128 wavelengths to calculate fractional SaO2, FO2Hb, FCOHb, and MetHb.',
    regulatory: {
      clearancePathway: 'In Vitro Diagnostic',
      clearanceNumber: 'K092686',
      productCode: 'GHS',
      regulationNumber: '21 CFR 864.5620',
      predicateChain: 'Radiometer ABL800 Series Benchtop Blood Gas Analyzers',
      consensusStandards: ['CLSI C46-A2 (Blood Gas & pH)', 'ISO 80601-2-61:2019 Clause 201.12.1.101'],
      reportedClearanceResults: [
        { metric: 'SaO2 Precision (repeatability)', value: 'SD < 0.25%', context: 'Whole blood repeated draws at normoxic levels' },
        { metric: 'SaO2 Dynamic Range', value: '0.0% to 100.0%', context: 'Multi-wavelength spectrophotometry across 128 diodes' },
        { metric: 'Analytical Trueness', value: 'Bias < 0.1%', context: 'Standardized bovine and human hemolysate controls' },
      ],
    },
    dataPipeline: {
      fileFormats: ['CSV', 'XML', 'HL7', 'ASTM messaging protocol'],
      exportMethod: 'USB Flash Drive export or direct Ethernet connection to clinical laboratory database',
      easeScore: 4,
      easeSummary:
        'Tidy, tabular CSV files exported directly to USB with exact blood aspiration timestamps down to the second.',
      licensingPaywall: 'Free direct USB export; no proprietary gate on exported data',
      rawSignalAccess: true,
    },
    synchronization: {
      nativeSamplingRate: 'Discrete spot draws (typically 20–30 arterial samples per participant desaturation run)',
      auxiliaryStreams: ['PaO2', 'PaCO2', 'pH', 'Hemoglobin concentration (ctHb)', 'Carboxyhemoglobin (FCOHb)', 'Methemoglobin (MetHb)'],
      syncHardware: ['Network Time Protocol (NTP) via Ethernet jack', 'Internal real-time clock'],
      clockDriftPpm: 10,
      alignmentNotes:
        'Blood samples are drawn into heparinized syringes during stable 30-second hypoxic plateaus. The exact second of blood entry into the syringe must be logged via electronic time-stamp or synchronized video.',
    },
    economics: {
      capexRange: '$28,000 – $45,000 (often placed on reagent rental contracts)',
      opexOrSubscription: '$3,000/year service & membrane maintenance agreement',
      consumablesRequired: [
        'Radial arterial catheter kits ($85/kit)',
        'Heparinized SafePICO blood gas syringes ($3.50/syringe)',
        'ABL90 Sensor Cassette (300-test pack, $1,800)',
        'Calibration gas cylinder pack ($450)',
      ],
      perSubjectConsumableCost: 185.0,
      shelfLifeAlert:
        'Sensor cassettes have a strict 30-day onboard shelf-life once unsealed; expires automatically regardless of test count.',
      calibration: {
        intervalMonths: 1,
        type: 'Continuous automatic 2-point liquid and optical calibration every 4 hours',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: true,
      },
      vendorSupport: {
        hqLocation: 'Copenhagen, Denmark / Brea, CA, USA',
        supportTimezone: 'CET (UTC+1) / PST (UTC-8)',
        clinicalSupportTier: '24/7 hospital clinical laboratory support with guaranteed on-site technician dispatch',
      },
    },
    strengths: [
      'The ONLY legally defensible ground truth comparator for FDA 510(k) pulse oximetry clearance',
      'Measures dysfunctional hemoglobins (carboxyhemoglobin and methemoglobin) that fool optical pulse oximeters',
      'Zero susceptibility to motion artifact, skin tone pigmentation, or peripheral vasoconstriction',
    ],
    limitations: [
      'Requires radial arterial line placement by an anesthesiologist or certified critical care physician',
      'Invasive protocol carries human subject risks (hematoma, arterial spasm, infection) requiring full IRB review',
      'Cannot provide a continuous second-by-second signal; only discrete point samples during respiratory plateaus',
    ],
    fieldGotchas: [
      'Air bubble trap: even a tiny 50 µL air bubble trapped in the syringe tip rapidly equilibrates oxygen into the blood, driving a 70% SaO2 sample up to 80% before analysis. Syringes must be capped and run within 2 minutes.',
      'Radial artery spasm under chilling requires arm warming blankets to ensure free-flowing arterial draws.',
    ],
    measurementSd: 0.35,
    repeatabilityLimit: 0.97,
    studyInstrument: {
      formFactor: 'benchtop_clinical',
      typicalBatteryLife: 'Mains AC powered (with 30-min UPS battery backup)',
      dataGranularity: 'summary_only',
      granularityDetails:
        'Discrete arterial blood gas & CO-oximetry panel per syringe draw (`sO2`, `FO2Hb`, `FCOHb`, `FMetHb`, `FHHb`, `pO2`, `pCO2`, `pH`, `ctHb`) exported as timestamped CSV/XML rows.',
      offloadMechanism: 'direct_local_usb_sd',
      firmwareLockSupported: true,
      algorithmStabilityNotes:
        'CLIA/IVD diagnostic blood gas analyzer with locked 128-wavelength spectrophotometric calibration.',
      contractAndCostWalls: [
        'Requires an accredited hypnosis/desaturation laboratory with anesthesiologist coverage and arterial catheterization IRB approval.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: false,
        aasm30sSleepStaging: false,
        consumerSleepSummary: false,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'FDA 510(k) and ISO 80601-2-61 controlled desaturation pivotal trials (70%–100% SaO2) evaluating pulse oximeter accuracy across Monk/Fitzpatrick skin tones',
      ],
      doNotUseFor: [
        'Ambulatory, home, or sleep monitoring (invasive arterial line in-lab procedure only)',
      ],
      cohortConsiderations: {
        agingAndNeuro: 'Restricted to healthy volunteers in controlled hypoxia studies or ICU patients with existing arterial lines.',
        arrhythmiaAndEctopy: 'Direct hemolyzed blood spectrophotometry is unaffected by cardiac rhythm.',
        skinToneAndPerfusion: 'Zero optical skin barrier; serves as the unbiased ground truth to quantify skin-tone bias in optical wearables.',
      },
      validationCitations: [
        {
          authors: 'FDA 510(k) K092686 Summary (Radiometer Medical ApS)',
          year: 2010,
          title: 'ABL90 FLEX Blood Gas and CO-Oximetry Analyzer 510(k) Summary',
          journal: 'U.S. Food and Drug Administration CDRH Database',
          doiOrPmid: 'K092686',
          sampleSize: 'CLSI EP05-A2 precision and method comparison against ABL800 FLEX predicate',
          protocolContext: 'Whole-blood multi-wavelength CO-oximetry across 0–100% sO2',
          reportedResult: 'Within-run sO2 repeatability SD < 0.25%; total precision SD ≈ 0.30–0.35% across normoxic and hypoxic plateaus.',
        },
      ],
      measurementSdSource:
        'Derived from FDA 510(k) K092686 and ISO 80601-2-61 Annex EE CO-oximeter reference precision (SD ≈ 0.35% SaO2).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'masimo-radical-7',
    name: 'Masimo Radical-7 with SET',
    vendor: 'Masimo Corporation',
    model: 'Radical-7 / Rad-97 (Signal Extraction Technology)',
    domainId: 'spo2',
    tier: 'silver',
    tagline: 'The clinical pulse oximetry workhorse with raw plethysmogram streaming and motion tolerance',
    summary:
      'The preeminent clinical reference pulse oximeter in medical device validation. Masimo SET signal extraction technology separates the arterial signal from venous noise during motion and low perfusion, providing pleth waveforms at 62.5 Hz.',
    regulatory: {
      clearancePathway: '510(k)',
      clearanceNumber: 'K170564',
      productCode: 'DQA',
      regulationNumber: '21 CFR 870.2700',
      predicateChain: 'Masimo Radical Pulse Oximeter (K990966) & CO-Oximetry',
      consensusStandards: ['ISO 80601-2-61:2019', 'IEC 60601-1', 'ISO 10993-1'],
      reportedClearanceResults: [
        { metric: 'Arms Accuracy (70–100%, Non-Motion)', value: '1.5%', context: 'Multi-center controlled desaturation study vs blood gas CO-oximetry' },
        { metric: 'Arms Accuracy (70–100%, Motion)', value: '3.0%', context: 'Rubbing and tapping motion protocol per ISO 80601-2-61' },
        { metric: 'Pulse Rate Accuracy', value: '± 3 bpm', context: 'Non-motion and motion conditions vs ECG' },
      ],
    },
    dataPipeline: {
      fileFormats: ['TrendCom ASCII serial protocol', 'CSV via Masimo UniView', 'Analog 0–1V pleth voltage'],
      exportMethod: 'RS-232 Serial Port (RJ45 connector) or Analog BNC Output Jack',
      easeScore: 3,
      easeSummary:
        'Requires custom RJ45-to-DB9/USB serial cables and parsing the TrendCom ASCII protocol. Real-time logging requires continuous active serial connection.',
      licensingPaywall: 'Hardware cable costs; free open TrendCom protocol documentation',
      rawSignalAccess: true,
    },
    synchronization: {
      nativeSamplingRate: '62.5 Hz (raw plethysmogram) and 1 Hz (SpO2 / PR parameters)',
      auxiliaryStreams: ['Perfusion Index (PI)', 'Pleth Variability Index (PVI)', 'Pulse waveform envelope', 'Respiration rate (RRa)'],
      syncHardware: ['Analog BNC 0–1V plethysmogram output', 'Serial packet timestamps'],
      clockDriftPpm: 25,
      alignmentNotes:
        'The analog BNC port outputs an unfiltered 0–1V plethysmogram waveform in real time with < 10 ms delay. Connect this into an auxiliary ADC on the wearable test-rig for beat-to-beat optical alignment.',
    },
    economics: {
      capexRange: '$3,800 – $5,500 per monitor',
      opexOrSubscription: 'None for basic monitoring',
      consumablesRequired: [
        'RD SET single-patient adhesive sensors ($18/sensor)',
        'RD SET reusable adult finger clips ($190/clip)',
      ],
      perSubjectConsumableCost: 18.0,
      calibration: {
        intervalMonths: 12,
        type: 'Factory optical probe calibration; internal self-test on boot',
        rmaTurnaroundWeeks: 2,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Irvine, CA, USA',
        supportTimezone: 'PST (UTC-8)',
        clinicalSupportTier: 'Dedicated clinical research equipment loaner pool and responsive biomedical tech support',
      },
    },
    strengths: [
      'Universally recognized by FDA reviewers as the standard non-invasive pulse oximetry comparator',
      'Provides Perfusion Index (PI), allowing automated data rejection when peripheral blood flow drops below 0.3%',
      'Single-patient RD SET adhesive wraps prevent ambient room light contamination much better than rigid clips',
    ],
    limitations: [
      'Still an optical pulse oximeter: exhibits slight positive bias on dark skin tones (Monk 8–10) under severe hypoxemia',
      'Serial RJ45 data pipeline requires custom hardware adapters and dedicated serial reader scripts',
      'Reusable finger clips become loose during vigorous arm exercise',
    ],
    fieldGotchas: [
      'Ambient light leak: surgical operatory lamps or direct sunlight shining on the probe wrap can inject artificial optical DC offsets that lock SpO2 onto 99% regardless of true oxygenation. Always shield sensors with opaque black wrap.',
      'Cold hands / Raynaud syndrome: participants with cold fingers lose pulsatile AC amplitude, causing Perfusion Index to collapse and the Masimo to report dashes.',
    ],
    measurementSd: 0.95,
    repeatabilityLimit: 2.63,
    studyInstrument: {
      formFactor: 'benchtop_clinical',
      typicalBatteryLife: '4 hours internal handheld battery; continuous on AC docking station',
      dataGranularity: 'raw_waveform',
      granularityDetails:
        '1 Hz SpO2, PR, Perfusion Index (PI), and PVI via RS-232 serial ASCII stream, plus continuous 62.5 Hz digital/analog plethysmogram waveform.',
      offloadMechanism: 'direct_local_usb_sd',
      firmwareLockSupported: true,
      algorithmStabilityNotes:
        'Hospital medical device with locked Masimo SET DSP firmware and selectable averaging windows (2s, 4s, 8s, 16s).',
      contractAndCostWalls: [
        'No recurring software fees when logging via RS-232 serial or analog BNC.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: false,
        aasm30sSleepStaging: false,
        consumerSleepSummary: false,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'Non-invasive Silver reference comparator for formative SpO2 algorithm development and overnight sleep lab desaturation studies',
        'Real-time Perfusion Index (PI) quality gating during optical wearable testing',
      ],
      doNotUseFor: [
        'Final FDA 510(k) pivotal SpO2 clearance without arterial blood gas CO-oximetry (ISO 80601-2-61 requires arterial SaO2, not a secondary pulse oximeter)',
        'Free-living multi-week home wear',
      ],
      cohortConsiderations: {
        agingAndNeuro: 'Bedside/tethered finger adhesive sensor is well tolerated for single-night sleep studies.',
        arrhythmiaAndEctopy: 'Masimo SET tracks pulse rate reliably through mild ectopy.',
        skinToneAndPerfusion: 'Perfusion Index readout directly quantifies peripheral vasoconstriction; adhesive RD SET wrap minimizes optical shunt.',
      },
      validationCitations: [
        {
          authors: 'FDA 510(k) K170564 Summary (Masimo Corporation)',
          year: 2017,
          title: 'Rad-97 / Radical-7 Pulse CO-Oximeter with RD SET Sensors 510(k) Summary',
          journal: 'U.S. Food and Drug Administration CDRH Database',
          doiOrPmid: 'K170564',
          sampleSize: 'Controlled desaturation 70–100% SaO2 against arterial CO-oximetry',
          protocolContext: 'ISO 80601-2-61 no-motion and motion protocols',
          reportedResult: 'SpO2 Arms = 1.5% (no motion) and 3.0% (motion) across 70–100% saturation.',
        },
      ],
      measurementSdSource:
        'Derived from normoxic/mild-hypoxic repeatability and FDA K170564 non-motion Arms (1.5% across 70–100%; ~0.95% SD in the 85–100% ambulatory band).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'nonin-onyx-vantage-9590',
    name: 'Nonin Onyx Vantage 9590',
    vendor: 'Nonin Medical, Inc.',
    model: 'Onyx Vantage 9590',
    domainId: 'spo2',
    tier: 'bronze',
    tagline: 'Portable spot-check fingertip pulse oximeter for outpatient clinical screening',
    summary:
      'A rugged, self-contained finger-clip pulse oximeter widely used in triage and outpatient medicine. Convenient for rapid screening, but lacks raw optical plethysmogram data logging and high-frequency digital sync capabilities.',
    regulatory: {
      clearancePathway: '510(k)',
      clearanceNumber: 'K111585',
      productCode: 'DQA',
      regulationNumber: '21 CFR 870.2700',
      predicateChain: 'Nonin Onyx II 9550 Pulse Oximeter (K070857)',
      consensusStandards: ['ISO 80601-2-61:2019', 'IEC 60601-1-2'],
      reportedClearanceResults: [
        { metric: 'Arms Accuracy (70–100%)', value: '2.0%', context: 'Non-motion testing on healthy adult volunteers' },
        { metric: 'Low Perfusion Arms', value: '2.0%', context: 'Tested under simulated low optical modulation' },
      ],
    },
    dataPipeline: {
      fileFormats: ['None (Visual LED display only; see Nonin 3150 WristOx2 for BLE/USB logging)'],
      exportMethod: 'Manual transcription into electronic Case Report Form (eCRF) or video recording',
      easeScore: 1,
      easeSummary:
        'No digital data port on the 9590 spot-check unit. Requires manual double-entry transcription (or upgrading to the Nonin WristOx2 3150 for BLE/USB CSV logging).',
      licensingPaywall: 'Zero / Standalone device',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: '1 Hz update rate on internal LED display',
      auxiliaryStreams: ['Tricolor pulse quality LED indicator'],
      syncHardware: ['None'],
      clockDriftPpm: 0,
      alignmentNotes:
        'Cannot be digitally synchronized. Only suitable for static spot-check epochs where the participant sits completely motionless for >= 30 seconds.',
    },
    economics: {
      capexRange: '$160 – $220 per unit',
      opexOrSubscription: 'None',
      consumablesRequired: ['AAA alkaline batteries', 'Alcohol sanitizing wipes'],
      perSubjectConsumableCost: 0.25,
      calibration: {
        intervalMonths: 0,
        type: 'Factory pre-calibrated; no field calibration possible',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Plymouth, MN, USA',
        supportTimezone: 'CST (UTC-6)',
        clinicalSupportTier: 'Standard medical equipment distributor support',
      },
    },
    strengths: [
      'Self-contained, pocket-sized, and instantly operational with two AAA batteries',
      'Solid clinical accuracy under static, resting conditions in healthy populations',
      'Proven PureSAT LED sensor optics with long battery life (up to 6,000 spot checks)',
    ],
    limitations: [
      'Complete lack of digital data export on the 9590 model: data entry is manual and vulnerable to transcription errors',
      'No raw plethysmogram waveform or quantitative perfusion index output',
      'Spring-loaded finger clip easily slips off or introduces motion artifacts during any arm movement',
    ],
    fieldGotchas: [
      'Fingernail polish trap: dark purple, blue, or black nail polish absorbs red/infrared wavelengths, causing false desaturation readings or signal acquisition failure. Always keep acetone pads on site.',
      'Transcription rounding: study coordinators tend to record "98%" repeatedly due to visual anchoring.',
    ],
    measurementSd: 1.65,
    repeatabilityLimit: 4.57,
    studyInstrument: {
      formFactor: 'fingertip_clip',
      typicalBatteryLife: '~6,000 spot checks (36 hours continuous) on 2 AAA batteries',
      dataGranularity: 'summary_only',
      granularityDetails:
        'Visual LED spot-check display of SpO2 (%) and Pulse Rate (bpm) only. (For continuous 1 Hz/4 Hz digital logging, use the Nonin WristOx2 3150 instead).',
      offloadMechanism: 'manual_entry',
      firmwareLockSupported: true,
      algorithmStabilityNotes: 'Fixed embedded Nonin PureSAT microcontroller firmware (no OTA updates).',
      contractAndCostWalls: ['Zero software or subscription walls, but manual eCRF entry is required.'],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: false,
        aasm30sSleepStaging: false,
        consumerSleepSummary: false,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'In-clinic baseline vital sign screening and resting normoxia spot checks',
      ],
      doNotUseFor: [
        'Continuous overnight sleep oximetry or automated time-series validation (use Masimo Radical-7 or Nonin WristOx2 3150)',
      ],
      cohortConsiderations: {
        agingAndNeuro: 'Simple 30-second fingertip spot check during clinic vitals intake.',
        arrhythmiaAndEctopy: 'Tricolor pulse quality LED blinks amber/red when pulse amplitude is irregular.',
        skinToneAndPerfusion: 'Independent academic hypoxia studies (e.g., Bikker et al. / UCSF OpenOximetry) have evaluated Nonin PureSAT across skin tones.',
      },
      validationCitations: [
        {
          authors: 'FDA 510(k) K111585 Summary (Nonin Medical, Inc.)',
          year: 2011,
          title: 'Nonin Onyx Vantage 9590 Finger Pulse Oximeter 510(k) Summary',
          journal: 'U.S. Food and Drug Administration CDRH Database',
          doiOrPmid: 'K111585',
          sampleSize: 'Controlled desaturation 70–100% SaO2 per ISO 80601-2-61',
          protocolContext: 'Static fingertip comparison against arterial CO-oximetry',
          reportedResult: 'Arms <= 2.0% across 70–100% SaO2 under non-motion and low-perfusion conditions.',
        },
      ],
      measurementSdSource:
        'Derived from FDA 510(k) K111585 Arms specification (<= 2.0% across 70–100%; ~1.65% SD in resting spot-check conditions).',
      reviewStatus: 'draft',
    },
  },

  // =========================================================================
  // DOMAIN 4: BLOOD PRESSURE & ARTERIAL HEMODYNAMICS
  // =========================================================================
  {
    id: 'iso-auscultation-dual-observer',
    name: 'Dual-Observer Auscultation (ISO 81060-2)',
    vendor: 'Clinical Reference Standard (Welch Allyn / Baumanometer)',
    model: 'Calibrated Mercury / Tycos Aneroid Sphygmomanometer w/ Dual-Teaching Y-Stethoscope',
    domainId: 'bp',
    tier: 'gold',
    tagline: 'The definitive non-invasive regulatory clinical reference standard for blood pressure validation',
    summary:
      'The regulatory benchmark mandated by ISO 81060-2:2018 for blood pressure clearance. Two independent, certified clinical observers listen simultaneously through a dual-earpiece teaching stethoscope to identify Korotkoff phase I (systolic) and phase V (diastolic) sounds.',
    regulatory: {
      clearancePathway: 'Exempt',
      clearanceNumber: 'Gold Standard Benchmark Protocol',
      productCode: 'DXN',
      regulationNumber: '21 CFR 870.1110',
      predicateChain: 'Criterion standard against which all automated sphygmomanometers are cleared',
      consensusStandards: ['ISO 81060-2:2018 / AMD 1:2020', 'ANSI/AAMI/ISO 81060-1', 'AHA 2019 Blood Pressure Measurement Guidelines'],
      reportedClearanceResults: [
        { metric: 'Maximum Mean Error (Bias)', value: '<= ± 5.0 mmHg', context: 'Mandated criterion across >= 85 subjects (Criterion 1)' },
        { metric: 'Maximum Standard Deviation', value: '<= 8.0 mmHg', context: 'Standard deviation of paired observer-to-device differences' },
        { metric: 'Subject-Level Standard Deviation', value: '<= 6.9 mmHg', context: 'Between-subject variance cap under ISO 81060-2 Criterion 2' },
      ],
    },
    dataPipeline: {
      fileFormats: ['Dual-entry electronic Case Report Forms (eCRF)', 'Tidy CSV'],
      exportMethod: 'Direct dual-investigator entry into clinical EDC (e.g. Medidata Rave or REDCap)',
      easeScore: 4,
      easeSummary:
        'Standard structured data entry; requires strict blinding where Observer 1 and Observer 2 record values without verbal interaction.',
      licensingPaywall: 'Zero licensing cost; high clinical coordinator labor cost',
      rawSignalAccess: true,
    },
    synchronization: {
      nativeSamplingRate: 'Discrete spot determinations (3 paired valid determinations per subject separated by 60s)',
      auxiliaryStreams: ['Arm circumference measurement', 'Deflation rate tracking (2–3 mmHg/sec)', 'Stethoscope acoustic audio (optional)'],
      syncHardware: ['Manual timestamp logging'],
      clockDriftPpm: 0,
      alignmentNotes:
        'Auscultation takes 30–45 seconds per determination. Record the exact cuff inflation onset and deflation completion timestamps to align with continuous optical wearable streams.',
    },
    economics: {
      capexRange: '$400 – $1,200 (Tycos certified calibrated aneroid + 3M Littmann Master Classic Teaching Stethoscope)',
      opexOrSubscription: '$150 – $300/subject in certified clinical research coordinator labor fees',
      consumablesRequired: ['Multi-size cuff bladders (Small Adult, Adult, Large Adult, Thigh)', 'Alcohol prep pads'],
      perSubjectConsumableCost: 3.5,
      calibration: {
        intervalMonths: 1,
        type: 'Monthly verification against calibrated mercury column or dead-weight tester',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: true,
      },
      vendorSupport: {
        hqLocation: 'Clinical research site standard (Welch Allyn / Hillrom, Skaneateles Falls, NY, USA)',
        supportTimezone: 'Site local timezone',
        clinicalSupportTier: 'Certified clinical research monitor training required',
      },
    },
    strengths: [
      'The single universally accepted regulatory truth for non-invasive blood pressure across FDA, PMDA, and CE-MDR',
      'Dual-observer simultaneous auscultation controls for individual hearing fatigue and terminal digit preference',
      'Directly measures true arterial acoustic collapse rather than relying on mathematical oscillometric envelope peak estimation',
    ],
    limitations: [
      'High clinical labor intensity: requires two highly trained, certified clinical observers and an adjudicator',
      'Susceptible to observer bias if blinding is compromised, or terminal digit preference (rounding to 0 or 5)',
      'Cannot provide continuous beat-to-beat pressure; restricted to intermittent static rest epochs',
    ],
    fieldGotchas: [
      'Cuff size mismatch trap: using a standard adult cuff on a large arm causes falsely elevated readings (up to 10 mmHg high). Cuff bladder length MUST encircle 75–100% of the arm circumference.',
      'Deflation speed: deflating faster than 3 mmHg/sec causes observers to systematically underestimate systolic pressure.',
    ],
    measurementSd: 1.8,
    repeatabilityLimit: 4.99,
    studyInstrument: {
      formFactor: 'arm_cuff',
      typicalBatteryLife: 'Manual pneumatic inflation (no battery required)',
      dataGranularity: 'summary_only',
      granularityDetails:
        'Blinded dual-observer SBP (Korotkoff K1) and DBP (Korotkoff K5) determinations in mmHg; any determination where Observer 1 and Observer 2 differ by > 4 mmHg is excluded and repeated per ISO 81060-2.',
      offloadMechanism: 'manual_entry',
      firmwareLockSupported: true,
      algorithmStabilityNotes: 'Standardized human acoustic protocol governed by ISO 81060-2:2018.',
      contractAndCostWalls: ['Requires 2 trained clinical observers and 1 supervisor per session.'],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: false,
        aasm30sSleepStaging: false,
        consumerSleepSummary: false,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'FDA 510(k) and ISO 81060-2 clinical validation of cuff-based and cuffless blood pressure monitors',
        'In-clinic baseline reference calibration for pulse transit time (PTT) wearables',
      ],
      doNotUseFor: [
        '24-hour ambulatory or nocturnal sleep blood pressure monitoring (use SunTech Oscar 2 ABPM)',
      ],
      cohortConsiderations: {
        agingAndNeuro: 'In older adults with calcified arteries, screen for the auscultatory gap by palpating radial pulse obliteration pressure before inflating.',
        arrhythmiaAndEctopy: 'Beat-to-beat stroke volume variation in atrial fibrillation requires averaging >= 3 consecutive determinations.',
        skinToneAndPerfusion: 'Acoustic brachial Korotkoff detection has zero optical skin-tone dependency.',
      },
      validationCitations: [
        {
          authors: 'ISO 81060-2:2018 / AAMI / ESH / ISO Universal Standard (Stergiou et al.)',
          year: 2018,
          title: 'A Universal Standard for the Validation of Blood Pressure Measuring Devices: AAMI/ESH/ISO Collaboration Statement',
          journal: 'Hypertension',
          doiOrPmid: '10.1161/HYPERTENSIONAHA.117.10237',
          sampleSize: 'Minimum n = 85 subjects with >= 255 valid paired determinations',
          protocolContext: 'Same-arm sequential or simultaneous dual-observer mercury/calibrated manometer protocol',
          reportedResult: 'Inter-observer agreement required within <= 4 mmHg on every valid determination (SD between observers <= 1.8 mmHg).',
        },
      ],
      measurementSdSource:
        'Derived from ISO 81060-2:2018 dual-observer concordance constraint (<= 4 mmHg max difference between blinded observers => reference SD ≈ 1.8 mmHg).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'suntech-oscar-2',
    name: 'SunTech Oscar 2 ABPM',
    vendor: 'SunTech Medical, Inc. (Halma)',
    model: 'Oscar 2 with Orbit Cuff & SphygmoCor Inside',
    domainId: 'bp',
    tier: 'silver',
    tagline: 'The clinical reference standard for 24-hour ambulatory blood pressure monitoring (ABPM) and nocturnal dipping',
    summary:
      'The clinical trial workhorse for 24-hour ambulatory blood pressure measurement. Uses proprietary SunTech motion-tolerant oscillometry and the patented stretch-sleeve Orbit cuff to measure diurnal blood pressure and nocturnal dipping.',
    regulatory: {
      clearancePathway: '510(k)',
      clearanceNumber: 'K011508 / K091926',
      productCode: 'DXN',
      regulationNumber: '21 CFR 870.1130',
      predicateChain: 'SunTech Oscar 2 (K011508) & AtCor SphygmoCor CP (K073217)',
      consensusStandards: ['ISO 81060-2:2018', 'ESH International Protocol 2010', 'BHS Protocol Grade A/A'],
      reportedClearanceResults: [
        { metric: 'BHS Protocol Grade', value: 'Grade A / A', context: 'Top accuracy grade for both systolic and diastolic pressure (Goodwin et al. 2007)' },
        { metric: 'Mean Error (SBP)', value: '0.0 ± 6.9 mmHg', context: 'ESH / BHS validation vs dual-observer mercury sphygmomanometer' },
        { metric: 'Mean Error (DBP)', value: '-1.0 ± 6.2 mmHg', context: 'ESH / BHS validation vs dual-observer mercury sphygmomanometer' },
      ],
    },
    dataPipeline: {
      fileFormats: ['AccuWin Pro CSV', 'Proprietary SQLite database', 'Summary PDF reports'],
      exportMethod: 'USB PC Interface Cable via AccuWin Pro v4 Software',
      easeScore: 4,
      easeSummary:
        'AccuWin Pro exports clean, structured CSV tables containing every inflation timestamp, SBP, DBP, MAP, pulse, and error flags.',
      licensingPaywall: 'AccuWin software license included with hardware purchase',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: 'Discrete programmed intervals (typically every 15–20 min awake, 30 min asleep)',
      auxiliaryStreams: ['Oscillometric pulse pressure amplitude', 'Cuff inflation pressure trace', 'Error code status (e.g. motion abort)'],
      syncHardware: ['USB PC clock synchronization during device initialization'],
      clockDriftPpm: 20,
      alignmentNotes:
        'Oscars synchronize with the host PC clock when programmed. Ensure the host PC runs NTP time so Oscar inflation marks align with wearable clock times within 1 second.',
    },
    economics: {
      capexRange: '$2,200 – $2,800 per recorder kit',
      opexOrSubscription: 'None (software license is perpetual)',
      consumablesRequired: ['Orbit washable Lycra stretch cuffs ($45/cuff)', 'AA alkaline or NiMH rechargeable batteries ($1/run)'],
      perSubjectConsumableCost: 4.0,
      calibration: {
        intervalMonths: 12,
        type: 'Annual pneumatic pressure transducer verification',
        rmaTurnaroundWeeks: 2,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Morrisville, NC, USA',
        supportTimezone: 'EST (UTC-5)',
        clinicalSupportTier: 'Direct responsive medical device engineering team in North Carolina',
      },
    },
    strengths: [
      'The recognized reference standard for capturing naturalistic 24-hour ambulatory blood pressure and nocturnal dipping',
      'Patented Orbit cuff has an elastic sleeve that prevents cuff slippage down the participant arm during overnight wear',
      'Motion-tolerant algorithm re-inflates automatically if a movement artifact corrupts the primary pressure pulse train',
    ],
    limitations: [
      'Discrete intermittent readings: cannot capture rapid transient pressure surges during sudden emotional stress or lifting',
      'Sleep disruption: inflation pump noise and arm pressure wake light sleepers, artificially elevating nocturnal blood pressure',
      'No access to raw pneumatic oscillometric pulse waveform voltage envelopes',
    ],
    fieldGotchas: [
      'Kinked tubing: during sleep, if the participant rolls onto the air hose, the Oscar aborts the read and triggers an error alarm that awakens the subject.',
      'Active walking: if a participant walks briskly while an inflation starts, the device will fail or inflate up to 240 mmHg causing acute discomfort. Instruct participants to hold their arm still when they feel the cuff start.',
    ],
    measurementSd: 2.8,
    repeatabilityLimit: 7.76,
    studyInstrument: {
      formFactor: 'arm_cuff',
      typicalBatteryLife: '24–48 hours (up to 200 inflations) on 2 AA batteries',
      dataGranularity: 'epoch_1m_to_5m',
      granularityDetails:
        'Exports discrete programmed measurements (e.g., every 15–30 minutes over 24–48 hours) containing timestamp, SBP, DBP, MAP, HR, central aortic BP (on SphygmoCor model), and diagnostic event codes via AccuWin Pro CSV.',
      offloadMechanism: 'direct_local_usb_sd',
      firmwareLockSupported: true,
      algorithmStabilityNotes:
        'FDA Class II medical device with locked oscillometric firmware and no cloud re-scoring drift.',
      contractAndCostWalls: [
        'Perpetual desktop AccuWin Pro software license; no per-subject cloud fees.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: false,
        aasm30sSleepStaging: false,
        consumerSleepSummary: false,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        '24-hour ambulatory blood pressure and nocturnal dipping (non-dipper / reverse-dipper) endpoints in cardiovascular and autonomic neurodegenerative trials',
        'Ambulatory reference comparator for cuffless optical BP wearables under ISO 81060-3 / IEEE 1708',
      ],
      doNotUseFor: [
        'Simultaneous undisturbed sleep architecture studies on the same night (cuff inflations every 30 minutes fragment slow-wave and REM sleep)',
        'Multi-week continuous wear',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Essential for diagnosing supine hypertension and nocturnal reverse-dipping in Parkinson disease and multiple system atrophy (MSA), but nocturnal cuff inflations can agitate dementia patients.',
        arrhythmiaAndEctopy:
          'Severe atrial fibrillation increases oscillometric envelope variability and retry rates.',
        skinToneAndPerfusion:
          'Pneumatic brachial oscillometry has zero optical skin-tone dependency.',
      },
      validationCitations: [
        {
          authors: 'Goodwin, J., Bilous, M., Winship, S., Finn, P., & Jones, S. C.',
          year: 2007,
          title: 'Validation of the Oscar 2 oscillometric 24-h ambulatory blood pressure monitor according to the British Hypertension Society protocol',
          journal: 'Blood Pressure Monitoring',
          doiOrPmid: '10.1097/MBP.0b013e3280acab1b',
          sampleSize: 'n = 85 adult subjects',
          protocolContext: 'BHS and ESH International Protocol validation against dual-observer mercury sphygmomanometry',
          reportedResult: 'Achieved BHS Grade A/A; mean SBP difference 0.0 ± 6.9 mmHg, mean DBP difference -1.0 ± 6.2 mmHg.',
        },
      ],
      measurementSdSource:
        'Derived from within-subject repeated oscillometric inflation repeatability on the SunTech Orbit cuff (~2.8 mmHg SD).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'withings-bpm-connect',
    name: 'Withings BPM Connect',
    vendor: 'Withings France SA',
    model: 'BPM Connect (WPM05)',
    domainId: 'bp',
    tier: 'bronze',
    tagline: 'Consumer automated oscillometric Wi-Fi / Bluetooth upper-arm blood pressure cuff',
    summary:
      'A widely used consumer connected upper-arm blood pressure monitor. Features an integrated LED dot matrix screen and direct Wi-Fi sync, ideal for patient-reported outcomes and consumer benchmarking, but unsuited as a sole regulatory reference.',
    regulatory: {
      clearancePathway: '510(k)',
      clearanceNumber: 'K190209',
      productCode: 'DXN',
      regulationNumber: '21 CFR 870.1130',
      predicateChain: 'Withings Wireless Blood Pressure Monitor (K133441)',
      consensusStandards: ['ISO 81060-2:2013', 'IEC 60601-1-2'],
      reportedClearanceResults: [
        { metric: 'Mean Error vs Auscultation', value: 'SBP: -0.6 ± 6.8 mmHg', context: 'Clinical evaluation per ISO 81060-2 on 85 subjects' },
        { metric: 'Mean Error (DBP)', value: '0.4 ± 5.9 mmHg', context: 'Clinical evaluation per ISO 81060-2 on 85 subjects' },
      ],
    },
    dataPipeline: {
      fileFormats: ['JSON via Withings Public Health Cloud API', 'CSV export via Withings Web Portal'],
      exportMethod: 'Direct Wi-Fi / Cellular / BLE upload to Withings Cloud',
      easeScore: 4,
      easeSummary:
        'Public cloud REST API provides automated retrieval of readings; raw oscillometric pressure curves are not available.',
      licensingPaywall: 'Free public developer API with OAuth 2.0 authentication',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: 'Discrete spot measurements',
      auxiliaryStreams: ['Heart rate', 'Battery status'],
      syncHardware: ['NTP via Wi-Fi sync on reading upload'],
      clockDriftPpm: 15,
      alignmentNotes:
        'Readings are timestamped by internal RTC synchronized via Wi-Fi NTP upon completion of measurement.',
    },
    economics: {
      capexRange: '$99 – $129 per cuff',
      opexOrSubscription: 'None',
      consumablesRequired: ['None (USB rechargeable battery)'],
      perSubjectConsumableCost: 0,
      calibration: {
        intervalMonths: 24,
        type: 'Factory pre-calibrated pressure transducer',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Issy-les-Moulineaux, France / Boston, MA, USA',
        supportTimezone: 'CET (UTC+1) / EST (UTC-5)',
        clinicalSupportTier: 'Withings Health Solutions clinical trial partner team',
      },
    },
    strengths: [
      'Direct Wi-Fi synchronization means readings upload automatically to the cloud without requiring a paired smartphone nearby',
      'Clean consumer industrial design with high participant compliance in home usability studies',
      'FDA 510(k) cleared under standard adult resting oscillometric claims',
    ],
    limitations: [
      'Fixed cuff size fits arms 22–42 cm (9–17 in); cannot fit large bariatric or pediatric participants, introducing cuff bladder bias',
      'No raw pneumatic pressure waveform data accessible to algorithm researchers',
      'Cloud data dependency: if participant Wi-Fi credentials change, data is stored locally and requires Bluetooth re-pairing',
    ],
    fieldGotchas: [
      'Talking during measurement: consumer participants frequently talk or gesture during inflations, causing false systolic spikes of 5–10 mmHg.',
      'Posture: measurements taken slouched on a soft couch without back support fail clinical validity requirements.',
    ],
    measurementSd: 3.5,
    repeatabilityLimit: 9.7,
    studyInstrument: {
      formFactor: 'arm_cuff',
      typicalBatteryLife: 'Up to 6 months per micro-USB charge (at 1–2 readings/day)',
      dataGranularity: 'summary_only',
      granularityDetails:
        'Timestamped spot SBP, DBP, and Pulse Rate readings pushed over Wi-Fi to the Withings Measure v2 REST API.',
      offloadMechanism: 'cloud_rest_api',
      firmwareLockSupported: false,
      algorithmStabilityNotes: 'FDA 510(k)-cleared oscillometric algorithm; Wi-Fi firmware updates are managed by Withings.',
      contractAndCostWalls: [
        'Free public REST API; cellular BPM Connect Pro variant available for trials with participants lacking home Wi-Fi.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: false,
        aasm30sSleepStaging: false,
        consumerSleepSummary: false,
        multiWeekHabitualCompliance: true,
      },
      useFor: [
        'Longitudinal home morning/evening resting blood pressure self-monitoring in decentralized trials',
      ],
      doNotUseFor: [
        'Nocturnal sleep blood pressure dipping (requires user button press to initiate inflation) or ISO 81060-2 reference validation',
      ],
      cohortConsiderations: {
        agingAndNeuro: 'One-piece semi-rigid cuff roll and single-button Wi-Fi upload are easy for older adults to self-administer.',
        arrhythmiaAndEctopy: 'Oscillometric accuracy decreases in uncontrolled atrial fibrillation.',
        skinToneAndPerfusion: 'Pneumatic cuff is invariant to skin tone.',
      },
      validationCitations: [
        {
          authors: 'Topouchian, J., Agnoletti, D., Blacher, J., Youssef, A., Ibanez, I., Khabouth, J., Khawaja, S., Beaino, L., & Asmar, R.',
          year: 2014,
          title: 'Validation of four automatic devices for self-measurement of blood pressure according to the international protocol of the European Society of Hypertension',
          journal: 'Vascular Health and Risk Management',
          doiOrPmid: '10.2147/VHRM.S65622',
          sampleSize: 'n = 33 subjects per ESH-IP / n = 85 per ISO 81060-2 (K190209)',
          protocolContext: 'Seated brachial auscultatory comparison',
          reportedResult: 'Passed ESH-IP and ISO 81060-2 criteria (SBP bias -0.6 ± 6.8 mmHg; DBP bias 0.4 ± 5.9 mmHg).',
        },
      ],
      measurementSdSource:
        'Derived from within-subject home self-measurement oscillometric repeatability (~3.5 mmHg SD).',
      reviewStatus: 'draft',
    },
  },

  // =========================================================================
  // DOMAIN 5: BODY & SKIN TEMPERATURE
  // =========================================================================
  {
    id: 'bodycap-e-celsius',
    name: 'BodyCAP e-Celsius Ingestible Pill',
    vendor: 'BodyCAP Medical',
    model: 'e-Celsius Performance / Medical System',
    domainId: 'temperature',
    tier: 'gold',
    tagline: 'Ingestible telemetry pill providing continuous gastrointestinal internal core body temperature',
    summary:
      'The definitive clinical physiological benchmark for human internal core body temperature. The participant swallows a miniaturized biocompatible capsule containing a calibrated thermistor, transmitting continuous core temperature data via 433 MHz RF to an external monitor.',
    regulatory: {
      clearancePathway: 'Exempt',
      clearanceNumber: 'CE-MDR Class IIb; FDA Investigational / 510(k) Exempt Research standard',
      productCode: 'FLL',
      regulationNumber: '21 CFR 880.2910',
      predicateChain: 'HQ Inc. CorTemp Telemetry Pill',
      consensusStandards: ['ISO 80601-2-56:2017', 'IEC 60601-1', 'ISO 10993 (Biocompatibility)'],
      reportedClearanceResults: [
        { metric: 'Core Temperature Accuracy', value: '± 0.1°C', context: 'Calibrated across 25.0°C to 45.0°C in NIST-traceable water bath' },
        { metric: 'Resolution', value: '0.01°C', context: 'Continuous internal temperature logging' },
        { metric: 'Esophageal Catheter Concordance', value: 'r = 0.985', context: 'Exercise thermoregulation trials in climatic chambers' },
      ],
    },
    dataPipeline: {
      fileFormats: ['CSV', 'ASCII tables via e-Viewer software'],
      exportMethod: 'Direct USB connection from e-Viewer monitor to PC',
      easeScore: 4,
      easeSummary:
        'Very clean CSV export containing row-by-row second-by-second timestamps and core temperature values in °C.',
      licensingPaywall: 'e-Viewer software is included with monitor purchase',
      rawSignalAccess: true,
    },
    synchronization: {
      nativeSamplingRate: 'User-configurable: samples every 15 seconds or 30 seconds continuously',
      auxiliaryStreams: ['RF signal strength indicator (RSSI)', 'Capsule battery level'],
      syncHardware: ['USB PC clock synchronization on e-Viewer receiver dock'],
      clockDriftPpm: 15,
      alignmentNotes:
        'The capsule transmits via 433 MHz RF to the pocket monitor. When the monitor is docked to PC, timestamps are synchronized with PC system time. Excellent for aligning thermal lag with wearable skin sensors.',
    },
    economics: {
      capexRange: '$2,800 – $3,500 (e-Viewer monitor + activation dock)',
      opexOrSubscription: 'None',
      consumablesRequired: ['Single-use sterile ingestible e-Celsius pills ($75 – $95 per capsule)'],
      perSubjectConsumableCost: 85.0,
      shelfLifeAlert:
        'Capsules have an internal battery shelf life of 18 months in dormant state prior to magnetic activation.',
      calibration: {
        intervalMonths: 0,
        type: 'Factory 3-point water-bath calibration with NIST-traceable certificate per pill',
        rmaTurnaroundWeeks: 2,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Caen, France',
        supportTimezone: 'CET (UTC+1)',
        clinicalSupportTier: 'Direct responsive support from biomedical engineers in France; lead time on sterile pill orders is 3–4 weeks',
      },
    },
    strengths: [
      'True internal core temperature measurement: unaffected by cutaneous vasoconstriction, sweat evaporation, or ambient wind chill',
      'Far better tolerated by conscious research participants than invasive rectal or esophageal thermistor probes',
      'NIST-traceable calibration certificate provided with every single capsule blister pack',
    ],
    limitations: [
      'Gastrointestinal transit time: capsule is naturally excreted within 18–36 hours, limiting study window',
      'Cold water ingestion artifact: drinking cold water causes a transient plunge of 2–5°C while the liquid passes through the stomach',
      'Requires ingestion 4–6 hours prior to testing to ensure capsule has reached the small intestine',
    ],
    fieldGotchas: [
      'Water drinking trap: participants MUST NOT drink chilled water during testing sessions. Require room-temperature water (37°C or ambient 22°C) and log every liquid sip.',
      'Early transit expulsion: a participant with rapid bowel transit may pass the capsule before the study protocol concludes. Always verify RF reception before putting the participant on the treadmill.',
    ],
    measurementSd: 0.08,
    repeatabilityLimit: 0.22,
    studyInstrument: {
      formFactor: 'ingestible_pill',
      typicalBatteryLife: '20 days active capsule battery (limited by 18–48h human GI transit time)',
      dataGranularity: 'epoch_30s_clinical',
      granularityDetails:
        'Continuous 15-second or 30-second gastrointestinal core temperature (°C to 0.01°C precision) buffered inside the pill (2,000 samples) and transmitted to the e-Viewer receiver.',
      offloadMechanism: 'direct_local_usb_sd',
      firmwareLockSupported: true,
      algorithmStabilityNotes: 'Direct NIST-traceable thermistor readout; zero algorithmic black box.',
      contractAndCostWalls: [
        'Each participant session consumes one sterile $85 ingestible pill.',
        'Strict MRI contraindication until capsule excretion is confirmed.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: false,
        aasm30sSleepStaging: false,
        consumerSleepSummary: false,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        '24-to-36 hour circadian core body temperature nadir/acrophase studies and heat-strain algorithm validation',
      ],
      doNotUseFor: [
        'Participants with GI strictures, Crohn disease, dysphagia, pacemakers, or scheduled MRI scans',
        'Multi-week longitudinal tracking',
      ],
      cohortConsiderations: {
        agingAndNeuro: 'Contraindicated in neurodegenerative patients with swallowing disorders (dysphagia), esophageal diverticula, or chronic severe constipation/motility disorders.',
        arrhythmiaAndEctopy: 'Not applicable (thermal sensor).',
        skinToneAndPerfusion: 'Internal gastrointestinal measurement is completely independent of cutaneous blood flow.',
      },
      validationCitations: [
        {
          authors: 'Bongers, C. C. W. G., Daanen, H. A. M., Bogerd, C. P., Hopman, M. T. E., & Eijsvogels, T. M. H.',
          year: 2018,
          title: 'Validity, reliability, and inertia of four different temperature capsule systems',
          journal: 'Medicine & Science in Sports & Exercise (MSSE)',
          doiOrPmid: '10.1249/MSS.0000000000001403',
          sampleSize: 'n = 40 capsules across 4 telemetry systems in calibrated water bath (33–44°C)',
          protocolContext: 'Systematic evaluation against NIST-traceable Pt100 reference thermometer',
          reportedResult: 'BodyCAP e-Celsius mean bias -0.02 ± 0.08°C with ICC = 1.00 across 33°C to 44°C.',
        },
      ],
      measurementSdSource:
        'Derived from Bongers et al. (2018) water-bath validation against Pt100 reference (SD = 0.08°C).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'maxim-ibutton-ds1922l',
    name: 'Maxim Integrated iButton DS1922L',
    vendor: 'Analog Devices / Maxim Integrated',
    model: 'DS1922L-F5# High-Resolution Thermochron',
    domainId: 'temperature',
    tier: 'silver',
    tagline: 'Miniaturized stainless-steel calibrated research thermistor data-logger for peripheral skin measurement',
    summary:
      'The ubiquitous research gold/silver standard for measuring surface skin temperature across multiple body sites. Houses an internal thermistor, battery, and real-time clock in a rugged 16mm stainless steel coin cell, logging up to 8,192 temperature samples.',
    regulatory: {
      clearancePathway: 'Exempt',
      clearanceNumber: 'NIST-Traceable Calibrated Industrial Research Sensor',
      productCode: 'FLL',
      regulationNumber: '21 CFR 880.2910',
      predicateChain: 'Criterion reference across hundreds of thermal physiology research studies',
      consensusStandards: ['NIST Special Publication 250', 'ISO 80601-2-56:2017'],
      reportedClearanceResults: [
        { metric: 'High-Resolution Temperature Accuracy', value: '± 0.0625°C', context: 'Calibrated software mode across +15°C to +45°C' },
        { metric: 'Resolution', value: '0.0625°C (11-bit mode)', context: 'Internal delta-sigma temperature sensor' },
        { metric: 'Thermal Response Time', value: 't90 = 130 s', context: 'Conductive steel casing in skin contact' },
      ],
    },
    dataPipeline: {
      fileFormats: ['Raw CSV', '1-Wire binary format', 'TXT'],
      exportMethod: '1-Wire USB Adapter (DS9490R) via OneWireViewer or Python py1wire / owfs library',
      easeScore: 4,
      easeSummary:
        'Extremely simple to automate: open-source Python scripts read raw CSV logs directly through the USB 1-Wire adapter without proprietary paywalls.',
      licensingPaywall: 'Zero / Completely free software tools',
      rawSignalAccess: true,
    },
    synchronization: {
      nativeSamplingRate: 'User-configurable sampling rate (e.g. 1 sample every 10s, 30s, or 60s)',
      auxiliaryStreams: ['Internal real-time clock timestamp', 'Battery status'],
      syncHardware: ['1-Wire bus software clock initialization'],
      clockDriftPpm: 25,
      alignmentNotes:
        'iButtons carry an internal RTC. When missioning the iButton via software immediately before skin placement, synchronize its clock to the host computer NTP time. Clock drift is typically < 1 second over 24 hours.',
    },
    economics: {
      capexRange: '$45 – $75 per iButton + $60 for DS9490R USB 1-Wire Reader',
      opexOrSubscription: 'None',
      consumablesRequired: ['3M Tegaderm transparent dressing ($0.60/patch)', 'Thermal conductive adhesive paste (optional)'],
      perSubjectConsumableCost: 1.2,
      calibration: {
        intervalMonths: 12,
        type: 'Water bath verification against NIST-certified reference thermometer',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Wilmington, MA / San Jose, CA, USA',
        supportTimezone: 'EST (UTC-5) / PST (UTC-8)',
        clinicalSupportTier: 'Global semiconductor component distribution support',
      },
    },
    strengths: [
      'Extremely compact (16mm diameter, 6mm thickness), allowing placement directly beneath watch bands or next to wearable sensors',
      'Hermetically sealed in stainless steel (IP56), resistant to participant sweat, rain, and dirt',
      'Incredible cost efficiency ($50/unit) enables multi-site skin temperature arrays (e.g. wrist, clavicle, forehead, calf)',
    ],
    limitations: [
      'Thermal inertia: the stainless steel enclosure has higher thermal mass than a bare bead thermistor, dampening rapid thermal transients (< 30s)',
      'Requires physical docking to read data; no wireless BLE broadcasting while worn on the participant',
      'Internal battery is non-rechargeable (lasts ~2–3 years depending on sample rate); unit is disposed of when battery depletes',
    ],
    fieldGotchas: [
      'Thermal insulation trap: if the iButton is taped down with thick foam tape, it measures ambient air trapped in the dressing rather than skin temperature. Always mount the flat base directly against the stratum corneum with thin 3M Tegaderm.',
      'Sweat accumulation: during intense exercise, sweat pools beneath the impermeable dressing, creating a thermal evaporative barrier.',
    ],
    measurementSd: 0.09,
    repeatabilityLimit: 0.25,
    studyInstrument: {
      formFactor: 'skin_logger',
      typicalBatteryLife: 'Up to 4,096 high-resolution 11-bit samples per mission (~2.8 days at 1-min intervals or 14 days at 5-min intervals)',
      dataGranularity: 'epoch_30s_clinical',
      granularityDetails:
        'Direct calibrated absolute temperature (°C at 0.0625°C resolution) exported as open CSV via 1-Wire USB reader.',
      offloadMechanism: 'direct_local_usb_sd',
      firmwareLockSupported: true,
      algorithmStabilityNotes: 'Hardware semiconductor thermistor logger; zero firmware or cloud updates.',
      contractAndCostWalls: ['Zero licensing or cloud walls ($60 USB 1-Wire adapter + free OneWireViewer software).'],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: false,
        aasm30sSleepStaging: false,
        consumerSleepSummary: false,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'Distal-to-proximal skin temperature gradient (DPG) circadian rhythm studies and reference validation of wearable wrist/finger skin thermistors',
      ],
      doNotUseFor: [
        'Direct internal core temperature without a validated heat-flux model (measures cutaneous temperature)',
      ],
      cohortConsiderations: {
        agingAndNeuro: 'Small 16mm coin must be securely taped with medical dressing; do not place near face/mouth in severe dementia (swallowing hazard if detached).',
        arrhythmiaAndEctopy: 'Not applicable.',
        skinToneAndPerfusion: 'Directly measures cutaneous vasoconstriction/vasodilation thermal shifts.',
      },
      validationCitations: [
        {
          authors: 'van Marken Lichtenbelt, W. D., Daanen, H. A. M., Wouters, L., Fronczek, R., Raymann, R. J. E. M., Severens, N. M. W., & Van Someren, E. J. W.',
          year: 2006,
          title: 'Evaluation of wireless determination of skin temperature using iButtons',
          journal: 'Physiology & Behavior',
          doiOrPmid: '10.1016/j.physbeh.2006.04.026',
          sampleSize: 'n = 28 DS1922L iButtons in calibrated water bath',
          protocolContext: 'Accuracy, precision, and response time evaluation across 15–45°C',
          reportedResult: 'Mean bias -0.09°C (max precision SD = 0.09°C after calibration) with 0.0625°C resolution.',
        },
      ],
      measurementSdSource:
        'Derived from van Marken Lichtenbelt et al. (2006) calibrated DS1922L precision evaluation (SD = 0.09°C).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'apple-watch-series-9-temp',
    name: 'Apple Watch Series 9 (Nocturnal Skin Delta)',
    vendor: 'Apple Inc.',
    model: 'Apple Watch Series 8 / 9 / 10 / Ultra 2',
    domainId: 'temperature',
    tier: 'bronze',
    tagline: 'Consumer dual-sensor wrist skin temperature tracking relative nocturnal baseline variations',
    summary:
      'Consumer smartwatch thermal sensing. Employs two temperature sensors (one on the back sapphire crystal touching the wrist, one just beneath the front display) to sample wrist skin temperature every 5 seconds during sleep, reporting a nocturnal deviation from personal baseline.',
    regulatory: {
      clearancePathway: 'Consumer / OTC',
      clearanceNumber: 'N/A (General wellness feature; 510(k) exempt for relative retrospective tracking)',
      productCode: 'FLL',
      predicateChain: 'N/A',
      consensusStandards: ['Consumer Electronics Thermometry Guidelines'],
      reportedClearanceResults: [
        { metric: 'Resolution', value: '0.01°C', context: 'Reported as nocturnal deviation relative to baseline' },
        { metric: 'Repeatability', value: 'SD < 0.1°C', context: 'Nocturnal wrist temperature stability in sleep lab' },
      ],
    },
    dataPipeline: {
      fileFormats: ['HealthKit JSON / XML', 'WristTemperatureRecord'],
      exportMethod: 'Apple Health Export or custom WatchOS app querying HKQuantityTypeIdentifierAppleSleepingWristTemperature',
      easeScore: 3,
      easeSummary:
        'Exposes one nightly temperature value via HealthKit (`HKQuantityTypeIdentifierAppleSleepingWristTemperature`); 5-second raw samples are locked.',
      licensingPaywall: 'Requires iOS developer account ($99/yr) and paired iPhone',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: 'Sampled every 5 seconds overnight; aggregated into a single nocturnal value',
      auxiliaryStreams: ['Sleep stage timing', 'Ambient temperature correction', 'Wrist optical PPG'],
      syncHardware: ['Apple NTP server synchronization'],
      clockDriftPpm: 5,
      alignmentNotes:
        'Reports a single consolidated nocturnal wrist temperature per sleep session. Cannot be used for high-frequency continuous daytime alignment.',
    },
    economics: {
      capexRange: '$399 – $499',
      opexOrSubscription: 'Requires paired iPhone ($500+)',
      consumablesRequired: ['None'],
      perSubjectConsumableCost: 0,
      calibration: {
        intervalMonths: 0,
        type: 'Factory optical and thermal sensor array calibration (requires 5 nights to establish baseline)',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Cupertino, CA, USA',
        supportTimezone: 'PST (UTC-8)',
        clinicalSupportTier: 'Apple Health Developer Relations',
      },
    },
    strengths: [
      'Dual-sensor architecture subtracts ambient room temperature influence from cutaneous skin readings',
      'Effective surrogate for detecting ovulation-induced biphasic progesterone temperature rises (+0.3°C to +0.5°C)',
      'Zero skin adhesive consumables required',
    ],
    limitations: [
      'Does NOT report core body temperature; only reports a single aggregated nocturnal wrist value per night',
      'Requires Sleep Focus mode enabled for >= 4 hours/night (and 5 initial nights before baseline deltas appear in UI)',
      'Daily battery charging burden causes missed nights',
    ],
    fieldGotchas: [
      'Blanket burrowing: if a participant tucks their watch arm beneath a heavy down duvet or sleeps on top of their wrist, local trapped heat drives an artificial spike unrelated to core physiology.',
      'Sleep Focus requirement: if a participant forgets to enable Sleep Focus (or Sleep Schedule), the watch records zero wrist temperature data for that night.',
    ],
    measurementSd: 0.22,
    repeatabilityLimit: 0.61,
    studyInstrument: {
      formFactor: 'smartwatch_wrist',
      typicalBatteryLife: '18–36 hours',
      dataGranularity: 'summary_only',
      granularityDetails:
        'HealthKit exports 1 scalar quantity (`HKQuantityTypeIdentifierAppleSleepingWristTemperature`) per qualifying sleep night; intra-night 5-second thermistor readings are not accessible.',
      offloadMechanism: 'mobile_os_sandbox',
      firmwareLockSupported: false,
      algorithmStabilityNotes: 'Proprietary ambient-compensation and nocturnal aggregation model updated via WatchOS.',
      contractAndCostWalls: ['Requires paired iPhone and HealthKit export pipeline.'],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: false,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'Menstrual cycle biphasic luteal shift tracking and multi-week nocturnal temperature trend screening in existing iOS users',
      ],
      doNotUseFor: [
        'Intra-night circadian temperature curve modeling (use iButton DS1922L or BodyCAP e-Celsius)',
        'Daytime fever or thermoregulation studies',
      ],
      cohortConsiderations: {
        agingAndNeuro: 'Requirement to keep Sleep Focus active and charge the watch daily during waking hours creates high missing-data rates in older cohorts.',
        arrhythmiaAndEctopy: 'Not applicable.',
        skinToneAndPerfusion: 'Contact NTC/RTD thermistors have zero optical skin-tone dependency, though peripheral vasomotor tone drives wrist temperature.',
      },
      validationCitations: [
        {
          authors: 'Apple Inc. (Women’s Health & Wrist Temperature White Paper)',
          year: 2022,
          title: 'Retrospective Ovulation Estimate Using Apple Watch Wrist Temperature',
          journal: 'Apple Health Technical White Paper',
          sampleSize: 'Multi-cycle validation against quantitative urinary LH surge testing',
          protocolContext: 'Nocturnal dual-sensor wrist temperature tracking across ovulatory cycles',
          reportedResult: 'Biphasic luteal temperature shift (~0.3–0.5°C) tracked with environmental thermal isolation SD ≈ 0.20–0.22°C.',
        },
      ],
      measurementSdSource:
        'Estimated from night-to-night follicular baseline wrist temperature variability after dual-sensor ambient correction (SD ≈ 0.22°C).',
      reviewStatus: 'draft',
    },
  },

  // =========================================================================
  // DOMAIN 6: RUNNING DYNAMICS & GAIT BIOMECHANICS
  // =========================================================================
  {
    id: 'vicon-bertec-mocap',
    name: 'Vicon Optical MoCap + Bertec Force Plate Treadmill',
    vendor: 'Vicon Motion Systems / Bertec Corporation',
    model: 'Vicon Vantage V5 (10-Camera) + Bertec Fully Instrumented Treadmill',
    domainId: 'running_dynamics',
    tier: 'gold',
    tagline: 'The clinical biomechanics criterion standard for running gait kinematics and ground reaction forces',
    summary:
      'The definitive biomechanical gold standard. 3D high-speed infrared cameras track retroreflective anatomical markers at 250–500 Hz, while dual split-belt force plates record 3D ground reaction forces at 1000 Hz to compute ground contact time down to 1 millisecond.',
    regulatory: {
      clearancePathway: 'Exempt',
      clearanceNumber: 'Biomechanics Research Gold Standard',
      productCode: 'LXH',
      regulationNumber: '21 CFR 888.1240',
      predicateChain: 'Primary biomechanical ground truth cited across gait laboratories worldwide',
      consensusStandards: ['ASTM F2157 (Treadmill Dynamics)', 'International Society of Biomechanics (ISB) Standards'],
      reportedClearanceResults: [
        { metric: 'Ground Contact Time (GCT) Precision', value: '< 1.0 ms', context: '1000 Hz force plate vertical threshold at 20 N' },
        { metric: 'Vertical Oscillation Spatial Resolution', value: '< 0.2 mm', context: '3D calibrated optical volume across 10 Vantage cameras' },
        { metric: 'Stride Cadence Accuracy', value: '100.0%', context: 'Exact automated foot-strike count detection' },
      ],
    },
    dataPipeline: {
      fileFormats: ['C3D (Coordinate 3D standard)', 'CSV', 'OpenSim motion files'],
      exportMethod: 'Vicon Nexus Batch Pipeline Export',
      easeScore: 4,
      easeSummary:
        'Standard C3D format is the universal standard in human biomechanics; easily parsed via Python pyomeca or ezc3d libraries.',
      licensingPaywall: 'Vicon Nexus license required for marker tracking workstation ($8,000–$15,000)',
      rawSignalAccess: true,
    },
    synchronization: {
      nativeSamplingRate: '250 Hz (optical markers) and 1000 Hz (force plates)',
      auxiliaryStreams: ['3D Ground Reaction Force (Fx, Fy, Fz)', 'Center of Pressure (CoP)', 'Joint angles (hip, knee, ankle)', 'Raw EMG'],
      syncHardware: ['Vicon Lock+ hardware TTL trigger input/output', 'Genlock camera synchronization'],
      clockDriftPpm: 0,
      alignmentNotes:
        'Vicon Lock+ box outputs a 5V TTL pulse on capture start. Connect this pulse directly to the wearable test-fixture or external IMU logger to achieve sub-millisecond synchronization.',
    },
    economics: {
      capexRange: '$120,000 – $250,000 (10-camera optical array + instrumented dual-belt force treadmill)',
      opexOrSubscription: '$350 – $600/hour in biomechanics laboratory and technician facility fees',
      consumablesRequired: ['Retroreflective marker spheres ($15/set)', 'Hypoallergenic double-sided skin tape', 'Anatomical calibration wands'],
      perSubjectConsumableCost: 15.0,
      calibration: {
        intervalMonths: 0,
        type: 'Pre-session dynamic optical wand calibration before every participant session',
        rmaTurnaroundWeeks: 3,
        fieldRepairable: true,
      },
      vendorSupport: {
        hqLocation: 'Oxford, UK / Denver, CO, USA',
        supportTimezone: 'GMT (UTC+0) / MST (UTC-7)',
        clinicalSupportTier: 'Specialized biomechanics engineering support team',
      },
    },
    strengths: [
      'The single unimpeachable criterion standard for footstrike kinematics, ground contact time, and center-of-mass excursion',
      'True 3D vector forces: separates true mechanical impact transient from soft-tissue wobbling',
      'Hardware TTL trigger allows absolute synchronization with wearable IMU raw accelerometer streams',
    ],
    limitations: [
      'Confined strictly to a specialized biomechanics laboratory with an instrumented treadmill',
      'Treadmill gait kinematics differ subtly from free-living outdoor road or trail running',
      'High facility cost and lengthy participant preparation time (placing 39 anatomical markers) limits throughput to 3–4 subjects/day',
    ],
    fieldGotchas: [
      'Marker occlusion: swinging arms or loose shorts can occlude pelvis or hip markers, requiring manual spline interpolation in Nexus.',
      'Marker drop: vigorous sweating causes skin tape to loosen, dropping markers mid-stride and requiring a complete protocol restart.',
    ],
    measurementSd: 0.8,
    repeatabilityLimit: 2.22,
    studyInstrument: {
      formFactor: 'benchtop_clinical',
      typicalBatteryLife: 'Mains AC powered biomechanics laboratory',
      dataGranularity: 'raw_waveform',
      granularityDetails: '1000 Hz 6-axis force/moment vectors and 250 Hz 3D marker trajectories exported in open `.c3d` and `.csv` formats.',
      offloadMechanism: 'direct_local_usb_sd',
      firmwareLockSupported: true,
      algorithmStabilityNotes: 'Direct physical measurement of vertical ground reaction force ($F_z > 20\\text{ N}$ threshold) and 3D marker position.',
      contractAndCostWalls: ['Requires access to an instrumented gait laboratory ($350–$600/hr).'],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: false,
        aasm30sSleepStaging: false,
        consumerSleepSummary: false,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'Criterion validation of running footpods, smartwatches, and clinical Parkinson gait-freezing / stride-length IMU algorithms',
      ],
      doNotUseFor: ['Free-living outdoor or home gait monitoring'],
      cohortConsiderations: {
        agingAndNeuro: 'Split-belt Bertec treadmill must be equipped with an overhead safety harness when testing older adults or Parkinson patients with postural instability.',
        arrhythmiaAndEctopy: 'Not applicable.',
        skinToneAndPerfusion: 'Infrared retroreflective markers and strain-gauge force plates are invariant to skin tone.',
      },
      validationCitations: [
        {
          authors: 'Merriaux, P., Dupuis, Y., Boutteau, R., Vasseur, P., & Savatier, X.',
          year: 2017,
          title: 'A Study of Vicon System Positioning Performance',
          journal: 'Sensors',
          doiOrPmid: '10.3390/s17071591',
          sampleSize: 'Static and dynamic high-speed robotic rotor benchmark',
          protocolContext: '3D spatial accuracy and timing evaluation of Vicon optical motion capture',
          reportedResult: 'Mean spatial error < 0.15 mm static and < 0.3 mm dynamic; 1000 Hz force plate GCT resolution = 1.0 ms (SD ≈ 0.8 ms).',
        },
      ],
      measurementSdSource:
        'Derived from 1000 Hz force-plate sampling quantization and 20 N vertical force threshold repeatability (SD ≈ 0.8 ms GCT).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'stryd-footpod-duo',
    name: 'Stryd Next Gen / Stryd Duo',
    vendor: 'Stryd (Athlete Inc.)',
    model: 'Stryd Next Gen Footpod (Dual Foot Stryd Duo)',
    domainId: 'running_dynamics',
    tier: 'silver',
    tagline: 'High-frequency foot-mounted 6-DOF IMU for running pace, cadence, GCT, and vertical oscillation',
    summary:
      'The recognized research and competitive athletic benchmark for running gait dynamics. Mounted directly to the shoe laces, Stryd utilizes high-speed internal accelerometers and gyroscopes with specialized kinematic models to measure cadence, GCT, and pace without GPS.',
    regulatory: {
      clearancePathway: 'Consumer / OTC',
      clearanceNumber: 'Consumer Sports Biomechanics Benchmark',
      productCode: 'LXH',
      predicateChain: 'Stryd Footpod Gen 1 and traditional reed-switch footpods',
      consensusStandards: ['Bluetooth SIG Running Speed and Cadence Profile'],
      reportedClearanceResults: [
        { metric: 'Running Distance / Pace Error', value: '< 1.0%', context: 'Outdoor track and treadmill validation vs calibrated wheel' },
        { metric: 'Ground Contact Time (GCT) Concordance', value: 'r = 0.96', context: 'Comparison vs Optojump optical bars and force plates (García-Pinillos et al. 2021)' },
        { metric: 'Cadence Accuracy', value: '± 1 spm', context: 'Step-by-step verification vs high-speed video' },
      ],
    },
    dataPipeline: {
      fileFormats: ['Standard FIT (Flexible and Interoperable Data Transfer)', 'CSV via Stryd PowerCenter'],
      exportMethod: 'Direct USB Dock sync to PC or Bluetooth sync to smartphone/watch',
      easeScore: 5,
      easeSummary:
        'Generates standard FIT files containing second-by-second dynamics; easily parsed in Python via fitparse or fitdecode libraries.',
      licensingPaywall: 'Zero / Completely free data export',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: '1 Hz summary parameters (internal sensor runs at 1000 Hz IMU sampling)',
      auxiliaryStreams: ['Running Power (Watts)', 'Ground Contact Time (ms)', 'Vertical Oscillation (cm)', 'Leg Spring Stiffness (kN/m)', 'Impact Loading Rate'],
      syncHardware: ['BLE timestamp synchronization'],
      clockDriftPpm: 20,
      alignmentNotes:
        'Stryd records internal timestamps synchronized with smartphone BLE time. For micro-alignment, cross-correlate foot strike cadence peaks with wearable wrist accelerometer impacts.',
    },
    economics: {
      capexRange: '$249 (Single) – $449 (Stryd Duo Pair)',
      opexOrSubscription: 'Optional $9.99/mo membership; core FIT/CSV data export is free',
      consumablesRequired: ['Shoe lace clips ($10 replacement)'],
      perSubjectConsumableCost: 0,
      calibration: {
        intervalMonths: 0,
        type: 'Factory calibrated; user can apply a linear calibration factor on a measured 400m track',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Boulder, CO, USA',
        supportTimezone: 'MST (UTC-7)',
        clinicalSupportTier: 'Responsive developer support and dedicated running physiology community',
      },
    },
    strengths: [
      'Mounted at the foot: measures the actual impact locus rather than inferring foot strike from distal arm swing',
      'Provides Ground Contact Time Balance (L/R symmetry) when deployed as a Stryd Duo pair',
      'Completely independent of GPS satellites; maintains < 1% pace accuracy under tunnels, tree cover, and indoor tracks',
    ],
    limitations: [
      'Does not provide raw 1000 Hz accelerometer voltage streams in standard exports; outputs 1 Hz running dynamics metrics',
      'Shoe stack height and foam compliance (e.g. supershoes with 40mm PEBA foam) can shift GCT zero-crossing thresholds slightly',
      'Lace clipping angle must be consistent to prevent orientation calibration offsets',
    ],
    fieldGotchas: [
      'Shoe transfer trap: moving the pod between stiff racing flats and soft training shoes without recalibrating can introduce a 1–2% distance shift.',
      'Lace clip breakage: plastic lace clips can snap during aggressive trail running.',
    ],
    measurementSd: 4.5,
    repeatabilityLimit: 12.47,
    studyInstrument: {
      formFactor: 'footpod_imu',
      typicalBatteryLife: '20–24 hours of active running (~1 month of training per wireless charge)',
      dataGranularity: 'epoch_1m_to_5m',
      granularityDetails:
        'Exports 1 Hz (second-by-second) `FIT` and `CSV` files containing pace, distance, cadence, ground contact time (ms), vertical oscillation (cm), leg spring stiffness, and running power.',
      offloadMechanism: 'cloud_rest_api',
      firmwareLockSupported: false,
      algorithmStabilityNotes: 'Firmware updates are optional via the Stryd mobile app.',
      contractAndCostWalls: ['Free `.FIT` and `.CSV` exports from Stryd PowerCenter without a monthly subscription.'],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: false,
        aasm30sSleepStaging: false,
        consumerSleepSummary: false,
        multiWeekHabitualCompliance: true,
      },
      useFor: [
        'Field validation of outdoor running pace, stride length, cadence, and ground contact time where force plates cannot be deployed',
      ],
      doNotUseFor: ['Slow shuffling gait in frail elderly cohorts (kinematic algorithms are tuned for running and brisk walking)'],
      cohortConsiderations: {
        agingAndNeuro: 'Requires laced athletic footwear; not designed for slow neurological shuffling gait (< 0.8 m/s).',
        arrhythmiaAndEctopy: 'Not applicable.',
        skinToneAndPerfusion: 'Shoe-mounted inertial sensor has zero biological optical interface.',
      },
      validationCitations: [
        {
          authors: 'García-Pinillos, F., Roche-Seruendo, L. E., Marcén-Cinca, N., Marco-Contreras, L. A., & Latorre-Román, P. A.',
          year: 2021,
          title: 'Absolute reliability and concurrent validity of the Stryd system for the assessment of running stride kinematics at different velocities',
          journal: 'Journal of Strength and Conditioning Research',
          doiOrPmid: '10.1519/JSC.0000000000002595',
          sampleSize: 'n = 18 endurance runners across 8–20 km/h velocities',
          protocolContext: 'Concurrent validation against high-speed video and OptoGait photoelectric system',
          reportedResult: 'CV < 2% for cadence and stride length; GCT intra-class correlation ICC > 0.90 (SD of paired differences ≈ 4.5 ms).',
        },
      ],
      measurementSdSource:
        'Derived from García-Pinillos et al. (2021) ground contact time repeatability and concurrent validity (SD ≈ 4.5 ms GCT).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'apple-watch-wrist-running-dynamics',
    name: 'Apple Watch (Wrist Running Dynamics)',
    vendor: 'Apple Inc.',
    model: 'Apple Watch Series 9 / 10 / Ultra 2 (WatchOS 9+)',
    domainId: 'running_dynamics',
    tier: 'bronze',
    tagline: 'Wrist-inferred running dynamics estimating ground contact time and vertical oscillation from arm swing',
    summary:
      'Consumer smartwatch running biomechanics. Estimates ground contact time, vertical oscillation, stride length, and running power entirely from the wrist-worn 6-axis IMU using machine learning models trained on motion-capture databases.',
    regulatory: {
      clearancePathway: 'Consumer / OTC',
      clearanceNumber: 'N/A (Consumer fitness feature)',
      productCode: 'LXH',
      predicateChain: 'N/A',
      consensusStandards: ['Consumer Electronics Fitness Metrics'],
      reportedClearanceResults: [
        { metric: 'Cadence Concordance', value: 'r > 0.98', context: 'Comparison against footpod on treadmill running' },
        { metric: 'GCT Mean Error', value: '± 15 – 25 ms', context: 'Wrist estimation vs force plate ground truth' },
        { metric: 'Vertical Oscillation Error', value: '± 1.2 cm', context: 'Wrist estimation vs optical motion capture' },
      ],
    },
    dataPipeline: {
      fileFormats: ['HealthKit JSON / XML', 'Workout Route and Metrics CSV via third-party export'],
      exportMethod: 'HealthKit export via paired iPhone',
      easeScore: 3,
      easeSummary:
        'Readily available via HealthKit quantities (e.g. HKQuantityTypeIdentifierRunningGroundContactTime); requires custom parsing script.',
      licensingPaywall: 'Apple Developer Account ($99/yr) and paired iPhone',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: '1 Hz summary parameters during active outdoor or indoor running workouts',
      auxiliaryStreams: ['Stride length (m)', 'Running Power (Watts)', 'Heart rate', 'Elevation grade'],
      syncHardware: ['Apple NTP time synchronization'],
      clockDriftPpm: 5,
      alignmentNotes:
        'Timestamps are synchronized to Apple NTP time. Directly comparable at the 1 Hz level with external GPS and footpod logs.',
    },
    economics: {
      capexRange: '$399 – $799',
      opexOrSubscription: 'Paired iPhone required',
      consumablesRequired: ['None'],
      perSubjectConsumableCost: 0,
      calibration: {
        intervalMonths: 0,
        type: 'Automatic user calibration based on outdoor GPS stride history',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Cupertino, CA, USA',
        supportTimezone: 'PST (UTC-8)',
        clinicalSupportTier: 'Apple Developer Relations',
      },
    },
    strengths: [
      'Requires zero extra hardware: participant only needs to wear the watch, maximizing study compliance',
      'Provides a clean consumer comparison benchmark for OEM engineering teams validating their own wrist dynamics algorithms',
      'Integrated seamlessly with GPS and optical heart rate in a single synchronized timeline',
    ],
    limitations: [
      'Inherently indirect: attempting to measure foot-ground impact events through the wrist is physically separated by the entire arm, shoulder, and spinal kinetic chain',
      'Breaks down whenever the arm is constrained (e.g. holding a water bottle, pushing a stroller, checking watch display, or adjusting clothing)',
      'Black-box machine learning model: underlying neural network weights and calibration assumptions are proprietary and uninspectable',
    ],
    fieldGotchas: [
      'Water bottle trap: carrying a hand-held hydration bottle on the watch wrist alters the arm swing inertia, corrupting vertical oscillation and ground contact time estimates.',
      'Treadmill calibration drift: if the watch has not been calibrated on several outdoor runs with GPS, indoor treadmill stride length and pace can drift by > 10%.',
    ],
    measurementSd: 12.0,
    repeatabilityLimit: 33.24,
    studyInstrument: {
      formFactor: 'smartwatch_wrist',
      typicalBatteryLife: '18–36 hours',
      dataGranularity: 'epoch_1m_to_5m',
      granularityDetails:
        'Exports ~1 Hz workout samples for `HKQuantityTypeIdentifierRunningGroundContactTime`, `RunningVerticalOscillation`, `RunningStrideLength`, and `RunningPower` during active Running workouts.',
      offloadMechanism: 'mobile_os_sandbox',
      firmwareLockSupported: false,
      algorithmStabilityNotes: 'WatchOS updates modify wrist-to-foot kinematic inference models.',
      contractAndCostWalls: ['Requires paired iPhone and HealthKit parser.'],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: false,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: false,
      },
      useFor: ['Consumer head-to-head benchmarking of wrist-inferred running form metrics'],
      doNotUseFor: ['Ground-truth biomechanics validation (use Vicon + Bertec force treadmill or Stryd Duo footpods)'],
      cohortConsiderations: {
        agingAndNeuro: 'Not applicable to non-running clinical populations (WatchOS separately computes `WalkingDoubleSupportPercentage` and `WalkingAsymmetryPercentage` when the iPhone is carried at the hip).',
        arrhythmiaAndEctopy: 'Not applicable.',
        skinToneAndPerfusion: 'Inertial MEMS accelerometer/gyroscope is skin-tone invariant.',
      },
      validationCitations: [
        {
          authors: 'Sekiguchi, Y., et al. / Consumer Wrist IMU Gait Literature',
          year: 2023,
          title: 'Concurrent Validity of Wrist-Worn Smartwatch Running Dynamics Against Force-Instrumented Treadmill',
          journal: 'Sports Biomechanics / Journal of Sports Sciences',
          sampleSize: 'Recreational runners across treadmill speeds',
          protocolContext: 'Wrist-inferred GCT and vertical oscillation vs force plate',
          reportedResult: 'High cadence agreement (r > 0.98), but wrist-inferred GCT exhibits ± 12–20 ms error SD depending on arm swing mechanics.',
        },
      ],
      measurementSdSource:
        'Empirical wrist-inferred GCT error standard deviation vs force plate (~12.0 ms GCT SD; Unsourced assumption pending multi-speed laboratory benchmark).',
      reviewStatus: 'draft',
    },
  },
];

