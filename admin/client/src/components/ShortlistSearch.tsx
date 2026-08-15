import { useState } from 'react';
import type { Film } from '@bathfilmclub/types';
import { color, fg, font } from '../tokens';
import { matchFilms } from '../matchFilms';

const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w92';

interface Props {
  /** Films eligible for promotion — the theme's nominated films. */
  candidates: Film[];
  onPromote: (tmdbId: number) => Promise<void>;
}

// Search bar for the Shortlisted band: find a nominated film by title and
// promote it, without hunting for its card in the Nominated band below.
export function ShortlistSearch({ candidates, onPromote }: Props) {
  const [query, setQuery] = useState('');
  const [pendingId, setPendingId] = useState<number | null>(null);

  const matches = matchFilms(candidates, query);
  const searching = query.trim().length > 0;

  const promote = async (tmdbId: number) => {
    setPendingId(tmdbId);
    try {
      await onPromote(tmdbId);
      setQuery(''); // clears the result list too — matches derive from query
    } catch (e) {
      alert(`Failed to shortlist film: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 420, marginBottom: '1rem' }}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Shortlist a nominated film…"
        aria-label="Shortlist a nominated film"
        style={{
          width: '100%', fontFamily: 'inherit', fontSize: '0.9rem',
          color: color.brandFg, background: fg.hairline,
          border: `1px solid ${fg.faint}`, padding: '0.5rem',
          height: '2.5rem', boxSizing: 'border-box',
        }}
      />

      {searching && matches.length === 0 && (
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', fontStyle: 'italic', color: fg.faint }}>
          No nominated film matches.
        </p>
      )}

      {matches.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0', border: `1px solid ${fg.hairline}` }}>
          {matches.map((f) => (
            <li key={f.tmdbId}>
              <button
                onClick={() => promote(f.tmdbId)}
                disabled={pendingId !== null}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  width: '100%', padding: '0.5rem', textAlign: 'left',
                  background: 'transparent', border: 'none',
                  borderBottom: `1px solid ${fg.hairline}`,
                  color: color.brandFg, fontFamily: font.body, fontSize: '1rem',
                  cursor: pendingId === null ? 'pointer' : 'default',
                  opacity: pendingId === f.tmdbId ? 0.5 : 1,
                }}
              >
                {f.posterPath ? (
                  <img
                    src={`${TMDB_POSTER_BASE}${f.posterPath}`}
                    alt=""
                    style={{ width: 34, height: 51, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 34, height: 51, background: fg.hairline, flexShrink: 0 }} />
                )}
                <span>
                  {f.title} <span style={{ color: fg.faint }}>({f.year})</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
