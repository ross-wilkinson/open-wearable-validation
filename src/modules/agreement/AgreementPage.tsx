import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Info, Sparkles } from 'lucide-react';
import ModulePage from '../../components/common/ModulePage.tsx';
import MethodsText from '../../components/common/MethodsText.tsx';
import NumberField from '../../components/common/NumberField.tsx';
import SelectField from '../../components/common/SelectField.tsx';
import ChartLegend from '../../components/common/ChartLegend.tsx';
import { BLAND_ALTMAN_1986, CHOW_2007 } from '../../content/citations.ts';
import NextSteps from '../../app/study/NextSteps.tsx';
import { useStudy } from '../../app/study/StudyContext.tsx';
import { AXIS_LABEL, AXIS_TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import {
  PAIRED_ALGORITHM_PRESETS,
  correlationSweep,
  loaPrecisionCurve,
  sampleSizeForAttrition,
  sampleSizeForEquivalence,
  sampleSizeForThreshold,
  sampleSizePairedNonInferiority,
  type PairedAlgorithmPreset,
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
  const { study, updateStudy } = useStudy();
  const [threshold, setThreshold] = useState(15 / 54);
  // Seeded from the plan on mount. Routing unmounts a page on navigation, so
  // mounting is exactly the moment the plan should be picked up — and after
  // that the control is the user's, not the plan's.
  const [confidence, setConfidence] = useState(() => String(study.confidence));

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

  // Paired Algorithm Non-Inferiority State
  const [selectedPairedPresetId, setSelectedPairedPresetId] = useState<string>('firmware-hr');
  const [pairedMargin, setPairedMargin] = useState<number>(1.5);
  const [pairedDelta, setPairedDelta] = useState<number>(0.0);
  const [pairedSigma, setPairedSigma] = useState<number>(5.0);
  const [pairedRho, setPairedRho] = useState<number>(0.94);
  const [pairedAlpha, setPairedAlpha] = useState<number>(0.05);
  const [pairedPower, setPairedPower] = useState<number>(0.90);
  const [pairedUnit, setPairedUnit] = useState<string>('bpm');
  const [pairedHigherIsBetter, setPairedHigherIsBetter] = useState<boolean>(false);
  const [expectedYieldPct, setExpectedYieldPct] = useState<number>(70);

  function applyPairedPreset(preset: PairedAlgorithmPreset) {
    setSelectedPairedPresetId(preset.id);
    setPairedMargin(preset.margin);
    setPairedDelta(preset.delta);
    const sigmaVal =
      preset.sigma ??
      (preset.sigmaPair && preset.rho !== undefined
        ? preset.sigmaPair / Math.sqrt(2 * (1 - preset.rho))
        : 5.0);
    setPairedSigma(sigmaVal);
    if (preset.rho !== undefined) setPairedRho(preset.rho);
    setPairedAlpha(preset.alpha);
    setPairedPower(preset.power);
    setPairedUnit(preset.unit);
    setPairedHigherIsBetter(preset.higherIsBetter ?? false);
  }

  const pairedN = useMemo(
    () =>
      sampleSizePairedNonInferiority({
        margin: pairedMargin,
        delta: pairedDelta,
        sigma: pairedSigma,
        rho: pairedRho,
        alpha: pairedAlpha,
        power: pairedPower,
        higherIsBetter: pairedHigherIsBetter,
      }),
    [pairedMargin, pairedDelta, pairedSigma, pairedRho, pairedAlpha, pairedPower, pairedHigherIsBetter],
  );

  const uncoupledN = useMemo(
    () =>
      sampleSizePairedNonInferiority({
        margin: pairedMargin,
        delta: pairedDelta,
        sigma: pairedSigma,
        rho: 0.0,
        alpha: pairedAlpha,
        power: pairedPower,
        higherIsBetter: pairedHigherIsBetter,
      }),
    [pairedMargin, pairedDelta, pairedSigma, pairedAlpha, pairedPower, pairedHigherIsBetter],
  );

  const rhoCurve = useMemo(
    () =>
      correlationSweep(
        {
          margin: pairedMargin,
          delta: pairedDelta,
          sigma: pairedSigma,
          alpha: pairedAlpha,
          power: pairedPower,
          higherIsBetter: pairedHigherIsBetter,
        },
        0.0,
        0.98,
        0.02,
      ),
    [pairedMargin, pairedDelta, pairedSigma, pairedAlpha, pairedPower, pairedHigherIsBetter],
  );

  const enrolledN = useMemo(() => {
    if (!pairedN || expectedYieldPct <= 0 || expectedYieldPct > 100) return null;
    return sampleSizeForAttrition(pairedN, (100 - expectedYieldPct) / 100);
  }, [pairedN, expectedYieldPct]);

  const activePairedPreset = useMemo(
    () => PAIRED_ALGORITHM_PRESETS.find((p) => p.id === selectedPairedPresetId),
    [selectedPairedPresetId],
  );

  return (
    <ModulePage
      eyebrow="PROTOCOL STUDIO"
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

      <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">
            Planning repeated measurements per participant?
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">
            Most wearable and algorithm validation studies collect multiple paired readings per person. Sizing repeated measures requires decomposing between- vs within-subject variance.
          </p>
        </div>
        <Link
          to="/repeated-measures"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-series-1 transition-colors hover:bg-ink/5"
        >
          Repeated measures designer &rarr;
        </Link>
      </div>

      <section aria-labelledby="paired-non-inferiority" className="space-y-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-series-1/10 text-series-1">
              <Sparkles size={14} aria-hidden />
            </span>
            <h2
              id="paired-non-inferiority"
              className="text-sm font-semibold uppercase tracking-wide text-ink-muted"
            >
              Paired Algorithm Non-Inferiority (Firmware Update on Same Data)
            </h2>
          </div>
          <p className="mt-1 text-sm text-ink-secondary">
            Exploiting error correlation (ρ) on identical sensor streams avoids the 10× oversizing error committed by generic AI agents.
          </p>
        </div>

        {/* Presets */}
        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Evaluation Presets
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {PAIRED_ALGORITHM_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={selectedPairedPresetId === p.id}
                onClick={() => applyPairedPreset(p)}
                className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-colors ${
                  selectedPairedPresetId === p.id
                    ? 'border-series-1 bg-series-1/10 text-series-1'
                    : 'border-hairline bg-surface text-ink-secondary hover:bg-ink/5'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold text-ink">{p.name}</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">{p.domain}</p>
                </div>
                <div className="mt-2 flex items-baseline justify-between border-t border-hairline/60 pt-2 text-xs">
                  <span className="text-ink-muted">ρ = {p.rho}</span>
                  <span className="font-semibold text-series-1">
                    N = {p.pairedN} <span className="text-[10px] font-normal text-ink-muted">(vs {p.uncorrelatedN})</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </fieldset>

        {activePairedPreset && (
          <p className="flex gap-2 rounded-lg border border-hairline bg-surface p-3 text-xs leading-relaxed text-ink-secondary">
            <Info size={16} aria-hidden className="mt-0.5 shrink-0 text-series-1" />
            <span>{activePairedPreset.description}</span>
          </p>
        )}

        {/* Correlation Slider & Sizing Result Grid */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface p-5">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="paired-rho-slider" className="text-sm font-medium text-ink">
                  Paired Error Correlation (ρ)
                </label>
                <span className="font-mono text-base font-bold text-series-1">
                  ρ = {pairedRho.toFixed(2)}
                </span>
              </div>
              <input
                id="paired-rho-slider"
                type="range"
                min={0.0}
                max={0.98}
                step={0.01}
                value={pairedRho}
                onChange={(e) => {
                  setPairedRho(Number(e.target.value));
                  setSelectedPairedPresetId('custom');
                }}
                className="mt-2 w-full accent-[var(--color-series-1)]"
              />
              <div className="flex justify-between text-[11px] text-ink-muted">
                <span>ρ = 0.00 (Uncorrelated / Independent)</span>
                <span>ρ = 0.50 (Moderate)</span>
                <span>ρ = 0.95 (Extreme Pairing)</span>
              </div>
            </div>

            {/* Interactive Correlation vs N Curve */}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rhoCurve} margin={{ top: 8, right: 16, bottom: 20, left: 0 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="rho"
                    type="number"
                    domain={[0, 1]}
                    tick={AXIS_TICK}
                    tickFormatter={(v: number) => v.toFixed(1)}
                    label={{
                      value: 'Pairing Correlation (ρ)',
                      position: 'insideBottom',
                      offset: -12,
                      style: AXIS_LABEL,
                    }}
                  />
                  <YAxis
                    domain={[0, 'auto']}
                    tick={AXIS_TICK}
                    width={40}
                    label={{
                      value: 'Required N',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 10,
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
                    formatter={(v) => [`${v} subjects`, 'Sample Size']}
                    labelFormatter={(label) => `Correlation ρ = ${Number(label).toFixed(2)}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="n"
                    name="Required N"
                    stroke={seriesColor(1)}
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                  {pairedN !== null && (
                    <ReferenceDot
                      x={pairedRho}
                      y={pairedN}
                      r={5}
                      fill={seriesColor(1)}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Configurable Parameters */}
            <div className="grid gap-3 border-t border-hairline pt-3 sm:grid-cols-2 lg:grid-cols-5">
              <NumberField
                label={`Margin Δ (${pairedUnit})`}
                value={pairedMargin}
                onChange={(v) => {
                  setPairedMargin(v);
                  setSelectedPairedPresetId('custom');
                }}
                min={0.001}
                step={pairedUnit === 'κ' ? 0.005 : 0.1}
              />
              <NumberField
                label={`Expected Diff δ (${pairedUnit})`}
                value={pairedDelta}
                onChange={(v) => {
                  setPairedDelta(v);
                  setSelectedPairedPresetId('custom');
                }}
                step={pairedUnit === 'κ' ? 0.005 : 0.1}
                hint="Expected difference. For errors, δ > 0 is degradation. For Kappa, δ < 0 is degradation."
              />
              <NumberField
                label={`Marginal SD σ (${pairedUnit})`}
                value={pairedSigma}
                onChange={(v) => {
                  setPairedSigma(v);
                  setSelectedPairedPresetId('custom');
                }}
                min={0.001}
                step={pairedUnit === 'κ' ? 0.01 : 0.5}
              />
              <NumberField
                label="Alpha (one-sided)"
                value={pairedAlpha}
                onChange={(v) => {
                  setPairedAlpha(v);
                  setSelectedPairedPresetId('custom');
                }}
                min={0.005}
                max={0.2}
                step={0.005}
              />
              <NumberField
                label="Target Power"
                value={pairedPower}
                onChange={(v) => {
                  setPairedPower(v);
                  setSelectedPairedPresetId('custom');
                }}
                min={0.5}
                max={0.99}
                step={0.05}
              />
            </div>
          </div>

          {/* Sizing Stat Box */}
          <div className="flex min-w-64 flex-col justify-between rounded-xl border border-hairline bg-surface p-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Paired Sample Size
              </span>
              <p className="mt-2 text-4xl font-bold tracking-tight text-ink">
                {pairedN ?? '—'}
                <span className="ml-1.5 text-sm font-normal text-ink-muted">subjects</span>
              </p>
              {pairedN === null ? (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  Degradation |δ| exceeds non-inferiority margin Δ. Non-inferiority cannot be demonstrated.
                </p>
              ) : (
                <p className="mt-1 text-xs text-ink-secondary">
                  at ρ = {pairedRho.toFixed(2)} &bull; paired variance σ²_pair ={' '}
                  {(2 * pairedSigma ** 2 * (1 - pairedRho)) < 0.1
                    ? (2 * pairedSigma ** 2 * (1 - pairedRho)).toFixed(4)
                    : (2 * pairedSigma ** 2 * (1 - pairedRho)).toFixed(2)}{' '}
                  {pairedUnit}²
                </p>
              )}
            </div>

            <div className="mt-4 border-t border-hairline pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Uncoupled AI Agent Sizing (ρ=0):</span>
                <span className="font-semibold text-ink">{uncoupledN ?? '—'}</span>
              </div>
              {uncoupledN && pairedN && uncoupledN > pairedN && (
                <div className="rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                  <p className="font-semibold">
                    Recruitment Reduction: {uncoupledN - pairedN} participants (
                    {(((uncoupledN - pairedN) / uncoupledN) * 100).toFixed(0)}%)
                  </p>
                  <p className="mt-0.5 text-[11px] opacity-90">
                    Saves estimated ~${((uncoupledN - pairedN) * 1300).toLocaleString()} in recruitment &amp; clinical costs.
                  </p>
                </div>
              )}

              {/* Real-World Study Yield & Enrollment Inflation */}
              <div className="rounded-lg border border-hairline bg-surface-raised p-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">Study Protocol Yield:</span>
                  <span className="font-mono font-semibold text-series-1">{expectedYieldPct}%</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={100}
                  step={5}
                  value={expectedYieldPct}
                  aria-label="Expected study protocol yield percentage"
                  onChange={(e) => setExpectedYieldPct(Number(e.target.value))}
                  className="mt-1.5 w-full accent-[var(--color-series-1)]"
                />
                <div className="mt-1 flex items-baseline justify-between border-t border-hairline/60 pt-1 text-[11px]">
                  <span className="text-ink-muted">Required Enrolled:</span>
                  <span className="font-bold text-ink">
                    {enrolledN ?? '—'} participants
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-ink-muted leading-tight">
                  Inflation for EEG/sensor detachment, SQI gating, and alignment dropouts.
                </p>
              </div>

              {pairedN !== null && (
                <button
                  type="button"
                  onClick={() => {
                    const targetN = enrolledN ?? pairedN;
                    updateStudy({
                      n: targetN,
                      confidence: Number((1 - pairedAlpha).toFixed(4)),
                      nSource: 'paired algorithm non-inferiority',
                    });
                  }}
                  className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-series-1/40 bg-series-1/10 px-3 py-1.5 text-xs font-semibold text-series-1 transition-colors hover:bg-series-1/20"
                >
                  <Sparkles size={13} aria-hidden />
                  Carry {enrolledN ?? pairedN} into study plan
                </button>
              )}
            </div>
          </div>
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

      <NextSteps
        offer={
          result.n === null
            ? undefined
            : { n: result.n, source: 'sample size for agreement' }
        }
        confidence={Number(confidence)}
        steps={[
          {
            to: '/repeated-measures',
            title: 'Design for repeated measures',
            description:
              'Evaluate within-subject designs, trade off subjects vs replicates, and calculate effective sample size.',
          },
          {
            to: '/demographics',
            title: 'Who do I need to recruit?',
            description:
              'Split this total into a target per sex, age band, or skin tone, and check it is reachable.',
          },
          {
            to: '/precision',
            title: 'How precise will my study be?',
            description:
              'See what this sample size buys you for bias, limits of agreement, and error percentiles.',
          },
          {
            to: '/report-studio',
            title: 'Report Studio: Launch Gates',
            description:
              'Once data is collected, synthesize findings into two-gate decision scorecards and Bland-Altman agreement.',
          },
        ]}
      />
    </ModulePage>
  );
}
