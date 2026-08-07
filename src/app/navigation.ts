/**
 * One list of routes, consumed by both the nav bar and the home page's module
 * cards. Keeping it here means a new module can never appear in one place and
 * be missing from the other.
 *
 * `status` drives whether a card is a live link or a labelled placeholder, so
 * the app is honest about what is finished at any point in the build.
 */
export type ModuleStatus = 'ready' | 'planned';

export interface ModuleRoute {
  path: string;
  /** Short label for the nav bar. */
  label: string;
  /** Full name for cards and page headings. */
  title: string;
  blurb: string;
  status: ModuleStatus;
  /** Present in the top nav (explainers live under a single entry). */
  inNav: boolean;
}

export const MODULE_ROUTES: ModuleRoute[] = [
  {
    path: '/precision',
    label: 'Precision',
    title: 'Precision vs sample size',
    blurb:
      'How tightly can you pin down bias, limits of agreement, and error percentiles at a given n? The core chart.',
    status: 'ready',
    inNav: true,
  },
  {
    path: '/agreement',
    label: 'Agreement',
    title: 'Sample size for agreement',
    blurb:
      'Set an accuracy threshold as a fraction of measurement SD and solve for the n that meets it. Includes an equivalence test.',
    status: 'ready',
    inNav: true,
  },
  {
    path: '/demographics',
    label: 'Demographics',
    title: 'Demographic segment planner',
    blurb:
      'Minimum and maximum subjects per segment. Capping the maximum is what makes the minimum reachable.',
    status: 'ready',
    inNav: true,
  },
  {
    path: '/timeline',
    label: 'Timeline',
    title: 'Study timeline simulator',
    blurb:
      'Monte Carlo over each study phase, with a distribution choice per phase rather than one forced shape.',
    status: 'ready',
    inNav: true,
  },
  {
    path: '/effect-size',
    label: 'Effect size',
    title: 'Effect size confidence intervals',
    blurb:
      "Cohen's d intervals from the non-central t distribution, not a normal approximation.",
    status: 'ready',
    inNav: true,
  },
];

export const EXPLAINER_ROUTES: ModuleRoute[] = [
  {
    path: '/explainers/rmse-mae',
    label: 'RMSE & MAE',
    title: 'Misled by RMSE and MAE',
    blurb:
      'Device errors are heavy-tailed. Two distributions with identical RMSE can put wildly different proportions of users inside it.',
    status: 'ready',
    inNav: false,
  },
  {
    path: '/explainers/agreement-vs-icc',
    label: 'Agreement vs ICC',
    title: 'Agreement is not ICC',
    blurb:
      'Two datasets with identical paired differences, ICC 0.20 and 0.99. ICC is hostage to between-subject variance.',
    status: 'ready',
    inNav: false,
  },
];
