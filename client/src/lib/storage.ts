// Vongola Trainer — Storage & State Management
// Uses Zustand with localStorage persistence under key 'vongola-trainer-v1'

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Store, DayState, LogEntry, Exercise, AccentKey, ThemeMode, FontSize, BlockState } from './types';
import { createDefaultStore } from './seed';

const STORAGE_KEY = 'vongola-trainer-v1';

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function createEmptyDayState(): DayState {
  return {
    blocks: {
      training: { done: 0, total: 5 },
      coach: { done: 0, total: 6 },
      morning: { done: 0, total: 11 },
      work: { done: 0, total: 6 },
      evening: { done: 0, total: 6 },
    },
    completionPct: 0,
    streakDay: 0,
  };
}

function computeCompletionPct(blocks: DayState['blocks']): number {
  let done = 0;
  let total = 0;
  Object.values(blocks).forEach((block: BlockState) => {
    done += block.done;
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
  toggleTask: (blockKey: keyof DayState['blocks'], delta: 1 | -1) => void;
  
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

      toggleTask: (blockKey, delta) => {
        const key = getTodayKey();
        set((state) => {
          const currentDay = state.days[key] || createEmptyDayState();
          const block = currentDay.blocks[blockKey];
          const newDone = Math.max(0, Math.min(block.total, block.done + delta));
          
          const newBlocks = {
            ...currentDay.blocks,
            [blockKey]: { ...block, done: newDone },
          };
          
          const completionPct = computeCompletionPct(newBlocks);
          const newDays = {
            ...state.days,
            [key]: {
              blocks: newBlocks,
              completionPct,
              streakDay: computeStreak({ ...state.days, [key]: { blocks: newBlocks, completionPct, streakDay: 0 } }),
            },
          };

          return { days: newDays };
        });
      },

      addLogEntry: (entry) => {
        const id = `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        set((state) => ({
          log: [...state.log, { ...entry, id }],
        }));
        
        // Check for PR
        const maxWeight = Math.max(...entry.sets.map(s => s.weight));
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
      setStarter: (starter) => set((state) => ({ user: { ...state.user, starter: starter as any } })),

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

      getStreak: () => {
        return computeStreak(get().days);
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
