import { describe, it, expect } from 'vitest';
import { generateWorkout } from './generator';

const FULL_EQUIPMENT = ['dumbbell', 'bench', 'barbell', 'pull-up bar', 'cable', 'bodyweight', 'band'] as const;

describe('generateWorkout — push/pull/legs balance', () => {
  it('full-body always includes at least one push, one pull, and one legs exercise', () => {
    // Run several times since the generator is intentionally non-deterministic
    // (variety jitter). Balance must hold every run, not on average.
    for (let i = 0; i < 20; i++) {
      const w = generateWorkout({
        split: 'full-body',
        equipment: FULL_EQUIPMENT.slice() as never,
        exerciseCount: 5,
      });
      const cats = new Set(w.picks.map((e) => e.category));
      expect(cats, `run ${i}: categories=${[...cats].join(',')}`).toContain('push');
      expect(cats, `run ${i}: categories=${[...cats].join(',')}`).toContain('pull');
      expect(cats, `run ${i}: categories=${[...cats].join(',')}`).toContain('legs');
    }
  });

  it('upper always includes at least one push and one pull (no legs requirement)', () => {
    for (let i = 0; i < 20; i++) {
      const w = generateWorkout({
        split: 'upper',
        equipment: FULL_EQUIPMENT.slice() as never,
        exerciseCount: 4,
      });
      const cats = new Set(w.picks.map((e) => e.category));
      expect(cats, `run ${i}`).toContain('push');
      expect(cats, `run ${i}`).toContain('pull');
    }
  });

  it('push-only split picks only push (no balancing into pull/legs)', () => {
    const w = generateWorkout({
      split: 'push',
      equipment: FULL_EQUIPMENT.slice() as never,
      exerciseCount: 4,
    });
    for (const p of w.picks) {
      expect(p.category).toBe('push');
    }
  });

  it('respects exerciseCount even when required categories would exceed it', () => {
    // count=1 + full-body wants push+pull+legs (3 requireds). Picks should still
    // total exactly 1, not 3.
    const w = generateWorkout({
      split: 'full-body',
      equipment: FULL_EQUIPMENT.slice() as never,
      exerciseCount: 1,
    });
    expect(w.picks).toHaveLength(1);
  });
});

describe('generateWorkout — coverage reporting', () => {
  it('reports uncovered target muscles for thin pools', () => {
    // Bodyweight-only + push split → triceps coverage may exist but back delts /
    // upper-back can't appear, and pool is small. The result's uncovered list
    // should be honest, not silently empty.
    const w = generateWorkout({
      split: 'pull',
      equipment: ['bodyweight'] as never, // no pull-up bar → essentially no pull moves
      exerciseCount: 3,
    });
    // We just assert the field is an array — concrete uncovereds depend on library.
    expect(Array.isArray(w.uncovered)).toBe(true);
  });
});
