import { describe, it, expect } from 'vitest';
import {
  MUSCLE_SLUGS,
  MUSCLE_DISPLAY,
  MUSCLE_GROUPS,
  isMuscleSlug,
  normalizeMuscle,
  normalizeMuscles,
} from './muscles';

describe('muscle taxonomy', () => {
  it('includes the three distinct deltoid heads', () => {
    expect(MUSCLE_SLUGS).toContain('front-deltoids');
    expect(MUSCLE_SLUGS).toContain('side-deltoids');
    expect(MUSCLE_SLUGS).toContain('back-deltoids');
  });

  it('has a display label for every slug', () => {
    for (const slug of MUSCLE_SLUGS) {
      expect(MUSCLE_DISPLAY[slug]).toBeTruthy();
    }
  });

  it('groups all three deltoid heads under Shoulders', () => {
    expect(MUSCLE_GROUPS.Shoulders).toEqual(
      expect.arrayContaining(['front-deltoids', 'side-deltoids', 'back-deltoids']),
    );
  });

  it('isMuscleSlug accepts canonical slugs and rejects junk', () => {
    expect(isMuscleSlug('side-deltoids')).toBe(true);
    expect(isMuscleSlug('not-a-muscle')).toBe(false);
  });
});

describe('normalizeMuscle', () => {
  it('maps side/lateral/medial delt variants to side-deltoids', () => {
    expect(normalizeMuscle('side delts')).toBe('side-deltoids');
    expect(normalizeMuscle('side delt')).toBe('side-deltoids');
    expect(normalizeMuscle('lateral delts')).toBe('side-deltoids');
    expect(normalizeMuscle('lateral delt')).toBe('side-deltoids');
    expect(normalizeMuscle('medial delts')).toBe('side-deltoids');
  });

  it('still maps generic "shoulders"/"delts" to front-deltoids (legacy default)', () => {
    expect(normalizeMuscle('shoulders')).toBe('front-deltoids');
    expect(normalizeMuscle('delts')).toBe('front-deltoids');
  });

  it('case-insensitive', () => {
    expect(normalizeMuscle('Side Delts')).toBe('side-deltoids');
    expect(normalizeMuscle('LATERAL DELT')).toBe('side-deltoids');
  });
});

describe('normalizeMuscles (list)', () => {
  it('dedupes and drops unrecognized', () => {
    expect(normalizeMuscles(['side delts', 'side-deltoids', 'flubber'])).toEqual(['side-deltoids']);
  });

  it('returns empty for pure-mobility input', () => {
    expect(normalizeMuscles(['mobility', 'spine', 'recovery'])).toEqual([]);
  });
});
