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
