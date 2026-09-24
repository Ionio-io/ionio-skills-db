# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Two things in one repo:

1. **A skills library (content).** Top-level folders (`copywriting/`, `editorial/`, `graphic-design/`, `sales/`, `youtube/`, …) are *departments*. Each holds `<skill>/SKILL.md` (Claude Agent Skill format: YAML frontmatter with `name` + `description`, then markdown), optional bundled files (usually `references/*.md`), and a `README.md` ledger listing the department's skills. The root `README.md` is the library index; agents read it via the MCP `get_ledger` tool, so keep tooling docs out of it (they live in `packages/README.md`).
2. **Tooling (`packages/`)** that serves the library: an MCP server for agents and a React dashboard for people.

## Commands

```sh
npm install
npm run dev          # server (tsx watch, :4711 = API + /mcp) + Vite dashboard (:5173, proxies /api and /mcp)
npm run build        # core → server → dashboard, in that order (server's build resolves core from dist)
npm start            # production: one process on :4711 serving dashboard, /api and /mcp
npm run mcp          # MCP over stdio (after build)
npm test             # vitest, all packages
npx vitest run packages/core/test/snapshot.test.ts     # one file
npx vitest run -t "suggests close names"               # one test by name
npm run typecheck    # per-workspace tsc --noEmit
npm run lint         # eslint (flat config, incl. react-hooks/React Compiler rules for the dashboard)
npm run check        # typecheck + lint + test; run before committing
```

Port 4321 is taken on this machine by an unrelated Astro dev server, which is why the default is 4711. Env: `SKILLS_ROOT` (serve another library), `PORT`, `HOST` (default `127.0.0.1`), `ALLOWED_HOSTS`.

## Architecture

```
packages/core       @ionio-skills/core       disk → immutable LibrarySnapshot (no HTTP, no MCP)
packages/server     @ionio-skills/server     MCP (stdio + Streamable HTTP) + REST API + SSE, on Hono
packages/dashboard  @ionio-skills/dashboard  React 19 SPA; talks to /api, and to /mcp as a real MCP client
```

**Everything reads through one snapshot.** `SkillLibrary` (core/src/library.ts) lazily builds a `LibrarySnapshot` (core/src/snapshot.ts): filesystem scan → frontmatter/headings/stats → one-pass `git log` history → cross-skill mention graph → MiniSearch index → health report. All queries (MCP tools, REST routes) are in-memory reads on that snapshot. A recursive `fs.watch` invalidates it on change and emits events, which `/api/events` (SSE) forwards so the dashboard refetches. Types in `core/src/types.ts` are the shared contract for all three packages.

**Discovery is structural, not registered** (core/src/scan.ts): a top-level folder is a department if it has a `README.md` or a skill; `packages`, `node_modules`, `dist`, `coverage`, and anything starting with `.` or `_` are ignored. A skill's folder name is its unique id.

**MCP design = progressive disclosure** (server/src/mcp/). `createSkillsServer(library)` is the single factory used by both `serveStdio` (bin/stdio.ts) and the stateless `createMcpHandler` (http/app.ts, one fresh server per request, `responseMode: 'json'`). Server `instructions` carry a one-line-per-skill catalog; tools go discover (`list_skills`, `list_departments`, `search_skills`) → load (`get_skill`: raw SKILL.md + file manifest) → drill in (`get_skill_file`, `get_ledger`). Also `skills://` resources (uris.ts) and one prompt per skill. Unknown names throw `NotFoundError` with "did you mean" suggestions. Uses MCP SDK **v2** (`@modelcontextprotocol/server`, `zod/v4`), not the v1 `@modelcontextprotocol/sdk`.

**Health checks** (core/src/health.ts) are what keep content honest: frontmatter must parse (a description containing `": "` must be quoted YAML), name = folder name, description ≤ 1024 chars, every skill listed in its department ledger and the root README (and the root README's "Total: N skills" matches), relative links resolve, bundled files are mentioned in SKILL.md. After adding or moving skills, check `GET /api/health` or the dashboard Health page.

## Conventions that aren't obvious

- **`ionio-source` export condition.** Workspace packages export `src/*.ts` under the custom condition `ionio-source` (and `dist/` otherwise). tsx (`--conditions=ionio-source`), vitest, and the `tsconfig.json` files (`customConditions`) all use it, so dev/test/typecheck need no build. Don't rename it to `source`: third-party packages use that name and break.
- The dashboard imports core **types only** via `@ionio-skills/core/types`; never import runtime core code into the browser bundle.
- Tests use a fixture library built in a temp dir (core/test/fixture.ts, deliberately containing broken skills) and drive the real MCP server with a real `Client` in-process and over a spawned stdio process.
- Dashboard UI: Radix primitives styled shadcn-style (components/ui), Tailwind v4 with role tokens defined in `src/styles/index.css` (no raw hex in components; department colors are fixed-order categorical slots `--dept-1..8`), `motion` for transitions, Phosphor icons. Filters, tabs and selected files live in the URL. Skill text renders in the mono face on a white `DocumentCard`.
- Skill page reading pane (desktop, `xl`): tabs + document + right rail form one viewport-tall block that ends the page. Its inner scrollers use `PANE_SCROLLER` (pages/skill/pane.ts): `overflow-hidden` until the page is scrolled to the end (`data-pinned` on the pane group), so the wheel always moves the page first, until the tabs reach the top, and only then the document. The rail itself never scrolls; only the outline inside it does.
- The outline (components/markdown/Outline.tsx) highlights the last heading above a reading line in the document's own scroller (not an IntersectionObserver), keeps that entry in view within its container, and on click smooth-scrolls with `scrollIntoView`, holding the highlight on the target until the scroll settles.
- Verifying scroll behaviour: the Chrome extension's scroll action sets `scrollTop` directly and ignores `overflow-hidden`, so it can't show wheel behaviour. Use real input via `playwright-core` (installed) with the cached Chromium in `~/Library/Caches/ms-playwright/chromium-*` passed as `executablePath`.
- The sidebar's departments list may only clip overflow *during* its fold animation (`transitionEnd: { overflow: 'visible' }`); permanent `overflow-hidden` cuts off the active row's ring/shadow.
- Prettier ignores `**/*.md`: skill content is authored prose and must never be reformatted.
- **Host/Origin checks.** `createMcpHonoApp` validates `Host` and `Origin` on every route, static assets included. On a local bind only local values pass; `ALLOWED_HOSTS` replaces that with its list for both headers (http/app.ts passes it as `allowedOrigins` too). Browsers send `Origin` on Vite's `crossorigin` module scripts and stylesheets, so a missing origin shows up as a white page with 403s on `/assets/*`, while curl (no `Origin`) looks fine. Test with `-H "origin: <url>"`.
- **Exposing it (ngrok).** Serve the production build (`npm run build && npm start`: one port for dashboard, API and MCP), not `npm run dev`. Use the account's static domain (`ngrok http 4711 --url=<domain>`) and start the server with `ALLOWED_HOSTS="<domain>,localhost,127.0.0.1"`, since the allowlist is exact-match (no wildcards) and free random URLs change per restart. There's no auth in the app; anything exposed is readable by anyone with the link.

## Adding skills (content)

Follow the root README's "Adding a skill": put it in `<department>/<skill-name>/SKILL.md` (folder = frontmatter `name`), supporting files in `references/`, add a row to the department ledger and the root README tables and counts, log the source in the import log, and keep raw uploads in `_imports/` (zips are gitignored).

**Generic vs Ionio-specific.** hopkins-copywriting, business-writing-manifesto, claudisms, tech-blog-analysis, graphic-copy, graphic-design-tactics, loom-email-copy and youtube-title are brand-neutral: keep Ionio, its people, clients and URLs out of them, and make anything company-specific an input the skill asks for. youtube-description, outbound-crm-update, hormozi-writing, mannan-call-breakdown and rohan-writing-doctrine are deliberately Ionio- or person-specific.
