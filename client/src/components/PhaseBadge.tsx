// PhaseBadge — Shows current training phase with dot indicator
// Design: "Ember & Parchment" — muted pill with accent dot

interface PhaseBadgeProps {
  name: string;
  week: number;
}

export default function PhaseBadge({ name, week }: PhaseBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: 'var(--vt-accent)' }}
      />
      <span className="text-xs font-medium text-secondary-foreground">
        {name} · Week {week}
      </span>
    </div>
  );
}
