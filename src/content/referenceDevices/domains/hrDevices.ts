import type { ReferenceDevice } from '../types.ts';

export const HR_DEVICES: ReferenceDevice[] = [
  {
    id: 'ge-seer-1000',
    name: 'GE Healthcare SEER 1000 Holter',
    vendor: 'GE HealthCare',
    model: 'SEER 1000 (3-Channel / 12-Lead)',
    domainId: 'hr',
    tier: 'gold',
    tagline: 'Diagnostic clinical Holter recorder with sub-millisecond QRS timing and beat labeling',
    summary:
      'The multi-lead diagnostic Holter benchmark used in pharmaceutical trials and hospital cardiology. Delivers diagnostic ECG channels with certified clinical QRS detection and full arrhythmia review suites.',
    regulatory: {
      clearancePathway: '510(k)',
      clearanceNumber: 'K131846',
      productCode: 'MWI',
      regulationNumber: '21 CFR 870.2800',
      predicateChain: 'GE SEER Light (K033100) and Marquette MARS Holter Review System',
      consensusStandards: ['ANSI/AAMI EC38:2007', 'IEC 60601-2-47:2012', 'ANSI/AAMI EC13'],
      reportedClearanceResults: [
        { metric: 'QRS Detection Sensitivity', value: '> 99.8%', context: 'MIT-BIH & AHA ECG arrhythmia databases' },
        { metric: 'R-Peak Timing Accuracy', value: '< 1.0 ms', context: 'Digital sampling at 1024 Hz with 12-bit ADC' },
        { metric: 'Heart Rate Mean Error', value: '< 0.5 bpm', context: 'Clinical rhythm benchmarking vs 12-lead baseline' },
      ],
    },
    dataPipeline: {
      fileFormats: ['MIT-BIH format', 'Proprietary GE CardioDay format', 'Batch XML RR-intervals'],
      exportMethod: 'USB Docking Cradle + CardioDay Enterprise Workstation',
      easeScore: 2,
      easeSummary:
        'Batch export of raw RR-intervals requires CardioDay research export license; proprietary desktop review software required.',
      licensingPaywall: 'High ($6,000–$12,000 enterprise software seat license)',
      rawSignalAccess: true,
    },
    synchronization: {
      nativeSamplingRate: '1024 Hz (raw ECG)',
      auxiliaryStreams: ['Pacemaker pulse detection', 'Subject event button marker', 'Lead-off impedance'],
      syncHardware: ['Manual event push-button'],
      clockDriftPpm: 15,
      alignmentNotes:
        'Holter relies on internal crystal clock. For exercise alignment with wearable PPG, cross-correlate high-frequency Holter heart rate envelope with wearable optical pulse rate, or use a synchronized event button press.',
    },
    economics: {
      capexRange: '$3,500 – $6,500 per recorder',
      opexOrSubscription: '$1,500/year software maintenance',
      consumablesRequired: [
        'Snap ECG electrodes (5 or 7 lead)',
        'NuPrep skin abrasive gel',
        'Alcohol wipes',
        'AAA lithium batteries',
      ],
      perSubjectConsumableCost: 4.5,
      calibration: {
        intervalMonths: 24,
        type: 'Factory certified biomedical calibration check',
        rmaTurnaroundWeeks: 4,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Chicago, IL, USA / Freiburg, Germany',
        supportTimezone: 'CST (UTC-6) / CET (UTC+1)',
        clinicalSupportTier: 'Enterprise biomedical field support; slow engineering turnaround',
      },
    },
    strengths: [
      'Gold-standard QRS fiducial timing (< 1 ms jitter) suitable for true HRV frequency-domain validation',
      'Diagnostic-grade lead redundancy: motion on Lead I can be recovered by Lead II or V5',
      'Full clinical software suite allows certified cardiologists to manually overread ambiguous beats',
    ],
    limitations: [
      'Bulky 5-to-7 lead wire harness introduces significant movement artifact during vigorous running',
      'Proprietary CardioDay software creates data pipeline friction for automated Python/R pipelines',
      'High per-unit capital cost restricts study fleet sizes',
    ],
    fieldGotchas: [
      'Skin prep failure is the #1 cause of lost data: failure to abrade dead stratum corneum with NuPrep leads to baseline wander that invalidates HRV RMSSD calculations.',
      'Participants frequently snag electrode lead wires during sleep or jacket removal, producing false tachycardia flags.',
    ],
    measurementSd: 0.2,
    repeatabilityLimit: 0.55,
    studyInstrument: {
      formFactor: 'holter_harness',
      typicalBatteryLife: '24–48 hours per AAA battery',
      dataGranularity: 'raw_waveform',
      granularityDetails:
        'Full 1024 Hz multi-lead ECG waveforms and beat-annotated N-N / R-R interval series (distinguishing normal sinus beats from PVCs/PACs).',
      offloadMechanism: 'direct_local_usb_sd',
      firmwareLockSupported: true,
      algorithmStabilityNotes:
        'Medical device firmware and Marquette 12SL / CardioDay QRS detection algorithms are version-locked under FDA 21 CFR 820 design controls.',
      contractAndCostWalls: [
        'Requires GE CardioDay or MARS enterprise workstation software license ($6,000–$12,000) to unlock batch XML/MIT-BIH research exports.',
        'Hospital biomedical procurement channels typically required.',
      ],
      supportedCapabilities: {
        continuous24hIbi: true,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: false,
        consumerSleepSummary: false,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'Primary FDA 510(k) or De Novo pivotal reference comparator for heart rate, beat-to-beat IBI, and arrhythmia algorithms',
        '24-to-48 hour clinical trial endpoints requiring cardiologist adjudication of ectopic beats before HRV frequency-domain analysis',
        'Cohorts with high arrhythmia burden (atrial fibrillation, frequent PVCs) where single-lead or optical sensors fail',
      ],
      doNotUseFor: [
        'Multi-week or multi-month habitual free-living wear (lead wires and wet gel electrodes cause skin breakdown and participant refusal beyond 48–72 hours)',
        'Sleep staging architecture (records cardiac biopotentials only; no EEG or actigraphy sleep staging)',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'High cognitive/behavioral risk in moderate-to-severe dementia: participants often pull at tethered lead wires during nocturnal confusion.',
        arrhythmiaAndEctopy:
          'Superior: multi-lead morphology distinguishes normal-to-normal (NN) sinus intervals from premature ventricular/atrial contractions, preventing artificial RMSSD inflation.',
        skinToneAndPerfusion:
          'Completely unaffected by skin pigmentation (Fitzpatrick/Monk scales) or peripheral arterial vasoconstriction.',
      },
      validationCitations: [
        {
          authors: 'FDA 510(k) K131846 Summary (GE Medical Systems Information Technologies)',
          year: 2013,
          title: 'SEER 1000 Holter Recorder 510(k) Premarket Notification Summary',
          journal: 'U.S. Food and Drug Administration CDRH Database',
          doiOrPmid: 'K131846',
          sampleSize: 'ANSI/AAMI EC38 & IEC 60601-2-47 standard waveform bench & MIT-BIH/AHA databases',
          protocolContext: '24–48 hour ambulatory 3-channel ECG recording benchmarked against SEER Light predicate',
          reportedResult: 'Meets IEC 60601-2-47 QRS timing accuracy (< 1 ms jitter) and > 99.8% sensitivity on standard arrhythmia databases.',
        },
      ],
      measurementSdSource:
        'Derived from 1024 Hz sampling quantization jitter (< 1 ms R-peak timing error ≈ 0.1–0.2 bpm equivalent instantaneous HR SD at 60–100 bpm per IEC 60601-2-47).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'bittium-faros-180',
    name: 'Bittium Faros 180 / 360',
    vendor: 'Bittium Biosignals Ltd.',
    model: 'Faros 180 (1-Channel) / 360 (3-Channel)',
    domainId: 'hr',
    tier: 'silver',
    tagline: 'Ultra-lightweight clinical ECG patch with raw European Data Format (EDF+) and built-in 3-axis accel',
    summary:
      'The premier research-grade wearable ECG patch in digital health. Mounts directly on standard snap electrodes or adhesive chest patches, recording uncompressed ECG at up to 1000 Hz alongside synchronized 3-axis acceleration.',
    regulatory: {
      clearancePathway: '510(k)',
      clearanceNumber: 'K161882',
      productCode: 'MWI',
      regulationNumber: '21 CFR 870.2800',
      predicateChain: 'Mortara H3+ Holter Recorder (K022838)',
      consensusStandards: ['IEC 60601-1', 'IEC 60601-2-47:2012', 'ANSI/AAMI EC13'],
      reportedClearanceResults: [
        { metric: 'Equivalence to Predicate', value: 'r > 0.999', context: 'ECG morphology and QRS timing vs Mortara H3+' },
        { metric: 'Bland-Altman HR Bias', value: '0.04 bpm', context: 'Paired resting and ambulatory Holter recordings' },
        { metric: 'Limits of Agreement', value: '± 0.8 bpm', context: 'Ambulatory Holter evaluation across 24 hours' },
      ],
    },
    dataPipeline: {
      fileFormats: ['EDF+ (European Data Format)', 'Raw CSV', 'ASCII'],
      exportMethod: 'Direct Micro-USB Mass Storage (mounts as standard flash drive)',
      easeScore: 5,
      easeSummary:
        'Flawless data pipeline: appears as standard USB storage drive; EDF+ files load directly in Python via mne or pyedflib without proprietary gates.',
      licensingPaywall: 'Zero / Completely Free open formats',
      rawSignalAccess: true,
    },
    synchronization: {
      nativeSamplingRate: '1000 Hz, 500 Hz, or 250 Hz (user-selectable)',
      auxiliaryStreams: ['3-axis accelerometer (100 Hz)', 'Skin temperature', 'Battery voltage'],
      syncHardware: ['Double-tap tap-marker detection', 'NTP host time synchronization on mount'],
      clockDriftPpm: 20,
      alignmentNotes:
        'The onboard 100 Hz 3-axis accelerometer is sampled on the exact same crystal clock as the ECG. Cross-correlate the Faros chest acceleration with the wearable IMU acceleration to solve time offsets down to 10 ms.',
    },
    economics: {
      capexRange: '$2,400 – $3,200 per device',
      opexOrSubscription: 'None (no cloud or software subscription)',
      consumablesRequired: [
        'Single-use snap electrodes (Ambu BlueSensor or 3M Red Dot)',
        'Bittium OmegaSnap adhesive patch (optional)',
      ],
      perSubjectConsumableCost: 1.8,
      calibration: {
        intervalMonths: 36,
        type: 'Factory electrical verification',
        rmaTurnaroundWeeks: 3,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Oulu, Finland',
        supportTimezone: 'EET (UTC+2)',
        clinicalSupportTier: 'Direct responsive engineering support from biomedical developers in Finland',
      },
    },
    strengths: [
      'Open EDF+ export enables automated, zero-touch CI/CD data pipelines in Python, R, and MATLAB',
      'Integrated 100 Hz accelerometer eliminates the need for a separate IMU to perform motion cross-correlation',
      'Waterproof (IP67) and extremely well-tolerated by participants during 24-to-72-hour continuous wear',
    ],
    limitations: [
      'Faros 180 is single-channel; if placed along a suboptimal vector on participants with pectus excavatum, R-peak amplitude may be low',
      'Rechargeable internal battery requires careful charging protocol management between study visits',
    ],
    fieldGotchas: [
      'Chest hair must be shaved; applying snap patches over chest hair leads to high motion artifact when arm swing shifts pectoral muscles.',
      'Be sure to set the Faros internal clock via Faros Manager immediately before disembarking to the clinical floor to minimize drift.',
    ],
    measurementSd: 0.35,
    repeatabilityLimit: 0.97,
    studyInstrument: {
      formFactor: 'adhesive_patch',
      typicalBatteryLife: 'Up to 7–8 days (at 250 Hz ECG / 25 Hz Accel) or 3–4 days (at 1000 Hz ECG / 100 Hz Accel)',
      dataGranularity: 'raw_waveform',
      granularityDetails:
        'Uncompressed raw ECG waveform (250, 500, or 1000 Hz) and synchronized 3-axis accelerometer (25–100 Hz) stored directly in open EDF+ on internal flash memory.',
      offloadMechanism: 'direct_local_usb_sd',
      firmwareLockSupported: true,
      algorithmStabilityNotes:
        'Zero cloud or firmware drift risk: device operates completely offline with frozen firmware and exports raw microvolt waveforms so researchers control R-peak detection (e.g., NeuroKit2, Kubios, or custom Pan-Tompkins) in their own codebase.',
      contractAndCostWalls: [
        'Zero recurring software fees, zero per-subject cloud fees, and no enterprise seat minimums for raw EDF+ access.',
        'Optional Bittium Cardiac Navigator / HRV analysis software carries a seat license, but is unnecessary if using Python (MNE / NeuroKit2) or Kubios.',
      ],
      supportedCapabilities: {
        continuous24hIbi: true,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: false,
        consumerSleepSummary: false,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'True 24-to-72 hour continuous ambulatory HRV endpoints (time-domain RMSSD/SDNN and frequency-domain LF/HF) in clinical trials',
        'Episodic baseline and milestone autonomic deep-dives paired with a longitudinal sleep monitor (e.g., Oura Ring or ActiGraph)',
        'Ambulatory reference standard for validating wrist PPG heart rate and inter-beat interval algorithms',
      ],
      doNotUseFor: [
        'Continuous multi-month daily wear without rest periods (medical adhesive patches require replacement every 3–7 days and can irritate fragile elderly skin)',
        'Standalone sleep architecture staging (requires pairing with EEG or validated actigraphy for sleep stage endpoints)',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Very low participant tech burden (18g patch; no smartphone app or daily charging required during a 3-to-7 day wear window), though fragile senile skin requires hypoallergenic hydrocolloid patch selection.',
        arrhythmiaAndEctopy:
          'Raw 1000 Hz ECG waveform enables visual and automated morphological filtering of PVCs, PACs, and atrial fibrillation episodes prior to HRV calculation.',
        skinToneAndPerfusion:
          'Electrical biopotential recording is completely invariant to skin pigmentation, peripheral vasoconstriction, and Raynaud phenomenon.',
      },
      validationCitations: [
        {
          authors: 'FDA 510(k) K161882 Summary (Mega Electronics / Bittium Biosignals)',
          year: 2016,
          title: 'Faros 180 / 360 Ambulatory ECG Monitor 510(k) Premarket Notification',
          journal: 'U.S. Food and Drug Administration CDRH Database',
          doiOrPmid: 'K161882',
          sampleSize: 'IEC 60601-2-47 clinical & bench equivalence vs. Mortara H3+ predicate',
          protocolContext: '24-hour ambulatory Holter ECG comparison',
          reportedResult: 'Diagnostic waveform equivalence r > 0.999; 24h ambulatory HR limits of agreement ± 0.8 bpm (SD ≈ 0.35–0.40 bpm).',
        },
      ],
      measurementSdSource:
        'Derived from FDA 510(k) K161882 ambulatory equivalence testing against Mortara H3+ (24h HR LoA ± 0.8 bpm => SD ≈ 0.35 bpm).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'vitalconnect-vitalpatch',
    name: 'VitalConnect VitalPatch RTM',
    vendor: 'VitalConnect, Inc.',
    model: 'VitalPatch Biosensor (7-Day Disposable)',
    domainId: 'hr',
    tier: 'silver',
    tagline: 'FDA-cleared 7-day disposable clinical adhesive patch for continuous remote cardiac and autonomic telemetry',
    summary:
      'A single-use, peel-and-stick clinical biosensor patch worn on the upper left chest for 7 days (168 hours). Streams continuous single-lead ECG, beat-to-beat R-R intervals, respiratory rate, skin temperature, and posture/fall events to a provisioned relay phone or cloud portal.',
    regulatory: {
      clearancePathway: '510(k)',
      clearanceNumber: 'K180603',
      productCode: 'DRT',
      regulationNumber: '21 CFR 870.2300',
      predicateChain: 'VitalConnect HealthPatch MD (K142765) & VitalPatch (K152139)',
      consensusStandards: ['IEC 60601-1', 'IEC 60601-2-47', 'ANSI/AAMI EC13'],
      reportedClearanceResults: [
        { metric: 'Heart Rate Accuracy', value: 'MAE < 1.5 bpm', context: 'Continuous ambulatory ECG monitoring across 30–200 bpm' },
        { metric: 'Respiratory Rate Accuracy', value: '± 1.8 brpm', context: 'ECG-derived respiration + chest accelerometer vs capnography' },
        { metric: 'Wear Duration', value: '168 hours (7 days)', context: 'Continuous single-patch clinical validation' },
      ],
    },
    dataPipeline: {
      fileFormats: ['JSON / CSV via VitalCloud Research API', 'EDF / HL7 clinical streams'],
      exportMethod: 'BLE to VistaPhone relay -> Cellular upload to VitalCloud Portal / SFTP',
      easeScore: 3,
      easeSummary:
        'Turnkey cellular-to-cloud pipeline ideal for decentralized clinical trials (DCTs), but requires enterprise VitalConnect clinical trial contract.',
      licensingPaywall: 'Enterprise clinical trial contract required (per-patch hardware + cloud telemetry fee)',
      rawSignalAccess: true,
    },
    synchronization: {
      nativeSamplingRate: '125 Hz (raw single-lead ECG) and 4 Hz (vital sign summaries)',
      auxiliaryStreams: ['3-axis chest accelerometer', 'ECG-derived respiratory rate', 'Skin temperature', 'Body posture & step count'],
      syncHardware: ['NTP cellular synchronization via paired VistaPhone relay'],
      clockDriftPpm: 20,
      alignmentNotes:
        'Packets are timestamped upon receipt by the NTP-locked relay phone. Account for 20–60 ms BLE transmission latency if aligning beat-by-beat with an external optical wearable.',
    },
    economics: {
      capexRange: '$0 upfront (disposable patch model) or $250/kit with reusable VistaTablet/Phone relay',
      opexOrSubscription: 'Included in per-patch clinical trial bundle ($120 – $180 per 7-day patch)',
      consumablesRequired: ['VitalPatch single-use 7-day biosensor ($135/patch)', 'Skin prep alcohol/abrasive wipe'],
      perSubjectConsumableCost: 135.0,
      shelfLifeAlert: 'Internal zinc-air / lithium battery has a strict 12-month printed expiration date; must be tracked by lot number.',
      calibration: {
        intervalMonths: 0,
        type: 'Factory calibrated single-use disposable medical device',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'San Jose, CA, USA',
        supportTimezone: 'PST (UTC-8)',
        clinicalSupportTier: 'Dedicated VitalConnect Clinical Trials & Pharma Services division',
      },
    },
    strengths: [
      'Fully disposable peel-and-stick design eliminates device charging, USB docking, and sterilization logistics',
      'Captures true continuous 24-hour chest ECG across a full 7-day window without participant intervention',
      'FDA 510(k)-cleared clinical telemetry accepted in pharmaceutical trials and decentralized hospital-at-home protocols',
    ],
    limitations: [
      'Lower ECG sampling rate (125 Hz) than Bittium Faros (1000 Hz), introducing ~4–8 ms R-peak quantization jitter that slightly attenuates high-frequency (HF) HRV precision',
      'Cannot be purchased off-the-shelf in small quantities without a clinical trial services agreement',
      'High per-subject consumable cost ($135+ per 7-day window) scales linearly with study duration',
    ],
    fieldGotchas: [
      'Relay proximity: if the participant leaves the relay phone in the bedroom while walking to the kitchen or garden, live streaming buffers locally and can overflow if disconnected for > 10 hours.',
      'Hydrocolloid edge roll: showering without patting the patch dry causes the edges to lift after day 5.',
    ],
    measurementSd: 0.65,
    repeatabilityLimit: 1.8,
    studyInstrument: {
      formFactor: 'adhesive_patch',
      typicalBatteryLife: '7 days (168 hours) continuous single-use battery (no charging)',
      dataGranularity: 'raw_waveform',
      granularityDetails:
        '125 Hz single-lead ECG waveform, beat-to-beat R-R intervals, and 0.25 Hz (4-second) heart rate, respiratory rate, and posture series.',
      offloadMechanism: 'cloud_rest_api',
      firmwareLockSupported: true,
      algorithmStabilityNotes:
        'FDA Class II medical device firmware and cloud processing versions are locked per clinical trial protocol under 21 CFR Part 11 / GCP controls.',
      contractAndCostWalls: [
        'Requires an executed clinical trial services contract with VitalConnect (not available for individual consumer purchase).',
        'Per-patch consumable cost ($120–$180 per 7-day wear period) makes multi-month continuous wear expensive.',
      ],
      supportedCapabilities: {
        continuous24hIbi: true,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: false,
        consumerSleepSummary: false,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'Decentralized Clinical Trials (DCTs) requiring zero-charging, 7-day continuous 24-hour ECG and HR/HRV remote monitoring',
        'Older adult and neurodegenerative cohorts who cannot manage USB cables or daily smartwatch charging',
        'Episodic 7-day baseline vs. post-intervention autonomic and cardiopulmonary endpoints',
      ],
      doNotUseFor: [
        'Ultra-high-frequency HRV research requiring >= 500 Hz ECG sampling resolution (use Bittium Faros 180 instead)',
        'Sleep stage architecture classification (measures posture and rest/activity, not 4-stage sleep architecture)',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Ideal operational workflow for cognitively impaired participants: applied once in clinic or by a home nurse/care partner, zero charging for 7 days, and disposed of after removal.',
        arrhythmiaAndEctopy:
          'Single-lead 125 Hz ECG supports rhythm adjudication (often paired with cardiologist overread services for AFib and ectopy).',
        skinToneAndPerfusion:
          'Biopotential ECG is unaffected by skin tone or low peripheral perfusion.',
      },
      validationCitations: [
        {
          authors: 'FDA 510(k) K180603 Summary (VitalConnect, Inc.) & Breteler et al.',
          year: 2020,
          title: 'VitalPatch Biosensor 510(k) Summary & Clinical Validation of Wireless Patch Sensors in High-Risk Patients',
          journal: 'U.S. FDA CDRH Database / Anesthesiology',
          doiOrPmid: '10.1097/ALN.0000000000003029',
          sampleSize: 'n = 31 high-risk surgical patients (clinical ward comparison vs bedside ICU monitor)',
          protocolContext: 'Continuous multi-day wearable patch monitoring vs reference ECG monitor',
          reportedResult: 'Heart rate bias 0.0 bpm with 95% limits of agreement ± 2.8 bpm; > 95% data pairs within ± 5 bpm.',
        },
      ],
      measurementSdSource:
        'Estimated from 125 Hz ECG R-peak quantization and clinical validation LoA against wired bedside ECG (Breteler et al. 2020, SD ≈ 0.65 bpm).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'polar-h10',
    name: 'Polar H10 Heart Rate Strap',
    vendor: 'Polar Electro Oy',
    model: 'Polar H10',
    domainId: 'hr',
    tier: 'silver',
    tagline: 'The universal exercise physiology benchmark strap with open Bluetooth SDK and raw ECG stream',
    summary:
      'The ubiquitous research silver benchmark for exercise heart rate and athletic HRV. Widely validated across hundreds of sports science trials against 12-lead ECG, providing real-time BLE broadcasting and internal memory.',
    regulatory: {
      clearancePathway: 'Consumer / OTC',
      clearanceNumber: 'CE-MDR Class IIa in Europe; OTC wellness in USA',
      productCode: 'DRT',
      predicateChain: 'Polar WearLink and Polar H7 Heart Rate Transmitters',
      consensusStandards: ['Bluetooth SIG Heart Rate Profile', 'IEC 60601-1-11'],
      reportedClearanceResults: [
        { metric: 'Pearson Correlation vs Holter', value: 'r = 0.994', context: 'Treadmill graded exercise test (Gilgen-Ammann 2019)' },
        { metric: 'Mean Absolute Error (MAE)', value: '0.81 bpm', context: 'High-intensity interval training vs 3-lead Holter' },
        { metric: 'HRV RMSSD Bias', value: '-0.38 ms', context: 'Supine resting HRV comparison vs diagnostic ECG' },
      ],
    },
    dataPipeline: {
      fileFormats: ['Standard BLE GATT Heart Rate Measurement', 'Polar SDK raw stream', 'CSV via Polar Sensor Logger'],
      exportMethod: 'Bluetooth Low Energy (BLE) or Internal Session Download via Polar Beat',
      easeScore: 4,
      easeSummary:
        'Very easy to capture via standard open-source Bluetooth libraries (bleak, Web Bluetooth) or community apps; raw ECG available at 130 Hz.',
      licensingPaywall: 'Zero / Free open SDK',
      rawSignalAccess: true,
    },
    synchronization: {
      nativeSamplingRate: '1 Hz (standard HR) or 130 Hz (raw ECG stream via SDK)',
      auxiliaryStreams: ['3-axis accelerometer (200 Hz via SDK)', 'Raw ECG voltage (130 Hz)'],
      syncHardware: ['BLE timestamp synchronization'],
      clockDriftPpm: 30,
      alignmentNotes:
        'BLE packet transmission jitter introduces 20–100 ms of latency. When using Polar H10 for HRV or pulse transit time (PTT), log raw ECG samples with host monotonic timestamps rather than pre-calculated 1 Hz HR values.',
    },
    economics: {
      capexRange: '$90 – $110 per strap',
      opexOrSubscription: 'None',
      consumablesRequired: [
        'Replacement chest Pro Straps ($35 every 6 months)',
        'CR2025 coin cell batteries ($0.50)',
        'Conductive electrode gel ($5/tube)',
      ],
      perSubjectConsumableCost: 0.75,
      calibration: {
        intervalMonths: 0,
        type: 'Factory fixed digital calibration; no user calibration required',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Kempele, Finland / Bethpage, NY, USA',
        supportTimezone: 'EET (UTC+2) / EST (UTC-5)',
        clinicalSupportTier: 'Commercial sports support; developer forum for SDK',
      },
    },
    strengths: [
      'Incredible cost efficiency ($90/unit) allows study teams to deploy dozens of devices in parallel',
      'Dual simultaneous Bluetooth connections + ANT+ allows connecting to a data logger and a fitness machine concurrently',
      'Gold-standard status in academic sports science literature makes peer reviewers immediately comfortable',
    ],
    limitations: [
      'Not cleared under FDA 510(k) as a diagnostic medical device in the USA',
      'Fabric Pro Strap electrode pads degrade after 50–100 wash cycles, showing intermittent signal dropouts',
      'Requires participant chest strap placement, which female participants may find uncomfortable with sports bras',
    ],
    fieldGotchas: [
      'Dry electrode trap: at the start of a study before the participant begins to sweat, conductivity is poor and the H10 will report half-rate or zero. ALWAYS moisten the electrodes with Spectra 360 gel or water before strapping in.',
      'Strap slipping during outdoor running or cycling downhills causes intermittent motion spikes.',
    ],
    measurementSd: 0.85,
    repeatabilityLimit: 2.35,
    studyInstrument: {
      formFactor: 'chest_strap',
      typicalBatteryLife: '~400 hours of active operation per replaceable CR2025 coin cell',
      dataGranularity: 'beat_to_beat_ibi',
      granularityDetails:
        'Standard Bluetooth SIG Heart Rate Service (`0x180D`) broadcasts 1/1024-second (~0.98 ms) R-R intervals; Polar BLE Measurement Data (PMD) SDK streams raw 130 Hz ECG microvolts and 200 Hz 3-axis acceleration.',
      offloadMechanism: 'open_ble_sdk',
      firmwareLockSupported: true,
      algorithmStabilityNotes:
        'Firmware updates are strictly opt-in via the Polar Beat / Flow app; straps used with open-source BLE loggers (`bleak`, Polar Sensor Logger, Kubios HRV) never connect to Polar servers and remain permanently version-locked.',
      contractAndCostWalls: [
        'Zero licensing fees, zero cloud subscriptions, and completely open GitHub SDK (`polar-ble-sdk`).',
        'Internal on-pod memory only stores a single session of 1 Hz HR + RR intervals (no raw ECG stored offline); streaming raw 130 Hz ECG or multi-hour RR requires an active BLE logger nearby.',
      ],
      supportedCapabilities: {
        continuous24hIbi: true,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: false,
        consumerSleepSummary: false,
        multiWeekHabitualCompliance: false,
      },
      useFor: [
        'Single-session exercise physiology, orthostatic challenge, or single-night acute HRV snapshots where budget is constrained ($90/unit)',
        'Open-source BLE data collection pipelines requiring real-time millisecond R-R intervals without vendor cloud lock-in',
        'Field reference comparator for validating optical wrist HR during running, cycling, and HIIT',
      ],
      doNotUseFor: [
        'Multi-night or longitudinal habitual sleep studies (elastic chest strap constricts breathing, dries out overnight, chafes skin, and yields poor multi-week adherence)',
        'Studies requiring sleep staging metrics (Polar H10 strap produces zero sleep stage, TST, or WASO outputs on its own)',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Viable for a supervised in-clinic test or a single overnight assessment, but unsuitable for unsupervised multi-week home wear in older adults due to electrode moistening and strap clasping dexterity demands.',
        arrhythmiaAndEctopy:
          'Standard BLE RR stream reports raw peak-to-peak intervals; if arrhythmias are expected, stream the 130 Hz raw ECG channel via Polar SDK so ectopic beats can be visually verified.',
        skinToneAndPerfusion:
          'Biopotential dry textile electrodes are invariant to skin tone, but dry winter skin in older adults requires conductive electrode gel (e.g., Parker Spectra 360) to prevent initial signal dropout.',
      },
      validationCitations: [
        {
          authors: 'Gilgen-Ammann, R., Schweizer, T., & Wyss, T.',
          year: 2019,
          title: 'RR interval signal quality of a heart rate monitor and an ECG Holter at rest and during exercise',
          journal: 'European Journal of Applied Physiology',
          doiOrPmid: '10.1007/s00421-019-04142-5',
          sampleSize: 'n = 10 healthy adults across rest, walking, running, and weight training',
          protocolContext: 'Simultaneous RR interval comparison against 3-lead Schiller Medilog AR12 Plus Holter ECG',
          reportedResult: 'Mean RR interval bias 0.1 ± 12.1 ms; 99.6% signal quality across all activities (vs 93.2% for wired Holter during vigorous running).',
        },
        {
          authors: 'Schaffarczyk, M., Rogers, B., Reer, R., & Gronwald, T.',
          year: 2022,
          title: 'Validity of the Polar H10 sensor for heart rate variability analysis during resting state and incremental exercise',
          journal: 'Sensors',
          doiOrPmid: '10.3390/s22176536',
          sampleSize: 'n = 25 participants',
          protocolContext: 'Comparison of Polar H10 vs 12-lead ECG for linear and non-linear HRV metrics',
          reportedResult: 'Near-perfect concordance for HR, RR, SDNN, RMSSD, and DFA alpha-1 (r > 0.99; RMSSD bias -0.38 ms at rest).',
        },
      ],
      measurementSdSource:
        'Derived from Gilgen-Ammann et al. (2019) and Schaffarczyk et al. (2022) ambulatory/exercise HR & RR validation against Holter ECG (SD ≈ 0.85 bpm).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'empatica-embraceplus',
    name: 'Empatica EmbracePlus',
    vendor: 'Empatica Inc.',
    model: 'EmbracePlus Clinical Research Wearable',
    domainId: 'hr',
    tier: 'silver',
    tagline: 'FDA 510(k)-cleared clinical trial wristwatch streaming raw multi-wavelength PPG, EDA, skin temperature, and IMU',
    summary:
      'Designed specifically for clinical trials and decentralized digital biomarker studies. Succeeding the Empatica E4, the EmbracePlus provides FDA-cleared pulse rate, respiratory rate, SpO2, and electrodermal activity alongside raw sensor waveform exports in Apache Avro and CSV formats.',
    regulatory: {
      clearancePathway: '510(k)',
      clearanceNumber: 'K201108',
      productCode: 'DRT',
      regulationNumber: '21 CFR 870.2300',
      predicateChain: 'Empatica Embrace (K172935) and Masimo Rad-97 (K170564)',
      consensusStandards: ['IEC 60601-1', 'IEC 60601-1-11', 'ISO 80601-2-61'],
      reportedClearanceResults: [
        { metric: 'Pulse Rate RMSE (No Motion)', value: '1.8 bpm (Arms < 3 bpm)', context: '510(k) clinical comparison vs ECG reference at rest' },
        { metric: 'HRV RMSSD Correlation (Nocturnal)', value: 'r = 0.97', context: 'Low-motion sleep windows vs reference Holter ECG' },
        { metric: 'Data Completeness (Rest/Sleep)', value: '> 92%', context: 'Nocturnal low-motion biomarker windows' },
      ],
    },
    dataPipeline: {
      fileFormats: ['Apache Avro (raw sensor waveforms)', 'Tidy CSV (1-min digital biomarkers)', 'JSON'],
      exportMethod: 'BLE to Empatica Care App -> AWS S3 bucket / Empatica Care Research Portal',
      easeScore: 4,
      easeSummary:
        'Automated direct-to-AWS S3 bucket delivery of both raw 64 Hz PPG/IMU waveforms (Avro) and validated 1-minute digital biomarkers (CSV).',
      licensingPaywall: 'Enterprise Empatica Health Monitoring Platform subscription required ($5,000+ annual platform fee + per-device monthly fee)',
      rawSignalAccess: true,
    },
    synchronization: {
      nativeSamplingRate: '64 Hz (4-channel PPG & 3-axis IMU), 4 Hz (EDA), 1 Hz (Temperature)',
      auxiliaryStreams: ['Ventral electrodermal activity (EDA)', 'Peripheral skin temperature', '3-axis accelerometer & gyroscope', 'Pulse rate variability (PRV)'],
      syncHardware: ['NTP smartphone clock sync + unix microsecond timestamps in Avro schema'],
      clockDriftPpm: 15,
      alignmentNotes:
        'Every raw sample in the exported `.avro` file carries a UTC microsecond timestamp synchronized via the Care mobile app.',
    },
    economics: {
      capexRange: '$850 – $1,200 per watch',
      opexOrSubscription: '$35 – $65/month per active device + annual Empatica Care platform license',
      consumablesRequired: ['Medical-grade silicone or textile watchbands ($25)'],
      perSubjectConsumableCost: 0,
      calibration: {
        intervalMonths: 0,
        type: 'Factory calibrated optical, thermal, and constant-current EDA sensors',
        rmaTurnaroundWeeks: 2,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Boston, MA, USA / Milan, Italy',
        supportTimezone: 'EST (UTC-5) / CET (UTC+1)',
        clinicalSupportTier: 'Dedicated clinical trial engineering & regulatory compliance team (21 CFR Part 11 / HIPAA)',
      },
    },
    strengths: [
      'Unlocks raw 64 Hz multi-wavelength PPG, 64 Hz accelerometer, and 4 Hz EDA waveforms—impossible on consumer Apple/Oura/WHOOP devices',
      'Built for regulated clinical trials: locked algorithm versions, 21 CFR Part 11 audit trails, and direct AWS S3 data delivery',
      'Simultaneously captures autonomic sympathetic arousal (ventral wrist EDA) and parasympathetic tone (nocturnal PRV) plus actigraphy sleep endpoints',
    ],
    limitations: [
      'Still a wrist optical PPG sensor: daytime arm movement corrupts beat-to-beat inter-beat intervals (IBI), restricting reliable HRV to rest and sleep windows',
      'High total cost of ownership (hardware CapEx + mandatory annual platform license + monthly per-seat fees)',
      'Battery life (~48–72 hours) requires charging every 2 days via magnetic dock',
    ],
    fieldGotchas: [
      'Motion-rejected IBI gaps: researchers expecting continuous daytime beat-to-beat HRV from a wrist optical sensor often discover 40–60% of waking hours are rightfully flagged as motion artifact.',
      'Smartphone background kill: on Android participant phones, aggressive OS battery optimization can suspend the Empatica Care companion app unless explicitly whitelisted.',
    ],
    measurementSd: 1.6,
    repeatabilityLimit: 4.43,
    studyInstrument: {
      formFactor: 'smartwatch_wrist',
      typicalBatteryLife: '2–3 days continuous streaming (charges in ~90 min)',
      dataGranularity: 'raw_waveform',
      granularityDetails:
        'Exposes both raw 64 Hz PPG + 64 Hz 3D accelerometer + 4 Hz EDA waveforms (`.avro` files) AND validated 1-minute digital biomarker summaries (CSV: PR, PRV RMSSD, respiratory rate, sleep/wake actigraphy, step count).',
      offloadMechanism: 'cloud_rest_api',
      firmwareLockSupported: true,
      algorithmStabilityNotes:
        'Specifically architected for pharma and academic clinical trials: firmware and cloud biomarker algorithm versions are pinned and documented per study protocol.',
      contractAndCostWalls: [
        'Requires an executed Empatica Research / Enterprise Platform agreement (cannot be operated standalone without an active Empatica Care cloud subscription).',
        'Total budget must account for ~$1,000/device CapEx plus annual platform and monthly active device fees.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: false,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: true,
      },
      useFor: [
        'Regulated longitudinal clinical trials needing raw wrist PPG/IMU/EDA waveforms, locked algorithms, and 21 CFR Part 11 compliance',
        'Nocturnal pulse rate variability (PRV), sympathetic EDA arousal, and validated wrist actigraphy sleep endpoints (TST, WASO, sleep efficiency) in a single wrist device',
        'Neurology and psychiatry trials (epilepsy, Parkinson disease, stress/autonomic reactivity)',
      ],
      doNotUseFor: [
        'Continuous 24-hour waking beat-to-beat HRV during active daytime movement (wrist PPG cannot overcome daytime motion artifact; use an ECG patch like Bittium Faros 180)',
        '4-stage cortical sleep architecture (provides validated rest/activity sleep detection and autonomic metrics, not EEG 4-stage polysomnography)',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Minimal screen distractions (e-ink style time display) prevent participant tampering; however, 2-to-3 day charging cadence and companion smartphone proximity must be managed by the participant or care partner.',
        arrhythmiaAndEctopy:
          'Raw 64 Hz PPG waveform is accessible for custom pulse morphology inspection, though ECG remains superior for definitive PVC/PAC differentiation.',
        skinToneAndPerfusion:
          'Multi-wavelength optical array is cleared under ISO 80601-2-61 / IEC 60601, but wrist vasoconstriction in cold environments still attenuates optical AC amplitude.',
      },
      validationCitations: [
        {
          authors: 'FDA 510(k) K201108 Summary (Empatica S.r.l.) & Schuurmans et al.',
          year: 2020,
          title: 'EmbracePlus Physiological Monitor 510(k) Summary & Validation of Empatica Wristband PPG/PRV vs ECG',
          journal: 'U.S. FDA CDRH Database / Frontiers in Psychiatry',
          doiOrPmid: 'K201108',
          sampleSize: 'Clinical validation against reference ECG under no-motion and resting conditions',
          protocolContext: 'Paired wrist optical PR and PRV vs reference ECG',
          reportedResult: 'Pulse rate Arms < 3.0 bpm at rest; high nocturnal PRV concordance during stationary epochs, with expected high artifact rejection during free-living arm movement.',
        },
      ],
      measurementSdSource:
        'Derived from FDA 510(k) K201108 no-motion pulse rate accuracy specification (Arms ≈ 1.6–1.8 bpm vs reference ECG).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'apple-watch-ultra-2-hr',
    name: 'Apple Watch Ultra 2 (Wrist HR)',
    vendor: 'Apple Inc.',
    model: 'Apple Watch Series 10 / Ultra 2 (WatchOS 10+)',
    domainId: 'hr',
    tier: 'bronze',
    tagline: 'Consumer high-end multi-wavelength photoplethysmography (PPG) wrist benchmark',
    summary:
      'The consumer benchmark for wrist-based optical pulse rate. Utilizes green/infrared LEDs and photodiodes with sophisticated motion cancellation, widely worn by study participants for head-to-head consumer comparisons.',
    regulatory: {
      clearancePathway: 'Consumer / OTC',
      clearanceNumber: 'N/A for basic optical HR (ECG app is De Novo DEN180044)',
      productCode: 'DQA (ECG app is DXH/QDA)',
      predicateChain: 'N/A (General wellness feature)',
      consensusStandards: ['Consumer Technology Association CTA-2065'],
      reportedClearanceResults: [
        { metric: 'Mean Absolute Percent Error (MAPE)', value: '< 2.5%', context: 'Steady-state cycling and walking vs chest strap' },
        { metric: 'Agreement in Rest', value: 'r = 0.98', context: 'Nocturnal resting pulse rate vs clinical Holter' },
      ],
    },
    dataPipeline: {
      fileFormats: ['HealthKit export (XML / JSON)', 'CoreMotion CSV via research app'],
      exportMethod: 'Apple Health export or custom WatchOS companion app',
      easeScore: 3,
      easeSummary:
        'HealthKit exports are batch summaries; raw optical PPG photodiode voltages are restricted and not exposed to third-party developers.',
      licensingPaywall: 'Requires Apple Developer Program ($99/year) and iOS test bench',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: 'Variable (1 Hz in workout mode; opportunistic 1–5 min in background)',
      auxiliaryStreams: ['3-axis accelerometer', 'Gyroscope', 'Barometer', 'Optical PPG metrics'],
      syncHardware: ['Apple Network Time Protocol (NTP)'],
      clockDriftPpm: 5,
      alignmentNotes:
        'Because raw photoplethysmogram waveforms are locked inside Apple private frameworks, alignment must be performed at the beat-to-beat or 1 Hz heart rate level. Clocks are locked tightly to Apple NTP servers.',
    },
    economics: {
      capexRange: '$399 – $799',
      opexOrSubscription: 'Requires paired iPhone ($500+) + optional third-party research platform ($5–$15/subject/mo)',
      consumablesRequired: ['None (magnetic charging puck)'],
      perSubjectConsumableCost: 0,
      calibration: {
        intervalMonths: 0,
        type: 'Factory optical sensor array calibration',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Cupertino, CA, USA',
        supportTimezone: 'PST (UTC-8)',
        clinicalSupportTier: 'Apple Health research enterprise team / developer relations',
      },
    },
    strengths: [
      'Represents the highest bar in consumer optical wrist PPG accuracy and firmware motion filtering',
      'Ultra-tight network time synchronization via Apple cellular/WiFi NTP infrastructure (< 50 ms)',
      'High subject familiarity and compliance during daytime free-living observation periods',
    ],
    limitations: [
      'Cannot be used as a ground truth reference for FDA submissions because it is itself an optical PPG device',
      'No access to raw optical green/IR photodiode waveforms (only processed pulse rate and opportunistic SDNN values)',
      'Closed ecosystem: requires iPhones for data retrieval, complicating Android-based study setups',
    ],
    fieldGotchas: [
      'Cadence Lock Trap: during running or rowing, wrist motion harmonics can overpower the pulsatile blood volume change, causing the Apple Watch to report stride rate (e.g. 170 bpm) instead of true heart rate (e.g. 145 bpm).',
      'Loosely worn watch bands allow ambient optical light leakage, causing sudden heart rate dropouts.',
    ],
    measurementSd: 2.4,
    repeatabilityLimit: 6.65,
    studyInstrument: {
      formFactor: 'smartwatch_wrist',
      typicalBatteryLife: '18 hours (Series 10) to 36 hours (Ultra 2); requires daily or every-other-day charging',
      dataGranularity: 'epoch_1m_to_5m',
      granularityDetails:
        'Background HR is sampled opportunistically every 3–10 minutes via infrared LEDs; Background HRV (`HKQuantityTypeIdentifierHeartRateVariabilitySDNN`) is calculated only sporadically during stationary windows (~4–10 samples/day). Beat-to-beat `HKHeartbeatSeriesSample` is captured ONLY during short stationary periods or explicit Breathe/Mindfulness sessions—never continuously across 24 hours. Raw PPG waveforms are strictly locked.',
      offloadMechanism: 'mobile_os_sandbox',
      firmwareLockSupported: false,
      algorithmStabilityNotes:
        'Apple does not offer a public cloud API; all data resides in the local encrypted SQLite database on the paired iPhone. Furthermore, WatchOS updates alter optical motion filtering and HRV opportunistic sampling heuristics without changelogs.',
      contractAndCostWalls: [
        'No native Apple cloud research portal exists: study teams must either build and maintain a custom iOS/WatchOS app (SensorKit/HealthKit) OR pay a third-party middleware vendor (e.g., Fitabase, Labfront, MyDataHelps) $5–$15/participant/month.',
        'Apple SensorKit (which exposes higher-rate optical/motion streams) requires direct Apple Research & Care entitlement approval, which is rarely granted outside major institutional partnerships.',
        'Mandatory iPhone ownership excludes Android users (~45–50% of older adults) unless the study provisions iPhones.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: false,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: true,
      },
      useFor: [
        'Large-scale decentralized BYOD (Bring-Your-Own-Device) epidemiological cohorts already on iOS',
        'Benchmarking consumer optical wrist pulse rate accuracy during structured exercise workouts (where 1 Hz green-LED HR is active)',
        'Exploratory longitudinal trends in resting heart rate and sleep duration',
      ],
      doNotUseFor: [
        'Continuous 24-hour HRV endpoints or RMSSD-based clinical trials (Apple Watch natively reports sporadic SDNN by default unless beat-to-beat series are manually parsed from sparse `HKHeartbeatSeriesSample` windows)',
        'Older adult sleep + HRV studies without strict charging reminders (18–36h battery life causes participants to charge the watch overnight on their nightstand, losing nocturnal data)',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'High operational dropout risk in aging/neurodegenerative trials due to the daily charging cycle, small magnetic puck alignment, and WatchOS passcodes/notifications.',
        arrhythmiaAndEctopy:
          'Includes FDA-cleared irregular rhythm notification (`DEN180043`) and spot 30-second single-lead ECG (`DEN180044`), but background optical SDNN can be severely skewed by unflagged premature beats.',
        skinToneAndPerfusion:
          'Dynamically increases green/IR LED drive current on darker skin tones, performing well at rest, though wrist tattoos and severe cold vasoconstriction still cause dropouts.',
      },
      validationCitations: [
        {
          authors: 'Hernando, D., Roca, S., Sancho, J., Alesanco, Á., & Bailón, R.',
          year: 2018,
          title: 'Validation of the Apple Watch for Heart Rate Variability Measurements during Relax and Mental Stress in Healthy Subjects',
          journal: 'Sensors',
          doiOrPmid: '10.3390/s18082619',
          sampleSize: 'n = 20 healthy subjects',
          protocolContext: 'Comparison of Apple Watch beat-to-beat intervals (during Breathe app) against Polar H7 chest strap',
          reportedResult: 'High agreement for time-domain HRV during stationary rest (r > 0.95), but ~10% missing inter-beat intervals and significant degradation of HF power under mild movement.',
        },
        {
          authors: 'Miller, D. J., Sargent, C., & Roach, G. D.',
          year: 2022,
          title: 'A Validation of Six Wearable Devices for Estimating Sleep, Heart Rate and Heart Rate Variability in Healthy Adults',
          journal: 'Sensors',
          doiOrPmid: '10.3390/s22166317',
          sampleSize: 'n = 53 healthy adults across nocturnal sleep vs 12-lead PSG/ECG',
          protocolContext: 'Nocturnal HR and HRV comparison against laboratory ECG',
          reportedResult: 'Nocturnal HR bias -0.1 ± 1.8 bpm; nocturnal HRV showed moderate correlation (r = 0.67) due to intermittent opportunistic sampling windows compared to continuous ECG.',
        },
      ],
      measurementSdSource:
        'Composite empirical SD across rest and light-to-moderate ambulatory movement vs reference ECG (Miller et al. 2022; Gillinov et al. 2017, SD ≈ 2.4 bpm).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'oura-ring-gen3-hrv',
    name: 'Oura Ring Gen 3 / Gen 4 (Nocturnal HR & HRV)',
    vendor: 'Oura Health Oy',
    model: 'Oura Ring Gen 3 / Gen 4',
    domainId: 'hr',
    tier: 'bronze',
    tagline: 'Finger-worn infrared PPG smart ring providing high-compliance nocturnal resting HR and 5-minute RMSSD series',
    summary:
      'Samples palmar digital arteries using infrared (900 nm) and red/green PPG LEDs inside a titanium ring. Because digital arteries lie close to the skin on the palmar side of the finger and remain relatively still during sleep, Oura achieves the highest nocturnal resting HRV agreement among consumer wearables—while deliberately omitting continuous waking 24-hour HRV.',
    regulatory: {
      clearancePathway: 'Consumer / OTC',
      clearanceNumber: 'N/A (General wellness device)',
      productCode: 'DRT',
      predicateChain: 'N/A',
      consensusStandards: ['CTA-2065 (Physical Activity & Heart Rate)'],
      reportedClearanceResults: [
        { metric: 'Nocturnal Resting HR r²', value: 'r² = 0.996 (Bias -0.6 bpm)', context: 'Whole-night average HR vs medical ECG (Kinnunen et al. 2020)' },
        { metric: 'Nocturnal RMSSD r²', value: 'r² = 0.980 (Bias -1.2 ms)', context: 'Whole-night average RMSSD vs medical ECG (Kinnunen et al. 2020)' },
        { metric: '5-Minute Epoch RMSSD r²', value: 'r² = 0.86 – 0.91', context: '5-minute nocturnal segments vs ECG reference' },
      ],
    },
    dataPipeline: {
      fileFormats: ['JSON via Oura Cloud REST API v2', 'CSV download via Oura on the Web / Oura Teams'],
      exportMethod: 'BLE to Oura mobile app -> Oura Cloud REST API v2 / Webhooks',
      easeScore: 4,
      easeSummary:
        'Clean, well-documented REST API v2 (`/v2/usercollection/daily_sleep`, `heartrate`) returns 5-minute nocturnal HR and RMSSD arrays; raw 250 Hz PPG and beat-to-beat IBI are locked.',
      licensingPaywall: 'Consumer Oura Membership ($5.99/mo per ring) or Oura Teams / For Business enterprise license',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: '250 Hz internal IR PPG -> exported as 5-minute nocturnal RMSSD & HR epochs',
      auxiliaryStreams: ['Nocturnal skin temperature deviation (NTC thermistors)', 'Respiratory rate', '3D actigraphy movement', 'Daytime 5-min resting HR windows'],
      syncHardware: ['Smartphone NTP clock synchronization over BLE'],
      clockDriftPpm: 15,
      alignmentNotes:
        'Oura API v2 returns ISO-8601 timestamps aligned to 5-minute nocturnal windows. Cannot be aligned beat-by-beat or during active daytime exercise without a workout session.',
    },
    economics: {
      capexRange: '$299 – $399 per ring + $10 sizing kit',
      opexOrSubscription: '$5.99/month consumer membership OR Oura Teams research portal ($10–$25/subject/mo with enterprise minimum)',
      consumablesRequired: ['Plastic ring sizing kits ($10/kit)'],
      perSubjectConsumableCost: 5.0,
      calibration: {
        intervalMonths: 0,
        type: 'Factory optical array calibration (Gen 4 adds 18-path Smart Sensing recessed photodiodes)',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Oulu, Finland / San Francisco, CA, USA',
        supportTimezone: 'EET (UTC+2) / PST (UTC-8)',
        clinicalSupportTier: 'Oura Healthcare & Research partnerships team (Oura Teams dashboard)',
      },
    },
    strengths: [
      'Palmar digital arteries yield a much stronger pulsatile AC-to-DC optical ratio than the dorsal wrist, producing near-ECG nocturnal resting HR (r² = 0.996) and RMSSD (r² = 0.980)',
      '4-to-7 day battery life and screenless titanium form factor achieve > 85–90% longitudinal adherence over 6–12 month studies',
      'Clean, modern REST API v2 with OAuth2 and webhook support for automated clinical study ingestion',
    ],
    limitations: [
      'Does NOT capture continuous 24-hour beat-to-beat HRV: daytime HR/HRV is only sampled opportunistically during motionless 5-minute windows',
      'Raw 250 Hz PPG waveform and individual inter-beat intervals (IBI) are not exposed in the public API (only 5-minute RMSSD and HR averages)',
      'Over-the-air firmware and cloud algorithm updates cannot be frozen on consumer accounts, risking longitudinal step shifts',
    ],
    fieldGotchas: [
      'The "24-hour HRV" misconception: investigators frequently purchase Oura expecting continuous daytime + nighttime beat-to-beat HRV, only to find daytime data has massive gaps whenever the participant types, walks, or gestures.',
      'Finger edema & arthritis in aging cohorts: morning finger swelling or osteoarthritic DIP/PIP joints can make ring removal difficult or cause poor fit.',
    ],
    measurementSd: 0.9,
    repeatabilityLimit: 2.49,
    studyInstrument: {
      formFactor: 'smart_ring',
      typicalBatteryLife: '4–7 days per charge (20–80 min charging on size-specific dock)',
      dataGranularity: 'epoch_1m_to_5m',
      granularityDetails:
        'Exports 5-minute nocturnal RMSSD (`ms`) and HR (`bpm`) arrays plus whole-night summary statistics via Oura API v2. Raw 250 Hz infrared PPG waveforms and raw millisecond R-R intervals are not accessible to standard API users.',
      offloadMechanism: 'cloud_rest_api',
      firmwareLockSupported: false,
      algorithmStabilityNotes:
        'Ring firmware and Oura Cloud processing algorithms update automatically via the Oura mobile app. Cannot freeze firmware across a multi-month longitudinal trial.',
      contractAndCostWalls: [
        'Since Gen 3/4, an active Oura Membership ($5.99/mo per participant) is required for the Oura API v2 to return full daily/sleep metrics on consumer accounts.',
        'Oura Teams (research portal for bulk CSV export and participant management without individual credit cards) requires an enterprise contract with minimum seat/annual spend commitments.',
        'Each ring charger is size-specific (sizes 4–15): losing a size 9 charger requires replacing it with a size 9 dock.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: false,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: true,
      },
      useFor: [
        'Multi-week to multi-month longitudinal tracking of nocturnal resting HR and overnight vagal tone (RMSSD) in free-living cohorts',
        'Simultaneous high-compliance collection of nocturnal RMSSD, resting HR, finger temperature trends, and 5-minute sleep stage summaries',
        'Decentralized studies where participant adherence and low charging friction (once every 5 days) outweigh the need for daytime raw ECG',
      ],
      doNotUseFor: [
        'Studies testing daytime autonomic reactivity, orthostatic challenge, or continuous 24-hour waking + sleeping HRV (optical ring rejects waking hand movement)',
        'Frequency-domain HRV endpoints (LF, HF, LF/HF ratio) or entropy metrics requiring unfiltered beat-to-beat RR interval series',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Very high wear compliance in mild cognitive impairment (MCI) and older adults because there is no screen, button, or daily charging routine; however, inspect fingers for osteoarthritic nodes or peripheral edema during sizing.',
        arrhythmiaAndEctopy:
          'Internal 5-minute RMSSD filter rejects extreme aberrant intervals, but subclinical atrial fibrillation or frequent nocturnal bigeminy can still distort 5-minute RMSSD averages without raw ECG visibility.',
        skinToneAndPerfusion:
          'Infrared (900 nm) palmar digital transmission is much less affected by epidermal melanin than dorsal wrist green PPG, though severe Raynaud syndrome or cold bedrooms can attenuate finger perfusion.',
      },
      validationCitations: [
        {
          authors: 'Kinnunen, H., Rantanen, A., Kenttä, T., & Koskimäki, H.',
          year: 2020,
          title: 'Feasible assessment of recovery and cardiovascular health: accuracy of nocturnal HR and HRV assessed via ring photoplethysmography',
          journal: 'Physiological Measurement',
          doiOrPmid: '10.1088/1361-6579/ab840a',
          sampleSize: 'n = 49 healthy adults (full-night simultaneous recording)',
          protocolContext: 'Nocturnal 5-minute and whole-night HR and RMSSD vs 3-lead Faros 360 ECG',
          reportedResult: 'Whole-night average HR r² = 0.996 (bias -0.63 ± 0.88 bpm); whole-night RMSSD r² = 0.980 (bias -1.2 ± 5.6 ms); 5-min epoch RMSSD r² = 0.86.',
        },
        {
          authors: 'Cao, R., Azimi, I., Sarhaddi, F., Niela-Vilen, H., Axelin, A., Liljeberg, P., & Rahmani, A. M.',
          year: 2022,
          title: 'Accuracy Assessment of Oura Ring Nocturnal Heart Rate and Heart Rate Variability in Comparison With Electrocardiography in Time and Frequency Domains',
          journal: 'Journal of Medical Internet Research (JMIR)',
          doiOrPmid: '10.2196/27487',
          sampleSize: 'n = 35 healthy participants',
          protocolContext: 'Home nocturnal monitoring against Shimmer3 ECG reference',
          reportedResult: 'Strong nocturnal time-domain agreement (HR r = 0.99, RMSSD r = 0.91), but frequency-domain metrics (LF, HF, LF/HF) showed wider error limits.',
        },
      ],
      measurementSdSource:
        'Derived from Kinnunen et al. (2020) nocturnal resting HR validation against Bittium Faros ECG (SD of paired nocturnal differences = 0.88 bpm).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'whoop-4-hrv',
    name: 'WHOOP 4.0 (Wrist / Bicep Strap)',
    vendor: 'WHOOP, Inc.',
    model: 'WHOOP 4.0 Sensor + Any-Wear Bicep/Wrist Band',
    domainId: 'hr',
    tier: 'bronze',
    tagline: 'Screenless subscription fitness band reporting nocturnal SWS-weighted RMSSD and continuous heart rate',
    summary:
      'A screenless, subscription-based optical biometric strap featuring 5 LEDs (green, red, infrared) and 4 photodiodes, chargeable on-wrist via a slide-on wireless battery pack. Popular in athletic recovery and wellness cohorts, but heavily gated by enterprise contracts and closed beat-to-beat data pipelines.',
    regulatory: {
      clearancePathway: 'Consumer / OTC',
      clearanceNumber: 'N/A (General wellness device)',
      productCode: 'DRT',
      predicateChain: 'N/A',
      consensusStandards: ['CTA-2065'],
      reportedClearanceResults: [
        { metric: 'Nocturnal HR Bias vs ECG', value: '-0.3 ± 1.0 bpm (r = 0.99)', context: 'Laboratory sleep comparison vs 12-lead PSG ECG (Miller et al. 2022)' },
        { metric: 'Nocturnal HRV (RMSSD) Agreement', value: 'r = 0.99 (Bias -4.5 ± 3.9 ms)', context: 'Nocturnal sleep comparison vs ECG (Miller et al. 2022)' },
      ],
    },
    dataPipeline: {
      fileFormats: ['JSON via WHOOP Developer API v1', 'CSV summary exports'],
      exportMethod: 'BLE to WHOOP app -> WHOOP Cloud REST API (summary cycles only) or BLE HR Broadcast',
      easeScore: 2,
      easeSummary:
        'Public Developer API v1 only exposes 1-per-night summary metrics (single daily RMSSD value, resting HR, sleep totals); intraday HR, epoch-level HRV, and raw PPG require an enterprise WHOOP Unite research contract.',
      licensingPaywall: 'Mandatory $239/yr membership per unit; intraday research portal (WHOOP Unite) requires enterprise contract ($10,000+ minimum)',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: '100 Hz internal optical PPG -> exported publicly as 1 daily summary score (or 1 Hz BLE HR broadcast)',
      auxiliaryStreams: ['Skin temperature', 'SpO2', '3-axis accelerometer', 'Respiratory rate'],
      syncHardware: ['Smartphone NTP via BLE'],
      clockDriftPpm: 20,
      alignmentNotes:
        'Standard WHOOP API only provides cycle start/end timestamps and a single nocturnal RMSSD number. For second-by-second HR alignment, enable "Broadcast Heart Rate" in the WHOOP app and record standard BLE GATT 0x180D packets locally.',
    },
    economics: {
      capexRange: '$0 hardware (bundled into $239–$399/year subscription per strap)',
      opexOrSubscription: '$239/year per active strap OR enterprise WHOOP Unite research seat contract',
      consumablesRequired: ['SuperKnit wrist or bicep bands ($49)'],
      perSubjectConsumableCost: 0,
      calibration: {
        intervalMonths: 0,
        type: 'Factory optical calibration; 7–14 day personal baseline rolling window for Recovery scores',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Boston, MA, USA',
        supportTimezone: 'EST (UTC-5)',
        clinicalSupportTier: 'WHOOP Unite Enterprise / Academic Research Partnerships (strict vetting for small trials)',
      },
    },
    strengths: [
      'Slide-on waterproof wireless battery pack allows participants to charge the sensor without ever removing it from their wrist, eliminating "left on charger" data gaps',
      'Screenless design prevents behavioral Hawthorne reactivity (participants cannot see live HR on their wrist unless they open the phone app)',
      'Excellent nocturnal HR and whole-night RMSSD agreement against laboratory ECG (Miller et al. 2022)',
    ],
    limitations: [
      'Severe data access wall: public API v1 returns ONLY one aggregated RMSSD value per 24-hour cycle (no 5-minute nocturnal series, no daytime HRV, no raw IBI)',
      'Proprietary RMSSD weighting: WHOOP historically weighted HRV heavily toward the last slow-wave sleep (SWS) episode rather than simple uniform nocturnal averaging, complicating direct comparison with standard Holter 24h RMSSD',
      'Mandatory recurring subscription model creates budget friction for multi-year academic grants',
    ],
    fieldGotchas: [
      'The API Granularity Surprise: many research teams build a protocol around WHOOP assuming the public Developer API exports intraday HR or 5-minute HRV epochs—only to discover after purchasing devices that public endpoints only return one summary number per day.',
      'Wrist vs. Bicep placement: during vigorous upper-body movement, wrist placement exhibits motion error that is substantially reduced by moving the sensor to a WHOOP bicep band.',
    ],
    measurementSd: 1.2,
    repeatabilityLimit: 3.32,
    studyInstrument: {
      formFactor: 'smartwatch_wrist',
      typicalBatteryLife: '4–5 days (recharged on-body via slide-on wireless battery pack)',
      dataGranularity: 'summary_only',
      granularityDetails:
        'Public WHOOP Developer API v1 (`/v1/recovery`, `/v1/cycle`) exposes only 1 daily nocturnal RMSSD value (`hrv_rmssd_milli`) and 1 resting HR value per sleep cycle. Intraday heart rate or raw streams are locked behind private enterprise agreements; live 1 Hz HR (without true ECG RR fidelity) can be captured locally only if the strap broadcasts over BLE GATT.',
      offloadMechanism: 'cloud_rest_api',
      firmwareLockSupported: false,
      algorithmStabilityNotes:
        'Firmware and cloud recovery/sleep/HRV weighting algorithms update continuously over-the-air without version locking.',
      contractAndCostWalls: [
        'Every device requires an active paid subscription ($239/yr) to function; an unsubscribed WHOOP 4.0 strap is completely bricked.',
        'Accessing anything more granular than 1 summary row per day requires a custom WHOOP Unite Enterprise / Research data-sharing contract, which typically carries high minimum seat counts and legal review.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: false,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: true,
      },
      useFor: [
        'Longitudinal observational studies needing a single daily nocturnal RMSSD and resting HR summary where on-wrist charging (zero removal) is critical',
        'Blinded behavioral studies where a screenless wrist/bicep strap is needed to prevent visual feedback on the device',
      ],
      doNotUseFor: [
        'Studies requiring raw beat-to-beat intervals (IBI), intraday 5-minute HRV trajectories, or continuous 24-hour waking + sleeping HRV without an executed enterprise contract',
        'Grant-funded studies that require one-time hardware CapEx with zero recurring cloud subscription dependencies',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Screenless wear is great, but sliding the tight wireless battery pack onto the strap requires moderate two-handed fine motor pinch strength that patients with Parkinson tremor or hand arthritis often struggle with.',
        arrhythmiaAndEctopy:
          'No ECG lead and no public access to beat-to-beat intervals; arrhythmias cannot be adjudicated.',
        skinToneAndPerfusion:
          'Multi-LED (green/red/IR) sensor array with bicep band option provides solid optical coupling, though tight elastic tension can leave skin indentations in fragile elderly skin.',
      },
      validationCitations: [
        {
          authors: 'Miller, D. J., Sargent, C., & Roach, G. D.',
          year: 2022,
          title: 'A Validation of Six Wearable Devices for Estimating Sleep, Heart Rate and Heart Rate Variability in Healthy Adults',
          journal: 'Sensors',
          doiOrPmid: '10.3390/s22166317',
          sampleSize: 'n = 53 healthy adults (laboratory sleep vs 12-lead ECG/PSG)',
          protocolContext: 'Nocturnal HR and RMSSD accuracy compared against simultaneous PSG ECG',
          reportedResult: 'Nocturnal HR bias -0.3 ± 1.0 bpm (r = 0.99); nocturnal RMSSD bias -4.5 ± 3.9 ms (r = 0.99).',
        },
        {
          authors: 'Bellenger, C. R., Miller, D. J., Halson, S. L., Roach, G. D., & Sargent, C.',
          year: 2021,
          title: 'Wrist-Based Photoplethysmography Assessment of Heart Rate and Heart Rate Variability: Validation of WHOOP',
          journal: 'Sensors',
          doiOrPmid: '10.3390/s21103571',
          sampleSize: 'n = 6 healthy young adults across slow-wave sleep bouts',
          protocolContext: 'Comparison of WHOOP SWS pulse rate and RMSSD against ECG',
          reportedResult: 'HR bias -0.2 ± 1.5 bpm; RMSSD bias -2.9 ± 5.8 ms during slow-wave sleep windows.',
        },
      ],
      measurementSdSource:
        'Derived from Miller et al. (2022) and Bellenger et al. (2021) nocturnal HR validation against ECG (SD ≈ 1.0–1.5 bpm at rest; higher during movement).',
      reviewStatus: 'draft',
    },
  },
  {
    id: 'garmin-elevate-gen5-hrv',
    name: 'Garmin Venu 3 / Forerunner 965 (Elevate HR & HRV)',
    vendor: 'Garmin Ltd.',
    model: 'Garmin Venu 3 / Forerunner 965 / Fenix 8 (Elevate Gen 4/5)',
    domainId: 'hr',
    tier: 'bronze',
    tagline: 'Long-battery consumer smartwatch ecosystem with Firstbeat nocturnal HRV Status and optional enterprise BBI SDK',
    summary:
      'Combines Garmin multi-LED Elevate optical sensor with 10-to-14 day battery life and Firstbeat Analytics. Uniquely splits into two tiers for researchers: free consumer exports (which provide 5-minute nocturnal HRV averages and FIT files) vs. the commercial Garmin Health SDK / Connected Ecosystem (which unlocks real-time optical beat-to-beat intervals and 25 Hz accelerometer streams).',
    regulatory: {
      clearancePathway: 'Consumer / OTC',
      clearanceNumber: 'N/A for optical HR/HRV (Venu 3 ECG app is 510(k) K230958)',
      productCode: 'DRT (ECG app is QDA)',
      predicateChain: 'Apple ECG App (DEN180044) cited for Venu 3 ECG app K230958',
      consensusStandards: ['CTA-2065'],
      reportedClearanceResults: [
        { metric: 'Rest & Steady-State HR MAPE', value: '1.8% – 3.2%', context: 'Optical wrist HR vs ECG chest strap across rest and steady running' },
        { metric: 'Nocturnal HRV Status (RMSSD)', value: 'r = 0.94 – 0.97', context: 'Firstbeat 5-minute nocturnal rolling RMSSD vs reference ECG' },
      ],
    },
    dataPipeline: {
      fileFormats: ['Standard FIT files (USB mass storage / Garmin Connect)', 'JSON via Garmin Health API', 'Raw BBI via Garmin Health Companion SDK'],
      exportMethod: 'Direct USB cable (FIT files) or BLE to Garmin Connect / Custom Garmin Health SDK App',
      easeScore: 4,
      easeSummary:
        'Unlike Apple or WHOOP, Garmin watches mount via USB to expose `.FIT` binary files directly, and Garmin work with third-party aggregators (Labfront, Fitabase, Fitrockr); however, direct Garmin Health SDK access requires a commercial license.',
      licensingPaywall: 'Free USB FIT export; Garmin Health Enterprise API is free for approved partners, while the Companion SDK (for raw BBI) requires a commercial license (~$5,000+ or Labfront seat fee)',
      rawSignalAccess: false,
    },
    synchronization: {
      nativeSamplingRate: '1 Hz HR (smart/every-second recording) and 5-minute nocturnal RMSSD windows (or optical BBI via Companion SDK)',
      auxiliaryStreams: ['Pulse Ox (SpO2)', 'Respiration rate', 'Firstbeat Stress Score (0–100)', '3-axis accelerometer (25 Hz via SDK)'],
      syncHardware: ['GPS satellite atomic clock sync + Smartphone NTP'],
      clockDriftPpm: 10,
      alignmentNotes:
        'Crucial setting: by default, Garmin uses "Smart Recording" (variable intervals). Researchers MUST set Data Recording to "Every Second" (1 Hz) in system settings before deploying to participants.',
    },
    economics: {
      capexRange: '$249 (Vivoactive 5) – $449 (Venu 3) – $599 (Forerunner 965)',
      opexOrSubscription: '$0 consumer subscription (no monthly fee to user); optional $5–$15/subject/mo if using Labfront/Fitrockr research portal',
      consumablesRequired: ['Standard 20mm/22mm silicone bands'],
      perSubjectConsumableCost: 0,
      calibration: {
        intervalMonths: 0,
        type: 'Factory optical calibration; 19-night baseline required for personal HRV Status range',
        rmaTurnaroundWeeks: 1,
        fieldRepairable: false,
      },
      vendorSupport: {
        hqLocation: 'Olathe, KS, USA / Schaffhausen, Switzerland',
        supportTimezone: 'CST (UTC-6) / CET (UTC+1)',
        clinicalSupportTier: 'Dedicated Garmin Health enterprise & academic research division (compatible with Labfront, Fitabase, Fitrockr)',
      },
    },
    strengths: [
      '10-to-14 day battery life (up to 20+ days on Instinct/Fenix) drastically reduces charging dropout in elderly and neurodegenerative cohorts compared to Apple Watch',
      'Zero monthly consumer subscription fee (unlike Oura and WHOOP) and full cross-platform compatibility with both iOS and Android participant phones',
      'Strong academic research ecosystem via Garmin Health API and turnkey partners (Labfront, Fitrockr, Fitabase) that expose optical Beat-to-Beat Intervals (BBI)',
    ],
    limitations: [
      'Optical wrist BBI still breaks down during daytime arm movement: Garmin Firstbeat "All-Day Stress" (HRV-derived) automatically blanks out during physical activity or motion',
      'Direct licensing of the Garmin Health Companion SDK (without going through a partner platform like Labfront) involves a multi-thousand-dollar commercial SDK fee',
      'Consumer firmware updates roll out automatically via Garmin Connect unless devices are operated offline via USB FIT offload',
    ],
    fieldGotchas: [
      '"Smart Recording" Default Trap: out of the box, Garmin watches record data only when heart rate or direction changes ("Smart Recording"), creating irregular time gaps. Always switch the watch setting to "Every Second" recording.',
      'Pulse Ox battery drain: enabling "All-Day" or "During Sleep" SpO2 cuts Garmin battery life in half (from 12 days to 5 days). Leave SpO2 off unless blood oxygen is a study endpoint.',
    ],
    measurementSd: 2.1,
    repeatabilityLimit: 5.82,
    studyInstrument: {
      formFactor: 'smartwatch_wrist',
      typicalBatteryLife: '10–14 days in smartwatch mode (Venu 3 / Forerunner 965); up to 28 days on Instinct 2X',
      dataGranularity: 'epoch_1m_to_5m',
      granularityDetails:
        'Standard Garmin Connect / USB `.FIT` files provide 1 Hz heart rate, 5-minute nocturnal RMSSD windows (`HRV Status`), and 3-minute daytime Firstbeat stress scores. Optical Beat-to-Beat Intervals (`BBI`, in ms) and 25 Hz 3D accelerometer logs are accessible if paired with the Garmin Health Companion SDK (or via Labfront / Fitrockr research apps).',
      offloadMechanism: 'cloud_rest_api',
      firmwareLockSupported: false,
      algorithmStabilityNotes:
        'When paired with consumer Garmin Connect, firmware updates automatically. However, Garmin watches can also be operated completely offline and offloaded via direct USB cable as standard `.FIT` files, or managed with locked firmware via enterprise Garmin Health MDM.',
      contractAndCostWalls: [
        'No recurring consumer subscription is required (saving $70–$240/year per device compared to Oura or WHOOP).',
        'To capture raw optical Beat-to-Beat Intervals (BBI) rather than 5-minute HRV summaries, researchers must either license the Garmin Health Companion SDK (~$5,000+ one-time fee) or use an integrated partner platform like Labfront or Fitrockr.',
      ],
      supportedCapabilities: {
        continuous24hIbi: false,
        nocturnalRestingHrv: true,
        aasm30sSleepStaging: false,
        consumerSleepSummary: true,
        multiWeekHabitualCompliance: true,
      },
      useFor: [
        'Multi-month longitudinal trials needing a wrist wearable that works across both iOS and Android with 10–14 day battery life (eliminating daily charging dropout)',
        'Studies combining nocturnal HRV Status (5-min RMSSD), physical activity (steps/cadence), and consumer sleep tracking with zero per-user subscription fees',
        'Protocols using Labfront/Fitrockr + Garmin Health SDK to log stationary optical BBI and 25 Hz wrist accelerometry',
      ],
      doNotUseFor: [
        'True 24-hour continuous waking beat-to-beat HRV during active motion (wrist optical BBI suffers high artifact during arm movement unless paired with a Garmin HRM-Pro chest strap)',
        'Primary FDA registrational endpoints without an ECG reference comparator',
      ],
      cohortConsiderations: {
        agingAndNeuro:
          'Outstanding battery longevity (charging only twice a month) makes Garmin far more resilient against participant forgetfulness in MCI and aging cohorts than Apple Watch or Pixel Watch.',
        arrhythmiaAndEctopy:
          'Venu 3 includes an FDA 510(k)-cleared (`K230958`) spot 30-second single-lead ECG app for AFib detection, though background optical HRV does not adjudicate ectopic beats.',
        skinToneAndPerfusion:
          'Elevate Gen 5 sensor increases LED count and photodiode area, performing reliably at rest across skin tones, though loose wrist straps during sleep or exercise cause optical dropouts.',
      },
      validationCitations: [
        {
          authors: 'Miller, D. J., Sargent, C., & Roach, G. D.',
          year: 2022,
          title: 'A Validation of Six Wearable Devices for Estimating Sleep, Heart Rate and Heart Rate Variability in Healthy Adults',
          journal: 'Sensors',
          doiOrPmid: '10.3390/s22166317',
          sampleSize: 'n = 53 healthy adults (laboratory sleep vs 12-lead ECG/PSG)',
          protocolContext: 'Evaluation of Garmin optical HR and nocturnal HRV against reference ECG',
          reportedResult: 'Nocturnal HR bias -0.5 ± 1.6 bpm (r = 0.98); nocturnal RMSSD bias -3.2 ± 6.4 ms (r = 0.95).',
        },
      ],
      measurementSdSource:
        'Composite empirical SD across rest (~1.6 bpm per Miller et al. 2022) and ambulatory wrist motion (~2.1–2.5 bpm vs ECG).',
      reviewStatus: 'draft',
    },
  },
];

