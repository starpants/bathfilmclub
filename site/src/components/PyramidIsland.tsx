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
  return (
    <div className={`py-10 space-y-3 ${bgClass}`}>
      <p className="section-label text-base justify-center mb-4">{label}</p>
      {films.length === 0 ? (
        <p className="text-neutral-400 font-body text-sm italic text-center">Not yet determined</p>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center">
          {films.map(({ film, status }) => (
            <div key={film.tmdbId} className={`${cardWidth} flex-shrink-0`}>
              <FilmCard film={film} status={status} onSelect={onSelect} />
            </div>
          ))}
        </div>
      )}
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
          cardWidth="w-36 md:w-[168px]"
          bgClass="bg-neutral-700"
        />
        <FilmRow
          films={shortlisted}
          label="Shortlisted Films"
          onSelect={setActiveFilm}
          cardWidth="w-[120px] md:w-[140px]"
          bgClass="bg-neutral-800"
        />
        <FilmRow
          films={nominated}
          label="Nominated Films"
          onSelect={setActiveFilm}
          bgClass="bg-neutral-900"
        />
      </div>
      <FilmPanel film={activeFilm} onClose={() => setActiveFilm(null)} />
    </>
  );
}
