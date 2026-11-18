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

## Pages and project links

- `/skyray-website/`: studio introduction, three featured artworks, six selected projects and the existing home-page loop.
- `/skyray-website/portfolio/`: the complete collection with all 27 projects, category filters and keyword search.
- `/skyray-website/portfolio/?project=darley`: a project page showing every artwork in the series at its original proportions, section links, detail enlargement and the next project.

Vite builds both HTML entry points, so portfolio links and project query URLs can be opened directly or refreshed on GitHub Pages. Category (`category`) and search (`q`) parameters are kept in project links and the return link. Browser Back also returns to the previous collection. Unknown project identifiers show a recovery link to the portfolio. Both pages share language, system motion preferences, header and the local-only project brief dialog. The portfolio uses a regular footer for browsing the collection; the existing looping experience remains on the studio homepage.

Add or update projects in `lib/portfolio.ts`. The homepage, portfolio cards, category totals and complete series pages all read that same catalog. Only supplied artwork and descriptions are presented; no client results, dates or credits are invented.

## GitHub Pages

Set repository Settings → Pages → Source to GitHub Actions. The included workflow builds and publishes pushes to `main`.

## Features

- 27 projects/collections, 42 artwork boards, six categories, search and full-image viewer.
- Fixed header, contextual custom cursor that replaces the native pointer while active, entry transitions, scroll reveals, artwork hover highlights and a text-led magnetic contact invitation.
- Procedural fog with viewport/visibility pause, a 960×440 backing-surface ceiling and capped frame rate. Pointer work is batched per animation frame, with no delayed cursor chase or per-event text replacement.
- Text-led studio introduction aligned with the studio photograph and expertise; the atmospheric sky treatment stays in the background.
- Traditional Chinese/English, responsive layout, system reduced-motion support.
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

The experimental Lottie component and source are retained for editing but are not imported or rendered by the site; no Lottie player is loaded. Generic link cursors use a small ring. Artwork, filter, drag and contact cursors retain circular shapes with short English labels in both page languages: VIEW, FILTER, SWITCH, DRAG and LET’S TALK.

Hover color, background and border changes ease over 400 ms in both directions. The pointer position has no transition delay; paused/reduced-system motion preferences still disable transitions.

Project navigation is anchored to the dialog: fixed side controls on desktop and a fixed central bottom bar on mobile. The project counter stays in the bottom bar; image proportions, description wrapping and series thumbnails cannot move the controls. Full-image fit and zoom remain available.

The page continues from the footer into a single interactive hero continuation and then returns to the original hero at matching screen coordinates. Repeated scrolling reuses the same DOM; modal/menu interactions block the handoff. Requesting reduced motion disables the loop. Section content reveals on each entry and fades out when leaving the viewport, including subsequent laps. Downward links move their icons vertically, and the search icon shares one high-contrast input shell. Gradient headline lettering includes paint space for the final question mark.

Featured artwork captions use equal-height title/category rows and a shared bottom baseline; artwork remains fit-to-view. Studio accordions animate both height and copy for 400 ms, with collapsed content inert and hidden from assistive technology. Menus fade/slide in both directions; viewer changes fade at 300–350 ms; controls have restrained press and focus feedback. Fog keeps its five draw calls and 960×440 surface cap while using more distinct drift rates, breathing scale and pointer response. All motion respects pause/reduced-system motion preferences.

The studio explicitly presents game production and system development alongside character art, digital experiences and visual identities. The two development service links open the local project brief with the corresponding interest selected. The header motion toggle was removed; the operating system's reduced-motion preference still disables motion. Project cards and grouped content share the same upward fade. Horizontal reveals are reserved for a few section headings, using 24px travel (16px on mobile), the existing opacity/translate transitions and no additional animation loop. Outline headings use a small derivative E/D/S font with merged glyph contours, preserving Lexend shapes while eliminating internal stroke crossings and curved-edge seams. Rebuild it with `scripts/build-outline-font.py` using fonttools and skia-pathops; no additional browser runtime is loaded. Home selected works leave 48px before the archive divider, reduced to 32px on mobile.

Company contact area: a two-column company profile/map and inquiry form, stacking on tablet/mobile. The company address remains 桃園區同德六街89號4樓之A. Google Maps embeds the building address and retains its own map controls; the separate map heading was removed. Contact name, email and inquiry are required; mobile and company are optional, and no tax ID is requested for initial contact. Inline and dialog forms share one component. The owner deferred providing a recipient address, so the accurately named Download inquiry action downloads a local text document only. The visitor-facing setup notice is omitted at the owner’s request; the UI never claims an email was sent. No email delivery or submission backend is configured.

Framed surfaces use a restrained corner scale: 6px for form/search controls, 8px for images and the map, and 12px for the inquiry panel and dialogs. Section rules and typography retain their alignment; circular cursor and viewer controls keep their circular shape.

Studio layout: the bilingual introduction sits beneath the studio photo and caption, aligned to the photo’s left edge; the service accordion remains in the right column. The company panel uses the existing SKYRAY logo above the legal name, omits repeated service labels, and uses 16/24/32px spacing between related groups. Placeholder text is deliberately subdued at #4c5b68 in both inline and dialog inquiry forms; entered values retain #eef3f7.

The fixed header and mobile menu share the sky-blue surface (#b8dcf2), with dark navigation text, logo and focus indicators. Clickable artwork in the home gallery, selected works, portfolio and case gallery scales to 1.045 on hover/focus over 450 ms, contained within the existing rounded frame. Captions remain stationary. Touch has no hover zoom; reduced motion disables scale transitions.

Poker Mars is featured first in the collection and home selection, with three owner-supplied 1080 × 1350 campaign/interface images. The archive now contains 28 projects and 45 images; home project/category totals derive from the portfolio data. Existing project IDs and viewer indices remain stable.
