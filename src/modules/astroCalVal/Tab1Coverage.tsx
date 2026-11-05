import { useMemo, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AXIS_LABEL, AXIS_TICK as TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import { CenteredYAxisLabel } from './chartAxisLabels.tsx';
import {
  CENSORING_REGIMES,
  computeSadlerCensoringData,
  type CensoringRegime,
} from './sadlerMath.ts';
import type { ActivePipeline, CoverageData } from './showcaseData.ts';

interface Tab1CoverageProps {
  coverage: CoverageData;
  activePipeline: ActivePipeline;
}

const COLOR_A = seriesColor(2); // Orange — Pipeline A (Legacy Template Fitting)
const COLOR_B = seriesColor(1); // Blue   — Pipeline B (Deep Learning Hybrid)

type RightPanelMode = 'bias_sd' | 'scatter_cloud';

export default function Tab1Coverage({
  coverage,
  activePipeline,
}: Tab1CoverageProps): JSX.Element {
  const [regime, setRegime] = useState<CensoringRegime>('all_retained');
  const [rightMode, setRightMode] = useState<RightPanelMode>('bias_sd');

  const isH2H = activePipeline === 'h2h';
  const activeKey = activePipeline === 'b' ? 'b' : 'a';
  const activeColor = activeKey === 'b' ? COLOR_B : COLOR_A;
  const activeLabel =
    activeKey === 'b'
      ? 'Pipeline B (Deep Learning Hybrid)'
      : 'Pipeline A (Legacy Template Fitting)';

  const completenessRows = useMemo(() => {
    const { r_center, snr, n, completeness_a, model_a, completeness_b, model_b } =
      coverage.bins;
    return r_center.map((r, i) => ({
      r,
      snr: snr[i] ?? 0,
      n: n[i] ?? 0,
      comp_a: Number(((completeness_a[i] ?? 0) * 100).toFixed(1)),
      mod_a: Number(((model_a[i] ?? 0) * 100).toFixed(1)),
      comp_b: Number(((completeness_b[i] ?? 0) * 100).toFixed(1)),
      mod_b: Number(((model_b[i] ?? 0) * 100).toFixed(1)),
      gain_b_minus_a: Number(
        (((completeness_b[i] ?? 0) - (completeness_a[i] ?? 0)) * 100).toFixed(1),
      ),
    }));
  }, [coverage.bins]);

  const sadlerCensoring = useMemo(
    () => computeSadlerCensoringData(regime, activeKey),
    [regime, activeKey],
  );

  const activeRegimeMeta =
    CENSORING_REGIMES.find((r) => r.key === regime) ?? CENSORING_REGIMES[0]!;

  // Unified data array for the Floor V-Boundary Cloud so Recharts 3.10 ComposedChart renders every point
  const floorScatterRows = useMemo(
    () =>
      sadlerCensoring.scatter.map((pt) => ({
        u: pt.u,
        unclippedDiff: pt.isClipped ? null : pt.diff,
        clippedDiff: pt.isClipped ? pt.diff : null,
      })),
    [sadlerCensoring.scatter],
  );

  if (isH2H) {
    return (
      <div className="space-y-6">
        {/* Top Section Header + Primer Link */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-surface p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
              Tab 1 · Head-to-Head Yield &amp; Boundary Comparison
            </p>
            <h3 className="mt-0.5 text-base font-semibold text-ink">
              How Much Faint-Galaxy Yield Does Pipeline B Recover—and How Much Floor Bias Does It Eliminate?
            </h3>
          </div>
          <Link
            to="/academy/astro-calval/primers/censoring"
            className="rounded-md border border-hairline bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface"
          >
            Read Primer: Completeness &amp; Floor Clipping →
          </Link>
        </div>

        {/* H2H Summary Cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-hairline bg-surface p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
              Overall Catalog Recovery
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-ink">
              {((1 - coverage.overall_dropout_b) * 100).toFixed(1)}% vs.{' '}
              {((1 - coverage.overall_dropout_a) * 100).toFixed(1)}%
            </div>
            <p className="mt-1 text-xs text-ink-secondary">
              Pipeline B recovers{' '}
              <span className="font-semibold text-ink">
                +{((coverage.overall_dropout_a - coverage.overall_dropout_b) * 100).toFixed(1)}%
              </span>{' '}
              more galaxies across the full brightness range.
            </p>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
              Faint-End Drop-Out Rate (r &gt; {coverage.floor_r} mag)
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {(coverage.floor_dropout_b * 100).toFixed(1)}% (B) vs.{' '}
              <span className="text-amber-600 dark:text-amber-400">
                {(coverage.floor_dropout_a * 100).toFixed(1)}% (A)
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-secondary">
              Pipeline A loses nearly half of faint galaxies below signal-to-noise ratio 7; Pipeline B
              cuts faint-end drop-out by more than half.
            </p>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
              Low-Redshift Floor-Clipping Hazard
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-ink">
              0 Clipped (B) vs. {coverage.censoring.n_in_zone_a} in Hazard Zone (A)
            </div>
            <p className="mt-1 text-xs text-ink-secondary">
              Pipeline B outputs signed estimates near zero, avoiding the{' '}
              <span className="font-mono">z ≤ {coverage.censoring.exclusion_a.toFixed(2)}</span>{' '}
              floor-clipping bias zone.
            </p>
          </div>
        </div>

        {/* Two Dedicated Head-to-Head Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left H2H Chart: Faint-End Yield Advantage */}
          <div className="rounded-xl border border-hairline bg-surface p-5">
            <h4 className="text-sm font-semibold text-ink">
              Detection Yield Advantage Across Galaxy Brightness (Pipeline B vs. Pipeline A)
            </h4>
            <p className="mt-0.5 text-xs text-ink-secondary">
              Percentage of true galaxies recovered from bright (18 mag) to faint limit (25.5 mag),
              plus net recovery gain (green curve).
            </p>

            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={completenessRows}
                  margin={{ top: 12, right: 16, bottom: 28, left: 8 }}
                >
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="r"
                    type="number"
                    domain={[18.0, 25.5]}
                    tick={TICK}
                    stroke={CHART.axis}
                    label={{
                      value: 'Apparent Brightness — r-Band Magnitude (fainter to the right →)',
                      position: 'insideBottom',
                      offset: -16,
                      style: AXIS_LABEL,
                    }}
                  />
                  <YAxis
                    domain={[0, 105]}
                    width={68}
                    tick={TICK}
                    stroke={CHART.axis}
                    tickFormatter={(v: number) => `${v}%`}
                    label={
                      <CenteredYAxisLabel
                        value="Detection Yield & Net Gain (%)"
                        subValue="0% to 100%"
                      />
                    }
                  />
                  <ReferenceArea
                    x1={coverage.floor_r}
                    x2={25.5}
                    fill="var(--color-critical)"
                    fillOpacity={0.06}
                  />
                  <ReferenceLine
                    x={coverage.floor_r}
                    stroke="var(--color-critical)"
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="mod_a"
                    name="Pipeline A Yield (%)"
                    stroke={COLOR_A}
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: COLOR_A }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="mod_b"
                    name="Pipeline B Yield (%)"
                    stroke={COLOR_B}
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: COLOR_B }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="gain_b_minus_a"
                    name="Net Yield Gain (B − A, %)"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: CHART.surface,
                      borderColor: CHART.grid,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(val, name) => [`${Number(val ?? 0).toFixed(1)}%`, String(name ?? '')]}
                    labelFormatter={(r) => `Magnitude r = ${Number(r ?? 0).toFixed(2)} mag`}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right H2H Chart: Low-Redshift Spurious Bias Comparison */}
          <div className="rounded-xl border border-hairline bg-surface p-5">
            <h4 className="text-sm font-semibold text-ink">
              Low-Redshift Systematic Bias Hook (Pipeline A Clamped vs. Pipeline B Uncensored)
            </h4>
            <p className="mt-0.5 text-xs text-ink-secondary">
              Mean redshift error (z_phot − z_spec) near the low-redshift boundary, showing how
              Pipeline A’s zero-floor clamping pulls average error upward.
            </p>

            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={sadlerCensoring.bins}
                  margin={{ top: 12, right: 16, bottom: 28, left: 8 }}
                >
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="uCenter"
                    type="number"
                    domain={[0.04, 0.60]}
                    tick={TICK}
                    stroke={CHART.axis}
                    label={{
                      value: 'True Spectroscopic Redshift (z_spec)',
                      position: 'insideBottom',
                      offset: -16,
                      style: AXIS_LABEL,
                    }}
                  />
                  <YAxis
                    domain={[-0.008, 0.028]}
                    width={68}
                    tick={TICK}
                    stroke={CHART.axis}
                    tickFormatter={(v: number) => (v >= 0 ? `+${v.toFixed(3)}` : v.toFixed(3))}
                    label={
                      <CenteredYAxisLabel
                        value="Mean Redshift Bias"
                        subValue="z_phot − z_spec"
                      />
                    }
                  />
                  <ReferenceArea
                    x1={0.04}
                    x2={coverage.censoring.exclusion_a}
                    fill={COLOR_A}
                    fillOpacity={0.08}
                  />
                  <ReferenceLine y={0} stroke={CHART.axis} strokeDasharray="3 3" />
                  <ReferenceLine
                    x={coverage.censoring.exclusion_a}
                    stroke={COLOR_A}
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="biasA"
                    name="Pipeline A Mean Bias (Clamped at Floor)"
                    stroke={COLOR_A}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: COLOR_A }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="biasB"
                    name="Pipeline B Mean Bias (Uncensored)"
                    stroke={COLOR_B}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: COLOR_B }}
                    isAnimationActive={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: CHART.surface,
                      borderColor: CHART.grid,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(val, name) => {
                      const num = Number(val ?? 0);
                      return [num >= 0 ? `+${num.toFixed(4)}` : num.toFixed(4), String(name ?? '')];
                    }}
                    labelFormatter={(z) => `True Redshift z_spec = ${Number(z ?? 0).toFixed(3)}`}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single-Pipeline View (Strictly Pipeline A vs. Reference OR Pipeline B vs. Reference)
  return (
    <div className="space-y-6">
      {/* Section Header + Primer Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-surface p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
            Tab 1 · Dataset Coverage &amp; Boundary Censoring ({activeLabel})
          </p>
          <h3 className="mt-0.5 text-base font-semibold text-ink">
            Where Does Detection Drop Off—and Does Floor Clamping Distort Low-End Accuracy?
          </h3>
        </div>
        <Link
          to="/academy/astro-calval/primers/censoring"
          className="rounded-md border border-hairline bg-surface-subtle px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface"
        >
          Read Primer: Completeness &amp; Floor-Clipping Bias →
        </Link>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel: Completeness vs Brightness */}
        <div className="rounded-xl border border-hairline bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-ink">
                Detection Yield Across Galaxy Brightness ({activeKey === 'b' ? 'Pipeline B' : 'Pipeline A'})
              </h4>
              <p className="mt-0.5 text-xs text-ink-secondary">
                Percentage of true galaxies successfully measured from bright (18.0 mag) to faint
                limit (25.5 mag). Shaded zone marks low signal-to-noise (r &gt; {coverage.floor_r} mag).
              </p>
            </div>
            <span className="rounded bg-surface-subtle px-2.5 py-1 font-mono text-xs font-semibold text-ink">
              Faint Drop-Out:{' '}
              {((activeKey === 'b' ? coverage.floor_dropout_b : coverage.floor_dropout_a) * 100).toFixed(1)}%
            </span>
          </div>

          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={completenessRows}
                margin={{ top: 12, right: 16, bottom: 28, left: 8 }}
              >
                <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                <XAxis
                  dataKey="r"
                  type="number"
                  domain={[18.0, 25.5]}
                  tick={TICK}
                  stroke={CHART.axis}
                  label={{
                    value: 'Apparent Brightness — r-Band Magnitude (fainter to the right →)',
                    position: 'insideBottom',
                    offset: -16,
                    style: AXIS_LABEL,
                  }}
                />
                <YAxis
                  domain={[40, 103]}
                  width={68}
                  tick={TICK}
                  stroke={CHART.axis}
                  tickFormatter={(v: number) => `${v}%`}
                  label={
                    <CenteredYAxisLabel
                      value="Detection Completeness (%)"
                      subValue="Valid Redshift Returned"
                    />
                  }
                />
                <ReferenceArea
                  x1={coverage.floor_r}
                  x2={25.5}
                  fill="var(--color-critical)"
                  fillOpacity={0.07}
                />
                <ReferenceLine
                  x={coverage.floor_r}
                  stroke="var(--color-critical)"
                  strokeDasharray="4 4"
                />
                <ReferenceLine y={90} stroke={CHART.axis} strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey={activeKey === 'b' ? 'mod_b' : 'mod_a'}
                  name="Logistic Completeness Curve"
                  stroke={activeColor}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Scatter
                  dataKey={activeKey === 'b' ? 'comp_b' : 'comp_a'}
                  name="Observed Bin Completeness"
                  fill={activeColor}
                  isAnimationActive={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: CHART.surface,
                    borderColor: CHART.grid,
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(val, name) => [`${Number(val ?? 0).toFixed(1)}%`, String(name ?? '')]}
                  labelFormatter={(r) => `Magnitude r = ${Number(r ?? 0).toFixed(2)} mag`}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 rounded-lg border border-hairline bg-surface-subtle/40 p-3 text-xs text-ink-secondary">
            <span className="font-semibold text-ink">Takeaway: </span>
            {activeKey === 'a' ? (
              <>
                Pipeline A maintains &gt;95% detection yield on bright galaxies (r &lt; 23 mag), but
                drops sharply to <span className="font-mono font-semibold text-ink">53.9%</span> yield
                in the faint regime (r &gt; 24.5 mag), losing{' '}
                <span className="font-mono font-semibold text-ink">
                  {(coverage.overall_dropout_a * 100).toFixed(1)}%
                </span>{' '}
                of the overall survey sample.
              </>
            ) : (
              <>
                Pipeline B preserves <span className="font-mono font-semibold text-ink">77.7%</span>{' '}
                completeness even in the ultra-faint regime (r &gt; 24.5 mag), reducing overall
                catalog drop-out to just{' '}
                <span className="font-mono font-semibold text-ink">
                  {(coverage.overall_dropout_b * 100).toFixed(1)}%
                </span>
                .
              </>
            )}
          </div>
        </div>

        {/* Right Panel: Interactive Sadler (2019) 4-Regime Floor-Clipping Explorer */}
        <div className="rounded-xl border border-hairline bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-ink">
                Low-Redshift Floor Clipping &amp; Spurious Bias ({activeKey === 'b' ? 'Pipeline B' : 'Pipeline A'})
              </h4>
              <p className="mt-0.5 text-xs text-ink-secondary">
                Sadler (2019): how clamping noisy measurements at a floor distorts bias and standard
                deviation—and why deleting clipped rows fails to fix it.
              </p>
            </div>

            {/* Chart Sub-View Switcher */}
            <div className="inline-flex rounded-lg border border-hairline bg-surface-subtle p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setRightMode('bias_sd')}
                className={`rounded-md px-2.5 py-1 font-medium cursor-pointer ${
                  rightMode === 'bias_sd'
                    ? 'bg-ink text-surface font-semibold'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                Bias &amp; Depressed SD
              </button>
              <button
                type="button"
                onClick={() => setRightMode('scatter_cloud')}
                className={`rounded-md px-2.5 py-1 font-medium cursor-pointer ${
                  rightMode === 'scatter_cloud'
                    ? 'bg-ink text-surface font-semibold'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                Floor V-Boundary Cloud
              </button>
            </div>
          </div>

          {/* 4-Regime Selector (Sadler 2019 Fig. 2a-d) */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CENSORING_REGIMES.map((r) => {
              const isSelected = r.key === regime;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRegime(r.key)}
                  className={`rounded-md px-2.5 py-1 text-[11px] transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-ink text-surface font-semibold'
                      : 'border border-hairline bg-surface-subtle/60 text-ink-secondary hover:text-ink'
                  }`}
                >
                  {r.shortLabel}
                </button>
              );
            })}
          </div>

          <div className="mt-3 h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {rightMode === 'bias_sd' ? (
                <ComposedChart
                  data={sadlerCensoring.bins}
                  margin={{ top: 10, right: 16, bottom: 28, left: 8 }}
                >
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="uCenter"
                    type="number"
                    domain={[0.04, 0.58]}
                    tick={TICK}
                    stroke={CHART.axis}
                    label={{
                      value: 'True Redshift (z_spec) — Shaded = 2.5×SD Floor Hazard Zone',
                      position: 'insideBottom',
                      offset: -16,
                      style: AXIS_LABEL,
                    }}
                  />
                  <YAxis
                    domain={[-0.005, 0.045]}
                    width={68}
                    tick={TICK}
                    stroke={CHART.axis}
                    tickFormatter={(v: number) => v.toFixed(3)}
                    label={
                      <CenteredYAxisLabel
                        value="Bias & Standard Deviation"
                        subValue="Redshift Units (Δz)"
                      />
                    }
                  />
                  <ReferenceArea
                    x1={0.04}
                    x2={sadlerCensoring.hazardZoneUpper}
                    fill={activeColor}
                    fillOpacity={0.08}
                  />
                  <ReferenceLine y={0} stroke={CHART.axis} strokeDasharray="3 3" />
                  <ReferenceLine
                    x={sadlerCensoring.hazardZoneUpper}
                    stroke={activeColor}
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey={activeKey === 'b' ? 'trueSdB' : 'trueSdA'}
                    name="True Uncensored SD"
                    stroke={CHART.axis}
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={activeKey === 'b' ? 'sdB' : 'sdA'}
                    name="Observed SD (Depressed Near Floor)"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: '#8b5cf6' }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={activeKey === 'b' ? 'biasB' : 'biasA'}
                    name="Observed Mean Bias (Spurious Hook)"
                    stroke={activeColor}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: activeColor }}
                    isAnimationActive={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: CHART.surface,
                      borderColor: CHART.grid,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(val, name) => [Number(val ?? 0).toFixed(4), String(name ?? '')]}
                    labelFormatter={(z) => `Redshift Bin z = ${Number(z ?? 0).toFixed(3)}`}
                  />
                </ComposedChart>
              ) : (
                <ComposedChart
                  data={floorScatterRows}
                  margin={{ top: 10, right: 16, bottom: 28, left: 8 }}
                >
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="u"
                    type="number"
                    domain={[0.04, 0.38]}
                    tick={TICK}
                    stroke={CHART.axis}
                    label={{
                      value: 'Pair Mean Redshift (z_spec + z_phot) / 2',
                      position: 'insideBottom',
                      offset: -16,
                      style: AXIS_LABEL,
                    }}
                  />
                  <YAxis
                    type="number"
                    domain={[-0.11, 0.11]}
                    width={68}
                    tick={TICK}
                    stroke={CHART.axis}
                    tickFormatter={(v: number) => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2))}
                    label={
                      <CenteredYAxisLabel
                        value="Redshift Difference"
                        subValue="z_phot − z_spec"
                      />
                    }
                  />
                  <ReferenceArea
                    x1={0.04}
                    x2={sadlerCensoring.hazardZoneUpper}
                    fill={activeColor}
                    fillOpacity={0.07}
                  />
                  <ReferenceLine y={0} stroke={CHART.axis} strokeDasharray="3 3" />
                  <Scatter
                    name="Unclipped Observations"
                    dataKey="unclippedDiff"
                    fill={activeColor}
                    fillOpacity={0.65}
                    isAnimationActive={false}
                  />
                  <Scatter
                    name="Floor-Clipped Boundary Points"
                    dataKey="clippedDiff"
                    fill="var(--color-critical)"
                    isAnimationActive={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: CHART.surface,
                      borderColor: CHART.grid,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(val, name) => [Number(val ?? 0).toFixed(4), String(name ?? '')]}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-3 rounded-lg border border-hairline bg-surface-subtle/40 p-3 text-xs text-ink-secondary">
            <div className="font-semibold text-ink">
              {activeRegimeMeta.sadlerPanel} — {activeRegimeMeta.title}
            </div>
            <p className="mt-1 leading-relaxed">{activeRegimeMeta.takeaway}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
