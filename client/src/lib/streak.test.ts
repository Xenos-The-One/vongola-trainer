import { describe, it, expect } from 'vitest';
import { computeStreak } from './storage';
import { dateKey } from './date';
import type { DayState } from './types';

/**
 * Build a DayState whose TRAINING-block completion equals `pct`. Streak is
 * driven by training (not overall) so we use total=100 to map % directly to
 * checked count without rounding noise.
 */
function day(pct: number): DayState {
  const total = 100;
  const checked = Array.from({ length: pct }, (_, i) => i);
  return {
    blocks: {
      training: { checked, total },
      coach: { checked: [], total: 6 },
      morning: { checked: [], total: 11 },
      work: { checked: [], total: 6 },
      evening: { checked: [], total: 6 },
    },
    completionPct: pct,
    streakDay: 0,
  };
}

function key(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return dateKey(d);
}

describe('computeStreak', () => {
  it('is 0 with no days', () => {
    expect(computeStreak({})).toBe(0);
  });

  it('counts today when complete', () => {
    expect(computeStreak({ [key(0)]: day(100) })).toBe(1);
  });

  it('counts consecutive >=75% days', () => {
    expect(computeStreak({ [key(0)]: day(80), [key(1)]: day(100), [key(2)]: day(90) })).toBe(3);
  });

  it('today in progress (<75%) does not break a prior streak', () => {
    expect(computeStreak({ [key(0)]: day(20), [key(1)]: day(100), [key(2)]: day(100) })).toBe(2);
  });

  it('a sub-75% past day breaks the streak', () => {
    expect(computeStreak({ [key(0)]: day(100), [key(1)]: day(50), [key(2)]: day(100) })).toBe(1);
  });

  it('a missing day (gap) breaks the streak', () => {
    expect(computeStreak({ [key(0)]: day(100), [key(2)]: day(100) })).toBe(1);
  });

  it('a rest day (training.total === 0) keeps the streak', () => {
    const restDay: DayState = {
      blocks: {
        training: { checked: [], total: 0 },
        coach: { checked: [], total: 6 },
        morning: { checked: [], total: 11 },
        work: { checked: [], total: 6 },
        evening: { checked: [], total: 6 },
      },
      completionPct: 0,
      streakDay: 0,
    };
    expect(computeStreak({ [key(0)]: day(100), [key(1)]: restDay, [key(2)]: day(80) })).toBe(3);
  });

  it('chores-only day (training 0%) breaks the streak even when overall is high', () => {
    const choresOnly: DayState = {
      blocks: {
        training: { checked: [], total: 5 },
        coach: { checked: [0, 1, 2, 3, 4, 5], total: 6 },
        morning: { checked: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], total: 11 },
        work: { checked: [0, 1, 2, 3, 4, 5], total: 6 },
        evening: { checked: [0, 1, 2, 3, 4, 5], total: 6 },
      },
      completionPct: 85,
      streakDay: 0,
    };
    expect(computeStreak({ [key(0)]: day(100), [key(1)]: choresOnly })).toBe(1);
  });
});
