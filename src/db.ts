import type { Database } from "better-sqlite3";
import SQLite from "better-sqlite3";

export const openDatabase = (): Database => {
  const db = new SQLite(process.env.DATABASE_PATH ?? "./data/attendance.db");
  db.pragma("foreign_keys = ON");
  return db;
};
