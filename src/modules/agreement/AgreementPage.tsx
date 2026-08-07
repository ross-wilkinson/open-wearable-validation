import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ModulePage from '../../components/common/ModulePage.tsx';
import MethodsText from '../../components/common/MethodsText.tsx';
import NumberField from '../../components/common/NumberField.tsx';
import SelectField from '../../components/common/SelectField.tsx';
import ChartLegend from '../../components/common/ChartLegend.tsx';
import { BLAND_ALTMAN_1986, CHOW_2007 } from '../../content/citations.ts';
import { AXIS_LABEL, AXIS_TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import {
  loaPrecisionCurve,
  sampleSizeForEquivalence,
  sampleSizeForThreshold,
} from './agreementModel.ts';

const CONFIDENCE_OPTIONS = [
  { value: '0.9', label: '90%' },
  { value: '0.95', label: '95%' },
  { value: '0.99', label: '99%' },
] as const;

const LEGEND = [
  { key: 'exact', label: 'Exact (Bland–Altman)', colorSlot: 1 },
  { key: 'approximate', label: 'Common approximation 1.96√(3/n)', colorSlot: 2 },
];

export default function AgreementPage() {
  const [threshold, setThreshold] = useState(15 / 54);
  const [confidence, setConfidence] = useState('0.95');

  const [alpha, setAlpha] = useState(0.05);
  const [power, setPower] = useState(0.8);
  const [sigma, setSigma] = useState(2.5);
  const [delta, setDelta] = useState(4);
  const [epsilon, setEpsilon] = useState(2);

  const result = useMemo(
    () => sampleSizeForThreshold(threshold, Number(confidence)),
    [threshold, confidence],
  );

  const curve = useMemo(() => loaPrecisionCurve(400, Number(confidence)), [confidence]);

  const equivalenceN = useMemo(
    () => sampleSizeForEquivalence({ alpha, power, sigma, delta, epsilon }),
    [alpha, power, sigma, delta, epsilon],
  );

  return (
    <ModulePage
      title="How many participants do I need?"
      method="Sample size for a limits-of-agreement threshold"
      intro={
        <>
          <p>
            Decide how tightly your limits of agreement have to be pinned down, and
            this gives you the number of participants that achieves it. That number is
            the one to put in a protocol, a budget, or a recruitment plan.
          </p>
          <p>
            The threshold is set as a fraction of the standard deviation of the paired
            differences, so it travels with your device rather than with the units you
            happen to measure in.
          </p>
        </>
      }
      assumption={
        <>
          the paired differences are roughly normally distributed and free of
          proportional bias. If your errors grow with the magnitude of the
          measurement, transform first or the limits will be too wide at one end and
          too narrow at the other.
        </>
      }
      methodNotes={
        <>
          <p>
            The exact standard error of a limit of agreement is{' '}
            <code className="tabular text-ink">
              t(1−α/2, n−1) × √(1/n + k²/(2(n−1)))
            </code>
            , where <em>k</em> is the interval multiplier (1.96 for 95% limits). Its{' '}
            <code className="tabular text-ink">n−1</code> denominator is the reason
            small studies are penalised more than a naive count suggests.
          </p>
          <p>
            A widely used shortcut replaces this with{' '}
            <code className="tabular text-ink">1.96√(3/n)</code>, dropping the t
            correction and rounding the variance term up to 3. Both are plotted above.
            They cross at <strong className="text-ink">n = 117</strong>: below that the
            shortcut asks for too few participants, above it too many. If a colleague&rsquo;s
            spreadsheet disagrees with this page by a handful of subjects, that is
            almost always why.
          </p>
          <p>
            The equivalence-test sample size below answers a different question and
            uses Chow, Wang &amp; Shao (2007) formula 3.1.9. It returns no answer when
            the true difference lies at or outside the equivalence margin, because no
            sample size can demonstrate equivalence in that case.
          </p>
        </>
      }
      controls={
        <>
          <NumberField
            label="Accuracy threshold"
            value={Number(threshold.toFixed(4))}
            onChange={setThreshold}
            min={0.01}
            max={5}
            step={0.01}
            suffix="SD"
            hint="How tightly each limit of agreement must be pinned down, as a fraction of the SD of the differences. Default is 15/54 — a 15-unit target on a device with an SD of 54."
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
      {/* One answer, at full weight. An earlier version showed the exact result
          and a looser approximation side by side at equal size, which handed the
          user a decision they came here to have made for them. The comparison is
          still available, in Method and sources, where it answers the question a
          reader actually has: "why does this differ from the number I was given?" */}
      <section aria-labelledby="required-n">
        <h2
          id="required-n"
          className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
        >
          Participants required
        </h2>
        <div className="mt-3 rounded-xl border border-hairline bg-surface p-6">
          <p className="text-5xl font-semibold tracking-tight">
            {result.n ?? '—'}
            <span className="ml-2 text-base font-normal text-ink-muted">
              participants
            </span>
          </p>
          <p className="mt-3 max-w-xl leading-relaxed text-ink-secondary">
            {result.n === null ? (
              'No sample size in the plotted range reaches this threshold. Loosen it, or lower the confidence level.'
            ) : (
              <>
                pins each limit of agreement to within{' '}
                <strong className="tabular text-ink">
                  ±{threshold.toFixed(3)}
                </strong>{' '}
                of the SD of the paired differences, at{' '}
                {(Number(confidence) * 100).toFixed(0)}% confidence.
              </>
            )}
          </p>
          {result.n !== null && result.approximateN !== null && (
            <p className="mt-3 border-t border-hairline pt-3 text-xs leading-relaxed text-ink-muted">
              {result.approximateN === result.n
                ? 'The common 1.96√(3/n) shortcut agrees with the exact form at this threshold.'
                : `The common 1.96√(3/n) shortcut would say ${result.approximateN} — ${
                    result.approximateN < result.n
                      ? `${result.n - result.approximateN} too few`
                      : `${result.approximateN - result.n} more than needed`
                  }. See Method and sources.`}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-hairline bg-surface p-5">
        <div className="mb-4">
          <ChartLegend entries={LEGEND} />
        </div>
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curve} margin={{ top: 8, right: 16, bottom: 28, left: 8 }}>
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis
                dataKey="n"
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART.axis }}
                label={{
                  value: 'Sample size (n)',
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
                // `domain` is a *hint*: Recharts still extends it to fit the
                // data unless told otherwise, so a hard [0, 2] silently became
                // [0, 19.77] and printed the raw unrounded max as a tick label.
                // With the curve now starting at n = 5 the auto domain is
                // sensible; the formatter keeps the labels to one decimal.
                domain={[0, 'auto']}
                tickFormatter={(value: number) => value.toFixed(1)}
                label={{
                  value: 'LoA precision (SD)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 8,
                  style: { ...AXIS_LABEL, textAnchor: 'middle' },
                }}
              />
              <ReferenceLine
                y={threshold}
                stroke={CHART.reference}
                strokeDasharray="4 4"
                label={{
                  value: 'threshold',
                  position: 'insideTopRight',
                  style: AXIS_LABEL,
                }}
              />
              {result.n !== null && (
                <ReferenceLine
                  x={result.n}
                  stroke={CHART.reference}
                  strokeDasharray="4 4"
                />
              )}
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) =>
                  typeof value === 'number' ? value.toFixed(3) : String(value ?? '')
                }
                labelFormatter={(value) => `n = ${value}`}
              />
              <Line
                type="monotone"
                dataKey="exact"
                name="Exact (Bland–Altman)"
                stroke={seriesColor(1)}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="approximate"
                name="Common approximation"
                stroke={seriesColor(2)}
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section aria-labelledby="equivalence">
        <h2
          id="equivalence"
          className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
        >
          Equivalence test
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-secondary">
          A different question: how many subjects to <em>demonstrate</em> that the
          difference lies inside a stated equivalence margin. Chow, Wang &amp; Shao
          (2007), formula 3.1.9.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NumberField
              label="Alpha"
              value={alpha}
              onChange={setAlpha}
              min={0.001}
              max={0.5}
              step={0.005}
            />
            <NumberField
              label="Power"
              value={power}
              onChange={setPower}
              min={0.5}
              max={0.999}
              step={0.05}
            />
            <NumberField
              label="Error SD (σ)"
              value={sigma}
              onChange={setSigma}
              min={0.001}
              step={0.5}
            />
            <NumberField
              label="Equivalence margin (δ)"
              value={delta}
              onChange={setDelta}
              min={0.001}
              step={0.5}
            />
            <NumberField
              label="True difference (ε)"
              value={epsilon}
              onChange={setEpsilon}
              step={0.5}
            />
          </div>
          <div className="flex min-w-56 flex-col justify-center rounded-xl border border-hairline bg-surface p-5">
            <p className="text-xs font-medium text-ink-muted">Subjects required</p>
            {equivalenceN === null ? (
              <>
                <p className="mt-2 text-2xl font-semibold text-critical">
                  Not achievable
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  The true difference is at or outside the equivalence margin, so no
                  sample size can demonstrate equivalence. Widen δ or reduce ε.
                </p>
              </>
            ) : (
              <p className="mt-2 text-3xl font-semibold">
                {equivalenceN}
                <span className="ml-1.5 text-sm font-normal text-ink-muted">
                  subjects
                </span>
              </p>
            )}
          </div>
        </div>
      </section>

      {result.n !== null && (
        <MethodsText
          text={
            `Sample size was determined for agreement rather than for hypothesis testing. ` +
            `A sample of ${result.n} participants constrains each ${(Number(confidence) * 100).toFixed(0)}% ` +
            `limit of agreement to within ${threshold.toFixed(3)} standard deviations of the ` +
            `paired differences, using the exact expression for the standard error of a ` +
            `limit of agreement, t(1-a/2, n-1) * sqrt(1/n + k^2/(2(n-1))) with k = 1.96. ` +
            (equivalenceN === null
              ? ''
              : `A separate equivalence calculation, with alpha = ${alpha}, power = ${power}, ` +
                `an equivalence margin of ${delta} and an assumed true difference of ${epsilon}, ` +
                `requires ${equivalenceN} participants. `) +
            `The analysis assumes the paired differences are approximately normally ` +
            `distributed and free of proportional bias.`
          }
          citations={
            equivalenceN === null
              ? [BLAND_ALTMAN_1986]
              : [BLAND_ALTMAN_1986, CHOW_2007]
          }
        />
      )}
    </ModulePage>
  );
}
