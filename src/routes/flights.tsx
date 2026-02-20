import type { Database } from "better-sqlite3";
import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { z } from "zod";
import { Layout } from "../components/Layout.js";
import { getLocale, getTranslations, type Locale } from "../i18n.js";
import {
  addPassengerToFlight,
  deleteFlight,
  getAllAttendees,
  getFlightAggregates,
  getFlightById,
  getPassengersForFlight,
  removePassengerFromFlight,
  updateFlightById,
  upsertFlight,
  type AttendeeRecord,
  type Flight,
  type FlightAggregate,
  type FlightRecord,
} from "../repository.js";
import { idParamSchema } from "../schemas.js";
import { getCurrentUser } from "../utils/authz.js";
import { formatArrivalDateTime, formatDateForInput, formatDepartureDateTime } from "../utils/flightFormat.js";
import { zValidator } from "../validator-wrapper.js";

// ── Flight parsing utilities ──

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
  const utcMs =
    Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)) - offsetMinutes * 60_000;
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
    parseOffsetMinutes(payload.from_utc_offset_minutes) ?? parseOffsetMinutesFromIso(payload.departure_local) ?? null;
  const toOffset =
    parseOffsetMinutes(payload.to_utc_offset_minutes) ?? parseOffsetMinutesFromIso(payload.arrival_local) ?? null;

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

  if (
    !flightNumber ||
    !fromAirport ||
    !toAirport ||
    fromOffset === null ||
    toOffset === null ||
    !departureAt ||
    !arrivalAt
  ) {
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

// ── Components ──

const FlightPassengersListSection: FC<{
  locale: Locale;
  flight: FlightRecord;
  passengers: AttendeeRecord[];
  message?: string | null;
  messageType?: "success" | "error";
}> = ({ locale, flight, passengers, message, messageType = "success" }) => {
  const t = getTranslations(locale).flightPassengersPage;
  const flightLabels = getTranslations(locale).flightForm;
  const messageClass = messageType === "error" ? "error" : "text-success";

  return (
    <section id="flight-passengers">
      <h2>
        {t.currentPassengers} ({passengers.length})
      </h2>
      {message && <p class={messageClass}>{message}</p>}
      {passengers.length === 0 ? (
        <p>{t.noPassengers}</p>
      ) : (
        <table class="table">
          <thead>
            <tr>
              <th>{t.passengerName}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((passenger) => (
              <tr key={passenger.id}>
                <td>
                  <a href={`/attendees/${encodeURIComponent(passenger.name)}`}>{passenger.name}</a>
                </td>
                <td>
                  <form
                    class="inline-form"
                    hx-post={`/flights/${flight.id}/passengers/${passenger.id}/remove`}
                    hx-target="#flight-passengers"
                    hx-swap="outerHTML"
                  >
                    <button type="submit" class="button-secondary">
                      {flightLabels.remove}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

const FlightsOverviewPage: FC<{
  locale: Locale;
  flights: FlightAggregate[];
  isSuperUser: boolean;
  message?: string | null;
  messageType?: "success" | "error";
}> = ({ locale, flights, isSuperUser, message, messageType = "success" }) => {
  const t = getTranslations(locale).flightsOverviewPage;
  const flightLabels = getTranslations(locale).flightForm;
  const messageClass = messageType === "error" ? "error" : "text-success";
  return (
    <Layout locale={locale} currentPath="/flights" isSuperUser={isSuperUser}>
      <h1>{t.title}</h1>

      {flights.length === 0 ? (
        <p>{t.noFlights}</p>
      ) : (
        <table class="table">
          <thead>
            <tr>
              <th>{t.flight}</th>
              <th>{t.route}</th>
              <th>{t.departure}</th>
              <th>{t.arrival}</th>
              <th>{t.passengers}</th>
              <th>{t.actions}</th>
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
                <td>
                  <div>{flight.passenger_count}</div>
                  {flight.passenger_names.length > 0 && (
                    <div class="text-muted">{flight.passenger_names.join(", ")}</div>
                  )}
                </td>
                <td>
                  <a href={`/flights/${flight.id}/edit`}>
                    <button type="button">{t.open}</button>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <section class="card mt-3">
        <h2>{t.addFlightTitle}</h2>
        {message && <p class={messageClass}>{message}</p>}
        <form class="grid-2" x-data="{ mode: 'fields' }" method="post" action="/flights">
          <div class="grid-span-2 mode-panel">
            <label class="mode-label">
              {t.inputModeLabel}:
              <select name="input_mode" x-model="mode" class="mode-select">
                <option value="fields">{t.fieldEntryToggle}</option>
                <option value="json">{t.jsonToggle}</option>
              </select>
            </label>
            <p class="text-muted mode-hint">{t.inputModeHint}</p>
          </div>

          <div class="grid-span-2" x-show="mode === 'fields'" x-cloak>
            <div class="grid-2">
              <label>
                {flightLabels.flightNumber}:
                <input type="text" name="flight_number" placeholder="LH2025" x-bind:disabled="mode !== 'fields'" />
              </label>
              <label>
                {flightLabels.fromAirport}:
                <input type="text" name="from_airport" placeholder="MUC" x-bind:disabled="mode !== 'fields'" />
              </label>
              <label>
                {flightLabels.fromOffset}:
                <input
                  type="number"
                  name="from_utc_offset_minutes"
                  placeholder="60"
                  x-bind:disabled="mode !== 'fields'"
                />
              </label>
              <label>
                {flightLabels.departureLocal}:
                <input type="datetime-local" name="departure_local" x-bind:disabled="mode !== 'fields'" />
              </label>
              <label>
                {flightLabels.toAirport}:
                <input type="text" name="to_airport" placeholder="BLR" x-bind:disabled="mode !== 'fields'" />
              </label>
              <label>
                {flightLabels.toOffset}:
                <input
                  type="number"
                  name="to_utc_offset_minutes"
                  placeholder="330"
                  x-bind:disabled="mode !== 'fields'"
                />
              </label>
              <label>
                {flightLabels.arrivalLocal}:
                <input type="datetime-local" name="arrival_local" x-bind:disabled="mode !== 'fields'" />
              </label>
            </div>
          </div>

          <label class="grid-span-2" x-show="mode === 'json'" x-cloak>
            {t.importJsonTitle}:
            <textarea
              name="flight_json"
              placeholder={t.importJsonPlaceholder}
              rows={8}
              x-bind:disabled="mode !== 'json'"
            ></textarea>
            <div class="text-muted">{t.importJsonHelp}</div>
          </label>

          <div>
            <button type="submit">{flightLabels.add}</button>
          </div>
        </form>
      </section>
    </Layout>
  );
};

const FlightEditPage: FC<{
  locale: Locale;
  flight: FlightRecord;
  isSuperUser: boolean;
  message?: string | null;
  messageType?: "success" | "error";
}> = ({ locale, flight, isSuperUser, message, messageType = "success" }) => {
  const t = getTranslations(locale);
  const labels = t.flightForm;
  const editLabels = t.flightEditPage;
  const messageClass = messageType === "error" ? "error" : "text-success";

  return (
    <Layout locale={locale} currentPath={`/flights/${flight.id}/edit`} isSuperUser={isSuperUser}>
      <h1>{editLabels.title}</h1>

      <section class="card">
        {message && <p class={messageClass}>{message}</p>}
        <form class="grid-2" method="post" action={`/flights/${flight.id}`}>
          <label>
            {labels.flightNumber}:
            <input type="text" name="flight_number" required value={flight.flight_number} />
          </label>
          <label>
            {labels.fromAirport}:
            <input type="text" name="from_airport" required value={flight.from_airport} />
          </label>
          <label>
            {labels.fromOffset}:
            <input
              type="number"
              name="from_utc_offset_minutes"
              required
              value={String(flight.from_utc_offset_minutes)}
            />
          </label>
          <label>
            {labels.departureLocal}:
            <input
              type="datetime-local"
              name="departure_local"
              required
              value={formatDateForInput(flight.departure_at, flight.from_utc_offset_minutes)}
            />
          </label>
          <label>
            {labels.toAirport}:
            <input type="text" name="to_airport" required value={flight.to_airport} />
          </label>
          <label>
            {labels.toOffset}:
            <input type="number" name="to_utc_offset_minutes" required value={String(flight.to_utc_offset_minutes)} />
          </label>
          <label>
            {labels.arrivalLocal}:
            <input
              type="datetime-local"
              name="arrival_local"
              required
              value={formatDateForInput(flight.arrival_at, flight.to_utc_offset_minutes)}
            />
          </label>
          <div class="button-row items-end mb-2">
            <button type="submit">{editLabels.save}</button>
            <button type="button" class="button-secondary" hx-post={`/flights/${flight.id}/delete`}>
              {editLabels.delete}
            </button>
          </div>
        </form>
      </section>
    </Layout>
  );
};

const FlightPassengersPage: FC<{
  locale: Locale;
  flight: FlightRecord;
  attendees: AttendeeRecord[];
  passengers: AttendeeRecord[];
  isSuperUser: boolean;
}> = ({ locale, flight, attendees, passengers, isSuperUser }) => {
  const t = getTranslations(locale).flightPassengersPage;
  return (
    <Layout locale={locale} currentPath={`/flights/${flight.id}/passengers`} isSuperUser={isSuperUser}>
      <h1>{t.title}</h1>

      <section class="card mb-3">
        <h2>{t.flightDetails}</h2>
        <p>
          <strong>{flight.flight_number}</strong> · {flight.from_airport} → {flight.to_airport}
        </p>
        <p class="text-muted">
          {formatDepartureDateTime(flight.departure_at, flight.from_utc_offset_minutes)} ·{" "}
          {formatArrivalDateTime(flight.arrival_at, flight.to_utc_offset_minutes)}
        </p>
      </section>

      <section class="card mb-3">
        <h2>{t.addPassengerTitle}</h2>
        <form hx-post={`/flights/${flight.id}/passengers`} hx-target="#flight-passengers" hx-swap="outerHTML">
          <label>
            {t.selectAttendee}:
            <select name="attendee_id" required>
              <option value="">{t.selectPlaceholder}</option>
              {attendees.map((attendee) => (
                <option value={attendee.id} key={attendee.id}>
                  {attendee.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">{t.addPassengerButton}</button>
        </form>
      </section>

      <FlightPassengersListSection locale={locale} flight={flight} passengers={passengers} />
    </Layout>
  );
};

// ── Schemas ──

const attendeeFlightParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  attendeeId: z.coerce.number().int().positive(),
});

const flightPassengerFormSchema = z.object({
  attendee_id: z.coerce.number().int().positive(),
});

const flightFormSchema = z.object({
  input_mode: z.string().optional(),
  flight_json: z.string().optional(),
  flight_number: z.string().optional(),
  from_airport: z.string().optional(),
  to_airport: z.string().optional(),
  from_utc_offset_minutes: z.union([z.string(), z.number()]).optional(),
  to_utc_offset_minutes: z.union([z.string(), z.number()]).optional(),
  departure_local: z.string().optional(),
  arrival_local: z.string().optional(),
  departure_at: z.string().optional(),
  arrival_at: z.string().optional(),
});

// ── Routes (mounted at /flights) ──

export const createFlightRoutes = (db: Database) => {
  const app = new Hono();

  app.get("/", async (c) => {
    const locale = getLocale(c);
    const user = getCurrentUser(c);
    const t = getTranslations(locale);
    try {
      const flights = getFlightAggregates(db);
      return c.html(<FlightsOverviewPage flights={flights} locale={locale} isSuperUser={user.is_superuser} />);
    } catch (e) {
      console.error(e);
      return c.html(
        <Layout locale={locale} currentPath="/flights" isSuperUser={user.is_superuser}>
          <p class="error">{t.common.error}</p>
        </Layout>,
        500
      );
    }
  });

  app.get("/:id/edit", zValidator("param", idParamSchema), async (c) => {
    const locale = getLocale(c);
    const user = getCurrentUser(c);
    const t = getTranslations(locale);
    try {
      const { id } = c.req.valid("param");
      const flight = getFlightById(db, id);
      if (!flight) {
        return c.html(
          <Layout locale={locale} currentPath="/flights" isSuperUser={user.is_superuser}>
            <p class="error">{t.common.notFound}</p>
          </Layout>,
          404
        );
      }
      return c.html(<FlightEditPage locale={locale} flight={flight} isSuperUser={user.is_superuser} />);
    } catch (e) {
      console.error(e);
      return c.html(
        <Layout locale={locale} currentPath="/flights" isSuperUser={user.is_superuser}>
          <p class="error">{t.common.error}</p>
        </Layout>,
        500
      );
    }
  });

  app.post("/", zValidator("form", flightFormSchema), async (c) => {
    const locale = getLocale(c);
    const user = getCurrentUser(c);
    const t = getTranslations(locale);
    try {
      const formData = c.req.valid("form");
      const jsonPayload = formData.flight_json?.trim() ?? "";
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
        const flights = getFlightAggregates(db);
        return c.html(
          <FlightsOverviewPage
            locale={locale}
            flights={flights}
            isSuperUser={user.is_superuser}
            message={t.common.error}
            messageType="error"
          />,
          400
        );
      }
      upsertFlight(db, flight);
      return c.redirect("/flights");
    } catch (e) {
      console.error(e);
      const flights = getFlightAggregates(db);
      return c.html(
        <FlightsOverviewPage
          locale={locale}
          flights={flights}
          isSuperUser={user.is_superuser}
          message={t.common.error}
          messageType="error"
        />,
        500
      );
    }
  });

  app.post("/:id", zValidator("param", idParamSchema), zValidator("form", flightFormSchema), async (c) => {
    const locale = getLocale(c);
    const user = getCurrentUser(c);
    const t = getTranslations(locale);
    try {
      const { id } = c.req.valid("param");

      const formData = c.req.valid("form");
      const flight = parseFlightFromPayload(formData as Record<string, unknown>);

      if (!flight) {
        const existing = getFlightById(db, id);
        if (!existing) {
          return c.html(
            <Layout locale={locale} currentPath="/flights" isSuperUser={user.is_superuser}>
              <p class="error">{t.common.notFound}</p>
            </Layout>,
            404
          );
        }
        return c.html(
          <FlightEditPage
            locale={locale}
            flight={existing}
            isSuperUser={user.is_superuser}
            message={t.common.error}
            messageType="error"
          />,
          400
        );
      }
      updateFlightById(db, id, flight);
      return c.redirect(`/flights/${id}/edit`);
    } catch (e) {
      console.error(e);
      const id = Number(c.req.param("id"));
      if (Number.isFinite(id)) {
        const existing = getFlightById(db, id);
        if (existing) {
          return c.html(
            <FlightEditPage
              locale={locale}
              flight={existing}
              isSuperUser={user.is_superuser}
              message={t.common.error}
              messageType="error"
            />,
            500
          );
        }
      }
      return c.body(null, 500);
    }
  });

  app.post("/:id/delete", zValidator("param", idParamSchema), async (c) => {
    const locale = getLocale(c);
    const user = getCurrentUser(c);
    const t = getTranslations(locale);
    try {
      const { id } = c.req.valid("param");
      deleteFlight(db, id);
      return c.redirect("/flights");
    } catch (e) {
      console.error(e);
      const id = Number(c.req.param("id"));
      if (Number.isFinite(id)) {
        const flight = getFlightById(db, id);
        if (flight) {
          return c.html(
            <FlightEditPage
              locale={locale}
              flight={flight}
              isSuperUser={user.is_superuser}
              message={t.common.error}
              messageType="error"
            />,
            500
          );
        }
      }
      return c.body(null, 500);
    }
  });

  app.get("/:id/passengers", zValidator("param", idParamSchema), async (c) => {
    const locale = getLocale(c);
    const user = getCurrentUser(c);
    const t = getTranslations(locale);
    try {
      const { id } = c.req.valid("param");
      const flight = getFlightById(db, id);
      if (!flight) {
        return c.html(
          <Layout locale={locale} currentPath="/flights" isSuperUser={user.is_superuser}>
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
          isSuperUser={user.is_superuser}
        />
      );
    } catch (e) {
      console.error(e);
      return c.html(
        <Layout locale={locale} currentPath="/flights" isSuperUser={user.is_superuser}>
          <p class="error">{t.common.error}</p>
        </Layout>,
        500
      );
    }
  });

  app.post(
    "/:id/passengers",
    zValidator("param", idParamSchema),
    zValidator("form", flightPassengerFormSchema),
    async (c) => {
      const locale = getLocale(c);
      const t = getTranslations(locale);
      try {
        const { id } = c.req.valid("param");
        const { attendee_id: attendeeId } = c.req.valid("form");
        addPassengerToFlight(db, id, attendeeId);
        const passengers = getPassengersForFlight(db, id);
        const flight = getFlightById(db, id);
        if (!flight) {
          return c.html("", 404);
        }
        return c.html(<FlightPassengersListSection locale={locale} flight={flight} passengers={passengers} />);
      } catch (e) {
        console.error(e);
        const id = Number(c.req.param("id"));
        if (Number.isFinite(id)) {
          const passengers = getPassengersForFlight(db, id);
          const flight = getFlightById(db, id);
          if (flight) {
            return c.html(
              <FlightPassengersListSection
                locale={locale}
                flight={flight}
                passengers={passengers}
                message={t.common.error}
                messageType="error"
              />,
              500
            );
          }
        }
        return c.body(null, 500);
      }
    }
  );

  app.post("/:id/passengers/:attendeeId/remove", zValidator("param", attendeeFlightParamSchema), async (c) => {
    const locale = getLocale(c);
    const t = getTranslations(locale);
    try {
      const { id: flightId, attendeeId } = c.req.valid("param");
      removePassengerFromFlight(db, flightId, attendeeId);
      const passengers = getPassengersForFlight(db, flightId);
      const flight = getFlightById(db, flightId);
      if (!flight) {
        return c.html("", 404);
      }
      return c.html(<FlightPassengersListSection locale={locale} flight={flight} passengers={passengers} />);
    } catch (e) {
      console.error(e);
      const flightId = Number(c.req.param("id"));
      if (Number.isFinite(flightId)) {
        const passengers = getPassengersForFlight(db, flightId);
        const flight = getFlightById(db, flightId);
        if (flight) {
          return c.html(
            <FlightPassengersListSection
              locale={locale}
              flight={flight}
              passengers={passengers}
              message={t.common.error}
              messageType="error"
            />,
            500
          );
        }
      }
      return c.body(null, 500);
    }
  });

  return app;
};
