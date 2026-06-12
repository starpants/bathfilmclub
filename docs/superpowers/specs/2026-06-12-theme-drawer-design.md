# Theme Drawer — Design Spec

**Date:** 2026-06-12  
**Status:** Approved

## Overview

Replace the two-column layout on the theme detail page (`/theme/[slug]`) with a single-column layout. The sidebar theme navigation is replaced by a left-side drawer triggered from the header. This mirrors the existing FilmPanel right-side drawer pattern, with left/right direction conveying navigation vs. detail respectively.

## Goals

- Single-column layout on theme pages (more space for film pyramid)
- Theme browsing accessible without leaving the page
- Consistent interaction pattern with the existing FilmPanel component
- Works on mobile and desktop identically

## Architecture

### New component: `ThemeDrawer.tsx`

A self-contained React island that renders both its own trigger button and the drawer panel. Manages its own `isOpen` state — no external state or custom DOM events needed.

**Props:**
```ts
interface Props {
  themes: Theme[];
  currentSlug: string;
}
```

**Trigger button:**
- Label: "Browse"
- Styled with `interactive-item` class to match the Home/Archive nav links
- Rendered inside the header nav via the Header prop (see below)

**Overlay:**
- `fixed inset-0 bg-black/60 z-40`
- Click to close
- Matches FilmPanel overlay exactly

**Panel:**
- `fixed left-0 top-0 h-full w-72 bg-brand-black border-r border-neutral-800 z-50`
- Slides in from left: `-translate-x-full` (closed) → `translate-x-0` (open)
- `transition-transform duration-300 ease-in-out` — same timing as FilmPanel
- Overflow: `overflow-y-auto` for tall theme lists

**Panel content:**
- Close (✕) button top-right corner
- Themes grouped by year, sorted descending (newest first)
- Year label: `font-heading font-bold text-xs uppercase tracking-widest text-neutral-400`
- Theme links: `interactive-item` class; current slug gets `active` variant (white fill)
- Clicking a link navigates to that theme (standard `<a href>`)

**Interactions:**
- Escape key → close (via `keydown` listener, same as FilmPanel)
- Overlay click → close
- ✕ button → close
- Scroll lock: `document.body.style.overflow = 'hidden'` while open, cleared on close/unmount

### Modified: `Header.astro`

Add an optional prop:
```ts
interface Props {
  themes?: Theme[];
  currentSlug?: string;
}
```

When `themes` is provided, render `<ThemeDrawer themes={themes} currentSlug={currentSlug} client:load />` inside the `<nav>` element, before the Home/Archive links.

When `themes` is not provided (all pages except theme detail), the header renders exactly as today — no change.

### Modified: `[slug].astro`

**Remove:**
- The outer `flex gap-16` wrapper
- The entire `<nav>` sidebar block (the `hidden lg:block w-52 shrink-0 sticky top-8` element)
- The `byYear`/`years` data derivation (moves into ThemeDrawer)

**Change:**
- `<Header />` → `<Header themes={allThemes} currentSlug={theme.slug} />`
- `<main class="flex-1 min-w-0 space-y-12">` → `<main class="space-y-12">`
- Outer `<div class="max-w-site mx-auto px-6 py-16">` stays as-is (already correct for single column)

## Non-goals

- No animation on the trigger button itself
- No search or filtering of themes in the drawer
- No change to the archive page or homepage
- No change to FilmPanel

## File summary

| File | Action |
|---|---|
| `site/src/components/ThemeDrawer.tsx` | Create |
| `site/src/components/Header.astro` | Modify — add optional themes/currentSlug props |
| `site/src/pages/theme/[slug].astro` | Modify — single column, pass themes to Header |
