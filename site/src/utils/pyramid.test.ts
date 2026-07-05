import { describe, it, expect } from 'vitest';
import { getPyramidRows, getCyclePhase, getEmptyBandMessage } from './pyramid';
import type { ThemeFilm } from '@bathfilmclub/types';

function film(id: number): ThemeFilm['film'] {
  return {
    tmdbId: id,
    title: `Film ${id}`,
    year: 2024,
    runtime: 90,
    genres: [],
    synopsis: '',
    director: 'Director',
    producers: [],
    cast: [],
    posterPath: `/poster-${id}.jpg`,
  };
}

describe('getPyramidRows', () => {
  it('returns empty arrays when no films', () => {
    const rows = getPyramidRows([]);
    expect(rows.selected).toHaveLength(0);
    expect(rows.shortlisted).toHaveLength(0);
    expect(rows.nominated).toHaveLength(0);
  });

  it('a selected film appears in all three rows', () => {
    const films: ThemeFilm[] = [{ film: film(1), status: 'selected' }];
    const rows = getPyramidRows(films);
    expect(rows.selected).toHaveLength(1);
    expect(rows.shortlisted).toHaveLength(1);
    expect(rows.nominated).toHaveLength(1);
  });

  it('a shortlisted film appears only in shortlisted and nominated rows', () => {
    const films: ThemeFilm[] = [{ film: film(1), status: 'shortlisted' }];
    const rows = getPyramidRows(films);
    expect(rows.selected).toHaveLength(0);
    expect(rows.shortlisted).toHaveLength(1);
    expect(rows.nominated).toHaveLength(1);
  });

  it('a nominated film appears only in the nominated row', () => {
    const films: ThemeFilm[] = [{ film: film(1), status: 'nominated' }];
    const rows = getPyramidRows(films);
    expect(rows.selected).toHaveLength(0);
    expect(rows.shortlisted).toHaveLength(0);
    expect(rows.nominated).toHaveLength(1);
  });

  it('correctly separates a mixed set of films', () => {
    const films: ThemeFilm[] = [
      { film: film(1), status: 'selected' },
      { film: film(2), status: 'selected' },
      { film: film(3), status: 'shortlisted' },
      { film: film(4), status: 'shortlisted' },
      { film: film(5), status: 'shortlisted' },
      { film: film(6), status: 'nominated' },
      { film: film(7), status: 'nominated' },
    ];
    const rows = getPyramidRows(films);
    expect(rows.selected).toHaveLength(2);
    expect(rows.shortlisted).toHaveLength(5);
    expect(rows.nominated).toHaveLength(7);
  });
});

describe('getCyclePhase', () => {
  it('is "awaiting" when there are no films', () => {
    expect(getCyclePhase([])).toBe('awaiting');
  });

  it('is "nominating" when films exist but none are shortlisted or selected', () => {
    const films: ThemeFilm[] = [
      { film: film(1), status: 'nominated' },
      { film: film(2), status: 'nominated' },
    ];
    expect(getCyclePhase(films)).toBe('nominating');
  });

  it('is "voting" as soon as one film is shortlisted, with none selected', () => {
    const films: ThemeFilm[] = [
      { film: film(1), status: 'nominated' },
      { film: film(2), status: 'shortlisted' },
    ];
    expect(getCyclePhase(films)).toBe('voting');
  });

  it('is "complete" once any film is selected', () => {
    const films: ThemeFilm[] = [
      { film: film(1), status: 'nominated' },
      { film: film(2), status: 'shortlisted' },
      { film: film(3), status: 'selected' },
    ];
    expect(getCyclePhase(films)).toBe('complete');
  });
});

describe('getEmptyBandMessage', () => {
  it('maps each phase to its title-case message', () => {
    expect(getEmptyBandMessage([])).toBe('Awaiting Nominations');
    expect(getEmptyBandMessage([{ film: film(1), status: 'nominated' }])).toBe(
      'Nominations In Progress'
    );
    expect(getEmptyBandMessage([{ film: film(1), status: 'shortlisted' }])).toBe(
      'Voting In Progress'
    );
    expect(getEmptyBandMessage([{ film: film(1), status: 'selected' }])).toBe('');
  });
});
