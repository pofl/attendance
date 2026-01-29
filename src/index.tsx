import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { AttendeeForm } from "./components/index.js";
import { openDatabase } from "./db.js";
import { DEFAULT_LOCALE, getTranslations, isValidLocale, type Locale } from "./i18n.js";
import {
  AttendeePage,
  CockpitPage,
  FlightManagePage,
  FlightPassengersPage,
  FlightsOverviewPage,
  IndexPage,
  Layout,
} from "./pages/index.js";
import {
  addPassengerToFlight,
  deleteFlight,
  getAllAttendees,
  getAllFlights,
  getAttendeeByName,
  getFlightAggregates,
  getFlightById,
  getFlightsForAttendee,
  getPassengersForFlight,
  removePassengerFromFlight,
  updateFlightById,
  upsertAttendee,
  upsertFlight,
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

const parseOffsetMinutesFromIso = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (raw.endsWith("Z")) return 0;
  const match = raw.match(/([+-])(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, sign, hours, minutes] = match;
  const total = Number(hours) * 60 + Number(minutes);
  return sign === "-" ? -total : total;
};

const parseFlightFromPayload = (payload: Record<string, unknown>): Flight | null => {
  const flightNumber = (payload.flight_number as string | undefined)?.trim();
  const fromAirport = (payload.from_airport as string | undefined)?.trim();
  const toAirport = (payload.to_airport as string | undefined)?.trim();
  const fromOffset =
    parseOffsetMinutes(payload.from_utc_offset_minutes) ??
    parseOffsetMinutesFromIso(payload.departure_local) ??
    null;
  const toOffset =
    parseOffsetMinutes(payload.to_utc_offset_minutes) ??
    parseOffsetMinutesFromIso(payload.arrival_local) ??
    null;

  const departureAtDirect = toUtcIsoString(payload.departure_at);
  const arrivalAtDirect = toUtcIsoString(payload.arrival_at);
  const departureAt =
    departureAtDirect ??
    toUtcIsoString(payload.departure_local) ??
    toUtcIsoStringWithOffset(payload.departure_local, fromOffset);
  const arrivalAt =
    arrivalAtDirect ??
    toUtcIsoString(payload.arrival_local) ??
    toUtcIsoStringWithOffset(payload.arrival_local, toOffset);

  if (!flightNumber || !fromAirport || !toAirport || fromOffset === null || toOffset === null || !departureAt || !arrivalAt) {
    return null;
  }

  return {
    flight_number: flightNumber,
    from_airport: fromAirport,
    to_airport: toAirport,
    from_utc_offset_minutes: fromOffset,
    to_utc_offset_minutes: toOffset,
    departure_at: departureAt,
    arrival_at: arrivalAt,
  };
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
    const flights = getFlightsForAttendee(db, attendee.id);
    const allFlights = getAllFlights(db);
    return c.html(<AttendeePage attendee={attendee} flights={flights} allFlights={allFlights} locale={locale} />);
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
    const attendeesWithFlights = attendees.map((attendee) => ({
      attendee,
      flights: getFlightsForAttendee(db, attendee.id),
    }));
    return c.html(<CockpitPage attendees={attendeesWithFlights} locale={locale} />);
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

app.post("/cockpit/attendees/:id/flights", async (c) => {
  try {
    const attendeeId = Number(c.req.param("id"));
    if (!Number.isFinite(attendeeId)) {
      return c.redirect("/cockpit");
    }
    const formData = await c.req.parseBody();
    const flightId = Number(formData.flight_id);
    if (!Number.isFinite(flightId)) {
      return c.redirect("/cockpit");
    }
    addPassengerToFlight(db, flightId, attendeeId);
    return c.redirect("/cockpit");
  } catch (e) {
    console.error(e);
    return c.redirect("/cockpit");
  }
});

app.post("/cockpit/attendees/:id/flights/:flightId/remove", async (c) => {
  try {
    const attendeeId = Number(c.req.param("id"));
    const flightId = Number(c.req.param("flightId"));
    if (!Number.isFinite(attendeeId) || !Number.isFinite(flightId)) {
      return c.redirect("/cockpit");
    }
    removePassengerFromFlight(db, flightId, attendeeId);
    return c.redirect("/cockpit");
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

app.get("/flights/manage", async (c) => {
  const locale = getLocale(c);
  const t = getTranslations(locale);
  try {
    const flights = getAllFlights(db);
    return c.html(<FlightManagePage flights={flights} locale={locale} />);
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout locale={locale} currentPath="/flights/manage">
        <p class="error">{t.common.error}</p>
      </Layout>,
      500
    );
  }
});

app.post("/flights", async (c) => {
  const locale = getLocale(c);
  const t = getTranslations(locale);
  try {
    const formData = await c.req.parseBody();
    const jsonPayload = typeof formData.flight_json === "string" ? formData.flight_json.trim() : "";
    let flight: Flight | null = null;

    if (jsonPayload) {
      try {
        const parsed = JSON.parse(jsonPayload) as Record<string, unknown>;
        flight = parseFlightFromPayload(parsed);
      } catch (error) {
        console.error("Invalid flight JSON:", error);
      }
    }

    if (!flight) {
      flight = parseFlightFromPayload(formData as Record<string, unknown>);
    }

    if (!flight) {
      return c.html(
        <Layout locale={locale} currentPath="/flights/manage">
          <p class="error">{t.common.error}</p>
        </Layout>,
        400
      );
    }
    upsertFlight(db, flight);
    return c.redirect("/flights/manage");
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout locale={locale} currentPath="/flights/manage">
        <p class="error">{t.common.error}</p>
      </Layout>,
      500
    );
  }
});

app.post("/flights/:id", async (c) => {
  const locale = getLocale(c);
  const t = getTranslations(locale);
  try {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) {
      return c.redirect("/flights/manage");
    }

    const formData = await c.req.parseBody();
    const flight = parseFlightFromPayload(formData as Record<string, unknown>);

    if (!flight) {
      return c.html(
        <Layout locale={locale} currentPath="/flights/manage">
          <p class="error">{t.common.error}</p>
        </Layout>,
        400
      );
    }
    updateFlightById(db, id, flight);
    return c.redirect("/flights/manage");
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout locale={locale} currentPath="/flights/manage">
        <p class="error">{t.common.error}</p>
      </Layout>,
      500
    );
  }
});

app.post("/flights/:id/delete", async (c) => {
  const locale = getLocale(c);
  const t = getTranslations(locale);
  try {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) {
      return c.redirect("/flights/manage");
    }
    deleteFlight(db, id);
    return c.redirect("/flights/manage");
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout locale={locale} currentPath="/flights/manage">
        <p class="error">{t.common.error}</p>
      </Layout>,
      500
    );
  }
});


app.get("/flights/:id/passengers", async (c) => {
  const locale = getLocale(c);
  const t = getTranslations(locale);
  try {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) {
      return c.redirect("/flights/manage");
    }
    const flight = getFlightById(db, id);
    if (!flight) {
      return c.html(
        <Layout locale={locale} currentPath="/flights/manage">
          <p class="error">{t.common.notFound}</p>
        </Layout>,
        404
      );
    }
    const attendees = getAllAttendees(db);
    const passengers = getPassengersForFlight(db, id);
    return c.html(
      <FlightPassengersPage
        locale={locale}
        flight={flight}
        attendees={attendees}
        passengers={passengers}
      />
    );
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout locale={locale} currentPath="/flights/manage">
        <p class="error">{t.common.error}</p>
      </Layout>,
      500
    );
  }
});

app.post("/flights/:id/passengers", async (c) => {
  const locale = getLocale(c);
  const t = getTranslations(locale);
  try {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id)) {
      return c.redirect("/flights/manage");
    }
    const formData = await c.req.parseBody();
    const attendeeId = Number(formData.attendee_id);
    if (!Number.isFinite(attendeeId)) {
      return c.redirect(`/flights/${id}/passengers`);
    }
    addPassengerToFlight(db, id, attendeeId);
    return c.redirect(`/flights/${id}/passengers`);
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout locale={locale} currentPath="/flights/manage">
        <p class="error">{t.common.error}</p>
      </Layout>,
      500
    );
  }
});

app.post("/flights/:id/passengers/:attendeeId/remove", async (c) => {
  const locale = getLocale(c);
  const t = getTranslations(locale);
  try {
    const flightId = Number(c.req.param("id"));
    const attendeeId = Number(c.req.param("attendeeId"));
    if (!Number.isFinite(flightId) || !Number.isFinite(attendeeId)) {
      return c.redirect("/flights/manage");
    }
    removePassengerFromFlight(db, flightId, attendeeId);
    return c.redirect(`/flights/${flightId}/passengers`);
  } catch (e) {
    console.error(e);
    return c.html(
      <Layout locale={locale} currentPath="/flights/manage">
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
