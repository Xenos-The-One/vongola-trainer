// MetricsPanel — body-weight & measurement tracking with a trend chart.
// Lives in the Progress hub "Metrics" tab.

import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/lib/storage';
import { todayKey } from '@/lib/date';
import type { BodyMetric } from '@/lib/types';

// Default measurement fields (cm). The user can leave any blank.
const MEASUREMENT_FIELDS = ['waist', 'chest', 'arms', 'thighs'] as const;

type SeriesKey = 'weightKg' | 'bodyFat' | (typeof MEASUREMENT_FIELDS)[number];

const SERIES_LABEL: Record<SeriesKey, string> = {
  weightKg: 'Weight (kg)',
  bodyFat: 'Body fat (%)',
  waist: 'Waist (cm)',
  chest: 'Chest (cm)',
  arms: 'Arms (cm)',
  thighs: 'Thighs (cm)',
};

function getSeriesValue(m: BodyMetric, key: SeriesKey): number | undefined {
  if (key === 'weightKg') return m.weightKg;
  if (key === 'bodyFat') return m.bodyFat;
  return m.measurements?.[key];
}

export default function MetricsPanel() {
  const metrics = useStore((s) => s.metrics);
  const upsertMetric = useStore((s) => s.upsertMetric);
  const deleteMetric = useStore((s) => s.deleteMetric);

  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(todayKey());
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [meas, setMeas] = useState<Record<string, string>>({});
  const [series, setSeries] = useState<SeriesKey>('weightKg');

  const sorted = useMemo(() => [...metrics].sort((a, b) => b.date.localeCompare(a.date)), [metrics]);

  // Which series actually have data → offer them as chart options.
  const availableSeries = useMemo(() => {
    const keys: SeriesKey[] = ['weightKg', 'bodyFat', ...MEASUREMENT_FIELDS];
    return keys.filter((k) => metrics.some((m) => getSeriesValue(m, k) != null));
  }, [metrics]);

  const chartData = useMemo(
    () =>
      [...metrics]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((m) => ({ date: m.date.slice(5), value: getSeriesValue(m, series) }))
        .filter((d) => d.value != null),
    [metrics, series]
  );

  // Latest value + delta vs the first recorded entry, for the chosen series.
  const stat = useMemo(() => {
    const withVal = [...metrics]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((m) => getSeriesValue(m, series))
      .filter((v): v is number => v != null);
    if (withVal.length === 0) return null;
    const latest = withVal[withVal.length - 1];
    const first = withVal[0];
    return { latest, delta: latest - first };
  }, [metrics, series]);

  const resetForm = () => {
    setDate(todayKey());
    setWeight('');
    setBodyFat('');
    setMeas({});
  };

  // Prefill the form from an existing entry when editing.
  const editEntry = (m: BodyMetric) => {
    setDate(m.date);
    setWeight(m.weightKg?.toString() ?? '');
    setBodyFat(m.bodyFat?.toString() ?? '');
    setMeas(
      Object.fromEntries(Object.entries(m.measurements ?? {}).map(([k, v]) => [k, String(v)]))
    );
    setShowForm(true);
  };

  const handleSave = () => {
    const measurements: Record<string, number> = {};
    for (const f of MEASUREMENT_FIELDS) {
      const raw = meas[f];
      if (raw && !Number.isNaN(Number(raw))) measurements[f] = Number(raw);
    }
    const weightKg = weight ? Number(weight) : undefined;
    const bodyFatVal = bodyFat ? Number(bodyFat) : undefined;
    if (weightKg == null && bodyFatVal == null && Object.keys(measurements).length === 0) {
      toast.error('Enter at least one value');
      return;
    }

    // Merge into any existing entry for this date so a partial save never wipes
    // fields the user didn't touch (e.g. adding a measurement to a weigh-in day).
    const existing = metrics.find((m) => m.date === date);
    const mergedMeasurements = { ...(existing?.measurements ?? {}), ...measurements };
    const entry: BodyMetric = {
      date,
      weightKg: weightKg ?? existing?.weightKg,
      bodyFat: bodyFatVal ?? existing?.bodyFat,
      measurements: Object.keys(mergedMeasurements).length ? mergedMeasurements : undefined,
    };

    upsertMetric(entry);
    toast.success('Measurement saved');
    resetForm();
    setShowForm(false);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-card-foreground">Body Metrics</h3>
        <button
          onClick={() => {
            if (showForm) resetForm();
            setShowForm((v) => !v);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: 'var(--vt-accent)' }}
          aria-label={showForm ? 'Close form' : 'Add measurement'}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <label className="mb-1 block text-xs text-muted-foreground">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mb-3 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
          />
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Weight (kg)</label>
              <input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                placeholder="—"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Body fat (%)</label>
              <input
                type="number"
                inputMode="decimal"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                placeholder="—"
              />
            </div>
          </div>
          <label className="mb-1 block text-xs text-muted-foreground">Measurements (cm)</label>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {MEASUREMENT_FIELDS.map((f) => (
              <div key={f}>
                <input
                  type="number"
                  inputMode="decimal"
                  value={meas[f] ?? ''}
                  onChange={(e) => setMeas((prev) => ({ ...prev, [f]: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                  placeholder={f}
                />
                <span className="mt-0.5 block text-center text-[9px] capitalize text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleSave}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--vt-accent)' }}
          >
            Save measurement
          </button>
        </div>
      )}

      {metrics.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-10 text-center">
          <p className="text-sm text-muted-foreground">No measurements yet.</p>
          <p className="mt-1 text-xs text-muted-foreground/70">Tap + to log your bodyweight.</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="mb-4 rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {availableSeries.map((k) => (
                <button
                  key={k}
                  onClick={() => setSeries(k)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    series === k
                      ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]/10 text-foreground'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {SERIES_LABEL[k]}
                </button>
              ))}
            </div>

            {stat && (
              <div className="mb-3 flex items-end gap-3">
                <span className="text-2xl font-bold text-foreground">{stat.latest}</span>
                <span
                  className="pb-1 text-xs font-medium"
                  style={{ color: stat.delta === 0 ? 'var(--muted-foreground)' : stat.delta > 0 ? '#4CAF50' : '#FF7A45' }}
                >
                  {stat.delta > 0 ? '+' : ''}
                  {Math.round(stat.delta * 10) / 10} since start
                </span>
              </div>
            )}

            <div className="h-40">
              {chartData.length >= 2 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} width={36} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--card-foreground)' }}
                      labelStyle={{ color: 'var(--card-foreground)' }}
                    />
                    <Line type="monotone" dataKey="value" stroke="var(--vt-accent)" strokeWidth={2} dot={{ r: 3, fill: 'var(--vt-accent)' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-xs text-muted-foreground">Log at least 2 entries to see a trend.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent entries */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="mb-2 text-sm font-semibold text-card-foreground">History</h4>
            <div className="space-y-1">
              {sorted.map((m) => (
                <div key={m.date} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                  <button onClick={() => editEntry(m)} className="flex-1 text-left">
                    <span className="text-sm text-card-foreground">{m.date}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {[
                        m.weightKg != null ? `${m.weightKg}kg` : null,
                        m.bodyFat != null ? `${m.bodyFat}%` : null,
                        ...Object.entries(m.measurements ?? {}).map(([k, v]) => `${k} ${v}`),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteMetric(m.date)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${m.date}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
