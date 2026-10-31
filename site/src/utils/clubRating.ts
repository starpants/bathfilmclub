import type { ClubRating, ThemeFilm } from '@bathfilmclub/types';

/**
 * The club's meeting score is only meaningful while a film is selected. A film
 * demoted after being rated keeps its score in the data (so re-selecting it
 * restores the score), but nothing is shown for it.
 */
export function displayedClubRating(entry: ThemeFilm): ClubRating | undefined {
  return entry.status === 'selected' ? entry.clubRating : undefined;
}

/** The film card's accessible name. Its aria-label masks the visual rating, so the score is spoken here. */
export function filmCardLabel(title: string, clubRating: ClubRating | undefined): string {
  const base = `View details for ${title}`;
  return clubRating ? `${base}, club rating ${clubRating} out of 5` : base;
}
