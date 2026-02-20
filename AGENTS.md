# AGENTS.md

## Summary

Small TypeScript/Node web app for tracking attendee travel/visa info. It serves
server-rendered JSX pages using Hono and stores data in SQLite via
better-sqlite3. For interactivity, Alpine.js is used for client-side stateful
interaction and HTMX is used for interactions with the server. Nested CSS is
used. Progressive Enhancement is ignored. The Post-Redirect-Get pattern is used
but unless HTMX can avoid a page reload. All incoming request params and bodies
should be validated using Hono's zValidator Middleware.

Documentation should be kept up to date with domain knowledge from user prompts.

## Repo facts

- Size: small, single service.
- Languages/runtime: TypeScript (ESM), Node.js.
- Frameworks/libs: Hono + Hono JSX, @hono/node-server, better-sqlite3, dotenv,
  typed-htmx.
- Build output: dist/ from tsc.

## Build, run, and validation (validated)

### Prereqs

- Node.js (validated with v25.4.0) and npm.
- SQLite file path is configured via DATABASE_PATH; default is
  ./data/attendance.db. Ensure data/ exists and is writable.

### Bootstrap

- Always run: npm install
  - Result: succeeded; reports 1 high severity vulnerability (npm audit fix if
    desired).

### Database migrations

- Always run before app start or tests: npm run migrate
  - Runs tsx src/run-migrate.ts, creates/updates SQLite schema.
  - Result: succeeded; “No pending migrations to run”.

### Run (dev)

- npm run dev
  - Result: failed because port 3000 already in use (EADDRINUSE). Free port 3000
    and rerun.
  - Uses tsx watch and is long-running.

### Docker

- docker-compose.yml defines a Postgres 17 service, but the app uses SQLite and
  does not reference Postgres in code. Treat as optional/unused unless future
  changes require it.

## Architecture and layout

### Entry point

- src/index.tsx: ~100 lines. Bootstrap only: dotenv config, DB open, migration
  runner, seed user block, static file serving, auth middleware, HTMX redirect
  middleware, POST /set-locale route, and five app.route() mounts.

### Database

- src/db.ts: opens SQLite with better-sqlite3.
- src/repository.ts: CRUD helpers for attendees, flights, passengers.
- src/auth.ts: user & session CRUD, authenticate(), plaintext password comparison.
- src/migrate.ts + src/run-migrate.ts: migration framework and migrations list.
- src/migrations.ts: ordered list of SQL migrations (attendees, flights,
  flight_passengers, users, sessions).

### Routes (per-page modules)

Code is grouped by the web page it belongs to. Each module contains the page
components, page-exclusive HTMX partial components, route handler schemas, and
a factory function `createXRoutes(db)` that returns a Hono sub-app.

- src/routes/login.tsx: LoginPage component; GET /login, POST /login, POST
  /logout. Mounted at /.
- src/routes/home.tsx: IndexPage component; GET /, POST /attendee. Mounted at /.
- src/routes/attendee.tsx: AttendeePage + AttendeeForm components; GET/PUT
  /attendees/:name, POST /attendees/:name/delete. Mounted at /attendees.
- src/routes/cockpit.tsx: CockpitPage + CockpitAttendeeListSection +
  AttendeeAccordion components; GET /cockpit, POST /cockpit/attendees, POST
  /cockpit/attendees/:id/flights, POST
  /cockpit/attendees/:id/flights/:flightId/remove. Mounted at /cockpit.
- src/routes/flights.tsx: FlightsOverviewPage + FlightEditPage +
  FlightPassengersPage + FlightPassengersListSection components + flight parsing
  utilities; all /flights/* routes. Mounted at /flights.

### Shared modules

- src/schemas.ts: shared Zod schemas used across multiple route modules
  (idParamSchema, attendeeNameFormSchema).
- src/components/AttendeeFlightsSection.tsx: flight assignment widget used on
  both the attendee page and cockpit page.
- src/components/Layout.tsx: shared HTML shell with nav, scripts, language
  toggle. Used by all pages except LoginPage.
- src/components/LanguageToggle.tsx: locale switcher rendered inside Layout.
- src/i18n.ts: translations, locale helpers, getLocale(c: Context).
- public/styles.css: global styling served at /static.

### Auth

- Plaintext password auth. Passwords stored unencrypted in the users table.
- Session cookie (httpOnly, 90-day expiry) checked by middleware on every
  request except /login and /static/\*.
- On first startup, a seed user is created from SEED_USERNAME / SEED_PASSWORD
  env vars. Both are REQUIRED and throw if missing (no defaults).
- User management is done directly in SQLite (no admin UI).
- The app operator acts as the password reset mechanism.

### Config

- tsconfig.json (TS build config)
- .prettierrc (formatting)
- package.json (scripts and deps)
- Makefile (targets proxy npm scripts)

## CI/Checks

- No .github/workflows. No documented CI pipeline. Use npm run build and npm run
  migrate as the minimal validation.

## Root contents

.env (ignored), .git/, .gitignore, .prettierrc, AGENTS.md, Makefile, README.md,
data/, dist/, docker-compose.yml, node_modules/, package-lock.json,
package.json, public/, src/, tsconfig.json

## README.md (contents)

- npm install
- npm run migrate
- npm run dev
- open <http://localhost:3000>
- SQLite note: DATABASE_PATH env var; default ./data/attendance.db

## Next-level directory listing

- public/: styles.css
- src/: auth.ts, db.ts, global.d.ts, i18n.ts, index.tsx, migrate.ts,
  migrations.ts, repository.ts, run-migrate.ts, schemas.ts, validator-wrapper.ts,
  components/, routes/, utils/
- src/components/: AttendeeFlightsSection.tsx, index.ts, LanguageToggle.tsx,
  Layout.tsx
- src/routes/: attendee.tsx, cockpit.tsx, flights.tsx, home.tsx, login.tsx
- src/utils/: flightFormat.ts

## Key source snippets (for quick orientation)

- Server entry: serve({ fetch: app.fetch, port: 3000 }) in src/index.tsx.
- Route mounting: app.route("/", createLoginRoutes(db)) etc. in src/index.tsx.
- DB open: new SQLite(process.env.DATABASE_PATH ?? "./data/attendance.db") in
  src/db.ts.
- Migration table and runner: src/migrate.ts; migration list in
  src/migrations.ts.
- Auth module: src/auth.ts; session cookie name is "session".
- Seed user: created in src/index.tsx startup block from SEED_USERNAME /
  SEED_PASSWORD env vars (both required, throw if missing).
- Locale helper: getLocale(c: Context) exported from src/i18n.ts.
- Shared Zod schemas: src/schemas.ts (idParamSchema, attendeeNameFormSchema).

## Guidance for future agents

- Trust this file. Only search the repo if information here is missing or
  incorrect.
- Always run npm install before build/start.
- Always run npm run migrate before running the app.
