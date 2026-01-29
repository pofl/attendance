import type { FC } from "hono/jsx";
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
  locale: Locale;
}> = ({ attendee, flights, locale }) => {
  const t = getTranslations(locale);

  return (
  <details key={attendee.id} class="accordion">
    <summary class="accordion-header"><div class="grow">{attendee.name}</div> <a href={`/attendees/${encodeURIComponent(attendee.name)}`}><button>Open</button></a></summary>
    <div class="accordion-content">
      <section>
        <h3>{t.attendeeForm.editTitle}</h3>
        <ul>
          <li><strong>{t.attendeeForm.locale}:</strong> {attendee.locale}</li>
          <li><strong>{t.attendeeForm.passportStatus}:</strong> {t.attendeeForm.passportOptions[attendee.passport_status]}</li>
          <li><strong>{t.attendeeForm.visaStatus}:</strong> {t.attendeeForm.visaOptions[attendee.visa_status]}</li>
          <li><strong>{t.attendeeForm.dietaryRequirements}:</strong> {attendee.dietary_requirements ?? "-"}</li>
        </ul>
      </section>
      <section class="mt-2">
        <h3>{t.cockpitPage.flightsTitle}</h3>
        {flights.length === 0 ? (
          <p class="text-muted">{t.cockpitPage.flightsNone}</p>
        ) : (
          <table class="table">
            <thead>
              <tr>
                <th>{t.cockpitPage.flightsFlight}</th>
                <th>{t.cockpitPage.flightsRoute}</th>
                <th>{t.cockpitPage.flightsDeparture}</th>
                <th>{t.cockpitPage.flightsArrival}</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  </details>
  );
};

export const CockpitPage: FC<{ attendees: AttendeeWithFlights[]; locale: Locale }> = ({ attendees, locale }) => {
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
            <AttendeeAccordion key={attendee.id} attendee={attendee} flights={flights} locale={locale} />
          ))
        )}
      </section>
    </Layout>
  );
};
