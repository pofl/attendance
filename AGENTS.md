# AGENTS.md

## Summary

Small TypeScript/Node web app for tracking attendee travel/visa info. It serves
server-rendered JSX pages using Hono and stores data in SQLite via
better-sqlite3. For interactivity, Alpine.js is used for client-side stateful
interaction and HTMX is used for interactions with the server. Nested CSS is
used. Progressive Enhancement is ignored. The Post-Redirect-Get pattern is used
but unless HTMX can avoid a page reload. All incoming request params and bodies
should be validated using Hono's zValidator Middleware.

Documentation should stay focused on durable domain and architecture knowledge,
not low-level implementation details.

## Repo facts

- Size: small, single service.
- Languages/runtime: TypeScript (ESM), Node.js.
- Frameworks/libs: Hono + Hono JSX, @hono/node-server, better-sqlite3, dotenv,
  typed-htmx.
- Build output: dist/ from tsc.

## Build, run, and validation

### Prereqs

- Node.js and npm.
- Writable SQLite location; configured via `DATABASE_PATH`.

### Bootstrap

- Run: `npm install`

### Run (dev)

- Start development server: `npm run dev`
- Default local URL: <http://localhost:3000>

### Minimal validation

- Build check: `npm run build`
- Schema check: `npm run migrate`

## Architecture and layout

### Application shape

- Single HTTP service with server-rendered pages.
- Route handlers are organized by user-facing page/domain.
- Shared UI and utility logic is separated from page-specific route logic.

### Domains

- Authentication and session management.
- Attendee profile and travel/visa data.
- Flight management, including passenger assignment.
- Admin/cockpit workflows for privileged users.
- Localization support.

### Data model (high level)

- Users with role-based access.
- Attendees associated with users.
- Flights and attendee-flight assignment.
- Session records for login state.

### Auth

- Plaintext password auth. Passwords stored unencrypted in the users table.
- Session cookie (httpOnly, 90-day expiry) checked by middleware on every
  request except /login and /static/\*.
- On first startup, a seed user is created from SEED_USERNAME / SEED_PASSWORD
  env vars. Both are REQUIRED and throw if missing (no defaults). The seeded
  user is created as a super user.
- Access model: only super users can access /, /cockpit, and /attendees/:username.
  Normal users are redirected from / to /me, and /me redirects to their own
  /attendees/:username profile.
- User management is available in cockpit (create user with password) and in
  SQLite directly.
- The app operator acts as the password reset mechanism.

## Config and operations

- App config is environment-variable driven with dotenv for local development.
- SQLite is the primary datastore.
- Keep data and migration state in sync before running locally.

## Guidance for future agents

- Prefer stable, high-level documentation over file-by-file internals.
- Update docs when domain behavior or operational steps change.
- Always run install + migration before local build/run flows.
