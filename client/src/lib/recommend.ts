// Vongola Trainer — Recommendation Engine (rules-based)
// Provides workout suggestions, deload reminders, and variety prompts

import type { LogEntry, Exercise } from './types';

export interface Recommendation {
  type: 'rotation' | 'deload' | 'variety' | 'neglected';
  message: string;
  priority: number; // 1 = high, 3 = low
}

/**
 * Suggest muscle group rotation: push → pull → legs → rest
 */
function checkRotation(log: LogEntry[], exercises: Exercise[]): Recommendation | null {
  if (log.length < 2) return null;
  
  const recentLogs = log.slice(-3);
  const recentMuscles = new Set<string>();
  
  recentLogs.forEach(entry => {
    const ex = exercises.find(e => e.id === entry.exerciseId);
    if (ex) ex.muscles.forEach(m => recentMuscles.add(m));
  });

  const pushMuscles = ['chest', 'triceps', 'shoulders'];
  const pullMuscles = ['back', 'biceps'];
  const legMuscles = ['quads', 'hamstrings', 'glutes'];

  const hasPush = pushMuscles.some(m => recentMuscles.has(m));
  const hasPull = pullMuscles.some(m => recentMuscles.has(m));
  const hasLegs = legMuscles.some(m => recentMuscles.has(m));

  if (hasPush && !hasPull) {
    return { type: 'rotation', message: 'Consider a pull-focused session next (back, biceps)', priority: 2 };
  }
  if (hasPull && !hasLegs) {
    return { type: 'rotation', message: 'Legs are due! Try squats or hinges next session', priority: 2 };
  }
  return null;
}

/**
 * Suggest deload every 4 weeks
 */
function checkDeload(phaseWeek: number): Recommendation | null {
  if (phaseWeek > 0 && phaseWeek % 4 === 0) {
    return {
      type: 'deload',
      message: `Week ${phaseWeek} — consider a deload: reduce volume by 40%, keep intensity`,
      priority: 1,
    };
  }
  return null;
}

/**
 * Flag same exercise logged 3 sessions in a row
 */
function checkVariety(log: LogEntry[]): Recommendation | null {
  if (log.length < 3) return null;

  const lastThree = log.slice(-3);
  const exerciseCounts: Record<string, number> = {};
  
  lastThree.forEach(entry => {
    exerciseCounts[entry.exerciseId] = (exerciseCounts[entry.exerciseId] || 0) + 1;
  });

  for (const [exId, count] of Object.entries(exerciseCounts)) {
    if (count >= 3) {
      return {
        type: 'variety',
        message: `You've done "${exId}" 3 sessions in a row — try a variation or swap?`,
        priority: 2,
      };
    }
  }
  return null;
}

/**
 * Surface "you haven't trained X in Y days" hints
 */
function checkNeglected(log: LogEntry[], exercises: Exercise[]): Recommendation | null {
  if (log.length === 0) return null;

  const allMuscles = new Set<string>();
  exercises.forEach(ex => ex.muscles.forEach(m => allMuscles.add(m)));

  const recentMuscles = new Set<string>();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  log
    .filter(entry => new Date(entry.date) >= sevenDaysAgo)
    .forEach(entry => {
      const ex = exercises.find(e => e.id === entry.exerciseId);
      if (ex) ex.muscles.forEach(m => recentMuscles.add(m));
    });

  const neglected = Array.from(allMuscles).filter(m => !recentMuscles.has(m));
  
  if (neglected.length > 0) {
    const muscle = neglected[0];
    return {
      type: 'neglected',
      message: `You haven't trained ${muscle} in over 7 days`,
      priority: 3,
    };
  }
  return null;
}

/**
 * Get all applicable recommendations
 */
export function getRecommendations(
  log: LogEntry[],
  exercises: Exercise[],
  phaseWeek: number
): Recommendation[] {
  const recs: Recommendation[] = [];

  const rotation = checkRotation(log, exercises);
  if (rotation) recs.push(rotation);

  const deload = checkDeload(phaseWeek);
  if (deload) recs.push(deload);

  const variety = checkVariety(log);
  if (variety) recs.push(variety);

  const neglected = checkNeglected(log, exercises);
  if (neglected) recs.push(neglected);

  return recs.sort((a, b) => a.priority - b.priority);
}
