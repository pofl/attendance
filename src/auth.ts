import type { Database } from "better-sqlite3";
import crypto from "node:crypto";

export interface UserRecord {
  id: number;
  created_at: string;
  updated_at: string;
  username: string;
  password: string;
}

export interface SessionRecord {
  token: string;
  user_id: number;
  created_at: string;
  expires_at: string;
}

const SESSION_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000; // ~3 months

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ── User helpers ──

export function getUserByUsername(db: Database, username: string): UserRecord | null {
  const row = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  return row ? (row as UserRecord) : null;
}

export function getUserById(db: Database, id: number): UserRecord | null {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return row ? (row as UserRecord) : null;
}

export function createUser(db: Database, username: string, password: string): void {
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, password);
}

export function getAllUsers(db: Database): UserRecord[] {
  return db.prepare("SELECT * FROM users ORDER BY username ASC").all() as UserRecord[];
}

// ── Session helpers ──

export function createSession(db: Database, userId: number): string {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString();
  db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, userId, expiresAt);
  return token;
}

export function getValidSession(db: Database, token: string): SessionRecord | null {
  const row = db
    .prepare("SELECT * FROM sessions WHERE token = ? AND expires_at > ?")
    .get(token, new Date().toISOString());
  return row ? (row as SessionRecord) : null;
}

export function deleteSession(db: Database, token: string): void {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function deleteExpiredSessions(db: Database): void {
  db.prepare("DELETE FROM sessions WHERE expires_at <= ?").run(new Date().toISOString());
}

// ── Authentication ──

export function authenticate(db: Database, username: string, password: string): string | null {
  const user = getUserByUsername(db, username);
  if (!user || user.password !== password) {
    return null;
  }
  return createSession(db, user.id);
}

export const SESSION_COOKIE_NAME = "session";
export const SESSION_COOKIE_MAX_AGE = Math.floor(SESSION_MAX_AGE_MS / 1000);
