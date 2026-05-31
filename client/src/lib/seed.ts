// Vongola Trainer — Seed Data
// Default initial store state. Workouts now start EMPTY — the user generates
// their first plan via Today's Generate sheet. This makes the app
// workout-first by construction (no muscle memory carried over from the
// pre-overhaul Lift A/Lift B seed). Existing users keep their data; the
// empty seed only applies to fresh installs and after Reset.

import type { Store } from './types';
import { todayKey } from './date';

export function createDefaultStore(): Store {
  const today = todayKey();
  return {
    user: {
      nickname: 'Natsu',
      starter: 'natsu',
      accent: 'sunset',
      theme: 'dark',
      fontSize: 'M',
      units: 'kg',
    },
    phase: {
      name: 'Phase 1 — Foundation',
      week: 1,
      startDate: today,
    },
    days: {},
    workouts: {
      liftA: [],
      liftB: [],
      custom: [],
    },
    log: [],
    prs: {},
    nextLift: 'A',
    equipmentProfile: ['dumbbell', 'band', 'pull-up bar', 'bodyweight'],
    savedWorkouts: [],
    activeSession: null,
    metrics: [],
    weeklyPlan: null,
  };
}
