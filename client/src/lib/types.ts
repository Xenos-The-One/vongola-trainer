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
  /** Today's training items — one entry per exercise in the day's workout. */
  training: BlockState;
  /** % of training done (0..100); equals computeTrainingPct(training). */
  completionPct: number;
  streakDay: number;
}

export interface UserSettings {
  nickname: string;
  starter: StarterKey;
  accent: AccentKey;
  theme: ThemeMode;
  fontSize: FontSize;
  /** Weight display unit. Internal storage is always kg; this only affects UI + input. */
  units?: 'kg' | 'lb';
}

export interface PhaseInfo {
  name: string;
  week: number;
  startDate: string;
}

export interface PersonalRecord {
  /** Max raw weight ever moved at any rep count. */
  value: number;
  /** Date the max-weight PR was set. */
  date: string;
  /** Best estimated 1RM (Epley) — captures "rep PR" within a working weight. */
  bestE1RM?: number;
  /** Reps of the set that produced bestE1RM. */
  bestSetReps?: number;
  /** Weight of the set that produced bestE1RM. */
  bestSetWeight?: number;
  /** Date the bestE1RM PR was set. */
  bestSetDate?: string;
}

/** A dated body-measurement entry (one logical entry per date; upsert by date). */
export interface BodyMetric {
  date: string; // YYYY-MM-DD
  weightKg?: number;
  bodyFat?: number;
  measurements?: Record<string, number>; // cm: waist, chest, arms, thighs, ...
}

/** A named, materialized workout (from the generator, a routine, or built by hand). */
export interface SavedWorkout {
  id: string;
  name: string;
  createdAt: string;
  source: 'generated' | 'routine' | 'manual';
  exercises: Exercise[];
}

/** One day inside a weekly plan rotation. */
export interface WeeklyPlanDay {
  index: number;       // 0-based position in the rotation
  title: string;       // e.g. "Upper", "Push", "Day 1 — Full Body"
  split: string;       // split key from generator (full-body / upper / lower / push / pull / legs)
  exercises: Exercise[];
}

/**
 * A user-generated rotating workout plan. `days.length` is the rotation period
 * (1–6). `currentIndex` advances each time the user finishes a planned session,
 * wrapping mod days.length — so a 4-day plan cycles U/L/U/L regardless of
 * which calendar day the user trains.
 */
export interface WeeklyPlan {
  id: string;
  createdAt: string;          // YYYY-MM-DD
  daysPerWeek: number;        // matches days.length
  days: WeeklyPlanDay[];
  currentIndex: number;       // 0..days.length-1
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
    custom: Exercise[];
  };
  log: LogEntry[];
  prs: Record<string, PersonalRecord>;
  nextLift: LiftKey;
  /** Equipment the user owns — drives the generator's filter. Stored as Equipment strings. */
  equipmentProfile: string[];
  /**
   * Per-equipment MAX usable load in kg (internal canonical unit; display
   * converts to lb via the units setting). Drives the overload cap so the
   * suggestion never goes above what you can actually load. Missing entries
   * = unbounded for that equipment category.
   */
  equipmentMax: Partial<Record<string, number>>;
  /** Saved/generated workouts the user can load or start. */
  savedWorkouts: SavedWorkout[];
  /** In-progress live workout. Persisted so a mid-workout refresh/close survives. */
  activeSession: ActiveSession | null;
  /** Body-weight / measurement history. */
  metrics: BodyMetric[];
  /** Active rotating plan generated by the user. Today reads from this when set. */
  weeklyPlan: WeeklyPlan | null;
  /**
   * Custom exercises the user added themselves. Same shape as the static
   * EXERCISE_LIBRARY entries so pickers/info-buttons can resolve them uniformly.
   * Stored separately so a library update never clobbers user data.
   */
  customExercises: CustomExercise[];
}

/** A user-added library entry — same surface as LibraryExercise. */
export interface CustomExercise {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  category: 'push' | 'pull' | 'legs' | 'core' | 'mobility' | 'cardio';
  mechanic: 'compound' | 'isolation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  unilateral: boolean;
  cue: string;
  instructions: string[];
  videoId?: string;
  defaultSets?: number;
  defaultReps?: string;
  createdAt: string; // YYYY-MM-DD
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


