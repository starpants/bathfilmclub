# Theme Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two-column sidebar layout on theme detail pages with a left-side drawer triggered from the header.

**Architecture:** A new `ThemeDrawer.tsx` React island renders both its own trigger button and the slide-in panel, keeping state self-contained. `Header.astro` accepts optional `themes`/`currentSlug` props and renders the island when provided. `[slug].astro` drops its sidebar column and passes theme data to the header.

**Tech Stack:** React 18 (TSX), Astro 4, Tailwind CSS, TypeScript, `@bathfilmclub/types`

---

## File Map

| File | Action |
|---|---|
| `site/src/components/ThemeDrawer.tsx` | **Create** — self-contained trigger + left drawer |
| `site/src/components/Header.astro` | **Modify** — accept optional `themes` + `currentSlug` props |
| `site/src/pages/theme/[slug].astro` | **Modify** — remove sidebar, single-column layout, pass themes to header |

---

## Task 1: Create `ThemeDrawer.tsx`

**Files:**
- Create: `site/src/components/ThemeDrawer.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState, useEffect } from 'react';
import type { Theme } from '@bathfilmclub/types';

interface Props {
  themes: Theme[];
  currentSlug: string;
}

export function ThemeDrawer({ themes, currentSlug }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Group themes by year, descending
  const byYear = themes.reduce<Record<string, Theme[]>>((acc, t) => {
    const year = t.month.split('-')[0] as string;
    if (!acc[year]) acc[year] = [];
    acc[year].push(t);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => parseInt(b) - parseInt(a));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="font-heading font-semibold text-sm uppercase tracking-wide text-white interactive-item"
        aria-label="Browse themes"
      >
        Browse
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-brand-black border-r border-neutral-800 z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Browse themes"
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 hover:text-brand-red transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        </button>

        {/* Theme list */}
        <nav className="p-6 pt-14 space-y-6">
          {years.map((year) => (
            <div key={year}>
              <p className="font-heading font-bold text-xs uppercase tracking-widest text-neutral-400 mb-2">
                {year}
              </p>
              <ul className="space-y-1">
                {byYear[year]?.map((t) => (
                  <li key={t.slug}>
                    <a
                      href={`/theme/${t.slug}`}
                      className={`block font-body text-sm text-neutral-400 interactive-item${t.slug === currentSlug ? ' active' : ''}`}
                    >
                      {t.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
```

- [ ] **Step 2: Verify the file has no TypeScript errors**

```bash
cd site && npx tsc --noEmit
```

Expected: no errors referencing `ThemeDrawer.tsx`.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/ThemeDrawer.tsx
git commit -m "feat: add ThemeDrawer component"
```

---

## Task 2: Update `Header.astro`

**Files:**
- Modify: `site/src/components/Header.astro`

- [ ] **Step 1: Add the props interface and conditional render**

Replace the entire file with:

```astro
---
import { ThemeDrawer } from './ThemeDrawer';
import type { Theme } from '@bathfilmclub/types';

interface Props {
  themes?: Theme[];
  currentSlug?: string;
}

const { themes, currentSlug } = Astro.props;
---
<header class="border-b border-neutral-600">
  <div class="max-w-site mx-auto px-6 h-16 flex items-center justify-end">
    <nav class="flex items-center gap-4">
      {themes && currentSlug && (
        <ThemeDrawer themes={themes} currentSlug={currentSlug} client:load />
      )}
      {[
        { href: '/', label: 'Home' },
        { href: '/archive', label: 'Archive' },
      ].map(({ href, label }) => {
        const isActive = Astro.url.pathname === href;
        return (
          <a
            href={href}
            class:list={[
              'font-heading font-semibold text-sm uppercase tracking-wide text-white interactive-item',
              { active: isActive },
            ]}
          >
            {label}
          </a>
        );
      })}
    </nav>
  </div>
</header>
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd site && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add site/src/components/Header.astro
git commit -m "feat: add optional themes prop to Header for drawer trigger"
```

---

## Task 3: Update `[slug].astro` — single column, pass themes to header

**Files:**
- Modify: `site/src/pages/theme/[slug].astro`

- [ ] **Step 1: Remove sidebar data prep and update layout**

Replace the entire file with:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Header from '../../components/Header.astro';
import FilmPyramid from '../../components/FilmPyramid.astro';
import { getAllThemes, formatMonth } from '../../utils/data';
import type { Theme } from '@bathfilmclub/types';

export async function getStaticPaths() {
  const themes = await getAllThemes();
  return themes.map((theme) => ({
    params: { slug: theme.slug },
    props: { theme },
  }));
}

interface Props { theme: Theme }
const { theme } = Astro.props;

const allThemes = await getAllThemes();
---
<Layout title={theme.title} description={theme.description ?? ''}>
  <Header themes={allThemes} currentSlug={theme.slug} />
  <div class="max-w-site mx-auto px-6 py-16">
    <main class="space-y-12">
      <div class="text-center">
        <p class="section-label justify-center mb-4">{formatMonth(theme.month)}</p>
        <h1 class="font-heading font-bold text-5xl leading-tight">{theme.title}</h1>
        {theme.description && (
          <p class="font-body text-neutral-400 mt-4 max-w-2xl leading-relaxed mx-auto">
            {theme.description}
          </p>
        )}
      </div>

      <div>
        <FilmPyramid films={theme.films} />
      </div>

      <div class="flex gap-4 pt-4 border-t border-neutral-600">
        <a href="/archive" class="font-body text-sm text-neutral-400 hover:text-brand-red transition-colors">
          ← Back to Archive
        </a>
      </div>
    </main>
  </div>
</Layout>
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd site && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Build to confirm static generation works**

```bash
cd site && npm run build
```

Expected: build completes with no errors.

- [ ] **Step 4: Commit**

```bash
git add site/src/pages/theme/[slug].astro
git commit -m "feat: replace sidebar with ThemeDrawer on theme detail page"
```

---

## Task 4: Smoke test in browser

- [ ] **Step 1: Start the dev server**

```bash
cd site && npm run dev
```

Expected: server starts on http://localhost:4321

- [ ] **Step 2: Navigate to any theme page**

Go to http://localhost:4321/archive, click any theme. Confirm:
- Single column layout (no sidebar)
- "Browse" button appears in the header alongside Home/Archive
- Title/date/description are centred

- [ ] **Step 3: Test the drawer**

Click "Browse":
- Drawer slides in from the left
- Overlay appears behind it
- Current theme is highlighted (white fill, active state)
- Other themes listed by year

- [ ] **Step 4: Test close interactions**

Verify all three close methods work:
1. Click the ✕ button
2. Click the overlay
3. Press Escape

- [ ] **Step 5: Verify other pages unaffected**

Visit http://localhost:4321 (homepage) and http://localhost:4321/archive — confirm "Browse" does NOT appear in the header on these pages.
