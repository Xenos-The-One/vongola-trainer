import { describe, it, expect } from 'vitest';
import { parseBackup } from './backup';
import { SCHEMA_VERSION } from './storage';

function wrap(data: unknown, schemaVersion = SCHEMA_VERSION): string {
  return JSON.stringify({ app: 'vongola-trainer', schemaVersion, exportedAt: '', data });
}

describe('parseBackup', () => {
  it('rejects non-JSON', () => {
    expect(parseBackup('not json{').ok).toBe(false);
  });

  it('rejects a file from a different app', () => {
    expect(parseBackup(JSON.stringify({ app: 'other', schemaVersion: 6, data: {} })).ok).toBe(false);
  });

  it('rejects a newer schema version than this app supports', () => {
    expect(parseBackup(wrap({ days: {} }, SCHEMA_VERSION + 1)).ok).toBe(false);
  });

  it('rejects JSON with no recognizable store fields', () => {
    expect(parseBackup(wrap({ foo: 1, bar: 2 })).ok).toBe(false);
  });

  it('accepts a partial backup and fills every slice with a safe default', () => {
    const r = parseBackup(wrap({ log: [], days: {} }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = r.data as any;
      expect(Array.isArray(d.workouts.liftA)).toBe(true);
      expect(Array.isArray(d.workouts.custom)).toBe(true);
      expect(Array.isArray(d.metrics)).toBe(true);
      expect(Array.isArray(d.savedWorkouts)).toBe(true);
      expect(d.activeSession).toBeNull();
      expect(d.nextLift === 'A' || d.nextLift === 'B').toBe(true);
      expect(typeof d.user).toBe('object');
      expect(Array.isArray(d.equipmentProfile)).toBe(true);
      expect(d.equipmentProfile.length).toBeGreaterThan(0);
    }
  });

  it('coerces a malformed workouts value into valid arrays (no crash on load)', () => {
    const r = parseBackup(wrap({ days: {}, workouts: 'broken' }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = r.data as any;
      expect(Array.isArray(d.workouts.liftA)).toBe(true);
      expect(Array.isArray(d.workouts.liftB)).toBe(true);
      expect(Array.isArray(d.workouts.custom)).toBe(true);
    }
  });

  it('preserves a real backup round-trip', () => {
    const r = parseBackup(
      wrap({
        days: {},
        log: [{ id: 'l1', date: '2026-05-31', exerciseId: 'goblet-squat', sets: [{ reps: 10, weight: 24 }] }],
        workouts: { liftA: [], liftB: [], morning: [], evening: [], custom: [] },
      })
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = r.data as any;
      expect(d.log).toHaveLength(1);
      expect(d.log[0].exerciseId).toBe('goblet-squat');
    }
  });
});
