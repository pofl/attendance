import type { FC } from "hono/jsx";
import { AttendeeForm } from "../components/AttendeeForm.js";
import type { AttendeeRecord } from "../repository.js";
import { Layout } from "./Layout.js";

export const CockpitPage: FC<{ attendees: AttendeeRecord[] }> = ({ attendees }) => {
  return (
    <Layout>
      <h1>Cockpit - All Attendees</h1>

      <section class="card mb-3">
        <h2>Create New Attendee</h2>
        <form method="post" action="/cockpit/attendees">
          <label>
            Name:
            <input type="text" name="name" required placeholder="Enter attendee name" />
          </label>
          <button type="submit">Create Attendee</button>
        </form>
      </section>

      <section class="mt-2">
        <h2>Existing Attendees ({attendees.length})</h2>
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
      </section>
    </Layout>
  );
};
