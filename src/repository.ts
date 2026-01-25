import type { Database } from "better-sqlite3";

export interface Attendee {
  name: string;
  locale: string;
  arrival_date: string | null;
  arrival_flight: string | null;
  departure_date: string | null;
  departure_flight: string | null;
  passport_status: "valid" | "pending" | "none";
  visa_status: "obtained" | "pending" | "none";
  dietary_requirements: string | null;
}

export interface AttendeeRecord {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  locale: string;
  arrival_date: string | null;
  arrival_flight: string | null;
  departure_date: string | null;
  departure_flight: string | null;
  passport_status: "valid" | "pending" | "none";
  visa_status: "obtained" | "pending" | "none";
  dietary_requirements: string | null;
}

function parseAttendeeRecord(row: Record<string, unknown>): AttendeeRecord {
  return {
    id: row.id as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    name: row.name as string,
    locale: row.locale as string,
    arrival_date: row.arrival_date as string | null,
    arrival_flight: row.arrival_flight as string | null,
    departure_date: row.departure_date as string | null,
    departure_flight: row.departure_flight as string | null,
    passport_status: row.passport_status as "valid" | "pending" | "none",
    visa_status: row.visa_status as "obtained" | "pending" | "none",
    dietary_requirements: row.dietary_requirements as string | null,
  };
}

export function getAllAttendees(db: Database): AttendeeRecord[] {
  try {
    const rows = db.prepare("SELECT * FROM attendees ORDER BY name ASC").all() as Record<string, unknown>[];
    return rows.map((row) => parseAttendeeRecord(row));
  } catch (error) {
    console.error("Error getting all attendees:", error);
    throw error;
  }
}

export function getAttendeeByName(db: Database, name: string): AttendeeRecord | null {
  try {
    const row = db.prepare("SELECT * FROM attendees WHERE name = ?").get(name);
    if (!row) {
      return null;
    }
    return parseAttendeeRecord(row as Record<string, unknown>);
  } catch (error) {
    console.error("Error getting attendee by name:", error);
    throw error;
  }
}

export function upsertAttendee(db: Database, attendee: Attendee): void {
  try {
    const statement = db.prepare(`
      INSERT INTO attendees (
        name,
        locale,
        arrival_date,
        arrival_flight,
        departure_date,
        departure_flight,
        passport_status,
        visa_status,
        dietary_requirements
      ) VALUES (
        @name,
        @locale,
        @arrival_date,
        @arrival_flight,
        @departure_date,
        @departure_flight,
        @passport_status,
        @visa_status,
        @dietary_requirements
      )
      ON CONFLICT (name) DO UPDATE SET
        locale = excluded.locale,
        arrival_date = excluded.arrival_date,
        arrival_flight = excluded.arrival_flight,
        departure_date = excluded.departure_date,
        departure_flight = excluded.departure_flight,
        passport_status = excluded.passport_status,
        visa_status = excluded.visa_status,
        dietary_requirements = excluded.dietary_requirements,
        updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    `);

    statement.run(attendee);
    console.log("Attendee upserted:", attendee.name);
  } catch (error) {
    console.error("Error upserting attendee:", error);
    throw error;
  }
}
