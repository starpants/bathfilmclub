import { useState, useEffect, useCallback } from 'react';
import type { Theme, FilmStatus } from '@bathfilmclub/types';
import { api } from '../api';
import { color, fg, font, size } from '../tokens';
import { FilmSearch } from './FilmSearch';
import { FilmCard } from './FilmCard';
import { PyramidBand } from './PyramidBand';

interface Props {
  slug: string;
  onBack: () => void;
  onDeleted: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const bandInput: React.CSSProperties = {
  width: '100%', fontFamily: 'inherit', fontSize: size.body, color: color.brandFg,
  background: fg.hairline, border: `1px solid ${fg.faint}`,
  padding: '0.5rem', height: '2.5rem', boxSizing: 'border-box',
};

function label(text: string) {
  return (
    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem', color: fg.strong }}>
      {text}
    </span>
  );
}

export function ThemeEditPage({ slug, onBack, onDeleted }: Props) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [month, setMonth] = useState('');
  const [description, setDescription] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('19:30');
  const [meetingVenue, setMeetingVenue] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const load = useCallback(async () => {
    try {
      const { themes, currentSlug: cur } = await api.getAllThemes();
      const t = themes.find((x) => x.slug === slug) ?? null;
      setTheme(t);
      setCurrentSlug(cur);
      if (t) {
        setTitle(t.title);
        setMonth(t.month);
        setDescription(t.description ?? '');
        setMeetingDate(t.meeting?.date ?? '');
        setMeetingTime(t.meeting?.time ?? '19:30');
        setMeetingVenue(t.meeting?.venue ?? '');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  // Reload only the films after an auto-saved film op — leaves the details form untouched.
  const reloadFilms = useCallback(async () => {
    const { themes } = await api.getAllThemes();
    setTheme(themes.find((x) => x.slug === slug) ?? null);
  }, [slug]);

  const saveDetails = async () => {
    if (!theme) return;
    if (!title.trim() || !month.trim()) { setError('Title and month are required.'); return; }
    setSaveState('saving');
    setError('');
    try {
      const updated = await api.updateTheme(theme.slug, {
        title: title.trim(),
        description: description.trim() || undefined,
        month: month.trim(),
        meeting: meetingDate ? { date: meetingDate, time: meetingTime, venue: meetingVenue.trim() || undefined } : undefined,
        films: theme.films,
      });
      setTheme(updated);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaveState('idle');
    }
  };

  const del = async () => {
    if (!theme) return;
    if (!confirm(`Delete "${theme.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteTheme(theme.slug);
      onDeleted();
    } catch (e) {
      alert(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  if (loading) return <p style={{ color: fg.faint }}>Loading…</p>;
  if (!theme) return <p style={{ color: color.danger }}>{error || 'Theme not found.'}</p>;

  const isCurrent = theme.slug === currentSlug;
  const byStatus = (s: FilmStatus) => theme.films.filter((f) => f.status === s);

  return (
    <div>
      <header style={{ borderBottom: `4px solid ${color.brandAccent}`, paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button
          className="btn"
          onClick={onBack}
          style={{ height: '2.5rem', display: 'inline-flex', alignItems: 'center' }}
        >
          ← Back to themes
        </button>
      </header>
      <h1 style={{ textAlign: 'center', fontFamily: font.display, fontSize: size.title, color: color.brandFg, margin: '0 0 2rem' }}>
        Bath Film Club Admin
      </h1>

      {/* Details */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <label style={{ flex: '1 1 240px' }}>
            {label('Title')}
            <input style={{ ...bandInput, fontWeight: 700 }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Time Travel" />
          </label>
          <label style={{ flex: '0 0 220px' }}>
            {label('Month')}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                style={{ ...bandInput, flex: 1 }}
                value={month.split('-')[1] ?? ''}
                onChange={(e) => setMonth(`${month.split('-')[0] || ''}-${e.target.value}`)}
              >
                <option value="">Month…</option>
                {MONTHS.map((name, i) => (
                  <option key={name} value={String(i + 1).padStart(2, '0')}>{name}</option>
                ))}
              </select>
              <input
                type="number"
                style={{ ...bandInput, flex: '0 0 5rem' }}
                value={month.split('-')[0] ?? ''}
                onChange={(e) => setMonth(`${e.target.value}-${month.split('-')[1] || ''}`)}
                placeholder="Year"
                min="2000"
                max="2100"
              />
            </div>
          </label>
        </div>
        <label style={{ display: 'block', marginTop: '1rem' }}>
          {label('Description')}
          <textarea style={{ ...bandInput, height: 'auto', minHeight: 72, resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <label style={{ flex: '0 0 160px' }}>
            {label('Meeting Date')}
            <input type="date" style={bandInput} value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
          </label>
          <label style={{ flex: '0 0 130px' }}>
            {label('Meeting Time')}
            <input type="time" style={bandInput} value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} />
          </label>
          <label style={{ flex: '1 1 240px' }}>
            {label('Meeting Venue')}
            <input style={bandInput} value={meetingVenue} onChange={(e) => setMeetingVenue(e.target.value)} placeholder="e.g. The Raven Pub, Bath" />
          </label>
        </div>
        {error && <p style={{ color: color.errorText, fontSize: '0.85rem', margin: '0.75rem 0 0' }}>{error}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem' }}>
          <button
            className="btn"
            onClick={saveDetails}
            disabled={saveState === 'saving'}
            style={{ height: '2.5rem', display: 'inline-flex', alignItems: 'center', borderColor: color.brandFg }}
          >
            {saveState === 'saving' ? 'Saving…' : 'Save Details'}
          </button>
          {saveState === 'saved' && <span style={{ fontSize: '0.85rem', color: fg.strong }}>Saved ✓</span>}
        </div>
      </div>

      {/* Add film */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontFamily: font.display, fontSize: '0.9rem', letterSpacing: '0.1em', color: fg.strong }}>Add Film</h3>
        <FilmSearch onAdd={(tmdbId, status) => api.addFilmToTheme(theme.slug, tmdbId, status).then(reloadFilms)} />
      </div>

      {/* Pyramid bands (top → bottom: selected, shortlisted, nominated) */}
      <PyramidBand title="Selected" color={color.tierSelected}>
        {byStatus('selected').map(({ film, status }) => (
          <FilmCard key={film.tmdbId} slug={theme.slug} film={film} status={status} onChanged={reloadFilms} />
        ))}
      </PyramidBand>
      <PyramidBand title="Shortlisted" color={color.tierShortlisted}>
        {byStatus('shortlisted').map(({ film, status }) => (
          <FilmCard key={film.tmdbId} slug={theme.slug} film={film} status={status} onChanged={reloadFilms} />
        ))}
      </PyramidBand>
      <PyramidBand title="Nominated" color={color.tierNominated}>
        {byStatus('nominated').map(({ film, status }) => (
          <FilmCard key={film.tmdbId} slug={theme.slug} film={film} status={status} onChanged={reloadFilms} />
        ))}
      </PyramidBand>

      {/* Danger zone */}
      <div style={{ marginTop: '2.5rem', border: `1px solid ${color.dangerBorder}`, padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontFamily: font.display, fontSize: '0.9rem', letterSpacing: '0.1em', color: color.danger }}>Danger Zone</h3>
        <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: fg.muted }}>
          {isCurrent
            ? 'The current theme cannot be deleted. Set another theme as current first.'
            : 'Permanently delete this theme. This cannot be undone.'}
        </p>
        <button className="btn btn-sm btn-danger" onClick={del} disabled={isCurrent}>Delete Theme</button>
      </div>
    </div>
  );
}
