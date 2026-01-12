import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";
import { Hono } from "hono";
import postgres from "postgres";
import { AttendeeForm } from "./components/index.js";
import { AttendeePage, CockpitPage, IndexPage, Layout } from "./pages/index.js";
import { getAllAttendees, getAttendeeByName, upsertAttendee, type Attendee, type AttendeeRecord } from "./repository.js";

config();
const db = postgres(process.env.PG_URI!);

const app = new Hono();

app.use("/static/*", serveStatic({ root: "./public", rewriteRequestPath: (path) => path.replace(/^\/static/, "") }));

app.get("/", (c) => {
  const messages = ["Good Morning", "Good Evening", "Good Night"];
  return c.html(<IndexPage messages={messages} />);
});

app.get("/hello", (c) => {
  return c.html(<p>"Hello Hono!"</p>);
});

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
