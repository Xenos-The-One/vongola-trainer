// Vongola Trainer — strength math helpers.
//
// e1RM (estimated 1-rep max) lets a 100kg × 5 result count as a "rep PR"
// against a previous 100kg × 3, even though the raw weight is identical.
// Without this, only top-weight matters and the user gets no PR feedback
// from progress within a rep range.
//
// Epley formula: e1RM = weight × (1 + reps / 30). Standard, simple, and
// matches what every lifting app (Strong, Hevy, RP) uses by default.

export interface RepSet {
  reps: number;
  weight: number;
}

/** Epley e1RM. Returns 0 when either input is non-positive. */
export function e1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return weight * (1 + reps / 30);
}

/** Pick the set with the highest e1RM; null if no qualifying set. */
export function bestE1RMSet(sets: RepSet[]): RepSet | null {
  let best: RepSet | null = null;
  let bestScore = 0;
  for (const s of sets) {
    const score = e1RM(s.weight, s.reps);
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
}
