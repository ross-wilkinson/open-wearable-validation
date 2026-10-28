/**
 * Module 3 — demographic segment planner.
 *
 * Small arithmetic carrying one non-obvious insight, which the UI should state
 * plainly rather than leave to be inferred:
 *
 *   **You have to cap the maximum per segment, not just set a minimum.**
 *
 * Recruiting is easiest in the commonest segment and hardest in the rarest. If
 * only a floor is specified, the easy segments fill first, the total target is
 * reached, and the rare segment is still short — with no budget left to fix it.
 * The cap is what reserves room for the segment you will struggle to fill.
 */

export interface SegmentPlanInput {
  /** Total target sample size. */
  sampleSize: number;
  /** Number of segments within this demographic factor. */
  segments: number;
  /** Minimum share required in the rarest segment, as a percentage. */
  minPercent: number;
}

export interface SegmentPlan {
  sampleSize: number;
  segments: number;
  minPercent: number;
  /** Cap per segment, as a percentage. */
  maxPercent: number;
  /** Minimum subjects per segment (rounded up — you cannot recruit a fraction). */
  minSubjects: number;
  /** Maximum subjects per segment (rounded down, for the same reason). */
  maxSubjects: number;
  /**
   * True when the rounded caps cannot accommodate the total sample size.
   *
   * The notebook flags this in prose under its third worked example; here it is
   * computed, because a planner that silently hands back an infeasible plan is
   * worse than one that says so.
   */
  feasible: boolean;
  /** Largest total the rounded caps actually allow. */
  maxAchievableTotal: number;
  /** Smallest total the rounded floors require. */
  minRequiredTotal: number;
}

/**
 * Where the cap comes from.
 *
 * To guarantee the rarest segment reaches `minPercent`, everything else has to
 * fit in what is left. Sharing that remainder equally across the other
 * `segments - 1` gives
 *
 *     maxPercent = (1 - minPercent) / (segments - 1)
 *
 * which is the per-segment ceiling that keeps the floor reachable.
 */
export function planSegments(input: SegmentPlanInput): SegmentPlan | null {
  const { sampleSize, segments, minPercent } = input;

  // A single segment has no "other segments" to share the remainder — the
  // formula divides by zero. The notebook's form does this silently and
  // produces Infinity.
  if (!Number.isFinite(sampleSize) || sampleSize <= 0) return null;
  if (!Number.isInteger(segments) || segments < 2) return null;
  if (!(minPercent > 0) || minPercent > 100) return null;

  // With more segments than the floor allows, the floors alone exceed 100%.
  const maxFraction = (1 - minPercent / 100) / (segments - 1);
  const minSubjects = Math.ceil((sampleSize * minPercent) / 100);
  const maxSubjects = Math.floor(sampleSize * maxFraction);

  const maxAchievableTotal = maxSubjects * segments;
  const minRequiredTotal = minSubjects * segments;

  return {
    sampleSize,
    segments,
    minPercent,
    maxPercent: maxFraction * 100,
    minSubjects,
    maxSubjects,
    feasible:
      maxSubjects >= minSubjects &&
      maxAchievableTotal >= sampleSize &&
      minRequiredTotal <= sampleSize,
    maxAchievableTotal,
    minRequiredTotal,
  };
}

export interface SegmentPreset {
  id: string;
  factor: string;
  segmentLabels: string[];
  sampleSize: number;
  minPercent: number;
  note?: string;
}

/**
 * The notebook's three worked examples, reused as presets.
 *
 * The Monk Skin Tone Scale is Google's publicly published 10-point scale for
 * skin tone representation; the banding here is the notebook's own.
 */
export const SEGMENT_PRESETS: SegmentPreset[] = [
  {
    id: 'sex',
    factor: 'Sex',
    segmentLabels: ['Female', 'Male'],
    sampleSize: 65,
    minPercent: 40,
  },
  {
    id: 'age',
    factor: 'Age',
    segmentLabels: ['<30', '30–39', '40–49', '≥50'],
    sampleSize: 65,
    minPercent: 10,
  },
  {
    id: 'skin-tone',
    factor: 'Monk skin tone',
    segmentLabels: ['1–4', '5–6', '7–10'],
    sampleSize: 65,
    minPercent: 15,
    note: 'Banding follows the 10-point Monk Skin Tone Scale. Optical sensors perform differently across skin tones, so this is the segmentation most likely to be under-powered by accident.',
  },
  {
    id: 'fda-skin-tone',
    factor: 'FDA 510(k) Skin Tone (ISO 80601-2-61)',
    segmentLabels: ['Fitzpatrick I–II (MST 01–04)', 'Fitzpatrick III–IV (MST 05–07)', 'Fitzpatrick V–VI (MST 08–10, Min 15%)'],
    sampleSize: 65,
    minPercent: 15,
    note: 'FDA 510(k) pre-market guidance under ISO 80601-2-61 Table 1 requires at least 15% representation in dark pigmentation categories (Fitzpatrick V–VI, corresponding to Monk MST 08–10), with strict ceiling caps on lighter segments to prevent walk-in recruitment bias.',
  },
];
