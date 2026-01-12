import type { FC } from "hono/jsx";
import { AttendeeForm } from "../components/AttendeeForm.js";
import { getTranslations, type Locale } from "../i18n.js";
import type { AttendeeRecord } from "../repository.js";
import { Layout } from "./Layout.js";

export const AttendeePage: FC<{ attendee: AttendeeRecord; locale: Locale }> = ({ attendee, locale }) => {
  const t = getTranslations(locale);
  return (
    <Layout locale={locale} currentPath={`/attendees/${encodeURIComponent(attendee.name)}`}>
      <h1>{t.attendeePage.title}: {attendee.name}</h1>
      <AttendeeForm attendee={attendee} locale={locale} />
    </Layout>
  );
};
