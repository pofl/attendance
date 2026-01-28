# AGENTS.md

## Summary

Small TypeScript/Node web app for tracking attendee travel/visa info. It serves server-rendered JSX pages using Hono, stores data in SQLite via better-sqlite3, and uses HTMX for in-place form updates.

## Repo facts

- Size: small, single service.
- Languages/runtime: TypeScript (ESM), Node.js.
- Frameworks/libs: Hono + Hono JSX, @hono/node-server, better-sqlite3, dotenv, typed-htmx.
- Build output: dist/ from tsc.

## Build, run, and validation (validated)

### Prereqs

- Node.js (validated with v25.4.0) and npm.
- SQLite file path is configured via DATABASE_PATH; default is ./data/attendance.db. Ensure data/ exists and is writable.

### Bootstrap

- Always run: npm install
  - Result: succeeded; reports 1 high severity vulnerability (npm audit fix if desired).

### Database migrations

- Always run before app start or tests: npm run migrate
  - Runs tsx src/run-migrate.ts, creates/updates SQLite schema.
  - Result: succeeded; “No pending migrations to run”.

### Build

- npm run build
  - Runs tsc and writes dist/.
  - Result: succeeded.

### Run (prod)

- Requires build first: npm run start
  - Result: failed because port 3000 already in use (EADDRINUSE). Free port 3000 and rerun.
  - Note: start is long-running; use a timeout for smoke tests.

### Run (dev)

- npm run dev
  - Result: failed because port 3000 already in use (EADDRINUSE). Free port 3000 and rerun.
  - Uses tsx watch and is long-running.

### Tests/Lint

- No test or lint scripts are defined in package.json. There are no GitHub Actions workflows.

### Docker

- docker-compose.yml defines a Postgres 17 service, but the app uses SQLite and does not reference Postgres in code. Treat as optional/unused unless future changes require it.

## Architecture and layout

### Entry point

- src/index.tsx: Hono server, routes, server-side JSX rendering, HTMX endpoints, and static file serving.

### Database

- src/db.ts: opens SQLite with better-sqlite3.
- src/repository.ts: CRUD helpers for attendees.
- src/migrate.ts + src/run-migrate.ts: migration framework and migrations list.

### UI/Pages

- src/pages/*.tsx: Layout + Index, Attendee, Cockpit pages.
- src/components/*.tsx: AttendeeForm, LanguageToggle.
- src/i18n.ts: translations and locale helpers.
- public/styles.css: global styling served at /static.

### Config

- tsconfig.json (TS build config)
- .prettierrc (formatting)
- package.json (scripts and deps)
- Makefile (targets proxy npm scripts)

## CI/Checks

- No .github/workflows. No documented CI pipeline. Use npm run build and npm run migrate as the minimal validation.

## Root contents

.env (ignored), .git/, .gitignore, .prettierrc, AGENTS.md, Makefile, README.md, data/, dist/, docker-compose.yml, node_modules/, package-lock.json, package.json, public/, src/, tsconfig.json

## README.md (contents)

- npm install
- npm run migrate
- npm run dev
- open <http://localhost:3000>
- SQLite note: DATABASE_PATH env var; default ./data/attendance.db

## Next-level directory listing

- public/: styles.css
- src/: db.ts, global.d.ts, i18n.ts, index.tsx, migrate.ts, repository.ts, run-migrate.ts, components/, pages/
- src/components/: AttendeeForm.tsx, LanguageToggle.tsx, index.ts
- src/pages/: AttendeePage.tsx, CockpitPage.tsx, IndexPage.tsx, Layout.tsx, index.ts

## Key source snippets (for quick orientation)

- Server entry: serve({ fetch: app.fetch, port: 3000 }) in src/index.tsx.
- DB open: new SQLite(process.env.DATABASE_PATH ?? "./data/attendance.db") in src/db.ts.
- Migration table and runner: src/migrate.ts; migration list in src/run-migrate.ts.

## Guidance for future agents

- Trust this file. Only search the repo if information here is missing or incorrect.
- Always run npm install before build/start.
- Always run npm run migrate before running the app.
- If npm run dev or npm run start fails with EADDRINUSE, free port 3000 and retry.
