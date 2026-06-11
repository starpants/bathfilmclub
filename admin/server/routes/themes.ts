import { Router } from 'express';
import { storage } from '../storage.js';
import type { Theme } from '@bathfilmclub/types';

export const themesRouter = Router();

themesRouter.get('/current', async (_req, res) => {
  const cycle = await storage.readCurrentCycle();
  res.json(cycle);
});

themesRouter.put('/current', async (req, res) => {
  const { title, description, month, meeting, films } = req.body as Partial<Theme>;
  if (!title || !month || !films) {
    return res.status(400).json({ error: 'title, month, and films are required' });
  }
  const current = await storage.readCurrentCycle();
  const slug = current?.slug ?? `${month}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  const updated: Theme = {
    slug,
    title: title!,
    description: description || undefined,
    month: month!,
    meeting: meeting ?? undefined,
    films: films!,
  };
  await storage.writeCurrentCycle(updated);
  res.json(updated);
});

themesRouter.post('/new', async (req, res) => {
  const { title, month } = req.body as { title?: string; month?: string };
  if (!title || !month) {
    return res.status(400).json({ error: 'title and month are required' });
  }

  const slug = `${month}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  const newTheme: Theme = {
    slug,
    title,
    month,
    films: [],
  };

  await storage.writeCurrentCycle(newTheme);
  res.json(newTheme);
});

themesRouter.post('/archive', async (_req, res) => {
  await storage.archiveCurrentCycle();
  res.json({ ok: true });
});

themesRouter.get('/', async (_req, res) => {
  const themes = await storage.readAllThemes();
  res.json(themes);
});

themesRouter.put('/:slug', async (req, res) => {
  const { slug } = req.params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }
  const { title, description, month, meeting, films } = req.body as Partial<Theme>;

  const existing = await storage.readTheme(slug);
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

  await storage.writeTheme(updated);
  res.json(updated);
});

themesRouter.post('/:slug/restore', async (req, res) => {
  const { slug } = req.params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }
  const theme = await storage.readTheme(slug);

  if (!theme) {
    return res.status(404).json({ error: 'Theme not found' });
  }

  await storage.writeCurrentCycle(theme);
  res.json(theme);
});

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
