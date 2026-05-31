// Vongola Trainer — Workout Generator (rules-based, hypertrophy-default)
// Picks exercises from the library to cover the target muscles, respecting the
// user's equipment and down-ranking recently-trained muscles.

import {
  EXERCISE_BY_ID,
  filterExercises,
  toExercise,
  type Equipment,
  type LibraryExercise,
} from './exercises';
import type { MuscleSlug } from './muscles';
import type { Exercise, LogEntry } from './types';

export type SplitType = 'full-body' | 'upper' | 'lower' | 'push' | 'pull' | 'legs';

export const SPLITS: { key: SplitType; label: string; muscles: MuscleSlug[] }[] = [
  {
    key: 'full-body',
    label: 'Full Body',
    muscles: ['chest', 'lats', 'quadriceps', 'hamstring', 'gluteal', 'front-deltoids', 'biceps', 'triceps', 'abs'],
  },
  {
    key: 'upper',
    label: 'Upper',
    muscles: ['chest', 'lats', 'upper-back', 'front-deltoids', 'back-deltoids', 'biceps', 'triceps'],
  },
  { key: 'lower', label: 'Lower', muscles: ['quadriceps', 'hamstring', 'gluteal', 'calves', 'adductor', 'abs'] },
  { key: 'push', label: 'Push', muscles: ['chest', 'front-deltoids', 'triceps'] },
  { key: 'pull', label: 'Pull', muscles: ['lats', 'upper-back', 'back-deltoids', 'biceps', 'forearm'] },
  { key: 'legs', label: 'Legs', muscles: ['quadriceps', 'hamstring', 'gluteal', 'calves', 'adductor'] },
];

export interface GenerateOptions {
  split?: SplitType;
  targetMuscles?: MuscleSlug[];
  equipment: Equipment[];
  exerciseCount?: number;
  log?: LogEntry[];
  avoidDays?: number;
}

export interface GeneratedWorkout {
  title: string;
  picks: LibraryExercise[];
  exercises: Exercise[];
  targetMuscles: MuscleSlug[];
  /** Normalized 0..1 per-muscle coverage for the heatmap preview. */
  coverage: Partial<Record<MuscleSlug, number>>;
  /** Target muscles no picked exercise hit (surfaced as a warning). */
  uncovered: MuscleSlug[];
}

function recentlyTrained(log: LogEntry[], days: number): Set<MuscleSlug> {
  const set = new Set<MuscleSlug>();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  for (const e of log) {
    const t = new Date(e.date).getTime();
    if (Number.isNaN(t) || t < cutoff) continue;
    EXERCISE_BY_ID.get(e.exerciseId)?.primaryMuscles.forEach((m) => set.add(m));
  }
  return set;
}

export function generateWorkout(opts: GenerateOptions): GeneratedWorkout {
  const split = opts.split ? SPLITS.find((s) => s.key === opts.split) : undefined;
  const target =
    opts.targetMuscles && opts.targetMuscles.length ? opts.targetMuscles : split?.muscles ?? [];
  const count = Math.max(1, opts.exerciseCount ?? 5);
  const recent = recentlyTrained(opts.log ?? [], opts.avoidDays ?? 3);

  const isStrength = (e: LibraryExercise) => e.category !== 'mobility' && e.category !== 'cardio';

  // Candidate pool: equipment-allowed strength moves hitting a target primary.
  let pool = filterExercises({ equipment: opts.equipment, muscles: target, includeSecondary: false }).filter(isStrength);
  if (pool.length < count) {
    // Relax to secondary-muscle matches if the primary-only pool is too thin.
    pool = filterExercises({ equipment: opts.equipment, muscles: target, includeSecondary: true }).filter(isStrength);
  }

  const covered = new Map<MuscleSlug, number>();
  const isTarget = (m: MuscleSlug) => target.includes(m);

  const score = (e: LibraryExercise): number => {
    let s = e.mechanic === 'compound' ? 2 : 0;
    for (const m of e.primaryMuscles) if (isTarget(m)) s += (covered.get(m) ?? 0) === 0 ? 2 : 0.5;
    for (const m of e.secondaryMuscles) if (isTarget(m)) s += (covered.get(m) ?? 0) === 0 ? 0.5 : 0.2;
    if (e.primaryMuscles.some((m) => recent.has(m))) s -= 1.5;
    s += Math.random() * 0.6; // variety jitter
    return s;
  };

  const picks: LibraryExercise[] = [];
  const available = [...pool];
  while (picks.length < count && available.length) {
    available.sort((a, b) => score(b) - score(a));
    const chosen = available.shift()!;
    picks.push(chosen);
    chosen.primaryMuscles.forEach((m) => covered.set(m, (covered.get(m) ?? 0) + 1));
  }

  // Coverage heatmap: primary 1.0, secondary 0.5, normalized to the peak muscle.
  const raw: Partial<Record<MuscleSlug, number>> = {};
  for (const p of picks) {
    p.primaryMuscles.forEach((m) => (raw[m] = (raw[m] ?? 0) + 1));
    p.secondaryMuscles.forEach((m) => (raw[m] = (raw[m] ?? 0) + 0.5));
  }
  let max = 0;
  for (const k of Object.keys(raw) as MuscleSlug[]) max = Math.max(max, raw[k] ?? 0);
  const coverage: Partial<Record<MuscleSlug, number>> = {};
  if (max > 0) for (const k of Object.keys(raw) as MuscleSlug[]) coverage[k] = (raw[k] ?? 0) / max;

  return {
    title: split ? `${split.label} Workout` : 'Custom Workout',
    picks,
    exercises: picks.map((p) => toExercise(p)),
    targetMuscles: target,
    coverage,
    uncovered: target.filter((m) => !(m in raw)),
  };
}
