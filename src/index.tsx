import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";
import { Hono } from "hono";
import type { FC } from "hono/jsx";
import postgres from "postgres";
import { getAllAttendees, getAttendeeByName, upsertAttendee, type Attendee, type AttendeeRecord } from "./repository.js";

config();
const db = postgres(process.env.PG_URI!);

const app = new Hono();

app.use("/static/*", serveStatic({ root: "./public", rewriteRequestPath: (path) => path.replace(/^\/static/, "") }));

const Layout: FC = (props) => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Attendance</title>
        <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"></script>
        <link rel="stylesheet" href="/static/styles.css"></link>
      </head>
      <body>{props.children}</body>
    </html>
  );
};

const Top: FC<{ messages: string[] }> = (props) => {
  return (
    <Layout>
      <h1>Hello Hono!</h1>
      <ul>
        {props.messages.map((message) => {
          return <li>{message}!!</li>;
        })}
      </ul>
      <button hx-get="/hello" hx-swap="afterend">
        Load
      </button>
      <div hx-get="/part/attendee/Florian" hx-trigger="load" hx-swap="innerHTML">
        Florian
      </div>
    </Layout>
  );
};

app.get("/", (c) => {
  const messages = ["Good Morning", "Good Evening", "Good Night"];
  return c.html(<Top messages={messages} />);
});

app.get("/hello", (c) => {
  return c.html(<p>"Hello Hono!"</p>);
});

const formatDateForInput = (date: Date | null): string => {
  if (!date) return "";
  return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
};

const AttendeeForm: FC<{ attendee: AttendeeRecord }> = ({ attendee }) => {
  return (
    <form hx-put={`/attendees/${encodeURIComponent(attendee.name)}`} hx-swap="outerHTML">
      <h2>Edit Attendee: {attendee.name}</h2>

      <label>
        Locale:
        <input type="text" name="locale" value={attendee.locale} required />
      </label>

      <label>
        Arrival Date:
        <input type="datetime-local" name="arrival_date" value={formatDateForInput(attendee.arrival_date)} />
      </label>

      <label>
        Arrival Flight:
        <input type="text" name="arrival_flight" value={attendee.arrival_flight ?? ""} />
      </label>

      <label>
        Departure Date:
        <input type="datetime-local" name="departure_date" value={formatDateForInput(attendee.departure_date)} />
      </label>

      <label>
        Departure Flight:
        <input type="text" name="departure_flight" value={attendee.departure_flight ?? ""} />
      </label>

      <label>
        Passport Status:
        <select name="passport_status" value={attendee.passport_status}>
          <option value="valid" selected={attendee.passport_status === "valid"}>
            Valid
          </option>
          <option value="pending" selected={attendee.passport_status === "pending"}>
            Pending
          </option>
          <option value="none" selected={attendee.passport_status === "none"}>
            None
          </option>
        </select>
      </label>

      <label>
        Visa Status:
        <select name="visa_status" value={attendee.visa_status}>
          <option value="obtained" selected={attendee.visa_status === "obtained"}>
            Obtained
          </option>
          <option value="pending" selected={attendee.visa_status === "pending"}>
            Pending
          </option>
          <option value="none" selected={attendee.visa_status === "none"}>
            None
          </option>
        </select>
      </label>

      <label>
        Dietary Requirements:
        <textarea name="dietary_requirements">{attendee.dietary_requirements ?? ""}</textarea>
      </label>

      <button type="submit">Save</button>
    </form>
  );
};

app.get("/part/attendee/:name", async (c) => {
  const name = c.req.param("name");
  try {
    const attendee = await getAttendeeByName(db, name);
    const record: AttendeeRecord = attendee ?? {
      id: 0,
      created_at: new Date(),
      updated_at: new Date(),
      name,
      locale: "",
      arrival_date: null,
      arrival_flight: null,
      departure_date: null,
      departure_flight: null,
      passport_status: "none",
      visa_status: "none",
      dietary_requirements: null,
    };
    return c.html(<AttendeeForm attendee={record} />);
  } catch (e) {
    console.error(e);
    return c.html(<p>Error loading attendee</p>, 500);
  }
});

app.put("/attendees/:name", async (c) => {
  const name = c.req.param("name");
  try {
    const formData = await c.req.parseBody();

    const attendee: Attendee = {
      name,
      locale: formData.locale as string,
      arrival_date: formData.arrival_date ? new Date(formData.arrival_date as string) : null,
      arrival_flight: (formData.arrival_flight as string) || null,
      departure_date: formData.departure_date ? new Date(formData.departure_date as string) : null,
      departure_flight: (formData.departure_flight as string) || null,
      passport_status: formData.passport_status as "valid" | "pending" | "none",
      visa_status: formData.visa_status as "obtained" | "pending" | "none",
      dietary_requirements: (formData.dietary_requirements as string) || null,
    };

    await upsertAttendee(db, attendee);

    // Fetch updated record and return the form
    const updated = await getAttendeeByName(db, name);
    if (!updated) {
      return c.html(<p>Error: attendee not found after update</p>, 500);
    }
    return c.html(<AttendeeForm attendee={updated} />);
  } catch (e) {
    console.error(e);
    return c.html(<p>Error saving attendee</p>, 500);
  }
});

const AttendeePage: FC<{ attendee: AttendeeRecord }> = ({ attendee }) => {
  return (
    <Layout>
      <h1>Attendee: {attendee.name}</h1>
      <AttendeeForm attendee={attendee} />
    </Layout>
  );
};

app.get("/attendee/:name", async (c) => {
  const name = c.req.param("name");
  try {
    const attendee = await getAttendeeByName(db, name);
    const record: AttendeeRecord = attendee ?? {
      id: 0,
      created_at: new Date(),
      updated_at: new Date(),
      name,
      locale: "",
      arrival_date: null,
      arrival_flight: null,
      departure_date: null,
      departure_flight: null,
      passport_status: "none",
      visa_status: "none",
      dietary_requirements: null,
    };
    return c.html(<AttendeePage attendee={record} />);
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout>
        <p>Error loading attendee</p>
      </Layout>,
      500
    );
  }
});

const CockpitPage: FC<{ attendees: AttendeeRecord[] }> = ({ attendees }) => {
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

app.get("/cockpit", async (c) => {
  try {
    const attendees = await getAllAttendees(db);
    return c.html(<CockpitPage attendees={attendees} />);
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout>
        <p>Error loading attendees</p>
      </Layout>,
      500
    );
  }
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
