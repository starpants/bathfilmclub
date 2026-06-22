import type { ThemeFilm, FilmStatus } from '@bathfilmclub/types';
import { api } from '../api';

interface Props {
  slug: string;
  films: ThemeFilm[];
  onUpdated: () => void;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';
const STATUS_ORDER: FilmStatus[] = ['nominated', 'shortlisted', 'selected'];

export function FilmList({ slug, films, onUpdated }: Props) {
  if (films.length === 0) {
    return <p style={{ color: 'rgba(255,247,214,0.4)', fontSize: '0.85rem', fontStyle: 'italic' }}>No films yet.</p>;
  }

  const sorted = [...films].sort((a, b) => {
    const statusDiff = STATUS_ORDER.indexOf(b.status) - STATUS_ORDER.indexOf(a.status);
    if (statusDiff !== 0) return statusDiff;
    return a.film.title.localeCompare(b.film.title);
  });

  const updateStatus = async (tmdbId: number, status: FilmStatus) => {
    try {
      await api.updateFilmStatus(slug, tmdbId, status);
      onUpdated();
    } catch (e) {
      console.error('Failed to update status:', e instanceof Error ? e.message : String(e));
    }
  };

  const remove = async (tmdbId: number) => {
    if (!confirm('Remove this film?')) return;
    try {
      await api.removeFilm(slug, tmdbId);
      onUpdated();
    } catch (e) {
      console.error('Failed to remove film:', e instanceof Error ? e.message : String(e));
    }
  };

  const selectStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    border: '1px solid rgba(255,247,214,0.3)',
    background: 'rgba(255,247,214,0.05)',
    color: '#FFF7D6',
    padding: '0.2rem',
    fontFamily: 'inherit',
  };

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {sorted.map(({ film, status }) => (
        <li key={film.tmdbId} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,247,214,0.1)' }}>
          {film.posterPath ? (
            <img src={`${TMDB_IMAGE_BASE}${film.posterPath}`} alt="" style={{ width: 52, height: 79, objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 52, height: 79, background: 'rgba(255,247,214,0.1)', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {film.title} <span style={{ color: 'rgba(255,247,214,0.4)', fontWeight: 400 }}>({film.year})</span>
            </p>
            <p style={{ margin: 0, fontSize: '1.3rem', color: 'rgba(255,247,214,0.5)' }}>{film.director}</p>
          </div>
          <select value={status} onChange={(e) => updateStatus(film.tmdbId, e.target.value as FilmStatus)} style={selectStyle}>
            <option value="nominated">Nominated</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="selected">Selected</option>
          </select>
          <button onClick={() => remove(film.tmdbId)} style={{ fontSize: '0.75rem', color: 'rgba(177,18,38,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.25rem' }} title="Remove">
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
