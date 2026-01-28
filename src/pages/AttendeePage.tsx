import type { FC } from "hono/jsx";
import { AttendeeForm } from "../components/AttendeeForm.js";
import { getTranslations, type Locale } from "../i18n.js";
import type { AttendeeRecord, FlightRecord } from "../repository.js";
import { Layout } from "./Layout.js";

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

export const AttendeePage: FC<{ attendee: AttendeeRecord; flights: FlightRecord[]; allFlights: FlightRecord[]; locale: Locale }> = ({ attendee, flights, allFlights, locale }) => {
  const t = getTranslations(locale);
  const assignedIds = new Set(flights.map((flight) => flight.id));
  const availableFlights = allFlights.filter((flight) => !assignedIds.has(flight.id));
  return (
    <Layout locale={locale} currentPath={`/attendees/${encodeURIComponent(attendee.name)}`}>
      <h1>{t.attendeePage.title}: {attendee.name}</h1>
      <article class="card">
        <h2>{t.attendeeForm.editTitle}: {attendee.name}</h2>
        <AttendeeForm attendee={attendee} locale={locale} />
      </article>
      <article class="card mt-2">
        <h2>{t.cockpitPage.flightsTitle}</h2>
        {flights.length === 0 ? (
          <p class="text-muted">{t.cockpitPage.flightsNone}</p>
        ) : (
          <table class="table">
            <thead>
              <tr>
                <th>{t.cockpitPage.flightsFlight}</th>
                <th>{t.cockpitPage.flightsRoute}</th>
                <th>{t.cockpitPage.flightsDeparture}</th>
                <th>{t.cockpitPage.flightsArrival}</th>
                <th>{t.cockpitPage.flightsActions}</th>
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
                    <form method="post" action={`/cockpit/attendees/${attendee.id}/flights/${flight.id}/remove`} class="inline-form">
                      <button type="submit" class="button-secondary">{t.cockpitPage.flightsRemove}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div class="mt-2">
          <h3>{t.cockpitPage.flightsAddTitle}</h3>
          {availableFlights.length === 0 ? (
            <p class="text-muted">{t.cockpitPage.flightsNoAvailable}</p>
          ) : (
            <form method="post" action={`/cockpit/attendees/${attendee.id}/flights`}>
              <label>
                {t.cockpitPage.flightsSelectLabel}:
                <select name="flight_id" required>
                  <option value="">{t.cockpitPage.flightsSelectPlaceholder}</option>
                  {availableFlights.map((flight) => (
                    <option value={flight.id} key={flight.id}>
                      {flight.flight_number} · {flight.from_airport} → {flight.to_airport} · {formatLocalDateTime(flight.departure_at, flight.from_utc_offset_minutes)} ({formatOffsetLabel(flight.from_utc_offset_minutes)})
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit">{t.cockpitPage.flightsAdd}</button>
            </form>
          )}
        </div>
      </article>
    </Layout>
  );
};
