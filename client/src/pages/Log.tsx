// Log — Quick-log form and recent entries grouped by date
// Design: "Ember & Parchment" — warm cards, serif headings, clean form

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useStore } from '@/lib/storage';
import { LIFT_A, LIFT_B, MORNING_BLOCK, EVENING_BLOCK } from '@/lib/seed';
import type { LogEntry } from '@/lib/types';

const ALL_EXERCISES = [...LIFT_A, ...LIFT_B, ...MORNING_BLOCK, ...EVENING_BLOCK];

export default function Log() {
  const log = useStore(s => s.log);
  const addLogEntry = useStore(s => s.addLogEntry);
  const [showForm, setShowForm] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(ALL_EXERCISES[0]?.id || '');
  const [sets, setSets] = useState([{ reps: 10, weight: 0, rpe: 7 }]);
  const [notes, setNotes] = useState('');

  const handleAddSet = () => {
    setSets([...sets, { reps: 10, weight: 0, rpe: 7 }]);
  };

  const handleRemoveSet = (index: number) => {
    setSets(sets.filter((_, i) => i !== index));
  };

  const handleSetChange = (index: number, field: 'reps' | 'weight' | 'rpe', value: number) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
  };

  const handleSubmit = () => {
    if (!selectedExercise) return;
    addLogEntry({
      date: new Date().toISOString().split('T')[0],
      exerciseId: selectedExercise,
      sets: sets.map(s => ({ reps: s.reps, weight: s.weight, rpe: s.rpe })),
      notes: notes || undefined,
    });
    // Reset form
    setSets([{ reps: 10, weight: 0, rpe: 7 }]);
    setNotes('');
    setShowForm(false);
  };

  // Group log entries by date
  const groupedLog = log.reduce<Record<string, LogEntry[]>>((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedLog).sort((a, b) => b.localeCompare(a));

  return (
    <div className="pb-24 pt-4">
      <div className="flex items-center justify-between mb-5">
        <h1
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Training Log
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: 'var(--vt-accent)' }}
          aria-label={showForm ? 'Close form' : 'Add entry'}
        >
          {showForm ? <X size={18} className="text-white" /> : <Plus size={18} className="text-white" />}
        </button>
      </div>

      {/* Quick-log form */}
      {showForm && (
        <div className="mb-5 rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Quick Log</h3>

          {/* Exercise picker */}
          <div className="mb-3">
            <label className="text-xs text-muted-foreground mb-1 block">Exercise</label>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
            >
              {ALL_EXERCISES.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          {/* Sets */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted-foreground">Sets</label>
              <button
                onClick={handleAddSet}
                className="text-xs font-medium"
                style={{ color: 'var(--vt-accent)' }}
              >
                + Add Set
              </button>
            </div>
            <div className="space-y-2">
              {sets.map((set, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => handleSetChange(i, 'reps', Number(e.target.value))}
                        className="w-full rounded-md border border-border bg-secondary px-2 py-1.5 text-xs text-foreground text-center"
                        placeholder="Reps"
                        min={0}
                      />
                      <span className="text-[9px] text-muted-foreground block text-center mt-0.5">reps</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) => handleSetChange(i, 'weight', Number(e.target.value))}
                        className="w-full rounded-md border border-border bg-secondary px-2 py-1.5 text-xs text-foreground text-center"
                        placeholder="kg"
                        min={0}
                      />
                      <span className="text-[9px] text-muted-foreground block text-center mt-0.5">kg</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={set.rpe}
                        onChange={(e) => handleSetChange(i, 'rpe', Number(e.target.value))}
                        className="w-full rounded-md border border-border bg-secondary px-2 py-1.5 text-xs text-foreground text-center"
                        placeholder="RPE"
                        min={1}
                        max={10}
                      />
                      <span className="text-[9px] text-muted-foreground block text-center mt-0.5">RPE</span>
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

          {/* Notes */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground resize-none"
              rows={2}
              placeholder="How did it feel?"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--vt-accent)' }}
          >
            Log Entry
          </button>
        </div>
      )}

      {/* Recent entries */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">No entries yet.</p>
          <p className="text-muted-foreground text-xs mt-1">Tap + to log your first workout.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => (
            <div key={date}>
              <h3
                className="text-sm font-semibold text-foreground mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </h3>
              <div className="space-y-2">
                {groupedLog[date].map(entry => {
                  const exercise = ALL_EXERCISES.find(e => e.id === entry.exerciseId);
                  return (
                    <div key={entry.id} className="rounded-lg border border-border bg-card px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground">
                          {exercise?.name || entry.exerciseId}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.sets.length} sets
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {entry.sets.map((set, i) => (
                          <span key={i} className="text-xs text-muted-foreground">
                            {set.reps}×{set.weight}kg{set.rpe ? ` @${set.rpe}` : ''}
                          </span>
                        ))}
                      </div>
                      {entry.notes && (
                        <p className="mt-1 text-xs text-muted-foreground italic">{entry.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
