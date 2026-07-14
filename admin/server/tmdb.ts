import type { Film } from '@bathfilmclub/types';

const BASE = 'https://api.themoviedb.org/3';

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('api_key', process.env.TMDB_API_KEY!);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDb error: ${res.status}`);
  return res.json();
}

export interface TmdbSearchResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

export async function searchFilms(query: string): Promise<TmdbSearchResult[]> {
  const data = await tmdbFetch<{ results: TmdbSearchResult[] }>('/search/movie', { query });
  return data.results.slice(0, 10);
}

export async function getFilmDetails(tmdbId: number): Promise<Film> {
  interface Details {
    title: string; release_date: string; runtime: number;
    genres: { id: number; name: string }[]; overview: string;
    poster_path: string | null; backdrop_path: string | null; vote_average: number;
  }
  interface Credits {
    crew: { job: string; name: string }[];
    cast: { name: string; order: number }[];
  }
  interface Videos { results: { type: string; site: string; key: string }[] }

  const [details, credits, videos] = await Promise.all([
    tmdbFetch<Details>(`/movie/${tmdbId}`),
    tmdbFetch<Credits>(`/movie/${tmdbId}/credits`),
    tmdbFetch<Videos>(`/movie/${tmdbId}/videos`),
  ]);

  const director = credits.crew.find((c) => c.job === 'Director')?.name ?? 'Unknown';
  const producers = credits.crew
    .filter((c) => c.job === 'Producer')
    .map((c) => c.name)
    .slice(0, 3);
  const cast = credits.cast
    .sort((a, b) => a.order - b.order)
    .map((c) => c.name)
    .slice(0, 5);
  // Exact job match: 'Compositor'/'Compositing *' are VFX roles, not music.
  const composers = [
    ...new Set(credits.crew.filter((c) => c.job === 'Original Music Composer').map((c) => c.name)),
  ];
  // 'Story'/'Author' excluded: on adaptations they credit the source novelist, not a screenwriter.
  const writers = [
    ...new Set(
      credits.crew.filter((c) => c.job === 'Screenplay' || c.job === 'Writer').map((c) => c.name)
    ),
  ];
  const trailer = videos.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube');

  return {
    tmdbId,
    title: details.title,
    year: new Date(details.release_date).getFullYear(),
    runtime: details.runtime,
    genres: details.genres.map((g) => g.name),
    synopsis: details.overview,
    director,
    writers: writers.length ? writers : undefined,
    producers,
    cast,
    composers: composers.length ? composers : undefined,
    posterPath: details.poster_path ?? '',
    backdropPath: details.backdrop_path ?? undefined,
    rating: Math.round(details.vote_average * 10) / 10,
    trailerKey: trailer?.key,
  };
}
