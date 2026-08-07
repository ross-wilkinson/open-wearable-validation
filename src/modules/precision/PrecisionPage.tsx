import { useMemo, useState } from 'react';
import ModulePage from '../../components/common/ModulePage.tsx';
import NumberField from '../../components/common/NumberField.tsx';
import SelectField from '../../components/common/SelectField.tsx';
import ChartLegend from '../../components/common/ChartLegend.tsx';
import DataTable from '../../components/common/DataTable.tsx';
import type { TableColumn } from '../../components/common/DataTable.tsx';
import { seriesColor } from '../../styles/chartTheme.ts';
import PrecisionChart from './PrecisionChart.tsx';
import {
  DEFAULT_PRECISION_OPTIONS,
  precisionCurve,
  precisionSeries,
  sampleSizeForTarget,
  type PrecisionPoint,
} from './precisionModel.ts';

const CONFIDENCE_OPTIONS = [
  { value: '0.9', label: '90%' },
  { value: '0.95', label: '95%' },
  { value: '0.99', label: '99%' },
] as const;

const LOA_OPTIONS = [
  { value: '1.6448536269514722', label: '90% (±1.64 SD)' },
  { value: '1.959963984540054', label: '95% (±1.96 SD)' },
  { value: '2.5758293035489004', label: '99% (±2.58 SD)' },
] as const;

const PERCENTILE_CHOICES = [0.5, 0.68, 0.9, 0.95] as const;

export default function PrecisionPage() {
  const [confidence, setConfidence] = useState('0.95');
  const [loaMultiplier, setLoaMultiplier] = useState('1.959963984540054');
  const [percentiles, setPercentiles] = useState<number[]>([0.5, 0.9]);
  const [maxN, setMaxN] = useState(200);
  const [selectedN, setSelectedN] = useState(64);
  const [target, setTarget] = useState(0.25);

  const options = useMemo(
    () => ({
      ...DEFAULT_PRECISION_OPTIONS,
      confidence: Number(confidence),
      loaMultiplier: Number(loaMultiplier),
      percentiles: [...percentiles].sort((a, b) => a - b),
      maxN: Math.max(10, Math.min(2000, maxN)),
    }),
    [confidence, loaMultiplier, percentiles, maxN],
  );

  // Derived, memoised — never stored as its own state. A second copy of the
  // answer is a second thing that can go stale.
  const series = useMemo(() => precisionSeries(options), [options]);
  const curve = useMemo(() => precisionCurve(options), [options]);

  const clampedN = Math.min(Math.max(selectedN, options.minN), options.maxN);
  const atSelected = useMemo(
    () => curve.find((point) => point.n === clampedN),
    [curve, clampedN],
  );

  const requiredN = useMemo(
    () =>
      series.map((entry) => ({
        ...entry,
        n: sampleSizeForTarget(target, entry.key, options),
      })),
    [series, target, options],
  );

  const columns: TableColumn<PrecisionPoint>[] = useMemo(
    () => [
      { key: 'n', header: 'n', render: (row) => String(row.n), numeric: true },
      ...series.map((entry) => ({
        key: entry.key,
        header: entry.label,
        numeric: true,
        render: (row: PrecisionPoint) => {
          const value = row[entry.key];
          return typeof value === 'number' ? `±${value.toFixed(3)}` : '—';
        },
      })),
    ],
    [series],
  );

  function togglePercentile(p: number) {
    setPercentiles((current) =>
      current.includes(p)
        ? current.filter((value) => value !== p)
        : [...current, p].sort((a, b) => a - b),
    );
  }

  return (
    <ModulePage
      title="How precise will my study be?"
      method="Bias, limits of agreement, and error percentiles against n"
      intro={
        <>
          <p>
            If your sample size is already fixed — by budget, by a cohort you have, or
            by a number someone else chose — this shows what that n actually buys you,
            before you commit to it.
          </p>
          <p>
            A validation report quotes bias, limits of agreement, and error
            percentiles, and those do not converge at the same rate. Studies are
            routinely sized on the bias, which is the <em>easiest</em> of them to pin
            down; the limits of agreement and the 95th percentile need substantially
            more people to reach the same precision.
          </p>
          <p>
            Margins are in units of the measurement SD, so this applies whatever you
            are measuring: a margin of 0.25 means a quarter of a standard deviation.
          </p>
        </>
      }
      assumption={
        <>
          the measurement differences are approximately normal and independent across
          participants. Repeated measurements on the same person are not independent —
          if your design has those, the effective sample size is smaller than the
          number of recordings.
        </>
      }
      methodNotes={
        <>
          <p>
            The bias margin is the standard error of a mean,{' '}
            <code className="tabular text-ink">t(1−α/2, n−1) / √n</code>. Each limit of
            agreement carries the extra uncertainty of the SD it is built from:{' '}
            <code className="tabular text-ink">
              t(1−α/2, n−1) × √(1/n + k²/(2(n−1)))
            </code>
            , which is why the limits converge more slowly than the bias.
          </p>
          <p>
            Percentile margins use the asymptotic variance of a sample quantile,{' '}
            <code className="tabular text-ink">p(1−p) / (n · f(x_p)²)</code>, with the
            density evaluated at the quantile of the half-normal — the distribution of
            absolute error when the error itself is normal. The 95th percentile is the
            hardest of all to pin down, because the density is smallest in the tail and
            it sits in the denominator.
          </p>
        </>
      }
      controls={
        <>
          <SelectField
            label="Confidence level"
            value={confidence}
            options={CONFIDENCE_OPTIONS}
            onChange={setConfidence}
            hint="Confidence for the margin of error around each estimate."
          />
          <SelectField
            label="Limits of agreement"
            value={loaMultiplier}
            options={LOA_OPTIONS}
            onChange={setLoaMultiplier}
            hint="How wide the limits themselves are. Separate from the confidence level above — these are two different things."
          />

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-ink-secondary">
              Error percentiles
            </legend>
            <div className="flex flex-wrap gap-2">
              {PERCENTILE_CHOICES.map((p) => {
                const active = percentiles.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={active}
                    onClick={() => togglePercentile(p)}
                    className={`rounded-md border px-2.5 py-1 text-sm transition-colors ${
                      active
                        ? 'border-series-1 bg-series-1/10 text-series-1'
                        : 'border-hairline text-ink-secondary hover:bg-ink/5'
                    }`}
                  >
                    P{Math.round(p * 100)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <NumberField
            label="Largest n to plot"
            value={maxN}
            onChange={setMaxN}
            min={10}
            max={2000}
            step={10}
          />
          <NumberField
            label="Inspect at n ="
            value={selectedN}
            onChange={setSelectedN}
            min={options.minN}
            max={options.maxN}
            step={1}
          />
          <NumberField
            label="Target margin"
            value={target}
            onChange={setTarget}
            min={0.01}
            max={5}
            step={0.05}
            suffix="SD"
            hint="The precision you need. The table below solves for the n that reaches it."
          />
        </>
      }
    >
      <section className="rounded-xl border border-hairline bg-surface p-5">
        <div className="mb-4">
          <ChartLegend entries={series} />
        </div>
        <PrecisionChart
          data={curve}
          series={series}
          selectedN={clampedN}
          target={target > 0 ? target : null}
        />
      </section>

      <section aria-labelledby="at-selected-n">
        <h2
          id="at-selected-n"
          className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
        >
          At n = {clampedN}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {series.map((entry) => {
            const value = atSelected?.[entry.key];
            return (
              <div
                key={entry.key}
                className="rounded-xl border border-hairline bg-surface p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-0.5 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: seriesColor(entry.colorSlot) }}
                  />
                  <p className="text-xs font-medium text-ink-muted">{entry.label}</p>
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  ±{typeof value === 'number' ? value.toFixed(3) : '—'}
                  <span className="ml-1 text-sm font-normal text-ink-muted">SD</span>
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="subjects-needed">
        <h2
          id="subjects-needed"
          className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
        >
          Subjects needed for a ±{target} SD margin
        </h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-hairline bg-surface">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Subjects needed to reach the target margin
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="border-b border-hairline px-4 py-2 text-left font-medium text-ink-muted"
                >
                  Estimand
                </th>
                <th
                  scope="col"
                  className="border-b border-hairline px-4 py-2 text-right font-medium text-ink-muted"
                >
                  Subjects needed
                </th>
              </tr>
            </thead>
            <tbody>
              {requiredN.map((entry) => (
                <tr key={entry.key} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-0.5 w-4 shrink-0 rounded-full"
                        style={{ backgroundColor: seriesColor(entry.colorSlot) }}
                      />
                      {entry.label}
                    </span>
                  </td>
                  <td className="tabular px-4 py-2 text-right font-medium">
                    {entry.n ?? `more than ${options.maxN}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Read the spread in this column: sizing on the bias alone routinely leaves the
          limits of agreement and upper percentiles far less certain than the report
          implies.
        </p>
      </section>

      <DataTable
        caption="All values"
        columns={columns}
        rows={curve}
        rowKey={(row) => row.n}
      />

      <section className="max-w-3xl text-sm leading-relaxed text-ink-secondary">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Method
        </h2>
        <p className="mt-3">
          The bias margin is the familiar{' '}
          <code className="tabular text-ink">t × σ/√n</code>. The limits of agreement
          combine uncertainty in both the mean and the SD:{' '}
          <code className="tabular text-ink">t × σ√(1/n + k²/(2(n−1)))</code>, following
          Bland &amp; Altman.
        </p>
        <p className="mt-3">
          Percentile margins use the asymptotic variance of a sample quantile,{' '}
          <code className="tabular text-ink">p(1−p) / (n·f(x_p)²)</code>, with{' '}
          <code className="tabular text-ink">f</code> the half-normal density — the
          distribution of absolute error when the error itself is normal. That density
          goes to zero in the tail, which is why the margin around an extreme percentile
          grows without bound: no sample size rescues a P99 estimate from a small study,
          and the curve says so.
        </p>
      </section>
    </ModulePage>
  );
}
