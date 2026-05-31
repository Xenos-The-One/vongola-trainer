// Vongola Trainer — Core Types
// Design: "Ember & Parchment" — warm minimalism, serif authority, campfire-in-the-dark aesthetic

export type AccentKey = 'amber' | 'ocean' | 'forest' | 'sunset' | 'rose' | 'violet';

export type ThemeMode = 'dark' | 'light';

export type FontSize = 'S' | 'M' | 'L';

export type StarterKey = 'natsu' | 'uri' | 'kojirou' | 'jirou' | 'kangaryuu' | 'gyudon' | 'roll' | 'mukurou';

export type LiftKey = 'A' | 'B';

export interface Exercise {
  id: string;
  name: string;
  muscles: string[];
  equipment: string[];
  sets: number;
  reps: string;
  targetWeight?: number;
  rpe?: number;
  subExercises?: Exercise[];
}

export interface LogEntry {
  id: string;
  date: string;
  exerciseId: string;
  sets: { reps: number; weight: number; rpe?: number }[];
  notes?: string;
}

export interface BlockState {
  checked: number[];
  total: number;
}

export interface DayState {
  blocks: {
    training: BlockState;
    coach: BlockState;
    morning: BlockState;
    work: BlockState;
    evening: BlockState;
  };
  completionPct: number;
  streakDay: number;
}

export interface UserSettings {
  nickname: string;
  starter: StarterKey;
  accent: AccentKey;
  theme: ThemeMode;
  fontSize: FontSize;
}

export interface PhaseInfo {
  name: string;
  week: number;
  startDate: string;
}

export interface PersonalRecord {
  value: number;
  date: string;
}

/** A named, materialized workout (from the generator, a routine, or built by hand). */
export interface SavedWorkout {
  id: string;
  name: string;
  createdAt: string;
  source: 'generated' | 'routine' | 'manual';
  exercises: Exercise[];
}

// --- Active workout session (full-screen live logging) ---

export interface ActiveSet {
  reps: number;
  weight: number;
  rpe?: number;
  done: boolean;
}

export interface ActiveExercise {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: string;
  sets: ActiveSet[];
  notes?: string;
}

export type ActiveSource = 'lift' | 'generated' | 'routine' | 'custom';

export interface ActiveSession {
  startedAt: number; // epoch ms
  source: ActiveSource;
  liftKey?: LiftKey; // set when source === 'lift' → completes the training block + flips nextLift
  exercises: ActiveExercise[];
  currentIndex: number;
  restEndsAt?: number; // absolute epoch ms; undefined = not resting (survives refresh)
  restPreset: number; // seconds, default 90
}

export interface Store {
  user: UserSettings;
  phase: PhaseInfo;
  days: Record<string, DayState>;
  workouts: {
    liftA: Exercise[];
    liftB: Exercise[];
    morning: Exercise[];
    evening: Exercise[];
    custom: Exercise[];
  };
  log: LogEntry[];
  prs: Record<string, PersonalRecord>;
  nextLift: LiftKey;
  /** Equipment the user owns — drives the generator's filter. Stored as Equipment strings. */
  equipmentProfile: string[];
  /** Saved/generated workouts the user can load or start. */
  savedWorkouts: SavedWorkout[];
  /** In-progress live workout. Persisted so a mid-workout refresh/close survives. */
  activeSession: ActiveSession | null;
}

// Companion system types
export type EvolutionStage = 'cub-sleep' | 'cub-awake' | 'young-lion' | 'sky-lion' | 'cambio-forma' | 'hyper-mode';

export interface CompanionSprites {
  'cub-sleep': string;
  'cub-awake': string;
  'young-lion': string;
  'sky-lion': string;
  'cambio-forma': string;
  'hyper-mode': string;
}

export interface CompanionDef {
  id: string;
  name: string;
  element: string;
  sprites: CompanionSprites;
  speeches: string[];
}

// Task block types for Today screen
export interface TaskItem {
  id: string;
  label: string;
  done: boolean;
  duration?: string;
  subItems?: TaskItem[];
}

export interface TaskBlock {
  id: string;
  title: string;
  subtitle: string;
  blockKey: keyof DayState['blocks'];
  items: TaskItem[];
}
