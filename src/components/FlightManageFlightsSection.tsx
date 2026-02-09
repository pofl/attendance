import type { FC } from "hono/jsx";
import { getTranslations, type Locale } from "../i18n.js";
import type { FlightRecord } from "../repository.js";
import { formatArrivalDateTime, formatDateForInput, formatDepartureDateTime } from "../utils/flightFormat.js";

export const FlightManageFlightsSection: FC<{
  locale: Locale;
  flights: FlightRecord[];
  message?: string | null;
  messageType?: "success" | "error";
}> = ({ locale, flights, message, messageType = "success" }) => {
  const t = getTranslations(locale).flightManagePage;
  const flightLabels = getTranslations(locale).flightForm;
  const messageClass = messageType === "error" ? "error" : "text-success";

  return (
    <section id="flight-manage-list">
      <h2>
        {t.existingFlights} ({flights.length})
      </h2>
      {message && <p class={messageClass}>{message}</p>}
      {flights.length === 0 ? (
        <p>{t.noFlights}</p>
      ) : (
        flights.map((flight) => (
          <details key={flight.id} class="accordion">
            <summary class="accordion-header">
              <div class="grow">
                {flight.flight_number} · {flight.from_airport} → {flight.to_airport}
              </div>
              <div class="text-muted">
                {formatDepartureDateTime(flight.departure_at, flight.from_utc_offset_minutes)}
              </div>
            </summary>
            <div class="accordion-content">
              <div class="mb-2">
                <strong>{t.details}</strong>
                <div class="text-muted">
                  {flight.from_airport} → {flight.to_airport}
                </div>
                <div class="text-muted">
                  {formatDepartureDateTime(flight.departure_at, flight.from_utc_offset_minutes)} ·{" "}
                  {formatArrivalDateTime(flight.arrival_at, flight.to_utc_offset_minutes)}
                </div>
              </div>

              <div class="button-row mb-2">
                <a href={`/flights/${flight.id}/passengers`}>
                  <button type="button">{t.managePassengers}</button>
                </a>
                <form
                  class="inline-form"
                  hx-post={`/flights/${flight.id}/delete`}
                  hx-target="#flight-manage-list"
                  hx-swap="outerHTML"
                >
                  <button type="submit" class="button-secondary">
                    {t.delete}
                  </button>
                </form>
              </div>

              <form
                class="grid-2"
                hx-post={`/flights/${flight.id}`}
                hx-target="#flight-manage-list"
                hx-swap="outerHTML"
              >
                <label>
                  {flightLabels.flightNumber}:
                  <input type="text" name="flight_number" required value={flight.flight_number} />
                </label>
                <label>
                  {flightLabels.fromAirport}:
                  <input type="text" name="from_airport" required value={flight.from_airport} />
                </label>
                <label>
                  {flightLabels.fromOffset}:
                  <input
                    type="number"
                    name="from_utc_offset_minutes"
                    required
                    value={String(flight.from_utc_offset_minutes)}
                  />
                </label>
                <label>
                  {flightLabels.departureLocal}:
                  <input
                    type="datetime-local"
                    name="departure_local"
                    required
                    value={formatDateForInput(flight.departure_at, flight.from_utc_offset_minutes)}
                  />
                </label>
                <label>
                  {flightLabels.toAirport}:
                  <input type="text" name="to_airport" required value={flight.to_airport} />
                </label>
                <label>
                  {flightLabels.toOffset}:
                  <input
                    type="number"
                    name="to_utc_offset_minutes"
                    required
                    value={String(flight.to_utc_offset_minutes)}
                  />
                </label>
                <label>
                  {flightLabels.arrivalLocal}:
                  <input
                    type="datetime-local"
                    name="arrival_local"
                    required
                    value={formatDateForInput(flight.arrival_at, flight.to_utc_offset_minutes)}
                  />
                </label>
                <div>
                  <button type="submit">{t.save}</button>
                </div>
              </form>
            </div>
          </details>
        ))
      )}
    </section>
  );
};
