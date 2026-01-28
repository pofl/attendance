import type { FC } from "hono/jsx";
import { AttendeeForm } from "../components/AttendeeForm.js";
import { getTranslations, type Locale } from "../i18n.js";
import type { AttendeeRecord, FlightRecord } from "../repository.js";
import { formatLocalDateTime, formatOffsetLabel } from "../utils/flightFormat.js";
import { Layout } from "./Layout.js";

interface AttendeeWithFlights {
  attendee: AttendeeRecord;
  flights: FlightRecord[];
}


const AttendeeAccordion: FC<{
  attendee: AttendeeRecord;
  flights: FlightRecord[];
  allFlights: FlightRecord[];
  locale: Locale;
}> = ({ attendee, flights, allFlights, locale }) => {
  const t = getTranslations(locale).cockpitPage;
  const assignedIds = new Set(flights.map((flight) => flight.id));
  const availableFlights = allFlights.filter((flight) => !assignedIds.has(flight.id));

  return (
  <details key={attendee.id} class="accordion">
    <summary class="accordion-header"><div class="grow">{attendee.name}</div> <a href={`/attendees/${encodeURIComponent(attendee.name)}`}><button>Open</button></a></summary>
    <div class="accordion-content">
      <AttendeeForm attendee={attendee} locale={locale} />
      <section class="mt-2">
        <h3>{t.flightsTitle}</h3>
        {flights.length === 0 ? (
          <p class="text-muted">{t.flightsNone}</p>
        ) : (
          <table class="table">
            <thead>
              <tr>
                <th>{t.flightsFlight}</th>
                <th>{t.flightsRoute}</th>
                <th>{t.flightsDeparture}</th>
                <th>{t.flightsArrival}</th>
                <th>{t.flightsActions}</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((flight) => (
                <tr key={flight.id}>
                  <td>{flight.flight_number}</td>
                  <td>{flight.from_airport} → {flight.to_airport}</td>
                  <td>
                    {formatLocalDateTime(flight.departure_at, flight.from_utc_offset_minutes)} ({formatOffsetLabel(flight.from_utc_offset_minutes)})
                  </td>
                  <td>
                    {formatLocalDateTime(flight.arrival_at, flight.to_utc_offset_minutes)} ({formatOffsetLabel(flight.to_utc_offset_minutes)})
                  </td>
                  <td>
                    <form method="post" action={`/cockpit/attendees/${attendee.id}/flights/${flight.id}/remove`} class="inline-form">
                      <button type="submit" class="button-secondary">{t.flightsRemove}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div class="mt-2">
          <h4>{t.flightsAddTitle}</h4>
          {availableFlights.length === 0 ? (
            <p class="text-muted">{t.flightsNoAvailable}</p>
          ) : (
            <form method="post" action={`/cockpit/attendees/${attendee.id}/flights`}>
              <label>
                {t.flightsSelectLabel}:
                <select name="flight_id" required>
                  <option value="">{t.flightsSelectPlaceholder}</option>
                  {availableFlights.map((flight) => (
                    <option value={flight.id} key={flight.id}>
                      {flight.flight_number} · {flight.from_airport} → {flight.to_airport} · {formatLocalDateTime(flight.departure_at, flight.from_utc_offset_minutes)} ({formatOffsetLabel(flight.from_utc_offset_minutes)})
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit">{t.flightsAdd}</button>
            </form>
          )}
        </div>
      </section>
    </div>
  </details>
  );
};

export const CockpitPage: FC<{ attendees: AttendeeWithFlights[]; allFlights: FlightRecord[]; locale: Locale }> = ({ attendees, allFlights, locale }) => {
  const t = getTranslations(locale);
  return (
    <Layout locale={locale} currentPath="/cockpit">
      <h1>{t.cockpitPage.title}</h1>

      <section class="card mb-3">
        <h2>{t.cockpitPage.createNew}</h2>
        <form method="post" action="/cockpit/attendees">
          <label>
            {t.cockpitPage.name}:
            <input type="text" name="name" required placeholder={t.cockpitPage.namePlaceholder} />
          </label>
          <button type="submit">{t.cockpitPage.createButton}</button>
        </form>
      </section>

      <section class="mt-2">
        <h2>{t.cockpitPage.existingAttendees} ({attendees.length})</h2>
        {attendees.length === 0 ? (
          <p>{t.cockpitPage.noAttendees}</p>
        ) : (
          attendees.map(({ attendee, flights }) => (
            <AttendeeAccordion key={attendee.id} attendee={attendee} flights={flights} allFlights={allFlights} locale={locale} />
          ))
        )}
      </section>
    </Layout>
  );
};
