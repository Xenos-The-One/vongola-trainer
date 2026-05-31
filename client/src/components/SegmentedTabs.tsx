// SegmentedTabs — horizontal pill switcher for in-page hub sections.
// State-based (no routing), styled to match the Ember & Parchment accent system.

interface SegmentedTabsProps<T extends string> {
  tabs: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
}

export default function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: SegmentedTabsProps<T>) {
  return (
    <div
      role="tablist"
      className={`flex gap-1 rounded-xl border border-border bg-card p-1 ${className ?? ''}`}
    >
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              active ? 'text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
            style={active ? { backgroundColor: 'var(--vt-accent)' } : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
