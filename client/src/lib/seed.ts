// Vongola Trainer — Seed Data
// Default workout templates and initial store state

import type { Exercise, Store } from './types';

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
    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
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
  makeExercise('Goblet Squat', ['quads', 'glutes'], ['dumbbell'], 3, '8-12', 20),
  makeExercise('Single-Arm Row', ['back', 'biceps'], ['dumbbell'], 3, '8-12', 15),
  makeExercise('Push-Up Variations', ['chest', 'triceps', 'shoulders'], ['bodyweight'], 3, '10-15', undefined, [
    makeExercise('Standard Push-Up', ['chest', 'triceps'], ['bodyweight'], 1, '10'),
    makeExercise('Diamond Push-Up', ['triceps', 'chest'], ['bodyweight'], 1, '8'),
    makeExercise('Wide Push-Up', ['chest', 'shoulders'], ['bodyweight'], 1, '10'),
  ]),
  makeExercise('Plank Hold', ['core'], ['bodyweight'], 3, '30-60s'),
  makeExercise('Farmer Carry', ['grip', 'core', 'traps'], ['dumbbell'], 3, '40m', 20),
];

export const LIFT_B: Exercise[] = [
  makeExercise('Romanian Deadlift', ['hamstrings', 'glutes', 'back'], ['dumbbell', 'barbell'], 3, '8-10', 30),
  makeExercise('Pull-Ups', ['back', 'biceps'], ['pull-up bar'], 3, '5-8'),
  makeExercise('Overhead Press', ['shoulders', 'triceps'], ['dumbbell'], 3, '8-12', 12),
  makeExercise('Bulgarian Split Squat', ['quads', 'glutes'], ['dumbbell'], 3, '8-10', 10),
  makeExercise('Face Pulls', ['rear delts', 'upper back'], ['band'], 3, '12-15'),
];

export const MORNING_BLOCK: Exercise[] = [
  makeExercise('Cat-Cow Stretch', ['spine', 'core'], ['bodyweight'], 1, '10'),
  makeExercise('World\'s Greatest Stretch', ['hips', 'thoracic'], ['bodyweight'], 1, '5 each'),
  makeExercise('90/90 Hip Switch', ['hips'], ['bodyweight'], 1, '8 each'),
  makeExercise('Dead Bug', ['core'], ['bodyweight'], 1, '10 each'),
  makeExercise('Band Pull-Apart', ['upper back', 'rear delts'], ['band'], 1, '15'),
  makeExercise('Box Breathing', ['recovery'], [], 1, '4 rounds'),
  makeExercise('Diaphragmatic Breathing', ['recovery'], [], 1, '3 min'),
  makeExercise('Neck CARs', ['neck'], ['bodyweight'], 1, '5 each'),
  makeExercise('Shoulder CARs', ['shoulders'], ['bodyweight'], 1, '5 each'),
  makeExercise('Wrist CARs', ['wrists'], ['bodyweight'], 1, '5 each'),
  makeExercise('Standing Tall', ['posture'], ['bodyweight'], 1, '1 min'),
];

export const EVENING_BLOCK: Exercise[] = [
  makeExercise('Foam Roll — Quads', ['quads'], ['foam roller'], 1, '60s each'),
  makeExercise('Foam Roll — Upper Back', ['thoracic'], ['foam roller'], 1, '60s'),
  makeExercise('Pigeon Stretch', ['hips', 'glutes'], ['bodyweight'], 1, '60s each'),
  makeExercise('Couch Stretch', ['hip flexors', 'quads'], ['bodyweight'], 1, '60s each'),
  makeExercise('Child\'s Pose', ['back', 'shoulders'], ['bodyweight'], 1, '90s'),
  makeExercise('Legs Up Wall', ['recovery', 'hamstrings'], ['bodyweight'], 1, '3 min'),
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
      week: 2,
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
  };
}
