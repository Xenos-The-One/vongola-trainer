// RestTimerBar — sticky rest countdown shown while resting between sets.
// Reads restEndsAt (absolute epoch) from the active session; refresh-safe.

import { useEffect, useRef } from 'react';
import { Minus, Plus, SkipForward } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/lib/storage';
import { useCountdown, formatMMSS } from '@/hooks/useCountdown';

export default function RestTimerBar() {
  const session = useStore((s) => s.activeSession);
  const adjustRest = useStore((s) => s.adjustRest);
  const stopRest = useStore((s) => s.stopRest);
  const remaining = useCountdown(session?.restEndsAt);
  const firedRef = useRef(false);

  useEffect(() => {
    if (session?.restEndsAt && remaining === 0 && !firedRef.current) {
      firedRef.current = true;
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
      toast('Rest done — next set');
      stopRest();
    }
    if (remaining > 0) firedRef.current = false;
  }, [remaining, session?.restEndsAt, stopRest]);

  if (!session?.restEndsAt) return null;

  const total = session.restPreset;
  const pct = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;

  return (
    <div className="rounded-xl border border-[var(--vt-accent)]/40 bg-card p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Rest</span>
        <span className="font-mono text-xl font-bold tabular-nums text-foreground">{formatMMSS(remaining)}</span>
      </div>
      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: 'var(--vt-accent)' }} />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => adjustRest(-15)}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-xs font-medium text-card-foreground"
        >
          <Minus size={13} /> 15s
        </button>
        <button
          onClick={() => adjustRest(15)}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-xs font-medium text-card-foreground"
        >
          <Plus size={13} /> 15s
        </button>
        <button
          onClick={stopRest}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold text-white"
          style={{ backgroundColor: 'var(--vt-accent)' }}
        >
          <SkipForward size={13} /> Skip
        </button>
      </div>
    </div>
  );
}
