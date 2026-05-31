// NotFound — 404 page styled to match the Ember & Parchment design system.

import { Flame, Home } from 'lucide-react';
import { useLocation } from 'wouter';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="pb-24 pt-16 text-center">
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          backgroundColor: 'var(--vt-accent-glow)',
          boxShadow: '0 4px 24px var(--vt-accent-glow)',
        }}
      >
        <Flame size={28} style={{ color: 'var(--vt-accent)' }} />
      </div>

      <h1
        className="text-3xl font-bold text-foreground mb-1"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        404
      </h1>
      <p className="text-sm text-muted-foreground mb-1">Off the protocol.</p>
      <p className="text-xs text-muted-foreground/70 mb-8">
        This page isn't in the playbook.
      </p>

      <button
        onClick={() => setLocation('/')}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--vt-accent)' }}
      >
        <Home size={16} />
        Back to Today
      </button>
    </div>
  );
}
