// BottomNav — 4-tab navigation (Today, Progress, Protocol, Settings).
// Log was merged into Progress > History after the overhaul — the calendar
// drawer already shows logged exercises per day, and manual entry lives at
// the top of the History view.

import { Clock, Activity, BookOpen, Settings } from 'lucide-react';
import { useLocation } from 'wouter';

const tabs = [
  { path: '/', label: 'Today', icon: Clock },
  { path: '/progress', label: 'Progress', icon: Activity },
  { path: '/protocol', label: 'Protocol', icon: BookOpen },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const [location, setLocation] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-[480px] items-center justify-around py-2">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = location === path;
          return (
            <button
              key={path}
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              onClick={() => setLocation(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive
                  ? 'text-[var(--vt-accent)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
