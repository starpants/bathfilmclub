import { describe, it, expect } from 'vitest';
import { parseSettings, getYearSummary, formatHeadline, headlineParts, formatMonthName } from './yearInReview';
import type { Theme, ThemeFilm } from '@bathfilmclub/types';

function film(id: number, title = `Film ${id}`): ThemeFilm['film'] {
  return {
    tmdbId: id,
    title,
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

function theme(slug: string, month: string, films: ThemeFilm[]): Theme {
  return { slug, title: slug, month, films };
}

let nextId = 1;
function entries(status: ThemeFilm['status'], n: number): ThemeFilm[] {
  return Array.from({ length: n }, () => ({ film: film(nextId++), status }));
}

describe('parseSettings', () => {
  it.each([undefined, null, 'x', {}, { yearInReview: 'yes' }])('defaults for %j', (raw) => {
    expect(parseSettings(raw)).toEqual({ yearInReview: false });
  });
  it('returns true only for literal true', () => {
    expect(parseSettings({ yearInReview: true })).toEqual({ yearInReview: true });
  });
});

describe('getYearSummary', () => {
  it('keeps selected films in stored order among other statuses', () => {
    const mk = (id: number, status: ThemeFilm['status']): ThemeFilm => ({ film: film(id), status });
    const s = getYearSummary([
      theme('t', '2026-01', [
        mk(7, 'selected'), mk(3, 'shortlisted'), mk(5, 'selected'), mk(1, 'nominated'), mk(2, 'selected'), mk(9, 'shortlisted'),
      ]),
    ]);
    expect(s.months[0]!.films.map((f) => f.film.tmdbId)).toEqual([7, 5, 2]);
  });

  it('orders months ascending when input is newest-first', () => {
    const s = getYearSummary([
      theme('dec', '2026-12', entries('selected', 1)),
      theme('mar', '2026-03', entries('selected', 1)),
      theme('jan', '2026-01', entries('selected', 1)),
    ]);
    expect(s.months.map((m) => m.slug)).toEqual(['jan', 'mar', 'dec']);
  });

  it('keeps only the latest year', () => {
    const s = getYearSummary([
      theme('b', '2026-02', entries('selected', 1)),
      theme('a', '2026-01', entries('selected', 1)),
      theme('old', '2025-12', entries('selected', 1)),
    ]);
    expect(s.year).toBe('2026');
    expect(s.months).toHaveLength(2);
  });

  it('keeps only selected films', () => {
    const s = getYearSummary([
      theme('t', '2026-01', [
        ...entries('selected', 2),
        ...entries('shortlisted', 3),
        ...entries('nominated', 5),
      ]),
    ]);
    expect(s.months[0]!.films).toHaveLength(2);
    expect(s.months[0]!.films.every((f) => f.status === 'selected')).toBe(true);
  });

  it('omits months with no selected films', () => {
    const s = getYearSummary([
      theme('b', '2026-02', entries('nominated', 2)),
      theme('a', '2026-01', entries('selected', 1)),
    ]);
    expect(s.months.map((m) => m.slug)).toEqual(['a']);
    expect(s.themeCount).toBe(1);
  });

  it('counts', () => {
    const s = getYearSummary([
      theme('c', '2026-03', entries('selected', 2)),
      theme('b', '2026-02', entries('selected', 2)),
      theme('a', '2026-01', entries('selected', 2)),
    ]);
    expect(s.themeCount).toBe(3);
    expect(s.filmCount).toBe(6);
  });

  it('of no themes', () => {
    expect(getYearSummary([])).toEqual({ year: '', months: [], themeCount: 0, filmCount: 0 });
  });
});

describe('formatHeadline', () => {
  it('pluralises', () => {
    expect(formatHeadline(12, 24)).toBe('12 themes. 24 films. One club.');
    expect(formatHeadline(1, 1)).toBe('1 theme. 1 film. One club.');
    expect(formatHeadline(1, 2)).toBe('1 theme. 2 films. One club.');
  });
});

describe('headlineParts', () => {
  it('builds the pieces with singular/plural', () => {
    expect(headlineParts(12, 24)).toEqual({ themes: '12 themes.', films: '24 films.', tagline: 'One club.' });
    expect(headlineParts(1, 1)).toEqual({ themes: '1 theme.', films: '1 film.', tagline: 'One club.' });
    expect(headlineParts(1, 2)).toEqual({ themes: '1 theme.', films: '2 films.', tagline: 'One club.' });
  });
});

describe('formatMonthName', () => {
  it('returns the long month name', () => {
    expect(formatMonthName('2026-07')).toBe('July');
    expect(formatMonthName('2026-12')).toBe('December');
  });
});
