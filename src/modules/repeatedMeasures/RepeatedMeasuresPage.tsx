import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import ModulePage from '../../components/common/ModulePage.tsx';
import MethodsText from '../../components/common/MethodsText.tsx';
import NumberField from '../../components/common/NumberField.tsx';
import SelectField from '../../components/common/SelectField.tsx';
import ChartLegend from '../../components/common/ChartLegend.tsx';
import DataTable from '../../components/common/DataTable.tsx';
import type { TableColumn } from '../../components/common/DataTable.tsx';
import NextSteps from '../../app/study/NextSteps.tsx';
import { useStudy } from '../../app/study/StudyContext.tsx';
import { AXIS_LABEL, AXIS_TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import { BLAND_ALTMAN_1999, BLAND_ALTMAN_2007, ZOU_2013 } from '../../content/citations.ts';
import {
  REPEATED_MEASURES_PRESETS,
  analyzeRepeatedMeasuresDesign,
  biasMarginRepeated,
  effectiveSampleSize,
  loaMarginRepeated,
  partitionFromIcc,
  replicateSweep,
  solveRequiredM,
  subjectSweep,
  type RepeatedMeasuresPreset,
  type ReplicateSweepPoint,
} from './repeatedMeasuresModel.ts';

const CONFIDENCE_OPTIONS = [
  { value: '0.9', label: '90%' },
  { value: '0.95', label: '95%' },
  { value: '0.99', label: '99%' },
] as const;

export default function RepeatedMeasuresPage() {
  const { study } = useStudy();

  // Active preset or custom: if study.n is present and doesn't match default SpO2 (24), mark custom
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() =>
    study.n && study.n !== 24 ? 'custom' : 'spo2',
  );

  // Core study parameters
  const [m, setM] = useState<number>(() => study.n ?? 24);
  const [k, setK] = useState<number>(6);
  const [icc, setIcc] = useState<number>(0.65);
  const [confidence, setConfidence] = useState<string>(() => String(study.confidence));
  const [targetMargin, setTargetMargin] = useState<number>(0.4);

  // Optional real-unit scaling
  const [sdTotalInput, setSdTotalInput] = useState<number>(() => study.measurementSd ?? 2.5);
  const [unit, setUnit] = useState<string>(() => study.unit || '%');

  // Chart view mode: 'replicates' (diminishing returns) or 'participants' (sample sizing)
  const [chartMode, setChartMode] = useState<'replicates' | 'participants'>('replicates');

  function applyPreset(preset: RepeatedMeasuresPreset) {
    setSelectedPresetId(preset.id);
    setM(preset.defaultM);
    setK(preset.defaultK);
    setIcc(preset.defaultIcc);
    if (preset.suggestedSdTotal !== undefined) {
      setSdTotalInput(preset.suggestedSdTotal);
    }
    if (preset.unit !== undefined) {
      setUnit(preset.unit);
    }
  }

  const confNum = Number(confidence);
  const sdScale = sdTotalInput > 0 ? sdTotalInput : 1.0;

  const analysis = useMemo(
    () => analyzeRepeatedMeasuresDesign(m, k, icc, confNum, 1.959963984540054, 1.0),
    [m, k, icc, confNum],
  );

  const variancePart = useMemo(() => partitionFromIcc(sdScale, icc), [sdScale, icc]);

  const repMaxK = Math.min(100, Math.max(20, k));
  const repCurve = useMemo(
    () => replicateSweep(m, icc, repMaxK, confNum, 1.959963984540054, 1.0),
    [m, icc, repMaxK, confNum],
  );

  const subjMaxM = Math.max(120, Math.min(1000, Math.ceil(m * 1.25)));
  const subjCurve = useMemo(() => {
    const step = subjMaxM > 250 ? Math.ceil(subjMaxM / 150) : 1;
    const points = subjectSweep(k, icc, 2, subjMaxM, step, confNum, 1.959963984540054, 1.0);
    if (!points.some((p) => p.m === m)) {
      points.push({
        m,
        nObs: m * k,
        nEffective: effectiveSampleSize(m, k, icc),
        biasMargin: biasMarginRepeated(m, k, icc, confNum, 1.0),
        loaMargin: loaMarginRepeated(m, k, icc, confNum, 1.959963984540054, 1.0),
      });
      points.sort((a, b) => a.m - b.m);
    }
    return points;
  }, [k, icc, subjMaxM, m, confNum]);

  const requiredM = useMemo(
    () => solveRequiredM(targetMargin, k, icc, confNum, 1.959963984540054, 1.0),
    [targetMargin, k, icc, confNum],
  );

  const protocolText = useMemo(() => {
    const unitPart =
      sdTotalInput > 0
        ? ` (±${(analysis.biasMargin * sdScale).toFixed(2)} ${unit})`
        : '';
    const loaUnitPart =
      sdTotalInput > 0
        ? ` (±${(analysis.loaMargin * sdScale).toFixed(2)} ${unit})`
        : '';
    return (
      `Sample size and replicate allocation were planned for a paired validation study with repeated measures. ` +
      `The protocol recruits ${m} participants with ${k} paired observations per participant (${analysis.nObs} total paired observations). ` +
      `Assuming an intraclass correlation of differences ρ = ${icc.toFixed(2)} (variance partition: ${variancePart.betweenSharePct.toFixed(0)}% between-subject, ${variancePart.withinSharePct.toFixed(0)}% within-subject), ` +
      `the design effect is ${analysis.deff.toFixed(2)}, yielding an effective sample size of ${analysis.nEffective.toFixed(1)} independent observations. ` +
      `At a ${(confNum * 100).toFixed(0)}% confidence level, this yields a margin of error around the mean bias of ±${analysis.biasMargin.toFixed(3)} SD${unitPart} ` +
      `and around the limits of agreement of ±${analysis.loaMargin.toFixed(3)} SD${loaUnitPart}, ` +
      `following the random-effects ANOVA limits-of-agreement formulation in Bland & Altman (2007) and Zou (2013).`
    );
  }, [m, k, analysis, icc, variancePart, confNum, sdTotalInput, sdScale, unit]);

  // Dynamic allocation matrix comparing allocations for the current observation budget N = m * k
  const totalObsBudget = m * k;
  const budgetComparisons = useMemo(() => {
    const standardKs = [1, 2, 3, 4, 6, 8, 10, 12, 16, 20];
    const candidateKs = Array.from(new Set([...standardKs, k]))
      .filter((kVal) => kVal >= 1 && kVal <= Math.max(20, k))
      .sort((a, b) => a - b);

    const allocationsMap = new Map<number, { mVal: number; kVal: number }>();
    allocationsMap.set(k, { mVal: m, kVal: k });

    for (const kVal of candidateKs) {
      if (allocationsMap.has(kVal)) continue;
      const mVal = Math.max(2, Math.round(totalObsBudget / kVal));
      allocationsMap.set(kVal, { mVal, kVal });
    }

    const allocations = Array.from(allocationsMap.values()).sort(
      (a, b) => a.mVal - b.mVal,
    );

    return allocations.map((alloc) => {
      const res = analyzeRepeatedMeasuresDesign(
        alloc.mVal,
        alloc.kVal,
        icc,
        confNum,
        1.959963984540054,
        1.0,
      );
      return {
        key: `${alloc.mVal}x${alloc.kVal}`,
        m: alloc.mVal,
        k: alloc.kVal,
        nObs: alloc.mVal * alloc.kVal,
        nEffective: res.nEffective,
        loaMarginNorm: res.loaMargin,
        biasMarginNorm: res.biasMargin,
      };
    });
  }, [m, k, totalObsBudget, icc, confNum]);

  const tableColumns: TableColumn<ReplicateSweepPoint>[] = [
    {
      key: 'k',
      header: 'Replicates (k)',
      render: (row) => `${row.k}`,
      numeric: true,
    },
    {
      key: 'nObs',
      header: 'Total obs (N)',
      render: (row) => `${row.nObs}`,
      numeric: true,
    },
    {
      key: 'nEffective',
      header: 'Effective N',
      render: (row) => row.nEffective.toFixed(1),
      numeric: true,
    },
    {
      key: 'biasMargin',
      header: 'Bias margin (±SD)',
      render: (row) => `±${row.biasMargin.toFixed(3)}`,
      numeric: true,
    },
    {
      key: 'loaMargin',
      header: 'LoA margin (±SD)',
      render: (row) => `±${row.loaMargin.toFixed(3)}`,
      numeric: true,
    },
    {
      key: 'gain',
      header: 'Marginal gain',
      render: (row) =>
        row.k === 1 ? '—' : `-${row.marginalLoaGainPct.toFixed(1)}% error`,
      numeric: true,
    },
  ];

  return (
    <ModulePage
      eyebrow="PROTOCOL STUDIO"
      title="How many subjects and replicates do I need?"
      currentN={m}
      method="Within-subject repeated measures & variance decomposition"
      intro={
        <>
          <p>
            Almost every wearable, biosensor, and diagnostic algorithm validation study
            collects repeated paired measurements per participant — such as multiple
            exercise stages, oxygen desaturation plateaus, or multi-day glucose readings.
          </p>
          <p>
            Treating repeated rows as independent observations is the single most common
            and catastrophic statistical flaw in validation studies: it ignores
            between-subject clustering and makes limits of agreement appear falsely precise.
            This calculator decomposes between- versus within-subject variance, computes
            the <strong>effective sample size (n_effective)</strong>, and reveals the exact
            trade-off between recruiting more participants and taking more replicates.
          </p>
        </>
      }
      assumption={
        <>
          paired differences follow a one-way random-effects model (Bland &amp; Altman 2007)
          with homogeneous within-subject variance across participants and no proportional
          bias over measurement levels.
        </>
      }
      methodNotes={
        <>
          <p>
            In a repeated-measures design with <code className="tabular text-ink">m</code>{' '}
            participants and <code className="tabular text-ink">k</code> replicates per
            participant (total paired rows <code className="tabular text-ink">N = m × k</code>),
            the total variance of paired differences partitions into between-subject variance{' '}
            <code className="tabular text-ink">σ²_between</code> and within-subject variance{' '}
            <code className="tabular text-ink">σ²_within</code>.
          </p>
          <p>
            The Intraclass Correlation is{' '}
            <code className="tabular text-ink">ρ = σ²_between / (σ²_between + σ²_within)</code>.
            Because observations within a subject share the same subject-specific bias,
            each additional replicate yields diminishing independent information. The Design
            Effect (clustering penalty) is{' '}
            <code className="tabular text-ink">DEFF = 1 + (k − 1)ρ</code>, which reduces the
            effective independent sample size to:
          </p>
          <div className="rounded-md bg-plane p-3 text-center font-mono text-sm text-ink">
            n_effective = (m × k) / [1 + (k − 1)ρ] = m / [ρ + (1 − ρ) / k]
          </div>
          <p>
            As <code className="tabular text-ink">k → ∞</code>, the effective sample size is
            strictly bounded by{' '}
            <strong className="text-ink">m / ρ</strong>. No matter how many thousands of
            replicates you collect from each participant, you can never exceed that ceiling
            without recruiting more participants.
          </p>
          <p>
            Limits of agreement precision follows the Satterthwaite-approximated variance of
            the total standard deviation estimator (Bland &amp; Altman 1999, 2007; Zou 2013).
            When <code className="tabular text-ink">k = 1</code>, the formulas simplify
            identically to the classical single-observation Bland-Altman confidence intervals.
          </p>
        </>
      }
      controls={
        <>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Preset Study Architecture
            </span>
            <div
              className="mt-2 flex flex-wrap gap-1.5"
              role="group"
              aria-label="Preset study architecture"
            >
              {REPEATED_MEASURES_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={selectedPresetId === preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedPresetId === preset.id
                      ? 'bg-ink text-plane'
                      : 'border border-hairline bg-surface text-ink-secondary hover:text-ink'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            {selectedPresetId && (
              <p className="mt-2 text-xs text-ink-muted">
                {
                  REPEATED_MEASURES_PRESETS.find((p) => p.id === selectedPresetId)
                    ?.description
                }
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Participants (m)"
              value={m}
              onChange={(val) => {
                setSelectedPresetId('custom');
                setM(Math.max(2, Math.round(val) || 2));
              }}
              min={2}
              max={1000}
              step={1}
              hint="Number of distinct human subjects recruited."
            />
            <NumberField
              label="Replicates per subject (k)"
              value={k}
              onChange={(val) => {
                setSelectedPresetId('custom');
                setK(Math.max(1, Math.round(val) || 1));
              }}
              min={1}
              max={100}
              step={1}
              hint="Paired readings per participant."
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <span>Intraclass Correlation (ICC, ρ)</span>
              <span className="tabular font-mono text-ink">{icc.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.99}
              step={0.01}
              value={icc}
              onChange={(e) => {
                setSelectedPresetId('custom');
                setIcc(Number(e.target.value));
              }}
              className="mt-2 w-full accent-series-1"
            />
            <div className="mt-1 flex justify-between text-[11px] text-ink-muted">
              <span>0.0 (Uncorrelated)</span>
              <span>0.5 (Moderate)</span>
              <span>1.0 (Identical)</span>
            </div>
          </div>

          <SelectField
            label="Confidence level"
            value={confidence}
            options={CONFIDENCE_OPTIONS}
            onChange={setConfidence}
          />

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Expected Total SD"
              value={sdTotalInput}
              onChange={(val) => {
                if (Number.isFinite(val) && val > 0) setSdTotalInput(val);
              }}
              min={0.1}
              max={1000}
              step={0.1}
              hint="Measurement spread in physical units."
            />
            <div>
              <label
                htmlFor="unit-field"
                className="block text-xs font-semibold uppercase tracking-wide text-ink-muted"
              >
                Unit label
              </label>
              <input
                id="unit-field"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. bpm, %"
                className="mt-1.5 w-full rounded-md border border-hairline bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:border-series-1 focus:outline-none"
              />
            </div>
          </div>

          <NumberField
            label="Target LoA Margin (in SD)"
            value={targetMargin}
            onChange={(val) => {
              if (Number.isFinite(val) && val > 0) setTargetMargin(val);
            }}
            min={0.05}
            max={2.0}
            step={0.05}
            suffix="SD"
            hint="Desired precision boundary for limits of agreement."
          />
        </>
      }
    >
      <div className="space-y-8">
        {/* Top Key Result Cards */}
        <section aria-labelledby="primary-metrics">
          <h2 id="primary-metrics" className="sr-only">
            Primary Study Design Metrics
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-hairline bg-surface p-4">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                Total Observations (N)
              </span>
              <p className="mt-2 text-2xl font-bold tabular tracking-tight text-ink">
                {analysis.nObs}
              </p>
              <p className="mt-1 text-xs text-ink-secondary">
                {m} subjects × {k} replicates
              </p>
            </div>

            <div className="rounded-xl border border-hairline bg-surface p-4">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                Effective Sample Size
              </span>
              <p className="mt-2 text-2xl font-bold tabular tracking-tight text-series-1">
                {analysis.nEffective.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-ink-secondary">
                DEFF = {analysis.deff.toFixed(2)} (clustering penalty)
              </p>
            </div>

            <div className="rounded-xl border border-hairline bg-surface p-4">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                Bias Margin of Error
              </span>
              <p className="mt-2 text-2xl font-bold tabular tracking-tight text-ink">
                ±{analysis.biasMargin.toFixed(3)}{' '}
                <span className="text-xs font-normal text-ink-muted">SD</span>
              </p>
              <p className="mt-1 text-xs tabular text-ink-secondary">
                {sdTotalInput > 0 &&
                  `±${(analysis.biasMargin * sdScale).toFixed(2)} ${unit}`}
              </p>
            </div>

            <div className="rounded-xl border border-hairline bg-surface p-4">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                LoA Margin of Error
              </span>
              <p className="mt-2 text-2xl font-bold tabular tracking-tight text-series-2">
                ±{analysis.loaMargin.toFixed(3)}{' '}
                <span className="text-xs font-normal text-ink-muted">SD</span>
              </p>
              <p className="mt-1 text-xs tabular text-ink-secondary">
                {sdTotalInput > 0 &&
                  `±${(analysis.loaMargin * sdScale).toFixed(2)} ${unit}`}
              </p>
            </div>
          </div>
        </section>

        {/* Variance Partitioning Breakdown */}
        <section aria-labelledby="variance-breakdown" className="rounded-xl border border-hairline bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
            <div>
              <h3 id="variance-breakdown" className="text-sm font-semibold text-ink">
                Variance Components Decomposition (Bland &amp; Altman 2007)
              </h3>
              <p className="text-xs text-ink-muted">
                Total variance of paired differences = between-subject variance (σ²_b) + within-subject variance (σ²_w)
              </p>
            </div>
            <span className="text-xs font-medium text-ink-secondary">
              ICC (ρ) = <strong className="text-ink">{icc.toFixed(2)}</strong>
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-hairline bg-surface-raised p-3">
              <span className="text-xs text-ink-muted">Between-Subject Variance (σ²_b)</span>
              <p className="mt-1 text-base font-semibold tabular text-ink">
                {variancePart.betweenSharePct.toFixed(0)}% of total spread
              </p>
              <p className="mt-0.5 text-xs tabular text-ink-secondary">
                SD = {variancePart.sdBetween.toFixed(2)} {unit}
              </p>
            </div>
            <div className="rounded-lg border border-hairline bg-surface-raised p-3">
              <span className="text-xs text-ink-muted">Within-Subject Variance (σ²_w)</span>
              <p className="mt-1 text-base font-semibold tabular text-ink">
                {variancePart.withinSharePct.toFixed(0)}% of total spread
              </p>
              <p className="mt-0.5 text-xs tabular text-ink-secondary">
                SD = {variancePart.sdWithin.toFixed(2)} {unit}
              </p>
            </div>
            <div className="rounded-lg border border-hairline bg-surface-raised p-3">
              <span className="text-xs text-ink-muted">Total Variance (σ²_total)</span>
              <p className="mt-1 text-base font-semibold tabular text-ink">
                100% total variance
              </p>
              <p className="mt-0.5 text-xs tabular text-ink-secondary">
                Total SD = {variancePart.sdTotal.toFixed(2)} {unit}
              </p>
            </div>
          </div>
        </section>

        {/* Hazard Callout: Naive Independence vs Clustered Truth */}
        {k > 1 && icc > 0.001 && (
          <div className="flex items-start gap-3.5 rounded-xl border border-hairline bg-surface p-5">
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-amber-500"
              aria-hidden
            />
            <div className="space-y-1 text-sm leading-relaxed">
              <h3 className="font-semibold text-ink">
                The Cost of Ignoring Clustering
              </h3>
              <p className="text-ink-secondary">
                If an analyst mistakenly treats all <strong className="text-ink">{analysis.nObs}</strong> rows
                as independent, they will claim limits of agreement precision is{' '}
                <span className="tabular font-medium text-ink">±{analysis.naiveLoaMargin.toFixed(3)} SD</span>{' '}
                instead of the true{' '}
                <span className="tabular font-medium text-ink">±{analysis.loaMargin.toFixed(3)} SD</span>.
                That understates the uncertainty by{' '}
                <strong className="text-red-500 tabular">
                  {analysis.underestimationLoaPct.toFixed(0)}%
                </strong>.
              </p>
              {Number.isFinite(analysis.maxNEffective) ? (
                <p className="text-xs text-ink-muted">
                  Effective information is bounded: even with infinite replicates per subject,
                  this cohort will never exceed an effective sample size of{' '}
                  <strong className="text-ink">{analysis.maxNEffective.toFixed(1)}</strong> independent observations.
                </p>
              ) : (
                <p className="text-xs text-ink-muted">
                  At ρ = 0, observations within a subject are independent, so effective sample size equals total observations.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Target Sizing Solution */}
        <div className="rounded-xl border border-hairline bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Required Participants for Target LoA Margin (±{targetMargin} SD)
              </h3>
              <p className="text-xs text-ink-muted">
                At replicate depth k = {k} and ICC = {icc.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {requiredM !== null ? (
                <>
                  <span className="text-xl font-bold tabular text-ink">
                    {requiredM}{' '}
                    <span className="text-sm font-medium text-ink-muted">
                      participants ({requiredM * k} total obs)
                    </span>
                  </span>
                  {requiredM !== m && (
                    <button
                      type="button"
                      onClick={() => {
                        setM(requiredM);
                        setSelectedPresetId('custom');
                      }}
                      className="rounded-md border border-series-1 bg-surface px-2.5 py-1 text-xs font-medium text-series-1 transition-colors hover:bg-series-1/10"
                    >
                      Apply m = {requiredM}
                    </button>
                  )}
                </>
              ) : (
                <span className="text-sm text-ink-muted">
                  Unreachable at this replicate depth
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Visualization Section */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-ink">
                {chartMode === 'replicates'
                  ? `Replicate Depth: Diminishing Returns (k = 1…${repMaxK})`
                  : `Participant Scaling Curve (m = 2…${subjMaxM})`}
              </h3>
              <p className="text-xs text-ink-muted">
                {chartMode === 'replicates'
                  ? `Fixed at m = ${m} participants. Watch effective sample size and precision flatten.`
                  : `Fixed at k = ${k} replicates per participant.`}
              </p>
            </div>
            <div
              role="group"
              aria-label="Chart view mode"
              className="flex items-center gap-1 rounded-lg border border-hairline bg-surface p-1 text-xs"
            >
              <button
                type="button"
                aria-pressed={chartMode === 'replicates'}
                onClick={() => setChartMode('replicates')}
                className={`rounded-md px-3 py-1 font-medium transition-colors ${
                  chartMode === 'replicates'
                    ? 'bg-ink text-plane'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                Vary replicates (k)
              </button>
              <button
                type="button"
                aria-pressed={chartMode === 'participants'}
                onClick={() => setChartMode('participants')}
                className={`rounded-md px-3 py-1 font-medium transition-colors ${
                  chartMode === 'participants'
                    ? 'bg-ink text-plane'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                Vary participants (m)
              </button>
            </div>
          </div>

          <ChartLegend
            entries={[
              { key: 'loa', label: 'LoA margin of error (±SD)', colorSlot: 2 },
              { key: 'bias', label: 'Bias margin of error (±SD)', colorSlot: 1 },
            ]}
          />

          <div className="h-72 w-full rounded-xl border border-hairline bg-surface p-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'replicates' ? (
                <LineChart data={repCurve} margin={{ top: 10, right: 15, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="k"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tick={AXIS_TICK}
                    label={{
                      value: 'Replicates per participant (k)',
                      position: 'bottom',
                      offset: 5,
                      style: AXIS_LABEL,
                    }}
                  />
                  <YAxis
                    tick={AXIS_TICK}
                    domain={[0, 'auto']}
                    label={{
                      value: 'Margin of error (SD)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 15,
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
                      typeof value === 'number'
                        ? `±${value.toFixed(3)} SD`
                        : String(value ?? '')
                    }
                    labelFormatter={(val) => `Replicates k = ${val}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="loaMargin"
                    name="LoA margin"
                    stroke={seriesColor(2)}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="biasMargin"
                    name="Bias margin"
                    stroke={seriesColor(1)}
                    strokeWidth={2}
                    dot={false}
                  />
                  <ReferenceDot
                    x={k}
                    y={analysis.loaMargin}
                    r={5}
                    fill={seriesColor(2)}
                    stroke="#fff"
                  />
                  <ReferenceDot
                    x={k}
                    y={analysis.biasMargin}
                    r={5}
                    fill={seriesColor(1)}
                    stroke="#fff"
                  />
                </LineChart>
              ) : (
                <LineChart data={subjCurve} margin={{ top: 10, right: 15, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="m"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tick={AXIS_TICK}
                    label={{
                      value: 'Participants (m)',
                      position: 'bottom',
                      offset: 5,
                      style: AXIS_LABEL,
                    }}
                  />
                  <YAxis
                    tick={AXIS_TICK}
                    domain={[0, 'auto']}
                    label={{
                      value: 'Margin of error (SD)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 15,
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
                      typeof value === 'number'
                        ? `±${value.toFixed(3)} SD`
                        : String(value ?? '')
                    }
                    labelFormatter={(val) => `${val} participants`}
                  />
                  <Line
                    type="monotone"
                    dataKey="loaMargin"
                    name="LoA margin"
                    stroke={seriesColor(2)}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="biasMargin"
                    name="Bias margin"
                    stroke={seriesColor(1)}
                    strokeWidth={2}
                    dot={false}
                  />
                  <ReferenceDot
                    x={m}
                    y={analysis.loaMargin}
                    r={5}
                    fill={seriesColor(2)}
                    stroke="#fff"
                  />
                  <ReferenceDot
                    x={m}
                    y={analysis.biasMargin}
                    r={5}
                    fill={seriesColor(1)}
                    stroke="#fff"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        {/* Observation Budget Trade-off Table */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Participant vs Replicate Allocation Matrix
              </h3>
              <p className="text-xs text-ink-muted">
                Comparing alternative allocations for your observation budget (~{totalObsBudget} total observations).
                Notice how shifting budget from replicates into participants dramatically increases
                effective information and tightens the limits of agreement. Click any row to adopt that design.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-hairline bg-surface-raised text-xs font-semibold uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5">Design (m × k)</th>
                  <th className="px-4 py-2.5 text-right">Total Obs</th>
                  <th className="px-4 py-2.5 text-right">Effective N</th>
                  <th className="px-4 py-2.5 text-right">Efficiency</th>
                  <th className="px-4 py-2.5 text-right">Bias Margin (±SD)</th>
                  <th className="px-4 py-2.5 text-right">LoA Margin (±SD)</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {budgetComparisons.map((row) => {
                  const isCurrent = row.m === m && row.k === k;
                  const effRatio = ((row.nEffective / row.nObs) * 100).toFixed(0);
                  return (
                    <tr
                      key={row.key}
                      onClick={() => {
                        if (!isCurrent) {
                          setM(row.m);
                          setK(row.k);
                          setSelectedPresetId('custom');
                        }
                      }}
                      className={`cursor-pointer transition-colors ${
                        isCurrent ? 'bg-series-1/10 font-medium' : 'hover:bg-ink/5'
                      }`}
                      title={
                        isCurrent
                          ? 'Current study design'
                          : `Click to switch study design to ${row.m} subjects × ${row.k} replicates`
                      }
                    >
                      <td className="px-4 py-2.5">
                        {row.m} subjects × {row.k} reps
                        {isCurrent && (
                          <span className="ml-2 rounded-full bg-series-1 px-2 py-0.5 text-[10px] text-plane">
                            Selected
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular text-ink-secondary">
                        {row.nObs}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular font-semibold text-series-1">
                        {row.nEffective.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular text-ink-muted">
                        {effRatio}%
                      </td>
                      <td className="px-4 py-2.5 text-right tabular text-ink-secondary">
                        ±{row.biasMarginNorm.toFixed(3)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular text-ink">
                        ±{row.loaMarginNorm.toFixed(3)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {isCurrent ? (
                          <span className="text-xs font-semibold text-series-1">Active</span>
                        ) : (
                          <span className="text-xs text-ink-muted underline underline-offset-2 hover:text-ink">
                            Apply
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed Replicate Schedule Table */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-ink">
            Marginal Returns Table for m = {m} Participants
          </h3>
          <DataTable
            rows={repCurve}
            rowKey={(row) => row.k}
            columns={tableColumns}
            caption={`Marginal gains per added replicate for ${m} subjects with ICC = ${icc.toFixed(2)}.`}
          />
        </section>

        {/* Ecosystem Connections: agreekit & Health Data Distributions */}
        <section className="rounded-xl border border-hairline bg-surface p-5">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="mt-0.5 shrink-0 text-series-1" aria-hidden />
            <div className="space-y-2 text-sm leading-relaxed text-ink-secondary">
              <h3 className="font-semibold text-ink">
                Execution &amp; Post-Study Analysis with agreekit
              </h3>
              <p>
                Once your study collects paired data, analyse it with{' '}
                <a
                  href="https://github.com/ross-wilkinson/agreekit"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-series-1 underline underline-offset-2 hover:opacity-80"
                >
                  agreekit <ExternalLink size={13} aria-hidden />
                </a>
                , the companion Python package that implements the same repeated-measures
                variance decomposition, exact Carkeet confidence intervals, and cluster-bootstrap
                limits of agreement.
              </p>
              <div className="mt-2 rounded-md bg-plane p-3 font-mono text-xs text-ink">
                import agreekit as ak
                <br />
                table = ak.agreement_table(data, device="device", reference="gold_std", subject="subject_id")
                <br />
                print(ak.methods_text(table))
              </div>
            </div>
          </div>
        </section>

        {/* Carry Plan / Next Steps */}
        <NextSteps
          offer={{ n: m, source: 'Within-Subject Repeated Measures' }}
          confidence={confNum}
          steps={[
            {
              to: '/precision',
              title: 'Check precision across full estimands',
              description:
                'Inspect the bias, 95% LoA, P50, and P90 percentile curves against sample size.',
            },
            {
              to: '/demographics',
              title: 'Plan demographic recruitment targets',
              description:
                'Distribute these participants across sex, age brackets, or Monk skin tones with strict quota caps.',
            },
            {
              to: '/timeline',
              title: 'Estimate study duration with Monte Carlo',
              description:
                'Simulate screening, repeated-visit lab testing, and analysis timelines.',
            },
            {
              to: '/report-studio',
              title: 'Report Studio: Launch Gates',
              description:
                'Synthesize multi-replicate study results into two-gate launch decisions and Bland-Altman agreement clusters.',
            },
          ]}
        />

        {/* References */}
        <MethodsText
          text={protocolText}
          citations={[BLAND_ALTMAN_1999, BLAND_ALTMAN_2007, ZOU_2013]}
        />
      </div>
    </ModulePage>
  );
}
