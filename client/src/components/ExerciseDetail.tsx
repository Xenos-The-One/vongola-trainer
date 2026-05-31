// ExerciseDetail — modal showing a library exercise's muscles, how-to steps,
// a mini muscle map, and a YouTube form-video link.

import { Play, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import MuscleMap from './MuscleMap';
import { MUSCLE_DISPLAY, type MuscleSlug } from '@/lib/muscles';
import { formVideoUrl, hasCuratedVideo, type LibraryExercise } from '@/lib/exercises';

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-[10px] capitalize text-secondary-foreground">
      {children}
    </span>
  );
}

export default function ExerciseDetail({
  exercise,
  onClose,
}: {
  exercise: LibraryExercise | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!exercise} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] overflow-y-auto">
        {exercise && (
          <>
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>{exercise.name}</DialogTitle>
              <DialogDescription>{exercise.cue}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-1.5">
              <Chip>{exercise.category}</Chip>
              <Chip>{exercise.mechanic}</Chip>
              <Chip>{exercise.difficulty}</Chip>
              {exercise.equipment.map((eq) => (
                <Chip key={eq}>{eq}</Chip>
              ))}
            </div>

            {(exercise.primaryMuscles.length > 0 || exercise.secondaryMuscles.length > 0) && (
              <div className="rounded-xl border border-border bg-card p-3">
                <MuscleMap
                  colorMode="primary-secondary"
                  primary={exercise.primaryMuscles}
                  secondary={exercise.secondaryMuscles}
                  view="both"
                  showLegend
                />
                <div className="mt-3 space-y-1">
                  {exercise.primaryMuscles.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Primary</span>
                      {exercise.primaryMuscles.map((m) => (
                        <span
                          key={m}
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                          style={{ backgroundColor: '#EF4444' }}
                        >
                          {MUSCLE_DISPLAY[m]}
                        </span>
                      ))}
                    </div>
                  )}
                  {exercise.secondaryMuscles.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Secondary</span>
                      {exercise.secondaryMuscles.map((m) => (
                        <span
                          key={m}
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                          style={{ backgroundColor: '#F59E0B' }}
                        >
                          {MUSCLE_DISPLAY[m]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {exercise.instructions.length > 0 && (
              <div>
                <h4 className="mb-1.5 text-sm font-semibold text-card-foreground">How to perform</h4>
                <ol className="list-decimal space-y-1.5 pl-5">
                  {exercise.instructions.map((step, i) => (
                    <li key={i} className="text-xs leading-relaxed text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <a
              href={formVideoUrl(exercise)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--vt-accent)' }}
            >
              {hasCuratedVideo(exercise) ? (
                <><Play size={15} /> Watch form video</>
              ) : (
                <><Search size={15} /> Find form video on YouTube</>
              )}
            </a>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
