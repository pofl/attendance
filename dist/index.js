import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import postgres from "postgres";
import { AttendeeForm } from "./components/index.js";
import { DEFAULT_LOCALE, getTranslations, isValidLocale } from "./i18n.js";
import { AttendeePage, CockpitPage, IndexPage, Layout } from "./pages/index.js";
import { getAllAttendees, getAttendeeByName, upsertAttendee } from "./repository.js";
config();
const db = postgres(process.env.PG_URI);
const app = new Hono();
// Helper to get locale from cookie
const getLocale = (c) => {
    const locale = getCookie(c, "locale");
    return isValidLocale(locale ?? "") ? locale : DEFAULT_LOCALE;
};
app.use("/static/*", serveStatic({ root: "./public", rewriteRequestPath: (path) => path.replace(/^\/static/, "") }));
// Route to set locale preference
app.post("/set-locale", async (c) => {
    const formData = await c.req.parseBody();
    const locale = formData.locale;
    const redirect = formData.redirect || "/";
    if (isValidLocale(locale)) {
        setCookie(c, "locale", locale, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: "Lax",
        });
    }
    return c.redirect(redirect);
});
app.get("/", (c) => {
    const locale = getLocale(c);
    return c.html(_jsx(IndexPage, { locale: locale }));
});
app.post("/attendee", async (c) => {
    const formData = await c.req.parseBody();
    const name = formData.name?.trim();
    if (!name) {
        return c.redirect("/");
    }
    return c.redirect(`/attendees/${encodeURIComponent(name)}`);
});
app.get("/hello", (c) => {
    return c.html(_jsx("p", { children: "\"Hello Hono!\"" }));
});
app.get("/part/attendees/:name", async (c) => {
    const name = c.req.param("name");
    const locale = getLocale(c);
    const t = getTranslations(locale);
    try {
        const attendee = await getAttendeeByName(db, name);
        if (!attendee) {
            return c.html(_jsxs("p", { class: "error", children: [t.attendeePage.notFoundMessage, ": ", name] }), 404);
        }
        return c.html(_jsx(AttendeeForm, { attendee: attendee, locale: locale }));
    }
    catch (e) {
        console.error(e);
        return c.html(_jsx("p", { class: "error", children: t.common.error }), 500);
    }
});
app.put("/attendees/:name", async (c) => {
    const name = c.req.param("name");
    const locale = getLocale(c);
    const t = getTranslations(locale);
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
            return c.html(_jsx("p", { class: "error", children: t.common.error }), 500);
        }
        return c.html(_jsx(AttendeeForm, { attendee: updated, locale: locale }));
    }
    catch (e) {
        console.error(e);
        return c.html(_jsx("p", { class: "error", children: t.common.error }), 500);
    }
});
app.get("/attendees/:name", async (c) => {
    const name = c.req.param("name");
    const locale = getLocale(c);
    const t = getTranslations(locale);
    try {
        const attendee = await getAttendeeByName(db, name);
        if (!attendee) {
            return c.html(_jsxs(Layout, { locale: locale, currentPath: `/attendees/${encodeURIComponent(name)}`, children: [_jsx("h1", { children: t.attendeePage.notFoundTitle }), _jsxs("p", { class: "error", children: [t.attendeePage.notFoundMessage, ": ", name] })] }), 404);
        }
        return c.html(_jsx(AttendeePage, { attendee: attendee, locale: locale }));
    }
    catch (e) {
        console.error(e);
        return c.html(_jsx(Layout, { locale: locale, currentPath: `/attendees/${encodeURIComponent(name)}`, children: _jsx("p", { class: "error", children: t.common.error }) }), 500);
    }
});
app.get("/cockpit", async (c) => {
    const locale = getLocale(c);
    const t = getTranslations(locale);
    try {
        const attendees = await getAllAttendees(db);
        return c.html(_jsx(CockpitPage, { attendees: attendees, locale: locale }));
    }
    catch (e) {
        console.error(e);
        return c.html(_jsx(Layout, { locale: locale, currentPath: "/cockpit", children: _jsx("p", { class: "error", children: t.common.error }) }), 500);
    }
});
app.post("/cockpit/attendees", async (c) => {
    const formData = await c.req.parseBody();
    const name = formData.name?.trim();
    if (!name) {
        return c.redirect("/cockpit");
    }
    try {
        // Create new attendee with default values
        const attendee = {
            name,
            locale: "en_US",
            arrival_date: null,
            arrival_flight: null,
            departure_date: null,
            departure_flight: null,
            passport_status: "none",
            visa_status: "none",
            dietary_requirements: null,
        };
        await upsertAttendee(db, attendee);
        return c.redirect(`/attendees/${encodeURIComponent(name)}`);
    }
    catch (e) {
        console.error(e);
        return c.redirect("/cockpit");
    }
});
serve({
    fetch: app.fetch,
    port: 3000,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
