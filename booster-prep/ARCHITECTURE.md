# Architecture

## Stack

The spec asked for Astro; this site uses **Vite + React + TypeScript + Tailwind 4 + MDX**, the same toolchain as the portfolio it lives in, built as a hash-routed single-page app. That's what allows the whole site to be emitted as **one HTML file** and encrypted (see README). KaTeX renders math at runtime (remark-math marks it, `src/components/mdx.tsx` renders it), which keeps the bundle small.

## Page map

| Route | Page | Source |
| --- | --- | --- |
| `#/` | Mission Dashboard: countdown, today's sessions, progress ring, track bars, streak, hours | `pages/Dashboard.tsx` |
| `#/roadmap` | Week 0–12 timeline, phases, light weeks | `pages/Roadmap.tsx` |
| `#/week/:n` | Tracks, formulas, context, deliverable, day-by-day schedule, self-check, notes | `pages/WeekPage.tsx` |
| `#/lessons`, `#/lessons/:slug` | Eight structures lessons | `pages/Lessons.tsx`, `lessons/*.mdx` |
| `#/tools`, `#/tools/:tool` | NX, Ansys, Python, MATLAB paths, SolidWorks → NX, FEA best practices | `pages/Tools.tsx`, `data/tools.ts` |
| `#/practice` | Infinite seeded practice problems in 15 topics (`?topic=…&seed=…`), checked to ±1% (margins ±0.01), with worked solutions, SI / US, accuracy per topic, mixed mode | `pages/Practice.tsx`, `lib/practice.ts` |
| `#/calculators` | Eight live calculators with SI / US toggle | `pages/Calculators.tsx`, `calc/` |
| `#/capstone` | Spec, hand-calc panel, trade plots, step checklists, report outline | `pages/Capstone.tsx` |
| `#/anatomy` | Interactive simplified booster | `pages/Anatomy.tsx` |
| `#/flashcards` | Spaced repetition deck | `pages/Flashcards.tsx`, `lib/cards.ts` |
| `#/resources`, `#/glossary`, `#/launch` | Reference table, glossary, launch prep | `pages/Reference.tsx` |
| `#/focus/:id` | Focus mode for one session: link to the exact lesson section or tool step, 60-minute or 25/5 timer, Done logs minutes | `pages/Focus.tsx`, `lib/timer.ts` |
| `#/reference` | Printable formula sheet (every lesson `<Formula>` by week, with symbols, units and a use-when note from `data/formulaNotes.ts`; print CSS fits two sides of US Letter), plus units, 304L and the ready-by checklist | `pages/QuickRef.tsx` |
| `#/backup` | Storage status, export / import (merge or replace), daily backups, Gist sync settings | `pages/Backup.tsx` |

## Content

- `data/plan.ts`: every week from PLAN.md (tracks, formulas with variable tables, context, deliverable, self-checks with answers), the capstone spec and launch prep.
- `lib/schedule.ts`: turns the weekly rhythm (and custom plans for Weeks 0, 1, 6, 9–12) into dated 1-hour sessions. Week 0 is one 2-hour setup day (Oct 15) and Week 1 runs 10 days (Oct 16 – Oct 25). The total, `plannedHours`, is derived from the sessions: 162 hours, checked by `tests/schedule.test.ts`.
- `data/plan.ts` `FINALS_WEEK_START`: the Monday of the light finals week (Week 9). Change it to slide finals; `placeFinalsWeek()` re-dates Weeks 7–10 around it.
- `lib/schedule.ts` `dateOverride()`: in `pnpm dev` only, `?date=YYYY-MM-DD` before the `#` (for example `http://localhost:5173/?date=2026-10-15#/`) mocks today's date.
- `lessons/NN-slug.mdx`: `export const meta`, then MDX using `<Formula>`, `<Example>`, `<Problem>`/`<Solution>`, `<Callout>`, `<Figure>` with inline SVG using the `dg-*` theme classes.
- `lib/schedule.ts` `sessionLink()`: maps each session to its material. Lesson `##` headings get stable ids from `lib/anchors.ts` (`sec-1b`, `practice-problems`), opened with `?section=`; tool steps use `?step=w<week>`. `tests/focus.test.tsx` checks every link resolves.
- `lib/catchup.ts`: the catch-up queue, light slots for pushed sessions, and the hours-vs-plan series.
- `lib/practice.ts`: one generator per topic. Inputs come from a seeded RNG (mulberry32); answers come from `calc/structures.ts`; solutions are written in SI with the conversion steps added for US. `tests/practice.test.tsx` recomputes every answer from the givens for 7 seeds per topic and checks the solution shows the same number.
- `lib/cards.ts`: the flashcard deck, built from every lesson `<Formula>`, week formulas, self-checks and glossary terms.
- `lib/search.ts`: global search over pages, lessons, weeks, glossary, flashcards and tool steps.

## State

`lib/progressDoc.ts`: progress schema v2. Every item (session check-off, check item, note, deliverable, card state, capstone entry, catch-up override, timer minutes, self-check grade, practice tally) is `{ value, updatedAt }`; a cleared item is a tombstone, not a deleted key. Pure functions: `migrateV1toV2`, `mergeDocs` (newest `updatedAt` wins per item), `replaceDoc`, `toView`.

`lib/store.ts`: one localStorage document (`booster-prep:progress:v2`, migrated once from v1, which is left in place) exposed to pages as plain values through `useProgress()`. Export / Import reads and writes the same JSON; import merges. `lib/backup.ts` keeps 7 daily snapshots (`booster-prep:backups`). `lib/persist.ts` asks for `navigator.storage.persist()`. `lib/sync.ts` and `lib/syncController.ts` do the opt-in Gist sync: AES-GCM with a key from HKDF over the remembered gate key (or PBKDF2 over a sync passphrase), `fetch` to `api.github.com` only.

## Components

`Layout` (sidebar, top bar, theme toggle, search, lock), `Formula`, `Tex`/`Rich`, `Checks` (`SessionCheck`, `CheckItem`), `ProgressRing`, `NumField` + `UnitToggle`, `LineChart`, `SearchDialog`, `ProgressIO`, `Icon`.
