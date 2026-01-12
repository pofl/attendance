import { config } from "dotenv";
import postgres from "postgres";
import { MigrationRunner } from "./migrate.js";
config();
const migrations = [
    {
        id: "20260111-create-table-attendees",
        sql: `
      CREATE TYPE enum_passport_status AS ENUM ('valid', 'pending', 'none');
      CREATE TYPE enum_visa_status AS ENUM ('obtained', 'pending', 'none');

      CREATE TABLE IF NOT EXISTS attendees (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

        created_at TIMESTAMP DEFAULT timezone('UTC', NOW()),
        updated_at TIMESTAMP DEFAULT timezone('UTC', NOW()),

        name TEXT NOT NULL,
        locale TEXT NOT NULL,
        arrival_date TIMESTAMP,
        arrival_flight TEXT,
        departure_date TIMESTAMP,
        departure_flight TEXT,
        passport_status enum_passport_status NOT NULL,
        visa_status enum_visa_status NOT NULL,
        dietary_requirements TEXT,
        CONSTRAINT attendees_name_unique UNIQUE (name)
      );
    `,
    },
];
async function main() {
    config();
    const pgUri = process.env.PG_URI;
    if (!pgUri) {
        throw new Error("PG_URI environment variable is required to run migrations");
    }
    const db = postgres(pgUri);
    const runner = new MigrationRunner(db);
    try {
        await runner.runMigrations(migrations);
    }
    finally {
        await db.end();
    }
}
main().catch((error) => {
    console.error("Migration run failed:", error);
    process.exit(1);
});
