# Vongola Trainer

A personal home-workout PWA with pixel-art companion evolution, built with React + TypeScript + Tailwind CSS. Mobile-first, installable, and fully offline-capable.

## Features

- **Today Screen** — Daily task management with collapsible blocks (Training, Coach's Focus, Morning, Work, Evening)
- **Companion System** — Pixel-art Natsu (sky-flame lion) that evolves based on daily completion % and streak
- **Training Log** — Quick-log form with exercise picker, sets/reps/weight, RPE tracking
- **Progress Charts** — Weekly completion %, volume per muscle group, streak heatmap, PR list
- **Protocol** — Editable workout templates (Lift A, Lift B, Morning, Evening blocks)
- **Settings** — Theme (Dark/Light), 6 accent colors, font size, companion selection
- **PWA** — Installable on iOS/Android, offline-capable with service worker
- **Timer FAB** — Floating stopwatch for rest periods

## Companion Evolution

The companion sprite evolves based on your daily progress:

| % Today | Stage | Sprite |
|---------|-------|--------|
| 0–24 | Sleeping Cub | cub-sleep |
| 25–49 | Awake Cub | cub-awake |
| 50–74 | Young Lion | young-lion |
| 75–99 | Sky Lion | sky-lion |
| 100 | Cambio Forma | cambio-forma |
| 100 + streak ≥ 7 | Hyper Mode | hyper-mode |

## localStorage Schema

All data is stored under the key `vongola-trainer-v1`:

```typescript
type Store = {
  user: { nickname: string; starter: 'natsu'; accent: AccentKey; theme: 'dark'|'light'; fontSize: 'S'|'M'|'L' };
  phase: { name: string; week: number; startDate: string };
  days: Record<string, DayState>;
  workouts: { liftA: Exercise[]; liftB: Exercise[]; morning: Exercise[]; evening: Exercise[]; custom: Exercise[] };
  log: LogEntry[];
  prs: Record<string, { value: number; date: string }>;
};
```

## Adding New Companions

To add a new companion (e.g., Uri the storm cat):

1. Generate or create 6 sprite images matching the evolution stages
2. Upload sprites and get their URLs
3. Add an entry to `client/src/lib/companions.ts`:

```typescript
export const URI: CompanionDef = {
  id: 'uri',
  name: 'Uri',
  element: 'storm',
  sprites: {
    'cub-sleep': 'url-to-sprite',
    'cub-awake': 'url-to-sprite',
    'young-lion': 'url-to-sprite',
    'sky-lion': 'url-to-sprite',
    'cambio-forma': 'url-to-sprite',
    'hyper-mode': 'url-to-sprite',
  },
  speeches: ["storm's coming", "let's go!", ...],
};

// Add to registry
export const COMPANIONS: Record<string, CompanionDef> = {
  natsu: NATSU,
  uri: URI,
};
```

4. Update the starter selection in `Settings.tsx` to make it available

## Tech Stack

- React 19 + TypeScript (strict)
- Tailwind CSS 4
- Zustand (state management with localStorage persistence)
- Recharts (progress visualizations)
- Lucide React (icons)
- Wouter (client-side routing)
- Framer Motion (available for animations)
- PWA with service worker

## Design System

**"Ember & Parchment"** — warm minimalism with editorial serif authority:

- Background: warm near-black (#121014)
- Cards: warm dark (#1C1820) with subtle borders
- Typography: Playfair Display (headings) + Inter (body)
- Accent: configurable (Sunset #FF7A45 default)
- Mobile-first: max-width 480px container

## Development

```bash
pnpm install
pnpm dev
```

## Project Structure

```
client/src/
├── components/
│   ├── BottomNav.tsx      — 5-tab navigation
│   ├── CompanionCard.tsx  — Pixel-art companion with sky background
│   ├── PhaseBadge.tsx     — Phase indicator pill
│   ├── ProgressRing.tsx   — Circular progress indicator
│   ├── StatusPill.tsx     — Horizontal status indicators
│   ├── TaskBlock.tsx      — Collapsible task sections
│   └── TimerFab.tsx       — Floating timer button
├── lib/
│   ├── companions.ts      — Companion registry & definitions
│   ├── confetti.ts        — Flame confetti celebration effect
│   ├── evolution.ts       — Stage determination logic
│   ├── recommend.ts       — Rules-based workout recommendations
│   ├── seed.ts            — Default workout templates
│   ├── storage.ts         — Zustand store with localStorage
│   └── types.ts           — TypeScript type definitions
├── pages/
│   ├── Today.tsx          — Main daily view
│   ├── Log.tsx            — Workout logging
│   ├── Progress.tsx       — Charts & stats
│   ├── Protocol.tsx       — Workout templates
│   └── Settings.tsx       — App configuration
├── App.tsx                — Routes & layout
├── main.tsx               — Entry point + SW registration
└── index.css              — Theme, animations, accent system
```
