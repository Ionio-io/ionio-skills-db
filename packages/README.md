# Tooling: MCP server and dashboard

The code that serves this library lives here. Skill content never does: departments stay at the repository root, and everything below reads them from disk.

```
packages/
├── core/        @ionio-skills/core       reads the library: skills, ledgers, git history, search, health checks
├── server/      @ionio-skills/server     MCP server (stdio + Streamable HTTP), REST API, live-change events
└── dashboard/   @ionio-skills/dashboard  React dashboard for browsing the library and connecting agents
```

## Quick start

```sh
npm install
npm run dev        # server on :4711 (API + MCP) and the dashboard with hot reload on :5173
```

For a single production process that serves the dashboard, API and MCP endpoint together:

```sh
npm run build
npm start          # http://127.0.0.1:4711
```

| Command | What it does |
|---|---|
| `npm run dev` | Server (restarts on change) plus the Vite dashboard at http://localhost:5173 |
| `npm run build` | Builds core, server and dashboard |
| `npm start` | Serves everything from http://127.0.0.1:4711 |
| `npm run mcp` | The MCP server on stdio (after a build) |
| `npm test` | Unit and integration tests, including a real MCP client over HTTP and stdio |
| `npm run check` | Typecheck, lint and tests |

## Connect an agent

The dashboard's **Connect** page has copy-paste setup for each client, and a playground that calls the tools live. The short version:

```sh
# Claude Code, over HTTP (while `npm start` or `npm run dev` is running)
claude mcp add --transport http ionio-skills http://127.0.0.1:4711/mcp

# Claude Code, over stdio (the client starts the server itself; needs `npm run build` once)
claude mcp add ionio-skills -- node /absolute/path/to/ionio-skills-db/packages/server/dist/bin/stdio.js
```

Claude Desktop, Cursor and other clients use the same command, or the URL, in their `mcpServers` config.

### What the MCP server exposes

It follows **progressive disclosure**: agents see a small catalog first, load a skill only when their task needs it, and pull bundled files one at a time.

| Layer | Tools | Returns |
|---|---|---|
| Discover | `list_skills`, `list_departments`, `search_skills` | One line per skill: its name and the description of when to use it |
| Load | `get_skill` | The full `SKILL.md`, plus a manifest of bundled files and related skills |
| Drill in | `get_skill_file`, `get_ledger` | One reference file, or one department README (or the root index) |

- **Tools.** All tools are read-only. An unknown name returns an error with "did you mean" suggestions, so the agent can correct itself.
- **Server instructions.** Clients receive them on connect. They explain the three-step flow and include a one-line catalog.
- **Resources.** `skills://index`, `skills://department/{department}`, `skills://skill/{name}` and `skills://skill/{name}/{+path}`, each with listing and argument completion. Clients can `@`-mention them.
- **Prompts.** One per skill, with an optional `task` argument. In Claude Code they appear as `/mcp__ionio-skills__<skill>`.

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `SKILLS_ROOT` | repository root | Folder that holds the departments. Point it elsewhere to serve another library |
| `PORT` | `4711` | HTTP port |
| `HOST` | `127.0.0.1` | Bind address. Local only by default |
| `ALLOWED_HOSTS` | none | Comma-separated hostnames to accept when `HOST` is not local (DNS-rebinding protection) |

The server only reads the library. On a local bind it rejects requests whose `Host` or `Origin` header isn't local. There is no authentication, so before exposing it beyond localhost, put it behind something that adds authentication.

## How it works

- **Discovery is structural.** A top-level folder is a department once it has a `README.md` or a skill. A skill is any `<department>/<skill>/SKILL.md`; every other file in that folder is bundled with it. Folders named `packages`, `node_modules`, `dist` or `coverage`, and anything starting with `.` or `_`, are ignored.
- **Snapshots.** `SkillLibrary` builds an immutable `LibrarySnapshot` of the library. A snapshot holds the parsed frontmatter, headings, stats, git history (read in a single `git log` pass), cross-references between skills, a search index and a health report. A filesystem watcher invalidates it on change, and the dashboard refetches through `/api/events`.
- **Health checks** cover frontmatter validity, name and description limits, duplicate names, ledger and index listings, broken relative links, and bundled files that `SKILL.md` never mentions. They show on the dashboard's Health page.
- **One factory, two transports.** `createSkillsServer` builds the MCP server for `serveStdio` and, per request, for the stateless HTTP handler (MCP SDK v2). HTTP therefore always reflects the current library.

## Development notes

- Workspace packages point to their TypeScript sources through the `ionio-source` export condition. Dev mode (`tsx`), the tests (`vitest`) and typechecking all run straight from `src/`, so there's no build step. Published entry points use `dist/`.
- The dashboard imports core **types only**, through `@ionio-skills/core/types`, so no Node code reaches the browser.
- UI: React 19, React Router, TanStack Query, Radix primitives styled in the shadcn manner with Tailwind v4, `motion` for transitions, and Phosphor icons. Colours are role tokens in `packages/dashboard/src/styles/index.css`. Department colours follow a validated categorical palette in a fixed order.
