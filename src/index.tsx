import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import postgres from "postgres";
import { AttendeeForm } from "./components/index.js";
import { DEFAULT_LOCALE, getTranslations, isValidLocale, type Locale } from "./i18n.js";
import { AttendeePage, CockpitPage, IndexPage, Layout } from "./pages/index.js";
import { getAllAttendees, getAttendeeByName, upsertAttendee, type Attendee } from "./repository.js";

config();
const db = postgres(process.env.PG_URI!);

const app = new Hono();

// Helper to get locale from cookie
const getLocale = (c: { req: { raw: Request } }): Locale => {
  const locale = getCookie(c as any, "locale");
  return isValidLocale(locale ?? "") ? (locale as Locale) : DEFAULT_LOCALE;
};

app.use("/static/*", serveStatic({ root: "./public", rewriteRequestPath: (path) => path.replace(/^\/static/, "") }));

// Route to set locale preference
app.post("/set-locale", async (c) => {
  const formData = await c.req.parseBody();
  const locale = formData.locale as string;
  const redirect = (formData.redirect as string) || "/";

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
  return c.html(<IndexPage locale={locale} />);
});

app.post("/attendee", async (c) => {
  const formData = await c.req.parseBody();
  const name = (formData.name as string)?.trim();
  if (!name) {
    return c.redirect("/");
  }
  return c.redirect(`/attendees/${encodeURIComponent(name)}`);
});

app.get("/hello", (c) => {
  return c.html(<p>"Hello Hono!"</p>);
});

app.get("/part/attendees/:name", async (c) => {
  const name = c.req.param("name");
  const locale = getLocale(c);
  const t = getTranslations(locale);
  try {
    const attendee = await getAttendeeByName(db, name);
    if (!attendee) {
      return c.html(<p class="error">{t.attendeePage.notFoundMessage}: {name}</p>, 404);
    }
    return c.html(<AttendeeForm attendee={attendee} locale={locale} />);
  } catch (e) {
    console.error(e);
    return c.html(<p class="error">{t.common.error}</p>, 500);
  }
});

app.put("/attendees/:name", async (c) => {
  const name = c.req.param("name");
  const locale = getLocale(c);
  const t = getTranslations(locale);
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
      return c.html(<p class="error">{t.common.error}</p>, 500);
    }
    return c.html(<AttendeeForm attendee={updated} locale={locale} />);
  } catch (e) {
    console.error(e);
    return c.html(<p class="error">{t.common.error}</p>, 500);
  }
});

app.get("/attendees/:name", async (c) => {
  const name = c.req.param("name");
  const locale = getLocale(c);
  const t = getTranslations(locale);
  try {
    const attendee = await getAttendeeByName(db, name);
    if (!attendee) {
      return c.html(
        <Layout locale={locale} currentPath={`/attendees/${encodeURIComponent(name)}`}>
          <h1>{t.attendeePage.notFoundTitle}</h1>
          <p class="error">{t.attendeePage.notFoundMessage}: {name}</p>
        </Layout>,
        404
      );
    }
    return c.html(<AttendeePage attendee={attendee} locale={locale} />);
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout locale={locale} currentPath={`/attendees/${encodeURIComponent(name)}`}>
        <p class="error">{t.common.error}</p>
      </Layout>,
      500
    );
  }
});

app.get("/cockpit", async (c) => {
  const locale = getLocale(c);
  const t = getTranslations(locale);
  try {
    const attendees = await getAllAttendees(db);
    return c.html(<CockpitPage attendees={attendees} locale={locale} />);
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout locale={locale} currentPath="/cockpit">
        <p class="error">{t.common.error}</p>
      </Layout>,
      500
    );
  }
});

app.post("/cockpit/attendees", async (c) => {
  const formData = await c.req.parseBody();
  const name = (formData.name as string)?.trim();
  if (!name) {
    return c.redirect("/cockpit");
  }
  try {
    // Create new attendee with default values
    const attendee: Attendee = {
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
  } catch (e) {
    console.error(e);
    return c.redirect("/cockpit");
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
