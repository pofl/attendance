import type { Database } from "better-sqlite3";
import crypto from "node:crypto";

export interface UserRecord {
  id: number;
  created_at: string;
  updated_at: string;
  username: string;
  password: string;
  is_superuser: boolean;
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

function parseUserRecord(row: Record<string, unknown>): UserRecord {
  return {
    id: Number(row.id),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    username: String(row.username),
    password: String(row.password),
    is_superuser: Number(row.is_superuser) === 1,
  };
}

// ── User helpers ──

export function getUserByUsername(db: Database, username: string): UserRecord | null {
  const row = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  return row ? parseUserRecord(row as Record<string, unknown>) : null;
}

export function getUserById(db: Database, id: number): UserRecord | null {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return row ? parseUserRecord(row as Record<string, unknown>) : null;
}

export function createUser(db: Database, username: string, password: string, isSuperUser = false): UserRecord {
  db.prepare("INSERT INTO users (username, password, is_superuser) VALUES (?, ?, ?)").run(
    username,
    password,
    isSuperUser ? 1 : 0
  );
  const user = getUserByUsername(db, username);
  if (!user) {
    throw new Error(`Could not create user ${username}`);
  }
  return user;
}

export function getAllUsers(db: Database): UserRecord[] {
  const rows = db.prepare("SELECT * FROM users ORDER BY username ASC").all() as Record<string, unknown>[];
  return rows.map((row) => parseUserRecord(row));
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

export function getUserForValidSessionToken(db: Database, token: string): UserRecord | null {
  const session = getValidSession(db, token);
  if (!session) {
    return null;
  }
  return getUserById(db, session.user_id);
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
