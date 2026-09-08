# galiulin.github.io

Bilingual (EN/RU) tech blog. Astro static site with a few React islands, Tailwind CSS, Pagefind
search, deployed to GitHub Pages by GitHub Actions.

## Commands

```bash
npm install
npm run dev       # dev server on http://localhost:4321 (search is unavailable here)
npm run build     # astro build + pagefind index into dist/
npm run preview   # build, then serve dist/ — use this to test search
npm run check     # astro check (types in .astro / .ts / .tsx)
```

## Adding a post

Create a Markdown file under the language folder:

```
src/content/blog/
  en/2026-05-20-flow-lifecycle-guide.md   ->  /blog/flow-lifecycle-guide/
  ru/2026-05-20-flow-lifecycle-guide.md   ->  /ru/blog/flow-lifecycle-guide/
```

The date prefix in the filename is stripped from the URL; the rest becomes the slug, so keep it
lowercase and hyphenated.

```yaml
---
title: "Reactive Stream Lifecycle Management in Kotlin"
description: "One or two sentences — used in cards, <meta description> and RSS."
pubDate: 2026-05-20
updatedDate: 2026-06-01 # optional
lang: en # en | ru — must match the folder
translationId: flow-lifecycle-guide # shared by both translations of the same post
tags:
  - Kotlin
  - Flow
coverImage: ./cover.png # optional, path relative to the post; goes through astro:assets
featured: true # optional; one post per language is pinned on the home page above the latest list
draft: false # drafts are visible with `npm run dev`, excluded from the build
---
```

Reading time is computed from the word count — do not put it in frontmatter.

### One language only

Write the single file and give it a `translationId` anyway (any unique string, the slug is a good
default). No translation badge is shown, and the language switcher sends visitors to the blog index
of the other language.

### Both languages

Use **the same `translationId`** in both files. That is the only link between them — the filenames
and slugs may differ. Each post then shows a badge to its translation, gets `hreflang` alternates,
and the language switcher stays on the same article when switching.

## Standalone pages

`src/content/pages/{en,ru}/about.md` backs `/about/` and `/ru/about/`. Same idea: `title`,
`description`, `lang`.

## How the site is put together

- **i18n** — Astro i18n routing, `en` is the default locale without a prefix, `ru` lives under
  `/ru/`. UI strings are in `src/i18n/ui.ts`; add a key to both languages at once.
  The language switcher stores the choice in `localStorage`, and `/` redirects a returning visitor
  to their language (a direct link is always honoured).
- **React islands** (the only hydrated components, in `src/components/react/`):
  `LanguageSwitcher`, `SearchModal` (`Cmd/Ctrl+K`), `TableOfContents` (scroll-spy). Everything else
  is static Astro output.
- **Search** — Pagefind indexes the `data-pagefind-body` region of each post at build time into
  `dist/pagefind/`. It does not exist on the dev server; the modal says so.
- **Mermaid** — ` ```mermaid ` blocks are excluded from Shiki and rendered client-side; the library
  is only downloaded on pages that contain a diagram.
- **Copy buttons** — added to every code block on post pages by an inline script in `PostView`
  (mermaid blocks excluded).
- **Social images** — `src/pages/og/[...path].png.ts` renders a 1200×630 card per post (and
  `/og/default.png` for other pages) at build time; `src/lib/og.ts` builds it as SVG in the site's
  colours and rasterises it with `sharp`. Wired into `og:image` by `BaseLayout` / `PostView`.
- **Feeds** — `/rss.xml` and `/ru/rss.xml`, plus `sitemap-index.xml` with `hreflang` alternates.
- **Design tokens** — `src/styles/global.css`. Dark-only by design; a light theme means adding a
  `:root[data-theme="light"]` block there (and a Shiki dual theme in `astro.config.mjs`).

## Deploy

Push to `master`: `.github/workflows/deploy.yml` runs `npm ci && npm run build` via
`withastro/action` and publishes `dist/` to GitHub Pages. Pages must be set to
**Settings → Pages → Source: GitHub Actions**.

The site is served from the domain root, so `astro.config.mjs` sets `site` and no `base`. For a
project page (`user.github.io/repo`), also set `base: "/repo"` — asset URLs already go through
`import.meta.env.BASE_URL` and the i18n URL helpers.
