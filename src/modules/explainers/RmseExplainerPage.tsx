import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import ChartLegend from '../../components/common/ChartLegend.tsx';
import { AXIS_LABEL, AXIS_TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import { AUTHOR } from '../../content/author.ts';
import { compareErrorMetrics } from './errorMetricsModel.ts';

const LEGEND = [
  { key: 'heavy', label: 'Heavy-tailed (Student t)', colorSlot: 1 },
  { key: 'normal', label: 'Normal, matched SD', colorSlot: 2 },
];

export default function RmseExplainerPage() {
  const [df, setDf] = useState(1.3);
  const result = useMemo(() => compareErrorMetrics(df, 10000, 42), [df]);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <p className="text-sm font-medium text-series-1">Explainer</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Misled by RMSE and MAE
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
          When assessing the accuracy of a device or algorithm, it is standard to report
          root-mean-square error or mean absolute error. Both assume, implicitly, that
          the errors are roughly normal.
        </p>
        <p>
          Real device errors are not. They are heavy-tailed: usually very small, and
          occasionally enormous. That pattern breaks the assumption these metrics rest
          on, and it does so in a way that is invisible if you only look at the number.
        </p>
        <p>
          Below are two error distributions with the <strong>same RMSE</strong> — a
          Student t, and a normal whose SD is matched to it. Move the slider and watch
          the RMSE stay put while the share of measurements actually falling inside it
          moves from about two-thirds to nearly everything.
        </p>
      </section>

      <section className="rounded-xl border border-hairline bg-surface p-5">
        <label
          htmlFor="df-slider"
          className="flex items-baseline justify-between text-sm font-medium text-ink-secondary"
        >
          <span>Degrees of freedom</span>
          <span className="tabular text-ink">{df.toFixed(1)}</span>
        </label>
        <input
          id="df-slider"
          type="range"
          min={1.1}
          max={30}
          step={0.1}
          value={df}
          onChange={(event) => setDf(Number(event.target.value))}
          className="mt-2 w-full accent-[var(--color-series-1)]"
        />
        <p className="mt-1 text-xs text-ink-muted">
          Lower means heavier tails. 1.3 is a realistic starting point — it is close to the
          error distributions observed in real health algorithms.
        </p>

        {result.varianceUndefined && (
          <p className="mt-4 flex gap-2 rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm leading-relaxed">
            <AlertTriangle
              size={16}
              aria-hidden
              className="mt-0.5 shrink-0 text-warning"
            />
            <span>
              At df ≤ 2 the population variance of a Student t{' '}
              <strong>does not exist</strong>. RMSE is not a noisy estimate of something
              here — it is estimating an undefined quantity, and it grows without bound
              as you collect more data. Any RMSE you compute is an artefact of the
              particular sample you happened to take.
            </span>
          </p>
        )}
      </section>

      <section aria-labelledby="metrics-table">
        <h2
          id="metrics-table"
          className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
        >
          The same RMSE, different meanings
        </h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-hairline bg-surface">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Error metrics for a heavy-tailed and a normal distribution with matched SD
            </caption>
            <thead>
              <tr>
                {['', 'RMSE', 'MAE', 'P50', 'P68', 'P95', '% within RMSE'].map(
                  (header) => (
                    <th
                      key={header}
                      scope="col"
                      className={`border-b border-hairline px-3 py-2 font-medium text-ink-muted ${
                        header === '' ? 'text-left' : 'text-right'
                      }`}
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Heavy-tailed', slot: 1, m: result.heavy },
                { label: 'Normal', slot: 2, m: result.normal },
              ].map((row) => (
                <tr key={row.label} className="border-b border-hairline last:border-0">
                  <th scope="row" className="px-3 py-2 text-left font-normal">
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-0.5 w-4 shrink-0 rounded-full"
                        style={{ backgroundColor: seriesColor(row.slot) }}
                      />
                      {row.label}
                    </span>
                  </th>
                  {[row.m.rmse, row.m.mae, row.m.p50, row.m.p68, row.m.p95].map(
                    (value, index) => (
                      <td key={index} className="tabular px-3 py-2 text-right">
                        {value.toFixed(1)}
                      </td>
                    ),
                  )}
                  <td className="tabular px-3 py-2 text-right font-semibold">
                    {row.m.withinRmse.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Read the last column. Both distributions have the same RMSE, and it means
          something different in each — that is the failure. Notice too how far apart
          the MAEs are, despite the matched RMSE.
        </p>
      </section>

      <section className="rounded-xl border border-hairline bg-surface p-5">
        <div className="mb-4">
          <ChartLegend entries={LEGEND} />
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={result.histogram}
              margin={{ top: 8, right: 16, bottom: 28, left: 8 }}
            >
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis
                dataKey="bin"
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART.axis }}
                tickFormatter={(value: number) => value.toFixed(0)}
                label={{
                  value: 'Absolute error',
                  position: 'insideBottom',
                  offset: -16,
                  style: AXIS_LABEL,
                }}
              />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(value: number) => `${value.toFixed(0)}%`}
                label={{
                  value: 'Share of errors',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 8,
                  style: { ...AXIS_LABEL, textAnchor: 'middle' },
                }}
              />
              <ReferenceLine
                x={result.heavy.rmse}
                stroke={CHART.reference}
                strokeDasharray="4 4"
                label={{
                  value: 'RMSE',
                  position: 'insideTopRight',
                  style: AXIS_LABEL,
                }}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) =>
                  typeof value === 'number' ? `${value.toFixed(2)}%` : ''
                }
                labelFormatter={(value) =>
                  typeof value === 'number' ? `error ≈ ${value.toFixed(1)}` : ''
                }
              />
              <Bar dataKey="heavy" fill={seriesColor(1)} isAnimationActive={false} />
              <Bar dataKey="normal" fill={seriesColor(2)} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Clipped at 1.5× the 95th percentile so the bulk is visible — with heavy tails
          the largest errors run to thousands. Every statistic above is computed on the
          unclipped sample.
        </p>
      </section>

      <section className="flex flex-col gap-4 leading-relaxed text-ink-secondary">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          What to report instead
        </h2>
        <p>
          The question worth answering is:{' '}
          <em>what magnitude of error will a given share of users fall within?</em> That
          is a percentile, and a percentile means the same thing whatever the shape of
          the distribution.
        </p>
        <p>
          Report P50, P68 and P95 of the absolute error. They need no distributional
          assumption, they are robust to the extreme values that drag RMSE around, and
          they answer the practical question directly: 95% of measurements are within{' '}
          <strong className="tabular text-ink">{result.heavy.p95.toFixed(1)}</strong>.
        </p>
        <p className="text-sm text-ink-muted">
          Tukey championed percentiles for exactly this reason. A box plot — first
          described by Mary Eleanor Spear in 1952 — is a graphical five-number summary,
          and it remains a better first look at an error distribution than any single
          number.
        </p>
      </section>
    </article>
  );
}
