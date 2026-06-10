import type { Theme, ThemeFilm, FilmStatus } from '@bathfilmclub/types';

export interface TmdbSearchResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getCurrentCycle: () => apiFetch<Theme | null>('/themes/current'),
  updateCurrentCycle: (data: Partial<Theme>) =>
    apiFetch<Theme>('/themes/current', { method: 'PUT', body: JSON.stringify(data) }),
  archiveCycle: () =>
    apiFetch<{ ok: boolean }>('/themes/archive', { method: 'POST' }),
  getAllThemes: () => apiFetch<Theme[]>('/themes'),

  addFilm: (tmdbId: number, status: FilmStatus) =>
    apiFetch<ThemeFilm>('/films', { method: 'POST', body: JSON.stringify({ tmdbId, status }) }),
  updateFilmStatus: (tmdbId: number, status: FilmStatus) =>
    apiFetch<Theme>(`/films/${tmdbId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  removeFilm: (tmdbId: number) =>
    apiFetch<Theme>(`/films/${tmdbId}`, { method: 'DELETE' }),

  search: (q: string) => apiFetch<TmdbSearchResult[]>(`/search?q=${encodeURIComponent(q)}`),
};
