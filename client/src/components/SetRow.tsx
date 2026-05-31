// SetRow — one editable set inside Active Workout: reps / weight / RPE + done.
//
// NumberField keeps a LOCAL string state so the user can clear the input,
// type "1.", type a decimal mid-input, etc. — without the parent value
// snapping the display back to "0" on every keystroke (the original bug).
// The parent receives the parsed numeric value only when it parses cleanly.

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { ActiveSet } from '@/lib/types';
import { useStore } from '@/lib/storage';
import { toUnit, fromUnit } from '@/lib/units';

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
  // Local string mirrors the controlled value but lets the user type
  // intermediate states ("", "1.", "0.5") without snap-back to "0".
  const [text, setText] = useState(value === 0 ? '' : String(value));

  // Re-sync when the parent value changes externally (set added, prefill swap,
  // overload bump). Skip when our local empty already maps to value === 0, or
  // when the user is mid-typing a value that parses to the same number.
  useEffect(() => {
    const parsed = text === '' ? 0 : Number(text);
    if (parsed === value) return;
    setText(value === 0 ? '' : String(value));
  }, [value]);

  return (
    <div className="flex-1">
      <input
        type="number"
        inputMode="decimal"
        value={text}
        placeholder={String(min)}
        step={step}
        min={min}
        onChange={(e) => {
          const t = e.target.value;
          setText(t);
          if (t === '' || t === '-' || t.endsWith('.')) {
            // Partial / empty — don't push junk to parent. Re-emit 0 when truly empty.
            if (t === '') onChange(0);
            return;
          }
          const n = Number(t);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="w-full rounded-md border border-border bg-secondary px-2 py-2 text-center text-sm text-foreground"
      />
      <span className="mt-0.5 block text-center text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}

export default function SetRow({ index, set, canRemove, onChange, onToggleDone, onRemove }: SetRowProps) {
  const units = useStore((s) => s.user.units ?? 'kg');
  // The weight field shows + accepts values in the user's chosen unit, but the
  // store keeps kg. Convert at the edge so log math (e1RM, PRs, volume) stays
  // unit-agnostic.
  const displayWeight = toUnit(set.weight, units);
  const weightStep = units === 'kg' ? 0.5 : 1;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
        set.done ? 'border-[var(--vt-accent)]/50 bg-[var(--vt-accent)]/10' : 'border-border'
      }`}
    >
      <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted-foreground">{index + 1}</span>
      <div className="flex flex-1 gap-2">
        <NumberField value={set.reps} onChange={(reps) => onChange({ reps })} label="reps" />
        <NumberField
          value={Number(displayWeight.toFixed(2))}
          onChange={(w) => onChange({ weight: fromUnit(w, units) })}
          label={units}
          step={weightStep}
        />
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
