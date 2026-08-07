import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AXIS_LABEL, AXIS_TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import { AUTHOR } from '../../content/author.ts';
import { ICC_DATASETS, computeIcc, type IccDatasetId } from './iccModel.ts';

export default function IccExplainerPage() {
  const [datasetId, setDatasetId] = useState<IccDatasetId>('narrow');
  const dataset = ICC_DATASETS[datasetId];

  // Both datasets are computed once, unconditionally. The page is a comparison,
  // so it needs both whichever is selected — and the inputs are literal
  // constants, so the non-null assertions here cannot fire.
  const narrow = useMemo(() => computeIcc(ICC_DATASETS.narrow)!, []);
  const wide = useMemo(() => computeIcc(ICC_DATASETS.wide)!, []);
  const result = datasetId === 'narrow' ? narrow : wide;
  const other = datasetId === 'narrow' ? wide : narrow;

  const blandAltman = useMemo(
    () =>
      dataset.device.map((value, index) => ({
        mean: (value + dataset.reference[index]!) / 2,
        difference: result.differences[index]!,
      })),
    [dataset, result],
  );

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <p className="text-sm font-medium text-series-1">Explainer</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Agreement is not ICC
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          By{' '}
          <a
            href={AUTHOR.scholarUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-ink"
          >
            {AUTHOR.name}
          </a>
        </p>
      </header>

      <section className="flex flex-col gap-4 leading-relaxed text-ink-secondary">
        <p>
          The intraclass correlation coefficient is widely reported as evidence that a
          device agrees with a reference. It does not measure that. The ICC is a ratio
          of between-subject variance to total variance, which makes it a statement
          about the <em>subjects you recruited</em> at least as much as about the
          device.
        </p>
        <p>
          Here are two datasets. The measurement errors are byte-for-byte identical —{' '}
          <span className="tabular text-ink">[−5, +5, 0, 0, 0]</span> mmHg in both. Only
          the spread of the subjects changes. Switch between them and watch the ICC move
          while every agreement statistic stays exactly where it was.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(ICC_DATASETS) as IccDatasetId[]).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={datasetId === id}
            onClick={() => setDatasetId(id)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
              datasetId === id
                ? 'border-series-1 bg-series-1/10 text-series-1'
                : 'border-hairline text-ink-secondary hover:bg-ink/5'
            }`}
          >
            {ICC_DATASETS[id].label}
          </button>
        ))}
      </div>
      <p className="-mt-4 text-sm text-ink-muted">{dataset.description}</p>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-hairline bg-surface p-5">
          <p className="text-xs font-medium text-ink-muted">ICC(2,1) — this dataset</p>
          <p className="mt-1.5 text-3xl font-semibold">{result.icc2.toFixed(3)}</p>
          <p className="mt-1 text-xs text-ink-muted">
            The other dataset: {other.icc2.toFixed(3)}
          </p>
        </div>
        <div className="rounded-xl border border-hairline bg-surface p-5">
          <p className="text-xs font-medium text-ink-muted">
            Limits of agreement — <strong>both</strong> datasets
          </p>
          <p className="tabular mt-1.5 text-3xl font-semibold">
            {result.loaLower.toFixed(1)} to {result.loaUpper.toFixed(1)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            bias {result.bias.toFixed(1)}, SD of differences{' '}
            {result.sdDifference.toFixed(2)}
          </p>
        </div>
      </section>

      <section aria-labelledby="anova">
        <h2
          id="anova"
          className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
        >
          Where the difference comes from
        </h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-hairline bg-surface">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Mean squares and between-subject spread for both datasets
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="border-b border-hairline px-4 py-2 text-left font-medium text-ink-muted"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="border-b border-hairline px-4 py-2 text-right font-medium text-ink-muted"
                >
                  Narrow
                </th>
                <th
                  scope="col"
                  className="border-b border-hairline px-4 py-2 text-right font-medium text-ink-muted"
                >
                  Wide
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: 'Residual mean square (measurement error)',
                  narrow: narrow.msError,
                  wide: wide.msError,
                  same: true,
                },
                {
                  label: 'Between-subject mean square',
                  narrow: narrow.msBetween,
                  wide: wide.msBetween,
                  same: false,
                },
              ].map((row) => (
                <tr key={row.label} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-2">
                    {row.label}
                    {row.same && (
                      <span className="ml-2 rounded bg-good/10 px-1.5 py-0.5 text-xs text-good">
                        identical
                      </span>
                    )}
                  </td>
                  <td className="tabular px-4 py-2 text-right">
                    {row.narrow.toFixed(2)}
                  </td>
                  <td className="tabular px-4 py-2 text-right">
                    {row.wide.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          The measurement error is the same in both. The between-subject term is 100
          times larger in the wide dataset, and since the ICC is essentially their
          ratio, that alone moves it from 0.20 to 0.99.
        </p>
      </section>

      <section className="rounded-xl border border-hairline bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Bland–Altman — {dataset.label}
        </h2>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart // Right margin leaves room for the LoA labels, which otherwise
              // clip to "upp"/"low" at the plot edge.
              margin={{ top: 8, right: 84, bottom: 28, left: 8 }}
            >
              <CartesianGrid stroke={CHART.grid} />
              <XAxis
                type="number"
                dataKey="mean"
                domain={[60, 135]}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART.axis }}
                label={{
                  value: 'Mean of the two methods (mmHg)',
                  position: 'insideBottom',
                  offset: -16,
                  style: AXIS_LABEL,
                }}
              />
              <YAxis
                type="number"
                dataKey="difference"
                domain={[-12, 12]}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={56}
                label={{
                  value: 'Difference (mmHg)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 8,
                  style: { ...AXIS_LABEL, textAnchor: 'middle' },
                }}
              />
              <ReferenceLine y={result.bias} stroke={CHART.axis} />
              <ReferenceLine
                y={result.loaUpper}
                stroke={CHART.reference}
                strokeDasharray="4 4"
                label={{ value: 'upper LoA', position: 'right', style: AXIS_LABEL }}
              />
              <ReferenceLine
                y={result.loaLower}
                stroke={CHART.reference}
                strokeDasharray="4 4"
                label={{ value: 'lower LoA', position: 'right', style: AXIS_LABEL }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Scatter
                name="Subjects"
                data={blandAltman}
                fill={seriesColor(1)}
                isAnimationActive={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Switch datasets: the points slide horizontally, and the differences — the
          vertical axis, the part that is about the measurement — do not move at all.
        </p>
      </section>

      <section className="flex flex-col gap-4 leading-relaxed text-ink-secondary">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          What this means in practice
        </h2>
        <p>
          A high ICC can be bought by recruiting a wider range of subjects. If your
          validation cohort spans healthy 20-year-olds and hypertensive 70-year-olds,
          your ICC will look excellent regardless of how good the device is. Narrow the
          cohort to the population that will actually use it and the same device reports
          a poor ICC.
        </p>
        <p>
          Report bias and limits of agreement, or error percentiles. Those describe the
          measurement. If an ICC is required, state the between-subject spread of the
          sample alongside it, so the reader can tell how much of the number is the
          device and how much is the recruiting.
        </p>
      </section>
    </article>
  );
}
