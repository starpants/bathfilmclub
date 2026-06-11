# Bath Film Club — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Astro website for Bath Film Club and a local Express+React admin tool that generates the site's JSON data files.

**Architecture:** Monorepo with npm workspaces. Shared TypeScript types package consumed by both the Astro static site (reads JSON at build time) and a local-only Express+React admin tool that writes JSON. The public site deploys to Cloudflare Pages with no server component.

**Tech Stack:** Astro 4, React 18, Tailwind CSS 3, TypeScript 5, Express 4, Vite 5, Vitest, Supertest, TMDb API v3, Cloudflare Pages.

---

## File Map

```
bathfilmclub/                              ← project root
├── package.json                           # npm workspaces root
├── tsconfig.base.json                     # shared TS compiler options
├── .gitignore
├── .prettierrc
├── packages/
│   └── types/
│       ├── package.json
│       └── src/index.ts                   # Film, Theme, ThemeFilm, Meeting, FilmStatus
├── site/                                  # Astro website
│   ├── package.json
│   ├── astro.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── data/                          # JSON files written by admin tool
│       │   ├── current.json              # current active cycle (Theme | null)
│       │   └── themes/                   # one file per completed theme
│       │       └── .gitkeep
│       ├── layouts/
│       │   └── Layout.astro              # HTML shell, head, fonts
│       ├── components/
│       │   ├── Header.astro              # logo, Archive link, Discord link
│       │   ├── HowItWorks.astro          # static process diagram
│       │   ├── FilmPyramid.astro         # pyramid layout wrapper (static)
│       │   ├── FilmCard.tsx              # React: poster tile + click to open panel
│       │   ├── FilmPanel.tsx             # React: slide-out film detail panel
│       │   └── ArchiveList.tsx           # React: collapsible rows + search
│       ├── pages/
│       │   ├── index.astro               # homepage
│       │   ├── archive.astro             # archive page
│       │   └── theme/[slug].astro        # theme detail page
│       └── utils/
│           ├── data.ts                   # load JSON helpers (getCurrentCycle, getAllThemes)
│           └── pyramid.ts               # derive pyramid rows from ThemeFilm[]
└── admin/                                 # local-only admin tool
    ├── package.json
    ├── .env.example
    ├── tsconfig.json
    ├── server/
    │   ├── index.ts                       # Express app entry
    │   ├── storage.ts                     # JSON file I/O (factory pattern)
    │   ├── tmdb.ts                        # TMDb API client
    │   └── routes/
    │       ├── themes.ts                  # GET/POST/PUT current cycle + archive
    │       ├── films.ts                   # add film, update status, remove film
    │       └── search.ts                  # proxy TMDb search
    ├── server/__tests__/
    │   ├── storage.test.ts
    │   ├── tmdb.test.ts
    │   └── routes.test.ts
    └── client/
        ├── index.html
        ├── vite.config.ts
        └── src/
            ├── main.tsx
            ├── App.tsx
            ├── api.ts                     # typed fetch wrappers for admin API
            └── components/
                ├── CurrentCycle.tsx       # current cycle dashboard
                ├── ThemeEditor.tsx        # create/edit theme title, desc, meeting
                ├── FilmSearch.tsx         # TMDb search + add to cycle
                ├── FilmList.tsx           # films in cycle with status controls
                └── ArchiveManager.tsx     # list archived themes, archive current
```

---

## Phase 1: Foundation

### Task 1: Monorepo scaffold + git init

**Files:**

- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.prettierrc`
- Create: `packages/types/package.json`
- Create: `packages/types/src/index.ts`

- [ ] **Step 1: Initialise git and root package.json**

```bash
cd /Users/Av/Sites/bathfilmclub
git init
```

Create `package.json`:

```json
{
  "name": "bathfilmclub",
  "private": true,
  "workspaces": ["packages/*", "site", "admin"],
  "scripts": {
    "site:dev": "npm run dev --workspace=site",
    "site:build": "npm run build --workspace=site",
    "site:preview": "npm run preview --workspace=site",
    "admin": "npm run dev --workspace=admin"
  }
}
```

- [ ] **Step 2: Create shared tsconfig**

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 3: Create .gitignore**

Create `.gitignore`:

```
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
site/.astro/
```

- [ ] **Step 4: Create .prettierrc**

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

- [ ] **Step 5: Create the types package**

Create `packages/types/package.json`:

```json
{
  "name": "@bathfilmclub/types",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

Create `packages/types/src/index.ts` (empty for now — content in Task 2).

- [ ] **Step 6: Install root dependencies**

```bash
npm install
```

Expected: `node_modules/` created, workspaces symlinked.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: monorepo scaffold with npm workspaces"
```

---

### Task 2: Shared TypeScript types

**Files:**

- Modify: `packages/types/src/index.ts`

These interfaces are the contract between the admin tool and the website. Get them right before building either side.

- [ ] **Step 1: Write the types**

Replace `packages/types/src/index.ts` with:

```typescript
export interface Film {
  tmdbId: number;
  title: string;
  year: number;
  runtime: number; // minutes
  genres: string[];
  synopsis: string;
  director: string;
  producers: string[]; // up to 3
  cast: string[]; // top 5 billed
  posterPath: string; // TMDb path e.g. "/abc123.jpg" — prefix with TMDb image base URL
  backdropPath?: string;
  rating?: number; // TMDb vote_average, one decimal place
  trailerKey?: string; // YouTube video key
}

export type FilmStatus = 'nominated' | 'shortlisted' | 'selected';

export interface ThemeFilm {
  film: Film;
  status: FilmStatus;
}

export interface Meeting {
  date: string; // ISO 8601 date "2026-06-15"
  time: string; // 24-hour "19:30"
}

export interface Theme {
  slug: string; // "2026-06-time-travel" — YYYY-MM-kebab-title
  title: string;
  description?: string;
  month: string; // "2026-06" — YYYY-MM, used for archive grouping and sort
  meeting?: Meeting;
  films: ThemeFilm[]; // all films regardless of status
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --project packages/types/tsconfig.json --noEmit 2>/dev/null || npx tsc -p packages/types/tsconfig.json --noEmit
```

If no tsconfig exists yet in packages/types, create `packages/types/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

Then run:

```bash
cd packages/types && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/types/
git commit -m "feat: add shared TypeScript types (Film, Theme, Meeting)"
```

---

### Task 3: Sample data files

**Files:**

- Create: `site/src/data/current.json`
- Create: `site/src/data/themes/2025-03-folk-horror.json`
- Create: `site/src/data/themes/.gitkeep`

Sample data lets the website render during development without needing the admin tool.

- [ ] **Step 1: Create the data directories**

```bash
mkdir -p site/src/data/themes
```

- [ ] **Step 2: Create current.json**

Create `site/src/data/current.json`:

```json
{
  "slug": "2026-06-time-travel",
  "title": "Time Travel",
  "description": "Films that bend, break, or race against time — from temporal paradoxes to alternate histories.",
  "month": "2026-06",
  "meeting": {
    "date": "2026-06-23",
    "time": "19:30"
  },
  "films": [
    {
      "film": {
        "tmdbId": 603,
        "title": "The Matrix",
        "year": 1999,
        "runtime": 136,
        "genres": ["Action", "Science Fiction"],
        "synopsis": "A computer hacker learns that reality as he knows it is a simulation.",
        "director": "Lana Wachowski",
        "producers": ["Joel Silver"],
        "cast": ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
        "posterPath": "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        "rating": 8.2,
        "trailerKey": "vKQi3bBA1y8"
      },
      "status": "selected"
    },
    {
      "film": {
        "tmdbId": 278,
        "title": "The Shawshank Redemption",
        "year": 1994,
        "runtime": 142,
        "genres": ["Drama", "Crime"],
        "synopsis": "Two imprisoned men bond over a number of years.",
        "director": "Frank Darabont",
        "producers": ["Niki Marvin"],
        "cast": ["Tim Robbins", "Morgan Freeman"],
        "posterPath": "/9cqNxx0GxF0bAY74W56AFaFuRSL.jpg",
        "rating": 9.3
      },
      "status": "selected"
    },
    {
      "film": {
        "tmdbId": 550,
        "title": "Fight Club",
        "year": 1999,
        "runtime": 139,
        "genres": ["Drama", "Thriller"],
        "synopsis": "An insomniac office worker forms an underground fight club.",
        "director": "David Fincher",
        "producers": ["Art Linson", "Cean Chaffin"],
        "cast": ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"],
        "posterPath": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        "rating": 8.4
      },
      "status": "shortlisted"
    },
    {
      "film": {
        "tmdbId": 13,
        "title": "Forrest Gump",
        "year": 1994,
        "runtime": 142,
        "genres": ["Drama", "Comedy", "Romance"],
        "synopsis": "The history of the United States from the 1950s to the 1970s unfolds through the perspective of an Alabama man.",
        "director": "Robert Zemeckis",
        "producers": ["Wendy Finerman", "Steve Tisch"],
        "cast": ["Tom Hanks", "Robin Wright", "Gary Sinise"],
        "posterPath": "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
        "rating": 8.5
      },
      "status": "shortlisted"
    },
    {
      "film": {
        "tmdbId": 389,
        "title": "12 Angry Men",
        "year": 1957,
        "runtime": 96,
        "genres": ["Drama"],
        "synopsis": "A jury holdout attempts to prevent a miscarriage of justice.",
        "director": "Sidney Lumet",
        "producers": ["Henry Fonda", "Reginald Rose"],
        "cast": ["Henry Fonda", "Lee J. Cobb", "Martin Balsam"],
        "posterPath": "/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg",
        "rating": 9.0
      },
      "status": "shortlisted"
    },
    {
      "film": {
        "tmdbId": 807,
        "title": "Se7en",
        "year": 1995,
        "runtime": 127,
        "genres": ["Crime", "Mystery", "Thriller"],
        "synopsis": "Two detectives hunt a serial killer who uses the seven deadly sins as his motives.",
        "director": "David Fincher",
        "producers": ["Arnold Kopelson", "Phyllis Carlyle"],
        "cast": ["Brad Pitt", "Morgan Freeman", "Kevin Spacey"],
        "posterPath": "/6yoghtyTpznpBik8EngEmJskVUO.jpg",
        "rating": 8.4
      },
      "status": "nominated"
    },
    {
      "film": {
        "tmdbId": 240,
        "title": "The Godfather Part II",
        "year": 1974,
        "runtime": 202,
        "genres": ["Drama", "Crime"],
        "synopsis": "The early life and career of Vito Corleone in 1920s New York.",
        "director": "Francis Ford Coppola",
        "producers": ["Francis Ford Coppola", "Gray Frederickson"],
        "cast": ["Al Pacino", "Robert De Niro", "Robert Duvall"],
        "posterPath": "/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg",
        "rating": 9.0
      },
      "status": "nominated"
    }
  ]
}
```

- [ ] **Step 3: Create one archived theme**

Create `site/src/data/themes/2025-03-folk-horror.json`:

```json
{
  "slug": "2025-03-folk-horror",
  "title": "Folk Horror",
  "description": "A subgenre rooted in rural landscapes, ancient rituals, and the dread of communities apart from modernity.",
  "month": "2025-03",
  "meeting": {
    "date": "2025-03-17",
    "time": "19:30"
  },
  "films": [
    {
      "film": {
        "tmdbId": 49018,
        "title": "The Wicker Man",
        "year": 1973,
        "runtime": 88,
        "genres": ["Horror", "Mystery", "Thriller"],
        "synopsis": "A police sergeant travels to a remote island to investigate a missing girl.",
        "director": "Robin Hardy",
        "producers": ["Peter Snell"],
        "cast": ["Edward Woodward", "Christopher Lee", "Britt Ekland"],
        "posterPath": "/4Fvj4p3V2fF0pF3YdkGj1TlDFuW.jpg",
        "rating": 7.5
      },
      "status": "selected"
    },
    {
      "film": {
        "tmdbId": 530385,
        "title": "Midsommar",
        "year": 2019,
        "runtime": 148,
        "genres": ["Horror", "Drama", "Mystery"],
        "synopsis": "A couple travels to Sweden to visit a midsummer festival that turns sinister.",
        "director": "Ari Aster",
        "producers": ["Lars Knudsen", "Patrik Andersson"],
        "cast": ["Florence Pugh", "Jack Reynor", "Vilhelm Blomgren"],
        "posterPath": "/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg",
        "rating": 7.1
      },
      "status": "selected"
    },
    {
      "film": {
        "tmdbId": 346648,
        "title": "The Witch",
        "year": 2015,
        "runtime": 92,
        "genres": ["Horror", "Mystery", "Drama"],
        "synopsis": "A Puritan family encounter forces of evil in the woods beyond their farm.",
        "director": "Robert Eggers",
        "producers": ["Daniel Bekerman", "Jay Van Hoy"],
        "cast": ["Anya Taylor-Joy", "Ralph Ineson", "Kate Dickie"],
        "posterPath": "/zhLKlUaF1SEpO58ppHIAyENkwgw.jpg",
        "rating": 6.8
      },
      "status": "shortlisted"
    },
    {
      "film": {
        "tmdbId": 69428,
        "title": "Kill List",
        "year": 2011,
        "runtime": 95,
        "genres": ["Horror", "Thriller", "Crime"],
        "synopsis": "A former soldier turned hitman takes on a new assignment with his partner.",
        "director": "Ben Wheatley",
        "producers": ["Andrew Starke"],
        "cast": ["Neil Maskell", "Michael Smiley", "MyAnna Buring"],
        "posterPath": "/5qHoazZiaLe7oFBok7XlUBg6tXO.jpg",
        "rating": 6.5
      },
      "status": "shortlisted"
    },
    {
      "film": {
        "tmdbId": 43074,
        "title": "Blood on Satan's Claw",
        "year": 1971,
        "runtime": 93,
        "genres": ["Horror"],
        "synopsis": "A demonic claw is unearthed in a 17th century English village.",
        "director": "Piers Haggard",
        "producers": ["Malcolm B. Heyworth", "Peter L. Andrews"],
        "cast": ["Patrick Wymark", "Linda Hayden", "Barry Andrews"],
        "posterPath": "/oRBhKWDjcKF8O3dNQQHRXgHEEjA.jpg",
        "rating": 6.2
      },
      "status": "shortlisted"
    },
    {
      "film": {
        "tmdbId": 68718,
        "title": "The Wailing",
        "year": 2016,
        "runtime": 156,
        "genres": ["Horror", "Mystery", "Thriller"],
        "synopsis": "A stranger arrives in a small Korean village, and the locals begin to die.",
        "director": "Na Hong-jin",
        "producers": ["Syd Lim"],
        "cast": ["Kwak Do-won", "Hwang Jung-min", "Chun Woo-hee"],
        "posterPath": "/dVB1bHHEAjrSBBQ5igvbJVA0lBi.jpg",
        "rating": 7.8
      },
      "status": "nominated"
    }
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add site/src/data/
git commit -m "chore: add sample data files for development"
```

---

## Phase 2: Astro Website — Core

### Task 4: Astro project setup with React and Tailwind

**Files:**

- Create: `site/package.json`
- Create: `site/astro.config.ts`
- Create: `site/tailwind.config.ts`
- Create: `site/tsconfig.json`
- Create: `site/src/env.d.ts`

- [ ] **Step 1: Initialise Astro in the site directory**

```bash
cd /Users/Av/Sites/bathfilmclub
npm create astro@latest site -- --template minimal --typescript strictest --no-git --no-install
```

If the interactive prompt can't be skipped, answer: minimal template, TypeScript strict, no git, no install.

- [ ] **Step 2: Install Astro integrations and Tailwind**

```bash
cd site
npm install
npx astro add react tailwind --yes
cd ..
```

Expected: `@astrojs/react`, `@astrojs/tailwind`, `tailwindcss` added to site/package.json.

- [ ] **Step 3: Add shared types as a workspace dependency**

Add to `site/package.json` dependencies:

```json
{
  "dependencies": {
    "@bathfilmclub/types": "*"
  }
}
```

Then run from root:

```bash
npm install
```

Expected: `node_modules/@bathfilmclub/types` symlinked to `packages/types`.

- [ ] **Step 4: Configure astro.config.ts**

Replace `site/astro.config.ts` content:

```typescript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'static',
});
```

- [ ] **Step 5: Configure tsconfig.json for the site**

Replace `site/tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strictest",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@bathfilmclub/types": ["../packages/types/src/index.ts"]
    }
  }
}
```

- [ ] **Step 6: Verify the site builds**

```bash
npm run site:build
```

Expected: `site/dist/` created with no errors.

- [ ] **Step 7: Commit**

```bash
git add site/
git commit -m "feat: initialise Astro site with React and Tailwind integrations"
```

---

### Task 5: Design system — fonts, colours, base styles

**Files:**

- Modify: `site/tailwind.config.ts`
- Modify: `site/src/styles/global.css` (create if absent)

- [ ] **Step 1: Configure Tailwind with the project's design tokens**

Replace `site/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#B11226',
          black: '#000000',
          white: '#FFFFFF',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          600: '#525252',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      maxWidth: {
        site: '1200px',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 2: Create global CSS with font imports and base resets**

Create `site/src/styles/global.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply font-body text-brand-black bg-brand-white;
    -webkit-font-smoothing: antialiased;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply font-heading;
  }
}

@layer components {
  /* Square motif from logo — used as section markers */
  .section-label {
    @apply flex items-center gap-2 text-xs font-heading font-700 uppercase tracking-widest text-neutral-600;
  }
  .section-label::before {
    content: '■';
    @apply text-brand-red;
  }

  .btn-discord {
    @apply inline-flex items-center gap-2 bg-brand-red text-white font-heading font-600 text-xl px-5 py-3 hover:bg-red-800 transition-colors;
  }
}
```

- [ ] **Step 3: Verify Tailwind config compiles**

```bash
npm run site:build 2>&1 | grep -i "error\|warn" | head -20
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add site/
git commit -m "feat: configure design system — Space Grotesk, Inter, brand colours"
```

---

### Task 6: Layout.astro and Header.astro

**Files:**

- Create: `site/src/layouts/Layout.astro`
- Create: `site/src/components/Header.astro`
- Modify: `site/src/pages/index.astro`

- [ ] **Step 1: Create Layout.astro**

Create `site/src/layouts/Layout.astro`:

```astro
---
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'Bath Film Club',
  description = 'A monthly film discussion group in Bath. Join us on Discord.',
} = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title === 'Bath Film Club' ? title : `${title} — Bath Film Club`}</title>
    <link rel="icon" type="image/jpeg" href="/assets/logo.jpg" />
  </head>
  <body class="min-h-screen">
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Copy the logo to public assets**

```bash
mkdir -p site/public/assets
cp BathFilmClub_Logo.jpg site/public/assets/logo.jpg
```

- [ ] **Step 3: Create Header.astro**

Create `site/src/components/Header.astro`:

```astro
---
interface Props {
  discordUrl?: string;
}
const { discordUrl = 'https://discord.gg/bathfilmclub' } = Astro.props;
---
<header class="border-b border-neutral-200">
  <div class="max-w-site mx-auto px-6 h-16 flex items-center justify-between">
    <a href="/" class="flex items-center">
      <img
        src="/assets/logo.jpg"
        alt="Bath Film Club"
        class="h-10 w-10 object-cover"
      />
    </a>
    <nav class="flex items-center gap-8">
      <a
        href="/archive"
        class="font-heading font-600 text-sm uppercase tracking-wide hover:text-brand-red transition-colors"
      >
        Archive
      </a>
      <a
        href={discordUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="btn-discord"
      >
        Join Discord
      </a>
    </nav>
  </div>
</header>
```

- [ ] **Step 4: Wire up Layout and Header in index.astro**

Replace `site/src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
---
<Layout>
  <Header />
  <main class="max-w-site mx-auto px-6 py-12">
    <p class="font-body text-neutral-600">Homepage coming soon.</p>
  </main>
</Layout>
```

- [ ] **Step 5: Start dev server and verify header renders**

```bash
npm run site:dev
```

Open `http://localhost:4321`. Verify:

- Logo appears top-left
- "Archive" link and "Join Discord" button appear top-right
- No layout errors in console

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add site/
git commit -m "feat: Layout and Header components"
```

---

### Task 7: Data utilities + pyramid logic (TDD)

**Files:**

- Create: `site/src/utils/pyramid.ts`
- Create: `site/src/utils/pyramid.test.ts`
- Create: `site/src/utils/data.ts`
- Create: `site/vitest.config.ts`

- [ ] **Step 1: Add Vitest to the site**

Add to `site/package.json` devDependencies:

```json
{
  "devDependencies": {
    "vitest": "^1.0.0"
  }
}
```

Create `site/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

```bash
npm install --workspace=site
```

Add to `site/package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Write failing tests for getPyramidRows**

Create `site/src/utils/pyramid.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getPyramidRows } from './pyramid';
import type { ThemeFilm } from '@bathfilmclub/types';

function film(id: number): ThemeFilm['film'] {
  return {
    tmdbId: id,
    title: `Film ${id}`,
    year: 2024,
    runtime: 90,
    genres: [],
    synopsis: '',
    director: 'Director',
    producers: [],
    cast: [],
    posterPath: `/poster-${id}.jpg`,
  };
}

describe('getPyramidRows', () => {
  it('returns empty arrays when no films', () => {
    const rows = getPyramidRows([]);
    expect(rows.selected).toHaveLength(0);
    expect(rows.shortlisted).toHaveLength(0);
    expect(rows.nominated).toHaveLength(0);
  });

  it('a selected film appears in all three rows', () => {
    const films: ThemeFilm[] = [{ film: film(1), status: 'selected' }];
    const rows = getPyramidRows(films);
    expect(rows.selected).toHaveLength(1);
    expect(rows.shortlisted).toHaveLength(1);
    expect(rows.nominated).toHaveLength(1);
  });

  it('a shortlisted film appears only in shortlisted and nominated rows', () => {
    const films: ThemeFilm[] = [{ film: film(1), status: 'shortlisted' }];
    const rows = getPyramidRows(films);
    expect(rows.selected).toHaveLength(0);
    expect(rows.shortlisted).toHaveLength(1);
    expect(rows.nominated).toHaveLength(1);
  });

  it('a nominated film appears only in the nominated row', () => {
    const films: ThemeFilm[] = [{ film: film(1), status: 'nominated' }];
    const rows = getPyramidRows(films);
    expect(rows.selected).toHaveLength(0);
    expect(rows.shortlisted).toHaveLength(0);
    expect(rows.nominated).toHaveLength(1);
  });

  it('correctly separates a mixed set of films', () => {
    const films: ThemeFilm[] = [
      { film: film(1), status: 'selected' },
      { film: film(2), status: 'selected' },
      { film: film(3), status: 'shortlisted' },
      { film: film(4), status: 'shortlisted' },
      { film: film(5), status: 'shortlisted' },
      { film: film(6), status: 'nominated' },
      { film: film(7), status: 'nominated' },
    ];
    const rows = getPyramidRows(films);
    expect(rows.selected).toHaveLength(2);
    expect(rows.shortlisted).toHaveLength(5);
    expect(rows.nominated).toHaveLength(7);
  });
});
```

- [ ] **Step 3: Run tests — verify they fail**

```bash
npm test --workspace=site
```

Expected: FAIL — `Cannot find module './pyramid'`

- [ ] **Step 4: Implement getPyramidRows**

Create `site/src/utils/pyramid.ts`:

```typescript
import type { ThemeFilm } from '@bathfilmclub/types';

export interface PyramidRows {
  selected: ThemeFilm[];
  shortlisted: ThemeFilm[];
  nominated: ThemeFilm[];
}

export function getPyramidRows(films: ThemeFilm[]): PyramidRows {
  return {
    selected: films.filter((f) => f.status === 'selected'),
    shortlisted: films.filter((f) => f.status === 'shortlisted' || f.status === 'selected'),
    nominated: films,
  };
}
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
npm test --workspace=site
```

Expected: All 5 tests PASS.

- [ ] **Step 6: Create data.ts for loading JSON files in Astro**

Create `site/src/utils/data.ts`:

```typescript
import type { Theme } from '@bathfilmclub/types';

export async function getCurrentCycle(): Promise<Theme | null> {
  try {
    const data = await import('../data/current.json');
    return data.default as Theme;
  } catch {
    return null;
  }
}

export async function getAllThemes(): Promise<Theme[]> {
  const imports = import.meta.glob<{ default: Theme }>('../data/themes/*.json', { eager: true });
  return Object.values(imports)
    .map((m) => m.default)
    .sort((a, b) => b.month.localeCompare(a.month)); // newest first
}

export async function getThemeBySlug(slug: string): Promise<Theme | null> {
  const themes = await getAllThemes();
  return themes.find((t) => t.slug === slug) ?? null;
}

export function formatMonth(month: string): string {
  // "2026-06" → "June 2026"
  const [year, m] = month.split('-');
  const date = new Date(parseInt(year), parseInt(m) - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function formatMeetingDate(isoDate: string): string {
  // "2026-06-23" → "Monday 23 June 2026"
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
```

- [ ] **Step 7: Commit**

```bash
git add site/
git commit -m "feat: data utilities and pyramid row logic with tests"
```

---

## Phase 3: Website Components

### Task 8: FilmCard and FilmPanel React components

**Files:**

- Create: `site/src/components/FilmCard.tsx`
- Create: `site/src/components/FilmPanel.tsx`

These are React islands. FilmCard renders a poster; clicking it opens FilmPanel. FilmPanel is a client-side slide-out panel — the entire island manages both components together.

The TMDb image base URL: `https://image.tmdb.org/t/p/w342` for card posters, `https://image.tmdb.org/t/p/w500` for panel poster.

- [ ] **Step 1: Create FilmCard.tsx**

Create `site/src/components/FilmCard.tsx`:

```tsx
import type { Film, FilmStatus } from '@bathfilmclub/types';

interface Props {
  film: Film;
  status: FilmStatus;
  onSelect: (film: Film) => void;
}

const STATUS_LABELS: Record<FilmStatus, string> = {
  selected: 'Selected',
  shortlisted: 'Shortlisted',
  nominated: 'Nominated',
};

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

export function FilmCard({ film, status, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(film)}
      className="group relative block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
      aria-label={`View details for ${film.title}`}
    >
      <div className="aspect-[2/3] overflow-hidden bg-neutral-200">
        {film.posterPath ? (
          <img
            src={`${TMDB_IMAGE_BASE}${film.posterPath}`}
            alt={film.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-200">
            <span className="font-heading text-neutral-400 text-xs text-center px-2">
              {film.title}
            </span>
          </div>
        )}
      </div>
      {status === 'selected' && (
        <span className="absolute top-2 left-2 bg-brand-red text-white text-[10px] font-heading font-600 uppercase tracking-wider px-2 py-1">
          Selected
        </span>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Create FilmPanel.tsx**

Create `site/src/components/FilmPanel.tsx`:

```tsx
import { useEffect } from 'react';
import type { Film } from '@bathfilmclub/types';

interface Props {
  film: Film | null;
  onClose: () => void;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const YOUTUBE_BASE = 'https://www.youtube.com/watch?v=';

export function FilmPanel({ film, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (film) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [film]);

  if (!film) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 overflow-y-auto shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={film.title}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:text-brand-red transition-colors"
          aria-label="Close panel"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        </button>

        {/* Poster */}
        {film.posterPath && (
          <img
            src={`${TMDB_IMAGE_BASE}${film.posterPath}`}
            alt={film.title}
            className="w-full aspect-[2/3] object-cover"
          />
        )}

        {/* Details */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="font-heading font-700 text-2xl leading-tight">{film.title}</h2>
            <p className="font-body text-neutral-600 text-sm mt-1">
              {film.year}
              {film.runtime ? ` · ${film.runtime} min` : ''}
              {film.rating ? ` · ★ ${film.rating}` : ''}
            </p>
          </div>

          {film.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {film.genres.map((g) => (
                <span
                  key={g}
                  className="text-xs font-heading uppercase tracking-wide border border-neutral-300 px-2 py-1"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {film.synopsis && (
            <p className="font-body text-sm leading-relaxed text-neutral-800">{film.synopsis}</p>
          )}

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-heading font-600 text-xs uppercase tracking-widest text-neutral-400">
                Director
              </dt>
              <dd className="font-body mt-0.5">{film.director}</dd>
            </div>
            {film.producers.length > 0 && (
              <div>
                <dt className="font-heading font-600 text-xs uppercase tracking-widest text-neutral-400">
                  Producers
                </dt>
                <dd className="font-body mt-0.5">{film.producers.join(', ')}</dd>
              </div>
            )}
            {film.cast.length > 0 && (
              <div>
                <dt className="font-heading font-600 text-xs uppercase tracking-widest text-neutral-400">
                  Cast
                </dt>
                <dd className="font-body mt-0.5">{film.cast.join(', ')}</dd>
              </div>
            )}
          </dl>

          {film.trailerKey && (
            <a
              href={`${YOUTUBE_BASE}${film.trailerKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-red font-heading font-600 text-sm hover:underline"
            >
              Watch Trailer ↗
            </a>
          )}
        </div>
      </aside>
    </>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run site:build 2>&1 | tail -5
```

Expected: Build succeeds with no TS errors.

- [ ] **Step 4: Commit**

```bash
git add site/src/components/
git commit -m "feat: FilmCard and FilmPanel React components"
```

---

### Task 9: FilmPyramid component

**Files:**

- Create: `site/src/components/FilmPyramid.astro`
- Create: `site/src/components/PyramidIsland.tsx`

FilmPyramid is a static Astro component that lays out the three rows. PyramidIsland is a React island that wires up the click-to-open-panel interaction across all film cards.

- [ ] **Step 1: Create PyramidIsland.tsx**

Create `site/src/components/PyramidIsland.tsx`:

```tsx
import { useState } from 'react';
import type { ThemeFilm, Film } from '@bathfilmclub/types';
import { FilmCard } from './FilmCard';
import { FilmPanel } from './FilmPanel';

interface Props {
  selected: ThemeFilm[];
  shortlisted: ThemeFilm[];
  nominated: ThemeFilm[];
}

function FilmRow({
  films,
  label,
  onSelect,
  minCount,
}: {
  films: ThemeFilm[];
  label: string;
  onSelect: (film: Film) => void;
  minCount?: number;
}) {
  const isEmpty = films.length === 0;
  return (
    <div className="space-y-3">
      <p className="section-label">{label}</p>
      {isEmpty ? (
        <p className="text-neutral-400 font-body text-sm italic">Not yet determined</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {films.map(({ film, status }) => (
            <div key={film.tmdbId} className="w-24 md:w-28 flex-shrink-0">
              <FilmCard film={film} status={status} onSelect={onSelect} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PyramidIsland({ selected, shortlisted, nominated }: Props) {
  const [activeFilm, setActiveFilm] = useState<Film | null>(null);

  return (
    <>
      <div className="space-y-8">
        <FilmRow films={selected} label="Selected Films" onSelect={setActiveFilm} />
        <FilmRow films={shortlisted} label="Shortlisted Films" onSelect={setActiveFilm} />
        <FilmRow films={nominated} label="Nominated Films" onSelect={setActiveFilm} />
      </div>
      <FilmPanel film={activeFilm} onClose={() => setActiveFilm(null)} />
    </>
  );
}
```

- [ ] **Step 2: Create FilmPyramid.astro**

Create `site/src/components/FilmPyramid.astro`:

```astro
---
import type { ThemeFilm } from '@bathfilmclub/types';
import { getPyramidRows } from '../utils/pyramid';
import { PyramidIsland } from './PyramidIsland';

interface Props {
  films: ThemeFilm[];
}

const { films } = Astro.props;
const { selected, shortlisted, nominated } = getPyramidRows(films);
---
<PyramidIsland
  selected={selected}
  shortlisted={shortlisted}
  nominated={nominated}
  client:load
/>
```

- [ ] **Step 3: Verify build**

```bash
npm run site:build 2>&1 | tail -5
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add site/src/components/
git commit -m "feat: FilmPyramid component with interactive React island"
```

---

## Phase 4: Website Pages

### Task 10: Homepage

**Files:**

- Create: `site/src/components/HowItWorks.astro`
- Modify: `site/src/pages/index.astro`

- [ ] **Step 1: Create HowItWorks.astro**

Create `site/src/components/HowItWorks.astro`:

```astro
<section class="py-16">
  <div class="space-y-8">
    <h2 class="section-label text-base">How It Works</h2>
    <p class="font-body text-neutral-600 max-w-lg">
      Bath Film Club is a monthly discussion group. Each month we explore a new theme through film.
    </p>
    <ol class="flex flex-col md:flex-row gap-0 md:gap-px">
      {[
        { step: '01', label: 'Theme', desc: 'A theme is chosen for the month.' },
        { step: '02', label: 'Nominations', desc: 'Members nominate up to two films.' },
        { step: '03', label: 'Shortlist', desc: 'Five films are selected at random.' },
        { step: '04', label: 'Voting', desc: 'Members vote on the shortlist.' },
        { step: '05', label: 'Discussion', desc: 'The top two films are watched and discussed.' },
      ].map(({ step, label, desc }) => (
        <li class="flex-1 border border-neutral-200 p-5 md:border-r-0 last:border-r">
          <span class="font-heading font-700 text-3xl text-neutral-200 block mb-2">{step}</span>
          <span class="font-heading font-600 text-sm block mb-1">{label}</span>
          <span class="font-body text-xs text-neutral-600">{desc}</span>
        </li>
      ))}
    </ol>
  </div>
</section>
```

- [ ] **Step 2: Build the complete homepage**

Replace `site/src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import FilmPyramid from '../components/FilmPyramid.astro';
import HowItWorks from '../components/HowItWorks.astro';
import { getCurrentCycle, formatMonth, formatMeetingDate } from '../utils/data';

const cycle = await getCurrentCycle();
---
<Layout>
  <Header />

  {/* Hero */}
  <section class="bg-brand-black text-white py-20">
    <div class="max-w-site mx-auto px-6 space-y-6">
      <h1 class="font-heading font-700 text-5xl md:text-7xl leading-none tracking-tight">
        Bath<br />Film Club
      </h1>
      <p class="font-body text-neutral-300 max-w-md text-lg leading-relaxed">
        A monthly film discussion group in Bath. Each month a new theme, a new selection, a new conversation.
      </p>
      <a
        href="https://discord.gg/bathfilmclub"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-discord"
      >
        Join on Discord
      </a>
    </div>
  </section>

  <main class="max-w-site mx-auto px-6 py-16 space-y-16">

    {cycle ? (
      <>
        {/* Current Theme */}
        <section>
          <h2 class="section-label mb-4">Current Theme</h2>
          <h3 class="font-heading font-700 text-4xl md:text-5xl">{cycle.title}</h3>
          {cycle.description && (
            <p class="font-body text-neutral-600 mt-3 max-w-2xl leading-relaxed">
              {cycle.description}
            </p>
          )}
        </section>

        {/* Upcoming Meeting */}
        {cycle.meeting && (
          <section>
            <h2 class="section-label mb-4">Upcoming Meeting</h2>
            <div class="space-y-1">
              <p class="font-heading font-600 text-lg">
                {formatMeetingDate(cycle.meeting.date)}
              </p>
              <p class="font-body text-neutral-600">{cycle.meeting.time}</p>
            </div>
          </section>
        )}

        {/* Film Selection Pyramid */}
        <section>
          <h2 class="section-label mb-8">Current Selection</h2>
          <FilmPyramid films={cycle.films} />
        </section>
      </>
    ) : (
      <section>
        <h2 class="section-label mb-4">Current Theme</h2>
        <p class="font-body text-neutral-500 italic">
          The next theme hasn't been announced yet. Join Discord to be the first to know.
        </p>
      </section>
    )}

    <HowItWorks />
  </main>
</Layout>
```

- [ ] **Step 3: Start dev server and verify the homepage**

```bash
npm run site:dev
```

Open `http://localhost:4321`. Verify:

- Black hero section with title, description, Discord button
- "Current Theme" section shows "Time Travel"
- Meeting date displays correctly
- Film pyramid shows all three rows with posters from sample data
- Clicking a poster opens the slide-out panel with film details
- Panel closes on Escape or backdrop click
- "How It Works" 5-step row renders at the bottom

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add site/src/
git commit -m "feat: homepage with hero, current theme, film pyramid, and how-it-works"
```

---

### Task 11: Archive page

**Files:**

- Create: `site/src/components/ArchiveList.tsx`
- Create: `site/src/pages/archive.astro`

ArchiveList is a React island handling both the collapsible rows and the search filter.

- [ ] **Step 1: Create ArchiveList.tsx**

Create `site/src/components/ArchiveList.tsx`:

```tsx
import { useState, useMemo } from 'react';
import type { Theme } from '@bathfilmclub/types';

interface Props {
  themes: Theme[];
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

function normalise(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9 ]/g, '');
}

function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  return new Date(parseInt(year), parseInt(m) - 1, 1).toLocaleDateString('en-GB', {
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

export function ArchiveList({ themes }: Props) {
  const [query, setQuery] = useState('');
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const toggle = (slug: string) => setOpenSlug((s) => (s === slug ? null : slug));

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
      {/* Search */}
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by film, theme, or director…"
          className="w-full border border-neutral-300 px-4 py-3 font-body text-sm focus:outline-none focus:border-brand-black placeholder:text-neutral-400"
        />
      </div>

      {/* Search results */}
      {isSearching && (
        <div className="space-y-2">
          <p className="section-label">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </p>
          {searchResults.length === 0 ? (
            <p className="font-body text-sm text-neutral-500 italic">No results found.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {searchResults.map((r, i) => (
                <li key={i} className="py-4">
                  {r.filmTitle !== '—' && (
                    <p className="font-heading font-600 text-base">{r.filmTitle}</p>
                  )}
                  <p className="font-body text-sm text-neutral-600">
                    Theme:{' '}
                    <a href={`/theme/${r.slug}`} className="underline hover:text-brand-red">
                      {r.themeTitle}
                    </a>
                  </p>
                  {r.director !== '—' && (
                    <p className="font-body text-sm text-neutral-600">Director: {r.director}</p>
                  )}
                  <p className="font-body text-xs text-neutral-400 mt-1">
                    {formatMonth(r.month)} · {r.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Archive list */}
      {!isSearching && (
        <ul className="divide-y divide-neutral-200">
          {themes.map((theme) => {
            const isOpen = openSlug === theme.slug;
            const selectedFilms = theme.films.filter((f) => f.status === 'selected');
            return (
              <li key={theme.slug}>
                <button
                  className="w-full flex items-center justify-between py-5 text-left group"
                  onClick={() => toggle(theme.slug)}
                  aria-expanded={isOpen}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-body text-sm text-neutral-400 w-28 shrink-0">
                      {formatMonth(theme.month)}
                    </span>
                    <span className="font-heading font-600 text-lg group-hover:text-brand-red transition-colors">
                      {theme.title}
                    </span>
                  </span>
                  <span className="text-neutral-400 text-sm ml-4">{isOpen ? '−' : '+'}</span>
                </button>

                {isOpen && (
                  <div className="pb-6 space-y-4 pl-32">
                    {theme.description && (
                      <p className="font-body text-sm text-neutral-600 max-w-prose">
                        {theme.description}
                      </p>
                    )}
                    {selectedFilms.length > 0 && (
                      <div className="space-y-2">
                        <p className="section-label">Selected Films</p>
                        <div className="flex gap-3">
                          {selectedFilms.map(({ film }) => (
                            <div key={film.tmdbId} className="w-16">
                              <div className="aspect-[2/3] overflow-hidden bg-neutral-100">
                                {film.posterPath ? (
                                  <img
                                    src={`${TMDB_IMAGE_BASE}${film.posterPath}`}
                                    alt={film.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-neutral-200" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <a
                      href={`/theme/${theme.slug}`}
                      className="inline-block font-heading font-600 text-sm text-brand-red hover:underline"
                    >
                      View Theme →
                    </a>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create archive.astro**

Create `site/src/pages/archive.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Header from '../components/Header.astro';
import { ArchiveList } from '../components/ArchiveList';
import { getAllThemes } from '../utils/data';

const themes = await getAllThemes();
---
<Layout title="Archive">
  <Header />
  <main class="max-w-site mx-auto px-6 py-16">
    <div class="mb-12">
      <h1 class="section-label mb-4">Archive</h1>
      <p class="font-heading font-700 text-4xl">Previous Themes</p>
    </div>
    <ArchiveList themes={themes} client:load />
  </main>
</Layout>
```

- [ ] **Step 3: Start dev server and verify**

```bash
npm run site:dev
```

Open `http://localhost:4321/archive`. Verify:

- "Folk Horror" theme appears in the archive list
- Clicking the row expands it to show description, poster thumbnails, "View Theme" link
- Clicking again collapses it
- Typing "fin" in search returns "Fight Club" and "Se7en" (both directed by David Fincher from current data)
- Typing "folk" returns the Folk Horror theme as a result

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add site/src/
git commit -m "feat: archive page with collapsible rows and search"
```

---

### Task 12: Theme detail page

**Files:**

- Create: `site/src/pages/theme/[slug].astro`

- [ ] **Step 1: Create the theme detail page**

Create `site/src/pages/theme/[slug].astro`:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Header from '../../components/Header.astro';
import FilmPyramid from '../../components/FilmPyramid.astro';
import { getAllThemes, getThemeBySlug, formatMonth, formatMeetingDate } from '../../utils/data';
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

// Group all themes by year for the sidebar
const allThemes = await getAllThemes();
const byYear = allThemes.reduce<Record<string, Theme[]>>((acc, t) => {
  const year = t.month.split('-')[0];
  if (!acc[year]) acc[year] = [];
  acc[year].push(t);
  return acc;
}, {});
const years = Object.keys(byYear).sort((a, b) => parseInt(b) - parseInt(a));
---
<Layout title={theme.title} description={theme.description}>
  <Header />
  <div class="max-w-site mx-auto px-6 py-16">
    <div class="flex gap-16">

      {/* Sidebar */}
      <nav class="hidden lg:block w-52 shrink-0 sticky top-8 self-start space-y-6" aria-label="Theme navigation">
        {years.map((year) => (
          <div>
            <p class="font-heading font-700 text-xs uppercase tracking-widest text-neutral-400 mb-2">
              {year}
            </p>
            <ul class="space-y-1">
              {byYear[year].map((t) => (
                <li>
                  <a
                    href={`/theme/${t.slug}`}
                    class:list={[
                      'block font-body text-sm py-1 hover:text-brand-red transition-colors',
                      t.slug === theme.slug ? 'font-600 text-brand-red' : 'text-neutral-600',
                    ]}
                  >
                    {t.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Main content */}
      <main class="flex-1 min-w-0 space-y-12">
        <div>
          <p class="section-label mb-4">{formatMonth(theme.month)}</p>
          <h1 class="font-heading font-700 text-5xl leading-tight">{theme.title}</h1>
          {theme.description && (
            <p class="font-body text-neutral-600 mt-4 max-w-2xl leading-relaxed">
              {theme.description}
            </p>
          )}
        </div>

        {theme.meeting && (
          <div>
            <h2 class="section-label mb-3">Meeting</h2>
            <p class="font-heading font-600 text-lg">{formatMeetingDate(theme.meeting.date)}</p>
            <p class="font-body text-neutral-600 text-sm">{theme.meeting.time}</p>
          </div>
        )}

        <div>
          <h2 class="section-label mb-8">Film Selection</h2>
          <FilmPyramid films={theme.films} />
        </div>

        <div class="flex gap-4 pt-4 border-t border-neutral-200">
          <a href="/archive" class="font-body text-sm text-neutral-500 hover:text-brand-red transition-colors">
            ← Back to Archive
          </a>
        </div>
      </main>

    </div>
  </div>
</Layout>
```

- [ ] **Step 2: Verify the build generates the theme page**

```bash
npm run site:build
```

Expected: Build succeeds and generates `dist/theme/2025-03-folk-horror/index.html`.

```bash
ls site/dist/theme/
```

Expected: `2025-03-folk-horror/` directory.

- [ ] **Step 3: Start dev server and verify the theme page**

```bash
npm run site:dev
```

Open `http://localhost:4321/theme/2025-03-folk-horror`. Verify:

- Theme title "Folk Horror" appears prominently
- Meeting date renders correctly
- Film pyramid shows all rows
- Sidebar shows "2025 → Folk Horror" with Folk Horror highlighted
- "Back to Archive" link works
- Clicking posters opens film detail panel

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add site/src/pages/theme/
git commit -m "feat: theme detail page with film pyramid and year sidebar"
```

---

## Phase 5: Admin Tool — Backend

### Task 13: Admin project scaffold

**Files:**

- Create: `admin/package.json`
- Create: `admin/tsconfig.json`
- Create: `admin/.env.example`
- Create: `admin/server/index.ts`
- Create: `admin/client/index.html`
- Create: `admin/client/vite.config.ts`
- Create: `admin/client/src/main.tsx`

The admin tool is a local-only web server. You need a TMDb API key. Get one free at https://www.themoviedb.org/settings/api (requires a free account).

- [ ] **Step 1: Create admin/package.json**

Create `admin/package.json`:

```json
{
  "name": "@bathfilmclub/admin",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "concurrently \"npm run server:dev\" \"npm run client:dev\"",
    "server:dev": "tsx watch server/index.ts",
    "client:dev": "vite client --port 3000",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@bathfilmclub/types": "*",
    "cors": "^2.8.5",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.0.0",
    "@types/supertest": "^6.0.2",
    "@vitejs/plugin-react": "^4.2.0",
    "concurrently": "^8.2.2",
    "dotenv": "^16.3.1",
    "supertest": "^6.3.4",
    "tsx": "^4.7.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

- [ ] **Step 2: Create admin/tsconfig.json**

Create `admin/tsconfig.json`:

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": ".",
    "types": ["node"],
    "paths": {
      "@bathfilmclub/types": ["../packages/types/src/index.ts"]
    }
  },
  "include": ["server", "client/src"]
}
```

- [ ] **Step 3: Create .env.example**

Create `admin/.env.example`:

```
TMDB_API_KEY=your_tmdb_api_key_here
DATA_DIR=../site/src/data
PORT=3001
```

Create the actual `.env` file from the example (user must fill in their API key):

```bash
cp admin/.env.example admin/.env
```

- [ ] **Step 4: Create the Express server entry point**

Create `admin/server/index.ts`:

```typescript
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
```

- [ ] **Step 5: Create placeholder route files**

Create `admin/server/routes/themes.ts`:

```typescript
import { Router } from 'express';
export const themesRouter = Router();
```

Create `admin/server/routes/films.ts`:

```typescript
import { Router } from 'express';
export const filmsRouter = Router();
```

Create `admin/server/routes/search.ts`:

```typescript
import { Router } from 'express';
export const searchRouter = Router();
```

- [ ] **Step 6: Create the Vite React client**

Create `admin/client/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bath Film Club Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `admin/client/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'client',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

Create `admin/client/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Bath Film Club Admin</h1>
      <p>Loading…</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

- [ ] **Step 7: Install admin dependencies**

```bash
npm install --workspace=admin
```

- [ ] **Step 8: Verify the health endpoint starts**

```bash
cd admin && node --import tsx/esm server/index.ts &
sleep 2
curl http://localhost:3001/api/health
kill %1
cd ..
```

Expected: `{"ok":true}`

- [ ] **Step 9: Commit**

```bash
git add admin/
git commit -m "feat: admin tool scaffold — Express server and Vite React client"
```

---

### Task 14: Storage utilities (TDD)

**Files:**

- Create: `admin/server/storage.ts`
- Create: `admin/server/__tests__/storage.test.ts`

- [ ] **Step 1: Write failing tests for storage**

Create `admin/server/__tests__/storage.test.ts`:

```typescript
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

async function makeStorage(dir: string) {
  // Import factory fresh for each test using the tmpDir
  const { createStorage } = await import('../storage.js');
  return createStorage(dir);
}

describe('storage', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'bfc-test-'));
    await mkdir(path.join(tmpDir, 'themes'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  describe('readCurrentCycle', () => {
    it('returns null when current.json does not exist', async () => {
      const storage = await makeStorage(tmpDir);
      expect(await storage.readCurrentCycle()).toBeNull();
    });

    it('returns parsed theme when current.json exists', async () => {
      await writeFile(path.join(tmpDir, 'current.json'), JSON.stringify(sampleTheme));
      const storage = await makeStorage(tmpDir);
      const result = await storage.readCurrentCycle();
      expect(result?.slug).toBe('2026-06-test');
    });
  });

  describe('writeCurrentCycle', () => {
    it('writes theme as pretty-printed JSON', async () => {
      const storage = await makeStorage(tmpDir);
      await storage.writeCurrentCycle(sampleTheme);
      const { readFile } = await import('fs/promises');
      const raw = await readFile(path.join(tmpDir, 'current.json'), 'utf-8');
      expect(raw).toContain('\n');
      expect(JSON.parse(raw).slug).toBe('2026-06-test');
    });

    it('writes null to clear the current cycle', async () => {
      const storage = await makeStorage(tmpDir);
      await storage.writeCurrentCycle(null);
      const { readFile } = await import('fs/promises');
      const raw = await readFile(path.join(tmpDir, 'current.json'), 'utf-8');
      expect(JSON.parse(raw)).toBeNull();
    });
  });

  describe('writeTheme + readAllThemes', () => {
    it('persists a theme and reads it back', async () => {
      const storage = await makeStorage(tmpDir);
      await storage.writeTheme(sampleTheme);
      const themes = await storage.readAllThemes();
      expect(themes).toHaveLength(1);
      expect(themes[0].slug).toBe('2026-06-test');
    });

    it('returns themes sorted newest first by month', async () => {
      const storage = await makeStorage(tmpDir);
      await storage.writeTheme({ ...sampleTheme, slug: '2025-01-old', month: '2025-01' });
      await storage.writeTheme({ ...sampleTheme, slug: '2026-06-new', month: '2026-06' });
      const themes = await storage.readAllThemes();
      expect(themes[0].month).toBe('2026-06');
      expect(themes[1].month).toBe('2025-01');
    });
  });

  describe('archiveCurrentCycle', () => {
    it('moves current cycle to themes dir and clears current.json', async () => {
      const storage = await makeStorage(tmpDir);
      await storage.writeCurrentCycle(sampleTheme);
      await storage.archiveCurrentCycle();
      expect(await storage.readCurrentCycle()).toBeNull();
      const themes = await storage.readAllThemes();
      expect(themes[0].slug).toBe('2026-06-test');
    });

    it('throws if no current cycle', async () => {
      const storage = await makeStorage(tmpDir);
      await expect(storage.archiveCurrentCycle()).rejects.toThrow('No current cycle');
    });
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test --workspace=admin
```

Expected: FAIL — `Cannot find module '../storage.js'`

- [ ] **Step 3: Implement storage.ts**

Create `admin/server/storage.ts`:

```typescript
import { readFile, writeFile, readdir, mkdir } from 'fs/promises';
import path from 'path';
import type { Theme } from '@bathfilmclub/types';

export interface Storage {
  readCurrentCycle(): Promise<Theme | null>;
  writeCurrentCycle(theme: Theme | null): Promise<void>;
  readAllThemes(): Promise<Theme[]>;
  writeTheme(theme: Theme): Promise<void>;
  archiveCurrentCycle(): Promise<void>;
}

export function createStorage(dataDir: string): Storage {
  const currentPath = () => path.join(dataDir, 'current.json');
  const themePath = (slug: string) => path.join(dataDir, 'themes', `${slug}.json`);
  const themesDir = () => path.join(dataDir, 'themes');

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

    async writeTheme(theme) {
      await mkdir(themesDir(), { recursive: true });
      await writeFile(themePath(theme.slug), JSON.stringify(theme, null, 2));
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
  process.env.DATA_DIR ?? path.join('..', 'site', 'src', 'data')
);
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test --workspace=admin
```

Expected: All storage tests PASS.

- [ ] **Step 5: Commit**

```bash
git add admin/
git commit -m "feat: storage utilities with TDD — JSON file I/O for themes"
```

---

### Task 15: TMDb API client (TDD)

**Files:**

- Create: `admin/server/tmdb.ts`
- Create: `admin/server/__tests__/tmdb.test.ts`

- [ ] **Step 1: Write failing tests**

Create `admin/server/__tests__/tmdb.test.ts`:

```typescript
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
        json: () =>
          Promise.resolve({
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
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test --workspace=admin
```

Expected: FAIL — `Cannot find module '../tmdb.js'`

- [ ] **Step 3: Implement tmdb.ts**

Create `admin/server/tmdb.ts`:

```typescript
import type { Film } from '@bathfilmclub/types';

const BASE = 'https://api.themoviedb.org/3';

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('api_key', process.env.TMDB_API_KEY!);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDb error: ${res.status}`);
  return res.json();
}

export interface TmdbSearchResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

export async function searchFilms(query: string): Promise<TmdbSearchResult[]> {
  const data = await tmdbFetch<{ results: TmdbSearchResult[] }>('/search/movie', { query });
  return data.results.slice(0, 10);
}

export async function getFilmDetails(tmdbId: number): Promise<Film> {
  interface Details {
    title: string;
    release_date: string;
    runtime: number;
    genres: { id: number; name: string }[];
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
  }
  interface Credits {
    crew: { job: string; name: string }[];
    cast: { name: string; order: number }[];
  }
  interface Videos {
    results: { type: string; site: string; key: string }[];
  }

  const [details, credits, videos] = await Promise.all([
    tmdbFetch<Details>(`/movie/${tmdbId}`),
    tmdbFetch<Credits>(`/movie/${tmdbId}/credits`),
    tmdbFetch<Videos>(`/movie/${tmdbId}/videos`),
  ]);

  const director = credits.crew.find((c) => c.job === 'Director')?.name ?? 'Unknown';
  const producers = credits.crew
    .filter((c) => c.job === 'Producer')
    .map((c) => c.name)
    .slice(0, 3);
  const cast = credits.cast
    .sort((a, b) => a.order - b.order)
    .map((c) => c.name)
    .slice(0, 5);
  const trailer = videos.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube');

  return {
    tmdbId,
    title: details.title,
    year: new Date(details.release_date).getFullYear(),
    runtime: details.runtime,
    genres: details.genres.map((g) => g.name),
    synopsis: details.overview,
    director,
    producers,
    cast,
    posterPath: details.poster_path ?? '',
    backdropPath: details.backdrop_path ?? undefined,
    rating: Math.round(details.vote_average * 10) / 10,
    trailerKey: trailer?.key,
  };
}
```

- [ ] **Step 4: Run all tests — verify everything passes**

```bash
npm test --workspace=admin
```

Expected: All tests PASS (storage + TMDb).

- [ ] **Step 5: Commit**

```bash
git add admin/server/tmdb.ts admin/server/__tests__/tmdb.test.ts
git commit -m "feat: TMDb API client with tests"
```

---

### Task 16: API routes (TDD)

**Files:**

- Modify: `admin/server/routes/themes.ts`
- Modify: `admin/server/routes/films.ts`
- Modify: `admin/server/routes/search.ts`
- Create: `admin/server/__tests__/routes.test.ts`

- [ ] **Step 1: Write failing route tests**

Create `admin/server/__tests__/routes.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import type { Theme } from '@bathfilmclub/types';

// Mock storage so tests don't touch the real filesystem
vi.mock('../storage.js', () => {
  const theme: Theme = {
    slug: '2026-06-test',
    title: 'Test Theme',
    month: '2026-06',
    films: [],
  };
  return {
    storage: {
      readCurrentCycle: vi.fn().mockResolvedValue(theme),
      writeCurrentCycle: vi.fn().mockResolvedValue(undefined),
      readAllThemes: vi.fn().mockResolvedValue([theme]),
      writeTheme: vi.fn().mockResolvedValue(undefined),
      archiveCurrentCycle: vi.fn().mockResolvedValue(undefined),
    },
  };
});

// Mock TMDb so tests don't make real HTTP calls
vi.mock('../tmdb.js', () => ({
  searchFilms: vi.fn().mockResolvedValue([
    {
      id: 603,
      title: 'The Matrix',
      release_date: '1999-03-30',
      poster_path: '/poster.jpg',
      overview: 'A film.',
    },
  ]),
  getFilmDetails: vi.fn().mockResolvedValue({
    tmdbId: 603,
    title: 'The Matrix',
    year: 1999,
    runtime: 136,
    genres: ['Action'],
    synopsis: 'A film.',
    director: 'Lana Wachowski',
    producers: [],
    cast: [],
    posterPath: '/poster.jpg',
  }),
}));

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('GET /api/themes/current', () => {
  it('returns the current cycle', async () => {
    const res = await request(app).get('/api/themes/current');
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('2026-06-test');
  });
});

describe('PUT /api/themes/current', () => {
  it('updates the current cycle', async () => {
    const update = { title: 'Updated', month: '2026-07', films: [] };
    const res = await request(app).put('/api/themes/current').send(update);
    expect(res.status).toBe(200);
  });

  it('rejects missing required fields', async () => {
    const res = await request(app).put('/api/themes/current').send({ title: 'No month' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/themes/archive', () => {
  it('archives the current cycle', async () => {
    const res = await request(app).post('/api/themes/archive');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/themes', () => {
  it('returns all archived themes', async () => {
    const res = await request(app).get('/api/themes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/films', () => {
  it('adds a film fetched from TMDb to the current cycle', async () => {
    const res = await request(app).post('/api/films').send({ tmdbId: 603, status: 'nominated' });
    expect(res.status).toBe(200);
  });

  it('rejects invalid status', async () => {
    const res = await request(app).post('/api/films').send({ tmdbId: 603, status: 'invalid' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/films/:tmdbId/status', () => {
  it('updates a film status', async () => {
    const res = await request(app).patch('/api/films/603/status').send({ status: 'shortlisted' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/films/:tmdbId', () => {
  it('removes a film from the current cycle', async () => {
    const res = await request(app).delete('/api/films/603');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/search', () => {
  it('returns TMDb search results', async () => {
    const res = await request(app).get('/api/search?q=matrix');
    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe('The Matrix');
  });

  it('requires a query parameter', async () => {
    const res = await request(app).get('/api/search');
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test --workspace=admin
```

Expected: FAIL — routes return 404 (not yet implemented).

- [ ] **Step 3: Implement themes routes**

Replace `admin/server/routes/themes.ts`:

```typescript
import { Router } from 'express';
import { storage } from '../storage.js';
import type { Theme } from '@bathfilmclub/types';

export const themesRouter = Router();

themesRouter.get('/current', async (_req, res) => {
  const cycle = await storage.readCurrentCycle();
  res.json(cycle);
});

themesRouter.put('/current', async (req, res) => {
  const { title, month, films } = req.body as Partial<Theme>;
  if (!title || !month || !films) {
    return res.status(400).json({ error: 'title, month, and films are required' });
  }
  const current = await storage.readCurrentCycle();
  const slug =
    current?.slug ??
    `${month}-${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}`;
  const updated: Theme = { ...current, ...req.body, slug };
  await storage.writeCurrentCycle(updated);
  res.json(updated);
});

themesRouter.post('/archive', async (_req, res) => {
  await storage.archiveCurrentCycle();
  res.json({ ok: true });
});

themesRouter.get('/', async (_req, res) => {
  const themes = await storage.readAllThemes();
  res.json(themes);
});
```

- [ ] **Step 4: Implement films routes**

Replace `admin/server/routes/films.ts`:

```typescript
import { Router } from 'express';
import { storage } from '../storage.js';
import { getFilmDetails } from '../tmdb.js';
import type { FilmStatus, ThemeFilm } from '@bathfilmclub/types';

const VALID_STATUSES: FilmStatus[] = ['nominated', 'shortlisted', 'selected'];

export const filmsRouter = Router();

filmsRouter.post('/', async (req, res) => {
  const { tmdbId, status } = req.body as { tmdbId: number; status: FilmStatus };
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'status must be nominated, shortlisted, or selected' });
  }
  const current = await storage.readCurrentCycle();
  if (!current) return res.status(404).json({ error: 'No active cycle' });
  if (current.films.some((f) => f.film.tmdbId === tmdbId)) {
    return res.status(409).json({ error: 'Film already in cycle' });
  }
  const film = await getFilmDetails(tmdbId);
  const entry: ThemeFilm = { film, status };
  await storage.writeCurrentCycle({ ...current, films: [...current.films, entry] });
  res.json(entry);
});

filmsRouter.patch('/:tmdbId/status', async (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);
  const { status } = req.body as { status: FilmStatus };
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'status must be nominated, shortlisted, or selected' });
  }
  const current = await storage.readCurrentCycle();
  if (!current) return res.status(404).json({ error: 'No active cycle' });
  const updated = {
    ...current,
    films: current.films.map((f) => (f.film.tmdbId === tmdbId ? { ...f, status } : f)),
  };
  await storage.writeCurrentCycle(updated);
  res.json(updated);
});

filmsRouter.delete('/:tmdbId', async (req, res) => {
  const tmdbId = parseInt(req.params.tmdbId);
  const current = await storage.readCurrentCycle();
  if (!current) return res.status(404).json({ error: 'No active cycle' });
  const updated = { ...current, films: current.films.filter((f) => f.film.tmdbId !== tmdbId) };
  await storage.writeCurrentCycle(updated);
  res.json(updated);
});
```

- [ ] **Step 5: Implement search route**

Replace `admin/server/routes/search.ts`:

```typescript
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
```

- [ ] **Step 6: Run all tests — verify they pass**

```bash
npm test --workspace=admin
```

Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add admin/server/
git commit -m "feat: admin API routes for themes, films, and TMDb search"
```

---

## Phase 6: Admin Tool — Frontend

### Task 17: Admin React app with API client and routing

**Files:**

- Create: `admin/client/src/api.ts`
- Modify: `admin/client/src/main.tsx`
- Create: `admin/client/src/App.tsx`

- [ ] **Step 1: Create typed API client**

Create `admin/client/src/api.ts`:

```typescript
import type { Theme, ThemeFilm, FilmStatus } from '@bathfilmclub/types';

export interface TmdbSearchResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getCurrentCycle: () => apiFetch<Theme | null>('/themes/current'),
  updateCurrentCycle: (data: Partial<Theme>) =>
    apiFetch<Theme>('/themes/current', { method: 'PUT', body: JSON.stringify(data) }),
  archiveCycle: () => apiFetch<{ ok: boolean }>('/themes/archive', { method: 'POST' }),
  getAllThemes: () => apiFetch<Theme[]>('/themes'),

  addFilm: (tmdbId: number, status: FilmStatus) =>
    apiFetch<ThemeFilm>('/films', { method: 'POST', body: JSON.stringify({ tmdbId, status }) }),
  updateFilmStatus: (tmdbId: number, status: FilmStatus) =>
    apiFetch<Theme>(`/films/${tmdbId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  removeFilm: (tmdbId: number) => apiFetch<Theme>(`/films/${tmdbId}`, { method: 'DELETE' }),

  search: (q: string) => apiFetch<TmdbSearchResult[]>(`/search?q=${encodeURIComponent(q)}`),
};
```

- [ ] **Step 2: Create App.tsx with simple tab navigation**

Create `admin/client/src/App.tsx`:

```tsx
import { useState } from 'react';
import { CurrentCyclePanel } from './components/CurrentCycle';
import { ArchivePanel } from './components/ArchiveManager';

type Tab = 'current' | 'archive';

export function App() {
  const [tab, setTab] = useState<Tab>('current');

  return (
    <div
      style={{ fontFamily: 'Inter, sans-serif', maxWidth: 900, margin: '0 auto', padding: '2rem' }}
    >
      <header
        style={{ borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem' }}
      >
        <h1
          style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}
        >
          ■ Bath Film Club Admin
        </h1>
        <nav style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {(['current', 'archive'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '0.5rem 1rem',
                background: tab === t ? '#000' : 'transparent',
                color: tab === t ? '#fff' : '#000',
                border: '1px solid #000',
                cursor: 'pointer',
              }}
            >
              {t === 'current' ? 'Current Cycle' : 'Archive'}
            </button>
          ))}
        </nav>
      </header>

      {tab === 'current' && <CurrentCyclePanel />}
      {tab === 'archive' && <ArchivePanel />}
    </div>
  );
}
```

- [ ] **Step 3: Update main.tsx**

Replace `admin/client/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

// Load Google Fonts
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap';
document.head.appendChild(link);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 4: Commit**

```bash
git add admin/client/src/
git commit -m "feat: admin app shell with tab navigation and typed API client"
```

---

### Task 18: Admin UI — Current cycle management

**Files:**

- Create: `admin/client/src/components/CurrentCycle.tsx`
- Create: `admin/client/src/components/ThemeEditor.tsx`
- Create: `admin/client/src/components/FilmSearch.tsx`
- Create: `admin/client/src/components/FilmList.tsx`

- [ ] **Step 1: Create ThemeEditor.tsx**

Create `admin/client/src/components/ThemeEditor.tsx`:

```tsx
import { useState } from 'react';
import type { Theme } from '@bathfilmclub/types';
import { api } from '../api';

interface Props {
  theme: Theme | null;
  onSaved: (theme: Theme) => void;
}

function field(label: string, el: React.ReactNode) {
  return (
    <label style={{ display: 'block', marginBottom: '1rem' }}>
      <span
        style={{
          display: 'block',
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '0.3rem',
          color: '#666',
        }}
      >
        {label}
      </span>
      {el}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  border: '1px solid #ccc',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

export function ThemeEditor({ theme, onSaved }: Props) {
  const [title, setTitle] = useState(theme?.title ?? '');
  const [description, setDescription] = useState(theme?.description ?? '');
  const [month, setMonth] = useState(theme?.month ?? '');
  const [meetingDate, setMeetingDate] = useState(theme?.meeting?.date ?? '');
  const [meetingTime, setMeetingTime] = useState(theme?.meeting?.time ?? '19:30');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!title.trim() || !month.trim()) {
      setError('Title and month are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await api.updateCurrentCycle({
        title: title.trim(),
        description: description.trim() || undefined,
        month: month.trim(),
        meeting: meetingDate ? { date: meetingDate, time: meetingTime } : undefined,
        films: theme?.films ?? [],
      });
      onSaved(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {field(
        'Title',
        <input
          style={inputStyle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Time Travel"
        />
      )}
      {field(
        'Month (YYYY-MM)',
        <input
          style={inputStyle}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="2026-06"
          pattern="\d{4}-\d{2}"
        />
      )}
      {field(
        'Description (optional)',
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      )}
      {field(
        'Meeting Date',
        <input
          type="date"
          style={inputStyle}
          value={meetingDate}
          onChange={(e) => setMeetingDate(e.target.value)}
        />
      )}
      {field(
        'Meeting Time',
        <input
          type="time"
          style={inputStyle}
          value={meetingTime}
          onChange={(e) => setMeetingTime(e.target.value)}
        />
      )}
      {error && (
        <p style={{ color: '#B11226', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
      )}
      <button
        onClick={save}
        disabled={saving}
        style={{
          background: '#000',
          color: '#fff',
          border: 'none',
          padding: '0.6rem 1.5rem',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 600,
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        {saving ? 'Saving…' : 'Save Theme'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create FilmSearch.tsx**

Create `admin/client/src/components/FilmSearch.tsx`:

```tsx
import { useState, useRef } from 'react';
import type { FilmStatus } from '@bathfilmclub/types';
import { api, type TmdbSearchResult } from '../api';

interface Props {
  onAdd: (tmdbId: number, status: FilmStatus) => void;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

export function FilmSearch({ onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const search = (q: string) => {
    setQuery(q);
    clearTimeout(debounce.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await api.search(q));
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const add = async (id: number, status: FilmStatus) => {
    setPendingId(id);
    try {
      await onAdd(id, status);
      setQuery('');
      setResults([]);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="Search TMDb…"
        style={{
          width: '100%',
          padding: '0.5rem',
          border: '1px solid #ccc',
          fontSize: '0.9rem',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          marginBottom: '0.5rem',
        }}
      />
      {loading && <p style={{ fontSize: '0.8rem', color: '#666' }}>Searching…</p>}
      {results.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, border: '1px solid #eee' }}>
          {results.map((r) => (
            <li
              key={r.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                borderBottom: '1px solid #eee',
              }}
            >
              {r.poster_path ? (
                <img
                  src={`${TMDB_IMAGE_BASE}${r.poster_path}`}
                  alt=""
                  style={{ width: 30, height: 45, objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: 30, height: 45, background: '#eee' }} />
              )}
              <span style={{ flex: 1, fontSize: '0.85rem' }}>
                {r.title} <span style={{ color: '#999' }}>({r.release_date?.slice(0, 4)})</span>
              </span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {(['nominated', 'shortlisted', 'selected'] as FilmStatus[]).map((s) => (
                  <button
                    key={s}
                    disabled={pendingId === r.id}
                    onClick={() => add(r.id, s)}
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      border: '1px solid #000',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontFamily: 'Space Grotesk, sans-serif',
                      textTransform: 'capitalize',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create FilmList.tsx**

Create `admin/client/src/components/FilmList.tsx`:

```tsx
import type { ThemeFilm, FilmStatus } from '@bathfilmclub/types';
import { api } from '../api';

interface Props {
  films: ThemeFilm[];
  onUpdated: () => void;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';
const STATUS_ORDER: FilmStatus[] = ['nominated', 'shortlisted', 'selected'];

export function FilmList({ films, onUpdated }: Props) {
  if (films.length === 0) {
    return <p style={{ color: '#999', fontSize: '0.85rem', fontStyle: 'italic' }}>No films yet.</p>;
  }

  const sorted = [...films].sort(
    (a, b) => STATUS_ORDER.indexOf(b.status) - STATUS_ORDER.indexOf(a.status)
  );

  const updateStatus = async (tmdbId: number, status: FilmStatus) => {
    await api.updateFilmStatus(tmdbId, status);
    onUpdated();
  };

  const remove = async (tmdbId: number) => {
    if (!confirm('Remove this film?')) return;
    await api.removeFilm(tmdbId);
    onUpdated();
  };

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {sorted.map(({ film, status }) => (
        <li
          key={film.tmdbId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 0',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {film.posterPath ? (
            <img
              src={`${TMDB_IMAGE_BASE}${film.posterPath}`}
              alt=""
              style={{ width: 30, height: 45, objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 30, height: 45, background: '#eee' }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: '0.85rem',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {film.title} <span style={{ color: '#999', fontWeight: 400 }}>({film.year})</span>
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>{film.director}</p>
          </div>
          <select
            value={status}
            onChange={(e) => updateStatus(film.tmdbId, e.target.value as FilmStatus)}
            style={{
              fontSize: '0.75rem',
              border: '1px solid #ccc',
              padding: '0.2rem',
              fontFamily: 'inherit',
            }}
          >
            <option value="nominated">Nominated</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="selected">Selected</option>
          </select>
          <button
            onClick={() => remove(film.tmdbId)}
            style={{
              fontSize: '0.75rem',
              color: '#B11226',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0.25rem',
            }}
            title="Remove"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Create CurrentCycle.tsx**

Create `admin/client/src/components/CurrentCycle.tsx`:

```tsx
import { useState, useEffect, useCallback } from 'react';
import type { Theme, FilmStatus } from '@bathfilmclub/types';
import { api } from '../api';
import { ThemeEditor } from './ThemeEditor';
import { FilmSearch } from './FilmSearch';
import { FilmList } from './FilmList';

type Section = 'theme' | 'films';

export function CurrentCyclePanel() {
  const [cycle, setCycle] = useState<Theme | null | undefined>(undefined);
  const [section, setSection] = useState<Section>('theme');
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setCycle(await api.getCurrentCycle());
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addFilm = async (tmdbId: number, status: FilmStatus) => {
    await api.addFilm(tmdbId, status);
    load();
  };

  const archive = async () => {
    if (
      !confirm(
        'Archive the current cycle? It will move to the archive and the current cycle will be cleared.'
      )
    )
      return;
    setArchiving(true);
    try {
      await api.archiveCycle();
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setArchiving(false);
    }
  };

  if (cycle === undefined) return <p style={{ color: '#666' }}>Loading…</p>;
  if (error) return <p style={{ color: '#B11226' }}>Error: {error}</p>;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '1.5rem',
        }}
      >
        <h2
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '1.2rem',
            margin: 0,
          }}
        >
          {cycle ? cycle.title : 'No active cycle'}
        </h2>
        {cycle && (
          <button
            onClick={archive}
            disabled={archiving}
            style={{
              fontSize: '0.75rem',
              color: '#B11226',
              background: 'none',
              border: '1px solid #B11226',
              padding: '0.3rem 0.75rem',
              cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            {archiving ? 'Archiving…' : 'Archive Cycle'}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['theme', 'films'] as Section[]).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            style={{
              fontSize: '0.75rem',
              padding: '0.3rem 0.75rem',
              background: section === s ? '#000' : 'transparent',
              color: section === s ? '#fff' : '#000',
              border: '1px solid #000',
              cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif',
              textTransform: 'capitalize',
            }}
          >
            {s === 'theme' ? 'Theme Details' : 'Films'}
          </button>
        ))}
      </div>

      {section === 'theme' && <ThemeEditor theme={cycle} onSaved={(t) => setCycle(t)} />}

      {section === 'films' && cycle && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.75rem',
              }}
            >
              Add Film
            </h3>
            <FilmSearch onAdd={addFilm} />
          </div>
          <div>
            <h3
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.75rem',
              }}
            >
              Films in Cycle ({cycle.films.length})
            </h3>
            <FilmList films={cycle.films} onUpdated={load} />
          </div>
        </div>
      )}

      {section === 'films' && !cycle && (
        <p style={{ color: '#999', fontSize: '0.85rem', fontStyle: 'italic' }}>
          Create a theme first before adding films.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add admin/client/src/components/
git commit -m "feat: admin UI — current cycle management with theme editor and film search"
```

---

### Task 19: Admin UI — Archive management

**Files:**

- Create: `admin/client/src/components/ArchiveManager.tsx`

- [ ] **Step 1: Create ArchiveManager.tsx**

Create `admin/client/src/components/ArchiveManager.tsx`:

```tsx
import { useState, useEffect } from 'react';
import type { Theme } from '@bathfilmclub/types';
import { api } from '../api';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  return new Date(parseInt(year), parseInt(m) - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

export function ArchivePanel() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getAllThemes()
      .then(setThemes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#666' }}>Loading…</p>;
  if (error) return <p style={{ color: '#B11226' }}>Error: {error}</p>;
  if (themes.length === 0) {
    return (
      <p style={{ color: '#999', fontStyle: 'italic', fontSize: '0.85rem' }}>
        No archived themes yet.
      </p>
    );
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: '1.2rem',
          marginBottom: '1.5rem',
        }}
      >
        Archive ({themes.length} themes)
      </h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {themes.map((theme) => {
          const selected = theme.films.filter((f) => f.status === 'selected');
          return (
            <li key={theme.slug} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <p
                    style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}
                  >
                    {theme.title}
                  </p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#666' }}>
                    {formatMonth(theme.month)} · {theme.films.length} films
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {selected.map(({ film }) =>
                    film.posterPath ? (
                      <img
                        key={film.tmdbId}
                        src={`${TMDB_IMAGE_BASE}${film.posterPath}`}
                        alt={film.title}
                        style={{ width: 20, height: 30, objectFit: 'cover' }}
                      />
                    ) : null
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add admin/client/src/components/ArchiveManager.tsx
git commit -m "feat: admin UI — archive panel"
```

---

## Phase 7: Integration

### Task 20: End-to-end smoke test + deployment config

**Files:**

- Create: `site/public/_headers` (Cloudflare Pages headers)
- Create: `site/public/_redirects`
- Create: `wrangler.toml` (optional — for Cloudflare Pages config)

- [ ] **Step 1: Start the admin server and verify the full flow**

First, add your real TMDb API key to `admin/.env`:

```
TMDB_API_KEY=<your real key>
DATA_DIR=../site/src/data
PORT=3001
```

Start the admin server:

```bash
npm run admin
```

Open `http://localhost:3000`. Verify in order:

1. "Theme Details" section shows the current theme (Time Travel) loaded from sample data
2. Edit the title, save — the JSON file `site/src/data/current.json` updates on disk
3. Switch to "Films" tab
4. Search for a film (e.g. "Alien") — results appear from TMDb
5. Click "nominated" on a result — it appears in the film list below
6. Change its status to "shortlisted" via the dropdown — updates immediately
7. Remove the test film
8. Switch to "Archive" tab — Folk Horror theme appears

Stop the admin server.

- [ ] **Step 2: Build the site from the modified data**

```bash
npm run site:build
```

Expected: Build succeeds. `site/dist/` contains the homepage, archive, and theme pages.

- [ ] **Step 3: Preview the built site**

```bash
npm run site:preview
```

Open `http://localhost:4321`. Verify:

- Homepage reflects the current data (any changes made via admin are present)
- Film pyramid renders correctly
- Archive page shows Folk Horror
- Theme detail page at `/theme/2025-03-folk-horror` renders correctly
- Clicking film posters opens the detail panel

Stop the preview server.

- [ ] **Step 4: Add Cloudflare Pages headers for caching**

Create `site/public/_headers`:

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable
```

Create `site/public/_redirects`:

```
/* /index.html 404
```

- [ ] **Step 5: Run the full test suite one final time**

```bash
npm test --workspace=site && npm test --workspace=admin
```

Expected: All tests PASS.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: integration smoke test, Cloudflare Pages config, project complete"
```

---

## Deployment

After completing all tasks, deploy the site to Cloudflare Pages:

1. Push the repo to GitHub.
2. In Cloudflare Pages: connect the repo, set build command `npm run site:build --workspace=site` and output directory `site/dist`.
3. No environment variables needed — the site is fully static.

The admin tool runs only locally via `npm run admin`. It is never deployed.

---

## Self-Review

**Spec coverage check:**

| Requirement                                                | Covered by                                              |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| Homepage: hero, current theme, meeting, film pyramid       | Task 10                                                 |
| Film pyramid with 3 rows (selected/shortlisted/nominated)  | Tasks 9–10                                              |
| Empty rows when cycle is partially progressed              | Task 7 (pyramid logic), Tasks 9–10                      |
| Slide-out film detail panel                                | Task 8                                                  |
| How the Club Works section                                 | Task 10                                                 |
| Archive with collapsible rows                              | Task 11                                                 |
| Archive search by film/theme/director                      | Task 11                                                 |
| Theme detail page with sidebar                             | Task 12                                                 |
| TMDb film data retrieval                                   | Task 15                                                 |
| Local admin tool (web server)                              | Tasks 13–19                                             |
| Admin: create/edit themes, meeting details                 | Task 17–18                                              |
| Admin: TMDb search and film selection                      | Task 18                                                 |
| Admin: assign film status (nominated/shortlisted/selected) | Tasks 16, 18                                            |
| Admin: archive management                                  | Task 16, 19                                             |
| Responsive mobile-first layout                             | Tailwind responsive prefixes used throughout Tasks 5–12 |
| Design system: Space Grotesk, Inter, black/white/red       | Task 5                                                  |
| Square motif as section markers                            | Task 5 (`section-label` class)                          |
| Static build, no auth, Cloudflare Pages                    | Tasks 4, 20                                             |
| Archive scales to 20+ years                                | Glob-based loading in data.ts; no fixed limits          |
| No admin functionality in public site                      | Confirmed — admin is a separate local tool              |

**No placeholders present.** All code blocks contain complete implementations.

**Type consistency check:** `Theme`, `Film`, `ThemeFilm`, `FilmStatus`, `Meeting` defined in Task 2 and used consistently across all subsequent tasks. `getPyramidRows` defined in Task 7 and called in Task 9's `FilmPyramid.astro`. `storage` singleton exported in Task 14 and imported by routes in Task 16. `api` typed client defined in Task 17 and used by all admin components in Tasks 18–19.
