# Project Photos

Every image the portfolio displays lives in this folder and is referenced by path from `src/data/portfolio.ts`.

## Adding or replacing a photo

1. Keep the full-quality original in [`source-photos/`](../../source-photos). That folder is not published.
2. Export a **WebP** copy about **1600–2400 px wide** (use the larger size for drawings or posters with small text). Quality 82–88 keeps photos and diagrams sharp at roughly 100–500 KB.
3. Save it in this folder and point the matching `src` in `src/data/portfolio.ts` at it.
4. Set `width` and `height` to the file's pixel size so the page reserves the right space before it loads.
5. Write specific `alt` text and a factual `caption` in the same entry.
6. Run `pnpm build`.

Keep each published image under about 600 KB. The home page loads the hero and the four cover images; project pages load figures lazily.

## Optional fields

- `srcSet`: smaller copies for phones, for example `"/project-photos/name-800.webp 800w, /project-photos/name.webp 1600w"`. Used for the hero and the card covers.
- `fit: "contain"` with `matte: "#rrggbb"`: shows the whole image inside a fixed frame (project cards) on a background that matches the image's own background. Used for the SolidWorks render and the float panel.

## Current files

| Project | Files |
| --- | --- |
| Pulse Jet Design Team | `pulse-jet-assembly-render.webp` (cover), `pulse-jet-fabricated-engine.webp`, `pulse-jet-test-assembly.webp`; `pulse-jet-test-assembly-hero.webp` is the 1200 px home page hero |
| Culligan International | `culligan-float-system.webp` (cover), `culligan-bracket-fea.webp`, `culligan-training-suitcase.webp`, `culligan-commercial-drawings.webp` |
| Automotive Restoration | `automotive-comanche-finished.webp` (cover), `automotive-garage-teardown.webp`, `automotive-engine-install.webp`, `automotive-cherokee-finished.webp`, `automotive-engine-bay-wiring.webp` |
| Telescoping Accessibility Crutch | `crutch-prototype.webp`, `crutch-accessibility-poster.webp`; the cover is `../project-videos/telescoping-crutch-animation.mp4` with the poster frame `telescoping-crutch-animation-poster.webp` |
| Phone-size copies | `pulse-jet-test-assembly-hero-600.webp`, `pulse-jet-test-assembly-hero-800.webp`, `pulse-jet-assembly-render-800.webp`, `culligan-float-system-800.webp`, `automotive-comanche-finished-800.webp` |

Only publish Culligan images that Culligan has approved for public release, with confidential dimensions, part numbers, customer information and internal documents removed.

## Link-preview image

`public/og-image.jpg` (1200×630, about 100 KB) is the link-preview image for every page. Keep it small: some platforms skip preview images over roughly 1 MB. `public/social-preview.png` is the previous version and is no longer referenced.
