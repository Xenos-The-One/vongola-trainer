// Vongola Trainer — Storage & State Management
// Uses Zustand with localStorage persistence under key 'vongola-trainer-v1'

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Store,
  DayState,
  LogEntry,
  Exercise,
  AccentKey,
  ThemeMode,
  FontSize,
  BlockState,
  LiftKey,
  SavedWorkout,
  ActiveSet,
  ActiveExercise,
  ActiveSession,
  BodyMetric,
} from './types';
import { createDefaultStore } from './seed';
import { normalizeMuscles } from './muscles';
import { getLastEntry, parseFirstRep } from './lastPerformance';
import { todayKey, dateKey } from './date';
import { e1RM, bestE1RMSet } from './strength';
import { suggestNextLoad } from './overload';

export const STORAGE_KEY = 'vongola-trainer-v1';
export const SCHEMA_VERSION = 7;

function getTodayKey(): string {
  return todayKey();
}

function createEmptyDayState(): DayState {
  return {
    blocks: {
      training: { checked: [], total: 5 },
      coach: { checked: [], total: 6 },
      morning: { checked: [], total: 11 },
      work: { checked: [], total: 6 },
      evening: { checked: [], total: 6 },
    },
    completionPct: 0,
    streakDay: 0,
  };
}

function computeCompletionPct(blocks: DayState['blocks']): number {
  let done = 0;
  let total = 0;
  Object.values(blocks).forEach((block: BlockState) => {
    done += block.checked.length;
    total += block.total;
  });
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

/**
 * Training-block completion %. Drives companion evolution + streak — the
 * companion is your TRAINER, not your chore-list, so a perfect workout should
 * power up the sprite even if you haven't done morning/evening chores.
 *
 * A rest day (training.total === 0) returns 100: you completed your planned
 * training load, so you keep credit. Out-of-range checked counts are clamped.
 */
export function computeTrainingPct(blocks: DayState['blocks']): number {
  const t = blocks.training;
  if (!t || t.total === 0) return 100;
  const done = Math.min(t.checked.length, t.total);
  return Math.round((done / t.total) * 100);
}

export function computeStreak(days: Record<string, DayState>): number {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = dateKey(date);
    const day = days[key];

    if (i === 0 && !day) break; // today hasn't started
    if (!day) break;
    const trainingPct = computeTrainingPct(day.blocks);
    if (trainingPct < 75) {
      if (i === 0) continue; // today is in progress, check yesterday
      break;
    }
    streak++;
  }
  return streak;
}

export interface StoreActions {
  // Day management
  getTodayState: () => DayState;
  toggleTask: (blockKey: keyof DayState['blocks'], index: number) => void;
  setBlockTotal: (blockKey: keyof DayState['blocks'], total: number) => void;

  // Log management
  addLogEntry: (entry: Omit<LogEntry, 'id'>) => void;

  // Settings
  setNickname: (nickname: string) => void;
  setAccent: (accent: AccentKey) => void;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (fontSize: FontSize) => void;
  setStarter: (starter: string) => void;

  // Workouts
  updateExercise: (category: keyof Store['workouts'], index: number, exercise: Exercise) => void;
  swapExercise: (category: keyof Store['workouts'], index: number, newExercise: Exercise) => void;

  // Phase
  setPhase: (name: string, week: number) => void;

  // PR tracking
  updatePR: (exerciseId: string, value: number) => void;

  // Lift A/B alternation
  setNextLift: (lift: LiftKey) => void;

  // Equipment profile + saved/generated workouts
  setEquipmentProfile: (equipment: string[]) => void;
  saveWorkout: (workout: Omit<SavedWorkout, 'id' | 'createdAt'>) => string;
  deleteSavedWorkout: (id: string) => void;
  loadWorkoutIntoLift: (lift: LiftKey, exercises: Exercise[]) => void;

  // Active workout session
  startSession: (input: { source: ActiveSession['source']; liftKey?: LiftKey; exercises: Exercise[] }) => void;
  updateActiveSet: (exIdx: number, setIdx: number, patch: Partial<ActiveSet>) => void;
  toggleSetDone: (exIdx: number, setIdx: number) => void;
  addActiveSet: (exIdx: number) => void;
  removeActiveSet: (exIdx: number, setIdx: number) => void;
  setCurrentExercise: (idx: number) => void;
  setActiveNotes: (exIdx: number, notes: string) => void;
  startRest: (seconds?: number) => void;
  adjustRest: (deltaSec: number) => void;
  stopRest: () => void;
  setRestPreset: (seconds: number) => void;
  completeTrainingBlock: () => void;
  finishSession: () => void;
  cancelSession: () => void;

  // Body metrics
  upsertMetric: (metric: BodyMetric) => void;
  deleteMetric: (date: string) => void;

  // Streak
  getStreak: () => number;
}

export type AppStore = Store & StoreActions;

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...createDefaultStore(),

      getTodayState: () => {
        const key = getTodayKey();
        const state = get();
        return state.days[key] || createEmptyDayState();
      },

      toggleTask: (blockKey, index) => {
        const key = getTodayKey();
        set((state) => {
          const currentDay = state.days[key] || createEmptyDayState();
          const block = currentDay.blocks[blockKey];
          const wasChecked = block.checked.includes(index);
          const newChecked = wasChecked
            ? block.checked.filter((i) => i !== index)
            : [...block.checked, index].sort((a, b) => a - b);

          const newBlocks = {
            ...currentDay.blocks,
            [blockKey]: { ...block, checked: newChecked },
          };

          const completionPct = computeCompletionPct(newBlocks);

          // Flip nextLift when training block transitions to complete
          let nextLift = state.nextLift;
          if (blockKey === 'training' && block.total > 0) {
            const wasComplete = block.checked.length >= block.total;
            const isComplete = newChecked.length >= block.total;
            if (!wasComplete && isComplete) {
              nextLift = nextLift === 'A' ? 'B' : 'A';
            }
          }

          const provisionalDays = {
            ...state.days,
            [key]: { blocks: newBlocks, completionPct, streakDay: 0 },
          };
          const streakDay = computeStreak(provisionalDays);

          return {
            days: {
              ...provisionalDays,
              [key]: { ...provisionalDays[key], streakDay },
            },
            nextLift,
          };
        });
      },

      setBlockTotal: (blockKey, total) => {
        if (total < 0) return;
        const key = getTodayKey();
        const state = get();
        const currentDay = state.days[key] || createEmptyDayState();
        const block = currentDay.blocks[blockKey];
        if (block.total === total) return;

        set((s) => {
          const day = s.days[key] || createEmptyDayState();
          const b = day.blocks[blockKey];
          const newBlock: BlockState = {
            total,
            checked: b.checked.filter((i) => i < total),
          };
          const newBlocks = { ...day.blocks, [blockKey]: newBlock };
          const completionPct = computeCompletionPct(newBlocks);

          return {
            days: {
              ...s.days,
              [key]: { ...day, blocks: newBlocks, completionPct },
            },
          };
        });
      },

      addLogEntry: (entry) => {
        const id = `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        set((state) => ({
          log: [...state.log, { ...entry, id }],
        }));

        // PR update — two independent records on one entry:
        //  - max raw weight (legacy "1RM-ish" PR)
        //  - best e1RM (catches rep PRs at the same working weight)
        const date = entry.date;
        const maxWeight = Math.max(0, ...entry.sets.map((s) => s.weight));
        const best = bestE1RMSet(entry.sets);
        const bestScore = best ? e1RM(best.weight, best.reps) : 0;

        set((state) => {
          const current = state.prs[entry.exerciseId];
          const beatWeight = !current || maxWeight > current.value;
          const beatE1RM = bestScore > 0 && (!current?.bestE1RM || bestScore > current.bestE1RM);
          if (!beatWeight && !beatE1RM) return {};

          const next: typeof state.prs[string] = {
            value: beatWeight ? maxWeight : (current?.value ?? maxWeight),
            date: beatWeight ? date : (current?.date ?? date),
            bestE1RM: beatE1RM ? bestScore : current?.bestE1RM,
            bestSetReps: beatE1RM ? best!.reps : current?.bestSetReps,
            bestSetWeight: beatE1RM ? best!.weight : current?.bestSetWeight,
            bestSetDate: beatE1RM ? date : current?.bestSetDate,
          };
          return { prs: { ...state.prs, [entry.exerciseId]: next } };
        });
      },

      setNickname: (nickname) => set((state) => ({ user: { ...state.user, nickname } })),
      setAccent: (accent) => set((state) => ({ user: { ...state.user, accent } })),
      setTheme: (theme) => set((state) => ({ user: { ...state.user, theme } })),
      setFontSize: (fontSize) => set((state) => ({ user: { ...state.user, fontSize } })),
      setStarter: (starter) =>
        set((state) => ({ user: { ...state.user, starter: starter as Store['user']['starter'] } })),

      updateExercise: (category, index, exercise) => {
        set((state) => {
          const list = [...state.workouts[category]];
          list[index] = exercise;
          return { workouts: { ...state.workouts, [category]: list } };
        });
      },

      swapExercise: (category, index, newExercise) => {
        set((state) => {
          const list = [...state.workouts[category]];
          list[index] = newExercise;
          return { workouts: { ...state.workouts, [category]: list } };
        });
      },

      setPhase: (name, week) => {
        set((state) => ({ phase: { ...state.phase, name, week } }));
      },

      updatePR: (exerciseId, value) => {
        set((state) => ({
          prs: {
            ...state.prs,
            [exerciseId]: { value, date: getTodayKey() },
          },
        }));
      },

      setNextLift: (lift) => set(() => ({ nextLift: lift })),

      setEquipmentProfile: (equipment) => set(() => ({ equipmentProfile: equipment })),

      saveWorkout: (workout) => {
        const id = `sw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        set((state) => ({
          savedWorkouts: [{ ...workout, id, createdAt: getTodayKey() }, ...state.savedWorkouts],
        }));
        return id;
      },

      deleteSavedWorkout: (id) =>
        set((state) => ({ savedWorkouts: state.savedWorkouts.filter((w) => w.id !== id) })),

      loadWorkoutIntoLift: (lift, exercises) =>
        set((state) => ({
          workouts: { ...state.workouts, [lift === 'A' ? 'liftA' : 'liftB']: exercises },
        })),

      startSession: ({ source, liftKey, exercises }) => {
        const log = get().log;
        const active: ActiveExercise[] = exercises.map((ex) => {
          const last = getLastEntry(log, ex.id);
          const targetSets = Math.max(1, ex.sets || 1);
          const sets: ActiveSet[] = Array.from({ length: targetSets }, (_, i) => {
            const lastSet = last?.sets[i] ?? last?.sets[0] ?? null;
            // Double-progression: bump weight when top of rep range was hit,
            // otherwise add a rep. Falls back to ex.targetWeight on first session.
            const next = suggestNextLoad(lastSet, ex.reps, 2.5, ex.targetWeight ?? 0);
            return {
              reps: next.reps || parseFirstRep(ex.reps),
              weight: next.weight,
              rpe: lastSet?.rpe,
              done: false,
            };
          });
          return { exerciseId: ex.id, name: ex.name, targetSets, targetReps: ex.reps, sets };
        });
        set({
          activeSession: {
            startedAt: Date.now(),
            source,
            liftKey,
            exercises: active,
            currentIndex: 0,
            restPreset: 90,
          },
        });
      },

      updateActiveSet: (exIdx, setIdx, patch) =>
        set((s) => {
          if (!s.activeSession) return {};
          const exercises = s.activeSession.exercises.map((ex, i) =>
            i !== exIdx
              ? ex
              : { ...ex, sets: ex.sets.map((st, j) => (j !== setIdx ? st : { ...st, ...patch })) }
          );
          return { activeSession: { ...s.activeSession, exercises } };
        }),

      toggleSetDone: (exIdx, setIdx) =>
        set((s) => {
          if (!s.activeSession) return {};
          let nowDone = false;
          const exercises = s.activeSession.exercises.map((ex, i) =>
            i !== exIdx
              ? ex
              : {
                  ...ex,
                  sets: ex.sets.map((st, j) => {
                    if (j !== setIdx) return st;
                    nowDone = !st.done;
                    return { ...st, done: nowDone };
                  }),
                }
          );
          // Auto-start rest when a set is completed (not when un-checking).
          const restEndsAt = nowDone
            ? Date.now() + s.activeSession.restPreset * 1000
            : s.activeSession.restEndsAt;
          return { activeSession: { ...s.activeSession, exercises, restEndsAt } };
        }),

      addActiveSet: (exIdx) =>
        set((s) => {
          if (!s.activeSession) return {};
          const exercises = s.activeSession.exercises.map((ex, i) => {
            if (i !== exIdx) return ex;
            const last = ex.sets[ex.sets.length - 1];
            return {
              ...ex,
              sets: [...ex.sets, { reps: last?.reps ?? 10, weight: last?.weight ?? 0, rpe: last?.rpe, done: false }],
            };
          });
          return { activeSession: { ...s.activeSession, exercises } };
        }),

      removeActiveSet: (exIdx, setIdx) =>
        set((s) => {
          if (!s.activeSession) return {};
          const exercises = s.activeSession.exercises.map((ex, i) =>
            i !== exIdx ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) }
          );
          return { activeSession: { ...s.activeSession, exercises } };
        }),

      setCurrentExercise: (idx) =>
        set((s) => (s.activeSession ? { activeSession: { ...s.activeSession, currentIndex: idx } } : {})),

      setActiveNotes: (exIdx, notes) =>
        set((s) => {
          if (!s.activeSession) return {};
          const exercises = s.activeSession.exercises.map((ex, i) => (i !== exIdx ? ex : { ...ex, notes }));
          return { activeSession: { ...s.activeSession, exercises } };
        }),

      startRest: (seconds) =>
        set((s) =>
          s.activeSession
            ? { activeSession: { ...s.activeSession, restEndsAt: Date.now() + (seconds ?? s.activeSession.restPreset) * 1000 } }
            : {}
        ),

      adjustRest: (deltaSec) =>
        set((s) => {
          if (!s.activeSession?.restEndsAt) return {};
          const restEndsAt = Math.max(Date.now(), s.activeSession.restEndsAt + deltaSec * 1000);
          return { activeSession: { ...s.activeSession, restEndsAt } };
        }),

      stopRest: () =>
        set((s) => (s.activeSession ? { activeSession: { ...s.activeSession, restEndsAt: undefined } } : {})),

      setRestPreset: (seconds) =>
        set((s) => (s.activeSession ? { activeSession: { ...s.activeSession, restPreset: seconds } } : {})),

      completeTrainingBlock: () => {
        const key = getTodayKey();
        set((state) => {
          const day = state.days[key] || createEmptyDayState();
          const block = day.blocks.training;
          const wasComplete = block.total > 0 && block.checked.length >= block.total;
          const checked = Array.from({ length: block.total }, (_, i) => i);
          const newBlocks = { ...day.blocks, training: { ...block, checked } };
          const completionPct = computeCompletionPct(newBlocks);
          let nextLift = state.nextLift;
          if (!wasComplete && block.total > 0) nextLift = nextLift === 'A' ? 'B' : 'A';
          const provisionalDays = { ...state.days, [key]: { blocks: newBlocks, completionPct, streakDay: 0 } };
          const streakDay = computeStreak(provisionalDays);
          return { days: { ...provisionalDays, [key]: { ...provisionalDays[key], streakDay } }, nextLift };
        });
      },

      finishSession: () => {
        const session = get().activeSession;
        if (!session) return;
        const date = getTodayKey();
        for (const ex of session.exercises) {
          const doneSets = ex.sets.filter((st) => st.done);
          if (doneSets.length === 0) continue;
          get().addLogEntry({
            date,
            exerciseId: ex.exerciseId,
            sets: doneSets.map((st) => ({ reps: st.reps, weight: st.weight, rpe: st.rpe })),
            notes: ex.notes || undefined,
          });
        }
        if (session.source === 'lift') get().completeTrainingBlock();
        set({ activeSession: null });
      },

      cancelSession: () => set({ activeSession: null }),

      upsertMetric: (metric) =>
        set((state) => {
          const others = state.metrics.filter((m) => m.date !== metric.date);
          return { metrics: [...others, metric].sort((a, b) => a.date.localeCompare(b.date)) };
        }),

      deleteMetric: (date) =>
        set((state) => ({ metrics: state.metrics.filter((m) => m.date !== date) })),

      getStreak: () => {
        return computeStreak(get().days);
      },
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      migrate: migrateStore,
    }
  )
);

/**
 * Sequential, additive, idempotent store migration. Exported so the backup
 * import path can upgrade older backup files through the exact same pipeline.
 */
export function migrateStore(persistedState: unknown, version: number): AppStore {
  const state = (persistedState as Partial<AppStore>) ?? {};

  // v1 → v2: BlockState shape changed from {done, total} to {checked, total}; nextLift added.
  if (version < 2) {
    if (state.days) {
      for (const dayKey of Object.keys(state.days)) {
        const day = state.days[dayKey];
        if (!day?.blocks) continue;
        for (const blockKey of Object.keys(day.blocks) as (keyof DayState['blocks'])[]) {
          const block = day.blocks[blockKey] as unknown as {
            done?: number;
            total?: number;
            checked?: number[];
          };
          if (!block.checked && typeof block.done === 'number') {
            const done = Math.max(0, Math.min(block.done, block.total ?? block.done));
            block.checked = Array.from({ length: done }, (_, i) => i);
          }
          if (typeof block.total !== 'number') block.total = block.checked?.length ?? 0;
          delete block.done;
        }
      }
    }
    if (!state.nextLift) state.nextLift = 'A';
  }

  // v2 → v3: normalize free-text muscle tags on stored workouts to canonical slugs
  // so the volume chart + muscle heatmap read historical data correctly.
  if (version < 3) {
    if (state.workouts) {
      for (const cat of Object.keys(state.workouts) as (keyof Store['workouts'])[]) {
        const list = state.workouts[cat];
        if (!Array.isArray(list)) continue;
        for (const exercise of list) {
          try {
            if (Array.isArray(exercise.muscles)) {
              exercise.muscles = normalizeMuscles(exercise.muscles);
            }
            if (Array.isArray(exercise.subExercises)) {
              for (const sub of exercise.subExercises) {
                if (Array.isArray(sub.muscles)) sub.muscles = normalizeMuscles(sub.muscles);
              }
            }
          } catch {
            /* skip a malformed entry rather than aborting the whole migration */
          }
        }
      }
    }
  }

  // v3 → v4: equipment profile + saved workouts slices.
  if (version < 4) {
    if (!Array.isArray(state.equipmentProfile)) {
      state.equipmentProfile = ['dumbbell', 'band', 'pull-up bar', 'bodyweight'];
    }
    if (!Array.isArray(state.savedWorkouts)) {
      state.savedWorkouts = [];
    }
  }

  // v4 → v5: active workout session slice (nullable add).
  if (version < 5) {
    if (state.activeSession === undefined) state.activeSession = null;
  }

  // v5 → v6: body metrics slice.
  if (version < 6) {
    if (!Array.isArray(state.metrics)) state.metrics = [];
  }

  // v6 → v7: e1RM PR fields (back-compat optional fields). Backfill from
  // existing log so the user sees historical rep PRs immediately rather than
  // having to re-train every lift before they show up.
  if (version < 7) {
    if (state.prs && Array.isArray(state.log)) {
      const bestByExercise: Record<string, { e1RM: number; reps: number; weight: number; date: string }> = {};
      for (const entry of state.log) {
        const set = bestE1RMSet(entry.sets);
        if (!set) continue;
        const score = e1RM(set.weight, set.reps);
        const prev = bestByExercise[entry.exerciseId];
        if (!prev || score > prev.e1RM) {
          bestByExercise[entry.exerciseId] = { e1RM: score, reps: set.reps, weight: set.weight, date: entry.date };
        }
      }
      for (const [exerciseId, best] of Object.entries(bestByExercise)) {
        const current = state.prs[exerciseId];
        if (!current) continue; // only enrich exercises that already have a weight PR
        if ((current.bestE1RM ?? 0) >= best.e1RM) continue;
        current.bestE1RM = best.e1RM;
        current.bestSetReps = best.reps;
        current.bestSetWeight = best.weight;
        current.bestSetDate = best.date;
      }
    }
  }

  return state as AppStore;
}
