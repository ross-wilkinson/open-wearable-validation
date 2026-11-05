import { useMemo, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AXIS_TICK as TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import { CenteredYAxisLabel } from './chartAxisLabels.tsx';
import { computeIsoBellCurveData } from './sadlerMath.ts';
import type {
  ActivePipeline,
  AgreementData,
  PipelineKey,
  PipelineSummary,
  SadlerCurveData,
  UAxisMode,
} from './showcaseData.ts';

interface Tab2AgreementProps {
  agreement: AgreementData;
  pipelines: Record<PipelineKey, PipelineSummary>;
  activePipeline: ActivePipeline;
  uAxisMode: UAxisMode;
  onUAxisModeChange: (mode: UAxisMode) => void;
}

type ScaleMode = 'raw' | 'correlation' | 'normalized';

const COLOR_A = seriesColor(2); // Orange — Pipeline A (Legacy Template Fitting)
const COLOR_B = seriesColor(1); // Blue   — Pipeline B (Deep Learning Hybrid)

interface CombinedBARow {
  u: number;
  bias?: number;
  biasLo?: number;
  biasHi?: number;
  biasBand?: [number, number];
  loaHi?: number;
  loaHiLo?: number;
  loaHiHi?: number;
  loaHiBand?: [number, number];
  loaLo?: number;
  loaLoLo?: number;
  loaLoHi?: number;
  loaLoBand?: [number, number];
  coreY?: number;
  outY?: number;
  zSpec?: number;
}

interface CombinedCorrRow {
  x: number;
  identity?: number;
  upperCone?: number;
  lowerCone?: number;
  coreY?: number;
  outY?: number;
}

function buildCombinedBlandAltmanData(
  uGrid: number[],
  curve: SadlerCurveData,
  zSpecArr: number[],
  dzArr: number[],
  uAxisMode: UAxisMode,
  scaleMode: 'raw' | 'normalized',
  maxZ: number,
): CombinedBARow[] {
  const curveRows: CombinedBARow[] = [];
  for (let i = 0; i < uGrid.length; i++) {
    const uVal = uGrid[i] ?? 0;
    if (uVal > maxZ) continue;
    const scale = scaleMode === 'normalized' ? 1 + uVal : 1.0;
    const bias = (curve.bias[i] ?? 0) / scale;
    const biasLo = (curve.bias_lo[i] ?? 0) / scale;
    const biasHi = (curve.bias_hi[i] ?? 0) / scale;
    const loaHi = (curve.loa_hi[i] ?? 0) / scale;
    const loaHiLo = (curve.loa_hi_lo[i] ?? 0) / scale;
    const loaHiHi = (curve.loa_hi_hi[i] ?? 0) / scale;
    const loaLo = (curve.loa_lo[i] ?? 0) / scale;
    const loaLoLo = (curve.loa_lo_lo[i] ?? 0) / scale;
    const loaLoHi = (curve.loa_lo_hi[i] ?? 0) / scale;

    curveRows.push({
      u: Number(uVal.toFixed(4)),
      bias: Number(bias.toFixed(4)),
      biasLo: Number(biasLo.toFixed(4)),
      biasHi: Number(biasHi.toFixed(4)),
      biasBand: [Number(biasLo.toFixed(4)), Number(biasHi.toFixed(4))],
      loaHi: Number(loaHi.toFixed(4)),
      loaHiLo: Number(loaHiLo.toFixed(4)),
      loaHiHi: Number(loaHiHi.toFixed(4)),
      loaHiBand: [Number(loaHiLo.toFixed(4)), Number(loaHiHi.toFixed(4))],
      loaLo: Number(loaLo.toFixed(4)),
      loaLoLo: Number(loaLoLo.toFixed(4)),
      loaLoHi: Number(loaLoHi.toFixed(4)),
      loaLoBand: [Number(loaLoLo.toFixed(4)), Number(loaLoHi.toFixed(4))],
    });
  }

  const scatterRows: CombinedBARow[] = [];
  const nPts = Math.min(zSpecArr.length, dzArr.length);
  for (let i = 0; i < nPts; i++) {
    const zSpec = zSpecArr[i] ?? 0;
    const dz = dzArr[i] ?? 0;
    const uVal = uAxisMode === 'reference' ? zSpec : Math.max(0, zSpec + 0.5 * dz);
    if (uVal > maxZ) continue;
    const normErr = dz / (1 + zSpec);
    const isOutlier = Math.abs(normErr) > 0.15;
    const yVal = scaleMode === 'normalized' ? normErr : dz;

    scatterRows.push({
      u: Number(uVal.toFixed(4)),
      coreY: isOutlier ? undefined : Number(yVal.toFixed(4)),
      outY: isOutlier ? Number(yVal.toFixed(4)) : undefined,
      zSpec: Number(zSpec.toFixed(4)),
    });
  }

  return [...curveRows, ...scatterRows].sort((a, b) => a.u - b.u);
}

function buildCombinedCorrelationData(
  zSpecArr: number[],
  dzArr: number[],
  maxZ: number,
): CombinedCorrRow[] {
  const steps = 40;
  const step = maxZ / steps;
  const guideRows: CombinedCorrRow[] = Array.from({ length: steps + 1 }, (_, idx) => {
    const x = Number((idx * step).toFixed(4));
    const cone = 0.05 * (1 + x);
    return {
      x,
      identity: x,
      upperCone: Number((x + cone).toFixed(4)),
      lowerCone: Number(Math.max(0, x - cone).toFixed(4)),
    };
  });

  const pointRows: CombinedCorrRow[] = [];
  const nPts = Math.min(zSpecArr.length, dzArr.length);
  for (let i = 0; i < nPts; i++) {
    const zSpec = zSpecArr[i] ?? 0;
    const dz = dzArr[i] ?? 0;
    const zPhot = Math.max(0, zSpec + dz);
    if (zSpec > maxZ || zPhot > maxZ * 1.1) continue;
    const isOutlier = Math.abs(dz) / (1 + zSpec) > 0.15;
    pointRows.push({
      x: Number(zSpec.toFixed(4)),
      coreY: isOutlier ? undefined : Number(zPhot.toFixed(4)),
      outY: isOutlier ? Number(zPhot.toFixed(4)) : undefined,
    });
  }

  return [...guideRows, ...pointRows].sort((a, b) => a.x - b.x);
}

function computeKdeCurve(
  values: number[],
  minVal: number,
  maxVal: number,
  steps = 56,
  bandwidth = 0.11,
): Array<{ coord: number; density: number }> {
  const filtered = values.filter((v) => v >= minVal && v <= maxVal);
  const n = Math.max(1, filtered.length);
  const step = (maxVal - minVal) / steps;
  const invSqrt2Pi = 0.3989422804;

  return Array.from({ length: steps + 1 }, (_, idx) => {
    const coord = Number((minVal + idx * step).toFixed(4));
    let sum = 0;
    for (let i = 0; i < filtered.length; i++) {
      const u = (coord - (filtered[i] ?? 0)) / bandwidth;
      sum += invSqrt2Pi * Math.exp(-0.5 * u * u);
    }
    return {
      coord,
      density: Number((sum / (n * bandwidth)).toFixed(4)),
    };
  });
}

export default function Tab2Agreement({
  agreement,
  pipelines,
  activePipeline,
  uAxisMode,
  onUAxisModeChange,
}: Tab2AgreementProps): JSX.Element {
  const [scaleMode, setScaleMode] = useState<ScaleMode>('raw');
  const [lowZZoom, setLowZZoom] = useState<boolean>(false);
  const [selectedZ0Idx, setSelectedZ0Idx] = useState<number>(18); // z0 ≈ 1.00

  const isH2H = activePipeline === 'h2h';
  const primaryKey: PipelineKey = activePipeline === 'b' ? 'b' : 'a';
  const primaryColor = primaryKey === 'a' ? COLOR_A : COLOR_B;
  const primaryLabel =
    primaryKey === 'a'
      ? 'Pipeline A (Legacy Template Fitting)'
      : 'Pipeline B (Deep Learning Hybrid)';

  const maxZ = lowZZoom ? 0.5 : 3.0;
  const sadlerBlock = agreement.sadler[uAxisMode];
  const sadlerPrimary = sadlerBlock[primaryKey];

  // Unified data arrays for Recharts 3.10.1 (parent chart `data` holds both curve grid and 202 scatter points)
  const combinedPrimaryBA = useMemo(() => {
    const mode = scaleMode === 'normalized' ? 'normalized' : 'raw';
    const dzArr = primaryKey === 'a' ? agreement.scatter.dz_a : agreement.scatter.dz_b;
    return buildCombinedBlandAltmanData(
      sadlerBlock.u,
      sadlerPrimary,
      agreement.scatter.z_spec,
      dzArr,
      uAxisMode,
      mode,
      maxZ,
    );
  }, [sadlerBlock.u, sadlerPrimary, agreement.scatter, primaryKey, uAxisMode, scaleMode, maxZ]);

  const combinedBlandAltmanA = useMemo(() => {
    const mode = scaleMode === 'normalized' ? 'normalized' : 'raw';
    return buildCombinedBlandAltmanData(
      sadlerBlock.u,
      sadlerBlock.a,
      agreement.scatter.z_spec,
      agreement.scatter.dz_a,
      uAxisMode,
      mode,
      maxZ,
    );
  }, [sadlerBlock, agreement.scatter, uAxisMode, scaleMode, maxZ]);

  const combinedBlandAltmanB = useMemo(() => {
    const mode = scaleMode === 'normalized' ? 'normalized' : 'raw';
    return buildCombinedBlandAltmanData(
      sadlerBlock.u,
      sadlerBlock.b,
      agreement.scatter.z_spec,
      agreement.scatter.dz_b,
      uAxisMode,
      mode,
      maxZ,
    );
  }, [sadlerBlock, agreement.scatter, uAxisMode, scaleMode, maxZ]);

  const combinedCorrPrimary = useMemo(() => {
    const dzArr = primaryKey === 'a' ? agreement.scatter.dz_a : agreement.scatter.dz_b;
    return buildCombinedCorrelationData(agreement.scatter.z_spec, dzArr, maxZ);
  }, [agreement.scatter, primaryKey, maxZ]);

  // Marginal KDE distributions for X (Reference z_spec) and Y (Measured z_phot)
  const marginalKdeX = useMemo(
    () =>
      computeKdeCurve(
        agreement.scatter.z_spec,
        0,
        maxZ,
        56,
        lowZZoom ? 0.03 : 0.12,
      ),
    [agreement.scatter.z_spec, maxZ, lowZZoom],
  );

  const marginalKdeY = useMemo(() => {
    const dzArr = primaryKey === 'a' ? agreement.scatter.dz_a : agreement.scatter.dz_b;
    const zPhotArr = agreement.scatter.z_spec.map((z, i) =>
      Math.max(0, z + (dzArr[i] ?? 0)),
    );
    return computeKdeCurve(zPhotArr, 0, maxZ, 56, lowZZoom ? 0.03 : 0.12);
  }, [agreement.scatter, primaryKey, maxZ, lowZZoom]);

  // Paired advantage curve across redshift for H2H
  const h2hEnvelopeComparisonRows = useMemo(() => {
    return sadlerBlock.u
      .map((uVal, i) => {
        const halfWidthA = 0.5 * ((sadlerBlock.a.loa_hi[i] ?? 0) - (sadlerBlock.a.loa_lo[i] ?? 0));
        const halfWidthB = 0.5 * ((sadlerBlock.b.loa_hi[i] ?? 0) - (sadlerBlock.b.loa_lo[i] ?? 0));
        return {
          u: Number(uVal.toFixed(3)),
          halfWidthA: Number(halfWidthA.toFixed(4)),
          halfWidthB: Number(halfWidthB.toFixed(4)),
          reduction: Number((halfWidthA - halfWidthB).toFixed(4)),
        };
      })
      .filter((r) => r.u <= maxZ);
  }, [sadlerBlock, maxZ]);

  // Detection sensitivity data (ISO 11843-1) strictly split by activePipeline
  const det = agreement.detection;
  const safeZ0Idx = Math.min(Math.max(0, selectedZ0Idx), det.z0.length - 1);
  const currentZ0 = det.z0[safeZ0Idx] ?? 1.0;

  const detPrimary = primaryKey === 'a' ? det.a : det.b;
  const xCPrimary = detPrimary.x_c[safeZ0Idx] ?? 0.05;
  const xDPrimary = detPrimary.x_d[safeZ0Idx] ?? 0.1;
  const yCPrimary = detPrimary.y_c[safeZ0Idx] ?? 0.05;
  const sigma0Primary = detPrimary.sigma_0[safeZ0Idx] ?? 0.03;
  const ratioPrimary = detPrimary.ratio[safeZ0Idx] ?? 2.1;

  const xCA = det.a.x_c[safeZ0Idx] ?? 0.05;
  const xDA = det.a.x_d[safeZ0Idx] ?? 0.12;
  const sigma0A = det.a.sigma_0[safeZ0Idx] ?? 0.04;

  const xCB = det.b.x_c[safeZ0Idx] ?? 0.03;
  const xDB = det.b.x_d[safeZ0Idx] ?? 0.06;
  const sigma0B = det.b.sigma_0[safeZ0Idx] ?? 0.02;

  const isoBellRowsPrimary = useMemo(() => {
    const sigmaD = Math.max(sigma0Primary, (xDPrimary - xCPrimary) / 1.6449);
    return computeIsoBellCurveData({
      slope: detPrimary.slope,
      sigma0: sigma0Primary,
      sigmaD,
      yC: yCPrimary,
      xD: xDPrimary,
    });
  }, [detPrimary.slope, sigma0Primary, xDPrimary, xCPrimary, yCPrimary]);

  const h2hBellRows = useMemo(() => {
    const sigmaDA = Math.max(sigma0A, (xDA - xCA) / 1.6449);
    const sigmaDB = Math.max(sigma0B, (xDB - xCB) / 1.6449);
    const yMin = -2.8 * sigma0A;
    const yMax = xDA + 2.8 * sigmaDA;
    const steps = 80;
    const gauss = (y: number, mu: number, s: number) => {
      const z = (y - mu) / Math.max(1e-6, s);
      return Math.exp(-0.5 * z * z) / (Math.max(1e-6, s) * Math.sqrt(2 * Math.PI));
    };
    return Array.from({ length: steps + 1 }, (_, i) => {
      const y = yMin + (i / steps) * (yMax - yMin);
      return {
        y: Number(y.toFixed(4)),
        shiftedA: Number(gauss(y, xDA, sigmaDA).toFixed(3)),
        shiftedB: Number(gauss(y, xDB, sigmaDB).toFixed(3)),
      };
    });
  }, [sigma0A, sigma0B, xDA, xCA, xDB, xCB]);

  const detectionCurveRows = useMemo(() => {
    return det.z0.map((zVal, idx) => {
      const xcA = det.a.x_c[idx] ?? 0;
      const xdA = det.a.x_d[idx] ?? 0;
      const xcB = det.b.x_c[idx] ?? 0;
      const xdB = det.b.x_d[idx] ?? 0;
      return {
        z0: Number(zVal.toFixed(3)),
        xC_A: Number(xcA.toFixed(4)),
        xD_A: Number(xdA.toFixed(4)),
        homo2xC_A: Number((2 * xcA).toFixed(4)),
        xC_B: Number(xcB.toFixed(4)),
        xD_B: Number(xdB.toFixed(4)),
        homo2xC_B: Number((2 * xcB).toFixed(4)),
      };
    });
  }, [det]);

  const yDomainBA: [number, number] =
    scaleMode === 'normalized' ? [-0.22, 0.22] : lowZZoom ? [-0.22, 0.22] : [-0.45, 0.45];

  const yAxisTitleBA =
    scaleMode === 'normalized'
      ? 'Normalized Error Δz / (1 + z_spec)'
      : 'Redshift Error (z_phot − z_spec)';

  const xAxisTitleBA =
    uAxisMode === 'reference'
      ? 'Spectroscopic Reference Redshift (z_spec)'
      : 'Pair Mean Redshift ½(z_phot + z_spec)';

  return (
    <div className="space-y-6">
      {/* 1. Primary Correlation & Curved Bland-Altman Agreement Tile */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                {isH2H
                  ? 'Head-to-Head Agreement Envelope Comparison'
                  : `${primaryLabel} · Curved Agreement & Correlation`}
              </span>
              <Link
                to="/academy/astro-calval/primers/variance-function"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Why Are These Agreement Limits Curved? Read Primer →
              </Link>
            </div>
            <h3 className="mt-1.5 text-lg font-bold text-slate-900">
              {isH2H
                ? 'Side-by-Side Curved Bland–Altman Envelopes: Pipeline A vs. Pipeline B'
                : scaleMode === 'correlation'
                  ? `${primaryLabel}: Square 1:1 Correlation with Marginal KDE Distributions`
                  : `${primaryLabel}: Curved Bland–Altman Limits of Agreement & 95% Confidence Bands`}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {isH2H
                ? 'Displays all 202 sampled galaxies and continuous variance-function Limits of Agreement side by side so you can compare how Pipeline B compresses the high-redshift error trumpet.'
                : scaleMode === 'correlation'
                  ? 'Square 1:1 correlation plot (45° Line of Identity) paired with top (Reference z_spec) and right (Measured z_phot) Kernel Density Estimate (KDE) marginal distributions.'
                  : 'All 202 sampled galaxies are plotted alongside the continuous conditional bias curve and 95% Limits of Agreement (shaded bands and dashed borders show the 95% confidence intervals around the Upper LoA, Mean Bias, and Lower LoA).'}
            </p>
          </div>

          {/* View Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {!isH2H && (
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setScaleMode('raw')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    scaleMode === 'raw'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bland–Altman Error
                </button>
                <button
                  type="button"
                  onClick={() => setScaleMode('correlation')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    scaleMode === 'correlation'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1:1 Correlation + KDEs
                </button>
                <button
                  type="button"
                  onClick={() => setScaleMode('normalized')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    scaleMode === 'normalized'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Normalized Δz/(1+z)
                </button>
              </div>
            )}

            {scaleMode !== 'correlation' && (
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => onUAxisModeChange('reference')}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                    uAxisMode === 'reference'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  X: Reference z_spec
                </button>
                <button
                  type="button"
                  onClick={() => onUAxisModeChange('mean')}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                    uAxisMode === 'mean'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  X: Pair Mean
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setLowZZoom((v) => !v)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                lowZZoom
                  ? 'border-amber-300 bg-amber-50 text-amber-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {lowZZoom ? 'Showing Low-z Zoom (0 – 0.50)' : 'Low-z Zoom (0 – 0.50)'}
            </button>
          </div>
        </div>

        {/* Summary Diagnostic Strip */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Fitted Variance Function Law σ(z)
            </div>
            <div className="mt-0.5 font-mono text-xs font-bold text-slate-900">
              {isH2H
                ? `A: (${(sadlerBlock.a.stats.params[0] ?? 0).toFixed(3)} + ${(sadlerBlock.a.stats.params[1] ?? 0).toFixed(3)}·z) · B: (${(sadlerBlock.b.stats.params[0] ?? 0).toFixed(3)} + ${(sadlerBlock.b.stats.params[1] ?? 0).toFixed(3)}·z)`
                : `σ(z) = ${(sadlerPrimary.stats.params[0] ?? 0).toFixed(4)} + ${(sadlerPrimary.stats.params[1] ?? 0).toFixed(4)} · z`}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Individual Galaxies Plotted
            </div>
            <div className="mt-0.5 font-mono text-xs font-bold text-slate-900">
              {agreement.scatter.z_spec.length} Individual Galaxies (Core + Catastrophic Outliers)
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Upper/Lower LoA 95% Confidence Corridor
            </div>
            <div className="mt-0.5 font-mono text-xs font-bold text-slate-900">
              {isH2H
                ? 'A: ±0.031 → ±0.072 · B: ±0.015 → ±0.036'
                : primaryKey === 'a'
                  ? '±0.031 (z=0.5) → ±0.072 (z=2.5) around LoA'
                  : '±0.015 (z=0.5) → ±0.036 (z=2.5) around LoA'}
            </div>
          </div>
        </div>

        {/* MAIN PLOT AREA */}
        {!isH2H ? (
          scaleMode === 'correlation' ? (
            /* SQUARE 1:1 CORRELATION PLOT WITH TOP (X) AND RIGHT (Y) MARGINAL KDE DISTRIBUTIONS */
            <div className="mt-6">
              <div className="mx-auto max-w-[660px]">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">
                    Square 1:1 Joint Correlation &amp; Marginal KDE View (45° Line of Identity)
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                      Core Galaxy
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
                      Catastrophic Outlier
                    </span>
                  </div>
                </div>

                {/* Joint Plot Grid: Top-Left = X Marginal KDE, Top-Right = Corner Badge, Bottom-Left = Square 1:1 Plot, Bottom-Right = Y Marginal KDE */}
                <div className="grid grid-cols-[1fr_112px] gap-2">
                  {/* Top Marginal KDE (Reference z_spec) */}
                  <div className="h-24 rounded-t-xl border border-slate-200 bg-slate-50/60 pl-[58px] pr-[14px] pt-2">
                    <div className="mb-0.5 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Reference z_spec Marginal Distribution (KDE)
                    </div>
                    <div className="h-16 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={marginalKdeX}
                          margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
                        >
                          <XAxis dataKey="coord" type="number" domain={[0, maxZ]} hide />
                          <YAxis hide domain={[0, 'auto']} />
                          <Area
                            type="monotone"
                            dataKey="density"
                            stroke={primaryColor}
                            strokeWidth={1.75}
                            fill={primaryColor}
                            fillOpacity={0.24}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top-Right Corner Info Box */}
                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 p-2 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      1:1 Aspect
                    </span>
                    <span className="mt-0.5 font-mono text-xs font-bold text-slate-900">
                      45° Identity
                    </span>
                    <span className="mt-0.5 text-[10px] text-slate-500">
                      {pipelines[primaryKey].sigma_nmad.toFixed(4)} NMAD
                    </span>
                  </div>

                  {/* Main Square Correlation Plot */}
                  <div className="aspect-square w-full max-w-[536px] rounded-bl-xl border border-slate-200 bg-white p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={combinedCorrPrimary}
                        margin={{ top: 14, right: 14, bottom: 38, left: 58 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                        <XAxis
                          dataKey="x"
                          type="number"
                          domain={[0, maxZ]}
                          tick={TICK}
                          label={{
                            value: 'Spectroscopic Reference Redshift (z_spec)',
                            position: 'insideBottom',
                            offset: -22,
                            style: { fill: '#334155', fontSize: 12, fontWeight: 600 },
                          }}
                        />
                        <YAxis
                          type="number"
                          domain={[0, maxZ]}
                          tick={TICK}
                          label={
                            <CenteredYAxisLabel
                              value="Measured Photometric Redshift (z_phot)"
                              offset={16}
                            />
                          }
                        />
                        <Tooltip
                          formatter={(val, name) => [
                            Number(val ?? 0).toFixed(4),
                            String(name ?? ''),
                          ]}
                          labelFormatter={(label) =>
                            `Reference z_spec = ${Number(label ?? 0).toFixed(3)}`
                          }
                        />
                        <Line
                          type="linear"
                          dataKey="identity"
                          name="1:1 Line of Identity (45°)"
                          stroke="#0f172a"
                          strokeWidth={2}
                          dot={false}
                          connectNulls
                          isAnimationActive={false}
                        />
                        <Line
                          type="linear"
                          dataKey="upperCone"
                          name="+0.05(1+z) Boundary"
                          stroke="#94a3b8"
                          strokeDasharray="5 4"
                          strokeWidth={1.3}
                          dot={false}
                          connectNulls
                          isAnimationActive={false}
                        />
                        <Line
                          type="linear"
                          dataKey="lowerCone"
                          name="−0.05(1+z) Boundary"
                          stroke="#94a3b8"
                          strokeDasharray="5 4"
                          strokeWidth={1.3}
                          dot={false}
                          connectNulls
                          isAnimationActive={false}
                        />
                        <Scatter
                          name="Core Galaxy"
                          dataKey="coreY"
                          fill={primaryColor}
                          fillOpacity={0.68}
                          isAnimationActive={false}
                        />
                        <Scatter
                          name="Catastrophic Outlier"
                          dataKey="outY"
                          fill="#dc2626"
                          fillOpacity={0.9}
                          isAnimationActive={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Right Marginal KDE (Measured z_phot) */}
                  <div className="flex h-full flex-col rounded-r-xl border border-slate-200 bg-slate-50/60 pb-[38px] pt-[14px] pr-2">
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          layout="vertical"
                          data={[...marginalKdeY].reverse()}
                          margin={{ top: 0, right: 4, bottom: 0, left: 2 }}
                        >
                          <XAxis type="number" hide domain={[0, 'auto']} />
                          <YAxis dataKey="coord" type="category" hide />
                          <Area
                            type="monotone"
                            dataKey="density"
                            stroke={primaryColor}
                            strokeWidth={1.75}
                            fill={primaryColor}
                            fillOpacity={0.24}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-1 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      z_phot KDE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SINGLE-PIPELINE BLAND-ALTMAN PLOT WITH ALL 202 SCATTER POINTS & CLEAR 95% CI BANDS */
            <div className="mt-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                    Core Galaxies
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                    Catastrophic Outliers (|Δz|/(1+z) &gt; 0.15)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-3 w-5 rounded border"
                      style={{
                        backgroundColor: `${primaryColor}35`,
                        borderColor: primaryColor,
                      }}
                    />
                    95% Confidence Intervals on Upper/Lower LoA &amp; Bias
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Switch to &ldquo;1:1 Correlation + KDEs&rdquo; above for the square joint correlation plot
                </span>
              </div>

              <div className="h-[430px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={combinedPrimaryBA}
                    margin={{ top: 14, right: 24, bottom: 38, left: 68 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                    <XAxis
                      dataKey="u"
                      type="number"
                      domain={[0, maxZ]}
                      tick={TICK}
                      label={{
                        value: xAxisTitleBA,
                        position: 'insideBottom',
                        offset: -22,
                        style: { fill: '#334155', fontSize: 12, fontWeight: 600 },
                      }}
                    />
                    <YAxis
                      domain={yDomainBA}
                      tick={TICK}
                      label={<CenteredYAxisLabel value={yAxisTitleBA} offset={18} />}
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
                      labelFormatter={(label) => `Redshift u = ${Number(label ?? 0).toFixed(3)}`}
                    />
                    <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />

                    {/* 95% Confidence Corridors around Upper LoA, Mean Bias, and Lower LoA */}
                    <Area
                      type="monotone"
                      dataKey="loaHiBand"
                      name="Upper 95% LoA Confidence Band"
                      stroke={primaryColor}
                      strokeOpacity={0.45}
                      strokeWidth={1}
                      fill={primaryColor}
                      fillOpacity={0.25}
                      connectNulls
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="biasBand"
                      name="Mean Bias 95% Confidence Band"
                      stroke="#475569"
                      strokeOpacity={0.4}
                      strokeWidth={1}
                      fill="#64748b"
                      fillOpacity={0.22}
                      connectNulls
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="loaLoBand"
                      name="Lower 95% LoA Confidence Band"
                      stroke={primaryColor}
                      strokeOpacity={0.45}
                      strokeWidth={1}
                      fill={primaryColor}
                      fillOpacity={0.25}
                      connectNulls
                      isAnimationActive={false}
                    />

                    {/* Continuous Parametric LoA and Bias Curves */}
                    <Line
                      type="monotone"
                      dataKey="loaHi"
                      name="Upper 95% Limit of Agreement"
                      stroke={primaryColor}
                      strokeWidth={2.4}
                      dot={false}
                      connectNulls
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="bias"
                      name="Conditional Bias"
                      stroke="#0f172a"
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="loaLo"
                      name="Lower 95% Limit of Agreement"
                      stroke={primaryColor}
                      strokeWidth={2.4}
                      dot={false}
                      connectNulls
                      isAnimationActive={false}
                    />

                    {/* All 202 Individual Galaxy Scatter Points */}
                    <Scatter
                      name="Core Galaxy"
                      dataKey="coreY"
                      fill={primaryColor}
                      fillOpacity={0.68}
                      isAnimationActive={false}
                    />
                    <Scatter
                      name="Catastrophic Outlier"
                      dataKey="outY"
                      fill="#dc2626"
                      fillOpacity={0.9}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        ) : (
          /* HEAD-TO-HEAD SIDE-BY-SIDE BLAND-ALTMAN SMALL MULTIPLES + ENVELOPE REDUCTION */
          <div className="mt-5 space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[
                {
                  key: 'a' as const,
                  title: 'Pipeline A (Legacy Template Fitting) vs. Reference',
                  rows: combinedBlandAltmanA,
                  color: COLOR_A,
                  nmad: pipelines.a.sigma_nmad,
                },
                {
                  key: 'b' as const,
                  title: 'Pipeline B (Deep Learning Hybrid) vs. Reference',
                  rows: combinedBlandAltmanB,
                  color: COLOR_B,
                  nmad: pipelines.b.sigma_nmad,
                },
              ].map(({ key, title, rows, color, nmad }) => (
                <div
                  key={key}
                  className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{title}</span>
                    <span className="font-mono text-[11px] text-slate-600">
                      202 galaxies · σ_NMAD = {nmad.toFixed(4)}
                    </span>
                  </div>
                  <div className="h-[310px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={rows}
                        margin={{ top: 10, right: 16, bottom: 32, left: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                        <XAxis
                          dataKey="u"
                          type="number"
                          domain={[0, maxZ]}
                          tick={TICK}
                          label={{
                            value: xAxisTitleBA,
                            position: 'insideBottom',
                            offset: -18,
                            style: { fill: '#334155', fontSize: 11, fontWeight: 600 },
                          }}
                        />
                        <YAxis
                          domain={yDomainBA}
                          tick={TICK}
                          label={
                            <CenteredYAxisLabel
                              value="Error (z_phot − z_spec)"
                              offset={14}
                            />
                          }
                        />
                        <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                        <Area
                          type="monotone"
                          dataKey="loaHiBand"
                          name="Upper LoA 95% CI"
                          stroke={color}
                          strokeOpacity={0.4}
                          fill={color}
                          fillOpacity={0.24}
                          connectNulls
                          isAnimationActive={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="loaLoBand"
                          name="Lower LoA 95% CI"
                          stroke={color}
                          strokeOpacity={0.4}
                          fill={color}
                          fillOpacity={0.24}
                          connectNulls
                          isAnimationActive={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="loaHi"
                          name="Upper 95% LoA"
                          stroke={color}
                          strokeWidth={2}
                          dot={false}
                          connectNulls
                          isAnimationActive={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="bias"
                          name="Conditional Bias"
                          stroke="#0f172a"
                          strokeWidth={1.75}
                          dot={false}
                          connectNulls
                          isAnimationActive={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="loaLo"
                          name="Lower 95% LoA"
                          stroke={color}
                          strokeWidth={2}
                          dot={false}
                          connectNulls
                          isAnimationActive={false}
                        />
                        <Scatter
                          name="Core Galaxy"
                          dataKey="coreY"
                          fill={color}
                          fillOpacity={0.65}
                          isAnimationActive={false}
                        />
                        <Scatter
                          name="Catastrophic Outlier"
                          dataKey="outY"
                          fill="#dc2626"
                          fillOpacity={0.9}
                          isAnimationActive={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Comparison of 95% LoA Half-Width across Redshift */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Direct Comparison of 95% Limit-of-Agreement Half-Width Across Redshift
                  </h4>
                  <p className="text-xs text-slate-600">
                    Compares the 1.96 × σ(z) error boundary half-width of Pipeline A vs. Pipeline B across the full redshift range.
                  </p>
                </div>
                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                  Lower Curve = Tighter Agreement Envelope
                </span>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={h2hEnvelopeComparisonRows}
                    margin={{ top: 10, right: 20, bottom: 32, left: 64 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                    <XAxis
                      dataKey="u"
                      type="number"
                      domain={[0, maxZ]}
                      tick={TICK}
                      label={{
                        value: xAxisTitleBA,
                        position: 'insideBottom',
                        offset: -18,
                        style: { fill: '#334155', fontSize: 12, fontWeight: 600 },
                      }}
                    />
                    <YAxis
                      tick={TICK}
                      label={
                        <CenteredYAxisLabel
                          value="95% LoA Half-Width (±Δz)"
                          offset={16}
                        />
                      }
                    />
                    <Tooltip
                      formatter={(val, name) => [
                        Number(val ?? 0).toFixed(4),
                        String(name ?? ''),
                      ]}
                      labelFormatter={(label) => `Redshift u = ${Number(label ?? 0).toFixed(2)}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="halfWidthA"
                      name="Pipeline A 95% LoA Half-Width"
                      stroke={COLOR_A}
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="halfWidthB"
                      name="Pipeline B 95% LoA Half-Width"
                      stroke={COLOR_B}
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Detection Sensitivity Tile — Strictly Split Between A vs Ref | B vs Ref | H2H */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-teal-800">
                {isH2H
                  ? 'Head-to-Head Detection Sensitivity Comparison (A vs. B)'
                  : `${primaryLabel} · Detection Sensitivity`}
              </span>
              <Link
                to="/academy/astro-calval/primers/detectability"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                What Are Critical Limit &amp; Minimum Detectable Difference? Read Primer →
              </Link>
            </div>
            <h3 className="mt-1.5 text-lg font-bold text-slate-900">
              {isH2H
                ? 'Smallest Real Redshift Change Reliably Detected Above Noise: Pipeline A vs. Pipeline B'
                : `${primaryLabel}: Smallest Real Redshift Change Reliably Detected Above Noise`}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {isH2H
                ? 'Directly compares the Minimum Detectable Redshift Difference (x_D) and Critical Limit (x_C) of Pipeline A vs. Pipeline B across baseline redshift z₀.'
                : `Quantifies the Critical Limit (x_C, 5% false-positive risk) and Minimum Detectable Difference (x_D, 5% false-negative risk) for ${primaryLabel} at baseline redshift z₀.`}
            </p>
          </div>

          {/* Interactive Baseline Redshift Slider */}
          <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:w-80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Baseline Redshift State (z₀)</span>
              <span className="rounded bg-white px-2 py-0.5 font-mono text-indigo-700 shadow-xs">
                z₀ = {currentZ0.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={det.z0.length - 1}
              step={1}
              value={safeZ0Idx}
              onChange={(e) => setSelectedZ0Idx(Number(e.target.value))}
              aria-label="Baseline Redshift State z0"
              className="mt-2 w-full accent-indigo-600"
            />
            <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-500">
              <span>Low-z ({(det.z0[0] ?? 0).toFixed(2)})</span>
              <span>Mid-z (1.50)</span>
              <span>High-z ({(det.z0[det.z0.length - 1] ?? 3).toFixed(2)})</span>
            </div>
          </div>
        </div>

        {/* Strictly Scoped KPI Strip */}
        {!isH2H ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-semibold text-slate-500">
                Local Noise σ(z₀)
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900">
                {sigma0Primary.toFixed(4)}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                1-sigma scatter at z₀ = {currentZ0.toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-semibold text-slate-500">
                Critical Limit (x_C)
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900">
                +{xCPrimary.toFixed(4)}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                95% false-positive threshold (α = 5%)
              </div>
            </div>
            <div
              className="rounded-lg border p-3"
              style={{
                borderColor: `${primaryColor}45`,
                backgroundColor: `${primaryColor}10`,
              }}
            >
              <div className="text-[11px] font-semibold text-slate-700">
                Min Detectable Difference (x_D)
              </div>
              <div
                className="mt-1 font-mono text-lg font-bold"
                style={{ color: primaryColor }}
              >
                +{xDPrimary.toFixed(4)}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-600">
                True shift needed for 95% power (β = 5%)
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-semibold text-slate-500">
                Ratio x_D / x_C
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900">
                {ratioPrimary.toFixed(2)}×
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                Exceeds 2.00× because σ grows with z
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
              <div className="text-[11px] font-semibold text-amber-900">
                Pipeline A Min Detectable Shift (x_D,A)
              </div>
              <div className="mt-1 font-mono text-lg font-bold" style={{ color: COLOR_A }}>
                +{xDA.toFixed(4)}
              </div>
              <div className="mt-0.5 text-[11px] text-amber-800/80">
                Critical limit x_C,A = +{xCA.toFixed(4)}
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3">
              <div className="text-[11px] font-semibold text-blue-900">
                Pipeline B Min Detectable Shift (x_D,B)
              </div>
              <div className="mt-1 font-mono text-lg font-bold" style={{ color: COLOR_B }}>
                +{xDB.toFixed(4)}
              </div>
              <div className="mt-0.5 text-[11px] text-blue-800/80">
                Critical limit x_C,B = +{xCB.toFixed(4)}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-semibold text-slate-600">
                Net Sensitivity Gain (x_D,A − x_D,B)
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900">
                −{(xDA - xDB).toFixed(4)}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                Smaller Δz resolved at z₀ = {currentZ0.toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="text-[11px] font-semibold text-emerald-900">
                Relative Sensitivity Improvement
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-700">
                +{(((xDA - xDB) / Math.max(1e-6, xDA)) * 100).toFixed(1)}%
              </div>
              <div className="mt-0.5 text-[11px] text-emerald-800/80">
                Finer redshift separation resolved by B
              </div>
            </div>
          </div>
        )}

        {/* Strictly Split Charts: Single-Pipeline vs H2H */}
        {!isH2H ? (
          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: Single-Pipeline Dual Bell Curves (ISO 11843-1 Fig. 1) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
              <div className="mb-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {primaryLabel}: Null vs. Shifted Distributions at z₀ = {currentZ0.toFixed(2)}
                </h4>
                <p className="text-xs text-slate-600">
                  Shows the baseline noise distribution centered at 0 and the shifted distribution centered at +x_D = +{xDPrimary.toFixed(3)}.
                </p>
              </div>
              <div className="h-[270px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={isoBellRowsPrimary}
                    margin={{ top: 12, right: 18, bottom: 34, left: 58 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                    <XAxis
                      dataKey="y"
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      tick={TICK}
                      label={{
                        value: 'Redshift Deviation from Baseline State z₀ (Δz)',
                        position: 'insideBottom',
                        offset: -20,
                        style: { fill: '#334155', fontSize: 11, fontWeight: 600 },
                      }}
                    />
                    <YAxis
                      tick={TICK}
                      label={
                        <CenteredYAxisLabel
                          value="Probability Density"
                          offset={14}
                        />
                      }
                    />
                    <ReferenceLine
                      x={0}
                      stroke="#475569"
                      strokeDasharray="3 3"
                      label={{ value: '0', position: 'top', fill: '#334155', fontSize: 10 }}
                    />
                    <ReferenceLine
                      x={yCPrimary}
                      stroke="#dc2626"
                      strokeWidth={1.75}
                      strokeDasharray="4 3"
                      label={{ value: 'x_C', position: 'top', fill: '#dc2626', fontSize: 10 }}
                    />
                    <ReferenceLine
                      x={xDPrimary}
                      stroke={primaryColor}
                      strokeWidth={1.75}
                      label={{ value: 'x_D', position: 'top', fill: primaryColor, fontSize: 10 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="nullDensity"
                      name="Baseline State Distribution (Δz = 0)"
                      stroke="#475569"
                      strokeWidth={2}
                      fill="#94a3b8"
                      fillOpacity={0.22}
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="shiftDensity"
                      name="Minimum Detectable Shifted State (Δz = x_D)"
                      stroke={primaryColor}
                      strokeWidth={2.2}
                      fill={primaryColor}
                      fillOpacity={0.24}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Strictly Single-Pipeline Detection Curve across z0 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
              <div className="mb-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {primaryLabel}: Detection Thresholds Across Redshift (z₀ = 0.05 – 3.00)
                </h4>
                <p className="text-xs text-slate-600">
                  Plots {primaryLabel}&apos;s Minimum Detectable Difference (x_D, solid), Naive Constant-Variance 2·x_C (dotted), and Critical Limit (x_C, dashed).
                </p>
              </div>
              <div className="h-[270px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={detectionCurveRows}
                    margin={{ top: 12, right: 18, bottom: 34, left: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                    <XAxis
                      dataKey="z0"
                      type="number"
                      domain={[0, 3.0]}
                      tick={TICK}
                      label={{
                        value: 'Baseline Redshift State (z₀)',
                        position: 'insideBottom',
                        offset: -20,
                        style: { fill: '#334155', fontSize: 11, fontWeight: 600 },
                      }}
                    />
                    <YAxis
                      tick={TICK}
                      label={
                        <CenteredYAxisLabel
                          value="Threshold Δz"
                          offset={14}
                        />
                      }
                    />
                    <Tooltip
                      formatter={(val, name) => [
                        Number(val ?? 0).toFixed(4),
                        String(name ?? ''),
                      ]}
                      labelFormatter={(label) =>
                        `Baseline z₀ = ${Number(label ?? 0).toFixed(2)}`
                      }
                    />
                    <ReferenceLine x={currentZ0} stroke="#64748b" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey={primaryKey === 'a' ? 'xD_A' : 'xD_B'}
                      name={`${primaryLabel} Min Detectable Difference (x_D)`}
                      stroke={primaryColor}
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey={primaryKey === 'a' ? 'homo2xC_A' : 'homo2xC_B'}
                      name="Constant-Variance Approximation (2 · x_C)"
                      stroke="#64748b"
                      strokeWidth={1.75}
                      strokeDasharray="2 3"
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey={primaryKey === 'a' ? 'xC_A' : 'xC_B'}
                      name={`${primaryLabel} Critical Limit (x_C)`}
                      stroke={primaryColor}
                      strokeWidth={1.75}
                      strokeDasharray="6 4"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          /* HEAD-TO-HEAD DETECTION SENSITIVITY COMPARISON */
          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: H2H Shifted Distribution Comparison at z0 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
              <div className="mb-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Head-to-Head Shifted Detection Profiles at z₀ = {currentZ0.toFixed(2)}
                </h4>
                <p className="text-xs text-slate-600">
                  Pipeline B resolves a real shift of +{xDB.toFixed(3)} with 95% power, whereas Pipeline A requires +{xDA.toFixed(3)}.
                </p>
              </div>
              <div className="h-[270px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={h2hBellRows}
                    margin={{ top: 12, right: 18, bottom: 34, left: 58 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                    <XAxis
                      dataKey="y"
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      tick={TICK}
                      label={{
                        value: 'Redshift Shift Δz from Baseline z₀',
                        position: 'insideBottom',
                        offset: -20,
                        style: { fill: '#334155', fontSize: 11, fontWeight: 600 },
                      }}
                    />
                    <YAxis
                      tick={TICK}
                      label={
                        <CenteredYAxisLabel
                          value="Probability Density"
                          offset={14}
                        />
                      }
                    />
                    <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
                    <ReferenceLine
                      x={xDB}
                      stroke={COLOR_B}
                      strokeWidth={1.75}
                      label={{ value: 'x_D,B', position: 'top', fill: COLOR_B, fontSize: 10 }}
                    />
                    <ReferenceLine
                      x={xDA}
                      stroke={COLOR_A}
                      strokeWidth={1.75}
                      label={{ value: 'x_D,A', position: 'top', fill: COLOR_A, fontSize: 10 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="shiftedB"
                      name="Pipeline B Shifted Distribution (x_D,B)"
                      stroke={COLOR_B}
                      strokeWidth={2.2}
                      fill={COLOR_B}
                      fillOpacity={0.24}
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="shiftedA"
                      name="Pipeline A Shifted Distribution (x_D,A)"
                      stroke={COLOR_A}
                      strokeWidth={2.2}
                      fill={COLOR_A}
                      fillOpacity={0.22}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: H2H Minimum Detectable Difference Curves (A vs B) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
              <div className="mb-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Head-to-Head Minimum Detectable Difference Across Redshift (A vs. B)
                </h4>
                <p className="text-xs text-slate-600">
                  Solid curves compare Minimum Detectable Difference (x_D); dashed curves compare Critical Limits (x_C) across z₀.
                </p>
              </div>
              <div className="h-[270px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={detectionCurveRows}
                    margin={{ top: 12, right: 18, bottom: 34, left: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                    <XAxis
                      dataKey="z0"
                      type="number"
                      domain={[0, 3.0]}
                      tick={TICK}
                      label={{
                        value: 'Baseline Redshift State (z₀)',
                        position: 'insideBottom',
                        offset: -20,
                        style: { fill: '#334155', fontSize: 11, fontWeight: 600 },
                      }}
                    />
                    <YAxis
                      tick={TICK}
                      label={
                        <CenteredYAxisLabel
                          value="Detectable Shift Δz"
                          offset={14}
                        />
                      }
                    />
                    <Tooltip
                      formatter={(val, name) => [
                        Number(val ?? 0).toFixed(4),
                        String(name ?? ''),
                      ]}
                      labelFormatter={(label) =>
                        `Baseline z₀ = ${Number(label ?? 0).toFixed(2)}`
                      }
                    />
                    <ReferenceLine x={currentZ0} stroke="#64748b" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="xD_A"
                      name="Pipeline A Min Detectable Difference (x_D,A)"
                      stroke={COLOR_A}
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="xD_B"
                      name="Pipeline B Min Detectable Difference (x_D,B)"
                      stroke={COLOR_B}
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="xC_A"
                      name="Pipeline A Critical Limit (x_C,A)"
                      stroke={COLOR_A}
                      strokeWidth={1.6}
                      strokeDasharray="5 4"
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="xC_B"
                      name="Pipeline B Critical Limit (x_C,B)"
                      stroke={COLOR_B}
                      strokeWidth={1.6}
                      strokeDasharray="5 4"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
