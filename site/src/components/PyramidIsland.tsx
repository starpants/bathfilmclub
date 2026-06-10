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
}

function FilmRow({ films, label, onSelect }: FilmRowProps) {
  return (
    <div className="space-y-3">
      <p className="section-label">{label}</p>
      {films.length === 0 ? (
        <p className="text-neutral-400 font-body text-sm italic">Not yet determined</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {films.map(({ film, status }) => (
            <div key={film.tmdbId} className="w-24 md:w-28 flex-shrink-0">
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
      <div className="space-y-8">
        <FilmRow films={selected} label="Selected Films" onSelect={setActiveFilm} />
        <FilmRow films={shortlisted} label="Shortlisted Films" onSelect={setActiveFilm} />
        <FilmRow films={nominated} label="Nominated Films" onSelect={setActiveFilm} />
      </div>
      <FilmPanel film={activeFilm} onClose={() => setActiveFilm(null)} />
    </>
  );
}
