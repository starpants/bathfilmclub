import { useState, useEffect } from 'react';
import type { Theme } from '@bathfilmclub/types';
import { api } from '../api';
import { ThemeEditor } from './ThemeEditor';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  return new Date(parseInt(year), parseInt(m) - 1, 1).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric',
  });
}

interface ArchivedThemeItemProps {
  theme: Theme;
  onRefresh: () => void;
}

function ArchivedThemeItem({ theme, onRefresh }: ArchivedThemeItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selected = theme.films.filter((f) => f.status === 'selected');

  const handleRestore = async () => {
    if (!confirm(`Restore "${theme.title}" as current cycle?`)) return;
    setIsRestoring(true);
    try {
      await api.restoreTheme(theme.slug);
      onRefresh();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${theme.title}" from archive? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      await api.deleteTheme(theme.slug);
      onRefresh();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div style={{ borderBottom: '1px solid #eee', padding: '1.5rem 0' }}>
        <button
          onClick={() => setIsEditing(false)}
          style={{ fontSize: '0.75rem', color: '#666', background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginBottom: '1rem' }}
        >
          ← Back to archive
        </button>
        <ThemeEditor theme={theme} onSaved={() => { onRefresh(); setIsEditing(false); }} />
      </div>
    );
  }

  return (
    <li style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1 }}>
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
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
        <button
          onClick={() => setIsEditing(true)}
          style={{ color: '#000', background: 'none', border: '1px solid #000', padding: '0.3rem 0.75rem', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Edit
        </button>
        <button
          onClick={handleRestore}
          disabled={isRestoring}
          style={{ color: '#000', background: 'none', border: '1px solid #000', padding: '0.3rem 0.75rem', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {isRestoring ? 'Restoring…' : 'Make Current'}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{ color: '#B11226', background: 'none', border: '1px solid #B11226', padding: '0.3rem 0.75rem', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </li>
  );
}

export function ArchivePanel() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setThemes(await api.getAllThemes());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
        {themes.map((theme) => (
          <ArchivedThemeItem key={theme.slug} theme={theme} onRefresh={load} />
        ))}
      </ul>
    </div>
  );
}
