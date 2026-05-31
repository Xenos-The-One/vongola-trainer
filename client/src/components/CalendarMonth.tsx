// CalendarMonth — month grid shaded by daily completion, with a per-day dot when
// a workout was logged. Tapping a day opens a detail drawer. Lives in Progress → History.

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useStore } from '@/lib/storage';
import type { Exercise } from '@/lib/types';
import { getLibraryExercise } from '@/lib/exercises';
import { humanizeId } from '@/lib/utils';
import { getHeatColor } from '@/lib/heat';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import QuickLogForm from './QuickLogForm';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function ymd(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function CalendarMonth() {
  const days = useStore((s) => s.days);
  const log = useStore((s) => s.log);
  const workouts = useStore((s) => s.workouts);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showLogForm, setShowLogForm] = useState(false);

  const resolveName = (id: string): string =>
    getLibraryExercise(id)?.name ??
    [...workouts.liftA, ...workouts.liftB, ...workouts.custom].find((e: Exercise) => e.id === id)?.name ??
    humanizeId(id);

  const todayStr = ymd(now.getFullYear(), now.getMonth(), now.getDate());

  // Set of dates that have at least one logged entry (for the dot indicator).
  const loggedDates = useMemo(() => new Set(log.map((e) => e.date)), [log]);

  const cells = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: ({ day: number; key: string } | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push({ day: d, key: ymd(year, month, d) });
    return out;
  }, [year, month]);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const selectedDay = selectedDate ? days[selectedDate] : undefined;
  const selectedLogs = selectedDate ? log.filter((e) => e.date === selectedDate) : [];

  return (
    <>
      {/* Manual log-entry — replaces the removed Log tab. Auto-logging from
          finishSession() covers the common path; this is for backfill. */}
      <div className="mb-4 rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setShowLogForm((s) => !s)}
          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary/30"
          aria-expanded={showLogForm}
        >
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">Manually log an entry</h3>
            <p className="text-[11px] text-muted-foreground">For workouts you finished without starting the live session.</p>
          </div>
          {showLogForm ? <X size={16} className="text-muted-foreground" /> : <Plus size={16} className="text-muted-foreground" />}
        </button>
        {showLogForm && (
          <div className="border-t border-border px-4 py-3">
            <QuickLogForm
              onLogged={() => {
                toast.success('Logged');
                setShowLogForm(false);
              }}
            />
          </div>
        )}
      </div>

    <div className="rounded-xl border border-border bg-card p-4">
      {/* Month nav */}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={prevMonth} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-sm font-semibold text-card-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          {MONTHS[month]} {year}
        </h3>
        <button onClick={nextMonth} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday header */}
      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[9px] font-medium text-muted-foreground">
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, i) =>
          cell === null ? (
            <div key={`pad-${i}`} />
          ) : (
            <button
              key={cell.key}
              onClick={() => setSelectedDate(cell.key)}
              className="relative flex aspect-square items-center justify-center rounded-md text-[11px] transition-colors"
              style={{
                backgroundColor: getHeatColor(days[cell.key]?.completionPct ?? 0),
                outline: cell.key === todayStr ? '1.5px solid var(--vt-accent)' : 'none',
              }}
              title={`${cell.key}: ${days[cell.key]?.completionPct ?? 0}%`}
            >
              <span className={(days[cell.key]?.completionPct ?? 0) >= 50 ? 'font-semibold text-white' : 'text-card-foreground'}>
                {cell.day}
              </span>
              {loggedDates.has(cell.key) && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full" style={{ backgroundColor: 'var(--vt-accent)' }} />
              )}
            </button>
          )
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1">
        <span className="text-[9px] text-muted-foreground">Less</span>
        <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: getHeatColor(0) }} />
        <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: getHeatColor(50) }} />
        <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: getHeatColor(75) }} />
        <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: getHeatColor(100) }} />
        <span className="text-[9px] text-muted-foreground">More</span>
      </div>

      {/* Day detail drawer */}
      <Sheet open={selectedDate !== null} onOpenChange={(o) => !o && setSelectedDate(null)}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle style={{ fontFamily: "'Playfair Display', serif" }}>
              {selectedDate &&
                new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
            </SheetTitle>
            <SheetDescription>
              {selectedDay ? `${selectedDay.completionPct}% of today's workout done` : 'No activity recorded'}
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 pb-6">
            {/* Training completion summary */}
            {selectedDay && selectedDay.training.total > 0 && (
              <div className="mb-4 rounded-lg border border-border p-3 text-center">
                <p className="text-xs font-medium text-card-foreground">Workout</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--vt-accent)' }}>
                  {selectedDay.training.checked.length}/{selectedDay.training.total} exercises
                </p>
              </div>
            )}

            {/* Logged exercises */}
            <h4 className="mb-2 text-sm font-semibold text-card-foreground">Logged</h4>
            {selectedLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nothing logged this day.</p>
            ) : (
              <div className="space-y-2">
                {selectedLogs.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-border px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-card-foreground">{resolveName(entry.exerciseId)}</span>
                      <span className="text-xs text-muted-foreground">{entry.sets.length} sets</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {entry.sets.map((set, i) => (
                        <span key={i} className="text-xs text-muted-foreground">
                          {set.reps}×{set.weight}kg{set.rpe ? ` @${set.rpe}` : ''}
                        </span>
                      ))}
                    </div>
                    {entry.notes && <p className="mt-1 text-xs italic text-muted-foreground">{entry.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
    </>
  );
}
