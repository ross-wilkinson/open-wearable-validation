import { seriesColor } from '../../styles/chartTheme.ts';

export interface LegendEntry {
  key: string;
  label: string;
  colorSlot: number;
}

/**
 * Legend rendered as real HTML rather than inside the SVG.
 *
 * It wraps properly at narrow widths, its text is selectable and translatable,
 * and the swatch is decorative (`aria-hidden`) with the label carrying the
 * meaning — so identity never rests on colour alone.
 */
export default function ChartLegend({ entries }: { entries: LegendEntry[] }) {
  if (entries.length < 2) return null;

  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {entries.map((entry) => (
        <li key={entry.key} className="flex items-center gap-2 text-sm">
          <span
            aria-hidden
            className="h-0.5 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: seriesColor(entry.colorSlot) }}
          />
          <span className="text-ink-secondary">{entry.label}</span>
        </li>
      ))}
    </ul>
  );
}
