# Copilot Instructions

## Project Overview

**Mona Mayhem** is a retro arcade-themed GitHub Contribution Battle Arena built with Astro 5. Users compare two GitHub usernames' contribution graphs in a game-like UI.

- Entry page: `src/pages/index.astro`
- Contributions API: `src/pages/api/contributions/[username].ts` — dynamic SSR route that should fetch `https://github.com/{username}` contribution data and return JSON

## Build & Dev Commands

```bash
npm run dev       # Start local dev server (http://localhost:4321)
npm run build     # Production build
npm run preview   # Preview production build
```

## Architecture

- **Astro 5 SSR** — `output: 'server'` with `@astrojs/node` standalone adapter; no static pre-rendering by default
- **API routes** use `export const prerender = false` and export a named `GET` (or other HTTP verb) handler returning a `Response`
- **TypeScript strict mode** via `astro/tsconfigs/strict`

## Astro Best Practices

- Keep data fetching in the frontmatter (`---` block) of `.astro` files; pass data as props to components
- Use `Astro.params` for dynamic route params (e.g., `[username].ts` → `Astro.params.username`)
- API routes live under `src/pages/api/` and return `new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })`
- Prefer native `fetch` for external HTTP calls — no extra HTTP libraries needed
- Scope CSS inside `.astro` components with `<style>` (automatically scoped); use `<style is:global>` only for resets/themes
- No UI framework (React/Vue/etc.) is installed — use Astro components and vanilla JS `<script>` tags
