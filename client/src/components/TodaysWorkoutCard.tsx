// TodaysWorkoutCard — replaces the old TaskBlock for the training surface.
// Shows the day's planned exercises with movement icons + per-exercise info
// buttons that open ExerciseDetail. The whole point of the post-chore Today
// is: "what am I lifting today + how do I start it."

import { useState } from 'react';
import { Info } from 'lucide-react';
import type { Exercise } from '@/lib/types';
import { useStore } from '@/lib/storage';
import { iconForExercise } from '@/lib/movementIcons';
import { getLibraryExercise, type LibraryExercise } from '@/lib/exercises';
import { summarizeEntry, getLastEntry } from '@/lib/lastPerformance';
import { todayKey } from '@/lib/date';
import ExerciseDetail from './ExerciseDetail';

interface TodaysWorkoutCardProps {
  title: string;
  subtitle?: string;
  exercises: Exercise[];
}

export default function TodaysWorkoutCard({ title, subtitle, exercises }: TodaysWorkoutCardProps) {
  const log = useStore((s) => s.log);
  const units = useStore((s) => s.user.units ?? 'kg');
  // Subscribe to the underlying day slice directly. Calling
  // `s.getTodayState()` inside the selector returned a fresh object every
  // render, which Zustand interpreted as a state change → infinite loop.
  const todayKeyStr = todayKey();
  const todayDay = useStore((s) => s.days[todayKeyStr]);
  const [detail, setDetail] = useState<LibraryExercise | null>(null);

  const checked = todayDay?.training?.checked ?? [];

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        <ul className="divide-y divide-border">
          {exercises.map((ex, i) => {
            const Icon = iconForExercise(ex);
            const lib = getLibraryExercise(ex.id);
            const last = summarizeEntry(getLastEntry(log, ex.id), units);
            const isChecked = checked.includes(i);
            const target = ex.targetWeight ? `${ex.sets}×${ex.reps} @ ${ex.targetWeight}${units}` : `${ex.sets}×${ex.reps}`;
            return (
              <li key={`${ex.id}-${i}`} className="flex items-center gap-3 px-4 py-3">
                <Icon size={20} className={isChecked ? 'text-[var(--vt-accent)]' : 'text-muted-foreground'} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isChecked ? 'text-muted-foreground line-through' : 'text-card-foreground'}`}>
                    {ex.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {target}
                    {last ? ` · last ${last}` : ''}
                  </p>
                </div>
                {lib && (
                  <button
                    type="button"
                    onClick={() => setDetail(lib)}
                    aria-label={`How to do ${ex.name}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Info size={16} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <ExerciseDetail exercise={detail} onClose={() => setDetail(null)} />
    </>
  );
}
