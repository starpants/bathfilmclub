import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { themesRouter } from './routes/themes.js';
import { filmsRouter } from './routes/films.js';
import { searchRouter } from './routes/search.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/themes', themesRouter);
app.use('/api/films', filmsRouter);
app.use('/api/search', searchRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Admin server running at http://localhost:${PORT}`);
  });
}

export { app };
