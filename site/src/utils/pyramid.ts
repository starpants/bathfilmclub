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

/**
 * The stage a monthly cycle has reached, based on the highest status any film
 * has attained. Because pyramid bands are cumulative (a selected film also
 * counts as shortlisted and nominated), an empty band always represents a stage
 * not yet reached — so a single phase drives the message shown in every empty band.
 */
export type CyclePhase = 'awaiting' | 'nominating' | 'voting' | 'complete';

export function getCyclePhase(films: ThemeFilm[]): CyclePhase {
  if (films.some((f) => f.status === 'selected')) return 'complete';
  if (films.some((f) => f.status === 'shortlisted')) return 'voting';
  if (films.length > 0) return 'nominating';
  return 'awaiting';
}

/**
 * Message shown in any empty pyramid band for the current phase. `complete` has
 * no message because once a film is selected every band is populated.
 */
export function getEmptyBandMessage(films: ThemeFilm[]): string {
  switch (getCyclePhase(films)) {
    case 'awaiting':
      return 'Awaiting Nominations';
    case 'nominating':
      return 'Nominations In Progress';
    case 'voting':
      return 'Voting In Progress';
    case 'complete':
      return '';
  }
}
