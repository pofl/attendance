import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { config } from "dotenv";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { z } from "zod";
import { createUser, getAllUsers, getValidSession, SESSION_COOKIE_NAME } from "./auth.js";
import { openDatabase } from "./db.js";
import { isValidLocale } from "./i18n.js";
import { MigrationRunner } from "./migrate.js";
import { migrations } from "./migrations.js";
import { createAttendeeRoutes } from "./routes/attendee.js";
import { createCockpitRoutes } from "./routes/cockpit.js";
import { createFlightRoutes } from "./routes/flights.js";
import { createHomeRoutes } from "./routes/home.js";
import { createLoginRoutes } from "./routes/login.js";
import { zValidator } from "./validator-wrapper.js";

config();
const db = openDatabase();

const runner = new MigrationRunner(db);
runner.runMigrations(migrations);

// Seed: create a default admin user if no users exist.
{
  const users = getAllUsers(db);
  if (users.length === 0) {
    const seedUser =
      process.env.SEED_USERNAME ??
      (() => {
        throw new Error("SEED_USERNAME environment variable is required when seeding the database");
      })();
    const seedPass =
      process.env.SEED_PASSWORD ??
      (() => {
        throw new Error("SEED_PASSWORD environment variable is required when seeding the database");
      })();
    createUser(db, seedUser, seedPass);
    console.log(`Seeded default user "${seedUser}". Change the password after first login.`);
  }
}

const app = new Hono();

app.use("/static/*", serveStatic({ root: "./public", rewriteRequestPath: (path) => path.replace(/^\/static/, "") }));

// Auth middleware: protect all routes except /login and /static
app.use("*", async (c, next) => {
  const path = new URL(c.req.url).pathname;
  if (path === "/login" || path.startsWith("/static")) {
    return next();
  }
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token || !getValidSession(db, token)) {
    return c.redirect("/login");
  }
  return next();
});

// HTMX redirect middleware
app.use("*", async (c, next) => {
  await next();
  const response = c.res;
  const isHtmx = Boolean(c.req.header("HX-Request"));
  const location = response.headers.get("Location");

  if (isHtmx && location && response.status >= 300 && response.status < 400) {
    c.header("HX-Redirect", location);
    return c.body(null, 204);
  }

  return response;
});

// Locale switching (cross-cutting, triggered from LanguageToggle on every page)
const localeFormSchema = z.object({
  locale: z.string().trim().min(1),
  redirect: z.string().trim().optional(),
});

app.post("/set-locale", zValidator("form", localeFormSchema), async (c) => {
  const { locale, redirect } = c.req.valid("form");

  if (isValidLocale(locale)) {
    setCookie(c, "locale", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "Lax",
    });
  }

  c.header("HX-Redirect", redirect || "/");
  return c.body(null, 204);
});

// Mount route modules
app.route("/", createLoginRoutes(db));
app.route("/", createHomeRoutes());
app.route("/attendees", createAttendeeRoutes(db));
app.route("/cockpit", createCockpitRoutes(db));
app.route("/flights", createFlightRoutes(db));

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
