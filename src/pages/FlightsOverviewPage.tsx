import type { FC } from "hono/jsx";
import { getTranslations, type Locale } from "../i18n.js";
import type { FlightAggregate } from "../repository.js";
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
                  {flight.from_airport} ({formatOffsetLabel(flight.from_utc_offset_minutes)}) → {flight.to_airport} ({formatOffsetLabel(flight.to_utc_offset_minutes)})
                </td>
                <td>{formatLocalDateTime(flight.departure_at, flight.from_utc_offset_minutes)}</td>
                <td>{formatLocalDateTime(flight.arrival_at, flight.to_utc_offset_minutes)}</td>
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
