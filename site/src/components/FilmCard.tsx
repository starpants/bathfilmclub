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
      className="block w-full text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-bfc-brand-accent"
      aria-label={`View details for ${film.title}`}
    >
      <div className="transition duration-300 z-30 hover:scale-110 hover:bfc-shadow">
        <div className="mb-4 aspect-[2/3] overflow-hidden bg-neutral-800">
          {film.posterPath ? (
            <img
              src={`${TMDB_IMAGE_BASE}${film.posterPath}`}
              alt={film.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-800">
              <span className="font-heading text-bfc-brand-fg text-xl text-center px-2">
                {film.title}
              </span>
            </div>
          )}
        </div>
      </div>
      {showTag && status === 'selected' && (
        <span className="p-1 w-full bg-bfc-status-selected text-black block text-base font-heading uppercase tracking-wider">
          {status}
        </span>
      )}
      {showTag && status === 'shortlisted' && (
        <span className="p-1 w-full bg-bfc-status-shortlisted text-black block text-base font-heading uppercase tracking-wider">
          {status}
        </span>
      )}
      {showTag && status === 'nominated' && (
        <span className="p-1 w-full bg-bfc-status-nominated text-black block text-base font-heading uppercase tracking-wider">
          {status}
        </span>
      )}
      <div className="mt-1.5 h-24 overflow-hidden p-2 mb-2 ">
        <p className="font-body text-lg text-bfc-brand-fg">{film.title}</p>
      </div>
    </button>
  );
}
