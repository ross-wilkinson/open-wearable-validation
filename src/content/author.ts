/**
 * Single source of truth for author attribution.
 *
 * Bio claims are stated in the past tense and kept to what is independently
 * verifiable from the publication record and the author's own account. Nothing
 * here is inferred or embellished — if a detail is not confirmed, it does not
 * appear.
 */
export const AUTHOR = {
  name: 'Ross D. Wilkinson, PhD',
  title: 'Validation Research Scientist & Software Engineer',
  scholarUrl: 'https://scholar.google.com/citations?user=y39yme4AAAAJ&hl=en',
  githubUrl: 'https://github.com/ross-wilkinson',
  shortBio:
    'Validation researcher and software engineer. Former Research Scientist at Google (3.5 yrs) supporting the Pixel Watch team on clinical validation protocols and statistical analyses for 2 FDA regulatory submissions and 15+ health algorithms across sleep, heart rate, and SpO2.',
  credentialLine:
    'The tools in this suite originated from working notebooks written for wearable validation studies, ported into open client-side TypeScript and Python to provide reliable statistical alternatives to spreadsheets.',
  extendedBio:
    'Ross D. Wilkinson, PhD, is a validation researcher and software engineer. He completed his doctorate in Neuromechanics at The University of Queensland and postdoctoral work at the University of Colorado Boulder in partnership with Specialized Bicycle Components. Across 3.5 years as a Research Scientist at Google, he collaborated on physiological algorithm validation for Pixel Watch, conducting statistical analyses for 2 FDA regulatory submissions (Irregular Rhythm Notification and Blood Oxygen Variation), contributing to Sleep Stages accuracy improvements, and structuring demographic quota allocations across the Monk Skin Tone Scale. This toolkit represents an open-science effort to make those validation methods accessible without server overhead or commercial lock-in.',
  keyAchievements: [
    'Validated 15+ Pixel Watch algorithms across sleep, optical PPG heart rate, SpO2, and irregular rhythm detection.',
    'Authored statistical analyses and documentation for 2 FDA regulatory submissions (Irregular Rhythm Notification, Blood Oxygen Variation).',
    'Contributed to a 17% Sleep Stages algorithm gain and substantiated clinical validation claims.',
    'Formulated balanced demographic quota systems across the Monk Skin Tone Scale and age cohorts.',
    'Engineered open-source testing frameworks reducing validation analysis turnaround times.',
  ],
  publications: [
    {
      title: 'Rethinking the Statistical Analysis of Neuromechanical Data',
      journal: 'Exercise and Sport Sciences Reviews',
      year: 2023,
      role: 'First Author',
      description:
        'Foundational methods paper advocating linear mixed-effects models and variance decomposition for human data with repeated measures, individual differences, and unbalanced designs.',
    },
    {
      title: 'Evaluation of an IMU-Based Approach for Centre of Mass Movement',
      journal: 'Journal of Biomechanics',
      year: 2021,
      role: 'First Author',
      description:
        'Wearable IMU biomechanics validation study comparing wearable sensor algorithms against multi-camera laboratory motion capture ground truth.',
    },
  ],
  certifications: [
    'Good Clinical Practice (ICH GCP) Certificate — NIDA Clinical Trials Network',
  ],
  statisticalTrapsPrevented: [
    {
      id: 'pseudoreplication',
      title: 'Pseudoreplication in Repeated Measures',
      summary:
        'Treating clustered observations from the same subject as independent, underestimating required sample sizes by 40–70% and invalidating regulatory submissions.',
      route: '/repeated-measures',
      routeLabel: 'Repeated Measures Designer',
    },
    {
      id: 'gpower-fallacy',
      title: 'The G*Power Hypothesis-Testing Fallacy',
      summary:
        'Sizing studies to detect differences (t-tests, ANOVA) rather than demonstrating clinical agreement and equivalence (Bland–Altman LoA, RMSE, error bounds).',
      route: '/agreement',
      routeLabel: 'Agreement & Equivalence Sizing',
    },
    {
      id: 'ai-hallucinations',
      title: 'Generic AI & LLM Statistical Hallucinations',
      summary:
        'Relying on generic AI tools that hallucinate formulas or suggest textbook asymptotic shortcuts (1.96√(3/n)) that fail in small-sample or clustered regimes.',
      route: '/precision',
      routeLabel: 'Exact Precision Bounds',
    },
    {
      id: 'winners-curse',
      title: "The Rapid Prototyping Winner's Curse",
      summary:
        'Treating N=5 pilot screens as ranking tools to crown a winning prototype, when small-sample noise dominates true signal.',
      route: '/explainers/sniff-test',
      routeLabel: 'Sniff Test Explainer',
    },
    {
      id: 'spreadsheet-fragility',
      title: 'Spreadsheet Fragility & Silent Cell Errors',
      summary:
        'Executing complex non-linear root-finding, variance decompositions (one-way random-effects ANOVA), or Monte Carlo timelines in Excel without test coverage or audit trails.',
      route: '/report-studio',
      routeLabel: 'Validation Report Studio',
    },
  ],
} as const;
