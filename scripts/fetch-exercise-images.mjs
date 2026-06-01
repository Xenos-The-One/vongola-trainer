// One-shot: map our exercises to free-exercise-db (MIT), download both demo
// images locally into client/public/exercises/<id>/, and emit a typed lookup.
//
// Re-runnable: skips images already on disk. Run: node scripts/fetch-exercise-images.mjs
// Source DB: https://github.com/yuhonas/free-exercise-db (MIT licensed)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'client', 'public', 'exercises');
const TS_OUT = path.join(ROOT, 'client', 'src', 'lib', 'exerciseImages.ts');
const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main';

// our-id -> exact free-exercise-db `name`. null = intentionally no image
// (no honest match in the DB; the UI falls back to the movement icon).
const MAP = {
  'db-bench-press': 'Dumbbell Bench Press',
  'barbell-bench-press': 'Barbell Bench Press - Medium Grip',
  'incline-db-press': 'Incline Dumbbell Press',
  'push-up-variations': 'Pushups',
  'push-up': 'Pushups',
  'dips': 'Dips - Chest Version',
  'db-fly': 'Dumbbell Flyes',
  'cable-crossover': 'Cable Crossover',
  'overhead-press': 'Dumbbell Shoulder Press',
  'barbell-ohp': 'Standing Military Press',
  'arnold-press': 'Arnold Dumbbell Press',
  'lateral-raise': 'Side Lateral Raise',
  'band-lateral-raise': 'Lateral Raise - With Bands',
  'triceps-pushdown': 'Triceps Pushdown',
  'overhead-triceps-ext': 'Standing Dumbbell Triceps Extension',
  'db-skullcrusher': 'Lying Triceps Press',
  'close-grip-push-up': 'Push-Ups - Close Triceps Position',
  'band-triceps-pushdown': 'Triceps Pushdown',
  'pull-ups': 'Pullups',
  'chin-up': 'Chin-Up',
  'single-arm-row': 'One-Arm Dumbbell Row',
  'bent-over-row': 'Bent Over Barbell Row',
  'db-row': 'Bent Over Two-Dumbbell Row',
  'lat-pulldown': 'Wide-Grip Lat Pulldown',
  'band-row': 'Seated Cable Rows',
  'face-pulls': 'Face Pull',
  'band-pull-apart': 'Band Pull Apart',
  'rear-delt-fly': 'Reverse Flyes',
  'shrug': 'Dumbbell Shrug',
  'db-curl': 'Dumbbell Bicep Curl',
  'hammer-curl': 'Hammer Curls',
  'barbell-curl': 'Barbell Curl',
  'band-curl': 'Close-Grip EZ-Bar Curl with Band',
  'concentration-curl': 'Concentration Curls',
  'wrist-curl': 'Palms-Up Barbell Wrist Curl Over A Bench',
  'dead-hang': null,
  'goblet-squat': 'Goblet Squat',
  'back-squat': 'Barbell Squat',
  'front-squat': 'Front Barbell Squat',
  'bulgarian-split-squat': 'Split Squat with Dumbbells',
  'romanian-deadlift': 'Romanian Deadlift',
  'deadlift': 'Barbell Deadlift',
  'walking-lunge': 'Barbell Walking Lunge',
  'step-up': 'Dumbbell Step Ups',
  'leg-press': 'Leg Press',
  'leg-extension': 'Leg Extensions',
  'leg-curl': 'Lying Leg Curls',
  'nordic-curl': 'Natural Glute Ham Raise',
  'hip-thrust': 'Barbell Hip Thrust',
  'glute-bridge': 'Butt Lift (Bridge)',
  'kb-swing': 'One-Arm Kettlebell Swings',
  'calf-raise': 'Standing Calf Raises',
  'seated-calf-raise': 'Seated Calf Raise',
  'wall-sit': null,
  'cossack-squat': null,
  'banded-lateral-walk': null,
  'farmer-carry': "Farmer's Walk",
  'plank-hold': 'Plank',
  'plank': 'Plank',
  'hanging-leg-raise': 'Hanging Leg Raise',
  'cable-crunch': 'Cable Crunch',
  'crunch': 'Crunches',
  'bicycle-crunch': 'Air Bike',
  'russian-twist': 'Russian Twist',
  'side-plank': 'Side Bridge',
  'dead-bug': 'Dead Bug',
  'bird-dog': null,
  'ab-wheel': 'Ab Roller',
  'cat-cow-stretch': 'Cat Stretch',
  'world-s-greatest-stretch': "World's Greatest Stretch",
  '90-90-hip-switch': null,
  'pigeon-stretch': null,
  'couch-stretch': null,
  'child-s-pose': "Child's Pose",
  'thoracic-rotation': null,
  'jumping-jacks': null,
  'mountain-climbers': 'Mountain Climbers',
  'burpee': null, // not present in free-exercise-db — icon fallback
};

async function main() {
  console.log('Fetching exercise DB index…');
  const res = await fetch(`${CDN}/dist/exercises.json`);
  const db = await res.json();
  const byName = new Map(db.map((e) => [e.name, e]));

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const result = {}; // ourId -> ['/exercises/<id>/0.jpg', ...]
  const missingDbName = [];
  const noMatch = [];

  for (const [ourId, dbName] of Object.entries(MAP)) {
    if (dbName === null) {
      noMatch.push(ourId);
      continue;
    }
    const entry = byName.get(dbName);
    if (!entry || !entry.images?.length) {
      missingDbName.push(`${ourId} -> "${dbName}"`);
      continue;
    }
    const localPaths = [];
    const dir = path.join(OUT_DIR, ourId);
    fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < entry.images.length && i < 2; i++) {
      const dest = path.join(dir, `${i}.jpg`);
      const publicPath = `/exercises/${ourId}/${i}.jpg`;
      localPaths.push(publicPath);
      if (fs.existsSync(dest) && fs.statSync(dest).size > 0) continue; // re-run skip
      const imgUrl = `${CDN}/exercises/${entry.images[i]}`;
      const imgRes = await fetch(imgUrl);
      if (!imgRes.ok) {
        console.warn(`  ! failed ${imgUrl} (${imgRes.status})`);
        continue;
      }
      const buf = Buffer.from(await imgRes.arrayBuffer());
      fs.writeFileSync(dest, buf);
    }
    result[ourId] = localPaths;
    process.stdout.write('.');
  }
  console.log('');

  // Emit the typed lookup.
  const ts =
    `// AUTO-GENERATED by scripts/fetch-exercise-images.mjs — do not edit by hand.\n` +
    `// Demonstration images from free-exercise-db (https://github.com/yuhonas/free-exercise-db, MIT).\n` +
    `// Maps our exercise id -> local image paths (precached by the PWA for offline use).\n\n` +
    `export const EXERCISE_IMAGES: Record<string, string[]> = ${JSON.stringify(result, null, 2)};\n\n` +
    `/** Image paths for an exercise id, or [] when none (UI falls back to the movement icon). */\n` +
    `export function exerciseImages(id: string): string[] {\n` +
    `  return EXERCISE_IMAGES[id] ?? [];\n` +
    `}\n`;
  fs.writeFileSync(TS_OUT, ts);

  console.log(`\nMatched + downloaded: ${Object.keys(result).length}/${Object.keys(MAP).length}`);
  if (missingDbName.length) {
    console.log(`\nDB name not found (fix MAP): \n  ${missingDbName.join('\n  ')}`);
  }
  console.log(`\nIntentional icon-fallback (no honest match): ${noMatch.join(', ')}`);
  console.log(`\nWrote ${path.relative(ROOT, TS_OUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
