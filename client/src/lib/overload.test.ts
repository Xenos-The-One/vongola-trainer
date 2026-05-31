import { describe, it, expect } from 'vitest';
import { parseRepRange, suggestNextLoad } from './overload';

describe('parseRepRange', () => {
  it('parses a hyphenated range', () => {
    expect(parseRepRange('8-12')).toEqual([8, 12]);
  });

  it('parses a single number as a fixed target', () => {
    expect(parseRepRange('5')).toEqual([5, 5]);
  });

  it('strips unit suffixes like "30-60s"', () => {
    expect(parseRepRange('30-60s')).toEqual([30, 60]);
  });

  it('defaults to [10, 10] when no digits present', () => {
    expect(parseRepRange('AMRAP')).toEqual([10, 10]);
  });
});

describe('suggestNextLoad (double-progression)', () => {
  it('first session uses fallbackWeight + first rep target', () => {
    expect(suggestNextLoad(null, '8-12', 2.5, 20)).toEqual({ reps: 8, weight: 20 });
  });

  it('top of range hit → bump weight by step, reset to bottom of range', () => {
    expect(suggestNextLoad({ reps: 12, weight: 20 }, '8-12', 2.5)).toEqual({ reps: 8, weight: 22.5 });
  });

  it('exceeded the top → still bumps weight and resets reps', () => {
    expect(suggestNextLoad({ reps: 15, weight: 20 }, '8-12', 2.5)).toEqual({ reps: 8, weight: 22.5 });
  });

  it('inside the range → +1 rep at same weight', () => {
    expect(suggestNextLoad({ reps: 9, weight: 20 }, '8-12', 2.5)).toEqual({ reps: 10, weight: 20 });
  });

  it('at the bottom of the range → still +1 rep (not the bottom again)', () => {
    expect(suggestNextLoad({ reps: 8, weight: 20 }, '8-12', 2.5)).toEqual({ reps: 9, weight: 20 });
  });

  it('bodyweight (weight=0) progresses reps only', () => {
    expect(suggestNextLoad({ reps: 10, weight: 0 }, '8-12', 2.5)).toEqual({ reps: 11, weight: 0 });
  });

  it('fixed single-rep target ("5") bumps weight every session at 5 reps', () => {
    expect(suggestNextLoad({ reps: 5, weight: 60 }, '5', 2.5)).toEqual({ reps: 5, weight: 62.5 });
  });

  it('honors custom weight step (e.g. 5 lb / 2.27kg microload)', () => {
    expect(suggestNextLoad({ reps: 12, weight: 20 }, '8-12', 5)).toEqual({ reps: 8, weight: 25 });
  });
});
