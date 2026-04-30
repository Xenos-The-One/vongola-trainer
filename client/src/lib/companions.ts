// Vongola Trainer — Companion System
// To add a new companion: create a sprite folder, then add an entry here.
// Each companion needs 6 sprites matching the EvolutionStage keys.

import type { CompanionDef } from './types';

const SPRITE_BASE = {
  'cub-sleep': '/sprites/natsu/cub-sleep.png',
  'cub-awake': '/sprites/natsu/cub-awake.png',
  'young-lion': '/sprites/natsu/young-lion.png',
  'sky-lion': '/sprites/natsu/sky-lion.png',
  'cambio-forma': '/sprites/natsu/cambio-forma.png',
  'hyper-mode': '/sprites/natsu/hyper-mode.png',
};

export const NATSU: CompanionDef = {
  id: 'natsu',
  name: 'Natsu',
  element: 'sky',
  sprites: SPRITE_BASE,
  speeches: [
    "bro did you just— okay that was nice actually",
    "more reps. now.",
    "I felt that one",
    "you've got this",
    "respect.",
    "that form though 👌",
    "we're not done yet",
    "one more set, let's go",
    "you're on fire today",
    "rest is earned, not given",
  ],
};

// Registry of all companions. Add new ones here.
export const COMPANIONS: Record<string, CompanionDef> = {
  natsu: NATSU,
  // Future companions:
  // uri: { id: 'uri', name: 'Uri', element: 'storm', sprites: {...}, speeches: [...] },
  // gyudon: { id: 'gyudon', name: 'Gyudon', element: 'lightning', sprites: {...}, speeches: [...] },
  // kojirou: { id: 'kojirou', name: 'Kojirou', element: 'rain', sprites: {...}, speeches: [...] },
  // jirou: { id: 'jirou', name: 'Jirou', element: 'rain', sprites: {...}, speeches: [...] },
  // roll: { id: 'roll', name: 'Roll', element: 'cloud', sprites: {...}, speeches: [...] },
};

export function getCompanion(id: string): CompanionDef {
  return COMPANIONS[id] || NATSU;
}
