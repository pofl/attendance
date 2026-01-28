import type { FC } from "hono/jsx";
import { getTranslations, type Locale } from "../i18n.js";
import type { FlightRecord } from "../repository.js";
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

const formatDateForInput = (utcIso: string, offsetMinutes: number): string => {
  const date = new Date(utcIso);
  if (Number.isNaN(date.getTime())) return "";
  const localMs = date.getTime() + offsetMinutes * 60_000;
  const local = new Date(localMs);
  const year = local.getUTCFullYear();
  const month = padTimePart(local.getUTCMonth() + 1);
  const day = padTimePart(local.getUTCDate());
  const hours = padTimePart(local.getUTCHours());
  const minutes = padTimePart(local.getUTCMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const FlightManagePage: FC<{ locale: Locale; flights: FlightRecord[] }> = ({ locale, flights }) => {
  const t = getTranslations(locale).flightManagePage;
  const flightLabels = getTranslations(locale).flightForm;

  return (
    <Layout locale={locale} currentPath="/flights/manage">
      <h1>{t.title}</h1>

      <section class="card mb-3">
        <h2>{t.addFlightTitle}</h2>
        <form method="post" action="/flights" class="grid-2" x-data="{ mode: 'fields' }">
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
                <input type="number" name="from_utc_offset_minutes" placeholder="60" x-bind:disabled="mode !== 'fields'" />
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
                <input type="number" name="to_utc_offset_minutes" placeholder="330" x-bind:disabled="mode !== 'fields'" />
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

      <section>
        <h2>{t.existingFlights} ({flights.length})</h2>
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
                  {formatLocalDateTime(flight.departure_at, flight.from_utc_offset_minutes)} ({formatOffsetLabel(flight.from_utc_offset_minutes)})
                </div>
              </summary>
              <div class="accordion-content">
                <div class="mb-2">
                  <strong>{t.details}</strong>
                  <div class="text-muted">
                    {flight.from_airport} → {flight.to_airport}
                  </div>
                  <div class="text-muted">
                    {t.departure}: {formatLocalDateTime(flight.departure_at, flight.from_utc_offset_minutes)} ({formatOffsetLabel(flight.from_utc_offset_minutes)}) · {t.arrival}: {formatLocalDateTime(flight.arrival_at, flight.to_utc_offset_minutes)} ({formatOffsetLabel(flight.to_utc_offset_minutes)})
                  </div>
                </div>

                <div class="button-row mb-2">
                  <a href={`/flights/${flight.id}/passengers`}><button type="button">{t.managePassengers}</button></a>
                  <form method="post" action={`/flights/${flight.id}/delete`} class="inline-form">
                    <button type="submit" class="button-secondary">{t.delete}</button>
                  </form>
                </div>

                <form method="post" action={`/flights/${flight.id}`} class="grid-2">
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
                    <input type="number" name="from_utc_offset_minutes" required value={String(flight.from_utc_offset_minutes)} />
                  </label>
                  <label>
                    {flightLabels.departureLocal}:
                    <input type="datetime-local" name="departure_local" required value={formatDateForInput(flight.departure_at, flight.from_utc_offset_minutes)} />
                  </label>
                  <label>
                    {flightLabels.toAirport}:
                    <input type="text" name="to_airport" required value={flight.to_airport} />
                  </label>
                  <label>
                    {flightLabels.toOffset}:
                    <input type="number" name="to_utc_offset_minutes" required value={String(flight.to_utc_offset_minutes)} />
                  </label>
                  <label>
                    {flightLabels.arrivalLocal}:
                    <input type="datetime-local" name="arrival_local" required value={formatDateForInput(flight.arrival_at, flight.to_utc_offset_minutes)} />
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
    </Layout>
  );
};
