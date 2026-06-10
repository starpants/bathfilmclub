import type { ThemeFilm } from '@bathfilmclub/types';

export interface PyramidRows {
  selected: ThemeFilm[];
  shortlisted: ThemeFilm[];
  nominated: ThemeFilm[];
}

export function getPyramidRows(films: ThemeFilm[]): PyramidRows {
  return {
    selected: films.filter((f) => f.status === 'selected'),
    shortlisted: films.filter((f) => f.status === 'shortlisted' || f.status === 'selected'),
    nominated: films,
  };
}
