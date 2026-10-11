# Charles T. Clark Engineering Portfolio

Portfolio site for Charles T. Clark: Virginia Tech, B.S. Mechanical Engineering (expected May 2028), incoming at SpaceX.

Live site: [charlesclark.me](https://charlesclark.me)

## Content

The home page has five sections, in this order:

1. Hero: name, status, school, degree, graduation, GPA, location, and links to projects, resume, email and LinkedIn
2. Projects: Pulse Jet Design Team, Culligan International, Automotive Restoration, Telescoping Accessibility Crutch
3. Experience and education, with credentials
4. Skills
5. Contact

Each project has its own page at `/projects/<slug>` (`pulse-jet`, `culligan`, `automotive-restoration`, `telescoping-crutch`).

All text, numbers, captions and media references live in [`src/data/portfolio.ts`](src/data/portfolio.ts). Page titles and descriptions are built in [`src/data/meta.ts`](src/data/meta.ts).

## Adding the pulse jet test video

The pulse jet page has a reserved slot for a test video near the top. It currently holds a filler: a 10-second muted loop made from the three existing pulse jet photos (`public/project-videos/pulse-jet-build-sequence.mp4`), labeled "Build sequence". With `media: null` the slot shows a labeled "Pending" placeholder instead.

To publish a test video, edit the `testVideo` entry of the `pulse-jet` project in `src/data/portfolio.ts`: set `label` to `"Test run video"` and replace `media` with one of the following.

A video file (put the file in `public/project-videos/`; MP4 with H.264 plays everywhere):

```ts
testVideo: {
  label: "Test run video",
  media: {
    type: "video",
    src: "/project-videos/pulse-jet-test.mp4",
    poster: "/project-photos/pulse-jet-test-assembly.webp",
    label: "Static thrust test",
    alt: "Pulse jet running on the test bench",
    caption: "One sentence describing what the video shows.",
  },
},
```

A YouTube or Vimeo video (the id or the full URL both work):

```ts
media: { type: "youtube", src: "VIDEO_ID", label: "Static thrust test", alt: "Pulse jet running on the test bench" },
media: { type: "vimeo", src: "123456789", label: "Static thrust test", alt: "Pulse jet running on the test bench" },
```

YouTube and Vimeo players load only after the visitor presses play, so the page stays fast. Once a video is added it becomes Fig. 1 and the other figures renumber automatically.

## Design

- Warm off-white background (`#f3efe8`). Chicago Maroon `#861f41` is the structural color: rules, title strips, section numbers, primary buttons. Burnt Orange `#e5751f` marks numbers, link underlines and the focus ring.
- Orange is only 2.7:1 against the light background, so it never carries text there. Key numbers sit on dark readout panels, where orange is 5.7:1. Every text pairing meets WCAG AA; the ratios are listed at the top of [`src/styles.css`](src/styles.css).
- Type: Archivo (variable, with a width axis, for headings and body) and IBM Plex Mono (labels and metadata), self-hosted through Fontsource.
- Project metadata (number, role, dates, location) is laid out like a drawing title block.

## Motion

The page is drawn like a drawing sheet as it scrolls in: lines draw, headings rise, images are plotted behind a scan line, and small items pop in one after another.

| Effect | Where | Behavior |
| --- | --- | --- |
| Hero and project title blocks | Top of each page, on load | Name or title rises from behind its edge, the empty title block fills in cell by cell, the photo is uncovered behind an orange scan line, buttons pop in |
| Drawn rules and rising headings | Every section heading, write-up section and contact row | The rule draws from left to right, then the heading rises from behind it |
| Plotted images | Project cards, figures, video slot | A drafting grid appears, an orange scan line sweeps across and the image is revealed behind it |
| Popping items | Key numbers, skills, credentials, list items | Items scale in one after another with a small overshoot |
| Count-up numbers | Key numbers | Numbers start at zero and count to their value when scrolled into view |
| Experience timeline | Experience list | A line draws down the list as it scrolls past the middle of the screen; each entry's marker turns orange when the line reaches it |
| Stacking project cards | Home, desktop screens at least 1100 px wide and 740 px tall | Each card pins below the previous card's title strip, so the strips collect at the top as an index |
| Sticky spec rail | Project pages, 1024 px and wider | Role, dates, location and key numbers stay beside the write-up while it scrolls |
| Scroll progress bar | Header | Thin orange bar showing position on the page |

How it works: an element with `data-reveal` is a trigger, and [`src/lib/reveal.ts`](src/lib/reveal.ts) marks it when it scrolls into view. Its children carry classes that say how they appear (`r-draw`, `r-rise`, `r-fade`, `r-pop`, `r-wipe`, `r-plot`). Containers with the class `intro` play the same animations on page load. Timing is set per component at the end of [`src/styles.css`](src/styles.css).

All of it is off when the visitor's system asks for reduced motion: everything is shown in its final state, cards and the rail scroll normally, the timeline is drawn in full, the progress bar is hidden and the crutch and build-sequence clips do not autoplay. Nothing is hidden when JavaScript is off. On phones and short screens the project cards are a plain list. Animations use transforms, opacity and clip-path only, and every image has its size set, so nothing shifts while the page loads.

## Media

Photos live in [`public/project-photos`](public/project-photos) as WebP. Full-quality originals are in [`source-photos/`](source-photos), which is not published. See [`public/project-photos/README.md`](public/project-photos/README.md) for export sizes and the current file list.

Only Culligan images approved for public release are used.

## Resume

The resume buttons link to `public/Charles-Clark-Resume.pdf`. Replacing that file updates every link.

## Technology

- React 19, TypeScript, React Router
- Vite 8, Tailwind CSS 4
- Fontsource (Archivo, IBM Plex Mono), Lucide icons

## Local development

Requires Node.js 20+ and pnpm 10+.

```bash
pnpm install
pnpm dev
```

Checks before publishing:

```bash
pnpm typecheck
pnpm build
pnpm preview
```

## Deployment

Pushing to `main` publishes the site through GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) to GitHub Pages on the custom domain `charlesclark.me`.

[`scripts/prerender-projects.ts`](scripts/prerender-projects.ts) renders the home page and every project page to HTML at build time, with each page's own title, description, canonical URL and social tags. Project pages are written to `dist/projects/<slug>.html`, which GitHub Pages serves at `/projects/<slug>`. In the browser, [`src/main.tsx`](src/main.tsx) hydrates that markup when it belongs to the current URL. Any other path falls back to [`public/404.html`](public/404.html), which hands the path to the app.

The build fails if a project page is missing from [`public/sitemap.xml`](public/sitemap.xml). When adding a project, add its URL there.

## Repository structure

```text
public/
  project-photos/       Published photos (WebP)
  project-videos/       Crutch animation and its poster frame
  Charles-Clark-Resume.pdf
  og-image.jpg          Link-preview image
  CNAME, robots.txt, sitemap.xml, 404.html
scripts/
  prerender-projects.ts Build-time HTML for every page
src/
  components/           Header, project sheets, readouts, media, figures
  data/                 Portfolio content, navigation, page metadata
  lib/                  Motion helpers, head-tag updates
  pages/                Home, project page, 404
source-photos/          Originals, not published
```

## Content rules

- Use only verified facts. No invented numbers, dates or outcomes.
- Plain, specific sentences. Each one states a fact, a decision or a result.
- Keep alt text descriptive and captions factual.
