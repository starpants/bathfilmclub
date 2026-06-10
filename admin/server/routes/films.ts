import { Router } from 'express';
import { storage } from '../storage.js';
import { getFilmDetails } from '../tmdb.js';
import type { FilmStatus, ThemeFilm } from '@bathfilmclub/types';

const VALID_STATUSES: FilmStatus[] = ['nominated', 'shortlisted', 'selected'];

export const filmsRouter = Router();

filmsRouter.post('/', async (req, res) => {
  const { tmdbId, status } = req.body as { tmdbId: number; status: FilmStatus };
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'status must be nominated, shortlisted, or selected' });
  }
  const current = await storage.readCurrentCycle();
  if (!current) return res.status(404).json({ error: 'No active cycle' });
  if (current.films.some((f) => f.film.tmdbId === tmdbId)) {
    return res.status(409).json({ error: 'Film already in cycle' });
  }
  const film = await getFilmDetails(tmdbId);
  const entry: ThemeFilm = { film, status };
  await storage.writeCurrentCycle({ ...current, films: [...current.films, entry] });
  res.json(entry);
});

filmsRouter.patch('/:tmdbId/status', async (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);
  const { status } = req.body as { status: FilmStatus };
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'status must be nominated, shortlisted, or selected' });
  }
  const current = await storage.readCurrentCycle();
  if (!current) return res.status(404).json({ error: 'No active cycle' });
  const updated = {
    ...current,
    films: current.films.map((f) =>
      f.film.tmdbId === tmdbId ? { ...f, status } : f
    ),
  };
  await storage.writeCurrentCycle(updated);
  res.json(updated);
});

filmsRouter.delete('/:tmdbId', async (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);
  const current = await storage.readCurrentCycle();
  if (!current) return res.status(404).json({ error: 'No active cycle' });
  const updated = { ...current, films: current.films.filter((f) => f.film.tmdbId !== tmdbId) };
  await storage.writeCurrentCycle(updated);
  res.json(updated);
});
