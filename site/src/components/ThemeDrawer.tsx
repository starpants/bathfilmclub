import { useState, useEffect } from 'react';
import type { Theme } from '@bathfilmclub/types';

interface Props {
  themes: Theme[];
  currentSlug?: string;
}

function shortMonth(month: string): string {
  const [year, m] = month.split('-');
  return new Date(parseInt(year!), parseInt(m!) - 1, 1)
    .toLocaleDateString('en-GB', { month: 'short' });
}

export function ThemeDrawer({ themes, currentSlug }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Group themes by year, descending
  const byYear = themes.reduce<Record<string, Theme[]>>((acc, t) => {
    const year = t.month.split('-')[0] as string;
    if (!acc[year]) acc[year] = [];
    acc[year].push(t);
    return acc;
  }, {});
  for (const year of Object.keys(byYear)) {
    byYear[year]!.sort((a, b) => a.month.localeCompare(b.month));
  }
  const years = Object.keys(byYear).sort((a, b) => parseInt(b) - parseInt(a));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="font-heading font-semibold text-sm uppercase tracking-wide text-white interactive-item"
        aria-label="Browse themes"
      >
        Browse
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-neutral-900 border-r border-neutral-700 z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Browse themes"
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 hover:text-brand-red transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        </button>

        {/* Theme list */}
        <nav className="p-6 pt-14 space-y-6">
          {years.map((year) => (
            <div key={year}>
              <p className="font-heading font-bold text-xs uppercase tracking-widest text-neutral-400 mb-2">
                {year}
              </p>
              <ul className="space-y-1">
                {byYear[year]?.map((t) => (
                  <li key={t.slug}>
                    <a
                      href={`/theme/${t.slug}`}
                      className={`block font-body text-sm text-neutral-400 interactive-item${t.slug === currentSlug ? ' active' : ''}`}
                    >
                      {shortMonth(t.month)} – {t.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
