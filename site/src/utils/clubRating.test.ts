import { describe, it, expect } from 'vitest';
import type { ThemeFilm } from '@bathfilmclub/types';
import { displayedClubRating, filmCardLabel } from './clubRating';

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

describe('filmCardLabel', () => {
  // The card is a button with an aria-label, which hides its contents from screen
  // readers, so the rating has to be spoken through the label itself.
  it('includes the club rating when there is one', () => {
    expect(filmCardLabel('Hereditary', 4)).toBe('View details for Hereditary, club rating 4 out of 5');
  });

  it('is unchanged for unrated films', () => {
    expect(filmCardLabel('The Thing', undefined)).toBe('View details for The Thing');
  });
});
