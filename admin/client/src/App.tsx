import { useState } from 'react';
import { AllThemes } from './components/AllThemes';

export function App() {
  const [showNewForm, setShowNewForm] = useState(false);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <header style={{ borderBottom: '2px solid #8C3646', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            ■ Bath Film Club Admin
          </h1>
          <button
            className={`btn${showNewForm ? ' btn-dimmed' : ''}`}
            onClick={() => setShowNewForm((v) => !v)}
          >
            + New Theme
          </button>
        </div>
      </header>

      <AllThemes showNewForm={showNewForm} onNewFormClose={() => setShowNewForm(false)} />
    </div>
  );
}
