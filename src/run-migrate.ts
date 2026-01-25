import { config } from "dotenv";
import { openDatabase } from "./db.js";
import type { Migration } from "./migrate.js";
import { MigrationRunner } from "./migrate.js";

config();

const migrations: Migration[] = [
  {
    id: "20260111-create-table-attendees",
    sql: `
      CREATE TABLE IF NOT EXISTS attendees (
        id INTEGER PRIMARY KEY,

        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

        name TEXT NOT NULL,
        locale TEXT NOT NULL,
        arrival_date TEXT,
        arrival_flight TEXT,
        departure_date TEXT,
        departure_flight TEXT,
        passport_status TEXT NOT NULL CHECK (passport_status IN ('valid', 'pending', 'none')),
        visa_status TEXT NOT NULL CHECK (visa_status IN ('obtained', 'pending', 'none')),
        dietary_requirements TEXT,
        CONSTRAINT attendees_name_unique UNIQUE (name),
        CONSTRAINT attendees_created_at_utc CHECK (created_at LIKE '%Z' AND datetime(created_at) IS NOT NULL),
        CONSTRAINT attendees_updated_at_utc CHECK (updated_at LIKE '%Z' AND datetime(updated_at) IS NOT NULL),
        CONSTRAINT attendees_arrival_date_utc CHECK (arrival_date IS NULL OR (arrival_date LIKE '%Z' AND datetime(arrival_date) IS NOT NULL)),
        CONSTRAINT attendees_departure_date_utc CHECK (departure_date IS NULL OR (departure_date LIKE '%Z' AND datetime(departure_date) IS NOT NULL))
      );
    `,
  },
];

function main() {
  config();
  const db = openDatabase();
  const runner = new MigrationRunner(db);
  runner.runMigrations(migrations);
}

try {
  main();
} catch (error) {
  console.error("Migration run failed:", error);
  process.exit(1);
}
