# Bath Film Club — Design System & Visual Language

**Last updated:** 2026-06-23
**Next review:** 2026-09-22 (quarterly)
**Maintainer:** Av

---

## Overview

The Bath Film Club site visual design is built on a foundation of:

- **Editorial boldness** — Strong typographic character, A24-influenced aesthetic
- **Film-derived colour** — CMY (cyan/magenta/yellow) from colour darkroom printer lights
- **Grid-based layout** — Alignment and consistency across all pages
- **Iconic motif** — Square symbol from the logo, reused throughout
- **Restrained palette** — Dark teal base, cream text, dark red accent, CMY for film tiers

The site should feel like a **curated film archive** or **arts organisation** — editorial and bold, not commercial or social.

---

## Colour Palette

All colours are defined as semantic `bfc-*` tokens in `tailwind.config.ts`. Never use raw hex values in components — always reference the token.

### Brand Colours (`bfc-brand`)

| Token | Hex | Usage |
|-------|-----|-------|
| `bfc-brand-bg` | `#15262E` | Page background |
| `bfc-brand-fg` | `#FFF7D6` | Primary text, icons, borders |
| `bfc-brand-accent` | `#8C3646` | Header border, Discord button, active states |
| `bfc-brand-alt` | `#2A8476` | Secondary accent (footer tint) |

### Film Tier Colours (`bfc-tier`)

| Token | Hex | Usage |
|-------|-----|-------|
| `bfc-tier-selected` | `#674967` | Selected band background |
| `bfc-tier-shortlisted` | `#175A70` | Shortlisted band background |
| `bfc-tier-nominated` | `#4C685E` | Nominated band background |

CMY colours are derived from the three filtration channels used in colour darkroom printing (the "printer lights" of a colour enlarger head). Thematically tied to film processing.

### Status Tag Colours (`bfc-status`)

| Token | Hex | Usage |
|-------|-----|-------|
| `bfc-status-selected` | `#22C55E` | Selected film status tag (solid fill) |
| `bfc-status-shortlisted` | `#EABB16` | Shortlisted film status tag (solid fill) |

### Opacity Conventions

The `bfc-brand-fg` token is used at various opacities throughout the UI:
- `/80` — body text, button text, most UI elements
- `/60` — secondary text, copyright, star motif
- `/40` — borders, inactive/dimmed state overlay

### In Code

```typescript
// tailwind.config.ts
colors: {
  'bfc-brand': { accent: '#8C3646', bg: '#15262E', fg: '#FFF7D6', alt: '#2A8476' },
  'bfc-tier': { selected: '#674967', shortlisted: '#175A70', nominated: '#4C685E' },
  'bfc-status': { selected: '#22C55E', shortlisted: '#EABB16' },
}
```

---

## Typography System

### Fonts

Two fonts are in use, each with a distinct role:

| Font | Tailwind class | Usage |
|------|---------------|-------|
| **Notable** | `font-display` | Section labels (`.section-label`, `.pyramid-subtitle`) |
| **Barlow Condensed** | `font-heading` / `font-body` | Everything else — headings, body text, buttons, labels |

Imported from Google Fonts in `site/src/styles/global.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Notable&display=swap');
```

**Notable** is a single-weight display font — `font-bold` etc. have no visual effect where it is used.

### Type Scale

| Role | Font | Size | Weight |
|------|------|------|--------|
| **Theme title** | Barlow Condensed | 5xl | 300 (light) |
| **Search heading** | Barlow Condensed | 5xl | 300 (light) |
| **Section headings** | Barlow Condensed | 2xl | 800 |
| **Section label** | Notable | xs | — |
| **Pyramid row heading** | Notable | 2xl | — |
| **Nav / UI labels** | Barlow Condensed | xl | 600 |
| **Body paragraph** | Barlow Condensed | xl | 400 |
| **Film title (card)** | Barlow Condensed | lg | 400 |
| **Search result film title** | Barlow Condensed | xl | 600 |
| **Search filter pills** | Barlow Condensed | base | 600 |
| **Caption / meta** | Barlow Condensed | base | 400 |

### Section Label

Section labels use Notable (display font), uppercase, widely tracked, muted cream. The CSS `::before` accent square motif is currently disabled.

```css
.section-label {
  @apply flex items-center gap-2 text-xs font-display uppercase tracking-widest text-bfc-brand-fg/60;
}
/* ::before square currently commented out in global.css */
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

**Full-width band pattern:**
```html
<div class="py-10 bg-bfc-tier-selected">               <!-- no max-w constraint -->
  <div class="max-w-[1664px] mx-auto px-6">...</div>   <!-- inner container (pyramid bands use wider max-w than standard max-w-site) -->
</div>
```

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

### NavBar Component (`NavBar.astro`)

Shared navigation used in both Header and Footer. Renders four buttons in a centred flex row:

```
[ 🏠 ] [ Browse Themes ] [ Search Themes ] [ Join on Discord ]
```

- **Home** — icon-only outline button; renders as `<span>` (non-clickable, `opacity-40`) on homepage
- **Browse Themes** — triggers `MenuDrawer`; wrapper div has `opacity-40` on theme pages
- **Search Themes** — text outline button; renders as `<span>` (non-clickable, `opacity-40`) on `/search`
- **Join on Discord** — filled accent button (`DiscordButton.astro`)

Active/inactive state via `Astro.url.pathname` (evaluated at build time — no hydration flash).

**Outline button sizes (responsive):**
- Icon button: `py-2 px-3 md:py-4` — padding reduces on mobile to match text button height
- Text button: `text-sm px-3 py-2 md:text-xl md:px-5 md:py-3`
- Both use `border border-bfc-brand-fg/40 text-bfc-brand-fg/80` inactive, `hover:border-bfc-brand-fg hover:text-bfc-brand-fg` on hover
- Gap: `gap-2 md:gap-4`
- Header inner div: `md:h-16` (no fixed height on mobile — allows wrap)

**Mobile label shortening:** "Browse Themes" → "Browse" and "Search Themes" → "Search" on mobile only, using `<span class="md:hidden">` / `<span class="hidden md:inline">` inside the button. Full labels visible at `md:` and above.

### Header (`Header.astro`)

```astro
<!-- Props -->
interface Props {
  themes?: Theme[];
  currentSlug?: string;
}
```

Wraps `NavBar` in a header element with 4px accent bottom border:
```html
<header class="border-b-4 border-b-bfc-brand-accent py-4">
```

Pass `themes` (from `getAllThemes()`) on every page so MenuDrawer can list all themes. Pass `currentSlug` on theme pages to highlight the current theme in the drawer.

### Footer (`Footer.astro`)

Self-contained — fetches `getAllThemes()` internally. Wraps `NavBar` above a centred copyright line. Has a subtle background tint:
```html
<footer class="py-8 bg-bfc-brand-alt/10">
```

### MenuDrawer (`MenuDrawer.tsx`)

Slide-in panel from the left edge. React island (`client:load`).

- **Trigger:** "Browse Themes" outline button (styled to match NavBar)
- **Background:** `bg-bfc-brand-accent` — bold brand identity
- **Width:** `w-72` (288px)
- **Animation:** 300ms ease-in-out, slides from `-translate-x-full` to `translate-x-0`
- **Close:** × button, click overlay, or Escape key
- **Body scroll lock:** `document.body.style.overflow = 'hidden'` while open
- **Top item:** "Search Themes" link
- **Themes:** Grouped by year in accordion; current year open by default; accordion opens/closes with a smooth CSS grid row height transition (`grid-template-rows: 0fr → 1fr`, 300ms ease-in-out)
- **Active theme:** Highlighted when `currentSlug` matches

---

## Page Structures

### Homepage (`/`)

```
Header [NavBar — Home active/dimmed]
  Hero (LogoStacked left, tagline + Discord CTA right)
  Introduction ("How it works" + ★★★★★ motif at bottom)
  NextEvent (Current Theme + Upcoming Meeting)
[Film Pyramid — full viewport width]
Footer [NavBar]
```

### Theme Detail Page (`/theme/[slug]`)

```
Header [NavBar — Browse Themes dimmed]
  LogoLandscape
  ← Theme Title →    (prev/next chevron nav)
  Month label + Description
[Film Pyramid — full viewport width]
Footer [NavBar]
```

Prev/next chevrons: SVG with `stroke-linecap="square" stroke-linejoin="miter"` — straight-edged.

### 404 Page (`/404`)

Standalone page — does **not** use `Layout.astro`. No header, no footer.

```
body (min-h-screen flex items-center justify-center)
  "404" — h1 in Notable, text-[20vw] md:text-[12rem], bfc-brand-fg/20 (ghosted)
  "Well, nobody's perfect." — blockquote, Barlow Condensed, text-4xl md:text-6xl
  — The Apartment, Billy Wilder, 1960 — attribution in <cite>
  "The page you're looking for doesn't exist." — muted body copy
  [ Back to Home ] — standard outline nav button
```

The large "404" is decorative — deliberately ghosted (`/20` opacity) so the quote reads as the primary message. The quote functions as the communicative content; the number as the visual anchor.

### Search Page (`/search`)

```
Header [NavBar — Search Themes dimmed]
  LogoLandscape
  "Search / Films & Themes" heading
  Text input + Status filters + Month filters
  ↓ Results
Footer [NavBar]
```

---

## Component Library

### Logo Components

Two inline SVG Astro components created from vector exports of the brand logo. Paths have hardcoded `fill` stripped so Tailwind's `fill-*` utility works.

- `LogoStacked.astro` — stacked layout; used in Hero on homepage
- `LogoLandscape.astro` — landscape layout; used on search and theme detail pages

```astro
<LogoStacked class="w-11/12 fill-bfc-brand-fg" />
<LogoLandscape class="w-full max-w-md mx-auto fill-bfc-brand-fg" />
```

### FilmStrip (`FilmStrip.tsx`)

Eight equally-spaced squares in a horizontal row — replicates the film negative hole motif from the logo. Used as section end markers in the film pyramid bands.

```tsx
<FilmStrip />
<!-- renders 8 × w-3 h-3 bg-bfc-brand-fg squares, centred, gap-6 -->
```

Used at the bottom of each pyramid band row (selected, shortlisted, nominated).

### Star Motif (Introduction section)

Five amber stars used as a decorative end marker in `Introduction.astro`. Only appears in this section.

```html
<div class="flex justify-center gap-3 pt-10 text-amber-400/80 text-2xl">
  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
</div>
```

### Film Pyramid

Displays films in a visual hierarchy matching the selection process.

```
[Film] [Film]                       ← Selected (largest cards)
[Film] [Film] [Film] [Film] [Film]  ← Shortlisted
[Film] [Film] ... [Film]            ← Nominated (variable count)
```

**Full-width bands:** Pyramid renders outside `max-w-site`; band rows bleed to screen edge.

**Band colours:**
| Tier | Background | Heading |
|------|-----------|---------|
| Selected | `bg-bfc-tier-selected` | `text-bfc-brand-fg/90` |
| Shortlisted | `bg-bfc-tier-shortlisted` | `text-bfc-brand-fg/90` |
| Nominated | `bg-bfc-tier-nominated` | `text-bfc-brand-fg/90` |

Each band ends with a `<FilmStrip />` motif.

**Card sizing (responsive):**
- Mobile: `grid grid-cols-2 gap-4` — all cards `w-full`, equal size, 2 per row regardless of tier
- Desktop: `flex flex-wrap gap-12 justify-center` with explicit per-tier widths: Selected `w-56`, Shortlisted `w-48`, Nominated `w-40`
- The graduated desktop sizing (selected = largest) makes no sense as a visual cue on a 2-column mobile grid, hence the uniform mobile treatment
- Inner container: `max-w-[1664px]` (wider than the standard `max-w-site` to let more nominated films sit on a single row)

**Component split:**
- `FilmPyramid.astro` — Astro wrapper, splits films into rows via `getPyramidRows()`
- `PyramidIsland.tsx` — React island, `FilmRow` accepts `bgClass` + `accentClass` + `cardWidth` props

### Film Card (`FilmCard.tsx`)

Individual film poster.

- Aspect ratio: `2/3` (standard poster)
- Hover: card wrapper scales up (`hover:scale-110`) using `.bfc-shadow` utility
- Click: calls `onSelect(film)` to open FilmPanel
- **Title box:** `h-24` below the poster, `text-lg` Barlow Condensed
- **Status tags:** solid filled, `text-base`, not outlined:
  - Selected: `bg-bfc-status-selected`
  - Shortlisted: `bg-bfc-status-shortlisted`
  - Nominated: neutral fill
  - Tags suppressed when all films in a row share the same status

### Film Panel (`FilmPanel.tsx`)

Slide-in detail drawer from the right.

- **Width:** `max-w-lg` (512px); full viewport width on mobile — overlay is completely covered, so the close button is the only dismiss mechanism on mobile
- **Animation:** 300ms ease-in-out from right
- **Overlay:** `bg-black/60`, click to dismiss (desktop only where panel doesn't fill viewport)
- **Close button:** solid `bg-bfc-brand-bg` fill, cream border + icon — always visible over any poster colour (light or dark). Auto-focused when the panel opens (`useRef` + `useEffect`) so keyboard/screen reader users land in the right place.
- **Close:** × button, click overlay, or Escape
- **Content:** poster, title + year/runtime/rating, genres, synopsis, director/producers/cast, trailer link

Used from: homepage pyramid, theme page pyramid, search page results.

### SearchPage (`SearchPage.tsx`)

React island. Three display modes:

| Mode | Condition | Display |
|------|-----------|---------|
| Default | No query, no filters | Poster grid (shortlisted films) + stats line |
| Filtered | Filters active, no query | Result list (2-col on md+) |
| Search | Query ≥ 2 chars | Result list (2-col on md+), filters apply |

**Default poster grid:** `grid-cols-[repeat(auto-fill,minmax(160px,1fr))]` — fills available width with 160px minimum cells.

**Search/filter result rows:** Each row shows a 160px poster alongside a structured info block:
- Film title (`text-xl font-semibold`) spanning full width above a 2-column label/value grid
- Left column: "Theme", "Director", month — muted (`/40`)
- Right column: theme title, director name, status — body cream (`/60` or full)
- Grid is invisible (layout only), providing consistent vertical alignment across rows

### DiscordButton (`DiscordButton.astro`)

Reusable component. Discord URL is defined once inside this file.

```astro
<DiscordButton />
```

```css
.btn-discord {
  @apply inline-flex items-center gap-2 bg-bfc-brand-accent text-bfc-brand-fg
         font-heading font-semibold text-xl px-5 py-3
         hover:bg-bfc-brand-accent/80 transition-colors;
}
```

---

## Visual Patterns

### Interactions

| Interaction | Effect | Duration |
|-------------|--------|----------|
| Nav button hover | Border and text brighten | 150ms |
| Nav button active/dimmed | `opacity-40`, non-clickable | — |
| Film card hover | Card scales 110% + `.bfc-shadow` | 300ms |
| Panel/drawer open | Slide in from edge | 300ms ease-in-out |
| Overlay | Fade in | 300ms |
| MenuDrawer accordion | Grid row height `0fr → 1fr`, chevron rotates 180° | 300ms ease-in-out |

`.bfc-shadow` is a global utility class in `global.css`: `shadow-[16px_16px_16px_0px_rgba(0,0,0,0.3)]`.

All scale transforms are on the container element, not inner images. Drop shadow is applied to the poster `div`, not the outer button, so it appears above the title box.

### Active/Inactive Nav State

Nav buttons dim (not disappear) when you're already on that page. Applied as `opacity-40` on the whole element — consistent visual weight, just reduced intensity. Implemented at the Astro level (build time) to avoid hydration flash.

### Whitespace

- Between page sections: `py-12` (48px) minimum
- Container padding: `px-6` (24px) sides
- Line height in body text: `leading-relaxed`

---

## Admin Tool Styling

The admin tool (`admin/client`) mirrors the main site's visual identity:

- **Background:** `#15262E` (matches `bfc-brand-bg`)
- **Text:** `#FFF7D6` (matches `bfc-brand-fg`)
- **Font:** Barlow Condensed via Google Fonts (same import as main site)
- **Active tab:** filled `#8C3646` (matches `bfc-brand-accent`)
- **Inactive tab:** 10% cream tint fill (`rgba(255,247,214,0.1)`)
- **Outline buttons:** cream border + text, accent fill on active state

Styles are in `admin/client/src/index.css`.

---

## Accessibility

- All text meets WCAG AA (4.5:1 minimum)
- `<button>` for actions, `<a>` for navigation
- Inactive nav items render as `<span>` with `aria-current="page"` — not focusable
- `role="dialog"` + `aria-modal="true"` on MenuDrawer and FilmPanel
- `aria-label` on icon buttons (Home, close buttons, prev/next chevrons)
- Escape key closes all drawers and panels
- Keyboard tab order is logical
- Skip-to-content link in Layout (visible on focus, jumps to `#main-content`)
- All `<main>` elements have `id="main-content"` for skip link target
- Search input has a visually hidden `<label>` (`sr-only`)
- Filter pills (status + month) have `aria-pressed` to convey toggle state
- Decorative stars in Introduction have `aria-hidden="true"`
- FilmPanel auto-focuses close button on open (`useRef`)
- Result buttons use `focus-visible:ring` rather than removing all focus styles
- 404 `<h1>` has `aria-label="404 — Page not found"` (the visible text is just "404")

---

## Design Decisions Reference

| Decision | Rationale |
|----------|-----------|
| Dark teal base (`#15262E`) | Warmer and more distinctive than pure black; still high contrast with cream |
| Cream text (`#FFF7D6`) | Softer than pure white; reduces eye strain without losing legibility |
| Dark red accent (`#8C3646`) | Brand stamp; used sparingly for maximum impact |
| `bfc-*` semantic token names | Tokens describe usage, not colour — safe to adjust values without renaming |
| Notable for section labels | A24-influenced editorial display font; single-weight, distinctive |
| Barlow Condensed throughout | Tight condensed grotesque; A24 aesthetic; multiple weights for hierarchy |
| CMY palette for pyramid | Derived from colour darkroom printer lights; thematically meaningful |
| Solid status tags | More visible than outlined; colour registers clearly |
| Opacity-40 for inactive nav | Dimmed but not missing — consistent visual weight |
| Opacity applied to wrapper div | Dimming lives in Astro (build time), not React — no hydration flash |
| FilmStrip at pyramid band ends | Reinforces logo motif; provides visual closure per tier |
| Stars in Introduction | Film review motif; warmer/more playful than the square motif |
| Drop shadow on poster div only | Shadow appears above title box, not behind it |
| LogoLandscape/LogoStacked as inline SVG | Enables Tailwind `fill-*` utility; not possible with `<img src>` |
| Shortlisted films in search default | More films = richer grid; selected is always just 2 |
| Footer always pinned | `flex flex-col` + `flex-1` slot wrapper in Layout |
| current.json priority in getAllThemes() | Active theme always shows up-to-date film counts everywhere |

---

## How to Extend the Design

### Add a New Component

1. Create `.astro` or `.tsx` in `site/src/components/`
2. Use `bfc-*` colour tokens exclusively — no raw hex values
3. Use Tailwind classes exclusively — no inline styles
4. Test at 320px, 768px, 1024px

### Change Colours

Edit `site/tailwind.config.ts` → `theme.colors`. All colour usage is via `bfc-*` tokens.

### Component Quick Reference

```html
<!-- Section label with square motif -->
<p class="section-label">Film Selection</p>

<!-- Discord CTA -->
<DiscordButton />

<!-- Logo -->
<LogoLandscape class="w-full max-w-md mx-auto fill-bfc-brand-fg" />
<LogoStacked class="w-11/12 fill-bfc-brand-fg" />

<!-- FilmStrip motif -->
<FilmStrip />

<!-- Container pattern -->
<div class="max-w-site mx-auto px-6 py-16">...</div>

<!-- Full-width band (pyramid rows) -->
<div class="py-10 bg-bfc-tier-selected">
  <div class="max-w-[1664px] mx-auto px-6">...</div>
</div>

<!-- Outline nav button (inactive) -->
<a href="/" class="font-heading font-semibold text-xl px-5 py-3 border border-bfc-brand-fg/40 text-bfc-brand-fg/80 hover:border-bfc-brand-fg hover:text-bfc-brand-fg transition-colors">
  Search Themes
</a>
```
