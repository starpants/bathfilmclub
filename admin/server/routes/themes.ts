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

themesRouter.post('/archive', async (_req, res) => {
  await storage.archiveCurrentCycle();
  res.json({ ok: true });
});

themesRouter.get('/', async (_req, res) => {
  const themes = await storage.readAllThemes();
  res.json(themes);
});
