import type { Database } from "better-sqlite3";
import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { z } from "zod";
import { AttendeeFlightsSection } from "../components/AttendeeFlightsSection.js";
import { Layout } from "../components/Layout.js";
import { getLocale, getTranslations, type Locale } from "../i18n.js";
import {
  addPassengerToFlight,
  getAllFlights,
  getAttendeeByUsername,
  getFlightsForAttendee,
  removePassengerFromFlight,
  upsertAttendee,
  type Attendee,
  type AttendeeRecord,
  type FlightRecord,
} from "../repository.js";
import { getCurrentUser } from "../utils/authz.js";
import { zValidator } from "../validator-wrapper.js";

// ── Components ──

const AttendeeForm: FC<{ attendee: AttendeeRecord; locale?: string }> = ({ attendee, locale }) => {
  const t = getTranslations(locale ?? attendee.locale ?? "en_US").attendeeForm;
  const submitPath = `/attendees/${encodeURIComponent(attendee.name)}`;
  return (
    <form hx-put={submitPath} hx-swap="outerHTML">
      <label>
        {t.locale}:
        <select name="locale">
          <option value="en_US" selected={attendee.locale === "en_US"}>
            English (US)
          </option>
          <option value="de_DE" selected={attendee.locale === "de_DE"}>
            Deutsch
          </option>
        </select>
      </label>

      <label>
        {t.passportStatus}:
        <select name="passport_status" value={attendee.passport_status}>
          <option value="valid" selected={attendee.passport_status === "valid"}>
            {t.passportOptions.valid}
          </option>
          <option value="pending" selected={attendee.passport_status === "pending"}>
            {t.passportOptions.pending}
          </option>
          <option value="none" selected={attendee.passport_status === "none"}>
            {t.passportOptions.none}
          </option>
        </select>
      </label>

      <label>
        {t.visaStatus}:
        <select name="visa_status" value={attendee.visa_status}>
          <option value="obtained" selected={attendee.visa_status === "obtained"}>
            {t.visaOptions.obtained}
          </option>
          <option value="pending" selected={attendee.visa_status === "pending"}>
            {t.visaOptions.pending}
          </option>
          <option value="none" selected={attendee.visa_status === "none"}>
            {t.visaOptions.none}
          </option>
        </select>
      </label>

      <label>
        {t.dietaryRequirements}:<textarea name="dietary_requirements">{attendee.dietary_requirements ?? ""}</textarea>
      </label>

      <button type="submit">{t.save}</button>
    </form>
  );
};

const AttendeePage: FC<{
  attendee: AttendeeRecord;
  flights: FlightRecord[];
  allFlights: FlightRecord[];
  locale: Locale;
  currentPath: string;
  isSuperUser: boolean;
}> = ({ attendee, flights, allFlights, locale, currentPath, isSuperUser }) => {
  const t = getTranslations(locale);
  return (
    <Layout locale={locale} currentPath={currentPath} isSuperUser={isSuperUser}>
      <h1>
        {t.attendeePage.title}: {attendee.name}
      </h1>
      <article class="card">
        <h2>
          {t.attendeeForm.editTitle}: {attendee.name}
        </h2>
        <AttendeeForm attendee={attendee} locale={locale} />
      </article>
      <AttendeeFlightsSection attendee={attendee} flights={flights} allFlights={allFlights} locale={locale} />
    </Layout>
  );
};

// ── Schemas ──

const usernameParamSchema = z.object({
  username: z.string().trim().min(1),
});

const attendeeUpdateFormSchema = z.object({
  locale: z.enum(["en_US", "de_DE"]),
  passport_status: z.enum(["valid", "pending", "none"]),
  visa_status: z.enum(["obtained", "pending", "none"]),
  dietary_requirements: z.string().optional(),
});

const flightIdParamSchema = z.object({
  flightId: z.coerce.number().int().positive(),
});

const flightAssignmentFormSchema = z.object({
  flight_id: z.coerce.number().int().positive(),
});

// ── Routes (mounted at /attendees) ──

export const createAttendeeRoutes = (db: Database) => {
  const app = new Hono();

  app.get("/:username", zValidator("param", usernameParamSchema), async (c) => {
    const user = getCurrentUser(c);
    const { username } = c.req.valid("param");
    const canAccess = user.is_superuser || user.username === username;
    if (!canAccess) {
      return c.redirect("/me");
    }

    const locale = getLocale(c);
    const t = getTranslations(locale);
    try {
      const attendee = getAttendeeByUsername(db, username);
      if (!attendee) {
        return c.html(
          <Layout locale={locale} currentPath={`/attendees/${encodeURIComponent(username)}`} isSuperUser>
            <h1>{t.attendeePage.notFoundTitle}</h1>
            <p class="error">
              {t.attendeePage.notFoundMessage}: {username}
            </p>
          </Layout>,
          404
        );
      }
      const flights = getFlightsForAttendee(db, attendee.id);
      const allFlights = getAllFlights(db);
      return c.html(
        <AttendeePage
          attendee={attendee}
          flights={flights}
          allFlights={allFlights}
          locale={locale}
          currentPath={`/attendees/${encodeURIComponent(username)}`}
          isSuperUser={user.is_superuser}
        />
      );
    } catch (e) {
      console.error(e);
      return c.html(
        <Layout locale={locale} currentPath={`/attendees/${encodeURIComponent(username)}`} isSuperUser>
          <p class="error">{t.common.error}</p>
        </Layout>,
        500
      );
    }
  });

  app.put(
    "/:username",
    zValidator("param", usernameParamSchema),
    zValidator("form", attendeeUpdateFormSchema),
    async (c) => {
      const user = getCurrentUser(c);
      const { username } = c.req.valid("param");
      const canAccess = user.is_superuser || user.username === username;
      if (!canAccess) {
        return c.redirect("/me");
      }

      const locale = getLocale(c);
      const t = getTranslations(locale);
      try {
        const formData = c.req.valid("form");
        const existing = getAttendeeByUsername(db, username);
        if (!existing) {
          return c.html(<p class="error">{t.common.notFound}</p>, 404);
        }

        const attendee: Attendee = {
          user_id: existing.user_id,
          name: username,
          locale: formData.locale,
          passport_status: formData.passport_status,
          visa_status: formData.visa_status,
          dietary_requirements: formData.dietary_requirements?.trim() || null,
        };

        upsertAttendee(db, attendee);

        const updated = getAttendeeByUsername(db, username);
        if (!updated) {
          return c.html(<p class="error">{t.common.error}</p>, 500);
        }
        return c.html(<AttendeeForm attendee={updated} locale={locale} />);
      } catch (e) {
        console.error(e);
        return c.html(<p class="error">{t.common.error}</p>, 500);
      }
    }
  );

  app.post(
    "/:username/flights",
    zValidator("param", usernameParamSchema),
    zValidator("form", flightAssignmentFormSchema),
    async (c) => {
      const user = getCurrentUser(c);
      const { username } = c.req.valid("param");
      const canAccess = user.is_superuser || user.username === username;
      if (!canAccess) {
        return c.redirect("/me");
      }

      const locale = getLocale(c);
      const t = getTranslations(locale);
      try {
        const attendee = getAttendeeByUsername(db, username);
        if (!attendee) {
          return c.html("", 404);
        }
        const { flight_id: flightId } = c.req.valid("form");
        addPassengerToFlight(db, flightId, attendee.id);
        const flights = getFlightsForAttendee(db, attendee.id);
        const allFlights = getAllFlights(db);
        return c.html(
          <AttendeeFlightsSection attendee={attendee} flights={flights} allFlights={allFlights} locale={locale} />
        );
      } catch (e) {
        console.error(e);
        const attendee = getAttendeeByUsername(db, username);
        if (!attendee) {
          return c.html("", 404);
        }
        const flights = getFlightsForAttendee(db, attendee.id);
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

  app.post(
    "/:username/flights/:flightId/remove",
    zValidator("param", usernameParamSchema.merge(flightIdParamSchema)),
    async (c) => {
      const user = getCurrentUser(c);
      const { username, flightId } = c.req.valid("param");
      const canAccess = user.is_superuser || user.username === username;
      if (!canAccess) {
        return c.redirect("/me");
      }

      const locale = getLocale(c);
      const t = getTranslations(locale);
      try {
        const attendee = getAttendeeByUsername(db, username);
        if (!attendee) {
          return c.html("", 404);
        }
        removePassengerFromFlight(db, flightId, attendee.id);
        const flights = getFlightsForAttendee(db, attendee.id);
        const allFlights = getAllFlights(db);
        return c.html(
          <AttendeeFlightsSection attendee={attendee} flights={flights} allFlights={allFlights} locale={locale} />
        );
      } catch (e) {
        console.error(e);
        const attendee = getAttendeeByUsername(db, username);
        if (!attendee) {
          return c.html("", 404);
        }
        const flights = getFlightsForAttendee(db, attendee.id);
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

  app.post("/:username/delete", zValidator("param", usernameParamSchema), async (c) => {
    const locale = getLocale(c);
    const t = getTranslations(locale);
    try {
      return c.html(<p class="error">{t.common.notFound}</p>, 404);
    } catch (e) {
      console.error(e);
      const username = c.req.param("username");
      return c.html(
        <Layout locale={locale} currentPath={`/attendees/${encodeURIComponent(username)}`}>
          <p class="error">{t.common.error}</p>
        </Layout>,
        500
      );
    }
  });

  return app;
};

export const createMeRoutes = (db: Database) => {
  const app = new Hono();

  app.get("/me", async (c) => {
    const user = getCurrentUser(c);
    return c.redirect(`/attendees/${encodeURIComponent(user.username)}`);
  });

  return app;
};
