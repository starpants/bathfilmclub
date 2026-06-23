import { useState } from 'react';
import type { ThemeFilm, Film } from '@bathfilmclub/types';
import { FilmCard } from './FilmCard';
import { FilmPanel } from './FilmPanel';
import { FilmStrip } from './FilmStrip';

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
  accentClass: string;
  showCount?: boolean;
  showStrip?: boolean;
}

function FilmRow({
  films,
  label,
  onSelect,
  cardWidth = 'w-full md:w-40',
  bgClass,
  accentClass,
  showCount = false,
  showStrip = false,
}: FilmRowProps) {
  const statuses = new Set(films.map((f) => f.status));
  const hasMixedStatuses = statuses.size > 1;

  return (
    <div className={`py-10 ${bgClass}`}>
      <div className="max-w-[1664px] mx-auto px-6 space-y-3">
        <h4
          className={`pyramid-subtitle text-2xl justify-center text-center p-2 mb-12 ${films.length === 0 ? 'text-bfc-brand-fg/40' : accentClass}`}
        >
          {label}
          {showCount ? ` (${films.length})` : ''}
        </h4>
        {films.length === 0 ? (
          <p className="text-bfc-brand-fg/60 font-body text-sm italic text-center">
            Not yet determined
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:flex md:flex-wrap md:gap-12 md:justify-center">
            {films.map(({ film, status }) => (
              <div key={film.tmdbId} className={`${cardWidth} flex-shrink-0`}>
                <FilmCard
                  film={film}
                  status={status}
                  onSelect={onSelect}
                  showTag={hasMixedStatuses}
                />
              </div>
            ))}
          </div>
        )}
        {showStrip && <FilmStrip />}
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
          cardWidth="w-full md:w-56"
          bgClass="bg-bfc-tier-selected"
          accentClass="text-bfc-brand-fg/90"
          showStrip
        />
        <FilmRow
          films={shortlisted}
          label="Shortlisted Films"
          onSelect={setActiveFilm}
          cardWidth="w-full md:w-48"
          bgClass="bg-bfc-tier-shortlisted"
          accentClass="text-bfc-brand-fg/90"
          showStrip
        />
        <FilmRow
          films={nominated}
          label="Nominated Films"
          onSelect={setActiveFilm}
          bgClass="bg-bfc-tier-nominated"
          accentClass="text-bfc-brand-fg/90"
          showCount
          showStrip
        />
      </div>
      <FilmPanel film={activeFilm} onClose={() => setActiveFilm(null)} />
    </>
  );
}
