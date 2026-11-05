import type { JSX } from 'react';

interface AxisViewBox {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface CenteredYAxisLabelProps {
  viewBox?: AxisViewBox;
  value: string;
  subValue?: string;
  offsetX?: number;
  offset?: number;
}

function splitIntoTwoLines(text: string, explicitSub?: string): [string, string | null] {
  if (explicitSub) {
    return [text, explicitSub];
  }
  if (text.includes('|')) {
    const [first = '', ...rest] = text.split('|');
    return [first.trim(), rest.join('|').trim()];
  }
  if (text.length <= 26) {
    return [text, null];
  }
  const mid = Math.floor(text.length / 2);
  let bestIdx = -1;
  let bestDist = Infinity;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ') {
      const dist = Math.abs(i - mid);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
  }
  if (bestIdx === -1) {
    return [text, null];
  }
  return [text.slice(0, bestIdx).trim(), text.slice(bestIdx + 1).trim()];
}

/**
 * Vertically and horizontally centered SVG Y-axis label for Recharts `<YAxis />`.
 * Automatically wraps long labels onto two balanced lines so titles are never
 * clipped at the top/bottom or left edge of the SVG viewport.
 */
export function CenteredYAxisLabel({
  viewBox,
  value,
  subValue,
  offsetX,
  offset,
}: CenteredYAxisLabelProps): JSX.Element | null {
  if (!viewBox || viewBox.x === undefined || viewBox.y === undefined) {
    return null;
  }
  const height = viewBox.height ?? 200;
  const [line1, line2] = splitIntoTwoLines(value, subValue);
  const cx = viewBox.x + (offsetX ?? offset ?? (line2 ? 14 : 18));
  const cy = viewBox.y + height / 2;

  return (
    <text
      transform={`rotate(-90, ${cx}, ${cy})`}
      textAnchor="middle"
      fill="var(--color-ink-secondary)"
      fontSize={11.5}
      fontWeight={500}
    >
      {line2 ? (
        <>
          <tspan x={cx} y={cy} dy="-0.25em">
            {line1}
          </tspan>
          <tspan x={cx} y={cy} dy="1.2em" fontSize={10.5} fill="var(--color-ink-muted)">
            {line2}
          </tspan>
        </>
      ) : (
        <tspan x={cx} y={cy} dy="0.35em">
          {line1}
        </tspan>
      )}
    </text>
  );
}
