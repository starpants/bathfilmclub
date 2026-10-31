import type { ClubRating, ThemeFilm } from '@bathfilmclub/types';

/**
 * The club's meeting score is only meaningful while a film is selected. A film
 * demoted after being rated keeps its score in the data (so re-selecting it
 * restores the score), but nothing is shown for it.
 */
export function displayedClubRating(entry: ThemeFilm): ClubRating | undefined {
  return entry.status === 'selected' ? entry.clubRating : undefined;
}
