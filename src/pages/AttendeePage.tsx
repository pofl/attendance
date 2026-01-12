import type { FC } from "hono/jsx";
import { AttendeeForm } from "../components/AttendeeForm.js";
import type { AttendeeRecord } from "../repository.js";
import { Layout } from "./Layout.js";

export const AttendeePage: FC<{ attendee: AttendeeRecord }> = ({ attendee }) => {
  return (
    <Layout>
      <h1>Attendee: {attendee.name}</h1>
      <AttendeeForm attendee={attendee} />
    </Layout>
  );
};
