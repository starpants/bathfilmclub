# Bath Film Club — Technical Architecture

**Last updated:** 2026-06-23
**Next review:** 2026-09-22 (quarterly)
**Maintainer:** Av

---

## Overview

Bath Film Club is a static website for a Discord-based film discussion group. It serves two purposes:

1. **Public-facing website** — Shows the current film cycle, past themes via a slide-in drawer, a search/filter page, and promotes Discord membership
2. **Local admin tool** — Allows one administrator to manage themes and films via TMDb integration

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
│  - Homepage (hero + intro + current theme + pyramid)         │
│  - Search page (filter + full-text search all films/themes) │
│  - Theme detail page (full theme record + pyramid)           │
│  - MenuDrawer (slide-in nav, available on all pages)         │
│  - FilmPanel (slide-in detail view, opened from any poster)  │
└──────────────────┬──────────────────────────────────────────┘
                   │ reads
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                 │
│            (JSON files, version controlled)                  │
│  - site/src/data/current.json  (active theme — authoritative)│
│  - site/src/data/themes/*.json (archived themes)            │
│  - packages/types/src/index.ts (TypeScript definitions)     │
└──────────────────▲──────────────────────────────────────────┘
                   │ written by
┌─────────────────────────────────────────────────────────────┐
│                ADMIN TOOL (Local only)                       │
│         Express API (3001) + React UI (3000)                │
│  - Search films on TMDb                                      │
│  - Create/edit themes                                        │
│  - Add films with status (nominated/shortlisted/selected)   │
│  - Archive/restore/delete themes                            │
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
| **Interactive components** | React 18 (islands) | MenuDrawer, SearchPage, FilmPanel, PyramidIsland |
| **Styling** | Tailwind CSS | Utility-first CSS, responsive design |
| **Build target** | Cloudflare Workers (Static Assets) | Deployment, no server cost |
| **Dev server** | `npm run site:dev` → port 4321 | Local development |

### Admin Tool (Local)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend** | Express 4 | REST API, file I/O, TMDb proxy |
| **Frontend** | React + Vite | Admin UI, search, theme editor |
| **Dev server** | `npm run admin:dev` | Runs both simultaneously |
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
  description?: string;
  month: string;       // "2026-06" — YYYY-MM
  meeting?: Meeting;
  films: ThemeFilm[];
}

interface ThemeFilm {
  film: Film;
  status: FilmStatus;  // 'nominated' | 'shortlisted' | 'selected'
}

interface Meeting {
  date: string;        // ISO 8601 "2026-06-15"
  time: string;        // 24-hour "19:30"
  venue?: string;
}
```

### Film

```typescript
interface Film {
  tmdbId: number;
  title: string;
  year: number;
  runtime: number;
  genres: string[];
  synopsis: string;
  director: string;
  producers: string[];
  cast: string[];
  posterPath: string;
  backdropPath?: string;
  rating?: number;
  trailerKey?: string;
}
```

---

## Data Flow

### Key Rule: current.json is Authoritative

`getAllThemes()` merges `current.json` into the themes list, giving it priority over any archived copy with the same slug:

```typescript
export async function getAllThemes(): Promise<Theme[]> {
  const archived = Object.values(
    import.meta.glob('../data/themes/*.json', { eager: true })
  ).map((m) => m.default);

  const current = await getCurrentCycle();
  const themes = current
    ? [current, ...archived.filter((t) => t.slug !== current.slug)]
    : archived;

  return themes.sort((a, b) => b.month.localeCompare(a.month));
}
```

This ensures MenuDrawer, search page, and theme detail pages always show the same film counts as the homepage.

### Adding a Film (Admin Workflow)

```
1. Admin creates new theme → becomes current.json
2. Admin searches TMDb → Express proxies request
3. Admin selects film + assigns status → stored in current.json
4. Admin clicks "Archive Cycle" → saved as themes/[slug].json, current.json cleared
5. Admin can edit/restore/delete archived themes
```

### Displaying Content (Public Workflow)

```
1. Build: Astro reads site/src/data/
   → current.json (homepage + merged into getAllThemes())
   → themes/*.json (archived, deduped by slug against current)
   → Pre-renders all pages to static HTML

2. User visits (Cloudflare Pages)
   → Gets pre-rendered HTML (zero server calls)
   → React islands hydrate for interactivity

3. User clicks film poster → FilmPanel opens (data already in page)

4. User opens MenuDrawer → lists all themes including current cycle

5. User visits search page → filters + search across all films/themes
```

---

## Project Structure

```
bathfilmclub/
├── site/                          # Public website (Astro)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.astro        # Homepage
│   │   │   ├── search.astro       # Search & filter page
│   │   │   ├── 404.astro          # 404 page (no header/footer; standalone)
│   │   │   └── theme/[slug].astro # Theme detail page
│   │   ├── components/
│   │   │   ├── NavBar.astro       # Shared nav buttons (used in Header + Footer)
│   │   │   ├── Header.astro       # Page header — wraps NavBar
│   │   │   ├── Footer.astro       # Page footer — wraps NavBar + copyright
│   │   │   ├── Hero.astro         # Homepage hero: logo + tagline + Discord CTA
│   │   │   ├── Introduction.astro # "How it works" section (homepage)
│   │   │   ├── NextEvent.astro    # Current theme + upcoming meeting (homepage)
│   │   │   ├── LogoLandscape.astro # Inline SVG logo (landscape), fill-bfc-brand-fg
│   │   │   ├── LogoStacked.astro  # Inline SVG logo (stacked), fill-bfc-brand-fg
│   │   │   ├── DiscordButton.astro # Reusable Discord CTA (URL defined here)
│   │   │   ├── MenuDrawer.tsx     # Slide-in theme nav (React island)
│   │   │   ├── SearchPage.tsx     # Search + filter UI (React island)
│   │   │   ├── FilmPyramid.astro  # Pyramid wrapper (splits films by status)
│   │   │   ├── PyramidIsland.tsx  # Pyramid interactivity (React island)
│   │   │   ├── FilmStrip.tsx      # 8-square film negative motif (decorative)
│   │   │   ├── FilmCard.tsx       # Individual film poster card
│   │   │   ├── FilmPanel.tsx      # Slide-in film detail panel (React island)
│   │   │   └── SectionTitle.astro # Reusable section label
│   │   ├── layouts/
│   │   │   └── Layout.astro       # Base template (flex column for sticky footer)
│   │   ├── styles/
│   │   │   └── global.css         # Google Fonts import, base styles, component classes
│   │   ├── utils/
│   │   │   ├── data.ts            # getAllThemes(), getCurrentCycle(), formatMonth()
│   │   │   └── pyramid.ts         # getPyramidRows()
│   │   └── data/
│   │       ├── current.json       # Active theme (authoritative)
│   │       └── themes/            # Archived themes (*.json)
│   ├── public/assets/             # Static assets (SVG logos, BathFilmClub.png OG image)
│   ├── public/_headers            # Cloudflare cache-control rules
│   ├── astro.config.ts            # site URL configured here (needed for og:image)
│   └── tailwind.config.ts
│
├── wrangler.toml                  # Cloudflare Workers deploy config (repo root)
│
├── admin/                         # Admin tool (Express + React, local only)
│   ├── server/
│   │   ├── index.ts
│   │   ├── routes/themes.ts
│   │   ├── routes/films.ts
│   │   ├── routes/search.ts
│   │   ├── storage.ts
│   │   └── tmdb.ts
│   └── client/src/
│       ├── index.css              # Brand colours + fonts (mirrors main site)
│       ├── main.tsx
│       ├── App.tsx
│       └── components/
│           ├── CurrentCycle.tsx
│           ├── ArchiveManager.tsx
│           ├── FilmSearch.tsx
│           ├── FilmList.tsx
│           └── ThemeEditor.tsx
│
├── packages/types/
│   └── src/index.ts              # Shared TS definitions
│
└── docs/
    ├── ARCHITECTURE.md           # This file
    └── DESIGN_SYSTEM.md          # Visual language and component patterns
```

---

## Key Files Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `packages/types/src/index.ts` | Film/Theme/Meeting types | Adding new data fields |
| `site/src/data/current.json` | Active theme | Only via admin tool |
| `site/src/data/themes/*.json` | Archived themes | Only via admin tool |
| `site/src/utils/data.ts` | Data fetching (current.json takes priority) | Adding new query patterns |
| `site/src/styles/global.css` | Google Fonts import, base styles, `.section-label`, `.btn-discord` | Global style changes |
| `site/tailwind.config.ts` | `bfc-*` colour tokens, font families, breakpoints | Colour/font changes |
| `site/src/components/NavBar.astro` | Shared nav buttons with active/inactive state | Nav layout or button changes |
| `site/src/components/Header.astro` | Page header wrapper | Header structural changes |
| `site/src/components/Footer.astro` | Page footer wrapper | Footer structural changes |
| `site/src/components/MenuDrawer.tsx` | Slide-in theme nav with accordion years | Drawer behaviour or styling |
| `site/src/components/DiscordButton.astro` | Discord CTA — URL lives here | Changing Discord invite link |
| `site/src/components/SearchPage.tsx` | Search + filter UI | New filter types, result layout |
| `site/src/components/FilmPanel.tsx` | Film detail view | Visual tweaks or new fields |
| `site/src/components/PyramidIsland.tsx` | Pyramid with coloured band rows | Pyramid layout/behaviour |
| `site/src/layouts/Layout.astro` | Page shell, OG/Twitter meta tags | Global layout or meta changes |
| `site/src/pages/404.astro` | Standalone 404 (no Layout) | 404 content or styling |
| `site/astro.config.ts` | Site URL (used for og:image) | When deploying to a new domain |
| `wrangler.toml` | Cloudflare Workers deploy config | Changing worker name or asset dir |

---

## How to Extend

### Add a New Field to Film Data

1. Update `packages/types/src/index.ts`
2. Update `admin/server/tmdb.ts` — extract field from API response
3. Update `site/src/components/FilmPanel.tsx` — add to detail panel

### Add a New Page to the Site

1. Create `.astro` file in `site/src/pages/`
2. Import `getAllThemes()`; pass to `<Header themes={allThemes} />`
3. Use Layout, Header components as needed (Footer is included via Layout automatically)
4. Run `npm run site:dev` to test locally

### Change Discord Invite Link

Edit `site/src/components/DiscordButton.astro` — `DISCORD_URL` constant at the top.

### Change Pyramid Band Colours

In `site/src/components/PyramidIsland.tsx`, update the `bgClass` and `accentClass` props on each `FilmRow`. Colour values are defined in `tailwind.config.ts` under `bfc-tier`.

---

## Deployment

Deployed to **Cloudflare Workers** (Static Assets) via GitHub integration:

1. Push to `main` branch
2. Cloudflare builds with `npm run site:build`
3. Deploys with `npx wrangler deploy` (wrangler is a root devDependency — no download step)
4. Config: `wrangler.toml` at repo root, `directory = "./site/dist"`, `not_found_handling = "404-page"`

To update the site URL (needed for `og:image` absolute URL), edit `site` in `site/astro.config.ts`.

Admin tool is **local only** — not deployed.

---

## Security Considerations

### Admin Tool
- Slug validation prevents path traversal
- TMDb API key in `admin/.env`, never committed
- Local only — no public access

### Public Site
- Static HTML — no server-side execution
- No user input — no forms to exploit
- Read-only — all edits happen offline

---

## Maintenance

### Monitoring Checklist

- [ ] Site builds on push (check Cloudflare Pages dashboard)
- [ ] No console errors in browser
- [ ] MenuDrawer opens on all pages; highlights current theme on theme detail pages
- [ ] Film pyramid shows same counts on homepage and theme detail page
- [ ] Film panel opens from posters on homepage, theme pages, and search page
- [ ] Search page: poster grid loads, filters work, text search returns results
- [ ] Admin tool can add/edit themes without errors

### Troubleshooting

**Theme detail page shows fewer films than homepage**
- Means `current.json` was updated but `getAllThemes()` isn't picking it up
- Check that `data.ts` merges `current.json` with priority (see Key Rule above)
- Rebuild the site (`npm run site:build`) to pick up changes

**"Theme not found" in admin**
- Verify JSON files are valid: `npm run site:build`
- Check `site/src/data/themes/` exists

**Missing film metadata on site**
- Re-add film in admin tool to refresh TMDb data
- Check TMDb API key in `admin/.env`

**Admin tool won't start**
- Check `admin/.env` has `TMDB_API_KEY` and `DATA_DIR`
- Run `npm install`
- Check ports 3000 and 3001 aren't in use

---

## Design Philosophy

1. **Static HTML** — Maximum speed, minimal hosting cost, zero maintenance
2. **Local admin tool** — All complexity hidden from users
3. **File-based data** — Version control, no database to manage
4. **current.json is authoritative** — Active theme data always wins over stale archives
5. **TypeScript everywhere** — Catch errors at compile time
6. **Monorepo** — Shared types prevent bugs

**Tradeoffs accepted:**
- No real-time updates — rebuilds required (fine; themes change monthly)
- No user interaction — voting happens in Discord (intentional)
- Single admin — not built for team collaboration (intentional)
