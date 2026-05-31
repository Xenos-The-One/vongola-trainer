import { describe, it, expect } from 'vitest';
import { e1RM, bestE1RMSet } from './strength';

describe('e1RM (Epley)', () => {
  it('returns 0 for non-positive weight or reps', () => {
    expect(e1RM(0, 5)).toBe(0);
    expect(e1RM(100, 0)).toBe(0);
    expect(e1RM(-100, 5)).toBe(0);
    expect(e1RM(100, -1)).toBe(0);
  });

  it('equals weight at 1 rep', () => {
    expect(e1RM(100, 1)).toBeCloseTo(103.33, 1); // 100 * (1 + 1/30)
  });

  it('scales correctly for typical rep ranges', () => {
    // 100kg × 5 → 100 × (1 + 5/30) = 116.67
    expect(e1RM(100, 5)).toBeCloseTo(116.67, 1);
    // 100kg × 10 → 100 × (1 + 10/30) = 133.33
    expect(e1RM(100, 10)).toBeCloseTo(133.33, 1);
  });

  it('captures rep PRs at the same working weight', () => {
    // 100×5 should beat 100×3 even though weight is identical
    expect(e1RM(100, 5)).toBeGreaterThan(e1RM(100, 3));
  });
});

describe('bestE1RMSet', () => {
  it('returns null for empty input', () => {
    expect(bestE1RMSet([])).toBeNull();
  });

  it('returns null when every set has zero weight or reps', () => {
    expect(bestE1RMSet([{ reps: 0, weight: 100 }, { reps: 10, weight: 0 }])).toBeNull();
  });

  it('picks the set with highest e1RM (not the heaviest weight)', () => {
    const sets = [
      { reps: 1, weight: 110 }, // e1RM ~113.67
      { reps: 5, weight: 100 }, // e1RM ~116.67
      { reps: 3, weight: 105 }, // e1RM ~115.50
    ];
    expect(bestE1RMSet(sets)).toEqual({ reps: 5, weight: 100 });
  });
});
