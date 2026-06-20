# Bath Film Club — Design System & Visual Language

**Last updated:** 2026-06-20
**Next review:** 2026-09-20 (quarterly)
**Maintainer:** Av

---

## Overview

The Bath Film Club site visual design is built on a foundation of:

- **Editorial boldness** — Strong typographic character, A24-influenced aesthetic
- **Film-derived colour** — CMY (cyan/magenta/yellow) from colour darkroom printer lights
- **Grid-based layout** — Alignment and consistency across all pages
- **Iconic motif** — Square symbol from the logo, reused throughout
- **Restrained palette** — Black base, white text, red brand accent, CMY for film tiers

The site should feel like a **curated film archive** or **arts organisation** — editorial and bold, not commercial or social.

---

## Colour Palette

### Primary Colours

| Name | Hex | Usage |
|------|-----|-------|
| **Brand Red** | `#860909` | Header border, footer border, ThemeDrawer bg, section label square, Discord button |
| **Brand Black** | `#000000` | Page background |
| **Brand White** | `#FFFFFF` | Primary text, film panel background |

### CMY Accent Colours (film tier identity)

| Name | Hex | Usage |
|------|-----|-------|
| **Brand Cyan** | `#00AACC` | Shortlisted band (`/15` opacity background) |
| **Brand Magenta** | `#CC0055` | Selected band (`/15` opacity background) |
| **Brand Yellow** | `#F5C400` | Nominated band (`/15` opacity background) |

CMY colours are derived from the three filtration channels used in colour darkroom printing (the "printer lights" of a colour enlarger head).

### Status Tag Colours

| Name | Hex | Usage |
|------|-----|-------|
| **Brand Green** | `#22C55E` | Selected film status tag (solid fill, black text) |
| **Brand Mustard** | `#EABB16` | Shortlisted film status tag (solid fill, black text) |

### Supporting Greys (Neutral Scale)

```
300  #D4D4D4  film title text on white/light backgrounds
400  #A3A3A3  secondary text, labels
600  #525252  borders, dividers on dark backgrounds
700  #404040  nominated tag fill
800  #262626  poster placeholder background
900  #171717  (reserved)
```

**Usage patterns:**
- **Text hierarchy**: white (primary) → neutral-400 (secondary) → neutral-600 (tertiary)
- **Dividers**: neutral-600 on dark backgrounds
- **Empty pyramid states**: neutral-500 text, no background fill

### In Code

```typescript
// tailwind.config.ts
colors: {
  brand: {
    red: '#860909',
    black: '#000000',
    white: '#FFFFFF',
    green: '#22C55E',
    mustard: '#EABB16',
    cyan: '#00AACC',
    magenta: '#CC0055',
    yellow: '#F5C400',
  },
  neutral: { 300, 400, 600, 700, 800, 900 }
}
```

---

## Typography System

### Fonts

Three fonts are in use, each with a distinct role:

| Font | Tailwind class | Usage |
|------|---------------|-------|
| **Notable** | `font-display` | Nav title ("Bath Film Club"), pyramid row headings, section labels (`.section-label`, `.pyramid-subtitle`) |
| **Barlow Condensed** | `font-heading` | All other headings, UI labels, buttons, filter pills, drawer nav, status tags |
| **Barlow Semi Condensed** | `font-body` | Body text, descriptions, film metadata, captions, Browse button, nav title |

All imported from Google Fonts:
```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:ital,wght@0,400;0,500;0,600;1,400&family=Barlow+Condensed:wght@600;700;800;900&family=Notable&display=swap');
```

**Notable** is a single-weight display font — `font-bold` / `font-black` etc. have no effect where it is used.

### Type Scale

| Role | Font | Size | Weight | Notes |
|------|------|------|--------|-------|
| **Theme title** | Barlow Condensed | 5xl (48px) | 900 (black) | Centrepiece display heading |
| **Search heading** | Barlow Condensed | 4xl | 800 (extrabold) | |
| **Section headings** | Barlow Condensed | 2xl | 800 (extrabold) | Homepage sections |
| **Section label** | Notable | xs | — | `.section-label` class, all caps, wide tracking |
| **Pyramid row heading** | Notable | xl | — | `.pyramid-subtitle` class |
| **Nav / UI labels** | Barlow Condensed | sm | 600 | Uppercase, wide tracking |
| **Browse / Home nav** | Barlow Semi Condensed | sm | 600 | Uppercase, wide tracking |
| **Body paragraph** | Barlow Semi Condensed | base–2xl | 400 | Hero text larger |
| **Film title (card)** | Barlow Semi Condensed | xs | 400 | On white/80 background |
| **Caption / meta** | Barlow Semi Condensed | xs–sm | 400 | neutral-400 |

### Section Label (Square Motif)

The square from the Bath Film Club logo marks major sections. Square is CSS-generated (not a Unicode character) for reliable vertical alignment in flex containers.

```html
<p class="section-label">Film Selection</p>
<!-- renders: ■ FILM SELECTION  (square is brand-red) -->
```

```css
.section-label {
  @apply flex items-center gap-2 text-xs font-display uppercase tracking-widest text-neutral-400;
}
.section-label::before {
  content: '';
  @apply block w-2 h-2 bg-brand-red flex-shrink-0;
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

- **Top edge**: 4px solid brand-red border (`border-b-4 border-b-brand-red`) — editorial brand stamp
- **Left cell** — ThemeDrawer trigger ("Browse") — `font-body font-semibold`, `interactive-item`
- **Centre cell** — "BATH FILM CLUB" in Barlow Semi Condensed, `interactive-item`, always links to `/`
- **Right cell** — Magnifying glass SVG, links to `/search`. Active state filled white when on `/search`.

```astro
<!-- Header.astro Props -->
interface Props {
  themes?: Theme[];
  currentSlug?: string;
}
```

### ThemeDrawer

Slide-in panel from the left edge. Self-contained React island.

- **Trigger:** "Browse" button — Barlow Semi Condensed, `interactive-item`
- **Background:** `bg-brand-red` — bold brand identity
- **Border:** `border-r border-red-900`
- **Width:** `w-72` (288px)
- **Animation:** `transition-transform duration-300 ease-in-out`, slides from `-translate-x-full` to `translate-x-0`
- **Close:** × button (`text-white/70 hover:text-white`), click overlay, or Escape key
- **Body scroll lock:** `document.body.style.overflow = 'hidden'` while open

**Text colours on red background:**
- Year labels: `text-white/60`
- Theme links: `text-white/80`
- Active theme: `.interactive-item.active` (white fill, black text)

**Theme list structure:**
- Grouped by year (descending — most recent year first)
- Within each year: oldest month first (Jan at top, Dec at bottom)
- Each link shows `[Mon] – [Theme Title]` e.g. "Jan – Favourite Films"

### Interactive Item Pattern

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
Header [border-b-4 red | Browse | Bath Film Club | 🔍]
  Hero (logo left, tagline + Discord CTA right)
  How It Works
  Current Theme (title + description)
  Upcoming Meeting (date, time, venue)
[Film Pyramid — full viewport width]
Footer [Discord CTA | border-t-4 red | © | Home Search]
```

### Theme Detail Page (`/theme/[slug]`)

```
Header [border-b-4 red | Browse (active highlight) | Bath Film Club | 🔍]
  ← Theme Title →    (prev/next chevron nav)
  Month label
  Description
[Film Pyramid — full viewport width]
Footer
```

Prev/next chevrons: SVG with `stroke-linecap="square" stroke-linejoin="miter"` — straight-edged.

### Search Page (`/search`)

```
Header [border-b-4 red | Browse | Bath Film Club | 🔍 (active)]
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

Displays films in a visual hierarchy matching the selection process.

```
[Film] [Film]                       ← Selected (largest cards, magenta band)
[Film] [Film] [Film] [Film] [Film]  ← Shortlisted (cyan band)
[Film] [Film] ... [Film]            ← Nominated (yellow band, variable count)
```

**Full-width bands:** Pyramid renders outside `max-w-site`; band rows bleed to screen edge.

**Band colours (CMY):**
| Tier | Band background | Heading text |
|------|----------------|-------------|
| Selected | `bg-brand-magenta/15` | `text-white/90` |
| Shortlisted | `bg-brand-cyan/15` | `text-white/90` |
| Nominated | `bg-brand-yellow/15` | `text-white/90` |

**Row headings:**
- Active (films present): `text-white/90` via `accentClass` prop — no background fill
- Empty (no films yet): `text-neutral-500` — no background fill
- Nominated row only: count shown in heading e.g. "Nominated Films (12)"

**Component split:**
- `FilmPyramid.astro` — Astro wrapper, splits films into rows via `getPyramidRows()`
- `PyramidIsland.tsx` — React island, `FilmRow` accepts `bgClass` + `accentClass` props

### Film Card (`FilmCard.tsx`)

Individual film poster.

- Aspect ratio: `2/3` (standard poster)
- Hover: entire card container scales up (`group-hover:scale-110` on the `aspect-[2/3]` div)
- Click: calls `onSelect(film)` to open FilmPanel
- **Title box:** `h-12 bg-white/80 p-2` — fixed height, translucent white fill, `text-neutral-800`
- **Status tags:** solid filled, not outlined:
  - Selected: `bg-brand-green text-black`
  - Shortlisted: `bg-brand-mustard text-black`
  - Nominated: `bg-neutral-700 text-neutral-300`
  - Tags suppressed when all films in a row share the same status

### Film Panel (`FilmPanel.tsx`)

Slide-in detail drawer from the right. White background.

- **Width:** `max-w-lg` (512px)
- **Animation:** 300ms ease-in-out from right
- **Overlay:** `bg-black/60`, click to dismiss
- **Close:** × button, click overlay, or Escape
- **Content:** poster, title + year/runtime/rating, genres, synopsis, director/producers/cast, trailer link

Used from: homepage pyramid, theme page pyramid, search page results and poster grid.

### SearchPage (`SearchPage.tsx`)

React island. Three display modes:

| Mode | Condition | Display |
|------|-----------|---------|
| Default | No query, no filters | Poster grid (shortlisted films) + stats line |
| Filtered | Filters active, no query | Result list (2-col on md+) |
| Search | Query ≥ 2 chars | Result list (2-col on md+), filters apply |

**Filter pills:**
- Inactive: `border-neutral-600 text-neutral-400 hover:border-neutral-400 hover:text-white`
- Active: `bg-white text-black border-white`

**Result list items:** small poster thumbnail (48px) left, film title / theme link / director / date·status right. Click → FilmPanel.

### DiscordButton (`DiscordButton.astro`)

Reusable component. Discord URL is defined once inside this file.

```astro
<!-- Usage -->
<DiscordButton />
```

```css
.btn-discord {
  @apply inline-flex items-center gap-2 bg-brand-red text-white
         font-heading font-semibold text-xl px-5 py-3
         hover:bg-red-800 transition-colors;
}
```

Used on: homepage hero, footer.

### Footer (`Footer.astro`)

```
[Discord CTA — centred]

━━━━━━━━━━━━━━━━━━━ (border-t-4 brand-red)
© year Bath Film Club          Home  Search
```

- Discord button centred above red border rule
- Bottom bar: copyright left, nav links right
- Sticky via Layout flex column (`flex-1` slot wrapper)

---

## Visual Patterns

### Interactions

| Interaction | Effect | Duration |
|-------------|--------|----------|
| Nav hover | White border box appears around item | 150ms |
| Nav active | White fill, black text | — |
| Film card hover | Entire card scales up 110% | 300ms |
| Poster grid hover | Opacity 80% | 150ms |
| Panel/drawer open | Slide in from edge | 300ms ease-in-out |
| Overlay | Fade in | 300ms |

All scale transforms are on the container element, not inner images.

### Hover: Scale vs Opacity

- **Film cards in pyramid** (`FilmCard.tsx`): scale the container — poster grows visually
- **Poster grid in search page**: opacity fade — subtler
- **No bounce or playful effects** — aesthetic is editorial

### Whitespace

- Between page sections: `py-12` (48px) minimum
- Container padding: `px-6` (24px) sides
- Line height in body text: relaxed

---

## Accessibility

- All text meets WCAG AA (4.5:1 minimum)
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
| Notable for display | A24-influenced editorial display font; single-weight, distinctive |
| Barlow Condensed for headings | Tight condensed grotesque; A24 aesthetic; multiple weights |
| Barlow Semi Condensed for body | Shares design family with heading font; readable at small sizes |
| CMY palette for pyramid | Derived from colour darkroom printer lights; thematically meaningful |
| Magenta/Cyan/Yellow per tier | Selected (most prestigious) = magenta; shortlisted = cyan; nominated = yellow |
| Solid status tags | More visible than outlined; colour registers clearly |
| White/80 title box on cards | Consistent fixed-height box; readable over coloured pyramid bands |
| Section label square in red | Brand colour anchor on every page |
| Red border on header/footer | Editorial brand stamp; common in arts/film print design |
| ThemeDrawer in brand red | Bold, memorable; red is consistent with header/footer accent |
| White/90 pyramid headings | Readable on all CMY bands without needing a background fill |
| Scale container not image | Hover grows poster without cropping |
| Shortlisted films in search default | More films = richer grid; selected is always just 2 |
| Footer always pinned | `flex flex-col` + `flex-1` slot wrapper |
| current.json priority in getAllThemes() | Active theme always shows up-to-date film counts everywhere |

---

## How to Extend the Design

### Add a New Component

1. Create `.astro` or `.tsx` in `site/src/components/`
2. Reference existing components for spacing, colours, typography patterns
3. Use Tailwind classes exclusively
4. Test at 320px, 768px, 1024px

### Change Colours

Edit `site/tailwind.config.ts` → `theme.colors.brand`. All colour usage is via Tailwind classes.

### Add a New Filter Type to Search

In `SearchPage.tsx`:
1. Add new state (`useState`)
2. Add pill row to the filter UI section
3. Add filter logic to `filteredFilms` and `searchResults` memos

### Change ThemeDrawer Sort Order

In `ThemeDrawer.tsx`:
- Years: sort `Object.keys(byYear)` descending (current — most recent year first)
- Within year: `byYear[year]!.sort((a, b) => a.month.localeCompare(b.month))` — oldest first

---

## Component Quick Reference

```html
<!-- Section label with square motif -->
<p class="section-label">Film Selection</p>

<!-- Discord CTA -->
<DiscordButton />

<!-- Nav interactive item -->
<a href="/" class="font-body font-semibold text-sm uppercase tracking-wide text-white interactive-item">
  Bath Film Club
</a>

<!-- Container pattern -->
<div class="max-w-site mx-auto px-6 py-16">...</div>

<!-- Full-width band (pyramid rows) — rendered outside container -->
<div class="py-10 bg-brand-magenta/15">
  <div class="max-w-[1200px] mx-auto px-6">...</div>
</div>

<!-- Filter pill (inactive) -->
<button class="px-3 py-1 font-heading font-semibold text-xs uppercase tracking-wide border border-neutral-600 text-neutral-400 hover:text-white hover:border-neutral-400 transition-colors">
  Shortlisted
</button>
```
