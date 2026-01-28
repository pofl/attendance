import type { FC } from "hono/jsx";
import { getTranslations, type Locale } from "../i18n.js";
import type { FlightAggregate } from "../repository.js";
import { formatLocalDateTime, formatOffsetLabel } from "../utils/flightFormat.js";
import { Layout } from "./Layout.js";

export const FlightsOverviewPage: FC<{ locale: Locale; flights: FlightAggregate[] }> = ({ locale, flights }) => {
  const t = getTranslations(locale).flightsOverviewPage;
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
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => (
              <tr key={flight.id}>
                <td>{flight.flight_number}</td>
                <td>
                  {flight.from_airport} → {flight.to_airport}
                </td>
                <td>
                  {formatLocalDateTime(flight.departure_at, flight.from_utc_offset_minutes)} ({formatOffsetLabel(flight.from_utc_offset_minutes)})
                </td>
                <td>
                  {formatLocalDateTime(flight.arrival_at, flight.to_utc_offset_minutes)} ({formatOffsetLabel(flight.to_utc_offset_minutes)})
                </td>
                <td>
                  <div>{flight.passenger_count}</div>
                  {flight.passenger_names.length > 0 && (
                    <div class="text-muted">{flight.passenger_names.join(", ")}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
};
