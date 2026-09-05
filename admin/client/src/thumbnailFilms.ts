import type { ThemeFilm } from '@bathfilmclub/types';

/**
 * The (up to) two posters that stand in for a theme in a list row.
 *
 * Walks down the pyramid so a theme always has something to show: the winners
 * once they exist, otherwise the head of the shortlist, otherwise the most
 * recent nominations — films are stored in the order they were added.
 */
export function thumbnailFilms(films: ThemeFilm[]): ThemeFilm[] {
  const selected = films.filter((f) => f.status === 'selected');
  if (selected.length > 0) return selected.slice(0, 2);

  const shortlisted = films.filter((f) => f.status === 'shortlisted');
  if (shortlisted.length > 0) return shortlisted.slice(0, 2);

  return films.filter((f) => f.status === 'nominated').slice(-2);
}
