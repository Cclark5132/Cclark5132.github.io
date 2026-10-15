# Booster Prep

A private study site for the 12-week Starship booster structures internship prep plan ([`content/PLAN.md`](content/PLAN.md)). It is served at `charlesclark.me/booster-prep/`, behind a password, and reached from the small orange marker after the name in the portfolio footer.

## What's in it

Mission dashboard (countdown, today's sessions, progress, streak, hours), roadmap, a page per week, eight structures lessons, tool tracks (NX, Ansys, Python, MATLAB, FEA best practices), calculators, the capstone with a hand-calc panel, an interactive booster anatomy page, flashcards with spaced repetition, resources, glossary, launch prep and global search (Ctrl K or /).

The plan runs October 15, 2026 to January 10, 2027: Week 0 is one 2-hour setup day (Thu Oct 15), Week 1 runs 10 days (Oct 16 – Oct 25, 20 hours), then nine normal 14-hour weeks and two light 7-hour weeks, for **162 hours** in total.

**Finals week.** Week 9 is the light finals week, Dec 14 – Dec 20 by default. If your exams land in a different week, set `FINALS_WEEK_START` in [`src/data/plan.ts`](src/data/plan.ts) to that week's Monday (`2026-11-30`, `2026-12-07`, `2026-12-14` or `2026-12-21`). The site moves Week 9 there and shifts Weeks 7–10 around it.

Progress is stored in the browser's localStorage. Use **Export / Import** (sidebar or dashboard) to back it up or move it to another device.

## Run locally

Requires Node.js 20+ and pnpm 10+.

```bash
cd booster-prep
pnpm install
pnpm dev          # http://localhost:5173 (no password in dev); add ?date=2026-10-15 before the # to mock today
pnpm test         # Vitest: calculator math against the PLAN.md worked examples, and every lesson renders
pnpm lint         # ESLint
pnpm build        # type-check and build one self-contained dist/index.html
```

## How the password works

GitHub Pages only serves static files, so a JavaScript "if password == …" check would leave everything readable in the page source. Instead, the whole built site is encrypted:

1. `pnpm build` produces one self-contained `dist/index.html` (scripts, styles and fonts inlined).
2. [`scripts/encrypt.mjs`](scripts/encrypt.mjs) gzips it and encrypts it with AES-256-GCM. The key comes from the password through PBKDF2-SHA256 with 600,000 iterations and the public salt in [`gate.config.json`](gate.config.json).
3. The output is a small login page ([`scripts/gate.html`](scripts/gate.html)) carrying only the ciphertext. The browser derives the key from the typed password with WebCrypto, decrypts and shows the site. A wrong password can't decrypt anything.

"Remember on this device" stores the derived key in localStorage so the page opens without asking. **Lock** in the sidebar forgets it.

Limits: anyone can download the encrypted page and try passwords offline, so use a long password (four or more random words). The source in this folder is in a public repository; the password protects the published site, not this source.

## Deploy and change the password

Deployment is part of the portfolio's GitHub Pages workflow ([`../.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)):

- [`../public/booster-prep/index.html`](../public/booster-prep/index.html) is a committed, already-encrypted copy. It deploys as is.
- If the repository secret **`BOOSTER_PREP_PASSWORD`** is set, the workflow rebuilds the site from source and encrypts it with that password instead, on every push to `main`.

To set or change the password: GitHub repository → **Settings → Secrets and variables → Actions → New repository secret**, name `BOOSTER_PREP_PASSWORD`. Then re-run the "Deploy portfolio to GitHub Pages" workflow (Actions tab → Run workflow). The old password stops working on the live site after that deploy.

To refresh the committed copy yourself instead:

```bash
cd booster-prep
BOOSTER_PREP_PASSWORD='your long password' pnpm publish-page   # writes ../public/booster-prep/index.html
```

## Content rules

- `content/PLAN.md` is the source of truth. Week data lives in [`src/data/plan.ts`](src/data/plan.ts); lessons are MDX in [`src/lessons/`](src/lessons/).
- Standard textbook formulas only. Anything about Starship is general public knowledge, approximate numbers are labeled "approx., public sources", and capstone loads and allowables are labeled as practice values.
- All calculator math is in [`src/calc/structures.ts`](src/calc/structures.ts), tested in [`tests/structures.test.ts`](tests/structures.test.ts).

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the page map and components.
