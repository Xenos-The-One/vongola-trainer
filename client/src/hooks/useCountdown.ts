// useCountdown — seconds remaining until an absolute epoch timestamp.
// Derives from Date.now() each tick, so it stays correct across refresh,
// tab-throttling, and screen lock (the truth is the timestamp, not a counter).

import { useEffect, useState } from 'react';

export function useCountdown(endsAt?: number): number {
  const [, force] = useState(0);

  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => force((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!endsAt) return 0;
  return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
}

/** Seconds elapsed since an absolute start timestamp (ticks every second). */
export function useElapsed(startedAt?: number): number {
  const [, force] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (!startedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}

export function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
