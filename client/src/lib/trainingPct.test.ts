import { describe, it, expect } from 'vitest';
import { computeTrainingPct } from './storage';
import type { DayState } from './types';

function blocks(trainingChecked: number[], trainingTotal: number): DayState['blocks'] {
  return {
    training: { checked: trainingChecked, total: trainingTotal },
    coach: { checked: [], total: 6 },
    morning: { checked: [], total: 11 },
    work: { checked: [], total: 6 },
    evening: { checked: [], total: 6 },
  };
}

describe('computeTrainingPct', () => {
  it('all training tasks done is 100%', () => {
    expect(computeTrainingPct(blocks([0, 1, 2, 3, 4], 5))).toBe(100);
  });

  it('no training tasks done is 0%', () => {
    expect(computeTrainingPct(blocks([], 5))).toBe(0);
  });

  it('4 of 5 training tasks is 80%', () => {
    expect(computeTrainingPct(blocks([0, 1, 2, 3], 5))).toBe(80);
  });

  it('3 of 5 training tasks is 60%', () => {
    expect(computeTrainingPct(blocks([0, 1, 2], 5))).toBe(60);
  });

  it('rest day (total=0) is 100% credit', () => {
    expect(computeTrainingPct(blocks([], 0))).toBe(100);
  });

  it('over-checked count is clamped (cannot exceed 100%)', () => {
    expect(computeTrainingPct(blocks([0, 1, 2, 3, 4, 5, 6], 5))).toBe(100);
  });

  it('ignores other blocks entirely', () => {
    const b = blocks([], 5);
    b.coach.checked = [0, 1, 2, 3, 4, 5];
    b.morning.checked = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(computeTrainingPct(b)).toBe(0);
  });
});
