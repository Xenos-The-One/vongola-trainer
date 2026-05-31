import { describe, it, expect } from 'vitest';
import { computeTrainingPct } from './storage';
import type { BlockState } from './types';

const block = (checked: number[], total: number): BlockState => ({ checked, total });

describe('computeTrainingPct', () => {
  it('all training tasks done is 100%', () => {
    expect(computeTrainingPct(block([0, 1, 2, 3, 4], 5))).toBe(100);
  });

  it('no training tasks done is 0%', () => {
    expect(computeTrainingPct(block([], 5))).toBe(0);
  });

  it('4 of 5 training tasks is 80%', () => {
    expect(computeTrainingPct(block([0, 1, 2, 3], 5))).toBe(80);
  });

  it('3 of 5 training tasks is 60%', () => {
    expect(computeTrainingPct(block([0, 1, 2], 5))).toBe(60);
  });

  it('rest day (total=0) is 100% credit', () => {
    expect(computeTrainingPct(block([], 0))).toBe(100);
  });

  it('over-checked count is clamped (cannot exceed 100%)', () => {
    expect(computeTrainingPct(block([0, 1, 2, 3, 4, 5, 6], 5))).toBe(100);
  });

  it('undefined training block is treated as a rest day (100%)', () => {
    expect(computeTrainingPct(undefined)).toBe(100);
  });
});
