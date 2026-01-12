import type { FC } from "hono/jsx";
import { AttendeeForm } from "../components/AttendeeForm.js";
import { getTranslations } from "../i18n.js";
import type { AttendeeRecord } from "../repository.js";
import { Layout } from "./Layout.js";

export const AttendeePage: FC<{ attendee: AttendeeRecord }> = ({ attendee }) => {
  const t = getTranslations(attendee.locale ?? "en_US");
  return (
    <Layout>
      <h1>{t.attendeePage.title}: {attendee.name}</h1>
      <AttendeeForm attendee={attendee} />
    </Layout>
  );
};
