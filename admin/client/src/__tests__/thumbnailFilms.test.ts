import { describe, it, expect } from 'vitest';
import type { Film, FilmStatus, ThemeFilm } from '@bathfilmclub/types';
import { thumbnailFilms } from '../thumbnailFilms';

// Film has many required fields; only tmdbId matters for identifying picks here.
const entry = (tmdbId: number, status: FilmStatus): ThemeFilm => ({
  status,
  film: {
    tmdbId,
    title: `Film ${tmdbId}`,
    year: 2000,
    runtime: 100,
    genres: [],
    synopsis: '',
    director: '',
    producers: [],
    cast: [],
    posterPath: `/poster-${tmdbId}.jpg`,
  } as Film,
});

const ids = (films: ThemeFilm[]) => films.map((f) => f.film.tmdbId);

describe('thumbnailFilms', () => {
  it('returns nothing for a theme with no films', () => {
    expect(thumbnailFilms([])).toEqual([]);
  });

  it('takes the last two nominations when nothing has progressed', () => {
    const films = [1, 2, 3, 4].map((id) => entry(id, 'nominated'));
    expect(ids(thumbnailFilms(films))).toEqual([3, 4]);
  });

  it('takes the only nomination when a theme has just one film', () => {
    expect(ids(thumbnailFilms([entry(1, 'nominated')]))).toEqual([1]);
  });

  it('prefers the first two shortlisted over the newest nominations', () => {
    const films = [
      entry(1, 'shortlisted'),
      entry(2, 'nominated'),
      entry(3, 'shortlisted'),
      entry(4, 'shortlisted'),
      entry(5, 'nominated'),
    ];
    expect(ids(thumbnailFilms(films))).toEqual([1, 3]);
  });

  it('pads with nothing when only one film is shortlisted', () => {
    const films = [entry(1, 'nominated'), entry(2, 'shortlisted'), entry(3, 'nominated')];
    expect(ids(thumbnailFilms(films))).toEqual([2]);
  });

  it('prefers the first two selected over shortlisted and nominated', () => {
    const films = [
      entry(1, 'nominated'),
      entry(2, 'shortlisted'),
      entry(3, 'selected'),
      entry(4, 'shortlisted'),
      entry(5, 'selected'),
      entry(6, 'selected'),
    ];
    expect(ids(thumbnailFilms(films))).toEqual([3, 5]);
  });

  it('falls back to the newest nominations when the theme has no shortlist', () => {
    const films = [entry(1, 'nominated'), entry(2, 'nominated'), entry(3, 'nominated')];
    expect(ids(thumbnailFilms(films))).toEqual([2, 3]);
  });
});
