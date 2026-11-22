import type { SiteSettings, Theme, ThemeFilm } from '@bathfilmclub/types';

export function parseSettings(raw: unknown): SiteSettings {
  if (typeof raw === 'object' && raw !== null && (raw as { yearInReview?: unknown }).yearInReview === true) {
    return { yearInReview: true };
  }
  return { yearInReview: false };
}

export interface YearMonth {
  slug: string;
  month: string;
  title: string;
  films: ThemeFilm[];
}

export interface YearSummary {
  year: string;
  months: YearMonth[];
  themeCount: number;
  filmCount: number;
}

export function getYearSummary(themes: Theme[]): YearSummary {
  if (themes.length === 0) return { year: '', months: [], themeCount: 0, filmCount: 0 };

  const latest = themes.reduce((max, t) => (t.month > max ? t.month : max), themes[0]!.month);
  const year = latest.slice(0, 4);

  const months: YearMonth[] = themes
    .filter((t) => t.month.startsWith(year))
    .map((t) => ({
      slug: t.slug,
      month: t.month,
      title: t.title,
      films: t.films.filter((f) => f.status === 'selected'),
    }))
    .filter((m) => m.films.length > 0)
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    year,
    months,
    themeCount: months.length,
    filmCount: months.reduce((n, m) => n + m.films.length, 0),
  };
}

export interface HeadlineParts {
  themes: string;
  films: string;
  tagline: string;
}

export function headlineParts(themeCount: number, filmCount: number): HeadlineParts {
  return {
    themes: `${themeCount} ${themeCount === 1 ? 'theme' : 'themes'}.`,
    films: `${filmCount} ${filmCount === 1 ? 'film' : 'films'}.`,
    tagline: 'One club.',
  };
}

export function formatHeadline(themeCount: number, filmCount: number): string {
  const { themes, films, tagline } = headlineParts(themeCount, filmCount);
  return [themes, films, tagline].join(' ');
}

export function formatMonthName(month: string): string {
  // "2026-07" → "July"
  const [year, m] = month.split('-');
  const date = new Date(parseInt(year!), parseInt(m!) - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'long' });
}
