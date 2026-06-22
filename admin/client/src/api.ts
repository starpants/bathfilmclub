import type { Theme, ThemeFilm, FilmStatus } from '@bathfilmclub/types';

export interface TmdbSearchResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

export interface AllThemesResponse {
  themes: Theme[];
  currentSlug: string | null;
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
  getAllThemes: () => apiFetch<AllThemesResponse>('/themes'),
  createTheme: (title: string, month: string) =>
    apiFetch<Theme>('/themes/new', { method: 'POST', body: JSON.stringify({ title, month }) }),
  updateTheme: (slug: string, data: Partial<Theme>) =>
    apiFetch<Theme>(`/themes/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),
  setAsCurrent: (slug: string) =>
    apiFetch<Theme>(`/themes/${slug}/restore`, { method: 'POST' }),
  deleteTheme: (slug: string) =>
    apiFetch<{ ok: boolean }>(`/themes/${slug}`, { method: 'DELETE' }),

  addFilmToTheme: (slug: string, tmdbId: number, status: FilmStatus) =>
    apiFetch<ThemeFilm>(`/themes/${slug}/films`, { method: 'POST', body: JSON.stringify({ tmdbId, status }) }),
  updateFilmStatus: (slug: string, tmdbId: number, status: FilmStatus) =>
    apiFetch<Theme>(`/themes/${slug}/films/${tmdbId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  removeFilm: (slug: string, tmdbId: number) =>
    apiFetch<Theme>(`/themes/${slug}/films/${tmdbId}`, { method: 'DELETE' }),

  search: (q: string) => apiFetch<TmdbSearchResult[]>(`/search?q=${encodeURIComponent(q)}`),
};
