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
import { LIFT_A, LIFT_B, MORNING_BLOCK, EVENING_BLOCK, COACH_FOCUS_ITEMS } from '@/lib/seed';

function formatDate(): string {
  const d = new Date();
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function Today() {
  const phase = useStore(s => s.phase);
  const getTodayState = useStore(s => s.getTodayState);
  const days = useStore(s => s.days);

  const todayState = getTodayState();
  const pct = todayState.completionPct;
  const dateStr = useMemo(() => formatDate(), []);

  // Determine which lift day (alternate A/B based on day of month)
  const isLiftB = new Date().getDate() % 2 === 0;
  const liftExercises = isLiftB ? LIFT_B : LIFT_A;
  const liftLabel = isLiftB ? 'Lift B' : 'Lift A';

  const statusPills = [
    { label: 'Train', emoji: '🏋', ...todayState.blocks.training },
    { label: 'Coach', emoji: '🎯', ...todayState.blocks.coach },
    { label: 'AM', emoji: '🌅', ...todayState.blocks.morning },
    { label: 'Work', emoji: '💼', ...todayState.blocks.work },
    { label: 'PM', emoji: '🌙', ...todayState.blocks.evening },
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
          {statusPills.map((pill) => (
            <StatusPill
              key={pill.label}
              label={pill.label}
              emoji={pill.emoji}
              done={pill.done}
              total={pill.total}
              isComplete={pill.done >= pill.total}
            />
          ))}
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
          items={liftExercises.map(e => e.name)}
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
          items={MORNING_BLOCK.map(e => e.name)}
        />
        <TaskBlock
          title="Work Block"
          subtitle="09:00–16:30 · every 45m"
          blockKey="work"
          items={['Stand & stretch', 'Walk break', 'Posture check', 'Eye rest', 'Hydrate', 'Deep breath']}
        />
        <TaskBlock
          title="Evening Block"
          subtitle="~15 min"
          blockKey="evening"
          items={EVENING_BLOCK.map(e => e.name)}
        />
      </div>

      {/* Timer FAB */}
      <TimerFab />
    </div>
  );
}
