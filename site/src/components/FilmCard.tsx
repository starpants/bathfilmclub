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
      className="group block w-full text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
      aria-label={`View details for ${film.title}`}
    >
      <div className="aspect-[2/3] overflow-hidden bg-neutral-800 transition-transform duration-300 group-hover:scale-110">
        {film.posterPath ? (
          <img
            src={`${TMDB_IMAGE_BASE}${film.posterPath}`}
            alt={film.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-800">
            <span className="font-heading text-neutral-400 text-xs text-center px-2">
              {film.title}
            </span>
          </div>
        )}
      </div>
      <div className="mt-1.5 h-9 overflow-hidden">
        <p className="font-body text-xs text-neutral-300 leading-snug line-clamp-2">{film.title}</p>
      </div>
      {showTag && status === 'selected' && (
        <span className="mt-1 inline-block border border-brand-green text-brand-green text-[9px] font-heading uppercase tracking-wider px-1.5 py-0.5">
          {status}
        </span>
      )}
      {showTag && status === 'shortlisted' && (
        <span className="mt-1 inline-block border border-brand-mustard text-brand-mustard text-[9px] font-heading uppercase tracking-wider px-1.5 py-0.5">
          {status}
        </span>
      )}
      {showTag && status === 'nominated' && (
        <span className="mt-1 inline-block border border-neutral-700 text-neutral-500 text-[9px] font-heading uppercase tracking-wider px-1.5 py-0.5">
          {status}
        </span>
      )}
    </button>
  );
}
