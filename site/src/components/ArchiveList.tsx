import { useState, useMemo } from 'react';
import type { Theme } from '@bathfilmclub/types';

interface Props {
  themes: Theme[];
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

function normalise(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9 ]/g, '');
}

function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  return new Date(parseInt(year), parseInt(m) - 1, 1).toLocaleDateString('en-GB', {
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

export function ArchiveList({ themes }: Props) {
  const [query, setQuery] = useState('');
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const toggle = (slug: string) => setOpenSlug((s) => (s === slug ? null : slug));

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
      {/* Search */}
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by film, theme, or director…"
          className="w-full border border-neutral-300 px-4 py-3 font-body text-sm focus:outline-none focus:border-brand-black placeholder:text-neutral-400"
        />
      </div>

      {/* Search results */}
      {isSearching && (
        <div className="space-y-2">
          <p className="section-label">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
          {searchResults.length === 0 ? (
            <p className="font-body text-sm text-neutral-500 italic">No results found.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {searchResults.map((r, i) => (
                <li key={i} className="py-4">
                  {r.filmTitle !== '—' && (
                    <p className="font-heading font-semibold text-base">{r.filmTitle}</p>
                  )}
                  <p className="font-body text-sm text-neutral-600">
                    Theme:{' '}
                    <a href={`/theme/${r.slug}`} className="underline hover:text-brand-red">
                      {r.themeTitle}
                    </a>
                  </p>
                  {r.director !== '—' && (
                    <p className="font-body text-sm text-neutral-600">Director: {r.director}</p>
                  )}
                  <p className="font-body text-xs text-neutral-400 mt-1">
                    {formatMonth(r.month)} · {r.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Archive list */}
      {!isSearching && (
        <ul className="divide-y divide-neutral-200">
          {themes.map((theme) => {
            const isOpen = openSlug === theme.slug;
            const selectedFilms = theme.films.filter((f) => f.status === 'selected');
            return (
              <li key={theme.slug}>
                <button
                  className="w-full flex items-center justify-between py-5 text-left group"
                  onClick={() => toggle(theme.slug)}
                  aria-expanded={isOpen}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-body text-sm text-neutral-400 w-28 shrink-0">
                      {formatMonth(theme.month)}
                    </span>
                    <span className="font-heading font-semibold text-lg group-hover:text-brand-red transition-colors">
                      {theme.title}
                    </span>
                  </span>
                  <span className="text-neutral-400 text-sm ml-4">{isOpen ? '−' : '+'}</span>
                </button>

                {isOpen && (
                  <div className="pb-6 space-y-4 pl-32">
                    {theme.description && (
                      <p className="font-body text-sm text-neutral-600 max-w-prose">
                        {theme.description}
                      </p>
                    )}
                    {selectedFilms.length > 0 && (
                      <div className="space-y-2">
                        <p className="section-label">Selected Films</p>
                        <div className="flex gap-3">
                          {selectedFilms.map(({ film }) => (
                            <div key={film.tmdbId} className="w-16">
                              <div className="aspect-[2/3] overflow-hidden bg-neutral-100">
                                {film.posterPath ? (
                                  <img
                                    src={`${TMDB_IMAGE_BASE}${film.posterPath}`}
                                    alt={film.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-neutral-200" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <a
                      href={`/theme/${theme.slug}`}
                      className="inline-block font-heading font-semibold text-sm text-brand-red hover:underline"
                    >
                      View Theme →
                    </a>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
