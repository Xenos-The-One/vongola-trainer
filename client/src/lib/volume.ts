// Vongola Trainer — Muscle Volume Math
// Shared by the Progress volume chart and the (future) anatomical heatmap.

import type { LogEntry } from './types';
import type { MuscleSlug } from './muscles';

export interface MuscleSplit {
  primary: MuscleSlug[];
  secondary: MuscleSlug[];
}

export interface VolumeResult {
  byMuscle: Partial<Record<MuscleSlug, number>>;
  max: number;
  total: number;
}

export interface VolumeOptions {
  /** Only count entries within the last N days (by entry.date). Omit for all-time. */
  sinceDays?: number;
  /** Weight applied to secondary muscles relative to primary (default 0.5). */
  secondaryWeight?: number;
  /**
   * Count bodyweight work (weight === 0) using reps as the load proxy, so
   * push-ups / pull-ups still register on the heatmap. Default false (the
   * volume chart stays strict reps×weight).
   */
  bodyweightRepsProxy?: boolean;
}

/**
 * Aggregate training volume per canonical muscle from a log.
 * `resolve` maps an exerciseId to its primary/secondary muscles (library first,
 * workouts fallback) — callers own that wiring so this stays pure.
 */
export function computeMuscleVolume(
  log: LogEntry[],
  resolve: (exerciseId: string) => MuscleSplit | null,
  opts: VolumeOptions = {}
): VolumeResult {
  const secW = opts.secondaryWeight ?? 0.5;
  const cutoff =
    opts.sinceDays != null ? Date.now() - opts.sinceDays * 24 * 60 * 60 * 1000 : null;

  const byMuscle: Partial<Record<MuscleSlug, number>> = {};

  for (const entry of log) {
    if (cutoff != null) {
      const t = new Date(entry.date).getTime();
      if (Number.isNaN(t) || t < cutoff) continue;
    }
    const split = resolve(entry.exerciseId);
    if (!split) continue;

    const vol = entry.sets.reduce((sum, set) => {
      const load = set.weight > 0 ? set.weight : opts.bodyweightRepsProxy ? 1 : 0;
      return sum + set.reps * load;
    }, 0);
    if (vol <= 0) continue;

    const { primary, secondary } = split;
    const weightSum = primary.length + secondary.length * secW;
    if (weightSum <= 0) continue;

    const unit = vol / weightSum;
    for (const m of primary) byMuscle[m] = (byMuscle[m] ?? 0) + unit;
    for (const m of secondary) byMuscle[m] = (byMuscle[m] ?? 0) + unit * secW;
  }

  let max = 0;
  let total = 0;
  for (const k of Object.keys(byMuscle) as MuscleSlug[]) {
    const v = byMuscle[k] ?? 0;
    if (v > max) max = v;
    total += v;
  }
  return { byMuscle, max, total };
}
