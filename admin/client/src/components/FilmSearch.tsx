import { useState, useRef, useEffect } from 'react';
import type { FilmStatus } from '@bathfilmclub/types';
import { api, type TmdbSearchResult } from '../api';

interface Props {
  onAdd: (tmdbId: number, status: FilmStatus) => Promise<void>;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

export function FilmSearch({ onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(debounce.current), []);

  const search = (q: string) => {
    setQuery(q);
    clearTimeout(debounce.current);
    if (q.trim().length < 2) { setResults([]); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await api.search(q));
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const add = async (id: number, status: FilmStatus) => {
    setPendingId(id);
    try {
      await onAdd(id, status);
      setQuery('');
      setResults([]);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="Search TMDb…"
        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '0.5rem' }}
      />
      {loading && <p style={{ fontSize: '0.8rem', color: '#666' }}>Searching…</p>}
      {results.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, border: '1px solid #eee' }}>
          {results.map((r) => (
            <li key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
              {r.poster_path ? (
                <img src={`${TMDB_IMAGE_BASE}${r.poster_path}`} alt="" style={{ width: 30, height: 45, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 30, height: 45, background: '#eee' }} />
              )}
              <span style={{ flex: 1, fontSize: '0.85rem' }}>
                {r.title} <span style={{ color: '#999' }}>({r.release_date?.slice(0, 4)})</span>
              </span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {(['nominated', 'shortlisted', 'selected'] as FilmStatus[]).map((s) => (
                  <button
                    key={s}
                    disabled={pendingId === r.id}
                    onClick={() => add(r.id, s)}
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', border: '1px solid #FFF7D6', color: '#FFF7D6', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
