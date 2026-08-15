import type { Film } from '@bathfilmclub/types';

const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/**
 * Case-insensitive, diacritic-insensitive substring match on film title.
 *
 * Returns [] for an empty or whitespace-only query so the caller can render
 * nothing until the user has actually typed. Input order is preserved —
 * candidates arrive sorted alphabetically from the pyramid band.
 */
export function matchFilms(candidates: Film[], query: string): Film[] {
  const q = fold(query.trim());
  if (!q) return [];
  return candidates.filter((f) => fold(f.title).includes(q));
}
