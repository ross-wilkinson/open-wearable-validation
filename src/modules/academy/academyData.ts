export interface AcademyModule {
  id: string;
  moduleNumber: number;
  moduleLabel: string;
  actNumber: number;
  actRoman: string;
  title: string;
  subtitle: string;
  lifecycleStage: string;
  narrativeScenario: string;
  coreStatisticalConcept: string;
  keyTakeaway: string;
  statisticalFormula: string;
  interactiveToolRoute: string;
  interactiveToolLabel: string;
  category: 'prototyping' | 'sizing' | 'operations' | 'governance';
  estimatedMinutes: number;
  walkthroughSteps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    callout?: string;
  }>;
}

export const ACADEMY_MODULES: AcademyModule[] = [
  {
    id: 'act-1-winners-curse',
    moduleNumber: 1,
    moduleLabel: 'Module 1',
    actNumber: 1,
    actRoman: 'Module 1',
    title: "The Rapid Prototyping Winner's Curse",
    subtitle: 'Small-Sample Screens at N=5',
    lifecycleStage: 'R&D Phase 0: Algorithm Exploration',
    narrativeScenario:
      'The DSP engineering team presents 5 candidate optical motion-rejection filters for the upcoming Meridian PulseBand 2. With tight schedules, they propose running a 5-subject treadmill trial to pick the single "best" algorithm. As Lead Validation Scientist, you must explain why apparent winners at N=5 are statistical artifacts of noise, but demonstrate how N=5 screens possess immense power to discard catastrophic failures.',
    coreStatisticalConcept:
      'Permutation null distributions, small-sample standard error inflation (SE = σ√(2/n)), and the Winner’s Curse (selection bias on extreme order statistics).',
    keyTakeaway:
      'N=5 rapid prototype screens cannot pick a winner out of noise (apparent winners are lucky noise), but they possess >95% statistical power to eliminate catastrophic losers (Δ ≥ 5 bpm).',
    statisticalFormula:
      '\\text{SE}(\\Delta) = \\sqrt{\\frac{\\sigma_1^2}{n} + \\frac{\\sigma_2^2}{n}} = \\sigma\\sqrt{\\frac{2}{n}} \\implies \\text{SNR} = \\frac{\\Delta}{\\text{SE}} \\ll 1',
    interactiveToolRoute: '/explainers/sniff-test',
    interactiveToolLabel: 'Open N=5 Sniff Test Explainer',
    category: 'prototyping',
    estimatedMinutes: 8,
    walkthroughSteps: [
      {
        stepNumber: 1,
        title: 'The Engineering Trap',
        description:
          'Five candidate DSP filters are tested on 5 lab colleagues. Prototype B registers 1.9 bpm mean error, while Prototype A shows 2.2 bpm. The team prepares to commit tooling to Prototype B.',
        callout: 'Common misconception: ranking small samples reflects true algorithmic capability.',
      },
      {
        stepNumber: 2,
        title: 'Standard Error Inflation',
        description:
          'With typical PPG noise σ = 3.0 bpm at N=5, the standard error of difference between two filters is 1.90 bpm. A 0.3 bpm gap has an SNR of 0.16—meaning random noise dictates the ranking over 75% of the time.',
        callout: 'The winner on the leaderboard is simply the candidate that received the luckiest noise realization.',
      },
      {
        stepNumber: 3,
        title: 'The Elimination Superpower',
        description:
          'Conversely, when a prototype has a fatal optical decoupling defect (true error ≥ 5 bpm), its separation from viable candidates exceeds 2.5 standard errors. An N=5 screen catches and eliminates flawed designs with >95% statistical power.',
        callout: 'Golden Rule: Use N=5 screens exclusively to eliminate the bottom 50%, never to pick a winner.',
      },
    ],
  },
  {
    id: 'act-2-paired-dividend',
    moduleNumber: 2,
    moduleLabel: 'Module 2',
    actNumber: 2,
    actRoman: 'Module 2',
    title: 'The Paired Correlation Dividend',
    subtitle: 'Sizing the OTA Firmware Update',
    lifecycleStage: 'Firmware Update & Non-Inferiority Verification',
    narrativeScenario:
      'Meridian Firmware V2 optimizes battery life by 35%. Product leadership demands proof of non-inferiority (margin Δ = 1.5 bpm) against Firmware V1 before pushing over-the-air (OTA). The clinical operations budget is capped at $20,000. Generic power tools demand N=190 independent subjects ($247,000). You unlock the paired correlation dividend.',
    coreStatisticalConcept:
      'Paired variance reduction: σ²_pair = 2σ²(1 - ρ). Extreme intra-subject correlation (ρ ≥ 0.95) when two algorithms evaluate the exact same optical photoplethysmogram time series.',
    keyTakeaway:
      'Because both algorithms run on the exact same optical sensor stream, correlation is extreme (ρ ≥ 0.95). Exploiting paired variance reduces required enrollment from N=190 to N=10–12, saving $225,000+.',
    statisticalFormula:
      '\\sigma_{\\text{pair}}^2 = 2\\sigma^2(1 - \\rho) \\implies N_{\\text{paired}} = N_{\\text{independent}} \\times (1 - \\rho)',
    interactiveToolRoute: '/agreement',
    interactiveToolLabel: 'Open Paired Non-Inferiority Designer',
    category: 'sizing',
    estimatedMinutes: 10,
    walkthroughSteps: [
      {
        stepNumber: 1,
        title: 'The Clinical Budget Impasse',
        description:
          'A clinical trial recruiter quotes $1,300 per subject. A standard two-sample non-inferiority calculator requires N = 190 subjects for 90% power, consuming $247,000 and 4 months of recruitment.',
      },
      {
        stepNumber: 2,
        title: 'Identical Optical Data Streams',
        description:
          'Unlike comparing two distinct physical devices, Firmware V1 and V2 can execute on the exact same raw PPG photodiode recordings. The between-subject biological variance cancels completely, leaving only intra-algorithmic difference noise.',
      },
      {
        stepNumber: 3,
        title: 'The 95% Variance Dividend',
        description:
          'With ρ ≥ 0.95, paired difference variance drops by a factor of 20 (1 - 0.95 = 0.05). Sizing collapses from N=190 down to N=10 subjects, completing the study in 5 days for $13,000.',
        callout: 'Key Rule: Pure firmware tweaks require paired non-inferiority on recorded data, not full clinical re-enrollment.',
      },
    ],
  },
  {
    id: 'act-3-clustered-repeated-measures',
    moduleNumber: 3,
    moduleLabel: 'Module 3',
    actNumber: 3,
    actRoman: 'Module 3',
    title: 'The Pseudoreplication Trap',
    subtitle: 'HIIT Trial & Clustered Repeated Measures',
    lifecycleStage: 'Clinical Verification: High-Intensity Interval Training',
    narrativeScenario:
      'Meridian conducts an intense stationary bike HIIT validation trial with 25 subjects, recording 1 Hz heart rate for 45 minutes (yielding 67,500 total data points). A junior data scientist presents a 95% confidence interval of ±0.015 bpm, claiming FDA approval is guaranteed. You must intervene before this submission reaches regulators.',
    coreStatisticalConcept:
      'Clustering, intraclass correlation (ICC), variance inflation factor (VIF = 1 + (m - 1)·ICC), and closed-form one-way random-effects ANOVA (Bland & Altman 2007) partitioning between-subject variance (s_b²) from within-subject measurement noise (s_w²).',
    keyTakeaway:
      '67,500 data points across 25 people is NOT N=67,500. Sizing and reporting must decompose between-subject biological variation from within-subject noise; failure to do so understates uncertainty by nearly 90%.',
    statisticalFormula:
      'N_{\\text{eff}} = \\frac{N \\cdot m}{1 + (m - 1)\\text{ICC}}, \\quad s_{\\text{total}}^2 = s_b^2 + s_w^2, \\quad \\text{VIF} = 1 + (m - 1)\\text{ICC}',
    interactiveToolRoute: '/repeated-measures',
    interactiveToolLabel: 'Open Repeated Measures Designer',
    category: 'sizing',
    estimatedMinutes: 12,
    walkthroughSteps: [
      {
        stepNumber: 1,
        title: 'The Illusion of Infinite Data',
        description:
          'Sampling at 1 Hz for 45 minutes produces 2,700 rows per subject. The analyst assumes each row is independent, dividing standard deviation by √67,500 = 260.',
      },
      {
        stepNumber: 2,
        title: 'The Intraclass Correlation Reality',
        description:
          'Physiological heart rate exhibits high intra-subject correlation (ICC ≈ 0.85). Second-to-second measurements within the same person share identical physiology, skin tone, and sensor fit.',
      },
      {
        stepNumber: 3,
        title: 'Variance Decomposition',
        description:
          'With m = 2,700 and ICC = 0.85, the variance inflation factor is VIF = 1 + (2699 × 0.85) = 2,295. The effective sample size is N_eff = 67,500 / 2,295 ≈ 29 independent subjects—barely higher than the 25 participants enrolled.',
        callout: 'Best Practice: Closed-form random-effects ANOVA provides exact variance decomposition without numerical optimizer crashes.',
      },
    ],
  },
  {
    id: 'act-4-demographic-quotas',
    moduleNumber: 4,
    moduleLabel: 'Module 4',
    actNumber: 4,
    actRoman: 'Module 4',
    title: 'Demographic Equity & Regulatory Quotas',
    subtitle: 'Monk Skin Tone Scale & ISO 80601-2-61',
    lifecycleStage: 'Regulatory Clearance: FDA 510(k) Pre-Market Submission',
    narrativeScenario:
      'Meridian is preparing an FDA 510(k) pre-market submission for PulseBand 2 SpO2 under ISO 80601-2-61. The clinical site plans walk-in enrollment. Walk-in cohorts in suburban clinics skew heavily towards lighter skin tones. You must implement a dual-scale Monk-to-Fitzpatrick bridge and enforce recruitment ceiling caps.',
    coreStatisticalConcept:
      'Optical melanin absorption at 530nm and 660nm, 10-point Monk Skin Tone (MST) scale vs legacy 6-point Fitzpatrick (I–VI), floor vs ceiling quota caps, and demographic fairness standards.',
    keyTakeaway:
      'Never allow walk-in clinics to enroll without demographic ceiling caps. Never use Bayesian hierarchical shrinkage across melanin groups—lower optical SNR is physical physics, not random sampling error.',
    statisticalFormula:
      '\\text{Melanin Absorbance} \\propto \\exp(\\mu_{\\text{melanin}} \\cdot d), \\quad Q_{\\text{min}} = \\lceil N \\cdot 0.15 \\rceil, \\quad \\text{Ceiling Cap} = \\lceil N \\cdot p_k \\cdot 1.10 \\rceil',
    interactiveToolRoute: '/demographics',
    interactiveToolLabel: 'Open Demographic Segment Planner',
    category: 'operations',
    estimatedMinutes: 10,
    walkthroughSteps: [
      {
        stepNumber: 1,
        title: 'The Optical Melanin Challenge',
        description:
          'Melanin absorbs green (530nm) and red (660nm) light exponentially. In darker skin tones (MST 08–10 / Fitzpatrick V–VI), return photoplethysmogram AC amplitude is 60–80% lower than in light skin.',
      },
      {
        stepNumber: 2,
        title: 'The Dual-Scale Bridge',
        description:
          'FDA guidance mandates reporting Fitzpatrick skin types with ≥15% representation in Types V–VI. However, modern consumer technology standardizes on the 10-point Monk Skin Tone Scale to avoid Eurocentric clustering. The dual-scale bridge automatically reconciles both.',
      },
      {
        stepNumber: 3,
        title: 'Enforcing Ceiling Caps',
        description:
          'Without ceiling caps, walk-in clinics fill 85% of slots with MST 01–03 before a single dark skin participant is recruited. Implementing ceiling caps forces recruitment outreach to continue until all demographic bins are equitably populated.',
        callout: 'Fairness Standard: Strictly prohibit borrowing strength across protected demographic groups.',
      },
    ],
  },
  {
    id: 'act-5-cadence-lock',
    moduleNumber: 5,
    moduleLabel: 'Module 5',
    actNumber: 5,
    actRoman: 'Module 5',
    title: 'Edge-Case Crisis: Cadence Lock',
    subtitle: 'Provocation Protocols & IMU Nyquist Limits',
    lifecycleStage: 'Verification & Edge-Case Provocation Testing',
    narrativeScenario:
      'Early endurance athlete beta testers report that during tempo runs, the Meridian PulseBand 2 locks onto their running cadence (170 spm) instead of their actual heart rate (155 bpm). Meanwhile, the sports biomechanics team questions if the 25 Hz IMU is fast enough to validate sprint Ground Contact Time (GCT) balance. You design the Cadence Lock Provocation Protocol.',
    coreStatisticalConcept:
      'Harmonic Contamination Index (HCI), speed-ramp provocation protocols forcing fundamental frequency crossings, and Nyquist-Shannon temporal resolution limits for millisecond biomechanics.',
    keyTakeaway:
      'Standard field testing misses harmonic traps. Validation requires targeted edge-case stress protocols designed to actively provoke harmonic crossings. High-speed running dynamics require ≥100 Hz IMU sampling.',
    statisticalFormula:
      '\\text{HCI} = \\frac{\\sum [|HR_{\\text{PPG}} - Cadence| \\le 3 \\land |HR_{\\text{ref}} - Cadence| > 10]}{\\text{Total Duration}} \\times 100\\%, \\quad \\Delta t = \\frac{1000}{f_s}',
    interactiveToolRoute: '/chance-kpi',
    interactiveToolLabel: 'Open KPI Validation Explorer',
    category: 'prototyping',
    estimatedMinutes: 12,
    walkthroughSteps: [
      {
        stepNumber: 1,
        title: 'The Optical-Mechanical Collision',
        description:
          'Footstrikes during running create periodic blood sloshing and micro-chassis movement at 160–185 Hz (spm / 60). Optical PPG sensors mistake this dominant mechanical harmonic for the cardiac systolic pulse.',
      },
      {
        stepNumber: 2,
        title: 'The Provocation Ramp Protocol',
        description:
          'A stationary treadmill protocol ramps speed from 8 km/h to 16 km/h. Running cadence stays stable around 170 spm while cardiovascular demand drives heart rate from 130 bpm across 170 bpm to 185 bpm. This forces an unavoidable harmonic intersection.',
      },
      {
        stepNumber: 3,
        title: 'Temporal Resolution Gating',
        description:
          'At 25 Hz IMU sampling, temporal resolution is 40 ms. For sprint Ground Contact Time (~200 ms), 40 ms constitutes a 20% measurement error window! Sizing for biomechanical equivalence requires upgrading to ≥100 Hz sampling (10 ms resolution).',
        callout: 'Core Principle: Targeted Protocol Provocation over DSP Re-engineering.',
      },
    ],
  },
  {
    id: 'act-6-aggressor-noise',
    moduleNumber: 6,
    moduleLabel: 'Module 6',
    actNumber: 6,
    actRoman: 'Module 6',
    title: 'Aggressor Noise & Rare Event Bounds',
    subtitle: 'Clopper-Pearson Exact Binomial Bounds',
    lifecycleStage: 'Algorithm Hardening: High-Motion Gym Verification',
    narrativeScenario:
      'Meridian tests a new high-motion gym feature (cross-fit, kettlebell swings, rowing) across 1,000 challenge windows. Zero false arrhythmia notifications are triggered (0/1,000). The product marketing lead asserts: "We have proven 0% false alarm risk!" You present the executive committee with exact Clopper-Pearson binomial upper bounds.',
    coreStatisticalConcept:
      'Exact one-sided Clopper-Pearson binomial confidence bounds, the Rule of Three (3/N), and population false alarm scaling under high user engagement.',
    keyTakeaway:
      'Zero events does not mean zero risk. 0/1,000 proves with 95% confidence only that the false alarm rate is ≤ 0.30% (3/N). At commercial scale (1,000,000 users), 0.3% produces 30,000,000 false alarms per year.',
    statisticalFormula:
      '(1 - p_{\\text{upper}})^n = \\alpha \\implies p_{\\text{upper}} = 1 - \\alpha^{1/n} \\approx \\frac{-\\ln(\\alpha)}{n} \\approx \\frac{3}{n}',
    interactiveToolRoute: '/precision',
    interactiveToolLabel: 'Open Exact Precision Bounds',
    category: 'governance',
    estimatedMinutes: 9,
    walkthroughSteps: [
      {
        stepNumber: 1,
        title: 'The Zero-Event Fallacy',
        description:
          'Observing 0 false alarms in 1,000 crossfit windows does not mean the true error rate is 0.00%. Small trials simply lack the sample size to detect rare high-consequence failure modes.',
      },
      {
        stepNumber: 2,
        title: 'Exact Clopper-Pearson Upper Bound',
        description:
          'Solving (1 - p)^1000 = 0.05 yields an exact 95% upper bound of 0.299% (Rule of Three: 3 / 1,000 = 0.30%). The true false alarm rate may be anywhere between 0% and 0.30%.',
      },
      {
        stepNumber: 3,
        title: 'Commercial Scale Multiplication',
        description:
          'If 1,000,000 customers wear the PulseBand 2 during 10 gym workouts per month (10,000 monitoring windows per year = 10 billion windows), a 0.30% error bound translates to up to 30,000,000 false notifications annually.',
        callout: 'Upstream gating must report both data yield and false-alarm suppression efficiency.',
      },
    ],
  },
  {
    id: 'act-7-two-gate-launch-engine',
    moduleNumber: 7,
    moduleLabel: 'Module 7',
    actNumber: 7,
    actRoman: 'Module 7',
    title: 'The Commercial Launch Engine',
    subtitle: 'Two-Gate 4-Quadrant Governance',
    lifecycleStage: 'Executive Launch Review: Production Gating',
    narrativeScenario:
      'The VP of Product convenes the Commercial Launch Committee. The algorithm team presents 50 pages of p-values, confusing marketing, legal, and hardware engineering leadership. You project the Two-Gate 4-Quadrant Visualizer onto the boardroom screen, synthesizing clinical accuracy and predecessor parity into a definitive verdict.',
    coreStatisticalConcept:
      'Gate 1 (Absolute Clinical Performance vs Gold Standard ECG / Reference) + Gate 2 (Opposite-Wrist Predecessor Parity vs PulseBand 1) combined in a 4-quadrant decision plane.',
    keyTakeaway:
      'Distill validation findings into an unambiguous executive scorecard: Green Light (Go), Amber (Parity Risk), Amber (Quality Debt), Red Light (No-Go).',
    statisticalFormula:
      '\\text{Gate 1}: \\text{RMSE} \\le \\tau_{\\text{clin}} \\quad \\land \\quad \\text{Gate 2}: |\\mu_{\\text{new}} - \\mu_{\\text{pred}}| + 1.96 \\cdot \\text{SE} \\le \\Delta_{\\text{parity}}',
    interactiveToolRoute: '/report-studio',
    interactiveToolLabel: 'Open Report Studio & 4-Quadrant Visualizer',
    category: 'governance',
    estimatedMinutes: 11,
    walkthroughSteps: [
      {
        stepNumber: 1,
        title: 'The Dual Gating Requirement',
        description:
          'Passing clinical accuracy alone is insufficient: if PulseBand 2 is accurate against ECG but reads 3 bpm higher than PulseBand 1, existing loyal customers will complain of broken step/heart rate baselines.',
      },
      {
        stepNumber: 2,
        title: 'The 4 Decision Quadrants',
        description:
          'Quadrant I (Green: Go), Quadrant II (Amber: Parity Risk - customer return hazard), Quadrant III (Amber: Quality Debt - matched predecessor but failed clinical standard), Quadrant IV (Red: No-Go).',
      },
      {
        stepNumber: 3,
        title: 'Executive Committee Alignment',
        description:
          'Mapping candidate firmware builds into the quadrant plane eliminates statistical jargon and gives product managers, legal counsel, and engineers a shared commercial launch threshold.',
        callout: 'Executive Standard: Standardize all launch readiness outputs around the Two-Gate 4-Quadrant Matrix.',
      },
    ],
  },
  {
    id: 'act-8-transitive-bridge',
    moduleNumber: 8,
    moduleLabel: 'Module 8',
    actNumber: 8,
    actRoman: 'Module 8',
    title: 'The Multi-Year Legacy & Transitive Bridge',
    subtitle: 'Indirect Network Contrasts & Drift Canaries',
    lifecycleStage: 'Longitudinal Architecture: Multi-Generation Lifecycle',
    narrativeScenario:
      'Two years later, Meridian begins development of the Meridian PulseBand 3. You review historical data and discover that while PulseBand 2 claimed parity with PulseBand 1, and PulseBand 3 claims parity with PulseBand 2, cumulative software drift has degraded overall accuracy. You implement the Transitive Predecessor Bridge.',
    coreStatisticalConcept:
      'Transitive indirect contrast estimation (Δ̂_3-1 = Δ̂_3-2 + Δ̂_2-1), network meta-analysis variance propagation, and Reference Standard Drift Canaries.',
    keyTakeaway:
      'Always maintain a shared predecessor or invariant reference across study generations to compute transitive indirect bounds and catch multi-year quality drift.',
    statisticalFormula:
      '\\widehat{\\Delta}_{3-1} = \\widehat{\\Delta}_{3-2} + \\widehat{\\Delta}_{2-1}, \\quad \\text{Var}(\\widehat{\\Delta}_{3-1}) = \\text{Var}(\\widehat{\\Delta}_{3-2}) + \\text{Var}(\\widehat{\\Delta}_{2-1}) - 2\\text{Cov}',
    interactiveToolRoute: '/report-studio',
    interactiveToolLabel: 'Open Transitive Bridge Explorer',
    category: 'governance',
    estimatedMinutes: 12,
    walkthroughSteps: [
      {
        stepNumber: 1,
        title: 'The Silent Quality Drift Phenomenon',
        description:
          'Each generation claims non-inferiority with its immediate predecessor (Gen 2 vs Gen 1: +0.7 bpm; Gen 3 vs Gen 2: +0.8 bpm). Individually, both pass non-inferiority (Δ ≤ 1.5 bpm). Cumulatively, Gen 3 has degraded by +1.5 bpm vs Gen 1!',
      },
      {
        stepNumber: 2,
        title: 'The Indirect Network Bridge',
        description:
          'Because a subject cannot wear Gen 1, Gen 2, Gen 3, and ECG simultaneously on two wrists, indirect contrasts link Gen 3 to Gen 1 with pooled standard errors: SE_3-1 = √(SE_3-2² + SE_2-1²).',
      },
      {
        stepNumber: 3,
        title: 'Reference Standard Drift Canaries',
        description:
          'The drift canary monitors whether laboratory reference standards (ECG electrodes, metabolic carts, CO-Oximeters) or demographic distributions shifted between trial years, ensuring multi-year integrity.',
        callout: 'Longitudinal Architecture: Multi-Generation Transitive Predecessor Bridge & Longitudinal Drift Tracking.',
      },
    ],
  },
];
