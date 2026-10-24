import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import ModulePage from '../../components/common/ModulePage.tsx';
import NumberField from '../../components/common/NumberField.tsx';
import SelectField from '../../components/common/SelectField.tsx';
import DataTable from '../../components/common/DataTable.tsx';
import type { TableColumn } from '../../components/common/DataTable.tsx';
import NextSteps from '../../app/study/NextSteps.tsx';
import { AXIS_LABEL, AXIS_TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import { BLAND_ALTMAN_1986, BLAND_ALTMAN_2007, ZOU_2013 } from '../../content/citations.ts';
import {
  REPORT_STUDIO_PRESETS,
  computeAgreementMetrics,
  computeSurvivalCurve,
  generateExecutiveScorecard,
  generatePlxJsonSummary,
  generateStandaloneHtmlReport,
  generateSyntheticPairedData,
  type PairedObservation,
  type SurvivalPoint,
} from './reportStudioModel.ts';

const PRESET_OPTIONS = REPORT_STUDIO_PRESETS.map((p) => ({
  value: p.id,
  label: p.name,
}));

const LENS_OPTIONS = [
  { value: 'all', label: 'All Stakeholders (Consolidated)' },
  { value: 'product', label: 'Product & Executive Lens' },
  { value: 'engineering', label: 'Algorithm & Engineering Lens' },
  { value: 'clinical', label: 'Clinical & Regulatory Lens' },
] as const;

export default function ReportStudioPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('spo2');
  const [activeLens, setActiveLens] = useState<'all' | 'product' | 'engineering' | 'clinical'>('all');
  const [blandAltmanView, setBlandAltmanView] = useState<'all' | 'centroids'>('all');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Active preset configuration
  const currentPreset = useMemo(
    () => REPORT_STUDIO_PRESETS.find((p) => p.id === selectedPresetId) ?? REPORT_STUDIO_PRESETS[0]!,
    [selectedPresetId],
  );

  // Editable parameters
  const [m, setM] = useState<number>(() => currentPreset.defaultM);
  const [k, setK] = useState<number>(() => currentPreset.defaultK);
  const [bias, setBias] = useState<number>(() => currentPreset.defaultBias);
  const [sdB, setSdB] = useState<number>(() => currentPreset.defaultSdB);
  const [sdW, setSdW] = useState<number>(() => currentPreset.defaultSdW);
  const [toleranceWindow, setToleranceWindow] = useState<number>(() => currentPreset.toleranceWindow);
  const [outlierRate, setOutlierRate] = useState<number>(() => currentPreset.defaultOutlierRate);

  // Handle switching preset
  function handlePresetChange(presetId: string) {
    const p = REPORT_STUDIO_PRESETS.find((item) => item.id === presetId);
    if (!p) return;
    setSelectedPresetId(presetId);
    setM(p.defaultM);
    setK(p.defaultK);
    setBias(p.defaultBias);
    setSdB(p.defaultSdB);
    setSdW(p.defaultSdW);
    setToleranceWindow(p.toleranceWindow);
    setOutlierRate(p.defaultOutlierRate);
  }

  // Sanitize user inputs against degenerate inputs (0, empty, negative)
  const safeM = Math.max(2, Math.round(m) || 2);
  const safeK = Math.max(1, Math.round(k) || 1);
  const safeBias = Number.isFinite(bias) ? bias : currentPreset.defaultBias;
  const safeSdB = Math.max(0, Number.isFinite(sdB) ? sdB : 0);
  const safeSdW = Math.max(0.01, Number.isFinite(sdW) ? sdW : 0.01);
  const safeTolerance = Math.max(0.1, Number.isFinite(toleranceWindow) ? toleranceWindow : 0.1);
  const safeOutlierRate = Math.max(0, Math.min(0.5, Number.isFinite(outlierRate) ? outlierRate : 0));

  // Generate synthetic data adhering to the hierarchical model
  const { observations, centroids } = useMemo(
    () =>
      generateSyntheticPairedData({
        m: safeM,
        k: safeK,
        bias: safeBias,
        sdB: safeSdB,
        sdW: safeSdW,
        outlierRate: safeOutlierRate,
        outlierScale: currentPreset.defaultOutlierScale,
        seed: 42,
        refRange:
          currentPreset.id === 'spo2'
            ? [70, 99]
            : currentPreset.id === 'heart-rate'
              ? [45, 185]
              : [300, 520],
      }),
    [safeM, safeK, safeBias, safeSdB, safeSdW, safeOutlierRate, currentPreset],
  );

  // Compute cluster-aware ANOVA agreement metrics
  const metrics = useMemo(
    () => computeAgreementMetrics(observations, safeTolerance, 0.95),
    [observations, safeTolerance],
  );

  // Compute survival curve
  const survivalCurve = useMemo(
    () =>
      computeSurvivalCurve(
        observations,
        metrics.meanBias,
        metrics.variance.sdTotal,
        safeTolerance * 2.5,
        35,
      ),
    [observations, metrics.meanBias, metrics.variance.sdTotal, safeTolerance],
  );

  // Generate multi-tier executive scorecard
  const scorecard = useMemo(
    () => generateExecutiveScorecard(metrics, currentPreset, safeTolerance),
    [metrics, currentPreset, safeTolerance],
  );

  // Filter scorecard items by active lens
  const visibleScorecard = useMemo(
    () => (activeLens === 'all' ? scorecard : scorecard.filter((s) => s.lens === activeLens)),
    [scorecard, activeLens],
  );

  // Safe Y-axis domain for Bland-Altman scatter plot
  const safeYDomain = useMemo<[number, number]>(() => {
    const yMin = Math.floor(Math.min(metrics.loaLower, -safeTolerance) * 1.3);
    const yMax = Math.ceil(Math.max(metrics.loaUpper, safeTolerance) * 1.3);
    return yMin >= yMax ? [yMin - 1, yMax + 1] : [yMin, yMax];
  }, [metrics.loaLower, metrics.loaUpper, safeTolerance]);

  // Standalone HTML report export (Google infra scaling philosophy)
  function handleExportHtml() {
    const html = generateStandaloneHtmlReport({
      preset: currentPreset,
      metrics,
      scorecard,
      survivalCurve,
      toleranceWindow: safeTolerance,
      observations,
      centroids,
    });
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `validation-report-${currentPreset.id}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Copy JSON summary for Plx / Looker / ETL dashboards
  function handleCopyPlxJson() {
    const jsonStr = generatePlxJsonSummary({
      preset: currentPreset,
      metrics,
      scorecard,
      toleranceWindow,
    });
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopyFeedback('JSON dashboard summary copied to clipboard!');
      setTimeout(() => setCopyFeedback(null), 3000);
    });
  }

  // Table columns for Bland-Altman data view
  const observationColumns: TableColumn<PairedObservation>[] = [
    { key: 'id', header: 'Observation ID', render: (row) => row.id },
    { key: 'subjectId', header: 'Subject', render: (row) => `Subject ${row.subjectId}` },
    {
      key: 'refValue',
      header: `Reference (${currentPreset.unit})`,
      render: (row) => row.refValue.toFixed(2),
      numeric: true,
    },
    {
      key: 'devValue',
      header: `Device (${currentPreset.unit})`,
      render: (row) => row.devValue.toFixed(2),
      numeric: true,
    },
    {
      key: 'diff',
      header: `Difference (${currentPreset.unit})`,
      render: (row) => `${row.diff >= 0 ? '+' : ''}${row.diff.toFixed(2)}`,
      numeric: true,
    },
    {
      key: 'absDiff',
      header: `Absolute Error (${currentPreset.unit})`,
      render: (row) => row.absDiff.toFixed(2),
      numeric: true,
    },
  ];

  // Table columns for Survival Curve data view
  const survivalColumns: TableColumn<SurvivalPoint>[] = [
    {
      key: 'threshold',
      header: `Threshold x (${currentPreset.unit})`,
      render: (row) => row.threshold.toFixed(2),
      numeric: true,
    },
    {
      key: 'empiricalSurvival',
      header: 'Survival P(|Error| > x)',
      render: (row) => `${row.empiricalSurvival.toFixed(1)}%`,
      numeric: true,
    },
    {
      key: 'empiricalCoverage',
      header: 'Coverage P(|Error| ≤ x)',
      render: (row) => `${row.empiricalCoverage.toFixed(1)}%`,
      numeric: true,
    },
    {
      key: 'gaussianSurvival',
      header: 'Gaussian Theoretical Survival',
      render: (row) => `${row.gaussianSurvival.toFixed(1)}%`,
      numeric: true,
    },
    {
      key: 'heavyTailExcess',
      header: 'Heavy-Tail Hazard Excess',
      render: (row) => `${row.heavyTailExcess.toFixed(1)}%`,
      numeric: true,
    },
  ];

  return (
    <ModulePage
      title="How do I present and report validation findings?"
      method="Executive Scorecard, Hierarchical Clustering & Survival of Error"
      intro={
        <>
          <p>
            Presenting validation results across cross-functional leadership (Product, Algorithm
            Engineering, and Clinical &amp; Regulatory) requires bridging high-level acceptance
            criteria with the rigorous underlying data-generating process.
          </p>
          <p>
            Beyond traditional Bland-Altman mean and limits of agreement, modern validation
            reporting relies on <strong>survival-type absolute error analysis</strong> to expose
            non-Gaussian heavy tails, motion artifacts, and rare clinical hazards that mean-variance
            summaries conceal.
          </p>
        </>
      }
      assumption="Paired repeated observations are clustered within human participants. Between-subject trait variance and within-subject sensor noise are decomposed via random-effects ANOVA. Absolute error survival curves reflect true empirical tail distributions."
      currentN={m}
      controls={
        <>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Evaluation Preset
            </span>
            <SelectField
              label="Domain Preset"
              value={selectedPresetId}
              options={PRESET_OPTIONS}
              onChange={handlePresetChange}
            />
            <p className="mt-1 text-xs text-ink-muted">{currentPreset.domain}</p>
          </div>

          <div className="border-t border-hairline pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Stakeholder Filter
            </span>
            <SelectField
              label="Scorecard Lens"
              value={activeLens}
              options={LENS_OPTIONS}
              onChange={(v) => setActiveLens(v as typeof activeLens)}
            />
          </div>

          <div className="border-t border-hairline pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Clinical Tolerance Margin
            </span>
            <NumberField
              label={`Acceptance Window (±${currentPreset.unit})`}
              value={toleranceWindow}
              onChange={setToleranceWindow}
              min={0.1}
              step={0.5}
            />
          </div>

          <div className="border-t border-hairline pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Hierarchical Architecture
            </span>
            <div className="mt-2 flex flex-col gap-2">
              <NumberField
                label="Participants (m)"
                value={m}
                onChange={setM}
                min={3}
                step={1}
              />
              <NumberField
                label="Replicates per Subject (k)"
                value={k}
                onChange={setK}
                min={2}
                step={1}
              />
              <NumberField
                label={`Between-Subject SD (σ_b, ${currentPreset.unit})`}
                value={sdB}
                onChange={setSdB}
                min={0}
                step={0.1}
              />
              <NumberField
                label={`Within-Subject SD (σ_w, ${currentPreset.unit})`}
                value={sdW}
                onChange={setSdW}
                min={0.1}
                step={0.1}
              />
              <NumberField
                label="Outlier Tail Contamination (p)"
                value={outlierRate}
                onChange={setOutlierRate}
                min={0}
                max={0.25}
                step={0.01}
              />
            </div>
          </div>

          <div className="border-t border-hairline pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Zero-Permission Portable Export
            </span>
            <div className="mt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleExportHtml}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-medium text-plane transition-opacity hover:opacity-90"
              >
                <Download size={14} aria-hidden /> Export Standalone HTML Report
              </button>
              <button
                type="button"
                onClick={handleCopyPlxJson}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-hairline bg-surface px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-ink/5"
              >
                <Copy size={14} aria-hidden /> Copy Plx / JSON Metrics
              </button>
              {copyFeedback && (
                <p className="text-center text-xs font-medium text-series-2" role="status">
                  {copyFeedback}
                </p>
              )}
            </div>
          </div>
        </>
      }
      methodNotes={
        <>
          <p>
            <strong>Cross-Functional Reporting Principles:</strong> Different stakeholders require
            different statistical resolutions. Product teams care about user error coverage;
            Algorithm teams require variance components (between- vs within-subject) to diagnose
            sensor calibration vs demographic disparities; Regulatory leads require Arms and Limits
            of Agreement confidence bounds.
          </p>
          <p>
            <strong>The Google Scaling Architecture:</strong> In large engineering organizations,
            restrictive data permission silos often delay validation audits. Distributing findings
            as self-contained client-side HTML+JS or Plx Dashboards guarantees zero-permission
            portability, instant reproducibility, and complete audit trails without needing direct
            backend database privileges.
          </p>
          <p>
            <strong>Survival of Error vs Gaussian Bland-Altman:</strong> Standard Bland-Altman
            summaries only report mean bias and standard deviation, implicitly assuming a Gaussian
            bell curve. In sensor physiology (SpO2, photoplethysmography, wearable EEG), errors have
            heavy tails caused by motion artifacts, poor skin coupling, and arrhythmias. Survival of
            Error curves P(|error| &gt; x) directly quantify the true clinical outlier
            hazard that RMS hides.
          </p>
          <div className="mt-3 flex flex-col gap-2 text-xs text-ink-muted">
            <p>
              1. {BLAND_ALTMAN_1986.text}{' '}
              {BLAND_ALTMAN_1986.url && (
                <a
                  href={BLAND_ALTMAN_1986.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-series-1 hover:underline"
                >
                  [doi] <ExternalLink size={11} aria-hidden />
                </a>
              )}
            </p>
            <p>
              2. {BLAND_ALTMAN_2007.text}{' '}
              {BLAND_ALTMAN_2007.url && (
                <a
                  href={BLAND_ALTMAN_2007.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-series-1 hover:underline"
                >
                  [doi] <ExternalLink size={11} aria-hidden />
                </a>
              )}
            </p>
            <p>
              3. {ZOU_2013.text}{' '}
              {ZOU_2013.url && (
                <a
                  href={ZOU_2013.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-series-1 hover:underline"
                >
                  [doi] <ExternalLink size={11} aria-hidden />
                </a>
              )}
            </p>
          </div>
        </>
      }
    >
      {/* Scaling Callout */}
      <section className="rounded-xl border border-hairline bg-surface p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-series-1/10 text-series-1">
            <Sparkles size={18} aria-hidden />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-ink">
              Systems That Scale: Client-Side Portability &amp; Plx Dashboards
            </h2>
            <p className="text-xs leading-relaxed text-ink-secondary">
              At Google and other enterprise research environments, client-side HTML+JavaScript
              pages and Plx Dashboards proved to be the most resilient validation medium because they
              bypass enterprise data-permission bottlenecks. You can export this entire studio view
              as a self-contained, interactive HTML document or Plx-compatible JSON payload that
              executives and auditors can inspect without database permissions.
            </p>
          </div>
        </div>
      </section>

      {/* Tier 1: Multi-Tier Executive Scorecard */}
      <section aria-labelledby="scorecard-heading" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="scorecard-heading" className="text-base font-semibold tracking-tight text-ink">
              1. Cross-Functional Executive Scorecard
            </h2>
            <p className="text-xs text-ink-secondary">
              Clinical tolerance window: <strong className="text-ink">±{toleranceWindow} {currentPreset.unit}</strong> &bull; Standard:{' '}
              <span className="text-ink">{currentPreset.regulatoryStandard}</span>
            </p>
          </div>

          {/* Quick lens toggle */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-hairline bg-plane p-1 text-xs">
            {(['all', 'product', 'engineering', 'clinical'] as const).map((lens) => (
              <button
                key={lens}
                type="button"
                onClick={() => setActiveLens(lens)}
                className={`rounded px-2.5 py-1 font-medium capitalize transition-colors ${
                  activeLens === lens
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {lens === 'all' ? 'All Lenses' : lens}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleScorecard.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col justify-between rounded-xl border p-4 transition-shadow hover:shadow-sm ${
                item.status === 'pass'
                  ? 'border-hairline bg-surface'
                  : item.status === 'caution'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-rose-500/30 bg-rose-500/5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                    {item.lens}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      item.status === 'pass'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : item.status === 'caution'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {item.status === 'pass' ? (
                      <CheckCircle2 size={12} aria-hidden />
                    ) : item.status === 'caution' ? (
                      <AlertTriangle size={12} aria-hidden />
                    ) : (
                      <ShieldAlert size={12} aria-hidden />
                    )}
                    {item.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="mt-2 text-xs font-medium text-ink-secondary">{item.label}</h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold tracking-tight text-ink tabular">{item.value}</span>
                  <span className="text-xs text-ink-muted">target: {item.target}</span>
                </div>
              </div>

              <div className="mt-3 border-t border-hairline pt-2">
                <p className="text-xs font-medium text-ink">{item.verdict}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">
                  {item.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tier 2: Bland-Altman Agreement with Subject-Level Clusters */}
      <section aria-labelledby="bland-altman-heading" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="bland-altman-heading" className="text-base font-semibold tracking-tight text-ink">
              2. Bland-Altman Agreement with Subject-Level Clustering
            </h2>
            <p className="text-xs text-ink-secondary">
              Mean Bias: <strong className="text-ink">{metrics.meanBias >= 0 ? '+' : ''}{metrics.meanBias.toFixed(2)} {currentPreset.unit}</strong> &bull; 95% LoA:{' '}
              <strong className="text-ink">[{metrics.loaLower.toFixed(2)}, +{metrics.loaUpper.toFixed(2)}]</strong> &bull; Total observations:{' '}
              <strong className="text-ink">{metrics.totalN}</strong> ({m} subjects &times; {k} reps)
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-hairline bg-plane p-1 text-xs">
            <button
              type="button"
              onClick={() => setBlandAltmanView('all')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                blandAltmanView === 'all'
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              All {metrics.totalN} Points
            </button>
            <button
              type="button"
              onClick={() => setBlandAltmanView('centroids')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                blandAltmanView === 'centroids'
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {m} Subject Centroids
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-hairline bg-surface p-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="reference"
                  name="Reference"
                  unit={` ${currentPreset.unit}`}
                  tick={AXIS_TICK}
                  label={{
                    value: `${currentPreset.referenceName} (${currentPreset.unit})`,
                    position: 'bottom',
                    offset: 5,
                    style: AXIS_LABEL,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="diff"
                  name="Device - Reference"
                  unit={` ${currentPreset.unit}`}
                  tick={AXIS_TICK}
                  domain={safeYDomain}
                  label={{
                    value: `Difference (${currentPreset.deviceName} - Ref)`,
                    angle: -90,
                    position: 'insideLeft',
                    style: AXIS_LABEL,
                  }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]!.payload as {
                      subjectId: number;
                      reference: number;
                      diff: number;
                      isCentroid?: boolean;
                      count?: number;
                    };
                    return (
                      <div className="rounded-lg border border-hairline bg-surface p-2.5 text-xs shadow-md">
                        <p className="font-semibold text-ink">
                          {d.isCentroid
                            ? `Subject ${d.subjectId} Mean Centroid`
                            : `Subject ${d.subjectId} Observation`}
                        </p>
                        <p className="mt-1 text-ink-secondary">
                          Reference: <span className="font-mono text-ink">{d.reference.toFixed(2)} {currentPreset.unit}</span>
                        </p>
                        <p className="text-ink-secondary">
                          Difference: <span className="font-mono text-ink">{d.diff >= 0 ? '+' : ''}{d.diff.toFixed(2)} {currentPreset.unit}</span>
                        </p>
                        {d.isCentroid && (
                          <p className="text-[11px] text-ink-muted">Averaged across {d.count} replicates</p>
                        )}
                      </div>
                    );
                  }}
                />

                {/* Shaded Clinical Tolerance Window */}
                <ReferenceArea
                  y1={-toleranceWindow}
                  y2={toleranceWindow}
                  fill="var(--color-series-2)"
                  fillOpacity={0.07}
                  stroke="none"
                />

                {/* Mean Bias Line */}
                <ReferenceLine
                  y={metrics.meanBias}
                  stroke={seriesColor(1)}
                  strokeWidth={2}
                  label={{
                    value: `Bias: ${metrics.meanBias >= 0 ? '+' : ''}${metrics.meanBias.toFixed(2)}`,
                    fill: seriesColor(1),
                    fontSize: 11,
                    position: 'right',
                  }}
                />

                {/* 95% LoA Upper & Lower */}
                <ReferenceLine
                  y={metrics.loaUpper}
                  stroke={seriesColor(4)}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Upper LoA: +${metrics.loaUpper.toFixed(2)}`,
                    fill: seriesColor(4),
                    fontSize: 10,
                    position: 'right',
                  }}
                />
                <ReferenceLine
                  y={metrics.loaLower}
                  stroke={seriesColor(4)}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Lower LoA: ${metrics.loaLower.toFixed(2)}`,
                    fill: seriesColor(4),
                    fontSize: 10,
                    position: 'right',
                  }}
                />

                {/* Tolerance Limit Lines */}
                <ReferenceLine
                  y={toleranceWindow}
                  stroke="var(--color-series-2)"
                  strokeDasharray="2 2"
                  label={{
                    value: `+${toleranceWindow} Tolerance`,
                    fill: 'var(--color-series-2)',
                    fontSize: 10,
                    position: 'left',
                  }}
                />
                <ReferenceLine
                  y={-toleranceWindow}
                  stroke="var(--color-series-2)"
                  strokeDasharray="2 2"
                  label={{
                    value: `-${toleranceWindow} Tolerance`,
                    fill: 'var(--color-series-2)',
                    fontSize: 10,
                    position: 'left',
                  }}
                />

                {/* Scatter Data */}
                {blandAltmanView === 'all' ? (
                  <Scatter
                    name="Observations"
                    data={observations.map((o) => ({
                      reference: o.refValue,
                      diff: o.diff,
                      subjectId: o.subjectId,
                      isOutlier: o.isOutlier,
                    }))}
                    fill={seriesColor(1)}
                    fillOpacity={0.65}
                  />
                ) : (
                  <Scatter
                    name="Subject Centroids"
                    data={centroids.map((c) => ({
                      reference: c.meanRef,
                      diff: c.meanDiff,
                      subjectId: c.subjectId,
                      isCentroid: true,
                      count: c.count,
                    }))}
                    fill={seriesColor(3)}
                    shape="diamond"
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-muted">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: seriesColor(1) }} />
                Solid: Mean Bias
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 border-t-2 border-dashed" style={{ borderColor: seriesColor(4) }} />
                Dashed: 95% Limits of Agreement
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded bg-series-2/20" />
                Shaded: Clinical Tolerance (±{toleranceWindow} {currentPreset.unit})
              </span>
            </div>
            <p className="italic">
              Hierarchical clustering accounts for within-subject correlations; {metrics.totalN} paired points yield {metrics.variance.nEffective.toFixed(0)} effective observations.
            </p>
          </div>
        </div>

        <DataTable
          caption="Sample Observation & Paired Differences Table"
          columns={observationColumns}
          rows={observations.slice(0, 50)}
          rowKey={(row) => row.id}
        />
      </section>

      {/* Tier 3: Survival of Error & Empirical Cumulative Coverage */}
      <section aria-labelledby="survival-heading" className="space-y-4">
        <div>
          <h2 id="survival-heading" className="text-base font-semibold tracking-tight text-ink">
            3. "Survival of Error" &amp; Cumulative Coverage (Heavy-Tail Diagnostics)
          </h2>
          <p className="text-xs text-ink-secondary">
            Assessing the probability that absolute device error exceeds clinical threshold x:{' '}
            <strong className="text-ink">P(|error| &gt; x)</strong> vs theoretical Gaussian survival.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Chart 1: Survival of Error */}
          <div className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Survival of Error: P(|Error| &gt; x)
                </h3>
                <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  Tail Hazard Curve
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-secondary">
                Reveals the proportion of readings that suffer errors larger than threshold x. Non-Gaussian
                heavy tails diverge above the dashed Gaussian curve.
              </p>
            </div>

            <div className="mt-3 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={survivalCurve} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="threshold"
                    tick={AXIS_TICK}
                    label={{
                      value: `Error Threshold x (${currentPreset.unit})`,
                      position: 'bottom',
                      offset: 5,
                      style: AXIS_LABEL,
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    unit="%"
                    tick={AXIS_TICK}
                    label={{
                      value: 'P(|Error| > x)',
                      angle: -90,
                      position: 'insideLeft',
                      style: AXIS_LABEL,
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]!.payload as SurvivalPoint;
                      return (
                        <div className="rounded-lg border border-hairline bg-surface p-2.5 text-xs shadow-md">
                          <p className="font-semibold text-ink">Threshold: {d.threshold} {currentPreset.unit}</p>
                          <p className="mt-1 text-rose-600 dark:text-rose-400 font-medium">
                            Empirical Survival: {d.empiricalSurvival}%
                          </p>
                          <p className="text-ink-muted">Gaussian Theoretical: {d.gaussianSurvival}%</p>
                          {d.heavyTailExcess > 0 && (
                            <p className="text-amber-600 dark:text-amber-400 font-semibold">
                              Heavy-Tail Excess: +{d.heavyTailExcess}%
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine
                    x={toleranceWindow}
                    stroke="var(--color-series-2)"
                    strokeDasharray="2 2"
                    label={{
                      value: `Tol (${toleranceWindow})`,
                      fill: 'var(--color-series-2)',
                      fontSize: 10,
                    }}
                  />
                  <ReferenceLine
                    x={metrics.p95}
                    stroke={seriesColor(5)}
                    strokeDasharray="3 3"
                    label={{
                      value: `P95 (${metrics.p95.toFixed(1)})`,
                      fill: seriesColor(5),
                      fontSize: 10,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="empiricalSurvival"
                    name="Empirical Survival"
                    stroke="var(--color-series-5)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="gaussianSurvival"
                    name="Gaussian Theoretical"
                    stroke={CHART.tickText}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
              <span>Solid: Real Data (empirical)</span>
              <span>Dashed: Ideal Gaussian</span>
            </div>
          </div>

          {/* Chart 2: Cumulative Error Coverage */}
          <div className="flex flex-col justify-between rounded-xl border border-hairline bg-surface p-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Cumulative Coverage: P(|Error| ≤ x)
                </h3>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Compliance CDF
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-secondary">
                Cumulative percentage of user measurements falling within tolerance threshold x.
                At ±{toleranceWindow} {currentPreset.unit}, coverage is <strong>{metrics.coverageAtTolerance.toFixed(1)}%</strong>.
              </p>
            </div>

            <div className="mt-3 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={survivalCurve} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="threshold"
                    tick={AXIS_TICK}
                    label={{
                      value: `Error Threshold x (${currentPreset.unit})`,
                      position: 'bottom',
                      offset: 5,
                      style: AXIS_LABEL,
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    unit="%"
                    tick={AXIS_TICK}
                    label={{
                      value: 'Coverage P(|Error| ≤ x)',
                      angle: -90,
                      position: 'insideLeft',
                      style: AXIS_LABEL,
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]!.payload as SurvivalPoint;
                      return (
                        <div className="rounded-lg border border-hairline bg-surface p-2.5 text-xs shadow-md">
                          <p className="font-semibold text-ink">Threshold: {d.threshold} {currentPreset.unit}</p>
                          <p className="mt-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            Empirical Coverage: {d.empiricalCoverage}%
                          </p>
                          <p className="text-ink-muted">Gaussian Theoretical: {d.gaussianCoverage}%</p>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine
                    y={currentPreset.targetCoveragePct}
                    stroke="var(--color-series-2)"
                    strokeDasharray="3 3"
                    label={{
                      value: `Target (${currentPreset.targetCoveragePct}%)`,
                      fill: 'var(--color-series-2)',
                      fontSize: 10,
                      position: 'right',
                    }}
                  />
                  <ReferenceLine
                    x={toleranceWindow}
                    stroke="var(--color-series-2)"
                    strokeDasharray="2 2"
                  />
                  <Line
                    type="monotone"
                    dataKey="empiricalCoverage"
                    name="Empirical Coverage"
                    stroke={seriesColor(2)}
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="gaussianCoverage"
                    name="Gaussian Coverage"
                    stroke={CHART.tickText}
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
              <span>P50: {metrics.p50.toFixed(2)} {currentPreset.unit}</span>
              <span>P90: {metrics.p90.toFixed(2)} {currentPreset.unit}</span>
              <span>P95: {metrics.p95.toFixed(2)} {currentPreset.unit}</span>
            </div>
          </div>
        </div>

        <DataTable
          caption="Empirical Survival &amp; Coverage Curve Distribution Table"
          columns={survivalColumns}
          rows={survivalCurve}
          rowKey={(row) => row.threshold}
        />
      </section>

      {/* Tier 4: Hierarchical Model & Multi-level Evaluation Presets */}
      <section aria-labelledby="hierarchical-heading" className="space-y-4">
        <div>
          <h2 id="hierarchical-heading" className="text-base font-semibold tracking-tight text-ink">
            4. Hierarchical Data-Generating Model &amp; Variance Decomposition
          </h2>
          <p className="text-xs text-ink-secondary">
            Validation data generation formula:{' '}
            <code className="rounded bg-ink/5 px-1 py-0.5 text-ink">
              Y_ij = Ref_ij + Bias + u_i + ε_ij
            </code>{' '}
            where <strong className="text-ink">u_i ~ N(0, σ_b²)</strong> and{' '}
            <strong className="text-ink">ε_ij ~ HeavyTail(0, σ_w²)</strong>.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-hairline bg-surface p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Between-Subject Spread (σ_b)
            </span>
            <p className="mt-1 font-mono text-xl font-bold text-ink">
              {metrics.variance.sdBetween.toFixed(2)} <span className="text-xs font-normal text-ink-muted">{currentPreset.unit}</span>
            </p>
            <p className="mt-1 text-xs text-ink-secondary">
              Contributes <strong>{(metrics.variance.icc * 100).toFixed(1)}%</strong> of variance (ICC = {metrics.variance.icc.toFixed(2)}).
            </p>
          </div>

          <div className="rounded-xl border border-hairline bg-surface p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Within-Subject Spread (σ_w)
            </span>
            <p className="mt-1 font-mono text-xl font-bold text-ink">
              {metrics.variance.sdWithin.toFixed(2)} <span className="text-xs font-normal text-ink-muted">{currentPreset.unit}</span>
            </p>
            <p className="mt-1 text-xs text-ink-secondary">
              Contributes <strong>{((1 - metrics.variance.icc) * 100).toFixed(1)}%</strong> of variance (noise &amp; motion).
            </p>
          </div>

          <div className="rounded-xl border border-hairline bg-surface p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Clustering Design Effect (DEFF)
            </span>
            <p className="mt-1 font-mono text-xl font-bold text-ink">
              {metrics.variance.designEffect.toFixed(2)}&times;
            </p>
            <p className="mt-1 text-xs text-ink-secondary">
              Inflation factor on variance due to {k} repeated measures per person.
            </p>
          </div>

          <div className="rounded-xl border border-hairline bg-surface p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Effective Sample Size (N_eff)
            </span>
            <p className="mt-1 font-mono text-xl font-bold text-ink">
              {metrics.variance.nEffective.toFixed(0)} <span className="text-xs font-normal text-ink-muted">of {metrics.totalN}</span>
            </p>
            <p className="mt-1 text-xs text-ink-secondary">
              Naive pooled analysis overstates statistical precision by <strong>{metrics.variance.seUnderstatementRatio.toFixed(1)}&times;</strong>.
            </p>
          </div>
        </div>

        {/* If Sleep Staging Preset is Active, show multi-class SRI confusion matrix & metrics */}
        {currentPreset.sleepSummary && (
          <div className="rounded-xl border border-hairline bg-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Sleep Staging Multi-Class Confusion Matrix (SRI Framework)
                </h3>
                <p className="text-xs text-ink-secondary">
                  30-second epoch-by-epoch (EBE) concordance against Polysomnography (PSG). Overall Accuracy:{' '}
                  <strong className="text-ink">{(currentPreset.sleepSummary.overallAccuracy * 100).toFixed(1)}%</strong> &bull; Cohen&apos;s Kappa (κ):{' '}
                  <strong className="text-ink">{currentPreset.sleepSummary.cohensKappa.toFixed(3)}</strong>
                </p>
              </div>
              <span className="rounded bg-series-4/10 px-2.5 py-1 text-xs font-semibold text-series-4">
                AASM &amp; SRI Preset
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-hairline text-ink-muted">
                    <th className="p-2">True PSG \ Wearable</th>
                    {currentPreset.sleepSummary.classes.map((cls) => (
                      <th key={cls} className="p-2 font-medium">{cls}</th>
                    ))}
                    <th className="p-2 font-medium">Sensitivity</th>
                    <th className="p-2 font-medium">Specificity</th>
                    <th className="p-2 font-medium">PPV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {currentPreset.sleepSummary.matrix.map((row, rowIdx) => {
                    const stage = currentPreset.sleepSummary!.classes[rowIdx]!;
                    const stat = currentPreset.sleepSummary!.stageMetrics[rowIdx]!;
                    return (
                      <tr key={stage}>
                        <td className="p-2 font-semibold text-ink">{stage}</td>
                        {row.map((cell, colIdx) => (
                          <td
                            key={colIdx}
                            className={`p-2 font-mono ${
                              rowIdx === colIdx ? 'bg-series-1/10 font-bold text-series-1' : 'text-ink-secondary'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                        <td className="p-2 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {(stat.sensitivity * 100).toFixed(1)}%
                        </td>
                        <td className="p-2 font-mono text-ink-secondary">
                          {(stat.specificity * 100).toFixed(1)}%
                        </td>
                        <td className="p-2 font-mono text-ink-secondary">
                          {(stat.ppv * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-hairline pt-3 text-xs text-ink-muted">
              <span>
                Total Sleep Time (TST) Bias:{' '}
                <strong className="text-ink">{currentPreset.sleepSummary.tstBiasMinutes} min</strong>
              </span>
              <span>
                TST 95% LoA:{' '}
                <strong className="text-ink">
                  [{currentPreset.sleepSummary.tstLoaMinutes[0]} min, +{currentPreset.sleepSummary.tstLoaMinutes[1]} min]
                </strong>
              </span>
              <span>
                Evaluated on {currentPreset.sleepSummary.totalEpochs.toLocaleString()} 30-sec epochs ({m} participants)
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Next Steps */}
      <NextSteps
        offer={{ n: m, source: 'Validation Report Studio' }}
        steps={[
          {
            to: '/repeated-measures',
            title: 'Study Sizing: Repeated Measures',
            description:
              'Size your next validation study with variance decomposition before collecting data.',
          },
          {
            to: '/explainers/rmse-mae',
            title: 'Explainer: Misled by RMSE & MAE',
            description: 'Understand why heavy tails fool standard summary loss functions.',
          },
        ]}
      />
    </ModulePage>
  );
}
