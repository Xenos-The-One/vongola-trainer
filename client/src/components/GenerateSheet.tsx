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

type Mode = 'today' | 'week';

interface GenerateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GenerateSheet({ open, onOpenChange }: GenerateSheetProps) {
  const equipment = useStore((s) => s.equipmentProfile) as Equipment[];
  const log = useStore((s) => s.log);
  const setWeeklyPlan = useStore((s) => s.setWeeklyPlan);

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
        </div>
      </SheetContent>
    </Sheet>
  );
}
