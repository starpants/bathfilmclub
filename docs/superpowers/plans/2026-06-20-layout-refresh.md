# Layout Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the archive page to a search page with a poster-grid empty state, add short month prefixes to ThemeDrawer links, and replace the "Back to Archive" footer on theme pages with chronological prev/next navigation.

**Architecture:** Four sequential tasks. Tasks 1 (ThemeDrawer) and 2 (prev/next) are independent component edits and can be done in any order. Task 3 creates the new SearchPage React component. Task 4 wires it into a new `search.astro`, updates the header icon, and deletes the old archive files. Tasks 3 → 4 must be done in sequence.

**Tech Stack:** Astro 4, React 18 (TSX), Tailwind CSS, TypeScript, `@bathfilmclub/types`

## Global Constraints

- No new npm dependencies
- TypeScript must pass `cd site && npx tsc --noEmit` with no new errors after each task
- All Tailwind classes must be from the existing design system

---

## File Map

| File | Action |
|---|---|
| `site/src/components/ThemeDrawer.tsx` | Modify — add short month prefix to each theme link |
| `site/src/pages/theme/[slug].astro` | Modify — replace "Back to Archive" row with prev/next nav |
| `site/src/components/SearchPage.tsx` | Create — poster-grid empty state + search results |
| `site/src/pages/search.astro` | Create — new search page at `/search` |
| `site/src/components/Header.astro` | Modify — replace Archive text link with magnifying glass icon to `/search` |
| `site/src/pages/archive.astro` | Delete |
| `site/src/components/ArchiveList.tsx` | Delete |

---

## Task 1: ThemeDrawer — add short month prefix to theme links

**Files:**
- Modify: `site/src/components/ThemeDrawer.tsx`

- [ ] **Step 1: Add a `shortMonth` helper before the component**

Open `site/src/components/ThemeDrawer.tsx`. Add this function above the `export function ThemeDrawer` line:

```tsx
function shortMonth(month: string): string {
  const [year, m] = month.split('-');
  return new Date(parseInt(year!), parseInt(m!) - 1, 1)
    .toLocaleDateString('en-GB', { month: 'short' });
}
```

- [ ] **Step 2: Update the theme link to show the month prefix**

Find the `<a>` element inside `byYear[year]?.map(...)` — currently line 84–89. Change the link body from `{t.title}` to:

```tsx
<a
  href={`/theme/${t.slug}`}
  className={`block font-body text-sm text-neutral-400 interactive-item${t.slug === currentSlug ? ' active' : ''}`}
>
  {shortMonth(t.month)} – {t.title}
</a>
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd site && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add site/src/components/ThemeDrawer.tsx
git commit -m "feat: add short month prefix to ThemeDrawer theme links"
```

---

## Task 2: Theme page — prev/next navigation

**Files:**
- Modify: `site/src/pages/theme/[slug].astro`

**Ordering note:** `getAllThemes()` returns themes sorted newest first. For the current theme at index `i`:
- Left arrow ← (older): `themes[i + 1]` — absent when `i === themes.length - 1` (oldest theme)
- Right arrow → (newer): `themes[i - 1]` — absent when `i === 0` (newest theme)

Empty `<span />` placeholders keep the title visually centred with `justify-between` when one arrow is absent.

- [ ] **Step 1: Derive prev/next in the frontmatter**

In the `---` block of `site/src/pages/theme/[slug].astro`, add these three lines immediately after `const allThemes = await getAllThemes();`:

```ts
const currentIndex = allThemes.findIndex((t) => t.slug === theme.slug);
const olderTheme = allThemes[currentIndex + 1] ?? null;
const newerTheme = allThemes[currentIndex - 1] ?? null;
```

- [ ] **Step 2: Replace the "Back to Archive" footer with the nav row**

Find and replace this block in the template (currently the last `<div>` inside `<main>`):

```astro
<div class="flex gap-4 pt-4 border-t border-neutral-600">
  <a href="/archive" class="font-body text-sm text-neutral-400 hover:text-brand-red transition-colors">
    ← Back to Archive
  </a>
</div>
```

Replace with:

```astro
<div class="flex justify-between items-center pt-4 border-t border-neutral-600">
  {olderTheme ? (
    <a
      href={`/theme/${olderTheme.slug}`}
      class="font-heading font-semibold text-sm text-neutral-400 hover:text-white transition-colors"
      aria-label={`Older theme: ${olderTheme.title}`}
    >
      ←
    </a>
  ) : (
    <span />
  )}
  <span class="font-heading text-sm text-neutral-400">{theme.title}</span>
  {newerTheme ? (
    <a
      href={`/theme/${newerTheme.slug}`}
      class="font-heading font-semibold text-sm text-neutral-400 hover:text-white transition-colors"
      aria-label={`Newer theme: ${newerTheme.title}`}
    >
      →
    </a>
  ) : (
    <span />
  )}
</div>
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd site && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Build to confirm all static theme pages generate cleanly**

```bash
cd site && npm run build
```

Expected: build completes with no errors.

- [ ] **Step 5: Commit**

```bash
git add site/src/pages/theme/[slug].astro
git commit -m "feat: add prev/next theme navigation to theme detail page"
```

---

## Task 3: Create SearchPage component

**Files:**
- Create: `site/src/components/SearchPage.tsx`

**Empty state (query < 2 chars):**
- Stats line: "{n} themes · {m} films selected · Since {year}"
- Poster grid of all `status === 'selected'` films across all themes, each poster linking to its theme page

**Search state (query ≥ 2 chars):** Searches film title, director, and theme title. Shows result rows with film, theme link, director, month, and status — identical behaviour to the existing `ArchiveList`.

- [ ] **Step 1: Create `site/src/components/SearchPage.tsx`**

```tsx
import { useState, useMemo } from 'react';
import type { Theme } from '@bathfilmclub/types';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

interface Props {
  themes: Theme[];
}

function normalise(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9 ]/g, '');
}

function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  return new Date(parseInt(year!), parseInt(m!) - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

interface SearchResult {
  filmTitle: string;
  director: string;
  themeTitle: string;
  month: string;
  slug: string;
  status: string;
}

export function SearchPage({ themes }: Props) {
  const [query, setQuery] = useState('');

  const selectedFilms = useMemo(() =>
    themes.flatMap((t) =>
      t.films
        .filter((f) => f.status === 'selected')
        .map((f) => ({ film: f.film, slug: t.slug, themeTitle: t.title }))
    ), [themes]);

  const sinceYear = themes[themes.length - 1]?.month.split('-')[0] ?? '';

  const searchResults = useMemo<SearchResult[]>(() => {
    if (query.trim().length < 2) return [];
    const q = normalise(query);
    const results: SearchResult[] = [];
    for (const theme of themes) {
      if (normalise(theme.title).includes(q)) {
        results.push({
          filmTitle: '—',
          director: '—',
          themeTitle: theme.title,
          month: theme.month,
          slug: theme.slug,
          status: 'Theme',
        });
      }
      for (const { film, status } of theme.films) {
        if (normalise(film.title).includes(q) || normalise(film.director).includes(q)) {
          results.push({
            filmTitle: film.title,
            director: film.director,
            themeTitle: theme.title,
            month: theme.month,
            slug: theme.slug,
            status: status.charAt(0).toUpperCase() + status.slice(1),
          });
        }
      }
    }
    return results;
  }, [query, themes]);

  const isSearching = query.trim().length >= 2;

  return (
    <div className="space-y-8">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by film, director, or theme…"
        className="w-full border border-neutral-700 bg-transparent px-4 py-3 font-body text-sm focus:outline-none focus:border-white placeholder:text-neutral-500"
      />

      {isSearching ? (
        <div className="space-y-2">
          <p className="section-label">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </p>
          {searchResults.length === 0 ? (
            <p className="font-body text-sm text-neutral-400 italic">No results found.</p>
          ) : (
            <ul className="divide-y divide-neutral-800">
              {searchResults.map((r, i) => (
                <li key={i} className="py-4">
                  {r.filmTitle !== '—' && (
                    <p className="font-heading font-semibold text-base">{r.filmTitle}</p>
                  )}
                  <p className="font-body text-sm text-neutral-400">
                    Theme:{' '}
                    <a href={`/theme/${r.slug}`} className="text-white interactive-item">
                      {r.themeTitle}
                    </a>
                  </p>
                  {r.director !== '—' && (
                    <p className="font-body text-sm text-neutral-400">Director: {r.director}</p>
                  )}
                  <p className="font-body text-xs text-neutral-400 mt-1">
                    {formatMonth(r.month)} · {r.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <p className="font-body text-sm text-neutral-400">
            {themes.length} themes · {selectedFilms.length} films selected · Since {sinceYear}
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
            {selectedFilms.map(({ film, slug, themeTitle }) => (
              <a
                key={`${slug}-${film.tmdbId}`}
                href={`/theme/${slug}`}
                title={`${film.title} — ${themeTitle}`}
              >
                <div className="aspect-[2/3] overflow-hidden bg-neutral-800">
                  {film.posterPath ? (
                    <img
                      src={`${TMDB_IMAGE_BASE}${film.posterPath}`}
                      alt={film.title}
                      className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800" />
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd site && npx tsc --noEmit
```

Expected: no errors referencing `SearchPage.tsx`.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/SearchPage.tsx
git commit -m "feat: create SearchPage component with poster-grid empty state"
```

---

## Task 4: Create search.astro, update header, delete old files

**Files:**
- Create: `site/src/pages/search.astro`
- Modify: `site/src/components/Header.astro`
- Delete: `site/src/pages/archive.astro`
- Delete: `site/src/components/ArchiveList.tsx`

- [ ] **Step 1: Create `site/src/pages/search.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import { SearchPage } from '../components/SearchPage';
import { getAllThemes } from '../utils/data';

const themes = await getAllThemes();
---
<Layout title="Search">
  <Header />
  <main class="max-w-site mx-auto px-6 py-16">
    <div class="mb-12">
      <h1 class="section-label mb-4">Search</h1>
      <p class="font-heading font-bold text-4xl">Films & Themes</p>
    </div>
    <SearchPage themes={themes} client:load />
  </main>
</Layout>
```

- [ ] **Step 2: Replace `site/src/components/Header.astro` with the updated version**

The Archive text link is removed from the mapped array and replaced with a standalone magnifying glass icon link. The `Home` link remains as a mapped item for consistency.

```astro
---
import { ThemeDrawer } from './ThemeDrawer';
import type { Theme } from '@bathfilmclub/types';

interface Props {
  themes?: Theme[];
  currentSlug?: string;
}

const { themes, currentSlug } = Astro.props;
const isSearch = Astro.url.pathname === '/search';
---
<header class="border-b border-neutral-600">
  <div class="max-w-site mx-auto px-6 h-16 flex items-center justify-end">
    <nav class="flex items-center gap-4">
      {themes && currentSlug && (
        <ThemeDrawer themes={themes} currentSlug={currentSlug} client:load />
      )}
      <a
        href="/"
        class:list={[
          'font-heading font-semibold text-sm uppercase tracking-wide text-white interactive-item',
          { active: Astro.url.pathname === '/' },
        ]}
      >
        Home
      </a>
      <a
        href="/search"
        class:list={['text-white interactive-item flex items-center', { active: isSearch }]}
        aria-label="Search films and themes"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="7.5" cy="7.5" r="5.5" />
          <path d="M13 13l3 3" />
        </svg>
      </a>
    </nav>
  </div>
</header>
```

- [ ] **Step 3: Delete the old archive files**

```bash
git rm site/src/pages/archive.astro site/src/components/ArchiveList.tsx
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd site && npx tsc --noEmit
```

Expected: no errors. No lingering imports of `ArchiveList` or references to `/archive`.

- [ ] **Step 5: Build**

```bash
cd site && npm run build
```

Expected: build completes. `/search` route is generated. No 404 for removed `/archive`.

- [ ] **Step 6: Commit**

```bash
git add site/src/pages/search.astro site/src/components/Header.astro
git commit -m "feat: replace archive page with search, update header nav to magnifying glass"
```

---

## Smoke Test Checklist

Run `cd site && npm run dev` and verify:

- [ ] `/` — Header shows Home (active) + magnifying glass. No Archive link. No Browse button.
- [ ] `/search` — Magnifying glass icon is active state. Poster grid of selected films visible on load with no query. Stats line reads "{n} themes · {m} films selected · Since {year}". Typing ≥ 2 chars shows search results. Typing a film title, director name, and theme title each return the expected results.
- [ ] `/theme/[any-slug]` — Header shows Browse + Home + magnifying glass. ThemeDrawer links read "Jun – Favourite Films" format. Prev/next row at bottom shows `← [current title] →`. On the oldest theme in the archive, the ← arrow is absent. On the newest archived theme, the → arrow is absent.
- [ ] No broken links to `/archive` remain anywhere in the site.
