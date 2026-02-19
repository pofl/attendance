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
- Sessions last 30 days.

### Seed user

On first start (when the `users` table is empty), a default user is created:

| Variable        | Default |
| --------------- | ------- |
| `SEED_USERNAME` | `admin` |
| `SEED_PASSWORD` | `admin` |

Set these environment variables **before the first start** to customise the seed credentials. After that, manage users directly in the database.

### Managing users

There is no admin UI for user management. Use the SQLite CLI:

```sh
# Add a user
sqlite3 ./data/attendance.db "INSERT INTO users (username, password) VALUES ('alice', 'her-password');"

# Change a password (you are the password reset button)
sqlite3 ./data/attendance.db "UPDATE users SET password = 'new-password' WHERE username = 'alice';"

# List users
sqlite3 ./data/attendance.db "SELECT id, username FROM users;"
```
