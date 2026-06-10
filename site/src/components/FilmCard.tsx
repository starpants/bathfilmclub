import type { Film, FilmStatus } from '@bathfilmclub/types';

interface Props {
  film: Film;
  status: FilmStatus;
  onSelect: (film: Film) => void;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

export function FilmCard({ film, status, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(film)}
      className="group relative block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
      aria-label={`View details for ${film.title}`}
    >
      <div className="aspect-[2/3] overflow-hidden bg-neutral-200">
        {film.posterPath ? (
          <img
            src={`${TMDB_IMAGE_BASE}${film.posterPath}`}
            alt={film.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-200">
            <span className="font-heading text-neutral-400 text-xs text-center px-2">
              {film.title}
            </span>
          </div>
        )}
      </div>
      {status === 'selected' && (
        <span className="absolute top-2 left-2 bg-brand-red text-white text-[10px] font-heading font-semibold uppercase tracking-wider px-2 py-1">
          Selected
        </span>
      )}
    </button>
  );
}
