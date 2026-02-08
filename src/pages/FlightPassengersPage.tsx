import type { FC } from "hono/jsx";
import { FlightPassengersListSection } from "../components/FlightPassengersListSection.js";
import { getTranslations, type Locale } from "../i18n.js";
import type { AttendeeRecord, FlightRecord } from "../repository.js";
import { formatLocalDateTime, formatOffsetLabel } from "../utils/flightFormat.js";
import { Layout } from "./Layout.js";

export const FlightPassengersPage: FC<{
  locale: Locale;
  flight: FlightRecord;
  attendees: AttendeeRecord[];
  passengers: AttendeeRecord[];
}> = ({ locale, flight, attendees, passengers }) => {
  const t = getTranslations(locale).flightPassengersPage;
  return (
    <Layout locale={locale} currentPath={`/flights/${flight.id}/passengers`}>
      <h1>{t.title}</h1>

      <section class="card mb-3">
        <h2>{t.flightDetails}</h2>
        <p>
          <strong>{flight.flight_number}</strong> · {flight.from_airport} → {flight.to_airport}
        </p>
        <p class="text-muted">
          {t.departure}: {formatLocalDateTime(flight.departure_at, flight.from_utc_offset_minutes)} (
          {formatOffsetLabel(flight.from_utc_offset_minutes)}) · {t.arrival}:{" "}
          {formatLocalDateTime(flight.arrival_at, flight.to_utc_offset_minutes)} (
          {formatOffsetLabel(flight.to_utc_offset_minutes)})
        </p>
      </section>

      <section class="card mb-3">
        <h2>{t.addPassengerTitle}</h2>
        <form hx-post={`/flights/${flight.id}/passengers`} hx-target="#flight-passengers" hx-swap="outerHTML">
          <label>
            {t.selectAttendee}:
            <select name="attendee_id" required>
              <option value="">{t.selectPlaceholder}</option>
              {attendees.map((attendee) => (
                <option value={attendee.id} key={attendee.id}>
                  {attendee.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">{t.addPassengerButton}</button>
        </form>
      </section>

      <FlightPassengersListSection locale={locale} flight={flight} passengers={passengers} />
    </Layout>
  );
};
