import { useState, useEffect } from 'react';
import type { Theme } from '@bathfilmclub/types';

interface Props {
  themes: Theme[];
  currentSlug?: string;
}

function shortMonth(month: string): string {
  const [year, m] = month.split('-');
  return new Date(parseInt(year!), parseInt(m!) - 1, 1).toLocaleDateString('en-GB', {
    month: 'short',
  });
}

export function MenuDrawer({ themes, currentSlug }: Props) {
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

  const [isOpen, setIsOpen] = useState(false);
  const [openYear, setOpenYear] = useState<string | null>(years[0] ?? null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="font-heading font-semibold text-sm px-3 py-2 md:text-xl md:px-5 md:py-3 border border-bfc-brand-fg/40 text-bfc-brand-fg/80 hover:border-bfc-brand-fg hover:text-bfc-brand-fg transition-colors"
        aria-label="Browse themes"
      >
        <span className="md:hidden">Browse</span><span className="hidden md:inline">Browse Themes</span>
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-bfc-brand-bg border-r border-bfc-brand-bg/60 z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 text-bfc-brand-fg/70 hover:text-bfc-brand-fg transition-colors"
          aria-label="Close"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        </button>

        <nav className="p-6 pt-14 space-y-4">
          {/* Search link */}
          {/* <a
            href="/search"
            className="block font-body font-semibold text-bfc-brand-fg interactive-item"
          >
            Search Themes
          </a> */}

          {/* Divider */}
          {/* <hr className="border-bfc-brand-fg/20" /> */}

          {/* Accordion year groups */}
          <div className="space-y-1">
            {years.map((year) => (
              <div key={year}>
                <button
                  onClick={() => setOpenYear(openYear === year ? null : year)}
                  className="w-full flex items-center justify-between font-heading font-bold uppercase tracking-widest text-bfc-brand-fg/60 py-1 hover:text-bfc-brand-fg transition-colors"
                >
                  {year}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="square"
                    className={`transition-transform duration-200 ${openYear === year ? 'rotate-180' : ''}`}
                  >
                    <path d="M2 4l4 4 4-4" />
                  </svg>
                </button>
                {openYear === year && (
                  <ul className="mt-1 space-y-1">
                    {byYear[year]?.map((t) => (
                      <li key={t.slug}>
                        <a
                          href={`/theme/${t.slug}`}
                          className={`block font-body text-bfc-brand-fg/80 interactive-item${t.slug === currentSlug ? ' active' : ''}`}
                        >
                          {shortMonth(t.month)} – {t.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
