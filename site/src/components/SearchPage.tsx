import { useState, useMemo } from 'react';
import type { Theme } from '@bathfilmclub/types';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

interface Props {
  themes: Theme[];
}

function normalise(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9 ]/g, '');
}

function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  return new Date(parseInt(year!), parseInt(m!) - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

interface SearchResult {
  filmTitle: string;
  director: string;
  themeTitle: string;
  month: string;
  slug: string;
  status: string;
}

export function SearchPage({ themes }: Props) {
  const [query, setQuery] = useState('');

  const selectedFilms = useMemo(() =>
    themes.flatMap((t) =>
      t.films
        .filter((f) => f.status === 'selected')
        .map((f) => ({ film: f.film, slug: t.slug, themeTitle: t.title }))
    ), [themes]);

  const sinceYear = themes[themes.length - 1]?.month.split('-')[0] ?? '';

  const searchResults = useMemo<SearchResult[]>(() => {
    if (query.trim().length < 2) return [];
    const q = normalise(query);
    const results: SearchResult[] = [];
    for (const theme of themes) {
      if (normalise(theme.title).includes(q)) {
        results.push({
          filmTitle: '—',
          director: '—',
          themeTitle: theme.title,
          month: theme.month,
          slug: theme.slug,
          status: 'Theme',
        });
      }
      for (const { film, status } of theme.films) {
        if (normalise(film.title).includes(q) || normalise(film.director).includes(q)) {
          results.push({
            filmTitle: film.title,
            director: film.director,
            themeTitle: theme.title,
            month: theme.month,
            slug: theme.slug,
            status: status.charAt(0).toUpperCase() + status.slice(1),
          });
        }
      }
    }
    return results;
  }, [query, themes]);

  const isSearching = query.trim().length >= 2;

  return (
    <div className="space-y-8">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by film, director, or theme…"
        className="w-full border border-neutral-700 bg-transparent px-4 py-3 font-body text-sm focus:outline-none focus:border-white placeholder:text-neutral-500"
      />

      {isSearching ? (
        <div className="space-y-2">
          <p className="section-label">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </p>
          {searchResults.length === 0 ? (
            <p className="font-body text-sm text-neutral-400 italic">No results found.</p>
          ) : (
            <ul className="divide-y divide-neutral-800">
              {searchResults.map((r, i) => (
                <li key={i} className="py-4">
                  {r.filmTitle !== '—' && (
                    <p className="font-heading font-semibold text-base">{r.filmTitle}</p>
                  )}
                  <p className="font-body text-sm text-neutral-400">
                    Theme:{' '}
                    <a href={`/theme/${r.slug}`} className="text-white interactive-item">
                      {r.themeTitle}
                    </a>
                  </p>
                  {r.director !== '—' && (
                    <p className="font-body text-sm text-neutral-400">Director: {r.director}</p>
                  )}
                  <p className="font-body text-xs text-neutral-400 mt-1">
                    {formatMonth(r.month)} · {r.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <p className="font-body text-sm text-neutral-400">
            {themes.length} themes · {selectedFilms.length} films selected · Since {sinceYear}
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
            {selectedFilms.map(({ film, slug, themeTitle }) => (
              <a
                key={`${slug}-${film.tmdbId}`}
                href={`/theme/${slug}`}
                title={`${film.title} — ${themeTitle}`}
              >
                <div className="aspect-[2/3] overflow-hidden bg-neutral-800">
                  {film.posterPath ? (
                    <img
                      src={`${TMDB_IMAGE_BASE}${film.posterPath}`}
                      alt={film.title}
                      className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800" />
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
