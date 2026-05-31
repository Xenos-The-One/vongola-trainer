// Vongola Trainer — Weekly Plan Generator
//
// Builds a rotating N-day workout plan with split templates that hit each
// movement family the right number of times for the chosen frequency.
//
//   1 day  → Full Body
//   2 days → Upper / Lower
//   3 days → Full Body × 3      (each session lighter, more rest between)
//   4 days → Upper / Lower / Upper / Lower
//   5 days → Push / Pull / Legs / Upper / Lower
//   6 days → Push / Pull / Legs / Push / Pull / Legs
//
// Each day's exercises come from generateWorkout() with the appropriate split,
// so the existing push/pull/legs balance + equipment filter + recent-muscle
// down-rank logic all carry over.

import { generateWorkout, type SplitType } from './generator';
import type { Equipment } from './exercises';
import type { LogEntry, WeeklyPlan, WeeklyPlanDay, Exercise } from './types';
import { todayKey } from './date';

interface SplitSlot {
  split: SplitType;
  /** Display title in the plan list. */
  title: string;
  /** Default exercise count for this split. */
  count: number;
}

const TEMPLATES: Record<number, SplitSlot[]> = {
  1: [{ split: 'full-body', title: 'Full Body', count: 6 }],
  2: [
    { split: 'upper', title: 'Upper', count: 5 },
    { split: 'lower', title: 'Lower', count: 5 },
  ],
  3: [
    { split: 'full-body', title: 'Full Body — Day 1', count: 5 },
    { split: 'full-body', title: 'Full Body — Day 2', count: 5 },
    { split: 'full-body', title: 'Full Body — Day 3', count: 5 },
  ],
  4: [
    { split: 'upper', title: 'Upper — A', count: 5 },
    { split: 'lower', title: 'Lower — A', count: 5 },
    { split: 'upper', title: 'Upper — B', count: 5 },
    { split: 'lower', title: 'Lower — B', count: 5 },
  ],
  5: [
    { split: 'push', title: 'Push', count: 5 },
    { split: 'pull', title: 'Pull', count: 5 },
    { split: 'legs', title: 'Legs', count: 5 },
    { split: 'upper', title: 'Upper', count: 5 },
    { split: 'lower', title: 'Lower', count: 5 },
  ],
  6: [
    { split: 'push', title: 'Push — A', count: 5 },
    { split: 'pull', title: 'Pull — A', count: 5 },
    { split: 'legs', title: 'Legs — A', count: 5 },
    { split: 'push', title: 'Push — B', count: 5 },
    { split: 'pull', title: 'Pull — B', count: 5 },
    { split: 'legs', title: 'Legs — B', count: 5 },
  ],
};

export const MIN_DAYS = 1;
export const MAX_DAYS = 6;

export interface GenerateWeeklyPlanInput {
  daysPerWeek: number;
  equipment: Equipment[];
  log?: LogEntry[];
}

/**
 * Generate a rotating N-day plan. The id is derived from the input so two
 * back-to-back generations with the same params still get distinct ids (the
 * generator's internal Math.random jitter ensures different exercise picks).
 */
export function generateWeeklyPlan(input: GenerateWeeklyPlanInput): WeeklyPlan {
  const days = Math.max(MIN_DAYS, Math.min(MAX_DAYS, input.daysPerWeek));
  const template = TEMPLATES[days] ?? TEMPLATES[3];

  const planDays: WeeklyPlanDay[] = template.map((slot, i) => {
    const w = generateWorkout({
      split: slot.split,
      equipment: input.equipment,
      exerciseCount: slot.count,
      log: input.log,
    });
    return {
      index: i,
      title: slot.title,
      split: slot.split,
      exercises: w.exercises,
    };
  });

  return {
    id: `wp-${days}d-${idSuffix(planDays)}`,
    createdAt: todayKey(),
    daysPerWeek: days,
    days: planDays,
    currentIndex: 0,
  };
}

/** Stable hash over the first exercise id of each day — gives the plan a content-based id. */
function idSuffix(days: WeeklyPlanDay[]): string {
  const seed = days.map((d) => d.exercises[0]?.id ?? '').join('|');
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).slice(0, 6);
}

/** The plan day shown TODAY (just plan.currentIndex; advances on session finish). */
export function planDayForToday(plan: WeeklyPlan): WeeklyPlanDay {
  const idx = ((plan.currentIndex % plan.days.length) + plan.days.length) % plan.days.length;
  return plan.days[idx];
}

/** Exercises to show on Today + start in the active workout when the plan is active. */
export function planExercisesForToday(plan: WeeklyPlan): Exercise[] {
  return planDayForToday(plan).exercises;
}
