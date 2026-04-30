// Vongola Trainer — Evolution System
// Determines companion stage based on daily completion % and streak

import type { EvolutionStage } from './types';

export interface EvolutionResult {
  stage: EvolutionStage;
  label: string;
}

/**
 * Determine the evolution stage based on today's completion percentage and streak days.
 * 
 * % today    | Stage
 * 0–24       | Sleeping cub (cub-sleep)
 * 25–49      | Awake cub (cub-awake)
 * 50–74      | Young lion (young-lion)
 * 75–99      | Sky Lion (sky-lion)
 * 100        | Cambio Forma (cambio-forma)
 * 100 + ≥7d  | Hyper Mode (hyper-mode)
 */
export function getEvolutionStage(completionPct: number, streakDays: number): EvolutionResult {
  if (completionPct >= 100 && streakDays >= 7) {
    return { stage: 'hyper-mode', label: 'Hyper Mode' };
  }
  if (completionPct >= 100) {
    return { stage: 'cambio-forma', label: 'Cambio Forma' };
  }
  if (completionPct >= 75) {
    return { stage: 'sky-lion', label: 'Sky Lion' };
  }
  if (completionPct >= 50) {
    return { stage: 'young-lion', label: 'Young Lion' };
  }
  if (completionPct >= 25) {
    return { stage: 'cub-awake', label: 'Awake Cub' };
  }
  return { stage: 'cub-sleep', label: 'Sleeping Cub' };
}

/**
 * Get a status message based on completion percentage
 */
export function getStatusMessage(completionPct: number, streakDays: number): string {
  if (completionPct >= 100 && streakDays >= 7) {
    return 'Hyper Dying Will activated!';
  }
  if (completionPct >= 100) {
    return 'Full power unlocked!';
  }
  if (completionPct >= 75) {
    return 'Sky flames burning bright!';
  }
  if (completionPct >= 50) {
    return 'Growing stronger...';
  }
  if (completionPct >= 25) {
    return 'Warming up...';
  }
  return 'Zzz...';
}
