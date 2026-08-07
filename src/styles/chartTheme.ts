/**
 * Chart chrome tokens.
 *
 * These are CSS custom-property references, not hex literals, so a theme change
 * repaints every chart through the cascade with no React state involved and no
 * risk of a chart holding a stale colour. Recharts writes whatever string it is
 * given straight onto the SVG attribute, and `var(--x)` is valid there.
 *
 * The series palette is deliberately *not* exported as an array to be indexed
 * by position. Series carry an explicit `colorSlot` (see `precisionModel.ts`),
 * because colour must follow the entity: adding a fifth series must never
 * repaint the first four.
 */

export const CHART = {
  grid: 'var(--color-grid)',
  axis: 'var(--color-axis)',
  tickText: 'var(--color-ink-muted)',
  labelText: 'var(--color-ink-secondary)',
  surface: 'var(--color-surface)',
  reference: 'var(--color-ink-muted)',
} as const;

/** Colour for a 1-indexed categorical slot. */
export function seriesColor(slot: number): string {
  // Eight slots exist; beyond that the answer is to fold series into "Other"
  // or facet, never to generate a ninth hue.
  const clamped = Math.min(Math.max(slot, 1), 8);
  return `var(--color-series-${clamped})`;
}

export const AXIS_TICK = { fill: CHART.tickText, fontSize: 12 } as const;

export const AXIS_LABEL = {
  fill: CHART.labelText,
  fontSize: 12,
} as const;

/**
 * Push overlapping label positions apart so end-of-line labels stay legible.
 *
 * Returns adjusted y positions in the same order as the input. Labels are
 * separated by at least `minGap` pixels while staying as close as possible to
 * their true line positions — without this, series that converge at the right
 * edge of the chart print on top of one another.
 */
export function dodgeLabels(positions: number[], minGap = 14): number[] {
  const indexed = positions.map((y, index) => ({ y, index }));
  indexed.sort((a, b) => a.y - b.y);

  for (let i = 1; i < indexed.length; i += 1) {
    const previous = indexed[i - 1]!;
    const current = indexed[i]!;
    if (current.y - previous.y < minGap) {
      current.y = previous.y + minGap;
    }
  }

  const result = new Array<number>(positions.length);
  for (const { y, index } of indexed) result[index] = y;
  return result;
}
