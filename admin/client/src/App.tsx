import { useState } from 'react';
import { AllThemes } from './components/AllThemes';
import { ThemeEditPage } from './components/ThemeEditPage';
import { color, font, size } from './tokens';

export function App() {
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      {editSlug ? (
        <ThemeEditPage
          slug={editSlug}
          onBack={() => setEditSlug(null)}
          onDeleted={() => setEditSlug(null)}
        />
      ) : (
        <>
          {/* Nav-style header: centered CTA + full-width accent border (mirrors site Header) */}
          <header style={{ borderBottom: `4px solid ${color.brandAccent}`, paddingBottom: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setShowNewForm((v) => !v)}
                style={{
                  fontFamily: 'inherit', fontWeight: 600, fontSize: '1.25rem',
                  padding: '0.6rem 1.5rem', letterSpacing: '0.025em', cursor: 'pointer',
                  background: showNewForm ? 'transparent' : color.brandAccent,
                  color: color.brandFg, border: `1px solid ${color.brandAccent}`,
                  opacity: showNewForm ? 0.6 : 1,
                }}
              >
                + Add New Theme
              </button>
            </div>
          </header>

          {/* Mini-hero title on flat brand-bg (echoes site hero) */}
          <h1 style={{ textAlign: 'center', fontFamily: font.display, fontSize: size.title, color: color.brandFg, margin: '0 0 2rem' }}>
            Bath Film Club Admin
          </h1>

          <AllThemes
            showNewForm={showNewForm}
            onNewFormClose={() => setShowNewForm(false)}
            onEdit={(slug) => setEditSlug(slug)}
          />
        </>
      )}
    </div>
  );
}
