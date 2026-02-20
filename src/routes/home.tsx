import { Hono } from "hono";
import type { FC } from "hono/jsx";
import { Layout } from "../components/Layout.js";
import { getLocale, getTranslations, type Locale } from "../i18n.js";
import { attendeeNameFormSchema } from "../schemas.js";
import { getCurrentUser } from "../utils/authz.js";
import { zValidator } from "../validator-wrapper.js";

// ── Components ──

const IndexPage: FC<{ locale: Locale; isSuperUser: boolean }> = ({ locale, isSuperUser }) => {
  const t = getTranslations(locale);
  return (
    <Layout locale={locale} currentPath="/" isSuperUser={isSuperUser}>
      <h1>{t.indexPage.title}</h1>
      <form class="card" hx-post="/attendee">
        <label>
          {t.indexPage.enterName}:
          <input type="text" name="name" placeholder={t.indexPage.namePlaceholder} required autofocus />
        </label>
        <button type="submit">{t.indexPage.go}</button>
      </form>
    </Layout>
  );
};

// ── Routes ──

export const createHomeRoutes = () => {
  const app = new Hono();

  app.get("/", (c) => {
    const locale = getLocale(c);
    const user = getCurrentUser(c);
    if (!user.is_superuser) {
      return c.redirect("/me");
    }
    return c.html(<IndexPage locale={locale} isSuperUser={user.is_superuser} />);
  });

  app.post("/attendee", zValidator("form", attendeeNameFormSchema), async (c) => {
    const user = getCurrentUser(c);
    if (!user.is_superuser) {
      return c.redirect("/me");
    }
    const { name } = c.req.valid("form");
    const destination = `/attendees/${encodeURIComponent(name)}`;
    c.header("HX-Redirect", destination);
    return c.body(null, 204);
  });

  return app;
};
