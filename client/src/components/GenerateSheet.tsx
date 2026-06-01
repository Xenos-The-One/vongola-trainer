// GenerateSheet — modal launched from Today to (re)generate a workout.
// Two paths: single-day "just for today" generation, or an N-day rotating
// weekly plan. Both write into the weeklyPlan slice so the Today screen
// always reads from a single source of truth.

import { useState } from 'react';
import { Wand2, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { useStore } from '@/lib/storage';
import { generateWeeklyPlan, MIN_DAYS, MAX_DAYS } from '@/lib/weeklyPlan';
import type { Equipment } from '@/lib/exercises';
import { todayKey } from '@/lib/date';

type Mode = 'today' | 'week';

interface GenerateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GenerateSheet({ open, onOpenChange }: GenerateSheetProps) {
  const equipment = useStore((s) => s.equipmentProfile) as Equipment[];
  const log = useStore((s) => s.log);
  const setWeeklyPlan = useStore((s) => s.setWeeklyPlan);
  const savedWorkouts = useStore((s) => s.savedWorkouts);
  const savedPlans = useStore((s) => s.savedPlans);
  const loadSavedPlan = useStore((s) => s.loadSavedPlan);
  const deleteSavedPlan = useStore((s) => s.deleteSavedPlan);

  const [mode, setMode] = useState<Mode>('today');
  const [days, setDays] = useState<number | null>(null);

  const reset = () => {
    setMode('today');
    setDays(null);
  };

  const handleGenerate = () => {
    if (mode === 'today') {
      const plan = generateWeeklyPlan({ daysPerWeek: 1, equipment, log });
      setWeeklyPlan(plan);
    } else {
      if (!days) return; // user must pick
      const plan = generateWeeklyPlan({ daysPerWeek: days, equipment, log });
      setWeeklyPlan(plan);
    }
    reset();
    onOpenChange(false);
  };

  /** Load a saved workout as today's plan (single-day rotation). */
  const handleLoadSaved = (workoutId: string) => {
    const w = savedWorkouts.find((sw) => sw.id === workoutId);
    if (!w) return;
    setWeeklyPlan({
      id: `wp-saved-${w.id}`,
      createdAt: todayKey(),
      daysPerWeek: 1,
      days: [{ index: 0, title: w.name, split: 'full-body', exercises: w.exercises }],
      currentIndex: 0,
    });
    reset();
    onOpenChange(false);
  };

  const canGenerate = mode === 'today' || (mode === 'week' && days !== null);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle style={{ fontFamily: "'Playfair Display', serif" }}>Generate workout</SheetTitle>
          <SheetDescription>
            Today only or a full rotating plan — balanced for the muscles you actually train.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 pt-2">
          {/* Mode selector */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('today')}
              className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                mode === 'today'
                  ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]/10 text-foreground'
                  : 'border-border text-muted-foreground'
              }`}
            >
              <p className="font-semibold">Today only</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">One full-body session</p>
            </button>
            <button
              type="button"
              onClick={() => setMode('week')}
              className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                mode === 'week'
                  ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]/10 text-foreground'
                  : 'border-border text-muted-foreground'
              }`}
            >
              <p className="font-semibold">Weekly plan</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Rotating split, you pick N</p>
            </button>
          </div>

          {/* Day picker — only shown for week mode */}
          {mode === 'week' && (
            <div className="mb-4">
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Training days per rotation
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {Array.from({ length: MAX_DAYS - MIN_DAYS + 1 }, (_, i) => MIN_DAYS + i).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDays(d)}
                    className={`rounded-lg border py-2 text-sm font-semibold transition-colors ${
                      days === d
                        ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]/10 text-foreground'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                3 → Full Body × 3 · 4 → U/L × 2 · 5 → PPL + U/L · 6 → PPL × 2
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { reset(); onOpenChange(false); }}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground"
            >
              <X size={14} className="mr-1.5 inline" /> Cancel
            </button>
            <button
              type="button"
              disabled={!canGenerate}
              onClick={handleGenerate}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: 'var(--vt-accent)' }}
            >
              <Wand2 size={14} className="mr-1.5 inline" /> Generate
            </button>
          </div>

          {/* Saved PLANS — multi-day plans the user named and kept. */}
          {savedPlans.length > 0 && (
            <div className="mt-5 border-t border-border pt-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Saved plans</p>
              <div className="space-y-1.5">
                {savedPlans.slice(0, 6).map((sp) => (
                  <div key={sp.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        loadSavedPlan(sp.id);
                        reset();
                        onOpenChange(false);
                      }}
                      className="flex flex-1 items-center justify-between rounded-lg border border-border px-3 py-2 text-left transition-colors hover:border-[var(--vt-accent)]/40"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-card-foreground truncate">{sp.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {sp.plan.daysPerWeek === 1 ? 'Single day' : `${sp.plan.daysPerWeek} days/week`} · saved {sp.savedAt}
                        </p>
                      </div>
                      <span className="text-[11px] font-medium" style={{ color: 'var(--vt-accent)' }}>Load</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSavedPlan(sp.id)}
                      aria-label={`Delete ${sp.name}`}
                      className="shrink-0 p-1.5 text-muted-foreground hover:text-destructive"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved single workouts — load one as today's plan instead of generating fresh. */}
          {savedWorkouts.length > 0 && (
            <div className="mt-5 border-t border-border pt-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Or load a saved workout</p>
              <div className="space-y-1.5">
                {savedWorkouts.slice(0, 6).map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleLoadSaved(w.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left transition-colors hover:border-[var(--vt-accent)]/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-card-foreground truncate">{w.name}</p>
                      <p className="text-[10px] text-muted-foreground">{w.exercises.length} exercises · {w.createdAt}</p>
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--vt-accent)' }}>Load</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
