// Vongola Trainer — movement-pattern icon lookup.
//
// Maps an exercise to a Lucide icon that hints at its movement family. Keyed
// off (library) primaryMuscles + category so even user-edited names still get
// a sensible icon. NOT a photo replacement — these are 24px monoline glyphs
// rendered next to the exercise name in the workout list.

import {
  type LucideIcon,
  Dumbbell,        // generic resistance — fallback
  ChevronsDown,    // squat / lower-body compound
  MoveVertical,    // hinge (deadlift)
  ChevronsUp,      // overhead press / pull-up
  MoveHorizontal,  // lateral raise / fly
  ArrowLeft,       // row / pull
  CircleDot,       // core / abs
  Activity,        // cardio
  Move,            // mobility / stretch
  Hand,            // grip / carry
} from 'lucide-react';
import type { Exercise } from './types';
import { getLibraryExercise } from './exercises';

export type MovementPattern =
  | 'squat'
  | 'hinge'
  | 'press'
  | 'overhead-press'
  | 'pull'
  | 'lateral'
  | 'fly'
  | 'curl'
  | 'extension'
  | 'core'
  | 'carry'
  | 'cardio'
  | 'mobility'
  | 'generic';

const ICON_BY_PATTERN: Record<MovementPattern, LucideIcon> = {
  squat: ChevronsDown,
  hinge: MoveVertical,
  press: Dumbbell,
  'overhead-press': ChevronsUp,
  pull: ArrowLeft,
  lateral: MoveHorizontal,
  fly: MoveHorizontal,
  curl: Dumbbell,
  extension: Dumbbell,
  core: CircleDot,
  carry: Hand,
  cardio: Activity,
  mobility: Move,
  generic: Dumbbell,
};

/**
 * Heuristic pattern detection from name + muscles. Cheap, no DB lookup — we
 * read the library entry by id when possible (more accurate) and fall back to
 * the runtime Exercise's muscles list otherwise.
 */
function detectPattern(name: string, muscles: string[], category?: string): MovementPattern {
  const n = name.toLowerCase();
  if (category === 'cardio') return 'cardio';
  if (category === 'mobility') return 'mobility';
  if (/carr(y|ies)|farmer/.test(n)) return 'carry';
  if (/squat|lunge|bulgarian|split\s+squat|leg\s+press/.test(n)) return 'squat';
  if (/deadlift|hinge|good[\s-]?morning|rdl|hip\s+thrust/.test(n)) return 'hinge';
  if (/overhead\s+press|ohp|military\s+press|push\s+press|arnold/.test(n)) return 'overhead-press';
  if (/pull[\s-]?up|chin[\s-]?up|lat\s+pulldown|pulldown/.test(n)) return 'overhead-press';
  if (/row\b|pull\b/.test(n)) return 'pull';
  if (/lateral\s+raise|side\s+raise|y[\s-]?raise/.test(n)) return 'lateral';
  if (/\bfly\b|crossover|pec[\s-]?deck/.test(n)) return 'fly';
  if (/curl\b/.test(n)) return 'curl';
  if (/extension|pushdown|skullcrusher|kickback/.test(n)) return 'extension';
  if (/plank|crunch|sit[\s-]?up|leg\s+raise|dead\s+bug|hollow|ab\s+wheel/.test(n)) return 'core';
  if (/press|bench|push[\s-]?up|dip\b/.test(n)) return 'press';
  if (muscles.some((m) => /abs|obliques/.test(m))) return 'core';
  if (muscles.some((m) => /lats|upper-back|back-deltoids|biceps/.test(m))) return 'pull';
  if (muscles.some((m) => /chest|triceps|front-deltoids/.test(m))) return 'press';
  if (muscles.some((m) => /quadriceps|hamstring|gluteal|adductor|calves/.test(m))) return 'squat';
  return 'generic';
}

export function patternForExercise(exercise: Exercise | { id: string; name: string; muscles: string[] }): MovementPattern {
  const lib = getLibraryExercise(exercise.id);
  if (lib) return detectPattern(lib.name, lib.primaryMuscles, lib.category);
  return detectPattern(exercise.name, exercise.muscles);
}

export function iconForExercise(exercise: Exercise | { id: string; name: string; muscles: string[] }): LucideIcon {
  return ICON_BY_PATTERN[patternForExercise(exercise)];
}
