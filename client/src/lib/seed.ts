// Vongola Trainer — Seed Data
// Default workout templates and initial store state.
// Muscle tags use canonical slugs (see lib/muscles.ts); ids come from slugify()
// so they stay identical to historical log/PR keys.

import type { Exercise, Store } from './types';
import { slugify } from './utils';

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

// Morning + Evening blocks are mobility/recovery work — empty muscle arrays so
// they never shade the heatmap or inflate volume.
export const MORNING_BLOCK: Exercise[] = [
  makeExercise('Cat-Cow Stretch', [], ['bodyweight'], 1, '10'),
  makeExercise('World\'s Greatest Stretch', [], ['bodyweight'], 1, '5 each'),
  makeExercise('90/90 Hip Switch', [], ['bodyweight'], 1, '8 each'),
  makeExercise('Dead Bug', ['abs'], ['bodyweight'], 1, '10 each'),
  makeExercise('Band Pull-Apart', ['back-deltoids', 'upper-back'], ['band'], 1, '15'),
  makeExercise('Box Breathing', [], [], 1, '4 rounds'),
  makeExercise('Diaphragmatic Breathing', [], [], 1, '3 min'),
  makeExercise('Neck CARs', [], ['bodyweight'], 1, '5 each'),
  makeExercise('Shoulder CARs', [], ['bodyweight'], 1, '5 each'),
  makeExercise('Wrist CARs', [], ['bodyweight'], 1, '5 each'),
  makeExercise('Standing Tall', [], ['bodyweight'], 1, '1 min'),
];

export const EVENING_BLOCK: Exercise[] = [
  makeExercise('Foam Roll — Quads', [], ['foam roller'], 1, '60s each'),
  makeExercise('Foam Roll — Upper Back', [], ['foam roller'], 1, '60s'),
  makeExercise('Pigeon Stretch', [], ['bodyweight'], 1, '60s each'),
  makeExercise('Couch Stretch', [], ['bodyweight'], 1, '60s each'),
  makeExercise('Child\'s Pose', [], ['bodyweight'], 1, '90s'),
  makeExercise('Legs Up Wall', [], ['bodyweight'], 1, '3 min'),
];

export const COACH_FOCUS_ITEMS = [
  'Myofascial Release',
  'Plank Progression',
  'Standing Neutral',
  'Hip Hinge Pattern',
  'Scapular Control',
  'Breathing Mechanics',
];

export function createDefaultStore(): Store {
  const today = new Date().toISOString().split('T')[0];
  return {
    user: {
      nickname: 'Natsu',
      starter: 'natsu',
      accent: 'sunset',
      theme: 'dark',
      fontSize: 'M',
    },
    phase: {
      name: 'Phase 1 — Downregulate',
      week: 1,
      startDate: today,
    },
    days: {},
    workouts: {
      liftA: LIFT_A,
      liftB: LIFT_B,
      morning: MORNING_BLOCK,
      evening: EVENING_BLOCK,
      custom: [],
    },
    log: [],
    prs: {},
    nextLift: 'A',
    equipmentProfile: ['dumbbell', 'band', 'pull-up bar', 'bodyweight'],
    savedWorkouts: [],
  };
}
