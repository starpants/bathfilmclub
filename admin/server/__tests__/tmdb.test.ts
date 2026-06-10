import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('TMDb client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.TMDB_API_KEY = 'test-key';
  });

  describe('searchFilms', () => {
    it('returns up to 10 results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            title: `Film ${i + 1}`,
            release_date: '2024-01-01',
            poster_path: `/poster-${i}.jpg`,
            overview: 'A film.',
          })),
        }),
      });
      const { searchFilms } = await import('../tmdb.js');
      const results = await searchFilms('test');
      expect(results).toHaveLength(10);
    });

    it('includes api_key in the request URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      });
      const { searchFilms } = await import('../tmdb.js');
      await searchFilms('blade runner');
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain('api_key=test-key');
      expect(url).toContain('blade+runner');
    });

    it('throws on non-ok TMDb response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
      const { searchFilms } = await import('../tmdb.js');
      await expect(searchFilms('test')).rejects.toThrow('TMDb error: 401');
    });
  });

  describe('getFilmDetails', () => {
    it('maps TMDb response to Film interface', async () => {
      const detailsResponse = {
        title: 'Blade Runner 2049',
        release_date: '2017-10-06',
        runtime: 164,
        genres: [{ id: 878, name: 'Science Fiction' }],
        overview: 'A young blade runner discovers a secret.',
        poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
        backdrop_path: '/ilRyazdMfOqyYkuFeDNAFt93-X4.jpg',
        vote_average: 7.5,
      };
      const creditsResponse = {
        crew: [
          { job: 'Director', name: 'Denis Villeneuve' },
          { job: 'Producer', name: 'Andrew A. Kosove' },
          { job: 'Producer', name: 'Broderick Johnson' },
        ],
        cast: [
          { name: 'Ryan Gosling', order: 0 },
          { name: 'Harrison Ford', order: 1 },
        ],
      };
      const videosResponse = {
        results: [{ type: 'Trailer', site: 'YouTube', key: 'gD6cutOB60k' }],
      };

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(detailsResponse) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(creditsResponse) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(videosResponse) });

      const { getFilmDetails } = await import('../tmdb.js');
      const film = await getFilmDetails(335984);

      expect(film.title).toBe('Blade Runner 2049');
      expect(film.year).toBe(2017);
      expect(film.runtime).toBe(164);
      expect(film.director).toBe('Denis Villeneuve');
      expect(film.producers).toEqual(['Andrew A. Kosove', 'Broderick Johnson']);
      expect(film.cast).toEqual(['Ryan Gosling', 'Harrison Ford']);
      expect(film.genres).toEqual(['Science Fiction']);
      expect(film.rating).toBe(7.5);
      expect(film.trailerKey).toBe('gD6cutOB60k');
      expect(film.posterPath).toBe('/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg');
    });
  });
});
