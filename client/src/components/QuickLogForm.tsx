// QuickLogForm — manual log-entry form. Originally lived inside Log.tsx; now
// reusable so Progress > History can host it after the Log tab was merged
// away. Auto-logging via finishSession() handles the common path; this form
// is for the rare manual entry (forgot to start the workout, etc).

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/lib/storage';
import { EXERCISE_LIBRARY } from '@/lib/exercises';
import { todayKey } from '@/lib/date';
import { fromUnit, toUnit } from '@/lib/units';

interface PickerItem {
  id: string;
  name: string;
}

interface QuickLogFormProps {
  /** Date (YYYY-MM-DD) to log against. Defaults to today. */
  date?: string;
  onLogged?: () => void;
}

export default function QuickLogForm({ date, onLogged }: QuickLogFormProps) {
  const workouts = useStore((s) => s.workouts);
  const addLogEntry = useStore((s) => s.addLogEntry);
  const units = useStore((s) => s.user.units ?? 'kg');

  const allExercises = useMemo<PickerItem[]>(() => {
    const map = new Map<string, PickerItem>();
    for (const lib of EXERCISE_LIBRARY) map.set(lib.id, { id: lib.id, name: lib.name });
    [...workouts.liftA, ...workouts.liftB, ...workouts.custom].forEach((e) =>
      map.set(e.id, { id: e.id, name: e.name }),
    );
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [workouts]);

  const [selectedExercise, setSelectedExercise] = useState(allExercises[0]?.id ?? '');
  // Sets are stored in DISPLAY units so the input round-trips cleanly; converted
  // to kg on submit. Keeps the form value-stable as the user toggles units.
  const [sets, setSets] = useState([{ reps: 10, weight: 0, rpe: 7 }]);
  const [notes, setNotes] = useState('');

  const handleAddSet = () => setSets([...sets, { reps: 10, weight: 0, rpe: 7 }]);
  const handleRemoveSet = (index: number) => setSets(sets.filter((_, i) => i !== index));
  const handleSetChange = (index: number, field: 'reps' | 'weight' | 'rpe', value: number) => {
    const next = [...sets];
    next[index] = { ...next[index], [field]: value };
    setSets(next);
  };

  const handleSubmit = () => {
    if (!selectedExercise) return;
    addLogEntry({
      date: date ?? todayKey(),
      exerciseId: selectedExercise,
      sets: sets.map((s) => ({ reps: s.reps, weight: fromUnit(s.weight, units), rpe: s.rpe })),
      notes: notes || undefined,
    });
    setSets([{ reps: 10, weight: 0, rpe: 7 }]);
    setNotes('');
    onLogged?.();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Exercise</label>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
        >
          {allExercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs text-muted-foreground">Sets</label>
          <button onClick={handleAddSet} className="text-xs font-medium" style={{ color: 'var(--vt-accent)' }}>
            + Add set
          </button>
        </div>
        <div className="space-y-2">
          {sets.map((set, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-4 text-center text-xs text-muted-foreground">{i + 1}</span>
              <div className="grid flex-1 grid-cols-3 gap-2">
                <div>
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) => handleSetChange(i, 'reps', Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-secondary px-2 py-1.5 text-center text-xs text-foreground"
                    min={0}
                  />
                  <span className="mt-0.5 block text-center text-[9px] text-muted-foreground">reps</span>
                </div>
                <div>
                  <input
                    type="number"
                    value={Number(toUnit(set.weight, units).toFixed(2))}
                    onChange={(e) => handleSetChange(i, 'weight', Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-secondary px-2 py-1.5 text-center text-xs text-foreground"
                    min={0}
                    step={units === 'kg' ? 0.5 : 1}
                  />
                  <span className="mt-0.5 block text-center text-[9px] text-muted-foreground">{units}</span>
                </div>
                <div>
                  <input
                    type="number"
                    value={set.rpe}
                    onChange={(e) => handleSetChange(i, 'rpe', Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-secondary px-2 py-1.5 text-center text-xs text-foreground"
                    min={1}
                    max={10}
                  />
                  <span className="mt-0.5 block text-center text-[9px] text-muted-foreground">RPE</span>
                </div>
              </div>
              {sets.length > 1 && (
                <button
                  onClick={() => handleRemoveSet(i)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Remove set"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
          rows={2}
          placeholder="How did it feel?"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--vt-accent)' }}
      >
        Log entry
      </button>
    </div>
  );
}
