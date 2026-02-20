import type { Migration } from "./migrate.js";

export const migrations: Migration[] = [
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
  {
    id: "20260128-create-table-flights",
    sql: `
      CREATE TABLE IF NOT EXISTS flights (
        id INTEGER PRIMARY KEY,

        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

        flight_number TEXT NOT NULL,
        from_airport TEXT NOT NULL,
        to_airport TEXT NOT NULL,
        from_utc_offset_minutes INTEGER NOT NULL,
        to_utc_offset_minutes INTEGER NOT NULL,
        departure_at TEXT NOT NULL,
        arrival_at TEXT NOT NULL,
        CONSTRAINT flights_unique UNIQUE (flight_number, departure_at),
        CONSTRAINT flights_created_at_utc CHECK (created_at LIKE '%Z' AND datetime(created_at) IS NOT NULL),
        CONSTRAINT flights_updated_at_utc CHECK (updated_at LIKE '%Z' AND datetime(updated_at) IS NOT NULL),
        CONSTRAINT flights_departure_at_utc CHECK (departure_at LIKE '%Z' AND datetime(departure_at) IS NOT NULL),
        CONSTRAINT flights_arrival_at_utc CHECK (arrival_at LIKE '%Z' AND datetime(arrival_at) IS NOT NULL)
      );

      CREATE INDEX IF NOT EXISTS flights_departure_at_idx ON flights (departure_at);
    `,
  },
  {
    id: "20260128-create-table-flight-passengers",
    sql: `
      CREATE TABLE IF NOT EXISTS flight_passengers (
        flight_id INTEGER NOT NULL,
        attendee_id INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        PRIMARY KEY (flight_id, attendee_id),
        CONSTRAINT flight_passengers_created_at_utc CHECK (created_at LIKE '%Z' AND datetime(created_at) IS NOT NULL),
        FOREIGN KEY (flight_id) REFERENCES flights (id) ON DELETE CASCADE,
        FOREIGN KEY (attendee_id) REFERENCES attendees (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS flight_passengers_attendee_idx ON flight_passengers (attendee_id);
    `,
  },
  {
    id: "20260129-remove-attendee-flight-fields",
    sql: `
      CREATE TABLE IF NOT EXISTS attendees_new (
        id INTEGER PRIMARY KEY,

        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

        name TEXT NOT NULL,
        locale TEXT NOT NULL,
        passport_status TEXT NOT NULL CHECK (passport_status IN ('valid', 'pending', 'none')),
        visa_status TEXT NOT NULL CHECK (visa_status IN ('obtained', 'pending', 'none')),
        dietary_requirements TEXT,
        CONSTRAINT attendees_name_unique UNIQUE (name),
        CONSTRAINT attendees_created_at_utc CHECK (created_at LIKE '%Z' AND datetime(created_at) IS NOT NULL),
        CONSTRAINT attendees_updated_at_utc CHECK (updated_at LIKE '%Z' AND datetime(updated_at) IS NOT NULL)
      );

      INSERT INTO attendees_new (
        id,
        created_at,
        updated_at,
        name,
        locale,
        passport_status,
        visa_status,
        dietary_requirements
      )
      SELECT
        id,
        created_at,
        updated_at,
        name,
        locale,
        passport_status,
        visa_status,
        dietary_requirements
      FROM attendees;

      DROP TABLE attendees;
      ALTER TABLE attendees_new RENAME TO attendees;
    `,
  },
  {
    id: "20260219-create-table-users",
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        CONSTRAINT users_username_unique UNIQUE (username),
        CONSTRAINT users_created_at_utc CHECK (created_at LIKE '%Z' AND datetime(created_at) IS NOT NULL),
        CONSTRAINT users_updated_at_utc CHECK (updated_at LIKE '%Z' AND datetime(updated_at) IS NOT NULL)
      );
    `,
  },
  {
    id: "20260219-create-table-sessions",
    sql: `
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        expires_at TEXT NOT NULL,
        CONSTRAINT sessions_created_at_utc CHECK (created_at LIKE '%Z' AND datetime(created_at) IS NOT NULL),
        CONSTRAINT sessions_expires_at_utc CHECK (expires_at LIKE '%Z' AND datetime(expires_at) IS NOT NULL),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
      CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);
    `,
  },
  {
    id: "20260220-users-superuser-and-attendee-link",
    sql: `
      ALTER TABLE users ADD COLUMN is_superuser INTEGER NOT NULL DEFAULT 0;

      INSERT INTO users (username, password, is_superuser)
      SELECT a.name, 'changeme', 0
      FROM attendees a
      LEFT JOIN users u ON u.username = a.name
      WHERE u.id IS NULL;

      CREATE TABLE IF NOT EXISTS attendees_new (
        id INTEGER PRIMARY KEY,

        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        locale TEXT NOT NULL,
        passport_status TEXT NOT NULL CHECK (passport_status IN ('valid', 'pending', 'none')),
        visa_status TEXT NOT NULL CHECK (visa_status IN ('obtained', 'pending', 'none')),
        dietary_requirements TEXT,
        CONSTRAINT attendees_user_unique UNIQUE (user_id),
        CONSTRAINT attendees_name_unique UNIQUE (name),
        CONSTRAINT attendees_created_at_utc CHECK (created_at LIKE '%Z' AND datetime(created_at) IS NOT NULL),
        CONSTRAINT attendees_updated_at_utc CHECK (updated_at LIKE '%Z' AND datetime(updated_at) IS NOT NULL),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );

      INSERT INTO attendees_new (
        id,
        created_at,
        updated_at,
        user_id,
        name,
        locale,
        passport_status,
        visa_status,
        dietary_requirements
      )
      SELECT
        a.id,
        a.created_at,
        a.updated_at,
        u.id,
        u.username,
        a.locale,
        a.passport_status,
        a.visa_status,
        a.dietary_requirements
      FROM attendees a
      INNER JOIN users u ON u.username = a.name;

      INSERT INTO attendees_new (
        user_id,
        name,
        locale,
        passport_status,
        visa_status,
        dietary_requirements
      )
      SELECT
        u.id,
        u.username,
        'en_US',
        'none',
        'none',
        NULL
      FROM users u
      LEFT JOIN attendees_new a ON a.user_id = u.id
      WHERE a.id IS NULL;

      DROP TABLE attendees;
      ALTER TABLE attendees_new RENAME TO attendees;
    `,
  },
];
