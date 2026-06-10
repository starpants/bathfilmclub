import { useState } from 'react';
import { CurrentCyclePanel } from './components/CurrentCycle';
import { ArchivePanel } from './components/ArchiveManager';

type Tab = 'current' | 'archive';

export function App() {
  const [tab, setTab] = useState<Tab>('current');

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <header style={{ borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
          ■ Bath Film Club Admin
        </h1>
        <nav style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {(['current', 'archive'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '0.5rem 1rem',
                background: tab === t ? '#000' : 'transparent',
                color: tab === t ? '#fff' : '#000',
                border: '1px solid #000',
                cursor: 'pointer',
              }}
            >
              {t === 'current' ? 'Current Cycle' : 'Archive'}
            </button>
          ))}
        </nav>
      </header>

      {tab === 'current' && <CurrentCyclePanel />}
      {tab === 'archive' && <ArchivePanel />}
    </div>
  );
}
