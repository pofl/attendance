import type { Database } from "better-sqlite3";
import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { z } from "zod";
import { AttendeeFlightsSection } from "../components/AttendeeFlightsSection.js";
import { Layout } from "../components/Layout.js";
import { getLocale, getTranslations, type Locale } from "../i18n.js";
import {
  deleteAttendeeByName,
  getAllFlights,
  getAttendeeByName,
  getFlightsForAttendee,
  upsertAttendee,
  type Attendee,
  type AttendeeRecord,
  type FlightRecord,
} from "../repository.js";
import { zValidator } from "../validator-wrapper.js";

// ── Components ──

const AttendeeForm: FC<{ attendee: AttendeeRecord; locale?: string }> = ({ attendee, locale }) => {
  const t = getTranslations(locale ?? attendee.locale ?? "en_US").attendeeForm;
  return (
    <form hx-put={`/attendees/${encodeURIComponent(attendee.name)}`} hx-swap="outerHTML">
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
}> = ({ attendee, flights, allFlights, locale }) => {
  const t = getTranslations(locale);
  return (
    <Layout locale={locale} currentPath={`/attendees/${encodeURIComponent(attendee.name)}`}>
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
      <button
        type="button"
        class="button-secondary mt-2"
        hx-post={`/attendees/${encodeURIComponent(attendee.name)}/delete`}
      >
        {t.attendeeForm.delete}
      </button>
    </Layout>
  );
};

// ── Schemas ──

const nameParamSchema = z.object({
  name: z.string().trim().min(1),
});

const attendeeUpdateFormSchema = z.object({
  locale: z.enum(["en_US", "de_DE"]),
  passport_status: z.enum(["valid", "pending", "none"]),
  visa_status: z.enum(["obtained", "pending", "none"]),
  dietary_requirements: z.string().optional(),
});

// ── Routes (mounted at /attendees) ──

export const createAttendeeRoutes = (db: Database) => {
  const app = new Hono();

  app.get("/:name", zValidator("param", nameParamSchema), async (c) => {
    const { name } = c.req.valid("param");
    const locale = getLocale(c);
    const t = getTranslations(locale);
    try {
      const attendee = getAttendeeByName(db, name);
      if (!attendee) {
        return c.html(
          <Layout locale={locale} currentPath={`/attendees/${encodeURIComponent(name)}`}>
            <h1>{t.attendeePage.notFoundTitle}</h1>
            <p class="error">
              {t.attendeePage.notFoundMessage}: {name}
            </p>
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

  app.put("/:name", zValidator("param", nameParamSchema), zValidator("form", attendeeUpdateFormSchema), async (c) => {
    const { name } = c.req.valid("param");
    const locale = getLocale(c);
    const t = getTranslations(locale);
    try {
      const formData = c.req.valid("form");

      const attendee: Attendee = {
        name,
        locale: formData.locale,
        passport_status: formData.passport_status,
        visa_status: formData.visa_status,
        dietary_requirements: formData.dietary_requirements?.trim() || null,
      };

      upsertAttendee(db, attendee);

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

  app.post("/:name/delete", zValidator("param", nameParamSchema), async (c) => {
    const locale = getLocale(c);
    const t = getTranslations(locale);
    try {
      const { name } = c.req.valid("param");
      deleteAttendeeByName(db, name);
      return c.redirect("/cockpit");
    } catch (e) {
      console.error(e);
      const name = c.req.param("name");
      return c.html(
        <Layout locale={locale} currentPath={`/attendees/${encodeURIComponent(name)}`}>
          <p class="error">{t.common.error}</p>
        </Layout>,
        500
      );
    }
  });

  return app;
};
