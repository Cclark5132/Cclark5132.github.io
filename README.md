# Charles T. Clark Engineering Portfolio

Recruiter-facing mechanical engineering portfolio for Charles T. Clark, a Third-Year Mechanical Engineering Student at Virginia Tech with experience in product design, SolidWorks, finite element analysis, prototyping, fabrication, and test engineering.

Live site: [charlesclark.me](https://charlesclark.me)

## Portfolio content

The website presents four engineering case studies:

- Culligan International product design
- Pulse Jet Design Team
- Automotive restoration
- Telescoping accessibility crutch

Project facts, metrics, skills, captions, and media references are maintained in [`src/data/portfolio.ts`](src/data/portfolio.ts).

## Adding project photography

All website photography belongs in [`public/project-photos`](public/project-photos).

The folder contains a complete filename checklist and image guidance:

[`public/project-photos/README.md`](public/project-photos/README.md)

Once an image has the exact listed filename and is placed in that folder, the website will display it automatically.

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

Direct project URLs are handled by the GitHub Pages single-page application fallback in [`public/404.html`](public/404.html).

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
