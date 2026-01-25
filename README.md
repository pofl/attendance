```
npm install
npm run migrate
npm run dev
```

```
open http://localhost:3000
```

### SQLite

The app uses SQLite via better-sqlite3. The database file is configured with the `DATABASE_PATH` environment variable.

If you don't set it, the default is `./data/attendance.db`
