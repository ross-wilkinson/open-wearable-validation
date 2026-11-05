import { useMemo, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
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
import { AXIS_TICK as TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import { CenteredYAxisLabel } from './chartAxisLabels.tsx';
import { KPI_ROW_DEFINITIONS } from './sadlerMath.ts';
import type {
  ActivePipeline,
  CliffsComparison,
  EcdfData,
  PipelineKey,
  ValidationKpiBlock,
} from './showcaseData.ts';

interface Tab3EcdfProps {
  ecdf: EcdfData;
  kpi: ValidationKpiBlock;
  comparison: { cliffs_delta: CliffsComparison };
  activePipeline: ActivePipeline;
}

const COLOR_A = seriesColor(2); // Orange — Pipeline A
const COLOR_B = seriesColor(1); // Blue   — Pipeline B

interface EcdfGridRow {
  err: number;
  pooledA: number;
  subjP50A: number;
  subjP95A: number;
  pooledB: number;
  subjP50B: number;
  subjP95B: number;
}

/**
 * Evaluates cumulative percentage (0..100) at horizontal error threshold `x`
 * from parallel arrays `quantiles` (sorted ascending error quantiles) and
 * `probs` (cumulative probabilities in [0, 1]).
 */
function evalCdfPercentAtError(quantiles: number[], probs: number[], x: number): number {
  const n = Math.min(quantiles.length, probs.length);
  if (n === 0) return 0;
  if (x <= (quantiles[0] ?? 0)) return Number(((probs[0] ?? 0) * 100).toFixed(2));
  if (x >= (quantiles[n - 1] ?? 0)) return Number(((probs[n - 1] ?? 1) * 100).toFixed(2));

  for (let i = 0; i < n - 1; i++) {
    const q0 = quantiles[i] ?? 0;
    const q1 = quantiles[i + 1] ?? q0;
    if (x >= q0 && x <= q1) {
      const p0 = probs[i] ?? 0;
      const p1 = probs[i + 1] ?? p0;
      const span = q1 - q0;
      const frac = span > 1e-9 ? (x - q0) / span : 0;
      return Number(((p0 + frac * (p1 - p0)) * 100).toFixed(2));
    }
  }
  return 100;
}

export default function Tab3Ecdf({
  ecdf,
  kpi,
  comparison,
  activePipeline,
}: Tab3EcdfProps): JSX.Element {
  const [threshold, setThreshold] = useState<number>(kpi.typical_standard);

  const isH2H = activePipeline === 'h2h';
  const primaryKey: PipelineKey = activePipeline === 'b' ? 'b' : 'a';
  const primaryColor = primaryKey === 'a' ? COLOR_A : COLOR_B;
  const primaryLabel =
    primaryKey === 'a'
      ? 'Pipeline A (Legacy Template Fitting)'
      : 'Pipeline B (Deep Learning Hybrid)';

  // Unified 81-point horizontal error grid (err = 0.000, 0.002, ..., 0.160)
  // so Recharts 3.10.1 renders all ECDF curves cleanly from a single parent `data` array.
  const ecdfGridRows: EcdfGridRow[] = useMemo(() => {
    const steps = 80;
    const maxErr = 0.16;
    const step = maxErr / steps;

    return Array.from({ length: steps + 1 }, (_, idx) => {
      const err = Number((idx * step).toFixed(4));
      return {
        err,
        pooledA: evalCdfPercentAtError(ecdf.a.pooled, ecdf.p, err),
        subjP50A: evalCdfPercentAtError(ecdf.a.subject_p50, ecdf.p, err),
        subjP95A: evalCdfPercentAtError(ecdf.a.subject_p95, ecdf.p, err),
        pooledB: evalCdfPercentAtError(ecdf.b.pooled, ecdf.p, err),
        subjP50B: evalCdfPercentAtError(ecdf.b.subject_p50, ecdf.p, err),
        subjP95B: evalCdfPercentAtError(ecdf.b.subject_p95, ecdf.p, err),
      };
    });
  }, [ecdf]);

  const passRatesAtThreshold = useMemo(() => {
    return {
      pooledA: evalCdfPercentAtError(ecdf.a.pooled, ecdf.p, threshold),
      subjP50A: evalCdfPercentAtError(ecdf.a.subject_p50, ecdf.p, threshold),
      subjP95A: evalCdfPercentAtError(ecdf.a.subject_p95, ecdf.p, threshold),
      pooledB: evalCdfPercentAtError(ecdf.b.pooled, ecdf.p, threshold),
      subjP50B: evalCdfPercentAtError(ecdf.b.subject_p50, ecdf.p, threshold),
      subjP95B: evalCdfPercentAtError(ecdf.b.subject_p95, ecdf.p, threshold),
    };
  }, [ecdf, threshold]);

  const cliffs = comparison.cliffs_delta;
  const bWinsPct = cliffs.p_pos * 100;
  const tiesPct = cliffs.p_tie * 100;
  const aWinsPct = cliffs.p_neg * 100;

  return (
    <div className="space-y-6">
      {/* Main ECDF Visual Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                {isH2H
                  ? 'Head-to-Head Cumulative Error Comparison'
                  : `${primaryLabel} · Cumulative Error (ECDF)`}
              </span>
              <Link
                to={
                  isH2H
                    ? '/academy/astro-calval/primers/head-to-head'
                    : '/academy/astro-calval/primers/ecdf-kpis'
                }
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                {isH2H
                  ? 'Read Primer: Head-to-Head Superiority & Cliff’s Delta →'
                  : 'Read Primer: Pooled vs. Per-Target Two-Tier KPIs →'}
              </Link>
            </div>
            <h3 className="mt-1.5 text-lg font-bold text-slate-900">
              {isH2H
                ? 'Direct Comparison of Cumulative Absolute Error: Pipeline A vs. Pipeline B'
                : `${primaryLabel}: Empirical Cumulative Distribution of Absolute Error`}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {isH2H
                ? 'A curve shifted further to the upper-left reaches 100% of observations at smaller absolute errors. Compares both Pooled All-Exposures (solid) and Per-Target Median P50 (dashed) curves for Pipeline A and Pipeline B.'
                : `Shows the percentage of observations or targets whose normalized absolute error |Δz| / (1 + z_spec) falls at or below any tolerance gate for ${primaryLabel}.`}
            </p>
          </div>

          {/* Interactive Error Gate Slider */}
          <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:w-80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Interactive Error Gate</span>
              <span className="rounded bg-white px-2 py-0.5 font-mono text-indigo-700 shadow-xs">
                ≤ {threshold.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min={0.005}
              max={0.12}
              step={0.005}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              aria-label="Interactive Error Gate"
              className="mt-2 w-full accent-indigo-600"
            />
            <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-500">
              <span>0.005</span>
              <span>Typical ({kpi.typical_standard.toFixed(3)})</span>
              <span>Edge ({kpi.edge_standard.toFixed(3)})</span>
            </div>
          </div>
        </div>

        {/* Live Threshold Readout Strip */}
        {!isH2H ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-semibold text-slate-500">
                Pooled Exposures Within ≤ {threshold.toFixed(3)}
              </div>
              <div
                className="mt-1 font-mono text-lg font-bold"
                style={{ color: primaryColor }}
              >
                {(primaryKey === 'a'
                  ? passRatesAtThreshold.pooledA
                  : passRatesAtThreshold.pooledB
                ).toFixed(1)}
                %
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                Across all {kpi.n_obs.toLocaleString()} exposures
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-semibold text-slate-500">
                Targets with Typical Error (P50) ≤ {threshold.toFixed(3)}
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900">
                {(primaryKey === 'a'
                  ? passRatesAtThreshold.subjP50A
                  : passRatesAtThreshold.subjP50B
                ).toFixed(1)}
                %
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                Across {kpi.n_subjects} unique galaxies (Per-Target Median)
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-semibold text-slate-500">
                Targets with Edge-Case Error (P95) ≤ {threshold.toFixed(3)}
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-amber-700">
                {(primaryKey === 'a'
                  ? passRatesAtThreshold.subjP95A
                  : passRatesAtThreshold.subjP95B
                ).toFixed(1)}
                %
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                Across {kpi.n_subjects} unique galaxies (Per-Target 95th Percentile)
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
              <div className="text-[11px] font-semibold text-amber-900">
                Pipeline A Pooled ≤ {threshold.toFixed(3)}
              </div>
              <div className="mt-1 font-mono text-lg font-bold" style={{ color: COLOR_A }}>
                {passRatesAtThreshold.pooledA.toFixed(1)}%
              </div>
              <div className="mt-0.5 text-[11px] text-amber-800/80">
                Target Median P50: {passRatesAtThreshold.subjP50A.toFixed(1)}%
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3">
              <div className="text-[11px] font-semibold text-blue-900">
                Pipeline B Pooled ≤ {threshold.toFixed(3)}
              </div>
              <div className="mt-1 font-mono text-lg font-bold" style={{ color: COLOR_B }}>
                {passRatesAtThreshold.pooledB.toFixed(1)}%
              </div>
              <div className="mt-0.5 text-[11px] text-blue-800/80">
                Target Median P50: {passRatesAtThreshold.subjP50B.toFixed(1)}%
              </div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="text-[11px] font-semibold text-emerald-900">
                Yield Advantage at ≤ {threshold.toFixed(3)} (B − A)
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-700">
                +{(passRatesAtThreshold.pooledB - passRatesAtThreshold.pooledA).toFixed(1)}%
              </div>
              <div className="mt-0.5 text-[11px] text-emerald-800/80">
                More exposures passing accuracy gate
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-semibold text-slate-600">
                Cliff&apos;s Delta Dominance (δ)
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900">
                {cliffs.delta >= 0 ? '+' : ''}
                {cliffs.delta.toFixed(3)} ({cliffs.dominance})
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                95% CI [{cliffs.ci[0].toFixed(3)}, {cliffs.ci[1].toFixed(3)}]
              </div>
            </div>
          </div>
        )}

        {/* Unified ECDF Chart */}
        <div className="mt-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            {!isH2H ? (
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-0.5 w-5"
                    style={{ backgroundColor: primaryColor }}
                  />
                  {primaryLabel} Pooled All-Exposures (Solid)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-0.5 w-5 border-b-2 border-dashed"
                    style={{ borderColor: primaryColor }}
                  />
                  {primaryLabel} Per-Target Median P50 (Dashed)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-5 border-b-2 border-dotted border-amber-600" />
                  {primaryLabel} Per-Target Edge-Case P95 (Dotted)
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-0.5 w-5"
                    style={{ backgroundColor: COLOR_B }}
                  />
                  Pipeline B Pooled (Solid Blue)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-0.5 w-5 border-b-2 border-dashed"
                    style={{ borderColor: COLOR_B }}
                  />
                  Pipeline B Target Median P50 (Dashed Blue)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-0.5 w-5"
                    style={{ backgroundColor: COLOR_A }}
                  />
                  Pipeline A Pooled (Solid Orange)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-0.5 w-5 border-b-2 border-dashed"
                    style={{ borderColor: COLOR_A }}
                  />
                  Pipeline A Target Median P50 (Dashed Orange)
                </span>
              </div>
            )}
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={ecdfGridRows}
                margin={{ top: 14, right: 24, bottom: 38, left: 64 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                <XAxis
                  dataKey="err"
                  type="number"
                  domain={[0, 0.16]}
                  tick={TICK}
                  label={{
                    value: 'Normalized Absolute Error |z_phot − z_spec| / (1 + z_spec)',
                    position: 'insideBottom',
                    offset: -22,
                    style: { fill: '#334155', fontSize: 12, fontWeight: 600 },
                  }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={TICK}
                  label={
                    <CenteredYAxisLabel
                      value="Cumulative Percentage of Sample (%)"
                      offset={16}
                    />
                  }
                />
                <Tooltip
                  formatter={(val, name) => [
                    `${Number(val ?? 0).toFixed(1)}%`,
                    String(name ?? ''),
                  ]}
                  labelFormatter={(label) =>
                    `Normalized Error ≤ ${Number(label ?? 0).toFixed(4)}`
                  }
                />

                <ReferenceLine
                  x={threshold}
                  stroke="#dc2626"
                  strokeWidth={1.75}
                  strokeDasharray="4 3"
                  label={{
                    value: `Gate ≤ ${threshold.toFixed(3)}`,
                    position: 'insideTopRight',
                    fill: '#dc2626',
                    fontSize: 11,
                  }}
                />
                <ReferenceLine y={50} stroke="#cbd5e1" strokeDasharray="3 3" />
                <ReferenceLine y={95} stroke="#cbd5e1" strokeDasharray="3 3" />

                {!isH2H ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey={primaryKey === 'a' ? 'pooledA' : 'pooledB'}
                      name={`${primaryLabel} Pooled All-Exposures`}
                      stroke={primaryColor}
                      strokeWidth={2.6}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey={primaryKey === 'a' ? 'subjP50A' : 'subjP50B'}
                      name={`${primaryLabel} Per-Target Median (P50)`}
                      stroke={primaryColor}
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey={primaryKey === 'a' ? 'subjP95A' : 'subjP95B'}
                      name={`${primaryLabel} Per-Target Edge-Case (P95)`}
                      stroke="#d97706"
                      strokeWidth={2}
                      strokeDasharray="2 3"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </>
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="pooledB"
                      name="Pipeline B Pooled All-Exposures"
                      stroke={COLOR_B}
                      strokeWidth={2.75}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="subjP50B"
                      name="Pipeline B Per-Target Median (P50)"
                      stroke={COLOR_B}
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="pooledA"
                      name="Pipeline A Pooled All-Exposures"
                      stroke={COLOR_A}
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="subjP50A"
                      name="Pipeline A Per-Target Median (P50)"
                      stroke={COLOR_A}
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Scorecard: Strictly Single-Pipeline OR Head-to-Head */}
      {!isH2H ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h4 className="text-base font-bold text-slate-900">
            {primaryLabel}: Two-Tier Validation KPI Scorecard (Pooled vs. Per-Target Quantiles)
          </h4>
          <p className="mt-1 text-xs text-slate-600">
            Evaluates {primaryLabel} against the Typical ({kpi.typical_standard.toFixed(3)}) and Edge-Case ({kpi.edge_standard.toFixed(3)}) science requirements using the upper 95% confidence bound.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="px-3 py-2.5">Validation KPI</th>
                  <th className="px-3 py-2.5">Point Estimate</th>
                  <th className="px-3 py-2.5">95% Confidence Interval</th>
                  <th className="px-3 py-2.5">Science Standard</th>
                  <th className="px-3 py-2.5">Gate Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kpi[primaryKey].rows.map((row) => (
                  <tr key={row.key}>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-slate-900">{row.label}</div>
                      <div className="text-[11px] text-slate-500">
                        {KPI_ROW_DEFINITIONS[row.key] ?? ''}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-slate-900">
                      {row.estimate.toFixed(4)}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-600">
                      [{row.ci_lower.toFixed(4)}, {row.ci_upper.toFixed(4)}]
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-700">
                      ≤ {row.standard.toFixed(4)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          row.passed
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {row.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Paired Exposure-by-Exposure Win / Tie / Loss Split (N = {cliffs.n_pairs.toLocaleString()} Paired Exposures)
              </h4>
              <p className="text-xs text-slate-600">
                Evaluates which pipeline achieves smaller absolute error on the exact same galaxy and visit (practical equivalence tie margin ±{cliffs.margin.toFixed(3)}).
              </p>
            </div>
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 font-mono text-xs font-bold text-emerald-800">
              {kpi.head_to_head.verdict}
            </span>
          </div>

          <div className="mt-4 flex h-9 w-full overflow-hidden rounded-lg border border-slate-200 text-xs font-bold text-white shadow-inner">
            <div
              style={{ width: `${bWinsPct}%`, backgroundColor: COLOR_B }}
              className="flex items-center justify-center"
            >
              Pipeline B Wins: {bWinsPct.toFixed(1)}%
            </div>
            <div
              style={{ width: `${tiesPct}%` }}
              className="flex items-center justify-center bg-slate-300 text-slate-900"
            >
              Ties: {tiesPct.toFixed(1)}%
            </div>
            <div
              style={{ width: `${aWinsPct}%`, backgroundColor: COLOR_A }}
              className="flex items-center justify-center"
            >
              A Wins: {aWinsPct.toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
