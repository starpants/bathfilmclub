export interface Film {
  tmdbId: number;
  title: string;
  year: number;
  runtime: number;       // minutes
  genres: string[];
  synopsis: string;
  director: string;
  producers: string[];   // up to 3
  cast: string[];        // top 5 billed
  posterPath: string;    // TMDb path e.g. "/abc123.jpg" — prefix with TMDb image base URL
  backdropPath?: string;
  rating?: number;       // TMDb vote_average, one decimal place
  trailerKey?: string;   // YouTube video key
}

export type FilmStatus = 'nominated' | 'shortlisted' | 'selected';

export interface ThemeFilm {
  film: Film;
  status: FilmStatus;
}

export interface Meeting {
  date: string;   // ISO 8601 date "2026-06-15"
  time: string;   // 24-hour "19:30"
  venue?: string;
}

export interface Theme {
  slug: string;       // "2026-06-time-travel" — YYYY-MM-kebab-title
  title: string;
  description?: string;
  month: string;      // "2026-06" — YYYY-MM, used for archive grouping and sort
  meeting?: Meeting;
  films: ThemeFilm[]; // all films regardless of status
}
