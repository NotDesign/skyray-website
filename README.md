# Skyray website

A bilingual creative-studio portfolio built with React, TypeScript and Vite, prepared for GitHub Pages.

## Run locally

```sh
npm ci
npm run dev
```

Open the printed URL under `/skyray-website/`.

## Build and preview

```sh
npm run build
npm run preview
```

The static site is generated in `dist/`. The default base path is `/skyray-website/`; set `PAGES_BASE_PATH=/` to deploy at a domain root.

## GitHub Pages

Set repository Settings → Pages → Source to GitHub Actions. The included workflow builds and publishes pushes to `main`.

## Features

- 27 projects/collections, 42 artwork boards, six categories, search and full-image viewer.
- Fixed header, contextual custom cursor that replaces the native pointer while active, entry transitions, scroll reveals, artwork hover highlights and magnetic contact button.
- Procedural fog with viewport/visibility pause and capped rendering resolution/frame rate.
- Traditional Chinese/English, responsive layout, motion pause and reduced-motion support.
- Silent throughout; no audio or video dependencies.

The project brief form only downloads a local text file. It does not send messages or collect submissions. Search indexing remains disabled for this preview.

Artwork and branding belong to their respective rights holders. No license is granted to reuse the portfolio artwork.
