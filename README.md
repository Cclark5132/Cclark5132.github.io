# Charles T. Clark Engineering Portfolio

Recruiter-facing mechanical engineering portfolio for Charles T. Clark, a third-year Virginia Tech mechanical engineering student incoming at SpaceX in Spring 2027 and seeking a Summer 2027 internship. The portfolio highlights SolidWorks, finite element analysis, product development, prototyping, fabrication, and test engineering.

Live site: [charlesclark.me](https://charlesclark.me)

## Portfolio content

The website presents four engineering case studies:

- Culligan International product design
- Pulse Jet Design Team
- Automotive restoration
- Telescoping accessibility crutch

Project facts, metrics, skills, captions, and media references are maintained in [`src/data/portfolio.ts`](src/data/portfolio.ts).

## Adding project photography

All website photography belongs in [`public/project-photos`](public/project-photos) as compressed WebP files. Full-quality originals are kept in [`source-photos/`](source-photos), which is not published.

The folder README lists the current files and the export guidance:

[`public/project-photos/README.md`](public/project-photos/README.md)

After adding an image, point the matching entry in `src/data/portfolio.ts` at its filename.

## Resume

The downloadable resume is:

```text
public/Charles-Clark-Resume.pdf
```

Updating that file updates every resume button on the website.

## Technology

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Framer Motion
- React Router

## Local development

Requires Node.js 20+ and pnpm 10+.

```bash
pnpm install
pnpm dev
```

Quality checks:

```bash
pnpm typecheck
pnpm build
```

## Deployment

The `main` branch is published automatically through GitHub Actions. The production build is hosted with GitHub Pages and served from the custom domain `charlesclark.me`.

Each case study is prerendered at build time to `dist/projects/<slug>.html` by [`scripts/prerender-projects.ts`](scripts/prerender-projects.ts), so direct project URLs return a real page with the correct title, description, and canonical tags. GitHub Pages serves it at the clean `/projects/<slug>` URL. Any other unknown path falls back to the single-page application redirect in [`public/404.html`](public/404.html).

New projects are picked up automatically from `src/data/portfolio.ts`; add the URL to `public/sitemap.xml` as well.

## Repository structure

```text
public/
  project-photos/       Final portfolio photography
  Charles-Clark-Resume.pdf
  social-preview.png    Social-sharing image
  CNAME
src/
  components/           Shared interface components
  data/                 Portfolio content and navigation
  pages/                Home and case-study pages
```

## Content standards

- Use only accurate, resume-supported project claims.
- Use only Culligan images approved for public release.
- Keep image descriptions meaningful and specific.
- Run the production build before publishing changes.
