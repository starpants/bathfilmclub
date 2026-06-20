# Bath Film Club — Design System & Visual Language

**Last updated:** 2026-06-20
**Next review:** 2026-09-20 (quarterly)
**Maintainer:** Av

---

## Overview

The Bath Film Club site visual design is built on a foundation of:

- **Minimal aesthetic** — Let film posters drive the visual interest
- **Editorial typography** — Strong hierarchy, contemporary typefaces
- **Grid-based layout** — Alignment and consistency across all pages
- **Iconic motif** — Square symbol from the logo, reused throughout
- **Restrained colour palette** — Black, white, and a carefully chosen red

The site should feel like a **curated film archive** or **arts organisation**, not a commercial cinema or social platform.

---

## Colour Palette

### Primary Colours

| Name | Hex | Usage |
|------|-----|-------|
| **Brand Red** | `#860909` | Buttons, accents, pyramid row headings |
| **Brand Black** | `#000000` | Page background |
| **Brand White** | `#FFFFFF` | Primary text, active nav states, film panel background |

### Supporting Greys (Neutral Scale)

```
400  #A3A3A3  secondary text, labels, section markers
600  #525252  borders, dividers on dark backgrounds
700  #404040  darker borders
800  #262626  very dark backgrounds (e.g. poster placeholder)
900  #171717  ThemeDrawer background (elevated surface above pure black)
```

**Usage patterns:**
- **Text hierarchy**: white (primary) → neutral-400 (secondary) → neutral-600 (tertiary)
- **Dividers**: neutral-600 on dark backgrounds
- **Elevated surfaces**: neutral-900 (ThemeDrawer panel, one step above page black)
- **Empty states**: neutral-800 (poster placeholder boxes)

### In Code

```typescript
// tailwind.config.ts
colors: {
  brand: {
    red: '#860909',
    black: '#000000',
    white: '#FFFFFF',
    green: '#22C55E',     // selected film status tag
    mustard: '#EABB16',   // shortlisted film status tag
  },
  neutral: { 400, 600, 700, 800, 900 }
}
```

---

## Typography System

### Fonts

| Font | Stack | Usage | Weight |
|------|-------|-------|--------|
| **Urbanist** | Urbanist, sans-serif | Headings, labels, nav, UI elements | 500, 600, 700 |
| **Inter** | Inter, sans-serif | Body text, descriptions, film metadata | 400, 500, 600 |

Both imported from Google Fonts.

### Type Scale

| Role | Font | Size | Weight | Tracking | Color |
|------|------|------|--------|----------|-------|
| **Page title** | Urbanist | 5xl (48px) | 700 | normal | white |
| **Section title** | Urbanist | 2xl (24px) | 700 | normal | white |
| **Nav / UI labels** | Urbanist | sm (14px) | 600 | wide | white |
| **Section marker** | Urbanist | xs (12px) | 700 | widest | neutral-400 |
| **Body paragraph** | Inter | base (16px) | 400 | normal | neutral-300/400 |
| **Secondary text** | Inter | sm (14px) | 400 | normal | neutral-400 |
| **Caption / meta** | Inter | xs (12px) | 400 | normal | neutral-400 |

### Section Label (Square Motif)

The square from the Bath Film Club logo marks major sections.

```html
<p class="section-label">Film Selection</p>
<!-- renders: ■ FILM SELECTION -->
```

```css
.section-label {
  @apply flex items-center gap-2 text-xs font-heading font-bold
         uppercase tracking-widest text-neutral-400;
}
.section-label::before {
  content: '■';
  @apply text-neutral-400 mb-[0.05em] text-3xl leading-none;
}
```

---

## Layout System

### Container

All page content uses:

```html
<div class="max-w-site mx-auto px-6 py-16">
  <!-- max-w-site = 1200px, centered, 24px side padding -->
</div>
```

**Exception:** The film pyramid (`FilmPyramid`) renders **outside** this container on all pages so its coloured band rows bleed full-width to the screen edge.

### Page Shell

```
<body class="min-h-screen flex flex-col">
  <div class="flex-1">   ← grows to fill space; footer always at bottom
    <slot />
  </div>
  <Footer />
</body>
```

### Breakpoints

| Breakpoint | Width | Notes |
|-----------|-------|-------|
| default | 320px+ | Mobile — all features available |
| md | 768px+ | Two-column layouts begin |
| lg | 1024px+ | Full desktop layout |

---

## Navigation

### Header

Three-column grid across all pages:

```
┌──────────────┬──────────────────┬──────────────┐
│  [Browse]    │  Bath Film Club  │          [🔍] │
└──────────────┴──────────────────┴──────────────┘
```

- **Left cell** — ThemeDrawer trigger ("Browse") on all pages. Hidden when no themes data is available (edge case only).
- **Centre cell** — "BATH FILM CLUB" in Urbanist bold, always links to `/`
- **Right cell** — Magnifying glass icon SVG, links to `/search`. Active state filled white when on `/search`.

Implemented with `grid grid-cols-3 items-center` so the centre is always truly centred regardless of left/right content width.

```astro
<!-- Header.astro Props -->
interface Props {
  themes?: Theme[];    // passed from every page
  currentSlug?: string; // only on theme detail pages (highlights active theme in drawer)
}
```

### ThemeDrawer

Slide-in panel from the left edge. Self-contained React island.

- **Trigger:** "Browse" button in header left cell (all pages)
- **Background:** `bg-neutral-900` — one step above page black, clearly distinct
- **Border:** `border-r border-neutral-700`
- **Width:** `w-72` (288px)
- **Animation:** `transition-transform duration-300 ease-in-out`, slides from `-translate-x-full` to `translate-x-0`
- **Close:** × button, click overlay, or Escape key
- **Body scroll lock:** `document.body.style.overflow = 'hidden'` while open

**Theme list structure:**
- Grouped by year (descending — most recent year first)
- Within each year: oldest month first (Jan at top, Dec at bottom)
- Each link shows `[Mon] – [Theme Title]` e.g. "Jan – Favourite Films"
- Active theme highlighted with `.interactive-item.active` (white fill) on theme detail pages
- No active state on homepage or search page

### Interactive Item Pattern

All clickable nav elements share the `.interactive-item` class:

```css
.interactive-item {
  @apply py-1 px-2 transition-all border border-transparent
         hover:border-white hover:bg-brand-black;
}
.interactive-item.active {
  @apply text-brand-black bg-white border-white;
}
```

---

## Page Structures

### Homepage (`/`)

```
Header [Browse | Bath Film Club | 🔍]
  Hero (logo left, tagline + Discord CTA right)
  How It Works
  Current Theme (title + description)
  Upcoming Meeting (date, time, venue)
[Film Pyramid — full viewport width]
Footer
```

### Theme Detail Page (`/theme/[slug]`)

```
Header [Browse (active highlight) | Bath Film Club | 🔍]
  ← Theme Title →    (prev/next chevron nav)
  Month label
  Description
[Film Pyramid — full viewport width]
Footer
```

Prev/next chevrons: SVG with `stroke-linecap="square" stroke-linejoin="miter"` — straight-edged, no curves. Absent at chronological boundaries (oldest/newest theme).

### Search Page (`/search`)

```
Header [Browse | Bath Film Club | 🔍 (active)]
  "Search / Films & Themes" heading
  Text input
  Status filter pills: [Selected] [Shortlisted] [Nominated]
  Month filter pills:  [Jan] [Feb] ... [Dec]
  ↓
  Default (no query, no filters):
    Stats line + poster grid of all shortlisted films
  Filter active (no query):
    List of matching films (2 columns on md+)
  Text search (≥2 chars):
    List of matching films/themes (2 columns on md+), filters apply
Footer
```

---

## Component Library

### Film Pyramid

Displays films in a visual hierarchy matching the selection process. Two films selected, five shortlisted, variable number nominated.

```
[Film] [Film]                   ← Selected (largest cards)
[Film] [Film] [Film] [Film] [Film]  ← Shortlisted
[Film] [Film] ... [Film]         ← Nominated (smallest, variable count)
```

**Full-width bands:** The pyramid renders outside `max-w-site` so each row's background colour (`bg-neutral-600/25`, `/20`, `/15`) bleeds to the screen edge.

**Row headings:**
- Active (films present): `bg-brand-red text-brand-white`
- Empty (no films yet): `bg-neutral-800 text-neutral-500`
- Nominated row only: count shown in heading e.g. "Nominated Films (12)"

**Component split:**
- `FilmPyramid.astro` — Astro wrapper, splits films into rows via `getPyramidRows()`
- `PyramidIsland.tsx` — React island, manages `activeFilm` state, renders `FilmRow` × 3 + `FilmPanel`

### Film Card (`FilmCard.tsx`)

Individual film poster. Used inside the pyramid.

- Aspect ratio: `2/3` (standard poster)
- Hover: the **entire card container** scales up (`group-hover:scale-105` on the `aspect-[2/3]` div, not the `<img>`). This means the poster grows without cropping.
- Click: calls `onSelect(film)` to open FilmPanel
- Status tag: colour-coded badge below poster (green = selected, mustard = shortlisted, neutral = nominated). Suppressed when all films in a row share the same status.

### Film Panel (`FilmPanel.tsx`)

Slide-in detail drawer from the right. White background on dark page.

- **Width:** `max-w-lg` (512px)
- **Animation:** 300ms ease-in-out from right
- **Overlay:** `bg-black/60` behind panel, click to dismiss
- **Close:** × button, click overlay, or Escape
- **Content:** poster (full width), title + year/runtime/rating, genres, synopsis, director/producers/cast, trailer link

Used from: homepage pyramid, theme page pyramid, search page results and poster grid.

### SearchPage (`SearchPage.tsx`)

React island. Three display modes driven by state:

| Mode | Condition | Display |
|------|-----------|---------|
| Default | No query, no filters | Poster grid (shortlisted films) + stats line |
| Filtered | Filters active, no query | Result list (2-col on md+) |
| Search | Query ≥ 2 chars | Result list (2-col on md+), filters apply |

**Filter pills:**
- Inactive: `border-neutral-600 text-neutral-400 hover:border-neutral-400 hover:text-white`
- Active: `bg-white text-black border-white`
- Status and month filters combine: both must match for a film to appear

**Result list items:** small poster thumbnail (48px) left, film title / theme link / director / date·status right. Click → FilmPanel. Theme-only matches (no film) show as links to theme page.

**Text search:** normalised (lowercase, strip punctuation), matches film title, director, or theme title. Theme title matches suppressed when a status filter is active.

### Footer (`Footer.astro`)

```
[padding top]
Join on Discord  ← btn-discord (same size as homepage)

─────────────────────────────────────────────
© year Bath Film Club          Home  Search
```

- Discord button centred
- Bottom bar: copyright left, nav links right
- `mt-auto` via Layout flex column ensures footer is always at viewport bottom on short pages

### Button Styles

#### Discord CTA

```css
.btn-discord {
  @apply inline-flex items-center gap-2 bg-brand-red text-white
         font-heading font-semibold text-xl px-5 py-3
         hover:bg-red-800 transition-colors;
}
```

Used on homepage hero and footer.

#### Filter Pills

```
inactive: border border-neutral-600 text-neutral-400 px-3 py-1 text-xs font-heading uppercase tracking-wide
active:   bg-white text-black border-white (same padding/size)
```

---

## Visual Patterns

### Interactions

| Interaction | Effect | Duration |
|-------------|--------|----------|
| Nav hover | Border appears around item | 150ms |
| Nav active | White fill, black text | — |
| Film card hover | Entire card scales up 105% | 300ms |
| Poster grid hover | Opacity 80% | 150ms |
| Panel/drawer open | Slide in from edge | 300ms ease-in-out |
| Overlay | Fade in | 300ms |

All scale transforms are on the container element, not inner images, so `overflow-hidden` clips with the scaling boundary rather than cropping the content.

### Hover: Scale vs Opacity

- **Film cards in pyramid** (`FilmCard.tsx`): scale the container — poster grows visually
- **Poster grid in search page**: opacity fade — subtler, suits the grid context
- **No bounce or playful effects** — aesthetic is editorial, not consumer

### Whitespace

- Between page sections: `py-12` (48px) minimum
- Container padding: `px-6` (24px) sides
- Line height in body text: 1.5 (relaxed)

---

## Accessibility

- All text meets WCAG AA (4.5:1 minimum): white on black = 21:1, neutral-400 on black = 4.5:1
- `<button>` for actions, `<a>` for navigation
- `role="dialog"` + `aria-modal="true"` on ThemeDrawer and FilmPanel
- `aria-label` on icon buttons (Browse, search icon, close buttons, prev/next chevrons)
- Escape key closes all drawers and panels
- Keyboard tab order is logical

---

## Design Decisions Reference

| Decision | Rationale |
|----------|-----------|
| Black + white base | Maximum contrast, posters pop |
| Urbanist headings | Geometric, contemporary, editorial |
| Inter body | Highly readable, neutral |
| Brand red sparingly | Accent only — pyramid headings, Discord button |
| Square motif | Logo-derived visual signature |
| No gradients or shadows | Editorial aesthetic |
| Static site | Fast, cheap, maintenance-free |
| ThemeDrawer on all pages | Consistent navigation, no context switching |
| Full-width pyramid bands | Visual impact; colour bleeding matches homepage |
| Scale container not image | Hover grows poster without cropping |
| Shortlisted films in search default | More films = richer grid; selected is always just 2 |
| Footer always pinned | `flex flex-col` + `flex-1` slot wrapper |

---

## How to Extend the Design

### Add a New Component

1. Create `.astro` or `.tsx` in `site/src/components/`
2. Reference existing components for spacing, colours, typography patterns
3. Use Tailwind classes exclusively
4. Test at 320px, 768px, 1024px

### Change Colours

Edit `site/tailwind.config.ts` → `theme.colors`. All colour usage is via Tailwind classes, so a single config change propagates everywhere.

### Add a New Filter Type to Search

In `SearchPage.tsx`:
1. Add new state (`useState`)
2. Add pill row to the filter UI section
3. Add filter logic to `filteredFilms` and `searchResults` memos

### Change ThemeDrawer Sort Order

In `ThemeDrawer.tsx`:
- Years: sort `Object.keys(byYear)` descending (current behaviour — most recent year first)
- Within year: `byYear[year]!.sort((a, b) => a.month.localeCompare(b.month))` — oldest first (current, Jan at top)

---

## Component Quick Reference

```html
<!-- Section label with square motif -->
<p class="section-label">Film Selection</p>

<!-- Discord CTA -->
<a href="https://discord.gg/bathfilmclub" class="btn-discord">Join on Discord</a>

<!-- Nav interactive item -->
<a href="/" class="font-heading font-semibold text-sm uppercase tracking-wide text-white interactive-item">
  Home
</a>

<!-- Container pattern -->
<div class="max-w-site mx-auto px-6 py-16">...</div>

<!-- Full-width band (pyramid rows) — rendered outside container -->
<div class="py-10 bg-neutral-600/25">
  <div class="max-w-[1200px] mx-auto px-6">...</div>
</div>

<!-- Filter pill (inactive) -->
<button class="px-3 py-1 font-heading font-semibold text-xs uppercase tracking-wide border border-neutral-600 text-neutral-400 hover:text-white hover:border-neutral-400 transition-colors">
  Shortlisted
</button>
```
