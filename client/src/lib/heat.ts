// Shared completion-heat color ramp, used by the Progress overview grid and the
// history calendar so they always agree visually.

export function getHeatColor(pct: number): string {
  if (pct >= 100) return 'var(--vt-accent)';
  if (pct >= 75) return 'var(--vt-accent-dim)';
  if (pct >= 50) return 'var(--vt-accent-glow)';
  if (pct > 0) return 'var(--mm-empty)';
  return 'rgba(127,127,127,0.06)';
}
