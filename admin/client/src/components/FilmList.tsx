import type { ThemeFilm, FilmStatus } from '@bathfilmclub/types';
import { api } from '../api';

interface Props {
  films: ThemeFilm[];
  onUpdated: () => void;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';
const STATUS_ORDER: FilmStatus[] = ['nominated', 'shortlisted', 'selected'];

export function FilmList({ films, onUpdated }: Props) {
  if (films.length === 0) {
    return <p style={{ color: '#999', fontSize: '0.85rem', fontStyle: 'italic' }}>No films yet.</p>;
  }

  const sorted = [...films].sort(
    (a, b) => STATUS_ORDER.indexOf(b.status) - STATUS_ORDER.indexOf(a.status)
  );

  const updateStatus = async (tmdbId: number, status: FilmStatus) => {
    await api.updateFilmStatus(tmdbId, status);
    onUpdated();
  };

  const remove = async (tmdbId: number) => {
    if (!confirm('Remove this film?')) return;
    await api.removeFilm(tmdbId);
    onUpdated();
  };

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {sorted.map(({ film, status }) => (
        <li key={film.tmdbId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
          {film.posterPath ? (
            <img src={`${TMDB_IMAGE_BASE}${film.posterPath}`} alt="" style={{ width: 30, height: 45, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 30, height: 45, background: '#eee' }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {film.title} <span style={{ color: '#999', fontWeight: 400 }}>({film.year})</span>
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>{film.director}</p>
          </div>
          <select
            value={status}
            onChange={(e) => updateStatus(film.tmdbId, e.target.value as FilmStatus)}
            style={{ fontSize: '0.75rem', border: '1px solid #ccc', padding: '0.2rem', fontFamily: 'inherit' }}
          >
            <option value="nominated">Nominated</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="selected">Selected</option>
          </select>
          <button
            onClick={() => remove(film.tmdbId)}
            style={{ fontSize: '0.75rem', color: '#B11226', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.25rem' }}
            title="Remove"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
