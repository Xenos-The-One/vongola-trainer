import { describe, it, expect } from 'vitest';
import { dateKey, todayKey, daysAgoKey } from './date';

describe('dateKey', () => {
  it('formats local Y-M-D, zero-padded', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05'); // Jan 5
    expect(dateKey(new Date(2026, 4, 31))).toBe('2026-05-31'); // May 31
    expect(dateKey(new Date(2026, 11, 9))).toBe('2026-12-09'); // Dec 9
  });

  it('uses LOCAL components so a late-evening time never rolls to the next day', () => {
    // The bug this guards: toISOString() would push 11:30pm to the next UTC day
    // in negative-offset timezones. Local construction + local formatting must agree.
    const lateEvening = new Date(2026, 4, 31, 23, 30, 0);
    expect(dateKey(lateEvening)).toBe('2026-05-31');
  });

  it('todayKey() equals dateKey(now) and daysAgoKey(0) equals todayKey()', () => {
    expect(todayKey()).toBe(dateKey(new Date()));
    expect(daysAgoKey(0)).toBe(todayKey());
  });
});
