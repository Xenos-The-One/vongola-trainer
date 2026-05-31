// Vongola Trainer — Seed Data
// Default workout templates and initial store state.
// Muscle tags use canonical slugs (see lib/muscles.ts); ids come from slugify()
// so they stay identical to historical log/PR keys.

import type { Exercise, Store } from './types';
import { slugify } from './utils';
import { todayKey } from './date';

function makeExercise(
  name: string,
  muscles: string[],
  equipment: string[],
  sets: number,
  reps: string,
  targetWeight?: number,
  subExercises?: Exercise[]
): Exercise {
  return {
    id: slugify(name),
    name,
    muscles,
    equipment,
    sets,
    reps,
    targetWeight,
    subExercises,
  };
}

export const LIFT_A: Exercise[] = [
  makeExercise('Goblet Squat', ['quadriceps', 'gluteal'], ['dumbbell'], 3, '8-12', 20),
  makeExercise('Single-Arm Row', ['lats', 'biceps'], ['dumbbell'], 3, '8-12', 15),
  makeExercise('Push-Up Variations', ['chest', 'triceps', 'front-deltoids'], ['bodyweight'], 3, '10-15', undefined, [
    makeExercise('Standard Push-Up', ['chest', 'triceps'], ['bodyweight'], 1, '10'),
    makeExercise('Diamond Push-Up', ['triceps', 'chest'], ['bodyweight'], 1, '8'),
    makeExercise('Wide Push-Up', ['chest', 'front-deltoids'], ['bodyweight'], 1, '10'),
  ]),
  makeExercise('Plank Hold', ['abs'], ['bodyweight'], 3, '30-60s'),
  makeExercise('Farmer Carry', ['forearm', 'abs', 'trapezius'], ['dumbbell'], 3, '40m', 20),
];

export const LIFT_B: Exercise[] = [
  makeExercise('Romanian Deadlift', ['hamstring', 'gluteal', 'lower-back'], ['dumbbell', 'barbell'], 3, '8-10', 30),
  makeExercise('Pull-Ups', ['lats', 'biceps'], ['pull-up bar'], 3, '5-8'),
  makeExercise('Overhead Press', ['front-deltoids', 'triceps'], ['dumbbell'], 3, '8-12', 12),
  makeExercise('Bulgarian Split Squat', ['quadriceps', 'gluteal'], ['dumbbell'], 3, '8-10', 10),
  makeExercise('Face Pulls', ['back-deltoids', 'upper-back'], ['band'], 3, '12-15'),
];

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
      liftA: LIFT_A,
      liftB: LIFT_B,
      custom: [],
    },
    log: [],
    prs: {},
    nextLift: 'A',
    equipmentProfile: ['dumbbell', 'band', 'pull-up bar', 'bodyweight'],
    savedWorkouts: [],
    activeSession: null,
    metrics: [],
  };
}
