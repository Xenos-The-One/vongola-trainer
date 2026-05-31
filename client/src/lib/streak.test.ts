import { describe, it, expect } from 'vitest';
import { computeStreak } from './storage';
import { dateKey } from './date';
import type { DayState } from './types';

/**
 * Build a DayState whose training completion equals `pct`. Streak gates on the
 * single training signal (chores no longer exist), so total=100 maps pct →
 * checked count cleanly with no rounding noise.
 */
function day(pct: number): DayState {
  const total = 100;
  const checked = Array.from({ length: pct }, (_, i) => i);
  return {
    training: { checked, total },
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
      training: { checked: [], total: 0 },
      completionPct: 100,
      streakDay: 0,
    };
    expect(computeStreak({ [key(0)]: day(100), [key(1)]: restDay, [key(2)]: day(80) })).toBe(3);
  });
});
