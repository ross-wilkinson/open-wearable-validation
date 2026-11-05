import { useMemo, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AXIS_TICK as TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import { CenteredYAxisLabel } from './chartAxisLabels.tsx';
import type {
  ActivePipeline,
  PipelineKey,
  TimeBlockData,
  ValidationKpiBlock,
} from './showcaseData.ts';

interface Tab4TimeSeriesProps {
  time: TimeBlockData;
  kpi: ValidationKpiBlock;
  activePipeline: ActivePipeline;
}

const COLOR_A = seriesColor(2); // Orange — Pipeline A
const COLOR_B = seriesColor(1); // Blue   — Pipeline B

function sequentialErrorColor(val: number, scale: number): string {
  const t = Math.min(1, Math.max(0, val / Math.max(1e-6, scale)));
  if (t < 0.25) return '#f1f5f9';
  if (t < 0.45) return '#fed7aa';
  if (t < 0.7) return '#fb923c';
  if (t < 0.88) return '#ea580c';
  return '#9a3412';
}

function divergingGapColor(gap: number): string {
  if (gap > 0.03) return '#1d4ed8';
  if (gap > 0.01) return '#60a5fa';
  if (gap > 0.003) return '#bfdbfe';
  if (gap >= -0.003) return '#f1f5f9';
  if (gap >= -0.01) return '#fed7aa';
  return '#ea580c';
}

export default function Tab4TimeSeries({
  time,
  kpi,
  activePipeline,
}: Tab4TimeSeriesProps): JSX.Element {
  const isH2H = activePipeline === 'h2h';
  const primaryKey: PipelineKey = activePipeline === 'b' ? 'b' : 'a';
  const primaryColor = primaryKey === 'a' ? COLOR_A : COLOR_B;
  const primaryLabel =
    primaryKey === 'a'
      ? 'Pipeline A (Legacy Template Fitting)'
      : 'Pipeline B (Deep Learning Hybrid)';

  const defaultSubjIdx = time.archetypes[activePipeline].p50;
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState<number>(defaultSubjIdx);

  // Layer 1: Population Fan Chart Rows
  const fanRows = useMemo(() => {
    const src = isH2H ? time.fan.gap : time.fan[primaryKey];
    return time.t_min.map((tVal, i) => ({
      tMin: Number(tVal.toFixed(1)),
      airmass: Number((time.airmass[i] ?? 1.2).toFixed(2)),
      p50: Number((src.p50[i] ?? 0).toFixed(4)),
      p25: Number((src.p25[i] ?? 0).toFixed(4)),
      p75: Number((src.p75[i] ?? 0).toFixed(4)),
      p5: Number((src.p5[i] ?? 0).toFixed(4)),
      p95: Number((src.p95[i] ?? 0).toFixed(4)),
      band50: [
        Number((src.p25[i] ?? 0).toFixed(4)),
        Number((src.p75[i] ?? 0).toFixed(4)),
      ] as [number, number],
      band90: [
        Number((src.p5[i] ?? 0).toFixed(4)),
        Number((src.p95[i] ?? 0).toFixed(4)),
      ] as [number, number],
      bWinsPct: Number(((time.wtl.b_wins[i] ?? 0) * 100).toFixed(1)),
      tiePct: Number(((time.wtl.tie[i] ?? 0) * 100).toFixed(1)),
      aWinsPct: Number(((time.wtl.a_wins[i] ?? 0) * 100).toFixed(1)),
    }));
  }, [time, isH2H, primaryKey]);

  // Layer 2: Sorted Subject Indices (show top 36 in carpet for fast scanning)
  const orderedSubjectIndices = useMemo(() => {
    return time.order[activePipeline].slice(0, 36);
  }, [time.order, activePipeline]);

  // Layer 3: Single-Target Time-Series Trace
  const safeSubjIdx = Math.min(
    Math.max(0, selectedSubjectIdx),
    time.subjects.id.length - 1,
  );

  const singleTargetRows = useMemo(() => {
    const rowA = time.heat.a[safeSubjIdx] ?? [];
    const rowB = time.heat.b[safeSubjIdx] ?? [];
    return time.t_min.map((tVal, i) => {
      const eA = rowA[i] ?? 0;
      const eB = rowB[i] ?? 0;
      return {
        tMin: Number(tVal.toFixed(1)),
        errA: Number(eA.toFixed(4)),
        errB: Number(eB.toFixed(4)),
        gap: Number((eA - eB).toFixed(4)),
      };
    });
  }, [time.heat, time.t_min, safeSubjIdx]);

  const subjId = time.subjects.id[safeSubjIdx] ?? safeSubjIdx;
  const subjZ = time.subjects.z_spec[safeSubjIdx] ?? 1.0;
  const subjMag = time.subjects.r_mag[safeSubjIdx] ?? 22.5;
  const subjMedA = time.subjects.median_a[safeSubjIdx] ?? 0;
  const subjMedB = time.subjects.median_b[safeSubjIdx] ?? 0;
  const subjDelta = time.subjects.cliffs_delta[safeSubjIdx] ?? 0;

  return (
    <div className="space-y-6">
      {/* LAYER 1: Population Error Trajectory Across Exposure Sequence */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Layer 1 · Population Trajectory Over Observing Block (0 – {time.duration_min} min)
              </span>
              <Link
                to="/academy/astro-calval/primers/time-series"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Read Primer: Error Over Time &amp; Cold-Start Transient →
              </Link>
            </div>
            <h3 className="mt-1.5 text-lg font-bold text-slate-900">
              {isH2H
                ? 'Head-to-Head Paired Advantage Trajectory Over Time (|e_A| − |e_B|)'
                : `${primaryLabel}: Population Error Quantile Fan Over Time`}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {isH2H
                ? `Tracks the median, interquartile (25th–75th), and 5th–95th percentile paired error reduction (|e_A| − |e_B|) across the ${time.duration_min}-minute observing sequence, highlighting the initial 0–${time.cold_start_end_min} min twilight & high-airmass transient.`
                : `Tracks the 50th, 25th–75th, and 5th–95th percentile absolute error across all targets over the ${time.duration_min}-minute observing sequence for ${primaryLabel}.`}
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-950">
            <div className="font-bold">0 – {time.cold_start_end_min} min Transient Window</div>
            <div className="text-[11px] text-amber-900/80">
              High airmass &amp; twilight thermal settling (τ = {time.tau} min)
            </div>
          </div>
        </div>

        <div className="mt-5 h-[310px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={fanRows}
              margin={{ top: 14, right: 24, bottom: 36, left: 64 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
              <XAxis
                dataKey="tMin"
                type="number"
                domain={[0, time.duration_min]}
                tick={TICK}
                label={{
                  value: 'Observing Sequence Elapsed Time (minutes)',
                  position: 'insideBottom',
                  offset: -20,
                  style: { fill: '#334155', fontSize: 12, fontWeight: 600 },
                }}
              />
              <YAxis
                tick={TICK}
                label={
                  <CenteredYAxisLabel
                    value={
                      isH2H
                        ? 'Paired Advantage |e_A| − |e_B|'
                        : 'Normalized Error |Δz| / (1 + z)'
                    }
                    offset={16}
                  />
                }
              />
              <Tooltip
                formatter={(val, name) => {
                  if (Array.isArray(val)) {
                    return [
                      `[${Number(val[0] ?? 0).toFixed(4)}, ${Number(val[1] ?? 0).toFixed(4)}]`,
                      String(name ?? ''),
                    ];
                  }
                  return [Number(val ?? 0).toFixed(4), String(name ?? '')];
                }}
                labelFormatter={(label) => `Elapsed Time = ${Number(label ?? 0).toFixed(1)} min`}
              />
              <ReferenceArea
                x1={0}
                x2={time.cold_start_end_min}
                fill="#fef3c7"
                fillOpacity={0.55}
                label={{
                  value: `Twilight & High-Airmass Transient (0–${time.cold_start_end_min} min)`,
                  position: 'insideTopLeft',
                  fill: '#92400e',
                  fontSize: 11,
                }}
              />

              {!isH2H ? (
                <>
                  <ReferenceLine
                    y={kpi.typical_standard}
                    stroke="#0f766e"
                    strokeDasharray="4 3"
                    label={{
                      value: `Typical (${kpi.typical_standard.toFixed(3)})`,
                      position: 'right',
                      fill: '#0f766e',
                      fontSize: 10,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="band90"
                    name={`${primaryLabel} 5th–95th Percentile Envelope`}
                    stroke="none"
                    fill={primaryColor}
                    fillOpacity={0.14}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="band50"
                    name={`${primaryLabel} 25th–75th Interquartile Envelope`}
                    stroke="none"
                    fill={primaryColor}
                    fillOpacity={0.26}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="p95"
                    name={`${primaryLabel} 95th Percentile (P95)`}
                    stroke={primaryColor}
                    strokeWidth={1.6}
                    strokeDasharray="4 3"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="p50"
                    name={`${primaryLabel} Median Error (P50)`}
                    stroke={primaryColor}
                    strokeWidth={2.6}
                    dot={false}
                    isAnimationActive={false}
                  />
                </>
              ) : (
                <>
                  <ReferenceLine y={0} stroke="#0f172a" strokeDasharray="4 3" />
                  <Area
                    type="monotone"
                    dataKey="band90"
                    name="5th–95th Percentile Paired Advantage"
                    stroke="none"
                    fill={COLOR_B}
                    fillOpacity={0.14}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="band50"
                    name="25th–75th Interquartile Paired Advantage"
                    stroke="none"
                    fill={COLOR_B}
                    fillOpacity={0.26}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="p50"
                    name="Median Paired Advantage (|e_A| − |e_B|)"
                    stroke={COLOR_B}
                    strokeWidth={2.6}
                    dot={false}
                    isAnimationActive={false}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* H2H Rolling Win / Tie / Loss Bar Strip */}
        {isH2H && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span>Rolling {time.wtl.window}-Epoch Paired Win / Tie / Loss Proportion Over Time</span>
              <span>Blue = Pipeline B Wins · Slate = Tie · Orange = Pipeline A Wins</span>
            </div>
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${fanRows.length}, minmax(0, 1fr))`,
              }}
            >
              {fanRows.map((row) => (
                <div key={row.tMin} className="flex flex-col items-center">
                  <div className="flex h-12 w-full flex-col overflow-hidden rounded border border-slate-200 bg-white">
                    <div
                      style={{ height: `${row.bWinsPct}%`, backgroundColor: COLOR_B }}
                      title={`t=${row.tMin}m: B Wins ${row.bWinsPct}%`}
                    />
                    <div
                      style={{ height: `${row.tiePct}%` }}
                      className="bg-slate-300"
                    />
                    <div
                      style={{ height: `${row.aWinsPct}%`, backgroundColor: COLOR_A }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LAYER 2: Target × Epoch Carpet Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Layer 2 · Target × Epoch Carpet Matrix
            </span>
            <h3 className="mt-1 text-base font-bold text-slate-900">
              {isH2H
                ? 'Paired Error Reduction Carpet (|e_A| − |e_B|) Across Targets & Epochs'
                : `${primaryLabel}: Absolute Error Carpet Across Targets & Epochs`}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedSubjectIdx(time.archetypes[activePipeline].p5)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Select Best Archetype (P5)
            </button>
            <button
              type="button"
              onClick={() => setSelectedSubjectIdx(time.archetypes[activePipeline].p50)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Select Typical Archetype (P50)
            </button>
            <button
              type="button"
              onClick={() => setSelectedSubjectIdx(time.archetypes[activePipeline].p95)}
              className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100"
            >
              Select Edge-Case Archetype (P95)
            </button>
          </div>
        </div>

        <div className="mt-4 max-h-[290px] overflow-y-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-[11px]">
            <thead className="sticky top-0 bg-slate-100 text-[10px] font-bold uppercase text-slate-600">
              <tr>
                <th className="px-2.5 py-1.5">Galaxy</th>
                <th className="px-2 py-1.5">z_spec</th>
                {time.t_min.map((tVal, idx) => (
                  <th
                    key={idx}
                    className={`px-1 py-1.5 text-center ${
                      tVal <= time.cold_start_end_min
                        ? 'bg-amber-100/80 text-amber-900'
                        : ''
                    }`}
                  >
                    {tVal.toFixed(0)}m
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {orderedSubjectIndices.map((sIdx) => {
                const isSelected = sIdx === safeSubjIdx;
                const gId = time.subjects.id[sIdx] ?? sIdx;
                const gZ = time.subjects.z_spec[sIdx] ?? 0;
                const rowA = time.heat.a[sIdx] ?? [];
                const rowB = time.heat.b[sIdx] ?? [];

                return (
                  <tr
                    key={sIdx}
                    onClick={() => setSelectedSubjectIdx(sIdx)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-indigo-50/90 ring-1 ring-inset ring-indigo-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-2.5 py-1 font-bold text-slate-800">
                      GAL-{String(gId).padStart(3, '0')}
                    </td>
                    <td className="px-2 py-1 text-slate-600">{gZ.toFixed(2)}</td>
                    {time.t_min.map((_, tIdx) => {
                      const eA = rowA[tIdx] ?? 0;
                      const eB = rowB[tIdx] ?? 0;
                      const val = isH2H ? eA - eB : primaryKey === 'a' ? eA : eB;
                      const bg = isH2H
                        ? divergingGapColor(val)
                        : sequentialErrorColor(val, time.heat.scale);
                      return (
                        <td key={tIdx} className="p-0.5 text-center">
                          <div
                            style={{ backgroundColor: bg }}
                            className="h-4 w-full rounded-xs"
                            title={
                              isH2H
                                ? `Δ(|e_A|−|e_B|) = ${val.toFixed(4)}`
                                : `|e| = ${val.toFixed(4)}`
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* LAYER 3: Single-Target Time-Series Inspector — Strictly Split by Active Perspective */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              Layer 3 · Single-Target Time-Series Inspector
            </span>
            <h3 className="mt-1 text-base font-bold text-slate-900">
              {isH2H
                ? `Target GAL-${String(subjId).padStart(3, '0')} (z_spec = ${subjZ.toFixed(2)}, r = ${subjMag.toFixed(1)} mag): Pipeline A vs. Pipeline B`
                : `Target GAL-${String(subjId).padStart(3, '0')} (z_spec = ${subjZ.toFixed(2)}, r = ${subjMag.toFixed(1)} mag): ${primaryLabel} Error Trace`}
            </h3>
          </div>

          {/* Strictly Scoped Per-Target KPI Badges */}
          {!isH2H ? (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                <span className="text-slate-500">{primaryLabel} Target Median: </span>
                <span
                  className="font-mono font-bold"
                  style={{ color: primaryColor }}
                >
                  {(primaryKey === 'a' ? subjMedA : subjMedB).toFixed(4)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-1.5">
                <span className="text-amber-900">Pipeline A Median: </span>
                <span className="font-mono font-bold" style={{ color: COLOR_A }}>
                  {subjMedA.toFixed(4)}
                </span>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-1.5">
                <span className="text-blue-900">Pipeline B Median: </span>
                <span className="font-mono font-bold" style={{ color: COLOR_B }}>
                  {subjMedB.toFixed(4)}
                </span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                <span className="text-slate-600">Target Cliff&apos;s δ: </span>
                <span className="font-mono font-bold text-slate-900">
                  {subjDelta >= 0 ? '+' : ''}
                  {subjDelta.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={singleTargetRows}
              margin={{ top: 12, right: 24, bottom: 34, left: 64 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
              <XAxis
                dataKey="tMin"
                type="number"
                domain={[0, time.duration_min]}
                tick={TICK}
                label={{
                  value: 'Observing Sequence Elapsed Time (minutes)',
                  position: 'insideBottom',
                  offset: -20,
                  style: { fill: '#334155', fontSize: 12, fontWeight: 600 },
                }}
              />
              <YAxis
                domain={[0, 'auto']}
                tick={TICK}
                label={
                  <CenteredYAxisLabel
                    value="Normalized Error |Δz| / (1 + z)"
                    offset={16}
                  />
                }
              />
              <Tooltip
                formatter={(val, name) => [
                  Number(val ?? 0).toFixed(4),
                  String(name ?? ''),
                ]}
                labelFormatter={(label) => `Elapsed Time = ${Number(label ?? 0).toFixed(1)} min`}
              />
              <ReferenceArea
                x1={0}
                x2={time.cold_start_end_min}
                fill="#fef3c7"
                fillOpacity={0.5}
              />
              <ReferenceLine
                y={kpi.typical_standard}
                stroke="#0f766e"
                strokeDasharray="4 3"
                label={{
                  value: `Typical (${kpi.typical_standard.toFixed(3)})`,
                  position: 'right',
                  fill: '#0f766e',
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={kpi.edge_standard}
                stroke="#d97706"
                strokeDasharray="4 3"
                label={{
                  value: `Edge (${kpi.edge_standard.toFixed(3)})`,
                  position: 'right',
                  fill: '#d97706',
                  fontSize: 10,
                }}
              />

              {/* Strictly Render ONLY Active Pipeline in Single-Pipeline Mode, or Both in H2H */}
              {!isH2H ? (
                <Line
                  type="monotone"
                  dataKey={primaryKey === 'a' ? 'errA' : 'errB'}
                  name={`${primaryLabel} Absolute Error`}
                  stroke={primaryColor}
                  strokeWidth={2.6}
                  dot={{ r: 3.5, fill: primaryColor }}
                  isAnimationActive={false}
                />
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="errA"
                    name="Pipeline A Absolute Error"
                    stroke={COLOR_A}
                    strokeWidth={2.4}
                    dot={{ r: 3, fill: COLOR_A }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="errB"
                    name="Pipeline B Absolute Error"
                    stroke={COLOR_B}
                    strokeWidth={2.4}
                    dot={{ r: 3, fill: COLOR_B }}
                    isAnimationActive={false}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
