import postgres from "postgres";

export interface Migration {
  id: string;
  sql: string;
}

export class MigrationRunner {
  private db: postgres.Sql;

  constructor(db: postgres.Sql) {
    this.db = db;
  }

  async ensureMigrationsTable(): Promise<void> {
    await this.db`
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
  }

  async getExecutedMigrations(): Promise<string[]> {
    const result = await this.db`
      SELECT id FROM migrations ORDER BY executed_at ASC
    `;
    return result.map((row) => row.id);
  }

  async runMigration(migration: Migration): Promise<void> {
    console.log(`Running migration: ${migration.id}`);

    await this.db.begin(async (tx) => {
      // Execute the migration SQL
      await tx.unsafe(migration.sql);

      // Record the migration as completed
      await tx.unsafe("INSERT INTO migrations (id) VALUES ($1)", [migration.id]);
    });

    console.log(`Migration completed: ${migration.id}`);
  }

  async runMigrations(migrations: Migration[]): Promise<void> {
    await this.ensureMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    const pendingMigrations = migrations.filter((migration) => !executedMigrations.includes(migration.id));

    if (pendingMigrations.length === 0) {
      console.log("No pending migrations to run");
      return;
    }

    console.log(`Running ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      try {
        await this.runMigration(migration);
      } catch (error) {
        console.error(`Migration failed: ${migration.id}`, error);
        throw error;
      }
    }

    console.log("All migrations completed successfully");
  }
}
