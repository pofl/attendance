import type { Database } from "better-sqlite3";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import type { FC } from "hono/jsx";
import { z } from "zod";
import { authenticate, deleteSession, getValidSession, SESSION_COOKIE_MAX_AGE, SESSION_COOKIE_NAME } from "../auth.js";
import { getLocale, getTranslations, type Locale } from "../i18n.js";
import { zValidator } from "../validator-wrapper.js";

// ── Components ──

const LoginPage: FC<{ locale: Locale; error?: string }> = ({ locale, error }) => {
  const t = getTranslations(locale);
  return (
    <html lang={locale.replace("_", "-")}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          {t.common.appTitle} – {t.loginPage.title}
        </title>
        <link rel="stylesheet" href="/static/styles.css"></link>
      </head>
      <body>
        <h1>{t.loginPage.title}</h1>
        {error && <p class="error">{error}</p>}
        <form class="card" method="post" action="/login">
          <label>
            {t.loginPage.username}:
            <input type="text" name="username" placeholder={t.loginPage.usernamePlaceholder} required autofocus />
          </label>
          <label>
            {t.loginPage.password}:
            <input type="password" name="password" placeholder={t.loginPage.passwordPlaceholder} required />
          </label>
          <button type="submit">{t.loginPage.submit}</button>
        </form>
      </body>
    </html>
  );
};

// ── Schemas ──

const loginFormSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

// ── Routes ──

export const createLoginRoutes = (db: Database) => {
  const app = new Hono();

  app.get("/login", (c) => {
    const locale = getLocale(c);
    const token = getCookie(c, SESSION_COOKIE_NAME);
    if (token && getValidSession(db, token)) {
      return c.redirect("/");
    }
    return c.html(<LoginPage locale={locale} />);
  });

  app.post("/login", zValidator("form", loginFormSchema), async (c) => {
    const locale = getLocale(c);
    const t = getTranslations(locale);
    const { username, password } = c.req.valid("form");
    const sessionToken = authenticate(db, username, password);
    if (!sessionToken) {
      return c.html(<LoginPage locale={locale} error={t.loginPage.invalidCredentials} />, 401);
    }
    setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
      path: "/",
      maxAge: SESSION_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "Lax",
    });
    return c.redirect("/");
  });

  app.post("/logout", async (c) => {
    const token = getCookie(c, SESSION_COOKIE_NAME);
    if (token) {
      deleteSession(db, token);
    }
    setCookie(c, SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return c.redirect("/login");
  });

  return app;
};
