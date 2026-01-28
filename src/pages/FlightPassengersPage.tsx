import type { FC } from "hono/jsx";
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

export const FlightPassengersPage: FC<{
  locale: Locale;
  flight: FlightRecord;
  attendees: AttendeeRecord[];
  passengers: AttendeeRecord[];
}> = ({ locale, flight, attendees, passengers }) => {
  const t = getTranslations(locale).flightPassengersPage;
  const flightLabels = getTranslations(locale).flightForm;

  return (
    <Layout locale={locale} currentPath={`/flights/${flight.id}/passengers`}>
      <h1>{t.title}</h1>
      <p class="text-muted">
        <a href="/flights/manage">{t.backToFlights}</a>
      </p>

      <section class="card mb-3">
        <h2>{t.flightDetails}</h2>
        <p>
          <strong>{flight.flight_number}</strong> · {flight.from_airport} ({formatOffsetLabel(flight.from_utc_offset_minutes)}) → {flight.to_airport} ({formatOffsetLabel(flight.to_utc_offset_minutes)})
        </p>
        <p class="text-muted">
          {t.departure}: {formatLocalDateTime(flight.departure_at, flight.from_utc_offset_minutes)} · {t.arrival}: {formatLocalDateTime(flight.arrival_at, flight.to_utc_offset_minutes)}
        </p>
      </section>

      <section class="card mb-3">
        <h2>{t.addPassengerTitle}</h2>
        <form method="post" action={`/flights/${flight.id}/passengers`}>
          <label>
            {t.selectAttendee}:
            <select name="attendee_id" required>
              <option value="">{t.selectPlaceholder}</option>
              {attendees.map((attendee) => (
                <option value={attendee.id} key={attendee.id}>{attendee.name}</option>
              ))}
            </select>
          </label>
          <button type="submit">{t.addPassengerButton}</button>
        </form>
      </section>

      <section>
        <h2>{t.currentPassengers} ({passengers.length})</h2>
        {passengers.length === 0 ? (
          <p>{t.noPassengers}</p>
        ) : (
          <table class="table">
            <thead>
              <tr>
                <th>{t.passengerName}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {passengers.map((passenger) => (
                <tr key={passenger.id}>
                  <td>
                    <a href={`/attendees/${encodeURIComponent(passenger.name)}`}>{passenger.name}</a>
                  </td>
                  <td>
                    <form method="post" action={`/flights/${flight.id}/passengers/${passenger.id}/remove`} class="inline-form">
                      <button type="submit" class="button-secondary">{flightLabels.remove}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </Layout>
  );
};
