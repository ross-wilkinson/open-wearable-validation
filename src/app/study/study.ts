/**
 * The study being planned, shared across modules.
 *
 * Designing a validation study is one task, not five. Someone works out that
 * they need 149 participants, then has to plan recruitment for 149, then a
 * timeline for 149 — and until now retyped it each time, with every retype a
 * chance to carry the wrong number forward.
 *
 * Two deliberate constraints on what lives here:
 *
 *  - **Only values more than one module needs.** A phase distribution belongs to
 *    the timeline and nowhere else; putting it here would make a local control
 *    look like a shared commitment.
 *  - **The plan is not the page.** Modules *seed* their controls from this and
 *    write back only when the user says so. Otherwise experimenting with a
 *    number on one page would silently rewrite the plan behind it, which is a
 *    nasty surprise in a tool people take numbers out of.
 */
export interface Study {
  /** Participants. Null until a module contributes one. */
  n: number | null;
  /** Confidence level as a fraction, e.g. 0.95. */
  confidence: number;
  /**
   * SD of the measurement in real units. Optional, and purely for making
   * SD-relative margins concrete: "±0.20 SD" means little until it reads
   * "±1.4 bpm".
   */
  measurementSd: number | null;
  /** Unit label for `measurementSd`, e.g. "bpm". */
  unit: string;
  /** Which module produced `n`, so the summary can say where it came from. */
  nSource: string | null;
}

export const DEFAULT_STUDY: Study = {
  n: null,
  confidence: 0.95,
  measurementSd: null,
  unit: '',
  nSource: null,
};

/** Versioned: a future shape change should ignore old data, not misread it. */
export const STORAGE_KEY = 'validation-study-designer.study.v1';

export function hasPlan(study: Study): boolean {
  return study.n !== null;
}

/**
 * Parse persisted JSON into a Study, field by field.
 *
 * Deliberately not a cast. This value comes from localStorage, which is
 * user-writable, survives across deploys, and may have been written by an older
 * version of the app. Anything unrecognised falls back to the default rather
 * than propagating `undefined` into a calculation.
 */
export function parseStudy(raw: string | null): Study {
  if (!raw) return DEFAULT_STUDY;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_STUDY;
  }
  if (typeof parsed !== 'object' || parsed === null) return DEFAULT_STUDY;

  const record = parsed as Record<string, unknown>;
  return {
    n: positiveIntegerOrNull(record.n),
    confidence: confidenceOrDefault(record.confidence),
    measurementSd: positiveNumberOrNull(record.measurementSd),
    unit: typeof record.unit === 'string' ? record.unit.slice(0, 16) : '',
    nSource: typeof record.nSource === 'string' ? record.nSource.slice(0, 64) : null,
  };
}

function positiveIntegerOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function positiveNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function confidenceOrDefault(value: unknown): number {
  return typeof value === 'number' && value > 0 && value < 1
    ? value
    : DEFAULT_STUDY.confidence;
}

/**
 * Read the stored study. Never throws: Safari in private mode throws on
 * `localStorage` access itself, and a tool that white-screens because storage
 * is unavailable is worse than one that forgets.
 */
export function loadStudy(): Study {
  try {
    return parseStudy(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_STUDY;
  }
}

/** Persist, or quietly carry on. The app works fine without persistence. */
export function saveStudy(study: Study): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(study));
  } catch {
    // Storage disabled, full, or blocked. Nothing to do and nothing worth
    // interrupting the user for — the in-memory plan still works this session.
  }
}

export function clearStoredStudy(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // As above.
  }
}
