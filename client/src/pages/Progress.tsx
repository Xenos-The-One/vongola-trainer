// Progress — Charts for weekly completion, volume, streak heatmap, PR list
// Design: "Ember & Parchment" — warm cards, accent-colored charts

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useStore } from '@/lib/storage';
import { Trophy, Flame, TrendingUp } from 'lucide-react';

export default function Progress() {
  const days = useStore(s => s.days);
  const log = useStore(s => s.log);
  const prs = useStore(s => s.prs);
  const getStreak = useStore(s => s.getStreak);

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
        const key = date.toISOString().split('T')[0];
        if (days[key]) {
          totalPct += days[key].completionPct;
          daysCount++;
        }
      }
      
      weeks.push({
        label: w === 0 ? 'This week' : `${w}w ago`,
        pct: daysCount > 0 ? Math.round(totalPct / daysCount) : 0,
      });
    }
    return weeks;
  }, [days]);

  // Streak calendar (last 28 days)
  const calendarData = useMemo(() => {
    const data: { date: string; pct: number; day: string }[] = [];
    const today = new Date();
    
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      const dayState = days[key];
      data.push({
        date: key,
        pct: dayState?.completionPct || 0,
        day: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
      });
    }
    return data;
  }, [days]);

  // PR list
  const prList = useMemo(() => {
    return Object.entries(prs).map(([exerciseId, pr]) => ({
      exercise: exerciseId.replace(/-/g, ' '),
      value: pr.value,
      date: pr.date,
    })).sort((a, b) => b.value - a.value);
  }, [prs]);

  // Volume per muscle group (last 4 weeks)
  const volumeData = useMemo(() => {
    const muscleVolume: Record<string, number> = {};
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    log
      .filter(entry => new Date(entry.date) >= fourWeeksAgo)
      .forEach(entry => {
        const totalVolume = entry.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
        // Simple mapping: use exerciseId as proxy
        const muscle = entry.exerciseId.split('-')[0] || 'other';
        muscleVolume[muscle] = (muscleVolume[muscle] || 0) + totalVolume;
      });

    return Object.entries(muscleVolume)
      .map(([muscle, volume]) => ({ muscle, volume }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 6);
  }, [log]);

  function getHeatColor(pct: number): string {
    if (pct >= 100) return 'var(--vt-accent)';
    if (pct >= 75) return 'var(--vt-accent-dim)';
    if (pct >= 50) return 'var(--vt-accent-glow)';
    if (pct > 0) return 'rgba(255,255,255,0.08)';
    return 'rgba(255,255,255,0.03)';
  }

  return (
    <div className="pb-24 pt-4">
      <h1
        className="text-2xl font-bold text-foreground mb-5"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Progress
      </h1>

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
        <div className="flex items-center justify-end gap-1 mt-2">
          <span className="text-[9px] text-muted-foreground">Less</span>
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }} />
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--vt-accent-glow)' }} />
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--vt-accent-dim)' }} />
          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--vt-accent)' }} />
          <span className="text-[9px] text-muted-foreground">More</span>
        </div>
      </div>

      {/* Volume Chart */}
      {volumeData.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 mb-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Volume by Exercise (4 weeks)</h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} barSize={24} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="muscle" tick={{ fontSize: 10, fill: '#8A8080' }} axisLine={false} tickLine={false} width={60} />
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
            {prList.map((pr, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm text-card-foreground capitalize">{pr.exercise}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold" style={{ color: 'var(--vt-accent)' }}>{pr.value}kg</span>
                  <span className="text-[10px] text-muted-foreground ml-2">{pr.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
