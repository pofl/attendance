import type { FC } from "hono/jsx";
import { getTranslations, type Locale } from "../i18n.js";
import type { AttendeeRecord, FlightRecord } from "../repository.js";
import { formatArrivalDateTime, formatDepartureDateTime } from "../utils/flightFormat.js";

export const AttendeeFlightsSection: FC<{
  attendee: AttendeeRecord;
  flights: FlightRecord[];
  allFlights: FlightRecord[];
  locale: Locale;
  message?: string | null;
  messageType?: "success" | "error";
}> = ({ attendee, flights, allFlights, locale, message, messageType = "success" }) => {
  const t = getTranslations(locale);
  const messageClass = messageType === "error" ? "error" : "text-success";
  const assignedIds = new Set(flights.map((flight) => flight.id));
  const availableFlights = allFlights.filter((flight) => !assignedIds.has(flight.id));

  return (
    <section id={`attendee-flights-${attendee.id}`} class="card mt-2">
      <h2>{t.cockpitPage.flightsTitle}</h2>
      {message && <p class={messageClass}>{message}</p>}
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
                <td>
                  {flight.from_airport} → {flight.to_airport}
                </td>
                <td>{formatDepartureDateTime(flight.departure_at, flight.from_utc_offset_minutes)}</td>
                <td>{formatArrivalDateTime(flight.arrival_at, flight.to_utc_offset_minutes)}</td>
                <td>
                  <form
                    class="inline-form"
                    hx-post={`/cockpit/attendees/${attendee.id}/flights/${flight.id}/remove`}
                    hx-target={`#attendee-flights-${attendee.id}`}
                    hx-swap="outerHTML"
                  >
                    <button type="submit" class="button-secondary">
                      {t.cockpitPage.flightsRemove}
                    </button>
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
          <form
            hx-post={`/cockpit/attendees/${attendee.id}/flights`}
            hx-target={`#attendee-flights-${attendee.id}`}
            hx-swap="outerHTML"
          >
            <label>
              {t.cockpitPage.flightsSelectLabel}:
              <select name="flight_id" required>
                <option value="">{t.cockpitPage.flightsSelectPlaceholder}</option>
                {availableFlights.map((flight) => (
                  <option value={flight.id} key={flight.id}>
                    {flight.flight_number} · {flight.from_airport} → {flight.to_airport} ·{" "}
                    {formatDepartureDateTime(flight.departure_at, flight.from_utc_offset_minutes)}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">{t.cockpitPage.flightsAdd}</button>
          </form>
        )}
      </div>
    </section>
  );
};
