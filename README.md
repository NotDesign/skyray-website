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
- Fixed header, contextual custom cursor that replaces the native pointer while active, entry transitions, scroll reveals, artwork hover highlights and a text-led magnetic contact invitation.
- Procedural fog with viewport/visibility pause, a 960×440 backing-surface ceiling and capped frame rate. Pointer work is batched per animation frame, with no delayed cursor chase or per-event text replacement.
- Bespoke Sky / Ray Lottie vector motif in the studio and contact sections: 6.7 KB JSON, deferred SVG light player, static fallback, paused offscreen and with reduced motion.
- Traditional Chinese/English, responsive layout, motion pause and reduced-motion support.
- Silent throughout; no audio or video dependencies.

The project brief form only downloads a local text file. It does not send messages or collect submissions. Search indexing remains disabled for this preview.

Artwork and branding belong to their respective rights holders. No license is granted to reuse the portfolio artwork.

## Type and interaction decisions

The site follows a web-specific 16/14/12px type hierarchy using rem units: body 1rem, secondary/controls .875rem, metadata .75rem. Chinese body copy uses a relaxed 1.8 line height. Important controls have at least a 44×44 CSS-pixel target. These are design choices informed by the sources below, not a claim that native iOS points or Android sp map directly to CSS pixels.

- [Apple HIG typography](https://developer.apple.com/design/human-interface-guidelines/typography): readable sizes, contrast, hierarchy and testing across viewing contexts.
- [Google Material Web type tokens](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-typescale.scss): body-large 1rem, label-large .875rem, body-small .75rem.
- [WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): normal text 4.5:1, large text 3:1.
- [WCAG target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): AA minimum 24 CSS pixels with defined exceptions; this site aims for the larger 44px target.

Verified at 1440, 768, 390 and 320 CSS-pixel widths: no page overflow, visible text at least 12px, and measured visible link/button/input targets at least 44px. Mobile artwork and brief dialogs retain full images, 16px text fields and 44px controls. This is targeted validation, not a full accessibility conformance audit.

The Lottie source is `public/animations/skyray-ray.json`, authored for this site as light spreading from one point into multiple paths. It uses no raster images, blur effects, expressions or audio. The player loads only near the section and stops while offscreen, hidden or paused. Generic link cursors use a small ring; only artwork and drag interactions carry contextual labels.
