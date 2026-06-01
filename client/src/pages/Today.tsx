// Today — workout-launcher screen.
// Reads the day's workout from weeklyPlan when set (the post-overhaul source
// of truth) and falls back to the legacy Lift A/B seed otherwise. Always has
// a single primary CTA: Start, Resume, or Generate.

import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { Play, RotateCcw, Wand2, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import CompanionCard from '@/components/CompanionCard';
import TodaysWorkoutCard from '@/components/TodaysWorkoutCard';
import GenerateSheet from '@/components/GenerateSheet';
import PhaseBadge from '@/components/PhaseBadge';
import ProgressRing from '@/components/ProgressRing';
import TimerFab from '@/components/TimerFab';
import { useStore } from '@/lib/storage';
import { weeksSince } from '@/lib/date';
import { planDayForToday } from '@/lib/weeklyPlan';
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

function formatDate(): string {
  const d = new Date();
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function Today() {
  const phase = useStore((s) => s.phase);
  const getTodayState = useStore((s) => s.getTodayState);
  const workouts = useStore((s) => s.workouts);
  const nextLift = useStore((s) => s.nextLift);
  const activeSession = useStore((s) => s.activeSession);
  const startSession = useStore((s) => s.startSession);
  const weeklyPlan = useStore((s) => s.weeklyPlan);
  const saveCurrentPlan = useStore((s) => s.saveCurrentPlan);
  const [, setLocation] = useLocation();
  const [showGen, setShowGen] = useState(false);
  const [showSavePlan, setShowSavePlan] = useState(false);
  const [planName, setPlanName] = useState('');

  const todayState = getTodayState();
  const pct = todayState.completionPct;
  const dateStr = useMemo(() => formatDate(), []);

  // Plan wins when present. Otherwise fall back to the seeded Lift A/B alternation.
  const planDay = weeklyPlan ? planDayForToday(weeklyPlan) : null;
  const exercises = planDay ? planDay.exercises : nextLift === 'B' ? workouts.liftB : workouts.liftA;
  const title = planDay
    ? `${planDay.title}${weeklyPlan!.daysPerWeek > 1 ? ` · Day ${planDay.index + 1} of ${weeklyPlan!.daysPerWeek}` : ''}`
    : `Lift ${nextLift}`;
  const subtitle = planDay
    ? `${planDay.exercises.length} exercises · ~60 min`
    : nextLift === 'B'
      ? 'Pull + Hinge · ~60 min'
      : 'Push + Squat · ~60 min';
  const hasWorkout = exercises.length > 0;

  const startWorkout = () => {
    startSession({
      source: 'lift',
      liftKey: planDay ? undefined : nextLift,
      exercises,
    });
    setLocation('/workout');
  };

  return (
    <div className="pb-24 pt-4">
      {/* Header — date + phase + the day's training ring */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1
            className="text-xl font-bold leading-tight text-foreground"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {dateStr}
          </h1>
          <div className="mt-1.5">
            <PhaseBadge name={phase.name} week={weeksSince(phase.startDate)} />
          </div>
        </div>
        <ProgressRing percent={pct} />
      </div>

      {/* Companion */}
      <div className="mb-5">
        <CompanionCard />
      </div>

      {/* Primary CTA — Start, Resume, or Generate */}
      {activeSession ? (
        <button
          onClick={() => setLocation('/workout')}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--vt-accent)] bg-[var(--vt-accent)]/10 py-3 text-sm font-semibold text-foreground"
        >
          <RotateCcw size={16} style={{ color: 'var(--vt-accent)' }} /> Resume workout
        </button>
      ) : hasWorkout ? (
        <button
          onClick={startWorkout}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--vt-accent)' }}
        >
          <Play size={18} /> Start {planDay ? planDay.title : `Lift ${nextLift}`}
        </button>
      ) : (
        <button
          onClick={() => setShowGen(true)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--vt-accent)' }}
        >
          <Wand2 size={18} /> Generate today's workout
        </button>
      )}

      {/* Today's workout preview */}
      {hasWorkout && (
        <div className="mb-3">
          <TodaysWorkoutCard title={title} subtitle={subtitle} exercises={exercises} />
        </div>
      )}

      {/* Secondary actions — regenerate, and save plan for later if one is active */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowGen(true)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[var(--vt-accent)]/40 hover:text-foreground"
        >
          <Wand2 size={13} /> {weeklyPlan ? 'Regenerate plan' : 'Plan my week'}
        </button>
        {weeklyPlan && (
          <button
            onClick={() => {
              setPlanName(weeklyPlan.days[0]?.title ?? '');
              setShowSavePlan(true);
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[var(--vt-accent)]/40 hover:text-foreground"
            aria-label="Save this plan for later"
          >
            <Bookmark size={13} /> Save plan
          </button>
        )}
      </div>

      <GenerateSheet open={showGen} onOpenChange={setShowGen} />

      {/* Save-plan name prompt */}
      <AlertDialog open={showSavePlan} onOpenChange={setShowSavePlan}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save this plan</AlertDialogTitle>
            <AlertDialogDescription>
              Give it a name so you can load it again later from the Generate sheet.
              Regenerating won't touch saved plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="e.g. PPL — heavy week"
            className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
            maxLength={40}
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const id = saveCurrentPlan(planName);
                if (id) toast.success('Plan saved');
                setPlanName('');
              }}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Timer FAB stays — useful during a workout or for life timers */}
      <TimerFab />
    </div>
  );
}
