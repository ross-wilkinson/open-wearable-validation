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
import NumberField from '../../components/common/NumberField.tsx';
import SelectField from '../../components/common/SelectField.tsx';
import ChartLegend from '../../components/common/ChartLegend.tsx';
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
  { key: 'approximate', label: 'Notebook approximation 1.96√(3/n)', colorSlot: 2 },
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
      title="Sample size for agreement"
      intro={
        <>
          <p>
            Set the accuracy you need as a fraction of the measurement SD, and read off
            the number of subjects that pins your limits of agreement down that tightly.
          </p>
          <p>
            Both curves are plotted: the exact Bland–Altman expression, and the
            <code className="tabular mx-1 text-ink">1.96√(3/n)</code>
            approximation the source notebook used. They cross at n = 117 — below that,
            the approximation asks for too few subjects.
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
            hint="How tightly the limits of agreement must be pinned down. Default is the notebook's own worked case, 15/54."
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
      <section aria-labelledby="required-n">
        <h2
          id="required-n"
          className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
        >
          Subjects required
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-hairline bg-surface p-5">
            <p className="text-xs font-medium text-ink-muted">Exact (Bland–Altman)</p>
            <p className="mt-2 text-3xl font-semibold">
              {result.n ?? '—'}
              <span className="ml-1.5 text-sm font-normal text-ink-muted">
                subjects
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-hairline bg-surface p-5">
            <p className="text-xs font-medium text-ink-muted">Notebook approximation</p>
            <p className="mt-2 text-3xl font-semibold text-ink-secondary">
              {result.approximateN ?? '—'}
              <span className="ml-1.5 text-sm font-normal text-ink-muted">
                subjects
              </span>
            </p>
          </div>
        </div>
        {result.n !== null && result.approximateN !== null && (
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            {result.approximateN < result.n
              ? `The approximation is ${result.n - result.approximateN} subject(s) short here — it drops the t correction, which matters most at small n.`
              : result.approximateN > result.n
                ? `The approximation asks for ${result.approximateN - result.n} more subject(s) than needed here — past n = 117 its inflated √3 constant dominates.`
                : 'Both forms agree at this threshold.'}
          </p>
        )}
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
                name="Notebook approximation"
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
    </ModulePage>
  );
}
