import type { FC } from "hono/jsx";
import { FlightForm } from "../components/FlightForm.js";
import { getTranslations, type Locale } from "../i18n.js";
import type { AttendeeRecord, FlightRecord } from "../repository.js";
import { Layout } from "./Layout.js";

interface AttendeeFlights {
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

export const AttendeeFlightsPage: FC<{ locale: Locale; attendees: AttendeeFlights[] }> = ({ locale, attendees }) => {
  const t = getTranslations(locale).attendeeFlightsPage;
  const flightLabels = getTranslations(locale).flightForm;
  return (
    <Layout locale={locale} currentPath="/flights/attendees">
      <h1>{t.title}</h1>
      <p class="text-muted">
        <a href="/flights">{t.overviewLink}</a>
      </p>

      {attendees.length === 0 ? (
        <p>{t.noAttendees}</p>
      ) : (
        attendees.map(({ attendee, flights }) => (
          <article key={attendee.id} class="card mb-3">
            <div class="flex justify-between items-center">
              <h2>{attendee.name}</h2>
              <a href={`/attendees/${encodeURIComponent(attendee.name)}`}>
                <button type="button">{t.openAttendee}</button>
              </a>
            </div>

            <section class="mt-2">
              <h3>{t.existingFlights}</h3>
              {flights.length === 0 ? (
                <p>{t.noFlights}</p>
              ) : (
                <table class="table">
                  <thead>
                    <tr>
                      <th>{flightLabels.flightNumber}</th>
                      <th>{t.route}</th>
                      <th>{t.departure}</th>
                      <th>{t.arrival}</th>
                      <th>{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.map((flight) => (
                      <tr key={flight.id}>
                        <td>{flight.flight_number}</td>
                        <td>
                          {flight.from_airport} ({formatOffsetLabel(flight.from_utc_offset_minutes)}) → {flight.to_airport} ({formatOffsetLabel(flight.to_utc_offset_minutes)})
                        </td>
                        <td>{formatLocalDateTime(flight.departure_at, flight.from_utc_offset_minutes)}</td>
                        <td>{formatLocalDateTime(flight.arrival_at, flight.to_utc_offset_minutes)}</td>
                        <td>
                          <form method="post" action={`/flights/attendees/${encodeURIComponent(attendee.name)}/remove`} class="inline-form">
                            <input type="hidden" name="flight_id" value={flight.id} />
                            <button type="submit" class="button-secondary">{flightLabels.remove}</button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section class="mt-2">
              <h3>{t.addFlightTitle}</h3>
              <FlightForm attendeeName={attendee.name} locale={locale} />
            </section>
          </article>
        ))
      )}
    </Layout>
  );
};
