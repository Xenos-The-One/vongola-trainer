// Vongola Trainer — Companion System
// Each companion has 6 sprites matching the EvolutionStage keys.
// Sprites live in /sprites/{id}/{stage}.png

import type { CompanionDef } from './types';

function makeSprites(id: string) {
  return {
    'cub-sleep': `/sprites/${id}/cub-sleep.png`,
    'cub-awake': `/sprites/${id}/cub-awake.png`,
    'young-lion': `/sprites/${id}/young-lion.png`,
    'sky-lion': `/sprites/${id}/sky-lion.png`,
    'cambio-forma': `/sprites/${id}/cambio-forma.png`,
    'hyper-mode': `/sprites/${id}/hyper-mode.png`,
  };
}

export const NATSU: CompanionDef = {
  id: 'natsu',
  name: 'Natsu',
  element: 'sky',
  sprites: makeSprites('natsu'),
  speeches: [
    "bro did you just— okay that was nice actually",
    "more reps. now.",
    "I felt that one",
    "you've got this",
    "respect.",
    "that form though",
    "we're not done yet",
    "one more set, let's go",
    "you're on fire today",
    "rest is earned, not given",
  ],
};

export const URI: CompanionDef = {
  id: 'uri',
  name: 'Uri',
  element: 'storm',
  sprites: makeSprites('uri'),
  speeches: [
    "tch. fine.",
    "don't slack off.",
    "*hiss*",
    "you better keep up",
    "JUUDAIME!",
    "claws out",
    "explosions only",
  ],
};

export const KOJIROU: CompanionDef = {
  id: 'kojirou',
  name: 'Kojirou',
  element: 'rain',
  sprites: makeSprites('kojirou'),
  speeches: [
    "easy does it",
    "flow like water",
    "nice rhythm",
    "stay cool",
    "you're in the zone",
    "calm waters",
    "rain on me",
  ],
};

export const JIROU: CompanionDef = {
  id: 'jirou',
  name: 'Jirou',
  element: 'rain',
  sprites: makeSprites('jirou'),
  speeches: [
    "WOOF!",
    "good rep!",
    "let's go!",
    "*tail wag*",
    "i'll fetch the next set",
    "loyal to the end",
    "good human",
  ],
};

export const KANGARYUU: CompanionDef = {
  id: 'kangaryuu',
  name: 'Kangaryuu',
  element: 'sun',
  sprites: makeSprites('kangaryuu'),
  speeches: [
    "EXTREME!",
    "TO THE EXTREME!",
    "ONE MORE REP!",
    "LIMIT BREAK!",
    "MAXIMUM CANNON!",
    "FIGHTING SPIRIT!",
    "SUN POWER!",
  ],
};

export const GYUDON: CompanionDef = {
  id: 'gyudon',
  name: 'Gyuudon',
  element: 'lightning',
  sprites: makeSprites('gyudon'),
  speeches: [
    "nyahaha!",
    "bzzzt",
    "shock therapy",
    "horns ready",
    "lambo-san is the best!",
    "10 year bazooka",
    "tolerate me!",
  ],
};

export const ROLL: CompanionDef = {
  id: 'roll',
  name: 'Roll',
  element: 'cloud',
  sprites: makeSprites('roll'),
  speeches: [
    "...",
    "i'll bite you to death",
    "*spikes out*",
    "hn.",
    "carnivore.",
    "crowd: bad",
    "weak willpower",
  ],
};

export const MUKUROU: CompanionDef = {
  id: 'mukurou',
  name: 'Mukurou',
  element: 'mist',
  sprites: makeSprites('mukurou'),
  speeches: [
    "kufufu~",
    "illusions only",
    "are you sure that's real?",
    "trick or trick",
    "watch your back",
    "the mist deceives",
    "six paths",
  ],
};

// Registry of all companions — ordered Sky → Storm → Rain → Sun → Lightning → Cloud → Mist
export const COMPANIONS: Record<string, CompanionDef> = {
  natsu: NATSU,
  uri: URI,
  kojirou: KOJIROU,
  jirou: JIROU,
  kangaryuu: KANGARYUU,
  gyudon: GYUDON,
  roll: ROLL,
  mukurou: MUKUROU,
};

export function getCompanion(id: string): CompanionDef {
  return COMPANIONS[id] || NATSU;
}
