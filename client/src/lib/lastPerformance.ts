// Vongola Trainer — "last time" lookup for an exercise.

import type { LogEntry } from './types';
import { formatWeight, type WeightUnit } from './units';

/** Most recent log entry for an exercise (by date, then id), or null. */
export function getLastEntry(log: LogEntry[], exerciseId: string): LogEntry | null {
  let best: LogEntry | null = null;
  for (const e of log) {
    if (e.exerciseId !== exerciseId) continue;
    if (!best || e.date > best.date || (e.date === best.date && e.id > best.id)) best = e;
  }
  return best;
}

/** Compact "3×10 @ 20kg" summary of an entry's sets in the user's chosen unit. */
export function summarizeEntry(entry: LogEntry | null, unit: WeightUnit = 'kg'): string | null {
  if (!entry || entry.sets.length === 0) return null;
  const reps = entry.sets.map((s) => s.reps);
  const weights = entry.sets.map((s) => s.weight);
  const sameReps = reps.every((r) => r === reps[0]);
  const sameWeight = weights.every((w) => w === weights[0]);
  const repsPart = sameReps ? `${entry.sets.length}×${reps[0]}` : reps.join('/');
  const maxWeight = Math.max(...weights);
  if (maxWeight <= 0) return repsPart;
  const weightPart = sameWeight
    ? `${formatWeight(weights[0], unit)}${unit}`
    : `${formatWeight(maxWeight, unit)}${unit}`;
  return `${repsPart} @ ${weightPart}`;
}

/** Parse a leading integer out of a reps string ("8-12" → 8, "30-60s" → 30), default 10. */
export function parseFirstRep(reps: string): number {
  const m = reps.match(/\d+/);
  return m ? Number(m[0]) : 10;
}
