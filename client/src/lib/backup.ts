// Vongola Trainer — Data Backup / Restore
// All data is localStorage-only, so export/import is the user's safety net.
// Pure client-side: Blob download for export, FileReader + validation for import.

import { STORAGE_KEY, SCHEMA_VERSION, migrateStore } from './storage';
import { createDefaultStore } from './seed';

export interface BackupFile {
  app: 'vongola-trainer';
  schemaVersion: number;
  exportedAt: string;
  data: unknown;
}

const APP_TAG = 'vongola-trainer';

/** Read the persisted { state, version } envelope, or null if nothing saved yet. */
function readPersisted(): { state: unknown; version: number } | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return { state: parsed?.state ?? null, version: parsed?.version ?? SCHEMA_VERSION };
  } catch {
    return null;
  }
}

/** Trigger a download of the full app data as a JSON backup file. */
export function exportBackup(): void {
  const persisted = readPersisted();
  const payload: BackupFile = {
    app: APP_TAG,
    schemaVersion: persisted?.version ?? SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: persisted?.state ?? {},
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vongola-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export type ParseResult = { ok: true; data: unknown } | { ok: false; error: string };

/**
 * Validate + (if needed) migrate a backup file's text. Returns store state ready
 * to write, or a human-readable error. Never mutates anything.
 */
export function parseBackup(text: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Backup file is empty or malformed.' };
  }
  const file = parsed as Partial<BackupFile>;

  if (file.app !== APP_TAG) {
    return { ok: false, error: 'This is not a Vongola Trainer backup.' };
  }
  if (typeof file.schemaVersion !== 'number') {
    return { ok: false, error: 'Backup is missing its schema version.' };
  }
  if (file.schemaVersion > SCHEMA_VERSION) {
    return { ok: false, error: 'Backup is from a newer version of the app. Update first, then import.' };
  }
  if (!file.data || typeof file.data !== 'object') {
    return { ok: false, error: 'Backup contains no data.' };
  }

  // Must look at least plausibly like our store (one recognizable slice present),
  // otherwise it's some other JSON file the user picked by mistake.
  const d = file.data as Record<string, unknown>;
  const recognizable = ['days', 'log', 'workouts', 'user', 'metrics'].some((k) => k in d);
  if (!recognizable) {
    return { ok: false, error: 'Backup data is malformed (no recognizable fields).' };
  }

  // Always run the migration pipeline, then deep-merge over fresh defaults and
  // coerce every slice to a safe shape. A partial or slightly-malformed backup
  // therefore yields a VALID store (missing pieces defaulted) and can never
  // crash the app on load or silently overwrite good data with junk.
  const migrated = migrateStore({ ...(file.data as object) }, file.schemaVersion) as Record<string, unknown>;
  return { ok: true, data: mergeOverDefaults(migrated) };
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}
function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

/**
 * Merge an imported (already-migrated) state over fresh defaults, coercing each
 * slice so the result always satisfies the Store shape the app expects.
 */
function mergeOverDefaults(m: Record<string, unknown>): Record<string, unknown> {
  const def = createDefaultStore() as unknown as Record<string, unknown>;
  const w = asObject(m.workouts);
  const defW = def.workouts as Record<string, unknown>;
  const wk = (key: string) => (Array.isArray(w[key]) ? (w[key] as unknown[]) : (defW[key] as unknown[]));
  const equip = asArray<string>(m.equipmentProfile);
  return {
    ...def,
    ...m,
    user: { ...(def.user as object), ...asObject(m.user) },
    phase: { ...(def.phase as object), ...asObject(m.phase) },
    days: asObject(m.days),
    log: asArray(m.log),
    prs: asObject(m.prs),
    metrics: asArray(m.metrics),
    savedWorkouts: asArray(m.savedWorkouts),
    equipmentProfile: equip.length ? equip : (def.equipmentProfile as string[]),
    nextLift: m.nextLift === 'A' || m.nextLift === 'B' ? m.nextLift : def.nextLift,
    activeSession: m.activeSession ?? null,
    workouts: {
      liftA: wk('liftA'),
      liftB: wk('liftB'),
      morning: wk('morning'),
      evening: wk('evening'),
      custom: Array.isArray(w.custom) ? (w.custom as unknown[]) : [],
    },
  };
}

/** Overwrite all stored data with the given state and reload so the store rehydrates cleanly. */
export function applyBackup(data: unknown): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: data, version: SCHEMA_VERSION }));
  location.reload();
}

/** Wipe all app data and reload (back to a fresh default store). */
export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

/** Approximate size of the persisted blob, formatted for display. */
export function getStorageSize(): string {
  const raw = localStorage.getItem(STORAGE_KEY);
  const bytes = raw ? new Blob([raw]).size : 0;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
