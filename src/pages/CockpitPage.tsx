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
          <details key={attendee.id} class="accordion">
            <summary class="accordion-header">{attendee.name}</summary>
            <div class="accordion-content">
              <AttendeeForm attendee={attendee} />
            </div>
          </details>
        ))
      )}
    </Layout>
  );
};
