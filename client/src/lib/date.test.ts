import { describe, it, expect } from 'vitest';
import { dateKey, todayKey, daysAgoKey, weeksSince } from './date';

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

describe('weeksSince', () => {
  it('is 1 on the start date itself', () => {
    expect(weeksSince('2026-05-31', new Date(2026, 4, 31, 10, 0))).toBe(1);
  });

  it('is still 1 mid-week-one', () => {
    expect(weeksSince('2026-05-31', new Date(2026, 5, 3))).toBe(1); // Jun 3, 3 days in
  });

  it('rolls to 2 at the 7-day boundary', () => {
    expect(weeksSince('2026-05-31', new Date(2026, 5, 7))).toBe(2);
  });

  it('reads later weeks correctly', () => {
    expect(weeksSince('2026-05-31', new Date(2026, 7, 23))).toBe(13); // ~12 weeks 5 days later
  });

  it('clamps to 1 when start is in the future or unparseable', () => {
    expect(weeksSince('2027-01-01', new Date(2026, 4, 31))).toBe(1);
    expect(weeksSince('garbage', new Date(2026, 4, 31))).toBe(1);
  });
});
