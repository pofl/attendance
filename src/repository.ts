import type { Database } from "better-sqlite3";

export interface Attendee {
  name: string;
  locale: string;
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

export function getAttendeeById(db: Database, id: number): AttendeeRecord | null {
  try {
    const row = db.prepare("SELECT * FROM attendees WHERE id = ?").get(id);
    if (!row) {
      return null;
    }
    return parseAttendeeRecord(row as Record<string, unknown>);
  } catch (error) {
    console.error("Error getting attendee by id:", error);
    throw error;
  }
}

export function upsertAttendee(db: Database, attendee: Attendee): void {
  try {
    const statement = db.prepare(`
      INSERT INTO attendees (
        name,
        locale,
        passport_status,
        visa_status,
        dietary_requirements
      ) VALUES (
        @name,
        @locale,
        @passport_status,
        @visa_status,
        @dietary_requirements
      )
      ON CONFLICT (name) DO UPDATE SET
        locale = excluded.locale,
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

export function deleteAttendeeByName(db: Database, name: string): void {
  try {
    db.prepare("DELETE FROM attendees WHERE name = ?").run(name);
  } catch (error) {
    console.error("Error deleting attendee:", error);
    throw error;
  }
}

export interface Flight {
  flight_number: string;
  from_airport: string;
  to_airport: string;
  from_utc_offset_minutes: number;
  to_utc_offset_minutes: number;
  departure_at: string;
  arrival_at: string;
}

export interface FlightRecord extends Flight {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface FlightAggregate extends FlightRecord {
  passenger_count: number;
  passenger_names: string[];
}

function parseFlightRecord(row: Record<string, unknown>): FlightRecord {
  return {
    id: row.id as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    flight_number: row.flight_number as string,
    from_airport: row.from_airport as string,
    to_airport: row.to_airport as string,
    from_utc_offset_minutes: Number(row.from_utc_offset_minutes),
    to_utc_offset_minutes: Number(row.to_utc_offset_minutes),
    departure_at: row.departure_at as string,
    arrival_at: row.arrival_at as string,
  };
}

export function upsertFlight(db: Database, flight: Flight): FlightRecord {
  try {
    const statement = db.prepare(`
      INSERT INTO flights (
        flight_number,
        from_airport,
        to_airport,
        from_utc_offset_minutes,
        to_utc_offset_minutes,
        departure_at,
        arrival_at
      ) VALUES (
        @flight_number,
        @from_airport,
        @to_airport,
        @from_utc_offset_minutes,
        @to_utc_offset_minutes,
        @departure_at,
        @arrival_at
      )
      ON CONFLICT (flight_number, departure_at) DO UPDATE SET
        from_airport = excluded.from_airport,
        to_airport = excluded.to_airport,
        from_utc_offset_minutes = excluded.from_utc_offset_minutes,
        to_utc_offset_minutes = excluded.to_utc_offset_minutes,
        arrival_at = excluded.arrival_at,
        updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    `);

    statement.run(flight);

    const row = db
      .prepare("SELECT * FROM flights WHERE flight_number = ? AND departure_at = ?")
      .get(flight.flight_number, flight.departure_at);
    if (!row) {
      throw new Error("Failed to upsert flight");
    }
    return parseFlightRecord(row as Record<string, unknown>);
  } catch (error) {
    console.error("Error upserting flight:", error);
    throw error;
  }
}

export function getAllFlights(db: Database): FlightRecord[] {
  try {
    const rows = db.prepare("SELECT * FROM flights ORDER BY datetime(departure_at) ASC").all() as Record<
      string,
      unknown
    >[];
    return rows.map((row) => parseFlightRecord(row));
  } catch (error) {
    console.error("Error getting all flights:", error);
    throw error;
  }
}

export function getFlightById(db: Database, id: number): FlightRecord | null {
  try {
    const row = db.prepare("SELECT * FROM flights WHERE id = ?").get(id);
    if (!row) return null;
    return parseFlightRecord(row as Record<string, unknown>);
  } catch (error) {
    console.error("Error getting flight by id:", error);
    throw error;
  }
}

export function updateFlightById(db: Database, id: number, flight: Flight): void {
  try {
    const statement = db.prepare(`
      UPDATE flights SET
        flight_number = @flight_number,
        from_airport = @from_airport,
        to_airport = @to_airport,
        from_utc_offset_minutes = @from_utc_offset_minutes,
        to_utc_offset_minutes = @to_utc_offset_minutes,
        departure_at = @departure_at,
        arrival_at = @arrival_at,
        updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      WHERE id = @id
    `);

    statement.run({ id, ...flight });
  } catch (error) {
    console.error("Error updating flight:", error);
    throw error;
  }
}

export function deleteFlight(db: Database, id: number): void {
  try {
    db.prepare("DELETE FROM flights WHERE id = ?").run(id);
  } catch (error) {
    console.error("Error deleting flight:", error);
    throw error;
  }
}

export function upsertFlightForAttendee(db: Database, attendeeId: number, flight: Flight): FlightRecord {
  try {
    const flightRecord = upsertFlight(db, flight);
    db.prepare("INSERT OR IGNORE INTO flight_passengers (flight_id, attendee_id) VALUES (?, ?)").run(
      flightRecord.id,
      attendeeId
    );
    return flightRecord;
  } catch (error) {
    console.error("Error assigning flight to attendee:", error);
    throw error;
  }
}

export function addPassengerToFlight(db: Database, flightId: number, attendeeId: number): void {
  try {
    db.prepare("INSERT OR IGNORE INTO flight_passengers (flight_id, attendee_id) VALUES (?, ?)").run(
      flightId,
      attendeeId
    );
  } catch (error) {
    console.error("Error adding passenger to flight:", error);
    throw error;
  }
}

export function getPassengersForFlight(db: Database, flightId: number): AttendeeRecord[] {
  try {
    const rows = db
      .prepare(
        `
          SELECT a.*
          FROM attendees a
          INNER JOIN flight_passengers fp ON fp.attendee_id = a.id
          WHERE fp.flight_id = ?
          ORDER BY a.name ASC
        `
      )
      .all(flightId) as Record<string, unknown>[];
    return rows.map((row) => parseAttendeeRecord(row));
  } catch (error) {
    console.error("Error getting passengers for flight:", error);
    throw error;
  }
}

export function getFlightsForAttendee(db: Database, attendeeId: number): FlightRecord[] {
  try {
    const rows = db
      .prepare(
        `
          SELECT f.*
          FROM flights f
          INNER JOIN flight_passengers fp ON fp.flight_id = f.id
          WHERE fp.attendee_id = ?
          ORDER BY datetime(f.departure_at) ASC
        `
      )
      .all(attendeeId) as Record<string, unknown>[];
    return rows.map((row) => parseFlightRecord(row));
  } catch (error) {
    console.error("Error getting flights for attendee:", error);
    throw error;
  }
}

export function removePassengerFromFlight(db: Database, flightId: number, attendeeId: number): void {
  try {
    db.prepare("DELETE FROM flight_passengers WHERE flight_id = ? AND attendee_id = ?").run(flightId, attendeeId);
  } catch (error) {
    console.error("Error removing passenger from flight:", error);
    throw error;
  }
}

export function getFlightAggregates(db: Database): FlightAggregate[] {
  try {
    const rows = db
      .prepare(
        `
          SELECT
            f.*,
            COUNT(fp.attendee_id) AS passenger_count,
            GROUP_CONCAT(DISTINCT a.name) AS passenger_names
          FROM flights f
          LEFT JOIN flight_passengers fp ON fp.flight_id = f.id
          LEFT JOIN attendees a ON a.id = fp.attendee_id
          GROUP BY f.id
          ORDER BY datetime(f.departure_at) ASC
        `
      )
      .all() as Record<string, unknown>[];

    return rows.map((row) => {
      const flight = parseFlightRecord(row);
      const names = row.passenger_names ? String(row.passenger_names).split(",") : [];
      return {
        ...flight,
        passenger_count: Number(row.passenger_count ?? 0),
        passenger_names: names.filter((name) => name.trim().length > 0),
      };
    });
  } catch (error) {
    console.error("Error getting flight aggregates:", error);
    throw error;
  }
}
