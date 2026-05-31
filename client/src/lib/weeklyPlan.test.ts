import { describe, it, expect } from 'vitest';
import { generateWeeklyPlan, planDayForToday, MIN_DAYS, MAX_DAYS } from './weeklyPlan';
import type { Equipment } from './exercises';

const EQUIPMENT: Equipment[] = ['dumbbell', 'bench', 'barbell', 'pull-up bar', 'cable', 'bodyweight', 'band'];

describe('generateWeeklyPlan', () => {
  it('builds a plan for every supported day count', () => {
    for (let d = MIN_DAYS; d <= MAX_DAYS; d++) {
      const plan = generateWeeklyPlan({ daysPerWeek: d, equipment: EQUIPMENT });
      expect(plan.daysPerWeek).toBe(d);
      expect(plan.days).toHaveLength(d);
      expect(plan.currentIndex).toBe(0);
      for (const day of plan.days) {
        expect(day.exercises.length).toBeGreaterThan(0);
        expect(day.title).toBeTruthy();
      }
    }
  });

  it('clamps daysPerWeek to the supported range', () => {
    const tooFew = generateWeeklyPlan({ daysPerWeek: 0, equipment: EQUIPMENT });
    const tooMany = generateWeeklyPlan({ daysPerWeek: 99, equipment: EQUIPMENT });
    expect(tooFew.daysPerWeek).toBe(MIN_DAYS);
    expect(tooMany.daysPerWeek).toBe(MAX_DAYS);
  });

  it('4-day plan rotates Upper/Lower/Upper/Lower', () => {
    const plan = generateWeeklyPlan({ daysPerWeek: 4, equipment: EQUIPMENT });
    expect(plan.days.map((d) => d.split)).toEqual(['upper', 'lower', 'upper', 'lower']);
  });

  it('6-day plan rotates Push/Pull/Legs × 2', () => {
    const plan = generateWeeklyPlan({ daysPerWeek: 6, equipment: EQUIPMENT });
    expect(plan.days.map((d) => d.split)).toEqual(['push', 'pull', 'legs', 'push', 'pull', 'legs']);
  });
});

describe('planDayForToday', () => {
  it('returns the day at currentIndex', () => {
    const plan = generateWeeklyPlan({ daysPerWeek: 4, equipment: EQUIPMENT });
    expect(planDayForToday(plan).index).toBe(0);
    expect(planDayForToday({ ...plan, currentIndex: 2 }).index).toBe(2);
  });

  it('wraps modulo days.length so the rotation never overflows', () => {
    const plan = generateWeeklyPlan({ daysPerWeek: 4, equipment: EQUIPMENT });
    expect(planDayForToday({ ...plan, currentIndex: 5 }).index).toBe(1); // 5 % 4
    expect(planDayForToday({ ...plan, currentIndex: 8 }).index).toBe(0); // 8 % 4
  });
});
