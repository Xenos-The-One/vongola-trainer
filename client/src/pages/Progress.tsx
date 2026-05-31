// Progress — hub with an Overview (charts/streak/PRs) and a Body Map
// (anatomical muscle heatmap shaded by training volume).
// Design: "Ember & Parchment" — warm cards, accent-colored data.

import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useStore } from '@/lib/storage';
import type { Exercise } from '@/lib/types';
import { getLibraryExercise } from '@/lib/exercises';
import { computeMuscleVolume, type MuscleSplit } from '@/lib/volume';
import { MUSCLE_DISPLAY, normalizeMuscles, type MuscleSlug } from '@/lib/muscles';
import { humanizeId } from '@/lib/utils';
import { dateKey } from '@/lib/date';
import { getHeatColor } from '@/lib/heat';
import SegmentedTabs from '@/components/SegmentedTabs';
import MuscleMap from '@/components/MuscleMap';
import MetricsPanel from '@/components/MetricsPanel';
import CalendarMonth from '@/components/CalendarMonth';
import { Trophy, Flame, TrendingUp } from 'lucide-react';

type ProgressTab = 'overview' | 'body' | 'metrics' | 'history';

export default function Progress() {
  const days = useStore((s) => s.days);
  const log = useStore((s) => s.log);
  const prs = useStore((s) => s.prs);
  const workouts = useStore((s) => s.workouts);
  const getStreak = useStore((s) => s.getStreak);

  const [tab, setTab] = useState<ProgressTab>('overview');
  const [windowDays, setWindowDays] = useState<7 | 28>(28);
  const [bodyView, setBodyView] = useState<'both' | 'front' | 'back'>('both');
  const [selected, setSelected] = useState<MuscleSlug | null>(null);

  // id → exercise lookup across the user's workout slices (fallback for the library).
  const workoutsMap = useMemo(() => {
    const map = new Map<string, Exercise>();
    [
      ...workouts.liftA,
      ...workouts.liftB,
      ...workouts.morning,
      ...workouts.evening,
      ...workouts.custom,
    ].forEach((e) => {
      if (!map.has(e.id)) map.set(e.id, e);
    });
    return map;
  }, [workouts]);

  const resolveName = (id: string): string =>
    getLibraryExercise(id)?.name ?? workoutsMap.get(id)?.name ?? humanizeId(id);

  const resolveSplit = (id: string): MuscleSplit | null => {
    const lib = getLibraryExercise(id);
    if (lib) return { primary: lib.primaryMuscles, secondary: lib.secondaryMuscles };
    const ex = workoutsMap.get(id);
    if (ex) return { primary: normalizeMuscles(ex.muscles), secondary: [] };
    return null;
  };

  const streak = getStreak();

  // Weekly completion data (last 4 weeks)
  const weeklyData = useMemo(() => {
    const weeks: { label: string; pct: number }[] = [];
    const today = new Date();
    for (let w = 3; w >= 0; w--) {
      let totalPct = 0;
      let daysCount = 0;
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + d));
        const key = dateKey(date);
        if (days[key]) {
          totalPct += days[key].completionPct;
          daysCount++;
        }
      }
      weeks.push({ label: w === 0 ? 'This week' : `${w}w ago`, pct: daysCount > 0 ? Math.round(totalPct / daysCount) : 0 });
    }
    return weeks;
  }, [days]);

  // Streak calendar (last 28 days)
  const calendarData = useMemo(() => {
    const data: { date: string; pct: number }[] = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = dateKey(date);
      data.push({ date: key, pct: days[key]?.completionPct || 0 });
    }
    return data;
  }, [days]);

  // PR list — prefer real exercise name (library, then workouts), fall back to a humanized id.
  // Each row carries BOTH the max-weight PR and the e1RM rep-PR (when present)
  // so rep PRs at a sub-max working weight are visible.
  const prList = useMemo(() => {
    return Object.entries(prs)
      .map(([exerciseId, pr]) => ({
        exercise: resolveName(exerciseId),
        value: pr.value,
        date: pr.date,
        bestE1RM: pr.bestE1RM,
        bestSetReps: pr.bestSetReps,
        bestSetWeight: pr.bestSetWeight,
        bestSetDate: pr.bestSetDate,
      }))
      .sort((a, b) => (b.bestE1RM ?? b.value) - (a.bestE1RM ?? a.value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prs, workoutsMap]);

  // Volume per canonical muscle (last 4 weeks), weighting primary > secondary.
  const volumeData = useMemo(() => {
    const { byMuscle } = computeMuscleVolume(log, resolveSplit, { sinceDays: 28 });
    return (Object.keys(byMuscle) as MuscleSlug[])
      .map((slug) => ({ muscle: MUSCLE_DISPLAY[slug], volume: Math.round(byMuscle[slug] ?? 0) }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log, workoutsMap]);

  // Body-map data: include bodyweight work via the reps proxy so push-ups/pull-ups register.
  const bodyVolume = useMemo(
    () => computeMuscleVolume(log, resolveSplit, { sinceDays: windowDays, bodyweightRepsProxy: true }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [log, workoutsMap, windowDays]
  );

  const intensities = useMemo(() => {
    const out: Partial<Record<MuscleSlug, number>> = {};
    if (bodyVolume.max > 0) {
      for (const slug of Object.keys(bodyVolume.byMuscle) as MuscleSlug[]) {
        out[slug] = (bodyVolume.byMuscle[slug] ?? 0) / bodyVolume.max;
      }
    }
    return out;
  }, [bodyVolume]);

  const rankedMuscles = useMemo(
    () =>
      (Object.keys(bodyVolume.byMuscle) as MuscleSlug[])
        .map((slug) => ({ slug, volume: bodyVolume.byMuscle[slug] ?? 0 }))
        .filter((m) => m.volume > 0)
        .sort((a, b) => b.volume - a.volume),
    [bodyVolume]
  );

  return (
    <div className="pb-24 pt-4">
      <h1 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
        Progress
      </h1>

      <SegmentedTabs
        tabs={[
          { key: 'overview', label: 'Overview' },
          { key: 'body', label: 'Body' },
          { key: 'metrics', label: 'Metrics' },
          { key: 'history', label: 'History' },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-5"
      />

      {tab === 'overview' && (
        <>
          {/* Streak & Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <Flame size={18} className="mx-auto mb-1" style={{ color: 'var(--vt-accent)' }} />
              <p className="text-lg font-bold text-foreground">{streak}</p>
              <p className="text-[10px] text-muted-foreground">day streak</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <TrendingUp size={18} className="mx-auto mb-1" style={{ color: 'var(--vt-accent)' }} />
              <p className="text-lg font-bold text-foreground">{log.length}</p>
              <p className="text-[10px] text-muted-foreground">total logs</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <Trophy size={18} className="mx-auto mb-1" style={{ color: 'var(--vt-accent)' }} />
              <p className="text-lg font-bold text-foreground">{prList.length}</p>
              <p className="text-[10px] text-muted-foreground">PRs set</p>
            </div>
          </div>

          {/* Weekly Completion Chart */}
          <div className="rounded-xl border border-border bg-card p-4 mb-4">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Weekly Completion %</h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barSize={32}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8A8080' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1C1820', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#F5F0EB' }}
                  />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                    {weeklyData.map((entry, index) => (
                      <Cell key={index} fill={entry.pct > 0 ? 'var(--vt-accent)' : 'rgba(255,255,255,0.08)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Streak Calendar Heatmap */}
          <div className="rounded-xl border border-border bg-card p-4 mb-4">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Last 28 Days</h3>
            <div className="grid grid-cols-7 gap-1.5">
              {calendarData.map((day, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-sm"
                  style={{ backgroundColor: getHeatColor(day.pct) }}
                  title={`${day.date}: ${day.pct}%`}
                />
              ))}
            </div>
          </div>

          {/* Volume Chart */}
          {volumeData.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 mb-4">
              <h3 className="text-sm font-semibold text-card-foreground mb-3">Volume by Muscle (4 weeks)</h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData} barSize={24} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="muscle" tick={{ fontSize: 10, fill: '#8A8080' }} axisLine={false} tickLine={false} width={64} />
                    <Bar dataKey="volume" fill="var(--vt-accent)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* PR List */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-card-foreground mb-3">Personal Records</h3>
            {prList.length === 0 ? (
              <p className="text-xs text-muted-foreground">No PRs yet. Log some workouts!</p>
            ) : (
              <div className="space-y-2">
                {prList.map((pr, i) => {
                  const hasRepPR =
                    pr.bestE1RM != null &&
                    pr.bestSetReps != null &&
                    pr.bestSetWeight != null;
                  return (
                    <div key={i} className="flex items-start justify-between gap-2 py-1.5 border-b border-border last:border-0">
                      <span className="text-sm text-card-foreground capitalize min-w-0 flex-1 truncate">{pr.exercise}</span>
                      <div className="text-right shrink-0">
                        {hasRepPR ? (
                          <>
                            <span className="text-sm font-semibold" style={{ color: 'var(--vt-accent)' }}>
                              {pr.bestSetWeight}kg × {pr.bestSetReps}
                            </span>
                            <span className="text-[10px] text-muted-foreground ml-2">
                              est {Math.round(pr.bestE1RM!)}
                            </span>
                            <p className="text-[10px] text-muted-foreground">
                              top {pr.value}kg · {pr.bestSetDate ?? pr.date}
                            </p>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-semibold" style={{ color: 'var(--vt-accent)' }}>{pr.value}kg</span>
                            <span className="text-[10px] text-muted-foreground ml-2">{pr.date}</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'metrics' && <MetricsPanel />}

      {tab === 'history' && <CalendarMonth />}

      {tab === 'body' && (
        <>
          {/* Body Map controls */}
          <div className="mb-3 flex gap-2">
            <SegmentedTabs
              tabs={[
                { key: '7', label: '7 days' },
                { key: '28', label: '28 days' },
              ]}
              value={windowDays === 7 ? '7' : '28'}
              onChange={(v) => setWindowDays(v === '7' ? 7 : 28)}
              className="flex-1"
            />
            <SegmentedTabs
              tabs={[
                { key: 'both', label: 'Both' },
                { key: 'front', label: 'Front' },
                { key: 'back', label: 'Back' },
              ]}
              value={bodyView}
              onChange={setBodyView}
              className="flex-1"
            />
          </div>

          {/* Heatmap */}
          <div className="rounded-xl border border-border bg-card p-4 mb-4">
            {rankedMuscles.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">No training volume yet.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Log a workout to light up your muscle map.</p>
              </div>
            ) : (
              <>
                <MuscleMap
                  intensities={intensities}
                  view={bodyView}
                  selected={selected}
                  onMuscleTap={(m) => setSelected((s) => (s === m ? null : m))}
                />
                {/* Legend */}
                <div className="mt-3 flex items-center justify-center gap-1">
                  <span className="text-[9px] text-muted-foreground">Less</span>
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--mm-empty)' }} />
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--vt-accent)', opacity: 0.4 }} />
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--vt-accent)', opacity: 0.7 }} />
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--vt-accent)' }} />
                  <span className="text-[9px] text-muted-foreground">More</span>
                </div>
                {/* Selected muscle readout */}
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {selected ? (
                    <>
                      <span className="font-semibold text-card-foreground">{MUSCLE_DISPLAY[selected]}</span>
                      {' — '}
                      {Math.round(bodyVolume.byMuscle[selected] ?? 0).toLocaleString()} volume ({windowDays}d)
                    </>
                  ) : (
                    'Tap a muscle for detail'
                  )}
                </p>
              </>
            )}
          </div>

          {/* Ranked muscle list */}
          {rankedMuscles.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-card-foreground mb-3">
                Most-trained muscles ({windowDays}d)
              </h3>
              <div className="space-y-2">
                {rankedMuscles.map(({ slug, volume }) => {
                  const pct = bodyVolume.max > 0 ? (volume / bodyVolume.max) * 100 : 0;
                  return (
                    <button
                      key={slug}
                      onClick={() => setSelected((s) => (s === slug ? null : slug))}
                      className="block w-full text-left"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs ${selected === slug ? 'font-semibold text-foreground' : 'text-card-foreground'}`}>
                          {MUSCLE_DISPLAY[slug]}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{Math.round(volume).toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: 'var(--vt-accent)' }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
