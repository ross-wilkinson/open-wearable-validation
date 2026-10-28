/**
 * One list of routes, consumed by both the nav bar and the home page's module
 * cards. Keeping it here means a new module can never appear in one place and
 * be missing from the other.
 *
 * `status` drives whether a card is a live link or a labelled placeholder, so
 * the app is honest about what is finished at any point in the build.
 *
 * Titles are the *question the user arrived with*, not the statistic that
 * answers it. Someone sizing a validation study is thinking "how many people do
 * I need", not "limits-of-agreement precision inversion" — and a person who
 * does think in those terms is served by `method`, which keeps every module
 * findable by its proper name without making that the headline.
 *
 * Order follows the journey rather than the build history: how many, then how
 * precise, then who, then how long.
 */
export type ModuleStatus = 'ready' | 'planned';

export interface ModuleRoute {
  path: string;
  /** Short label for the nav bar. */
  label: string;
  /** The user's question — the page heading and card title. */
  title: string;
  /** The statistical method, so experts can still find it by name. */
  method: string;
  /** What you get, and what decision it informs. */
  blurb: string;
  status: ModuleStatus;
  /** Present in the top nav (explainers live under a single entry). */
  inNav: boolean;
}

export const MODULE_ROUTES: ModuleRoute[] = [
  {
    path: '/reference-devices',
    label: 'Reference standards',
    title: 'Which reference standard should I validate against?',
    method: 'Reference device selection, predicate chains & measurement error allocation',
    blurb:
      'Explore Gold, Silver, and Bronze reference standards across 12 biometric domains. Evaluate FDA 510(k) predicates, data pipeline friction, hardware sync triggers, and sample size inflation from reference noise.',
    status: 'ready',
    inNav: true,
  },
  {
    path: '/agreement',
    label: 'Sample size',
    title: 'How many participants do I need?',
    method: 'Sample size for a limits-of-agreement threshold',
    blurb:
      'Set the accuracy your device has to demonstrate and get the number of participants that demonstrates it, including an equivalence test for non-inferiority claims.',
    status: 'ready',
    inNav: true,
  },
  {
    path: '/repeated-measures',
    label: 'Repeated measures',
    title: 'How many subjects and replicates do I need?',
    method: 'Within-subject repeated measures & variance decomposition',
    blurb:
      'Account for clustering in paired designs: trade off participants vs replicates, decompose variance, and compute effective sample size and limits-of-agreement precision.',
    status: 'ready',
    inNav: true,
  },
  {
    path: '/precision',
    label: 'Precision',
    title: 'How precise will my study be?',
    method: 'Bias, limits of agreement, and error percentiles against n',
    blurb:
      'Already fixed on a sample size, or capped by budget? See how tightly you can pin down bias, limits of agreement, and 95th-percentile error before you commit to it.',
    status: 'ready',
    inNav: true,
  },
  {
    path: '/demographics',
    label: 'Recruitment',
    title: 'Who do I need to recruit?',
    method: 'Demographic segment planner',
    blurb:
      'Turn a total sample size into a recruitment target per sex, age band, or skin tone — and find out before you start whether the target is reachable at all.',
    status: 'ready',
    inNav: true,
  },
  {
    path: '/timeline',
    label: 'Timeline',
    title: 'How long will it take?',
    method: 'Study duration Monte Carlo',
    blurb:
      'Simulate recruitment, collection, and analysis phase by phase to get a completion date with a confidence interval attached, rather than a single optimistic guess.',
    status: 'ready',
    inNav: true,
  },
  {
    path: '/effect-size',
    label: 'Effect size',
    title: 'How big is the effect, and how sure am I?',
    method: "Cohen's d confidence intervals from the non-central t",
    blurb:
      "Report Cohen's d with an interval that stays honest at small n, where the normal approximation most tools use drifts.",
    status: 'ready',
    inNav: true,
  },
  {
    path: '/report-studio',
    label: 'Report studio',
    title: 'How do I present and report validation findings?',
    method: 'Executive scorecard, Bland-Altman clusters & survival of error',
    blurb:
      'Empower cross-functional stakeholders with clinical tolerance scorecards, hierarchical variance decomposition, Bland-Altman agreement with subject clusters, and survival-type absolute error distributions.',
    status: 'ready',
    inNav: true,
  },
  {
    path: '/chance-kpi',
    label: 'Pass by chance?',
    title: 'Did we pass our KPIs by chance?',
    method: 'Permutation null distribution & Preiss–Fisher separation index',
    blurb:
      'Test whether passing a KPI was genuine or an artifact of narrow reference dynamic range. Randomly mispair 10,000 times to uncover false-pass hazards and find defensible 5% KPI thresholds.',
    status: 'ready',
    inNav: true,
  },
];

export const EXPLAINER_ROUTES: ModuleRoute[] = [
  {
    path: '/explainers/rmse-mae',
    label: 'RMSE & MAE',
    title: 'Misled by RMSE and MAE',
    method: 'Heavy-tailed error distributions',
    blurb:
      'Device errors are heavy-tailed. Two distributions with identical RMSE can put wildly different proportions of your users inside it.',
    status: 'ready',
    inNav: false,
  },
  {
    path: '/explainers/agreement-vs-icc',
    label: 'Agreement vs ICC',
    title: 'Agreement is not ICC',
    method: 'Intraclass correlation and between-subject variance',
    blurb:
      'Two datasets with identical paired differences, ICC 0.20 and 0.99. A high ICC can be bought by recruiting a wider range of subjects.',
    status: 'ready',
    inNav: false,
  },
  {
    path: '/explainers/sniff-test',
    label: 'N=5 Sniff Test',
    title: 'The Sniff Test Trap',
    method: "Winner's curse and elimination power in rapid prototyping",
    blurb:
      'An N=5 screen cannot pick a winner out of noise — the apparent winner is usually just lucky noise. But it can reliably eliminate catastrophic losers.',
    status: 'ready',
    inNav: false,
  },
];

export interface PlatformPillar {
  id: string;
  number: number;
  name: string;
  eyebrow: string;
  tagline: string;
  description: string;
  path: string;
  workspaces?: string[];
}

export const PLATFORM_PILLARS: PlatformPillar[] = [
  {
    id: 'validation-academy',
    number: 1,
    name: 'The Validation Academy',
    eyebrow: 'PILLAR 01',
    tagline: 'Interactive Wearable Validation Studios',
    description:
      'The central web suite hosting 4 specialized workspaces: Learning Studio, Protocol Studio, Report Studio, and Pitfall Explorer.',
    path: '/academy',
    workspaces: ['Learning Studio', 'Protocol Studio', 'Report Studio', 'Pitfall Explorer'],
  },
  {
    id: 'agreekit',
    number: 2,
    name: 'agreekit',
    eyebrow: 'PILLAR 02',
    tagline: 'Python Agreement Engine, CLI & MCP Server',
    description:
      'An open-source Python engine for exact measurement agreement, Bland-Altman variance decompositions, and non-inferiority testing.',
    path: '/agreekit',
  },
  {
    id: 'health-data-catalog',
    number: 3,
    name: 'Health Data Catalog',
    eyebrow: 'PILLAR 03',
    tagline: 'CDC NHANES & SCIN Population Reference Baselines',
    description:
      'Reference distributions across diverse subject demographics and health measures to establish realistic baselines before protocol authoring.',
    path: '/health-data-distributions',
  },
  {
    id: 'reference-device-catalog',
    number: 4,
    name: 'Reference Device Catalog',
    eyebrow: 'PILLAR 04',
    tagline: 'Clinical Gold Standards & 510(k) Predicates',
    description:
      'Comprehensive 10-dimension comparator profiles across 12 biometric domains evaluating FDA 510(k) predicates and sample size inflation from reference noise.',
    path: '/reference-device-catalog',
  },
];

export interface AcademyStudio {
  id: string;
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  path: string;
}

export const ACADEMY_STUDIOS: AcademyStudio[] = [
  {
    id: 'learning-studio',
    name: 'Learning Studio',
    eyebrow: 'LEARNING STUDIO',
    title: 'Meridian PulseBand 2 Case Study',
    description:
      'Fictional product journey across 8 interactive modules spanning prototyping, launch gates, and multi-year lifecycle audits.',
    path: '/academy',
  },
  {
    id: 'protocol-studio',
    name: 'Protocol Studio',
    eyebrow: 'PROTOCOL STUDIO',
    title: 'Study Design & Sample Sizing',
    description:
      'Design protocols with limits-of-agreement precision, repeated measures ANOVA, demographic quotas, and Monte Carlo timelines.',
    path: '/protocol-studio',
  },
  {
    id: 'report-studio',
    name: 'Report Studio',
    eyebrow: 'REPORT STUDIO',
    title: 'Decision Scorecards & Launch Gates',
    description:
      'Synthesize results into clinical tolerance scorecards, bivariate launch gates, and hierarchical variance breakdowns.',
    path: '/report-studio/overview',
  },
  {
    id: 'pitfall-explorer',
    name: 'Pitfall Explorer',
    eyebrow: 'PITFALL EXPLORER',
    title: 'Statistical Hazard Explainers',
    description:
      'Interactive explainers on why generic difference tests, unadjusted p-values, and naive correlations fail on paired wearable data.',
    path: '/explainers',
  },
];
