import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";
import { Hono } from "hono";
import postgres from "postgres";
import { getAllAttendees, getAttendeeByName, upsertAttendee } from "./repository.js";
config();
const db = postgres(process.env.PG_URI);
const app = new Hono();
app.use("/static/*", serveStatic({ root: "./public", rewriteRequestPath: (path) => path.replace(/^\/static/, "") }));
const Layout = (props) => {
    return (_jsxs("html", { children: [_jsxs("head", { children: [_jsx("meta", { charset: "UTF-8" }), _jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }), _jsx("title", { children: "Attendance" }), _jsx("script", { src: "https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js" }), _jsx("link", { rel: "stylesheet", href: "/static/styles.css" })] }), _jsx("body", { children: props.children })] }));
};
const Top = (props) => {
    return (_jsxs(Layout, { children: [_jsx("h1", { children: "Hello Hono!" }), _jsx("ul", { children: props.messages.map((message) => {
                    return _jsxs("li", { children: [message, "!!"] });
                }) }), _jsx("button", { "hx-get": "/hello", "hx-swap": "afterend", children: "Load" }), _jsx("div", { "hx-get": "/part/attendee/Florian", "hx-trigger": "load", "hx-swap": "innerHTML", children: "Florian" })] }));
};
app.get("/", (c) => {
    const messages = ["Good Morning", "Good Evening", "Good Night"];
    return c.html(_jsx(Top, { messages: messages }));
});
app.get("/hello", (c) => {
    return c.html(_jsx("p", { children: "\"Hello Hono!\"" }));
});
const formatDateForInput = (date) => {
    if (!date)
        return "";
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
};
const AttendeeForm = ({ attendee }) => {
    return (_jsxs("form", { "hx-put": `/attendees/${encodeURIComponent(attendee.name)}`, "hx-swap": "outerHTML", children: [_jsxs("h2", { children: ["Edit Attendee: ", attendee.name] }), _jsxs("label", { children: ["Locale:", _jsx("input", { type: "text", name: "locale", value: attendee.locale, required: true })] }), _jsxs("label", { children: ["Arrival Date:", _jsx("input", { type: "datetime-local", name: "arrival_date", value: formatDateForInput(attendee.arrival_date) })] }), _jsxs("label", { children: ["Arrival Flight:", _jsx("input", { type: "text", name: "arrival_flight", value: attendee.arrival_flight ?? "" })] }), _jsxs("label", { children: ["Departure Date:", _jsx("input", { type: "datetime-local", name: "departure_date", value: formatDateForInput(attendee.departure_date) })] }), _jsxs("label", { children: ["Departure Flight:", _jsx("input", { type: "text", name: "departure_flight", value: attendee.departure_flight ?? "" })] }), _jsxs("label", { children: ["Passport Status:", _jsxs("select", { name: "passport_status", value: attendee.passport_status, children: [_jsx("option", { value: "valid", selected: attendee.passport_status === "valid", children: "Valid" }), _jsx("option", { value: "pending", selected: attendee.passport_status === "pending", children: "Pending" }), _jsx("option", { value: "none", selected: attendee.passport_status === "none", children: "None" })] })] }), _jsxs("label", { children: ["Visa Status:", _jsxs("select", { name: "visa_status", value: attendee.visa_status, children: [_jsx("option", { value: "obtained", selected: attendee.visa_status === "obtained", children: "Obtained" }), _jsx("option", { value: "pending", selected: attendee.visa_status === "pending", children: "Pending" }), _jsx("option", { value: "none", selected: attendee.visa_status === "none", children: "None" })] })] }), _jsxs("label", { children: ["Dietary Requirements:", _jsx("textarea", { name: "dietary_requirements", children: attendee.dietary_requirements ?? "" })] }), _jsx("button", { type: "submit", children: "Save" })] }));
};
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
const AttendeePage = ({ attendee }) => {
    return (_jsxs(Layout, { children: [_jsxs("h1", { children: ["Attendee: ", attendee.name] }), _jsx(AttendeeForm, { attendee: attendee })] }));
};
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
const CockpitPage = ({ attendees }) => {
    return (_jsxs(Layout, { children: [_jsx("h1", { children: "Cockpit - All Attendees" }), attendees.length === 0 ? (_jsx("p", { children: "No attendees found." })) : (attendees.map((attendee) => (_jsx("div", { style: { marginBottom: "2rem" }, children: _jsx(AttendeeForm, { attendee: attendee }) }, attendee.id))))] }));
};
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
