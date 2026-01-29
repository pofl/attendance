import type { FC } from "hono/jsx";
import { AttendeeForm } from "../components/AttendeeForm.js";
import { getTranslations, type Locale } from "../i18n.js";
import type { AttendeeRecord, FlightRecord } from "../repository.js";
import { Layout } from "./Layout.js";

interface AttendeeWithFlights {
  attendee: AttendeeRecord;
  flights: FlightRecord[];
}

const padTimePart = (value: number): string => value.toString().padStart(2, "0");

const formatOffsetLabel = (offsetMinutes: number): string => {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `UTC${sign}${padTimePart(hours)}:${padTimePart(minutes)}`;
};

const formatLocalDateTime = (utcIso: string, offsetMinutes: number): string => {
  const date = new Date(utcIso);
  if (Number.isNaN(date.getTime())) return "-";
  const localMs = date.getTime() + offsetMinutes * 60_000;
  const local = new Date(localMs);
  const year = local.getUTCFullYear();
  const month = padTimePart(local.getUTCMonth() + 1);
  const day = padTimePart(local.getUTCDate());
  const hours = padTimePart(local.getUTCHours());
  const minutes = padTimePart(local.getUTCMinutes());
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const AttendeeAccordion: FC<{ attendee: AttendeeRecord; flights: FlightRecord[]; locale: Locale }> = ({ attendee, flights, locale }) => (
  <details key={attendee.id} class="accordion">
    <summary class="accordion-header"><div class="grow">{attendee.name}</div> <a href={`/attendees/${encodeURIComponent(attendee.name)}`}><button>Open</button></a></summary>
    <div class="accordion-content">
      <AttendeeForm attendee={attendee} locale={locale} />
      <section class="mt-2">
        <h3>Flights</h3>
        {flights.length === 0 ? (
          <p class="text-muted">No flights assigned.</p>
        ) : (
          <table class="table">
            <thead>
              <tr>
                <th>Flight</th>
                <th>Route</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((flight) => (
                <tr key={flight.id}>
                  <td>{flight.flight_number}</td>
                  <td>{flight.from_airport} → {flight.to_airport}</td>
                  <td>
                    {formatLocalDateTime(flight.departure_at, flight.from_utc_offset_minutes)} ({formatOffsetLabel(flight.from_utc_offset_minutes)})
                  </td>
                  <td>
                    {formatLocalDateTime(flight.arrival_at, flight.to_utc_offset_minutes)} ({formatOffsetLabel(flight.to_utc_offset_minutes)})
                  </td>
                  <td>
                    <a href={`/flights/${flight.id}/passengers`}>
                      <button type="button">Manage passengers</button>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  </details>
);

export const CockpitPage: FC<{ attendees: AttendeeWithFlights[]; locale: Locale }> = ({ attendees, locale }) => {
  const t = getTranslations(locale);
  return (
    <Layout locale={locale} currentPath="/cockpit">
      <h1>{t.cockpitPage.title}</h1>

      <section class="card mb-3">
        <h2>{t.cockpitPage.createNew}</h2>
        <form method="post" action="/cockpit/attendees">
          <label>
            {t.cockpitPage.name}:
            <input type="text" name="name" required placeholder={t.cockpitPage.namePlaceholder} />
          </label>
          <button type="submit">{t.cockpitPage.createButton}</button>
        </form>
      </section>

      <section class="mt-2">
        <h2>{t.cockpitPage.existingAttendees} ({attendees.length})</h2>
        {attendees.length === 0 ? (
          <p>{t.cockpitPage.noAttendees}</p>
        ) : (
          attendees.map(({ attendee, flights }) => (
            <AttendeeAccordion key={attendee.id} attendee={attendee} flights={flights} locale={locale} />
          ))
        )}
      </section>
    </Layout>
  );
};
