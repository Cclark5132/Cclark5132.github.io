# Charles T. Clark - Mechanical Engineering Portfolio

A production-ready, recruiter-facing portfolio for Charles T. Clark. The site emphasizes project case studies, measurable engineering outcomes, and a hands-on process spanning CAD, analysis, fabrication, and testing.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Framer Motion
- Lucide React
- React Router with a GitHub Pages SPA fallback

No backend, database, paid service, or private API is required.

## Local setup

Requirements: Node.js 20+ and pnpm 10+.

```bash
pnpm install
pnpm dev
```

Vite prints the local preview URL. Open it in a browser to review the site.

## Commands

```bash
pnpm dev         # Start the development server
pnpm typecheck   # Run the TypeScript check
pnpm build       # Type-check and create the production build in dist/
pnpm preview     # Preview the production build locally
```

## Editing portfolio content

Most editable facts, copy, project details, metrics, skills, media paths, captions, and links live in [`src/data/portfolio.ts`](src/data/portfolio.ts). Navigation labels live in [`src/data/navigation.ts`](src/data/navigation.ts).

Start with these profile values:

1. Replace the LinkedIn placeholder URL.
2. Replace the GitHub placeholder URL.
3. Add a portrait or workshop photograph.
4. Add approved project media using the paths already listed in the project data.

Missing local media never produces a broken-image icon. `ProjectMedia` automatically presents a designed, labeled fallback panel until the referenced file exists.

## Replacing project photos, video, CAD renders, and PDFs

Create the folders shown below inside `public/`, then add the files with the exact names already referenced in `src/data/portfolio.ts`. Alternatively, change each path in the data file to match your chosen filename.

Recommended formats:

- Photos and CAD renders: WebP or AVIF, 1600-2400 px wide
- Cover images: 16:10 landscape
- Portrait: 4:5 portrait
- Video: compressed MP4 (H.264) or WebM, muted-safe, with a poster image
- Documents: accessible, compressed PDF files
- Every media item: keep accurate `alt` text and a useful caption

External media is supported by setting a media item's `type` to `youtube` or `vimeo` and using the provider's embed URL in `src`.

### Placeholder checklist

Profile:

- `public/about/portrait-placeholder.webp`
- Hero media currently points to the pulse-jet cover; update `profile.heroMedia` if a different image or video should lead the site.
- LinkedIn URL in `profile.linkedIn`
- GitHub URL in `profile.github`

Pulse Jet Design Team:

- `public/projects/pulse-jet/cover-placeholder.webp`
- `public/projects/pulse-jet/fabrication-placeholder.webp`
- `public/projects/pulse-jet/test-bench-placeholder.webp`
- `public/projects/pulse-jet/data-placeholder.webp`
- `public/projects/pulse-jet/team-placeholder.webp`
- `public/projects/pulse-jet/test-fire-placeholder.mp4`
- `public/projects/pulse-jet/test-fire-poster-placeholder.webp`
- `public/projects/pulse-jet/thrust-test-placeholder.mp4`
- `public/projects/pulse-jet/test-summary-placeholder.pdf`

Culligan Product Design Work - only use files approved for public release:

- `public/projects/culligan/confidential-cover-placeholder.webp`
- `public/projects/culligan/footprint-diagram-placeholder.webp`
- `public/projects/culligan/fea-placeholder.webp`
- `public/projects/culligan/training-concept-placeholder.webp`

Automotive Restoration:

- `public/projects/automotive/jeep-before-placeholder.webp`
- `public/projects/automotive/jeep-after-placeholder.webp`
- `public/projects/automotive/engine-bay-placeholder.webp`
- `public/projects/automotive/welding-placeholder.webp`
- `public/projects/automotive/walkaround-placeholder.mp4`

Telescoping Accessibility Crutch:

- `public/projects/crutch/prototype-placeholder.webp`
- `public/projects/crutch/cad-placeholder.webp`
- `public/projects/crutch/mechanism-placeholder.webp`
- `public/projects/crutch/iterations-placeholder.webp`
- `public/projects/crutch/demo-placeholder.mp4`

The active minimalist social-sharing image is `public/og-simple.png`. Replace it only with another 3:2 or 1.91:1 image that preserves the site title at small sizes.

## Resume

The downloadable resume is stored at:

```text
public/Charles-Clark-Resume.pdf
```

All resume buttons read the path from `profile.resume` in `src/data/portfolio.ts`. Replace the PDF in place to update it everywhere without editing components. The phone number remains inside the PDF and is not displayed on the site.

## GitHub Pages deployment

1. Create a GitHub repository and push this project to its `main` branch.
2. In the repository, open **Settings -> Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main`. `.github/workflows/deploy.yml` installs, builds, and publishes the `dist/` directory automatically.
5. Review the run under the repository's **Actions** tab.

The included `public/404.html` returns direct project URLs such as `/projects/pulse-jet` to the React application, so bookmarked case studies work on GitHub Pages.

## Custom domain: charlesclark.me

`public/CNAME` already contains `charlesclark.me`. In GitHub **Settings -> Pages**, enter the same custom domain and enable **Enforce HTTPS** once DNS is active.

At the DNS provider, configure:

- An `A` record for `@` pointing to each current GitHub Pages IPv4 address documented by GitHub.
- An `AAAA` record for `@` for the current GitHub Pages IPv6 addresses, if desired.
- A `CNAME` record for `www` pointing to `<github-username>.github.io`.

Use GitHub's current documentation when entering IP addresses because hosting guidance can change. The Vite base is `/`, which is correct for the custom root domain. If the site is intentionally deployed only at `username.github.io/repository-name/`, update `base` in `vite.config.ts` to `/repository-name/` and adjust the fallback paths.

## SEO and accessibility

The project includes:

- Canonical URL, Open Graph metadata, X card metadata, and Person structured data
- `robots.txt` and `sitemap.xml`
- Semantic headings and landmarks
- Keyboard-accessible navigation and visible focus states
- Meaningful fallback labels and alt text
- Reduced-motion behavior
- Lazy-loaded project media and responsive layouts

Before launch, verify the final LinkedIn/GitHub URLs, approved public project content, video captions or transcripts, and the custom-domain DNS records.
