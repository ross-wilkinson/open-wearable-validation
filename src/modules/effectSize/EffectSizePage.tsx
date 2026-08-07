import { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import ModulePage from '../../components/common/ModulePage.tsx';
import NumberField from '../../components/common/NumberField.tsx';
import SelectField from '../../components/common/SelectField.tsx';
import { AXIS_LABEL, AXIS_TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import {
  cohensDInterval,
  intervalCurve,
  sampleSizeToExcludeZero,
  type Design,
} from './effectSizeModel.ts';

const DESIGN_OPTIONS = [
  { value: 'one-sample', label: 'One-sample' },
  { value: 'paired', label: 'Paired' },
  { value: 'two-sample', label: 'Two-sample (n per group)' },
] as const;

const CONFIDENCE_OPTIONS = [
  { value: '0.9', label: '90%' },
  { value: '0.95', label: '95%' },
  { value: '0.99', label: '99%' },
] as const;

export default function EffectSizePage() {
  const [d, setD] = useState(0.5);
  const [n, setN] = useState(44);
  const [confidence, setConfidence] = useState('0.95');
  const [design, setDesign] = useState<Design>('one-sample');

  const result = useMemo(
    () => cohensDInterval({ d, n, confidence: Number(confidence), design }),
    [d, n, confidence, design],
  );

  const curve = useMemo(
    () => intervalCurve(d, Number(confidence), design, 5, 200),
    [d, confidence, design],
  );

  const nForSignificance = useMemo(
    () => sampleSizeToExcludeZero(d, Number(confidence), design),
    [d, confidence, design],
  );

  // Recharts stacks an Area from a [lower, upper] pair, which is how the band
  // between the two bounds gets drawn as one shape.
  const bandData = useMemo(
    () => curve.map((point) => ({ ...point, band: [point.lower, point.upper] })),
    [curve],
  );

  return (
    <ModulePage
      title="Effect size confidence intervals"
      intro={
        <>
          <p>
            A confidence interval for Cohen&rsquo;s d comes from inverting the{' '}
            <em>non-central</em> t distribution — the set of noncentralities consistent
            with what you observed. Most published intervals use a normal approximation
            instead, which drifts at small n and large effects.
          </p>
          <p>
            This module exists because the source notebook computes the right quantiles
            and reports them on the wrong scale. Both are shown below.
          </p>
        </>
      }
      controls={
        <>
          <NumberField
            label="Observed Cohen's d"
            value={d}
            onChange={setD}
            step={0.05}
            min={-5}
            max={5}
          />
          <NumberField
            label={design === 'two-sample' ? 'n per group' : 'Sample size (n)'}
            value={n}
            onChange={setN}
            min={2}
            step={1}
          />
          <SelectField
            label="Design"
            value={design}
            options={DESIGN_OPTIONS}
            onChange={setDesign}
            hint="A paired test is a one-sample test on the differences, so those two agree."
          />
          <SelectField
            label="Confidence level"
            value={confidence}
            options={CONFIDENCE_OPTIONS}
            onChange={setConfidence}
          />
        </>
      }
    >
      {result === null ? (
        <p className="flex gap-2 rounded-lg border border-critical/40 bg-critical/5 p-4 text-sm leading-relaxed">
          <AlertTriangle
            size={16}
            aria-hidden
            className="mt-0.5 shrink-0 text-critical"
          />
          <span>
            No reliable interval for these inputs. Either the sample is too small, or
            the noncentrality d&nbsp;&times;&nbsp;&radic;n exceeds 37.6, beyond which
            the AS&nbsp;243 algorithm loses accuracy. Returning nothing beats returning
            a confidently wrong interval.
          </span>
        </p>
      ) : (
        <>
          <section aria-labelledby="interval">
            <h2
              id="interval"
              className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
            >
              {Math.round(result.confidence * 100)}% interval for d
            </h2>
            <div className="mt-3 rounded-xl border border-hairline bg-surface p-5">
              <p className="tabular text-3xl font-semibold">
                [{result.lower.toFixed(3)}, {result.upper.toFixed(3)}]
              </p>
              <p className="mt-1 text-sm text-ink-secondary">
                d = {result.d},{' '}
                {result.design === 'two-sample' ? `${n} per group` : `n = ${n}`}, df ={' '}
                {result.df}, noncentrality = {result.nc.toFixed(3)}
              </p>
              <p className="mt-3 text-sm">
                {result.excludesZero ? (
                  <span className="text-good">The interval excludes zero.</span>
                ) : (
                  <span className="text-ink-secondary">
                    The interval includes zero
                    {nForSignificance
                      ? ` — it would first exclude it at n = ${nForSignificance}.`
                      : '.'}
                  </span>
                )}
              </p>
            </div>
          </section>

          <section aria-labelledby="comparison">
            <h2
              id="comparison"
              className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
            >
              Compared with the alternatives
            </h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-hairline bg-surface">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Comparison of interval methods for Cohen&rsquo;s d
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="border-b border-hairline px-4 py-2 text-left font-medium text-ink-muted"
                    >
                      Method
                    </th>
                    <th
                      scope="col"
                      className="border-b border-hairline px-4 py-2 text-right font-medium text-ink-muted"
                    >
                      Interval
                    </th>
                    <th
                      scope="col"
                      className="border-b border-hairline px-4 py-2 text-left font-medium text-ink-muted"
                    >
                      Contains d?
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-hairline">
                    <td className="px-4 py-2 font-medium">
                      Non-central t, rescaled
                      <span className="ml-1.5 rounded bg-good/10 px-1.5 py-0.5 text-xs text-good">
                        used here
                      </span>
                    </td>
                    <td className="tabular px-4 py-2 text-right">
                      [{result.lower.toFixed(3)}, {result.upper.toFixed(3)}]
                    </td>
                    <td className="px-4 py-2 text-good">yes</td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="px-4 py-2">Hedges–Olkin normal approximation</td>
                    <td className="tabular px-4 py-2 text-right text-ink-secondary">
                      [{result.approxLower.toFixed(3)}, {result.approxUpper.toFixed(3)}]
                    </td>
                    <td className="px-4 py-2 text-ink-secondary">yes</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">
                      Non-central t, <em>not</em> rescaled
                      <span className="ml-1.5 text-xs text-ink-muted">
                        (the notebook&rsquo;s output)
                      </span>
                    </td>
                    <td className="tabular px-4 py-2 text-right text-ink-secondary">
                      [{result.tScaleLower.toFixed(3)}, {result.tScaleUpper.toFixed(3)}]
                    </td>
                    <td className="px-4 py-2 text-critical">
                      {result.tScaleLower <= result.d && result.tScaleUpper >= result.d
                        ? 'yes'
                        : 'no'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              The third row is on the <em>t</em> scale. Since d = t/&radic;n for a
              one-sample or paired design, dividing by {result.scaleFactor.toFixed(3)}{' '}
              gives the first row. An &ldquo;effect size interval&rdquo; that does not
              contain the effect size is the tell.
            </p>
          </section>

          <section className="rounded-xl border border-hairline bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              How the interval tightens with n
            </h2>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={bandData}
                  margin={{ top: 8, right: 16, bottom: 28, left: 8 }}
                >
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="n"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={{ stroke: CHART.axis }}
                    label={{
                      value:
                        design === 'two-sample' ? 'n per group' : 'Sample size (n)',
                      position: 'insideBottom',
                      offset: -16,
                      style: AXIS_LABEL,
                    }}
                  />
                  <YAxis
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                    tickFormatter={(value: number) => value.toFixed(1)}
                    label={{
                      value: "Cohen's d",
                      angle: -90,
                      position: 'insideLeft',
                      offset: 8,
                      style: { ...AXIS_LABEL, textAnchor: 'middle' },
                    }}
                  />
                  <ReferenceLine y={0} stroke={CHART.axis} />
                  <ReferenceLine
                    y={d}
                    stroke={CHART.reference}
                    strokeDasharray="4 4"
                    label={{
                      value: `d = ${d}`,
                      position: 'insideTopRight',
                      style: AXIS_LABEL,
                    }}
                  />
                  <ReferenceLine x={n} stroke={CHART.reference} strokeDasharray="4 4" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-hairline)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value) =>
                      Array.isArray(value)
                        ? `[${Number(value[0]).toFixed(3)}, ${Number(value[1]).toFixed(3)}]`
                        : String(value)
                    }
                    labelFormatter={(value) => `n = ${value}`}
                  />
                  <Area
                    dataKey="band"
                    name={`${Math.round(Number(confidence) * 100)}% interval`}
                    stroke="none"
                    fill={seriesColor(1)}
                    fillOpacity={0.18}
                    isAnimationActive={false}
                  />
                  <Line
                    dataKey="d"
                    name="Point estimate"
                    stroke={seriesColor(1)}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              The band is the interval; the line is the point estimate. Where the band
              stops crossing zero is where the effect becomes distinguishable from none.
            </p>
          </section>

          <section aria-labelledby="cles">
            <h2
              id="cles"
              className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
            >
              Common-language effect size
            </h2>
            <div className="mt-3 rounded-xl border border-hairline bg-surface p-5">
              <p className="text-3xl font-semibold">
                {(result.commonLanguage * 100).toFixed(1)}
                <span className="ml-1 text-sm font-normal text-ink-muted">%</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
                The chance that a randomly chosen observation from the treated condition
                exceeds one from the comparison condition. Often a more useful thing to
                report than d itself, because it needs no calibration against
                convention.
              </p>
            </div>
          </section>
        </>
      )}
    </ModulePage>
  );
}
