# Bath Film Club — Technical Architecture

**Last updated:** 2026-06-20
**Next review:** 2026-09-20 (quarterly)
**Maintainer:** Av

---

## Overview

Bath Film Club is a static website for a Discord-based film discussion group. It serves two purposes:

1. **Public-facing website** — Shows the current film cycle, past themes via a slide-in drawer, a search/filter page, and promotes Discord membership
2. **Local admin tool** — Allows one administrator to manage themes and films via TMDb integration

The site is designed to be lightweight, fast, and maintenance-free for the public, with all complexity isolated in the admin tool.

---

## Why This Architecture?

**Design constraints:**
- No user accounts, voting, or public interaction (all happens in Discord)
- Single administrator, no team coordination
- Needs to scale to decades of monthly themes without degradation
- Must be inexpensive to host
- Should feel like a curated archive, not a social platform

**Solution:**
- **Static generation** (Astro) → no servers to manage, cheap hosting (Cloudflare Pages)
- **Separation of concerns** → admin tool (local) handles complexity, public site is pure data consumption
- **File-based data** → no database needed, easy to version control and backup
- **TMDb integration** → no manual data entry, metadata stays current

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PUBLIC WEBSITE                           │
│                    (Static HTML/CSS/JS)                      │
│                     Cloudflare Pages                         │
│  - Homepage (current theme + pyramid)                        │
│  - Search page (filter + full-text search all films/themes) │
│  - Theme detail page (full theme record + pyramid)           │
│  - ThemeDrawer (slide-in nav, available on all pages)        │
│  - FilmPanel (slide-in detail view, opened from any poster)  │
└──────────────────┬──────────────────────────────────────────┘
                   │ reads
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                 │
│            (JSON files, version controlled)                  │
│  - site/src/data/current.json (active theme)                │
│  - site/src/data/themes/*.json (archived themes)            │
│  - packages/types/src/index.ts (TypeScript definitions)    │
└──────────────────▲──────────────────────────────────────────┘
                   │ written by
                   │
┌─────────────────────────────────────────────────────────────┐
│                ADMIN TOOL (Local only)                       │
│         Express API (3001) + React UI (3000)                │
│  - Search films on TMDb                                      │
│  - Create/edit themes                                        │
│  - Add films with status (nominated/shortlisted/selected)   │
│  - Archive/restore/delete themes                            │
│  - Manage theme metadata (title, description, meeting)      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
          ┌─────────────────┐
          │  TMDb API       │
          │  (Film metadata)│
          └─────────────────┘
```

---

## Technology Stack

### Frontend (Public Site)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Astro 4 | Static site generation, pre-renders at build time |
| **Interactive components** | React 18 (islands) | ThemeDrawer, SearchPage, FilmPanel, PyramidIsland |
| **Styling** | Tailwind CSS | Utility-first CSS, responsive design |
| **Build target** | Cloudflare Pages | Deployment, no server cost |
| **Dev server** | `npm run site:dev` → port 4321 | Local development |

**Why Astro?**
- Zero JavaScript by default — only React islands when needed
- Builds to static HTML → fast, cheap to host
- Great TypeScript support
- File-based routing matches our simple site structure

### Admin Tool (Local)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend** | Express 4 | REST API, file I/O, TMDb proxy |
| **Frontend** | React + Vite | Admin UI, search, theme editor |
| **Dev server** | `npm run admin:dev` | Runs both simultaneously |
| **Database** | None | File-based (JSON) |
| **TMDb Integration** | Official API | Film metadata lookup |

### Monorepo Structure

| Package | Purpose |
|---------|---------|
| **site/** | Public Astro site |
| **admin/** | Express backend + React UI |
| **packages/types/** | Shared TypeScript definitions (Theme, Film, etc.) |

---

## Data Model

### Theme

```typescript
interface Theme {
  slug: string;        // "2026-06-black-and-white" — unique, URL-safe
  title: string;       // "Black And White"
  description?: string; // Optional theme explanation
  month: string;       // "2026-06" — YYYY-MM, used for grouping/sorting
  meeting?: Meeting;   // Optional meeting details
  films: ThemeFilm[];  // All nominated/shortlisted/selected films
}

interface ThemeFilm {
  film: Film;          // Full film metadata (from TMDb)
  status: FilmStatus;  // 'nominated' | 'shortlisted' | 'selected'
}

interface Meeting {
  date: string;        // ISO 8601 "2026-06-15"
  time: string;        // 24-hour "19:30"
  venue?: string;      // Optional location
}
```

### Film

```typescript
interface Film {
  tmdbId: number;           // TMDb API ID
  title: string;
  year: number;
  runtime: number;          // minutes
  genres: string[];         // ["Horror", "Thriller"]
  synopsis: string;
  director: string;
  producers: string[];      // up to 3
  cast: string[];           // top 5 billed
  posterPath: string;       // "/path/to/poster.jpg" (TMDb format)
  backdropPath?: string;    // optional
  rating?: number;          // TMDb vote_average
  trailerKey?: string;      // YouTube video key
}
```

**Design rationale:**
- **slug** — human-readable, immutable identifier; used in URLs and file paths
- **month** — enables archive organization by year; separate from slug for flexibility
- **status** — tracks film's position in selection process
- **Film metadata** — enriched from TMDb; comprehensive enough for detail panel

---

## Data Flow

### Adding a Film (Admin Workflow)

```
1. Admin creates new theme in admin tool
   → Becomes "current cycle" (site/src/data/current.json)

2. Admin searches for film by title
   → Express proxies request to TMDb API
   → TMDb returns matching films

3. Admin selects a film and assigns status
   → Express fetches full film metadata from TMDb
   → Stores film + status in current cycle (JSON)

4. Admin repeats for all films in theme

5. Admin clicks "Archive Cycle"
   → Express saves current.json as new theme file
     (e.g., site/src/data/themes/2026-06-black-and-white.json)
   → Clears current.json for next theme

6. Admin can edit/restore/delete archived themes
   → Uses management endpoints
```

### Displaying Content (Public Workflow)

```
1. During build: Astro reads site/src/data/
   → Reads current.json (homepage)
   → Reads themes/*.json (theme detail pages, search page, ThemeDrawer)
   → Pre-renders all pages to static HTML

2. User visits site (on Cloudflare Pages)
   → Gets pre-rendered HTML (zero server calls)
   → React islands hydrate for interactivity (ThemeDrawer, SearchPage, FilmPanel)

3. User clicks film poster
   → React opens FilmPanel component
   → All data already in page (no API call needed)

4. User opens ThemeDrawer (Browse button, all pages)
   → Slide-in panel lists all archived themes grouped by year
   → Current theme highlighted (on theme detail pages)

5. User visits search page
   → Default view: poster grid of all shortlisted films
   → Filter pills (status + month) narrow the poster grid or results list
   → Text search (≥2 chars) finds films by title/director and themes by title
   → Filters and text search combine
   → Clicking any film result opens FilmPanel
```

---

## Project Structure

```
bathfilmclub/
├── site/                          # Public website (Astro)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.astro        # Homepage (current theme + pyramid)
│   │   │   ├── search.astro       # Search & filter page
│   │   │   └── theme/[slug].astro # Theme detail page (static paths)
│   │   ├── components/
│   │   │   ├── Header.astro       # 3-column nav (Browse | title | search)
│   │   │   ├── Footer.astro       # Discord CTA + nav links + copyright
│   │   │   ├── ThemeDrawer.tsx    # Slide-in theme nav (React island)
│   │   │   ├── SearchPage.tsx     # Search + filter UI (React island)
│   │   │   ├── FilmPyramid.astro  # Pyramid visualization (Astro wrapper)
│   │   │   ├── PyramidIsland.tsx  # Pyramid interactivity (React island)
│   │   │   ├── FilmCard.tsx       # Individual film poster card
│   │   │   ├── FilmPanel.tsx      # Slide-in film detail panel (React island)
│   │   │   ├── HowItWorks.astro   # Process explanation section
│   │   │   └── SectionTitle.astro # Reusable section label
│   │   ├── layouts/
│   │   │   └── Layout.astro       # Base template (flex column for sticky footer)
│   │   ├── utils/
│   │   │   ├── data.ts            # getAllThemes(), getCurrentCycle(), formatMonth()
│   │   │   └── pyramid.ts         # getPyramidRows() — splits films by status
│   │   └── data/
│   │       ├── current.json       # Active theme (homepage)
│   │       └── themes/            # Archived themes
│   │           └── 2026-*.json
│   ├── astro.config.ts
│   └── tailwind.config.ts
│
├── admin/                         # Admin tool (Express + React)
│   ├── server/
│   │   ├── index.ts              # Express app, routes setup
│   │   ├── routes/
│   │   │   ├── themes.ts         # Theme CRUD
│   │   │   ├── films.ts          # Film management
│   │   │   └── search.ts         # TMDb search proxy
│   │   ├── storage.ts            # File I/O (JSON)
│   │   └── tmdb.ts               # TMDb API client
│   └── client/
│       └── src/
│           ├── components/
│           │   ├── CurrentCycle.tsx  # Edit active theme
│           │   ├── ArchiveManager.tsx # Manage archived themes
│           │   ├── FilmSearch.tsx    # TMDb search UI
│           │   └── ThemeEditor.tsx   # Form for theme details
│           └── api.ts            # HTTP client
│
├── packages/types/
│   └── src/index.ts              # Shared TS definitions
│
└── docs/
    ├── ARCHITECTURE.md           # This file
    ├── DESIGN_SYSTEM.md          # Visual language and component patterns
    └── superpowers/plans/        # Implementation plans
```

---

## Key Files Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `packages/types/src/index.ts` | Film/Theme/Meeting types | Adding new data fields |
| `site/src/data/current.json` | Active theme | Only via admin tool |
| `site/src/data/themes/*.json` | Archived themes | Only via admin tool |
| `site/src/utils/data.ts` | Data fetching helpers | Adding new query patterns |
| `site/src/components/Header.astro` | Global nav bar | Layout or nav changes |
| `site/src/components/ThemeDrawer.tsx` | Theme navigation drawer | Drawer behaviour or styling |
| `site/src/components/SearchPage.tsx` | Search + filter UI | New filter types, result layout |
| `site/src/components/FilmPanel.tsx` | Film detail view | Visual tweaks or new fields |
| `site/src/components/FilmPyramid.astro` | Pyramid Astro wrapper | Rarely |
| `site/src/components/PyramidIsland.tsx` | Pyramid React island | Pyramid layout/behaviour |
| `site/src/layouts/Layout.astro` | Page shell | Global layout or meta changes |
| `admin/server/routes/themes.ts` | Theme CRUD API | Adding new admin features |
| `admin/server/tmdb.ts` | TMDb API calls | If TMDb API changes or new fields needed |

---

## How to Extend

### Add a New Field to Film Data

1. **Update type definition** (`packages/types/src/index.ts`)
2. **Update TMDb fetcher** (`admin/server/tmdb.ts`) — extract field from API response
3. **Update display** (`site/src/components/FilmPanel.tsx`) — add to detail panel

### Add a New Page to the Site

1. Create new `.astro` file in `site/src/pages/`
2. Import `getAllThemes()` if needed; pass themes to `<Header>`
3. Use Layout, Header, Footer components
4. Run `npm run site:dev` to test locally

### Change How Themes Are Organised

- **ThemeDrawer** (`site/src/components/ThemeDrawer.tsx`) — controls grouping/sorting in the slide-in nav
- **SearchPage** (`site/src/components/SearchPage.tsx`) — controls filter logic and result display
- **Data utility** (`site/src/utils/data.ts`) — `getAllThemes()` sorts newest-first by month

---

## Deployment

### Public Site

Deployed to **Cloudflare Pages** via GitHub integration:

1. Push to `main` branch
2. Cloudflare automatically builds with `npm run site:build`
3. Outputs static HTML to `site/dist/`
4. Serves from `https://bathfilmclub.pages.dev` (or custom domain)

**No manual deploy needed.** Just commit and push.

### Admin Tool

**Local only** — runs on developer's machine (`npm run admin:dev`). Not deployed anywhere.

---

## Security Considerations

### Admin Tool
- **File validation** — slug validation prevents path traversal
- **TMDb API key** — kept in `admin/.env`, never committed
- **Local only** — no public access, runs on `localhost`

### Public Site
- **Static HTML** — no server-side execution, minimal attack surface
- **No user input** — no forms to exploit
- **No authentication** — nothing to breach
- **Read-only** — all edits happen offline, published as files

---

## Maintenance

### Monitoring Checklist

- [ ] Site builds on push (check Cloudflare Pages)
- [ ] No console errors in browser
- [ ] ThemeDrawer opens on all pages, highlights current theme on theme pages
- [ ] Film panel opens from posters on homepage, theme pages, and search page
- [ ] Search page: poster grid loads, filters work, text search returns results
- [ ] Admin tool can add/edit themes without errors

### Troubleshooting

**"Theme not found" error in admin**
- Verify JSON files are valid (use `npm run site:build`)
- Check that `site/src/data/themes/` exists

**Missing film metadata on site**
- Run admin tool, re-add film to refresh TMDb data
- Check TMDb API key in `admin/.env`

**Admin tool won't start**
- Check `admin/.env` has `TMDB_API_KEY` and `DATA_DIR`
- Run `npm install` to ensure dependencies
- Check ports 3000 and 3001 aren't in use

---

## Design Philosophy

1. **Static HTML for public site** — Maximum speed, minimal hosting cost, zero maintenance
2. **Local admin tool** — All complexity hidden from users, single admin can manage everything
3. **File-based data** — Version control, no database to manage, easy backup
4. **TMDb for metadata** — No manual data entry, metadata stays fresh
5. **TypeScript everywhere** — Catch errors at compile time, safe refactoring
6. **Monorepo** — Shared types prevent bugs, easier to maintain

**Tradeoffs accepted:**
- **No real-time updates** — New themes require a rebuild (fine; themes change monthly)
- **No user interaction** — All voting happens in Discord (intentional; keeps site simple)
- **Single admin** — Not built for team collaboration (fine; one person runs the club)
