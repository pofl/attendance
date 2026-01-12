import { jsx as _jsx } from "hono/jsx/jsx-runtime";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";
import { Hono } from "hono";
import postgres from "postgres";
import { AttendeeForm } from "./components/index.js";
import { AttendeePage, CockpitPage, IndexPage, Layout } from "./pages/index.js";
import { getAllAttendees, getAttendeeByName, upsertAttendee } from "./repository.js";
config();
const db = postgres(process.env.PG_URI);
const app = new Hono();
app.use("/static/*", serveStatic({ root: "./public", rewriteRequestPath: (path) => path.replace(/^\/static/, "") }));
app.get("/", (c) => {
    const messages = ["Good Morning", "Good Evening", "Good Night"];
    return c.html(_jsx(IndexPage, { messages: messages }));
});
app.get("/hello", (c) => {
    return c.html(_jsx("p", { children: "\"Hello Hono!\"" }));
});
app.get("/part/attendee/:name", async (c) => {
    const name = c.req.param("name");
    try {
        const attendee = await getAttendeeByName(db, name);
        const record = attendee ?? {
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
        return c.html(_jsx(AttendeeForm, { attendee: record }));
    }
    catch (e) {
        console.error(e);
        return c.html(_jsx("p", { children: "Error loading attendee" }), 500);
    }
});
app.put("/attendees/:name", async (c) => {
    const name = c.req.param("name");
    try {
        const formData = await c.req.parseBody();
        const attendee = {
            name,
            locale: formData.locale,
            arrival_date: formData.arrival_date ? new Date(formData.arrival_date) : null,
            arrival_flight: formData.arrival_flight || null,
            departure_date: formData.departure_date ? new Date(formData.departure_date) : null,
            departure_flight: formData.departure_flight || null,
            passport_status: formData.passport_status,
            visa_status: formData.visa_status,
            dietary_requirements: formData.dietary_requirements || null,
        };
        await upsertAttendee(db, attendee);
        // Fetch updated record and return the form
        const updated = await getAttendeeByName(db, name);
        if (!updated) {
            return c.html(_jsx("p", { children: "Error: attendee not found after update" }), 500);
        }
        return c.html(_jsx(AttendeeForm, { attendee: updated }));
    }
    catch (e) {
        console.error(e);
        return c.html(_jsx("p", { children: "Error saving attendee" }), 500);
    }
});
app.get("/attendee/:name", async (c) => {
    const name = c.req.param("name");
    try {
        const attendee = await getAttendeeByName(db, name);
        const record = attendee ?? {
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
        return c.html(_jsx(AttendeePage, { attendee: record }));
    }
    catch (e) {
        console.error(e);
        return c.html(_jsx(Layout, { children: _jsx("p", { children: "Error loading attendee" }) }), 500);
    }
});
app.get("/cockpit", async (c) => {
    try {
        const attendees = await getAllAttendees(db);
        return c.html(_jsx(CockpitPage, { attendees: attendees }));
    }
    catch (e) {
        console.error(e);
        return c.html(_jsx(Layout, { children: _jsx("p", { children: "Error loading attendees" }) }), 500);
    }
});
serve({
    fetch: app.fetch,
    port: 3000,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
