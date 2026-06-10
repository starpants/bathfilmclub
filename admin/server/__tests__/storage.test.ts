import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import type { Theme } from '@bathfilmclub/types';

const sampleTheme: Theme = {
  slug: '2026-06-test',
  title: 'Test Theme',
  month: '2026-06',
  films: [],
};

describe('storage', () => {
  let tmpDir: string;
  let storage: ReturnType<typeof import('../storage.js')['createStorage']>;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'bfc-test-'));
    await mkdir(path.join(tmpDir, 'themes'));
    // Import storage fresh, passing tmpDir directly
    const { createStorage } = await import('../storage.js');
    storage = createStorage(tmpDir);
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe('readCurrentCycle', () => {
    it('returns null when current.json does not exist', async () => {
      expect(await storage.readCurrentCycle()).toBeNull();
    });

    it('returns parsed theme when current.json exists', async () => {
      await writeFile(path.join(tmpDir, 'current.json'), JSON.stringify(sampleTheme));
      const result = await storage.readCurrentCycle();
      expect(result?.slug).toBe('2026-06-test');
    });
  });

  describe('writeCurrentCycle', () => {
    it('writes theme as pretty-printed JSON', async () => {
      await storage.writeCurrentCycle(sampleTheme);
      const { readFile } = await import('fs/promises');
      const raw = await readFile(path.join(tmpDir, 'current.json'), 'utf-8');
      expect(raw).toContain('\n');
      expect(JSON.parse(raw).slug).toBe('2026-06-test');
    });

    it('writes null to clear the current cycle', async () => {
      await storage.writeCurrentCycle(null);
      const { readFile } = await import('fs/promises');
      const raw = await readFile(path.join(tmpDir, 'current.json'), 'utf-8');
      expect(JSON.parse(raw)).toBeNull();
    });
  });

  describe('writeTheme + readAllThemes', () => {
    it('persists a theme and reads it back', async () => {
      await storage.writeTheme(sampleTheme);
      const themes = await storage.readAllThemes();
      expect(themes).toHaveLength(1);
      expect(themes[0].slug).toBe('2026-06-test');
    });

    it('returns themes sorted newest first by month', async () => {
      await storage.writeTheme({ ...sampleTheme, slug: '2025-01-old', month: '2025-01', title: 'Old', films: [] });
      await storage.writeTheme({ ...sampleTheme, slug: '2026-06-new', month: '2026-06', title: 'New', films: [] });
      const themes = await storage.readAllThemes();
      expect(themes[0].month).toBe('2026-06');
      expect(themes[1].month).toBe('2025-01');
    });
  });

  describe('archiveCurrentCycle', () => {
    it('moves current cycle to themes dir and clears current.json', async () => {
      await storage.writeCurrentCycle(sampleTheme);
      await storage.archiveCurrentCycle();
      expect(await storage.readCurrentCycle()).toBeNull();
      const themes = await storage.readAllThemes();
      expect(themes[0].slug).toBe('2026-06-test');
    });

    it('throws if no current cycle', async () => {
      await expect(storage.archiveCurrentCycle()).rejects.toThrow('No current cycle');
    });
  });
});
