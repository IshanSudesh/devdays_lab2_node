# Mona Mayhem – Copilot Instructions

## Project Overview

**Mona Mayhem** is a GitHub Contribution Battle Arena built with Astro (SSR) and the Node.js adapter. Users can compare GitHub contribution stats head-to-head via a web UI backed by a server-side API.

- Framework: [Astro](https://astro.build) v5 with `output: 'server'` (SSR)
- Adapter: `@astrojs/node` (standalone mode)
- Language: TypeScript

## Build & Dev Commands

```bash
npm run dev       # Start dev server (localhost:4321)
npm run build     # Build for production (outputs to dist/)
npm run preview   # Preview production build locally
```

## Project Structure

```
src/
  pages/
    index.astro                        # Home page
    api/contributions/[username].ts    # REST endpoint: GET /api/contributions/:username
public/                                # Static assets
```

## Astro Best Practices

- **Pages** live in `src/pages/`. File name determines the route (e.g. `src/pages/about.astro` → `/about`).
- **Frontmatter** (`---` blocks) in `.astro` files runs server-side only; keep data fetching and logic here.
- **API routes** export named handlers (`GET`, `POST`, etc.) typed as `APIRoute` from `astro`.
- **SSR mode**: `prerender` defaults to `false` for all routes. Explicitly set `export const prerender = true` only for routes that should be statically generated.
- **Components**: Reusable UI goes in `src/components/` as `.astro` files; use `Astro.props` with a typed `Props` interface.
- **Environment variables**: Access server-only secrets via `import.meta.env` in frontmatter or API routes — never in client scripts.
- **Client interactivity**: Add `<script>` tags inside `.astro` files for lightweight client JS; use a UI framework integration (React, Svelte, etc.) only when needed.
- **Styles**: Scoped styles go inside `<style>` in `.astro` files; global styles belong in `public/` or imported in a layout.
