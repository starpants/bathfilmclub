import { useState, useEffect } from 'react';
import type { Theme } from '@bathfilmclub/types';
import { api } from '../api';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  return new Date(parseInt(year), parseInt(m) - 1, 1).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric',
  });
}

export function ArchivePanel() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAllThemes()
      .then(setThemes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#666' }}>Loading…</p>;
  if (error) return <p style={{ color: '#B11226' }}>Error: {error}</p>;
  if (themes.length === 0) {
    return <p style={{ color: '#999', fontStyle: 'italic', fontSize: '0.85rem' }}>No archived themes yet.</p>;
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
        Archive ({themes.length} themes)
      </h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {themes.map((theme) => {
          const selected = theme.films.filter((f) => f.status === 'selected');
          return (
            <li key={theme.slug} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>
                    {theme.title}
                  </p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#666' }}>
                    {formatMonth(theme.month)} · {theme.films.length} films
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {selected.map(({ film }) => (
                    film.posterPath ? (
                      <img key={film.tmdbId} src={`${TMDB_IMAGE_BASE}${film.posterPath}`} alt={film.title} style={{ width: 20, height: 30, objectFit: 'cover' }} />
                    ) : null
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
