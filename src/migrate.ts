import type { Database } from "better-sqlite3";

export interface Migration {
  id: string;
  sql: string;
}

export class MigrationRunner {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  ensureMigrationsTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        executed_at TEXT NOT NULL
      )
    `);
  }

  getExecutedMigrations(): string[] {
    const rows = this.db.prepare("SELECT id FROM migrations ORDER BY executed_at ASC").all();
    return rows.map((row) => (row as { id: string }).id);
  }

  runMigration(migration: Migration): void {
    console.log(`Running migration: ${migration.id}`);

    const runTransaction = this.db.transaction(() => {
      this.db.exec(migration.sql);
      this.db
        .prepare("INSERT INTO migrations (id, executed_at) VALUES (?, ?)")
        .run(migration.id, new Date().toISOString());
    });

    runTransaction();

    console.log(`Migration completed: ${migration.id}`);
  }

  runMigrations(migrations: Migration[]): void {
    this.ensureMigrationsTable();

    const executedMigrations = this.getExecutedMigrations();
    const pendingMigrations = migrations.filter((migration) => !executedMigrations.includes(migration.id));

    if (pendingMigrations.length === 0) {
      console.log("No pending migrations to run");
      return;
    }

    console.log(`Running ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      try {
        this.runMigration(migration);
      } catch (error) {
        console.error(`Migration failed: ${migration.id}`, error);
        throw error;
      }
    }

    console.log("All migrations completed successfully");
  }
}
