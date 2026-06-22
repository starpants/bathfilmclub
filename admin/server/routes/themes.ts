import { Router } from 'express';
import { storage } from '../storage.js';
import { getFilmDetails } from '../tmdb.js';
import type { Theme, FilmStatus, ThemeFilm } from '@bathfilmclub/types';

export const themesRouter = Router();

const VALID_STATUSES: FilmStatus[] = ['nominated', 'shortlisted', 'selected'];

// GET /themes — all themes (archived + current), plus currentSlug indicator
themesRouter.get('/', async (_req, res) => {
  const [archived, current] = await Promise.all([
    storage.readAllThemes(),
    storage.readCurrentCycle(),
  ]);
  const currentSlug = current?.slug ?? null;
  const themes = current
    ? [current, ...archived.filter((t) => t.slug !== current.slug)]
    : archived;
  themes.sort((a, b) => b.month.localeCompare(a.month));
  res.json({ themes, currentSlug });
});

// GET /themes/current — current theme only
themesRouter.get('/current', async (_req, res) => {
  const cycle = await storage.readCurrentCycle();
  res.json(cycle);
});

// POST /themes/new — create theme and save to archive (not current)
themesRouter.post('/new', async (req, res) => {
  const { title, month } = req.body as { title?: string; month?: string };
  if (!title || !month) {
    return res.status(400).json({ error: 'title and month are required' });
  }
  const slug = `${month}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  const newTheme: Theme = { slug, title, month, films: [] };
  await storage.writeTheme(newTheme);
  res.json(newTheme);
});

// POST /themes/archive — archive the current cycle
themesRouter.post('/archive', async (_req, res) => {
  await storage.archiveCurrentCycle();
  res.json({ ok: true });
});

// PUT /themes/:slug — update any theme (current or archived)
themesRouter.put('/:slug', async (req, res) => {
  const { slug } = req.params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }
  const { title, description, month, meeting, films } = req.body as Partial<Theme>;

  const existing = await storage.readAnyTheme(slug);
  if (!existing) {
    return res.status(404).json({ error: 'Theme not found' });
  }

  const updated: Theme = {
    slug: existing.slug,
    title: title ?? existing.title,
    description: description ?? existing.description,
    month: month ?? existing.month,
    meeting: meeting ?? existing.meeting,
    films: films ?? existing.films,
  };

  await storage.writeAnyTheme(updated);
  res.json(updated);
});

// POST /themes/:slug/restore — set theme as current (archive existing current first)
themesRouter.post('/:slug/restore', async (req, res) => {
  const { slug } = req.params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }
  const theme = await storage.readTheme(slug);
  if (!theme) {
    return res.status(404).json({ error: 'Theme not found' });
  }

  const existing = await storage.readCurrentCycle();
  if (existing && existing.slug !== slug) {
    await storage.writeTheme(existing);
  }

  await storage.deleteTheme(slug);
  await storage.writeCurrentCycle(theme);
  res.json(theme);
});

// DELETE /themes/:slug — delete archived theme
themesRouter.delete('/:slug', async (req, res) => {
  const { slug } = req.params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }
  try {
    await storage.deleteTheme(slug);
    res.json({ ok: true });
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      return res.status(404).json({ error: 'Theme not found' });
    }
    throw e;
  }
});

// POST /themes/:slug/films — add film to any theme
themesRouter.post('/:slug/films', async (req, res) => {
  const { slug } = req.params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }
  const { tmdbId, status } = req.body as { tmdbId: number; status: FilmStatus };
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'status must be nominated, shortlisted, or selected' });
  }
  const theme = await storage.readAnyTheme(slug);
  if (!theme) return res.status(404).json({ error: 'Theme not found' });
  if (theme.films.some((f) => f.film.tmdbId === tmdbId)) {
    return res.status(409).json({ error: 'Film already in theme' });
  }
  const film = await getFilmDetails(tmdbId);
  const entry: ThemeFilm = { film, status };
  await storage.writeAnyTheme({ ...theme, films: [...theme.films, entry] });
  res.json(entry);
});

// PATCH /themes/:slug/films/:tmdbId/status — update film status in any theme
themesRouter.patch('/:slug/films/:tmdbId/status', async (req, res) => {
  const { slug } = req.params;
  const tmdbId = parseInt(req.params.tmdbId);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }
  const { status } = req.body as { status: FilmStatus };
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'status must be nominated, shortlisted, or selected' });
  }
  const theme = await storage.readAnyTheme(slug);
  if (!theme) return res.status(404).json({ error: 'Theme not found' });
  const updated = { ...theme, films: theme.films.map((f) => f.film.tmdbId === tmdbId ? { ...f, status } : f) };
  await storage.writeAnyTheme(updated);
  res.json(updated);
});

// DELETE /themes/:slug/films/:tmdbId — remove film from any theme
themesRouter.delete('/:slug/films/:tmdbId', async (req, res) => {
  const { slug } = req.params;
  const tmdbId = parseInt(req.params.tmdbId);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }
  const theme = await storage.readAnyTheme(slug);
  if (!theme) return res.status(404).json({ error: 'Theme not found' });
  const updated = { ...theme, films: theme.films.filter((f) => f.film.tmdbId !== tmdbId) };
  await storage.writeAnyTheme(updated);
  res.json(updated);
});
