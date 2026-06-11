# Bath Film Club — Technical Architecture

**Last updated:** 2026-06-11  
**Next review:** 2026-09-11 (quarterly)  
**Maintainer:** Av

---

## Overview

Bath Film Club is a static website for a Discord-based film discussion group. It serves two purposes:

1. **Public-facing website** — Shows the current film cycle, archive of past themes, and promotes Discord membership
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
│  - Archive (browse/search all themes)                        │
│  - Theme detail page (full theme record)                     │
│  - Film details panel (slide-in detail view)                │
└──────────────────┬──────────────────────────────────────────┘
                   │ reads
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                 │
│            (JSON files, version controlled)                  │
│  - site/src/data/current.json (active theme)                │
│  - site/src/data/themes/*.json (archive)                    │
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
| **Interactive components** | React (islands) | Film panel, pyramid, interactive elements |
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

**Why Express + React?**
- Minimal, familiar tooling for a local admin app
- Express handles file I/O and TMDb proxying safely
- React for interactive admin UI (search, form state, etc.)
- No database = one less thing to manage

### Monorepo Structure

| Package | Purpose |
|---------|---------|
| **site/** | Public Astro site |
| **admin/** | Express backend + React UI |
| **packages/types/** | Shared TypeScript definitions (Theme, Film, etc.) |

**Why monorepo?**
- Shared type definitions prevent drift between admin and site
- Single `npm install`, easy to work on both simultaneously
- Keeps related code together

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
   → Uses new management endpoints
```

### Displaying Content (Public Workflow)

```
1. During build: Astro reads site/src/data/
   → Reads current.json (homepage)
   → Reads themes/*.json (archive, theme detail pages)
   → Pre-renders all pages to static HTML

2. User visits site (on Cloudflare Pages)
   → Gets pre-rendered HTML (zero server calls)
   → React islands hydrate for interactivity (film panel)

3. User clicks film poster
   → React opens FilmPanel component
   → All data already in page (no API call needed)

4. User browses archive
   → Searches by film title, theme title, director
   → All data in memory (instant, no backend)
```

---

## Project Structure

```
bathfilmclub/
├── site/                          # Public website (Astro)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.astro        # Homepage
│   │   │   ├── archive.astro      # Archive page
│   │   │   └── theme/[slug].astro # Theme detail page
│   │   ├── components/
│   │   │   ├── FilmPyramid.astro  # The pyramid visualization
│   │   │   ├── FilmPanel.tsx      # Detail panel (React island)
│   │   │   └── ...
│   │   ├── layouts/
│   │   │   └── Layout.astro       # Base template
│   │   ├── utils/
│   │   │   └── data.ts            # File I/O, data fetching
│   │   └── data/
│   │       ├── current.json       # Active theme (homepage)
│   │       └── themes/            # Archive
│   │           └── 2026-06-*.json
│   └── astro.config.mjs
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
│           │   ├── CurrentCycle.tsx # Edit active theme
│           │   ├── ArchiveManager.tsx # Manage archived themes
│           │   ├── FilmSearch.tsx    # TMDb search UI
│           │   └── ThemeEditor.tsx   # Form for theme details
│           └── api.ts            # HTTP client
│
├── packages/types/
│   └── src/index.ts              # Shared TS definitions
│
└── docs/
    ├── BathFilmClub_Brief.txt    # Design brief
    ├── ARCHITECTURE.md           # This file
    └── superpowers/plans/        # Implementation plans
```

---

## How to Extend

### Add a New Field to Film Data

1. **Update type definition** (`packages/types/src/index.ts`)
   - Add field to `Film` interface
   - Update JSDoc comment

2. **Update TMDb fetcher** (`admin/server/tmdb.ts`)
   - Extract new field from TMDb API response
   - Handle missing values gracefully

3. **Update theme editor** (`admin/client/src/components/ThemeEditor.tsx`)
   - Add input field if admin should edit it
   - Validate on submit

4. **Update display** (`site/src/components/FilmPanel.tsx`)
   - Add new field to detail panel
   - Apply appropriate styling

5. **Test end-to-end**
   - Add a film in admin tool
   - Verify it appears correctly on site

### Add a New Page to the Site

1. Create new `.astro` file in `site/src/pages/`
   - Use Layout component
   - Import data with `getAllThemes()` or `getCurrentCycle()`

2. Use existing components (Header, Footer, FilmPyramid, etc.)

3. Run `npm run site:dev` to test locally

4. Deploy automatically on push (Cloudflare Pages integration)

### Change How Themes Are Organized

Currently organized by:
- **Homepage** — current cycle only
- **Archive** — all past themes, grouped by year, newest first
- **Theme detail page** — full record for one theme

To change (e.g., add filtering, different grouping):

1. **Archive logic** → `site/src/pages/archive.astro`
2. **Search** → `site/src/components/ArchiveSearch.tsx` (currently doesn't exist; would need building)
3. **Data utility functions** → `site/src/utils/data.ts`

---

## Key Files Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `packages/types/src/index.ts` | Film/Theme/Meeting types | Adding new data fields |
| `site/src/data/current.json` | Active theme | Only via admin tool |
| `site/src/data/themes/*.json` | Archived themes | Only via admin tool |
| `admin/server/routes/themes.ts` | Theme CRUD API | Adding new admin features |
| `admin/server/storage.ts` | File I/O logic | If changing how data is stored |
| `admin/server/tmdb.ts` | TMDb API calls | If TMDb API changes or new fields needed |
| `site/src/components/FilmPanel.tsx` | Film detail view | Visual tweaks or new fields |
| `site/src/components/FilmPyramid.astro` | Pyramid visualization | Layout/styling of nominated/shortlisted/selected |

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

**Local only** — runs on developer's machine (`npm run admin:dev`).

Not deployed anywhere; used only by administrator locally.

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

### Data

- **Version controlled** — all changes tracked in git
- **No secrets in files** — API keys in `.env` only
- **Backed up** — GitHub is the backup

---

## Maintenance

### Regular Tasks

| Task | Frequency | Owner | Notes |
|------|-----------|-------|-------|
| **Update this doc** | Quarterly | Av | Review tech decisions, add learnings |
| **Update dependencies** | As needed | Av | Run `npm outdated`, update carefully |
| **Monitor site performance** | Monthly | Av | Check Cloudflare analytics |
| **Backup data** | Ongoing | Git | Commit theme changes regularly |
| **Review TMDb API** | If issues arise | Av | Check for breaking changes |

### Monitoring Checklist

- [ ] Site builds on push (check Cloudflare Pages)
- [ ] No console errors in browser
- [ ] Film panel displays correctly
- [ ] Archive search works
- [ ] Admin tool can add/edit themes without errors

### Troubleshooting

**"Theme not found" error in admin**
- Check that `site/src/data/themes/` exists
- Verify JSON files are valid (use `npm run site:build`)

**Missing film metadata on site**
- Run admin tool, re-add film to refresh TMDb data
- Check TMDb API key in `admin/.env`

**Slow site**
- Check Cloudflare Pages analytics
- Verify images are being served from TMDb CDN
- Consider image optimization if needed

**Admin tool won't start**
- Check `admin/.env` has `TMDB_API_KEY` and `DATA_DIR`
- Run `npm install` to ensure dependencies
- Check ports 3000 and 3001 aren't in use

---

## Design Philosophy

**Why we do it this way:**

1. **Static HTML for public site** — Maximum speed, minimal hosting cost, zero maintenance
2. **Local admin tool** — All complexity hidden from users, single admin can manage everything
3. **File-based data** — Version control, no database to manage, easy backup
4. **TMDb for metadata** — No manual data entry, metadata stays fresh
5. **TypeScript everywhere** — Catch errors at compile time, safe refactoring
6. **Monorepo** — Shared types prevent bugs, easier to maintain

**Tradeoffs we've accepted:**

- **No real-time updates** — New themes require a rebuild (fine; themes change monthly)
- **No user interaction** — All voting happens in Discord (intentional; keeps site simple)
- **Single admin** — Not built for team collaboration (fine; one person runs the club)
- **Static hosting only** — Can't do dynamic queries (fine; static site is fast and cheap)

---

## Next Steps for Extensions

If you want to add new features in the future, consider:

- **Full-text search** → Would need build-time indexing (possible in Astro)
- **Film detail pages** → Create `site/src/pages/film/[id].astro` using `films.map()` from all themes
- **Export/import themes** → Add admin API endpoint for bulk operations
- **Analytics** → Cloudflare has built-in analytics; check dashboard

---

## Questions?

If something in this doc is unclear or out of date, please update it and note the changes in git commit message.
