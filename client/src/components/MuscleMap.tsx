// MuscleMap — front + back anatomical figures shaded by training intensity.
// Pure/presentational: the caller passes normalized intensities (0..1) per
// canonical muscle slug. Colors follow the active accent + theme.
//
// Region paths approximate the visible shape of each muscle group rather than
// blob primitives, so the front-deltoid lobe, the lateral-delt sliver on the
// outer shoulder, the lat "V", and the rectus-abdominis stack all read as
// anatomy at a glance.

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
  // Per-region props: fill ramps the accent by intensity; empty regions use a
  // faint theme token. Tappable when onMuscleTap is provided.
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
      strokeWidth: isSelected ? 2 : 0.8,
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

  const silhouette = { fill: 'var(--mm-empty)', fillOpacity: 0.35, stroke: 'var(--mm-stroke)', strokeWidth: 1 } as const;

  // Front-on torso + legs silhouette. Athletic-ish: clear shoulder caps, waist
  // taper, hip flare, separated legs. Head & arms drawn separately.
  const FRONT_BODY =
    'M 88 70 ' +
    'C 78 72 70 82 70 96 ' +              // left trap slope into shoulder cap
    'L 78 138 ' +                          // down left ribcage to waist
    'L 92 218 ' +                          // taper to waist
    'L 86 268 ' +                          // hip flare left
    'L 80 366 ' +                          // outer thigh to knee
    'L 86 458 ' +                          // shin
    'L 102 478 ' +                          // left foot
    'L 116 478 ' +                          // bottom of left foot
    'L 118 268 ' +                          // inner left thigh
    'L 122 268 ' +                          // crotch right
    'L 124 478 ' +                          // inner right thigh
    'L 138 478 ' +                          // bottom of right foot
    'L 154 458 ' +                          // right foot outer
    'L 160 366 ' +                          // shin
    'L 154 268 ' +                          // outer thigh
    'L 148 218 ' +                          // hip
    'L 162 138 ' +                          // waist back up
    'L 170 96 ' +                          // right ribcage
    'C 170 82 162 72 152 70 ' +            // right shoulder cap
    'Z';

  // Back silhouette is similar but with a slightly wider lat flare on the
  // ribcage so the V is visible. Tweak the side curves.
  const BACK_BODY =
    'M 88 70 ' +
    'C 76 72 66 84 68 100 ' +
    'L 74 130 ' +
    'L 80 170 ' +                          // lat flare out
    'L 92 218 ' +
    'L 86 268 ' +
    'L 80 366 ' +
    'L 86 458 ' +
    'L 102 478 ' +
    'L 116 478 ' +
    'L 118 268 ' +
    'L 122 268 ' +
    'L 124 478 ' +
    'L 138 478 ' +
    'L 154 458 ' +
    'L 160 366 ' +
    'L 154 268 ' +
    'L 148 218 ' +
    'L 160 170 ' +
    'L 166 130 ' +
    'L 172 100 ' +
    'C 174 84 164 72 152 70 ' +
    'Z';

  // Arm silhouette: a single arm shape used left/right via transform. Width
  // and curve are kept consistent across front/back; muscle regions overlay it.
  const LEFT_ARM_FRONT =
    'M 70 80 ' +
    'C 56 84 46 96 44 120 ' +              // shoulder cap to upper arm
    'L 40 180 ' +                          // upper arm down
    'L 36 240 ' +                          // forearm
    'L 38 268 ' +                          // wrist
    'L 50 268 ' +                          // hand bottom
    'L 56 240 ' +                          // inner forearm
    'L 60 180 ' +                          // inner upper arm
    'L 66 120 ' +                          // back up to shoulder
    'C 68 96 76 84 88 78 ' +
    'Z';

  const RIGHT_ARM_FRONT = LEFT_ARM_FRONT.replace(
    /([\d.]+) (\d+)/g,
    (_, x, y) => `${240 - Number(x)} ${y}`,
  );

  const Head = ({ y = 30 }: { y?: number }) => (
    <circle cx="120" cy={y} r="22" {...silhouette} />
  );

  const Front = (
    <svg viewBox="0 0 240 500" className="h-full w-full" role="img" aria-label="Front of body">
      <Head />
      {/* arms underneath so muscle overlays sit cleanly on top */}
      <path d={LEFT_ARM_FRONT} {...silhouette} />
      <path d={RIGHT_ARM_FRONT} {...silhouette} />
      {/* body silhouette */}
      <path d={FRONT_BODY} {...silhouette} />

      {/* Neck (sternocleidomastoid area) */}
      <path d="M 108 52 L 132 52 L 130 70 L 110 70 Z" {...region('neck')} />

      {/* Trapezius — upper slopes from neck to shoulder peak */}
      <path d="M 110 60 L 90 78 L 100 92 L 120 70 Z" {...region('trapezius')} />
      <path d="M 130 60 L 150 78 L 140 92 L 120 70 Z" {...region('trapezius')} />

      {/* Front deltoids — rounded cap on the front of the shoulder */}
      <path d="M 70 82 C 64 90 62 104 68 116 L 92 110 L 96 90 Z" {...region('front-deltoids')} />
      <path d="M 170 82 C 176 90 178 104 172 116 L 148 110 L 144 90 Z" {...region('front-deltoids')} />

      {/* Side (lateral) deltoids — outer-edge sliver visible from the front */}
      <path d="M 50 100 C 46 116 46 132 52 144 L 64 142 L 66 110 Z" {...region('side-deltoids')} />
      <path d="M 190 100 C 194 116 194 132 188 144 L 176 142 L 174 110 Z" {...region('side-deltoids')} />

      {/* Chest — two pec slabs angling toward the sternum */}
      <path d="M 96 96 L 118 96 L 118 138 Q 108 144 96 138 Q 90 122 96 96 Z" {...region('chest')} />
      <path d="M 144 96 L 122 96 L 122 138 Q 132 144 144 138 Q 150 122 144 96 Z" {...region('chest')} />

      {/* Biceps — long upper-arm shape on each side */}
      <path d="M 50 124 C 48 136 50 160 56 178 L 70 178 L 68 124 Z" {...region('biceps')} />
      <path d="M 190 124 C 192 136 190 160 184 178 L 170 178 L 172 124 Z" {...region('biceps')} />

      {/* Forearms */}
      <path d="M 42 184 C 40 204 38 224 38 244 L 56 244 L 60 184 Z" {...region('forearm')} />
      <path d="M 198 184 C 200 204 202 224 202 244 L 184 244 L 180 184 Z" {...region('forearm')} />

      {/* Abs — stacked rectus segments (3 per side) */}
      <rect x="106" y="146" width="13" height="18" rx="3" {...region('abs')} />
      <rect x="121" y="146" width="13" height="18" rx="3" {...region('abs')} />
      <rect x="106" y="168" width="13" height="18" rx="3" {...region('abs')} />
      <rect x="121" y="168" width="13" height="18" rx="3" {...region('abs')} />
      <rect x="106" y="190" width="13" height="18" rx="3" {...region('abs')} />
      <rect x="121" y="190" width="13" height="18" rx="3" {...region('abs')} />

      {/* Obliques — angled flanks beside the abs */}
      <path d="M 90 152 L 104 150 L 104 212 L 96 216 Z" {...region('obliques')} />
      <path d="M 150 152 L 136 150 L 136 212 L 144 216 Z" {...region('obliques')} />

      {/* Adductors — inner-thigh strip */}
      <path d="M 116 234 L 124 234 L 124 320 L 116 320 Z" {...region('adductor')} />

      {/* Quadriceps — outer thigh */}
      <path d="M 86 234 L 115 234 L 110 360 L 90 360 Z" {...region('quadriceps')} />
      <path d="M 154 234 L 125 234 L 130 360 L 150 360 Z" {...region('quadriceps')} />

      {/* Calves visible on the front as shin/tibialis area — light depiction */}
      <path d="M 88 380 L 110 380 L 104 460 L 90 460 Z" {...region('calves')} />
      <path d="M 152 380 L 130 380 L 136 460 L 150 460 Z" {...region('calves')} />
    </svg>
  );

  const Back = (
    <svg viewBox="0 0 240 500" className="h-full w-full" role="img" aria-label="Back of body">
      <Head />
      <path d={LEFT_ARM_FRONT} {...silhouette} />
      <path d={RIGHT_ARM_FRONT} {...silhouette} />
      <path d={BACK_BODY} {...silhouette} />

      {/* Neck */}
      <path d="M 108 52 L 132 52 L 130 70 L 110 70 Z" {...region('neck')} />

      {/* Trapezius — diamond from neck down between the scapulae */}
      <path d="M 120 60 L 90 84 L 120 168 L 150 84 Z" {...region('trapezius')} />

      {/* Rear deltoids — rounded back of the shoulder */}
      <path d="M 72 88 C 64 96 64 114 72 124 L 92 118 L 96 92 Z" {...region('back-deltoids')} />
      <path d="M 168 88 C 176 96 176 114 168 124 L 148 118 L 144 92 Z" {...region('back-deltoids')} />

      {/* Side delts — visible on outer shoulder from the back too */}
      <path d="M 50 100 C 46 116 46 132 52 144 L 64 142 L 66 110 Z" {...region('side-deltoids')} />
      <path d="M 190 100 C 194 116 194 132 188 144 L 176 142 L 174 110 Z" {...region('side-deltoids')} />

      {/* Upper back (rhomboid area) — between the traps and the lats */}
      <path d="M 96 130 L 118 130 L 118 170 L 96 170 Z" {...region('upper-back')} />
      <path d="M 144 130 L 122 130 L 122 170 L 144 170 Z" {...region('upper-back')} />

      {/* Lats — wide V from armpit down to the lower-back insertion */}
      <path d="M 92 138 L 118 174 L 110 220 L 80 178 Z" {...region('lats')} />
      <path d="M 148 138 L 122 174 L 130 220 L 160 178 Z" {...region('lats')} />

      {/* Lower back (erector spinae lozenge) */}
      <path d="M 110 192 L 130 192 L 134 230 L 106 230 Z" {...region('lower-back')} />

      {/* Triceps — back of the upper arm */}
      <path d="M 50 124 C 48 136 50 160 56 178 L 70 178 L 68 124 Z" {...region('triceps')} />
      <path d="M 190 124 C 192 136 190 160 184 178 L 170 178 L 172 124 Z" {...region('triceps')} />

      {/* Forearms */}
      <path d="M 42 184 C 40 204 38 224 38 244 L 56 244 L 60 184 Z" {...region('forearm')} />
      <path d="M 198 184 C 200 204 202 224 202 244 L 184 244 L 180 184 Z" {...region('forearm')} />

      {/* Glutes — rounded cheeks */}
      <path d="M 90 244 Q 80 268 86 296 Q 100 308 118 296 L 118 244 Z" {...region('gluteal')} />
      <path d="M 150 244 Q 160 268 154 296 Q 140 308 122 296 L 122 244 Z" {...region('gluteal')} />

      {/* Hamstrings — back of the thigh */}
      <path d="M 88 304 L 116 304 L 110 370 L 90 370 Z" {...region('hamstring')} />
      <path d="M 152 304 L 124 304 L 130 370 L 150 370 Z" {...region('hamstring')} />

      {/* Calves — back of the lower leg */}
      <path d="M 86 380 L 110 380 L 104 460 L 88 460 Z" {...region('calves')} />
      <path d="M 154 380 L 130 380 L 136 460 L 152 460 Z" {...region('calves')} />
    </svg>
  );

  return (
    <div className={`flex items-stretch justify-center gap-3 ${className ?? ''}`}>
      {view !== 'back' && (
        <div className="flex flex-1 flex-col items-center" style={{ maxWidth: 180 }}>
          <div className="w-full">{Front}</div>
          <span className="mt-1 text-[10px] text-muted-foreground">Front</span>
        </div>
      )}
      {view !== 'front' && (
        <div className="flex flex-1 flex-col items-center" style={{ maxWidth: 180 }}>
          <div className="w-full">{Back}</div>
          <span className="mt-1 text-[10px] text-muted-foreground">Back</span>
        </div>
      )}
    </div>
  );
}
