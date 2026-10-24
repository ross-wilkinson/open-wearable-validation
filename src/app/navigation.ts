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
];
