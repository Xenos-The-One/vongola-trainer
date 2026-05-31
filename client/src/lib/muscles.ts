// Vongola Trainer — Canonical Muscle Taxonomy
// Single source of truth shared by the exercise library, the volume/heatmap
// math, and the (future) anatomical MuscleMap SVG (path ids === these slugs).

export const MUSCLE_SLUGS = [
  'chest',
  'front-deltoids',
  'back-deltoids',
  'trapezius',
  'upper-back',
  'lats',
  'lower-back',
  'biceps',
  'triceps',
  'forearm',
  'abs',
  'obliques',
  'quadriceps',
  'hamstring',
  'gluteal',
  'adductor',
  'abductors',
  'calves',
  'neck',
] as const;

export type MuscleSlug = (typeof MUSCLE_SLUGS)[number];

/** Non-anatomical bucket — mobility / breathing / recovery work that must never shade the body. */
export const NON_ANATOMICAL = 'mobility' as const;
export type MuscleTag = MuscleSlug | typeof NON_ANATOMICAL;

const MUSCLE_SLUG_SET: ReadonlySet<string> = new Set(MUSCLE_SLUGS);

export function isMuscleSlug(value: string): value is MuscleSlug {
  return MUSCLE_SLUG_SET.has(value);
}

/** Pretty labels for chart ticks, pickers, and the heatmap legend. */
export const MUSCLE_DISPLAY: Record<MuscleSlug, string> = {
  chest: 'Chest',
  'front-deltoids': 'Front Delts',
  'back-deltoids': 'Rear Delts',
  trapezius: 'Traps',
  'upper-back': 'Upper Back',
  lats: 'Lats',
  'lower-back': 'Lower Back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearm: 'Forearms',
  abs: 'Abs',
  obliques: 'Obliques',
  quadriceps: 'Quads',
  hamstring: 'Hamstrings',
  gluteal: 'Glutes',
  adductor: 'Adductors',
  abductors: 'Abductors',
  calves: 'Calves',
  neck: 'Neck',
};

/** UI grouping for pickers / generator targets. */
export const MUSCLE_GROUPS: Record<string, MuscleSlug[]> = {
  Chest: ['chest'],
  Back: ['lats', 'upper-back', 'lower-back', 'trapezius'],
  Shoulders: ['front-deltoids', 'back-deltoids'],
  Arms: ['biceps', 'triceps', 'forearm'],
  Core: ['abs', 'obliques'],
  Legs: ['quadriceps', 'hamstring', 'gluteal', 'adductor', 'abductors', 'calves'],
  Neck: ['neck'],
};

/**
 * Maps legacy free-text muscle strings (from the original seed) to canonical
 * slugs — or to the mobility bucket. Used by the v2→v3 store migration and as a
 * runtime safety net. Anything not listed (and not already a slug) resolves to null.
 */
export const MUSCLE_NORMALIZE: Record<string, MuscleTag> = {
  back: 'lats',
  'upper back': 'upper-back',
  'lower back': 'lower-back',
  lats: 'lats',
  traps: 'trapezius',
  thoracic: 'upper-back',
  'rear delts': 'back-deltoids',
  'rear delt': 'back-deltoids',
  shoulders: 'front-deltoids',
  shoulder: 'front-deltoids',
  delts: 'front-deltoids',
  chest: 'chest',
  pecs: 'chest',
  biceps: 'biceps',
  triceps: 'triceps',
  forearm: 'forearm',
  forearms: 'forearm',
  grip: 'forearm',
  core: 'abs',
  abs: 'abs',
  obliques: 'obliques',
  quads: 'quadriceps',
  quadriceps: 'quadriceps',
  hamstrings: 'hamstring',
  hamstring: 'hamstring',
  glutes: 'gluteal',
  gluteal: 'gluteal',
  hips: 'gluteal',
  adductors: 'adductor',
  adductor: 'adductor',
  abductors: 'abductors',
  calves: 'calves',
  neck: 'neck',
  // mobility / recovery — explicitly non-anatomical
  spine: NON_ANATOMICAL,
  posture: NON_ANATOMICAL,
  recovery: NON_ANATOMICAL,
  wrists: NON_ANATOMICAL,
  'hip flexors': NON_ANATOMICAL,
  mobility: NON_ANATOMICAL,
};

/** Normalize one raw muscle string to a canonical tag, or null if unrecognized. */
export function normalizeMuscle(raw: string): MuscleTag | null {
  const key = raw.trim().toLowerCase();
  if (key === NON_ANATOMICAL) return NON_ANATOMICAL;
  if (isMuscleSlug(key)) return key;
  return MUSCLE_NORMALIZE[key] ?? null;
}

/**
 * Normalize a list of raw muscle strings to canonical anatomical slugs.
 * Drops the mobility bucket and unrecognized entries, and de-dupes — so a
 * pure-mobility exercise ends up with an empty array (the "no body shading" signal).
 */
export function normalizeMuscles(raw: string[]): MuscleSlug[] {
  const out: MuscleSlug[] = [];
  for (const r of raw) {
    const tag = normalizeMuscle(r);
    if (tag && tag !== NON_ANATOMICAL && !out.includes(tag)) out.push(tag);
  }
  return out;
}
