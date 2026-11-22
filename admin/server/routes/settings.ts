import { Router } from 'express';
import { storage } from '../storage.js';
import type { SiteSettings } from '@bathfilmclub/types';

export const settingsRouter = Router();

// GET /settings — site-wide settings
settingsRouter.get('/', async (_req, res) => {
  const settings = await storage.readSettings();
  res.json(settings);
});

// PUT /settings — update site-wide settings (only known fields are persisted)
settingsRouter.put('/', async (req, res) => {
  const { yearInReview } = (req.body ?? {}) as Partial<SiteSettings>;
  if (typeof yearInReview !== 'boolean') {
    return res.status(400).json({ error: 'yearInReview must be a boolean' });
  }
  const settings: SiteSettings = { yearInReview };
  await storage.writeSettings(settings);
  res.json(settings);
});
