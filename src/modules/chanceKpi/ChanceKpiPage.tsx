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
import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import ModulePage from '../../components/common/ModulePage.tsx';
import MethodsText from '../../components/common/MethodsText.tsx';
import NumberField from '../../components/common/NumberField.tsx';
import SelectField from '../../components/common/SelectField.tsx';
import ChartLegend from '../../components/common/ChartLegend.tsx';
import NextSteps from '../../app/study/NextSteps.tsx';
import { useStudy } from '../../app/study/StudyContext.tsx';
import { BLAND_ALTMAN_1986, PREISS_FISHER_2008, SERFLING_1980 } from '../../content/citations.ts';
import { AXIS_LABEL, AXIS_TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import { createRng } from '../../stats/random.ts';
import {
  CHANCE_KPI_PRESETS,
  formatPairedCsv,
  generatePairedData,
  type MetricType,
  parsePairedCsv,
  runChanceKpiAnalysis,
} from './chanceKpiModel.ts';

const METRIC_OPTIONS = [
  { value: 'rmse', label: 'RMSE (Root Mean Square Error)' },
  { value: 'mae', label: 'MAE (Mean Absolute Error)' },
  { value: 'loa', label: 'Bland–Altman 95% LoA (Half-width)' },
] as const;

const ALPHA_OPTIONS = [
  { value: '0.01', label: '1% False-Positive Ceiling (99% Confidence, Strict)' },
  { value: '0.05', label: '5% False-Positive Ceiling (95% Confidence, Standard)' },
  { value: '0.10', label: '10% False-Positive Ceiling (90% Confidence, Exploratory)' },
] as const;

export default function ChanceKpiPage() {
  const { study } = useStudy();

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('ambulatory-spo2');
  const [dataSourceMode, setDataSourceMode] = useState<'simulated' | 'custom'>('simulated');
  const [customCsvText, setCustomCsvText] = useState<string>('');
  const [metric, setMetric] = useState<MetricType>('rmse');
  const [desiredAlpha, setDesiredAlpha] = useState<number>(() =>
    study.confidence ? Math.max(0.01, Number((1 - study.confidence).toFixed(2))) : 0.05,
  );
  const [sampleSize, setSampleSize] = useState<number>(() => study.n ?? 100);
  const [referenceMean, setReferenceMean] = useState<number>(97.5);
  const [referenceSd, setReferenceSd] = useState<number>(0.8);
  const [deviceBias, setDeviceBias] = useState<number>(0.1);
  const [deviceErrorSd, setDeviceErrorSd] = useState<number>(1.2);
  const [proposedKpi, setProposedKpi] = useState<number>(3.5);
  const [unit, setUnit] = useState<string>(() => study.unit || '%SpO2');
  const [iterations] = useState<number>(10000);
  const [seed, setSeed] = useState<number>(42);

  // Switch preset
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = CHANCE_KPI_PRESETS.find((item) => item.id === presetId);
    if (!p) return;
    setMetric(p.metric);
    setSampleSize(p.sampleSize);
    setReferenceMean(p.referenceMean);
    setReferenceSd(p.referenceSd);
    setDeviceBias(p.deviceBias);
    setDeviceErrorSd(p.deviceErrorSd);
    setProposedKpi(p.proposedKpi);
    setUnit(p.unit);
  };

  const parsedCustomPairs = useMemo(() => {
    if (dataSourceMode !== 'custom') return [];
    return parsePairedCsv(customCsvText);
  }, [dataSourceMode, customCsvText]);

  const handleLoadCurrentToEditor = () => {
    const rng = createRng(seed);
    const pts = generatePairedData(
      sampleSize,
      referenceMean,
      referenceSd,
      deviceBias,
      deviceErrorSd,
      rng,
    );
    setCustomCsvText(formatPairedCsv(pts));
  };

  const isCustomActive = dataSourceMode === 'custom' && parsedCustomPairs.length >= 3;
  const activeSampleSize = isCustomActive ? parsedCustomPairs.length : sampleSize;

  const result = useMemo(() => {
    return runChanceKpiAnalysis({
      sampleSize: activeSampleSize,
      referenceMean,
      referenceSd,
      deviceBias,
      deviceErrorSd,
      proposedKpi,
      metric,
      desiredAlpha,
      iterations,
      seed,
      pairs: isCustomActive ? parsedCustomPairs : undefined,
    });
  }, [
    activeSampleSize,
    referenceMean,
    referenceSd,
    deviceBias,
    deviceErrorSd,
    proposedKpi,
    metric,
    desiredAlpha,
    iterations,
    seed,
    isCustomActive,
    parsedCustomPairs,
  ]);

  // Determine x-axis bounds to enclose both the null distribution and all benchmark lines safely
  const xDomain = useMemo(() => {
    if (result.histogram.length === 0) return [0, 10];
    const minBin = result.histogram[0]!.binStart;
    const maxBin = result.histogram[result.histogram.length - 1]!.binEnd;
    const leftCandidate = Math.min(
      minBin,
      proposedKpi,
      result.observedMetric,
      result.defensibleThreshold,
    );
    const rightCandidate = Math.max(
      maxBin,
      proposedKpi,
      result.observedMetric,
      result.defensibleThreshold,
    );
    const span = rightCandidate - leftCandidate;
    const padding = span * 0.08 || 0.5;
    return [
      Number(Math.max(0, leftCandidate - padding).toFixed(2)),
      Number((rightCandidate + padding).toFixed(2)),
    ];
  }, [result, proposedKpi]);

  // Compute responsive bar width so histogram bars render with substance rather than 4px needles
  const barSize = useMemo(() => {
    if (result.histogram.length < 2) return 8;
    const binSpan = result.histogram[1]!.binStart - result.histogram[0]!.binStart;
    const x0 = xDomain[0] ?? 0;
    const x1 = xDomain[1] ?? 10;
    const domainSpan = x1 - x0;
    if (domainSpan <= 0) return 8;
    return Math.max(4, Math.min(22, Math.round(680 * (binSpan / domainSpan))));
  }, [result.histogram, xDomain]);

  const activePreset = CHANCE_KPI_PRESETS.find((p) => p.id === selectedPresetId);

  const legend = [
    { key: 'null', label: 'Permuted Chance Null Distribution', colorSlot: 1 },
    { key: 'kpi', label: 'Proposed KPI Threshold', colorSlot: 2 },
    {
      key: 'defensible',
      label: `Defensible ${(result.desiredAlpha * 100).toFixed(0)}% KPI Threshold (P${(result.desiredAlpha * 100).toFixed(0).padStart(2, '0')})`,
      colorSlot: 6,
    },
    { key: 'observed', label: 'Observed Device Metric', colorSlot: 7 },
  ];

  return (
    <ModulePage
      eyebrow="REPORT STUDIO"
      title="Did we pass our KPIs by chance?"
      method="Permutation null distribution & Preiss–Fisher separation index"
      currentN={activeSampleSize}
      intro={
        <>
          <p>
            When a reference variable has a <strong>narrow dynamic range</strong> (e.g. daytime
            ambulatory SpO2 spanning only 96%–99%, or resting body temperature spanning
            36.5°C–37.5°C), setting an arbitrary error KPI like RMSE ≤ 3.5% means that purely by
            chance, a completely uncoupled dummy sensor will pass 95%+ of the time.
          </p>
          <p>
            Founded on Preiss &amp; Fisher (2008), this module randomly mispairs paired reference and
            device samples <strong>10,000 times</strong> to construct the true empirical null
            distribution under chance. It reveals whether your passed KPI proves true sensor
            coupling, or merely reflects the tiny natural variation of the measured population.
          </p>
        </>
      }
      assumption={
        <>
          The reference measurements represent the target population's clinical dynamic range.
          If data are gathered only in a narrow physiological window without challenge or stress
          protocols (e.g., resting SpO2 instead of controlled hypoxia desaturation), passing a KPI
          gives false confidence in interchangeability.
        </>
      }
      methodNotes={
        <>
          <p>
            <strong>The Preiss–Fisher Permutation Procedure:</strong> Preiss &amp; Fisher (2008)
            showed that standard Bland–Altman limits of agreement and RMSE fail to prove method
            interchangeability if the measured data span too narrow a range. By randomly shuffling
            the pairing of reference $X$ and device $Y$ across 10,000 iterations, the pairing is
            broken while preserving individual marginal distributions.
          </p>
          <p>
            <strong>Closed-Form Analytical Reference:</strong> When paired samples are uncoupled
            (Cov(X, Y) = 0), the expected mean squared error simplifies exactly to:
            <br />
            <code className="tabular text-ink">
              E[MSE_chance] = Var_pop(X) + Var_pop(Y) + (μ_X − μ_Y)²
            </code>
            <br />
            For limits of agreement, the expected standard deviation of differences is{' '}
            <code className="tabular text-ink">√(Var_sample(X) + Var_sample(Y))</code>, and the 95% LoA
            half-width is <code className="tabular text-ink">1.96 × √(Var_sample(X) + Var_sample(Y))</code>.
          </p>
          <p>
            <strong>Defensible KPI Threshold:</strong> To guarantee that an uncoupled or dummy
            device has at most an α probability (e.g. 5%) of passing your KPI by pure chance
            (false-positive rate α ≤ {result.desiredAlpha.toFixed(2)}), the proposed KPI threshold
            must be set at or below the α-quantile (P_{(result.desiredAlpha * 100).toFixed(0)}) of the
            permuted null distribution.
          </p>
          <p>
            <strong>Preiss–Fisher Separation Index:</strong> The ratio of the observed device error
            to the expected chance error (Observed Metric / Chance Expected Metric).
            Values close to 1.0 indicate performance indistinguishable from random guessing; small
            values (&lt; 0.3) indicate strong coupling and broad dynamic range.
          </p>
        </>
      }
      controls={
        <>
          {/* Data Source Mode Toggle */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Data Source
            </span>
            <div className="mt-2 flex rounded-lg border border-hairline bg-surface p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setDataSourceMode('simulated')}
                className={`flex-1 rounded-md py-1.5 transition-colors ${
                  dataSourceMode === 'simulated'
                    ? 'bg-plane font-semibold text-ink shadow-sm'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                Simulated Cohort
              </button>
              <button
                type="button"
                onClick={() => {
                  setDataSourceMode('custom');
                  if (!customCsvText.trim()) {
                    handleLoadCurrentToEditor();
                  }
                }}
                className={`flex-1 rounded-md py-1.5 transition-colors ${
                  dataSourceMode === 'custom'
                    ? 'bg-plane font-semibold text-ink shadow-sm'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                Custom Paired Data
              </button>
            </div>
          </div>

          {/* Mode 1: Simulated Cohort Controls */}
          {dataSourceMode === 'simulated' && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Clinical Presets
              </span>
              <div className="mt-2 flex flex-col gap-1.5">
                {CHANCE_KPI_PRESETS.map((p) => {
                  const isSelected = selectedPresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id)}
                      className={`flex flex-col rounded-lg border p-2.5 text-left text-xs transition-colors ${
                        isSelected
                          ? 'border-series-1 bg-series-1/10 text-series-1'
                          : 'border-hairline bg-surface hover:bg-ink/5 text-ink'
                      }`}
                    >
                      <span className="font-semibold">{p.shortName}</span>
                      <span className="mt-0.5 text-[11px] text-ink-muted leading-tight">
                        {p.hazardNote}
                      </span>
                    </button>
                  );
                })}
              </div>
              {activePreset && (
                <p className="mt-2 rounded-lg border border-hairline bg-plane p-2 text-[11px] leading-relaxed text-ink-secondary">
                  {activePreset.description}
                </p>
              )}
            </div>
          )}

          {/* Mode 2: Custom Paired Data Input */}
          {dataSourceMode === 'custom' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-ink-muted">
                  Custom Paired Observations
                </span>
                <button
                  type="button"
                  onClick={handleLoadCurrentToEditor}
                  className="text-[11px] text-series-1 hover:underline"
                >
                  Reload from preset
                </button>
              </div>
              <textarea
                rows={6}
                value={customCsvText}
                onChange={(e) => setCustomCsvText(e.target.value)}
                placeholder="97.5, 97.2&#10;98.1, 98.4&#10;96.8, 96.5"
                className="w-full rounded-md border border-hairline bg-surface p-2 text-xs font-mono tabular leading-relaxed text-ink"
              />
              <div className="flex items-center justify-between text-[11px] text-ink-muted">
                <span>CSV, TSV, or copy-paste from Excel.</span>
                <span
                  className={
                    parsedCustomPairs.length >= 3 ? 'text-good font-medium' : 'text-critical'
                  }
                >
                  {parsedCustomPairs.length >= 3
                    ? `${parsedCustomPairs.length} pairs loaded`
                    : 'Requires ≥ 3 pairs'}
                </span>
              </div>
            </div>
          )}

          {/* Shared Configuration Parameters */}
          <div className="border-t border-hairline pt-3 flex flex-col gap-4">
            <SelectField
              label="Evaluation Metric"
              value={metric}
              options={METRIC_OPTIONS}
              onChange={(val) => setMetric(val as MetricType)}
              hint="RMSE, MAE, or Bland–Altman limits-of-agreement half-width."
            />

            <SelectField
              label="Desired False-Positive Rate (α)"
              value={desiredAlpha.toFixed(2)}
              options={ALPHA_OPTIONS}
              onChange={(val) => setDesiredAlpha(Number(val))}
              hint="False-positive ceiling under uncoupled chance conditions."
            />

            <NumberField
              label={`Proposed KPI Threshold (${unit})`}
              value={proposedKpi}
              onChange={(val) => {
                setSelectedPresetId(null);
                setProposedKpi(val);
              }}
              min={0.01}
              step={0.1}
              suffix={unit}
              hint="Your team's passing criteria (e.g. RMSE ≤ 3.5%)."
            />

            {dataSourceMode === 'simulated' && (
              <>
                <NumberField
                  label={`Reference Dynamic Range SD (σ_ref)`}
                  value={referenceSd}
                  onChange={(val) => {
                    setSelectedPresetId(null);
                    setReferenceSd(val);
                  }}
                  min={0.01}
                  step={0.1}
                  suffix={unit}
                  hint="Spread of reference values. Narrow spread creates false-pass hazard."
                />

                <NumberField
                  label={`Device Random Error SD (σ_e)`}
                  value={deviceErrorSd}
                  onChange={(val) => {
                    setSelectedPresetId(null);
                    setDeviceErrorSd(val);
                  }}
                  min={0.01}
                  step={0.1}
                  suffix={unit}
                  hint="Inherent device measurement precision."
                />

                <NumberField
                  label="Sample Size (N)"
                  value={sampleSize}
                  onChange={(val) => {
                    setSelectedPresetId(null);
                    setSampleSize(val);
                  }}
                  min={10}
                  max={2000}
                  step={10}
                  suffix="pairs"
                  hint="Number of paired comparison measurements."
                />
              </>
            )}
          </div>

          {dataSourceMode === 'simulated' && (
            <details className="border-t border-hairline pt-2 text-xs text-ink-secondary">
              <summary className="cursor-pointer font-medium text-ink-muted hover:text-ink py-1">
                Advanced simulation options
              </summary>
              <div className="mt-3 flex flex-col gap-3">
                <NumberField
                  label={`Reference Population Mean`}
                  value={referenceMean}
                  onChange={(val) => {
                    setSelectedPresetId(null);
                    setReferenceMean(val);
                  }}
                  step={0.5}
                  suffix={unit}
                />
                <NumberField
                  label={`Systematic Device Bias`}
                  value={deviceBias}
                  onChange={(val) => {
                    setSelectedPresetId(null);
                    setDeviceBias(val);
                  }}
                  step={0.1}
                  suffix={unit}
                />
                <NumberField
                  label="Random Seed"
                  value={seed}
                  onChange={setSeed}
                  min={1}
                  max={99999}
                  step={1}
                  hint="Ensures exact permutation reproducibility."
                />
              </div>
            </details>
          )}
        </>
      }
    >
      {/* 1. Chance Hazard Verdict Card */}
      <section aria-labelledby="hazard-verdict">
        <h2 id="hazard-verdict" className="sr-only">
          Chance Hazard Verdict
        </h2>
        {result.hazardVerdict === 'CRITICAL_HAZARD' && (
          <div className="rounded-xl border border-critical/40 bg-critical/10 p-5 sm:p-6 text-ink">
            <div className="flex items-start gap-3">
              <ShieldAlert className="size-6 shrink-0 text-critical mt-0.5" aria-hidden />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-critical">
                    {result.hazardVerdictTitle}
                  </h3>
                  <span className="rounded-full bg-critical px-2.5 py-0.5 text-xs font-bold text-white">
                    {result.chancePassingRate.toFixed(1)}% Chance Pass Rate
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {result.hazardVerdictDescription}
                </p>
                <div className="mt-4 rounded-lg bg-surface/80 border border-critical/30 p-3 text-xs leading-relaxed text-ink-secondary">
                  <strong className="text-ink">Regulatory &amp; Engineering Impact:</strong> Setting
                  a KPI of {proposedKpi.toFixed(2)} {unit} creates a study where even a dummy device
                  emitting constant noise passes with {result.chancePassingRate.toFixed(1)}%
                  probability. To make this validation defensible, either tighten the KPI to{' '}
                  <strong className="text-ink">
                    ≤ {result.defensibleThreshold.toFixed(2)} {unit}
                  </strong>{' '}
                  or expand the reference dynamic range with an active hypoxia/stress protocol.
                </div>
              </div>
            </div>
          </div>
        )}

        {result.hazardVerdict === 'MODERATE_HAZARD' && (
          <div className="rounded-xl border border-warning/40 bg-warning/10 p-5 sm:p-6 text-ink">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-6 shrink-0 text-warning mt-0.5" aria-hidden />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-ink">
                    {result.hazardVerdictTitle}
                  </h3>
                  <span className="rounded-full bg-warning px-2.5 py-0.5 text-xs font-bold text-ink">
                    {result.chancePassingRate.toFixed(1)}% Chance Pass Rate
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {result.hazardVerdictDescription}
                </p>
                <p className="mt-2 text-xs text-ink-muted">
                  Suggested defensible threshold for {result.desiredConfidence}% confidence:{' '}
                  <strong className="text-ink">
                    ≤ {result.defensibleThreshold.toFixed(2)} {unit}
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {result.hazardVerdict === 'DEFENSIBLE' && (
          <div className="rounded-xl border border-good/40 bg-good/10 p-5 sm:p-6 text-ink">
            <div className="flex items-start gap-3">
              <ShieldCheck className="size-6 shrink-0 text-good mt-0.5" aria-hidden />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-good">
                    {result.hazardVerdictTitle}
                  </h3>
                  <span className="rounded-full bg-good px-2.5 py-0.5 text-xs font-bold text-white">
                    {result.chancePassingRate < 0.1 ? '< 0.1%' : `${result.chancePassingRate.toFixed(1)}%`}{' '}
                    Chance Pass Rate
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {result.hazardVerdictDescription}
                </p>
                <div className="mt-3 text-xs leading-relaxed text-ink-muted">
                  Because reference SD ({result.referenceSd.toFixed(1)} {unit}) spans a wide physiological
                  range, uncoupled readings produce massive errors (mean chance error{' '}
                  {result.meanChanceMetric.toFixed(1)} {unit}). Passing {proposedKpi.toFixed(2)}{' '}
                  {unit} is genuine proof of device accuracy.
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Key Statistical Scorecards */}
      <section aria-labelledby="scorecard-heading">
        <h2
          id="scorecard-heading"
          className="text-xs font-semibold uppercase tracking-wider text-ink-muted"
        >
          Chance Permutation Analysis (B = 10,000 Mispairings)
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Chance Pass Rate */}
          <div className="rounded-xl border border-hairline bg-surface p-4">
            <span className="text-xs font-medium text-ink-muted">Chance Passing Rate</span>
            <p
              className={`mt-1 text-3xl font-bold tracking-tight ${
                result.chancePassingRate > 20
                  ? 'text-critical'
                  : result.chancePassingRate > result.desiredAlpha * 100
                    ? 'text-warning'
                    : 'text-good'
              }`}
            >
              {result.chancePassingRate.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-ink-secondary">
              P(Permuted KPI ≤ {proposedKpi.toFixed(2)} {unit})
            </p>
            <div className="mt-2 text-[11px] text-ink-muted border-t border-hairline pt-1.5">
              {result.chancePassingRate > result.desiredAlpha * 100
                ? `Exceeds ${(result.desiredAlpha * 100).toFixed(0)}% false-pass ceiling`
                : `Rigorous: ≤ ${(result.desiredAlpha * 100).toFixed(0)}% chance pass`}
            </div>
          </div>

          {/* Card 2: Defensible KPI Threshold */}
          <div className="rounded-xl border border-hairline bg-surface p-4">
            <span className="text-xs font-medium text-ink-muted">
              Defensible {(result.desiredAlpha * 100).toFixed(0)}% KPI Threshold
            </span>
            <p className="mt-1 text-3xl font-bold tracking-tight text-ink">
              {result.defensibleThreshold.toFixed(2)}{' '}
              <span className="text-sm font-normal text-ink-muted">{unit}</span>
            </p>
            <p className="mt-1 text-xs text-ink-secondary">
              {(result.desiredAlpha * 100).toFixed(0)}th percentile (P{result.desiredAlpha.toFixed(2)}) under chance
            </p>
            <div className="mt-2 text-[11px] text-ink-muted border-t border-hairline pt-1.5">
              KPI must be set ≤ this for {result.desiredConfidence}% confidence
            </div>
          </div>

          {/* Card 3: Observed Device Metric */}
          <div className="rounded-xl border border-hairline bg-surface p-4">
            <span className="text-xs font-medium text-ink-muted">
              Observed Device {metric.toUpperCase()}
            </span>
            <p className="mt-1 text-3xl font-bold tracking-tight text-series-1">
              {result.observedMetric.toFixed(2)}{' '}
              <span className="text-sm font-normal text-ink-muted">{unit}</span>
            </p>
            <p className="mt-1 text-xs text-ink-secondary">
              Permutation p-value:{' '}
              <span className="font-semibold text-ink">
                {result.permutationPValue < 0.001
                  ? '< 0.001'
                  : result.permutationPValue.toFixed(4)}
              </span>
            </p>
            <div className="mt-2 text-[11px] text-ink-muted border-t border-hairline pt-1.5">
              Bias: {result.observedBias.toFixed(2)} | SD diff: {result.observedSdDiff.toFixed(2)}
            </div>
          </div>

          {/* Card 4: Preiss-Fisher Separation Index */}
          <div className="rounded-xl border border-hairline bg-surface p-4">
            <span className="text-xs font-medium text-ink-muted">
              Preiss–Fisher Separation Index
            </span>
            <p className="mt-1 text-3xl font-bold tracking-tight text-ink">
              {result.preissFisherSeparationIndex.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-ink-secondary">
              Observed / Chance Expected Ratio
            </p>
            <div className="mt-2 text-[11px] text-ink-muted border-t border-hairline pt-1.5">
              {result.preissFisherSeparationIndex < 0.3
                ? 'Strong separation (>70% skill)'
                : result.preissFisherSeparationIndex > 0.7
                  ? 'Weak separation (<30% skill)'
                  : 'Moderate separation'}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Visualization: Permuted Null Distribution Histogram */}
      <section className="rounded-xl border border-hairline bg-surface p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-ink">
              Permuted Chance Null Distribution vs. Proposed &amp; Observed KPIs
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Shows how the metric distributes across 10,000 random mispairings compared to
              your proposed KPI and defensible threshold.
            </p>
          </div>
          <span className="rounded-full border border-hairline bg-plane px-2.5 py-1 text-xs font-mono text-ink-secondary">
            B = 10,000 permutations
          </span>
        </div>

        <div className="my-4">
          <ChartLegend entries={legend} />
        </div>

        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={result.histogram}
              margin={{ top: 16, right: 24, bottom: 28, left: 12 }}
            >
              <CartesianGrid stroke={CHART.grid} vertical={false} />
              <XAxis
                dataKey="bin"
                type="number"
                domain={xDomain}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART.axis }}
                tickFormatter={(val: number) => val.toFixed(1)}
                label={{
                  value: `${metric.toUpperCase()} (${unit})`,
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
                tickFormatter={(val: number) => `${val.toFixed(0)}%`}
                label={{
                  value: '% of Permutations',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 8,
                  style: { ...AXIS_LABEL, textAnchor: 'middle' },
                }}
              />

              {/* Proposed KPI Reference Line */}
              <ReferenceLine
                x={proposedKpi}
                stroke={seriesColor(2)}
                strokeWidth={2.5}
                strokeDasharray="5 3"
                label={{
                  value: `Proposed KPI (${proposedKpi.toFixed(2)}) [${result.chancePassingRate.toFixed(1)}% pass]`,
                  position: 'insideTopRight',
                  style: {
                    fill: seriesColor(2),
                    fontSize: 11,
                    fontWeight: 600,
                  },
                }}
              />

              {/* Defensible Threshold Reference Line */}
              <ReferenceLine
                x={result.defensibleThreshold}
                stroke={seriesColor(6)}
                strokeWidth={2.5}
                strokeDasharray="4 4"
                label={{
                  value: `${(result.desiredAlpha * 100).toFixed(0)}% Defensible (${result.defensibleThreshold.toFixed(2)})`,
                  position: 'insideTopLeft',
                  style: {
                    fill: seriesColor(6),
                    fontSize: 11,
                    fontWeight: 600,
                  },
                }}
              />

              {/* Actual Device Observed Reference Line */}
              <ReferenceLine
                x={result.observedMetric}
                stroke={seriesColor(7)}
                strokeWidth={2.5}
                label={{
                  value: `Observed (${result.observedMetric.toFixed(2)})`,
                  position: 'insideTop',
                  style: {
                    fill: seriesColor(7),
                    fontSize: 11,
                    fontWeight: 600,
                  },
                }}
              />

              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(val: unknown) => [
                  `${typeof val === 'number' ? val.toFixed(2) : String(val)}% of trials`,
                  'Frequency',
                ]}
                labelFormatter={(val: unknown) =>
                  `${metric.toUpperCase()} ≈ ${typeof val === 'number' ? val.toFixed(2) : String(val)} ${unit}`
                }
              />

              <Bar
                dataKey="densityPercent"
                name="Permuted Chance Null"
                fill={seriesColor(1)}
                opacity={0.75}
                barSize={barSize}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic Contextual Helper */}
        <div className="mt-3 border-t border-hairline pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-ink-muted gap-2">
          <span>
            {proposedKpi <= result.defensibleThreshold ? (
              <span className="text-good font-medium">
                ✓ Proposed KPI ({proposedKpi.toFixed(2)}) sits safely at or below the{' '}
                {(result.desiredAlpha * 100).toFixed(0)}% defensible threshold (
                {result.defensibleThreshold.toFixed(2)}).
              </span>
            ) : proposedKpi > result.meanChanceMetric ? (
              <span className="text-critical font-medium">
                ⚠️ Proposed KPI ({proposedKpi.toFixed(2)}) sits above the chance mean (
                {result.meanChanceMetric.toFixed(2)}). An uncoupled device is expected to pass by
                default.
              </span>
            ) : (
              <span className="text-warning font-medium">
                ⚠️ Proposed KPI ({proposedKpi.toFixed(2)}) exceeds the{' '}
                {(result.desiredAlpha * 100).toFixed(0)}% defensible threshold (
                {result.defensibleThreshold.toFixed(2)}).
              </span>
            )}
          </span>
          <span className="shrink-0">
            Expected Chance Mean:{' '}
            <strong className="text-ink">
              {result.meanChanceMetric.toFixed(2)} {unit}
            </strong>
          </span>
        </div>
      </section>

      {/* 4. Closed-form Analytical vs Monte Carlo Verification */}
      <section aria-labelledby="analytical-section">
        <h2
          id="analytical-section"
          className="text-xs font-semibold uppercase tracking-wider text-ink-muted"
        >
          Mathematical Foundations &amp; Closed-Form Analytical References
        </h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-hairline bg-surface">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Comparison between observed data, analytical null limits, and permutation Monte Carlo
            </caption>
            <thead>
              <tr className="border-b border-hairline text-left text-xs font-medium text-ink-muted">
                <th scope="col" className="px-4 py-3">
                  Dimension
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Observed Device
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Analytical Null (Cov = 0)
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Empirical Null (10k Permutations)
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Proposed Target KPI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              <tr>
                <th scope="row" className="px-4 py-3 font-medium text-ink">
                  RMSE ({unit})
                </th>
                <td className="tabular px-4 py-3 text-right text-series-1 font-semibold">
                  {result.observedRmse.toFixed(3)}
                </td>
                <td className="tabular px-4 py-3 text-right text-ink-secondary">
                  {result.analyticalChanceRmse.toFixed(3)}
                </td>
                <td className="tabular px-4 py-3 text-right text-ink font-semibold">
                  {result.metric === 'rmse'
                    ? result.meanChanceMetric.toFixed(3)
                    : result.analyticalChanceRmse.toFixed(3)}
                </td>
                <td className="tabular px-4 py-3 text-right text-ink font-semibold">
                  {metric === 'rmse' ? proposedKpi.toFixed(3) : '—'}
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium text-ink">
                  95% LoA Half-Width ({unit})
                </th>
                <td className="tabular px-4 py-3 text-right text-series-1 font-semibold">
                  {result.observedLoa.toFixed(3)}
                </td>
                <td className="tabular px-4 py-3 text-right text-ink-secondary">
                  {result.analyticalChanceLoa.toFixed(3)}
                </td>
                <td className="tabular px-4 py-3 text-right text-ink font-semibold">
                  {result.metric === 'loa'
                    ? result.meanChanceMetric.toFixed(3)
                    : result.analyticalChanceLoa.toFixed(3)}
                </td>
                <td className="tabular px-4 py-3 text-right text-ink font-semibold">
                  {metric === 'loa' ? proposedKpi.toFixed(3) : '—'}
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium text-ink">
                  MAE ({unit})
                </th>
                <td className="tabular px-4 py-3 text-right text-series-1 font-semibold">
                  {result.observedMae.toFixed(3)}
                </td>
                <td className="tabular px-4 py-3 text-right text-ink-secondary">
                  {result.analyticalChanceMae.toFixed(3)}
                </td>
                <td className="tabular px-4 py-3 text-right text-ink font-semibold">
                  {result.metric === 'mae'
                    ? result.meanChanceMetric.toFixed(3)
                    : result.analyticalChanceMae.toFixed(3)}
                </td>
                <td className="tabular px-4 py-3 text-right text-ink font-semibold">
                  {metric === 'mae' ? proposedKpi.toFixed(3) : '—'}
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-3 font-medium text-ink">
                  Variance Decomposition
                </th>
                <td className="tabular px-4 py-3 text-right text-ink-secondary">
                  s_diff² = {(result.observedSdDiff ** 2).toFixed(3)}
                </td>
                <td className="tabular px-4 py-3 text-right text-ink-secondary">
                  Var_pop(X) + Var_pop(Y) ={' '}
                  {(result.referencePopVar + result.devicePopVar).toFixed(3)}
                </td>
                <td className="tabular px-4 py-3 text-right text-ink-secondary">
                  E[MSE] = {result.analyticalChanceMse.toFixed(3)}
                </td>
                <td className="tabular px-4 py-3 text-right text-ink-muted">—</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Under random mispairing (Cov(X, Y) = 0), E[MSE_chance] = Var_pop(X) + Var_pop(Y) + (μ_X − μ_Y)².
          Notice how the 10,000 Monte Carlo permutations closely converge to this analytical
          expectation.
        </p>
      </section>

      {/* 5. Methods Text */}
      <MethodsText
        text={
          `To verify that meeting the proposed KPI (${proposedKpi.toFixed(2)} ${unit}) was not ` +
          `an artifact of restricted dynamic range, a Preiss–Fisher permutation analysis was performed ` +
          `(Preiss & Fisher, 2008). The paired reference and test observations (N = ${result.sampleSize}, ` +
          `reference SD = ${result.referenceSd.toFixed(2)} ${unit}) were randomly mispaired across ` +
          `10,000 iterations to generate the empirical null distribution under independence. ` +
          `The chance passing rate was ${result.chancePassingRate.toFixed(1)}%. ` +
          `To maintain a false-positive passing rate <= ${(result.desiredAlpha * 100).toFixed(0)}% under uncoupled conditions, the defensible ` +
          `KPI threshold is <= ${result.defensibleThreshold.toFixed(2)} ${unit}. ` +
          `The observed device achieved ${result.observedMetric.toFixed(2)} ${unit} ` +
          `(permutation p = ${result.permutationPValue < 0.001 ? '< 0.001' : result.permutationPValue.toFixed(4)}, ` +
          `Preiss–Fisher separation index = ${result.preissFisherSeparationIndex.toFixed(2)}).`
        }
        citations={[PREISS_FISHER_2008, BLAND_ALTMAN_1986, SERFLING_1980]}
      />

      {/* 6. Next Steps */}
      <NextSteps
        offer={{
          n: activeSampleSize,
          source: 'Pass by chance? evaluation',
        }}
        steps={[
          {
            to: '/repeated-measures',
            title: 'Account for repeated measures',
            description:
              'Decompose between- vs within-subject variance and size for clustered replicates.',
          },
          {
            to: '/report-studio',
            title: 'Report findings across stakeholders',
            description:
              'Present clinical tolerance scorecards, Bland–Altman agreement, and survival of error.',
          },
          {
            to: '/academy',
            title: 'Validation Academy: Case Studies',
            description:
              'See false-pass hazards and Winner\'s Curse dynamics in action across the 8 Meridian PulseBand 2 modules.',
          },
          {
            to: '/agreement',
            title: 'Single-sample agreement sizing',
            description:
              'Calculate sample size for Bland–Altman limits-of-agreement precision or equivalence.',
          },
          {
            to: '/precision',
            title: 'Study precision vs n',
            description:
              'Evaluate bias and limits-of-agreement confidence widths across sample size.',
          },
        ]}
      />
    </ModulePage>
  );
}
