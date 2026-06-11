import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Theme } from '@bathfilmclub/types';
import { api } from '../api';

interface Props {
  theme: Theme | null;
  onSaved: (theme: Theme) => void;
}

function field(label: string, el: ReactNode) {
  return (
    <label style={{ display: 'block', marginBottom: '1rem' }}>
      <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem', color: '#666' }}>
        {label}
      </span>
      {el}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.5rem', border: '1px solid #ccc', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box',
};

export function ThemeEditor({ theme, onSaved }: Props) {
  const [title, setTitle] = useState(theme?.title ?? '');
  const [description, setDescription] = useState(theme?.description ?? '');
  const [month, setMonth] = useState(theme?.month ?? '');
  const [meetingDate, setMeetingDate] = useState(theme?.meeting?.date ?? '');
  const [meetingTime, setMeetingTime] = useState(theme?.meeting?.time ?? '19:30');
  const [meetingVenue, setMeetingVenue] = useState(theme?.meeting?.venue ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!title.trim() || !month.trim()) {
      setError('Title and month are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await api.updateCurrentCycle({
        title: title.trim(),
        description: description.trim() || undefined,
        month: month.trim(),
        meeting: meetingDate ? { date: meetingDate, time: meetingTime, venue: meetingVenue.trim() || undefined } : undefined,
        films: theme?.films ?? [],
      });
      onSaved(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {field('Title', <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Time Travel" />)}
      {field('Month (YYYY-MM)', <input style={inputStyle} value={month} onChange={(e) => setMonth(e.target.value)} placeholder="2026-06" pattern="\d{4}-\d{2}" />)}
      {field('Description (optional)', <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} />)}
      {field('Meeting Date', <input type="date" style={inputStyle} value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />)}
      {field('Meeting Time', <input type="time" style={inputStyle} value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} />)}
      {field('Meeting Venue (optional)', <input style={inputStyle} value={meetingVenue} onChange={(e) => setMeetingVenue(e.target.value)} placeholder="e.g. The Raven Pub, 7 Queen St, Bath BA1 1HE" />)}
      {error && <p style={{ color: '#B11226', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
      <button
        onClick={save}
        disabled={saving}
        style={{ background: '#000', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', cursor: 'pointer' }}
      >
        {saving ? 'Saving…' : 'Save Theme'}
      </button>
    </div>
  );
}
