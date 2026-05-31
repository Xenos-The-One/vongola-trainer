// Settings — Theme, Accent Color, Font Size, Starter, Nickname
// Design: "Ember & Parchment" — warm cards, clean form controls

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useStore } from '@/lib/storage';
import { COMPANIONS } from '@/lib/companions';
import type { AccentKey, FontSize, ThemeMode } from '@/lib/types';
import { exportBackup, parseBackup, applyBackup, resetAllData, getStorageSize } from '@/lib/backup';
import { EQUIPMENT_OPTIONS, type Equipment } from '@/lib/exercises';
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
import { Check, Download, Upload, Trash2 } from 'lucide-react';

const ACCENTS: { key: AccentKey; label: string; color: string }[] = [
  { key: 'amber', label: 'Amber', color: '#E0A82E' },
  { key: 'ocean', label: 'Ocean', color: '#4DA8DA' },
  { key: 'forest', label: 'Forest', color: '#4CAF50' },
  { key: 'sunset', label: 'Sunset', color: '#FF7A45' },
  { key: 'rose', label: 'Rose', color: '#EC4899' },
  { key: 'violet', label: 'Violet', color: '#8B5CF6' },
];

const FONT_SIZES: { key: FontSize; label: string; desc: string }[] = [
  { key: 'S', label: 'Small', desc: '14px' },
  { key: 'M', label: 'Medium', desc: '16px' },
  { key: 'L', label: 'Large', desc: '18px' },
];

// Ordered: Sky → Storm → Rain (Kojirou, Jirou) → Sun → Lightning → Cloud → Mist
const STARTERS = [
  { id: 'natsu', name: 'Natsu', element: 'Sky', available: true },
  { id: 'uri', name: 'Uri', element: 'Storm', available: true },
  { id: 'kojirou', name: 'Kojirou', element: 'Rain', available: true },
  { id: 'jirou', name: 'Jirou', element: 'Rain', available: true },
  { id: 'kangaryuu', name: 'Kangaryuu', element: 'Sun', available: true },
  { id: 'gyudon', name: 'Gyuudon', element: 'Lightning', available: true },
  { id: 'roll', name: 'Roll', element: 'Cloud', available: true },
  { id: 'mukurou', name: 'Mukurou', element: 'Mist', available: true },
];

const ELEMENT_COLORS: Record<string, string> = {
  Sky: '#FFE066',
  Storm: '#FF4444',
  Rain: '#7FCFFF',
  Sun: '#FFB800',
  Lightning: '#86EFAC',
  Cloud: '#C084FC',
  Mist: '#A78BFA',
};

export default function Settings() {
  const user = useStore(s => s.user);
  const setNickname = useStore(s => s.setNickname);
  const setAccent = useStore(s => s.setAccent);
  const setTheme = useStore(s => s.setTheme);
  const setFontSize = useStore(s => s.setFontSize);
  const setStarter = useStore(s => s.setStarter);
  const setUnits = useStore(s => s.setUnits);
  const equipmentProfile = useStore((s) => s.equipmentProfile);
  const setEquipmentProfile = useStore((s) => s.setEquipmentProfile);
  const units = user.units ?? 'kg';

  const toggleEquipment = (key: Equipment) => {
    setEquipmentProfile(
      equipmentProfile.includes(key)
        ? equipmentProfile.filter((e) => e !== key)
        : [...equipmentProfile, key]
    );
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<unknown | null>(null);
  const [showReset, setShowReset] = useState(false);

  const handleExport = () => {
    exportBackup();
    toast.success('Backup downloaded');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    const result = parseBackup(await file.text());
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setPendingImport(result.data);
  };

  return (
    <div className="pb-24 pt-4">
      <h1
        className="text-2xl font-bold text-foreground mb-5"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Settings
      </h1>

      {/* Nickname */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <label className="text-sm font-semibold text-card-foreground block mb-2">Nickname</label>
        <input
          type="text"
          value={user.nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
          placeholder="Your companion's name"
          maxLength={20}
        />
      </div>

      {/* Theme */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <label className="text-sm font-semibold text-card-foreground block mb-3">Theme</label>
        <div className="grid grid-cols-2 gap-2">
          {(['dark', 'light'] as ThemeMode[]).map(theme => (
            <button
              key={theme}
              onClick={() => setTheme(theme)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                user.theme === theme
                  ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]/10 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Units */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <label className="text-sm font-semibold text-card-foreground block mb-1">Weight units</label>
        <p className="text-[11px] text-muted-foreground mb-3">
          Display only — internal log values are unchanged when you toggle.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(['kg', 'lb'] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnits(u)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium uppercase transition-colors ${
                units === u
                  ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]/10 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <label className="text-sm font-semibold text-card-foreground block mb-3">Accent Color</label>
        <div className="grid grid-cols-3 gap-2">
          {ACCENTS.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setAccent(key)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                user.accent === key
                  ? 'border-[var(--vt-accent)]'
                  : 'border-border'
              }`}
            >
              <span className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-card-foreground">{label}</span>
              {user.accent === key && <Check size={12} style={{ color: 'var(--vt-accent)' }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <label className="text-sm font-semibold text-card-foreground block mb-3">Font Size</label>
        <div className="grid grid-cols-3 gap-2">
          {FONT_SIZES.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => setFontSize(key)}
              className={`rounded-lg border px-3 py-2.5 text-center transition-colors ${
                user.fontSize === key
                  ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]/10'
                  : 'border-border'
              }`}
            >
              <span className="text-sm font-medium text-card-foreground block">{label}</span>
              <span className="text-[10px] text-muted-foreground">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Starter Companion */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <label className="text-sm font-semibold text-card-foreground block mb-3">Companion</label>
        <div className="space-y-2">
          {STARTERS.map(starter => {
            const companion = COMPANIONS[starter.id];
            const isSelected = user.starter === starter.id;
            const elementColor = ELEMENT_COLORS[starter.element] || '#888';
            
            return (
              <button
                key={starter.id}
                onClick={() => starter.available && setStarter(starter.id)}
                disabled={!starter.available}
                className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors text-left ${
                  starter.available
                    ? isSelected
                      ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]/10'
                      : 'border-border hover:border-[var(--vt-accent)]/40'
                    : 'border-border opacity-40 cursor-not-allowed'
                }`}
              >
                {/* Sprite thumbnail */}
                {companion && (
                  <img
                    src={companion.sprites['cub-awake']}
                    alt={starter.name}
                    className="w-8 h-8 object-contain"
                  />
                )}
                <div className="flex-1">
                  <span className="text-sm font-medium text-card-foreground">{starter.name}</span>
                  <span
                    className="text-xs ml-2 font-medium"
                    style={{ color: elementColor }}
                  >
                    {starter.element}
                  </span>
                </div>
                {!starter.available && (
                  <span className="text-[10px] text-muted-foreground italic">Coming soon</span>
                )}
                {starter.available && isSelected && (
                  <Check size={14} style={{ color: 'var(--vt-accent)' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Equipment */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <label className="text-sm font-semibold text-card-foreground block mb-1">Equipment</label>
        <p className="text-[11px] text-muted-foreground mb-3">
          What you have access to — the generator only picks from these.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {EQUIPMENT_OPTIONS.map(({ key, label }) => {
            const active = equipmentProfile.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleEquipment(key)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  active ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]/10 text-foreground' : 'border-border text-muted-foreground'
                }`}
              >
                <span>{label}</span>
                {active && <Check size={12} style={{ color: 'var(--vt-accent)' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Data backup */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <label className="text-sm font-semibold text-card-foreground block mb-1">Data</label>
        <p className="text-[11px] text-muted-foreground mb-3">
          Stored on this device only · {getStorageSize()}. Export a backup to keep it safe.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:border-[var(--vt-accent)]/40"
          >
            <Download size={15} /> Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:border-[var(--vt-accent)]/40"
          >
            <Upload size={15} /> Import
          </button>
        </div>
        <button
          onClick={() => setShowReset(true)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/40 px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 size={15} /> Reset all data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Version info */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">Vongola Trainer v1.2</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">Data stored locally on this device</p>
      </div>

      {/* Import confirmation */}
      <AlertDialog
        open={pendingImport !== null}
        onOpenChange={(open) => {
          if (!open) setPendingImport(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import this backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This replaces all data currently on this device with the backup's contents, then reloads.
              It can't be undone — export your current data first if you're unsure.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingImport !== null) applyBackup(pendingImport);
              }}
            >
              Replace &amp; reload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset confirmation */}
      <AlertDialog open={showReset} onOpenChange={setShowReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently erases your workouts, logs, streak, and settings on this device.
              Consider exporting a backup first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetAllData}>Erase everything</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
