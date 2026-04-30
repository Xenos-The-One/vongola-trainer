// TaskBlock — Collapsible task section with checkable items
// Design: "Ember & Parchment" — warm cards, orange checkmarks, strikethrough on complete

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import type { DayState } from '@/lib/types';
import { useStore } from '@/lib/storage';
import { triggerFlameConfetti } from '@/lib/confetti';

interface TaskBlockProps {
  title: string;
  subtitle: string;
  blockKey: keyof DayState['blocks'];
  items: string[];
  defaultExpanded?: boolean;
}

export default function TaskBlock({ title, subtitle, blockKey, items, defaultExpanded = false }: TaskBlockProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const getTodayState = useStore(s => s.getTodayState);
  const toggleTask = useStore(s => s.toggleTask);
  const days = useStore(s => s.days);

  const todayState = getTodayState();
  const block = todayState.blocks[blockKey];
  const done = block.done;
  const total = block.total;
  const isComplete = done >= total;
  const prevPctRef = useRef(0);

  // Check if overall day completion just hit 100%
  useEffect(() => {
    const overallPct = getTodayState().completionPct;
    if (overallPct >= 100 && prevPctRef.current < 100) {
      triggerFlameConfetti();
      if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 50]);
    }
    prevPctRef.current = overallPct;
  });

  // Track which specific items are checked (local state synced with block.done count)
  const [checkedItems, setCheckedItems] = useState<Set<number>>(() => {
    const set = new Set<number>();
    for (let i = 0; i < done; i++) set.add(i);
    return set;
  });

  const handleToggle = (index: number) => {
    const isChecked = checkedItems.has(index);
    
    if (isChecked) {
      const newSet = new Set(checkedItems);
      newSet.delete(index);
      setCheckedItems(newSet);
      toggleTask(blockKey, -1);
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10);
    } else {
      const newSet = new Set(checkedItems);
      newSet.add(index);
      setCheckedItems(newSet);
      toggleTask(blockKey, 1);
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50"
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown size={16} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-card-foreground truncate">{title}</h4>
            {isComplete && (
              <span className="text-xs text-green-400">✓</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <span className="text-xs font-medium text-muted-foreground shrink-0">
          {done}/{total}
        </span>
      </button>

      {/* Items */}
      {expanded && (
        <div className="border-t border-border px-4 py-2">
          {items.slice(0, total).map((item, index) => {
            const isChecked = checkedItems.has(index);
            return (
              <button
                key={index}
                onClick={() => handleToggle(index)}
                className="flex w-full items-center gap-3 py-2 text-left group"
                aria-label={`${isChecked ? 'Uncheck' : 'Check'} ${item}`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                    isChecked
                      ? 'border-[var(--vt-accent)] bg-[var(--vt-accent)]'
                      : 'border-muted-foreground/40 group-hover:border-[var(--vt-accent)]/60'
                  }`}
                >
                  {isChecked && (
                    <Check size={12} className="text-white check-pop" />
                  )}
                </div>
                <span
                  className={`text-sm transition-all ${
                    isChecked
                      ? 'text-muted-foreground line-through opacity-60'
                      : 'text-card-foreground'
                  }`}
                >
                  {item}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
