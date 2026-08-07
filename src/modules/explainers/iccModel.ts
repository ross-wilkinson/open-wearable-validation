/**
 * Explainer — agreement vs ICC.
 *
 * The thesis: two datasets can have *identical* paired differences and produce
 * wildly different ICCs, because the ICC is a ratio of between-subject variance
 * to total variance. Recruit a wider range of subjects and the ICC rises
 * without the measurement getting one bit more accurate.
 *
 * ICC is computed here directly from mean squares rather than through a general
 * ANOVA engine. For a two-rater, n-subject design with no replication the
 * interaction term *is* the residual, which collapses the arithmetic to
 * something short enough to read.
 */

export interface IccInput {
  /** Paired measurements: device and reference, in subject order. */
  device: readonly number[];
  reference: readonly number[];
}

export interface IccResult {
  n: number;
  /** Device minus reference, per subject. */
  differences: number[];
  bias: number;
  sdDifference: number;
  loaLower: number;
  loaUpper: number;
  /** Mean square between targets (subjects). */
  msBetween: number;
  /** Mean square between raters (devices). */
  msRaters: number;
  /** Residual mean square. */
  msError: number;
  /** ICC(2,1) — single random raters, absolute agreement. */
  icc2: number;
  /** ICC(3,1) — single fixed raters, consistency. */
  icc3: number;
  /** SD of the subject means: the between-subject spread the ICC is hostage to. */
  betweenSubjectSd: number;
}

export function computeIcc(input: IccInput): IccResult | null {
  const { device, reference } = input;
  const n = device.length;
  if (n < 2 || reference.length !== n) return null;
  if (![...device, ...reference].every(Number.isFinite)) return null;

  const k = 2; // two raters: the device and the reference
  const ratings = [device, reference];

  const grand = (sum(device) + sum(reference)) / (k * n);
  const targetMeans = device.map((value, i) => (value + reference[i]!) / 2);
  const raterMeans = ratings.map((row) => sum(row) / n);

  const ssBetween = k * sum(targetMeans.map((m) => (m - grand) ** 2));
  const ssRaters = n * sum(raterMeans.map((m) => (m - grand) ** 2));

  let ssError = 0;
  for (let r = 0; r < k; r += 1) {
    for (let i = 0; i < n; i += 1) {
      ssError += (ratings[r]![i]! - raterMeans[r]! - targetMeans[i]! + grand) ** 2;
    }
  }

  const msBetween = ssBetween / (n - 1);
  const msRaters = ssRaters / (k - 1);
  const msError = ssError / ((n - 1) * (k - 1));

  const differences = device.map((value, i) => value - reference[i]!);
  const bias = sum(differences) / n;
  const sdDifference = Math.sqrt(
    sum(differences.map((value) => (value - bias) ** 2)) / (n - 1),
  );

  const denominator2 =
    msBetween + (k - 1) * msError + (k * (msRaters - msError)) / n;

  return {
    n,
    differences,
    bias,
    sdDifference,
    loaLower: bias - 1.959963984540054 * sdDifference,
    loaUpper: bias + 1.959963984540054 * sdDifference,
    msBetween,
    msRaters,
    msError,
    icc2: denominator2 === 0 ? Number.NaN : (msBetween - msError) / denominator2,
    icc3:
      msBetween + (k - 1) * msError === 0
        ? Number.NaN
        : (msBetween - msError) / (msBetween + (k - 1) * msError),
    betweenSubjectSd: Math.sqrt(
      sum(targetMeans.map((m) => (m - grand) ** 2)) / (n - 1),
    ),
  };
}

function sum(values: readonly number[]): number {
  let total = 0;
  for (const value of values) total += value;
  return total;
}

/**
 * The notebook's two datasets. Blood pressure in mmHg, five subjects.
 *
 * The differences are byte-for-byte identical between them: [-5, 5, 0, 0, 0].
 * Only the spread of the subjects changes.
 */
export const ICC_DATASETS = {
  narrow: {
    id: 'narrow',
    label: 'Narrow subject range',
    description:
      'Five subjects whose true blood pressure barely differs — 90 to 95 mmHg.',
    device: [90, 95, 90, 95, 90],
    reference: [95, 90, 90, 95, 90],
  },
  wide: {
    id: 'wide',
    label: 'Wide subject range',
    description:
      'The same measurement errors, on subjects spanning 70 to 125 mmHg.',
    device: [120, 95, 80, 75, 70],
    reference: [125, 90, 80, 75, 70],
  },
} as const;

export type IccDatasetId = keyof typeof ICC_DATASETS;
