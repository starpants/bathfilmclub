import { useEffect, useState } from 'react';
import { api } from './api';
import { AllThemes } from './components/AllThemes';
import { ThemeEditPage } from './components/ThemeEditPage';
import { color, fg, font, size } from './tokens';

export function App() {
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [yearInReview, setYearInReview] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    api.getSettings()
      .then((s) => {
        setYearInReview(s.yearInReview);
        setSettingsLoaded(true);
      })
      .catch((e: Error) => setSettingsError(e.message));
  }, []);

  async function toggleYearInReview(next: boolean) {
    const previous = yearInReview;
    setYearInReview(next);
    setSettingsSaving(true);
    setSettingsError(null);
    try {
      const saved = await api.updateSettings({ yearInReview: next });
      setYearInReview(saved.yearInReview);
    } catch (e) {
      setYearInReview(previous);
      setSettingsError(e instanceof Error ? e.message : 'Failed to save setting');
    } finally {
      setSettingsSaving(false);
    }
  }

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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem', gap: '0.25rem' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: font.body,
                fontSize: size.body, color: color.brandFg, cursor: !settingsLoaded || settingsSaving ? 'default' : 'pointer',
                opacity: !settingsLoaded || settingsSaving ? 0.6 : 1,
              }}>
                <input
                  type="checkbox"
                  checked={yearInReview}
                  disabled={!settingsLoaded || settingsSaving}
                  onChange={(e) => toggleYearInReview(e.target.checked)}
                  style={{ width: '1.1rem', height: '1.1rem', accentColor: color.brandAccent }}
                />
                Year in review
              </label>
              <span style={{ fontSize: size.small, color: fg.muted }}>
                Homepage shows the year summary and a 'no meeting' message instead of the current theme.
              </span>
              {settingsError && (
                <span role="alert" style={{ fontSize: size.small, color: color.errorText }}>{settingsError}</span>
              )}
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
