import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { AttendeeForm } from "./components/index.js";
import { openDatabase } from "./db.js";
import { DEFAULT_LOCALE, getTranslations, isValidLocale, type Locale } from "./i18n.js";
import { AttendeeFlightsPage, AttendeePage, CockpitPage, FlightsOverviewPage, IndexPage, Layout } from "./pages/index.js";
import {
  getAllAttendees,
  getAttendeeByName,
  getFlightAggregates,
  getFlightsForAttendee,
  removePassengerFromFlight,
  upsertAttendee,
  upsertFlightForAttendee,
  type Attendee,
  type Flight,
} from "./repository.js";

config();
const db = openDatabase();

const app = new Hono();

// Helper to get locale from cookie
const getLocale = (c: { req: { raw: Request } }): Locale => {
  const locale = getCookie(c as any, "locale");
  return isValidLocale(locale ?? "") ? (locale as Locale) : DEFAULT_LOCALE;
};

app.use("/static/*", serveStatic({ root: "./public", rewriteRequestPath: (path) => path.replace(/^\/static/, "") }));

const toUtcIsoString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const parseOffsetMinutes = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number(String(value));
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
};

const toUtcIsoStringWithOffset = (value: unknown, offsetMinutes: number | null): string | null => {
  if (value === null || value === undefined) return null;
  if (offsetMinutes === null || Number.isNaN(offsetMinutes)) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  const utcMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  ) - offsetMinutes * 60_000;
  const date = new Date(utcMs);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

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
    const attendee = getAttendeeByName(db, name);
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
      arrival_date: toUtcIsoString(formData.arrival_date),
      arrival_flight: (formData.arrival_flight as string) || null,
      departure_date: toUtcIsoString(formData.departure_date),
      departure_flight: (formData.departure_flight as string) || null,
      passport_status: formData.passport_status as "valid" | "pending" | "none",
      visa_status: formData.visa_status as "obtained" | "pending" | "none",
      dietary_requirements: (formData.dietary_requirements as string) || null,
    };

    upsertAttendee(db, attendee);

    // Fetch updated record and return the form
    const updated = getAttendeeByName(db, name);
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
    const attendee = getAttendeeByName(db, name);
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
    const attendees = getAllAttendees(db);
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
    upsertAttendee(db, attendee);
    return c.redirect(`/attendees/${encodeURIComponent(name)}`);
  } catch (e) {
    console.error(e);
    return c.redirect("/cockpit");
  }
});

app.get("/flights", async (c) => {
  const locale = getLocale(c);
  const t = getTranslations(locale);
  try {
    const flights = getFlightAggregates(db);
    return c.html(<FlightsOverviewPage flights={flights} locale={locale} />);
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout locale={locale} currentPath="/flights">
        <p class="error">{t.common.error}</p>
      </Layout>,
      500
    );
  }
});

app.get("/flights/attendees", async (c) => {
  const locale = getLocale(c);
  const t = getTranslations(locale);
  try {
    const attendees = getAllAttendees(db);
    const attendeesWithFlights = attendees.map((attendee) => ({
      attendee,
      flights: getFlightsForAttendee(db, attendee.id),
    }));
    return c.html(<AttendeeFlightsPage attendees={attendeesWithFlights} locale={locale} />);
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout locale={locale} currentPath="/flights/attendees">
        <p class="error">{t.common.error}</p>
      </Layout>,
      500
    );
  }
});

app.post("/flights/attendees/:name", async (c) => {
  const name = c.req.param("name");
  const locale = getLocale(c);
  const t = getTranslations(locale);
  try {
    const attendee = getAttendeeByName(db, name);
    if (!attendee) {
      return c.html(
        <Layout locale={locale} currentPath="/flights/attendees">
          <p class="error">{t.attendeePage.notFoundMessage}: {name}</p>
        </Layout>,
        404
      );
    }

    const formData = await c.req.parseBody();
    const flightNumber = (formData.flight_number as string)?.trim();
    const fromAirport = (formData.from_airport as string)?.trim();
    const toAirport = (formData.to_airport as string)?.trim();
    const fromOffset = parseOffsetMinutes(formData.from_utc_offset_minutes);
    const toOffset = parseOffsetMinutes(formData.to_utc_offset_minutes);
    const departureAt = toUtcIsoStringWithOffset(formData.departure_local, fromOffset);
    const arrivalAt = toUtcIsoStringWithOffset(formData.arrival_local, toOffset);

    if (!flightNumber || !fromAirport || !toAirport || fromOffset === null || toOffset === null || !departureAt || !arrivalAt) {
      return c.html(
        <Layout locale={locale} currentPath="/flights/attendees">
          <p class="error">{t.common.error}</p>
        </Layout>,
        400
      );
    }

    const flight: Flight = {
      flight_number: flightNumber,
      from_airport: fromAirport,
      to_airport: toAirport,
      from_utc_offset_minutes: fromOffset,
      to_utc_offset_minutes: toOffset,
      departure_at: departureAt,
      arrival_at: arrivalAt,
    };

    upsertFlightForAttendee(db, attendee.id, flight);
    return c.redirect("/flights/attendees");
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout locale={locale} currentPath="/flights/attendees">
        <p class="error">{t.common.error}</p>
      </Layout>,
      500
    );
  }
});

app.post("/flights/attendees/:name/remove", async (c) => {
  const name = c.req.param("name");
  const locale = getLocale(c);
  const t = getTranslations(locale);
  try {
    const attendee = getAttendeeByName(db, name);
    if (!attendee) {
      return c.html(
        <Layout locale={locale} currentPath="/flights/attendees">
          <p class="error">{t.attendeePage.notFoundMessage}: {name}</p>
        </Layout>,
        404
      );
    }

    const formData = await c.req.parseBody();
    const flightId = Number(formData.flight_id);
    if (!Number.isFinite(flightId)) {
      return c.redirect("/flights/attendees");
    }

    removePassengerFromFlight(db, flightId, attendee.id);
    return c.redirect("/flights/attendees");
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout locale={locale} currentPath="/flights/attendees">
        <p class="error">{t.common.error}</p>
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
