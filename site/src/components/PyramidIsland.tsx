import { useState } from 'react';
import type { ThemeFilm, Film } from '@bathfilmclub/types';
import { FilmCard } from './FilmCard';
import { FilmPanel } from './FilmPanel';

interface Props {
  selected: ThemeFilm[];
  shortlisted: ThemeFilm[];
  nominated: ThemeFilm[];
}

interface FilmRowProps {
  films: ThemeFilm[];
  label: string;
  onSelect: (film: Film) => void;
  cardWidth?: string;
  bgClass: string;
}

function FilmRow({ films, label, onSelect, cardWidth = 'w-24 md:w-28', bgClass }: FilmRowProps) {
  const statuses = new Set(films.map(f => f.status));
  const hasMixedStatuses = statuses.size > 1;

  return (
    <div className={`py-10 ${bgClass}`}>
      <div className="max-w-[1200px] mx-auto px-6 space-y-3">
        <h4 className="pyramid-subtitle text-xl justify-center p-2 bg-brand-red text-brand-white mb-12">
          {label}
        </h4>
        {films.length === 0 ? (
          <p className="text-neutral-400 font-body text-sm italic text-center">
            Not yet determined
          </p>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {films.map(({ film, status }) => (
              <div key={film.tmdbId} className={`${cardWidth} flex-shrink-0`}>
                <FilmCard film={film} status={status} onSelect={onSelect} showTag={hasMixedStatuses} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PyramidIsland({ selected, shortlisted, nominated }: Props) {
  const [activeFilm, setActiveFilm] = useState<Film | null>(null);

  return (
    <>
      <div>
        <FilmRow
          films={selected}
          label="Selected Films"
          onSelect={setActiveFilm}
          cardWidth="w-36 md:w-[200px]"
          bgClass="bg-neutral-600/25"
        />
        <FilmRow
          films={shortlisted}
          label="Shortlisted Films"
          onSelect={setActiveFilm}
          cardWidth="w-[120px] md:w-[150px]"
          bgClass="bg-neutral-600/20"
        />
        <FilmRow
          films={nominated}
          label="Nominated Films"
          onSelect={setActiveFilm}
          bgClass="bg-neutral-600/15"
        />
      </div>
      <FilmPanel film={activeFilm} onClose={() => setActiveFilm(null)} />
    </>
  );
}
