import type { FC } from "hono/jsx";
import { AttendeeForm } from "../components/AttendeeForm.js";
import type { AttendeeRecord } from "../repository.js";
import { Layout } from "./Layout.js";

export const CockpitPage: FC<{ attendees: AttendeeRecord[] }> = ({ attendees }) => {
  return (
    <Layout>
      <h1>Cockpit - All Attendees</h1>
      {attendees.length === 0 ? (
        <p>No attendees found.</p>
      ) : (
        attendees.map((attendee) => (
          <div key={attendee.id} style={{ marginBottom: "2rem" }}>
            <AttendeeForm attendee={attendee} />
          </div>
        ))
      )}
    </Layout>
  );
};
