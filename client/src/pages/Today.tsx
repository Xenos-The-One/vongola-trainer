// Today — workout-launcher screen.
// Post-overhaul: companion + the day's workout preview + a single Start CTA.
// Chore blocks (morning / work / evening / coach) and their pill-strip header
// are gone — Vongola Trainer is a training tracker now, not a daily-habits OS.

import { useMemo } from 'react';
import { useLocation } from 'wouter';
import { Play, RotateCcw, Wand2 } from 'lucide-react';
import CompanionCard from '@/components/CompanionCard';
import TodaysWorkoutCard from '@/components/TodaysWorkoutCard';
import PhaseBadge from '@/components/PhaseBadge';
import ProgressRing from '@/components/ProgressRing';
import TimerFab from '@/components/TimerFab';
import { useStore } from '@/lib/storage';
import { weeksSince } from '@/lib/date';

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
  const [, setLocation] = useLocation();

  const todayState = getTodayState();
  const pct = todayState.completionPct;
  const dateStr = useMemo(() => formatDate(), []);

  const liftExercises = nextLift === 'B' ? workouts.liftB : workouts.liftA;
  const liftLabel = `Lift ${nextLift}`;
  const liftSubtitle = nextLift === 'B' ? 'Pull + Hinge' : 'Push + Squat';
  const hasWorkout = liftExercises.length > 0;

  const startLift = () => {
    startSession({ source: 'lift', liftKey: nextLift, exercises: liftExercises });
    setLocation('/workout');
  };

  const goGenerate = () => setLocation('/protocol');

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

      {/* Primary CTA — Start the workout, or Resume if one is in progress */}
      {activeSession ? (
        <button
          onClick={() => setLocation('/workout')}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--vt-accent)] bg-[var(--vt-accent)]/10 py-3 text-sm font-semibold text-foreground"
        >
          <RotateCcw size={16} style={{ color: 'var(--vt-accent)' }} /> Resume workout
        </button>
      ) : hasWorkout ? (
        <button
          onClick={startLift}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--vt-accent)' }}
        >
          <Play size={18} /> Start {liftLabel}
        </button>
      ) : (
        // Empty state: no planned lift for today → push to the generator.
        <button
          onClick={goGenerate}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--vt-accent)' }}
        >
          <Wand2 size={18} /> Generate today's workout
        </button>
      )}

      {/* Today's workout preview — exercises with icons + info buttons */}
      {hasWorkout && (
        <TodaysWorkoutCard
          title={liftLabel}
          subtitle={`${liftSubtitle} · ~60 min`}
          exercises={liftExercises}
        />
      )}

      {/* Timer FAB stays — useful during a workout or for life timers */}
      <TimerFab />
    </div>
  );
}
