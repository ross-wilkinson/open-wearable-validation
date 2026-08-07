import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { dodgeLabels, seriesColor } from './chartTheme.ts';

// Read from disk rather than importing the stylesheet.
//
// `import css from '../index.css?raw'` looks like the idiomatic Vite answer and
// returns an empty string here: the CSS plugin claims `.css` imports before the
// `?raw` suffix is honoured, so the module resolves to the stylesheet's (empty)
// default export instead of its text. `import.meta.url` is no help either — it
// is not a `file:` URL under Vitest's transform. Vitest sets cwd to the project
// root, which is what this relies on.
const css = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8');

describe('theme tokens', () => {
  it('declares the categorical palette in a `@theme static` block', () => {
    // REGRESSION TEST for a bug that every other test missed.
    //
    // Tailwind v4 drops theme variables that no generated utility class
    // references. The chart series colours are read by Recharts as
    // `var(--color-series-N)` on an SVG attribute, which Tailwind cannot see,
    // so a plain `@theme` emitted only slot 1 (used by `text-series-1` et al.)
    // and silently dropped 2 through 8. Three of the four lines on the flagship
    // chart painted nothing, while the SVG contained four <path> elements with
    // perfectly correct geometry and stroke attributes.
    //
    // jsdom loads no stylesheets and resolves no custom properties, so no unit
    // test could have caught it and none did. This one is a source-level
    // invariant instead: it asserts the escape hatch is still there.
    expect(css).toMatch(/@theme\s+static\s*\{/);

    const themeBlock = css.slice(css.indexOf('@theme static'));
    for (let slot = 1; slot <= 8; slot += 1) {
      expect(
        themeBlock.slice(0, themeBlock.indexOf('\n}')),
        `--color-series-${slot} must be declared inside @theme static`,
      ).toContain(`--color-series-${slot}:`);
    }
  });

  it('defines a dark step for every categorical slot', () => {
    // Dark is a *selected* set of steps, not an automatic inversion, so each
    // slot has to be listed explicitly. A missing one would fall back to the
    // light value and quietly fail contrast against the dark surface.
    const darkBlock = css.slice(css.indexOf("[data-theme='dark']"));
    for (let slot = 1; slot <= 8; slot += 1) {
      expect(darkBlock).toContain(`--color-series-${slot}:`);
    }
  });

  it('declares dark under both the media query and the explicit toggle', () => {
    // The toggle has to beat the OS preference in both directions; the
    // `:not([data-theme='light'])` guard is what lets an explicit light choice
    // win on a machine set to dark.
    expect(css).toContain('prefers-color-scheme: dark');
    expect(css).toContain(":root:where(:not([data-theme='light']))");
    expect(css).toContain(":root[data-theme='dark']");
  });
});

describe('seriesColor', () => {
  it('maps a slot to its custom property', () => {
    expect(seriesColor(1)).toBe('var(--color-series-1)');
    expect(seriesColor(8)).toBe('var(--color-series-8)');
  });

  it('clamps rather than inventing a ninth hue', () => {
    // A ninth series folds into "Other" or gets faceted; it never gets a
    // generated colour.
    expect(seriesColor(9)).toBe('var(--color-series-8)');
    expect(seriesColor(0)).toBe('var(--color-series-1)');
  });
});

describe('dodgeLabels', () => {
  it('leaves well-separated labels alone', () => {
    expect(dodgeLabels([0, 40, 80], 14)).toEqual([0, 40, 80]);
  });

  it('pushes overlapping labels apart while preserving input order', () => {
    const result = dodgeLabels([100, 104, 108], 14);
    expect(result[0]).toBe(100);
    expect(result[1]! - result[0]!).toBeGreaterThanOrEqual(14);
    expect(result[2]! - result[1]!).toBeGreaterThanOrEqual(14);
  });

  it('handles inputs given out of order', () => {
    const result = dodgeLabels([50, 10, 52], 14);
    // Returned in input order, but pairwise separated once sorted.
    expect(result[1]).toBe(10);
    const sorted = [...result].sort((a, b) => a - b);
    expect(sorted[1]! - sorted[0]!).toBeGreaterThanOrEqual(14);
    expect(sorted[2]! - sorted[1]!).toBeGreaterThanOrEqual(14);
  });
});
