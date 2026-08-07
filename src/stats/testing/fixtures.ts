import specialFixture from '../__fixtures__/special.json';
import normalFixture from '../__fixtures__/normal.json';
import studentTFixture from '../__fixtures__/studentT.json';
import halfNormalFixture from '../__fixtures__/halfNormal.json';
import poissonFixture from '../__fixtures__/poisson.json';
import nonCentralTFixture from '../__fixtures__/nonCentralT.json';
import modulesFixture from '../__fixtures__/modules.json';

export {
  specialFixture,
  normalFixture,
  studentTFixture,
  halfNormalFixture,
  poissonFixture,
  nonCentralTFixture,
  modulesFixture,
};

/**
 * Non-central t CDF grid, split by whether SciPy produced an answer at all.
 *
 * The JSON holds every grid point in grid order with `want: null` where SciPy's
 * Cephes routine gave up. Splitting here rather than in the generator is what
 * keeps the file's shape identical on every platform: where SciPy surrenders
 * moves between Windows and Linux, and when that decided which of two arrays a
 * point landed in, one boundary point shifting cascaded into thousands of
 * mismatches comparing unrelated grid points.
 */
export interface NctCdfCase {
  x: number;
  df: number;
  nc: number;
  want: number | null;
  want_approx?: number;
}

const nctCdfGrid: readonly NctCdfCase[] = nonCentralTFixture.cdf;

/** Points SciPy answered — graded against it. */
export const nctGradedCdf: readonly (NctCdfCase & { want: number })[] =
  nctCdfGrid.filter((c): c is NctCdfCase & { want: number } => c.want !== null);

/** Points SciPy declined — no golden value exists, so only sanity is asserted. */
export const nctScipyNanCdf: readonly NctCdfCase[] = nctCdfGrid.filter(
  (c) => c.want === null,
);

/**
 * Assert `got` matches SciPy's `want` to `tolerance` *relative* error, falling
 * back to absolute error near zero.
 *
 * Relative rather than absolute is the important part. `toBeCloseTo(x, 10)` is
 * an absolute check, so it passes trivially for a tail probability of 1e-12
 * no matter how wrong the value is — exactly the region where a hand-rolled
 * distribution is most likely to be broken.
 */
export function relativeError(got: number, want: number): number {
  if (want === got) return 0;
  const scale = Math.abs(want);
  if (scale < 1e-300) return Math.abs(got - want);
  return Math.abs(got - want) / scale;
}

export interface Mismatch {
  label: string;
  got: number;
  want: number;
  error: number;
}

/**
 * Check a whole fixture grid at once and report the worst offenders.
 *
 * Returning every failure rather than throwing on the first one matters when
 * porting a distribution: "83 of 2160 cases fail, all with df=1" localises the
 * bug immediately, where "the first case failed" says almost nothing.
 *
 * `absoluteTolerance` exists for algorithms that are accurate in absolute but
 * not relative terms — the non-central t is the case here. AS 243 builds its
 * answer by repeatedly subtracting O(1) quantities, so it carries a roundoff
 * floor of around 1e-15 in absolute terms. Where the true probability is 1e-77
 * that floor is a relative error of 1e62, and demanding relative accuracy there
 * would be demanding something the algorithm cannot deliver and the application
 * does not need. Passing an absolute tolerance is a deliberate, documented
 * statement about which regions are graded how — not a way to make a failing
 * test go quiet. A case passes if it meets *either* bound (the numpy.allclose
 * convention).
 */
export function checkGrid<T>(
  cases: readonly T[],
  compute: (testCase: T) => { got: number; want: number; label: string },
  tolerance: number,
  absoluteTolerance = 0,
): Mismatch[] {
  const mismatches: Mismatch[] = [];
  for (const testCase of cases) {
    const { got, want, label } = compute(testCase);
    const error = relativeError(got, want);
    const withinAbsolute =
      absoluteTolerance > 0 && Math.abs(got - want) <= absoluteTolerance;
    if (!(error <= tolerance) && !withinAbsolute) {
      mismatches.push({ label, got, want, error });
    }
  }
  return mismatches.sort((a, b) => b.error - a.error);
}

export function formatMismatches(mismatches: readonly Mismatch[], show = 8): string {
  const head = mismatches
    .slice(0, show)
    .map(
      (m) =>
        `  ${m.label}: got ${m.got.toExponential(12)} want ${m.want.toExponential(
          12,
        )} (rel err ${m.error.toExponential(3)})`,
    )
    .join('\n');
  const more =
    mismatches.length > show ? `\n  ...and ${mismatches.length - show} more` : '';
  return `${mismatches.length} mismatch(es):\n${head}${more}`;
}
