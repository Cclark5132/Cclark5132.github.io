# Project Photos

Every image the portfolio displays lives in this folder and is referenced by filename from `src/data/portfolio.ts`.

## Adding or replacing a photo

1. Keep the full-quality original in [`source-photos/`](../../source-photos). That folder is not published.
2. Export a **WebP** copy about **1600–2400 px wide** (use the larger size for drawings or posters with small text). Quality 82–88 keeps photos and diagrams sharp at roughly 100–500 KB.
3. Save it in this folder and point the matching `src` in `src/data/portfolio.ts` at it.
4. Write meaningful `alt` text and a caption for the image in the same place.
5. Run `pnpm build`, then commit and push to `main`.

Keep each published image under about 600 KB. The homepage loads only the cover images, and project pages load the gallery lazily.

## Current files

| Project | Files |
| --- | --- |
| Pulse Jet Design Team | `pulse-jet-assembly-render.webp` (cover), `pulse-jet-fabricated-engine.webp`, `pulse-jet-test-assembly.webp` (also the homepage hero) |
| Culligan International | `culligan-float-system.webp` (cover), `culligan-bracket-fea.webp`, `culligan-training-suitcase.webp`, `culligan-commercial-drawings.webp` |
| Automotive Restoration | `automotive-comanche-finished.webp` (cover), `automotive-garage-teardown.webp`, `automotive-engine-install.webp`, `automotive-cherokee-finished.webp`, `automotive-engine-bay-wiring.webp` |
| Telescoping Accessibility Crutch | `crutch-accessibility-poster.webp`, `crutch-prototype.webp` |

Only publish Culligan images that Culligan has approved for public release, with confidential dimensions, part numbers, customer information, and internal documents removed.

## Social sharing image

`public/social-preview.png` (1200 px wide, under 200 KB) is the link-preview image for every page. Keep it small: some platforms skip preview images over roughly 1 MB.
