// Settings — Theme, Accent Color, Font Size, Starter, Nickname
// Design: "Ember & Parchment" — warm cards, clean form controls

import { useStore } from '@/lib/storage';
import type { AccentKey, FontSize, ThemeMode } from '@/lib/types';
import { Check } from 'lucide-react';

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

const STARTERS = [
  { id: 'natsu', name: 'Natsu', element: 'Sky', available: true },
  { id: 'uri', name: 'Uri', element: 'Storm', available: false },
  { id: 'gyudon', name: 'Gyudon', element: 'Lightning', available: false },
  { id: 'kojirou', name: 'Kojirou', element: 'Rain', available: false },
  { id: 'roll', name: 'Roll', element: 'Cloud', available: false },
];

export default function Settings() {
  const user = useStore(s => s.user);
  const setNickname = useStore(s => s.setNickname);
  const setAccent = useStore(s => s.setAccent);
  const setTheme = useStore(s => s.setTheme);
  const setFontSize = useStore(s => s.setFontSize);

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

      {/* Starter */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <label className="text-sm font-semibold text-card-foreground block mb-3">Companion</label>
        <div className="space-y-2">
          {STARTERS.map(starter => (
            <div
              key={starter.id}
              className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${
                starter.available
                  ? user.starter === starter.id
                    ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]/10'
                    : 'border-border'
                  : 'border-border opacity-40'
              }`}
            >
              <div>
                <span className="text-sm font-medium text-card-foreground">{starter.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{starter.element}</span>
              </div>
              {!starter.available && (
                <span className="text-[10px] text-muted-foreground italic">Coming soon</span>
              )}
              {starter.available && user.starter === starter.id && (
                <Check size={14} style={{ color: 'var(--vt-accent)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Version info */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">Vongola Trainer v1.0</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">Data stored locally on this device</p>
      </div>
    </div>
  );
}
