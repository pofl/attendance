import type { FC } from "hono/jsx";
import { FlightManageFlightsSection } from "../components/FlightManageFlightsSection.js";
import { getTranslations, type Locale } from "../i18n.js";
import type { FlightRecord } from "../repository.js";
import { Layout } from "./Layout.js";

export const FlightManagePage: FC<{ locale: Locale; flights: FlightRecord[] }> = ({ locale, flights }) => {
  const t = getTranslations(locale).flightManagePage;
  const flightLabels = getTranslations(locale).flightForm;

  return (
    <Layout locale={locale} currentPath="/flights/manage">
      <h1>{t.title}</h1>

      <section class="card mb-3">
        <h2>{t.addFlightTitle}</h2>
        <form
          class="grid-2"
          x-data="{ mode: 'fields' }"
          hx-post="/flights"
          hx-target="#flight-manage-list"
          hx-swap="outerHTML"
        >
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

      <FlightManageFlightsSection locale={locale} flights={flights} />
    </Layout>
  );
};
