import type { FC } from "hono/jsx";
import { CockpitAttendeeListSection } from "../components/CockpitAttendeeListSection.js";
import { getTranslations, type Locale } from "../i18n.js";
import type { AttendeeRecord, FlightRecord } from "../repository.js";
import { Layout } from "./Layout.js";

interface AttendeeWithFlights {
  attendee: AttendeeRecord;
  flights: FlightRecord[];
}

export const CockpitPage: FC<{ attendees: AttendeeWithFlights[]; locale: Locale }> = ({ attendees, locale }) => {
  const t = getTranslations(locale);
  return (
    <Layout locale={locale} currentPath="/cockpit">
      <h1>{t.cockpitPage.title}</h1>

      <section class="card mb-3">
        <h2>{t.cockpitPage.createNew}</h2>
        <form hx-post="/cockpit/attendees" hx-target="#cockpit-attendees" hx-swap="outerHTML">
          <label>
            {t.cockpitPage.name}:
            <input type="text" name="name" required placeholder={t.cockpitPage.namePlaceholder} />
          </label>
          <button type="submit">{t.cockpitPage.createButton}</button>
        </form>
      </section>

      <CockpitAttendeeListSection attendees={attendees} locale={locale} />
    </Layout>
  );
};
