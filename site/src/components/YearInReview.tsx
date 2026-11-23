import { useState } from 'react';
import type { Film } from '@bathfilmclub/types';
import { FilmCard } from './FilmCard';
import { FilmPanel } from './FilmPanel';
// import { displayedClubRating } from '../utils/clubRating';
import { headlineParts, formatMonthName, type YearSummary } from '../utils/yearInReview';

export function YearInReview({ summary }: { summary: YearSummary }) {
  const [activeFilm, setActiveFilm] = useState<Film | null>(null);
  const headline = headlineParts(summary.themeCount, summary.filmCount);

  return (
    <div className="festive">
      <section aria-labelledby="year-in-review-title" className="py-16">
        <div className="max-w-site mx-auto px-6">
          <p className="section-label text-base text-center">{`${summary.year} in films`}</p>
          <h2
            id="year-in-review-title"
            className="font-heading font-light text-4xl md:text-5xl mt-2 mb-12 text-center"
          >
            {headline.themes} {headline.films} {headline.tagline}
          </h2>
          {/* Two months per row on desktop, one on phones. Poster sizing mirrors the
              pyramid's Nominated row (w-full md:w-40, gap-4 / md:gap-12). */}
          <ul className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-y-14 md:gap-x-24">
            {summary.months.map((m) => (
              <li key={m.slug} className="min-w-0 md:justify-self-center">
                <p className="font-display text-xs uppercase tracking-widest section-label text-center">
                  {formatMonthName(m.month)}
                </p>
                <a
                  href={`/theme/${m.slug}`}
                  className="block font-heading font-bold text-center text-4xl leading-tight mb-4  hover:underline"
                >
                  {m.title}
                </a>
                <div className="grid grid-cols-2 gap-12 md:flex md:gap-12">
                  {m.films.map((entry) => (
                    <div key={entry.film.tmdbId} className="w-full md:w-40 shrink-0">
                      <FilmCard
                        film={entry.film}
                        status={entry.status}
                        showTag={false}
                        // clubRating={displayedClubRating(entry)}
                        onSelect={setActiveFilm}
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <FilmPanel film={activeFilm} onClose={() => setActiveFilm(null)} />
    </div>
  );
}
