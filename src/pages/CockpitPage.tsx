import type { FC } from "hono/jsx";
import { AttendeeForm } from "../components/AttendeeForm.js";
import { getTranslations, type Locale } from "../i18n.js";
import type { AttendeeRecord } from "../repository.js";
import { Layout } from "./Layout.js";

const AttendeeAccordion: FC<{ attendee: AttendeeRecord; locale: Locale }> = ({ attendee, locale }) => (
  <details key={attendee.id} class="accordion">
    <summary class="accordion-header">{attendee.name}</summary>
    <div class="accordion-content">
      <AttendeeForm attendee={attendee} locale={locale} />
    </div>
  </details>
);

const AttendeeList: FC<{ attendees: AttendeeRecord[]; locale: Locale; noAttendeesText: string }> = ({ attendees, locale, noAttendeesText }) => (
  attendees.length === 0 ? (
    <p>{noAttendeesText}</p>
  ) : (
    <>
      {attendees.map((attendee) => (
        <AttendeeAccordion key={attendee.id} attendee={attendee} locale={locale} />
      ))}
    </>
  )
);

export const CockpitPage: FC<{ attendees: AttendeeRecord[]; locale: Locale }> = ({ attendees, locale }) => {
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
          attendees.map((attendee) => (
            <AttendeeAccordion key={attendee.id} attendee={attendee} locale={locale} />
          ))
        )}
      </section>
    </Layout>
  );
};
