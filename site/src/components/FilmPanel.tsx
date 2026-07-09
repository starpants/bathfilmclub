import { useEffect, useRef } from 'react';
import type { Film } from '@bathfilmclub/types';

interface Props {
  film: Film | null;
  onClose: () => void;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const YOUTUBE_BASE = 'https://www.youtube.com/watch?v=';

export function FilmPanel({ film, onClose }: Props) {
  const isOpen = film !== null;
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label={film?.title}
      >
        {film && (
          <>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2.5 bg-bfc-brand-bg text-bfc-brand-fg/80 border border-bfc-brand-fg/40 hover:border-bfc-brand-fg hover:text-bfc-brand-fg transition-colors"
              aria-label="Close panel"
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

            {film.posterPath && (
              <img
                src={`${TMDB_IMAGE_BASE}${film.posterPath}`}
                alt={film.title}
                className="w-full aspect-2/3 object-cover"
              />
            )}

            <div className="p-6 space-y-6">
              <div>
                <h2 className="font-heading font-bold text-2xl leading-tight text-neutral-800">
                  {film.title}
                </h2>
                <p className="font-body text-neutral-600 text-sm mt-1">
                  {film.year}
                  {film.runtime ? ` · ${film.runtime} min` : ''}
                  {film.rating ? ` · ★ ${film.rating}` : ''}
                </p>
              </div>

              {film.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {film.genres.map((g) => (
                    <span
                      key={g}
                      className="text-xs font-heading uppercase tracking-wide border border-neutral-300 px-2 py-1 text-neutral-900"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {film.synopsis && (
                <p className="font-body text-sm leading-relaxed text-neutral-800">
                  {film.synopsis}
                </p>
              )}

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-heading font-semibold text-xs uppercase tracking-widest text-neutral-400">
                    Director
                  </dt>
                  <dd className="font-body mt-0.5 text-neutral-900">{film.director}</dd>
                </div>
                {film.producers.length > 0 && (
                  <div>
                    <dt className="font-heading font-semibold text-xs uppercase tracking-widest text-neutral-400">
                      Producers
                    </dt>
                    <dd className="font-body mt-0.5 text-neutral-900">
                      {film.producers.join(', ')}
                    </dd>
                  </div>
                )}
                {film.cast.length > 0 && (
                  <div>
                    <dt className="font-heading font-semibold text-xs uppercase tracking-widest text-neutral-400">
                      Cast
                    </dt>
                    <dd className="font-body mt-0.5 text-neutral-900">{film.cast.join(', ')}</dd>
                  </div>
                )}
              </dl>

              {film.trailerKey && (
                <a
                  href={`${YOUTUBE_BASE}${film.trailerKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-bfc-brand-accent font-heading font-semibold text-sm hover:underline"
                >
                  Watch Trailer ↗
                </a>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
