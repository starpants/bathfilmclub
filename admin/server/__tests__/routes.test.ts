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
    readTheme: vi.fn().mockResolvedValue(theme),
    readAnyTheme: vi.fn().mockResolvedValue(theme),
    writeTheme: vi.fn().mockResolvedValue(undefined),
    writeAnyTheme: vi.fn().mockResolvedValue(undefined),
    deleteTheme: vi.fn().mockResolvedValue(undefined),
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

  it('PUT /api/themes/:slug updates an existing theme', async () => {
    const res = await request(app)
      .put('/api/themes/2026-06-test')
      .send({ title: 'Updated', month: '2026-07', films: [] });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
  });

  it('PUT /api/themes/:slug returns 404 for a theme that does not exist', async () => {
    const { storage } = await import('../storage.js');
    vi.mocked(storage.readAnyTheme).mockResolvedValueOnce(null);
    const res = await request(app)
      .put('/api/themes/2099-01-nope')
      .send({ title: 'Nope', month: '2099-01' });
    expect(res.status).toBe(404);
  });

  it('POST /api/themes/archive archives the cycle', async () => {
    const res = await request(app).post('/api/themes/archive');
    expect(res.status).toBe(200);
  });

  it('GET /api/themes returns themes plus the current slug', async () => {
    const res = await request(app).get('/api/themes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.themes)).toBe(true);
    expect(res.body).toHaveProperty('currentSlug');
  });

  it('POST /api/films adds a film to the current cycle', async () => {
    const res = await request(app)
      .post('/api/films')
      .send({ tmdbId: 603, status: 'nominated' });
    expect(res.status).toBe(200);
  });

  it('POST /api/films returns 409 if film already in cycle', async () => {
    const { storage } = await import('../storage.js');
    vi.mocked(storage.readCurrentCycle).mockResolvedValueOnce({
      ...theme,
      films: [{ film: { tmdbId: 603, title: 'The Matrix', year: 1999, runtime: 136, genres: [], synopsis: '', director: '', producers: [], cast: [], posterPath: '' }, status: 'nominated' as const }],
    });
    const res = await request(app).post('/api/films').send({ tmdbId: 603, status: 'nominated' });
    expect(res.status).toBe(409);
  });

  it('PATCH /api/films/:tmdbId/status returns 404 if no active cycle', async () => {
    const { storage } = await import('../storage.js');
    vi.mocked(storage.readCurrentCycle).mockResolvedValueOnce(null);
    const res = await request(app).patch('/api/films/603/status').send({ status: 'shortlisted' });
    expect(res.status).toBe(404);
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

describe('PATCH /api/themes/:slug/films/:tmdbId/rating', () => {
  let app: typeof import('../index.js')['app'];

  const film = (tmdbId: number) => ({
    tmdbId, title: `Film ${tmdbId}`, year: 2000, runtime: 100, genres: [], synopsis: '',
    director: '', producers: [], cast: [], posterPath: '',
  });

  const ratedTheme = (rating?: 1 | 2 | 3 | 4 | 5): Theme => ({
    ...theme,
    films: [
      { film: film(603), status: 'selected', ...(rating ? { clubRating: rating } : {}) },
      { film: film(604), status: 'nominated' },
    ],
  });

  async function mockTheme(t: Theme) {
    const { storage } = await import('../storage.js');
    vi.mocked(storage.readAnyTheme).mockResolvedValueOnce(t);
    return storage;
  }

  function writtenEntry(storage: Awaited<ReturnType<typeof mockTheme>>, tmdbId: number) {
    const written = vi.mocked(storage.writeAnyTheme).mock.calls[0]![0];
    return written.films.find((f) => f.film.tmdbId === tmdbId)!;
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    // clearAllMocks keeps queued *Once values; a test that rejects before reading
    // would otherwise leak its theme into the next test.
    const { storage } = await import('../storage.js');
    vi.mocked(storage.readAnyTheme).mockReset().mockResolvedValue(theme);
    app = (await import('../index.js')).app;
  });

  it('sets a rating on a selected film', async () => {
    const storage = await mockTheme(ratedTheme());
    const res = await request(app).patch('/api/themes/2026-06-test/films/603/rating').send({ clubRating: 4 });
    expect(res.status).toBe(200);
    expect(writtenEntry(storage, 603).clubRating).toBe(4);
  });

  it('clears with null, leaving no clubRating key', async () => {
    const storage = await mockTheme(ratedTheme(3));
    const res = await request(app).patch('/api/themes/2026-06-test/films/603/rating').send({ clubRating: null });
    expect(res.status).toBe(200);
    expect('clubRating' in writtenEntry(storage, 603)).toBe(false);
  });

  it.each([0, 6, 3.5, '4', undefined])('rejects invalid value %s', async (value) => {
    const storage = await mockTheme(ratedTheme());
    const res = await request(app).patch('/api/themes/2026-06-test/films/603/rating').send({ clubRating: value });
    expect(res.status).toBe(400);
    expect(storage.writeAnyTheme).not.toHaveBeenCalled();
  });

  it('rejects rating a film that is not selected', async () => {
    const storage = await mockTheme(ratedTheme());
    const res = await request(app).patch('/api/themes/2026-06-test/films/604/rating').send({ clubRating: 4 });
    expect(res.status).toBe(409);
    expect(storage.writeAnyTheme).not.toHaveBeenCalled();
  });

  it('returns 404 for a film not in the theme', async () => {
    await mockTheme(ratedTheme());
    const res = await request(app).patch('/api/themes/2026-06-test/films/999/rating').send({ clubRating: 4 });
    expect(res.status).toBe(404);
  });

  it('rejects an invalid slug', async () => {
    const res = await request(app).patch('/api/themes/Bad_Slug/films/603/rating').send({ clubRating: 4 });
    expect(res.status).toBe(400);
  });

  it('status PATCH preserves clubRating', async () => {
    const storage = await mockTheme(ratedTheme(4));
    const res = await request(app).patch('/api/themes/2026-06-test/films/603/status').send({ status: 'shortlisted' });
    expect(res.status).toBe(200);
    expect(writtenEntry(storage, 603)).toMatchObject({ status: 'shortlisted', clubRating: 4 });
  });
});
