import { useState, useMemo } from 'react';
import type { Film, Theme } from '@bathfilmclub/types';
import { FilmPanel } from './FilmPanel';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

const STATUS_OPTIONS = ['selected', 'shortlisted', 'nominated'] as const;
const STATUS_LABELS: Record<string, string> = {
  selected: 'Selected',
  shortlisted: 'Shortlisted',
  nominated: 'Nominated',
};
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
  film: Film | null;
  filmTitle: string;
  director: string;
  themeTitle: string;
  month: string;
  slug: string;
  status: string;
}

export function SearchPage({ themes }: Props) {
  const [query, setQuery] = useState('');
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);
  const [activeMonths, setActiveMonths] = useState<number[]>([]);
  const [activeFilm, setActiveFilm] = useState<Film | null>(null);

  function toggleStatus(status: string) {
    setActiveStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }

  function toggleMonth(month: number) {
    setActiveMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  }

  const shortlistedFilms = useMemo(() =>
    themes.flatMap((t) =>
      t.films
        .filter((f) => f.status === 'shortlisted')
        .map((f) => ({ film: f.film, slug: t.slug, themeTitle: t.title }))
    ), [themes]);

  const sinceYear = themes.length > 0
    ? String(Math.min(...themes.map((t) => parseInt(t.month.split('-')[0]!))))
    : '';

  const isSearching = query.trim().length >= 2;
  const hasFilters = activeStatuses.length > 0 || activeMonths.length > 0;

  const filteredFilms = useMemo<SearchResult[]>(() => {
    if (activeStatuses.length === 0 && activeMonths.length === 0) return [];
    const results: SearchResult[] = [];
    for (const theme of themes) {
      const themeMonthNum = parseInt(theme.month.split('-')[1]!);
      if (activeMonths.length > 0 && !activeMonths.includes(themeMonthNum)) continue;
      for (const { film, status } of theme.films) {
        if (activeStatuses.length > 0 && !activeStatuses.includes(status)) continue;
        results.push({
          film,
          filmTitle: film.title,
          director: film.director,
          themeTitle: theme.title,
          month: theme.month,
          slug: theme.slug,
          status: status.charAt(0).toUpperCase() + status.slice(1),
        });
      }
    }
    return results;
  }, [themes, activeStatuses, activeMonths]);

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!isSearching) return [];
    const q = normalise(query);
    const results: SearchResult[] = [];
    for (const theme of themes) {
      const themeMonthNum = parseInt(theme.month.split('-')[1]!);
      if (activeMonths.length > 0 && !activeMonths.includes(themeMonthNum)) continue;
      if (activeStatuses.length === 0 && normalise(theme.title).includes(q)) {
        results.push({
          film: null,
          filmTitle: '—',
          director: '—',
          themeTitle: theme.title,
          month: theme.month,
          slug: theme.slug,
          status: 'Theme',
        });
      }
      for (const { film, status } of theme.films) {
        if (activeStatuses.length > 0 && !activeStatuses.includes(status)) continue;
        if (normalise(film.title).includes(q) || normalise(film.director).includes(q)) {
          results.push({
            film,
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
  }, [query, themes, activeStatuses, activeMonths, isSearching]);

  const pillBase =
    'px-3 py-1 font-heading font-semibold text-xs uppercase tracking-wide border transition-colors cursor-pointer';
  const pillActive = `${pillBase} bg-white text-black border-white`;
  const pillInactive = `${pillBase} border-neutral-600 text-neutral-400 hover:text-white hover:border-neutral-400`;

  const activeResults = isSearching ? searchResults : filteredFilms;
  const showDefault = !isSearching && !hasFilters;

  return (
    <>
      <div className="space-y-8">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by film, director, or theme…"
          className="w-full border border-neutral-700 bg-transparent px-4 py-3 font-body text-sm focus:outline-none focus:border-white placeholder:text-neutral-500"
        />

        {/* Filter pills */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={activeStatuses.includes(status) ? pillActive : pillInactive}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {MONTH_LABELS.map((label, i) => (
              <button
                key={label}
                onClick={() => toggleMonth(i + 1)}
                className={activeMonths.includes(i + 1) ? pillActive : pillInactive}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {showDefault ? (
          <div className="space-y-6">
            <p className="font-body text-sm text-neutral-400">
              {themes.length} themes · {shortlistedFilms.length} films shortlisted · Since {sinceYear}
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
              {shortlistedFilms.map(({ film, slug, themeTitle }) => (
                <button
                  key={`${slug}-${film.tmdbId}`}
                  onClick={() => setActiveFilm(film)}
                  title={`${film.title} — ${themeTitle}`}
                  className="group text-left focus:outline-none"
                >
                  <div className="aspect-[2/3] overflow-hidden bg-neutral-800">
                    {film.posterPath ? (
                      <img
                        src={`${TMDB_IMAGE_BASE}${film.posterPath}`}
                        alt={film.title}
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-800" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="section-label">
              {activeResults.length} result{activeResults.length !== 1 ? 's' : ''}
            </p>
            {activeResults.length === 0 ? (
              <p className="font-body text-sm text-neutral-400 italic">No results found.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
                {activeResults.map((r) => (
                  <li key={`${r.slug}-${r.filmTitle}-${r.status}`} className="border-b border-neutral-800">
                    {r.film ? (
                      <button
                        onClick={() => setActiveFilm(r.film)}
                        className="w-full text-left py-4 flex gap-4 group focus:outline-none"
                      >
                        <div className="flex-shrink-0 w-12 aspect-[2/3] overflow-hidden bg-neutral-800">
                          {r.film.posterPath ? (
                            <img
                              src={`${TMDB_IMAGE_BASE}${r.film.posterPath}`}
                              alt={r.filmTitle}
                              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-800" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-heading font-semibold text-base group-hover:text-neutral-300 transition-colors">
                            {r.filmTitle}
                          </p>
                          <p className="font-body text-sm text-neutral-400">
                            Theme:{' '}
                            <span className="text-white">{r.themeTitle}</span>
                          </p>
                          <p className="font-body text-sm text-neutral-400">Director: {r.director}</p>
                          <p className="font-body text-xs text-neutral-400 mt-1">
                            {formatMonth(r.month)} · {r.status}
                          </p>
                        </div>
                      </button>
                    ) : (
                      <a href={`/theme/${r.slug}`} className="py-4 flex gap-4 group">
                        <div className="flex-shrink-0 w-12 aspect-[2/3] bg-neutral-800" />
                        <div className="min-w-0 self-center">
                          <p className="font-heading font-semibold text-base group-hover:text-neutral-300 transition-colors">
                            {r.themeTitle}
                          </p>
                          <p className="font-body text-xs text-neutral-400 mt-1">
                            {formatMonth(r.month)} · Theme
                          </p>
                        </div>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <FilmPanel film={activeFilm} onClose={() => setActiveFilm(null)} />
    </>
  );
}
