import { config } from "dotenv";
import { openDatabase } from "./db.js";
import { MigrationRunner } from "./migrate.js";
import { migrations } from "./migrations.js";

config();

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
