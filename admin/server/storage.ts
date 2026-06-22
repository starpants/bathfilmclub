import { readFile, writeFile, readdir, mkdir, rm } from 'fs/promises';
import path from 'path';
import type { Theme } from '@bathfilmclub/types';

export interface Storage {
  readCurrentCycle(): Promise<Theme | null>;
  writeCurrentCycle(theme: Theme | null): Promise<void>;
  readAllThemes(): Promise<Theme[]>;
  readTheme(slug: string): Promise<Theme | null>;
  readAnyTheme(slug: string): Promise<Theme | null>;
  writeTheme(theme: Theme): Promise<void>;
  writeAnyTheme(theme: Theme): Promise<void>;
  deleteTheme(slug: string): Promise<void>;
  archiveCurrentCycle(): Promise<void>;
}

export function createStorage(dataDir: string): Storage {
  const currentPath = () => path.join(dataDir, 'current.json');
  const themePath = (slug: string) => path.join(dataDir, 'themes', `${slug}.json`);
  const themesDir = () => path.join(dataDir, 'themes');

  const validateSlug = (slug: string) => {
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error('Invalid theme slug');
    }
  };

  return {
    async readCurrentCycle() {
      try {
        const raw = await readFile(currentPath(), 'utf-8');
        return JSON.parse(raw) as Theme | null;
      } catch {
        return null;
      }
    },

    async writeCurrentCycle(theme) {
      await writeFile(currentPath(), JSON.stringify(theme, null, 2));
    },

    async readAllThemes() {
      try {
        const files = await readdir(themesDir());
        const themes = await Promise.all(
          files
            .filter((f) => f.endsWith('.json'))
            .map(async (f) => {
              const raw = await readFile(path.join(themesDir(), f), 'utf-8');
              return JSON.parse(raw) as Theme;
            })
        );
        return themes.sort((a, b) => b.month.localeCompare(a.month));
      } catch {
        return [];
      }
    },

    async readTheme(slug) {
      validateSlug(slug);
      try {
        const raw = await readFile(themePath(slug), 'utf-8');
        return JSON.parse(raw) as Theme;
      } catch {
        return null;
      }
    },

    async readAnyTheme(slug) {
      validateSlug(slug);
      const current = await this.readCurrentCycle();
      if (current?.slug === slug) return current;
      return this.readTheme(slug);
    },

    async writeTheme(theme) {
      await mkdir(themesDir(), { recursive: true });
      await writeFile(themePath(theme.slug), JSON.stringify(theme, null, 2));
    },

    async writeAnyTheme(theme) {
      const current = await this.readCurrentCycle();
      if (current?.slug === theme.slug) {
        await this.writeCurrentCycle(theme);
      } else {
        await this.writeTheme(theme);
      }
    },

    async deleteTheme(slug) {
      validateSlug(slug);
      await rm(themePath(slug));
    },

    async archiveCurrentCycle() {
      const current = await this.readCurrentCycle();
      if (!current) throw new Error('No current cycle to archive');
      await this.writeTheme(current);
      await this.writeCurrentCycle(null);
    },
  };
}

export const storage = createStorage(
  process.env.DATA_DIR ?? path.join(path.dirname(new URL(import.meta.url).pathname), '../../site/src/data')
);
