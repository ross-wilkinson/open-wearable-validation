import { describe, expect, it } from 'vitest';
import { DEFAULT_STUDY, parseStudy } from './study.ts';

describe('parseStudy', () => {
  it('round-trips a valid plan', () => {
    const study = {
      n: 149,
      confidence: 0.99,
      measurementSd: 5.4,
      unit: 'bpm',
      nSource: 'sample size for agreement',
    };
    expect(parseStudy(JSON.stringify(study))).toEqual(study);
  });

  it('falls back to defaults for absent or unreadable storage', () => {
    expect(parseStudy(null)).toEqual(DEFAULT_STUDY);
    expect(parseStudy('')).toEqual(DEFAULT_STUDY);
    expect(parseStudy('{ not json')).toEqual(DEFAULT_STUDY);
    expect(parseStudy('"a string"')).toEqual(DEFAULT_STUDY);
    expect(parseStudy('null')).toEqual(DEFAULT_STUDY);
  });

  it('rejects values that are the wrong shape rather than propagating them', () => {
    // This comes out of localStorage, which is user-writable and survives
    // across deploys. A cast would let `n: "150"` reach arithmetic and produce
    // string concatenation, or `n: -3` reach a sample-size field. Each field is
    // checked so a bad one degrades to its default instead.
    const junk = parseStudy(
      JSON.stringify({
        n: '150',
        confidence: 95,
        measurementSd: -2,
        unit: 42,
        nSource: { nested: true },
      }),
    );
    expect(junk).toEqual(DEFAULT_STUDY);
  });

  it('rejects a non-integer or non-positive sample size', () => {
    for (const n of [0, -1, 12.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(parseStudy(JSON.stringify({ n })).n).toBeNull();
    }
  });

  it('only accepts a confidence strictly inside (0, 1)', () => {
    expect(parseStudy(JSON.stringify({ confidence: 0.9 })).confidence).toBe(0.9);
    for (const confidence of [0, 1, 95, -0.5]) {
      expect(parseStudy(JSON.stringify({ confidence })).confidence).toBe(
        DEFAULT_STUDY.confidence,
      );
    }
  });

  it('bounds strings so stored data cannot become unbounded', () => {
    const parsed = parseStudy(
      JSON.stringify({ unit: 'x'.repeat(500), nSource: 'y'.repeat(500) }),
    );
    expect(parsed.unit).toHaveLength(16);
    expect(parsed.nSource).toHaveLength(64);
  });
});
