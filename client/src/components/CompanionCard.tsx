// CompanionCard — Central pixel-art companion display with sky background
// Design: "Ember & Parchment" — warm glow beneath, time-shifting sky, idle animation

import { useState, useEffect, useMemo } from 'react';
import { getEvolutionStage, getStatusMessage } from '@/lib/evolution';
import { getCompanion } from '@/lib/companions';
import { useStore } from '@/lib/storage';

function getSkyGradient(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return 'linear-gradient(180deg, #FF9A56 0%, #FFD89B 40%, #87CEEB 100%)'; // morning amber
  if (hour >= 8 && hour < 17) return 'linear-gradient(180deg, #87CEEB 0%, #B8E0F0 50%, #5BAD5B 100%)'; // midday blue
  if (hour >= 17 && hour < 20) return 'linear-gradient(180deg, #FF7A45 0%, #FFB347 30%, #4A6741 100%)'; // dusk orange
  return 'linear-gradient(180deg, #0F1729 0%, #1A2744 50%, #2D3B2D 100%)'; // night navy
}

export default function CompanionCard() {
  const nickname = useStore(s => s.user.nickname);
  const starter = useStore(s => s.user.starter);
  const getTodayState = useStore(s => s.getTodayState);
  const getStreak = useStore(s => s.getStreak);
  const days = useStore(s => s.days);

  const todayState = getTodayState();
  const pct = todayState.completionPct;
  const streak = getStreak();

  const companion = getCompanion(starter);
  const { stage } = getEvolutionStage(pct, streak);
  const statusMsg = getStatusMessage(pct, streak);
  const spriteUrl = companion.sprites[stage];

  const [speech, setSpeech] = useState<string | null>(null);
  const skyGradient = useMemo(() => getSkyGradient(), []);

  // Random speech bubble every 15-30 seconds
  useEffect(() => {
    const showSpeech = () => {
      const msg = companion.speeches[Math.floor(Math.random() * companion.speeches.length)];
      setSpeech(msg);
      setTimeout(() => setSpeech(null), 4000);
    };

    // Show initial speech after 3 seconds
    const initialTimeout = setTimeout(showSpeech, 3000);
    const interval = setInterval(showSpeech, 20000 + Math.random() * 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [companion.speeches]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border"
      style={{ boxShadow: '0 4px 24px var(--vt-accent-glow)' }}
    >
      {/* Sky background */}
      <div
        className="relative flex flex-col items-center justify-center px-4 py-8"
        style={{ background: skyGradient, minHeight: '240px' }}
      >
        {/* Simple ground */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#3D5C3A] to-[#5BAD5B]/80" />

        {/* Trees (simple pixel-style) */}
        <div className="absolute bottom-10 left-6 h-16 w-4 rounded-t-full bg-[#2D5A2D]" />
        <div className="absolute bottom-10 left-4 h-8 w-8 rounded-full bg-[#3D7A3D]" />
        <div className="absolute bottom-10 right-8 h-12 w-3 rounded-t-full bg-[#2D5A2D]" />
        <div className="absolute bottom-10 right-6 h-7 w-7 rounded-full bg-[#3D7A3D]" />

        {/* Speech bubble */}
        {speech && (
          <div className="speech-bubble absolute top-4 left-1/2 -translate-x-1/2 z-10 max-w-[200px] rounded-xl bg-card/90 px-3 py-2 text-xs text-card-foreground shadow-lg backdrop-blur-sm">
            <p className="text-center italic">"{speech}"</p>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 bg-card/90" />
          </div>
        )}

        {/* Companion sprite */}
        <img
          src={spriteUrl}
          alt={`${companion.name} - ${stage}`}
          className="companion-idle relative z-[1] h-36 w-36 object-contain drop-shadow-lg"
          style={{ imageRendering: 'auto' }}
        />
      </div>

      {/* Info section */}
      <div className="bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-card-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            {nickname}
          </h3>
          <span className="text-xs text-muted-foreground">
            {pct}% today · streak {streak}d
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{statusMsg}</p>
      </div>
    </div>
  );
}
