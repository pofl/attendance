import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { serve } from "@hono/node-server";
import { config } from "dotenv";
import { Hono } from "hono";
import postgres from "postgres";
import { getAttendeeByName, upsertAttendee } from "./repository.js";
config();
const db = postgres(process.env.PG_URI);
const app = new Hono();
const Layout = (props) => {
    return (_jsxs("html", { children: [_jsxs("head", { children: [_jsx("script", { src: "https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js" }), _jsx("link", { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/water.css@2/out/water.css" })] }), _jsx("body", { children: props.children })] }));
};
const Top = (props) => {
    return (_jsxs(Layout, { children: [_jsx("h1", { children: "Hello Hono!" }), _jsx("ul", { children: props.messages.map((message) => {
                    return _jsxs("li", { children: [message, "!!"] });
                }) }), _jsx("button", { "hx-get": "/hello", "hx-target": "body", "hx-swap": "afterend", children: "Load" })] }));
};
app.get("/", (c) => {
    const messages = ["Good Morning", "Good Evening", "Good Night"];
    return c.html(_jsx(Top, { messages: messages }));
});
app.get("/hello", (c) => {
    return c.html(_jsx("p", { children: "\"Hello Hono!\"" }));
});
app.get("/attendees/:name", async (c) => {
    const name = c.req.param("name");
    try {
        const attendee = await getAttendeeByName(db, name);
        if (!attendee) {
            return c.json({ message: "Attendee not found" }, 404);
        }
        return c.json(attendee);
    }
    catch (e) {
        console.error(e);
        return c.html(_jsx("p", { children: "Error fetching attendee" }), 500);
    }
});
app.put("/attendees/:name", async (c) => {
    const name = c.req.param("name");
    try {
        const body = await c.req.json();
        // Ensure the name in path overrides or matches the body
        const attendee = { ...body, name };
        await upsertAttendee(db, attendee);
        return c.json(attendee);
    }
    catch (e) {
        console.error(e);
        return c.json({ message: "Error upserting attendee" }, 500);
    }
});
serve({
    fetch: app.fetch,
    port: 3000,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
