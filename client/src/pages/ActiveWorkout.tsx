// ActiveWorkout — full-screen live workout logging.
// Persisted session survives refresh; finishing writes the log, updates PRs,
// completes the day's training block (for lift sessions), and fires confetti.

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { X, ChevronDown, ChevronRight, Plus, Flag, Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useStore, computeTrainingPct } from '@/lib/storage';
import { useElapsed, formatMMSS } from '@/hooks/useCountdown';
import { getLastEntry, summarizeEntry } from '@/lib/lastPerformance';
import { triggerFlameConfetti } from '@/lib/confetti';
import { getLibraryExercise, type LibraryExercise } from '@/lib/exercises';
import SetRow from '@/components/SetRow';
import RestTimerBar from '@/components/RestTimerBar';
import ExerciseDetail from '@/components/ExerciseDetail';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const REST_PRESETS = [60, 90, 120, 180];

export default function ActiveWorkout() {
  const [, setLocation] = useLocation();
  const session = useStore((s) => s.activeSession);
  const units = useStore((s) => s.user.units ?? 'kg');
  const customExercises = useStore((s) => s.customExercises);
  const log = useStore((s) => s.log);
  const updateActiveSet = useStore((s) => s.updateActiveSet);
  const toggleSetDone = useStore((s) => s.toggleSetDone);
  const addActiveSet = useStore((s) => s.addActiveSet);
  const removeActiveSet = useStore((s) => s.removeActiveSet);
  const setCurrentExercise = useStore((s) => s.setCurrentExercise);
  const setActiveNotes = useStore((s) => s.setActiveNotes);
  const setRestPreset = useStore((s) => s.setRestPreset);
  const finishSession = useStore((s) => s.finishSession);
  const cancelSession = useStore((s) => s.cancelSession);

  const [showCancel, setShowCancel] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [detail, setDetail] = useState<LibraryExercise | null>(null);
  const elapsed = useElapsed(session?.startedAt);

  // No session → bounce back to Today.
  useEffect(() => {
    if (!session) setLocation('/');
  }, [session, setLocation]);

  if (!session) return null;

  const totalSets = session.exercises.reduce((n, ex) => n + ex.sets.length, 0);
  const doneSets = session.exercises.reduce((n, ex) => n + ex.sets.filter((s) => s.done).length, 0);
  // The actual finish-log criterion: any set with reps > 0. The "done" tick
  // is for rest-timer feedback only, not for gating the log.
  const loggableSets = session.exercises.reduce(
    (n, ex) => n + ex.sets.filter((s) => s.reps > 0).length,
    0,
  );

  const handleFinish = () => {
    finishSession();
    const trainingPct = computeTrainingPct(useStore.getState().getTodayState().training);
    if (trainingPct >= 100) {
      triggerFlameConfetti();
      if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 50]);
    }
    toast.success(`Workout logged — ${doneSets} set${doneSets === 1 ? '' : 's'}`);
    setLocation('/');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <div className="mx-auto max-w-[480px] px-4 pb-40 pt-4">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowCancel(true)}
            aria-label="Cancel workout"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground"
          >
            <X size={18} />
          </button>
          <div className="text-center">
            <p className="font-mono text-sm font-semibold tabular-nums text-foreground">{formatMMSS(elapsed)}</p>
            <p className="text-[10px] text-muted-foreground">
              {doneSets}/{totalSets} sets
            </p>
          </div>
          <button
            onClick={() => setShowFinish(true)}
            aria-label="Finish workout"
            className="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--vt-accent)' }}
          >
            <Flag size={15} /> Finish
          </button>
        </div>

        {/* Rest preset selector */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Rest</span>
          <div className="flex flex-1 gap-1">
            {REST_PRESETS.map((sec) => (
              <button
                key={sec}
                onClick={() => setRestPreset(sec)}
                className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                  session.restPreset === sec
                    ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]/10 text-foreground'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-3">
          {session.exercises.map((ex, exIdx) => {
            const open = session.currentIndex === exIdx;
            const exDone = ex.sets.length > 0 && ex.sets.every((s) => s.done);
            const last = summarizeEntry(getLastEntry(log, ex.exerciseId), units);
            const lib = getLibraryExercise(ex.exerciseId, customExercises);
            return (
              <div key={`${ex.exerciseId}-${exIdx}`} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex w-full items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => setCurrentExercise(open ? -1 : exIdx)}
                    aria-expanded={open}
                    aria-label={open ? `Collapse ${ex.name}` : `Expand ${ex.name}`}
                    className="flex flex-1 items-center gap-3 text-left hover:bg-secondary/50 -mx-4 px-4 py-1"
                  >
                    {open ? (
                      <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-card-foreground">{ex.name}</h3>
                        {exDone && <Check size={14} className="shrink-0 text-[var(--vt-accent)]" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Target {ex.targetSets}×{ex.targetReps}
                        {last ? ` · last ${last}` : ''}
                      </p>
                    </div>
                  </button>
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
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {ex.sets.filter((s) => s.done).length}/{ex.sets.length}
                  </span>
                </div>

                {open && (
                  <div className="border-t border-border px-4 py-3">
                    <div className="space-y-2">
                      {ex.sets.map((set, setIdx) => (
                        <SetRow
                          key={setIdx}
                          index={setIdx}
                          set={set}
                          canRemove={ex.sets.length > 1}
                          onChange={(patch) => updateActiveSet(exIdx, setIdx, patch)}
                          onToggleDone={() => toggleSetDone(exIdx, setIdx)}
                          onRemove={() => removeActiveSet(exIdx, setIdx)}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => addActiveSet(exIdx)}
                      className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      <Plus size={14} /> Add set
                    </button>
                    <textarea
                      value={ex.notes ?? ''}
                      onChange={(e) => setActiveNotes(exIdx, e.target.value)}
                      rows={2}
                      placeholder="Notes…"
                      className="mt-2 w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky rest timer above the safe area */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
        <div className="pointer-events-auto mx-auto max-w-[480px] px-4 pb-4">
          <RestTimerBar />
        </div>
      </div>

      {/* Cancel confirm */}
      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this workout?</AlertDialogTitle>
            <AlertDialogDescription>
              Nothing will be logged and your progress in this session is lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep going</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                cancelSession();
                setLocation('/');
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Finish confirm */}
      <AlertDialog open={showFinish} onOpenChange={setShowFinish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finish workout?</AlertDialogTitle>
            <AlertDialogDescription>
              {loggableSets > 0
                ? `Logs ${loggableSets} set${loggableSets === 1 ? '' : 's'}${
                    loggableSets > doneSets ? ` (${loggableSets - doneSets} unchecked but filled)` : ''
                  }. To skip a set, clear its reps or tap the ✕.`
                : 'No sets have reps filled in — nothing will be logged.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinish}>Finish &amp; log</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExerciseDetail exercise={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
