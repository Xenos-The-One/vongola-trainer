// Vongola Trainer — Local date keys
// Single source of truth for "YYYY-MM-DD" day keys. MUST use LOCAL date
// components (not UTC / toISOString) so a day rolls over at the user's local
// midnight — otherwise evening logs in negative-UTC timezones land on the wrong
// calendar day and the streak fragments. The history calendar already keys cells
// this way; everything else routes through here to stay consistent.

/** Local "YYYY-MM-DD" for a given Date. */
export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Local "YYYY-MM-DD" for right now. */
export function todayKey(): string {
  return dateKey(new Date());
}

/** Local "YYYY-MM-DD" for N days before today. */
export function daysAgoKey(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateKey(d);
}

/**
 * "Week N since start" — used by the phase badge so the displayed week
 * actually advances over time instead of being a frozen seed value.
 * Returns 1 on the start date and every day in that calendar week, 2 the
 * following week, etc. Clamped to ≥ 1 (start in the future still reads as
 * Week 1 rather than 0 or negative).
 */
export function weeksSince(startKey: string, today: Date = new Date()): number {
  const [y, m, d] = startKey.split('-').map(Number);
  if (!y || !m || !d) return 1;
  const start = new Date(y, m - 1, d);
  const ms = today.getTime() - start.getTime();
  const weeks = Math.floor(ms / (1000 * 60 * 60 * 24 * 7));
  return Math.max(1, weeks + 1);
}
