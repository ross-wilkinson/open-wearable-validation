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
import MethodsText from '../../components/common/MethodsText.tsx';
import IntervalComparison from './IntervalComparison.tsx';
import { CUMMING_2001, STEIGER_2004 } from '../../content/citations.ts';
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
      title="How big is the effect, and how sure am I?"
      method="Cohen's d confidence intervals from the non-central t"
      intro={
        <>
          <p>
            A point estimate of Cohen&rsquo;s d on its own says nothing about how much
            of it is signal. This gives the interval around it, so you can report the
            range your data actually supports — and see the sample size at which the
            effect becomes distinguishable from none.
          </p>
          <p>
            The interval is obtained by inverting the <em>non-central</em> t
            distribution, which stays accurate at small n where the normal
            approximation most tools use starts to drift.
          </p>
        </>
      }
      assumption={
        <>
          the observations are independent and approximately normal, and{' '}
          <em>d</em> is the observed effect rather than a hypothesised one. The
          interval describes uncertainty about the effect you measured; it is not a
          power calculation for an effect you hope to find.
        </>
      }
      methodNotes={
        <>
          <p>
            An exact interval for d comes from finding the set of noncentrality
            parameters under which the observed t statistic is not extreme, then
            converting back to the d scale. That conversion is the step to watch: for a
            one-sample or paired design d = t/&radic;n, so noncentrality quantiles have
            to be divided by &radic;n
            {result ? ` — here, ${result.scaleFactor.toFixed(3)}` : ''} before they
            are reported as effect sizes.
          </p>
          <p>
            Omitting that division is a common implementation error, and it produces
            intervals that are wrong by a factor of &radic;n. The tell is easy to check
            and worth checking in any tool you use: an interval for an effect size that
            does not contain the effect size.
          </p>
          {result && <IntervalComparison result={result} />}
          <p>
            Intervals are computed with Algorithm AS 243 (Lenth 1989). Where the
            noncentrality d&nbsp;&times;&nbsp;&radic;n exceeds 37.6 the algorithm loses
            accuracy, and this returns nothing rather than a confidently wrong answer.
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

          <MethodsText
            text={
              `Cohen's d was ${result.d.toFixed(2)} ` +
              `(${
                result.design === 'two-sample'
                  ? `two-sample, n = ${n} per group`
                  : `${result.design}, n = ${n}`
              }, df = ${result.df}), with a ` +
              `${Math.round(result.confidence * 100)}% confidence interval of ` +
              `[${result.lower.toFixed(2)}, ${result.upper.toFixed(2)}]. ` +
              `The interval was obtained by inverting the non-central t distribution ` +
              `rather than by normal approximation, which remains accurate at small ` +
              `samples. The interval ${
                result.excludesZero ? 'excludes' : 'includes'
              } zero. ` +
              `Expressed as a common-language effect size, a randomly chosen ` +
              `observation from one condition exceeds one from the other ` +
              `${(result.commonLanguage * 100).toFixed(0)}% of the time.`
            }
            citations={[STEIGER_2004, CUMMING_2001]}
          />
        </>
      )}
    </ModulePage>
  );
}
