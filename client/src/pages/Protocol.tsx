// Protocol — hub: Plan (editable templates) · Generate · Routines · Library.
// Design: "Ember & Parchment" — warm cards, serif headings.

import { useMemo, useState } from 'react';
import { Edit3, Save, X, Dumbbell, Wand2, ChevronDown, ChevronRight, Info, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/lib/storage';
import type { Exercise, LiftKey } from '@/lib/types';
import {
  EXERCISE_LIBRARY,
  getLibraryExercise,
  toExercise,
  type Equipment,
  type LibraryExercise,
} from '@/lib/exercises';
import { generateWorkout, SPLITS, type SplitType, type GeneratedWorkout } from '@/lib/generator';
import { ROUTINES, routineDayToExercises } from '@/lib/routines';
import { MUSCLE_DISPLAY } from '@/lib/muscles';
import { weeksSince } from '@/lib/date';
import SegmentedTabs from '@/components/SegmentedTabs';
import MuscleMap from '@/components/MuscleMap';
import ExerciseDetail from '@/components/ExerciseDetail';
import CustomExerciseForm from '@/components/CustomExerciseForm';

/* ----------------------------- Plan (templates) ----------------------------- */

function ExerciseRow({ exercise, onEdit }: { exercise: Exercise; onEdit?: (ex: Exercise) => void }) {
  const [editing, setEditing] = useState(false);
  const [tempWeight, setTempWeight] = useState(exercise.targetWeight?.toString() || '');
  const [tempReps, setTempReps] = useState(exercise.reps);

  const handleSave = () => {
    onEdit?.({ ...exercise, reps: tempReps, targetWeight: tempWeight ? Number(tempWeight) : undefined });
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
              {exercise.targetWeight ? (
                <span className="text-xs text-muted-foreground">@ {exercise.targetWeight}kg</span>
              ) : null}
            </>
          )}
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

function PlanTab() {
  const workouts = useStore((s) => s.workouts);
  const phase = useStore((s) => s.phase);
  const updateExercise = useStore((s) => s.updateExercise);

  const sections: { title: string; category: keyof typeof workouts; list: Exercise[] }[] = [
    { title: 'Lift A — Push + Squat', category: 'liftA', list: workouts.liftA },
    { title: 'Lift B — Pull + Hinge', category: 'liftB', list: workouts.liftB },
  ];

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        {phase.name} · Week {weeksSince(phase.startDate)}
      </p>
      {sections.map((sec) => (
        <div key={sec.category} className="rounded-xl border border-border bg-card p-4 mb-4">
          <h3 className="text-base font-semibold text-card-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {sec.title}
          </h3>
          <div>
            {sec.list.map((ex, i) => (
              <ExerciseRow key={ex.id} exercise={ex} onEdit={(updated) => updateExercise(sec.category, i, updated)} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

/* ------------------------------ shared helpers ------------------------------ */

function LoadButtons({ onLoad }: { onLoad: (lift: LiftKey) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => onLoad('A')}
        className="rounded-lg border border-border py-2 text-xs font-medium text-card-foreground transition-colors hover:border-[var(--vt-accent)]/40"
      >
        Load into Lift A
      </button>
      <button
        onClick={() => onLoad('B')}
        className="rounded-lg border border-border py-2 text-xs font-medium text-card-foreground transition-colors hover:border-[var(--vt-accent)]/40"
      >
        Load into Lift B
      </button>
    </div>
  );
}

function ExerciseListRow({ ex, onInfo }: { ex: LibraryExercise; onInfo: () => void }) {
  const r = toExercise(ex);
  return (
    <div className="flex items-center gap-2 py-2 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-card-foreground truncate">{ex.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {r.sets}×{r.reps} · {ex.primaryMuscles.map((m) => MUSCLE_DISPLAY[m]).join(', ') || ex.category}
        </p>
      </div>
      <button onClick={onInfo} className="p-1.5 text-muted-foreground hover:text-foreground" aria-label={`About ${ex.name}`}>
        <Info size={15} />
      </button>
    </div>
  );
}

/* -------------------------------- Generate --------------------------------- */

function GenerateTab({ onDetail }: { onDetail: (ex: LibraryExercise) => void }) {
  const equipmentProfile = useStore((s) => s.equipmentProfile);
  const log = useStore((s) => s.log);
  const savedWorkouts = useStore((s) => s.savedWorkouts);
  const loadWorkoutIntoLift = useStore((s) => s.loadWorkoutIntoLift);
  const saveWorkout = useStore((s) => s.saveWorkout);
  const deleteSavedWorkout = useStore((s) => s.deleteSavedWorkout);

  const [split, setSplit] = useState<SplitType>('full-body');
  const [count, setCount] = useState(5);
  const [result, setResult] = useState<GeneratedWorkout | null>(null);

  const generate = () => {
    setResult(
      generateWorkout({ split, equipment: equipmentProfile as Equipment[], exerciseCount: count, log })
    );
  };

  const load = (lift: LiftKey, exercises: Exercise[], label: string) => {
    loadWorkoutIntoLift(lift, exercises);
    toast.success(`${label} loaded into Lift ${lift}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <label className="text-sm font-semibold text-card-foreground block mb-2">Split</label>
        <div className="grid grid-cols-3 gap-2">
          {SPLITS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSplit(s.key)}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                split === s.key ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]/10 text-foreground' : 'border-border text-muted-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-card-foreground">Exercises</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setCount((c) => Math.max(3, c - 1))} className="h-7 w-7 rounded-full border border-border text-foreground">−</button>
            <span className="w-5 text-center text-sm font-semibold text-foreground">{count}</span>
            <button onClick={() => setCount((c) => Math.min(8, c + 1))} className="h-7 w-7 rounded-full border border-border text-foreground">+</button>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Using: {equipmentProfile.join(', ') || 'bodyweight'} · set your gear in Settings.
        </p>

        <button
          onClick={generate}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--vt-accent)' }}
        >
          <Wand2 size={16} /> {result ? 'Regenerate' : 'Generate workout'}
        </button>
      </div>

      {result && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-base font-semibold text-card-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {result.title}
          </h3>
          <MuscleMap intensities={result.coverage} view="both" />
          {result.uncovered.length > 0 && (
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Not hit: {result.uncovered.map((m) => MUSCLE_DISPLAY[m]).join(', ')}
            </p>
          )}
          <div className="mt-3">
            {result.picks.map((p) => (
              <ExerciseListRow key={p.id} ex={p} onInfo={() => onDetail(p)} />
            ))}
          </div>
          <div className="mt-3 space-y-2">
            <LoadButtons onLoad={(lift) => load(lift, result.exercises, result.title)} />
            <button
              onClick={() => {
                saveWorkout({ name: result.title, source: 'generated', exercises: result.exercises });
                toast.success('Workout saved');
              }}
              className="w-full rounded-lg border border-border py-2 text-xs font-medium text-card-foreground transition-colors hover:border-[var(--vt-accent)]/40"
            >
              Save workout
            </button>
          </div>
        </div>
      )}

      {savedWorkouts.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Saved workouts</h3>
          <div className="space-y-2">
            {savedWorkouts.map((w) => (
              <div key={w.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-card-foreground">{w.name}</span>
                  <button onClick={() => deleteSavedWorkout(w.id)} className="p-1 text-muted-foreground hover:text-destructive" aria-label="Delete">
                    <X size={14} />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">
                  {w.exercises.length} exercises · {w.createdAt}
                </p>
                <LoadButtons onLoad={(lift) => load(lift, w.exercises, w.name)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------- Routines --------------------------------- */

function RoutinesTab({ onDetail }: { onDetail: (ex: LibraryExercise) => void }) {
  const loadWorkoutIntoLift = useStore((s) => s.loadWorkoutIntoLift);
  const [openId, setOpenId] = useState<string | null>(ROUTINES[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {ROUTINES.map((routine) => {
        const open = openId === routine.id;
        return (
          <div key={routine.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setOpenId(open ? null : routine.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50"
            >
              {open ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-card-foreground">{routine.name}</h3>
                <p className="text-[11px] text-muted-foreground">{routine.description}</p>
              </div>
            </button>
            {open && (
              <div className="border-t border-border px-4 py-2">
                {routine.days.map((day) => (
                  <div key={day.name} className="py-2">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-card-foreground">{day.name}</span>
                    </div>
                    {day.exerciseIds.map((id) => {
                      const ex = getLibraryExercise(id);
                      if (!ex) return null;
                      return <ExerciseListRow key={id} ex={ex} onInfo={() => onDetail(ex)} />;
                    })}
                    <div className="mt-2">
                      <LoadButtons
                        onLoad={(lift) => {
                          loadWorkoutIntoLift(lift, routineDayToExercises(day));
                          toast.success(`${routine.name} — ${day.name} loaded into Lift ${lift}`);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------- Library --------------------------------- */

function LibraryTab({ onDetail }: { onDetail: (ex: LibraryExercise) => void }) {
  const [query, setQuery] = useState('');
  const customExercises = useStore((s) => s.customExercises);
  const deleteCustomExercise = useStore((s) => s.deleteCustomExercise);
  const [showAdd, setShowAdd] = useState(false);

  // Merge static + custom for search; custom shadowed by static when ids collide.
  const merged = useMemo(() => {
    const seen = new Set(EXERCISE_LIBRARY.map((e) => e.id));
    const customLib = customExercises
      .filter((c) => !seen.has(c.id))
      .map((c) => getLibraryExercise(c.id, customExercises))
      .filter((e): e is LibraryExercise => !!e);
    return [...EXERCISE_LIBRARY, ...customLib];
  }, [customExercises]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return merged;
    return merged.filter(
      (e) => e.name.toLowerCase().includes(q) || e.primaryMuscles.some((m) => MUSCLE_DISPLAY[m]?.toLowerCase().includes(q))
    );
  }, [query, merged]);

  return (
    <div>
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises or muscles…"
          className="w-full rounded-lg border border-border bg-secondary pl-9 pr-3 py-2 text-sm text-foreground"
        />
      </div>

      {/* Add your own */}
      <div className="mb-3 rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-secondary/30"
        >
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">Add your own exercise</h3>
            <p className="text-[11px] text-muted-foreground">
              {customExercises.length === 0
                ? 'For anything not in the library.'
                : `${customExercises.length} custom · tap to add another.`}
            </p>
          </div>
          {showAdd ? <X size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
        </button>
        {showAdd && (
          <div className="border-t border-border px-4 py-3">
            <CustomExerciseForm onSaved={() => setShowAdd(false)} />
          </div>
        )}
        {customExercises.length > 0 && (
          <div className="border-t border-border px-4 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Your custom exercises</p>
            {customExercises.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-card-foreground">{c.name}</span>
                <button
                  onClick={() => {
                    deleteCustomExercise(c.id);
                    toast.success('Removed');
                  }}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${c.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-2 text-[11px] text-muted-foreground">{filtered.length} exercises</p>
        {filtered.map((ex) => (
          <ExerciseListRow key={ex.id} ex={ex} onInfo={() => onDetail(ex)} />
        ))}
        {filtered.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No matches.</p>}
      </div>
    </div>
  );
}

/* ---------------------------------- Hub ------------------------------------ */

export default function Protocol() {
  const [tab, setTab] = useState<'plan' | 'generate' | 'routines' | 'library'>('plan');
  const [detail, setDetail] = useState<LibraryExercise | null>(null);

  return (
    <div className="pb-24 pt-4">
      <h1 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
        <Dumbbell size={22} style={{ color: 'var(--vt-accent)' }} /> Protocol
      </h1>

      <SegmentedTabs
        tabs={[
          { key: 'plan', label: 'Plan' },
          { key: 'generate', label: 'Generate' },
          { key: 'routines', label: 'Routines' },
          { key: 'library', label: 'Library' },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-5"
      />

      {tab === 'plan' && <PlanTab />}
      {tab === 'generate' && <GenerateTab onDetail={setDetail} />}
      {tab === 'routines' && <RoutinesTab onDetail={setDetail} />}
      {tab === 'library' && <LibraryTab onDetail={setDetail} />}

      <ExerciseDetail exercise={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
