import type { FC } from "hono/jsx";
import { getTranslations, type Locale } from "../i18n.js";

interface FlightFormProps {
  attendeeName: string;
  locale: Locale;
}

export const FlightForm: FC<FlightFormProps> = ({ attendeeName, locale }) => {
  const t = getTranslations(locale).flightForm;
  return (
    <form method="post" action={`/flights/attendees/${encodeURIComponent(attendeeName)}`} class="flight-form">
      <div class="grid-2">
        <label>
          {t.flightNumber}:
          <input type="text" name="flight_number" required placeholder="LH2025" />
        </label>

        <label>
          {t.fromAirport}:
          <input type="text" name="from_airport" required placeholder="MUC" />
        </label>

        <label>
          {t.fromOffset}:
          <input type="number" name="from_utc_offset_minutes" required placeholder="60" />
        </label>

        <label>
          {t.departureLocal}:
          <input type="datetime-local" name="departure_local" required />
        </label>

        <label>
          {t.toAirport}:
          <input type="text" name="to_airport" required placeholder="BLR" />
        </label>

        <label>
          {t.toOffset}:
          <input type="number" name="to_utc_offset_minutes" required placeholder="330" />
        </label>

        <label>
          {t.arrivalLocal}:
          <input type="datetime-local" name="arrival_local" required />
        </label>
      </div>

      <button type="submit">{t.add}</button>
    </form>
  );
};
