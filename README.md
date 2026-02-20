# attendance

```sh
npm install
npm run migrate
npm run dev
```

```sh
open http://localhost:3000
```

## Development Setup

```sh
npm install
npm run husky:install
```

## Deploy/Redeploy

```sh
docker build -t registry.fpolster.dev/attendance .
docker push registry.fpolster.dev/attendance
```

## SQLite

The app uses SQLite via better-sqlite3. The database file is configured with the `DATABASE_PATH` environment variable.

If you don't set it, the default is `./data/attendance.db`

## Authentication

The app uses a simple username/password authentication system. **Passwords are stored in plaintext** — this is intentional and by design. The app operator acts as the password reset mechanism.

### How it works

- Every route (except `/login` and `/static/*`) requires an active session.
- Sessions are stored in SQLite and validated via an `httpOnly` cookie.
- Sessions last 90 days.
- The seeded user is a **super user**.
- Only super users can access `/` (home), `/cockpit`, and `/attendees/:username`.
- Non-super users are redirected from `/` to `/me`.
- `/me` redirects to `/attendees/:your-username` for all users.

### Seed user

On first start (when the `users` table is empty), one super user is created:

| Variable        | Required |
| --------------- | -------- |
| `SEED_USERNAME` | yes      |
| `SEED_PASSWORD` | yes      |

Set these environment variables **before the first start**. There are no defaults.

### User/attendee model

- Each user has exactly one attendee record (`attendees.user_id` is unique).
- All attendee profile editing happens on `/attendees/:username`.
- Super users can open any attendee profile; normal users can open only their own.

### Managing users

Super users can create users (with password) in the cockpit UI.

You can still manage users via SQLite CLI:

```sh
# Add a user
sqlite3 ./data/attendance.db "INSERT INTO users (username, password, is_superuser) VALUES ('alice', 'her-password', 0);"

# Change a password (you are the password reset button)
sqlite3 ./data/attendance.db "UPDATE users SET password = 'new-password' WHERE username = 'alice';"

# List users
sqlite3 ./data/attendance.db "SELECT id, username, is_superuser FROM users;"
```
