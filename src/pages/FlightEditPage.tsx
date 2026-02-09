import type { FC } from "hono/jsx";
import { getTranslations, type Locale } from "../i18n.js";
import type { FlightRecord } from "../repository.js";
import { formatDateForInput } from "../utils/flightFormat.js";
import { Layout } from "./Layout.js";

export const FlightEditPage: FC<{
  locale: Locale;
  flight: FlightRecord;
  message?: string | null;
  messageType?: "success" | "error";
}> = ({ locale, flight, message, messageType = "success" }) => {
  const t = getTranslations(locale);
  const labels = t.flightForm;
  const editLabels = t.flightEditPage;
  const messageClass = messageType === "error" ? "error" : "text-success";

  return (
    <Layout locale={locale} currentPath={`/flights/${flight.id}/edit`}>
      <h1>{editLabels.title}</h1>

      <section class="card">
        {message && <p class={messageClass}>{message}</p>}
        <form class="grid-2" method="post" action={`/flights/${flight.id}`}>
          <label>
            {labels.flightNumber}:
            <input type="text" name="flight_number" required value={flight.flight_number} />
          </label>
          <label>
            {labels.fromAirport}:
            <input type="text" name="from_airport" required value={flight.from_airport} />
          </label>
          <label>
            {labels.fromOffset}:
            <input
              type="number"
              name="from_utc_offset_minutes"
              required
              value={String(flight.from_utc_offset_minutes)}
            />
          </label>
          <label>
            {labels.departureLocal}:
            <input
              type="datetime-local"
              name="departure_local"
              required
              value={formatDateForInput(flight.departure_at, flight.from_utc_offset_minutes)}
            />
          </label>
          <label>
            {labels.toAirport}:
            <input type="text" name="to_airport" required value={flight.to_airport} />
          </label>
          <label>
            {labels.toOffset}:
            <input type="number" name="to_utc_offset_minutes" required value={String(flight.to_utc_offset_minutes)} />
          </label>
          <label>
            {labels.arrivalLocal}:
            <input
              type="datetime-local"
              name="arrival_local"
              required
              value={formatDateForInput(flight.arrival_at, flight.to_utc_offset_minutes)}
            />
          </label>
          <div class="button-row items-end mb-2">
            <button type="submit">{editLabels.save}</button>
            <button type="button" class="button-secondary" hx-post={`/flights/${flight.id}/delete`}>
              {editLabels.delete}
            </button>
          </div>
        </form>
      </section>
    </Layout>
  );
};
