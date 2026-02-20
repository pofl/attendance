import type { Database } from "better-sqlite3";
import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { z } from "zod";
import { createUser } from "../auth.js";
import { AttendeeFlightsSection } from "../components/AttendeeFlightsSection.js";
import { Layout } from "../components/Layout.js";
import { getLocale, getTranslations, type Locale } from "../i18n.js";
import {
  addPassengerToFlight,
  createDefaultAttendeeForUser,
  getAllAttendees,
  getAllFlights,
  getAttendeeById,
  getFlightsForAttendee,
  removePassengerFromFlight,
  type AttendeeRecord,
  type FlightRecord,
} from "../repository.js";
import { idParamSchema } from "../schemas.js";
import { getCurrentUser } from "../utils/authz.js";
import { formatArrivalDateTime, formatDepartureDateTime } from "../utils/flightFormat.js";
import { zValidator } from "../validator-wrapper.js";

// ── Components ──

interface AttendeeWithFlights {
  attendee: AttendeeRecord;
  flights: FlightRecord[];
}

const AttendeeAccordion: FC<{
  attendee: AttendeeRecord;
  flights: FlightRecord[];
  locale: Locale;
}> = ({ attendee, flights, locale }) => {
  const t = getTranslations(locale);

  return (
    <details key={attendee.id} class="accordion">
      <summary class="accordion-header">
        <div class="grow">{attendee.name}</div>{" "}
        <a href={`/attendees/${encodeURIComponent(attendee.name)}`}>
          <button>Open</button>
        </a>
      </summary>
      <div class="accordion-content">
        <section>
          <h3>{t.attendeeForm.editTitle}</h3>
          <ul>
            <li>
              <strong>{t.attendeeForm.locale}:</strong> {attendee.locale}
            </li>
            <li>
              <strong>{t.attendeeForm.passportStatus}:</strong>{" "}
              {t.attendeeForm.passportOptions[attendee.passport_status]}
            </li>
            <li>
              <strong>{t.attendeeForm.visaStatus}:</strong> {t.attendeeForm.visaOptions[attendee.visa_status]}
            </li>
            <li>
              <strong>{t.attendeeForm.dietaryRequirements}:</strong> {attendee.dietary_requirements ?? "-"}
            </li>
          </ul>
        </section>
        <section class="mt-2">
          <h3>{t.cockpitPage.flightsTitle}</h3>
          {flights.length === 0 ? (
            <p class="text-muted">{t.cockpitPage.flightsNone}</p>
          ) : (
            <table class="table">
              <thead>
                <tr>
                  <th>{t.cockpitPage.flightsFlight}</th>
                  <th>{t.cockpitPage.flightsRoute}</th>
                  <th>{t.cockpitPage.flightsDeparture}</th>
                  <th>{t.cockpitPage.flightsArrival}</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((flight) => (
                  <tr key={flight.id}>
                    <td>{flight.flight_number}</td>
                    <td>
                      {flight.from_airport} → {flight.to_airport}
                    </td>
                    <td>{formatDepartureDateTime(flight.departure_at, flight.from_utc_offset_minutes)}</td>
                    <td>{formatArrivalDateTime(flight.arrival_at, flight.to_utc_offset_minutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </details>
  );
};

const CockpitAttendeeListSection: FC<{
  attendees: AttendeeWithFlights[];
  locale: Locale;
  message?: string | null;
  messageType?: "success" | "error";
}> = ({ attendees, locale, message, messageType = "success" }) => {
  const t = getTranslations(locale);
  const messageClass = messageType === "error" ? "error" : "text-success";

  return (
    <section id="cockpit-attendees" class="mt-2">
      <h2>
        {t.cockpitPage.existingAttendees} ({attendees.length})
      </h2>
      {message && <p class={messageClass}>{message}</p>}
      {attendees.length === 0 ? (
        <p>{t.cockpitPage.noAttendees}</p>
      ) : (
        attendees.map(({ attendee, flights }) => (
          <AttendeeAccordion key={attendee.id} attendee={attendee} flights={flights} locale={locale} />
        ))
      )}
    </section>
  );
};

const CockpitPage: FC<{ attendees: AttendeeWithFlights[]; locale: Locale }> = ({ attendees, locale }) => {
  const t = getTranslations(locale);
  return (
    <Layout locale={locale} currentPath="/cockpit" isSuperUser>
      <h1>{t.cockpitPage.title}</h1>

      <section class="card mb-3">
        <h2>{t.cockpitPage.createNew}</h2>
        <form hx-post="/cockpit/users" hx-target="#cockpit-attendees" hx-swap="outerHTML">
          <label>
            {t.cockpitPage.username}:
            <input type="text" name="username" required placeholder={t.cockpitPage.usernamePlaceholder} />
          </label>
          <label>
            {t.cockpitPage.password}:
            <input type="password" name="password" required placeholder={t.cockpitPage.passwordPlaceholder} />
          </label>
          <button type="submit">{t.cockpitPage.createButton}</button>
        </form>
      </section>

      <CockpitAttendeeListSection attendees={attendees} locale={locale} />
    </Layout>
  );
};

// ── Schemas ──

const flightIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  flightId: z.coerce.number().int().positive(),
});

const flightAssignmentFormSchema = z.object({
  flight_id: z.coerce.number().int().positive(),
});

const userCreateFormSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

// ── Helpers ──

const buildCockpitAttendeeList = (
  db: Database,
  locale: Locale,
  message?: string,
  messageType?: "success" | "error"
) => {
  const attendees = getAllAttendees(db);
  const attendeesWithFlights = attendees.map((attendee) => ({
    attendee,
    flights: getFlightsForAttendee(db, attendee.id),
  }));
  return (
    <CockpitAttendeeListSection
      attendees={attendeesWithFlights}
      locale={locale}
      message={message}
      messageType={messageType}
    />
  );
};

// ── Routes (mounted at /cockpit) ──

export const createCockpitRoutes = (db: Database) => {
  const app = new Hono();

  app.get("/", async (c) => {
    const locale = getLocale(c);
    const t = getTranslations(locale);
    const user = getCurrentUser(c);
    if (!user.is_superuser) {
      return c.redirect("/me");
    }

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
        <Layout locale={locale} currentPath="/cockpit" isSuperUser={user.is_superuser}>
          <p class="error">{t.common.error}</p>
        </Layout>,
        500
      );
    }
  });

  app.post("/users", zValidator("form", userCreateFormSchema), async (c) => {
    const locale = getLocale(c);
    const currentUser = getCurrentUser(c);
    const t = getTranslations(locale);
    if (!currentUser.is_superuser) {
      return c.redirect("/me");
    }

    const { username, password } = c.req.valid("form");
    try {
      const createdUser = createUser(db, username, password, false);
      createDefaultAttendeeForUser(db, createdUser.id, createdUser.username);
      return c.html(buildCockpitAttendeeList(db, locale, t.cockpitPage.userCreated, "success"));
    } catch (e) {
      console.error(e);
      return c.html(buildCockpitAttendeeList(db, locale, t.cockpitPage.userCreateFailed, "error"), 500);
    }
  });

  app.post(
    "/attendees/:id/flights",
    zValidator("param", idParamSchema),
    zValidator("form", flightAssignmentFormSchema),
    async (c) => {
      const locale = getLocale(c);
      const t = getTranslations(locale);
      const user = getCurrentUser(c);
      if (!user.is_superuser) {
        return c.redirect("/me");
      }

      try {
        const { id: attendeeId } = c.req.valid("param");
        const { flight_id: flightId } = c.req.valid("form");
        addPassengerToFlight(db, flightId, attendeeId);
        const attendee = getAttendeeById(db, attendeeId);
        if (!attendee) {
          return c.html("", 404);
        }
        const flights = getFlightsForAttendee(db, attendeeId);
        const allFlights = getAllFlights(db);
        return c.html(
          <AttendeeFlightsSection attendee={attendee} flights={flights} allFlights={allFlights} locale={locale} />
        );
      } catch (e) {
        console.error(e);
        const attendeeId = Number(c.req.param("id"));
        if (!Number.isFinite(attendeeId)) {
          return c.body(null, 500);
        }
        const attendee = getAttendeeById(db, attendeeId);
        if (!attendee) {
          return c.html("", 404);
        }
        const flights = getFlightsForAttendee(db, attendeeId);
        const allFlights = getAllFlights(db);
        return c.html(
          <AttendeeFlightsSection
            attendee={attendee}
            flights={flights}
            allFlights={allFlights}
            locale={locale}
            message={t.common.error}
            messageType="error"
          />,
          500
        );
      }
    }
  );

  app.post("/attendees/:id/flights/:flightId/remove", zValidator("param", flightIdParamSchema), async (c) => {
    const locale = getLocale(c);
    const t = getTranslations(locale);
    const user = getCurrentUser(c);
    if (!user.is_superuser) {
      return c.redirect("/me");
    }

    try {
      const { id: attendeeId, flightId } = c.req.valid("param");
      removePassengerFromFlight(db, flightId, attendeeId);
      const attendee = getAttendeeById(db, attendeeId);
      if (!attendee) {
        return c.html("", 404);
      }
      const flights = getFlightsForAttendee(db, attendeeId);
      const allFlights = getAllFlights(db);
      return c.html(
        <AttendeeFlightsSection attendee={attendee} flights={flights} allFlights={allFlights} locale={locale} />
      );
    } catch (e) {
      console.error(e);
      const attendeeId = Number(c.req.param("id"));
      if (!Number.isFinite(attendeeId)) {
        return c.body(null, 500);
      }
      const attendee = getAttendeeById(db, attendeeId);
      if (!attendee) {
        return c.html("", 404);
      }
      const flights = getFlightsForAttendee(db, attendeeId);
      const allFlights = getAllFlights(db);
      return c.html(
        <AttendeeFlightsSection
          attendee={attendee}
          flights={flights}
          allFlights={allFlights}
          locale={locale}
          message={t.common.error}
          messageType="error"
        />,
        500
      );
    }
  });

  return app;
};
