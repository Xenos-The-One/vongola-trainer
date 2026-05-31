// Vongola Trainer — Preset Routines
// Ready-made programs referencing library exercise ids (single source of truth).

import { getLibraryExercise, toExercise } from './exercises';
import type { Exercise } from './types';

export interface RoutineDay {
  name: string;
  exerciseIds: string[];
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  tags: string[];
  days: RoutineDay[];
}

export const ROUTINES: Routine[] = [
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    description: 'Classic hypertrophy split — run 3 or 6 days a week.',
    tags: ['hypertrophy', '3–6 day'],
    days: [
      { name: 'Push', exerciseIds: ['db-bench-press', 'incline-db-press', 'overhead-press', 'lateral-raise', 'triceps-pushdown', 'push-up'] },
      { name: 'Pull', exerciseIds: ['pull-ups', 'single-arm-row', 'lat-pulldown', 'face-pulls', 'db-curl', 'hammer-curl'] },
      { name: 'Legs', exerciseIds: ['goblet-squat', 'romanian-deadlift', 'bulgarian-split-squat', 'hip-thrust', 'calf-raise', 'hanging-leg-raise'] },
    ],
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower',
    description: '4-day split balancing upper- and lower-body volume.',
    tags: ['hypertrophy', '4 day'],
    days: [
      { name: 'Upper', exerciseIds: ['db-bench-press', 'single-arm-row', 'overhead-press', 'lat-pulldown', 'db-curl', 'triceps-pushdown'] },
      { name: 'Lower', exerciseIds: ['back-squat', 'romanian-deadlift', 'walking-lunge', 'hip-thrust', 'calf-raise', 'plank'] },
    ],
  },
  {
    id: 'full-body',
    name: 'Full Body',
    description: 'Three alternating full-body days — efficient and beginner-friendly.',
    tags: ['general', '3 day'],
    days: [
      { name: 'Day A', exerciseIds: ['goblet-squat', 'db-bench-press', 'single-arm-row', 'plank'] },
      { name: 'Day B', exerciseIds: ['romanian-deadlift', 'overhead-press', 'lat-pulldown', 'hanging-leg-raise'] },
      { name: 'Day C', exerciseIds: ['bulgarian-split-squat', 'incline-db-press', 'db-row', 'russian-twist'] },
    ],
  },
  {
    id: 'mobility',
    name: 'Mobility Flow',
    description: 'A daily mobility + recovery routine to stay loose.',
    tags: ['mobility', 'daily'],
    days: [
      { name: 'Flow', exerciseIds: ['cat-cow-stretch', 'world-s-greatest-stretch', '90-90-hip-switch', 'thoracic-rotation', 'pigeon-stretch', 'couch-stretch', 'child-s-pose'] },
    ],
  },
];

export function getRoutine(id: string): Routine | undefined {
  return ROUTINES.find((r) => r.id === id);
}

/** Materialize a routine day's exercise ids into runtime Exercises (skips unknown ids). */
export function routineDayToExercises(day: RoutineDay): Exercise[] {
  return day.exerciseIds
    .map((id) => getLibraryExercise(id))
    .filter((e): e is NonNullable<typeof e> => !!e)
    .map((e) => toExercise(e));
}

// Dev-only integrity guard: every referenced id exists in the library.
if (import.meta.env.DEV) {
  for (const r of ROUTINES) {
    for (const d of r.days) {
      for (const id of d.exerciseIds) {
        if (!getLibraryExercise(id)) console.warn(`[routines] ${r.id}/${d.name}: unknown exercise id "${id}"`);
      }
    }
  }
}
