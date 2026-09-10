# CLAUDE.md

## Project

**fizo202** — a Nuxt 4 web app for recording and scoring FIZO202 military fitness tests
(push-ups, crunches, 3000 m run). Users submit results on the public form, the server looks up
points from imported scoring tables, and admins export XLSX reports. UI text is mostly English;
the generated Excel reports are Lithuanian.

Stack: Nuxt 4 (Vue 3, Nitro server routes) · Prisma 7 with the `@prisma/adapter-mariadb` driver
adapter · MySQL/MariaDB · ExcelJS · plain CSS.

## Commands

```bash
npm install            # runs `nuxt prepare` via postinstall
npx prisma generate    # REQUIRED before typecheck/dev — see "Generated Prisma client" below
npm run dev            # dev server on 0.0.0.0:3000 (--host)
npm run build          # nuxt build + postbuild dotenv patch
npm run preview        # preview the production build
npm run lint           # eslint + prettier --check
npm run lint:fix       # eslint --fix + prettier --write
npm run import:points  # load scoring tables from ./202.xlsx (not in repo)
npm run import:report  # backfill users/activities from an exported report: npm run import:report -- <file.xlsx>
```

There is no test suite. Lint is the only automated check — run `npm run lint` before finishing work.

## Layout

- [app/pages/index.vue](app/pages/index.vue) — main submit form; POSTs to `/api/activities`, then
  navigates to `/results/<id>`. Also opens `/scoring-table` and `/history` in popup windows.
- [app/pages/results/[id].vue](app/pages/results/[id].vue) — per-exercise points and total (pass mark: 60 per exercise, 180 total).
- [app/pages/history.vue](app/pages/history.vue) — activity history for a nickname (`?name=`) + XLSX download.
- [app/pages/scoring-table.vue](app/pages/scoring-table.vue) — personal 60/100-point targets for `?age=&gender=`.
- [app/pages/admin.vue](app/pages/admin.vue) — date-range XLSX report download. **No auth** (login is commented out).
- [app/utils.ts](app/utils.ts) — `formatTime(seconds)`; imported by both client pages and server routes via `~/utils`.
- [server/utils/points.ts](server/utils/points.ts) — `calculatePoints`, `getTargets`; all scoring logic lives here.
- [server/utils/prisma.ts](server/utils/prisma.ts) — `prisma` singleton (cached on `globalThis` outside production).
- [server/utils/xlsx.ts](server/utils/xlsx.ts) — `buildWorkbookFromRows`, the single hardcoded A–Q report layout.
- [prisma/schema.prisma](prisma/schema.prisma) — `User`, `Activity`, and the three lookup tables
  `PushupPoints` / `CrunchesPoints` / `RunningPoints`.

API routes: `POST /api/activities`, `GET /api/activities/:id`, `GET /api/activities/history`,
`GET /api/activities/history-xlsx`, `POST /api/activities/report`, `POST /api/get-targets`.

## Things that will bite you

**Generated Prisma client.** The schema generates to `prisma/generated/` (gitignored), and code
imports from `~~/prisma/generated/client`. A fresh clone has broken types until `npx prisma generate`
runs — `npm install` alone is not enough.

**`prisma` is auto-imported on the server.** Nitro auto-imports everything re-exported from
[server/utils/index.ts](server/utils/index.ts), so some routes use the bare `prisma` global while
others import it explicitly. Both work; match the file you're editing.

**No `DATABASE_URL`.** Connection settings come from `DATABASE_HOST` / `PORT` / `USER` / `PASS` /
`NAME`. The runtime client builds the adapter from those directly; [prisma.config.ts](prisma.config.ts)
assembles a `mysql://` URL from the same vars for the CLI. `.env` is gitignored and there is no
`.env.example`.

**`postbuild` patches the build output.** [scripts/inject-dotenv-to-server-entry.mjs](scripts/inject-dotenv-to-server-entry.mjs)
prepends `import 'dotenv/config'` to `.output/server/index.mjs` so production reads `.env`. Don't
drop this step, and re-run `npm run build` (not bare `nuxt build`) after changing server env usage.

**Scoring is a threshold lookup, not a formula.** Points come from rows imported out of `202.xlsx`:
pick the highest `age <= userAge`, then the best row whose `count <= reps` (or `seconds >= time` for
running), and clamp to 100. `getTargets` clamps age to 18–65; `calculatePoints` does not. A `running`
value of `0` means "not performed" and scores 0 points.

**Gender is a bare string.** Values are `'male'` / `'female'` everywhere in the DB and API. The
import scripts map the Lithuanian `V`/`M` sheet headers onto those. Note
[scripts/import-report.ts](scripts/import-report.ts) reads `V…` as male and `M…` as female.

**Both XLSX endpoints share one layout.** `report.post.ts` and `history-xlsx.get.ts` build identical
row objects for `buildWorkbookFromRows`; the column keys must stay in sync with the hardcoded
`A`–`Q` header setup and the red-highlight cell references in `xlsx.ts`.

**Dead code.** [app/components/PointsTable.vue](app/components/PointsTable.vue) (hardcoded tables
with unrendered `${...}` literals) and [app/components/LoginForm.vue](app/components/LoginForm.vue)
are unreferenced, as is [app/pages/results/index.vue](app/pages/results/index.vue). Don't treat them
as sources of truth for scoring thresholds — the DB is.

## Conventions

- Prettier: single quotes, semicolons, 120 columns, 2-space indent, `es5` trailing commas.
- Vue SFCs use `<script setup lang="ts">` with top-level `await $fetch` for page data.
- Each page pulls global styles in with `@import url('~/assets/styles.css')` inside its `<style>`
  block; the `css:` option in [nuxt.config.ts](nuxt.config.ts) is intentionally commented out.
- Styling is inline `style="…"` plus classes from the single 700-line
  [app/assets/styles.css](app/assets/styles.css). No CSS framework.
- Aliases: `~/` → `app/`, `~~/` → project root (so `~~/server/...`, `~~/prisma/generated/client`).
