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
