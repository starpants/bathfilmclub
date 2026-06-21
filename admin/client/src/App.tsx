import { useState } from 'react';
import { CurrentCyclePanel } from './components/CurrentCycle';
import { ArchivePanel } from './components/ArchiveManager';

type Tab = 'current' | 'archive';

export function App() {
  const [tab, setTab] = useState<Tab>('current');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <header style={{ borderBottom: '2px solid #8C3646', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          ■ Bath Film Club Admin
        </h1>
        <nav style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {(['current', 'archive'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '0.5rem 1rem',
                background: tab === t ? '#8C3646' : 'rgba(255, 247, 214, 0.1)',
                color: '#FFF7D6',
                border: 'none',
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
