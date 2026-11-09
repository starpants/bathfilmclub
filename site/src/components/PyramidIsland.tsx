import { useState } from 'react';
import type { ThemeFilm, Film } from '@bathfilmclub/types';
import { FilmCard } from './FilmCard';
import { FilmPanel } from './FilmPanel';
import { FilmStrip } from './FilmStrip';
import { displayedClubRating } from '../utils/clubRating';

interface Props {
  selected: ThemeFilm[];
  shortlisted: ThemeFilm[];
  nominated: ThemeFilm[];
  emptyMessage: string;
}

interface FilmRowProps {
  films: ThemeFilm[];
  label: string;
  emptyMessage: string;
  onSelect: (film: Film) => void;
  cardWidth?: string;
  bgClass: string;
  accentClass: string;
  showCount?: boolean;
  showStrip?: boolean;
  showClubRating?: boolean;
  /** Above 5 films, wrap at 4 per row on desktop (4+3, 4+4) instead of 6+1. */
  fourPerRowWhenMany?: boolean;
}

// Width of exactly four w-48 cards plus three gap-12 gaps (4×12rem + 3×3rem).
// Keep in sync with the shortlisted row's cardWidth if that changes.
const FOUR_W48_CARDS = 'md:max-w-[57rem] md:mx-auto';

function FilmRow({
  films,
  label,
  emptyMessage,
  onSelect,
  cardWidth = 'w-full md:w-40',
  bgClass,
  accentClass,
  showCount = false,
  showStrip = false,
  showClubRating = false,
  fourPerRowWhenMany = false,
}: FilmRowProps) {
  const statuses = new Set(films.map((f) => f.status));
  const hasMixedStatuses = statuses.size > 1;
  const rowWidthClass = fourPerRowWhenMany && films.length > 5 ? FOUR_W48_CARDS : '';

  return (
    <div className={`py-10 ${bgClass}`}>
      <div className="max-w-[1664px] mx-auto px-6 space-y-3">
        <h4
          className={`pyramid-subtitle text-2xl text-center p-2 mb-12 ${films.length === 0 ? 'text-bfc-brand-fg/40' : accentClass}`}
        >
          {label}
          {showCount ? ` (${films.length})` : ''}
        </h4>
        {films.length === 0 ? (
          <p className="text-bfc-brand-fg/60 font-body text-sm italic text-center">
            {emptyMessage}
          </p>
        ) : (
          <div className={`grid grid-cols-2 gap-4 md:flex md:flex-wrap md:gap-12 md:justify-center ${rowWidthClass}`}>
            {films.map((entry) => (
              <div key={entry.film.tmdbId} className={`${cardWidth} shrink-0`}>
                <FilmCard
                  film={entry.film}
                  status={entry.status}
                  onSelect={onSelect}
                  showTag={hasMixedStatuses}
                  clubRating={showClubRating ? displayedClubRating(entry) : undefined}
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

export function PyramidIsland({ selected, shortlisted, nominated, emptyMessage }: Props) {
  const [activeFilm, setActiveFilm] = useState<Film | null>(null);

  return (
    <>
      <div>
        <FilmRow
          films={selected}
          label="Selected Films"
          emptyMessage={emptyMessage}
          onSelect={setActiveFilm}
          cardWidth="w-full md:w-56"
          bgClass="bg-bfc-tier-selected"
          accentClass="text-bfc-brand-fg/90"
          showStrip
          showClubRating
        />
        <FilmRow
          films={shortlisted}
          label="Shortlisted Films"
          emptyMessage={emptyMessage}
          onSelect={setActiveFilm}
          cardWidth="w-full md:w-48"
          bgClass="bg-bfc-tier-shortlisted"
          accentClass="text-bfc-brand-fg/90"
          showStrip
          fourPerRowWhenMany
        />
        <FilmRow
          films={nominated}
          label="Nominated Films"
          emptyMessage={emptyMessage}
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
