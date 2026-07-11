// Design tokens for the admin, seeded from the public site's bfc-* @theme values.
// The admin uses no Tailwind — these are consumed via inline styles.
import type { FilmStatus } from '@bathfilmclub/types';

export const color = {
  brandBg: '#15262E',
  brandFg: '#FFF7D6',
  brandAccent: '#8C3646',
  brandAlt: '#2A8476',
  tierSelected: '#674967',
  tierShortlisted: '#175A70',
  tierNominated: '#253A3C',
  danger: '#B11226',
  dangerBorder: 'rgba(177,18,38,0.5)',
  errorOnAccent: '#FFD9DE',
} as const;

// Cream foreground at the opacity variants the site uses.
export const fg = {
  strong: 'rgba(255,247,214,0.8)',
  muted: 'rgba(255,247,214,0.6)',
  faint: 'rgba(255,247,214,0.4)',
  subtle: 'rgba(255,247,214,0.05)',
  hairline: 'rgba(255,247,214,0.1)',
} as const;

export const font = {
  display: "'Notable', sans-serif",
  body: "'Barlow Condensed', sans-serif",
} as const;

// Type scale (rem) roughly mirroring the site's heading sizes.
export const size = {
  title: '3rem',
  heading: '1.5rem',
  body: '1.25rem',
  small: '0.8rem',
} as const;

export const tierColor: Record<FilmStatus, string> = {
  selected: color.tierSelected,
  shortlisted: color.tierShortlisted,
  nominated: color.tierNominated,
};
