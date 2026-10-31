import { describe, it, expect } from 'vitest';
import type { ThemeFilm } from '@bathfilmclub/types';
import { displayedClubRating } from './clubRating';

const entry = (overrides: Partial<ThemeFilm>): ThemeFilm => ({
  film: {
    tmdbId: 1, title: 'Film', year: 2000, runtime: 100, genres: [], synopsis: '',
    director: '', producers: [], cast: [], posterPath: '',
  },
  status: 'selected',
  ...overrides,
});

describe('displayedClubRating', () => {
  it('returns the rating of a rated selected film', () => {
    expect(displayedClubRating(entry({ clubRating: 4 }))).toBe(4);
  });

  it('returns undefined for an unrated selected film', () => {
    expect(displayedClubRating(entry({}))).toBeUndefined();
  });

  it('ignores rating on non-selected films', () => {
    expect(displayedClubRating(entry({ status: 'shortlisted', clubRating: 4 }))).toBeUndefined();
    expect(displayedClubRating(entry({ status: 'nominated', clubRating: 2 }))).toBeUndefined();
  });
});
