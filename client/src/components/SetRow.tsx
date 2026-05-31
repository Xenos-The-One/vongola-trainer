// SetRow — one editable set inside Active Workout: reps / weight / RPE + done.

import { Check, X } from 'lucide-react';
import type { ActiveSet } from '@/lib/types';

interface SetRowProps {
  index: number;
  set: ActiveSet;
  canRemove: boolean;
  onChange: (patch: Partial<ActiveSet>) => void;
  onToggleDone: () => void;
  onRemove: () => void;
}

function NumberField({
  value,
  onChange,
  label,
  step = 1,
  min = 0,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  step?: number;
  min?: number;
}) {
  return (
    <div className="flex-1">
      <input
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        min={min}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        className="w-full rounded-md border border-border bg-secondary px-2 py-2 text-center text-sm text-foreground"
      />
      <span className="mt-0.5 block text-center text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}

export default function SetRow({ index, set, canRemove, onChange, onToggleDone, onRemove }: SetRowProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
        set.done ? 'border-[var(--vt-accent)]/50 bg-[var(--vt-accent)]/10' : 'border-border'
      }`}
    >
      <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted-foreground">{index + 1}</span>
      <div className="flex flex-1 gap-2">
        <NumberField value={set.reps} onChange={(reps) => onChange({ reps })} label="reps" />
        <NumberField value={set.weight} onChange={(weight) => onChange({ weight })} label="kg" step={0.5} />
        <NumberField value={set.rpe ?? 0} onChange={(rpe) => onChange({ rpe })} label="RPE" min={0} />
      </div>
      <button
        onClick={onToggleDone}
        aria-label={set.done ? 'Mark set not done' : 'Mark set done'}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all ${
          set.done
            ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)] text-white'
            : 'border-muted-foreground/40 text-muted-foreground'
        }`}
      >
        <Check size={16} />
      </button>
      {canRemove && (
        <button onClick={onRemove} aria-label="Remove set" className="shrink-0 p-1 text-muted-foreground hover:text-destructive">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
