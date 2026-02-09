import type { FC } from "hono/jsx";
import { getTranslations, type Locale } from "../i18n.js";
import type { FlightAggregate } from "../repository.js";
import { formatArrivalDateTime, formatDepartureDateTime } from "../utils/flightFormat.js";
import { Layout } from "./Layout.js";

export const FlightsOverviewPage: FC<{
  locale: Locale;
  flights: FlightAggregate[];
  message?: string | null;
  messageType?: "success" | "error";
}> = ({ locale, flights, message, messageType = "success" }) => {
  const t = getTranslations(locale).flightsOverviewPage;
  const flightLabels = getTranslations(locale).flightForm;
  const messageClass = messageType === "error" ? "error" : "text-success";
  return (
    <Layout locale={locale} currentPath="/flights">
      <h1>{t.title}</h1>

      {flights.length === 0 ? (
        <p>{t.noFlights}</p>
      ) : (
        <table class="table">
          <thead>
            <tr>
              <th>{t.flight}</th>
              <th>{t.route}</th>
              <th>{t.departure}</th>
              <th>{t.arrival}</th>
              <th>{t.passengers}</th>
              <th>{t.actions}</th>
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
                  <div>{flight.passenger_count}</div>
                  {flight.passenger_names.length > 0 && (
                    <div class="text-muted">{flight.passenger_names.join(", ")}</div>
                  )}
                </td>
                <td>
                  <a href={`/flights/${flight.id}/edit`}>
                    <button type="button">{t.open}</button>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <section class="card mt-3">
        <h2>{t.addFlightTitle}</h2>
        {message && <p class={messageClass}>{message}</p>}
        <form class="grid-2" x-data="{ mode: 'fields' }" method="post" action="/flights">
          <div class="grid-span-2 mode-panel">
            <label class="mode-label">
              {t.inputModeLabel}:
              <select name="input_mode" x-model="mode" class="mode-select">
                <option value="fields">{t.fieldEntryToggle}</option>
                <option value="json">{t.jsonToggle}</option>
              </select>
            </label>
            <p class="text-muted mode-hint">{t.inputModeHint}</p>
          </div>

          <div class="grid-span-2" x-show="mode === 'fields'" x-cloak>
            <div class="grid-2">
              <label>
                {flightLabels.flightNumber}:
                <input type="text" name="flight_number" placeholder="LH2025" x-bind:disabled="mode !== 'fields'" />
              </label>
              <label>
                {flightLabels.fromAirport}:
                <input type="text" name="from_airport" placeholder="MUC" x-bind:disabled="mode !== 'fields'" />
              </label>
              <label>
                {flightLabels.fromOffset}:
                <input
                  type="number"
                  name="from_utc_offset_minutes"
                  placeholder="60"
                  x-bind:disabled="mode !== 'fields'"
                />
              </label>
              <label>
                {flightLabels.departureLocal}:
                <input type="datetime-local" name="departure_local" x-bind:disabled="mode !== 'fields'" />
              </label>
              <label>
                {flightLabels.toAirport}:
                <input type="text" name="to_airport" placeholder="BLR" x-bind:disabled="mode !== 'fields'" />
              </label>
              <label>
                {flightLabels.toOffset}:
                <input
                  type="number"
                  name="to_utc_offset_minutes"
                  placeholder="330"
                  x-bind:disabled="mode !== 'fields'"
                />
              </label>
              <label>
                {flightLabels.arrivalLocal}:
                <input type="datetime-local" name="arrival_local" x-bind:disabled="mode !== 'fields'" />
              </label>
            </div>
          </div>

          <label class="grid-span-2" x-show="mode === 'json'" x-cloak>
            {t.importJsonTitle}:
            <textarea
              name="flight_json"
              placeholder={t.importJsonPlaceholder}
              rows={8}
              x-bind:disabled="mode !== 'json'"
            ></textarea>
            <div class="text-muted">{t.importJsonHelp}</div>
          </label>

          <div>
            <button type="submit">{flightLabels.add}</button>
          </div>
        </form>
      </section>
    </Layout>
  );
};
