import { useState } from 'react';
import type { Film, FilmStatus } from '@bathfilmclub/types';
import { api } from '../api';
import { color, fg, font } from '../tokens';

const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

interface Props {
  slug: string;
  film: Film;
  status: FilmStatus;
  onChanged: () => void;
}

export function FilmCard({ slug, film, status, onChanged }: Props) {
  const [busy, setBusy] = useState(false);

  const changeStatus = async (next: FilmStatus) => {
    if (next === status) return;
    setBusy(true);
    try {
      await api.updateFilmStatus(slug, film.tmdbId, next);
      onChanged();
    } catch (e) {
      alert(`Failed to update status: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Remove "${film.title}"?`)) return;
    setBusy(true);
    try {
      await api.removeFilm(slug, film.tmdbId);
      onChanged();
    } catch (e) {
      alert(`Failed to remove film: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ width: 160, flexShrink: 0, opacity: busy ? 0.5 : 1 }}>
      <div style={{ aspectRatio: '2 / 3', background: fg.hairline, marginBottom: '0.5rem' }}>
        {film.posterPath && (
          <img
            src={`${TMDB_POSTER_BASE}${film.posterPath}`}
            alt={film.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', marginBottom: '0.5rem' }}>
        <select
          value={status}
          disabled={busy}
          onChange={(e) => changeStatus(e.target.value as FilmStatus)}
          style={{
            flex: 1, fontFamily: 'inherit', fontSize: '0.75rem', padding: '0.2rem',
            background: fg.subtle, color: color.brandFg, border: `1px solid ${fg.faint}`,
          }}
        >
          <option value="nominated">Nominated</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="selected">Selected</option>
        </select>
        <button
          onClick={remove}
          disabled={busy}
          title="Remove"
          aria-label="Remove"
          style={{ background: 'none', border: 'none', color: color.danger, cursor: 'pointer', fontSize: '0.9rem', padding: '0 0.25rem' }}
        >
          ✕
        </button>
      </div>
      <p style={{ margin: 0, fontFamily: font.body, fontSize: '1rem', color: fg.strong, lineHeight: 1.2 }}>
        {film.title} <span style={{ color: fg.faint }}>({film.year})</span>
      </p>
    </div>
  );
}
