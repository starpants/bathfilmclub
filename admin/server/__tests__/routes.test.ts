import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import type { Theme } from '@bathfilmclub/types';

const theme: Theme = {
  slug: '2026-06-test',
  title: 'Test Theme',
  month: '2026-06',
  films: [],
};

vi.mock('../storage.js', () => ({
  storage: {
    readCurrentCycle: vi.fn().mockResolvedValue(theme),
    writeCurrentCycle: vi.fn().mockResolvedValue(undefined),
    readAllThemes: vi.fn().mockResolvedValue([theme]),
    writeTheme: vi.fn().mockResolvedValue(undefined),
    archiveCurrentCycle: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../tmdb.js', () => ({
  searchFilms: vi.fn().mockResolvedValue([
    { id: 603, title: 'The Matrix', release_date: '1999-03-30', poster_path: '/poster.jpg', overview: 'A film.' },
  ]),
  getFilmDetails: vi.fn().mockResolvedValue({
    tmdbId: 603, title: 'The Matrix', year: 1999, runtime: 136,
    genres: ['Action'], synopsis: 'A film.', director: 'Lana Wachowski',
    producers: [], cast: [], posterPath: '/poster.jpg',
  }),
}));

describe('API routes', () => {
  let app: typeof import('../index.js')['app'];

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('../index.js');
    app = mod.app;
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('GET /api/themes/current returns the current cycle', async () => {
    const res = await request(app).get('/api/themes/current');
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('2026-06-test');
  });

  it('PUT /api/themes/current updates the cycle', async () => {
    const res = await request(app)
      .put('/api/themes/current')
      .send({ title: 'Updated', month: '2026-07', films: [] });
    expect(res.status).toBe(200);
  });

  it('PUT /api/themes/current rejects missing fields', async () => {
    const res = await request(app)
      .put('/api/themes/current')
      .send({ title: 'No month' });
    expect(res.status).toBe(400);
  });

  it('POST /api/themes/archive archives the cycle', async () => {
    const res = await request(app).post('/api/themes/archive');
    expect(res.status).toBe(200);
  });

  it('GET /api/themes returns all archived themes', async () => {
    const res = await request(app).get('/api/themes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/films adds a film to the current cycle', async () => {
    const res = await request(app)
      .post('/api/films')
      .send({ tmdbId: 603, status: 'nominated' });
    expect(res.status).toBe(200);
  });

  it('POST /api/films rejects invalid status', async () => {
    const res = await request(app)
      .post('/api/films')
      .send({ tmdbId: 603, status: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/films/:tmdbId/status updates film status', async () => {
    const res = await request(app)
      .patch('/api/films/603/status')
      .send({ status: 'shortlisted' });
    expect(res.status).toBe(200);
  });

  it('DELETE /api/films/:tmdbId removes a film', async () => {
    const res = await request(app).delete('/api/films/603');
    expect(res.status).toBe(200);
  });

  it('GET /api/search returns TMDb results', async () => {
    const res = await request(app).get('/api/search?q=matrix');
    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe('The Matrix');
  });

  it('GET /api/search requires q parameter', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(400);
  });
});
