import { describe, it, expect } from 'vitest';
import { migrateStore } from './storage';

describe('migrateStore', () => {
  it('upgrades a v1 blob all the way to the current shape', () => {
    const v1 = {
      user: { nickname: 'X', starter: 'natsu', accent: 'sunset', theme: 'dark', fontSize: 'M' },
      phase: { name: 'P', week: 1, startDate: '2026-01-01' },
      days: {
        '2026-01-01': {
          blocks: {
            training: { done: 3, total: 5 },
            coach: { done: 0, total: 6 },
            morning: { done: 0, total: 11 },
            work: { done: 0, total: 6 },
            evening: { done: 0, total: 6 },
          },
          completionPct: 9,
          streakDay: 0,
        },
      },
      workouts: {
        liftA: [
          { id: 'goblet-squat', name: 'Goblet Squat', muscles: ['quads', 'glutes'], equipment: ['dumbbell'], sets: 3, reps: '8-12' },
        ],
        liftB: [],
        morning: [],
        evening: [],
        custom: [],
      },
      log: [],
      prs: {},
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = migrateStore(structuredClone(v1), 1) as any;

    // v1 -> v2: BlockState {done,total} becomes {checked,total} (flattened in v8)
    expect(out.days['2026-01-01'].training.checked).toEqual([0, 1, 2]);
    expect(out.days['2026-01-01'].training.total).toBe(5);
    expect(out.days['2026-01-01'].blocks).toBeUndefined(); // v7→v8 flattened
    expect(out.nextLift).toBe('A');

    // v2 -> v3: free-text muscles normalized to canonical slugs
    expect(out.workouts.liftA[0].muscles).toEqual(['quadriceps', 'gluteal']);

    // v3 -> v6: new slices defaulted
    expect(Array.isArray(out.equipmentProfile)).toBe(true);
    expect(Array.isArray(out.savedWorkouts)).toBe(true);
    expect(out.activeSession).toBeNull();
    expect(Array.isArray(out.metrics)).toBe(true);

    // v7 -> v8: chore-block workout lists dropped
    expect(out.workouts.morning).toBeUndefined();
    expect(out.workouts.evening).toBeUndefined();
  });

  it('is idempotent when re-run at the current version', () => {
    const base = {
      user: {},
      phase: {},
      days: {},
      workouts: { liftA: [], liftB: [], custom: [] },
      log: [],
      prs: {},
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v8 = migrateStore(structuredClone(base), 1) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const again = migrateStore(structuredClone(v8), 8) as any;
    expect(again.metrics).toEqual(v8.metrics);
    expect(again.activeSession).toEqual(v8.activeSession);
    expect(again.nextLift).toBe(v8.nextLift);
    expect(again.equipmentProfile).toEqual(v8.equipmentProfile);
  });

  it('does not throw on an empty/garbage blob', () => {
    expect(() => migrateStore({}, 1)).not.toThrow();
    expect(() => migrateStore(null, 1)).not.toThrow();
  });

  it('v6 → v7 backfills e1RM PR from existing log entries', () => {
    const v6 = {
      user: {},
      phase: {},
      days: {},
      workouts: { liftA: [], liftB: [], morning: [], evening: [], custom: [] },
      log: [
        {
          id: 'log-1',
          date: '2026-05-01',
          exerciseId: 'bench-press',
          // 100kg × 5 → e1RM ≈ 116.67
          sets: [
            { reps: 5, weight: 100 },
            { reps: 5, weight: 100 },
            { reps: 3, weight: 105 },
          ],
        },
      ],
      // pre-existing weight PR (105kg × 3 is the heaviest set)
      prs: { 'bench-press': { value: 105, date: '2026-05-01' } },
      equipmentProfile: [],
      savedWorkouts: [],
      activeSession: null,
      metrics: [],
      nextLift: 'A',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = migrateStore(structuredClone(v6), 6) as any;
    const pr = out.prs['bench-press'];

    expect(pr.value).toBe(105); // weight PR untouched
    expect(pr.bestSetReps).toBe(5);
    expect(pr.bestSetWeight).toBe(100);
    expect(pr.bestSetDate).toBe('2026-05-01');
    expect(pr.bestE1RM).toBeCloseTo(116.67, 1);
  });

  it('v6 → v7 leaves PRs untouched when no log entries exist for that exercise', () => {
    const v6 = {
      user: {}, phase: {}, days: {},
      workouts: { liftA: [], liftB: [], morning: [], evening: [], custom: [] },
      log: [],
      prs: { 'some-lift': { value: 80, date: '2026-04-01' } },
      equipmentProfile: [], savedWorkouts: [], activeSession: null, metrics: [], nextLift: 'A',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = migrateStore(structuredClone(v6), 6) as any;
    expect(out.prs['some-lift']).toEqual({ value: 80, date: '2026-04-01' });
  });

  it('v7 → v8 flattens blocks.training → training and drops chore blocks', () => {
    const v7 = {
      user: {}, phase: {}, days: {
        '2026-05-01': {
          blocks: {
            training: { checked: [0, 1, 2], total: 5 },
            coach: { checked: [0, 1, 2, 3, 4, 5], total: 6 },
            morning: { checked: [], total: 11 },
            work: { checked: [], total: 6 },
            evening: { checked: [], total: 6 },
          },
          completionPct: 26,
          streakDay: 0,
        },
      },
      workouts: { liftA: [], liftB: [], morning: [{ id: 'old' }], evening: [{ id: 'old2' }], custom: [] },
      log: [], prs: {}, equipmentProfile: [], savedWorkouts: [], activeSession: null, metrics: [], nextLift: 'A',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = migrateStore(structuredClone(v7), 7) as any;
    const day = out.days['2026-05-01'];
    expect(day.training).toEqual({ checked: [0, 1, 2], total: 5 });
    expect(day.blocks).toBeUndefined();
    // completionPct recomputed as training-only: 3/5 = 60% (was 26% across 34 chores)
    expect(day.completionPct).toBe(60);
    // chore-block workout lists dropped
    expect(out.workouts.morning).toBeUndefined();
    expect(out.workouts.evening).toBeUndefined();
    // user-built workouts preserved
    expect(out.workouts.liftA).toEqual([]);
    expect(out.workouts.custom).toEqual([]);
  });
});
