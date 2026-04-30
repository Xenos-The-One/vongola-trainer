// Protocol — Current phase plan with editable workout templates
// Design: "Ember & Parchment" — warm cards, serif headings, editable fields

import { useState } from 'react';
import { Edit3, Save, X } from 'lucide-react';
import { useStore } from '@/lib/storage';
import type { Exercise } from '@/lib/types';

function ExerciseRow({ exercise, onEdit }: { exercise: Exercise; onEdit?: (ex: Exercise) => void }) {
  const [editing, setEditing] = useState(false);
  const [tempWeight, setTempWeight] = useState(exercise.targetWeight?.toString() || '');
  const [tempReps, setTempReps] = useState(exercise.reps);

  const handleSave = () => {
    if (onEdit) {
      onEdit({
        ...exercise,
        reps: tempReps,
        targetWeight: tempWeight ? Number(tempWeight) : undefined,
      });
    }
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-card-foreground">{exercise.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {editing ? (
            <>
              <input
                type="text"
                value={tempReps}
                onChange={(e) => setTempReps(e.target.value)}
                className="w-16 rounded border border-border bg-secondary px-1.5 py-0.5 text-xs text-foreground"
                placeholder="Reps"
              />
              <input
                type="number"
                value={tempWeight}
                onChange={(e) => setTempWeight(e.target.value)}
                className="w-14 rounded border border-border bg-secondary px-1.5 py-0.5 text-xs text-foreground"
                placeholder="kg"
              />
            </>
          ) : (
            <>
              <span className="text-xs text-muted-foreground">
                {exercise.sets}×{exercise.reps}
              </span>
              {exercise.targetWeight && (
                <span className="text-xs text-muted-foreground">@ {exercise.targetWeight}kg</span>
              )}
            </>
          )}
          <span className="text-[10px] text-muted-foreground/60">
            {exercise.muscles.join(', ')}
          </span>
        </div>
      </div>
      {onEdit && (
        <div className="shrink-0">
          {editing ? (
            <div className="flex gap-1">
              <button onClick={handleSave} className="p-1 text-green-400 hover:text-green-300" aria-label="Save">
                <Save size={14} />
              </button>
              <button onClick={() => setEditing(false)} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Cancel">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Edit">
              <Edit3 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function WorkoutSection({ title, exercises, category }: { title: string; exercises: Exercise[]; category: keyof ReturnType<typeof useStore.getState>['workouts'] }) {
  const updateExercise = useStore(s => s.updateExercise);

  const handleEdit = (index: number, exercise: Exercise) => {
    updateExercise(category, index, exercise);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 mb-4">
      <h3
        className="text-base font-semibold text-card-foreground mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h3>
      <div>
        {exercises.map((ex, i) => (
          <ExerciseRow
            key={ex.id}
            exercise={ex}
            onEdit={(updated) => handleEdit(i, updated)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Protocol() {
  const workouts = useStore(s => s.workouts);
  const phase = useStore(s => s.phase);

  return (
    <div className="pb-24 pt-4">
      <h1
        className="text-2xl font-bold text-foreground mb-1"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Protocol
      </h1>
      <p className="text-sm text-muted-foreground mb-5">
        {phase.name} · Week {phase.week}
      </p>

      <WorkoutSection title="Lift A — Push + Squat" exercises={workouts.liftA} category="liftA" />
      <WorkoutSection title="Lift B — Pull + Hinge" exercises={workouts.liftB} category="liftB" />
      <WorkoutSection title="Morning Block" exercises={workouts.morning} category="morning" />
      <WorkoutSection title="Evening Block" exercises={workouts.evening} category="evening" />
    </div>
  );
}
