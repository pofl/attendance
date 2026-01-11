import { config } from "dotenv";
import postgres from "postgres";
import { Migration, MigrationRunner } from "./migrate";

config();

const migrations: Migration[] = [
  {
    id: "20260111-enable-pgcrypto",
    sql: `
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `,
  },
  {
    id: "20260111-create-merchants",
    sql: `
      CREATE TABLE IF NOT EXISTS merchants (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        external_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT timezone('UTC', NOW()),
        updated_at TIMESTAMP DEFAULT timezone('UTC', NOW())
      );
    `,
  },
  {
    id: "20260111-create-orders",
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        external_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(external_id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT timezone('UTC', NOW()),
        updated_at TIMESTAMP DEFAULT timezone('UTC', NOW())
      );
    `,
  },
  {
    id: "20260111-create-subscriptions",
    sql: `
      CREATE TABLE IF NOT EXISTS subscriptions (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        external_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
        order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT timezone('UTC', NOW()),
        updated_at TIMESTAMP DEFAULT timezone('UTC', NOW())
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
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error("Migration run failed:", error);
  process.exit(1);
});
