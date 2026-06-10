import { Router } from 'express';
import { searchFilms } from '../tmdb.js';

export const searchRouter = Router();

searchRouter.get('/', async (req, res) => {
  const q = req.query.q as string | undefined;
  if (!q?.trim()) {
    return res.status(400).json({ error: 'q parameter required' });
  }
  const results = await searchFilms(q);
  res.json(results);
});
