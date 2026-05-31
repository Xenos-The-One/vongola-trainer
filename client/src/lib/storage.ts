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
} from './types';
import { createDefaultStore } from './seed';
import { normalizeMuscles } from './muscles';

export const STORAGE_KEY = 'vongola-trainer-v1';
export const SCHEMA_VERSION = 3;

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
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

function computeStreak(days: Record<string, DayState>): number {
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    const day = days[key];

    if (i === 0 && !day) break; // today hasn't started
    if (!day || day.completionPct < 75) {
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

        // Check for PR
        const maxWeight = Math.max(...entry.sets.map((s) => s.weight));
        if (maxWeight > 0) {
          const currentPR = get().prs[entry.exerciseId];
          if (!currentPR || maxWeight > currentPR.value) {
            get().updatePR(entry.exerciseId, maxWeight);
          }
        }
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

  return state as AppStore;
}
