import type { Film, FilmStatus } from '@bathfilmclub/types';

interface Props {
  film: Film;
  status: FilmStatus;
  onSelect: (film: Film) => void;
  showTag?: boolean;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

export function FilmCard({ film, status, onSelect, showTag = true }: Props) {
  return (
    <button
      onClick={() => onSelect(film)}
      className="group block w-full text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-bfc-brand-accent"
      aria-label={`View details for ${film.title}`}
    >
      <div className="aspect-[2/3] overflow-hidden bg-neutral-800 transition duration-300 group-hover:scale-110 group-hover:shadow-[16px_16px_6px_0px_rgba(0,_0,_0,_0.1)]">
        {film.posterPath ? (
          <img
            src={`${TMDB_IMAGE_BASE}${film.posterPath}`}
            alt={film.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-800">
            <span className="font-heading text-bfc-brand-fg text-xs text-center px-2">
              {film.title}
            </span>
          </div>
        )}
      </div>
      <div className="mt-1.5 h-12 overflow-hidden p-2 mb-2 ">
        <p className="font-body text-sm text-bfc-brand-fg line-clamp-2">{film.title}</p>
      </div>
      {showTag && status === 'selected' && (
        <span className="mt-1 bg-bfc-status-selected text-black block w-full text-xs font-heading uppercase tracking-wider px-1.5 py-1">
          {status}
        </span>
      )}
      {showTag && status === 'shortlisted' && (
        <span className="mt-1 bg-bfc-status-shortlisted text-black block w-full text-xs font-heading uppercase tracking-wider px-1.5 py-1">
          {status}
        </span>
      )}
      {showTag && status === 'nominated' && (
        <span className="mt-1 bg-bfc-status-nominated text-black block w-full text-xs font-heading uppercase tracking-wider px-1.5 py-1">
          {status}
        </span>
      )}
    </button>
  );
}
