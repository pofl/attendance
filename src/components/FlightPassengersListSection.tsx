import type { FC } from "hono/jsx";
import { getTranslations, type Locale } from "../i18n.js";
import type { AttendeeRecord, FlightRecord } from "../repository.js";

export const FlightPassengersListSection: FC<{
  locale: Locale;
  flight: FlightRecord;
  passengers: AttendeeRecord[];
  message?: string | null;
  messageType?: "success" | "error";
}> = ({ locale, flight, passengers, message, messageType = "success" }) => {
  const t = getTranslations(locale).flightPassengersPage;
  const flightLabels = getTranslations(locale).flightForm;
  const messageClass = messageType === "error" ? "error" : "text-success";

  return (
    <section id="flight-passengers">
      <h2>{t.currentPassengers} ({passengers.length})</h2>
      {message && <p class={messageClass}>{message}</p>}
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
                  <form
                    method="post"
                    action={`/flights/${flight.id}/passengers/${passenger.id}/remove`}
                    class="inline-form"
                    hx-post={`/flights/${flight.id}/passengers/${passenger.id}/remove`}
                    hx-target="#flight-passengers"
                    hx-swap="outerHTML"
                  >
                    <button type="submit" class="button-secondary">{flightLabels.remove}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};
