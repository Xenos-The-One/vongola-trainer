// Today — Main screen with date, phase, status pills, companion, and task blocks
// Design: "Ember & Parchment" — warm dark, serif date, editorial flow

import { useMemo } from 'react';
import CompanionCard from '@/components/CompanionCard';
import TaskBlock from '@/components/TaskBlock';
import StatusPill from '@/components/StatusPill';
import PhaseBadge from '@/components/PhaseBadge';
import ProgressRing from '@/components/ProgressRing';
import TimerFab from '@/components/TimerFab';
import { useStore } from '@/lib/storage';
import { COACH_FOCUS_ITEMS } from '@/lib/seed';

function formatDate(): string {
  const d = new Date();
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

const WORK_ITEMS = ['Stand & stretch', 'Walk break', 'Posture check', 'Eye rest', 'Hydrate', 'Deep breath'];

export default function Today() {
  const phase = useStore((s) => s.phase);
  const getTodayState = useStore((s) => s.getTodayState);
  const workouts = useStore((s) => s.workouts);
  const nextLift = useStore((s) => s.nextLift);

  const todayState = getTodayState();
  const pct = todayState.completionPct;
  const dateStr = useMemo(() => formatDate(), []);

  const liftExercises = nextLift === 'B' ? workouts.liftB : workouts.liftA;
  const liftLabel = `Lift ${nextLift}`;

  const statusPills = [
    { label: 'Train', emoji: '🏋', block: todayState.blocks.training },
    { label: 'Coach', emoji: '🎯', block: todayState.blocks.coach },
    { label: 'AM', emoji: '🌅', block: todayState.blocks.morning },
    { label: 'Work', emoji: '💼', block: todayState.blocks.work },
    { label: 'PM', emoji: '🌙', block: todayState.blocks.evening },
  ];

  return (
    <div className="pb-24 pt-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {dateStr}
          </h1>
          <div className="mt-1.5">
            <PhaseBadge name={phase.name} week={phase.week} />
          </div>
        </div>
        <ProgressRing percent={pct} />
      </div>

      {/* Status pills */}
      <div className="mb-5 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {statusPills.map((pill) => {
            const done = pill.block.checked.length;
            const total = pill.block.total;
            return (
              <StatusPill
                key={pill.label}
                label={pill.label}
                emoji={pill.emoji}
                done={done}
                total={total}
                isComplete={total > 0 && done >= total}
              />
            );
          })}
        </div>
      </div>

      {/* Companion Card */}
      <div className="mb-5">
        <CompanionCard />
      </div>

      {/* Task Blocks */}
      <div className="space-y-3">
        <TaskBlock
          title="Training"
          subtitle={`~60 min · ${liftLabel}`}
          blockKey="training"
          items={liftExercises.map((e) => e.name)}
          defaultExpanded={true}
        />
        <TaskBlock
          title="Coach's Focus — this week"
          subtitle="Technique cues"
          blockKey="coach"
          items={COACH_FOCUS_ITEMS}
        />
        <TaskBlock
          title="Morning Block"
          subtitle="~25 min · Non-negotiable"
          blockKey="morning"
          items={workouts.morning.map((e) => e.name)}
        />
        <TaskBlock
          title="Work Block"
          subtitle="09:00–16:30 · every 45m"
          blockKey="work"
          items={WORK_ITEMS}
        />
        <TaskBlock
          title="Evening Block"
          subtitle="~15 min"
          blockKey="evening"
          items={workouts.evening.map((e) => e.name)}
        />
      </div>

      {/* Timer FAB */}
      <TimerFab />
    </div>
  );
}
