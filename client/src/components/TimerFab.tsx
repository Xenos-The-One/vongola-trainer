// TimerFab — Floating action button for workout timer
// Design: "Ember & Parchment" — orange circle with clock icon, pulse glow

import { useState, useEffect, useRef } from 'react';
import { Clock, X, Play, Pause, RotateCcw } from 'lucide-react';

export default function TimerFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setSeconds(0);
    setIsRunning(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          backgroundColor: 'var(--vt-accent)',
          boxShadow: '0 4px 20px var(--vt-accent-glow), 0 2px 8px rgba(0,0,0,0.3)',
        }}
        aria-label="Open timer"
      >
        <Clock size={24} className="text-white" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-20 right-4 z-40 flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-xl"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
    >
      {/* Close button */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
        aria-label="Close timer"
      >
        <X size={14} />
      </button>

      {/* Timer display */}
      <div className="font-mono text-2xl font-bold text-foreground tabular-nums">
        {formatTime(seconds)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: 'var(--vt-accent)' }}
          aria-label={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? (
            <Pause size={18} className="text-white" />
          ) : (
            <Play size={18} className="text-white ml-0.5" />
          )}
        </button>
        <button
          onClick={reset}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Reset timer"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
