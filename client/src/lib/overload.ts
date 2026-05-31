// Vongola Trainer — progressive overload suggestion.
//
// Double-progression: when the top of the target rep range was hit last time,
// bump the weight one step and reset reps to the BOTTOM of the range. When
// you're still inside the range, suggest +1 rep at the same weight. This is
// the simplest scheme that actually progresses — without it, prefilling from
// "last time" lets a user plateau silently forever.

import { parseFirstRep } from './lastPerformance';

export interface LoadSuggestion {
  reps: number;
  weight: number;
}

/** Parse "8-12" → [8, 12]; "5" → [5, 5]; "AMRAP" → [10, 10]; "30-60s" → [30, 60]. */
export function parseRepRange(reps: string): [number, number] {
  const nums = reps.match(/\d+/g);
  if (!nums || nums.length === 0) return [10, 10];
  if (nums.length === 1) {
    const n = Number(nums[0]);
    return [n, n];
  }
  return [Number(nums[0]), Number(nums[1])];
}

/**
 * Suggest the next prefilled (reps, weight) for one set.
 *
 * @param lastSet  what they did last time for this set (null on first session)
 * @param repsTarget  the exercise's target reps string ("8-12")
 * @param weightStep  smallest weight increment (default 2.5 — pair of 1.25 plates)
 * @param fallbackWeight  initial target weight if no history (ex.targetWeight)
 */
export function suggestNextLoad(
  lastSet: { reps: number; weight: number } | null | undefined,
  repsTarget: string,
  weightStep = 2.5,
  fallbackWeight = 0,
): LoadSuggestion {
  const [bottom, top] = parseRepRange(repsTarget);

  if (!lastSet) {
    return { reps: parseFirstRep(repsTarget), weight: fallbackWeight };
  }

  const { reps, weight } = lastSet;

  // Bodyweight / no-weight exercise: progress reps only.
  if (weight <= 0) {
    return { reps: Math.max(reps + 1, bottom), weight: 0 };
  }

  // Top of range hit (or exceeded) — bump weight, reset to bottom of range.
  if (reps >= top) {
    return { reps: bottom, weight: weight + weightStep };
  }

  // Inside the range — add a rep at the same weight.
  return { reps: reps + 1, weight };
}
