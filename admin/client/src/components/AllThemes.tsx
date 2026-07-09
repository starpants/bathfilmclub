import { useState, useEffect, useCallback } from 'react';
import type { Theme, FilmStatus } from '@bathfilmclub/types';
import { api } from '../api';
import { ThemeEditor } from './ThemeEditor';
import { FilmSearch } from './FilmSearch';
import { FilmList } from './FilmList';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

type PanelMode = 'details' | 'films';

function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  return new Date(parseInt(year), parseInt(m) - 1, 1).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric',
  });
}

function getYear(month: string): string {
  return month.split('-')[0];
}

interface NewThemeFormProps {
  onCreated: (theme: Theme) => void;
  onCancel: () => void;
}

function NewThemeForm({ onCreated, onCancel }: NewThemeFormProps) {
  const [title, setTitle] = useState('');
  const [month, setMonth] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.5rem',
    border: '1px solid rgba(255,247,214,0.3)',
    background: 'rgba(255,247,214,0.05)',
    color: '#FFF7D6', fontSize: '0.9rem',
    fontFamily: 'inherit', boxSizing: 'border-box',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !month.trim()) { setError('Both fields are required.'); return; }
    setSaving(true);
    setError('');
    try {
      const theme = await api.createTheme(title.trim(), month.trim());
      onCreated(theme);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,247,214,0.15)', marginBottom: '1.5rem', background: 'rgba(255,247,214,0.03)' }}>
      <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        New Theme
      </h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <label style={{ flex: 1, minWidth: 180 }}>
          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem', color: 'rgba(255,247,214,0.5)' }}>Title</span>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Time Travel" />
        </label>
        <label style={{ flex: '0 0 140px' }}>
          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem', color: 'rgba(255,247,214,0.5)' }}>Month (YYYY-MM)</span>
          <input style={inputStyle} value={month} onChange={(e) => setMonth(e.target.value)} placeholder="2026-07" pattern="\d{4}-\d{2}" />
        </label>
      </div>
      {error && <p style={{ color: '#B11226', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit" className="btn btn-sm btn-accent" disabled={saving}>
          {saving ? 'Creating…' : 'Create Theme'}
        </button>
        <button type="button" className="btn btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

interface ThemeRowProps {
  theme: Theme;
  isCurrent: boolean;
  activePanel: PanelMode | null;
  onTogglePanel: (mode: PanelMode) => void;
  onSetAsCurrent: () => void;
  onDelete: () => void;
  onThemeUpdated: (theme: Theme) => void;
  onFilmsChanged: () => void;
}

function ThemeRow({ theme, isCurrent, activePanel, onTogglePanel, onSetAsCurrent, onDelete, onThemeUpdated, onFilmsChanged }: ThemeRowProps) {
  const selected = theme.films.filter((f) => f.status === 'selected');

  return (
    <li style={{ borderBottom: '1px solid rgba(255,247,214,0.1)' }}>
      {/* Theme summary row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 0' }}>
        {/* Mini poster strip */}
        <div style={{ display: 'flex', gap: '0.25rem', width: 52, flexShrink: 0 }}>
          {selected.slice(0, 2).map(({ film }) =>
            film.posterPath ? (
              <img key={film.tmdbId} src={`${TMDB_IMAGE_BASE}${film.posterPath}`} alt="" style={{ width: 24, height: 36, objectFit: 'cover' }} />
            ) : null
          )}
        </div>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '2rem' }}>{theme.title}</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,247,214,0.5)' }}>
            {formatMonth(theme.month)} · {theme.films.length} film{theme.films.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            className={`btn${activePanel === 'details' ? ' btn-dimmed' : ''}`}
            style={{ width: '10rem', textAlign: 'center' }}
            onClick={() => onTogglePanel('details')}
          >
            Edit Theme
          </button>
          <button
            className={`btn${activePanel === 'films' ? ' btn-dimmed' : ''}`}
            style={{ width: '10rem', textAlign: 'center' }}
            onClick={() => onTogglePanel('films')}
          >
            Edit Films
          </button>
          {isCurrent ? (
            <span className="btn btn-accent" style={{ width: '10rem', textAlign: 'center', cursor: 'default' }}>
              Current
            </span>
          ) : (
            <button className="btn" style={{ width: '10rem', textAlign: 'center' }} onClick={onSetAsCurrent}>
              Set as Current
            </button>
          )}
          <button className={`btn btn-danger${isCurrent ? ' btn-dimmed' : ''}`} style={{ width: '10rem', textAlign: 'center' }} onClick={isCurrent ? undefined : onDelete}>
            Delete
          </button>
        </div>
      </div>

      {/* Inline panels */}
      {activePanel === 'details' && (
        <div style={{ padding: '1rem 0 1.5rem', borderTop: '1px solid rgba(255,247,214,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn btn-sm" onClick={() => onTogglePanel('details')}>✕ Close</button>
          </div>
          <ThemeEditor
            theme={theme}
            onSaved={(updated) => { onThemeUpdated(updated); onTogglePanel('details'); }}
          />
        </div>
      )}
      {activePanel === 'films' && (
        <div style={{ padding: '1rem 0 1.5rem', borderTop: '1px solid rgba(255,247,214,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button className="btn btn-sm" onClick={() => onTogglePanel('films')}>✕ Close</button>
          </div>
          {/* Full-bleed band in the pyramid's "nominated" colour — breaks out of the 1200px container */}
          <div style={{ background: '#253A3C', margin: '0 calc(50% - 50vw) 1.25rem', padding: '1.25rem calc(50vw - 50%)' }}>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,247,214,0.75)', margin: '0 0 0.75rem' }}>
              Add Film
            </h3>
            <FilmSearch
              onAdd={(tmdbId: number, status: FilmStatus) =>
                api.addFilmToTheme(theme.slug, tmdbId, status).then(() => onFilmsChanged())
              }
            />
          </div>
          {/* Full-bleed band in the pyramid's "shortlisted" colour — breaks out of the 1200px container */}
          <div style={{ background: '#175A70', margin: '0 calc(50% - 50vw)', padding: '1.25rem calc(50vw - 50%)' }}>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,247,214,0.75)', margin: '0 0 0.75rem' }}>
              Films ({theme.films.length})
            </h3>
            <FilmList slug={theme.slug} films={theme.films} onUpdated={onFilmsChanged} />
          </div>
        </div>
      )}
    </li>
  );
}

interface Props {
  showNewForm: boolean;
  onNewFormClose: () => void;
}

export function AllThemes({ showNewForm, onNewFormClose }: Props) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openYears, setOpenYears] = useState<Set<string>>(new Set());
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<PanelMode | null>(null);

  const load = useCallback(async () => {
    try {
      const { themes: all, currentSlug: slug } = await api.getAllThemes();
      setThemes(all);
      setCurrentSlug(slug);
      // Default open: year of current theme, or current calendar year
      setOpenYears((prev) => {
        if (prev.size > 0) return prev; // don't reset if user has toggled years
        const defaultYear = slug
          ? all.find((t) => t.slug === slug)?.month.split('-')[0]
          : new Date().getFullYear().toString();
        return new Set(defaultYear ? [defaultYear] : []);
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleYear = (year: string) => {
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year); else next.add(year);
      return next;
    });
  };

  const togglePanel = (slug: string, mode: PanelMode) => {
    if (activeSlug === slug && activeMode === mode) {
      setActiveSlug(null);
      setActiveMode(null);
    } else {
      setActiveSlug(slug);
      setActiveMode(mode);
    }
  };

  const handleSetAsCurrent = async (slug: string, title: string) => {
    if (currentSlug && !confirm(`Set "${title}" as current? "${themes.find(t => t.slug === currentSlug)?.title}" will be archived.`)) return;
    try {
      await api.setAsCurrent(slug);
      await load();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.deleteTheme(slug);
      if (activeSlug === slug) { setActiveSlug(null); setActiveMode(null); }
      await load();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleThemeUpdated = (updated: Theme) => {
    setThemes((prev) => prev.map((t) => t.slug === updated.slug ? updated : t));
  };

  // Group themes by year
  const byYear = new Map<string, Theme[]>();
  for (const theme of themes) {
    const year = getYear(theme.month);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(theme);
  }
  const years = [...byYear.keys()].sort((a, b) => b.localeCompare(a));

  if (loading) return <p style={{ color: 'rgba(255,247,214,0.4)' }}>Loading…</p>;
  if (error) return <p style={{ color: '#B11226' }}>Error: {error}</p>;

  return (
    <div>
      {showNewForm && (
        <NewThemeForm
          onCreated={async (theme) => { onNewFormClose(); await load(); setOpenYears(new Set([getYear(theme.month)])); }}
          onCancel={onNewFormClose}
        />
      )}

      {themes.length === 0 && !showNewForm && (
        <p style={{ color: 'rgba(255,247,214,0.4)', paddingTop: '1rem' }}>No themes yet. Use "+ New Theme" to create one.</p>
      )}

      {years.map((year) => {
        const isOpen = openYears.has(year);
        const yearThemes = byYear.get(year)!;

        return (
          <div key={year} style={{ marginBottom: '0.25rem' }}>
            {/* Year header */}
            <button
              onClick={() => toggleYear(year)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                width: '100%', padding: '0.6rem 0',
                background: 'none', border: 'none', borderBottom: '2px solid rgba(255,247,214,0.15)',
                color: 'rgba(255,247,214,0.6)', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.15em',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '0.6rem' }}>{isOpen ? '▼' : '►'}</span>
              {year}
              <span style={{ fontWeight: 400, opacity: 0.6 }}>({yearThemes.length})</span>
            </button>

            {/* Theme list */}
            {isOpen && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {yearThemes.map((theme) => (
                  <ThemeRow
                    key={theme.slug}
                    theme={theme}
                    isCurrent={theme.slug === currentSlug}
                    activePanel={activeSlug === theme.slug ? activeMode : null}
                    onTogglePanel={(mode) => togglePanel(theme.slug, mode)}
                    onSetAsCurrent={() => handleSetAsCurrent(theme.slug, theme.title)}
                    onDelete={() => handleDelete(theme.slug, theme.title)}
                    onThemeUpdated={handleThemeUpdated}
                    onFilmsChanged={load}
                  />
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
