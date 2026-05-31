import { describe, it, expect } from 'vitest';
import {
  EXERCISE_LIBRARY,
  getLibraryExercise,
  formVideoUrl,
  hasCuratedVideo,
} from './exercises';

describe('exercise library data accuracy', () => {
  it('lateral raises are tagged to side-deltoids (not front)', () => {
    const dbLat = getLibraryExercise('lateral-raise');
    const bandLat = getLibraryExercise('band-lateral-raise');
    expect(dbLat?.primaryMuscles).toEqual(['side-deltoids']);
    expect(bandLat?.primaryMuscles).toEqual(['side-deltoids']);
    expect(dbLat?.primaryMuscles).not.toContain('front-deltoids');
    expect(bandLat?.primaryMuscles).not.toContain('front-deltoids');
  });

  it('overhead presses keep front-deltoid primary but list side-deltoid as secondary', () => {
    const ohp = getLibraryExercise('overhead-press');
    const barOhp = getLibraryExercise('barbell-ohp');
    const arnold = getLibraryExercise('arnold-press');
    for (const ex of [ohp, barOhp, arnold]) {
      expect(ex?.primaryMuscles).toEqual(['front-deltoids']);
      expect(ex?.secondaryMuscles).toContain('side-deltoids');
    }
  });

  it('every strength exercise has at least one primary muscle (mobility/cardio may be empty by design)', () => {
    for (const e of EXERCISE_LIBRARY) {
      if (e.category === 'mobility' || e.category === 'cardio') continue;
      expect.soft(e.primaryMuscles.length, `${e.id}: no primary muscles`).toBeGreaterThan(0);
    }
  });
});

describe('formVideoUrl + hasCuratedVideo', () => {
  it('returns a watch URL when videoId is set', () => {
    expect(formVideoUrl({ name: 'X', videoId: 'abc123' })).toBe(
      'https://www.youtube.com/watch?v=abc123',
    );
    expect(hasCuratedVideo({ videoId: 'abc123' })).toBe(true);
  });

  it('falls back to a YouTube search URL when no videoId', () => {
    const url = formVideoUrl({ name: 'Dumbbell Bench Press', videoId: undefined });
    expect(url).toMatch(/^https:\/\/www\.youtube\.com\/results\?search_query=/);
    expect(url).toContain(encodeURIComponent('Dumbbell Bench Press'));
    expect(hasCuratedVideo({ videoId: undefined })).toBe(false);
  });
});
