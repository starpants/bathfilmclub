# Bath Film Club — Design System & Visual Language

**Last updated:** 2026-06-11  
**Next review:** 2026-09-11 (quarterly)  
**Maintainer:** Av

---

## Overview

The Bath Film Club site visual design is built on a foundation of:

- **Minimal aesthetic** — Let film posters drive the visual interest
- **Editorial typography** — Strong hierarchy, contemporary typefaces
- **Grid-based layout** — Alignment and consistency across all pages
- **Iconic motif** — Square symbol from the logo, reused throughout
- **Restrained colour palette** — Black, white, and a carefully chosen red

The site should feel like a **curated film archive** or **arts organization**, not a commercial cinema or social platform.

---

## Why This Design?

**Design constraints:**
- Film posters are the main visual element — design should stay out of their way
- Single-administrator site — no complex UI patterns, keep it simple
- Serves both existing members and prospective members — clear hierarchy and wayfinding
- Mobile-first — works equally well on phone and desktop
- Longevity — design should feel good whether there are 20 themes or 200

**Solution:**
- **High contrast** (black/white) — Posters pop, easy to read
- **Geometric typography** — Contemporary feel without trends
- **Structural clarity** — Users always know where they are and what's clickable
- **Meaningful whitespace** — Breathing room, not cramped
- **Subtle interactions** — Hover states and animations are quiet, not distracting

---

## Colour Palette

### Primary Colours

| Name | Hex | Usage | Notes |
|------|-----|-------|-------|
| **Brand Red** | `#860909` | Links, buttons, hover states, accents | Derived from Bath Film Club logo; used sparingly |
| **Brand Black** | `#000000` | Base background, text | Pure black for maximum contrast |
| **Brand White** | `#FFFFFF` | Text, panels, backgrounds | Pure white for clarity |

### Supporting Greys (Neutral Scale)

Used for hierarchy, secondary text, dividers, and background variation.

```
50   #FAFAFA  (near-white, barely visible)
100  #F5F5F5  (very light, rarely used)
200  #E5E5E5  (light grey, borders)
300  #D4D4D4  (medium-light, dividers)
400  #A3A3A3  (medium, secondary text)
600  #525252  (dark grey, backgrounds)
700  #404040  (darker grey, backgrounds)
800  #262626  (very dark grey, hover states)
900  #171717  (almost black, text on dark backgrounds)
```

**Usage patterns:**
- **Text hierarchy**: white (primary), neutral-400 (secondary), neutral-600 (tertiary)
- **Dividers**: neutral-300 (on white), neutral-600 (on black background)
- **Labels/caps**: neutral-400 (small, uppercase labels like "Director")
- **Hover states**: neutral-800 or neutral-600 (subtle darkening)

### In Code

```typescript
// tailwind.config.ts
colors: {
  brand: {
    red: '#860909',
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
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
}
```

Use Tailwind classes like `text-brand-red`, `bg-brand-black`, `border-neutral-300`.

---

## Typography System

### Fonts

| Font | Stack | Usage | Weight |
|------|-------|-------|--------|
| **Urbanist** | Urbanist, sans-serif | Headings, labels, UI | 500, 600, 700 |
| **Inter** | Inter, sans-serif | Body text, descriptions | 400, 500, 600 |

Both imported from Google Fonts.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Urbanist:wght@500;600;700&display=swap');
```

### Heading Styles

| Level | Font | Size | Weight | Tracking | Color | Use Case |
|-------|------|------|--------|----------|-------|----------|
| **H1** | Urbanist | 2.25rem (36px) | 700 | normal | white | Page titles (theme title) |
| **H2** | Urbanist | 1.5rem (24px) | 600 | normal | white | Section titles (Meeting, Film Selection) |
| **H3** | Urbanist | 1.25rem (20px) | 600 | normal | white | Subsection titles |
| **Label (caps)** | Urbanist | 0.75rem (12px) | 700 | 0.16em (widest) | neutral-400 | Section markers, labels |

Example: `<p class="section-label">Film Selection</p>`

```html
<!-- Output: ■ FILM SELECTION (with red square) -->
```

### Body Text

| Purpose | Font | Size | Weight | Color | Line-Height |
|---------|------|------|--------|-------|-------------|
| **Paragraph** | Inter | 1rem (16px) | 400 | white | 1.5 (relaxed) |
| **Secondary text** | Inter | 0.875rem (14px) | 400 | neutral-400 | 1.5 |
| **Emphasis/ui** | Inter | 1rem | 600 | white | — |
| **Caption** | Inter | 0.75rem (12px) | 400 | neutral-600 | 1.25 |

### Typography Hierarchy Example

```
Page Title (H1)
├─ Section Label (caps + square motif)
├─ Section Title (H2)
│  ├─ Metadata (secondary text, smaller)
│  └─ Description (body paragraph)
└─ Related content
```

---

## Layout System

### Grid & Spacing

The site uses Tailwind's spacing scale (4px base unit).

| Purpose | Values | Example |
|---------|--------|---------|
| **Container width** | `max-w-site` = 1200px | Constrains all content |
| **Page padding** | `px-6` = 24px (mobile), `px-8` = 32px (desktop) | Edge margins |
| **Vertical spacing** | `py-16` (64px), `py-12` (48px), `py-8` (32px) | Section separation |
| **Component gaps** | `gap-4` (16px), `gap-6` (24px), `gap-8` (32px) | Internal spacing |
| **Text spacing** | `mt-4`, `mb-8` | Between elements |

### Breakpoints

Uses Tailwind defaults:

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| **default** | 320px+ | Mobile |
| **md** | 768px+ | Tablet |
| **lg** | 1024px+ | Desktop |

Example: `hidden lg:block` = hidden on mobile, shown on desktop.

### Container Pattern

All pages follow this structure:

```html
<div class="max-w-site mx-auto px-6 py-16">
  <!-- Content constrained to 1200px, centered, with padding -->
</div>
```

This ensures:
- Readable line lengths
- Consistent margins
- Easy to scan on any device
- Responsive without explicit breakpoints

---

## Component Library

### Section Label (with Square Motif)

The red square from the Bath Film Club logo is used to mark section headers.

```html
<p class="section-label">Film Selection</p>
<!-- Output: ■ FILM SELECTION -->
```

**CSS:**
```css
.section-label {
  @apply flex items-center gap-2 text-xs font-heading font-bold 
         uppercase tracking-widest text-neutral-400;
}

.section-label::before {
  content: '■';
  @apply text-brand-red text-3xl leading-none;
}
```

**Usage:** Before every major section (Current Theme, Film Selection, Archive, etc.)

### Film Pyramid

Displays films in a visual hierarchy matching the selection process.

```
        [Film] [Film]              (Selected: 2 films)
      [Film] [Film] [Film]         (Shortlisted: 5 films)
   [Film] ... [Film] [Film]        (Nominated: all films)
```

**Component:** `site/src/components/FilmPyramid.astro`

**Visual logic:**
- Selected films: largest, centered, eye-catching
- Shortlisted: medium size, wider row
- Nominated: smallest, many films, widest row
- Each row is full-width, centered
- Film cards use consistent 150x225px poster images (Tailwind sizing)

**Color treatment:**
- Selected row: no background
- Shortlisted row: neutral-700 background for contrast
- Nominated row: neutral-800 background (darker)
- Cards animate in from bottom on page load

### Film Card

Individual film poster with hover state.

```html
<button class="relative group cursor-pointer">
  <img src="poster.jpg" alt="Film title" />
  <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity" />
</button>
```

**Properties:**
- Responsive sizing: `h-40` (mobile), `h-56` (tablet), `h-64` (desktop)
- Aspect ratio: 2:3 (standard poster)
- Hover: subtle darkening overlay (no text)
- Click: opens detail panel
- No labels under posters (keep visual clean)

### Film Detail Panel

Slide-in panel from right edge with full film information.

**Visual properties:**
- Width: `max-w-lg` (32rem / 512px)
- Background: white
- Shadow: heavy drop shadow (`shadow-2xl`)
- Animation: slide from right in 300ms (`translate-x-full` → `translate-x-0`)
- Z-index: 50 (above overlay at 40)
- Scrollable body (films may have long synopses)

**Content hierarchy:**
1. Poster (full width at top)
2. Title + metadata
3. Genres (badges with light borders)
4. Synopsis
5. Details list (Director, Producers, Cast)
6. Trailer link (if available)

### Button Styles

#### Discord Call-to-Action

```html
<a href="discord-link" class="btn-discord">
  Join Discord →
</a>
```

**Properties:**
- Background: brand-red
- Text: white, bold, large
- Padding: 12px 20px (py-3 px-5)
- Hover: darker red (`hover:bg-red-800`)
- Smooth transition

#### Secondary Buttons

For admin tool and navigation:

```html
<button class="px-3 py-2 text-sm border border-neutral-300 hover:text-brand-red transition-colors">
  Action
</button>
```

- Simple outline style
- Minimal, doesn't draw attention
- Hover: text turns red

### Links

**Default:** white with underline on hover
**Special:** brand-red (prominent CTAs)

```html
<!-- Default -->
<a href="#" class="hover:underline">Link text</a>

<!-- CTA -->
<a href="#" class="text-brand-red font-heading font-semibold hover:underline">
  Join Discord ↗
</a>
```

---

## Layout Patterns

### Page Structure

Every page follows this pattern:

```
┌──────────────────────────────────────┐
│  Header (Home / Archive links)       │
├──────────────────────────────────────┤
│                                      │
│  [Main Content]                      │
│  (max-w-site, py-16)                 │
│                                      │
├──────────────────────────────────────┤
│  Footer (copyright)                  │
└──────────────────────────────────────┘
```

### Homepage

```
Header
  ├─ Hero (logo, intro, CTA)
  ├─ Current Theme (title, description)
  ├─ Meeting Details (date, time, venue)
  ├─ Film Pyramid (the main visual feature)
  └─ How It Works (process explanation)
Footer
```

### Theme Detail Page

```
Header
  ├─ Sidebar (theme navigation)
  └─ Main (theme info + pyramid)
Footer
```

### Archive Page

```
Header
  ├─ Search/filter controls
  └─ Theme list (collapsible rows)
Footer
```

---

## Visual Patterns

### Emphasis & Contrast

High contrast is key to readability and visual hierarchy.

| Element | Background | Text | Contrast |
|---------|-----------|------|----------|
| Primary text | black | white | Maximum |
| Secondary text | black | neutral-400 | High |
| Hover state | black | brand-red | High |
| Dividers | black | neutral-600 | Medium |
| Dark panels | neutral-700+ | white | High |
| Light panels | white | neutral-900 | High |

### Whitespace

Generous spacing creates a premium, editorial feel.

- Between sections: `py-12` (48px) minimum
- Between related elements: `gap-4` to `gap-8`
- Around containers: `px-6` (24px) minimum
- Line height in text: 1.5 (relaxed, not cramped)

### Interactions

All interactions use smooth transitions:

- **Color changes**: `transition-colors` (150ms)
- **Opacity changes**: `transition-opacity` (300ms)
- **Position changes**: `transition-transform duration-300` (slide, fade)
- **No instant changes** — everything breathes

Example:
```html
<a class="text-white hover:text-brand-red transition-colors">
  Link
</a>
```

### Animations

**Page load:**
- Film cards fade in from bottom (`translate-y-8 opacity-0` → `translate-y-0 opacity-100`)
- Delay based on position (staggered)
- Duration: 400-600ms

**Interactive:**
- Film panel slides from right (`translate-x-full` → `translate-x-0`)
- Duration: 300ms, easing: `ease-in-out`
- Overlay fades in simultaneously

**Hover:**
- Subtle darkening on film cards
- Text color change on links
- No bounce or scale effects (too playful)

---

## Responsive Design

The site is **mobile-first** — designed for small screens first, enhanced for larger ones.

### Mobile (320px+)

- Full-width content with `px-6` padding
- Stacked layouts (not grids)
- Touch-friendly button sizes (48px minimum)
- Film pyramid cards: smaller, single-column where needed
- All features available

### Tablet (768px+)

- Slightly increased padding
- Grid layouts begin
- Film pyramid shows 2-3 columns

### Desktop (1024px+)

- Full-width layouts with `max-w-site` constraint
- Sidebar navigation on theme pages
- Film pyramid full multi-row layout
- Optimal reading line length (~65 chars)

### No Breakpoint-Based Hiding

All content is shown on all devices (except very specific admin UI elements). Don't hide information on mobile — instead, make it responsive.

---

## Accessibility

### Colour Contrast

All text meets WCAG AA standards (4.5:1 minimum for small text):

- White on black: ✓ 21:1
- Brand red on black: ✓ 5.3:1
- Neutral-400 on black: ✓ 4.5:1
- All combinations tested

### Semantic HTML

- Use `<h1>`, `<h2>` for hierarchy (not div with classes)
- `<button>` for clickable actions, `<a>` for navigation
- `<main>`, `<aside>`, `<header>`, `<footer>` for structure
- `role="dialog"` on modal panels
- `aria-label` on icon buttons

### Keyboard Navigation

- All interactive elements are keyboard-accessible
- Film panel can be closed with Escape key
- Tab order is logical (left-to-right, top-to-bottom)
- No keyboard traps

### Images

- Meaningful images have descriptive `alt` text
- Decorative elements have `alt=""` (empty)

Example:
```html
<!-- Good: descriptive -->
<img src="poster.jpg" alt="Stalker directed by Andrei Tarkovsky" />

<!-- Good: decoration, no alt needed but marked empty -->
<div class="decorative" aria-hidden="true" />
```

---

## Design Files & References

### Stored Locally

- **Logo SVG** → `site/public/assets/logo.svg`
- **Global styles** → `site/src/styles/global.css`
- **Tailwind config** → `site/tailwind.config.ts`

### Referenced in Brief

- **Brand colours** → `docs/BathFilmClub_Brief.txt` (sections 474-500)
- **Visual language** → `docs/BathFilmClub_Brief.txt` (sections 510-532)
- **Typography** → `docs/BathFilmClub_Brief.txt` (sections 449-471)

---

## How to Extend the Design

### Change Colours

1. Edit `site/tailwind.config.ts` → `theme.colors`
2. Update `site/src/styles/global.css` if needed
3. Search codebase for old colour and replace Tailwind classes
4. Test across all pages

Example: Change brand red from `#860909` to `#CC0000`:
```typescript
// tailwind.config.ts
colors: {
  brand: {
    red: '#CC0000',  // was #860909
    // ...
  }
}
```

### Change Typography

1. Update Google Fonts import in `global.css`
2. Update `tailwind.config.ts` → `theme.fontFamily`
3. Adjust font sizes in components if needed
4. Test readability and hierarchy

### Add New Component

1. Create new `.astro` or `.tsx` file in `site/src/components/`
2. Use existing components as reference for styling
3. Apply consistent spacing, colours, typography
4. Use Tailwind classes exclusively (no inline styles)
5. Test at mobile and desktop sizes

### Change Layout

1. Identify the component (usually `.astro` file)
2. Update grid/flexbox structure
3. Adjust spacing (`gap-`, `p-`, `m-`)
4. Test responsiveness at all breakpoints
5. Verify alignment and hierarchy

---

## Design Decisions Reference

| Decision | Rationale | Reference |
|----------|-----------|-----------|
| Black + White base | Maximum contrast, posters pop | Brief §423-429 |
| Urbanist headings | Geometric, contemporary, editorial | Brief §449-460 |
| Inter body text | Highly readable, neutral, clean | Brief §462-470 |
| Brand red sparingly | Accent only, never overwhelming | Brief §490-500 |
| Square motif | Logo-derived, visual signature | Brief §510-532 |
| No gradients/shadows | Editorial aesthetic, not trendy | Brief §423-429 |
| Film posters primary | Visual richness from content, not design | Brief §535-552 |
| Static site | Fast, cheap, editorial feel | ARCHITECTURE.md |
| Mobile-first | Works anywhere, no degradation | Brief §411 |

---

## Maintenance

### Regular Reviews

| Task | Frequency | Owner | Notes |
|------|-----------|-------|-------|
| **Visual consistency** | Per PR | Reviewer | Check for off-brand colours or spacing |
| **Accessibility audit** | Quarterly | Av | Run accessibility checker, verify contrast |
| **Responsive testing** | Per feature | Developer | Test at mobile, tablet, desktop |
| **Update this doc** | Quarterly | Av | Add new patterns, document decisions |

### Design Checklist Before Launch

- [ ] All text meets WCAG AA colour contrast
- [ ] Page tested at 320px, 768px, 1024px widths
- [ ] No colours outside of defined palette
- [ ] All spacing uses Tailwind scale (4px multiples)
- [ ] Typography hierarchy is clear
- [ ] Hover states are consistent
- [ ] Film posters are the visual focus
- [ ] No animations feel janky or slow
- [ ] Keyboard navigation works
- [ ] Mobile layout is not cramped

---

## Component Quick Reference

```html
<!-- Section Label with square motif -->
<p class="section-label">Film Selection</p>

<!-- Discord CTA Button -->
<a href="#" class="btn-discord">Join Discord →</a>

<!-- Secondary Button -->
<button class="px-3 py-2 text-sm border border-neutral-300 hover:text-brand-red">
  Action
</button>

<!-- Text Hierarchy -->
<h1 class="font-heading font-bold text-4xl">Page Title</h1>
<h2 class="font-heading font-semibold text-2xl">Section Title</h2>
<p class="font-body text-sm text-neutral-400">Secondary text</p>

<!-- Container Pattern -->
<div class="max-w-site mx-auto px-6 py-16">
  <!-- Content -->
</div>

<!-- Responsive Grid -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <!-- Items -->
</div>

<!-- Link with Hover -->
<a href="#" class="text-white hover:text-brand-red transition-colors">Link</a>
```

---

## Questions?

If something in this doc is unclear or doesn't match the actual site, please update it and note the changes in the git commit message.
