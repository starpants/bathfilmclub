import { useState, useEffect, useCallback } from 'react';
import type { Theme, FilmStatus } from '@bathfilmclub/types';
import { api } from '../api';
import { ThemeEditor } from './ThemeEditor';
import { FilmSearch } from './FilmSearch';
import { FilmList } from './FilmList';

type Section = 'theme' | 'films';

interface NewThemeFormProps {
  onCreated: (theme: Theme) => void;
}

function NewThemeForm({ onCreated }: NewThemeFormProps) {
  const [title, setTitle] = useState('');
  const [month, setMonth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !month.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const theme = await api.newTheme(title, month);
      onCreated(theme);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Theme Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Black And White"
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Month (YYYY-MM)
        </label>
        <input
          type="text"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="e.g., 2026-07"
          pattern="\d{4}-\d{2}"
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit' }}
        />
      </div>

      {error && (
        <p style={{ color: '#B11226', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        style={{ padding: '0.5rem 1rem', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.875rem' }}
      >
        {isLoading ? 'Creating…' : 'Create Theme'}
      </button>
    </form>
  );
}

export function CurrentCyclePanel() {
  const [cycle, setCycle] = useState<Theme | null | undefined>(undefined);
  const [section, setSection] = useState<Section>('theme');
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setCycle(await api.getCurrentCycle());
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addFilm = async (tmdbId: number, status: FilmStatus) => {
    await api.addFilm(tmdbId, status);
    load();
  };

  const archive = async () => {
    if (!confirm('Archive the current cycle? It will move to the archive and the current cycle will be cleared.')) return;
    setArchiving(true);
    try {
      await api.archiveCycle();
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setArchiving(false);
    }
  };

  if (cycle === undefined) return <p style={{ color: '#666' }}>Loading…</p>;
  if (error) return <p style={{ color: '#B11226' }}>Error: {error}</p>;

  if (!cycle) {
    return (
      <div>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
          Create a New Theme
        </h2>
        <NewThemeForm onCreated={(theme) => { setCycle(theme); setSection('theme'); }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>
          {cycle.title}
        </h2>
        <button
          onClick={archive}
          disabled={archiving}
          style={{ fontSize: '0.75rem', color: '#B11226', background: 'none', border: '1px solid #B11226', padding: '0.3rem 0.75rem', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {archiving ? 'Archiving…' : 'Archive Cycle'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['theme', 'films'] as Section[]).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', background: section === s ? '#000' : 'transparent', color: section === s ? '#fff' : '#000', border: '1px solid #000', cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'capitalize' }}
          >
            {s === 'theme' ? 'Theme Details' : 'Films'}
          </button>
        ))}
      </div>

      {section === 'theme' && (
        <ThemeEditor theme={cycle} onSaved={(t) => setCycle(t)} />
      )}

      {section === 'films' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              Add Film
            </h3>
            <FilmSearch onAdd={addFilm} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              Films in Cycle ({cycle.films.length})
            </h3>
            <FilmList films={cycle.films} onUpdated={load} />
          </div>
        </div>
      )}
    </div>
  );
}
