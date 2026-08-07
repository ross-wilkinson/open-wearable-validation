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
import type { TooltipContentProps } from 'recharts';
import { AXIS_LABEL, AXIS_TICK, CHART, seriesColor } from '../../styles/chartTheme.ts';
import type { PrecisionPoint, PrecisionSeries } from './precisionModel.ts';

interface PrecisionChartProps {
  data: PrecisionPoint[];
  series: PrecisionSeries[];
  selectedN: number;
  target: number | null;
}

// Recharts injects `active`/`payload`/`label` at render time, so they are
// Partial here: writing `<ChartTooltip series={series} />` as the `content`
// prop must typecheck without us supplying props the library owns.
type ChartTooltipProps = Partial<TooltipContentProps<number, string>> & {
  series: PrecisionSeries[];
};

function ChartTooltip({ active, payload, label, series }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-hairline bg-surface px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-ink-muted">n = {label}</p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {series.map((entry) => {
          const point = payload.find((item) => item.dataKey === entry.key);
          if (!point || typeof point.value !== 'number') return null;
          return (
            <li key={entry.key} className="flex items-center gap-2 text-xs">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: seriesColor(entry.colorSlot) }}
              />
              {/* Text wears text tokens; the swatch beside it carries identity. */}
              <span className="text-ink-secondary">{entry.label}</span>
              <span className="tabular ml-auto font-medium text-ink">
                ±{point.value.toFixed(3)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-1.5 text-[11px] text-ink-muted">margin of error, in SD</p>
    </div>
  );
}

export default function PrecisionChart({
  data,
  series,
  selectedN,
  target,
}: PrecisionChartProps) {
  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 28, left: 8 }}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="0" vertical={false} />
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
            label={{
              value: 'Margin of error (SD)',
              angle: -90,
              position: 'insideLeft',
              offset: 8,
              style: { ...AXIS_LABEL, textAnchor: 'middle' },
            }}
          />

          {target !== null && (
            <ReferenceLine
              y={target}
              stroke={CHART.reference}
              strokeDasharray="4 4"
              label={{
                value: `target ${target}`,
                position: 'insideTopRight',
                style: AXIS_LABEL,
              }}
            />
          )}
          <ReferenceLine x={selectedN} stroke={CHART.reference} strokeDasharray="4 4" />

          <Tooltip
            content={<ChartTooltip series={series} />}
            cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
          />

          {series.map((entry) => (
            <Line
              key={entry.key}
              type="monotone"
              dataKey={entry.key}
              name={entry.label}
              stroke={seriesColor(entry.colorSlot)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: CHART.surface }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
