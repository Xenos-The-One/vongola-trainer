// CustomExerciseForm — minimal form for adding a user-defined exercise.
// Writes to the customExercises store slice; the result becomes pickable
// everywhere the library is consulted (ⓘ info modal, Log picker, generator
// when equipment + muscle tags align).

import { useState } from 'react';
import { toast } from 'sonner';
import { useStore } from '@/lib/storage';
import { EQUIPMENT_OPTIONS, type Equipment } from '@/lib/exercises';
import { MUSCLE_SLUGS, MUSCLE_DISPLAY, type MuscleSlug } from '@/lib/muscles';
import { slugify } from '@/lib/utils';

type Category = 'push' | 'pull' | 'legs' | 'core' | 'mobility' | 'cardio';

interface Props {
  onSaved?: () => void;
}

export default function CustomExerciseForm({ onSaved }: Props) {
  const addCustomExercise = useStore((s) => s.addCustomExercise);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('push');
  const [primary, setPrimary] = useState<MuscleSlug[]>([]);
  const [secondary, setSecondary] = useState<MuscleSlug[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>(['bodyweight']);
  const [cue, setCue] = useState('');
  const [instructions, setInstructions] = useState('');

  const togglePrimary = (m: MuscleSlug) => {
    setPrimary((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]));
  };
  const toggleSecondary = (m: MuscleSlug) => {
    setSecondary((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));
  };
  const toggleEquipment = (e: Equipment) => {
    setEquipment((eq) => (eq.includes(e) ? eq.filter((x) => x !== e) : [...eq, e]));
  };

  const canSave = name.trim().length > 0 && primary.length > 0;

  const handleSave = () => {
    if (!canSave) {
      toast.error('Need a name and at least one primary muscle.');
      return;
    }
    const id = `custom-${slugify(name.trim())}`;
    addCustomExercise({
      id,
      name: name.trim(),
      primaryMuscles: primary,
      secondaryMuscles: secondary,
      equipment,
      category,
      mechanic: 'compound',
      difficulty: 'beginner',
      unilateral: false,
      cue: cue.trim() || `${name.trim()} — focus on form.`,
      instructions: instructions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    toast.success('Added to library');
    setName(''); setPrimary([]); setSecondary([]); setEquipment(['bodyweight']); setCue(''); setInstructions('');
    onSaved?.();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bulgarian Split Squat (Cable)"
          className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Category</label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['push', 'pull', 'legs', 'core', 'mobility', 'cardio'] as Category[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                category === c
                  ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]/10 text-foreground'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Primary muscles (at least one)</label>
        <div className="flex flex-wrap gap-1.5">
          {MUSCLE_SLUGS.map((m) => {
            const active = primary.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => togglePrimary(m)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  active
                    ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)] text-white'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {MUSCLE_DISPLAY[m]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Secondary muscles (optional)</label>
        <div className="flex flex-wrap gap-1.5">
          {MUSCLE_SLUGS.filter((m) => !primary.includes(m)).map((m) => {
            const active = secondary.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleSecondary(m)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  active
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {MUSCLE_DISPLAY[m]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Equipment</label>
        <div className="grid grid-cols-3 gap-1.5">
          {EQUIPMENT_OPTIONS.map(({ key, label }) => {
            const active = equipment.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleEquipment(key)}
                className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                  active
                    ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]/10 text-foreground'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Cue (one-line reminder)</label>
        <input
          type="text"
          value={cue}
          onChange={(e) => setCue(e.target.value)}
          placeholder="e.g. Drive through the heel, keep chest tall."
          className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">How to perform (one step per line)</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={4}
          placeholder={'1. Set up...\n2. Execute...\n3. Reset...'}
          className="w-full resize-none rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        style={{ backgroundColor: 'var(--vt-accent)' }}
      >
        Add to library
      </button>
    </div>
  );
}
