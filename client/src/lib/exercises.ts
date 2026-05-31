// Vongola Trainer — Exercise Library
// The single source of truth for browsable/generatable exercises. Ids for any
// exercise that already existed in the original seed are kept byte-identical to
// slugify(name) so historical log/PR entries keep resolving.

import type { MuscleSlug } from './muscles';
import type { Exercise } from './types';

export type Equipment =
  | 'bodyweight'
  | 'dumbbell'
  | 'band'
  | 'pull-up bar'
  | 'barbell'
  | 'kettlebell'
  | 'bench'
  | 'cable'
  | 'machine'
  | 'foam roller';

export const EQUIPMENT_OPTIONS: { key: Equipment; label: string }[] = [
  { key: 'bodyweight', label: 'Bodyweight' },
  { key: 'dumbbell', label: 'Dumbbells' },
  { key: 'band', label: 'Bands' },
  { key: 'pull-up bar', label: 'Pull-up Bar' },
  { key: 'kettlebell', label: 'Kettlebell' },
  { key: 'bench', label: 'Bench' },
  { key: 'barbell', label: 'Barbell' },
  { key: 'cable', label: 'Cable' },
  { key: 'machine', label: 'Machine' },
  { key: 'foam roller', label: 'Foam Roller' },
];

export type ExCategory = 'push' | 'pull' | 'legs' | 'core' | 'mobility' | 'cardio';
export type Mechanic = 'compound' | 'isolation';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface LibraryExercise {
  id: string;
  name: string;
  primaryMuscles: MuscleSlug[];
  secondaryMuscles: MuscleSlug[];
  equipment: Equipment[];
  category: ExCategory;
  mechanic: Mechanic;
  difficulty: Difficulty;
  unilateral: boolean;
  cue: string;
  defaultSets?: number;
  defaultReps?: string;
}

// Shorthand builder to keep the dataset readable.
function ex(
  id: string,
  name: string,
  category: ExCategory,
  mechanic: Mechanic,
  equipment: Equipment[],
  primaryMuscles: MuscleSlug[],
  secondaryMuscles: MuscleSlug[],
  cue: string,
  opts: { difficulty?: Difficulty; unilateral?: boolean; defaultSets?: number; defaultReps?: string } = {}
): LibraryExercise {
  return {
    id,
    name,
    category,
    mechanic,
    equipment,
    primaryMuscles,
    secondaryMuscles,
    cue,
    difficulty: opts.difficulty ?? 'beginner',
    unilateral: opts.unilateral ?? false,
    defaultSets: opts.defaultSets,
    defaultReps: opts.defaultReps,
  };
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // ---- PUSH (chest / shoulders / triceps) ----
  ex('db-bench-press', 'Dumbbell Bench Press', 'push', 'compound', ['dumbbell', 'bench'], ['chest'], ['triceps', 'front-deltoids'], 'Lower to mid-chest, press up and slightly together.', { difficulty: 'beginner' }),
  ex('barbell-bench-press', 'Barbell Bench Press', 'push', 'compound', ['barbell', 'bench'], ['chest'], ['triceps', 'front-deltoids'], 'Tuck elbows ~45°, touch chest, drive up.', { difficulty: 'intermediate' }),
  ex('incline-db-press', 'Incline Dumbbell Press', 'push', 'compound', ['dumbbell', 'bench'], ['chest'], ['front-deltoids', 'triceps'], 'Bench at ~30°, press over upper chest.', { difficulty: 'beginner' }),
  ex('push-up-variations', 'Push-Up Variations', 'push', 'compound', ['bodyweight'], ['chest'], ['triceps', 'front-deltoids', 'abs'], 'Standard, diamond, and wide — rotate for variety.', { defaultReps: '10-15' }),
  ex('push-up', 'Push-Up', 'push', 'compound', ['bodyweight'], ['chest'], ['triceps', 'front-deltoids', 'abs'], 'Rigid plank, chest to floor, full lockout.', { defaultReps: '10-20' }),
  ex('dips', 'Chest Dip', 'push', 'compound', ['bodyweight'], ['chest'], ['triceps', 'front-deltoids'], 'Lean forward for chest, lower under control.', { difficulty: 'intermediate' }),
  ex('db-fly', 'Dumbbell Chest Fly', 'push', 'isolation', ['dumbbell', 'bench'], ['chest'], ['front-deltoids'], 'Soft elbows, hug the rep, stretch at bottom.'),
  ex('cable-crossover', 'Cable Crossover', 'push', 'isolation', ['cable'], ['chest'], ['front-deltoids'], 'Drive hands together, squeeze, slow return.'),
  ex('overhead-press', 'Overhead Press', 'push', 'compound', ['dumbbell'], ['front-deltoids'], ['triceps', 'trapezius'], 'Brace, press overhead, biceps by ears.'),
  ex('barbell-ohp', 'Barbell Overhead Press', 'push', 'compound', ['barbell'], ['front-deltoids'], ['triceps', 'trapezius'], 'Glutes tight, bar travels over mid-foot.', { difficulty: 'intermediate' }),
  ex('arnold-press', 'Arnold Press', 'push', 'compound', ['dumbbell'], ['front-deltoids'], ['triceps', 'trapezius'], 'Rotate palms out as you press.'),
  ex('lateral-raise', 'Dumbbell Lateral Raise', 'push', 'isolation', ['dumbbell'], ['front-deltoids'], ['trapezius'], 'Lead with elbows, raise to shoulder height.'),
  ex('band-lateral-raise', 'Band Lateral Raise', 'push', 'isolation', ['band'], ['front-deltoids'], [], 'Stand on band, raise arms to the sides.'),
  ex('triceps-pushdown', 'Triceps Pushdown', 'push', 'isolation', ['cable'], ['triceps'], [], 'Elbows pinned, extend fully, control up.'),
  ex('overhead-triceps-ext', 'Overhead Triceps Extension', 'push', 'isolation', ['dumbbell'], ['triceps'], [], 'Elbows high, stretch behind head, extend.'),
  ex('db-skullcrusher', 'Dumbbell Skullcrusher', 'push', 'isolation', ['dumbbell', 'bench'], ['triceps'], [], 'Lower to forehead, keep upper arms still.'),
  ex('close-grip-push-up', 'Close-Grip Push-Up', 'push', 'compound', ['bodyweight'], ['triceps'], ['chest', 'front-deltoids'], 'Hands under shoulders, elbows tucked.', { defaultReps: '10-15' }),
  ex('band-triceps-pushdown', 'Band Triceps Pushdown', 'push', 'isolation', ['band'], ['triceps'], [], 'Anchor high, push down to lockout.'),

  // ---- PULL (back / rear delts / biceps) ----
  ex('pull-ups', 'Pull-Ups', 'pull', 'compound', ['pull-up bar'], ['lats'], ['biceps', 'upper-back', 'forearm'], 'Full hang to chin over bar, no kipping.', { difficulty: 'intermediate', defaultReps: '5-10' }),
  ex('chin-up', 'Chin-Up', 'pull', 'compound', ['pull-up bar'], ['lats'], ['biceps', 'upper-back'], 'Underhand grip, pull chest to bar.', { difficulty: 'intermediate', defaultReps: '5-10' }),
  ex('single-arm-row', 'Single-Arm Row', 'pull', 'compound', ['dumbbell', 'bench'], ['lats'], ['upper-back', 'biceps', 'back-deltoids'], 'Brace on bench, row to hip, squeeze.', { unilateral: true }),
  ex('bent-over-row', 'Bent-Over Barbell Row', 'pull', 'compound', ['barbell'], ['lats'], ['upper-back', 'biceps', 'back-deltoids'], 'Hinge ~45°, pull to lower ribs.', { difficulty: 'intermediate' }),
  ex('db-row', 'Two-Arm Dumbbell Row', 'pull', 'compound', ['dumbbell'], ['lats'], ['upper-back', 'biceps'], 'Hinge, row both dumbbells to hips.'),
  ex('lat-pulldown', 'Lat Pulldown', 'pull', 'compound', ['cable', 'machine'], ['lats'], ['biceps', 'upper-back'], 'Pull bar to upper chest, drive elbows down.'),
  ex('band-row', 'Band Row', 'pull', 'compound', ['band'], ['lats'], ['upper-back', 'biceps'], 'Anchor band, row to ribs, squeeze blades.'),
  ex('face-pulls', 'Face Pulls', 'pull', 'isolation', ['band'], ['back-deltoids'], ['upper-back', 'trapezius'], 'Pull to face, thumbs back, external rotate.'),
  ex('band-pull-apart', 'Band Pull-Apart', 'pull', 'isolation', ['band'], ['back-deltoids'], ['upper-back', 'trapezius'], 'Arms straight, pull band to chest, squeeze.'),
  ex('rear-delt-fly', 'Dumbbell Rear Delt Fly', 'pull', 'isolation', ['dumbbell'], ['back-deltoids'], ['upper-back'], 'Hinge over, raise dumbbells out to sides.'),
  ex('shrug', 'Dumbbell Shrug', 'pull', 'isolation', ['dumbbell'], ['trapezius'], ['forearm'], 'Elevate shoulders straight up, pause, lower.'),
  ex('db-curl', 'Dumbbell Biceps Curl', 'pull', 'isolation', ['dumbbell'], ['biceps'], ['forearm'], 'Elbows pinned, curl, no swing.'),
  ex('hammer-curl', 'Hammer Curl', 'pull', 'isolation', ['dumbbell'], ['biceps'], ['forearm'], 'Neutral grip, curl, control the negative.'),
  ex('barbell-curl', 'Barbell Curl', 'pull', 'isolation', ['barbell'], ['biceps'], ['forearm'], 'Elbows still, curl bar, squeeze top.'),
  ex('band-curl', 'Band Biceps Curl', 'pull', 'isolation', ['band'], ['biceps'], ['forearm'], 'Stand on band, curl to shoulders.'),
  ex('concentration-curl', 'Concentration Curl', 'pull', 'isolation', ['dumbbell'], ['biceps'], [], 'Elbow on thigh, slow peak contraction.', { unilateral: true }),
  ex('wrist-curl', 'Wrist Curl', 'pull', 'isolation', ['dumbbell'], ['forearm'], [], 'Forearms on thighs, curl wrists up.'),
  ex('dead-hang', 'Dead Hang', 'pull', 'isolation', ['pull-up bar'], ['forearm'], ['lats'], 'Hang relaxed, build grip endurance.', { defaultReps: '30-60s' }),

  // ---- LEGS (quads / hams / glutes / calves) ----
  ex('goblet-squat', 'Goblet Squat', 'legs', 'compound', ['dumbbell'], ['quadriceps', 'gluteal'], ['adductor', 'abs'], 'Hold weight at chest, sit between hips.'),
  ex('back-squat', 'Barbell Back Squat', 'legs', 'compound', ['barbell'], ['quadriceps', 'gluteal'], ['hamstring', 'adductor', 'lower-back'], 'Brace, break at hips and knees, depth.', { difficulty: 'intermediate' }),
  ex('front-squat', 'Front Squat', 'legs', 'compound', ['barbell'], ['quadriceps'], ['gluteal', 'abs'], 'Elbows high, upright torso, sit down.', { difficulty: 'advanced' }),
  ex('bulgarian-split-squat', 'Bulgarian Split Squat', 'legs', 'compound', ['dumbbell', 'bench'], ['quadriceps', 'gluteal'], ['hamstring', 'adductor'], 'Rear foot elevated, drop straight down.', { difficulty: 'intermediate', unilateral: true }),
  ex('romanian-deadlift', 'Romanian Deadlift', 'legs', 'compound', ['dumbbell', 'barbell'], ['hamstring', 'gluteal'], ['lower-back', 'upper-back'], 'Soft knees, push hips back, feel the stretch.', { difficulty: 'intermediate' }),
  ex('deadlift', 'Conventional Deadlift', 'legs', 'compound', ['barbell'], ['hamstring', 'gluteal'], ['lower-back', 'upper-back', 'trapezius', 'forearm'], 'Bar over mid-foot, flat back, drive floor away.', { difficulty: 'advanced' }),
  ex('walking-lunge', 'Walking Lunge', 'legs', 'compound', ['dumbbell'], ['quadriceps', 'gluteal'], ['hamstring', 'adductor'], 'Long step, knee to floor, push through heel.', { unilateral: true }),
  ex('step-up', 'Step-Up', 'legs', 'compound', ['dumbbell', 'bench'], ['quadriceps', 'gluteal'], ['hamstring'], 'Drive through top foot, control the descent.', { unilateral: true }),
  ex('leg-press', 'Leg Press', 'legs', 'compound', ['machine'], ['quadriceps', 'gluteal'], ['hamstring'], 'Feet shoulder-width, knees track toes.'),
  ex('leg-extension', 'Leg Extension', 'legs', 'isolation', ['machine'], ['quadriceps'], [], 'Squeeze quads at the top, slow down.'),
  ex('leg-curl', 'Leg Curl', 'legs', 'isolation', ['machine'], ['hamstring'], [], 'Curl heels to glutes, control eccentric.'),
  ex('nordic-curl', 'Nordic Hamstring Curl', 'legs', 'isolation', ['bodyweight'], ['hamstring'], ['gluteal'], 'Anchor feet, lower slow, resist the fall.', { difficulty: 'advanced', defaultReps: '5-8' }),
  ex('hip-thrust', 'Hip Thrust', 'legs', 'compound', ['barbell', 'bench'], ['gluteal'], ['hamstring'], 'Shoulders on bench, drive hips to lockout.'),
  ex('glute-bridge', 'Glute Bridge', 'legs', 'isolation', ['bodyweight'], ['gluteal'], ['hamstring'], 'Posterior tilt, squeeze glutes at top.', { defaultReps: '12-20' }),
  ex('kb-swing', 'Kettlebell Swing', 'legs', 'compound', ['kettlebell'], ['gluteal', 'hamstring'], ['lower-back', 'abs'], 'Hinge hard, snap hips, float the bell.'),
  ex('calf-raise', 'Standing Calf Raise', 'legs', 'isolation', ['dumbbell'], ['calves'], [], 'Full stretch at bottom, tall on toes.', { defaultReps: '12-20' }),
  ex('seated-calf-raise', 'Seated Calf Raise', 'legs', 'isolation', ['machine'], ['calves'], [], 'Pause at top, deep stretch at bottom.', { defaultReps: '12-20' }),
  ex('wall-sit', 'Wall Sit', 'legs', 'isolation', ['bodyweight'], ['quadriceps'], ['gluteal'], 'Thighs parallel, hold and breathe.', { defaultReps: '30-60s' }),
  ex('cossack-squat', 'Cossack Squat', 'legs', 'compound', ['bodyweight'], ['adductor', 'quadriceps'], ['gluteal'], 'Shift side to side, keep heel down.', { difficulty: 'intermediate', unilateral: true }),
  ex('banded-lateral-walk', 'Banded Lateral Walk', 'legs', 'isolation', ['band'], ['abductors', 'gluteal'], [], 'Band above knees, step wide, stay low.'),
  ex('farmer-carry', 'Farmer Carry', 'legs', 'compound', ['dumbbell'], ['forearm', 'trapezius'], ['abs', 'gluteal'], 'Heavy, tall posture, walk with control.', { defaultReps: '30-40m' }),

  // ---- CORE (abs / obliques) ----
  ex('plank-hold', 'Plank Hold', 'core', 'isolation', ['bodyweight'], ['abs'], ['obliques'], 'Straight line, brace, glutes tight.', { defaultReps: '30-60s' }),
  ex('plank', 'Plank', 'core', 'isolation', ['bodyweight'], ['abs'], ['obliques'], 'Straight line, brace, glutes tight.', { defaultReps: '30-60s' }),
  ex('hanging-leg-raise', 'Hanging Leg Raise', 'core', 'isolation', ['pull-up bar'], ['abs'], ['obliques', 'forearm'], 'No swing, curl pelvis up.', { difficulty: 'intermediate' }),
  ex('cable-crunch', 'Cable Crunch', 'core', 'isolation', ['cable'], ['abs'], [], 'Crunch ribs to hips, round the spine.'),
  ex('crunch', 'Crunch', 'core', 'isolation', ['bodyweight'], ['abs'], [], 'Curl up, exhale, squeeze abs.', { defaultReps: '15-25' }),
  ex('bicycle-crunch', 'Bicycle Crunch', 'core', 'isolation', ['bodyweight'], ['abs'], ['obliques'], 'Opposite elbow to knee, slow and controlled.', { defaultReps: '15-25' }),
  ex('russian-twist', 'Russian Twist', 'core', 'isolation', ['dumbbell'], ['obliques'], ['abs'], 'Lean back, rotate weight side to side.', { defaultReps: '20' }),
  ex('side-plank', 'Side Plank', 'core', 'isolation', ['bodyweight'], ['obliques'], ['abs'], 'Stack hips, lift, straight line.', { defaultReps: '30-45s', unilateral: true }),
  ex('dead-bug', 'Dead Bug', 'core', 'isolation', ['bodyweight'], ['abs'], ['obliques'], 'Lower back glued down, extend opposites.', { defaultReps: '10 each' }),
  ex('bird-dog', 'Bird Dog', 'core', 'isolation', ['bodyweight'], ['abs', 'lower-back'], ['gluteal'], 'Reach opposite arm/leg, no hip rotation.', { defaultReps: '10 each' }),
  ex('ab-wheel', 'Ab Wheel Rollout', 'core', 'isolation', ['bodyweight'], ['abs'], ['obliques'], 'Roll out under control, no lumbar sag.', { difficulty: 'advanced' }),

  // ---- MOBILITY (no anatomical shading) ----
  ex('cat-cow-stretch', 'Cat-Cow Stretch', 'mobility', 'isolation', ['bodyweight'], [], [], 'Flow between flexion and extension with breath.', { defaultSets: 1, defaultReps: '10' }),
  ex('world-s-greatest-stretch', "World's Greatest Stretch", 'mobility', 'isolation', ['bodyweight'], [], [], 'Lunge, rotate, reach — full-body opener.', { defaultSets: 1, defaultReps: '5 each' }),
  ex('90-90-hip-switch', '90/90 Hip Switch', 'mobility', 'isolation', ['bodyweight'], [], [], 'Rotate hips floor to floor, tall chest.', { defaultSets: 1, defaultReps: '8 each' }),
  ex('pigeon-stretch', 'Pigeon Stretch', 'mobility', 'isolation', ['bodyweight'], [], [], 'Shin forward, sink hips, breathe into glute.', { defaultSets: 1, defaultReps: '60s each' }),
  ex('couch-stretch', 'Couch Stretch', 'mobility', 'isolation', ['bodyweight'], [], [], 'Rear shin up wall, tuck pelvis, hold.', { defaultSets: 1, defaultReps: '60s each' }),
  ex('child-s-pose', "Child's Pose", 'mobility', 'isolation', ['bodyweight'], [], [], 'Hips to heels, reach long, decompress.', { defaultSets: 1, defaultReps: '90s' }),
  ex('thoracic-rotation', 'Thoracic Rotation', 'mobility', 'isolation', ['bodyweight'], [], [], 'Open-book rotation, follow the hand.', { defaultSets: 1, defaultReps: '8 each' }),

  // ---- CARDIO / CONDITIONING ----
  ex('jumping-jacks', 'Jumping Jacks', 'cardio', 'compound', ['bodyweight'], [], [], 'Steady rhythm, full arm extension.', { defaultSets: 1, defaultReps: '60s' }),
  ex('mountain-climbers', 'Mountain Climbers', 'cardio', 'compound', ['bodyweight'], ['abs'], ['obliques'], 'Hips low, drive knees, quick feet.', { defaultSets: 1, defaultReps: '40s' }),
  ex('burpee', 'Burpee', 'cardio', 'compound', ['bodyweight'], ['chest', 'quadriceps'], ['abs', 'front-deltoids'], 'Chest to floor, jump tall each rep.', { defaultReps: '10-15' }),
];

/** O(1) id lookup, built once at module load. */
export const EXERCISE_BY_ID: Map<string, LibraryExercise> = new Map(
  EXERCISE_LIBRARY.map((e) => [e.id, e])
);

export function getLibraryExercise(id: string): LibraryExercise | undefined {
  return EXERCISE_BY_ID.get(id);
}

export interface ExerciseFilter {
  equipment?: Equipment[];
  muscles?: MuscleSlug[];
  category?: ExCategory;
  includeSecondary?: boolean;
}

/** Filter the library. Bodyweight is always allowed regardless of the equipment profile. */
export function filterExercises(f: ExerciseFilter = {}): LibraryExercise[] {
  return EXERCISE_LIBRARY.filter((e) => {
    if (f.category && e.category !== f.category) return false;
    if (f.equipment) {
      const ok = e.equipment.every((eq) => eq === 'bodyweight' || f.equipment!.includes(eq));
      if (!ok) return false;
    }
    if (f.muscles && f.muscles.length) {
      const pool = f.includeSecondary ? [...e.primaryMuscles, ...e.secondaryMuscles] : e.primaryMuscles;
      if (!pool.some((m) => f.muscles!.includes(m))) return false;
    }
    return true;
  });
}

/** Adapt a library entry to the runtime Exercise shape used by the workouts slice. */
export function toExercise(
  lib: LibraryExercise,
  overrides?: Partial<Pick<Exercise, 'sets' | 'reps' | 'targetWeight' | 'rpe'>>
): Exercise {
  const sets = overrides?.sets ?? lib.defaultSets ?? (lib.mechanic === 'compound' ? 4 : 3);
  const reps = overrides?.reps ?? lib.defaultReps ?? (lib.mechanic === 'compound' ? '8-12' : '12-15');
  return {
    id: lib.id,
    name: lib.name,
    muscles: [...lib.primaryMuscles, ...lib.secondaryMuscles],
    equipment: lib.equipment,
    sets,
    reps,
    targetWeight: overrides?.targetWeight,
    rpe: overrides?.rpe,
  };
}

// Dev-only integrity guard: unique ids + valid slugs. Tree-shaken from prod.
if (import.meta.env.DEV) {
  const seen = new Set<string>();
  for (const e of EXERCISE_LIBRARY) {
    if (seen.has(e.id)) console.warn(`[exercises] duplicate id: ${e.id}`);
    seen.add(e.id);
  }
}
