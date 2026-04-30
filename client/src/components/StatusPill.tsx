// StatusPill — Horizontal scrollable status indicators
// Design: "Ember & Parchment" — rounded pills, green border when complete

interface StatusPillProps {
  label: string;
  emoji: string;
  done: number;
  total: number;
  isComplete: boolean;
}

export default function StatusPill({ label, emoji, done, total, isComplete }: StatusPillProps) {
  return (
    <div
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        isComplete
          ? 'border-green-500/60 bg-green-500/10 text-green-400'
          : 'border-border bg-secondary text-secondary-foreground'
      }`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      {isComplete ? (
        <span>✓</span>
      ) : (
        <span className="text-muted-foreground">{done}/{total}</span>
      )}
    </div>
  );
}
