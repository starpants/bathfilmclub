import type { ThemeFilm } from '@bathfilmclub/types';

export interface PyramidRows {
  selected: ThemeFilm[];
  shortlisted: ThemeFilm[];
  nominated: ThemeFilm[];
}

function sortByStatusThenTitle(films: ThemeFilm[]): ThemeFilm[] {
  const statusOrder = { selected: 0, shortlisted: 1, nominated: 2 };
  return [...films].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return a.film.title.localeCompare(b.film.title);
  });
}

export function getPyramidRows(films: ThemeFilm[]): PyramidRows {
  return {
    selected: films.filter((f) => f.status === 'selected').sort((a, b) => a.film.title.localeCompare(b.film.title)),
    shortlisted: sortByStatusThenTitle(films.filter((f) => f.status === 'shortlisted' || f.status === 'selected')),
    nominated: sortByStatusThenTitle(films),
  };
}
