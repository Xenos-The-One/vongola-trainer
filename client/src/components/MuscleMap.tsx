// MuscleMap — stylized front + back anatomical figure, shaded by training
// intensity. Pure/presentational: the caller passes normalized intensities
// (0..1) per canonical muscle slug. Colors follow the active accent + theme.

import { MUSCLE_DISPLAY, type MuscleSlug } from '@/lib/muscles';

interface MuscleMapProps {
  intensities: Partial<Record<MuscleSlug, number>>;
  view?: 'front' | 'back' | 'both';
  onMuscleTap?: (slug: MuscleSlug) => void;
  selected?: MuscleSlug | null;
  className?: string;
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export default function MuscleMap({
  intensities,
  view = 'both',
  onMuscleTap,
  selected,
  className,
}: MuscleMapProps) {
  // Shared per-region props: fill ramps the accent by intensity; empty regions
  // use a faint theme token. Tappable when onMuscleTap is provided.
  function region(slug: MuscleSlug) {
    const t = clamp01(intensities[slug] ?? 0);
    const active = t > 0;
    const interactive = !!onMuscleTap;
    const isSelected = selected === slug;
    return {
      'data-muscle': slug,
      fill: active ? 'var(--vt-accent)' : 'var(--mm-empty)',
      fillOpacity: active ? 0.3 + 0.7 * t : 1,
      stroke: isSelected ? 'var(--vt-accent)' : 'var(--mm-stroke)',
      strokeWidth: isSelected ? 1.6 : 0.6,
      style: { transition: 'fill-opacity 0.3s ease', cursor: interactive ? 'pointer' : 'default' },
      role: interactive ? 'button' : undefined,
      tabIndex: interactive ? 0 : undefined,
      'aria-label': interactive ? `${MUSCLE_DISPLAY[slug]} — ${Math.round(t * 100)}%` : undefined,
      onClick: interactive ? () => onMuscleTap!(slug) : undefined,
      onKeyDown: interactive
        ? (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onMuscleTap!(slug);
            }
          }
        : undefined,
    };
  }

  const silhouette = { fill: 'var(--mm-empty)', fillOpacity: 0.4, stroke: 'none' } as const;
  const bodyPath =
    'M44 34 Q60 28 76 34 L82 56 L74 92 L70 150 L66 212 L54 212 L50 150 L46 92 L38 56 Z';

  const Front = (
    <svg viewBox="0 0 120 252" className="h-full w-full" role="img" aria-label="Front of body">
      <circle cx="60" cy="16" r="11" {...silhouette} />
      <path d={bodyPath} {...silhouette} />
      {/* neck + traps */}
      <rect x="54" y="26" width="12" height="9" rx="3" {...region('neck')} />
      <path d="M48 36 L60 40 L54 50 L44 46 Z" {...region('trapezius')} />
      <path d="M72 36 L60 40 L66 50 L76 46 Z" {...region('trapezius')} />
      {/* shoulders */}
      <ellipse cx="41" cy="52" rx="9" ry="8" {...region('front-deltoids')} />
      <ellipse cx="79" cy="52" rx="9" ry="8" {...region('front-deltoids')} />
      {/* chest */}
      <path d="M50 50 Q60 49 60 50 L60 66 Q53 67 48 62 Z" {...region('chest')} />
      <path d="M70 50 Q60 49 60 50 L60 66 Q67 67 72 62 Z" {...region('chest')} />
      {/* biceps + forearms */}
      <rect x="30" y="58" width="9" height="20" rx="4" {...region('biceps')} />
      <rect x="81" y="58" width="9" height="20" rx="4" {...region('biceps')} />
      <rect x="27" y="80" width="8" height="22" rx="4" {...region('forearm')} />
      <rect x="85" y="80" width="8" height="22" rx="4" {...region('forearm')} />
      {/* abs + obliques */}
      <rect x="53" y="68" width="14" height="28" rx="3" {...region('abs')} />
      <rect x="46" y="70" width="6" height="22" rx="3" {...region('obliques')} />
      <rect x="68" y="70" width="6" height="22" rx="3" {...region('obliques')} />
      {/* adductors (inner thigh) */}
      <rect x="55" y="104" width="4" height="30" rx="2" {...region('adductor')} />
      <rect x="61" y="104" width="4" height="30" rx="2" {...region('adductor')} />
      {/* quads */}
      <rect x="44" y="100" width="11" height="42" rx="5" {...region('quadriceps')} />
      <rect x="65" y="100" width="11" height="42" rx="5" {...region('quadriceps')} />
      {/* calves (shin) */}
      <rect x="45" y="150" width="11" height="36" rx="5" {...region('calves')} />
      <rect x="64" y="150" width="11" height="36" rx="5" {...region('calves')} />
    </svg>
  );

  const Back = (
    <svg viewBox="0 0 120 252" className="h-full w-full" role="img" aria-label="Back of body">
      <circle cx="60" cy="16" r="11" {...silhouette} />
      <path d={bodyPath} {...silhouette} />
      <rect x="54" y="26" width="12" height="9" rx="3" {...region('neck')} />
      {/* traps (upper-back diamond) */}
      <path d="M60 36 L46 46 L60 72 L74 46 Z" {...region('trapezius')} />
      {/* rear delts */}
      <ellipse cx="40" cy="52" rx="9" ry="8" {...region('back-deltoids')} />
      <ellipse cx="80" cy="52" rx="9" ry="8" {...region('back-deltoids')} />
      {/* upper back */}
      <rect x="47" y="58" width="9" height="12" rx="3" {...region('upper-back')} />
      <rect x="64" y="58" width="9" height="12" rx="3" {...region('upper-back')} />
      {/* lats (wings) */}
      <path d="M54 70 L47 72 L52 92 L57 90 Z" {...region('lats')} />
      <path d="M66 70 L73 72 L68 92 L63 90 Z" {...region('lats')} />
      {/* lower back */}
      <rect x="53" y="90" width="14" height="12" rx="3" {...region('lower-back')} />
      {/* triceps + forearms */}
      <rect x="30" y="58" width="9" height="20" rx="4" {...region('triceps')} />
      <rect x="81" y="58" width="9" height="20" rx="4" {...region('triceps')} />
      <rect x="27" y="80" width="8" height="22" rx="4" {...region('forearm')} />
      <rect x="85" y="80" width="8" height="22" rx="4" {...region('forearm')} />
      {/* glutes */}
      <ellipse cx="53" cy="108" rx="8" ry="8" {...region('gluteal')} />
      <ellipse cx="67" cy="108" rx="8" ry="8" {...region('gluteal')} />
      {/* hamstrings + calves */}
      <rect x="45" y="116" width="11" height="34" rx="5" {...region('hamstring')} />
      <rect x="64" y="116" width="11" height="34" rx="5" {...region('hamstring')} />
      <rect x="45" y="152" width="11" height="36" rx="5" {...region('calves')} />
      <rect x="64" y="152" width="11" height="36" rx="5" {...region('calves')} />
    </svg>
  );

  return (
    <div className={`flex items-stretch justify-center gap-3 ${className ?? ''}`}>
      {view !== 'back' && (
        <div className="flex flex-1 flex-col items-center" style={{ maxWidth: 150 }}>
          <div className="w-full">{Front}</div>
          <span className="mt-1 text-[10px] text-muted-foreground">Front</span>
        </div>
      )}
      {view !== 'front' && (
        <div className="flex flex-1 flex-col items-center" style={{ maxWidth: 150 }}>
          <div className="w-full">{Back}</div>
          <span className="mt-1 text-[10px] text-muted-foreground">Back</span>
        </div>
      )}
    </div>
  );
}
