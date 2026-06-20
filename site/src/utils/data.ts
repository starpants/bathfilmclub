import type { Theme } from '@bathfilmclub/types';

export async function getCurrentCycle(): Promise<Theme | null> {
  try {
    const data = await import('../data/current.json');
    return data.default as Theme;
  } catch {
    return null;
  }
}

export async function getAllThemes(): Promise<Theme[]> {
  const imports = import.meta.glob<{ default: Theme }>('../data/themes/*.json', { eager: true });
  const archived = Object.values(imports).map((m) => m.default);

  // current.json takes priority over any archived copy with the same slug
  const current = await getCurrentCycle();
  const themes = current
    ? [current, ...archived.filter((t) => t.slug !== current.slug)]
    : archived;

  return themes.sort((a, b) => b.month.localeCompare(a.month));
}

export async function getThemeBySlug(slug: string): Promise<Theme | null> {
  const themes = await getAllThemes();
  return themes.find((t) => t.slug === slug) ?? null;
}

export function formatMonth(month: string): string {
  // "2026-06" → "June 2026"
  const [year, m] = month.split('-');
  const date = new Date(parseInt(year!), parseInt(m!) - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function formatMeetingDate(isoDate: string): string {
  // "2026-06-23" → "Monday 23 June 2026"
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
