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
  /** One-line coaching cue. */
  cue: string;
  /** Step-by-step setup → execution → how to actually hit the target muscle. */
  instructions: string[];
  /** Optional curated YouTube video id (enables an embedded thumbnail). */
  videoId?: string;
  defaultSets?: number;
  defaultReps?: string;
}

interface ExOpts {
  difficulty?: Difficulty;
  unilateral?: boolean;
  defaultSets?: number;
  defaultReps?: string;
  videoId?: string;
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
  instructions: string[],
  opts: ExOpts = {}
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
    instructions,
    difficulty: opts.difficulty ?? 'beginner',
    unilateral: opts.unilateral ?? false,
    defaultSets: opts.defaultSets,
    defaultReps: opts.defaultReps,
    videoId: opts.videoId,
  };
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  // ---- PUSH (chest / shoulders / triceps) ----
  ex('db-bench-press', 'Dumbbell Bench Press', 'push', 'compound', ['dumbbell', 'bench'], ['chest'], ['triceps', 'front-deltoids'],
    'Lower to mid-chest, press up and slightly together.',
    ['Lie back with a dumbbell in each hand at chest level, feet planted, shoulder blades pinned down and back.',
     'Press both dumbbells up and slightly together until your arms are extended, wrists stacked over elbows.',
     'Lower under control to a deep chest stretch. Drive with the chest — "push the floor away" through your pecs, not your shoulders.']),
  ex('barbell-bench-press', 'Barbell Bench Press', 'push', 'compound', ['barbell', 'bench'], ['chest'], ['triceps', 'front-deltoids'],
    'Tuck elbows ~45°, touch chest, drive up.',
    ['Grip just outside shoulder width, pin your shoulder blades, and unrack with arms locked.',
     'Lower the bar to your lower chest with elbows tucked to about 45 degrees.',
     'Press back up over your shoulders. Keep your upper back tight so force goes through the chest.'],
    { difficulty: 'intermediate' }),
  ex('incline-db-press', 'Incline Dumbbell Press', 'push', 'compound', ['dumbbell', 'bench'], ['chest'], ['front-deltoids', 'triceps'],
    'Bench at ~30°, press over upper chest.',
    ['Set the bench to about 30 degrees and bring dumbbells to your upper-chest line.',
     'Press up and together over your collarbones until arms extend.',
     'Lower slowly to stretch the upper chest — keep tension on the pecs, not the front delts.']),
  ex('push-up-variations', 'Push-Up Variations', 'push', 'compound', ['bodyweight'], ['chest'], ['triceps', 'front-deltoids', 'abs'],
    'Standard, diamond, and wide — rotate for variety.',
    ['Start in a rigid plank, hands under or just outside your shoulders.',
     'Lower your chest to the floor with elbows tracking back, not flared.',
     'Press to full lockout. Vary hand width (standard / diamond / wide) to shift emphasis across the chest and triceps.'],
    { defaultReps: '10-15' }),
  ex('push-up', 'Push-Up', 'push', 'compound', ['bodyweight'], ['chest'], ['triceps', 'front-deltoids', 'abs'],
    'Rigid plank, chest to floor, full lockout.',
    ['Hands under your shoulders, body in one straight line, brace your abs and glutes.',
     'Lower your chest toward the floor, elbows ~45 degrees from your sides.',
     'Push the floor away to full lockout, squeezing your chest at the top.'],
    { defaultReps: '10-20' }),
  ex('dips', 'Chest Dip', 'push', 'compound', ['bodyweight'], ['chest'], ['triceps', 'front-deltoids'],
    'Lean forward for chest, lower under control.',
    ['Support yourself on parallel bars, arms locked.',
     'Lean your torso forward and lower until you feel a stretch across the lower chest.',
     'Press back up. Staying upright shifts work to triceps; leaning forward targets the chest.'],
    { difficulty: 'intermediate' }),
  ex('db-fly', 'Dumbbell Chest Fly', 'push', 'isolation', ['dumbbell', 'bench'], ['chest'], ['front-deltoids'],
    'Soft elbows, hug the rep, stretch at bottom.',
    ['Lie on a bench holding dumbbells above your chest, palms facing each other, elbows softly bent.',
     'Open your arms in a wide arc until you feel a chest stretch — keep the elbow angle fixed.',
     'Hug the weights back together over your chest, squeezing the pecs at the top.']),
  ex('cable-crossover', 'Cable Crossover', 'push', 'isolation', ['cable'], ['chest'], ['front-deltoids'],
    'Drive hands together, squeeze, slow return.',
    ['Set pulleys high, stagger your stance, and grab a handle in each hand.',
     'With a slight forward lean and soft elbows, sweep your hands down and together.',
     'Squeeze the chest hard at the bottom, then return slowly under control.']),
  ex('overhead-press', 'Overhead Press', 'push', 'compound', ['dumbbell'], ['front-deltoids'], ['side-deltoids', 'triceps', 'trapezius'],
    'Brace, press overhead, biceps by ears.',
    ['Hold dumbbells at shoulder height, palms forward, brace your core and squeeze your glutes.',
     'Press straight overhead until arms lock, biceps finishing by your ears.',
     'Lower under control to your shoulders without flaring the ribs.']),
  ex('barbell-ohp', 'Barbell Overhead Press', 'push', 'compound', ['barbell'], ['front-deltoids'], ['side-deltoids', 'triceps', 'trapezius'],
    'Glutes tight, bar travels over mid-foot.',
    ['Rack the bar on your front delts, grip just outside shoulders, brace hard.',
     'Press the bar up, moving your head back slightly so the bar clears your chin.',
     'Lock out with the bar over your mid-foot, then lower under control.'],
    { difficulty: 'intermediate' }),
  ex('arnold-press', 'Arnold Press', 'push', 'compound', ['dumbbell'], ['front-deltoids'], ['side-deltoids', 'triceps', 'trapezius'],
    'Rotate palms out as you press.',
    ['Start with dumbbells in front of your shoulders, palms facing you.',
     'As you press up, rotate your palms to face forward.',
     'Reverse the rotation on the way down to keep constant tension on the delts.']),
  ex('lateral-raise', 'Dumbbell Lateral Raise', 'push', 'isolation', ['dumbbell'], ['side-deltoids'], ['trapezius'],
    'Lead with elbows, raise to shoulder height.',
    ['Stand with light dumbbells at your sides, slight bend in the elbows.',
     'Raise your arms out to the sides leading with your elbows, up to shoulder height.',
     'Lower slowly. Imagine pouring water from the dumbbells to bias the side delts.']),
  ex('band-lateral-raise', 'Band Lateral Raise', 'push', 'isolation', ['band'], ['side-deltoids'], [],
    'Stand on band, raise arms to the sides.',
    ['Stand on the middle of a band, a handle in each hand.',
     'Raise your arms out to the sides to shoulder height against the band tension.',
     'Control the return — keep a slight forward lean to hit the side delts.']),
  ex('triceps-pushdown', 'Triceps Pushdown', 'push', 'isolation', ['cable'], ['triceps'], [],
    'Elbows pinned, extend fully, control up.',
    ['Face a high cable with a bar or rope, elbows tucked to your sides.',
     'Extend your arms fully down until elbows lock, squeezing the triceps.',
     'Let the weight rise only to ~90 degrees, keeping your elbows pinned the whole time.']),
  ex('overhead-triceps-ext', 'Overhead Triceps Extension', 'push', 'isolation', ['dumbbell'], ['triceps'], [],
    'Elbows high, stretch behind head, extend.',
    ['Hold one dumbbell overhead with both hands, elbows pointing forward.',
     'Lower the weight behind your head until you feel a triceps stretch.',
     'Extend back to lockout, keeping your upper arms still and elbows high.']),
  ex('db-skullcrusher', 'Dumbbell Skullcrusher', 'push', 'isolation', ['dumbbell', 'bench'], ['triceps'], [],
    'Lower to forehead, keep upper arms still.',
    ['Lie on a bench holding dumbbells above your chest, palms facing each other.',
     'Bend only at the elbows to lower the dumbbells toward your forehead/ears.',
     'Extend back up, keeping your upper arms vertical and fixed.']),
  ex('close-grip-push-up', 'Close-Grip Push-Up', 'push', 'compound', ['bodyweight'], ['triceps'], ['chest', 'front-deltoids'],
    'Hands under shoulders, elbows tucked.',
    ['Set hands close together under your chest, body in a straight plank.',
     'Lower with elbows tucked tight to your sides.',
     'Press up to lockout — the close grip and tucked elbows drive the triceps.'],
    { defaultReps: '10-15' }),
  ex('band-triceps-pushdown', 'Band Triceps Pushdown', 'push', 'isolation', ['band'], ['triceps'], [],
    'Anchor high, push down to lockout.',
    ['Anchor a band overhead and grip it with elbows tucked.',
     'Push down until your arms fully extend, squeezing the triceps.',
     'Return slowly to ~90 degrees without letting your elbows drift.']),

  // ---- PULL (back / rear delts / biceps) ----
  ex('pull-ups', 'Pull-Ups', 'pull', 'compound', ['pull-up bar'], ['lats'], ['biceps', 'upper-back', 'forearm'],
    'Full hang to chin over bar, no kipping.',
    ['Hang from a bar with an overhand grip just wider than shoulders.',
     'Pull your elbows down and back, driving your chest toward the bar until your chin clears it.',
     'Lower to a full hang under control. Think "pull with your back," not just your arms.'],
    { difficulty: 'intermediate', defaultReps: '5-10' }),
  ex('chin-up', 'Chin-Up', 'pull', 'compound', ['pull-up bar'], ['lats'], ['biceps', 'upper-back'],
    'Underhand grip, pull chest to bar.',
    ['Hang from the bar with an underhand (palms-toward-you) shoulder-width grip.',
     'Pull until your chin clears the bar, keeping your chest up.',
     'Lower slowly. The underhand grip brings the biceps in more than a pull-up.'],
    { difficulty: 'intermediate', defaultReps: '5-10' }),
  ex('single-arm-row', 'Single-Arm Row', 'pull', 'compound', ['dumbbell', 'bench'], ['lats'], ['upper-back', 'biceps', 'back-deltoids'],
    'Brace on bench, row to hip, squeeze.',
    ['Brace one hand and knee on a bench, other foot on the floor, dumbbell hanging straight down.',
     'Row the dumbbell to your hip, driving the elbow back and up.',
     'Squeeze your lat and mid-back at the top, then lower with a full stretch.'],
    { unilateral: true }),
  ex('bent-over-row', 'Bent-Over Barbell Row', 'pull', 'compound', ['barbell'], ['lats'], ['upper-back', 'biceps', 'back-deltoids'],
    'Hinge ~45°, pull to lower ribs.',
    ['Hinge at the hips to about 45 degrees, flat back, bar hanging at arms length.',
     'Pull the bar to your lower ribs, leading with the elbows.',
     'Squeeze the shoulder blades together, then lower under control.'],
    { difficulty: 'intermediate' }),
  ex('db-row', 'Two-Arm Dumbbell Row', 'pull', 'compound', ['dumbbell'], ['lats'], ['upper-back', 'biceps'],
    'Hinge, row both dumbbells to hips.',
    ['Hinge forward with a flat back, a dumbbell in each hand hanging down.',
     'Row both dumbbells to your hips, elbows driving back.',
     'Squeeze your back at the top and lower with control.']),
  ex('lat-pulldown', 'Lat Pulldown', 'pull', 'compound', ['cable', 'machine'], ['lats'], ['biceps', 'upper-back'],
    'Pull bar to upper chest, drive elbows down.',
    ['Sit and grip the bar wider than shoulders, thighs anchored.',
     'Pull the bar to your upper chest by driving your elbows down and back.',
     'Control the bar back up to a full stretch — lead with the lats, not the arms.']),
  ex('band-row', 'Band Row', 'pull', 'compound', ['band'], ['lats'], ['upper-back', 'biceps'],
    'Anchor band, row to ribs, squeeze blades.',
    ['Anchor a band at chest height (or loop around your feet seated).',
     'Row the band to your ribs, elbows close to your body.',
     'Squeeze the shoulder blades together, then return slowly.']),
  ex('face-pulls', 'Face Pulls', 'pull', 'isolation', ['band'], ['back-deltoids'], ['upper-back', 'trapezius'],
    'Pull to face, thumbs back, external rotate.',
    ['Anchor a band at face height and hold it with both hands, arms extended.',
     'Pull toward your face, splitting your hands apart and rotating thumbs back.',
     'Squeeze the rear delts and upper back, then return under control.']),
  ex('band-pull-apart', 'Band Pull-Apart', 'pull', 'isolation', ['band'], ['back-deltoids'], ['upper-back', 'trapezius'],
    'Arms straight, pull band to chest, squeeze.',
    ['Hold a band at shoulder height with arms straight in front of you.',
     'Pull the band apart to your chest, keeping arms straight.',
     'Squeeze your shoulder blades together, then return slowly.']),
  ex('rear-delt-fly', 'Dumbbell Rear Delt Fly', 'pull', 'isolation', ['dumbbell'], ['back-deltoids'], ['upper-back'],
    'Hinge over, raise dumbbells out to sides.',
    ['Hinge forward with light dumbbells hanging beneath you, soft elbows.',
     'Raise your arms out to the sides until level with your torso.',
     'Lead with the elbows and squeeze the rear delts — avoid shrugging.']),
  ex('shrug', 'Dumbbell Shrug', 'pull', 'isolation', ['dumbbell'], ['trapezius'], ['forearm'],
    'Elevate shoulders straight up, pause, lower.',
    ['Stand tall with a dumbbell in each hand at your sides.',
     'Elevate your shoulders straight up toward your ears.',
     'Pause and squeeze the traps at the top, then lower fully.']),
  ex('db-curl', 'Dumbbell Biceps Curl', 'pull', 'isolation', ['dumbbell'], ['biceps'], ['forearm'],
    'Elbows pinned, curl, no swing.',
    ['Stand with dumbbells at your sides, palms facing forward.',
     'Curl the weights up by bending only at the elbow — keep elbows pinned to your sides.',
     'Squeeze the biceps at the top, then lower slowly. No swinging.']),
  ex('hammer-curl', 'Hammer Curl', 'pull', 'isolation', ['dumbbell'], ['biceps'], ['forearm'],
    'Neutral grip, curl, control the negative.',
    ['Hold dumbbells with a neutral grip (palms facing each other).',
     'Curl up keeping the neutral grip, elbows fixed.',
     'Lower slowly — this grip hits the biceps and forearms together.']),
  ex('barbell-curl', 'Barbell Curl', 'pull', 'isolation', ['barbell'], ['biceps'], ['forearm'],
    'Elbows still, curl bar, squeeze top.',
    ['Hold a barbell shoulder-width with an underhand grip, elbows at your sides.',
     'Curl the bar up without swinging your torso.',
     'Squeeze the biceps at the top, then lower under control.']),
  ex('band-curl', 'Band Biceps Curl', 'pull', 'isolation', ['band'], ['biceps'], ['forearm'],
    'Stand on band, curl to shoulders.',
    ['Stand on the middle of a band, a handle in each hand, palms forward.',
     'Curl up against the increasing band tension, elbows pinned.',
     'Squeeze at the top and lower slowly.']),
  ex('concentration-curl', 'Concentration Curl', 'pull', 'isolation', ['dumbbell'], ['biceps'], [],
    'Elbow on thigh, slow peak contraction.',
    ['Sit and brace your working elbow against the inside of your thigh.',
     'Curl the dumbbell up to your shoulder, fully isolating the biceps.',
     'Squeeze hard at the top, then lower slowly for a full stretch.'],
    { unilateral: true }),
  ex('wrist-curl', 'Wrist Curl', 'pull', 'isolation', ['dumbbell'], ['forearm'], [],
    'Forearms on thighs, curl wrists up.',
    ['Rest your forearms on your thighs, palms up, dumbbells in hand, wrists past your knees.',
     'Curl the weight up using only your wrists.',
     'Lower for a full stretch — small, controlled range.']),
  ex('dead-hang', 'Dead Hang', 'pull', 'isolation', ['pull-up bar'], ['forearm'], ['lats'],
    'Hang relaxed, build grip endurance.',
    ['Grip a pull-up bar with both hands, shoulder-width.',
     'Hang with arms straight, shoulders slightly engaged (not fully limp).',
     'Hold for time to build grip and decompress the spine.'],
    { defaultReps: '30-60s' }),

  // ---- LEGS (quads / hams / glutes / calves) ----
  ex('goblet-squat', 'Goblet Squat', 'legs', 'compound', ['dumbbell'], ['quadriceps', 'gluteal'], ['adductor', 'abs'],
    'Hold weight at chest, sit between hips.',
    ['Hold one dumbbell vertically against your chest, feet shoulder-width.',
     'Sit straight down between your hips, keeping your chest tall and heels down.',
     'Drive up through mid-foot, squeezing your glutes and quads at the top.']),
  ex('back-squat', 'Barbell Back Squat', 'legs', 'compound', ['barbell'], ['quadriceps', 'gluteal'], ['hamstring', 'adductor', 'lower-back'],
    'Brace, break at hips and knees, depth.',
    ['Set the bar on your upper back, feet shoulder-width, brace your core hard.',
     'Break at the hips and knees together, sitting down to at least parallel.',
     'Drive up through your whole foot, keeping your chest up and knees tracking your toes.'],
    { difficulty: 'intermediate' }),
  ex('front-squat', 'Front Squat', 'legs', 'compound', ['barbell'], ['quadriceps'], ['gluteal', 'abs'],
    'Elbows high, upright torso, sit down.',
    ['Rack the bar across your front delts with elbows pointed high.',
     'Squat straight down keeping your torso as upright as possible.',
     'Drive up — the upright position emphasizes the quads and core.'],
    { difficulty: 'advanced' }),
  ex('bulgarian-split-squat', 'Bulgarian Split Squat', 'legs', 'compound', ['dumbbell', 'bench'], ['quadriceps', 'gluteal'], ['hamstring', 'adductor'],
    'Rear foot elevated, drop straight down.',
    ['Place your rear foot on a bench, front foot a stride ahead, dumbbells at your sides.',
     'Lower straight down until your front thigh is about parallel.',
     'Drive through your front heel. Lean slightly forward to bias glutes, upright for quads.'],
    { difficulty: 'intermediate', unilateral: true }),
  ex('romanian-deadlift', 'Romanian Deadlift', 'legs', 'compound', ['dumbbell', 'barbell'], ['hamstring', 'gluteal'], ['lower-back', 'upper-back'],
    'Soft knees, push hips back, feel the stretch.',
    ['Hold the weight in front of your thighs, soft knees, flat back.',
     'Push your hips straight back, sliding the weight down your legs until you feel a hamstring stretch.',
     'Drive your hips forward to stand tall, squeezing the glutes — keep the bar close.'],
    { difficulty: 'intermediate' }),
  ex('deadlift', 'Conventional Deadlift', 'legs', 'compound', ['barbell'], ['hamstring', 'gluteal'], ['lower-back', 'upper-back', 'trapezius', 'forearm'],
    'Bar over mid-foot, flat back, drive floor away.',
    ['Stand with the bar over your mid-foot, hinge down and grip just outside your knees.',
     'Set a flat back, brace, and take the slack out of the bar.',
     'Drive your feet through the floor and stand tall, locking out with your glutes.'],
    { difficulty: 'advanced' }),
  ex('walking-lunge', 'Walking Lunge', 'legs', 'compound', ['dumbbell'], ['quadriceps', 'gluteal'], ['hamstring', 'adductor'],
    'Long step, knee to floor, push through heel.',
    ['Hold dumbbells at your sides and take a long step forward.',
     'Lower your back knee toward the floor, front shin roughly vertical.',
     'Push through your front heel to step into the next lunge.'],
    { unilateral: true }),
  ex('step-up', 'Step-Up', 'legs', 'compound', ['dumbbell', 'bench'], ['quadriceps', 'gluteal'], ['hamstring'],
    'Drive through top foot, control the descent.',
    ['Stand facing a bench/box with dumbbells at your sides.',
     'Plant one foot fully on the box and drive through that heel to stand up.',
     'Lower under control — avoid pushing off the bottom foot.'],
    { unilateral: true }),
  ex('leg-press', 'Leg Press', 'legs', 'compound', ['machine'], ['quadriceps', 'gluteal'], ['hamstring'],
    'Feet shoulder-width, knees track toes.',
    ['Sit in the machine, feet shoulder-width on the platform.',
     'Lower the platform until your knees reach about 90 degrees.',
     'Press through your whole foot without locking the knees hard at the top.']),
  ex('leg-extension', 'Leg Extension', 'legs', 'isolation', ['machine'], ['quadriceps'], [],
    'Squeeze quads at the top, slow down.',
    ['Sit with the pad on your lower shins, knees at the machine pivot.',
     'Extend your knees until your legs are straight.',
     'Squeeze the quads hard at the top, then lower slowly.']),
  ex('leg-curl', 'Leg Curl', 'legs', 'isolation', ['machine'], ['hamstring'], [],
    'Curl heels to glutes, control eccentric.',
    ['Position the pad on your lower calves (lying or seated).',
     'Curl your heels toward your glutes by contracting the hamstrings.',
     'Squeeze at the end, then lower slowly under control.']),
  ex('nordic-curl', 'Nordic Hamstring Curl', 'legs', 'isolation', ['bodyweight'], ['hamstring'], ['gluteal'],
    'Anchor feet, lower slow, resist the fall.',
    ['Kneel with your ankles anchored under something solid, torso upright.',
     'Keeping a straight line from knees to head, lower yourself forward as slowly as possible.',
     'Resist with your hamstrings the whole way, then push off your hands to return.'],
    { difficulty: 'advanced', defaultReps: '5-8' }),
  ex('hip-thrust', 'Hip Thrust', 'legs', 'compound', ['barbell', 'bench'], ['gluteal'], ['hamstring'],
    'Shoulders on bench, drive hips to lockout.',
    ['Sit with your upper back against a bench, weight across your hips, feet planted.',
     'Drive through your heels to lift your hips until your torso is parallel to the floor.',
     'Squeeze your glutes hard at the top, then lower under control.']),
  ex('glute-bridge', 'Glute Bridge', 'legs', 'isolation', ['bodyweight'], ['gluteal'], ['hamstring'],
    'Posterior tilt, squeeze glutes at top.',
    ['Lie on your back, knees bent, feet flat and close to your glutes.',
     'Tuck your pelvis and drive your hips up by squeezing your glutes.',
     'Pause at the top, then lower slowly without arching your lower back.'],
    { defaultReps: '12-20' }),
  ex('kb-swing', 'Kettlebell Swing', 'legs', 'compound', ['kettlebell'], ['gluteal', 'hamstring'], ['lower-back', 'abs'],
    'Hinge hard, snap hips, float the bell.',
    ['Stand with a kettlebell a foot ahead, hinge and hike it back between your legs.',
     'Snap your hips forward explosively to float the bell to chest height.',
     'Let it fall, absorbing with a hip hinge — the power is hips, not arms.']),
  ex('calf-raise', 'Standing Calf Raise', 'legs', 'isolation', ['dumbbell'], ['calves'], [],
    'Full stretch at bottom, tall on toes.',
    ['Stand tall, optionally with the balls of your feet on a small step, dumbbell in hand.',
     'Rise as high as possible onto your toes.',
     'Pause at the top, then lower for a deep calf stretch.'],
    { defaultReps: '12-20' }),
  ex('seated-calf-raise', 'Seated Calf Raise', 'legs', 'isolation', ['machine'], ['calves'], [],
    'Pause at top, deep stretch at bottom.',
    ['Sit with the pad over your knees and the balls of your feet on the platform.',
     'Push up onto your toes as high as possible.',
     'Pause, then lower slowly for a full stretch.'],
    { defaultReps: '12-20' }),
  ex('wall-sit', 'Wall Sit', 'legs', 'isolation', ['bodyweight'], ['quadriceps'], ['gluteal'],
    'Thighs parallel, hold and breathe.',
    ['Press your back flat against a wall and slide down until your thighs are parallel to the floor.',
     'Keep your knees over your ankles and weight in your heels.',
     'Hold the position and breathe — the quads do the work.'],
    { defaultReps: '30-60s' }),
  ex('cossack-squat', 'Cossack Squat', 'legs', 'compound', ['bodyweight'], ['adductor', 'quadriceps'], ['gluteal'],
    'Shift side to side, keep heel down.',
    ['Stand wide, then shift your weight over one bent leg, other leg straight.',
     'Sink as low as mobility allows, keeping the working heel down.',
     'Push back to center and shift to the other side — feel the inner thigh stretch.'],
    { difficulty: 'intermediate', unilateral: true }),
  ex('banded-lateral-walk', 'Banded Lateral Walk', 'legs', 'isolation', ['band'], ['abductors', 'gluteal'], [],
    'Band above knees, step wide, stay low.',
    ['Loop a band just above your knees, drop into a quarter-squat.',
     'Step sideways, keeping tension on the band and feet pointing forward.',
     'Take controlled steps both directions — feel the outer glutes.']),
  ex('farmer-carry', 'Farmer Carry', 'legs', 'compound', ['dumbbell'], ['forearm', 'trapezius'], ['abs', 'gluteal'],
    'Heavy, tall posture, walk with control.',
    ['Pick up a heavy dumbbell in each hand, stand tall with shoulders back.',
     'Brace your core and walk with controlled steps, resisting any lean.',
     'Keep your grip tight and posture upright for the full distance.'],
    { defaultReps: '30-40m' }),

  // ---- CORE (abs / obliques) ----
  ex('plank-hold', 'Plank Hold', 'core', 'isolation', ['bodyweight'], ['abs'], ['obliques'],
    'Straight line, brace, glutes tight.',
    ['Set forearms under your shoulders, body in one straight line from head to heels.',
     'Brace your abs hard and squeeze your glutes — no sagging or piking.',
     'Breathe steadily and hold for time.'],
    { defaultReps: '30-60s' }),
  ex('plank', 'Plank', 'core', 'isolation', ['bodyweight'], ['abs'], ['obliques'],
    'Straight line, brace, glutes tight.',
    ['Forearms under shoulders, body in a straight line, toes on the floor.',
     'Brace your abs and glutes, tucking your pelvis slightly.',
     'Hold without letting your hips sag or rise.'],
    { defaultReps: '30-60s' }),
  ex('hanging-leg-raise', 'Hanging Leg Raise', 'core', 'isolation', ['pull-up bar'], ['abs'], ['obliques', 'forearm'],
    'No swing, curl pelvis up.',
    ['Hang from a bar with a strong grip, shoulders slightly engaged.',
     'Raise your legs (bent or straight) by curling your pelvis up toward your ribs.',
     'Lower under control with no swinging — the abs lift, not momentum.'],
    { difficulty: 'intermediate' }),
  ex('cable-crunch', 'Cable Crunch', 'core', 'isolation', ['cable'], ['abs'], [],
    'Crunch ribs to hips, round the spine.',
    ['Kneel facing a high cable, holding a rope at your head.',
     'Crunch down by rounding your spine, bringing your ribs toward your hips.',
     'Squeeze the abs at the bottom, then return slowly — keep your hips fixed.']),
  ex('crunch', 'Crunch', 'core', 'isolation', ['bodyweight'], ['abs'], [],
    'Curl up, exhale, squeeze abs.',
    ['Lie on your back, knees bent, hands by your head or across your chest.',
     'Curl your shoulder blades off the floor by contracting your abs, exhaling.',
     'Lower slowly with control — avoid yanking your neck.'],
    { defaultReps: '15-25' }),
  ex('bicycle-crunch', 'Bicycle Crunch', 'core', 'isolation', ['bodyweight'], ['abs'], ['obliques'],
    'Opposite elbow to knee, slow and controlled.',
    ['Lie back, hands by your ears, legs raised and bent.',
     'Bring one elbow toward the opposite knee while extending the other leg.',
     'Alternate slowly with control — rotation drives the obliques.'],
    { defaultReps: '15-25' }),
  ex('russian-twist', 'Russian Twist', 'core', 'isolation', ['dumbbell'], ['obliques'], ['abs'],
    'Lean back, rotate weight side to side.',
    ['Sit with knees bent, lean back to engage your core, holding a weight.',
     'Rotate your torso to tap the weight beside each hip.',
     'Keep the movement controlled and driven by your obliques, not your arms.'],
    { defaultReps: '20' }),
  ex('side-plank', 'Side Plank', 'core', 'isolation', ['bodyweight'], ['obliques'], ['abs'],
    'Stack hips, lift, straight line.',
    ['Lie on your side, forearm under your shoulder, legs stacked.',
     'Lift your hips so your body forms a straight line.',
     'Hold without letting your hips drop — feel the down-side obliques.'],
    { defaultReps: '30-45s', unilateral: true }),
  ex('dead-bug', 'Dead Bug', 'core', 'isolation', ['bodyweight'], ['abs'], ['obliques'],
    'Lower back glued down, extend opposites.',
    ['Lie on your back, arms up over your shoulders, knees bent at 90 degrees.',
     'Slowly extend your opposite arm and leg toward the floor.',
     'Keep your lower back pressed flat the whole time, then switch sides.'],
    { defaultReps: '10 each' }),
  ex('bird-dog', 'Bird Dog', 'core', 'isolation', ['bodyweight'], ['abs', 'lower-back'], ['gluteal'],
    'Reach opposite arm/leg, no hip rotation.',
    ['Start on all fours, hands under shoulders, knees under hips.',
     'Extend your opposite arm and leg until they are level with your torso.',
     'Keep your hips square and core braced, then switch sides slowly.'],
    { defaultReps: '10 each' }),
  ex('ab-wheel', 'Ab Wheel Rollout', 'core', 'isolation', ['bodyweight'], ['abs'], ['obliques'],
    'Roll out under control, no lumbar sag.',
    ['Kneel holding an ab wheel under your shoulders, core braced.',
     'Roll forward as far as you can while keeping your lower back from sagging.',
     'Pull yourself back using your abs — only go as far as you can control.'],
    { difficulty: 'advanced' }),

  // ---- MOBILITY (no anatomical shading) ----
  ex('cat-cow-stretch', 'Cat-Cow Stretch', 'mobility', 'isolation', ['bodyweight'], [], [],
    'Flow between flexion and extension with breath.',
    ['Start on all fours, hands under shoulders and knees under hips.',
     'Inhale and drop your belly, lifting your chest and tailbone (cow).',
     'Exhale and round your spine, tucking your chin and pelvis (cat). Flow with your breath.'],
    { defaultSets: 1, defaultReps: '10' }),
  ex('world-s-greatest-stretch', "World's Greatest Stretch", 'mobility', 'isolation', ['bodyweight'], [], [],
    'Lunge, rotate, reach — full-body opener.',
    ['Step into a deep lunge, both hands on the floor inside your front foot.',
     'Drop your front elbow toward the floor, then rotate and reach that arm to the ceiling.',
     'Return and switch sides — moves the hips, t-spine, and hamstrings.'],
    { defaultSets: 1, defaultReps: '5 each' }),
  ex('90-90-hip-switch', '90/90 Hip Switch', 'mobility', 'isolation', ['bodyweight'], [], [],
    'Rotate hips floor to floor, tall chest.',
    ['Sit with one shin in front at 90 degrees and the other out to the side at 90 degrees.',
     'Keeping your chest tall, rotate both knees to the other side.',
     'Move slowly and control the rotation through your hips.'],
    { defaultSets: 1, defaultReps: '8 each' }),
  ex('pigeon-stretch', 'Pigeon Stretch', 'mobility', 'isolation', ['bodyweight'], [], [],
    'Shin forward, sink hips, breathe into glute.',
    ['Bring one shin forward across your body, extend the other leg straight behind.',
     'Square your hips and sink down, keeping your chest tall or folding forward.',
     'Breathe into the glute/hip stretch, then switch sides.'],
    { defaultSets: 1, defaultReps: '60s each' }),
  ex('couch-stretch', 'Couch Stretch', 'mobility', 'isolation', ['bodyweight'], [], [],
    'Rear shin up wall, tuck pelvis, hold.',
    ['Place your rear shin up against a wall, front foot planted in a lunge.',
     'Tuck your pelvis under and raise your torso tall.',
     'Hold the hip-flexor/quad stretch and breathe, then switch sides.'],
    { defaultSets: 1, defaultReps: '60s each' }),
  ex('child-s-pose', "Child's Pose", 'mobility', 'isolation', ['bodyweight'], [], [],
    'Hips to heels, reach long, decompress.',
    ['Kneel and sit your hips back toward your heels.',
     'Reach your arms long in front and let your chest sink toward the floor.',
     'Breathe slowly to decompress the back and shoulders.'],
    { defaultSets: 1, defaultReps: '90s' }),
  ex('thoracic-rotation', 'Thoracic Rotation', 'mobility', 'isolation', ['bodyweight'], [], [],
    'Open-book rotation, follow the hand.',
    ['Lie on your side with knees stacked and arms extended in front.',
     'Open the top arm across your body like a book, following your hand with your eyes.',
     'Rotate from the upper back, keeping your knees down, then return.'],
    { defaultSets: 1, defaultReps: '8 each' }),

  // ---- CARDIO / CONDITIONING ----
  ex('jumping-jacks', 'Jumping Jacks', 'cardio', 'compound', ['bodyweight'], [], [],
    'Steady rhythm, full arm extension.',
    ['Stand tall with feet together and arms at your sides.',
     'Jump your feet wide while raising your arms overhead.',
     'Jump back to start and keep a steady rhythm.'],
    { defaultSets: 1, defaultReps: '60s' }),
  ex('mountain-climbers', 'Mountain Climbers', 'cardio', 'compound', ['bodyweight'], ['abs'], ['obliques'],
    'Hips low, drive knees, quick feet.',
    ['Start in a push-up position, hands under shoulders, core braced.',
     'Drive one knee toward your chest, then quickly switch legs.',
     'Keep your hips low and a fast, controlled pace.'],
    { defaultSets: 1, defaultReps: '40s' }),
  ex('burpee', 'Burpee', 'cardio', 'compound', ['bodyweight'], ['chest', 'quadriceps'], ['abs', 'front-deltoids'],
    'Chest to floor, jump tall each rep.',
    ['From standing, drop into a squat and place your hands on the floor.',
     'Kick your feet back to a plank and lower your chest to the floor.',
     'Drive back up, hop your feet in, and jump tall with arms overhead.'],
    { defaultReps: '10-15' }),
];

/** O(1) id lookup, built once at module load. */
export const EXERCISE_BY_ID: Map<string, LibraryExercise> = new Map(
  EXERCISE_LIBRARY.map((e) => [e.id, e])
);

export function getLibraryExercise(id: string): LibraryExercise | undefined {
  return EXERCISE_BY_ID.get(id);
}

/**
 * A "how to" video link. Returns the curated watch URL when videoId is set,
 * otherwise a YouTube search results page for the exercise's proper form.
 * Callers should branch UI on `hasCuratedVideo()` so the label is honest —
 * a button reading "Watch form video" that opens a search results page is
 * the kind of UX lie that erodes trust quickly.
 */
export function formVideoUrl(e: Pick<LibraryExercise, 'name' | 'videoId'>): string {
  if (e.videoId) return `https://www.youtube.com/watch?v=${e.videoId}`;
  const q = encodeURIComponent(`how to ${e.name} proper form technique`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

/** True only when a curated videoId is set — distinguishes "watch" from "search". */
export function hasCuratedVideo(e: Pick<LibraryExercise, 'videoId'>): boolean {
  return !!e.videoId;
}

/** YouTube thumbnail for a curated videoId. */
export function videoThumb(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
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

// Dev-only integrity guard: unique ids. Tree-shaken from prod.
if (import.meta.env.DEV) {
  const seen = new Set<string>();
  for (const e of EXERCISE_LIBRARY) {
    if (seen.has(e.id)) console.warn(`[exercises] duplicate id: ${e.id}`);
    seen.add(e.id);
  }
}
