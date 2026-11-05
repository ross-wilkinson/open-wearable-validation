import type { ReferenceDevice } from '../types.ts';

export const SLEEP_DEVICES: ReferenceDevice[] = [
  {
    id: 'philips-alice-6',
    name: 'Philips Respironics Alice 6 PSG',
    vendor: 'Philips Respironics',
    model: 'Alice 6 LDxS / LDxN Diagnostic Sleep System',
    domainId: 'sleep',
    tier: 'gold',
    tagline: 'The clinical Type 1 in-lab Polysomnography diagnostic criterion standard',
    summary:
      'The multi-channel in-lab polysomnography benchmark. Records continuous electroencephalography (EEG), electrooculography (EOG), electromyography (EMG), nasal pressure, respiratory effort belts, pulse oximetry, and body position for AASM scoring.',
    regulatory: {
      clearancePathway: '510(k)',
      clearanceNumber: 'K092419',
      productCode: 'GWQ',
      regulationNumber: '21 CFR 882.1400',
      predicateChain: 'Respironics Alice 5 Diagnostic Sleep System (K040854)',
      consensusStandards: ['AASM Manual for the Scoring of Sleep', 'IEC 60601-1', 'IEC 60601-2-26'],
      reportedClearanceResults: [
        { metric: 'Inter-Scorer Agreement (RPSGT)', value: 'Kappa = 0.78 – 0.84', context: 'Epoch-by-epoch 30s staging consensus across certified sleep labs' },
        { metric: 'AHI Precision', value: 'r > 0.96', context: 'Obstructive vs central apnea detection vs clinical consensus' },
      ],
    },
    dataPipeline: {
      fileFormats: ['EDF / EDF+ (European Data Format)', 'Sleepware G3 XML annotations', 'ASCII hypnograms'],
      exportMethod: 'Sleepware G3 Workstation Batch EDF Export',
      easeScore: 4,
      easeSummary:
        'Standardized EDF+ export containing all physiological channels alongside time-stamped XML epoch-by-epoch sleep stage markers.',
      licensingPaywall: 'Sleepware G3 review workstation license required for scoring ($5,000/seat)',
      rawSignalAccess: true,
    },
    synchronization: {
      nativeSamplingRate: '500 Hz (EEG/EOG/EMG) and 100 Hz (respiratory signals)',
      auxiliaryStreams: [
        '6 EEG leads (F3, F4, C3, C4, O1, O2)',
        '2 EOG channels',
        '3 EMG channels',
        'Nasal pressure airflow',
        'Thoracic & Abdominal RIP belts',
        'Body position sensor',
        'SpO2',
      ],
      syncHardware: ['Hardware TTL synchronization pulse input jack', 'Analog DC auxiliary input'],
      clockDriftPpm: 10,
      alignmentNotes:
        'Alice 6 has dedicated rear TTL input pins. Inject a 3.3V/5V pulse from an external microcontroller at study start to write a hardware event marker directly into the EDF stream, guaranteeing sub-millisecond sleep epoch alignment.',
    },
    economics: {
      capexRange: '$28,000 – $45,000 per bed',
      opexOrSubscription: '$1,200 – $2,200 per subject-night (sleep center bed fee + RPSGT scoring labor)',
      consumablesRequired: [
        'Gold cup electrodes ($12/set)',
        'Ten20 conductive neurodiagnostic paste ($18/jar)',
        'NuPrep abrasive gel ($12/tube)',
        'Nasal airflow cannulas ($3/subject)',
        'Disposable RIP respiratory effort belts ($15/set)',
      ],
      perSubjectConsumableCost: 45.0,
      calibration: {
        intervalMonths: 12,
        type: 'Annual biomedical electrical leakage and microvolt calibration check',
        rmaTurnaroundWeeks: 4,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Murrysville, PA, USA / Best, Netherlands',
        supportTimezone: 'EST (UTC-5) / CET (UTC+1)',
        clinicalSupportTier: 'Enterprise hospital sleep medicine support network',
      },
    },
    strengths: [
      'The definitive clinical diagnostic criterion standard for both sleep architecture and sleep apnea',
      'Hardware TTL sync input allows true zero-latency alignment with external wearable sensor streams',
      'Full cortical EEG montage enables precise detection of micro-arousals and sleep spindles (N2 vs N3)',
    ],
    limitations: [
      'First-night effect: participants sleeping with wired headgear in an unfamiliar clinic exhibit suppressed REM and fragmented sleep',
      'Extremely high operational cost ($1,500+ per subject night) limits study sample sizes',
      'Inter-scorer subjectivity: human RPSGT scorers only agree on ~80–83% of epochs (especially N1 vs Wake, N2 vs N3)',
    ],
    fieldGotchas: [
      'Electrode pop artifact: a participant turning over can pull a reference mastoid (M1/M2) cup off, corrupting all referenced EEG channels for the remainder of the night.',
      'Technologist scoring drift: ensure at least two independent RPSGTs score records blindly with consensus adjudication for boundary epochs.',
    ],
    measurementSd: 0.18,
    repeatabilityLimit: 0.5,
    studyInstrument: {
      formFactor: 'benchtop_clinical',
      typicalBatteryLife: 'Mains AC powered (in-lab sleep center headbox)',
      dataGranularity: 'raw_waveform',
      granularityDetails:
        'Full 500 Hz EEG/EOG/EMG/ECG waveforms in open EDF+ plus certified 30-second AASM epoch annotations (Wake, N1, N2, N3, REM), cortical arousal markers, and respiratory event timestamps.',
      offloadMechanism: 'direct_local_usb_sd',
      firmwareLockSupported: true,
      algorithmStabilityNotes:
        'Scored according to versioned AASM Manual rules (e.g., AASM v2.6 / v3.0) by blinded human RPSGT technologists; raw EDF+ files remain permanently re-scorable.',
      contractAndCostWalls: [
        'Requires accredited clinical sleep laboratory bed booking ($1,200–$2,200 per participant-night) and certified RPSGT scoring labor ($100–$250/record for multi-scorer consensus).',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: true,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'Pivotal FDA 510(k) / De Novo validation of sleep staging, apnea-hypopnea index (AHI), or nocturnal vital sign algorithms',
        'Single- or two-night clinical trial endpoints requiring direct measurement of slow-wave activity (delta power), sleep spindles, or REM without atonia (RBD in Parkinson disease / synucleinopathies)',
      ],
      doNotUseFor: [
        'Multi-week habitual sleep or circadian rhythm tracking in the home environment',
        'Large-cohort decentralized screening where $1,500+/night lab fees and participant travel are prohibitive',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Essential for diagnosing REM Sleep Behavior Disorder (RBD via chin/limb EMG) and neurodegenerative slow-wave fragmentation, but patients with moderate-to-severe Alzheimer disease often experience acute nocturnal agitation ("sundowning") in an unfamiliar lab.',
        arrhythmiaAndEctopy:
          'Includes dedicated Lead II diagnostic ECG channel for simultaneous nocturnal HRV and arrhythmia overread.',
        skinToneAndPerfusion:
          'Cortical EEG/EOG/EMG staging is invariant to skin tone; integrated bedside Masimo/Nonin finger oximeter handles SpO2.',
      },
      validationCitations: [
        {
          authors: 'Lee, Y. J., Lee, J. Y., Cho, J. H., & Choi, J. H.',
          year: 2022,
          title: 'Interrater reliability of sleep stage scoring: a meta-analysis',
          journal: 'Journal of Clinical Sleep Medicine (JCSM)',
          doiOrPmid: '10.5664/jcsm.9538',
          sampleSize: 'Meta-analysis of 11 studies (n = 7,000+ scored PSG records)',
          protocolContext: 'Manual 30-second epoch AASM sleep stage scoring across independent RPSGT technologists',
          reportedResult: 'Overall 5-stage Cohen kappa = 0.76 (82.6% epoch agreement); kappa by stage: W = 0.85, N2 = 0.72, N3 = 0.73, REM = 0.83, N1 = 0.46.',
        },
      ],
      measurementSdSource:
        'Derived from inter-scorer disagreement ceiling across independent RPSGT scorers (Lee et al. 2022 meta-analysis: ~17–18% epoch disagreement rate => SD ≈ 0.18 stage units).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'zoll-watchpat-one',
    name: 'ZOLL / Itamar WatchPAT ONE / 300',
    vendor: 'ZOLL Itamar Ltd.',
    model: 'WatchPAT ONE (Disposable) / WatchPAT 300 (Reusable)',
    domainId: 'sleep',
    tier: 'silver',
    tagline: 'Home Sleep Apnea Test (HSAT) using Peripheral Arterial Tone (PAT) for staging and AHI',
    summary:
      'The most widely adopted ambulatory sleep testing system in clinical trials. Measures peripheral arterial tone (PAT) volume changes driven by sympathetic autonomic vascular tone, coupled with actigraphy and oximetry to classify 4 sleep stages and respiratory events.',
    regulatory: {
      clearancePathway: '510(k)',
      clearanceNumber: 'K183510',
      productCode: 'OLZ',
      regulationNumber: '21 CFR 868.2375',
      predicateChain: 'WatchPAT 200 (K011082) & Itamar WP200U',
      consensusStandards: ['IEC 60601-1', 'IEC 60601-1-11', 'AASM Clinical Practice Guidelines for HSAT'],
      reportedClearanceResults: [
        { metric: 'AHI Correlation vs In-Lab PSG', value: 'r = 0.90 – 0.93', context: 'Multi-center clinical trial across 300+ patients' },
        { metric: '4-Stage Sleep Concordance', value: '72% – 76% (Kappa ≈ 0.60)', context: 'Epoch-by-epoch comparison against AASM-scored PSG (Hedner et al. 2011)' },
        { metric: 'REM Sleep Sensitivity', value: '88.7%', context: 'Detection of autonomic surge during REM sleep' },
      ],
    },
    dataPipeline: {
      fileFormats: ['z-PAT proprietary encrypted binary', 'Cloud PDF clinical reports', 'Tabular CSV exports via Research Portal'],
      exportMethod: 'Direct smartphone Bluetooth upload to Cloud Portal (WatchPAT ONE) or USB dock (WP300)',
      easeScore: 3,
      easeSummary:
        'Clinical PDF report is instant; raw epoch-by-epoch 30s CSV staging data requires CloudPAT research tier portal access or zzzPAT desktop export.',
      licensingPaywall: 'Per-device cost includes cloud scoring; enterprise research API has onboarding fee',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: '100 Hz (raw PAT optical sensor) and 30-second staging epochs',
      auxiliaryStreams: [
        'Peripheral Arterial Tone (PAT)',
        'Pulse rate',
        'SpO2',
        'Actigraphy (wrist accel)',
        'Snoring volume (dB)',
        'Body position',
      ],
      syncHardware: ['Smartphone cellular time synchronization'],
      clockDriftPpm: 20,
      alignmentNotes:
        'WatchPAT ONE pairs with the participant smartphone and timestamps records to phone network time. Align with wearable records by logging phone UTC epoch at the start of sleep monitoring.',
    },
    economics: {
      capexRange: '$0 for WatchPAT ONE (fully disposable) or $6,500 for WatchPAT 300',
      opexOrSubscription: '$75 – $95 per disposable test (WatchPAT ONE)',
      consumablesRequired: [
        'WatchPAT ONE is completely disposable (no returned parts or sanitization required); WatchPAT 300 uses a $45 disposable finger PAT probe per night',
      ],
      perSubjectConsumableCost: 85.0,
      calibration: {
        intervalMonths: 0,
        type: 'Factory pre-calibrated optical bio-impedance finger sensor',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Caesarea, Israel / Atlanta, GA, USA',
        supportTimezone: 'EST (UTC-5) / IDT (UTC+3)',
        clinicalSupportTier: 'Specialized clinical research trial support team with dedicated portal engineers',
      },
    },
    strengths: [
      'Completely eliminates participant clinic burden: deployed to participants at home, capturing naturalistic sleep',
      'Disposable model (WatchPAT ONE) eliminates reverse logistics, device sanitization, and lost hardware costs',
      'Validated autonomic REM detection algorithm provides far superior REM staging than basic wrist actigraphy',
    ],
    limitations: [
      'Cannot differentiate N1 from N2 sleep (collapses N1+N2 into "Light Sleep")',
      'Underlying algorithm relies on peripheral vascular tone; participants taking alpha-blockers or short-acting nitrates, or with severe autonomic neuropathy, yield compromised staging',
      'Single-use finger pneumo-optical probe cannot be reused across multiple nights ($85 per night tested)',
    ],
    fieldGotchas: [
      'Finger probe detachment: participants with restless sleep or frequent bathroom trips can pull the probe off, terminating the study run prematurely.',
      'Alpha-blocker / autonomic failure trap: in Parkinson disease or Lewy body dementia with pure autonomic failure, sympathetic vasoconstriction surges during REM are blunted, degrading PAT-based REM classification.',
    ],
    measurementSd: 0.32,
    repeatabilityLimit: 0.89,
    studyInstrument: {
      formFactor: 'fingertip_clip',
      typicalBatteryLife: 'Single-night (10–12 hours) disposable unit (WatchPAT ONE)',
      dataGranularity: 'epoch_30s_clinical',
      granularityDetails:
        'Exports 30-second clinical epoch sleep stages (Wake, Light, Deep, REM), pAHI, ODI, RDI, SpO2, pulse rate, body position, and snoring decibels via zzzPAT / CloudPAT CSV export.',
      offloadMechanism: 'cloud_rest_api',
      firmwareLockSupported: true,
      algorithmStabilityNotes:
        'FDA 510(k)-cleared zzzPAT scoring algorithm versions are strictly controlled under medical device change management and can be pinned in the zzzPAT desktop research workstation.',
      contractAndCostWalls: [
        'Each single-night recording requires either a disposable WatchPAT ONE unit (~$85) or a single-use PAT finger probe (~$45 on WatchPAT 300), making 30-night continuous studies prohibitively expensive.',
        'Requires a clinical provider or IRB research account with ZOLL Itamar to access CloudPAT / zzzPAT.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: false,
        aasm30sSleepStaging: true,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'Home-based clinical trial screening or endpoint evaluation for obstructive sleep apnea (AHI, ODI) and 4-stage sleep architecture over 1–3 episodic nights',
        'Decentralized trials requiring an FDA 510(k)-cleared home sleep test with zero hardware return logistics',
      ],
      doNotUseFor: [
        'Multi-week habitual sleep monitoring (single-use thimble probe constricts the finger and costs ~$85/night)',
        'Cohorts with severe peripheral autonomic denervation (e.g., advanced synucleinopathies), bilateral sympathectomy, or alpha-adrenergic blocker therapy',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Home deployment avoids in-lab sundowning, but the snug pneumatic finger thimble and sternal notch wire require care-partner assistance in cognitively impaired participants.',
        arrhythmiaAndEctopy:
          'Persistent atrial fibrillation or frequent ectopy degrades pulse wave amplitude (PAT) regularity; WatchPAT 300/ONE flags arrhythmias but staging accuracy decreases.',
        skinToneAndPerfusion:
          'Severe peripheral arterial disease (PAD) or cold extremities dampens digital arterial pulse volume.',
      },
      validationCitations: [
        {
          authors: 'Hedner, J., White, D. P., Malhotra, A., Herscovici, S., Pittman, S. D., Zou, D., Grote, L., & Pillar, G.',
          year: 2011,
          title: 'Sleep staging based on autonomic signals: a multi-center validation study',
          journal: 'Journal of Clinical Sleep Medicine (JCSM)',
          doiOrPmid: '10.5664/JCSM.1078',
          sampleSize: 'n = 227 subjects (38 normal and 189 OSA patients across multiple centers)',
          protocolContext: 'Epoch-by-epoch 30s comparison of WatchPAT 4-stage classification (Wake, Light, Deep, REM) against in-lab PSG',
          reportedResult: 'Overall 4-stage epoch agreement 65.9% (Cohen kappa = 0.475); REM detection sensitivity 88.7% and specificity 94.0%.',
        },
        {
          authors: 'Yalamanchali, S., Farajian, V., Hamilton, C., Pott, T. R., Samuelson, C. G., & Friedman, M.',
          year: 2013,
          title: 'Diagnosis of obstructive sleep apnea by peripheral arterial tonometry: meta-analysis',
          journal: 'JAMA Otolaryngology–Head & Neck Surgery',
          doiOrPmid: '10.1001/jamaoto.2013.5338',
          sampleSize: 'Meta-analysis of 14 studies (n = 909 subjects)',
          protocolContext: 'WatchPAT respiratory indices (RDI, AHI, ODI) compared against simultaneous in-lab Type 1 PSG',
          reportedResult: 'Pooled AHI correlation r = 0.889 (95% CI: 0.862–0.911) against in-lab polysomnography.',
        },
      ],
      measurementSdSource:
        'Derived from Hedner et al. (2011) 4-stage epoch misclassification variance against PSG (~32% epoch error rate => SD ≈ 0.32 stage units).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'actigraph-leap-centrepoint',
    name: 'ActiGraph LEAP / CentrePoint Insight Watch',
    vendor: 'ActiGraph, LLC (Ametek)',
    model: 'ActiGraph LEAP (PPG + IMU) / CentrePoint Insight Watch',
    domainId: 'sleep',
    tier: 'silver',
    tagline: 'FDA 510(k)-cleared clinical trial wrist actigraphy and multi-sensor workhorse with raw data access and locked algorithms',
    summary:
      'The undisputed regulatory and academic standard for longitudinal rest-activity circadian rhythms and wrist actigraphy sleep endpoints (TST, WASO, Sleep Efficiency, Sleep Latency). ActiGraph LEAP adds multi-wavelength PPG, skin temperature, and barometric pressure to the classic 3-axis accelerometer in a 21 CFR Part 11 compliant ecosystem.',
    regulatory: {
      clearancePathway: '510(k)',
      clearanceNumber: 'K232445',
      productCode: 'MNR',
      regulationNumber: '21 CFR 868.2375',
      predicateChain: 'ActiGraph CentrePoint Insight Watch (K181634) & Empatica EmbracePlus (K201108)',
      consensusStandards: ['IEC 60601-1', 'IEC 60601-1-11', 'AASM Practice Parameters for Actigraphy'],
      reportedClearanceResults: [
        { metric: 'Sleep vs Wake Epoch Sensitivity', value: '91% – 95%', context: 'Cole-Kripke & Sadeh algorithms vs in-lab PSG (Quante et al. 2018)' },
        { metric: 'Total Sleep Time (TST) Bias', value: '+8 to +18 min', context: 'Overnight clinical validation vs PSG in adult cohorts' },
        { metric: 'Wake After Sleep Onset (WASO) Specificity', value: '35% – 55% (actigraphy) / ~68% (LEAP PPG+IMU)', context: 'Motionless wakefulness challenge vs EEG PSG' },
      ],
    },
    dataPipeline: {
      fileFormats: ['Open .gt3x binary / Raw CSV (32–100 Hz IMU, PPG)', 'Epoch CSV (30s / 60s)', 'CDISC SDTM clinical trial exports'],
      exportMethod: 'USB CentrePoint Dock OR BLE upload via CentrePoint Connect app to ActiGraph Cloud / AWS S3',
      easeScore: 4,
      easeSummary:
        'Unmatched transparency in clinical research: raw 32–100 Hz accelerometer `.gt3x` / CSV files can be processed directly in open-source R (`GGIR`) or Python (`pygt3x`, `agcounts`) without black-box scoring.',
      licensingPaywall: 'ActiLife desktop license (~$1,500) for local USB use, or CentrePoint Cloud per-study enterprise contract for remote trials',
      rawSignalAccess: true,
    },
    synchronization: {
      nativeSamplingRate: '32–100 Hz (3-axis accelerometer), 64 Hz (multi-wavelength PPG on LEAP), 30s or 60s sleep epochs',
      auxiliaryStreams: ['Ambient light lux sensor (photodiode)', 'Skin temperature', 'Gyroscope & Barometer (LEAP)', 'Off-wrist capacitive wear detection'],
      syncHardware: ['NTP clock sync via USB dock or BLE hub'],
      clockDriftPpm: 15,
      alignmentNotes:
        'Every raw accelerometer sample is timestamped to UTC milliseconds. Cross-correlate raw 32–100 Hz triaxial acceleration directly with any secondary wearable IMU.',
    },
    economics: {
      capexRange: '$325 (wGT3X-BT / Insight) – $695 (ActiGraph LEAP) per watch',
      opexOrSubscription: '$0 for local USB ActiLife workflow; enterprise per-site/per-subject fee for remote CentrePoint Cloud',
      consumablesRequired: ['Disposable or cleanable hospital-grade wrist straps ($12)'],
      perSubjectConsumableCost: 12.0,
      calibration: {
        intervalMonths: 0,
        type: 'Factory MEMS accelerometer and optical calibration; GGIR auto-calibration on gravity sphere',
        rmaTurnaroundWeeks: 2,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Pensacola, FL, USA',
        supportTimezone: 'CST (UTC-6)',
        clinicalSupportTier: 'Dedicated pharma/CRO clinical trial regulatory operations & biostatistics team',
      },
    },
    strengths: [
      'Gold-standard status for longitudinal sleep/wake and circadian rhythmicity (Interdaily Stability, Intradaily Variability, Relative Amplitude) in neurodegeneration trials',
      'Long battery life: 25–30 days on CentrePoint Insight Watch (7–14 days on LEAP with PPG), eliminating overnight charging dropouts',
      'Complete algorithmic reproducibility: raw triaxial acceleration can be scored with published open-source algorithms (Cole-Kripke, Tudor-Locke, Van Hees `GGIR`) and frozen forever',
    ],
    limitations: [
      'Traditional accelerometer-only models (wGT3X-BT / Insight) classify binary Sleep vs. Wake (plus circadian rest-activity) and cannot stage REM vs. N3 without the LEAP optical PPG channels',
      'Like all actigraphs, motionless wakefulness in bed (insomnia) is often misclassified as sleep, underestimating WASO',
      'Full cloud DCT infrastructure (CentrePoint) carries enterprise clinical trial setup fees',
    ],
    fieldGotchas: [
      'Parkinson resting tremor & dyskinesia trap: in Parkinson disease, resting pill-rolling tremor (4–6 Hz) or nocturnal periodic limb movements can register as wrist activity counts, causing standard Cole-Kripke thresholds to falsely score sleep as wake unless band-pass filtered or placed on the non-tremor-dominant limb.',
      'Sleeve occlusion of ambient light sensor: long pajama sleeves block the wrist lux sensor, invalidating automated "lights-out" bedtime markers.',
    ],
    measurementSd: 0.34,
    repeatabilityLimit: 0.94,
    studyInstrument: {
      formFactor: 'smartwatch_wrist',
      typicalBatteryLife: '7–14 days (ActiGraph LEAP with PPG active) or 25–30 days (CentrePoint Insight Watch / wGT3X-BT)',
      dataGranularity: 'raw_waveform',
      granularityDetails:
        'Full access to raw 32–100 Hz triaxial acceleration (in gravity `g` units), 64 Hz raw PPG on LEAP, and 30-second or 60-second epoch sleep/wake classifications (TST, WASO, Sleep Efficiency, Fragmentation Index).',
      offloadMechanism: 'direct_local_usb_sd',
      firmwareLockSupported: true,
      algorithmStabilityNotes:
        'Firmware is strictly locked per study protocol, and because raw `g` waveforms are exported, investigators can run deterministic open-source scoring (`GGIR` in R) with 100% version control across multi-year longitudinal studies.',
      contractAndCostWalls: [
        'Academic investigators can bypass cloud fees entirely by using local USB docking + open-source R `GGIR` or Python `pygt3x` packages.',
        'Remote smartphone/cellular syncing via the CentrePoint Cloud portal requires an enterprise study contract.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: true,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: true,
      },
      useFor: [
        'Primary or secondary clinical trial endpoints for Total Sleep Time (TST), WASO, Sleep Fragmentation, and 24-hour circadian rest-activity rhythm (IS, IV, L5, M10) in aging and Alzheimer/Parkinson trials',
        'Longitudinal studies requiring locked firmware, raw sensor access, and 21 CFR Part 11 regulatory defensibility',
        'Multi-week home monitoring where 14–30 day battery life prevents participant charging compliance failures',
      ],
      doNotUseFor: [
        'Fine-grained N1 vs. N2 vs. N3 cortical slow-wave staging (requires EEG such as Alice 6 PSG or Dreem 3 headband)',
        'Continuous 24-hour waking beat-to-beat HRV during active motion (LEAP PPG captures nocturnal/resting pulse rate and IBI only during low motion)',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'The #1 most widely cited wearable in Alzheimer, MCI, and Parkinson literature. Screenless (Insight) or locked-screen (LEAP) design plus 2-to-4 week battery life ensures high retention without daily participant interaction.',
        arrhythmiaAndEctopy:
          'Sleep/wake actigraphy is purely mechanical and unaffected by cardiac arrhythmias; LEAP nocturnal PPG IBI exports raw optical peaks for custom ectopic filtering.',
        skinToneAndPerfusion:
          'Triaxial MEMS accelerometry has zero skin-tone bias; LEAP multi-wavelength PPG includes green/red/IR emitters.',
      },
      validationCitations: [
        {
          authors: 'Quante, M., Kaplan, E. R., Cailler, M., Rueschman, M., Wang, R., Weng, J., Taveras, E. M., & Redline, S.',
          year: 2018,
          title: 'Actigraphy-based sleep estimation in adolescents and adults: a comparison with polysomnography using two scoring algorithms',
          journal: 'Nature and Science of Sleep',
          doiOrPmid: '10.2147/NSS.S151085',
          sampleSize: 'n = 67 participants vs in-lab Type 1 PSG',
          protocolContext: 'Epoch-by-epoch evaluation of ActiGraph GT3X+ Cole-Kripke and Sadeh algorithms against PSG',
          reportedResult: 'Overall epoch accuracy 84–86%, sleep sensitivity 93–96%, wake specificity 38–47%; TST mean bias +14.2 min.',
        },
        {
          authors: 'van Hees, V. T., Sabia, S., Anderson, K. N., Denton, S. J., Oliver, J., Catt, M., Abell, J. G., Kivimäki, M., Trenell, M. I., & Singh-Manoux, A.',
          year: 2015,
          title: 'A Novel, Open Access Method to Assess Sleep Duration Using a Wrist-Worn Accelerometer',
          journal: 'PLOS ONE',
          doiOrPmid: '10.1371/journal.pone.0142533',
          sampleSize: 'n = 28 sleep clinic patients (PSG comparison) + n = 3,752 Whitehall II older adults',
          protocolContext: 'Validation of open-source GGIR raw accelerometer z-angle sleep detection against PSG',
          reportedResult: 'C-statistic 0.83–0.86 against PSG across healthy and sleep-disordered older adults with full open-source reproducibility.',
        },
      ],
      measurementSdSource:
        'Derived from Quante et al. (2018) and van Hees et al. (2015) epoch concordance vs PSG (~15–16% sleep/wake epoch disagreement; multi-stage surrogate SD ≈ 0.34).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'dreem-3-headband',
    name: 'Dreem 3 / Beacon Biosignals EEG Headband',
    vendor: 'Beacon Biosignals (formerly Dreem)',
    model: 'Dreem 3S / Waveband Reduced-Montage Dry-EEG Headband',
    domainId: 'sleep',
    tier: 'silver',
    tagline: 'FDA 510(k)-cleared ambulatory dry-electrode EEG headband delivering PSG-grade 30-second cortical sleep staging at home',
    summary:
      'Bridges the gap between in-lab Type 1 PSG and peripheral wrist/finger wearables. Uses dry-polymer fronto-occipital EEG electrodes (F7, F8, Fp1, Fp2, O1, O2), a 3D accelerometer, and a cranial red/IR pulse oximeter to record true cortical brainwaves (sleep spindles, slow-wave delta oscillations, K-complexes) in the participant home.',
    regulatory: {
      clearancePathway: '510(k)',
      clearanceNumber: 'K222959',
      productCode: 'OLZ',
      regulationNumber: '21 CFR 882.1400',
      predicateChain: 'EnsoSleep (K210275) & Nox A1 PSG System (K151376)',
      consensusStandards: ['AASM Manual for the Scoring of Sleep', 'IEC 60601-1', 'IEC 60601-2-26'],
      reportedClearanceResults: [
        { metric: '5-Stage Epoch Accuracy vs Consensus PSG', value: '83.5% ± 6.4% (F1 = 83.8%)', context: 'Compared against 5 independent RPSGT scorers (Arnal et al. 2020)' },
        { metric: 'Cohen Kappa vs Consensus PSG', value: 'Kappa = 0.748', context: 'Equals human inter-scorer reliability (0.745) across Wake, N1, N2, N3, REM' },
        { metric: 'Slow-Wave (N3) & REM Sensitivity', value: 'N3: 84.1% | REM: 89.0%', context: 'Direct cortical EEG measurement vs gold-standard PSG' },
      ],
    },
    dataPipeline: {
      fileFormats: ['Standard EDF+ (250 Hz raw EEG + IMU + PPG)', 'JSON / CSV 30-second AASM hypnograms'],
      exportMethod: 'Wi-Fi / BLE upload via mobile app to Beacon Clinical Trial Cloud Portal (AWS S3)',
      easeScore: 4,
      easeSummary:
        'Exports standard 250 Hz multi-channel `.EDF` brainwave files alongside automated FDA-cleared 30-second AASM sleep stage annotations.',
      licensingPaywall: 'Strictly B2B / Enterprise Biopharma & Academic Clinical Trial contract (consumer sales discontinued)',
      rawSignalAccess: true,
    },
    synchronization: {
      nativeSamplingRate: '250 Hz (5-channel cortical EEG), 50 Hz (cranial 3-axis IMU & optical PPG), 30-second AASM epochs',
      auxiliaryStreams: ['Frontal & occipital EEG microvolts', 'Head position & respiration rate (3D IMU)', 'Cranial pulse rate', 'Signal quality index per channel'],
      syncHardware: ['NTP clock sync via companion smartphone'],
      clockDriftPpm: 10,
      alignmentNotes:
        'EDF files carry UTC timestamps and 30-second epoch boundaries directly compatible with standard sleep scoring suites (MNE-Python, YASA, Luna).',
    },
    economics: {
      capexRange: 'Leased / bundled via Beacon Biosignals clinical trial contracts (~$1,500 – $2,500 equivalent)',
      opexOrSubscription: 'Per-subject / per-night clinical trial platform & analytics fee',
      consumablesRequired: ['Replaceable soft fabric headband covers and dry occipital comb electrodes'],
      perSubjectConsumableCost: 15.0,
      calibration: {
        intervalMonths: 0,
        type: 'Automated pre-sleep electrode impedance check in companion app',
        rmaTurnaroundWeeks: 2,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Boston, MA, USA / Paris, France',
        supportTimezone: 'EST (UTC-5) / CET (UTC+1)',
        clinicalSupportTier: 'Dedicated Beacon Biosignals neurodiagnostic clinical trial operations team',
      },
    },
    strengths: [
      'The ONLY wearable form factor that directly measures cortical EEG (distinguishing true N1, N2 sleep spindles, and N3 delta slow waves rather than guessing from heart rate and wrist movement)',
      'Achieves 83.5% 5-stage accuracy (Kappa = 0.75) against consensus PSG—matching the ceiling of human RPSGT scorers',
      'Allows multi-night home EEG recording (e.g., 3–7 consecutive nights) at a fraction of the cost and first-night disruption of in-lab PSG',
    ],
    limitations: [
      'Not available for individual off-the-shelf retail purchase; requires a formal research or biopharma services contract with Beacon Biosignals',
      'Headband form factor has higher physical wear burden than a ring or wristwatch; unsuitable for 6-month continuous nightly wear',
      'Nighttime only: provides zero daytime activity or 24-hour ambulatory HRV tracking',
    ],
    fieldGotchas: [
      'Thick hair / braids at occipital sensors: the rear O1/O2 dry comb electrodes must part the hair to contact the scalp; thick braided hair or wigs can prevent occipital contact, forcing the algorithm to rely on frontal F7/F8 leads.',
      'Forehead sweat and headband shift: restless sleepers can push the headband upward off the forehead during the second half of the night.',
    ],
    measurementSd: 0.21,
    repeatabilityLimit: 0.58,
    studyInstrument: {
      formFactor: 'eeg_headband',
      typicalBatteryLife: '12–15 hours (1–2 nights per charge; recharged on cradle during the day)',
      dataGranularity: 'raw_waveform',
      granularityDetails:
        'Exports raw 250 Hz 5-channel EEG + 50 Hz head accelerometer + 50 Hz forehead PPG in standard `.EDF` format, plus FDA-cleared 30-second AASM 5-stage hypnograms (W, N1, N2, N3, REM) and quantitative EEG spectral power (delta, theta, alpha, sigma spindles).',
      offloadMechanism: 'cloud_rest_api',
      firmwareLockSupported: true,
      algorithmStabilityNotes:
        'FDA 510(k)-cleared (`K222959`) automated sleep staging algorithm is version-locked per clinical trial protocol, and raw 250 Hz EDF brainwaves can also be scored by blinded human RPSGTs or open-source `YASA`.',
      contractAndCostWalls: [
        'Dreem pivoted away from consumer sales in 2021 and was acquired by Beacon Biosignals in 2023; devices are available exclusively through institutional/biopharma clinical trial agreements.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: false,
        aasm30sSleepStaging: true,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'Neurodegenerative, aging, and CNS drug trials where true cortical sleep architecture (N3 slow-wave delta power, N2 spindle density, REM latency, micro-arousals) is a primary or secondary endpoint',
        'Multi-night home sleep validation comparator (Silver/Gold bridge) replacing $2,000/night in-lab PSG',
        'Episodic 2-to-7 night home sleep assessments at baseline and post-treatment milestones',
      ],
      doNotUseFor: [
        '24-hour heart rate variability (HRV) or daytime physical activity tracking (worn strictly in bed)',
        'Low-budget pilot studies needing 5–10 units off Amazon/retail without an institutional contract',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Critically valuable in Alzheimer and aging research because peripheral wrist/finger wearables infer "Deep Sleep" from low HR/movement—which breaks down in older adults who have attenuated slow-wave amplitude alongside low movement. Dreem directly measures cortical slow-wave uV amplitude.',
        arrhythmiaAndEctopy:
          'Cortical EEG staging is completely independent of cardiac rhythm abnormalities or autonomic neuropathy.',
        skinToneAndPerfusion:
          'Dry EEG biopotential electrodes are unaffected by skin pigmentation or peripheral vasoconstriction.',
      },
      validationCitations: [
        {
          authors: 'Arnal, P. J., Thorey, V., Debellemaniere, E., Ballard, M. E., Bou Hernandez, A., Guillot, A., Jourde, H., Harris, M., Guillard, M., Van Beers, P., Chennaoui, M., & Sauvet, F.',
          year: 2020,
          title: 'The Dreem Headband compared to polysomnography for electroencephalographic signal acquisition and sleep staging',
          journal: 'Sleep',
          doiOrPmid: '10.1093/sleep/zsaa097',
          sampleSize: 'n = 25 subjects recorded simultaneously with Dreem headband and in-lab Type 1 PSG scored by 5 independent RPSGTs',
          protocolContext: 'Simultaneous 250 Hz EEG signal correlation and 30-second 5-stage AASM epoch agreement vs 5-scorer consensus PSG',
          reportedResult: 'Overall 5-stage accuracy 83.5% ± 6.4% (F1 = 83.8%, Cohen kappa = 0.748), matching the 83.9% ± 5.5% agreement of the 5 human PSG experts.',
        },
      ],
      measurementSdSource:
        'Derived from Arnal et al. (2020) 30-second epoch concordance against 5-expert consensus PSG (83.5% accuracy vs 83.9% human ceiling => SD ≈ 0.21 stage units).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'oura-ring-gen-3-sleep',
    name: 'Oura Ring Gen 3 (Sleep Staging)',
    vendor: 'Oura Health Oy',
    model: 'Oura Ring Gen 3 / Gen 4 (Oura Sleep Staging Algorithm 2.0)',
    domainId: 'sleep',
    tier: 'bronze',
    tagline: 'Consumer smart ring tracking nocturnal PPG pulse volume, finger temperature, and 5-minute sleep stages',
    summary:
      'The consumer benchmark for finger-based wearable sleep tracking. Measures blood volume pulse from palmar digital arteries alongside negative temperature coefficient (NTC) thermistors and 3D accelerometry to provide consumer 4-stage hypnograms.',
    regulatory: {
      clearancePathway: 'Consumer / OTC',
      clearanceNumber: 'N/A (General wellness device)',
      productCode: 'MNR',
      predicateChain: 'N/A',
      consensusStandards: ['Consumer Technology Association CTA-2052.1'],
      reportedClearanceResults: [
        { metric: '4-Stage Sleep Concordance (OSSA 2.0)', value: '75.5% – 79.0% (Kappa ≈ 0.65)', context: 'Oura Sleep Staging Algorithm 2.0 vs in-lab PSG (Svensson et al. 2024; Altini & Kinnunen 2021)' },
        { metric: '2-Stage Sleep/Wake Accuracy', value: '91.7% – 94.0%', context: 'Sensitivity ~94%, Wake specificity ~73–83% vs PSG' },
      ],
    },
    dataPipeline: {
      fileFormats: ['JSON via Oura Cloud REST API v2', 'CSV export via Oura on the Web / Oura Teams'],
      exportMethod: 'Oura Cloud REST API v2 or manual CSV download',
      easeScore: 4,
      easeSummary:
        'Modern REST API provides easy JSON retrieval of 5-minute sleep phase arrays (`sleep_phase_5_min`); raw 250 Hz PPG waveform is locked.',
      licensingPaywall: 'Oura Membership ($5.99/mo) and Oura API token required (or Oura Teams enterprise contract)',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: '5-minute epoch arrays (`1`=Deep, `2`=Light, `3`=REM, `4`=Awake) and nocturnal summary metrics',
      auxiliaryStreams: ['Nocturnal HRV (rMSSD)', 'Resting heart rate', 'Finger skin temperature delta', 'Respiratory rate', 'Movement count'],
      syncHardware: ['NTP via mobile device Bluetooth sync'],
      clockDriftPpm: 15,
      alignmentNotes:
        'Oura returns sleep staging timestamps down to 5-minute boundaries in cloud JSON (`sleep_phase_5_min`). Cannot be aligned epoch-by-epoch at 30 seconds without downsampling PSG or upsampling Oura.',
    },
    economics: {
      capexRange: '$299 – $399 per ring + sizing kit ($10)',
      opexOrSubscription: '$5.99/month per active ring membership (or Oura Teams seat fee)',
      consumablesRequired: ['Ring sizing kits for participant fit verification'],
      perSubjectConsumableCost: 5.0,
      calibration: {
        intervalMonths: 0,
        type: 'Factory optical sensor array calibration',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Oulu, Finland / San Francisco, CA, USA',
        supportTimezone: 'EET (UTC+2) / PST (UTC-8)',
        clinicalSupportTier: 'Oura for Business / Healthcare research team',
      },
    },
    strengths: [
      'Unmatched participant compliance: titanium ring form factor is unobtrusive and lasts 4–7 days per charge, enabling multi-month longitudinal sleep studies',
      'Palmar digital arteries + finger skin temperature rhythms yield strong autonomic inputs for REM and circadian sleep onset detection',
      'Clean cloud REST API v2 enables automated retrieval of nightly sleep summaries and 5-minute hypnogram strings',
    ],
    limitations: [
      'Outputs sleep stages in 5-minute blocks (`sleep_phase_5_min`) in standard API exports rather than clinical 30-second AASM epochs, preventing standard 30s confusion matrix computation without special research agreements',
      'Uncontrolled OTA firmware and cloud scoring rollouts (e.g., transition from OSSA 1.0 to OSSA 2.0) alter stage distributions mid-study if not managed carefully',
      'Infers "Deep Sleep" (N3) from autonomic quiescence (low HR, high RMSSD, zero movement) rather than cortical delta waves—which can misclassify motionless light sleep in older adults',
    ],
    fieldGotchas: [
      'Ring rotation trap: the sensor bumps on Gen 3 must sit on the palm side of the finger. If a loose ring spins 180 degrees during sleep, LEDs fire into the dorsal fingernail, causing nocturnal data dropouts.',
      'Battery threshold rule: if Oura battery is below ~30% at bedtime, the ring disables optical PPG sleep staging for that night to preserve clock power.',
    ],
    measurementSd: 0.45,
    repeatabilityLimit: 1.25,
    studyInstrument: {
      formFactor: 'smart_ring',
      typicalBatteryLife: '4–7 days per charge',
      dataGranularity: 'epoch_1m_to_5m',
      granularityDetails:
        'Public Oura Cloud API v2 (`/v2/usercollection/sleep`) returns `sleep_phase_5_min` (one stage character per 5-minute block) plus nightly totals (`total_sleep_duration`, `rem_sleep_duration`, `deep_sleep_duration`, `awake_time`, `efficiency`, `latency`). 30-second epoch internal outputs are restricted to internal/partner validation modes.',
      offloadMechanism: 'cloud_rest_api',
      firmwareLockSupported: false,
      algorithmStabilityNotes:
        'High longitudinal risk if unmonitored: Oura periodically updates its cloud sleep staging model (e.g., Oura Sleep Staging Algorithm 2.0 rollout in 2022–2023), which significantly shifted Deep and REM minutes compared to the legacy model.',
      contractAndCostWalls: [
        'Requires active $5.99/mo Oura Membership per ring for API v2 data access, or an enterprise Oura Teams research contract.',
        'Raw 250 Hz PPG and 50 Hz accelerometer waveforms are locked and unavailable to external investigators.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: false,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: true,
      },
      useFor: [
        'Longitudinal multi-week or multi-month habitual sleep tracking (TST, sleep onset, wake time, nocturnal RMSSD, and temperature rhythm) where participant adherence is paramount',
        'Exploratory digital biomarker endpoints in decentralized trials',
        'Paired deployment alongside episodic 48-hour ECG/EEG assessments',
      ],
      doNotUseFor: [
        'Primary clinical trial endpoints requiring frozen firmware/algorithms or direct cortical slow-wave (N3) measurement in neurodegenerative disease',
        'Studies requiring standard 30-second AASM epoch exports via the public REST API',
        'Continuous 24-hour waking + sleeping HRV',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Highest longitudinal wear compliance among older adults (~90%), but autonomic surrogates for N3/REM have reduced specificity in synucleinopathies (Parkinson/Lewy body) where autonomic tone and REM motor atonia are disrupted.',
        arrhythmiaAndEctopy:
          'Because Oura relies heavily on nocturnal HRV features to distinguish REM from Light/Deep sleep, untreated atrial fibrillation or frequent nocturnal ectopy degrades sleep stage classification accuracy.',
        skinToneAndPerfusion:
          'Palmar finger site has minimal melanin interference and uses 900 nm IR + red/green wavelengths.',
      },
      validationCitations: [
        {
          authors: 'Svensson, T., Madhawa, K., Nt, H., Chung, U. I., & Svensson, A. K.',
          year: 2024,
          title: 'Validity and reliability of the Oura Ring Generation 3 (Ouraoy) with the Oura Sleep Staging Algorithm 2.0 (OSSA 2.0) when compared to multi-night ambulatory polysomnography',
          journal: 'Sleep Medicine',
          doiOrPmid: '10.1016/j.sleep.2024.01.020',
          sampleSize: 'n = 96 healthy adults across 301 nights of multi-night PSG',
          protocolContext: 'Epoch-by-epoch comparison of Oura Gen 3 (OSSA 2.0) against ambulatory PSG',
          reportedResult: '4-stage accuracy 75.5% (Cohen kappa = 0.65); sensitivity: Wake 74.4%, Light 77.7%, Deep 79.6%, REM 73.0%.',
        },
        {
          authors: 'de Zambotti, M., Rosas, L., Colrain, I. M., & Baker, F. C.',
          year: 2019,
          title: 'The Sleep of the Ring: Comparison of the ŌURA Sleep Tracker Against Polysomnography',
          journal: 'Behavioral Sleep Medicine',
          doiOrPmid: '10.1080/15402002.2017.1300587',
          sampleSize: 'n = 41 healthy adolescents and young adults',
          protocolContext: 'Simultaneous single-night comparison vs in-lab Type 1 PSG',
          reportedResult: 'Sleep/wake sensitivity 96%, wake specificity 48% (Gen 1/2 algorithm); improved to ~73–83% wake specificity in OSSA 2.0 (Altini & Kinnunen 2021).',
        },
      ],
      measurementSdSource:
        'Derived from 4-stage epoch discordance (~21–24.5% epoch disagreement vs PSG in Svensson et al. 2024; stage SD ≈ 0.45).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'apple-watch-sleep',
    name: 'Apple Watch Series 10 / Ultra 2 (Sleep Staging)',
    vendor: 'Apple Inc.',
    model: 'Apple Watch Series 9 / 10 / Ultra 2 (WatchOS 9+ Native Sleep)',
    domainId: 'sleep',
    tier: 'bronze',
    tagline: 'Consumer smartwatch classifying Awake, Core, Deep, and REM sleep from wrist accelerometry and optical pulse',
    summary:
      'Apple native WatchOS sleep staging algorithm trained on multi-thousand-night PSG datasets. Classifies 30-second windows into Awake, REM, Core (N1+N2), and Deep (N3) sleep, plus an FDA-cleared Sleep Apnea Notification feature (WatchOS 11, K240929) based on 30-day accelerometer breathing disturbances.',
    regulatory: {
      clearancePathway: 'Consumer / OTC',
      clearanceNumber: 'N/A for sleep stages (Sleep Apnea Notification is 510(k) K240929)',
      productCode: 'MNR',
      predicateChain: 'N/A for staging (K240929 De Novo / 510(k) for moderate-to-severe OSA screening)',
      consensusStandards: ['CTA-2052.1'],
      reportedClearanceResults: [
        { metric: '4-Stage Concordance vs PSG', value: '~77% – 79% (Kappa ≈ 0.63)', context: 'Apple white paper validation across 600+ PSG nights (Awake, REM, Core, Deep)' },
        { metric: 'Sleep Apnea Notification (K240929)', value: 'Sensitivity 66.3% | Specificity 98.5%', context: '30-day multi-night breathing disturbance screening for moderate-to-severe OSA (AHI >= 15)' },
      ],
    },
    dataPipeline: {
      fileFormats: ['HealthKit XML / JSON (`HKCategoryTypeIdentifierSleepAnalysis`)'],
      exportMethod: 'Apple Health export on paired iPhone or custom ResearchKit / HealthKit iOS app',
      easeScore: 3,
      easeSummary:
        'Exports contiguous stage intervals (`Awake`, `ASleepCore`, `ASleepDeep`, `ASleepREM`) with start/end timestamps via HealthKit; no public cloud API exists.',
      licensingPaywall: 'Requires paired iPhone + Apple Developer account ($99/yr) or third-party aggregator (Fitabase / MyDataHelps)',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: 'Contiguous state-change intervals (derived from 30-second internal windows)',
      auxiliaryStreams: ['Breathing disturbances (`HKQuantityTypeIdentifierAppleSleepingBreathingDisturbances`)', 'Wrist temperature delta', 'Nocturnal respiratory rate', 'Resting HR'],
      syncHardware: ['Apple NTP time sync via paired iPhone'],
      clockDriftPpm: 5,
      alignmentNotes:
        'HealthKit stores sleep stages as run-length-encoded time intervals (`startDate`, `endDate`, `value`). Slice into 30-second epochs on UTC boundaries to align with PSG.',
    },
    economics: {
      capexRange: '$399 (Series 10) – $799 (Ultra 2)',
      opexOrSubscription: 'Requires paired iPhone ($500+) + optional third-party research portal ($5–$15/subject/mo)',
      consumablesRequired: ['None'],
      perSubjectConsumableCost: 0,
      calibration: {
        intervalMonths: 0,
        type: 'Factory IMU and optical calibration',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Cupertino, CA, USA',
        supportTimezone: 'PST (UTC-8)',
        clinicalSupportTier: 'Apple Investigator Support Program (competitive grant-only) or general Developer Relations',
      },
    },
    strengths: [
      'Outputs contiguous stage intervals aligned to 30-second boundaries (`Core`, `Deep`, `REM`, `Awake`) rather than coarse 5-minute blocks',
      'WatchOS 11+ includes an FDA-cleared (`K240929`) Breathing Disturbances metric using the wrist accelerometer to screen for moderate-to-severe sleep apnea over 30-day windows',
      'Zero monthly consumer subscription fee once hardware is owned',
    ],
    limitations: [
      '#1 Operational killer for longitudinal sleep studies: 18-to-36 hour battery life means participants routinely place the Apple Watch on its charger at bedtime, yielding massive missing-night rates',
      'Requires Sleep Focus / Sleep Schedule or automatic 4-hour minimum sleep detection; short daytime naps (< 1–3 hours) in older adults frequently go un-staged',
      'No cloud API: data is trapped in the local iPhone HealthKit store unless pulled by a companion iOS research app',
    ],
    fieldGotchas: [
      'The Nightstand Charging Habit: consumer Apple Watch owners are conditioned over years to charge their watch overnight. In clinical trials, unless coordinators train participants to charge for 45 minutes during dinner, nocturnal compliance drops below 60%.',
      'Short sleep / fragmented sleep cutoff: if a neurodegenerative patient sleeps in fragmented 2-hour bouts separated by long awakenings, WatchOS may fail to generate a 4-stage hypnogram for that night.',
    ],
    measurementSd: 0.44,
    repeatabilityLimit: 1.22,
    studyInstrument: {
      formFactor: 'smartwatch_wrist',
      typicalBatteryLife: '18 hours (Series 10) to 36 hours (Ultra 2) — requires daily charging',
      dataGranularity: 'epoch_30s_clinical',
      granularityDetails:
        'HealthKit exports `HKCategoryValueSleepAnalysis` intervals (`asleepCore`, `asleepDeep`, `asleepREM`, `awake`) quantized to 30-second transitions, plus nightly respiratory rate and wrist temperature delta. Raw PPG and raw accelerometer streams during sleep are locked.',
      offloadMechanism: 'mobile_os_sandbox',
      firmwareLockSupported: false,
      algorithmStabilityNotes:
        'Annual and point WatchOS releases update the underlying neural network weights for sleep staging without version pinning.',
      contractAndCostWalls: [
        'Requires an iPhone per participant and either a custom iOS HealthKit export app or a third-party platform (Fitabase, Labfront, MyDataHelps).',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: false,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'Short-duration (7–14 day) or BYOD iOS studies with highly engaged participants who commit to daytime charging',
        'Observational screening of nocturnal breathing disturbances alongside consumer 4-stage sleep estimates',
      ],
      doNotUseFor: [
        'Multi-month sleep trials in aging, MCI, or Alzheimer cohorts (daily charging cycle causes severe nocturnal data attrition)',
        'Studies requiring continuous 24-hour HRV or raw EEG/PPG signals',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Poor fit for cognitively impaired cohorts due to daily charging friction, Sleep Focus mode toggles, and failure to stage short daytime naps.',
        arrhythmiaAndEctopy:
          'Sleep staging relies predominantly on wrist micro-movements and respiratory motion, making it somewhat less sensitive to ectopic beats than purely HRV-driven classifiers, though autonomic features are still used.',
        skinToneAndPerfusion:
          'Breathing disturbance tracking uses the 3-axis accelerometer (skin-tone invariant); optical pulse rate auto-adjusts LED current.',
      },
      validationCitations: [
        {
          authors: 'Apple Inc. (Clinical Validation White Paper)',
          year: 2022,
          title: 'Estimating Sleep Stages from Apple Watch: Algorithm Validation',
          journal: 'Apple Health Technical White Paper',
          sampleSize: 'n = 616 nights across diverse adult participants with simultaneous PSG',
          protocolContext: '30-second epoch 4-stage (Awake, REM, Core, Deep) comparison against triple-scored AASM PSG',
          reportedResult: 'Overall 4-stage agreement ~78%; sensitivity: Awake 69.8%, REM 78.2%, Core 83.2%, Deep 68.5%.',
        },
        {
          authors: 'Miller, D. J., Sargent, C., & Roach, G. D.',
          year: 2022,
          title: 'A Validation of Six Wearable Devices for Estimating Sleep, Heart Rate and Heart Rate Variability in Healthy Adults',
          journal: 'Sensors',
          doiOrPmid: '10.3390/s22166317',
          sampleSize: 'n = 53 healthy adults vs 12-lead in-lab PSG',
          protocolContext: 'Sleep/wake and multi-stage accuracy vs laboratory PSG',
          reportedResult: 'Sleep/wake sensitivity 97%, wake specificity 52%; 4-stage accuracy shows high Core sensitivity with moderate Deep/Wake differentiation.',
        },
      ],
      measurementSdSource:
        'Estimated from 4-stage epoch discordance against multi-scorer PSG (~22% epoch error rate => SD ≈ 0.44 stage units).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'whoop-4-sleep',
    name: 'WHOOP 4.0 (Sleep Staging)',
    vendor: 'WHOOP, Inc.',
    model: 'WHOOP 4.0 Strap',
    domainId: 'sleep',
    tier: 'bronze',
    tagline: 'Screenless subscription strap providing 4-stage sleep duration summaries and on-wrist wireless charging',
    summary:
      'Tracks sleep onset, wake after sleep onset, and 4-stage sleep durations (Awake, Light, Slow Wave Sleep, REM) using multi-wavelength PPG and 3D accelerometry. Its slide-on battery pack solves the overnight charging dropout problem, but public API exports are restricted to whole-night stage duration totals rather than epoch-by-epoch hypnograms.',
    regulatory: {
      clearancePathway: 'Consumer / OTC',
      clearanceNumber: 'N/A (General wellness device)',
      productCode: 'MNR',
      predicateChain: 'N/A',
      consensusStandards: ['CTA-2052.1'],
      reportedClearanceResults: [
        { metric: '4-Stage Epoch Agreement vs PSG', value: '64% – 68% (Kappa ≈ 0.49)', context: 'Epoch-by-epoch comparison vs in-lab PSG (Miller et al. 2022)' },
        { metric: '2-Stage Sleep/Wake Accuracy', value: '86% – 89%', context: 'Sleep sensitivity 90%, wake specificity 60% vs PSG (Miller et al. 2022)' },
        { metric: 'Total Sleep Time (TST) Bias', value: '-1.4 ± 36.6 min', context: 'Whole-night TST agreement vs laboratory PSG' },
      ],
    },
    dataPipeline: {
      fileFormats: ['JSON via WHOOP Developer API v1 (`/v1/activity/sleep`)', 'CSV summary export'],
      exportMethod: 'BLE to WHOOP app -> WHOOP Cloud REST API',
      easeScore: 2,
      easeSummary:
        'Public API v1 returns ONLY whole-night stage totals (`total_light_sleep_time_milli`, `total_slow_wave_sleep_time_milli`, `total_rem_sleep_time_milli`); epoch-by-epoch sleep hypnograms are NOT exposed in the public API.',
      licensingPaywall: 'Mandatory $239/yr subscription per strap; epoch-level research access requires an enterprise WHOOP Unite contract',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: 'Whole-night sleep summary intervals (bedtime start/end + total milliseconds in each stage)',
      auxiliaryStreams: ['Sleep respiratory rate (median breaths/min)', 'Sleep efficiency %', 'Sleep consistency %', 'Disturbance count'],
      syncHardware: ['Smartphone NTP via BLE'],
      clockDriftPpm: 20,
      alignmentNotes:
        'Without an enterprise WHOOP Unite research contract, investigators only receive `start` and `end` timestamps for the entire sleep episode and aggregate stage durations—no 30s or 5-min hypnogram array is returned.',
    },
    economics: {
      capexRange: '$0 hardware (bundled into $239/yr subscription per strap)',
      opexOrSubscription: '$239/year per unit or enterprise WHOOP Unite contract',
      consumablesRequired: ['SuperKnit bands'],
      perSubjectConsumableCost: 0,
      calibration: {
        intervalMonths: 0,
        type: 'Factory calibrated',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Boston, MA, USA',
        supportTimezone: 'EST (UTC-5)',
        clinicalSupportTier: 'WHOOP Unite Enterprise Research Partnerships',
      },
    },
    strengths: [
      'On-wrist slide-on battery pack means participants never take the device off to charge at night, achieving very high nocturnal capture rates',
      'Automatically detects both nocturnal sleep and daytime naps (> 20–30 minutes) without requiring the user to press a "Sleep Mode" button',
      'Unbiased total sleep time (TST bias -1.4 min) and superior wake specificity (60%) compared to legacy wrist actigraphy (Miller et al. 2022)',
    ],
    limitations: [
      'Public API v1 does NOT return an epoch-by-epoch hypnogram (only aggregate nightly stage durations in milliseconds)',
      'Lower 4-stage epoch concordance (~64–68%) against PSG than Dreem 3 (83.5%) or Oura OSSA 2.0 (75.5–79%)',
      'Mandatory annual subscription ($239/yr per device) and unannounced cloud algorithm updates',
    ],
    fieldGotchas: [
      'Missing Hypnogram Trap: if your study analysis plan requires computing stage transition probabilities, REM latency, or ultradian cycle timing, the public WHOOP API will block you because it only outputs nightly sums.',
      'Bluetooth background sync delay: if a participant does not open the WHOOP mobile app for several days, the strap buffers data locally and cloud API webhooks stall until the phone syncs.',
    ],
    measurementSd: 0.51,
    repeatabilityLimit: 1.41,
    studyInstrument: {
      formFactor: 'smartwatch_wrist',
      typicalBatteryLife: '4–5 days (recharged on-wrist via wireless battery pack)',
      dataGranularity: 'summary_only',
      granularityDetails:
        'Public WHOOP API v1 (`/v1/activity/sleep`) provides whole-night stage duration totals (`total_awake_time_milli`, `total_light_sleep_time_milli`, `total_slow_wave_sleep_time_milli`, `total_rem_sleep_time_milli`, `disturbance_count`, `respiratory_rate`), NOT 30-second or 5-minute epoch arrays.',
      offloadMechanism: 'cloud_rest_api',
      firmwareLockSupported: false,
      algorithmStabilityNotes:
        'Cloud sleep staging models update automatically without researcher version control.',
      contractAndCostWalls: [
        'Requires active $239/yr membership per device.',
        'Obtaining epoch-level hypnogram arrays requires a custom WHOOP Unite Enterprise research agreement.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: false,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: true,
      },
      useFor: [
        'Longitudinal studies examining nightly Total Sleep Time (TST), sleep timing, nap frequency, and nocturnal respiratory rate where on-wrist charging is desired',
      ],
      doNotUseFor: [
        'Studies requiring 30-second or 5-minute epoch-by-epoch sleep hypnograms without an enterprise contract',
        'Primary clinical trial endpoints requiring frozen algorithms or cortical slow-wave measurement',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Automatic nap detection is helpful for older adults who nap during the day, but attaching the slide-on wireless battery pack can be challenging for participants with hand tremor or arthritis.',
        arrhythmiaAndEctopy:
          'Uses heart rate variability features for sleep staging; arrhythmias reduce staging accuracy.',
        skinToneAndPerfusion:
          'Multi-wavelength optical array performs reliably for nocturnal pulse rate, though tight strap tension must be monitored.',
      },
      validationCitations: [
        {
          authors: 'Miller, D. J., Sargent, C., & Roach, G. D.',
          year: 2022,
          title: 'A Validation of Six Wearable Devices for Estimating Sleep, Heart Rate and Heart Rate Variability in Healthy Adults',
          journal: 'Sensors',
          doiOrPmid: '10.3390/s22166317',
          sampleSize: 'n = 53 healthy adults vs 12-lead Type 1 in-lab PSG',
          protocolContext: 'Epoch-by-epoch 2-stage and 4-stage sleep evaluation against laboratory PSG',
          reportedResult: '2-stage sleep/wake accuracy 86% (sleep sensitivity 90%, wake specificity 60%); 4-stage accuracy 64% (Cohen kappa = 0.49); TST bias -1.4 ± 36.6 min.',
        },
      ],
      measurementSdSource:
        'Derived from Miller et al. (2022) 4-stage epoch concordance against PSG (~36% multistage epoch error => SD ≈ 0.51 stage units).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'fitbit-pixel-sleep',
    name: 'Google Pixel Watch 3 / Fitbit Charge 6 (Sleep Stages)',
    vendor: 'Google LLC / Fitbit',
    model: 'Fitbit Charge 6 / Inspire 3 / Google Pixel Watch 3',
    domainId: 'sleep',
    tier: 'bronze',
    tagline: 'Ubiquitous consumer sleep tracker exporting 30-second stage intervals via Web API, subject to Google account & intraday walls',
    summary:
      'Historically the most widely deployed consumer sleep wearable in NIH All of Us and academic epidemiology. Combines 3D wrist accelerometry with optical heart rate variability to output 30-second sleep stage intervals (Wake, Light, Deep, REM) via the Fitbit Web API—though recent Google account migrations and API policy changes have introduced operational friction.',
    regulatory: {
      clearancePathway: 'Consumer / OTC',
      clearanceNumber: 'N/A for sleep staging (Irregular Rhythm Notification is K212380)',
      productCode: 'MNR',
      predicateChain: 'N/A',
      consensusStandards: ['CTA-2052.1'],
      reportedClearanceResults: [
        { metric: '4-Stage Epoch Agreement vs PSG', value: '69% – 73% (Kappa ≈ 0.55)', context: 'Epoch-by-epoch 30s comparison vs in-lab PSG (Haghayegh et al. 2019; Menghini et al. 2021)' },
        { metric: 'Sleep/Wake Sensitivity & Specificity', value: 'Sens: 95% | Spec: 58% – 62%', context: 'Meta-analysis across Fitbit Charge/Alta/Versa models vs PSG (Haghayegh et al. 2019)' },
      ],
    },
    dataPipeline: {
      fileFormats: ['JSON via Fitbit Web API (`/1.2/user/-/sleep/date/*.json`)', 'CSV via Fitabase'],
      exportMethod: 'BLE to Fitbit app -> Fitbit Web REST API (OAuth 2.0) or Fitabase Research Portal',
      easeScore: 3,
      easeSummary:
        'Unlike Oura or WHOOP, the public Fitbit Web API actually returns 30-second resolution sleep stage intervals (`levels.data` with `dateTime`, `level`, `seconds`) for free; however, 1-second intraday HR and multi-account management are heavily restricted without Fitabase.',
      licensingPaywall: 'Free public Web API for 30s sleep stages (requires individual OAuth setup); Fitabase middleware costs ~$5,000–$12,000/yr per study',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: '30-second sleep stage intervals (`wake`, `light`, `deep`, `rem`) + `shortData` wake micro-bouts',
      auxiliaryStreams: ['Nocturnal RMSSD (`/hrv` summary)', 'Breathing rate (`/br`)', 'SpO2 average/min/max', 'Skin temperature variation'],
      syncHardware: ['Smartphone NTP via BLE'],
      clockDriftPpm: 20,
      alignmentNotes:
        'Caution when parsing Fitbit JSON: the API returns a primary `data` array (contiguous stage blocks) AND a separate `shortData` array (brief < 3-minute wake intrusions) that must be overlaid onto `data` to reconstruct the true 30-second hypnogram.',
    },
    economics: {
      capexRange: '$99 (Inspire 3) – $159 (Charge 6) – $349 (Pixel Watch 3)',
      opexOrSubscription: '$0 for basic Web API sleep stages (Fitbit Premium $9.99/mo NOT required for API stage export); Fitabase optional',
      consumablesRequired: ['Silicone wrist bands'],
      perSubjectConsumableCost: 0,
      calibration: {
        intervalMonths: 0,
        type: 'Factory calibrated',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Mountain View / San Francisco, CA, USA',
        supportTimezone: 'PST (UTC-8)',
        clinicalSupportTier: 'Community developer forum only (unless contracted via Fitabase or Google Health enterprise)',
      },
    },
    strengths: [
      'Public Fitbit Web API (`/1.2/user/-/sleep`) uniquely exposes 30-second granularity sleep stage intervals (`wake`, `light`, `deep`, `rem`) without requiring a paid monthly consumer subscription',
      'Fitbit Inspire 3 ($99) and Charge 6 ($159) offer 7-to-10 day battery life at low hardware CapEx (note: Pixel Watch 3 only lasts ~24 hours)',
      'Extensive published validation literature across adolescents, adults, and clinical insomnia cohorts',
    ],
    limitations: [
      'Policy & ecosystem turbulence: mandatory migration from legacy Fitbit accounts to Google accounts (2023–2025) broke automated dummy-account provisioning workflows used by many clinical coordinators',
      'Intraday heart rate (1-second / 1-minute resolution) via the public Web API is locked to "Personal" app type (1 account per developer app) unless Google manually approves an intraday research request or the team pays for Fitabase',
      'Falls back to "Classic" (restless/awake/asleep) mode instead of 4-stage classification if the sleep bout is < 3 hours or optical heart rate signal is lost',
    ],
    fieldGotchas: [
      'The `shortData` Parsing Bug: researchers who only parse `levels.data` in the Fitbit Sleep API v1.2 miss all short (< 180s) awakenings stored in `levels.shortData`, artificially inflating Total Sleep Time and suppressing WASO.',
      'Pixel Watch vs. Charge/Inspire battery trap: never confuse the Pixel Watch (24-hour battery, high overnight charging dropout) with the Fitbit Charge 6 / Inspire 3 (7–10 day battery).',
    ],
    measurementSd: 0.46,
    repeatabilityLimit: 1.27,
    studyInstrument: {
      formFactor: 'smartwatch_wrist',
      typicalBatteryLife: '7–10 days (Fitbit Inspire 3 / Charge 6) vs. 24 hours (Google Pixel Watch 3)',
      dataGranularity: 'epoch_30s_clinical',
      granularityDetails:
        'Fitbit Web API v1.2 exports 30-second sleep stage intervals (`wake`, `light`, `deep`, `rem`) when `data` and `shortData` arrays are merged. Nocturnal HRV (`/1/user/-/hrv`) exports 5-minute nocturnal RMSSD, LF, HF, and coverage values. Raw PPG and raw beat-to-beat IBI are completely inaccessible.',
      offloadMechanism: 'cloud_rest_api',
      firmwareLockSupported: false,
      algorithmStabilityNotes:
        'Uncontrolled OTA firmware and cloud scoring updates; furthermore, Google has periodically changed OAuth scopes, account rules, and API rate limits (150 calls/hour/user).',
      contractAndCostWalls: [
        'Creating 50+ de-identified participant Google accounts now triggers automated Google phone-number / 2FA bot-detection blocks during study setup.',
        'Intraday 1-sec/1-min HR access for multiple study participants requires manual Google developer review or a paid Fitabase license ($5,000–$12,000/yr).',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: true,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: true,
      },
      useFor: [
        'Low-CapEx ($99–$159/unit with Inspire 3 or Charge 6) multi-week observational sleep and step-count studies when paired with Fitabase or pre-approved OAuth pipelines',
        'Consumer sleep comparisons requiring 30-second hypnogram export intervals',
      ],
      doNotUseFor: [
        'Continuous 24-hour beat-to-beat HRV (only 5-minute nocturnal HRV summaries are available)',
        'Studies in severe sleep fragmentation (< 3 hour bouts) where Fitbit drops out of 4-stage scoring and reverts to simplified restless/asleep mode',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'If deploying in older adults, choose Fitbit Inspire 3 or Charge 6 (7–10 day battery) rather than Pixel Watch 3 (daily charging). Note that older adults with fragmented sleep (< 3h continuous) often trigger the "Classic sleep fallback" bug.',
        arrhythmiaAndEctopy:
          'If nocturnal optical pulse is irregular or low-quality, Fitbit refuses to compute 4-stage sleep and falls back to movement-only sleep/restless logs.',
        skinToneAndPerfusion:
          'Standard green wrist PPG; loose wrist bands in thin elderly wrists frequently cause nocturnal optical signal loss.',
      },
      validationCitations: [
        {
          authors: 'Haghayegh, S., Khoshnevis, S., Smolensky, M. H., Diller, K. R., & Castriotta, R. J.',
          year: 2019,
          title: 'Accuracy of Wristband Fitbit Models in Assessing Sleep: Systematic Review and Meta-Analysis',
          journal: 'Journal of Medical Internet Research (JMIR)',
          doiOrPmid: '10.2196/16273',
          sampleSize: 'Systematic review of 22 PSG validation studies',
          protocolContext: 'Comparison of staging-enabled Fitbit models against in-lab Type 1 PSG',
          reportedResult: 'Sleep sensitivity 0.95, wake specificity 0.58–0.62; 4-stage epoch agreement ~69–73% vs PSG, significantly outperforming non-staging wrist actigraphy on wake specificity.',
        },
        {
          authors: 'Menghini, L., Cellini, N., Goldstone, A., Baker, F. C., & de Zambotti, M.',
          year: 2021,
          title: 'A standardized framework for testing the performance of sleep-tracking technology: step-by-step guidelines and open-source code',
          journal: 'Sleep',
          doiOrPmid: '10.1093/sleep/zsaa170',
          sampleSize: 'n = 45 healthy individuals vs in-lab PSG',
          protocolContext: 'Standardized epoch-by-epoch evaluation of Fitbit sleep staging against PSG',
          reportedResult: 'Demonstrated ~70% 4-stage accuracy with systematic underestimation of N3 during early night and WASO during brief awakenings.',
        },
      ],
      measurementSdSource:
        'Derived from Haghayegh et al. (2019) and Menghini et al. (2021) 4-stage epoch discordance against PSG (~28–30% epoch error => SD ≈ 0.46 stage units).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'withings-sleep-mat',
    name: 'Withings Sleep Analyzer / Tracking Mat',
    vendor: 'Withings France SA',
    model: 'Withings Sleep (US) / Sleep Analyzer (EU CE-MDR Class IIa)',
    domainId: 'sleep',
    tier: 'bronze',
    tagline: 'Zero-wear-burden under-mattress pneumatic ballistocardiography mat for dementia and multi-month aging cohorts',
    summary:
      'An air-filled pneumatic bladder and acoustic microphone sensor strip placed permanently beneath the mattress at chest level. Plugs into wall AC power and syncs automatically over home Wi-Fi—requiring zero body-worn hardware, zero battery charging, and zero smartphone interaction from the participant.',
    regulatory: {
      clearancePathway: 'Consumer / OTC',
      clearanceNumber: 'CE-MDR Class IIa in Europe (Apnea detection); OTC Wellness in USA',
      productCode: 'MNR',
      predicateChain: 'N/A in USA; CE medical device for sleep apnea screening (AHI) in EU/UK',
      consensusStandards: ['IEC 60601-1-11', 'CTA-2052.1'],
      reportedClearanceResults: [
        { metric: 'AHI Correlation vs In-Lab PSG', value: 'r = 0.78 (MAE = 6.2 events/h)', context: 'Multi-center sleep clinic validation (Edouard et al. 2021, n = 118)' },
        { metric: 'Moderate-to-Severe OSA (AHI >= 15)', value: 'Sensitivity 88.0% | Specificity 88.6%', context: 'AUROC = 0.926 vs simultaneously scored Type 1 PSG (Edouard et al. 2021)' },
        { metric: 'Total Sleep Time Bias vs PSG', value: '+27.0 ± 51.0 min', context: 'Under-mattress ballistocardiography vs PSG (overevaluates motionless wake in bed)' },
      ],
    },
    dataPipeline: {
      fileFormats: ['JSON via Withings Public Health Cloud REST API (`Sleep v2 - Get` & `GetSummary`)', 'CSV export'],
      exportMethod: 'Direct Wi-Fi upload from mat to Withings Cloud -> Public OAuth2 REST API / Webhooks',
      easeScore: 5,
      easeSummary:
        'Zero participant intervention: the moment the participant gets out of bed, the mat uploads sleep stage epochs, HR, RR, snoring, and apnea index directly over Wi-Fi to the free Withings Public API.',
      licensingPaywall: 'Free public Withings Health API (no monthly consumer subscription required)',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: '1-minute to 5-minute state intervals (`Awake`, `Light`, `Deep`, `REM`) + 1-minute nocturnal HR/RR',
      auxiliaryStreams: ['Nocturnal Ballistocardiographic Heart Rate', 'Respiratory Rate', 'Snoring duration', 'Apnea-Hypopnea Index (EU/Research API)'],
      syncHardware: ['Direct Wi-Fi NTP synchronization after every sleep session'],
      clockDriftPpm: 10,
      alignmentNotes:
        'Timestamps are NTP-synchronized via Wi-Fi at the end of every bed occupancy session.',
    },
    economics: {
      capexRange: '$129 – $169 per mat',
      opexOrSubscription: 'None ($0 subscription)',
      consumablesRequired: ['None (placed beneath mattress; no skin contact)'],
      perSubjectConsumableCost: 0,
      calibration: {
        intervalMonths: 0,
        type: 'Automatic pneumatic bladder inflation calibration on first plug-in',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Issy-les-Moulineaux, France / Boston, MA, USA',
        supportTimezone: 'CET (UTC+1) / EST (UTC-5)',
        clinicalSupportTier: 'Withings Health Solutions (dedicated cellular hub options available for Wi-Fi-free homes)',
      },
    },
    strengths: [
      '100% passive compliance: placed once under the mattress and plugged into the wall—impossible for a participant to forget to charge or forget to wear',
      'Direct Wi-Fi upload (or optional Withings Data Hub cellular bridge) eliminates smartphone Bluetooth pairing failures',
      'Free, well-documented public REST API (`Sleep v2`) with zero monthly subscription fees',
    ],
    limitations: [
      'Strictly restricted to in-bed episodes: cannot detect daytime naps taken in a living room recliner or sofa',
      'Ballistocardiography (BCG) has lower wake specificity than EEG or finger PPG: reading a book or watching TV motionlessly in bed is frequently misclassified as light sleep',
      'Mechanical cross-talk from a bed partner, restless pet sleeping on the bed, or ultra-thick (> 16 inch) memory foam / adjustable air mattresses can contaminate the pneumatic signal',
    ],
    fieldGotchas: [
      'Bed partner & pet contamination: the mat must be positioned strictly under the participant side of the mattress; a heavy dog jumping onto the bed or a partner tossing violently can register false arousals or cardiac beats.',
      'Recliner sleeping in elderly cohorts: many older adults with orthopnea, heart failure, or dementia nap or sleep in an armchair—which an under-mattress sensor completely misses.',
    ],
    measurementSd: 0.48,
    repeatabilityLimit: 1.33,
    studyInstrument: {
      formFactor: 'under_mattress_mat',
      typicalBatteryLife: 'Mains AC USB-powered (infinite battery life; zero charging)',
      dataGranularity: 'epoch_1m_to_5m',
      granularityDetails:
        'Withings Public API (`Sleep v2 - Get`) returns epoch-level sleep state intervals (`0`=Awake, `1`=Light, `2`=Deep, `3`=REM) alongside 1-minute resolution nocturnal heart rate, respiration rate, snoring, and movement arrays, plus `GetSummary` nightly aggregates (including `apnea_hypopnea_index` where enabled). Raw pneumatic pressure waveforms are not exposed.',
      offloadMechanism: 'cloud_rest_api',
      firmwareLockSupported: false,
      algorithmStabilityNotes:
        'Firmware updates automatically over Wi-Fi, though the CE-MDR Class IIa apnea detection algorithm is regulated under European medical device change controls.',
      contractAndCostWalls: [
        'Public Withings Developer API is completely free with no per-user subscription fees.',
        'In US consumer accounts, the clinical Apnea-Hypopnea Index (`apnea_hypopnea_index`) field is geo-restricted unless unlocked through a Withings Health Solutions research agreement (though EU accounts expose it natively).',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: false,
        aasm30sSleepStaging: false,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: true,
      },
      useFor: [
        'Multi-month to multi-year longitudinal home sleep, bed-exit (nocturia / wandering), and nocturnal cardiorespiratory monitoring in Alzheimer disease, dementia, and frail aging cohorts who refuse or remove wrist/finger wearables',
        'Zero-burden decentralized sleep apnea and nocturnal heart rate trend monitoring',
      ],
      doNotUseFor: [
        'Heart Rate Variability (HRV) endpoints (under-mattress ballistocardiography measures mechanical J-wave cardiac ejection recoil, which has too much beat-to-beat timing jitter for standard RMSSD/HF HRV)',
        'Participants who sleep in recliners, travel frequently, or share a narrow mattress with an active partner or large pet',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Unbeatable for moderate-to-severe dementia (e.g., UK DRI Care Research & Technology Centre protocols): zero tactile irritation, zero charging, and tracks nighttime bed exits / wandering automatically.',
        arrhythmiaAndEctopy:
          'BCG mechanical stroke volume varies beat-to-beat in atrial fibrillation, reducing nocturnal heart rate precision.',
        skinToneAndPerfusion:
          'Pneumatic mechanical and acoustic sensing through the mattress has zero optical dependency on skin tone or peripheral perfusion.',
      },
      validationCitations: [
        {
          authors: 'Edouard, P., Campo, D., Bartet, P., Yang, R. Y., Bruyneel, M., Roisman, G., & Escourrou, P.',
          year: 2021,
          title: 'Validation of the Withings Sleep Analyzer, an under-the-mattress device for the detection of moderate-severe sleep apnea syndrome',
          journal: 'Journal of Clinical Sleep Medicine (JCSM)',
          doiOrPmid: '10.5664/jcsm.9168',
          sampleSize: 'n = 118 patients in a two-center sleep clinic trial',
          protocolContext: 'Simultaneous recording with Withings Sleep Analyzer under the mattress and Type 1 in-lab PSG',
          reportedResult: 'Moderate-to-severe OSA (AHI >= 15) sensitivity 88.0%, specificity 88.6% (AUROC = 0.926); TST mean bias +27.0 ± 51.0 min; nocturnal HR bias -0.6 ± 2.8 bpm.',
        },
      ],
      measurementSdSource:
        'Derived from Edouard et al. (2021) under-mattress sleep staging and TST variance against in-lab PSG (stage SD ≈ 0.48).',
      reviewStatus: 'draft',
    },
  },
];

