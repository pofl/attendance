import type { FC } from "hono/jsx";
import { AttendeeForm } from "../components/AttendeeForm.js";
import { AttendeeFlightsSection } from "../components/AttendeeFlightsSection.js";
import { getTranslations, type Locale } from "../i18n.js";
import type { AttendeeRecord, FlightRecord } from "../repository.js";
import { Layout } from "./Layout.js";

export const AttendeePage: FC<{ attendee: AttendeeRecord; flights: FlightRecord[]; allFlights: FlightRecord[]; locale: Locale }> = ({ attendee, flights, allFlights, locale }) => {
  const t = getTranslations(locale);
  return (
    <Layout locale={locale} currentPath={`/attendees/${encodeURIComponent(attendee.name)}`}>
      <h1>{t.attendeePage.title}: {attendee.name}</h1>
      <article class="card">
        <h2>{t.attendeeForm.editTitle}: {attendee.name}</h2>
        <AttendeeForm attendee={attendee} locale={locale} />
      </article>
      <AttendeeFlightsSection attendee={attendee} flights={flights} allFlights={allFlights} locale={locale} />
    </Layout>
  );
};
