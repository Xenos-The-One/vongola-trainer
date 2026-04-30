// BottomNav — 5-tab navigation (Today, Log, Progress, Protocol, Settings)
// Design: "Ember & Parchment" — warm dark, subtle borders, orange accent for active

import { Clock, FileText, Activity, BookOpen, Settings } from 'lucide-react';
import { useLocation } from 'wouter';

const tabs = [
  { path: '/', label: 'Today', icon: Clock },
  { path: '/log', label: 'Log', icon: FileText },
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
