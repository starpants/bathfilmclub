import { describe, it, expect } from 'vitest';
import type { Film } from '@bathfilmclub/types';
import { matchFilms } from '../matchFilms';

// Film has many required fields; only title/year/tmdbId matter here.
const film = (tmdbId: number, title: string, year: number): Film => ({
  tmdbId,
  title,
  year,
  runtime: 100,
  genres: [],
  synopsis: '',
  director: '',
  producers: [],
  cast: [],
  posterPath: '/poster.jpg',
});

const candidates: Film[] = [
  film(1, 'Paris, Texas', 1984),
  film(2, 'The Apartment', 1960),
  film(3, 'The Third Man', 1949),
  film(4, 'Amélie', 2001),
];

describe('matchFilms', () => {
  it('returns nothing for an empty query', () => {
    expect(matchFilms(candidates, '')).toEqual([]);
  });

  it('returns nothing for a whitespace-only query', () => {
    expect(matchFilms(candidates, '   ')).toEqual([]);
  });

  it('matches case-insensitively', () => {
    expect(matchFilms(candidates, 'PARIS').map((f) => f.tmdbId)).toEqual([1]);
  });

  it('matches a substring, not just a prefix', () => {
    expect(matchFilms(candidates, 'texas').map((f) => f.tmdbId)).toEqual([1]);
  });

  it('ignores surrounding whitespace in the query', () => {
    expect(matchFilms(candidates, '  apartment  ').map((f) => f.tmdbId)).toEqual([2]);
  });

  it('returns nothing when no title matches', () => {
    expect(matchFilms(candidates, 'zzzz')).toEqual([]);
  });

  it('preserves input order across multiple matches', () => {
    expect(matchFilms(candidates, 'the').map((f) => f.tmdbId)).toEqual([2, 3]);
  });

  it('matches an accented title from an unaccented query', () => {
    expect(matchFilms(candidates, 'amelie').map((f) => f.tmdbId)).toEqual([4]);
  });

  it('matches an accented title from an accented query', () => {
    expect(matchFilms(candidates, 'amélie').map((f) => f.tmdbId)).toEqual([4]);
  });
});
